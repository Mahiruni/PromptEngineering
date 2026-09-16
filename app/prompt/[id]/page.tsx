import { notFound } from 'next/navigation'
import { prompts } from '@/lib/prompts'
import PromptDetails from '@/components/prompt-details'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const prompt = prompts.find((item) => item.id === Number(id))
  return { title: prompt ? `${prompt.title} — PromptForge Business` : 'Prompt — PromptForge Business' }
}

export default async function PromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const prompt = prompts.find((item) => item.id === Number(id))
  if (!prompt) notFound()
  return <PromptDetails prompt={prompt} />
}
