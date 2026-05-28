'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Reveal } from '@/components/Reveal';
import { getSessions, getStreak, getAvgAccuracy, getGenCount } from '@/lib/practice';

const QUICK_TOOLS = [
  {
    href: '/app/tuner',
    eyebrow: 'TUNER',
    title: 'Tune your guitar',
    desc: 'Real-time pitch detection. Hit the green zone, you are in tune.',
    icon: <path d="M2 12h3l3-9 4 18 3-9 3 5 4-5"/>,
  },
  {
    href: '/app/chords',
    eyebrow: 'CHORD DETECTOR',
    title: 'Detect any chord',
    desc: 'Play any chord, Lark identifies it from the chromagram.',
    icon: <><rect x="3" y="6" width="18" height="12" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="8" y1="6" x2="8" y2="18"/><line x1="14" y1="6" x2="14" y2="18"/></>,
  },
  {
    href: '/app/songs',
    eyebrow: 'SONG MODE',
    title: 'Follow along with songs',
    desc: 'Play note-by-note. Lark scores your accuracy and gives AI coaching after each session.',
    icon: <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
  },
];

const SOON = [
  { eyebrow: 'PROGRESS', title: 'Track your improvement', desc: 'See your tuning accuracy, chord recognition, and practice time over weeks.' },
  { eyebrow: 'STRIPE', title: 'Pro + Studio plans', desc: 'Unlock unlimited songs, advanced AI coaching, and detailed session history.' },
];

function computeGreeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function AppPage() {
  // Lazy init: greeting + localStorage stats don't need an extra render.
  const [greeting] = useState<string>(() => computeGreeting());
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [stats] = useState(() => ({
    sessions: getSessions().length,
    streak: getStreak(),
    accuracy: getAvgAccuracy(),
    generated: getGenCount(),
  }));

  useEffect(() => {
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        const u = data.user;
        const name = u?.user_metadata?.display_name ?? u?.email?.split('@')[0] ?? null;
        setDisplayName(name);
      });
    }
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 40 }}
      >
        <p className="eyebrow" style={{ marginBottom: 12 }}>HOME</p>
        <h1 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: 8,
        }}>
          {greeting}{displayName ? `, ${displayName}` : ''}.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text3)', lineHeight: 1.6, maxWidth: 540 }}>
          Pick a tool to start practicing. Lark listens while you play.
        </p>
      </motion.div>

      {/* Stats - shown first */}
      <Reveal>
        <div style={{ marginBottom: 48, padding: '28px 26px', background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 16 }}>
          <p className="eyebrow" style={{ marginBottom: 20 }}>YOUR STATS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 24 }}>
            {[
              { val: stats.sessions.toString(), label: 'Sessions played', accent: stats.sessions > 0 },
              { val: stats.streak > 0 ? `${stats.streak}d` : '0', label: 'Day streak', accent: stats.streak > 0 },
              { val: stats.accuracy !== null ? `${stats.accuracy}%` : '--', label: 'Avg accuracy', accent: stats.accuracy !== null },
              { val: stats.generated.toString(), label: 'Tabs generated', accent: stats.generated > 0 },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: s.accent ? 'var(--accent)' : 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          {stats.sessions === 0 && (
            <Link
              href="/app/songs"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                color: 'var(--accent)', letterSpacing: '0.1em',
                marginTop: 16, textDecoration: 'none',
              }}
            >
              PLAY A SONG TO START TRACKING
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          )}
        </div>
      </Reveal>

      {/* Live tools */}
      <Reveal>
        <p className="eyebrow" style={{ marginBottom: 16 }}>LIVE TOOLS</p>
      </Reveal>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 56,
      }}>
        {QUICK_TOOLS.map((tool, i) => (
          <Reveal key={tool.href} delay={i * 0.08}>
            <Link href={tool.href} className="hover-lift" style={{
              display: 'block',
              padding: '24px 22px',
              background: 'var(--card-bg)',
              border: '0.5px solid var(--border)',
              borderRadius: 16,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: -30, right: -30,
                width: 120, height: 120,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'var(--accent-dim)',
                color: 'var(--accent)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
                border: '0.5px solid var(--accent-border)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {tool.icon}
                </svg>
              </div>
              <p className="eyebrow" style={{ marginBottom: 6 }}>{tool.eyebrow}</p>
              <h3 style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: 8,
                letterSpacing: '-0.01em',
              }}>
                {tool.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 14 }}>
                {tool.desc}
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--accent)',
                letterSpacing: '0.12em',
              }}>
                OPEN
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      {/* Coming soon */}
      <Reveal>
        <p className="eyebrow" style={{ marginBottom: 16 }}>COMING SOON</p>
      </Reveal>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 14,
      }}>
        {SOON.map((s, i) => (
          <Reveal key={s.eyebrow} delay={i * 0.06}>
            <div style={{
              padding: '22px 20px',
              background: 'var(--card-bg)',
              border: '0.5px dashed var(--border2)',
              borderRadius: 14,
              opacity: 0.8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <p className="eyebrow" style={{ opacity: 0.8 }}>{s.eyebrow}</p>
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
              </div>
              <h3 style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text2)',
                marginBottom: 6,
              }}>
                {s.title}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

    </div>
  );
}
