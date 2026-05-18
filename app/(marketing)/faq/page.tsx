'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Reveal } from '@/components/Reveal';

interface QA {
  q: string;
  a: string;
}

const SECTIONS: { eyebrow: string; items: QA[] }[] = [
  {
    eyebrow: 'GETTING STARTED',
    items: [
      {
        q: 'What do I need to use Lark?',
        a: 'A modern browser (Chrome, Safari, Firefox, Edge) and a microphone. The microphone built into your laptop is enough for the tuner and chord detector. For best results, get your guitar close to the mic and play in a quiet room.',
      },
      {
        q: 'Do I have to sign up?',
        a: 'No. The tuner and chord detector work without an account. Sign up to track your progress, save your tunings, and get early access to song mode + AI coaching when those ship.',
      },
      {
        q: 'Does it work with acoustic AND electric guitar?',
        a: 'Both. For acoustic, the mic picks up the guitar directly. For electric, plug into an amp and have the mic near the speaker, or plug your guitar into your computer via an audio interface for the cleanest signal.',
      },
    ],
  },
  {
    eyebrow: 'PRIVACY',
    items: [
      {
        q: 'Is my audio sent to a server?',
        a: 'No. All audio processing happens locally in your browser via the Web Audio API. Lark never records, uploads, or stores your audio. The moment you close the tab, the audio stream is gone.',
      },
      {
        q: 'What data do you collect?',
        a: 'Right now, just basic analytics (page views, region). Once accounts roll out, we will store your email, tuning preferences, and practice stats. No audio, no recordings, no personal info beyond what you provide.',
      },
    ],
  },
  {
    eyebrow: 'FEATURES',
    items: [
      {
        q: 'How accurate is the tuner?',
        a: 'Lark uses the McLeod Pitch Method via the Pitchy library. Accuracy is within ±1 cent for sustained, clean notes. For comparison, the human ear can detect about 5 cents of pitch difference.',
      },
      {
        q: 'Can it detect any chord?',
        a: 'Lark detects the most common open and barre chords (major, minor, 7th, sus, dim, aug). Jazz extensions and altered chords are harder, but Lark will show you the closest match. Polyphonic detection is genuinely hard, so expect occasional surprises on complex voicings.',
      },
      {
        q: 'What is the AI coaching feature?',
        a: 'Coming in v0.5. Instead of just telling you a note is wrong, the AI explains why: "your G string is muted because your finger is choking the 3rd fret, try arching your wrist higher." Like a real teacher.',
      },
    ],
  },
  {
    eyebrow: 'BILLING',
    items: [
      {
        q: 'Is Lark really free forever?',
        a: 'The tuner and chord detector are free forever. They will never be paywalled. Pro and Studio plans unlock the deeper features (song library, AI coaching, multi-user) as they ship.',
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes. No long-term contracts, no cancel-by-phone nonsense. Click cancel in settings and you are done.',
      },
    ],
  },
];

function AccordionItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  return (
    <div style={{
      borderBottom: '0.5px solid var(--border)',
    }}>
      <button
        onClick={onClick}
        style={{
          width: '100%',
          padding: '20px 0',
          background: 'none',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 15,
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.01em',
          flex: 1,
        }}>
          {q}
        </span>
        <svg
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: open ? 'var(--accent)' : 'var(--text3)',
            transition: 'transform 0.2s, color 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              fontSize: 14,
              color: 'var(--text2)',
              lineHeight: 1.7,
              paddingBottom: 22,
              paddingRight: 32,
            }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <main>
      <section style={{ padding: '120px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          width: 460, height: 460,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.12) 0%, transparent 70%)',
          top: '-20%', right: '-15%',
          animation: 'float 11s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow"
            style={{ marginBottom: 24 }}
          >
            FAQ
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(34px, 6vw, 56px)',
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '-0.025em',
              lineHeight: 1.06,
              marginBottom: 22,
            }}
          >
            Got questions?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            style={{ fontSize: 16, color: 'var(--text3)', lineHeight: 1.6 }}
          >
            Anything you do not see here, email{' '}
            <a href="mailto:hello@lark.fm" style={{ color: 'var(--accent)' }}>hello@lark.fm</a>.
          </motion.p>
        </div>
      </section>

      <section style={{ padding: '40px 24px 100px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {SECTIONS.map((section, si) => (
            <Reveal key={section.eyebrow} delay={si * 0.05}>
              <div style={{ marginBottom: 44 }}>
                <p className="eyebrow" style={{ marginBottom: 14 }}>{section.eyebrow}</p>
                <div>
                  {section.items.map((qa, qi) => {
                    const id = `${si}-${qi}`;
                    return (
                      <AccordionItem
                        key={id}
                        q={qa.q}
                        a={qa.a}
                        open={open === id}
                        onClick={() => setOpen(open === id ? null : id)}
                      />
                    );
                  })}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section style={{ padding: '40px 24px 140px', textAlign: 'center' }}>
        <Reveal>
          <p className="eyebrow" style={{ marginBottom: 18 }}>STILL CURIOUS?</p>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: 26,
          }}>
            Just open the tuner and play.
          </h2>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/tuner" className="btn btn-accent btn-lg">OPEN TUNER</Link>
            <Link href="/chords" className="btn btn-outline btn-lg">TRY CHORDS</Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
