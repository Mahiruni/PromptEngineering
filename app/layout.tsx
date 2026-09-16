import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PromptForge Business — Master AI Prompts. Run Your Business Better.',
  description: 'A curated daily AI prompt library and learning platform for modern businesses.',
  keywords: ['AI prompts','business prompts','prompt engineering','AI productivity'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>
}
