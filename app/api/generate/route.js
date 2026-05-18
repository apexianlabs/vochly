import { NextResponse } from 'next/server'
export async function POST(request) {
  try {
    const body = await request.json()
    const { client_name, client_company, client_role, raw_feedback, service, userId } = body
    if (!client_name || !raw_feedback) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    const aiRes = await fetch(`${process.env.AI_API_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify({ task: 'format_testimonial', inputs: { client_name, client_company: client_company||'', client_role: client_role||'Client', raw_feedback, service: service||'our services' } })
    })
    const aiData = await aiRes.json()
    if (!aiRes.ok) throw new Error(aiData.error || 'AI failed')
    const result = aiData.data
    let itemId = null
    if (userId && process.env.DB_API_URL) {
      try {
        const dbRes = await fetch(`${process.env.DB_API_URL}/db/vochly/testimonials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DB_API_KEY_VOCHLY}` },
          body: JSON.stringify({ user_id: userId, title: `${client_name}${client_company?' — '+client_company:''}`, client_name, client_company, result_data: result, status: 'complete' })
        })
        const dbData = await dbRes.json()
        itemId = dbData.data?.id || null
      } catch(e) {}
    }
    return NextResponse.json({ itemId, result })
  } catch(err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
