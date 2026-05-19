'use client';

import { useState } from 'react';
import { SONGS, Song } from '@/lib/songs';
import { SongFollowView } from '@/components/SongFollowView';
import { Reveal } from '@/components/Reveal';
import { motion } from 'framer-motion';

export default function SongsPage() {
  const [selected, setSelected] = useState<Song | null>(null);
  const [search, setSearch] = useState('');
  const [requestQuery, setRequestQuery] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const filtered = SONGS.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = async () => {
    if (!requestQuery.trim()) return;
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch('/api/tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: requestQuery.trim() }),
      });
      const data = await res.json();
      if (data.error) { setGenError(data.error); return; }
      setSelected(data.song);
    } catch {
      setGenError('Generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (selected) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setSelected(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', color: 'var(--text3)', background: 'none',
              border: 'none', padding: 0, cursor: 'pointer', transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            BACK TO SONGS
          </button>
          {selected.generated && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--accent)', background: 'var(--accent-dim)', border: '0.5px solid var(--accent-border)', borderRadius: 99, padding: '3px 8px' }}>
              AI GENERATED
            </span>
          )}
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
        style={{ marginBottom: 36 }}
      >
        <p className="eyebrow" style={{ marginBottom: 12 }}>SONG MODE</p>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8 }}>
          Pick a song.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text3)', lineHeight: 1.6, maxWidth: 480 }}>
          Play note by note, get scored in real time, and get AI coaching when you finish.
        </p>
      </motion.div>

      {/* Search + AI request */}
      <Reveal>
        <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
          {/* Search existing */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search songs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 36, height: 42 }}
            />
          </div>

          {/* AI generation */}
          <div style={{ display: 'flex', gap: 8, flex: '2 1 300px', minWidth: 260 }}>
            <input
              type="text"
              placeholder="Don't see your song? Type it here..."
              value={requestQuery}
              onChange={e => { setRequestQuery(e.target.value); setGenError(null); }}
              onKeyDown={e => { if (e.key === 'Enter') handleGenerate(); }}
              className="input-field"
              style={{ flex: 1, height: 42 }}
              disabled={generating}
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !requestQuery.trim()}
              className="btn btn-accent"
              style={{ height: 42, paddingLeft: 18, paddingRight: 18, flexShrink: 0 }}
            >
              {generating ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', animation: 'pulse 0.8s ease-in-out infinite' }} />
                  <span className="btn-text">Generating</span>
                </span>
              ) : (
                <span className="btn-text">Generate</span>
              )}
            </button>
          </div>
        </div>

        {genError && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--danger)', marginBottom: 16, marginTop: -20 }}>
            {genError}
          </p>
        )}
      </Reveal>

      {/* Song grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {filtered.map((song, i) => (
          <Reveal key={song.id} delay={i * 0.04}>
            <button
              onClick={() => setSelected(song)}
              className="hover-lift"
              style={{
                width: '100%', textAlign: 'left', padding: '20px 20px',
                background: 'var(--card-bg)', border: '0.5px solid var(--border)',
                borderRadius: 16, cursor: 'pointer', transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--accent-dim)', border: '0.5px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: song.difficulty === 'beginner' ? 'var(--accent)' : 'var(--sharp)', background: song.difficulty === 'beginner' ? 'var(--accent-dim)' : 'var(--sharp-dim)', border: `0.5px solid ${song.difficulty === 'beginner' ? 'var(--accent-border)' : 'rgba(245,158,11,0.25)'}`, borderRadius: 99, padding: '3px 8px' }}>
                  {song.difficulty.toUpperCase()}
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 3 }}>
                {song.title}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>{song.artist}</p>

              {/* Mini tab preview: show first 5 notes as string/fret chips */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {song.notes.slice(0, 5).map((note, j) => (
                  <span key={j} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', background: 'var(--bg3)', borderRadius: 4, padding: '2px 5px' }}>
                    {['e','B','G','D','A','E'][note.string - 1]}|{note.fret}
                  </span>
                ))}
                {song.notes.length > 5 && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>+{song.notes.length - 5}</span>
                )}
              </div>
            </button>
          </Reveal>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              No songs match. Use the Generate box above to create tabs for any song.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
