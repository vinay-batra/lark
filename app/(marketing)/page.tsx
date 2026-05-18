'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Reveal } from '@/components/Reveal';

const FEATURES = [
  {
    eyebrow: 'TUNER',
    title: 'Pitch-perfect, instantly',
    desc: 'Real-time pitch detection that updates every 16ms. Hit the green zone, you are in tune.',
    href: '/tuner',
    available: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h3l3-9 4 18 3-9 3 5 4-5"/>
      </svg>
    ),
  },
  {
    eyebrow: 'CHORD DETECTOR',
    title: 'Hears any chord',
    desc: 'Play any chord. Lark identifies it via chromagram FFT, shows the notes and alternatives.',
    href: '/chords',
    available: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="12" rx="2"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="3" y1="14" x2="21" y2="14"/>
        <line x1="8" y1="6" x2="8" y2="18"/>
        <line x1="14" y1="6" x2="14" y2="18"/>
      </svg>
    ),
  },
  {
    eyebrow: 'SONG MODE',
    title: 'Follow along, anywhere',
    desc: 'Scrolling tab + score following. Speeds up and slows down to match how you play.',
    href: '/app',
    available: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 9 6 21 9 21 18"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="18" r="3"/>
      </svg>
    ),
  },
  {
    eyebrow: 'AI COACH',
    title: 'Feedback that means something',
    desc: 'Not just right or wrong. "Your G string is muted, fix your finger curl." Like a teacher.',
    href: '/app',
    available: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    ),
  },
];

const STEPS = [
  { num: '01', title: 'Allow your mic', desc: 'One-click permission. Lark only listens while you have the page open.' },
  { num: '02', title: 'Pick up your guitar', desc: 'Acoustic, electric, classical. Works with whatever you play.' },
  { num: '03', title: 'Get instant feedback', desc: 'Notes, chords, timing, technique. Real coaching, not just a green light.' },
];

