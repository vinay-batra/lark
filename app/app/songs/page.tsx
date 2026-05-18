'use client';

import { useState } from 'react';
import { SONGS, Song } from '@/lib/songs';
import { SongFollowView } from '@/components/SongFollowView';
import { Reveal } from '@/components/Reveal';
import { motion } from 'framer-motion';

export default function SongsPage() {
  const [selected, setSelected] = useState<Song | null>(null);

  if (selected) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setSelected(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--text3)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            BACK TO SONGS
          </button>
        </div>
        <SongFollowView song={selected} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 40 }}
      >
        <p className="eyebrow" style={{ marginBottom: 12 }}>SONG MODE</p>
        <h1 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: 8,
        }}>
          Pick a song.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text3)', lineHeight: 1.6, maxWidth: 480 }}>
          Play each note as it lights up. Lark listens, scores your accuracy, and gives AI feedback when you finish.
        </p>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 14,
      }}>
        {SONGS.map((song, i) => (
          <Reveal key={song.id} delay={i * 0.06}>
            <button
              onClick={() => setSelected(song)}
              className="hover-lift"
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '22px 22px',
                background: 'var(--card-bg)',
                border: '0.5px solid var(--border)',
                borderRadius: 16,
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'var(--accent-dim)',
                  border: '0.5px solid var(--accent-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  color: song.difficulty === 'beginner' ? 'var(--accent)' : 'var(--sharp)',
                  background: song.difficulty === 'beginner' ? 'var(--accent-dim)' : 'var(--sharp-dim)',
                  border: `0.5px solid ${song.difficulty === 'beginner' ? 'var(--accent-border)' : 'rgba(245,158,11,0.25)'}`,
                  borderRadius: 99,
                  padding: '3px 9px',
                }}>
                  {song.difficulty.toUpperCase()}
                </span>
              </div>
              <h3 style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 17,
                fontWeight: 700,
                color: 'var(--text)',
                letterSpacing: '-0.01em',
                marginBottom: 4,
              }}>
                {song.title}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>{song.artist}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {song.notes.slice(0, Math.min(song.notes.length, 12)).map((note, j) => (
                    <div
                      key={j}
                      style={{
                        width: 4,
                        height: 14,
                        borderRadius: 2,
                        background: 'var(--accent-dim)',
                        border: '0.5px solid var(--accent-border)',
                      }}
                    />
                  ))}
                  {song.notes.length > 12 && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginLeft: 2, alignSelf: 'center' }}>
                      +{song.notes.length - 12}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                  {song.notes.length} notes
                </span>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
