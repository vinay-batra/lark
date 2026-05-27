'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SONGS } from '@/lib/songs';
import { getCurriculumProgress, UNLOCK_ACCURACY, StageProgress } from '@/lib/curriculum';
import { SongFollowView } from '@/components/SongFollowView';
import { SongCover } from '@/components/SongCover';
import { Reveal } from '@/components/Reveal';

export default function LearnPage() {
  const [progress, setProgress] = useState<StageProgress[]>(() => getCurriculumProgress());
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

  const handleBack = () => {
    setProgress(getCurriculumProgress());
    setSelectedSongId(null);
  };

  const selectedSong = selectedSongId ? SONGS.find(s => s.id === selectedSongId) : null;

  if (selectedSong) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleBack}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text3)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            BACK TO LEARNING PATH
          </button>
        </div>
        <SongFollowView song={selectedSong} />
      </div>
    );
  }

  const totalCleared = progress.reduce((s, p) => s + p.cleared.length, 0);
  const totalSongs = progress.reduce((s, p) => s + p.stage.songIds.length, 0);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 28 }}
      >
        <p className="eyebrow" style={{ marginBottom: 12 }}>LEARNING PATH</p>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8 }}>
          From first note to lead solos.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text3)', lineHeight: 1.6, maxWidth: 560 }}>
          A guided ladder of six stages. Play any song at <strong style={{ color: 'var(--text)' }}>{UNLOCK_ACCURACY}%+</strong> accuracy to unlock the next stage. Songs from the open library stay available outside this path.
        </p>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
          <div style={{ flex: 1, height: 4, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(totalCleared / totalSongs) * 100}%`,
              background: 'var(--accent)',
              boxShadow: '0 0 12px var(--accent-glow)',
              transition: 'width 0.4s ease-out',
            }} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            {totalCleared} / {totalSongs} CLEARED
          </span>
        </div>
      </motion.div>

      {/* Stages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {progress.map((p, i) => (
          <Reveal key={p.stage.id} delay={i * 0.06}>
            <StageCard
              progress={p}
              onPlay={id => setSelectedSongId(id)}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function StageCard({ progress, onPlay }: { progress: StageProgress; onPlay: (songId: string) => void }) {
  const { stage, unlocked, bestAccuracy, cleared } = progress;
  const stageComplete = cleared.length === stage.songIds.length;
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: `0.5px solid ${stageComplete ? 'var(--accent-border)' : 'var(--border)'}`,
        borderRadius: 16,
        padding: '24px 26px',
        opacity: unlocked ? 1 : 0.5,
        transition: 'border-color 0.2s, opacity 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: '50%',
          background: stageComplete ? 'var(--accent)' : unlocked ? 'var(--accent-dim)' : 'var(--bg3)',
          border: `0.5px solid ${stageComplete ? 'var(--accent)' : unlocked ? 'var(--accent-border)' : 'var(--border)'}`,
          fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
          color: stageComplete ? 'var(--bg)' : unlocked ? 'var(--accent)' : 'var(--text-muted)',
          flexShrink: 0,
        }}>
          {stageComplete ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            stage.index + 1
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 2 }}>
            {stage.title}
          </h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            {stage.skill.toUpperCase()}
          </p>
        </div>
        {bestAccuracy !== null && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: bestAccuracy >= UNLOCK_ACCURACY ? 'var(--accent)' : 'var(--sharp)',
          }}>
            BEST {bestAccuracy}%
          </span>
        )}
        {!unlocked && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            LOCKED
          </span>
        )}
      </div>

      <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 18 }}>
        {stage.description}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
        {stage.songIds.map(id => {
          const song = SONGS.find(s => s.id === id);
          if (!song) return null;
          const songCleared = cleared.includes(id);
          return (
            <button
              key={id}
              onClick={() => unlocked && onPlay(id)}
              disabled={!unlocked}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 10, borderRadius: 10,
                background: songCleared ? 'var(--accent-dim)' : 'var(--bg3)',
                border: `0.5px solid ${songCleared ? 'var(--accent-border)' : 'var(--border)'}`,
                cursor: unlocked ? 'pointer' : 'not-allowed',
                textAlign: 'left', minWidth: 0,
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { if (unlocked) (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = songCleared ? 'var(--accent-border)' : 'var(--border)'; }}
            >
              <SongCover song={song} size={36} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {song.title}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {song.artist}
                </p>
              </div>
              {songCleared && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
