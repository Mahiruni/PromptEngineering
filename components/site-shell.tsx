import Link from 'next/link'
import type { ReactNode } from 'react'

export function SiteHeader() {
  return <header className="info-header"><div className="info-header-inner"><Link href="/" className="brand"><span className="brand-mark">P</span><span>PromptForge <i>Business</i></span></Link><nav aria-label="Primary navigation" className="info-nav"><Link href="/">Home</Link><Link href="/#library">Library</Link><Link href="/how-to-use">How to use</Link><Link href="/help">Help</Link></nav><div className="info-header-actions"><Link href="/#library" className="btn btn-primary info-header-cta">Explore library</Link><details className="info-mobile-nav"><summary aria-label="Open navigation">Menu</summary><div><Link href="/">Home</Link><Link href="/#library">Library</Link><Link href="/how-to-use">How to use</Link><Link href="/help">Help</Link><Link href="/contact">Contact</Link></div></details></div></div></header>
}

export function SiteFooter() {
  return <footer className="info-footer"><div className="info-footer-inner"><div><Link href="/" className="brand"><span className="brand-mark">P</span><span>PromptForge <i>Business</i></span></Link><p>Premium prompt engineering, built for better AI work.</p></div><div className="footer-links"><Link href="/about">About</Link><Link href="/help">Help</Link><Link href="/faq">FAQ</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div><div className="footer-copy">© 2026 PromptForge Business</div></div></footer>
}

export function InfoPage({eyebrow,title,intro,children}:{eyebrow:string;title:string;intro:string;children:ReactNode}) { return <><SiteHeader/><main className="info-page"><div className="info-hero"><span className="tag">{eyebrow}</span><h1 className="display">{title}</h1><p>{intro}</p></div><div className="info-content">{children}</div></main><SiteFooter/></> }

export function Section({title,children}:{title:string;children:ReactNode}){return <section className="info-section"><h2>{title}</h2>{children}</section>}
