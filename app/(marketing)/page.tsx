'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Reveal } from '@/components/Reveal';
import { WaitlistForm } from '@/components/WaitlistForm';

const FEATURES = [
  {
    eyebrow: 'TUNER',
    title: 'Pitch-perfect, instantly',
    desc: 'Real-time pitch detection via Web Audio. Hit the green zone, you are in tune.',
    href: '/app/tuner',
    icon: <path d="M2 12h3l3-9 4 18 3-9 3 5 4-5"/>,
  },
  {
    eyebrow: 'CHORD DETECTOR',
    title: 'Hears any chord',
    desc: 'Play a chord. Lark identifies it from your mic via chromagram analysis, with alternatives.',
    href: '/app/chords',
    icon: <><rect x="3" y="6" width="18" height="12" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="8" y1="6" x2="8" y2="18"/><line x1="14" y1="6" x2="14" y2="18"/></>,
  },
  {
    eyebrow: 'SONG MODE',
    title: '50 songs to follow along',
    desc: 'Scrolling tab with live pitch detection. Green when you nail it, red when you miss. Every note scored.',
    href: '/app/songs',
    icon: <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
  },
  {
    eyebrow: 'AI COACH',
    title: 'Feedback that means something',
    desc: 'After each song, Claude analyzes your accuracy and intonation. Specific, actionable coaching -- not just a score.',
    href: '/app/songs',
    icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>,
  },
  {
    eyebrow: 'CHORD LIBRARY',
    title: '120+ chord diagrams',
    desc: 'Every open chord, barre chord, seventh, and power chord with fingering diagrams. The reference you will actually use.',
    href: '/app/chord-library',
    icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
  },
  {
    eyebrow: 'METRONOME',
    title: 'Keep perfect time',
    desc: 'Precision Web Audio metronome with tap tempo, time signatures, and beat accent. Practice at any tempo.',
    href: '/app/metronome',
    icon: <><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></>,
  },
];

const DIFFICULTY_LABELS = [
  { label: 'Beginner', color: '#22c55e', count: 31 },
  { label: 'Intermediate', color: '#f59e0b', count: 24 },
  { label: 'Advanced', color: '#f97316', count: 12 },
  { label: 'Expert', color: '#e11d48', count: 6 },
];

const AI_FEEDBACK_EXAMPLE = `"Nice run through Seven Nation Army. Your E string is clean and you nailed all 9 notes. Watch your intonation on the C -- you are consistently about 18 cents flat there, which suggests your index finger needs to sit closer to the fret. One tip: slow the tempo down to 60% and focus just on that C note until your muscle memory locks it in."`;

const STEPS = [
  { num: '01', title: 'Pick a song', desc: 'Choose from 50 songs across 4 difficulty levels, or generate tabs for any song with AI.' },
  { num: '02', title: 'Play along', desc: 'Lark listens through your mic and scores each note in real time as you play.' },
  { num: '03', title: 'Get coached', desc: 'When you finish, Claude gives you specific, actionable feedback on what to fix and how.' },
];

const BG = `
  radial-gradient(ellipse 700px 600px at 92% 4%, rgba(34,197,94,0.18) 0%, transparent 70%),
  radial-gradient(ellipse 500px 500px at 5% 16%, rgba(34,197,94,0.11) 0%, transparent 65%),
  radial-gradient(ellipse 520px 480px at 10% 50%, rgba(34,197,94,0.07) 0%, transparent 65%),
  radial-gradient(ellipse 480px 480px at 90% 64%, rgba(34,197,94,0.08) 0%, transparent 65%)
`;

