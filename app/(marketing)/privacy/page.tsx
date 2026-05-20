'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Reveal } from '@/components/Reveal';

const SECTIONS = [
  {
    eyebrow: 'WHAT WE COLLECT',
    items: [
      {
        title: 'Account information',
        body: 'When you create an account, we store your email address. That is the only personally identifiable information we collect.',
      },
      {
        title: 'Usage data',
        body: 'We record anonymized session data: songs played, accuracy scores, and session duration. This helps us understand how Lark is used and where to improve.',
      },
      {
        title: 'Audio',
        body: 'We do not store your audio. All pitch detection and chord analysis runs entirely in your browser via the Web Audio API. Nothing is recorded, transmitted, or logged from your microphone.',
      },
    ],
  },
  {
    eyebrow: 'HOW WE USE IT',
    items: [
      {
        title: 'To provide the service',
        body: 'Your email lets you sign in, recover your account, and receive essential account notifications.',
      },
      {
        title: 'To improve accuracy',
        body: 'Aggregated, anonymized usage data informs which features we build next and how we tune detection thresholds.',
      },
      {
        title: 'Account emails',
        body: 'We may send you transactional emails (sign-in links, password resets) and occasional product updates. You can opt out of product updates at any time.',
      },
    ],
  },
  {
    eyebrow: 'THIRD-PARTY SERVICES',
    items: [
      {
        title: 'Supabase',
        body: 'We use Supabase for authentication and data storage. Your account email and usage data are stored in Supabase. Supabase is SOC 2 compliant. See supabase.com/privacy.',
      },
      {
        title: 'Anthropic',
        body: 'When you request AI coaching, your session statistics (notes played, accuracy scores, song title) are sent to Anthropic to generate feedback. This data is not linked to your account and is not used to train Anthropic models under our API agreement.',
      },
      {
        title: 'Vercel',
        body: 'Lark is hosted on Vercel. Vercel may log standard request metadata (IP address, browser, timestamp) per their infrastructure policies. See vercel.com/legal/privacy-policy.',
      },
    ],
  },
  {
    eyebrow: 'DATA SHARING',
    items: [
      {
        title: 'We do not sell your data',
        body: 'We never sell, rent, or trade your personal information to third parties for marketing purposes. Period.',
      },
      {
        title: 'Legal requirements',
        body: 'We may disclose information if required by law, court order, or to protect the rights and safety of our users.',
      },
    ],
  },
  {
    eyebrow: 'YOUR RIGHTS',
    items: [
      {
        title: 'Delete your account',
        body: 'You can request deletion of your account and all associated data by emailing hello@lark.coach. We will confirm and complete the deletion within 7 days.',
      },
      {
        title: 'Access your data',
        body: 'You can request a copy of the data we hold about you by emailing hello@lark.coach.',
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <section style={{ padding: '120px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          width: 440, height: 440,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.10) 0%, transparent 70%)',
          top: '-15%', left: '-10%',
          animation: 'float 13s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow"
            style={{ marginBottom: 24 }}
          >
            PRIVACY POLICY
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(34px, 6vw, 56px)',
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '-0.025em',
              lineHeight: 1.06,
              marginBottom: 22,
            }}
          >
            Your data, explained.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            style={{ fontSize: 16, color: 'var(--text3)', lineHeight: 1.6 }}
          >
            Short version: we store only your email, never your audio, and we do not sell anything.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            style={{
              fontSize: 12,
              color: 'var(--text3)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
              marginTop: 18,
            }}
          >
            Last updated: May 2026
          </motion.p>
        </div>
      </section>

      <section style={{ padding: '20px 24px 100px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {SECTIONS.map((section, si) => (
            <Reveal key={section.eyebrow} delay={si * 0.04}>
              <div style={{ marginBottom: 52 }}>
                <p className="eyebrow" style={{ marginBottom: 20 }}>{section.eyebrow}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {section.items.map((item, ii) => (
                    <div
                      key={item.title}
                      style={{
                        borderBottom: '0.5px solid var(--border)',
                        padding: '22px 0',
                      }}
                    >
                      <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--text)',
                        letterSpacing: '-0.01em',
                        marginBottom: 8,
                      }}>
                        {item.title}
                      </p>
                      <p style={{
                        fontSize: 14,
                        color: 'var(--text2)',
                        lineHeight: 1.75,
                        maxWidth: 640,
                      }}>
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section style={{ padding: '40px 24px 140px', textAlign: 'center' }}>
        <Reveal>
          <p className="eyebrow" style={{ marginBottom: 18 }}>QUESTIONS?</p>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(22px, 4vw, 34px)',
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: 16,
          }}>
            Get in touch.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.65, marginBottom: 28 }}>
            Email us at{' '}
            <a
              href="mailto:hello@lark.coach"
              style={{ color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 13 }}
            >
              hello@lark.coach
            </a>
            {' '}and we will respond within 2 business days.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/terms" className="btn btn-outline btn-lg">VIEW TERMS</Link>
            <Link href="/faq" className="btn btn-ghost btn-lg">READ FAQ</Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
