import type { Metadata } from 'next'
import './globals.css'
import './promptforge.css'

export const metadata: Metadata = {
  title: 'PromptForge Business — The World’s Most Premium Prompt Library.',
  description: 'The definitive global platform for premium AI prompts, professional learning, stunning example outputs, and custom website builds.',
  keywords: ['AI prompts','premium prompts','prompt engineering','business AI','creative AI','prompt library'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>
}
