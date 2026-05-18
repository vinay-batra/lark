'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Reveal } from '@/components/Reveal';

type EntryType = 'release' | 'feature' | 'fix' | 'polish';

interface Entry {
  version: string;
  date: string;
  headline: string;
  type: EntryType;
  changes: { kind: 'NEW' | 'POLISH' | 'FIX' | 'INFRA'; text: string }[];
}

const ENTRIES: Entry[] = [
  {
    version: 'v0.3',
    date: 'May 18, 2026',
    headline: 'Mobile pass, security headers, UI polish, logo.',
    type: 'release',
    changes: [
      { kind: 'NEW', text: 'Lark logo shipped (bird with guitar string tail). Favicon, apple-touch-icon, og-image all generated from single source.' },
      { kind: 'NEW', text: 'Security headers on every route: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, and Permissions-Policy restricting mic access to same origin only.' },
      { kind: 'NEW', text: 'Email waitlist with Supabase insert + AnimatePresence transition between form and success state.' },
      { kind: 'NEW', text: 'Light/dark theme system via data-theme attribute. SSR-safe inline script prevents FOUC. Persists to localStorage.' },
      { kind: 'POLISH', text: 'Landing page: single OPEN APP CTA, 2x2 feature grid, green glows via CSS multi-gradient background on main (no section boundary cutoff), email capture section at bottom.' },
      { kind: 'POLISH', text: 'Auth page redesigned: centered logo, green glow card, mode tabs, Google + GitHub OAuth buttons.' },
      { kind: 'POLISH', text: 'Color system: uniform near-black background, midnight blue cards (#0d1a2d), green glow accents throughout.' },
      { kind: 'POLISH', text: 'Footer links now have green hover states. Footer uses VERSION constant from lib/version.ts.' },
      { kind: 'POLISH', text: 'Nav restructured: Features / Pricing / Changelog / FAQ. Centered links via CSS grid (1fr auto 1fr). Hide-on-scroll, mobile drawer.' },
      { kind: 'FIX', text: 'TunerView + ChordsView: note display font uses clamp(64px, 20vw, 112px). Meter width is min(100%, 320px). String chips flex-wrap on narrow screens.' },
      { kind: 'FIX', text: 'getUserMedia errors now differentiated: NotAllowedError, NotFoundError, NotReadableError each show a specific message.' },
      { kind: 'FIX', text: 'Removed overflow: hidden from sections so green orbs bleed continuously between sections without hard cutoff lines.' },
      { kind: 'INFRA', text: 'VERSION constant in lib/version.ts used by Footer, Settings, and changelog. Single source of truth.' },
      { kind: 'INFRA', text: 'Cleaned public/: removed source logo PNG, 5 Next.js default SVGs, Mac Icon file.' },
    ],
  },
  {
    version: 'v0.2',
    date: 'May 18, 2026',
    headline: 'Full app shell, themes, auth, marketing site.',
    type: 'release',
    changes: [
      { kind: 'NEW', text: 'Light and dark theme system with persistent toggle. SSR-safe inline script prevents flash on reload.' },
      { kind: 'NEW', text: 'Public nav with hide-on-scroll, mobile drawer, theme toggle.' },
      { kind: 'NEW', text: 'Authenticated app shell at /app with sidebar, topbar, and mobile drawer.' },
      { kind: 'NEW', text: 'Settings page: theme, audio detection prefs, default tuning, account.' },
      { kind: 'NEW', text: 'Auth page with sign in, sign up, magic link, password reset. Google + GitHub OAuth.' },
      { kind: 'NEW', text: 'Marketing pages: cinematic landing, pricing, changelog, FAQ.' },
      { kind: 'NEW', text: 'Reusable Card + scroll-reveal components lifted from Corvo.' },
      { kind: 'NEW', text: 'Footer with brand, product, company, and account columns.' },
      { kind: 'INFRA', text: 'framer-motion for hero entrance, accordion, modal animations.' },
      { kind: 'INFRA', text: 'Supabase browser client + proxy.ts auth refresh (Next.js 16 migration).' },
      { kind: 'POLISH', text: 'Tuner and chord pages use a shared ToolNav with theme toggle.' },
    ],
  },
  {
    version: 'v0.1',
    date: 'May 17, 2026',
    headline: 'Tuner + chord detector live.',
    type: 'release',
    changes: [
      { kind: 'NEW', text: 'Real-time tuner using Web Audio API + Pitchy v4. Note name, octave, Hz, cents meter with green-zone indicator, 6-string reference.' },
      { kind: 'NEW', text: 'Chord detector with chromagram FFT and @tonaljs/chord-detect. Rolling average over 10 frames for stability. Live 12-bar chromagram visualization.' },
      { kind: 'NEW', text: 'Initial Next.js scaffold with Space Mono, dark theme, CSS variable system.' },
      { kind: 'INFRA', text: 'TypeScript strict mode, ESLint, Turbopack builds.' },
    ],
  },
];

