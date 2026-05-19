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
    cta: 'GET STARTED',
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
    cta: 'JOIN WAITLIST',
    href: '/auth?mode=signup',
    highlight: true,
    badge: 'COMING SOON',
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
    cta: 'CONTACT US',
    href: 'mailto:hello@lark.coach',
    badge: 'COMING SOON',
  },
];

export default function PricingPage() {
  return (
    <main>
      <section style={{ padding: '120px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          width: 520, height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.14) 0%, transparent 70%)',
          top: '-30%', left: '-10%',
          animation: 'float 9s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow"
            style={{ marginBottom: 24 }}
          >
            PRICING
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(36px, 6.5vw, 60px)',
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '-0.025em',
              lineHeight: 1.06,
              marginBottom: 24,
            }}
          >
            Free to start. Paid when it earns it.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text2)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}
          >
            The tuner and chord detector stay free forever. Pro and Studio unlock the deeper coaching features as they ship.
          </motion.p>
        </div>
      </section>

      {/* Plans */}
      <section style={{ padding: '60px 24px 80px' }}>
        <div style={{
          maxWidth: 1120,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 18,
        }}>
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08}>
              <div style={{
                padding: 'clamp(28px, 4vw, 36px)',
                background: plan.highlight ? 'var(--card-bg)' : 'var(--bg2)',
                border: plan.highlight ? '1px solid var(--accent)' : '0.5px solid var(--border)',
                borderRadius: 18,
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: plan.highlight ? `0 18px 50px rgba(var(--accent-rgb), 0.15)` : 'none',
              }}>
                {plan.badge && (
                  <span style={{
                    position: 'absolute',
                    top: -10,
                    right: 18,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    color: 'var(--bg)',
                    background: 'var(--accent)',
                    padding: '4px 10px',
                    borderRadius: 99,
                    boxShadow: '0 4px 14px rgba(var(--accent-rgb), 0.35)',
                  }}>
                    {plan.badge}
                  </span>
                )}

                <h3 style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 18,
                  fontWeight: 700,
                  color: plan.highlight ? 'var(--accent)' : 'var(--text)',
                  marginBottom: 6,
                  letterSpacing: '0.02em',
                }}>
                  {plan.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'clamp(32px, 7vw, 42px)',
                    fontWeight: 700,
                    color: 'var(--text)',
                    letterSpacing: '-0.02em',
                  }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text3)' }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.55, marginBottom: 20 }}>
                  {plan.desc}
                </p>

                {plan.preLaunch && (
                  <div style={{
                    padding: '10px 12px',
                    background: 'var(--accent-dim)',
                    border: '0.5px solid var(--accent-border)',
                    borderRadius: 8,
                    fontSize: 12,
                    color: 'var(--accent)',
                    fontFamily: 'var(--font-mono)',
                    lineHeight: 1.5,
                    marginBottom: 20,
                  }}>
                    {plan.preLaunch}
                  </div>
                )}

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{
                      fontSize: 13.5,
                      color: 'var(--text2)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      lineHeight: 1.5,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: 'auto' }}>
                  <Link
                    href={plan.href}
                    className={`btn ${plan.highlight ? 'btn-accent' : 'btn-outline'}`}
                    style={{ width: '100%' }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ teaser */}
      <section style={{ padding: '60px 24px 140px', textAlign: 'center' }}>
        <Reveal>
          <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 16 }}>
            Questions?
          </p>
          <Link href="/faq" className="btn btn-ghost">
            READ THE FAQ
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
