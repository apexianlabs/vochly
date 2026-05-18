'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function GeneratePage() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [result, setResult]   = useState(null)
  const [form, setForm]       = useState({ client_name:'', client_company:'', client_role:'', raw_feedback:'', service:'' })

  useEffect(() => {
    try {
      const match = document.cookie.match(/voc_user=([^;]+)/)
      if (match) setUser(JSON.parse(decodeURIComponent(match[1])))
    } catch(e) {}
  }, [])

  const handleSubmit = async () => {
    if (!form.client_name || !form.raw_feedback) return setError('Client name and feedback are required.')
    setLoading(true); setError(''); setResult(null)
    try {
      const token = document.cookie.match(/voc_token=([^;]+)/)?.[1] || ''
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, userId: user?.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data.result)
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  const inputStyle = { width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, color:'#0f172a', background:'#fff', outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box' }
  const labelStyle = { fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5 }

  if (result) return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:28,height:28,borderRadius:7,background:'#d97706',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>V</div>
          <span style={{fontWeight:700,color:'#0f172a',fontSize:15}}>Vochly</span>
        </Link>
        <div style={{flex:1}}/>
      </nav>
      <div style={{maxWidth:680,margin:'0 auto',padding:'32px 24px',display:'flex',flexDirection:'column',gap:14}}>
        <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:'#d97706',textTransform:'uppercase',marginBottom:4}}>✅ Testimonial Ready</p>
          <p style={{fontSize:18,fontWeight:800,color:'#0f172a'}}>{form.client_name}{form.client_company ? ` — ${form.client_company}` : ''}</p>
        </div>
        {(result.testimonial || result.formatted_testimonial) && (
          <div style={{background:'#fff',border:'2px solid #fde68a',borderRadius:12,padding:24}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase'}}>💬 Polished Testimonial</p>
              <button onClick={() => navigator.clipboard.writeText(result.testimonial || result.formatted_testimonial)}
                style={{fontSize:11,color:'#d97706',background:'#fffbeb',border:'1px solid #fde68a',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:600}}>
                Copy
              </button>
            </div>
            <p style={{fontSize:16,color:'#0f172a',lineHeight:1.8,fontStyle:'italic'}}>"{result.testimonial || result.formatted_testimonial}"</p>
            <p style={{fontSize:13,color:'#64748b',marginTop:12,fontWeight:600}}>— {form.client_name}{form.client_role ? `, ${form.client_role}` : ''}{form.client_company ? `, ${form.client_company}` : ''}</p>
          </div>
        )}
        {result.short_version && (
          <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
            <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:8}}>⚡ Short Version</p>
            <p style={{fontSize:14,color:'#374151',lineHeight:1.7,fontStyle:'italic'}}>"{result.short_version}"</p>
          </div>
        )}
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={() => { setResult(null); setForm({ client_name:'', client_company:'', client_role:'', raw_feedback:'', service:'' }) }}
            style={{flex:1,padding:'10px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',fontSize:13,fontWeight:600,color:'#475569',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
            Format another
          </button>
          {user ? <Link href="/dashboard" style={{flex:1,padding:'10px',borderRadius:8,border:'none',background:'#d97706',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>View dashboard →</Link>
                : <Link href="/login" style={{flex:1,padding:'10px',borderRadius:8,border:'none',background:'#d97706',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>Save testimonials →</Link>}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:28,height:28,borderRadius:7,background:'#d97706',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>V</div>
          <span style={{fontWeight:700,color:'#0f172a',fontSize:15}}>Vochly</span>
        </Link>
        <div style={{flex:1}}/>
        {user ? <Link href="/dashboard" style={{fontSize:13,color:'#64748b',textDecoration:'none'}}>Dashboard</Link>
               : <Link href="/login" style={{fontSize:13,color:'#d97706',fontWeight:600,textDecoration:'none'}}>Sign in</Link>}
      </nav>
      <div style={{maxWidth:620,margin:'0 auto',padding:'40px 24px'}}>
        <h1 style={{fontSize:26,fontWeight:800,color:'#0f172a',marginBottom:6}}>Format a testimonial</h1>
        <p style={{fontSize:14,color:'#64748b',marginBottom:28}}>Paste raw client feedback and get a polished, publish-ready testimonial in seconds.</p>
        {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'12px 16px',fontSize:13,color:'#dc2626',marginBottom:20}}>{error}</div>}
        <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:28}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <div><label style={labelStyle}>Client name *</label><input value={form.client_name} onChange={e => setForm({...form,client_name:e.target.value})} placeholder="Sarah Johnson" style={inputStyle}/></div>
            <div><label style={labelStyle}>Their company</label><input value={form.client_company} onChange={e => setForm({...form,client_company:e.target.value})} placeholder="Acme Corp" style={inputStyle}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <div><label style={labelStyle}>Their role</label><input value={form.client_role} onChange={e => setForm({...form,client_role:e.target.value})} placeholder="Marketing Director" style={inputStyle}/></div>
            <div><label style={labelStyle}>Service provided</label><input value={form.service} onChange={e => setForm({...form,service:e.target.value})} placeholder="Website redesign, SEO..." style={inputStyle}/></div>
          </div>
          <div style={{marginBottom:24}}>
            <label style={labelStyle}>Raw feedback *</label>
            <textarea value={form.raw_feedback} onChange={e => setForm({...form,raw_feedback:e.target.value})}
              placeholder="Paste the raw feedback — email, message, survey response, or notes from a call..."
              rows={6} style={{...inputStyle,resize:'vertical'}}/>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            style={{width:'100%',padding:'13px',borderRadius:10,border:'none',background:loading?'#fcd34d':'#d97706',color:'#fff',fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:'Inter,sans-serif'}}>
            {loading ? '✨ Formatting testimonial...' : 'Format testimonial →'}
          </button>
        </div>
      </div>
    </div>
  )
}
