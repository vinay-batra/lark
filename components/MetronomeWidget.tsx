'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type TimeSig = '4/4' | '3/4' | '6/8';

function beatsForSig(sig: TimeSig): number {
  if (sig === '3/4') return 3;
  if (sig === '6/8') return 6;
  return 4;
}

function scheduleClick(ctx: AudioContext, when: number, isAccent: boolean) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(isAccent ? 880 : 440, when);
  gain.gain.setValueAtTime(isAccent ? 0.9 : 0.55, when);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.04);
  osc.start(when);
  osc.stop(when + 0.04);
}

function calcTapBpm(taps: number[]): number {
  if (taps.length < 2) return 120;
  const intervals: number[] = [];
  for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1]);
  const sorted = [...intervals].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  return Math.round(Math.min(300, Math.max(20, 60000 / median)));
}

export function MetronomeWidget() {
  const [open, setOpen] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [timeSig, setTimeSig] = useState<TimeSig>('4/4');
  const [running, setRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const schedulerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const bpmRef = useRef(bpm);
  const timeSigRef = useRef(timeSig);
  const rafRef = useRef<number | null>(null);
  const pendingBeatRef = useRef(-2);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tapTimesRef = useRef<number[]>([]);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { timeSigRef.current = timeSig; }, [timeSig]);

  const startRaf = useCallback(() => {
    const loop = () => {
      const pending = pendingBeatRef.current;
      if (pending !== -2) { setCurrentBeat(pending); pendingBeatRef.current = -2; }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const scheduler = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    while (nextNoteTimeRef.current < now + 0.1) {
      const beat = currentBeatRef.current;
      scheduleClick(ctx, nextNoteTimeRef.current, beat === 0);
      const delay = Math.max(0, (nextNoteTimeRef.current - now) * 1000);
      const b = beat;
      setTimeout(() => { pendingBeatRef.current = b; }, delay);
      nextNoteTimeRef.current += 60 / bpmRef.current;
      currentBeatRef.current = (beat + 1) % beatsForSig(timeSigRef.current);
    }
  }, []);

  const start = useCallback(() => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    currentBeatRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.05;
    pendingBeatRef.current = -2;
    scheduler();
    schedulerTimerRef.current = setInterval(scheduler, 25);
    startRaf();
    setRunning(true);
    setCurrentBeat(-1);
  }, [scheduler, startRaf]);

  const stop = useCallback(() => {
    if (schedulerTimerRef.current !== null) { clearInterval(schedulerTimerRef.current); schedulerTimerRef.current = null; }
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    stopRaf();
    setRunning(false);
    setCurrentBeat(-1);
    pendingBeatRef.current = -2;
  }, [stopRaf]);

  useEffect(() => {
    if (!running) return;
    currentBeatRef.current = 0;
    const ctx = audioCtxRef.current;
    if (ctx) nextNoteTimeRef.current = ctx.currentTime + 0.05;
  }, [timeSig, running]);

  useEffect(() => () => {
    if (schedulerTimerRef.current) clearInterval(schedulerTimerRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    audioCtxRef.current?.close();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const clampBpm = (v: number) => Math.min(300, Math.max(20, v));
  const adjustBpm = useCallback((d: number) => setBpm(prev => clampBpm(prev + d)), []);
  const startHold = useCallback((d: number) => {
    holdTimerRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(() => setBpm(prev => clampBpm(prev + d)), 80);
    }, 400);
  }, []);
  const endHold = useCallback(() => {
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
    if (holdIntervalRef.current) { clearInterval(holdIntervalRef.current); holdIntervalRef.current = null; }
  }, []);

  const handleTap = useCallback(() => {
    const now = performance.now();
    const taps = tapTimesRef.current;
    if (taps.length > 0 && now - taps[taps.length - 1] > 3000) { tapTimesRef.current = [now]; return; }
    taps.push(now);
    if (taps.length > 8) tapTimesRef.current = taps.slice(-8);
    if (tapTimesRef.current.length >= 2) setBpm(calcTapBpm(tapTimesRef.current));
  }, []);

  const totalBeats = beatsForSig(timeSig);

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(24px + env(safe-area-inset-bottom))',
      left: 24,
      zIndex: 199,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 8,
    }}>
      {/* Expanded panel */}
      {open && (
        <div style={{
          background: 'var(--card-bg)',
          border: '0.5px solid var(--border2)',
          borderRadius: 14,
          padding: '16px 18px',
          boxShadow: 'var(--shadow-lg)',
          width: 240,
        }}>
          {/* Beat lights */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
            {Array.from({ length: totalBeats }).map((_, i) => {
              const active = currentBeat === i;
              return (
                <div key={i} style={{
                  width: i === 0 ? 14 : 10,
                  height: i === 0 ? 14 : 10,
                  borderRadius: '50%',
                  background: active ? (i === 0 ? 'var(--accent)' : 'rgba(var(--accent-rgb),0.5)') : 'var(--bg3)',
                  border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border2)'}`,
                  boxShadow: active && i === 0 ? '0 0 10px rgba(var(--accent-rgb),0.6)' : 'none',
                  transition: 'background 0.05s',
                }} />
              );
            })}
          </div>

          {/* BPM row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <button
              aria-label="Decrease BPM"
              onMouseDown={() => { adjustBpm(-1); startHold(-1); }}
              onMouseUp={endHold} onMouseLeave={endHold}
              onTouchStart={e => { e.preventDefault(); adjustBpm(-1); startHold(-1); }} onTouchEnd={endHold}
              style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}
            >-</button>
            <div style={{ textAlign: 'center', minWidth: 72 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: running ? 'var(--accent)' : 'var(--text)', lineHeight: 1, letterSpacing: '-0.03em' }}>{bpm}</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.2em', marginTop: 2 }}>BPM</p>
            </div>
            <button
              aria-label="Increase BPM"
              onMouseDown={() => { adjustBpm(1); startHold(1); }}
              onMouseUp={endHold} onMouseLeave={endHold}
              onTouchStart={e => { e.preventDefault(); adjustBpm(1); startHold(1); }} onTouchEnd={endHold}
              style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}
            >+</button>
          </div>

          {/* Time sig */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
            {(['4/4', '3/4', '6/8'] as TimeSig[]).map(sig => (
              <button key={sig} onClick={() => setTimeSig(sig)} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, border: `1px solid ${timeSig === sig ? 'var(--accent-border)' : 'var(--border)'}`, background: timeSig === sig ? 'var(--accent-dim)' : 'transparent', color: timeSig === sig ? 'var(--accent)' : 'var(--text3)', cursor: 'pointer', transition: 'all 0.13s' }}>
                {sig}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleTap} style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', padding: '8px 0', borderRadius: 8, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', userSelect: 'none' }}>
              TAP
            </button>
            <button onClick={running ? stop : start} style={{ flex: 2, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', padding: '8px 0', borderRadius: 8, border: running ? '1px solid var(--border2)' : 'none', background: running ? 'var(--bg3)' : 'var(--accent)', color: running ? 'var(--text2)' : 'var(--on-accent)', cursor: 'pointer', userSelect: 'none', boxShadow: running ? 'none' : '0 2px 12px rgba(var(--accent-rgb),0.3)' }}>
              {running ? 'STOP' : 'START'}
            </button>
          </div>
        </div>
      )}

      {/* Toggle pill */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close metronome' : 'Open metronome'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          borderRadius: 99,
          border: `1px solid ${running ? 'var(--accent-border)' : 'var(--border2)'}`,
          background: running ? 'var(--accent-dim)' : 'var(--card-bg)',
          color: running ? 'var(--accent)' : 'var(--text2)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow)',
          transition: 'all 0.15s',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>
          {running ? `${bpm} BPM` : 'METRONOME'}
        </span>
        {running && (
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1s ease-in-out infinite', boxShadow: '0 0 6px rgba(var(--accent-rgb),0.6)' }} />
        )}
      </button>
    </div>
  );
}
