import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'

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

export async function POST(request: NextRequest) {
  const customerId = getCustomerId(request)
  if (!customerId || !(await hasActiveSubscription(customerId))) {
    return NextResponse.json({ error: 'Pro subscription required. Start the PromptForge Pro plan to unlock Prompt Improver.' }, { status: 402 })
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
  return NextResponse.json({ prompt: output.trim() })
}
