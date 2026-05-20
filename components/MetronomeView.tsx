'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Time signature definitions ───────────────────────────────────────────────

type TimeSig = '4/4' | '3/4' | '6/8';

const TIME_SIGS: TimeSig[] = ['4/4', '3/4', '6/8'];

function beatsForSig(sig: TimeSig): number {
  if (sig === '4/4') return 4;
  if (sig === '3/4') return 3;
  if (sig === '6/8') return 6;
  return 4;
}

// ─── Web Audio click synthesis ─────────────────────────────────────────────────

function scheduleClick(
  ctx: AudioContext,
  when: number,
  isAccent: boolean,
): void {
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

// ─── Tap tempo: median of last N intervals ────────────────────────────────────

function calcTapBpm(taps: number[]): number {
  if (taps.length < 2) return 120;
  const intervals: number[] = [];
  for (let i = 1; i < taps.length; i++) {
    intervals.push(taps[i] - taps[i - 1]);
  }
  const sorted = [...intervals].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  return Math.round(Math.min(300, Math.max(20, 60000 / median)));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MetronomeView() {
  const [bpm, setBpm] = useState(120);
  const [timeSig, setTimeSig] = useState<TimeSig>('4/4');
  const [running, setRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState<number>(-1);

  // Scheduler refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const schedulerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const currentBeatRef = useRef<number>(0);
  const bpmRef = useRef<number>(bpm);
  const timeSigRef = useRef<TimeSig>(timeSig);

  // RAF ref for beat light sync
  const rafRef = useRef<number | null>(null);
  const pendingBeatRef = useRef<number>(-1);

  // Hold-to-repeat refs for +/- buttons
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tap tempo
  const tapTimesRef = useRef<number[]>([]);

  // Keep refs in sync with state
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { timeSigRef.current = timeSig; }, [timeSig]);

  // ── RAF loop: flushes pendingBeatRef to state (avoids setInterval -> setState jank) ──
  const startRaf = useCallback(() => {
    const loop = () => {
      const pending = pendingBeatRef.current;
      if (pending !== -2) {
        setCurrentBeat(pending);
        pendingBeatRef.current = -2; // sentinel: consumed
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // ── Look-ahead scheduler ───────────────────────────────────────────────────
  const scheduler = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const scheduleAheadTime = 0.1; // seconds
    const now = ctx.currentTime;

    while (nextNoteTimeRef.current < now + scheduleAheadTime) {
      const beatIndex = currentBeatRef.current;
      const totalBeats = beatsForSig(timeSigRef.current);
      const isAccent = beatIndex === 0;

      scheduleClick(ctx, nextNoteTimeRef.current, isAccent);

      // Schedule the visual update near the beat time
      const delay = Math.max(0, (nextNoteTimeRef.current - now) * 1000);
      const capturedBeat = beatIndex;
      setTimeout(() => {
        pendingBeatRef.current = capturedBeat;
      }, delay);

      // Advance
      const secondsPerBeat = 60 / bpmRef.current;
      nextNoteTimeRef.current += secondsPerBeat;
      currentBeatRef.current = (beatIndex + 1) % totalBeats;
    }
  }, []);

  // ── Start ──────────────────────────────────────────────────────────────────
  const start = useCallback(() => {
    // AudioContext must be created inside a user gesture handler
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    currentBeatRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.05;
    pendingBeatRef.current = -2;

    // Kick the scheduler immediately, then every 25ms
    scheduler();
    schedulerTimerRef.current = setInterval(scheduler, 25);

    startRaf();
    setRunning(true);
    setCurrentBeat(-1);
  }, [scheduler, startRaf]);

  // ── Stop ───────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (schedulerTimerRef.current !== null) {
      clearInterval(schedulerTimerRef.current);
      schedulerTimerRef.current = null;
    }
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    stopRaf();
    setRunning(false);
    setCurrentBeat(-1);
    pendingBeatRef.current = -2;
  }, [stopRaf]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (schedulerTimerRef.current !== null) clearInterval(schedulerTimerRef.current);
      if (holdTimerRef.current !== null) clearTimeout(holdTimerRef.current);
      if (holdIntervalRef.current !== null) clearInterval(holdIntervalRef.current);
      audioCtxRef.current?.close();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── When time sig changes while running, reset beat position AND realign
  // the next-click time to the audio clock. Without realignment, the visible
  // beat counter resets to 0 but the previously-queued click still fires on
  // the old schedule, producing a perceptible drift between visual + audio.
  useEffect(() => {
    if (!running) return;
    currentBeatRef.current = 0;
    const ctx = audioCtxRef.current;
    if (ctx) {
      nextNoteTimeRef.current = ctx.currentTime + 0.05;
    }
  }, [timeSig, running]);

  // ── BPM helpers ───────────────────────────────────────────────────────────
  const clampBpm = (v: number) => Math.min(300, Math.max(20, v));

  const adjustBpm = useCallback((delta: number) => {
    setBpm(prev => clampBpm(prev + delta));
  }, []);

  const startHold = useCallback((delta: number) => {
    holdTimerRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(() => {
        setBpm(prev => clampBpm(prev + delta));
      }, 80);
    }, 400);
  }, []);

  const endHold = useCallback(() => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current !== null) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  // ── Tap tempo ─────────────────────────────────────────────────────────────
  const handleTap = useCallback(() => {
    const now = performance.now();
    const taps = tapTimesRef.current;

    // Reset if last tap was more than 3s ago
    if (taps.length > 0 && now - taps[taps.length - 1] > 3000) {
      tapTimesRef.current = [now];
      return;
    }

    taps.push(now);
    // Keep last 8 taps
    if (taps.length > 8) tapTimesRef.current = taps.slice(-8);

    if (tapTimesRef.current.length >= 2) {
      setBpm(calcTapBpm(tapTimesRef.current));
    }
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────
  const totalBeats = beatsForSig(timeSig);

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '0.5px solid var(--border)',
        borderRadius: 14,
        padding: '32px 28px 36px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
      }}
    >

      {/* ── Beat lights ───────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 36,
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {Array.from({ length: totalBeats }).map((_, i) => {
          const isActive = currentBeat === i;
          const isAccent = i === 0;
          return (
            <div
              key={i}
              style={{
                width: isAccent ? 18 : 14,
                height: isAccent ? 18 : 14,
                borderRadius: '50%',
                transition: 'background 0.05s, box-shadow 0.05s',
                background: isActive
                  ? isAccent
                    ? 'var(--accent)'
                    : `rgba(var(--accent-rgb), 0.55)`
                  : 'var(--bg3)',
                boxShadow: isActive
                  ? isAccent
                    ? `0 0 14px rgba(var(--accent-rgb), 0.7)`
                    : `0 0 8px rgba(var(--accent-rgb), 0.35)`
                  : 'none',
                border: isActive
                  ? isAccent
                    ? '1.5px solid var(--accent)'
                    : '1.5px solid var(--accent-border)'
                  : '1.5px solid var(--border2)',
              }}
            />
          );
        })}
      </div>

      {/* ── BPM display ───────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 8,
        }}
      >
        {/* Minus button */}
        <button
          aria-label="Decrease BPM"
          onMouseDown={() => { adjustBpm(-1); startHold(-1); }}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={(e) => { e.preventDefault(); adjustBpm(-1); startHold(-1); }}
          onTouchEnd={endHold}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '1px solid var(--border2)',
            background: 'var(--bg3)',
            color: 'var(--text)',
            fontFamily: 'var(--font-mono)',
            fontSize: 22,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.12s, border-color 0.12s',
            userSelect: 'none',
            flexShrink: 0,
          }}
          onFocus={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-border)'; }}
          onBlur={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border2)'; }}
        >
          -
        </button>

        {/* BPM number */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 120,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(56px, 14vw, 80px)',
              fontWeight: 700,
              color: running ? 'var(--accent)' : 'var(--text)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              transition: 'color 0.2s',
              userSelect: 'none',
            }}
          >
            {bpm}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: 'var(--text-muted)',
              marginTop: 4,
              textTransform: 'uppercase',
            }}
          >
            BPM
          </span>
        </div>

        {/* Plus button */}
        <button
          aria-label="Increase BPM"
          onMouseDown={() => { adjustBpm(1); startHold(1); }}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={(e) => { e.preventDefault(); adjustBpm(1); startHold(1); }}
          onTouchEnd={endHold}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '1px solid var(--border2)',
            background: 'var(--bg3)',
            color: 'var(--text)',
            fontFamily: 'var(--font-mono)',
            fontSize: 22,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.12s, border-color 0.12s',
            userSelect: 'none',
            flexShrink: 0,
          }}
          onFocus={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-border)'; }}
          onBlur={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border2)'; }}
        >
          +
        </button>
      </div>

      {/* ── BPM slider ────────────────────────────────────────────────── */}
      <div style={{ width: '100%', maxWidth: 340, marginBottom: 32 }}>
        <input
          type="range"
          min={20}
          max={300}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          style={{
            width: '100%',
            accentColor: 'var(--accent)',
            cursor: 'pointer',
            height: 4,
          }}
          aria-label="BPM slider"
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 6,
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>20</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>300</span>
        </div>
      </div>

      {/* ── Time signature ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 28,
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginRight: 4,
          }}
        >
          TIME SIG
        </span>
        {TIME_SIGS.map((sig) => {
          const isSelected = timeSig === sig;
          return (
            <button
              key={sig}
              onClick={() => setTimeSig(sig)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.06em',
                padding: '7px 14px',
                borderRadius: 8,
                border: isSelected
                  ? '1px solid var(--accent-border)'
                  : '1px solid var(--border)',
                background: isSelected ? 'var(--accent-dim)' : 'transparent',
                color: isSelected ? 'var(--accent)' : 'var(--text3)',
                cursor: 'pointer',
                transition: 'background 0.13s, border-color 0.13s, color 0.13s',
              }}
              aria-pressed={isSelected}
            >
              {sig}
            </button>
          );
        })}
      </div>

      {/* ── Action buttons ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {/* Tap Tempo */}
        <button
          onClick={handleTap}
          aria-label="Tap tempo"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            padding: '12px 22px',
            borderRadius: 9999,
            border: '1px solid var(--border2)',
            background: 'transparent',
            color: 'var(--text2)',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'background 0.13s, border-color 0.13s, color 0.13s',
            userSelect: 'none',
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg3)';
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          TAP TEMPO
        </button>

        {/* Start / Stop */}
        <button
          onClick={running ? stop : start}
          aria-label={running ? 'Stop metronome' : 'Start metronome'}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.1em',
            padding: '14px 40px',
            borderRadius: 9999,
            border: running ? '1px solid var(--border2)' : 'none',
            background: running ? 'var(--card-bg)' : 'var(--accent)',
            color: running ? 'var(--text2)' : 'var(--bg)',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s',
            userSelect: 'none',
            boxShadow: running ? 'none' : `0 4px 20px rgba(var(--accent-rgb), 0.3)`,
          }}
        >
          {running ? 'STOP' : 'START'}
        </button>
      </div>

      {/* ── Tempo label ───────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 28,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.2em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        {bpm < 60 && 'LARGHETTO'}
        {bpm >= 60 && bpm < 66 && 'LARGO'}
        {bpm >= 66 && bpm < 76 && 'ADAGIO'}
        {bpm >= 76 && bpm < 108 && 'ANDANTE'}
        {bpm >= 108 && bpm < 120 && 'MODERATO'}
        {bpm >= 120 && bpm < 156 && 'ALLEGRO'}
        {bpm >= 156 && bpm < 176 && 'VIVACE'}
        {bpm >= 176 && bpm < 200 && 'PRESTO'}
        {bpm >= 200 && 'PRESTISSIMO'}
      </div>

    </div>
  );
}
