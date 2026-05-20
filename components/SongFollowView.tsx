'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PitchDetector } from 'pitchy';
import { Song } from '@/lib/songs';
import { TabStaff } from './TabStaff';
import { saveSession, saveSong, getSavedSongs } from '@/lib/practice';
import { startMetronome, MetronomeHandle } from '@/lib/metronome-scheduler';
import { buildChromagram, detectChordFromChroma, chordMatches } from '@/lib/chord-detection';
import { SongCover } from './SongCover';
import { VinylLoader } from './VinylLoader';

import {
  TimingBucket,
  noteTimeoutMs,
  classifyTiming,
  STRING_DESCRIPTIONS,
  ordinalFret,
  TOLERANCE_CENTS,
  CLARITY_THRESHOLD,
  RELEASE_FRAMES,
  NOTE_NAMES,
  getCents,
} from '@/lib/song-session';



type NoteResult = 'pending' | 'hit' | 'miss';
type Mode = 'idle' | 'countdown' | 'playing' | 'finished';

interface SessionNote {
  string: number;
  fret: number;
  midi: number;
  /** When present, this position is a chord strum (e.g., "Am"). */
  chord?: string;
  result: NoteResult;
  centsOff: number | null;
  timingMs: number | null;
}

export function SongFollowView({ song }: { song: Song }) {
  const [mode, setMode] = useState<Mode>('idle');
  const [countdown, setCountdown] = useState(3);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [noteIndex, setNoteIndex] = useState(0);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  // Pitch detection refs
  const rafRef = useRef<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const detectorRef = useRef<PitchDetector<Float32Array> | null>(null);
  const inputRef = useRef<Float32Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Chord-detection ring buffer. Frequency-domain analysis runs alongside
  // pitch detection on the same analyser; we keep a 10-frame sliding window
  // of chromagrams for stability.
  const freqDataRef = useRef<Float32Array | null>(null);
  const chordHistoryRef = useRef<number[][]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIndexRef = useRef(0);
  const sessionNotesRef = useRef<SessionNote[]>([]);
  const advancedRef = useRef(false);
  const armedRef = useRef(true);
  const releaseFramesRef = useRef(0);

  // Countdown timer ref
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Metronome handle from lib/metronome-scheduler. Holding it as a ref lets
  // stopMetronome / stopAudio tear it down without forcing a re-render.
  const metroRef = useRef<MetronomeHandle | null>(null);

  // Mounted guard. getUserMedia + new AudioContext() can resolve AFTER unmount,
  // and the post-await assignments would otherwise leak the mic + context.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Timing ref
  const noteStartTimeRef = useRef(0);

  // Real-time timing pill: classification of the last hit. Resets each note.
  const [lastTiming, setLastTiming] = useState<TimingBucket | null>(null);

  const stopMetronome = useCallback(() => {
    metroRef.current?.stop();
    metroRef.current = null;
    setCurrentBeat(-1);
  }, []);

  const stopAudio = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
    if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    // AudioContext.close() rejects (or in some browsers throws synchronously)
    // when called twice. stopAudio runs from reset() AND from useEffect cleanup
    // on unmount, so double-close is normal. Guard against it.
    const ctx = ctxRef.current;
    if (ctx && ctx.state !== 'closed') {
      ctx.close().catch(() => {});
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    rafRef.current = null; ctxRef.current = null; analyserRef.current = null; streamRef.current = null;
    stopMetronome();
  }, [stopMetronome]);

  useEffect(() => () => stopAudio(), [stopAudio]);

  // Broadcast playing state so LarkChat (and any other globals) can hide
  // their floating UI while a session is active. We use a window event
  // instead of a context to avoid wiring a provider through the whole app.
  useEffect(() => {
    const playing = mode === 'playing' || mode === 'countdown';
    window.dispatchEvent(new CustomEvent('lark:song-state', { detail: { playing } }));
    return () => {
      window.dispatchEvent(new CustomEvent('lark:song-state', { detail: { playing: false } }));
    };
  }, [mode]);

  const advanceNote = useCallback((hit: boolean, centsOff: number | null) => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
    setWrongFlash(false);
    // Disarm only on a HIT: a sustained ringing note must release before we
    // can match the next same-pitch song note. On a miss-by-timeout, there's
    // no correct sustained note to filter out, so keep armed so the user can
    // immediately pick up on the next note.
    if (hit) armedRef.current = false;

    const idx = noteIndexRef.current;
    const timingMs = hit && noteStartTimeRef.current > 0
      ? performance.now() - noteStartTimeRef.current
      : null;

    const updated = [...sessionNotesRef.current];
    updated[idx] = { ...updated[idx], result: hit ? 'hit' : 'miss', centsOff, timingMs };
    sessionNotesRef.current = updated;
    setNotes([...updated]);

    // Real-time timing pill: classify the hit and surface it. The pill clears
    // when the next note advances so each note feels independent.
    if (hit && timingMs !== null && idx > 0) {
      setLastTiming(classifyTiming(timingMs, song.bpm));
    } else {
      setLastTiming(null);
    }

    const next = idx + 1;
    noteIndexRef.current = next;
    setNoteIndex(next);
    noteStartTimeRef.current = performance.now();


    if (next >= updated.length) {
      setMode('finished');
      stopAudio();
      return;
    }

    advancedRef.current = false;
    // Recursive self-schedule: the lint rule flags "use before declared" but
    // this is the standard pattern for scheduling the next miss-timeout.
    // eslint-disable-next-line react-hooks/immutability
    timeoutRef.current = setTimeout(() => advanceNote(false, null), noteTimeoutMs(song.bpm));
  }, [stopAudio, song.bpm]);

  const detect = useCallback(() => {
    const analyser = analyserRef.current;
    const detector = detectorRef.current;
    const input = inputRef.current;
    const ctx = ctxRef.current;
    if (!analyser || !detector || !input || !ctx) return;

    analyser.getFloatTimeDomainData(input as Float32Array<ArrayBuffer>);
    const [pitch, clarity] = detector.findPitch(input, ctx.sampleRate);

    // Track release windows. A "release" is at least RELEASE_FRAMES of
    // sub-threshold clarity (the attack transient of the next pluck, or silence
    // between notes). Without a release, the same sustained note won't double-fire.
    if (clarity < CLARITY_THRESHOLD) {
      releaseFramesRef.current++;
      if (releaseFramesRef.current >= RELEASE_FRAMES) {
        armedRef.current = true;
      }
    } else {
      releaseFramesRef.current = 0;
    }

    const idx = noteIndexRef.current;
    const target = sessionNotesRef.current[idx];

    // Chord-strum mode: compute chromagram alongside, match by chord name.
    // We need a sustained signal (strumming rings out), so chordHistory keeps
    // ~10 frames for averaging stability.
    if (target?.chord && freqDataRef.current) {
      analyser.getFloatFrequencyData(freqDataRef.current as Float32Array<ArrayBuffer>);
      const frame = buildChromagram(freqDataRef.current, ctx.sampleRate, analyser.fftSize);
      chordHistoryRef.current.push(frame);
      if (chordHistoryRef.current.length > 10) chordHistoryRef.current.shift();
      if (chordHistoryRef.current.length >= 4 && target.result === 'pending' && armedRef.current) {
        const avg = chordHistoryRef.current[0].map((_, i) =>
          chordHistoryRef.current.reduce((s, h) => s + h[i], 0) / chordHistoryRef.current.length
        );
        const detected = detectChordFromChroma(avg);
        if (detected && chordMatches(detected, target.chord)) {
          // Clear the chord history so the next chord starts from a clean slate.
          chordHistoryRef.current = [];
          advanceNote(true, 0);
        }
      }
    } else if (clarity > CLARITY_THRESHOLD && pitch > 60 && pitch < 1400) {
      // Single-note path (existing logic).
      if (target && target.result === 'pending' && !target.chord) {
        const cents = getCents(pitch, target.midi);
        if (Math.abs(cents) <= TOLERANCE_CENTS) {
          if (armedRef.current) {
            advanceNote(true, cents);
          }
        } else {
          setWrongFlash(true);
          if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
          wrongTimerRef.current = setTimeout(() => setWrongFlash(false), 350);
        }
      }
    }

    if (ctxRef.current) {
      // Recursive RAF: standard pattern, lint rule misfires here.
      // eslint-disable-next-line react-hooks/immutability
      rafRef.current = requestAnimationFrame(detect);
    }
  }, [advanceNote]);

  const startSession = async () => {
    setMicError(null);
    setFeedback(null);
    const sessionNotes: SessionNote[] = song.notes.map(sn => ({
      string: sn.string,
      fret: sn.fret,
      midi: sn.midi,
      chord: sn.chord,
      result: 'pending',
      centsOff: null,
      timingMs: null,
    }));
    sessionNotesRef.current = sessionNotes;
    setNotes(sessionNotes);
    noteIndexRef.current = 0;
    setNoteIndex(0);
    advancedRef.current = false;
    armedRef.current = true;
    releaseFramesRef.current = 0;
    setWrongFlash(false);
    setCurrentBeat(-1);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      // If the component unmounted while waiting for the user to grant mic
      // permission, immediately release the stream instead of leaking it.
      if (!mountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      streamRef.current = stream;
      const ctx = new AudioContext();
      if (!mountedRef.current) {
        ctx.close().catch(() => {});
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      const analyser = ctx.createAnalyser();
      // Bigger FFT when the song has chord events: chromagram quality
      // benefits from more freq bins. Single-note songs stay at 2048 to keep
      // Pitchy's autocorrelation responsive.
      const hasChords = song.notes.some(n => n.chord);
      analyser.fftSize = hasChords ? 4096 : 2048;
      ctx.createMediaStreamSource(stream).connect(analyser);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);
      inputRef.current = new Float32Array(detectorRef.current.inputLength);
      freqDataRef.current = hasChords ? new Float32Array(analyser.frequencyBinCount) : null;
      chordHistoryRef.current = [];

      setMode('countdown');
      setCountdown(3);

      // Play a count-in click at each countdown tick so the beginner has a
      // tempo to lock onto before the first note arrives. Higher pitch on the
      // final "go" beat for distinction.
      const playCountInClick = (final: boolean) => {
        const audioCtx = ctxRef.current;
        if (!audioCtx) return;
        const when = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(final ? 1320 : 660, when);
        gain.gain.setValueAtTime(final ? 0.45 : 0.32, when);
        gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.06);
        osc.start(when);
        osc.stop(when + 0.08);
      };
      playCountInClick(false);

      const tick = (c: number) => {
        if (c <= 0) {
          setMode('playing');
          noteStartTimeRef.current = performance.now();
          rafRef.current = requestAnimationFrame(detect);
          timeoutRef.current = setTimeout(() => advanceNote(false, null), noteTimeoutMs(song.bpm));

          // Start metronome on the pitch-detection AudioContext via the
          // shared scheduler. setCurrentBeat is RAF-buffered inside so we
          // never thrash React from inside the schedule hot path.
          metroRef.current = startMetronome(ctx, { bpm: song.bpm, onBeat: setCurrentBeat });
          return;
        }
        countdownTimerRef.current = setTimeout(() => {
          setCountdown(c - 1);
          playCountInClick(c - 1 === 0);
          tick(c - 1);
        }, 1000);
      };
      tick(3);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setMicError('Microphone access denied. Click the lock icon in your address bar, allow Microphone, then reload the page.');
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setMicError('No microphone found. Plug one in and try again.');
      } else {
        setMicError('Could not access microphone. Try reloading the page.');
      }
    }
  };

  const reset = () => {
    stopAudio();
    setMode('idle');
    setNotes([]);
    setNoteIndex(0);
    setFeedback(null);
    setLoadingFeedback(false);
    setWrongFlash(false);
    setCurrentBeat(-1);
  };

  useEffect(() => {
    if (mode !== 'finished') return;
    const finalNotes = sessionNotesRef.current;
    // Empty notes guard: a corrupted song with zero notes would yield 0/0=NaN
    // and persist "NaN%" to localStorage. Skip the side effects entirely.
    if (finalNotes.length === 0) return;
    const hits = finalNotes.filter(n => n.result === 'hit').length;
    const accuracy = Math.round((hits / finalNotes.length) * 100);
    try {
      saveSession({ songTitle: song.title, artist: song.artist, accuracy, hits, total: finalNotes.length, completedAt: new Date().toISOString() });
    } catch {}
    setIsSaved(getSavedSongs().some(s => s.title === song.title && s.artist === song.artist));
    setLoadingFeedback(true);
    const controller = new AbortController();
    // 30s timeout on the coach API. A hung network would otherwise spin the
    // VinylLoader indefinitely; this surfaces a clear failure.
    const timeoutId = setTimeout(() => controller.abort(), 30_000);
    let cancelled = false;
    fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        song: song.title,
        bpm: song.bpm,
        events: finalNotes.map(n => {
          // Normalize MIDI modulo into positive range so n.midi < 0 doesn't index undefined.
          const noteName = NOTE_NAMES[((n.midi % 12) + 12) % 12] + (Math.floor(n.midi / 12) - 1);
          return { expected: noteName, hit: n.result === 'hit', centsOff: n.centsOff, timingMs: n.timingMs };
        }),
        totalNotes: finalNotes.length,
        hits,
      }),
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error(`Coach API error: ${r.status}`);
        return r.json();
      })
      .then(data => { if (!cancelled) setFeedback(data.feedback ?? null); })
      .catch(err => {
        if (cancelled) return;
        if (err.name === 'AbortError') {
          setFeedback('Feedback timed out. Try playing again or check your connection.');
        } else {
          setFeedback('Could not load feedback. Check your connection and try again.');
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
        if (!cancelled) setLoadingFeedback(false);
      });
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [mode, song.title, song.artist, song.bpm]);

  const hits = notes.filter(n => n.result === 'hit').length;
  const played = notes.filter(n => n.result !== 'pending').length;
  const accuracy = played > 0 ? Math.round((hits / played) * 100) : null;

  // Beat-aware timing breakdown. Counts hit notes by bucket:
  //   on   : played within 1 beat of the previous note (right on tempo)
  //   late : 1-2 beats (hesitant but in the pocket)
  //   slow : 2+ beats (off-tempo, but still a hit)
  const hitNotes = notes.filter(n => n.result === 'hit' && n.timingMs !== null);
  const timingCounts: Record<TimingBucket, number> = { on: 0, late: 0, slow: 0 };
  for (const n of hitNotes) timingCounts[classifyTiming(n.timingMs!, song.bpm)]++;
  const timingPct = hitNotes.length > 0 ? Math.round((timingCounts.on / hitNotes.length) * 100) : null;

  const currentNote = notes[noteIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px', minHeight: '60vh' }}>
      <style>{`
        @keyframes noteCountdown {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes pillIn {
          from { opacity: 0; transform: translateY(4px) scale(0.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* IDLE */}
      {mode === 'idle' && (
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <p className="eyebrow" style={{ marginBottom: 16 }}>SONG MODE</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <SongCover song={song} size={120} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(24px, 6vw, 38px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 6 }}>
            {song.title}
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text3)', marginBottom: 6 }}>
            {song.artist} {'·'} {song.notes.length} notes
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 32 }}>
            {song.bpm} BPM
          </p>
          <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 36 }}>
            Play each highlighted note. Lark keeps the beat and gives AI feedback when you finish.
          </p>
          {micError && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--danger)', marginBottom: 16 }}>{micError}</p>}
          <button onClick={startSession} className="btn btn-accent btn-lg" aria-label={`Start playing ${song.title}`}>
            <span className="btn-text">START</span>
          </button>
        </div>
      )}

      {/* COUNTDOWN */}
      {mode === 'countdown' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text3)', letterSpacing: '0.14em', marginBottom: 24 }}>GET READY</p>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(80px, 22vw, 140px)', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
            {countdown || '!'}
          </div>
        </div>
      )}

      {/* PLAYING */}
      {mode === 'playing' && notes.length > 0 && (
        <div style={{ width: '100%', maxWidth: 600 }}>

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
              <button
                onClick={reset}
                aria-label="Stop and go back"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 44, height: 44, padding: 0, borderRadius: 8,
                  background: 'transparent', border: '0.5px solid var(--border)',
                  color: 'var(--text2)', cursor: 'pointer', flexShrink: 0,
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="6" width="12" height="12" rx="1.5"/>
                </svg>
              </button>
              <p className="eyebrow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{song.title.toUpperCase()}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              {accuracy !== null && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                  color: accuracy >= 80 ? 'var(--accent)' : accuracy >= 50 ? 'var(--sharp)' : 'var(--danger)',
                }}>
                  {accuracy}%
                </span>
              )}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                {noteIndex + 1} / {notes.length}
              </span>
            </div>
          </div>

          {/* Beat indicator */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            {[0, 1, 2, 3].map(i => {
              const isActive = currentBeat === i;
              const isAccent = i === 0;
              return (
                <div
                  key={i}
                  style={{
                    width: isAccent ? 16 : 12,
                    height: isAccent ? 16 : 12,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: isActive
                      ? (isAccent ? 'var(--accent)' : 'rgba(var(--accent-rgb), 0.55)')
                      : 'var(--bg3)',
                    boxShadow: isActive
                      ? (isAccent ? '0 0 12px rgba(var(--accent-rgb), 0.65)' : '0 0 6px rgba(var(--accent-rgb), 0.3)')
                      : 'none',
                    border: `1.5px solid ${isActive ? 'var(--accent-border)' : 'var(--border2)'}`,
                    transition: 'background 0.05s, box-shadow 0.05s, border-color 0.05s',
                  }}
                />
              );
            })}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginLeft: 6, letterSpacing: '0.1em' }}>
              {song.bpm} BPM
            </span>
          </div>

          {/* Current note */}
          {currentNote && (
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-muted)', marginBottom: 6 }}>
                PLAY NOW
              </p>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(52px, 14vw, 80px)',
                fontWeight: 700,
                lineHeight: 1,
                color: wrongFlash ? 'var(--danger)' : 'var(--accent)',
                transition: 'color 0.1s',
                animation: wrongFlash ? 'none' : 'accentRing 1.4s ease-out infinite',
              }}>
                {currentNote.chord ? currentNote.chord : currentNote.fret === 0 ? 'Open' : ordinalFret(currentNote.fret)}
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: wrongFlash ? 'var(--danger)' : 'var(--text3)', marginTop: 6, transition: 'color 0.1s' }}>
                {currentNote.chord ? 'Strum the chord' : STRING_DESCRIPTIONS[currentNote.string - 1]}
              </p>
              {wrongFlash && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--danger)', marginTop: 4, letterSpacing: '0.1em' }}>
                  WRONG NOTE
                </p>
              )}

              {/* Real-time timing pill: shows EARLY / ON / LATE after each
                  hit so the user can correct tempo on the fly. */}
              {!wrongFlash && lastTiming && (
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
                    padding: '3px 9px', borderRadius: 99,
                    background: lastTiming === 'on' ? 'var(--accent-dim)' : lastTiming === 'late' ? 'rgba(245,158,11,0.12)' : 'rgba(96,165,250,0.12)',
                    color: lastTiming === 'on' ? 'var(--accent)' : lastTiming === 'late' ? 'var(--sharp)' : 'var(--flat)',
                    border: `0.5px solid ${lastTiming === 'on' ? 'var(--accent-border)' : lastTiming === 'late' ? 'rgba(245,158,11,0.3)' : 'rgba(96,165,250,0.3)'}`,
                    animation: 'pillIn 0.25s ease-out',
                  }}>
                    {lastTiming === 'on' ? 'ON BEAT' : lastTiming === 'late' ? 'LATE' : 'SLOW'}
                  </span>
                </div>
              )}

              {/* Countdown bar */}
              <div style={{ width: '100%', maxWidth: 200, margin: '14px auto 0', height: 3, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}>
                <div
                  key={noteIndex}
                  style={{
                    height: '100%',
                    background: 'var(--accent)',
                    borderRadius: 99,
                    animation: `noteCountdown ${noteTimeoutMs(song.bpm)}ms linear forwards`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Scrolling tab staff */}
          <div style={{ width: '100%', background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '12px 0', overflow: 'hidden' }}>
            <TabStaff
              notes={notes}
              currentIndex={noteIndex}
              wrongFlash={wrongFlash}
            />
          </div>
        </div>
      )}

      {/* FINISHED */}
      {mode === 'finished' && (
        <div style={{ width: '100%', maxWidth: 560 }}>
          <div style={{ background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 14, marginBottom: 20, opacity: 0.5, padding: '12px 0', overflow: 'hidden' }}>
            <TabStaff notes={notes} currentIndex={notes.length - 1} wrongFlash={false} />
          </div>

          {/* Score card */}
          <div style={{ padding: '28px 26px', background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 16, marginBottom: 16, textAlign: 'center' }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>SESSION COMPLETE</p>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(48px, 14vw, 72px)',
              fontWeight: 700,
              color: hits / notes.length >= 0.8 ? 'var(--accent)' : hits / notes.length >= 0.5 ? 'var(--sharp)' : 'var(--danger)',
              lineHeight: 1,
              marginBottom: 8,
            }}>
              {Math.round((hits / notes.length) * 100)}%
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)', marginBottom: timingPct !== null ? 10 : 0 }}>
              {hits} / {notes.length} notes correct
            </p>
            {timingPct !== null && (
              <>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 12 }}>
                  {timingPct}% on the beat {'·'} {song.bpm} BPM
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <TimingPill label="ON BEAT" count={timingCounts.on} total={hitNotes.length} color="var(--accent)" />
                  <TimingPill label="LATE" count={timingCounts.late} total={hitNotes.length} color="var(--sharp)" />
                  <TimingPill label="SLOW" count={timingCounts.slow} total={hitNotes.length} color="var(--text-muted)" />
                </div>
              </>
            )}
          </div>

          {/* AI Coach */}
          <div style={{ padding: '22px 24px', background: 'var(--card-bg)', border: '0.5px solid var(--accent-border)', borderRadius: 14, marginBottom: 24 }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>AI COACH</p>
            {loadingFeedback ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '4px 0' }}>
                <VinylLoader size={44} />
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', letterSpacing: '0.08em', marginBottom: 2 }}>ANALYZING YOUR SESSION</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Reviewing pitch and timing</p>
                </div>
              </div>
            ) : feedback ? (
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{feedback}</p>
            ) : (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>No feedback available.</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={reset} className="btn btn-ghost">
              <span className="btn-text">TRY AGAIN</span>
            </button>
            {!isSaved ? (
              <button className="btn btn-outline" onClick={() => { saveSong(song); setIsSaved(true); }}>
                <span className="btn-text">SAVE TO LIBRARY</span>
              </button>
            ) : (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                SAVED
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TimingPill({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ textAlign: 'center', minWidth: 64 }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>
        {count}
      </p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
        {label} {pct}%
      </p>
    </div>
  );
}
