'use client';

/**
 * TabStaff - Songsterr-style scrolling guitar tab notation.
 *
 * Renders a 6-string staff where notes flow continuously from right to left.
 * A fixed green playhead bar marks the current position. Past notes fade;
 * future notes are full brightness.
 *
 * Usage: pass ALL song notes and the absolute currentIndex. The component
 * handles the scrolling internally so no pagination is needed.
 */

import { useRef, useEffect } from 'react';

export type NoteResult = 'pending' | 'hit' | 'miss';

export interface TabStaffNote {
  string: number; // 1 = high e, 6 = low E
  fret: number;
  result: NoteResult;
  chord?: string;
}

interface Props {
  notes: TabStaffNote[];
  currentIndex: number;
  wrongFlash: boolean;
}

// Layout constants
const COL_W = 52;         // px per note column
const LINE_GAP = 24;      // px between string lines
const STRINGS = 6;
const STAFF_H = (STRINGS - 1) * LINE_GAP; // 120px

// String names top-to-bottom (string 1 = high e at top, string 6 = low E at bottom)
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];
// String visual thickness (thin → thick)
const STRING_STROKE = [0.7, 0.8, 1.0, 1.1, 1.4, 1.8];

// Playhead sits 3 columns from the left of the visible area
const PLAYHEAD_COL = 3;
// How many extra columns to render before the first note (empty padding)
const LEAD_IN_COLS = PLAYHEAD_COL;

export function TabStaff({ notes, currentIndex, wrongFlash }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Scroll so currentIndex aligns with the playhead column.
  // We use scrollLeft on the container instead of CSS transform so the
  // browser handles the scroll position + paint efficiently.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const targetLeft = (currentIndex) * COL_W;
    container.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }, [currentIndex]);

  const totalCols = LEAD_IN_COLS + notes.length + 4; // extra trailing space

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* String labels - fixed overlay on left */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 20,
        width: 28,
        height: STAFF_H,
        zIndex: 10,
        background: 'linear-gradient(90deg, var(--card-bg) 70%, transparent)',
        pointerEvents: 'none',
      }}>
        {STRING_NAMES.map((name, i) => (
          <div key={name} style={{
            position: 'absolute',
            top: i * LINE_GAP - 7,
            left: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--text3)',
            letterSpacing: '0.04em',
          }}>
            {name}
          </div>
        ))}
      </div>

      {/* Playhead (green bar - fixed at PLAYHEAD_COL * COL_W from left) */}
      <div style={{
        position: 'absolute',
        left: 28 + PLAYHEAD_COL * COL_W - 1,
        top: 12,
        width: 2,
        height: STAFF_H + 16,
        background: 'var(--accent)',
        zIndex: 9,
        borderRadius: 1,
        boxShadow: '0 0 10px rgba(var(--accent-rgb), 0.55)',
        pointerEvents: 'none',
      }} />

      {/* Scrollable staff */}
      <div
        ref={containerRef}
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          paddingLeft: 28 + PLAYHEAD_COL * COL_W,
          paddingRight: 40,
          paddingTop: 0,
          scrollBehavior: 'smooth',
        }}
      >
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            width: totalCols * COL_W,
            height: STAFF_H + 40,
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          {notes.map((note, i) => {
            const isPast = i < currentIndex;
            const isCurrent = i === currentIndex;
            const isNearFuture = i > currentIndex && i <= currentIndex + 16;

            // Note state styling
            const accent = wrongFlash && isCurrent ? 'var(--danger)' : 'var(--accent)';
            const noteColor =
              isCurrent ? accent :
              note.result === 'hit' ? 'var(--accent)' :
              note.result === 'miss' ? 'var(--danger)' :
              isNearFuture ? 'var(--text2)' :
              'var(--text-muted)';

            const noteBg =
              isCurrent ? (wrongFlash ? 'rgba(var(--danger-rgb), 0.14)' : 'var(--accent-dim)') :
              note.result === 'hit' ? 'var(--accent-dim)' :
              note.result === 'miss' ? 'rgba(var(--danger-rgb), 0.1)' :
              'var(--bg)';

            const noteOpacity = isPast ? 0.3 : 1;
            const strIdx = note.string - 1; // 0 = high e, 5 = low E

            return (
              <div
                key={i}
                style={{
                  width: COL_W,
                  height: STAFF_H,
                  position: 'relative',
                  flexShrink: 0,
                  opacity: noteOpacity,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* All 6 string lines for this column */}
                {[0, 1, 2, 3, 4, 5].map(s => (
                  <div key={s} style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: s * LINE_GAP,
                    height: STRING_STROKE[s],
                    background: 'var(--border2)',
                    opacity: 1,
                  }} />
                ))}

                {/* The fret number on its string */}
                <div style={{
                  position: 'absolute',
                  top: strIdx * LINE_GAP - 11,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: note.chord ? 40 : isCurrent ? 26 : 22,
                  height: isCurrent ? 26 : 22,
                  borderRadius: note.chord ? 6 : '50%',
                  background: noteBg,
                  border: `${isCurrent ? 1.5 : 0.5}px solid ${noteColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: isCurrent ? 12 : 11,
                  fontWeight: 700,
                  color: noteColor,
                  zIndex: 1,
                  boxShadow: isCurrent && !wrongFlash
                    ? '0 0 10px rgba(var(--accent-rgb), 0.4)'
                    : 'none',
                  transition: 'border-color 0.1s, box-shadow 0.1s, background 0.1s',
                }}>
                  {note.chord ?? note.fret}
                </div>
              </div>
            );
          })}
          {/* Trailing empty space so last note can be centered at playhead */}
          <div style={{ width: COL_W * 4, height: STAFF_H, flexShrink: 0 }}>
            {[0, 1, 2, 3, 4, 5].map(s => (
              <div key={s} style={{
                position: 'absolute',
                left: 0, right: 0,
                top: s * LINE_GAP,
                height: STRING_STROKE[s],
                background: 'var(--border2)', opacity: 0.4,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Left fade gradient over the playhead */}
      <div style={{
        position: 'absolute',
        top: 0, left: 28, width: PLAYHEAD_COL * COL_W - 4,
        height: '100%',
        background: 'linear-gradient(90deg, var(--card-bg) 10%, transparent)',
        zIndex: 8, pointerEvents: 'none',
      }} />
      {/* Right fade */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0, width: 56,
        height: '100%',
        background: 'linear-gradient(270deg, var(--card-bg) 20%, transparent)',
        zIndex: 8, pointerEvents: 'none',
      }} />
    </div>
  );
}
