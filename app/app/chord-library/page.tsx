'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Reveal } from '@/components/Reveal';
import { ChordDiagram } from '@/components/ChordDiagram';
import { CHORD_LIBRARY } from '@/lib/chords-data';
import type { ChordEntry } from '@/lib/chords-data';

// ─── Types ───────────────────────────────────────────────────────────────────

type CategoryFilter =
  | 'all'
  | 'major'
  | 'minor'
  | 'seventh'
  | 'sus'
  | 'add'
  | 'barre'
  | 'power';

interface FilterOption {
  value: CategoryFilter;
  label: string;
}

const FILTERS: FilterOption[] = [
  { value: 'all',     label: 'All'      },
  { value: 'major',   label: 'Major'    },
  { value: 'minor',   label: 'Minor'    },
  { value: 'seventh', label: '7th'      },
  { value: 'sus',     label: 'Sus'      },
  { value: 'add',     label: 'Add'      },
  { value: 'power',   label: 'Power'    },
  { value: 'barre',   label: 'Barre'    },
];

// ─── Chord Card ──────────────────────────────────────────────────────────────

function ChordCard({
  chord,
  expanded,
  onToggle,
}: {
  chord: ChordEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      layout="size"
      onClick={onToggle}
      style={{
        background: expanded ? 'var(--card-bg)' : 'var(--bg2)',
        border: `0.5px solid ${expanded ? 'var(--accent-border)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '18px 16px 14px',
        cursor: 'pointer',
        boxShadow: expanded ? 'var(--shadow-md)' : 'var(--shadow)',
        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
        userSelect: 'none',
        overflow: 'hidden',
        position: 'relative',
      }}
      transition={{ layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
      whileHover={{ y: expanded ? 0 : -2, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Accent stripe when expanded */}
      {expanded && (
        <motion.div
          layoutId={`stripe-${chord.name}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '3px',
            height: '100%',
            background: 'var(--accent)',
            borderRadius: '99px 0 0 99px',
            transformOrigin: 'left',
          }}
        />
      )}

      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          paddingLeft: expanded ? 6 : 0,
          transition: 'padding-left 0.2s',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 22,
            fontWeight: 700,
            color: expanded ? 'var(--accent)' : 'var(--text)',
            letterSpacing: '-0.02em',
            transition: 'color 0.2s',
          }}
        >
          {chord.name}
        </span>
        <motion.span
          animate={{ rotate: expanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: expanded ? 'var(--accent-dim)' : 'var(--bg3)',
            border: `0.5px solid ${expanded ? 'var(--accent-border)' : 'var(--border2)'}`,
            color: expanded ? 'var(--accent)' : 'var(--text3)',
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1,
            transition: 'background 0.2s, border-color 0.2s, color 0.2s',
            flexShrink: 0,
          }}
        >
          +
        </motion.span>
      </div>

      {/* Primary voicing diagram */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        <ChordDiagram
          voicing={chord.voicings[0]}
          name={chord.name}
          size="md"
        />
      </div>

      {/* Full name */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: 'var(--text3)',
          textTransform: 'uppercase',
          textAlign: 'center',
          paddingLeft: expanded ? 6 : 0,
          transition: 'padding-left 0.2s',
        }}
      >
        {chord.full}
      </p>

      {/* Expanded: additional voicings */}
      <AnimatePresence>
        {expanded && chord.voicings.length > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: '0.5px solid var(--border)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                  paddingLeft: 6,
                }}
              >
                Alt voicings
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  justifyContent: 'center',
                }}
              >
                {chord.voicings.slice(1).map((v, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <ChordDiagram
                      voicing={v}
                      name={`${chord.name} alt ${idx + 2}`}
                      size="sm"
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 8,
                        color: 'var(--text3)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Voicing {idx + 2}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded: fret numbers row */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: '0.5px solid var(--border)',
                display: 'flex',
                justifyContent: 'center',
                gap: 6,
                paddingLeft: 6,
              }}
            >
              {['E', 'A', 'D', 'G', 'B', 'e'].map((s, si) => {
                const fret = chord.voicings[0].frets[si];
                return (
                  <div
                    key={s}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      minWidth: 18,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        fontWeight: 700,
                        color: fret === -1 ? 'var(--text-muted)' : fret === 0 ? 'var(--text2)' : 'var(--accent)',
                      }}
                    >
                      {fret === -1 ? 'x' : fret === 0 ? '0' : fret}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 8,
                        color: 'var(--text-muted)',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {s}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ChordLibraryPage() {
  const [query, setQuery]         = useState('');
  const [activeFilter, setFilter] = useState<CategoryFilter>('all');
  const [expandedName, setExpanded] = useState<string | null>(null);

  const filtered = useMemo<ChordEntry[]>(() => {
    return CHORD_LIBRARY.filter((chord) => {
      const matchesCategory =
        activeFilter === 'all' || chord.category === activeFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q === '' ||
        chord.name.toLowerCase().includes(q) ||
        chord.full.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeFilter]);

  function handleToggle(name: string) {
    setExpanded((prev) => (prev === name ? null : name));
  }

  return (
    <div style={{ paddingBottom: 80 }}>

      {/* ── Header ── */}
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '24px 16px 0',
        }}
      >
        <Reveal delay={0}>
          <p className="eyebrow" style={{ marginBottom: 12 }}>
            Chord Library
          </p>
        </Reveal>

        <Reveal delay={0.07}>
          <h1
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(28px, 5vw, 44px)',
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            Every chord you need.
          </h1>
        </Reveal>

        <Reveal delay={0.13}>
          <p
            style={{
              fontSize: 15,
              color: 'var(--text2)',
              lineHeight: 1.55,
              maxWidth: 480,
              marginBottom: 36,
            }}
          >
            Tap any chord to see fingerings. 120+ voicings.
          </p>
        </Reveal>

        {/* ── Search ── */}
        <Reveal delay={0.18}>
          <div style={{ position: 'relative', maxWidth: 340, marginBottom: 20 }}>
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text3)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <circle cx={11} cy={11} r={8} />
              <line x1={21} y1={21} x2={16.65} y2={16.65} />
            </svg>
            <input
              className="input-field"
              type="text"
              placeholder="Search chords..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setExpanded(null);
              }}
              style={{
                paddingLeft: 40,
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
              }}
              aria-label="Search chords"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setExpanded(null); }}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text3)',
                  fontSize: 16,
                  lineHeight: 1,
                  padding: 0,
                  cursor: 'pointer',
                }}
                aria-label="Clear search"
              >
                x
              </button>
            )}
          </div>
        </Reveal>

        {/* ── Category filter pills ── */}
        <Reveal delay={0.22}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 36,
            }}
            role="group"
            aria-label="Filter by category"
          >
            {FILTERS.map((f) => {
              const active = activeFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => {
                    setFilter(f.value);
                    setExpanded(null);
                  }}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '7px 14px',
                    borderRadius: 9999,
                    border: `0.5px solid ${active ? 'var(--accent)' : 'var(--border2)'}`,
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text2)',
                    cursor: 'pointer',
                    transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                  }}
                  aria-pressed={active}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </Reveal>
      </div>

      {/* ── Results count ── */}
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '0 24px',
          marginBottom: 20,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={`${activeFilter}-${query}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: 'var(--text3)',
              textTransform: 'uppercase',
            }}
          >
            {filtered.length === 0
              ? 'No chords found'
              : `${filtered.length} chord${filtered.length !== 1 ? 's' : ''}`}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Chord grid ── */}
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              textAlign: 'center',
              padding: '60px 0',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                color: 'var(--text3)',
                letterSpacing: '0.06em',
              }}
            >
              No chords match &ldquo;{query}&rdquo;
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 16,
            }}
          >
            <AnimatePresence initial={false}>
              {filtered.map((chord, i) => (
                <motion.div
                  key={chord.name}
                  layout="position"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.25, delay: Math.min(i * 0.03, 0.3) },
                    y: { duration: 0.25, delay: Math.min(i * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] },
                  }}
                >
                  <ChordCard
                    chord={chord}
                    expanded={expandedName === chord.name}
                    onToggle={() => handleToggle(chord.name)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Bottom hint ── */}
      {filtered.length > 0 && (
        <div
          style={{
            maxWidth: 900,
            margin: '40px auto 0',
            padding: '0 24px',
            textAlign: 'center',
          }}
        >
          <Reveal delay={0}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-muted)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Tap any card to expand voicings
            </p>
          </Reveal>
        </div>
      )}
    </div>
  );
}
