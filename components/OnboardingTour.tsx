'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const TOUR_KEY = 'lark_tour_seen';

interface Step {
  title: string;
  desc: string;
  targetId?: string;
}

const STEPS: Step[] = [
  {
    title: 'Welcome to Lark',
    desc: 'Your AI guitar tutor. It listens while you play and tells you exactly what to fix. Quick tour -- 8 steps.',
  },
  {
    title: 'Song Mode',
    desc: '73 songs from Beginner to Expert. Lark listens through your mic and scores each note in real time. Green means hit, red means miss.',
    targetId: 'tour-songs',
  },
  {
    title: 'Save to your library',
    desc: 'After finishing a song, tap "Save to Library" and it shows up under Your Library. Your sessions, streak, and accuracy are tracked on the home screen.',
    targetId: 'tour-songs',
  },
  {
    title: 'Chord Book',
    desc: '120+ chord diagrams with fingerings -- open chords, barre chords, power chords, sevenths. Tap any card to see alternate voicings.',
    targetId: 'tour-chord-book',
  },
  {
    title: 'Metronome',
    desc: 'Precision Web Audio metronome with tap tempo and multiple time signatures. Songs now also show a live beat indicator while you play.',
    targetId: 'tour-metronome',
  },
  {
    title: 'Ask Lark anything',
    desc: 'The green button in the bottom right is your AI guitar tutor. Ask about chords, scales, technique, or theory. 5 free questions per day.',
    targetId: 'tour-chat-btn',
  },
  {
    title: 'Settings and feedback',
    desc: 'Set your display name and profile picture in Settings. The flag button next to the chat button in the bottom right lets you report a bug anytime.',
    targetId: 'tour-settings-nav',
  },
  {
    title: "You're all set",
    desc: 'Replay this tour anytime from the top-right dropdown. Now pick a song and start playing.',
  },
];

function useTargetRect(targetId?: string) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (!targetId) { setRect(null); return; }
    const update = () => {
      const el = document.getElementById(targetId);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [targetId]);
  return rect;
}

export function OnboardingTour({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const targetRect = useTargetRect(current.targetId);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Pulsing ring on target element
  // NOTE: never override `position` — fixed elements (like the chat FAB)
  // will jump into document flow if position is changed to 'relative'
  useEffect(() => {
    if (!current.targetId || isMobile) return;
    const el = document.getElementById(current.targetId);
    if (el) {
      el.style.boxShadow = '0 0 0 3px var(--accent), 0 0 16px rgba(var(--accent-rgb), 0.4)';
      el.style.borderRadius = '8px';
      el.style.zIndex = '1002';
    }
    return () => {
      if (el) {
        el.style.boxShadow = '';
        el.style.borderRadius = '';
        el.style.zIndex = '';
      }
    };
  }, [step, current.targetId, isMobile]);

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else onDone();
  };

  // Smart tooltip positioning — places the card on whichever side has room
  const CARD_W = 288;
  const CARD_H = 270; // conservative estimate
  const GAP = 16;
  const MARGIN = 16;

  let cardStyle: React.CSSProperties;
  if (!targetRect || isMobile) {
    cardStyle = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1001 };
  } else {
    const spaceRight  = window.innerWidth  - targetRect.right;
    const spaceLeft   = targetRect.left;
    const spaceAbove  = targetRect.top;
    const spaceBelow  = window.innerHeight - targetRect.bottom;

    let left: number;
    let top: number;

    if (spaceRight >= CARD_W + GAP) {
      // Enough space to the right (sidebar items)
      left = targetRect.right + GAP;
      top  = Math.max(MARGIN, Math.min(targetRect.top - 20, window.innerHeight - CARD_H - MARGIN));
    } else if (spaceLeft >= CARD_W + GAP) {
      // Enough space to the left (bottom-right FABs)
      left = targetRect.left - CARD_W - GAP;
      top  = Math.max(MARGIN, Math.min(targetRect.top - 20, window.innerHeight - CARD_H - MARGIN));
    } else if (spaceAbove >= CARD_H + GAP) {
      // Position above the element
      left = Math.max(MARGIN, Math.min(targetRect.left, window.innerWidth - CARD_W - MARGIN));
      top  = targetRect.top - CARD_H - GAP;
    } else {
      // Position below the element
      left = Math.max(MARGIN, Math.min(targetRect.left, window.innerWidth - CARD_W - MARGIN));
      top  = targetRect.bottom + GAP;
    }

    cardStyle = { position: 'fixed', top, left, zIndex: 1001 };
  }

  return (
    <>
      {/* Dim overlay -- high z but below card */}
      <div
        onClick={onDone}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, backdropFilter: 'blur(1px)' }}
      />

      {/* Spotlight cutout */}
      {targetRect && !isMobile && (
        <div style={{
          position: 'fixed',
          top: targetRect.top - 6,
          left: targetRect.left - 6,
          width: targetRect.width + 12,
          height: targetRect.height + 12,
          borderRadius: 10,
          zIndex: 1001,
          pointerEvents: 'none',
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
          border: '1.5px solid var(--accent)',
          animation: 'accentRing 1.4s ease-out infinite',
        }} />
      )}

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            ...cardStyle,
            width: CARD_W,
            background: 'var(--card-bg)',
            border: '0.5px solid var(--accent-border)',
            borderRadius: 14,
            padding: '20px 20px 16px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 0.5px var(--border), 0 0 24px rgba(var(--accent-rgb), 0.08)',
          }}
        >
          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, borderRadius: '14px 14px 0 0', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />

          {/* Progress */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ height: 3, width: i === step ? 18 : 6, borderRadius: 99, background: i <= step ? 'var(--accent)' : 'var(--border2)', transition: 'all 0.25s' }} />
            ))}
          </div>

          <p className="eyebrow" style={{ marginBottom: 6, fontSize: 9 }}>{step + 1} OF {STEPS.length}</p>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.01em' }}>
            {current.title}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 18 }}>
            {current.desc}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={onDone}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em', padding: 0 }}
            >
              SKIP
            </button>
            <button onClick={next} className="btn btn-accent btn-sm">
              {step === STEPS.length - 1 ? "LET'S GO" : 'NEXT'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
