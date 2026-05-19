'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PitchDetector } from 'pitchy';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const STRINGS = [
  { label: 'E', note: 'E', octave: 2, freq: 82.41, num: 6 },
  { label: 'A', note: 'A', octave: 2, freq: 110.0, num: 5 },
  { label: 'D', note: 'D', octave: 3, freq: 146.83, num: 4 },
  { label: 'G', note: 'G', octave: 3, freq: 196.0, num: 3 },
  { label: 'B', note: 'B', octave: 3, freq: 246.94, num: 2 },
  { label: 'e', note: 'E', octave: 4, freq: 329.63, num: 1 },
];

function freqToMidi(freq: number) { return Math.round(12 * Math.log2(freq / 440) + 69); }
function midiToFreq(midi: number) { return 440 * Math.pow(2, (midi - 69) / 12); }
function getCents(freq: number, midi: number) { return Math.round(1200 * Math.log2(freq / midiToFreq(midi))); }

function getMicError(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError') return 'Microphone access denied. Allow permission in your browser settings.';
    if (err.name === 'NotFoundError') return 'No microphone found. Plug one in and try again.';
    if (err.name === 'NotReadableError') return 'Microphone is in use by another app. Close it and retry.';
    if (err.name === 'OverconstrainedError') return 'Microphone does not meet requirements.';
  }
  return 'Could not access microphone. Try a different browser.';
}

interface Detected { note: string; octave: number; cents: number; freq: number; }

export function TunerView() {
  const [listening, setListening] = useState(false);
  const [detected, setDetected] = useState<Detected | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rafRef = useRef<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const detectorRef = useRef<PitchDetector<Float32Array> | null>(null);
  const inputRef = useRef<Float32Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    ctxRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    rafRef.current = null; ctxRef.current = null; analyserRef.current = null; streamRef.current = null;
    setListening(false); setDetected(null);
  }, []);

  const detect = useCallback(() => {
    const analyser = analyserRef.current;
    const detector = detectorRef.current;
    const input = inputRef.current;
    const ctx = ctxRef.current;
    if (!analyser || !detector || !input || !ctx) return;
    analyser.getFloatTimeDomainData(input as Float32Array<ArrayBuffer>);
    const [pitch, clarity] = detector.findPitch(input, ctx.sampleRate);
    if (clarity > 0.92 && pitch > 60 && pitch < 1400) {
      const midi = freqToMidi(pitch);
      const note = NOTES[midi % 12];
      const octave = Math.floor(midi / 12) - 1;
      const cents = getCents(pitch, midi);
      setDetected({ note, octave, cents, freq: Math.round(pitch * 10) / 10 });
    }
    rafRef.current = requestAnimationFrame(detect);
  }, []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(analyser);
      ctxRef.current = ctx; analyserRef.current = analyser;
      detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);
      inputRef.current = new Float32Array(detectorRef.current.inputLength);
      setListening(true);
      rafRef.current = requestAnimationFrame(detect);
    } catch (err) {
      setError(getMicError(err));
    }
  };

  useEffect(() => () => stop(), [stop]);

  const cents = detected?.cents ?? 0;
  const inTune = !!detected && Math.abs(cents) < 5;
  const close = !!detected && Math.abs(cents) < 15;
  const noteColor = !detected ? 'var(--text-muted)'
    : inTune ? 'var(--accent)' : close ? 'var(--sharp)' : 'var(--danger)';
  const meterPx = Math.max(-48, Math.min(48, cents)) * 3;
  const activeStrings = detected
    ? STRINGS.filter(s => Math.abs(1200 * Math.log2(detected.freq / s.freq)) < 50)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', minHeight: '60vh' }}>
      {/* Note */}
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: noteColor, lineHeight: 1, marginBottom: 8, transition: 'color 0.1s', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
        <span style={{ fontSize: 'clamp(64px, 20vw, 112px)' }}>{detected?.note ?? '--'}</span>
        {detected && <span style={{ fontSize: 'clamp(24px, 8vw, 40px)', marginTop: '16%', color: noteColor, opacity: 0.7 }}>{detected.octave}</span>}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text3)', marginBottom: 44, letterSpacing: '0.04em' }}>
        {detected ? `${detected.freq} Hz` : '--- Hz'}
      </div>

      {/* Meter */}
      <div style={{ width: 'min(100%, 320px)', marginBottom: 10, padding: '0 4px' }}>
        <div style={{ position: 'relative', height: 4, background: 'var(--bg3)', borderRadius: 2 }}>
          <div style={{ position: 'absolute', left: '50%', top: -3, transform: 'translateX(-50%)', width: 18, height: 10, background: 'var(--accent-border)', borderRadius: 2 }} />
          {detected && (
            <div style={{ position: 'absolute', top: '50%', left: `calc(50% + ${meterPx}px)`, transform: 'translate(-50%, -50%)', width: 4, height: 22, background: noteColor, borderRadius: 2, boxShadow: `0 0 10px ${noteColor}80`, transition: 'left 0.07s, background 0.1s' }} />
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>FLAT</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: detected ? noteColor : 'var(--text-muted)', transition: 'color 0.1s' }}>
            {detected ? `${cents > 0 ? '+' : ''}${cents} cents` : '0 cents'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>SHARP</span>
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', color: inTune ? 'var(--accent)' : 'transparent', marginBottom: 44, height: 16, transition: 'color 0.2s' }}>
        IN TUNE
      </div>

      {/* Strings */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 44, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 320 }}>
        {STRINGS.map(s => {
          const isActive = activeStrings.some(a => a.num === s.num);
          return (
            <div key={s.num} style={{ width: 46, height: 58, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, border: isActive ? `1px solid ${noteColor}` : '1px solid var(--border)', background: isActive ? (inTune ? 'var(--accent-dim)' : close ? 'var(--sharp-dim)' : 'var(--danger-dim)') : 'var(--card-bg)', transition: 'all 0.12s' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: isActive ? noteColor : 'var(--text2)', transition: 'color 0.12s' }}>{s.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>{s.note}{s.octave}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>str {s.num}</span>
            </div>
          );
        })}
      </div>

      {error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--danger)', marginBottom: 20, textAlign: 'center', maxWidth: 'min(100%, 320px)', lineHeight: 1.55 }}>{error}</p>}

      <button
        onClick={listening ? stop : start}
        aria-pressed={listening}
        style={{ padding: '14px 52px', borderRadius: 9999, border: listening ? '1px solid var(--border2)' : 'none', background: listening ? 'var(--card-bg)' : 'var(--accent)', color: listening ? 'var(--text2)' : 'var(--bg)', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', transition: 'all 0.15s' }}
      >
        {listening ? 'STOP' : 'START TUNER'}
      </button>
    </div>
  );
}
