import { NextResponse } from 'next/server'

const AI_API_URL = process.env.AI_API_URL
const AI_API_KEY = process.env.AI_API_KEY
const DB_API_URL = process.env.DB_API_URL
const DB_API_KEY = process.env.DB_API_KEY_VOCHLY

export async function POST(request) {
  try {
    const body = await request.json()
    const { client_name, client_company, client_role, raw_feedback, service, userId } = body

    if (!client_name || !raw_feedback) {
      return NextResponse.json({ error: 'client_name and raw_feedback are required' }, { status: 400 })
    }


    // Check usage limits
    if (userId) {
      const usageRes = await fetch(`${process.env.DB_API_URL}/usage/check?user_id=${userId}&product=vochly`, {
        headers: { 'Authorization': `Bearer ${process.env.DB_API_KEY_VOCHLY}` }
      })
      const usage = await usageRes.json()
      if (!usage.allowed) {
        return NextResponse.json({
          error: 'limit_reached',
          message: `You've used all ${usage.limit} free generations this month. Upgrade to continue.`,
          used: usage.used,
          limit: usage.limit,
          upgrade_url: '/billing'
        }, { status: 402 })
      }
    }

    const aiRes = await fetch(`${AI_API_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({
        task: 'format_testimonial',
        inputs: {
          client_name,
          client_company: client_company || '',
          client_role: client_role || 'Client',
          raw_feedback,
          service: service || 'our services'
        }
      })
    })

    const aiData = await aiRes.json()
    if (!aiRes.ok) throw new Error(aiData.error || 'AI generation failed')
    const result = aiData.data

    // Track usage
    if (userId) {
      fetch(`${process.env.DB_API_URL}/usage/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DB_API_KEY_VOCHLY}` },
        body: JSON.stringify({ user_id: userId, product: 'vochly', action: 'generate' })
      }).catch(() => {})
    }


    let itemId = null
    if (userId && DB_API_URL) {
      try {
        const dbRes = await fetch(`${DB_API_URL}/db/vochly/testimonials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DB_API_KEY}` },
          body: JSON.stringify({
            user_id: userId,
            title: `${client_name}${client_company ? ' — ' + client_company : ''}`,
            client_name,
            client_company,
            result_data: result,
            status: 'complete'
          })
        })
        const dbData = await dbRes.json()
        itemId = dbData.data?.id || null
      } catch(e) { console.error('DB save failed:', e.message) }
    }

    return NextResponse.json({ itemId, result })
  } catch(err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
