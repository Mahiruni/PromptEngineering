'use client'
import { useEffect, useState } from 'react'

const KEY='pf-cookie-consent-v1'
export default function CookieConsent(){
 const [visible,setVisible]=useState(false),[custom,setCustom]=useState(false),[analytics,setAnalytics]=useState(false)
 useEffect(()=>{setVisible(localStorage.getItem(KEY)!=='accepted'&&localStorage.getItem(KEY)!=='rejected'&&localStorage.getItem(KEY)!=='custom')},[])
 if(!visible)return null
 const save=(value:string)=>{localStorage.setItem(KEY,value);setVisible(false)}
 return <div className="cookie-wrap" role="dialog" aria-label="Cookie preferences" aria-live="polite"><div className="cookie-card"><div className="cookie-copy"><span className="cookie-kicker">PRIVACY & COOKIES</span><h2>Choose how cookies work</h2><p>We use essential cookies to keep PromptForge working. With your permission, optional cookies can help us understand usage and improve the experience. You can change your choice later.</p><button className="cookie-link" onClick={()=>location.href='/privacy'}>Read our Privacy Policy</button></div>{custom?<div className="cookie-settings"><label><span><b>Essential</b><small>Required for core site functionality.</small></span><input type="checkbox" checked disabled/></label><label><span><b>Analytics</b><small>Helps us understand aggregate product usage.</small></span><input type="checkbox" checked={analytics} onChange={e=>setAnalytics(e.target.checked)}/></label><div className="cookie-actions"><button className="btn btn-ghost" onClick={()=>save('rejected')}>Reject optional</button><button className="btn btn-primary" onClick={()=>save(analytics?'custom-analytics':'custom')}>Save choices</button></div></div>:<div className="cookie-actions"><button className="btn btn-ghost" onClick={()=>save('rejected')}>Reject Non-Essential</button><button className="btn btn-ghost" onClick={()=>setCustom(true)}>Customize</button><button className="btn btn-primary" onClick={()=>save('accepted')}>Accept All</button></div>}</div></div>
}
