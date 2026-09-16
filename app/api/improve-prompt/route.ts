import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'

const FREE_LIMIT = 5
const FREE_COOKIE = 'promptforge_improve_free'

type TrialPayload = { used: number }

function getCustomerId(request: NextRequest) {
  const raw = request.cookies.get('promptforge_pro')?.value
  const secret = process.env.PROMPTFORGE_SESSION_SECRET
  if (!raw || !secret) return null
  const index = raw.lastIndexOf('.')
  if (index < 1) return null
  const value = raw.slice(0, index)
  const supplied = raw.slice(index + 1)
  const expected = createHmac('sha256', secret).update(value).digest('base64url')
  try { if (!timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null } catch { return null }
  return value
}

function signTrial(payload: TrialPayload) {
  const value = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const secret = process.env.PROMPTFORGE_SESSION_SECRET
  if (!secret) return value
  return `${value}.${createHmac('sha256', secret).update(value).digest('base64url')}`
}

function readTrial(request: NextRequest): TrialPayload {
  const raw = request.cookies.get(FREE_COOKIE)?.value
  if (!raw) return { used: 0 }
  const index = raw.lastIndexOf('.')
  const value = index > 0 ? raw.slice(0, index) : raw
  const supplied = index > 0 ? raw.slice(index + 1) : ''
  const secret = process.env.PROMPTFORGE_SESSION_SECRET
  if (secret) {
    if (index < 1) return { used: 0 }
    const expected = createHmac('sha256', secret).update(value).digest('base64url')
    try { if (!timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return { used: 0 } } catch { return { used: 0 } }
  }
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
    const used = Number(parsed?.used)
    return Number.isInteger(used) && used >= 0 && used <= FREE_LIMIT ? { used } : { used: 0 }
  } catch { return { used: 0 } }
}

function trialResponse(payload: TrialPayload, init?: ResponseInit) {
  const response = NextResponse.json({ used: payload.used, remaining: Math.max(0, FREE_LIMIT - payload.used), limit: FREE_LIMIT }, init)
  response.cookies.set(FREE_COOKIE, signTrial(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  return response
}

async function hasActiveSubscription(customerId: string) {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) return false
  const response = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${encodeURIComponent(customerId)}&status=all&limit=10`, {
    headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store',
  })
  if (!response.ok) return false
  const data = await response.json()
  return data.data?.some((subscription: { status: string }) => subscription.status === 'active' || subscription.status === 'trialing') ?? false
}

async function isPro(request: NextRequest) {
  const customerId = getCustomerId(request)
  return Boolean(customerId && await hasActiveSubscription(customerId))
}

export async function GET(request: NextRequest) {
  if (await isPro(request)) return NextResponse.json({ used: 0, remaining: null, limit: FREE_LIMIT, pro: true })
  const trial = readTrial(request)
  return NextResponse.json({ ...trial, remaining: FREE_LIMIT - trial.used, limit: FREE_LIMIT, pro: false })
}

export async function POST(request: NextRequest) {
  const pro = await isPro(request)
  const trial = readTrial(request)

  if (!pro && trial.used >= FREE_LIMIT) {
    return NextResponse.json({ error: 'You have used all 5 free improvements. Subscribe or purchase PromptForge Pro to continue.', code: 'FREE_LIMIT_REACHED', used: FREE_LIMIT, remaining: 0, limit: FREE_LIMIT }, { status: 402 })
  }

  const body = await request.json().catch(() => null)
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : ''
  if (!prompt || prompt.length < 3) return NextResponse.json({ error: 'Please enter a prompt to improve.' }, { status: 400 })
  if (prompt.length > 12000) return NextResponse.json({ error: 'Please keep the prompt under 12,000 characters.' }, { status: 400 })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Prompt engine is not configured yet.' }, { status: 503 })

  const system = `You are PromptForge Business, an elite prompt engineer. Transform the user's rough prompt into the strongest practical prompt for a modern AI model. Preserve the user's real intent; do not invent facts. Diagnose ambiguity internally, then produce ONLY the final upgraded prompt. Make it ready to paste. Use a compact structure when useful: ROLE, OBJECTIVE, CONTEXT, INPUTS, REQUIREMENTS, CONSTRAINTS, PROCESS, OUTPUT FORMAT, QUALITY CRITERIA. Add placeholders only where information is genuinely missing. Do not over-engineer simple tasks. Never claim that the prompt guarantees a particular outcome.`

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: process.env.OPENAI_PROMPT_MODEL || 'gpt-5-mini', input: [{ role: 'system', content: system }, { role: 'user', content: `Improve this rough prompt:\n\n${prompt}` }], max_output_tokens: 1800 }),
    cache: 'no-store',
  })
  const data = await response.json()
  if (!response.ok) return NextResponse.json({ error: data.error?.message || 'The prompt engine could not complete the request.' }, { status: 502 })

  const output = data.output_text || data.output?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content || []).map((part: { text?: string }) => part.text || '').join('')
  if (!output) return NextResponse.json({ error: 'No improved prompt was returned.' }, { status: 502 })

  if (pro) return NextResponse.json({ prompt: output.trim(), used: trial.used, remaining: null, limit: FREE_LIMIT, pro: true })
  const next = { used: trial.used + 1 }
  const result = NextResponse.json({ prompt: output.trim(), ...next, remaining: FREE_LIMIT - next.used, limit: FREE_LIMIT, pro: false })
  result.cookies.set(FREE_COOKIE, signTrial(next), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  return result
}
