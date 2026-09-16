'use client'

import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, CircleCheck, Cloud, Mail, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type Brief = {
  businessName: string
  projectType: string
  businessDescription: string
  audience: string
  primaryGoal: string
  desiredAction: string
  style: string
  pages: string
  features: string
  references: string
  avoid: string
  budget: string
  timeline: string
  name: string
  email: string
}

const emptyBrief: Brief = { businessName:'', projectType:'', businessDescription:'', audience:'', primaryGoal:'', desiredAction:'', style:'', pages:'', features:'', references:'', avoid:'', budget:'', timeline:'', name:'', email:'' }
const STORAGE_KEY='promptforge:studio-brief:v2'

const steps = [
  ['01','Business','What are you building?'],
  ['02','Audience','Who should it serve?'],
  ['03','Vision','How should it feel?'],
  ['04','Project','How should we make it happen?'],
] as const

export default function StudioWizard({ onClose }:{ onClose:()=>void }) {
  const [step,setStep]=useState(1)
  const [brief,setBrief]=useState<Brief>(emptyBrief)
  const [status,setStatus]=useState<'idle'|'saving'|'saved'|'submitting'|'submitted'>('idle')
  const [error,setError]=useState('')

  useEffect(()=>{
    try {
      const raw=localStorage.getItem(STORAGE_KEY)
      if(raw) setBrief({...emptyBrief,...JSON.parse(raw)})
    } catch {}
  },[])

  useEffect(()=>{
    if(!brief.businessName && !brief.businessDescription && !brief.email) return
    setStatus('saving')
    const timer=window.setTimeout(()=>{
      try { localStorage.setItem(STORAGE_KEY,JSON.stringify(brief)); setStatus('saved') } catch { setStatus('idle') }
    },350)
    return ()=>window.clearTimeout(timer)
  },[brief])

  const update=(key:keyof Brief,value:string)=>setBrief(v=>({...v,[key]:value}))
  const canContinue=useMemo(()=>{
    if(step===1) return !!brief.businessName.trim() && !!brief.projectType && !!brief.businessDescription.trim()
    if(step===2) return !!brief.audience.trim() && !!brief.primaryGoal
    if(step===3) return !!brief.style && !!brief.pages.trim()
    return !!brief.budget && !!brief.timeline && !!brief.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brief.email)
  },[brief,step])

  const submit=async()=>{
    setError(''); setStatus('submitting')
    try {
      const res=await fetch('/api/studio',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(brief)})
      const data=await res.json().catch(()=>({}))
      if(!res.ok) throw new Error(data?.error||'We could not save your brief yet.')
      localStorage.removeItem(STORAGE_KEY)
      setStatus('submitted')
    } catch(e) { setStatus('saved'); setError(e instanceof Error?e.message:'Something went wrong. Your draft is still saved on this device.') }
  }

  const input=(label:keyof Brief, title:string, placeholder:string, type='text')=><label className="studio-field"><span>{title}</span><input type={type} value={brief[label]} onChange={e=>update(label,e.target.value)} placeholder={placeholder}/></label>
  const textarea=(label:keyof Brief,title:string,placeholder:string)=><label className="studio-field full"><span>{title}</span><textarea value={brief[label]} onChange={e=>update(label,e.target.value)} placeholder={placeholder} rows={4}/></label>
  const select=(label:keyof Brief,title:string,options:string[])=> <label className="studio-field"><span>{title}</span><select value={brief[label]} onChange={e=>update(label,e.target.value)}><option value="">Select one</option>{options.map(x=><option key={x}>{x}</option>)}</select></label>

  if(status==='submitted') return <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}}><motion.div className="studio-modal studio-success card" initial={{opacity:0,y:24,scale:.98}} animate={{opacity:1,y:0,scale:1}}><CircleCheck size={48}/><span className="tag">BRIEF RECEIVED</span><h2 className="display">Your project is now in our queue.</h2><p className="muted">We recorded the details you shared. A member of the Studio team can use this brief as the starting point for the conversation.</p><button className="btn btn-primary btn-lg" onClick={onClose}>Back to PromptForge <ArrowRight size={16}/></button></motion.div></motion.div>

  return <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
    <motion.div className="studio-modal card" initial={{opacity:0,y:30,scale:.98}} animate={{opacity:1,y:0,scale:1}} role="dialog" aria-modal="true">
      <div className="studio-head">
        <div><span className="tag">PROMPTFORGE STUDIO</span><h2 className="display">Tell us what you’re building.</h2><p className="muted">We’ll turn your answers into a clear project brief.</p></div>
        <button className="btn btn-ghost icon-btn" onClick={onClose} aria-label="Close project brief"><X size={18}/></button>
      </div>
      <div className="studio-progress"><div><b>Step {step} of 4</b><span>{status==='saved'?<><Cloud size={13}/> Saved on this device</>:status==='saving'?'Saving draft…':'Draft stays with you'}</span></div><div className="studio-progress-track"><i style={{width:`${step*25}%`}}/></div></div>
      <div className="wizard-steps">{steps.map(([n,t],i)=><button key={n} className={step===i+1?'active':''} onClick={()=>i+1<step&&setStep(i+1)} disabled={i+1>step}><span>{n}</span>{t}</button>)}</div>
      <AnimatePresence mode="wait">
        <motion.div key={step} className="wizard-content" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-12}} transition={{duration:.22}}>
          {step===1&&<><span className="eyebrow">01 · YOUR BUSINESS</span><h3 className="display">Start with the essentials.</h3><p className="muted">Give us enough context to understand the business before we think about screens.</p><div className="studio-form-grid">{input('businessName','Business or brand name','e.g. Acme Studio')}{select('projectType','What are you building?',['Business website','E-commerce','SaaS / web app','Landing page','Portfolio / personal brand','Other'])}{textarea('businessDescription','What does the business do?','What do you sell, offer, or help people accomplish?')}</div></>}
          {step===2&&<><span className="eyebrow">02 · YOUR AUDIENCE</span><h3 className="display">Design around a real person.</h3><p className="muted">The audience and desired action shape the structure, copy and conversion path.</p><div className="studio-form-grid">{textarea('audience','Who is this for?','Describe your ideal customer, visitor or user.')}{select('primaryGoal','Primary project goal',['Generate leads','Sell products','Get bookings','Explain a service','Build trust / brand','Launch a new product','Other'])}{textarea('desiredAction','What should visitors do?','e.g. Book a call, buy, sign up, request a quote…')}</div></>}
          {step===3&&<><span className="eyebrow">03 · YOUR VISION</span><h3 className="display">Give it a point of view.</h3><p className="muted">Strong references help us avoid generic design and create something with character.</p><div className="studio-form-grid">{select('style','Preferred visual direction',['Minimal / editorial','Bold / expressive','Luxury / refined','Modern technology','Warm / human','Dark / cinematic'])}{textarea('pages','Pages or core screens','List the pages, sections or product areas you already know you need.')}{textarea('features','Important features','Forms, payments, accounts, dashboards, search, integrations, animations, CMS, etc.')}{textarea('references','References or websites you like','URLs or names are welcome. Tell us what you like about them.')}{textarea('avoid','Anything to avoid?','Visual styles, colors, interactions, competitors or patterns you do not want.')}</div></>}
          {step===4&&<><span className="eyebrow">04 · YOUR PROJECT</span><h3 className="display">Make the brief actionable.</h3><p className="muted">A budget and timeline let us recommend a realistic scope. Nothing here locks you into a package.</p><div className="studio-form-grid">{select('budget','Budget range',['Under $500','$500–$1,500','$1,500–$3,000','$3,000+','Not sure yet'])}{select('timeline','Ideal timeline',['ASAP','2–4 weeks','1–2 months','Flexible'])}{input('name','Your name','e.g. Mahir Aman')}{input('email','Best email','you@example.com','email')}</div></>}
        </motion.div>
      </AnimatePresence>
      {error&&<div className="studio-error">{error}</div>}
      <div className="modal-foot studio-foot"><button className="btn btn-ghost" onClick={()=>step===1?onClose():setStep(s=>s-1)}><ArrowLeft size={15}/>{step===1?'Cancel':'Back'}</button>{step<4?<button className="btn btn-primary" disabled={!canContinue} onClick={()=>setStep(s=>s+1)}>Continue <ArrowRight size={15}/></button>:<button className="btn btn-primary" disabled={!canContinue||status==='submitting'} onClick={()=>setStep(5)}>Review brief <ArrowRight size={15}/></button>}</div>
      {step===5&&null}
      {step===4&&<div className="studio-review-link">After this step you’ll review the complete brief before anything is submitted.</div>}
    </motion.div>
    {step===5&&null}
  </motion.div>
}
