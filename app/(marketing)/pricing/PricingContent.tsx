'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Reveal } from '@/components/Reveal';

interface Plan {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
  badge?: string;
  preLaunch?: string;
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Everything Lark does today, on the house.',
    features: [
      'Real-time tuner',
      'Chord detector',
      'Light + dark themes',
      'All updates as they ship',
      'No credit card to start',
    ],
    cta: 'Get started',
    href: '/auth?mode=signup',
  },
  {
    name: 'Pro',
    price: '$8',
    period: '/month',
    desc: 'For people who practice every day.',
    features: [
      'Everything in Free',
      'Song follow-along library',
      'AI coaching feedback',
      'Practice streaks + progress',
      'Custom tunings',
      'Priority support',
    ],
    cta: 'Join waitlist',
    href: '/auth?mode=signup',
    highlight: true,
    badge: 'Coming soon',
    preLaunch: 'Founding members lock in $5/month forever.',
  },
  {
    name: 'Studio',
    price: '$24',
    period: '/month',
    desc: 'For teachers, studios, and bands.',
    features: [
      'Everything in Pro',
      'Shared library + setlists',
      'Multi-user accounts (up to 8)',
      'Lesson notes + recordings',
      'Custom branding (white-label)',
      '1:1 onboarding',
    ],
    cta: 'Contact us',
    href: 'mailto:the404supply@gmail.com',
    badge: 'Coming soon',
  },
];

export default function PricingPage() {
  return (
    <main>
      <section className="ed-section">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <div className="ed-rule" />
          <div className="ed-head"><span className="ed-label">Pricing</span></div>
          <h1 className="ed-title ed-title-sm">Free to learn.<br />Pro when you{'’'}re ready.</h1>
          <p className="ed-lead">The tuner and chord detector stay free forever. Pro and Studio unlock the deeper coaching features as they ship.</p>
        </motion.div>
      </section>

      <section className="ed-section ed-section-pb" style={{ paddingTop: 'clamp(36px, 5vh, 56px)' }}>
        <Reveal>
          <div className="pricing-cols">
            {PLANS.map(plan => (
              <div key={plan.name} className={`pricing-col ${plan.highlight ? 'is-featured' : ''}`}>
                <span className="pricing-badge">{plan.badge ?? ' '}</span>
                <h3 className="pricing-name" style={{ color: plan.highlight ? 'var(--accent)' : 'var(--text)' }}>{plan.name}</h3>
                <div className="pricing-price">
                  <span className="pricing-amount">{plan.price}</span>
                  <span className="pricing-period">{plan.period}</span>
                </div>
                <p className="pricing-desc">{plan.desc}</p>
                {plan.preLaunch && <p className="pricing-prelaunch">{plan.preLaunch}</p>}
                <ul className="pricing-features">
                  {plan.features.map(f => (
                    <li key={f}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="pricing-cta">
                  <Link href={plan.href} className={`ed-btn ${plan.highlight ? 'ed-btn-accent' : 'ed-btn-outline'}`} style={{ width: '100%' }}>{plan.cta}</Link>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <style jsx>{`
        .pricing-cols { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 0.5px solid var(--border); }
        .pricing-col { display: flex; flex-direction: column; padding: 30px clamp(20px, 2.4vw, 32px) 30px; border-left: 0.5px solid var(--border); position: relative; }
        .pricing-col:first-child { border-left: none; }
        .pricing-col.is-featured { background: rgba(var(--accent-rgb), 0.03); }
        .pricing-col.is-featured::before { content: ''; position: absolute; top: -1px; left: 0; right: 0; height: 2px; background: var(--accent); }
        .pricing-badge { font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); margin-bottom: 14px; display: block; min-height: 11px; }
        .pricing-name { font-family: var(--font-mono); font-size: 17px; font-weight: 700; letter-spacing: 0.02em; margin-bottom: 8px; }
        .pricing-price { display: flex; align-items: baseline; gap: 6px; margin-bottom: 14px; }
        .pricing-amount { font-family: var(--font-mono); font-size: clamp(32px, 6vw, 44px); font-weight: 700; color: var(--text); letter-spacing: -0.03em; line-height: 1; }
        .pricing-period { font-size: 13px; color: var(--text3); }
        .pricing-desc { font-size: 14px; color: var(--text2); line-height: 1.55; margin-bottom: 20px; }
        .pricing-prelaunch { font-family: var(--font-mono); font-size: 12px; color: var(--accent); line-height: 1.5; border-left: 2px solid var(--accent); padding-left: 12px; margin-bottom: 20px; }
        .pricing-features { list-style: none; padding: 0; margin: 0 0 24px; display: flex; flex-direction: column; gap: 11px; }
        .pricing-features li { font-size: 13.5px; color: var(--text2); display: flex; align-items: flex-start; gap: 10px; line-height: 1.5; }
        .pricing-features svg { flex-shrink: 0; margin-top: 3px; }
        .pricing-cta { margin-top: auto; }
        @media (max-width: 768px) {
          .pricing-cols { grid-template-columns: 1fr; }
          .pricing-col { border-left: none; border-top: 0.5px solid var(--border); }
          .pricing-col:first-child { border-top: none; }
        }
      `}</style>
    </main>
  );
}