export default function LandingPage() {
  return (
    <main style={{ overflowX: 'hidden', backgroundImage: BG }}>

      {/* HERO */}
      <section style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px 80px' }}>
        <div style={{ maxWidth: 860, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="eyebrow" style={{ marginBottom: 28 }}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', marginRight: 9, verticalAlign: 'middle', animation: 'pulse 2s ease-in-out infinite', boxShadow: '0 0 10px rgba(34,197,94,0.7)' }} />
            LISTEN-FIRST GUITAR COACHING
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }} style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(42px, 8vw, 88px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.04, marginBottom: 24, letterSpacing: '-0.03em' }}>
            The guitar tutor<br />
            <span style={{ color: 'var(--accent)', textShadow: '0 0 40px rgba(34,197,94,0.4)' }}>that listens.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.18 }} style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text2)', lineHeight: 1.65, maxWidth: 560, margin: '0 auto 14px' }}>
            50 songs. Real-time tab follow-along. AI coaching after every session. Tuner, chord detector, metronome, chord library. All free. All in your browser.
          </motion.p>

          {/* Stats bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.28 }} style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 40, flexWrap: 'wrap' }}>
            {[['50', 'songs'], ['4', 'difficulty levels'], ['6', 'tools'], ['Free', 'forever']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{val}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.14em', marginTop: 4 }}>{label.toUpperCase()}</div>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <Link href="/app" className="btn btn-accent btn-lg" style={{ boxShadow: '0 0 28px rgba(34,197,94,0.35), 0 4px 16px rgba(0,0,0,0.3)' }}>
              OPEN APP FREE
            </Link>
            <Link href="/auth?mode=signup" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: '0.08em' }}>
              or create an account to save progress
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SONG LIBRARY */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>SONG LIBRARY</p>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 14 }}>
                50 songs. 4 difficulty levels.
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text3)', maxWidth: 480, margin: '0 auto' }}>
                From Twinkle Twinkle to Master of Puppets. Or ask the AI to generate tabs for any song not in the library.
              </p>
            </div>
          </Reveal>

          {/* Difficulty breakdown */}
          <Reveal delay={0.1}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
              {DIFFICULTY_LABELS.map(d => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', background: 'var(--card-bg)', border: `0.5px solid ${d.color}40`, borderRadius: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, boxShadow: `0 0 8px ${d.color}80` }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', fontWeight: 700 }}>{d.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: d.color }}>{d.count}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Sample songs preview */}
          <Reveal delay={0.15}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
              {['Smoke on the Water','Mr. Brightside','Nothing Else Matters','Thunderstruck','Stairway to Heaven','Comfortably Numb','Master of Puppets','Through the Fire and Flames'].map(song => (
                <span key={song} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 99, padding: '5px 12px', letterSpacing: '0.04em' }}>
                  {song}
                </span>
              ))}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', padding: '5px 12px' }}>+42 more</span>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div style={{ textAlign: 'center' }}>
              <Link href="/app/songs" className="btn btn-outline">BROWSE ALL SONGS</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* AI COACH DEMO */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>AI COACH</p>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Feedback that actually helps.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ padding: '28px 32px', background: 'var(--card-bg)', border: '0.5px solid rgba(34,197,94,0.25)', borderRadius: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.5), transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-dim)', border: '0.5px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                </div>
                <p className="eyebrow" style={{ fontSize: 9 }}>LARK AI COACH</p>
              </div>
              <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.8, fontStyle: 'italic' }}>
                {AI_FEEDBACK_EXAMPLE}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>EVERYTHING IN ONE PLACE</p>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Six tools. Zero downloads.
              </h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="features-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.eyebrow} delay={i * 0.06}>
                <Link href={f.href} className="hover-lift" style={{
                  display: 'block', padding: '24px 22px', background: 'var(--card-bg)',
                  border: '0.5px solid var(--border)', borderRadius: 14, height: '100%', textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.3), transparent)' }} />
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-dim)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '0.5px solid var(--accent-border)' }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                  </div>
                  <p className="eyebrow" style={{ marginBottom: 6 }}>{f.eyebrow}</p>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.01em' }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.65 }}>{f.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>HOW IT WORKS</p>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Three steps to better playing.
              </h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {STEPS.map((step, i) => (
              <Reveal key={step.num} delay={i * 0.09}>
                <div style={{ padding: '28px 24px', background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 16, height: '100%' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 38, fontWeight: 700, color: 'var(--accent)', lineHeight: 1, marginBottom: 18, letterSpacing: '-0.02em', textShadow: '0 0 20px rgba(34,197,94,0.4)' }}>{step.num}</p>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Reveal>
            <div style={{ padding: 'clamp(36px, 5vw, 56px)', background: 'var(--card-bg)', border: '0.5px solid rgba(34,197,94,0.25)', borderRadius: 20, textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 0 40px rgba(34,197,94,0.08), 0 8px 32px rgba(0,0,0,0.4)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.5), transparent)' }} />
              <p className="eyebrow" style={{ marginBottom: 16 }}>RUNS IN YOUR BROWSER</p>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.25, marginBottom: 14, letterSpacing: '-0.01em' }}>
                No app store. No cable. No paywall to try it.
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 32px' }}>
                Lark uses Web Audio API. Your mic audio never leaves your device. Works on desktop and mobile.
              </p>
              <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
                {['No download','No credit card','Audio stays on device','Works on any guitar'].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: '0.04em' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px 120px', textAlign: 'center' }}>
        <Reveal>
          <p className="eyebrow" style={{ marginBottom: 18 }}>GET STARTED</p>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: 600, margin: '0 auto 14px' }}>
            Start practicing in 30 seconds.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text3)', maxWidth: 420, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Free forever. Create an account to save your progress, library, and stats across devices.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <Link href="/app" className="btn btn-accent btn-lg" style={{ boxShadow: '0 0 24px rgba(34,197,94,0.3)' }}>OPEN APP FREE</Link>
            <Link href="/auth?mode=signup" className="btn btn-ghost btn-lg">CREATE ACCOUNT</Link>
          </div>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 20 }}>PRO FEATURES COMING SOON</p>
            <WaitlistForm />
          </div>
        </Reveal>
      </section>

      <style jsx>{`
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </main>
  );
}
