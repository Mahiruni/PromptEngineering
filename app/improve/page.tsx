'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, Copy, Lock, Sparkles, WandSparkles, Zap } from 'lucide-react'
import './improve.css'

const example = 'write a social media post for my coffee shop'
const FREE_LIMIT = 5

export default function ImprovePromptPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [used, setUsed] = useState(0)
  const [pro, setPro] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  const remaining = pro ? null : Math.max(0, FREE_LIMIT - used)
  const percentage = useMemo(() => pro ? 0 : Math.round((used / FREE_LIMIT) * 100), [used, pro])

  useEffect(() => {
    fetch('/api/improve-prompt')
      .then(async response => response.ok ? response.json() : null)
      .then(data => {
        if (!data) return
        setUsed(data.used ?? 0)
        setPro(Boolean(data.pro))
      })
      .catch(() => {})
  }, [])

  async function improve() {
    const prompt = input.trim()
    if (!prompt || loading) return
    if (!pro && used >= FREE_LIMIT) {
      setShowPaywall(true)
      return
    }

    setLoading(true)
    setError('')
    setResult('')
    try {
      const response = await fetch('/api/improve-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await response.json()
      if (response.status === 402 && data.code === 'FREE_LIMIT_REACHED') {
        setUsed(FREE_LIMIT)
        setShowPaywall(true)
        return
      }
      if (!response.ok) throw new Error(data.error || 'Unable to improve this prompt.')
      setResult(data.prompt)
      setUsed(data.used ?? used)
      setPro(Boolean(data.pro))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function copyResult() {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return <main className="improve-page">
    <header className="improve-nav">
      <a href="/" className="improve-brand"><span>P</span> PromptForge <i>Business</i></a>
      <a href="/pricing" className="improve-back">View plans <ArrowRight size={15} /></a>
    </header>

    <section className="improve-hero">
      <div className="improve-kicker"><Sparkles size={14} /> PROMPT ENGINE · TRY IT FREE</div>
      <h1>Turn a weak prompt into a <em>powerful one.</em></h1>
      <p>Give PromptForge the rough idea you normally type into AI. Watch it become a precise, structured prompt built for clearer thinking and stronger outputs.</p>
      <div className="trial-pill"><Zap size={14} /> {pro ? 'PRO UNLOCKED · UNLIMITED IMPROVEMENTS' : `${remaining} FREE IMPROVEMENT${remaining === 1 ? '' : 'S'} REMAINING`}</div>
    </section>

    <section className="trial-meter" aria-label="Free improvement usage">
      <div className="trial-meter-top">
        <div><strong>{pro ? 'PromptForge Pro' : `${used} of ${FREE_LIMIT} free improvements used`}</strong><span>{pro ? 'Your improvement engine is fully unlocked.' : `${remaining} remaining · ${percentage}% used`}</span></div>
        <span className="trial-count">{pro ? '∞' : `${used}/${FREE_LIMIT}`}</span>
      </div>
      {!pro && <div className="trial-track"><div className="trial-fill" style={{ width: `${percentage}%` }} /></div>}
    </section>

    <section className="improve-shell">
      <div className="improve-card">
        <div className="improve-card-head"><div><span>YOUR ROUGH PROMPT</span><small>Anything is fine — even one sentence.</small></div><button onClick={() => setInput(example)}>Use example</button></div>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. make a marketing plan for my new clothing business..." rows={8}/>
        <div className="improve-actions">
          <span className="improve-note"><Sparkles size={13}/> {pro ? 'Pro · unlimited' : `${remaining} free use${remaining === 1 ? '' : 's'} left`}</span>
          <button className="improve-primary" onClick={improve} disabled={!input.trim() || loading}>
            <WandSparkles size={17}/> {loading ? 'Engineering your prompt…' : used >= FREE_LIMIT && !pro ? 'Unlock more improvements' : 'Improve my prompt'} <ArrowRight size={16}/>
          </button>
        </div>
        {error && <div className="improve-error">{error}</div>}
      </div>
      <div className="improve-arrow"><WandSparkles size={20}/></div>
      <div className="improve-card output-card">
        <div className="improve-card-head"><div><span>ENGINEERED PROMPT</span><small>Role · objective · context · constraints · output · quality criteria</small></div><button onClick={copyResult} disabled={!result}>{copied ? <><Check size={13}/> Copied</> : <><Copy size={13}/> Copy</>}</button></div>
        <div className={`improve-output ${!result ? 'empty' : ''}`}>{result || 'Your upgraded prompt will appear here.'}</div>
      </div>
    </section>

    <section className="improve-proof">
      <div><b>01</b><strong>Diagnose</strong><p>Find vague goals, missing context, hidden assumptions and ambiguity.</p></div>
      <div><b>02</b><strong>Engineer</strong><p>Add the right role, audience, structure, constraints and output format.</p></div>
      <div><b>03</b><strong>Strengthen</strong><p>Add quality criteria and useful guidance without unnecessary prompt bloat.</p></div>
      <div><b>04</b><strong>Deliver</strong><p>Get a clean prompt ready for ChatGPT, Claude, Gemini or another AI model.</p></div>
    </section>

    <section className="improve-lock">
      <Lock size={18}/>
      <div><strong>{used >= FREE_LIMIT && !pro ? 'Your five free improvements are complete.' : 'Five free improvements. Then keep going with Pro.'}</strong><span>{pro ? 'You have unlimited access to the PromptForge improvement engine.' : 'Try the engine with no commitment. When you reach improvement #6, choose a PromptForge plan to continue.'}</span></div>
      <a href="/pricing">{pro ? 'Explore PromptForge' : 'Subscribe or purchase'} <ArrowRight size={15}/></a>
    </section>

    {showPaywall && <div className="improve-modal-backdrop" role="presentation" onClick={() => setShowPaywall(false)}>
      <div className="improve-paywall" role="dialog" aria-modal="true" aria-labelledby="paywall-title" onClick={e => e.stopPropagation()}>
        <button className="paywall-close" onClick={() => setShowPaywall(false)} aria-label="Close">×</button>
        <div className="paywall-icon"><WandSparkles size={20}/></div>
        <span className="improve-kicker">FREE TRIAL COMPLETE</span>
        <h2 id="paywall-title">You’ve used all 5 free improvements.</h2>
        <p>Your sixth improvement is ready when you are. Subscribe or purchase PromptForge access to keep turning rough ideas into powerful prompts.</p>
        <div className="paywall-stats"><div><b>5/5</b><span>free uses</span></div><div><b>100%</b><span>used</span></div><div><b>∞</b><span>with Pro</span></div></div>
        <a className="paywall-primary" href="/pricing">See plans & unlock Pro <ArrowRight size={16}/></a>
        <button className="paywall-secondary" onClick={() => setShowPaywall(false)}>Maybe later</button>
      </div>
    </div>}
  </main>
}
