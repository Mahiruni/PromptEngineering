'use client'

import { useState } from 'react'
import { ArrowRight, Check, Copy, Lock, Sparkles, WandSparkles } from 'lucide-react'
import './improve.css'

const example = 'write a social media post for my coffee shop'

export default function ImprovePromptPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function improve() {
    const prompt = input.trim()
    if (!prompt) return
    setLoading(true); setError(''); setResult('')
    try {
      const response = await fetch('/api/improve-prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to improve this prompt.')
      setResult(data.prompt)
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong.') } finally { setLoading(false) }
  }

  async function copyResult() {
    if (!result) return
    await navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1600)
  }

  return <main className="improve-page">
    <header className="improve-nav">
      <a href="/" className="improve-brand"><span>P</span> PromptForge <i>Business</i></a>
      <a href="/api/checkout?plan=pro" className="improve-back">Start Pro <ArrowRight size={15} /></a>
    </header>
    <section className="improve-hero"><div className="improve-kicker"><Sparkles size={14} /> PRO PROMPT ENGINE</div><h1>Turn a weak prompt into a <em>powerful one.</em></h1><p>Paste the rough idea you normally give an AI. PromptForge restructures it into a precise, context-rich prompt designed for stronger, more consistent results.</p></section>
    <section className="improve-shell">
      <div className="improve-card"><div className="improve-card-head"><div><span>YOUR ROUGH PROMPT</span><small>Anything is fine — even one sentence.</small></div><button onClick={() => setInput(example)}>Use example</button></div><textarea value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. make a marketing plan for my new clothing business..." rows={8}/><div className="improve-actions"><span className="improve-note"><Lock size={13}/> Pro feature</span><button className="improve-primary" onClick={improve} disabled={!input.trim() || loading}><WandSparkles size={17}/> {loading ? 'Engineering your prompt…' : 'Improve my prompt'} <ArrowRight size={16}/></button></div>{error && <div className="improve-error">{error}</div>}</div>
      <div className="improve-arrow"><WandSparkles size={20}/></div>
      <div className="improve-card output-card"><div className="improve-card-head"><div><span>ENGINEERED PROMPT</span><small>Role · objective · context · constraints · output · quality criteria</small></div><button onClick={copyResult} disabled={!result}>{copied ? <><Check size={13}/> Copied</> : <><Copy size={13}/> Copy</>}</button></div><div className={`improve-output ${!result ? 'empty' : ''}`}>{result || 'Your upgraded prompt will appear here.'}</div></div>
    </section>
    <section className="improve-benefits"><div><b>01</b><strong>Diagnose</strong><p>Finds vague goals, missing context, hidden assumptions and ambiguous instructions.</p></div><div><b>02</b><strong>Engineer</strong><p>Adds the right role, audience, task structure, constraints, inputs and output format.</p></div><div><b>03</b><strong>Strengthen</strong><p>Adds quality criteria, edge cases and useful guidance without bloating the prompt.</p></div><div><b>04</b><strong>Deliver</strong><p>Returns a clean prompt you can paste into ChatGPT, Claude, Gemini or another AI tool.</p></div></section>
    <section className="improve-lock"><Lock size={18}/><div><strong>Prompt Improver is a Pro capability.</strong><span>Only an active Stripe subscription can call the AI improvement endpoint.</span></div><a href="/api/checkout?plan=pro">Start Pro <ArrowRight size={15}/></a></section>
  </main>
}
