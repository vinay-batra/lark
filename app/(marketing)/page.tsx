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
  },
  {
    eyebrow: 'CHORD DETECTOR',
    title: 'Hears any chord',
    desc: 'Play a chord. Lark identifies it from your mic via chromagram analysis, with alternatives.',
    href: '/app/chords',
  },
  {
    eyebrow: 'SONG MODE',
    title: '83 songs to follow along',
    desc: 'Scrolling tab with live pitch detection. Green when you nail it, red when you miss. Every note scored.',
    href: '/app/songs',
  },
  {
    eyebrow: 'PRACTICE MODE',
    title: 'Slow it down, loop it, nail it',
    desc: 'Speed control at 0.5x, 0.75x, or 1x. Loop any section until it clicks. Next-note hints when you get stuck.',
    href: '/app/songs',
  },
  {
    eyebrow: 'DAILY MISSIONS',
    title: 'Three missions. Ten levels of XP.',
    desc: 'New missions every day on your dashboard. Earn XP, climb 10 levels, reset at midnight. A reason to come back.',
    href: '/app',
  },
  {
    eyebrow: 'AI COACH',
    title: 'Feedback that means something',
    desc: 'After each song, Claude analyzes your accuracy and intonation. Specific, actionable coaching, not just a score.',
    href: '/app/songs',
  },
  {
    eyebrow: 'CHORD LIBRARY',
    title: '120+ chord diagrams',
    desc: 'Every open chord, barre chord, seventh, and power chord with fingering diagrams. The reference you will use.',
    href: '/app/chord-library',
  },
  {
    eyebrow: 'METRONOME',
    title: 'Keep perfect time',
    desc: 'Precision Web Audio metronome with tap tempo, time signatures, and beat accent. Practice at any tempo.',
    href: '/app/metronome',
  },
];

const DIFFICULTY_LABELS = [
  { label: 'Beginner', color: 'var(--accent)', count: 37 },
  { label: 'Intermediate', color: 'var(--diff-intermediate)', count: 24 },
  { label: 'Advanced', color: 'var(--diff-advanced)', count: 12 },
  { label: 'Expert', color: 'var(--diff-expert)', count: 6 },
];

const SAMPLE_SONGS = ['Smoke on the Water', 'Mr. Brightside', 'Nothing Else Matters', 'Thunderstruck', 'Stairway to Heaven', 'Comfortably Numb', 'Master of Puppets', 'Through the Fire and Flames'];

const AI_FEEDBACK_EXAMPLE = `Nice run through Seven Nation Army. Your E string is clean and you nailed all 9 notes. Watch your intonation on the C, you are consistently about 18 cents flat there, which suggests your index finger needs to sit closer to the fret. One tip: slow the tempo to 60% and focus just on that C note until your muscle memory locks it in.`;

