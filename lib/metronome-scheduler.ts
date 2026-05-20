// Lookahead Web Audio metronome scheduler.
// Used by SongFollowView (during play) and could be reused by MetronomeView.
// The lookahead pattern is the standard recommendation from the Chris Wilson
// "A Tale of Two Clocks" article: schedule clicks ahead of the audio clock
// in a setInterval and surface beat indices to the UI via RAF.

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.1;
const CLICK_DURATION_S = 0.04;
const BEATS_PER_BAR = 4;

export interface MetronomeHandle {
  /** Stops scheduling, clears buffered click visualizations, releases timers. */
  stop: () => void;
}

export interface MetronomeOptions {
  /** Beats per minute (must be > 0). */
  bpm: number;
  /** Called per visible beat (0..BEATS_PER_BAR-1), synced via RAF to the visual paint. */
  onBeat?: (beat: number) => void;
  /** Pitch in Hz on accent (beat 0). Defaults to 880. */
  accentHz?: number;
  /** Pitch in Hz on off-beats. Defaults to 440. */
  beatHz?: number;
  /** Accent gain. Default 0.55. */
  accentGain?: number;
  /** Off-beat gain. Default 0.3. */
  beatGain?: number;
}

/**
 * Start a metronome on the given AudioContext. Returns a handle whose .stop()
 * tears down all timers and visual buffer state. The schedule loop is a
 * setInterval; visual beat updates are buffered into a ref and surfaced via RAF
 * to keep React state changes off the schedule hot path.
 */
export function startMetronome(ctx: AudioContext, opts: MetronomeOptions): MetronomeHandle {
  const {
    bpm,
    onBeat,
    accentHz = 880,
    beatHz = 440,
    accentGain = 0.55,
    beatGain = 0.3,
  } = opts;

  const beatSec = 60 / Math.max(bpm, 1);
  let beat = 0;
  let nextTime = ctx.currentTime + 0.05;
  let pendingBeat: number | -2 = -2;
  const beatTimeouts: ReturnType<typeof setTimeout>[] = [];

  const schedule = () => {
    while (nextTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
      const isAccent = beat === 0;
      const when = nextTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? accentHz : beatHz, when);
      gain.gain.setValueAtTime(isAccent ? accentGain : beatGain, when);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + CLICK_DURATION_S);
      osc.start(when);
      osc.stop(when + CLICK_DURATION_S);

      // Buffer the visual beat -- the RAF loop picks it up and calls onBeat.
      // Without this delay, onBeat would fire well before the audio click sounds.
      const delay = Math.max(0, (when - ctx.currentTime) * 1000);
      const captured = beat;
      const id = setTimeout(() => { pendingBeat = captured; }, delay);
      beatTimeouts.push(id);

      nextTime += beatSec;
      beat = (beat + 1) % BEATS_PER_BAR;
    }
  };

  schedule();
  const intervalId = setInterval(schedule, LOOKAHEAD_MS);

  let rafId: number | null = null;
  const loop = () => {
    if (pendingBeat !== -2) {
      onBeat?.(pendingBeat);
      pendingBeat = -2;
    }
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);

  return {
    stop: () => {
      clearInterval(intervalId);
      if (rafId !== null) cancelAnimationFrame(rafId);
      for (const id of beatTimeouts) clearTimeout(id);
      beatTimeouts.length = 0;
    },
  };
}
