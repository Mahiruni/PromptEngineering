import { NextResponse } from 'next/server'

export async function GET() {
  const secret = process.env.STRIPE_SECRET_KEY
  const price = process.env.STRIPE_PRO_ANNUAL_PRICE_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!secret || !price || !appUrl) return NextResponse.json({ error: 'Annual Stripe pricing is not configured yet.' }, { status: 503 })

  const body = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': price,
    'line_items[0][quantity]': '1',
    success_url: `${appUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing`,
    'allow_promotion_codes': 'true',
  })

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })
  const data = await response.json()
  if (!response.ok || !data.url) return NextResponse.json({ error: data.error?.message || 'Unable to create annual checkout.' }, { status: 502 })
  return NextResponse.redirect(data.url)
}
