import type { Metadata } from 'next'
import './globals.css'
import './promptforge.css'
import './premium-home.css'
import './theme-fix.css'
import './hero-overhaul.css'

export const metadata: Metadata = {
  title: 'PromptForge Business — Master Prompt Engineering.',
  description: 'A premium prompt engineering platform for elite AI prompts, professional workflows, learning paths, and prompt improvement tools.',
  keywords: ['AI prompts','prompt engineering','prompt mastery','business AI','creative AI','prompt library'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body>{children}<a href="/improve" className="global-improve-cta">Improve a prompt <span>↗</span></a></body></html>
}
