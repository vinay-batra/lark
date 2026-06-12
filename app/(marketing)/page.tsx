'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Reveal } from '@/components/Reveal';
import { WaitlistForm } from '@/components/WaitlistForm';
import { supabase } from '@/lib/supabase';

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
    title: '83 songs to follow along',
    desc: 'Scrolling tab with live pitch detection. Green when you nail it, red when you miss. Every note scored.',
    href: '/app/songs',
    icon: <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
  },
  {
    eyebrow: 'PRACTICE MODE',
    title: 'Slow it down, loop it, nail it',
    desc: 'Speed control at 0.5x, 0.75x, or 1x. Loop any section until it clicks. Next-note hints when you get stuck. On every song.',
    href: '/app/songs',
    icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  },
  {
    eyebrow: 'DAILY MISSIONS',
    title: 'Three missions. Ten levels of XP.',
    desc: 'New missions every day on your dashboard. Earn XP, climb 10 levels, reset at midnight. A reason to come back and play.',
    href: '/app',
    icon: <><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></>,
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
  { label: 'Beginner', color: 'var(--accent)', rgb: 'var(--accent-rgb)', count: 37 },
  { label: 'Intermediate', color: 'var(--diff-intermediate)', rgb: 'var(--diff-intermediate-rgb)', count: 24 },
  { label: 'Advanced', color: 'var(--diff-advanced)', rgb: 'var(--diff-advanced-rgb)', count: 12 },
  { label: 'Expert', color: 'var(--diff-expert)', rgb: 'var(--diff-expert-rgb)', count: 6 },
];

const AI_FEEDBACK_EXAMPLE = `"Nice run through Seven Nation Army. Your E string is clean and you nailed all 9 notes. Watch your intonation on the C -- you are consistently about 18 cents flat there, which suggests your index finger needs to sit closer to the fret. One tip: slow the tempo down to 60% and focus just on that C note until your muscle memory locks it in."`;


