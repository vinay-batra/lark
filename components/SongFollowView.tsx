'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PitchDetector } from 'pitchy';
import { Song } from '@/lib/songs';
import { TabView } from './TabView';
import { saveSession, saveSong, getSavedSongs } from '@/lib/practice';

const TOLERANCE_CENTS = 100;
const CLARITY_THRESHOLD = 0.88;
const NOTE_TIMEOUT_MS = 4000;
const NOTES_PER_LINE = 10;

function midiToFreq(midi: number) { return 440 * Math.pow(2, (midi - 69) / 12); }
function getCents(freq: number, targetMidi: number) {
  return Math.round(1200 * Math.log2(freq / midiToFreq(targetMidi)));
}

type NoteResult = 'pending' | 'hit' | 'miss';
type Mode = 'idle' | 'countdown' | 'playing' | 'finished';

interface SessionNote {
  string: number;
  fret: number;
  midi: number;
  result: NoteResult;
  centsOff: number | null;
}

export function SongFollowView({ song }: { song: Song }) {
  const [mode, setMode] = useState<Mode>('idle');
  const [countdown, setCountdown] = useState(3);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [noteIndex, setNoteIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0); // which line (group of NOTES_PER_LINE) is visible
  const [wrongFlash, setWrongFlash] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const rafRef = useRef<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const detectorRef = useRef<PitchDetector<Float32Array> | null>(null);
  const inputRef = useRef<Float32Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIndexRef = useRef(0);
  const sessionNotesRef = useRef<SessionNote[]>([]);
  const advancedRef = useRef(false);

  const stopAudio = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
    ctxRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    rafRef.current = null; ctxRef.current = null; analyserRef.current = null; streamRef.current = null;
  }, []);

  useEffect(() => () => stopAudio(), [stopAudio]);

  const advanceNote = useCallback((hit: boolean, centsOff: number | null) => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
    setWrongFlash(false);

    const idx = noteIndexRef.current;
    const updated = [...sessionNotesRef.current];
    updated[idx] = { ...updated[idx], result: hit ? 'hit' : 'miss', centsOff };
    sessionNotesRef.current = updated;
    setNotes([...updated]);

    const next = idx + 1;
    noteIndexRef.current = next;
    setNoteIndex(next);

    // Advance line when we cross a line boundary
    const newLine = Math.floor(next / NOTES_PER_LINE);
    setLineIndex(newLine);

    if (next >= updated.length) {
      setMode('finished');
      stopAudio();
      return;
    }

    advancedRef.current = false;
    timeoutRef.current = setTimeout(() => advanceNote(false, null), NOTE_TIMEOUT_MS);
  }, [stopAudio]);

  const detect = useCallback(() => {
    const analyser = analyserRef.current;
    const detector = detectorRef.current;
    const input = inputRef.current;
    const ctx = ctxRef.current;
    if (!analyser || !detector || !input || !ctx) return;

    analyser.getFloatTimeDomainData(input as Float32Array<ArrayBuffer>);
    const [pitch, clarity] = detector.findPitch(input, ctx.sampleRate);

    if (clarity > CLARITY_THRESHOLD && pitch > 60 && pitch < 1400) {
      const idx = noteIndexRef.current;
      const target = sessionNotesRef.current[idx];
      if (target && target.result === 'pending') {
        const cents = getCents(pitch, target.midi);
        if (Math.abs(cents) <= TOLERANCE_CENTS) {
          advanceNote(true, cents);
          return;
        } else {
          // Wrong note -- flash red but stay on current note
          setWrongFlash(true);
          if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
          wrongTimerRef.current = setTimeout(() => setWrongFlash(false), 350);
        }
      }
    }

    if (ctxRef.current) {
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
      result: 'pending',
      centsOff: null,
    }));
    sessionNotesRef.current = sessionNotes;
    setNotes(sessionNotes);
    noteIndexRef.current = 0;
    setNoteIndex(0);
    setLineIndex(0);
    advancedRef.current = false;
    setWrongFlash(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(analyser);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);
      inputRef.current = new Float32Array(detectorRef.current.inputLength);

      setMode('countdown');
      setCountdown(3);

      const tick = (c: number) => {
        if (c <= 0) {
          setMode('playing');
          rafRef.current = requestAnimationFrame(detect);
          timeoutRef.current = setTimeout(() => advanceNote(false, null), NOTE_TIMEOUT_MS);
          return;
        }
        setTimeout(() => { setCountdown(c - 1); tick(c - 1); }, 1000);
      };
      tick(3);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setMicError('Microphone access denied.');
      } else {
        setMicError('Could not access microphone.');
      }
    }
  };

  const reset = () => {
    stopAudio();
    setMode('idle');
    setNotes([]);
    setNoteIndex(0);
    setLineIndex(0);
    setFeedback(null);
    setLoadingFeedback(false);
    setWrongFlash(false);
  };

  useEffect(() => {
    if (mode !== 'finished') return;
    const finalNotes = sessionNotesRef.current;
    const hits = finalNotes.filter(n => n.result === 'hit').length;
    const accuracy = Math.round((hits / finalNotes.length) * 100);
    // Save session to localStorage
    try {
      saveSession({ songTitle: song.title, artist: song.artist, accuracy, hits, total: finalNotes.length, completedAt: new Date().toISOString() });
    } catch {}
    // Check if already saved
    setIsSaved(getSavedSongs().some(s => s.title === song.title && s.artist === song.artist));
    setLoadingFeedback(true);
    fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        song: song.title,
        events: finalNotes.map(n => ({ expected: `str${n.string} fret${n.fret}`, hit: n.result === 'hit', centsOff: n.centsOff })),
        totalNotes: finalNotes.length,
        hits,
      }),
    })
      .then(r => r.json())
      .then(data => setFeedback(data.feedback ?? null))
      .catch(() => {})
      .finally(() => setLoadingFeedback(false));
  }, [mode, song.title]);

  const hits = notes.filter(n => n.result === 'hit').length;
  const played = notes.filter(n => n.result !== 'pending').length;
  const accuracy = played > 0 ? Math.round((hits / played) * 100) : null;

  const lineStart = lineIndex * NOTES_PER_LINE;
  const lineEnd = Math.min(lineStart + NOTES_PER_LINE, notes.length);
  const lineNotes = notes.slice(lineStart, lineEnd);
  const currentInLine = noteIndex - lineStart;
  const currentNote = notes[noteIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px', minHeight: '60vh' }}>

      {/* IDLE */}
      {mode === 'idle' && (
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <p className="eyebrow" style={{ marginBottom: 16 }}>SONG MODE</p>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(24px, 6vw, 38px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 6 }}>
            {song.title}
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text3)', marginBottom: 32 }}>
            {song.artist} &mdash; {song.notes.length} notes
          </p>
          <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 36 }}>
            Play each highlighted note. Lark scores you in real time and gives feedback at the end.
          </p>
          {micError && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--danger)', marginBottom: 16 }}>{micError}</p>}
          <button onClick={startSession} className="btn btn-accent btn-lg">
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
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <p className="eyebrow">{song.title.toUpperCase()}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {accuracy !== null && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: accuracy >= 80 ? 'var(--accent)' : accuracy >= 50 ? 'var(--sharp)' : 'var(--danger)' }}>
                  {accuracy}%
                </span>
              )}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                {noteIndex + 1} / {notes.length}
              </span>
            </div>
          </div>

          {/* Current note big display */}
          {currentNote && (
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
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
                {currentNote.fret === 0 ? 'Open' : `Fret ${currentNote.fret}`}
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: wrongFlash ? 'var(--danger)' : 'var(--text3)', marginTop: 6, transition: 'color 0.1s' }}>
                {['e','B','G','D','A','E'][currentNote.string - 1]} string
              </p>
              {wrongFlash && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--danger)', marginTop: 4, letterSpacing: '0.1em' }}>
                  WRONG NOTE
                </p>
              )}
            </div>
          )}

          {/* Tab display with line transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={lineIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: '16px 14px',
                background: 'var(--card-bg)',
                border: '0.5px solid var(--border)',
                borderRadius: 14,
              }}
            >
              <TabView
                notes={lineNotes}
                currentIndex={currentInLine}
                wrongFlash={wrongFlash}
              />
              {/* Line progress dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 12 }}>
                {Array.from({ length: Math.ceil(notes.length / NOTES_PER_LINE) }).map((_, i) => (
                  <div key={i} style={{
                    width: i === lineIndex ? 16 : 5,
                    height: 5,
                    borderRadius: 99,
                    background: i < lineIndex ? 'var(--accent)' : i === lineIndex ? 'var(--accent)' : 'var(--border2)',
                    opacity: i === lineIndex ? 1 : 0.5,
                    transition: 'all 0.25s',
                  }} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* FINISHED */}
      {mode === 'finished' && (
        <div style={{ width: '100%', maxWidth: 560 }}>
          {/* Final tab view (last line) */}
          <div style={{ padding: '14px', background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 14, marginBottom: 20, opacity: 0.7 }}>
            <TabView notes={lineNotes} currentIndex={-1} wrongFlash={false} />
          </div>

          {/* Score */}
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
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>
              {hits} / {notes.length} notes
            </p>
          </div>

          {/* AI Feedback */}
          <div style={{ padding: '22px 24px', background: 'var(--card-bg)', border: '0.5px solid var(--accent-border)', borderRadius: 14, marginBottom: 24 }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>AI COACH</p>
            {loadingFeedback ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1s ease-in-out infinite' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>ANALYZING...</span>
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
              <button
                className="btn btn-outline"
                onClick={() => { saveSong(song); setIsSaved(true); }}
              >
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
