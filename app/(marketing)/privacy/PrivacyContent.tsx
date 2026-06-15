'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Reveal } from '@/components/Reveal';

const SECTIONS = [
  {
    eyebrow: 'What we collect',
    items: [
      { title: 'Account information', body: 'When you create an account, we store your email address. That is the only personally identifiable information we collect.' },
      { title: 'Usage data', body: 'We record anonymized session data: songs played, accuracy scores, and session duration. This helps us understand how Lark is used and where to improve.' },
      { title: 'Audio', body: 'We do not store your audio. All pitch detection and chord analysis runs entirely in your browser via the Web Audio API. Nothing is recorded, transmitted, or logged from your microphone.' },
    ],
  },
  {
    eyebrow: 'How we use it',
    items: [
      { title: 'To provide the service', body: 'Your email lets you sign in, recover your account, and receive essential account notifications.' },
      { title: 'To improve accuracy', body: 'Aggregated, anonymized usage data informs which features we build next and how we tune detection thresholds.' },
      { title: 'Account emails', body: 'We may send you transactional emails (sign-in links, password resets) and occasional product updates. You can opt out of product updates at any time.' },
    ],
  },
  {
    eyebrow: 'Third-party services',
    items: [
      { title: 'Supabase', body: 'We use Supabase for authentication and data storage. Your account email and usage data are stored in Supabase. Supabase is SOC 2 compliant. See supabase.com/privacy.' },
      { title: 'Anthropic', body: 'When you request AI coaching, your session statistics (notes played, accuracy scores, song title) are sent to Anthropic to generate feedback. This data is not linked to your account and is not used to train Anthropic models under our API agreement.' },
      { title: 'Vercel', body: 'Lark is hosted on Vercel. Vercel may log standard request metadata (IP address, browser, timestamp) per their infrastructure policies. See vercel.com/legal/privacy-policy.' },
    ],
  },
  {
    eyebrow: 'Data sharing',
    items: [
      { title: 'We do not sell your data', body: 'We never sell, rent, or trade your personal information to third parties for marketing purposes. Period.' },
      { title: 'Legal requirements', body: 'We may disclose information if required by law, court order, or to protect the rights and safety of our users.' },
    ],
  },
  {
    eyebrow: 'Your rights',
    items: [
      { title: 'Delete your account', body: 'You can request deletion of your account and all associated data by emailing the404supply@gmail.com. We will confirm and complete the deletion within 7 days.' },
      { title: 'Access your data', body: 'You can request a copy of the data we hold about you by emailing the404supply@gmail.com.' },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <section className="ed-section">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <div className="ed-rule" />
          <div className="ed-head"><span className="ed-label">Privacy policy</span></div>
          <h1 className="ed-title ed-title-sm">Your data,<br />explained.</h1>
          <p className="ed-lead">Short version: we store only your email, never your audio, and we do not sell anything.</p>
          <p className="ed-stamp">Last updated: May 2026</p>
        </motion.div>
      </section>

      <section className="ed-section" style={{ paddingTop: 'clamp(32px, 4vh, 48px)' }}>
        {SECTIONS.map((section, si) => (
          <Reveal key={section.eyebrow} delay={0.04}>
            <div style={{ marginTop: si === 0 ? 0 : 'clamp(48px, 7vh, 80px)' }}>
              <div className="ed-rule" />
              <div className="ed-head" style={{ marginBottom: 12 }}>
                <span className="ed-num">{String(si + 1).padStart(2, '0')}</span>
                <span className="ed-label">{section.eyebrow}</span>
              </div>
              <div style={{ maxWidth: 760 }}>
                {section.items.map(item => (
                  <div key={item.title} className="legal-item">
                    <p className="legal-title">{item.title}</p>
                    <p className="legal-body">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="ed-section ed-section-pb" style={{ paddingTop: 'clamp(56px, 9vh, 104px)' }}>
        <Reveal>
          <div className="ed-rule" />
          <div className="ed-head"><span className="ed-label">Questions?</span></div>
          <h2 className="ed-title ed-title-sm">Get in touch.</h2>
          <p className="ed-lead">
            Email us at <a href="mailto:the404supply@gmail.com" className="legal-link">the404supply@gmail.com</a> and we will respond within 2 business days.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
            <Link href="/terms" className="ed-btn ed-btn-outline ed-btn-lg">View terms</Link>
            <Link href="/faq" className="ed-btn ed-btn-ghost ed-btn-lg">Read FAQ</Link>
          </div>
        </Reveal>
      </section>

      <style jsx>{`
        .ed-stamp { font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-top: 22px; }
        .legal-item { border-bottom: 0.5px solid var(--border); padding: 22px 0; }
        .legal-item:last-child { border-bottom: none; }
        .legal-title { font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: -0.01em; margin-bottom: 8px; }
        .legal-body { font-size: 14px; color: var(--text2); line-height: 1.75; max-width: 660px; }
        .legal-link { color: var(--accent); text-decoration: none; font-family: var(--font-mono); font-size: 14px; }
        .legal-link:hover { text-decoration: underline; }
      `}</style>
    </main>
  );
}
