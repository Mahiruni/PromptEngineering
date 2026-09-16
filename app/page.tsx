'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, BookOpen, BrainCircuit, Check, ChevronDown, ChevronRight, Copy, Menu, Search, Sparkles, Star, Sun, Target, WandSparkles, X, Zap } from 'lucide-react'
import { categories, LIBRARY_TARGET, prompts, type Prompt } from '@/lib/prompts'

const PAGE_SIZE = 18

export default function Home() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [saved, setSaved] = useState<number[]>([])
  const [copied, setCopied] = useState<number | null>(null)
  const [selected, setSelected] = useState<Prompt | null>(null)
  const [mobile, setMobile] = useState(false)
  const [light, setLight] = useState(false)
  const [wizard, setWizard] = useState(0)
  const [ratings, setRatings] = useState<Record<number, number>>({})

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return prompts.filter((p) => {
      const haystack = [p.title, p.description, p.category, p.industry, ...(p.tags ?? [])].join(' ').toLowerCase()
      return (category === 'All' || p.category === category) && (difficulty === 'All' || p.difficulty === difficulty) && (!q || haystack.includes(q))
    })
  }, [query, category, difficulty])

  const copyPrompt = async (p: Prompt) => {
    try { await navigator.clipboard.writeText(p.prompt) } catch { /* clipboard permission may be unavailable */ }
    setCopied(p.id)
    window.setTimeout(() => setCopied(null), 1600)
  }

  const toggleSave = (id: number) => setSaved((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  const shown = filtered.slice(0, visible)

  return (
    <main className={light ? 'light' : ''}>
      <nav className="glass nav"><div className="container nav-inner">
        <a href="#top" className="brand"><span className="brand-mark">P</span><span>PromptForge <i>Business</i></span></a>
        <div className="desktop nav-links"><a href="#library">Library</a><a href="#learn">Learn</a><a href="#websites">Websites</a><a href="#pricing">Pricing</a></div>
        <div className="nav-actions"><button className="btn btn-ghost icon-btn" onClick={() => setLight((v) => !v)} aria-label="Toggle theme"><Sun size={17}/></button><a className="btn btn-primary desktop" href="#library">Explore prompts <ArrowRight size={15}/></a><button className="btn btn-ghost mobile" onClick={() => setMobile((v) => !v)} aria-label="Open navigation">{mobile ? <X size={19}/> : <Menu size={19}/>}</button></div>
      </div>{mobile && <div className="mobile mobile-menu">{['Library','Learn','Websites','Pricing'].map((item) => <a key={item} className="btn btn-ghost" href={`#${item.toLowerCase()}`} onClick={() => setMobile(false)}>{item}</a>)}</div>}</nav>

      <section id="top" className="hero grid-bg"><div className="container hero-inner"><span className="tag"><Sparkles size={14}/> THE DAILY AI WORKBENCH</span><h1 className="display">10,000+ Elite Prompts.<br/><span>Create stunning results for anything.</span></h1><p className="hero-copy">A deeply curated prompt library for serious business, creative, technical and strategic work with AI.</p><div className="hero-actions"><a className="btn btn-primary btn-lg" href="#library">Browse 10,000+ prompts <ArrowRight size={17}/></a><a className="btn btn-ghost btn-lg" href="#websites">Order your website</a></div><div className="proof-row"><span><Check size={14}/> 180 curated seeds</span><span><Check size={14}/> 30+ disciplines</span><span><Check size={14}/> Copy · save · improve</span><span><Check size={14}/> Scale-ready architecture</span></div></div></section>

      <section className="container stats-wrap"><div className="card stats"><Stat icon={<Zap/>} value="10K+" label="library capacity"/><Stat icon={<Target/>} value="180" label="curated seeds"/><Stat icon={<BrainCircuit/>} value="30+" label="disciplines"/><Stat icon={<Star/>} value="4" label="learning paths"/></div></section>

      <section id="library" className="container section"><div className="section-head"><div><span className="tag">Prompt library</span><h2 className="display">Your unfair AI advantage.</h2><p className="muted">Search deeply. Filter precisely. Copy instantly. Improve until the output is exceptional.</p></div><div className="search-wrap"><Search size={18}/><input value={query} onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE) }} placeholder="Search prompts..." aria-label="Search prompts"/></div></div>
        <div className="filterbar"><div className="chips"><button className={`chip ${category === 'All' ? 'active' : ''}`} onClick={() => { setCategory('All'); setVisible(PAGE_SIZE) }}>All</button>{categories.map((item) => <button key={item} className={`chip ${category === item ? 'active' : ''}`} onClick={() => { setCategory(item); setVisible(PAGE_SIZE) }}>{item}</button>)}</div><label className="select"><select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setVisible(PAGE_SIZE) }} aria-label="Filter by difficulty"><option>All</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select><ChevronDown size={15}/></label></div>
        <div className="library-meta"><span>{filtered.length} curated prompts matched</span><span>Target: {LIBRARY_TARGET.toLocaleString()}+</span></div>
        {shown.length ? <div className="prompt-grid">{shown.map((p) => <PromptCard key={p.id} prompt={p} copied={copied === p.id} saved={saved.includes(p.id)} onCopy={() => copyPrompt(p)} onSave={() => toggleSave(p.id)} onOpen={() => setSelected(p)}/>)}</div> : <div className="empty card"><Search size={22}/><b>No prompt matches that search.</b><span className="muted">Try another phrase or clear the filters.</span></div>}
        {shown.length < filtered.length && <div className="load"><button className="btn btn-ghost" onClick={() => setVisible((v) => v + PAGE_SIZE)}>Load more <ChevronRight size={15}/></button></div>}
      </section>

      <section id="learn" className="band"><div className="container section"><div className="two-col"><div><span className="tag"><BookOpen size={14}/> LEARNING HUB</span><h2 className="display">Master the craft,<br/>not just the syntax.</h2><p className="muted lead">Structured paths turn prompting from trial-and-error into a repeatable professional skill.</p></div><div className="path-list">{[['01','Prompt Engineering Mastery','8 lessons · foundations → advanced'],['02','Daily Prompt Habits','7 lessons · workflows that stick'],['03','Industry-specific Mastery','12 lessons · role-based systems'],['04','Stunning Visual & Written Output','10 lessons · craft + iteration']].map(([n,title,meta]) => <button className="card path" key={n}><span className="path-no">{n}</span><span><b>{title}</b><small>{meta}</small></span><ChevronRight/></button>)}</div></div></div></section>

      <section id="websites" className="container section"><div className="website card glow"><div className="website-copy"><span className="tag"><BrainCircuit size={14}/> CUSTOM BUILD STUDIO</span><h2 className="display">Need more than prompts?<br/><span>We build the website.</span></h2><p className="muted lead">A strategy-led, conversion-focused website built around your business, audience and goals.</p><div className="package-row"><span>Starter</span><span>Growth</span><span>Premium</span><span>Enterprise</span></div><button className="btn btn-primary btn-lg" onClick={() => setWizard(1)}>Start your project <ArrowRight size={16}/></button></div><div className="process"><b>01 · Discover</b><p>Goals, audience, offer and competitors.</p><b>02 · Design</b><p>Structure, visual direction and prototype.</p><b>03 · Build</b><p>Fast, responsive and accessible engineering.</p><b>04 · Launch</b><p>QA, SEO, analytics and handover.</p></div></div></section>

      <section id="pricing" className="container section pricing"><div className="center"><span className="tag">PRICING</span><h2 className="display">Start free. Go deeper when useful.</h2><p className="muted">Free discovery, professional workflows and custom website builds.</p></div><div className="price-grid">{[['Free','$0','Curated library','Browse and copy'],['Pro','$12/mo','Full prompt access','Collections + workflows'],['Growth','$49/mo','Team learning','Shared sets + analytics'],['Custom','Talk to us','Website build','Dedicated project team']].map(([name,price,title,detail], index) => <div className={`card price ${index === 1 ? 'featured' : ''}`} key={name}><span className="muted">{name}</span><strong className="display">{price}</strong><b>{title}</b><p className="muted">{detail}</p><a className={`btn ${index === 1 ? 'btn-primary' : 'btn-ghost'}`} href={index === 3 ? '#websites' : '#library'}>{index === 3 ? 'Enquire' : index === 0 ? 'Explore' : 'Start free'}</a></div>)}</div></section>

      <footer><div className="container footer"><span className="brand"><span className="brand-mark">P</span>PromptForge <i>Business</i></span><span className="muted">Built for people doing real work with AI.</span><span className="muted">© 2026 PromptForge</span></div></footer>

      {selected && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}><div className="modal card" role="dialog" aria-modal="true" aria-labelledby="prompt-title" onMouseDown={(e) => e.stopPropagation()}><div className="modal-head"><div><span className="tag">Prompt detail</span><h2 id="prompt-title" className="display">{selected.title}</h2></div><button className="btn btn-ghost icon-btn" onClick={() => setSelected(null)} aria-label="Close"><X size={17}/></button></div><div className="modal-tags"><span className="chip active">{selected.category}</span><span className="chip">{selected.difficulty}</span>{selected.tags?.slice(1,3).map((tag) => <span className="chip" key={tag}>{tag}</span>)}</div><p className="muted">{selected.description}</p><label className="prompt-label">MASTER PROMPT</label><pre>{selected.prompt}</pre><div className="example-grid"><div><label>Example input</label><p>{selected.exampleInput}</p></div><div><label>Example output</label><p>{selected.exampleOutput}</p></div></div><div className="tips"><b>Expert tips</b>{selected.tips?.map((tip) => <span key={tip}>• {tip}</span>)}</div><div className="modal-actions"><button className="btn btn-primary" onClick={() => copyPrompt(selected)}>{copied === selected.id ? <><Check size={15}/> Copied</> : <><Copy size={15}/> Copy prompt</>}</button><button className="btn btn-ghost" onClick={() => copyPrompt({ ...selected, prompt: `Improve and expand this prompt while preserving its intent. Add stronger context, constraints, quality criteria, examples and expert-level output instructions.\n\n${selected.prompt}` })}><WandSparkles size={15}/> Improve / Expand</button><div className="rating" aria-label="Rate prompt quality">{[1,2,3,4,5].map((n) => <button key={n} className={n <= (ratings[selected.id] ?? 0) ? 'rated' : ''} onClick={() => setRatings((r) => ({ ...r, [selected.id]: n }))} aria-label={`${n} stars`}><Star size={16} fill="currentColor"/></button>)}</div></div></div></div>}

      {wizard > 0 && <div className="modal-backdrop" onMouseDown={() => setWizard(0)}><div className="wizard card" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}><div className="modal-head"><div><span className="tag">WEBSITE STUDIO · STEP {wizard} OF 3</span><h2 className="display">Tell us what you're building.</h2></div><button className="btn btn-ghost icon-btn" onClick={() => setWizard(0)} aria-label="Close"><X/></button></div><div className="progress"><span style={{ width: `${wizard * 33.33}%` }}/></div>{wizard < 3 ? <div className="wizard-grid"><Field label={wizard === 1 ? 'Business / brand' : 'Pages needed'} placeholder={wizard === 1 ? 'e.g. Biloo' : 'Home, About, Services, Shop...'} /><Field label={wizard === 1 ? 'What do you sell?' : 'Visual direction'} placeholder={wizard === 1 ? 'Product, service, platform...' : 'Describe the feeling or references'} /><Field label={wizard === 1 ? 'Primary goal' : 'Timeline'} placeholder={wizard === 1 ? 'Leads, sales, bookings...' : 'When should it launch?'} /><Field label={wizard === 1 ? 'Target audience' : 'Budget range'} placeholder={wizard === 1 ? 'Who should this website serve?' : 'Starter / Growth / Premium / Enterprise'} /></div> : <div className="wizard-done"><Check size={34}/><h3 className="display">Brief structure ready.</h3><p className="muted">The next production step is connecting this wizard to your preferred CRM or email endpoint.</p><a className="btn btn-primary" href="mailto:hello@promptforge.business?subject=PromptForge%20Website%20Project">Send project brief <ArrowRight size={15}/></a></div>}<div className="wizard-actions">{wizard > 1 && <button className="btn btn-ghost" onClick={() => setWizard((v) => v - 1)}>Back</button>}{wizard < 3 ? <button className="btn btn-primary" onClick={() => setWizard((v) => v + 1)}>Continue <ArrowRight size={15}/></button> : <button className="btn btn-ghost" onClick={() => setWizard(0)}>Done</button>}</div></div></div>}
    </main>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) { return <div className="stat"><span>{icon}</span><strong className="display">{value}</strong><small>{label}</small></div> }
function PromptCard({ prompt, copied, saved, onCopy, onSave, onOpen }: { prompt: Prompt; copied: boolean; saved: boolean; onCopy: () => void; onSave: () => void; onOpen: () => void }) { return <article className="card prompt-card"><div className="prompt-top"><span className="chip active">{prompt.category}</span><button className="icon-btn" onClick={onSave} aria-label={saved ? 'Remove from saved' : 'Save prompt'}><Star size={17} fill={saved ? 'currentColor' : 'none'}/></button></div><button className="prompt-title" onClick={onOpen}>{prompt.title}<ArrowRight size={16}/></button><p className="muted">{prompt.description}</p><div className="tags"><span className="chip">{prompt.difficulty}</span><span className="chip">{prompt.industry}</span></div><div className="prompt-actions"><button className="btn btn-primary" onClick={onCopy}>{copied ? <><Check size={15}/> Copied</> : <><Copy size={15}/> Copy</>}</button><button className="btn btn-ghost" onClick={onOpen}><WandSparkles size={15}/> Improve</button></div></article> }
function Field({ label, placeholder }: { label: string; placeholder: string }) { return <label className="field"><span>{label}</span><input placeholder={placeholder}/></label> }