const KIND_COLORS: Record<Entry['changes'][number]['kind'], { bg: string; color: string }> = {
  NEW: { bg: 'var(--accent-dim)', color: 'var(--accent)' },
  POLISH: { bg: 'rgba(96, 165, 250, 0.1)', color: 'var(--flat)' },
  FIX: { bg: 'var(--sharp-dim)', color: 'var(--sharp)' },
  INFRA: { bg: 'var(--bg3)', color: 'var(--text3)' },
};

export default function ChangelogPage() {
  return (
    <main>
      {/* Hero */}
      <section style={{ padding: '120px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.13) 0%, transparent 70%)',
          top: '-25%', left: '-10%',
          animation: 'float 10s ease-in-out infinite',
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
            CHANGELOG
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(36px, 6.5vw, 60px)',
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '-0.025em',
              lineHeight: 1.06,
              marginBottom: 22,
            }}
          >
            What is new in Lark.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text2)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto' }}
          >
            Every release. Every fix. Every improvement.
          </motion.p>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: '40px 24px 100px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute',
            left: 11,
            top: 14,
            bottom: 0,
            width: 1,
            background: 'linear-gradient(to bottom, var(--accent-border), var(--border) 60%, transparent)',
          }} />

          {ENTRIES.map((entry, i) => (
            <Reveal key={entry.version} delay={i * 0.08}>
              <article style={{ marginBottom: 56, position: 'relative', paddingLeft: 44 }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: 4,
                  top: 8,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  boxShadow: '0 0 14px rgba(var(--accent-rgb), 0.55), 0 0 0 4px var(--bg)',
                }} />

                <header style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 24,
                      fontWeight: 700,
                      color: 'var(--text)',
                      letterSpacing: '-0.02em',
                    }}>
                      {entry.version}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--text3)',
                      letterSpacing: '0.08em',
                    }}>
                      {entry.date.toUpperCase()}
                    </span>
                  </div>
                  <h2 style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--text2)',
                    lineHeight: 1.35,
                    letterSpacing: '-0.01em',
                  }}>
                    {entry.headline}
                  </h2>
                </header>

                <div style={{
                  background: 'var(--card-bg)',
                  border: '0.5px solid var(--border)',
                  borderRadius: 14,
                  padding: '22px 24px',
                }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {entry.changes.map((c, ci) => (
                      <li key={ci} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          color: KIND_COLORS[c.kind].color,
                          background: KIND_COLORS[c.kind].bg,
                          padding: '3px 8px',
                          borderRadius: 5,
                          flexShrink: 0,
                          marginTop: 2,
                          minWidth: 48,
                          textAlign: 'center',
                        }}>
                          {c.kind}
                        </span>
                        <span style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, flex: 1 }}>
                          {c.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}

          {/* End marker */}
          <Reveal>
            <div style={{ paddingLeft: 44, position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: 7,
                top: 6,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--bg2)',
                border: '1px solid var(--border2)',
              }} />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                THE BEGINNING
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '40px 24px 140px', textAlign: 'center' }}>
        <Reveal>
          <p className="eyebrow" style={{ marginBottom: 18 }}>SUBSCRIBE</p>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: 22,
            maxWidth: 540,
            margin: '0 auto 22px',
          }}>
            Want every release in your inbox?
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text3)', maxWidth: 460, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Create an account and we will email you when major features ship. No marketing fluff.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth?mode=signup" className="btn btn-accent btn-lg">CREATE ACCOUNT</Link>
            <Link href="/tuner" className="btn btn-outline btn-lg">TRY THE TUNER</Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
