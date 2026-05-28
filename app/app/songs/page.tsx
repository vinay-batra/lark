'use client';

import { useState, useRef, useEffect } from 'react';
import { SONGS, Song, Difficulty, DIFFICULTY_COLORS, DIFFICULTY_DIM, DIFFICULTY_BORDER, DIFFICULTY_RGB, DIFFICULTY_ORDER } from '@/lib/songs';
import { SongFollowView } from '@/components/SongFollowView';
import { SongCover } from '@/components/SongCover';
import { VinylLoader } from '@/components/VinylLoader';
import { Reveal } from '@/components/Reveal';
import { motion } from 'framer-motion';
import { getSavedSongs, saveSong, deleteSavedSong, renameSavedSong, canGenerate, recordGeneration, GEN_LIMIT, SavedSong } from '@/lib/practice';
import { supabase } from '@/lib/supabase';

type Tab = 'library' | 'songs';
type DiffFilter = 'all' | Difficulty;

export default function SongsPage() {
  const [selected, setSelected] = useState<Song | null>(null);
  const [tab, setTab] = useState<Tab>('songs');
  const [diffFilter, setDiffFilter] = useState<DiffFilter>('all');
  const [search, setSearch] = useState('');
  const [requestQuery, setRequestQuery] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  // Lazy init from localStorage (SSR-safe via window guards in practice.ts)
  const [savedSongs, setSavedSongs] = useState<SavedSong[]>(() => getSavedSongs());
  const [genStatus, setGenStatus] = useState<ReturnType<typeof canGenerate>>(() => canGenerate());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const genControllerRef = useRef<AbortController | null>(null);

  // Song request form state
  const [reqTitle, setReqTitle] = useState('');
  const [reqArtist, setReqArtist] = useState('');
  const [reqLoading, setReqLoading] = useState(false);
  const [reqSent, setReqSent] = useState(false);
  const [reqError, setReqError] = useState<string | null>(null);

  // Abort any in-flight generation request on unmount
  useEffect(() => () => { genControllerRef.current?.abort(); }, []);

  const refreshSaved = () => {
    setSavedSongs(getSavedSongs());
    setGenStatus(canGenerate());
  };

  const handleSongRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqArtist.trim() || reqLoading) return;
    setReqLoading(true);
    setReqError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) headers['Authorization'] = `Bearer ${data.session.access_token}`;
      }
      const res = await fetch('/api/song-request', {
        method: 'POST',
        headers,
        body: JSON.stringify({ songTitle: reqTitle.trim(), artist: reqArtist.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        setReqError(d.error ?? 'Failed to send request.');
      } else {
        setReqSent(true);
        setReqTitle('');
        setReqArtist('');
      }
    } catch {
      setReqError('Network error. Try again.');
    } finally {
      setReqLoading(false);
    }
  };

  const filtered = SONGS.filter(s =>
    (diffFilter === 'all' || s.difficulty === diffFilter) &&
    (s.title.toLowerCase().includes(search.toLowerCase()) ||
     s.artist.toLowerCase().includes(search.toLowerCase()))
  );

  // Group by difficulty for the "all" view
  const grouped = DIFFICULTY_ORDER.map(diff => ({
    diff,
    songs: filtered.filter(s => s.difficulty === diff),
  })).filter(g => g.songs.length > 0);

  const handleGenerate = async () => {
    if (!requestQuery.trim()) return;
    const status = canGenerate();
    if (!status.allowed) { setGenError(`No generations left. Resets in ${status.resetIn}.`); return; }
    setGenerating(true);
    setGenError(null);
    const controller = new AbortController();
    genControllerRef.current = controller;
    try {
      const res = await fetch('/api/tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: requestQuery.trim() }),
        signal: controller.signal,
      });
      if (!res.ok) { throw new Error(`Request failed: ${res.status}`); }
      const data = await res.json();
      if (data.error) { setGenError(data.error); return; }
      recordGeneration();
      refreshSaved();
      setSelected(data.song);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setGenError('Generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveFromLibrary = (song: Song | SavedSong) => {
    const toSave: Song = {
      id: ('id' in song ? song.id : '') as string,
      title: song.title,
      artist: song.artist,
      difficulty: 'beginner',
      bpm: ('bpm' in song && song.bpm) ? song.bpm : 120,
      generated: true,
      notes: song.notes,
    };
    saveSong(toSave);
    refreshSaved();
  };

  const handleDelete = (id: string) => {
    deleteSavedSong(id);
    refreshSaved();
  };

  const handleRename = (id: string) => {
    if (!renameVal.trim()) return;
    renameSavedSong(id, renameVal.trim());
    setRenamingId(null);
    setRenameVal('');
    refreshSaved();
  };

  if (selected) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setSelected(null)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text3)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ marginBottom: 12 }}>SONG MODE</p>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8 }}>
          Pick a song.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text3)', lineHeight: 1.6, maxWidth: 480 }}>
          Play note by note, get scored in real time, and get AI coaching when you finish.
        </p>
      </motion.div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, padding: 4, background: 'var(--bg3)', borderRadius: 10, border: '0.5px solid var(--border)', width: 'fit-content', marginBottom: 28 }}>
        {(['songs', 'library'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: tab === t ? 'var(--accent)' : 'transparent', color: tab === t ? 'var(--bg)' : 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', cursor: 'pointer', transition: 'all 0.15s', position: 'relative' }}>
            {t.toUpperCase()}
            {t === 'library' && savedSongs.length > 0 && (
              <span style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, borderRadius: '50%', background: tab === t ? 'var(--bg)' : 'var(--accent)' }} />
            )}
          </button>
        ))}
      </div>

      {/* SONGS TAB */}
      {tab === 'songs' && (
        <>
          {/* Search + AI generation */}
          <Reveal>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 160 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input type="text" placeholder="Search songs..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: 34, height: 42 }} aria-label="Search songs" />
              </div>
              <div style={{ display: 'flex', gap: 8, flex: '2 1 280px', minWidth: 240 }}>
                <input
                  type="text"
                  placeholder={genStatus.allowed ? "Don't see your song? Type it here..." : `No generations left · resets in ${genStatus.resetIn}`}
                  value={requestQuery}
                  onChange={e => { setRequestQuery(e.target.value); setGenError(null); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleGenerate(); }}
                  className="input-field"
                  style={{ flex: 1, height: 42, opacity: genStatus.allowed ? 1 : 0.6 }}
                  disabled={generating || !genStatus.allowed}
                  aria-label="Request a song for AI generation"
                />
                <button onClick={handleGenerate} disabled={generating || !requestQuery.trim() || !genStatus.allowed} className="btn btn-accent" style={{ height: 42, paddingLeft: 16, paddingRight: 16, flexShrink: 0 }}>
                  {generating ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: 'spin 1.4s linear infinite' }}>
                        <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="0.6" />
                        <circle cx="7" cy="7" r="2.4" fill="currentColor" />
                        <circle cx="7" cy="7" r="0.6" fill="var(--accent)" />
                      </svg>
                      <span className="btn-text">Generating</span>
                    </span>
                  ) : <span className="btn-text">Generate</span>}
                </button>
              </div>
            </div>

            {/* Gen counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: GEN_LIMIT }).map((_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < (GEN_LIMIT - genStatus.remaining) ? 'var(--accent)' : 'var(--border2)', transition: 'background 0.2s' }} />
                ))}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                {genStatus.remaining}/{GEN_LIMIT} FREE GENERATIONS
                {!genStatus.allowed && genStatus.resetIn && ` · resets in ${genStatus.resetIn}`}
              </span>
            </div>

            {genError && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--danger)', marginBottom: 16, marginTop: -16 }}>{genError}</p>}
          </Reveal>

          {/* Difficulty filter pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
            {(['all', ...DIFFICULTY_ORDER] as const).map(d => {
              const active = diffFilter === d;
              const color = d === 'all' ? 'var(--text2)' : DIFFICULTY_COLORS[d];
              return (
                <button key={d} onClick={() => setDiffFilter(d)} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', padding: '6px 14px', borderRadius: 99, border: `1px solid ${active ? color : 'var(--border2)'}`, background: active ? (d === 'all' ? 'var(--bg3)' : DIFFICULTY_DIM[d]) : 'transparent', color: active ? color : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {d.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Generating panel: replaces the grid while Claude generates a tab */}
          {generating && (
            <div style={{ padding: '48px 24px', background: 'var(--card-bg)', border: '0.5px solid var(--accent-border)', borderRadius: 16, marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
              <p className="eyebrow" style={{ marginBottom: 4 }}>GENERATING TAB</p>
              <VinylLoader size={96} ticker={['Reading the melody', 'Mapping to the fretboard', 'Choosing playable positions', 'Almost there']} />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', maxWidth: 280, textAlign: 'center', lineHeight: 1.6, marginTop: 6 }}>
                {requestQuery.trim()}
              </p>
            </div>
          )}

          {/* Song sections grouped by difficulty */}
          {grouped.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>
              No matches. Use Generate above.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              {grouped.map(({ diff, songs: groupSongs }) => (
                <div key={diff}>
                  {/* Section header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: DIFFICULTY_COLORS[diff], boxShadow: `0 0 8px rgba(${DIFFICULTY_RGB[diff]}, 0.5)`, flexShrink: 0 }} />
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: DIFFICULTY_COLORS[diff], letterSpacing: '0.16em' }}>
                      {diff.toUpperCase()}
                    </p>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                      {groupSongs.length} songs
                    </span>
                    <div style={{ flex: 1, height: '0.5px', background: `linear-gradient(90deg, rgba(${DIFFICULTY_RGB[diff]}, 0.25), transparent)` }} />
                  </div>

                  {/* Cards grid -- no stagger, simple viewport fade */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                    {groupSongs.map(song => (
                      <SongCard
                        key={song.id}
                        song={song}
                        onPlay={() => setSelected(song)}
                        onSave={() => handleSaveFromLibrary(song)}
                        isSaved={savedSongs.some(s => s.title === song.title)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* LIBRARY TAB */}
      {tab === 'library' && (
        <div>
          {savedSongs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Your library is empty.</p>
              <button onClick={() => setTab('songs')} className="btn btn-ghost btn-sm">BROWSE SONGS</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {savedSongs.map(saved => (
                <div key={saved.id} style={{ padding: '18px 20px', background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {renamingId === saved.id ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          autoFocus
                          value={renameVal}
                          onChange={e => setRenameVal(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleRename(saved.id); if (e.key === 'Escape') setRenamingId(null); }}
                          className="input-field"
                          style={{ height: 32, fontSize: 13, padding: '0 10px' }}
                          placeholder="Custom name..."
                        />
                        <button onClick={() => handleRename(saved.id)} className="btn btn-accent btn-sm">SAVE</button>
                        <button onClick={() => setRenamingId(null)} className="btn btn-ghost btn-sm">X</button>
                      </div>
                    ) : (
                      <>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                          {saved.customName ?? saved.title}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text3)' }}>
                          {saved.artist}
                          {saved.customName && <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{saved.title}</span>}
                          {saved.generated && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', marginLeft: 8, letterSpacing: '0.1em' }}>AI</span>}
                        </p>
                      </>
                    )}
                  </div>
                  {renamingId !== saved.id && (
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button onClick={() => setSelected({ id: saved.id, title: saved.title, artist: saved.artist, difficulty: 'beginner', bpm: saved.bpm ?? 120, generated: saved.generated, notes: saved.notes })} className="btn btn-accent btn-sm">
                        PLAY
                      </button>
                      <button onClick={() => { setRenamingId(saved.id); setRenameVal(saved.customName ?? saved.title); }} className="btn btn-ghost btn-sm" title="Rename" aria-label="Rename song">
                        RENAME
                      </button>
                      <button onClick={() => handleDelete(saved.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} title="Remove" aria-label="Remove song from library">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Song Request section -- always visible, below both tabs */}
      {!selected && (
        <div style={{ marginTop: 56, padding: '24px 22px', background: 'var(--card-bg)', border: '0.5px dashed var(--border2)', borderRadius: 14 }}>
          <p className="eyebrow" style={{ marginBottom: 6 }}>REQUEST A SONG</p>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 18, lineHeight: 1.6 }}>
            {"Don't see your song? Submit a request and we'll add it to the library."}
          </p>
          {reqSent ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{"Got it. We'll look into adding it."}</p>
            </div>
          ) : (
            <form onSubmit={handleSongRequest}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 12 }}>
                <input
                  className="input-field"
                  placeholder="Song title"
                  value={reqTitle}
                  onChange={e => setReqTitle(e.target.value)}
                  maxLength={120}
                  required
                  aria-label="Song title"
                />
                <input
                  className="input-field"
                  placeholder="Artist"
                  value={reqArtist}
                  onChange={e => setReqArtist(e.target.value)}
                  maxLength={120}
                  required
                  aria-label="Artist name"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-ghost btn-sm" disabled={reqLoading}>
                  <span className="btn-text">{reqLoading ? 'SENDING...' : 'SUBMIT REQUEST'}</span>
                </button>
                {reqError && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--danger)' }}>{reqError}</p>}
              </div>
            </form>
          )}
        </div>
      )}

    </div>
  );
}

function SongCard({ song, onPlay, onSave, isSaved }: { song: Song; onPlay: () => void; onSave: () => void; isSaved: boolean }) {
  const db = DIFFICULTY_BORDER[song.difficulty];
  return (
    <div style={{ background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.15s', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = db; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      <button onClick={onPlay} style={{ textAlign: 'left', padding: '16px 16px 10px', background: 'none', border: 'none', cursor: 'pointer', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <SongCover song={song} size={48} />
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 2 }}>{song.title}</p>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>{song.artist}</p>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {song.notes.slice(0, 5).map((note, j) => (
            <span key={j} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg3)', borderRadius: 3, padding: '2px 4px' }}>
              {['e','B','G','D','A','E'][note.string - 1]}|{note.fret}
            </span>
          ))}
          {song.notes.length > 5 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>+{song.notes.length - 5}</span>}
        </div>
      </button>
      {/* Footer */}
      <div style={{ display: 'flex', borderTop: '0.5px solid var(--border)', padding: '8px 12px', gap: 8 }}>
        <button onClick={onPlay} className="btn btn-accent btn-sm" style={{ flex: 1, fontSize: 10 }}>PLAY</button>
        <button onClick={onSave} disabled={isSaved} className="btn btn-ghost btn-sm" style={{ fontSize: 10 }}>
          {isSaved ? 'SAVED' : 'SAVE'}
        </button>
      </div>
    </div>
  );
}
