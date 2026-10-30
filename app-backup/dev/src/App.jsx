import { useState } from 'react'

export default function App(){
  const [view,setView]=useState('backup')
  const [balance]=useState(12500)
  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(135deg,#0f172a,#1e293b)', padding:20, fontFamily:'system-ui', color:'#fff'}}>
      <div style={{maxWidth:400, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:20, background:'rgba(255,255,255,0.1)', backdropFilter:'blur(10px)', padding:12, borderRadius:16}}>
          <button onClick={()=>setView('root')} style={{flex:1, padding:10, borderRadius:12, border:'none', background: view==='root' ? '#22c55e' : 'transparent', color:'#fff', fontWeight:'bold'}}>ROOT LIVE</button>
          <button onClick={()=>setView('backup')} style={{flex:1, padding:10, borderRadius:12, border:'none', background: view==='backup' ? '#f59e0b' : 'transparent', color:'#fff', fontWeight:'bold'}}>BACKUP LIVE</button>
        </div>

        <div style={{background:'linear-gradient(145deg,#ffffff,#e2e8f0)', borderRadius:24, padding:24, color:'#0f172a', boxShadow:'0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.8)', transform:'perspective(1000px) rotateX(5deg)', marginBottom:20}}>
          <p style={{opacity:0.6, margin:0}}>মোট ব্যালেন্স</p>
          <h1 style={{fontSize:36, margin:'8px 0'}}>৳ {balance.toLocaleString('bn-BD')}</h1>
          <div style={{display:'flex', gap:10, marginTop:16}}>
            <div style={{flex:1, background:'#0f172a', color:'#fff', padding:12, borderRadius:12, textAlign:'center', boxShadow:'0 8px 16px rgba(0,0,0,0.3)'}}>আয় + ৳5000</div>
            <div style={{flex:1, background:'#ef4444', color:'#fff', padding:12, borderRadius:12, textAlign:'center', boxShadow:'0 8px 16px rgba(239,68,68,0.4)'}}>ব্যয় - ৳1200</div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          {[
            {t:'খরচ যোগ', c:'#3b82f6'},
            {t:'আয় যোগ', c:'#22c55e'},
            {t:'হিসাব', c:'#a855f7'},
            {t:'রিপোর্ট', c:'#f59e0b'},
          ].map(b=>(
            <button key={b.t} style={{padding:20, borderRadius:20, border:'none', background:b.c, color:'#fff', fontWeight:'bold', fontSize:16, boxShadow:`0 10px 20px ${b.c}60, inset 0 1px 0 rgba(255,255,255,0.3)`, transform:'perspective(500px) translateZ(0)', transition:'0.2s'}}>{b.t}</button>
          ))}
        </div>

        <p style={{textAlign:'center', marginTop:20, opacity:0.5, fontSize:12}}>{view==='root' ? 'ROOT LIVE - Protected' : 'BACKUP LIVE - Testing Area'} | Termux বন্ধ থাকলেও Live</p>
      </div>
    </div>
  )
}
