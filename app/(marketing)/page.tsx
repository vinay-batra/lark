'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Reveal } from '@/components/Reveal';
import { WaitlistForm } from '@/components/WaitlistForm';

const FEATURES = [
  {
    eyebrow: 'TUNER',
    title: 'Pitch-perfect, instantly',
    desc: 'Real-time pitch detection. Hit the green zone, you are in tune.',
    href: '/app/tuner',
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
    desc: 'Play any chord. Lark identifies it via chromagram analysis and shows alternatives.',
    href: '/app/chords',
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
    desc: 'Scrolling tab with score following. Adapts to your tempo in real time.',
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
    desc: 'Not just right or wrong. "Your G string is muted, fix your finger curl." Like a real teacher.',
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
  { num: '01', title: 'Allow your mic', desc: 'One click. Lark only listens while the page is open.' },
  { num: '02', title: 'Pick up your guitar', desc: 'Acoustic, electric, or classical. Whatever you play.' },
  { num: '03', title: 'Get instant feedback', desc: 'Notes, chords, timing. Real coaching, not just a green light.' },
];

export default function LandingPage() {
  return (
    <main>
      {/* HERO */}
      <section style={{
        position: 'relative',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px 80px',
        overflow: 'hidden',
      }}>
        {/* Orbs — more vibrant */}
        <div style={{ position: 'absolute', width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.22) 0%, transparent 65%)', top: '-28%', right: '-14%', animation: 'float 8s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.14) 0%, transparent 65%)', bottom: '-18%', left: '-10%', animation: 'float 11s ease-in-out infinite reverse', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)', top: '30%', left: '5%', animation: 'float 14s ease-in-out infinite', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 860, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="eyebrow"
            style={{ marginBottom: 28 }}
          >
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', marginRight: 9, verticalAlign: 'middle', animation: 'pulse 2s ease-in-out infinite', boxShadow: '0 0 10px rgba(34,197,94,0.7)' }} />
            LISTEN-FIRST GUITAR COACHING
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(42px, 8vw, 88px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.04, marginBottom: 24, letterSpacing: '-0.03em' }}
          >
            The guitar tutor<br />
            <span style={{ color: 'var(--accent)', textShadow: '0 0 40px rgba(34,197,94,0.4)' }}>that listens.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text2)', lineHeight: 1.65, maxWidth: 560, margin: '0 auto 40px' }}
          >
            Lark hears every note you play. Tune, detect chords, follow songs, and get coaching that actually means something. All in your browser.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
          >
            <Link href="/app" className="btn btn-accent btn-lg" style={{ boxShadow: '0 0 28px rgba(34,197,94,0.35), 0 4px 16px rgba(0,0,0,0.3)' }}>
              OPEN APP
            </Link>
            <Link href="/auth?mode=signup" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: '0.08em' }}>
              or create a free account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)', top: '10%', left: '-15%', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>BUILT FOR GUITARISTS</p>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Everything you need to practice.
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="features-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.eyebrow} delay={i * 0.07}>
                <div style={{
                  padding: '26px 24px',
                  background: 'var(--card-bg)',
                  border: f.available ? '0.5px solid rgba(34,197,94,0.2)' : '0.5px solid var(--border)',
                  borderRadius: 16,
                  height: '100%',
                  opacity: f.available ? 1 : 0.65,
                  boxShadow: f.available ? '0 0 20px rgba(34,197,94,0.06), 0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {f.available && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent)' }} />
                  )}
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(34,197,94,0.12)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, border: '0.5px solid rgba(34,197,94,0.3)', boxShadow: '0 0 16px rgba(34,197,94,0.15)' }}>
                    {f.icon}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <p className="eyebrow">{f.eyebrow}</p>
                    {!f.available && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', background: 'var(--bg3)', padding: '2px 8px', borderRadius: 99, letterSpacing: '0.1em' }}>
                        SOON
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.01em' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.09) 0%, transparent 70%)', top: '0%', right: '-12%', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }}>
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
                <div style={{
                  padding: '28px 24px',
                  background: 'var(--card-bg)',
                  border: '0.5px solid var(--border)',
                  borderRadius: 16,
                  height: '100%',
                }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 38, fontWeight: 700, color: 'var(--accent)', lineHeight: 1, marginBottom: 18, letterSpacing: '-0.02em', textShadow: '0 0 20px rgba(34,197,94,0.4)' }}>
                    {step.num}
                  </p>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Reveal>
            <div style={{
              padding: 'clamp(36px, 5vw, 56px)',
              background: 'var(--card-bg)',
              border: '0.5px solid rgba(34,197,94,0.25)',
              borderRadius: 20,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 40px rgba(34,197,94,0.08), 0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.5), transparent)' }} />
              <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-30%', left: '-10%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
              <p className="eyebrow" style={{ marginBottom: 16, position: 'relative' }}>POWERED BY YOUR BROWSER</p>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.25, marginBottom: 14, position: 'relative', letterSpacing: '-0.01em' }}>
                No downloads. No cables. No paywalls to try it.
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto', position: 'relative' }}>
                Lark runs in your browser using the Web Audio API. Your audio never leaves your device.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* EMAIL CAPTURE */}
      <section style={{ padding: '80px 24px 120px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)', top: '-20%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
        <Reveal>
          <p className="eyebrow" style={{ marginBottom: 18, position: 'relative' }}>STAY IN THE LOOP</p>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: 600, margin: '0 auto 14px', position: 'relative' }}>
            Be first when Song Mode ships.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text3)', maxWidth: 420, margin: '0 auto 32px', lineHeight: 1.6, position: 'relative' }}>
            Drop your email. We will let you know when follow-along and AI coaching go live. No spam.
          </p>
          <div style={{ position: 'relative' }}>
            <WaitlistForm />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