const HERO_STATS: [string, string][] = [['83', 'songs'], ['10', 'XP levels'], ['PWA', 'installable'], ['Free', 'forever']];

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

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
      <section className="ed-hero">
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }} className="ed-hero-title">
          LISTEN-FIRST<br />
          <span className="ed-accent">GUITAR COACHING</span>
        </motion.h1>

        <div className="ed-hero-body">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }} className="ed-hero-left">
            <p className="ed-hero-sub">
              Lark hears every note you play, scores you in real time, and gives you AI coaching when you finish. Practice Mode, Daily Missions, and 83 songs, all free.
            </p>

            <div className="ed-hero-actions">
              <Link href={signedIn ? '/app' : '/auth?mode=signup'} className="btn btn-accent btn-lg" style={{ boxShadow: '0 0 24px rgba(var(--accent-rgb),0.3)' }}>
                {signedIn ? 'GO TO APP' : 'START PLAYING'}
              </Link>
            </div>

            <div className="ed-hero-stats">
              {HERO_STATS.map(([val, label]) => (
                <div key={val} className="ed-stat">
                  <span className="ed-stat-val">{val}</span>
                  <span className="ed-stat-label">{label.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Offset product shot */}
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }} className="ed-hero-plate">
            <div style={{ background: 'var(--card-bg)', border: '0.5px solid var(--border2)', borderRadius: 18, padding: '24px 20px', boxShadow: 'var(--shadow-lg)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(var(--accent-rgb),0.5), transparent)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <p className="eyebrow" style={{ fontSize: 8, marginBottom: 3 }}>SONG MODE</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Seven Nation Army</p>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>78%</span>
              </div>

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

              {(() => {
                const TAB_STRINGS = ['e', 'B', 'G', 'D', 'A', 'E'];
                const DEMO_NOTES = [
                  { si: 4, ci: 0, fret: 7, state: 'past' },
                  { si: 4, ci: 1, fret: 7, state: 'hit' },
                  { si: 0, ci: 2, fret: 0, state: 'hit' },
                  { si: 0, ci: 3, fret: 3, state: 'current' },
                  { si: 4, ci: 4, fret: 10, state: 'future' },
                  { si: 4, ci: 5, fret: 7, state: 'future' },
                  { si: 4, ci: 6, fret: 5, state: 'far' },
                  { si: 5, ci: 7, fret: 3, state: 'far' },
                  { si: 5, ci: 8, fret: 2, state: 'far' },
                ];
                const noteAt = (si: number, ci: number) => DEMO_NOTES.find(n => n.si === si && n.ci === ci);
                return (
                  <div style={{ background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 116, top: 8, bottom: 8, width: 1.5, background: 'var(--accent)', borderRadius: 1, opacity: 0.6, boxShadow: '0 0 8px rgba(var(--accent-rgb),0.35)', pointerEvents: 'none' }} />
                    {TAB_STRINGS.map((str, si) => (
                      <div key={str} style={{ display: 'flex', alignItems: 'center', height: 20 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', width: 14, textAlign: 'right', marginRight: 6, flexShrink: 0 }}>{str}</span>
                        {Array.from({ length: 9 }).map((_, ci) => {
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

              <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg3)', borderRadius: 10, borderLeft: '2px solid var(--accent)' }}>
                <p className="eyebrow" style={{ fontSize: 8, marginBottom: 5 }}>AI COACH</p>
                <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                  Clean playing overall. Your B string open notes are slightly sharp, about 14 cents. Try lightening your fretting hand pressure.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 01 - THE LIBRARY */}
      <section className="ed-section">
        <Reveal>
          <div className="ed-rule" />
          <div className="ed-head">
            <span className="ed-num">01</span>
            <span className="ed-label">The library</span>
          </div>
          <h2 className="ed-title">83 songs.<br />Four levels.</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="ed-lib">
            <p className="ed-lead">
              From Twinkle Twinkle to Master of Puppets. Every song scored note by note, with AI tab generation for anything not yet in the library.
            </p>
            <div className="ed-diff">
              {DIFFICULTY_LABELS.map(d => (
                <div key={d.label} className="ed-diff-item">
                  <span className="ed-diff-count" style={{ color: d.color }}>{d.count}</span>
                  <span className="ed-diff-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="ed-songs">
            {SAMPLE_SONGS.map((s, i) => (
              <span key={s}>
                {s}
                {i < SAMPLE_SONGS.length - 1 && <span className="ed-songs-sep">/</span>}
              </span>
            ))}
            <span className="ed-songs-more">+42 more</span>
          </p>
        </Reveal>
      </section>

      {/* 02 - THE COACH */}
      <section className="ed-section">
        <Reveal>
          <div className="ed-rule" />
          <div className="ed-head">
            <span className="ed-num">02</span>
            <span className="ed-label">The coach</span>
          </div>
          <h2 className="ed-title">Feedback that<br />means something.</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <blockquote className="ed-quote">{AI_FEEDBACK_EXAMPLE}</blockquote>
          <p className="ed-quote-by">Lark AI Coach, after a take</p>
        </Reveal>
      </section>

      {/* 03 - THE TOOLKIT */}
      <section className="ed-section">
        <Reveal>
          <div className="ed-rule" />
          <div className="ed-head">
            <span className="ed-num">03</span>
            <span className="ed-label">The toolkit</span>
          </div>
          <h2 className="ed-title">Eight tools.<br />Zero downloads.</h2>
        </Reveal>
        <div className="ed-index">
          {FEATURES.map((f, i) => (
            <Reveal key={f.eyebrow} delay={Math.min(i * 0.04, 0.2)}>
              <Link href={f.href} className="ed-row">
                <span className="ed-row-idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="ed-row-name">{f.eyebrow}</span>
                <span className="ed-row-cell">
                  <span className="ed-row-title">{f.title}</span>
                  <span className="ed-row-desc">{f.desc}</span>
                </span>
                <span className="ed-row-arrow" aria-hidden="true"><ArrowIcon /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 04 - GET STARTED */}
      <section className="ed-section ed-finale">
        <Reveal>
          <div className="ed-rule" />
          <div className="ed-head">
            <span className="ed-num">04</span>
            <span className="ed-label">Get started</span>
          </div>
          <h2 className="ed-title ed-title-lg">Start practicing<br />in 30 seconds.</h2>
          <p className="ed-lead" style={{ maxWidth: 460 }}>
            Free forever. Create an account to save your progress, library, and stats across devices.
          </p>
          <div className="ed-finale-cta">
            <Link href="/app" className="btn btn-accent btn-lg" style={{ boxShadow: '0 0 24px rgba(var(--accent-rgb),0.3)' }}>OPEN APP FREE</Link>
            <Link href="/auth?mode=signup" className="btn btn-ghost btn-lg">CREATE ACCOUNT</Link>
          </div>
          <div className="ed-waitlist">
            <p className="ed-waitlist-label">PRO FEATURES COMING SOON</p>
            <WaitlistForm />
          </div>
        </Reveal>
      </section>

      <style jsx global>{`
        .ed-hero {
          max-width: 1120px;
          margin: 0 auto;
          padding: clamp(40px, 8vh, 92px) 24px clamp(64px, 9vh, 104px);
        }
        .ed-hero-title {
          font-family: var(--font-mono);
          font-size: clamp(34px, 7vw, 78px);
          font-weight: 700;
          color: var(--text);
          line-height: 1.02;
          letter-spacing: -0.04em;
          margin-bottom: clamp(36px, 5vw, 56px);
        }
        .ed-accent { color: var(--accent); text-shadow: 0 0 36px rgba(var(--accent-rgb),0.45); }
        .ed-hero-body {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(0, 1fr);
          gap: clamp(32px, 5vw, 64px);
          align-items: start;
        }
        .ed-hero-left { display: flex; flex-direction: column; gap: 32px; }
        .ed-hero-sub {
          font-size: 17px;
          color: var(--text2);
          line-height: 1.75;
          max-width: 440px;
        }
        .ed-hero-actions { display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
        .ed-hero-stats { display: flex; gap: clamp(22px, 3vw, 34px); flex-wrap: wrap; align-items: baseline; }
        .ed-stat { display: flex; flex-direction: column; gap: 4px; }
        .ed-stat-val { font-family: var(--font-mono); font-size: 26px; font-weight: 700; color: var(--accent); line-height: 1; }
        .ed-stat-label { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); letter-spacing: 0.14em; }
        .ed-hero-plate { margin-top: 18px; margin-right: clamp(-64px, -4vw, 0px); }

        .ed-section { max-width: 1120px; margin: 0 auto; padding: clamp(68px, 11vh, 128px) 24px 0; }
        .ed-finale { padding-bottom: clamp(96px, 14vh, 150px); }
        .ed-rule { height: 0; border-top: 0.5px solid var(--border); margin-bottom: 26px; }
        .ed-head { display: flex; align-items: baseline; gap: 16px; margin-bottom: clamp(22px, 3vw, 32px); }
        .ed-num { font-family: var(--font-mono); font-size: clamp(22px, 3.2vw, 36px); font-weight: 700; color: var(--accent); letter-spacing: -0.02em; line-height: 1; }
        .ed-label { font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.24em; color: var(--text-muted); text-transform: uppercase; }
        .ed-title { font-family: var(--font-mono); font-size: clamp(30px, 5.4vw, 62px); font-weight: 700; color: var(--text); line-height: 1.05; letter-spacing: -0.03em; margin-bottom: clamp(28px, 4vw, 44px); }
        .ed-title-lg { font-size: clamp(32px, 6vw, 72px); }
        .ed-lead { font-size: 17px; color: var(--text3); line-height: 1.7; max-width: 520px; }

        .ed-lib { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(32px, 5vw, 56px); align-items: end; }
        .ed-diff { display: flex; gap: clamp(24px, 4vw, 46px); flex-wrap: wrap; }
        .ed-diff-item { display: flex; flex-direction: column; gap: 6px; }
        .ed-diff-count { font-family: var(--font-mono); font-size: clamp(30px, 4.2vw, 48px); font-weight: 700; line-height: 1; }
        .ed-diff-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.18em; color: var(--text-muted); text-transform: uppercase; }
        .ed-songs { margin-top: clamp(40px, 6vw, 64px); font-family: var(--font-mono); font-size: 13px; color: var(--text3); line-height: 2.1; }
        .ed-songs-sep { color: var(--text-muted); margin: 0 11px; }
        .ed-songs-more { color: var(--text-muted); margin-left: 11px; }

        .ed-quote { font-size: clamp(20px, 2.6vw, 31px); color: var(--text2); line-height: 1.5; max-width: 860px; border-left: 2px solid var(--accent); padding-left: clamp(20px, 3vw, 40px); margin: 0 0 22px; }
        .ed-quote-by { font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.22em; color: var(--accent); text-transform: uppercase; padding-left: clamp(20px, 3vw, 40px); }

        .ed-index { border-top: 0.5px solid var(--border); }
        .ed-row { display: grid; grid-template-columns: 40px minmax(130px, 200px) minmax(0, 1fr) 22px; align-items: baseline; gap: clamp(14px, 2vw, 28px); padding: clamp(18px, 2.4vw, 24px) 6px; border-bottom: 0.5px solid var(--border); text-decoration: none; transition: background 0.18s ease, padding 0.18s ease; }
        .ed-row:hover { background: rgba(var(--accent-rgb), 0.04); padding-left: 14px; padding-right: 14px; }
        .ed-row-idx { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
        .ed-row-name { font-family: var(--font-mono); font-size: clamp(14px, 1.6vw, 18px); font-weight: 700; color: var(--text); letter-spacing: -0.01em; transition: color 0.18s ease; }
        .ed-row:hover .ed-row-name { color: var(--accent); }
        .ed-row-cell { display: flex; flex-direction: column; gap: 4px; }
        .ed-row-title { font-size: 14px; font-weight: 600; color: var(--text2); }
        .ed-row-desc { font-size: 13px; color: var(--text-muted); line-height: 1.6; }
        .ed-row-arrow { color: var(--text-muted); opacity: 0; transform: translateX(-6px); transition: opacity 0.18s ease, transform 0.18s ease, color 0.18s ease; display: flex; align-items: center; }
        .ed-row:hover .ed-row-arrow { opacity: 1; transform: translateX(0); color: var(--accent); }

        .ed-finale-cta { display: flex; gap: 14px; flex-wrap: wrap; margin-top: clamp(32px, 4vw, 44px); }
        .ed-waitlist { max-width: 480px; margin-top: clamp(44px, 6vw, 64px); }
        .ed-waitlist-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); letter-spacing: 0.1em; margin-bottom: 18px; }

        @media (max-width: 900px) {
          .ed-hero-body { grid-template-columns: 1fr; }
          .ed-hero-plate { display: none; }
        }
        @media (max-width: 768px) {
          .ed-hero { padding: 36px 20px 60px; }
          .ed-section { padding: 64px 20px 0; }
          .ed-lib { grid-template-columns: 1fr; gap: 32px; align-items: start; }
          .ed-row { grid-template-columns: 30px minmax(0, 1fr); row-gap: 8px; column-gap: 14px; }
          .ed-row-cell { grid-column: 1 / -1; }
          .ed-row-arrow { display: none; }
          .ed-row:hover { padding-left: 6px; padding-right: 6px; }
        }
      `}</style>
    </main>
  );
}
