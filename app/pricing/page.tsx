'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Check, Crown, Globe2, Layers3, Sparkles, Users, Zap } from 'lucide-react'
import './pricing.css'

const plans = [
  {
    name: 'Free',
    kicker: 'Start exploring',
    monthly: '$0',
    annual: '$0',
    cadence: 'forever',
    description: 'A practical way to experience the PromptForge workflow before committing.',
    color: 'pricing-free',
    icon: Sparkles,
    cta: 'Start for free',
    href: '/#library',
    benefits: [
      'Browse the curated prompt library',
      'Copy prompts for everyday work',
      'Access prompt examples and quality standards',
      'Try the Prompt Improver 5 times',
      'Explore Learning Hub previews',
      'No credit card required',
    ],
  },
  {
    name: 'Pro',
    kicker: 'For serious daily work',
    monthly: '$12',
    annual: '$120',
    cadence: '/month',
    annualCadence: '/year',
    description: 'Unlimited prompt improvement and the complete professional prompt workflow.',
    color: 'pricing-pro',
    icon: Crown,
    featured: true,
    cta: 'Start Pro',
    href: '/api/checkout',
    annualHref: '/api/checkout/annual',
    benefits: [
      'Unlimited Prompt Improver usage',
      'Full access to the premium prompt library',
      'Save and organize your favorite prompts',
      'Full prompt examples and Result Lab standards',
      'Complete Learning Hub paths',
      'Advanced prompt engineering workflows',
      'Priority access to new prompt collections',
      '7-day trial when enabled at checkout',
    ],
  },
  {
    name: 'Growth',
    kicker: 'For teams and repeatable systems',
    monthly: '$49',
    annual: '$490',
    cadence: '/month',
    annualCadence: '/year',
    description: 'A team-oriented workspace for turning individual prompting into repeatable practice.',
    color: 'pricing-growth',
    icon: Users,
    cta: 'Talk about Growth',
    href: '/contact?topic=Growth',
    benefits: [
      'Everything in Pro',
      'Shared prompt collections for teams',
      'Team learning workflows',
      'Reusable internal prompt systems',
      'Team usage and learning insights',
      'Structured onboarding for new users',
      'Workspace-level organization',
      'Priority support for rollout questions',
    ],
  },
  {
    name: 'Custom Studio',
    kicker: 'Built around your business',
    monthly: 'Brief',
    annual: 'Brief',
    cadence: 'custom scope',
    description: 'A dedicated strategy, design and build engagement for a product, website or workflow.',
    color: 'pricing-studio',
    icon: Layers3,
    cta: 'Start a project',
    href: '/#studio',
    benefits: [
      'Discovery and business requirements',
      'Product and website strategy',
      'Custom UX and visual direction',
      'Production-ready implementation',
      'Performance and responsive optimization',
      'Launch planning and review',
      'Dedicated project scope and milestones',
      'Post-launch improvement opportunities',
    ],
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <main className="pricing-page">
      <header className="pricing-header">
        <a href="/" className="pricing-brand"><span>P</span> PromptForge <i>Business</i></a>
        <a href="/" className="pricing-back">Back to library <ArrowRight size={15} /></a>
      </header>

      <section className="pricing-hero">
        <div className="pricing-orbit" />
        <span className="pricing-eyebrow"><Zap size={14} /> SIMPLE PLANS · CLEAR BENEFITS</span>
        <h1>Choose the workflow<br /><em>that fits your work.</em></h1>
        <p>Start free, unlock unlimited improvement with Pro, scale prompting across a team, or have PromptForge build the system around you.</p>

        <div className="billing-switch" role="group" aria-label="Billing period">
          <button className={!annual ? 'active' : ''} onClick={() => setAnnual(false)}>Monthly</button>
          <button className={annual ? 'active' : ''} onClick={() => setAnnual(true)}>Annual <span>2 months free</span></button>
        </div>
      </section>

      <section className="pricing-grid" aria-label="Pricing plans">
        {plans.map((plan, index) => {
          const Icon = plan.icon
          const price = annual ? plan.annual : plan.monthly
          const cadence = annual && plan.annualCadence ? plan.annualCadence : plan.cadence
          return (
            <motion.article
              key={plan.name}
              className={`pricing-card ${plan.color} ${plan.featured ? 'is-featured' : ''}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: index * .06, duration: .55 }}
              whileHover={{ y: -8 }}
            >
              {plan.featured && <div className="popular-badge"><Crown size={13} /> MOST POPULAR</div>}
              <div className="plan-icon"><Icon size={20} /></div>
              <span className="plan-kicker">{plan.kicker}</span>
              <h2>{plan.name}</h2>
              <p className="plan-description">{plan.description}</p>
              <div className="plan-price"><strong>{price}</strong><span>{cadence}</span></div>
              {annual && plan.name !== 'Free' && plan.name !== 'Custom Studio' && <span className="annual-note">Save 2 months with annual billing</span>}
              <a className="plan-cta" href={annual && plan.annualHref ? plan.annualHref : plan.href}>{plan.cta} <ArrowRight size={15} /></a>
              <div className="benefits-title">Everything included</div>
              <ul>{plan.benefits.map(benefit => <li key={benefit}><span><Check size={13} /></span>{benefit}</li>)}</ul>
            </motion.article>
          )
        })}
      </section>

      <section className="pricing-assurance">
        <div><Globe2 size={20} /><strong>Built for work across disciplines</strong><span>Marketing, strategy, writing, design, research, operations and more.</span></div>
        <div><Zap size={20} /><strong>Improve before you publish</strong><span>Turn a rough request into a structured, reusable prompt.</span></div>
        <div><Crown size={20} /><strong>Upgrade only when useful</strong><span>Your free experience remains available before you decide.</span></div>
      </section>

      <footer className="pricing-footer">© 2026 PromptForge Business · Premium prompts. Practical learning. Serious output.</footer>
    </main>
  )
}
