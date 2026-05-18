'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { detect as detectChord } from '@tonaljs/chord-detect';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const HISTORY_SIZE = 10;
const ACTIVE_THRESHOLD = 0.45;

function buildChromagram(freqData: Float32Array, sampleRate: number, fftSize: number): number[] {
  const chroma = new Array(12).fill(0);
  const binHz = sampleRate / fftSize;
  for (let i = 1; i < fftSize / 2; i++) {
    const freq = i * binHz;
    if (freq < 75 || freq > 1500) continue;
    const db = freqData[i];
    if (db < -72) continue;
    const amp = Math.pow(10, db / 20);
    const midi = 12 * Math.log2(freq / 440) + 69;
    const pc = ((Math.round(midi) % 12) + 12) % 12;
    chroma[pc] += amp;
  }
  const max = Math.max(...chroma);
  return max > 0 ? chroma.map(v => v / max) : chroma;
}

function avgChromagram(history: number[][]): number[] {
  const len = history.length;
  return history[0].map((_, i) => history.reduce((s, h) => s + h[i], 0) / len);
}

function formatChord(raw: string): string { return raw.replace(/^([A-G][#b]?)M$/, '$1'); }

function chordQuality(raw: string): string {
  if (/^[A-G][#b]?M$/.test(raw)) return 'major';
  if (/^[A-G][#b]?m$/.test(raw)) return 'minor';
  if (raw.includes('7')) return 'seventh';
  if (raw.includes('maj')) return 'major';
  if (raw.includes('dim')) return 'diminished';
  if (raw.includes('aug')) return 'augmented';
  if (raw.includes('sus')) return 'suspended';
  return '';
}

function getMicError(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError') return 'Microphone access denied. Allow permission in your browser settings.';
    if (err.name === 'NotFoundError') return 'No microphone found. Plug one in and try again.';
    if (err.name === 'NotReadableError') return 'Microphone is in use by another app. Close it and retry.';
  }
  return 'Could not access microphone. Try a different browser.';
}

interface ChordResult { name: string; quality: string; alternatives: string[]; notes: string[]; }

export function ChordsView() {
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<ChordResult | null>(null);
  const [chroma, setChroma] = useState<number[]>(new Array(12).fill(0));
  const [error, setError] = useState<string | null>(null);

  const rafRef = useRef<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const freqDataRef = useRef<Float32Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const historyRef = useRef<number[][]>([]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    ctxRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    rafRef.current = null; ctxRef.current = null; analyserRef.current = null; streamRef.current = null;
    historyRef.current = [];
    setListening(false); setResult(null); setChroma(new Array(12).fill(0));
  }, []);

  const analyze = useCallback(() => {
    const analyser = analyserRef.current;
    const freqData = freqDataRef.current;
    const ctx = ctxRef.current;
    if (!analyser || !freqData || !ctx) return;
    analyser.getFloatFrequencyData(freqData as Float32Array<ArrayBuffer>);
    const frame = buildChromagram(freqData, ctx.sampleRate, analyser.fftSize);
    historyRef.current.push(frame);
    if (historyRef.current.length > HISTORY_SIZE) historyRef.current.shift();
    if (historyRef.current.length < 4) { rafRef.current = requestAnimationFrame(analyze); return; }

    const avg = avgChromagram(historyRef.current);
    setChroma(avg);
    const activeNotes = NOTE_NAMES.filter((_, i) => avg[i] >= ACTIVE_THRESHOLD);

    if (activeNotes.length >= 2) {
      const detected = detectChord(activeNotes);
      if (detected.length > 0) {
        setResult({ name: formatChord(detected[0]), quality: chordQuality(detected[0]), alternatives: detected.slice(1, 4).map(formatChord), notes: activeNotes });
      } else { setResult(null); }
    } else { setResult(null); }

    rafRef.current = requestAnimationFrame(analyze);
  }, []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.8;
      ctx.createMediaStreamSource(stream).connect(analyser);
      ctxRef.current = ctx; analyserRef.current = analyser;
      freqDataRef.current = new Float32Array(analyser.frequencyBinCount);
      setListening(true);
      rafRef.current = requestAnimationFrame(analyze);
    } catch (err) {
      setError(getMicError(err));
    }
  };

  useEffect(() => () => stop(), [stop]);

  const hasChord = result !== null;
  const chordColor = !hasChord ? 'var(--text-muted)' : result.alternatives.length === 0 ? 'var(--accent)' : 'var(--sharp)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', minHeight: '60vh' }}>
      {/* Chord name */}
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(64px, 20vw, 112px)', fontWeight: 700, color: chordColor, lineHeight: 1, transition: 'color 0.15s', letterSpacing: '-2px' }}>
          {result?.name ?? '--'}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.15em', color: hasChord ? 'var(--text3)' : 'transparent', marginTop: 6, height: 16, transition: 'color 0.15s' }}>
          {result?.quality?.toUpperCase() ?? ''}
        </div>
      </div>

      {/* Notes */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 36, minHeight: 32, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 'min(100%, 480px)' }}>
        {(result?.notes ?? []).map(note => (
          <span key={note} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-dim)', border: '0.5px solid var(--accent-border)', borderRadius: 6, padding: '3px 9px', letterSpacing: '0.08em' }}>
            {note}
          </span>
        ))}
      </div>

      {/* Chromagram */}
      <div style={{ width: 'min(100%, 480px)', marginBottom: 36, padding: '0 4px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--text-muted)', marginBottom: 10, textAlign: 'center' }}>CHROMAGRAM</p>
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 56 }}>
          {NOTE_NAMES.map((note, i) => {
            const val = chroma[i];
            const active = val >= ACTIVE_THRESHOLD;
            return (
              <div key={note} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', height: Math.max(2, Math.round(val * 44)), background: active ? 'var(--accent)' : 'var(--bg3)', borderRadius: '3px 3px 0 0', transition: 'height 0.08s, background 0.15s', boxShadow: active ? `0 0 8px rgba(var(--accent-rgb), 0.4)` : 'none', marginTop: 'auto' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: note.includes('#') ? 6 : 7, color: active ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.15s', lineHeight: 1 }}>{note}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alternatives */}
      <div style={{ minHeight: 28, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
        {(result?.alternatives ?? []).length > 0 && (
          <>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>ALSO</span>
            {result!.alternatives.map(alt => (
              <span key={alt} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 6, padding: '3px 9px' }}>{alt}</span>
            ))}
          </>
        )}
      </div>

      {error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--danger)', marginBottom: 20, textAlign: 'center', maxWidth: 'min(100%, 320px)', lineHeight: 1.55 }}>{error}</p>}

      <button onClick={listening ? stop : start} className={`btn ${listening ? 'btn-ghost' : 'btn-accent'}`} style={{ fontSize: 13, padding: '14px 52px' }}>
        <span className="btn-text">{listening ? 'STOP' : 'START LISTENING'}</span>
      </button>

      {listening && !result && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 16, letterSpacing: '0.08em' }}>Play a chord...</p>}
    </div>
  );
}
