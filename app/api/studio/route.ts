import { NextResponse } from 'next/server'

const fields = ['businessName','projectType','businessDescription','audience','primaryGoal','desiredAction','style','pages','features','references','avoid','budget','timeline','name','email'] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (typeof body.website === 'string' && body.website.trim()) return NextResponse.json({ ok:true })
    for (const field of fields) if (typeof body[field] !== 'string') return NextResponse.json({ error:`Missing field: ${field}` },{status:400})
    if (!/^\S+@\S+\.\S+$/.test(body.email)) return NextResponse.json({ error:'Please provide a valid email address.' },{status:400})

    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    if (!url || !key) return NextResponse.json({ error:'Studio storage is not configured yet. Your draft remains saved in this browser.' },{status:503})

    const response = await fetch(`${url}/rest/v1/studio_briefs`,{
      method:'POST',
      headers:{ apikey:key, Authorization:`Bearer ${key}`, 'Content-Type':'application/json', Prefer:'return=minimal' },
      body:JSON.stringify({ ...Object.fromEntries(fields.map(field=>[field,body[field]])), status:'new' })
    })
    if (!response.ok) return NextResponse.json({ error:'We could not save the brief right now. Your draft is still saved on this device.' },{status:502})
    return NextResponse.json({ ok:true })
  } catch {
    return NextResponse.json({ error:'Invalid request. Your draft remains saved on this device.' },{status:400})
  }
}
