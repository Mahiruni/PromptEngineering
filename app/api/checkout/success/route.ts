import { NextResponse } from 'next/server'
import { createHmac } from 'node:crypto'

function sign(value: string) {
  const secret = process.env.PROMPTFORGE_SESSION_SECRET
  if (!secret) throw new Error('PROMPTFORGE_SESSION_SECRET is not configured')
  const signature = createHmac('sha256', secret).update(value).digest('base64url')
  return `${value}.${signature}`
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const sessionId = url.searchParams.get('session_id')
  const secret = process.env.STRIPE_SECRET_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!sessionId || !secret || !appUrl || !process.env.PROMPTFORGE_SESSION_SECRET) return NextResponse.redirect(new URL('/improve?error=configuration', request.url))

  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: 'no-store',
  })
  const session = await response.json()
  if (!response.ok || !session.customer || session.mode !== 'subscription') return NextResponse.redirect(new URL('/improve?error=checkout', request.url))

  const result = NextResponse.redirect(new URL('/improve?subscribed=1', appUrl))
  result.cookies.set('promptforge_pro', sign(String(session.customer)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 400,
  })
  return result
}
