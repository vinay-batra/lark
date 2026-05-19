'use client';

import { useEffect, useRef } from 'react';
import { STRING_LABELS } from '@/lib/songs';

export type NoteResult = 'pending' | 'hit' | 'miss';

export interface TabViewNote {
  string: number;
  fret: number;
  result: NoteResult;
}

interface TabViewProps {
  notes: TabViewNote[];
  currentIndex: number; // index within this line's notes array
  wrongFlash: boolean;
}

const COL_W = 48;
const ROW_H = 30;

export function TabView({ notes, currentIndex, wrongFlash }: TabViewProps) {
  const currentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [currentIndex]);

  return (
    <div style={{ width: '100%', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
      <div style={{ display: 'inline-flex', minWidth: '100%' }}>
        {/* String labels */}
        <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, paddingRight: 6 }}>
          {STRING_LABELS.map(label => (
            <div key={label} style={{
              height: ROW_H,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text3)',
              width: 16,
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* Note columns */}
        {notes.map((note, colIdx) => {
          const isCurrent = colIdx === currentIndex;
          const noteColor = note.result === 'hit'
            ? 'var(--accent)'
            : note.result === 'miss'
            ? 'var(--danger)'
            : isCurrent
            ? (wrongFlash ? 'var(--danger)' : 'var(--text)')
            : colIdx > currentIndex + 6
            ? 'var(--text-muted)'
            : 'var(--text3)';

          return (
            <div
              key={colIdx}
              ref={isCurrent ? currentRef : null}
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: COL_W,
                flexShrink: 0,
                background: isCurrent ? 'rgba(var(--accent-rgb), 0.06)' : 'transparent',
                borderRadius: 6,
                transition: 'background 0.15s',
              }}
            >
              {STRING_LABELS.map((_, strIdx) => {
                const strNum = strIdx + 1;
                const isActive = note.string === strNum;
                return (
                  <div key={strIdx} style={{
                    height: ROW_H,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                    {/* String line */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: strIdx === 0 ? 1 : strIdx === 5 ? 2 : 1,
                      background: 'var(--border2)',
                      opacity: 0.6,
                    }} />
                    {/* Fret number */}
                    {isActive ? (
                      <span style={{
                        position: 'relative',
                        zIndex: 1,
                        fontFamily: 'var(--font-mono)',
                        fontSize: isCurrent ? 15 : 13,
                        fontWeight: 700,
                        color: noteColor,
                        background: 'var(--bg)',
                        padding: '1px 3px',
                        borderRadius: 3,
                        lineHeight: 1,
                        transition: 'color 0.12s',
                        boxShadow: isCurrent && !wrongFlash
                          ? '0 0 0 1.5px var(--accent)'
                          : isCurrent && wrongFlash
                          ? '0 0 0 1.5px var(--danger)'
                          : note.result === 'hit'
                          ? '0 0 0 1px var(--accent-border)'
                          : note.result === 'miss'
                          ? '0 0 0 1px rgba(239,68,68,0.4)'
                          : 'none',
                      }}>
                        {note.fret}
                      </span>
                    ) : (
                      <span style={{
                        position: 'relative',
                        zIndex: 1,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--border2)',
                        background: 'var(--bg)',
                        padding: '0 2px',
                      }}>
                        -
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
