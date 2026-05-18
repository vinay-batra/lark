'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PitchDetector } from 'pitchy';
import { Song } from '@/lib/songs';

const TOLERANCE_CENTS = 100;
const CLARITY_THRESHOLD = 0.88;
const NOTE_TIMEOUT_MS = 4000;

function midiToFreq(midi: number) { return 440 * Math.pow(2, (midi - 69) / 12); }
function getCents(freq: number, targetMidi: number) {
  return Math.round(1200 * Math.log2(freq / midiToFreq(targetMidi)));
}

type NoteResult = 'pending' | 'hit' | 'miss';

interface SessionNote {
  note: string;
  midi: number;
  result: NoteResult;
  centsOff: number | null;
}

type Mode = 'idle' | 'countdown' | 'playing' | 'finished';

export function SongFollowView({ song }: { song: Song }) {
  const [mode, setMode] = useState<Mode>('idle');
  const [countdown, setCountdown] = useState(3);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [noteIndex, setNoteIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const rafRef = useRef<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const detectorRef = useRef<PitchDetector<Float32Array> | null>(null);
  const inputRef = useRef<Float32Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIndexRef = useRef(0);
  const sessionNotesRef = useRef<SessionNote[]>([]);
  const advancedRef = useRef(false);
  const noteChipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ribbonRef = useRef<HTMLDivElement | null>(null);

  const stopAudio = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    ctxRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    rafRef.current = null; ctxRef.current = null; analyserRef.current = null; streamRef.current = null;
  }, []);

  useEffect(() => () => stopAudio(), [stopAudio]);

  // Scroll current note chip into view
  useEffect(() => {
    noteChipRefs.current[noteIndex]?.scrollIntoView({
      behavior: noteIndex === 0 ? 'instant' : 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [noteIndex]);

  const advanceNote = useCallback((hit: boolean, centsOff: number | null) => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const idx = noteIndexRef.current;
    const updated = [...sessionNotesRef.current];
    updated[idx] = { ...updated[idx], result: hit ? 'hit' : 'miss', centsOff };
    sessionNotesRef.current = updated;
    setNotes([...updated]);

    const next = idx + 1;
    noteIndexRef.current = next;
    setNoteIndex(next);

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
    const sessionNotes: SessionNote[] = song.notes.map(sn => ({ ...sn, result: 'pending', centsOff: null }));
    sessionNotesRef.current = sessionNotes;
    setNotes(sessionNotes);
    noteIndexRef.current = 0;
    setNoteIndex(0);
    advancedRef.current = false;

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
        setTimeout(() => {
          setCountdown(c - 1);
          tick(c - 1);
        }, 1000);
      };
      tick(3);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setMicError('Microphone access denied. Allow permission in your browser settings.');
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setMicError('No microphone found.');
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
    setFeedback(null);
    setLoadingFeedback(false);
  };

  // Fetch AI feedback when session finishes
  useEffect(() => {
    if (mode !== 'finished') return;
    const finalNotes = sessionNotesRef.current;
    const hits = finalNotes.filter(n => n.result === 'hit').length;
    setLoadingFeedback(true);
    fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        song: song.title,
        events: finalNotes.map(n => ({ expected: n.note, hit: n.result === 'hit', centsOff: n.centsOff })),
        totalNotes: finalNotes.length,
        hits,
      }),
    })
      .then(r => r.json())
      .then(data => setFeedback(data.feedback ?? null))
      .catch(() => {})
      .finally(() => setLoadingFeedback(false));
  }, [mode, song.title]);

  const played = notes.filter(n => n.result !== 'pending').length;
  const hits = notes.filter(n => n.result === 'hit').length;
  const accuracy = played > 0 ? Math.round((hits / played) * 100) : null;
  const currentNote = notes[noteIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px', minHeight: '60vh', gap: 0 }}>

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
          <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 36, maxWidth: 360, margin: '0 auto 36px' }}>
            Play each highlighted note on your guitar. Lark listens and advances when it hears the right pitch. Each note has a 4-second window.
          </p>
          {micError && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--danger)', marginBottom: 20 }}>{micError}</p>
          )}
          <button onClick={startSession} className="btn btn-accent btn-lg">
            <span className="btn-text">START</span>
          </button>
        </div>
      )}

      {/* COUNTDOWN */}
      {mode === 'countdown' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text3)', letterSpacing: '0.14em', marginBottom: 24 }}>GET READY</p>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(80px, 22vw, 140px)',
            fontWeight: 700,
            color: 'var(--accent)',
            lineHeight: 1,
            animation: 'pulse 0.6s ease-in-out',
          }}>
            {countdown || '!'}
          </div>
        </div>
      )}

      {/* PLAYING */}
      {(mode === 'playing' || (mode === 'finished' && notes.length > 0)) && (
        <div style={{ width: '100%', maxWidth: 560 }}>
          {/* Score header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <p className="eyebrow">{song.title.toUpperCase()}</p>
            {accuracy !== null && (
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: 700,
                color: accuracy >= 80 ? 'var(--accent)' : accuracy >= 50 ? 'var(--sharp)' : 'var(--danger)',
              }}>
                {accuracy}%
              </span>
            )}
          </div>

          {/* Current note display */}
          {mode === 'playing' && currentNote && (
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-muted)', marginBottom: 8 }}>
                PLAY NOW
              </p>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(64px, 18vw, 96px)',
                fontWeight: 700,
                color: 'var(--accent)',
                lineHeight: 1,
                animation: 'accentRing 1.4s ease-out infinite',
              }}>
                {currentNote.note}
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 10, letterSpacing: '0.06em' }}>
                {noteIndex + 1} / {notes.length}
              </p>
            </div>
          )}

          {/* Note ribbon */}
          <div
            ref={ribbonRef}
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 6,
              scrollbarWidth: 'none',
            }}
          >
            {notes.map((note, i) => {
              const isCurrent = i === noteIndex && mode === 'playing';
              const isPast = note.result !== 'pending';
              const isFuture = !isPast && !isCurrent;
              return (
                <div
                  key={i}
                  ref={el => { noteChipRefs.current[i] = el; }}
                  style={{
                    flexShrink: 0,
                    width: isCurrent ? 64 : 48,
                    height: isCurrent ? 72 : 56,
                    borderRadius: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    border: isCurrent
                      ? '1.5px solid var(--accent)'
                      : note.result === 'hit'
                      ? '1px solid var(--accent-border)'
                      : note.result === 'miss'
                      ? '1px solid rgba(239,68,68,0.3)'
                      : '0.5px solid var(--border)',
                    background: note.result === 'hit'
                      ? 'var(--accent-dim)'
                      : note.result === 'miss'
                      ? 'var(--danger-dim)'
                      : isCurrent
                      ? 'var(--bg3)'
                      : 'var(--card-bg)',
                    opacity: isFuture && i > noteIndex + 4 ? 0.35 : 1,
                    transition: 'all 0.15s',
                    boxShadow: isCurrent ? 'var(--accent-glow)' : 'none',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: isCurrent ? 15 : 12,
                    fontWeight: 700,
                    color: note.result === 'hit'
                      ? 'var(--accent)'
                      : note.result === 'miss'
                      ? 'var(--danger)'
                      : isCurrent
                      ? 'var(--text)'
                      : 'var(--text3)',
                    transition: 'color 0.15s',
                    letterSpacing: '-0.01em',
                  }}>
                    {note.note}
                  </span>
                  {note.result === 'hit' && (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} />
                  )}
                  {note.result === 'miss' && (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--danger)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FINISHED */}
      {mode === 'finished' && (
        <div style={{ width: '100%', maxWidth: 560, marginTop: 32 }}>

          {/* Score card */}
          <div style={{
            padding: '28px 26px',
            background: 'var(--card-bg)',
            border: '0.5px solid var(--border)',
            borderRadius: 16,
            marginBottom: 20,
            textAlign: 'center',
          }}>
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

          {/* AI Feedback card */}
          <div style={{
            padding: '22px 24px',
            background: 'var(--card-bg)',
            border: '0.5px solid var(--accent-border)',
            borderRadius: 14,
            marginBottom: 24,
            minHeight: 80,
          }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>AI COACH</p>
            {loadingFeedback ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1s ease-in-out infinite' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                  ANALYZING...
                </span>
              </div>
            ) : feedback ? (
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{feedback}</p>
            ) : (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                No feedback available.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={reset} className="btn btn-ghost">
              <span className="btn-text">TRY AGAIN</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