export default function LandingPage() {
  return (
    <main>
      {/* ─── HERO ─── */}
      <section style={{
        position: 'relative',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px 80px',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.18) 0%, transparent 70%)',
          top: '-30%',
          right: '-15%',
          animation: 'float 8s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.1) 0%, transparent 70%)',
          bottom: '-20%',
          left: '-10%',
          animation: 'float 10s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 920, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="eyebrow"
            style={{ marginBottom: 26 }}
          >
            <span style={{
              display: 'inline-block',
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--accent)',
              marginRight: 8,
              verticalAlign: 'middle',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            LISTEN-FIRST GUITAR COACHING
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(40px, 8vw, 88px)',
              fontWeight: 700,
              color: 'var(--text)',
              lineHeight: 1.04,
              marginBottom: 26,
              letterSpacing: '-0.03em',
            }}
          >
            The guitar tutor<br />
            <span style={{ color: 'var(--accent)' }}>that listens.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            style={{
              fontSize: 'clamp(15px, 2vw, 19px)',
              color: 'var(--text2)',
              lineHeight: 1.65,
              maxWidth: 620,
              margin: '0 auto 44px',
            }}
          >
            Lark hears every note you play. Tune your guitar, detect chords, follow songs in real time, and get coaching feedback that actually means something. All in your browser.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/app" className="btn btn-accent btn-lg">
              OPEN APP
            </Link>
            <Link href="/auth?mode=signup" className="btn btn-outline btn-lg">
              CREATE ACCOUNT
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              marginTop: 64,
              display: 'flex',
              gap: 32,
              justifyContent: 'center',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {[
              { val: 'Real-time', label: 'PITCH DETECTION' },
              { val: 'Browser-native', label: 'NO DOWNLOADS' },
              { val: 'Free', label: 'TO START' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                  {s.val}
                </div>
                <div className="eyebrow" style={{ marginTop: 4, opacity: 0.6 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section style={{ padding: '120px 24px', position: 'relative' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 72 }}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>BUILT FOR GUITARISTS</p>
              <h2 style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 700,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                marginBottom: 16,
              }}>
                Everything you need to practice.
              </h2>
              <p style={{ fontSize: 16, color: 'var(--text3)', maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
                Four tools, all powered by the audio coming in from your mic. Two are live today. Two are coming soon.
              </p>
            </div>
          </Reveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.eyebrow} delay={i * 0.08}>
                <Link
                  href={f.available ? f.href : '#'}
                  style={{
                    display: 'block',
                    padding: '28px 26px',
                    background: 'var(--card-bg)',
                    border: '0.5px solid var(--border)',
                    borderRadius: 16,
                    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                    height: '100%',
                    cursor: f.available ? 'pointer' : 'default',
                    pointerEvents: f.available ? 'auto' : 'none',
                    opacity: f.available ? 1 : 0.78,
                  }}
                  className={f.available ? 'hover-lift' : ''}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--accent-dim)',
                    color: 'var(--accent)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 22,
                    border: '0.5px solid var(--accent-border)',
                  }}>
                    {f.icon}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <p className="eyebrow">{f.eyebrow}</p>
                    {!f.available && (
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        color: 'var(--text-muted)',
                        background: 'var(--bg3)',
                        padding: '2px 8px',
                        borderRadius: 99,
                        letterSpacing: '0.1em',
                      }}>
                        SOON
                      </span>
                    )}
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 19,
                    fontWeight: 700,
                    color: 'var(--text)',
                    marginBottom: 10,
                    letterSpacing: '-0.01em',
                  }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.65 }}>
                    {f.desc}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ padding: '120px 24px', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 72 }}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>HOW IT WORKS</p>
              <h2 style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 700,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}>
                Three steps to better playing.
              </h2>
            </div>
          </Reveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
            maxWidth: 920,
            margin: '0 auto',
          }}>
            {STEPS.map((step, i) => (
              <Reveal key={step.num} delay={i * 0.1}>
                <div style={{
                  padding: '28px 26px',
                  background: 'var(--card-bg)',
                  border: '0.5px solid var(--border)',
                  borderRadius: 16,
                  height: '100%',
                  position: 'relative',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 38,
                    fontWeight: 700,
                    color: 'var(--accent)',
                    lineHeight: 1,
                    marginBottom: 18,
                    letterSpacing: '-0.02em',
                  }}>
                    {step.num}
                  </p>
                  <h3 style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--text)',
                    marginBottom: 10,
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.65 }}>
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST / DETAILS ─── */}
      <section style={{ padding: '120px 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <Reveal>
            <div style={{
              padding: 'clamp(40px, 6vw, 64px)',
              background: 'var(--card-bg)',
              border: '0.5px solid var(--border)',
              borderRadius: 20,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: 480,
                height: 480,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <p className="eyebrow" style={{ marginBottom: 14, position: 'relative' }}>POWERED BY YOUR BROWSER</p>
              <h2 style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 700,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                marginBottom: 18,
                position: 'relative',
              }}>
                No downloads. No cables. No paywalls to try it.
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 32px', position: 'relative' }}>
                Lark runs entirely in your browser using the Web Audio API. Your audio never leaves your device. Open the tuner, give it mic permission, and play.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                <Link href="/tuner" className="btn btn-accent btn-lg">
                  OPEN TUNER
                </Link>
                <Link href="/chords" className="btn btn-outline btn-lg">
                  DETECT CHORDS
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section style={{ padding: '100px 24px 140px', textAlign: 'center' }}>
        <Reveal>
          <p className="eyebrow" style={{ marginBottom: 22 }}>READY?</p>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            lineHeight: 1.08,
            marginBottom: 26,
            maxWidth: 720,
            margin: '0 auto 26px',
          }}>
            Pick up your guitar. Lark is listening.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text3)', maxWidth: 480, margin: '0 auto 38px', lineHeight: 1.6 }}>
            Free to start. Sign up to track progress and unlock AI feedback when it ships.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/app" className="btn btn-accent btn-lg">OPEN APP</Link>
            <Link href="/auth?mode=signup" className="btn btn-outline btn-lg">CREATE ACCOUNT</Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