export default function LandingPage() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => { if (data.user) setSignedIn(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <main style={{ overflowX: 'hidden' }}>

      {/* HERO */}
      <section className="hero-section" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', padding: '40px 24px 60px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', width: '100%' }} className="hero-grid">

          {/* Left: text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.08, letterSpacing: '-0.01em', marginBottom: 32 }}>
              LISTEN-FIRST<br />
              <span style={{ color: 'var(--accent)', textShadow: '0 0 32px rgba(var(--accent-rgb),0.5)' }}>GUITAR COACHING</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.18 }}
              style={{ fontSize: 17, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 40, maxWidth: 440 }}>
              Lark hears every note you play, scores you in real time, and gives you AI coaching when you finish. Practice Mode, Daily Missions, and 83 songs -- all free.
            </motion.p>

            {/* Stats row */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, delay: 0.26 }}
              style={{ display: 'flex', gap: 28, marginBottom: 44, flexWrap: 'wrap', alignItems: 'baseline' }}>
              {[['83', 'songs'], ['10', 'XP levels'], ['PWA', 'installable'], ['Free', 'forever']].map(([val, label]) => (
                <div key={val} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{val}</span>
                  {label && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.14em' }}>{label.toUpperCase()}</span>}
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.32 }}
              style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link
                href={signedIn ? '/app' : '/auth?mode=signup'}
                className="btn btn-accent btn-lg"
                style={{ boxShadow: '0 0 24px rgba(var(--accent-rgb),0.3)' }}
              >
                {signedIn ? 'GO TO APP' : 'START PLAYING'}
              </Link>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.42 }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 22, letterSpacing: '0.08em' }}>
              NO CREDIT CARD · NO DOWNLOAD · WORKS IN YOUR BROWSER
            </motion.p>
          </div>

          {/* Right: mini tab demo */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hero-demo" style={{ position: 'relative' }}>
            <div style={{
              background: 'var(--card-bg)', border: '0.5px solid var(--border2)',
              borderRadius: 18, padding: '24px 20px', boxShadow: 'var(--shadow-lg)',
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
              <div style={{ textAlign: 'center', marginBottom: 16, padding: '14px 0 12px', background: 'var(--bg3)', borderRadius: 10, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 55%, rgba(var(--accent-rgb),0.08) 0%, transparent 100%)', pointerEvents: 'none' }} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.2em', marginBottom: 4 }}>PLAY NOW</p>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 2 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 52, fontWeight: 700, color: 'var(--accent)', lineHeight: 1, textShadow: '0 0 28px rgba(var(--accent-rgb),0.4)' }}>G</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--accent)', opacity: 0.5, marginTop: 8 }}>4</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 6 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>e string -- fret 3</p>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, color: 'var(--accent)', background: 'rgba(var(--accent-rgb),0.12)', border: '0.5px solid var(--accent-border)', borderRadius: 99, padding: '2px 7px', letterSpacing: '0.08em', animation: 'pulse 2s ease-in-out infinite' }}>ON BEAT</span>
                </div>
              </div>

              {/* Tab ribbon */}
              {(() => {
                const TAB_STRINGS = ['e','B','G','D','A','E'];
                const DEMO_NOTES = [
                  {si:4,ci:0,fret:7,state:'past'},
                  {si:4,ci:1,fret:7,state:'hit'},
                  {si:0,ci:2,fret:0,state:'hit'},
                  {si:0,ci:3,fret:3,state:'current'},
                  {si:4,ci:4,fret:10,state:'future'},
                  {si:4,ci:5,fret:7,state:'future'},
                  {si:4,ci:6,fret:5,state:'far'},
                  {si:5,ci:7,fret:3,state:'far'},
                  {si:5,ci:8,fret:2,state:'far'},
                ];
                const noteAt = (si: number, ci: number) => DEMO_NOTES.find(n => n.si === si && n.ci === ci);
                return (
                  <div style={{ background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 116, top: 8, bottom: 8, width: 1.5, background: 'var(--accent)', borderRadius: 1, opacity: 0.6, boxShadow: '0 0 8px rgba(var(--accent-rgb),0.35)', pointerEvents: 'none' }} />
                    {TAB_STRINGS.map((str, si) => (
                      <div key={str} style={{ display: 'flex', alignItems: 'center', height: 20 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', width: 14, textAlign: 'right', marginRight: 6, flexShrink: 0 }}>{str}</span>
                        {Array.from({length: 9}).map((_, ci) => {
                          const note = noteAt(si, ci);
                          const isPast = note?.state === 'past';
                          const isHit = note?.state === 'hit';
                          const isCurrent = note?.state === 'current';
                          const isFar = note?.state === 'far';
                          const noteColor = isCurrent ? 'var(--accent)' : isHit ? 'var(--accent)' : isPast ? 'var(--text-muted)' : isFar ? 'var(--text3)' : 'var(--text2)';
                          const noteBg = isCurrent ? 'var(--accent-dim)' : isHit ? 'rgba(var(--accent-rgb),0.08)' : 'var(--card-bg)';
                          return (
                            <div key={ci} style={{ width: 28, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0, opacity: isPast ? 0.3 : isFar ? 0.55 : 1 }}>
                              <div style={{ position: 'absolute', left: 0, right: 0, height: '1px', background: 'var(--border2)' }} />
                              {note && (
                                <span style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--font-mono)', fontSize: isCurrent ? 12 : 11, fontWeight: 700, color: noteColor, background: noteBg, padding: '0 2px', borderRadius: 2, boxShadow: `0 0 0 ${isCurrent ? '1.5px' : '1px'} ${noteColor}`, animation: isCurrent ? 'pulse 1.4s ease-out infinite' : undefined }}>{note.fret}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              })()}

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
          .hero-section { padding: 40px 20px 60px !important; min-height: unset !important; }
        }
      `}</style>

      {/* SONG LIBRARY */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>SONG LIBRARY</p>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 14 }}>
                83 songs. 4 difficulty levels.
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
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', background: 'var(--card-bg)', border: `0.5px solid rgba(${d.rgb}, 0.25)`, borderRadius: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, boxShadow: `0 0 8px rgba(${d.rgb}, 0.5)` }} />
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
                Eight tools. Zero downloads.
              </h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="features-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.eyebrow} delay={i * 0.06}>
                <Link href={f.href} className="hover-lift" style={{
                  display: 'block', padding: '24px 22px', background: 'var(--card-bg)',
                  border: '0.5px solid var(--border)', borderRadius: 14, height: '100%', textDecoration: 'none',
                  boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden',
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
