'use client'

import { useState } from 'react'
import { ArrowLeft, Check, Copy, Star, Sun, Sparkles, ArrowRight } from 'lucide-react'
import type { Prompt } from '@/lib/prompts'

export default function PromptDetails({ prompt }: { prompt: Prompt }) {
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [rating, setRating] = useState(0)
  const [light, setLight] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(prompt.prompt) } catch {}
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return (
    <main className={light ? 'light prompt-page' : 'prompt-page'}>
      <div className="prompt-page-progress" />
      <nav className="prompt-page-nav">
        <div className="container prompt-page-nav-inner">
          <a href="/" className="brand"><span className="brand-mark">P</span><span>PromptForge <i>Business</i></span></a>
          <div className="prompt-page-nav-actions">
            <button className="btn btn-ghost icon-btn" onClick={() => setLight(v => !v)} aria-label="Toggle theme"><Sun size={17} /></button>
            <a className="btn btn-ghost" href="/#library"><ArrowLeft size={15} /> Library</a>
          </div>
        </div>
      </nav>

      <section className="prompt-page-hero">
        <div className="container">
          <a href="/#library" className="prompt-back"><ArrowLeft size={14} /> Back to prompt library</a>
          <div className="prompt-page-heading">
            <div>
              <span className="tag"><Sparkles size={13} /> PROMPT DETAIL · {prompt.category.toUpperCase()}</span>
              <h1 className="display">{prompt.title}</h1>
              <p>{prompt.description}</p>
            </div>
            <div className="prompt-page-badges">
              <span className="chip active">{prompt.difficulty}</span>
              <span className="chip">{prompt.industry}</span>
              {(prompt.tags ?? []).slice(0, 3).map(tag => <span className="chip" key={tag}>{tag}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="container prompt-detail-layout">
        <article className="prompt-detail-main card">
          <div className="prompt-detail-toolbar">
            <div><span className="eyebrow">MASTER PROMPT</span><strong>Ready to copy and adapt</strong></div>
            <div className="prompt-toolbar-actions">
              <button className="btn btn-ghost" onClick={() => setSaved(v => !v)}><Star size={15} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save'}</button>
              <button className="btn btn-primary" onClick={copy}>{copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy prompt</>}</button>
            </div>
          </div>
          <pre className="prompt-detail-code">{prompt.prompt}</pre>
          <div className="prompt-detail-meta-grid">
            <div><span className="eyebrow">USE CASE</span><p>{prompt.useCase ?? prompt.description}</p></div>
            <div><span className="eyebrow">EXAMPLE INPUT</span><p>{prompt.exampleInput ?? 'Add your audience, context, source material, constraints and desired outcome.'}</p></div>
          </div>
        </article>

        <aside className="prompt-detail-side">
          <div className="card prompt-example-card">
            <span className="eyebrow">EXAMPLE OUTPUT</span>
            <h2>What good looks like</h2>
            <p>{prompt.exampleOutput ?? 'A structured, professional result with assumptions clearly marked and actionable next steps.'}</p>
            <div className="quality-list"><span><Check size={14} /> Specific to the brief</span><span><Check size={14} /> Clear structure</span><span><Check size={14} /> Actionable output</span></div>
          </div>
          <div className="card prompt-tips-card">
            <span className="eyebrow">EXPERT TIPS</span>
            <h2>Get better results</h2>
            <ul>{(prompt.tips ?? ['Give concrete context and constraints.', 'Supply source material when accuracy matters.', 'Review sensitive claims before publishing.']).map(t => <li key={t}>{t}</li>)}</ul>
          </div>
        </aside>
      </section>

      <section className="container prompt-rating-section">
        <div className="card prompt-rating-card">
          <div><span className="eyebrow">PROMPT QUALITY</span><h2>Was this starting point useful?</h2><p>Rate it to help you keep your library focused.</p></div>
          <div className="prompt-stars" aria-label="Rate this prompt">{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} className={n <= rating ? 'rated' : ''} aria-label={`Rate ${n} out of 5`}><Star size={20} fill={n <= rating ? 'currentColor' : 'none'} /></button>)}</div>
        </div>
      </section>

      <footer className="prompt-page-footer"><div className="container"><span>PromptForge <i>Business</i></span><a href="/#library">Explore more prompts <ArrowRight size={14} /></a></div></footer>
    </main>
  )
}
