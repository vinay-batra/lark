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
    title: '73 songs to follow along',
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


export default function LandingPage() {
  return (
    <main style={{ overflowX: 'hidden' }}>

      {/* HERO */}
      <section style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', padding: '80px 24px 100px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', width: '100%' }} className="hero-grid">

          {/* Left: text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s ease-in-out infinite', boxShadow: '0 0 8px rgba(var(--accent-rgb),0.8)' }} />
              <p className="eyebrow" style={{ fontSize: 9 }}>LISTEN-FIRST GUITAR COACHING</p>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(42px, 6vw, 72px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 32 }}>
              Practice<br />
              <span style={{ color: 'var(--accent)', textShadow: '0 0 32px rgba(var(--accent-rgb),0.5)' }}>smarter.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.18 }}
              style={{ fontSize: 17, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 40, maxWidth: 440 }}>
              Lark hears every note you play, scores you in real time, and gives you AI coaching when you finish. 73 songs, 4 difficulty levels, free.
            </motion.p>

            {/* Stats row */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, delay: 0.26 }}
              style={{ display: 'flex', gap: 28, marginBottom: 44, flexWrap: 'wrap', alignItems: 'baseline' }}>
              {[['73', 'songs'], ['4', 'levels'], ['7', 'tools'], ['Free', '']].map(([val, label]) => (
                <div key={val} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{val}</span>
                  {label && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.14em' }}>{label.toUpperCase()}</span>}
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.32 }}
              style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/app" className="btn btn-accent btn-lg" style={{ boxShadow: '0 0 24px rgba(var(--accent-rgb),0.3)' }}>
                START PLAYING
              </Link>
              <Link href="/auth?mode=signup" className="btn btn-ghost btn-lg">
                CREATE ACCOUNT
              </Link>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.42 }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 22, letterSpacing: '0.08em' }}>
              NO CREDIT CARD -- NO DOWNLOAD -- WORKS IN YOUR BROWSER
            </motion.p>
          </div>

          {/* Right: mini tab demo */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hero-demo" style={{ position: 'relative' }}>
            <div style={{
              background: 'var(--card-bg)', border: '0.5px solid var(--border2)',
              borderRadius: 18, padding: '24px 20px', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 0.5px var(--border)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(var(--accent-rgb),0.5), transparent)' }} />

              {/* App header mock */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <p className="eyebrow" style={{ fontSize: 8, marginBottom: 3 }}>SONG MODE</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Seven Nation Army</p>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>78%</span>
              </div>

              {/* Current note */}
              <div style={{ textAlign: 'center', marginBottom: 20, padding: '16px 0', background: 'var(--bg3)', borderRadius: 10 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.2em', marginBottom: 6 }}>PLAY NOW</p>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 48, fontWeight: 700, color: 'var(--accent)', lineHeight: 1, textShadow: '0 0 24px rgba(var(--accent-rgb),0.5)' }}>G</div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>e string -- fret 3</p>
              </div>

              {/* Tab ribbon */}
              <div style={{ background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                {['e','B','G','D','A','E'].map((str, si) => (
                  <div key={str} style={{ display: 'flex', alignItems: 'center', height: 22 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', width: 14, textAlign: 'right', marginRight: 6 }}>{str}</span>
                    {[
                      [true, false, false, false, false, false, false, false, false, false], // e: hit fret 0
                      [false, false, true, false, false, false, false, false, false, false], // B: current fret 0
                      [false, false, false, false, false, false, false, false, false, false],
                      [false, false, false, false, false, false, false, false, false, false],
                      [false, false, false, false, false, false, false, false, false, false],
                      [false, false, false, false, false, false, false, false, false, false],
                    ][si].map((active, ci) => (
                      <div key={ci} style={{ width: 28, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', left: 0, right: 0, height: '0.5px', background: 'var(--border)' }} />
                        {active && ci === 0 && (
                          <span style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'var(--card-bg)', padding: '0 2px', boxShadow: '0 0 0 1.5px var(--accent)' }}>0</span>
                        )}
                        {ci === 2 && si === 0 && (
                          <span style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--text)', background: 'var(--bg3)', padding: '0 2px', boxShadow: '0 0 0 1.5px var(--accent)', animation: 'pulse 1.4s ease-out infinite' }}>3</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* AI coach preview */}
              <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg3)', borderRadius: 10, borderLeft: '2px solid var(--accent)' }}>
                <p className="eyebrow" style={{ fontSize: 8, marginBottom: 5 }}>AI COACH</p>
                <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                  Clean playing overall. Your B string open notes are slightly sharp -- about 14 cents. Try lightening your fretting hand pressure.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hero-demo { display: none !important; }
        }
      `}</style>

      {/* SONG LIBRARY */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>SONG LIBRARY</p>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 14 }}>
                73 songs. 4 difficulty levels.
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
            <div style={{ padding: '28px 32px', background: 'var(--card-bg)', border: '0.5px solid rgba(var(--accent-rgb),0.25)', borderRadius: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(var(--accent-rgb),0.5), transparent)' }} />
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
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(var(--accent-rgb),0.3), transparent)' }} />
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
      {/* TRUST */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Reveal>
            <div style={{ padding: 'clamp(36px, 5vw, 56px)', background: 'var(--card-bg)', border: '0.5px solid rgba(var(--accent-rgb),0.25)', borderRadius: 20, textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 0 40px rgba(var(--accent-rgb),0.08), 0 8px 32px rgba(0,0,0,0.4)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(var(--accent-rgb),0.5), transparent)' }} />
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
            <Link href="/app" className="btn btn-accent btn-lg" style={{ boxShadow: '0 0 24px rgba(var(--accent-rgb),0.3)' }}>OPEN APP FREE</Link>
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
