'use client';

import { Reveal } from '@/components/Reveal';
import { motion } from 'framer-motion';

interface Entry {
  version: string;
  date: string;
  headline: string;
  items: string[];
}

const ENTRIES: Entry[] = [
  {
    version: 'v0.8',
    date: 'May 19, 2026',
    headline: 'Detection bug fixed + song note corrections.',
    items: [
      'Critical: RAF loop stopped after first correct note -- all subsequent notes timed out as misses. Fixed.',
      'Iron Man, Yellow, Wonderful Tonight, Every Breath You Take corrected to actual note sequences.',
      'AI coach now receives real note names (E4, B2) instead of opaque string/fret data.',
    ],
  },
  {
    version: 'v0.7',
    date: 'May 19, 2026',
    headline: 'UserMenu, onboarding tour, display name, bug reports.',
    items: [
      'Top-right UserMenu: avatar initial, Settings link, Replay Tour, Sign Out.',
      '5-step spotlight onboarding tour triggers on first sign-in, replayable from menu.',
      'Display name in Settings, saved to Supabase user metadata. Bug report modal saves to DB.',
    ],
  },
  {
    version: 'v0.6',
    date: 'May 19, 2026',
    headline: 'Metronome, chord library, 73 songs, 4 difficulty levels.',
    items: [
      'Web Audio metronome with look-ahead scheduling, tap tempo, and time signatures.',
      '120+ chord diagrams with SVG fingering charts, search by name or category.',
      '73 songs: beginner (31), intermediate (24), advanced (12), expert (6). Pink/red/yellow/green.',
    ],
  },
  {
    version: 'v0.5',
    date: 'May 19, 2026',
    headline: 'Song library, practice stats, Supabase persistence.',
    items: [
      'Save songs, rename them, build a personal library. Syncs to Supabase per account.',
      'Dashboard: real sessions, streak, accuracy, tabs generated -- all from live data.',
      'AI tab generation rate limit: 3 free generations per 3 days.',
    ],
  },
  {
    version: 'v0.4',
    date: 'May 18, 2026',
    headline: 'Song Mode and AI Coach.',
    items: [
      '50 songs with real-time tab follow-along. Green on hit, red on miss.',
      'AI Coach: Claude analyzes your session and gives specific guitar feedback after each song.',
      'AI tab generation -- type any song name, get playable tabs instantly.',
    ],
  },
  {
    version: 'v0.3',
    date: 'May 18, 2026',
    headline: 'Mobile, security, logo, email waitlist.',
    items: [
      'Lark logo. Favicon, apple-touch-icon, og-image from single source design.',
      'Security headers, mobile-optimized layouts, email waitlist with Supabase.',
      'Light/dark theme FOUC fix, Google + GitHub OAuth, full marketing site.',
    ],
  },
  {
    version: 'v0.2',
    date: 'May 18, 2026',
    headline: 'App shell, themes, auth.',
    items: [
      'Authenticated app shell with sidebar, topbar, mobile drawer.',
      'Auth: sign in, sign up, magic link, reset. Google + GitHub OAuth.',
      'Settings: theme, audio prefs, tuning. Marketing pages: pricing, FAQ.',
    ],
  },
  {
    version: 'v0.1',
    date: 'May 17, 2026',
    headline: 'Tuner and chord detector.',
    items: [
      'Real-time pitch detection via Web Audio + Pitchy. Note, octave, cents offset.',
      'Chord detection via chromagram analysis + @tonaljs. Alternatives shown.',
      'First deploy. Both tools run 100% client-side, no backend.',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 120px' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: 56 }}>
        <p className="eyebrow" style={{ marginBottom: 14 }}>CHANGELOG</p>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          What shipped.
        </h1>
      </motion.div>

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 44, top: 0, bottom: 0, width: '0.5px', background: 'var(--border)' }} />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ENTRIES.map((entry, i) => (
            <Reveal key={entry.version} delay={i * 0.04}>
              <div style={{ display: 'flex', gap: 0, paddingBottom: 36 }}>
                {/* Version */}
                <div style={{ flexShrink: 0, width: 68, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: 14, paddingTop: 3 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-dim)', border: '0.5px solid var(--accent-border)', borderRadius: 99, padding: '3px 8px', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                    {entry.version}
                  </span>
                </div>

                {/* Dot */}
                <div style={{ flexShrink: 0, width: 12, display: 'flex', justifyContent: 'center', paddingTop: 7 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 5px rgba(34,197,94,0.6)', flexShrink: 0 }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingLeft: 16, paddingTop: 0 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.06em' }}>{entry.date}</p>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 10, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                    {entry.headline}
                  </h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {entry.items.map((item, j) => (
                      <li key={j} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>
                        <span style={{ color: 'var(--accent-border)', flexShrink: 0, marginTop: 3 }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
