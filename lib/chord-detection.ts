import { detect as detectChord } from '@tonaljs/chord-detect';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ACTIVE_THRESHOLD = 0.45;

/**
 * Build a 12-bin pitch-class histogram from a frequency-domain frame.
 * Each FFT bin contributes its amplitude to the pitch class it lands on.
 * Returns values normalized to [0, 1] by the max bin.
 */
export function buildChromagram(freqData: Float32Array, sampleRate: number, fftSize: number): number[] {
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

/** Average a sliding window of chromagram frames for stability. */
export function avgChromagram(history: number[][]): number[] {
  const len = history.length;
  if (len === 0) return new Array(12).fill(0);
  return history[0].map((_, i) => history.reduce((s, h) => s + h[i], 0) / len);
}

/** Strip trailing M from a chord name ("CM" -> "C"). @tonaljs returns "M". */
export function normalizeChord(raw: string): string {
  return raw.replace(/^([A-G][#b]?)M$/, '$1');
}

/**
 * Detect the best-matching chord name from an averaged chromagram.
 * Returns null if too few notes are active to form a chord.
 */
export function detectChordFromChroma(chroma: number[]): string | null {
  const activeNotes = NOTE_NAMES.filter((_, i) => chroma[i] >= ACTIVE_THRESHOLD);
  if (activeNotes.length < 2) return null;
  const detected = detectChord(activeNotes);
  if (detected.length === 0) return null;
  // Prefer full chords over power chords (D over D5) when both match.
  const best = detected.find(c => !/^[A-G][#b]?5$/.test(c)) ?? detected[0];
  return normalizeChord(best);
}

/**
 * True if `detected` matches `target` chord. Loose match: same root + same
 * quality family (major/minor/seventh/etc). "Am" matches "Am7" but not "A".
 * This forgives common chord extensions a beginner won't hear (the strummed
 * Am7 sounds like Am to the chromagram).
 */
export function chordMatches(detected: string, target: string): boolean {
  if (detected === target) return true;
  // Loose match: same root + same minor/major flag
  const d = parseChord(detected);
  const t = parseChord(target);
  if (!d || !t) return false;
  if (d.root !== t.root) return false;
  return d.isMinor === t.isMinor;
}

function parseChord(name: string): { root: string; isMinor: boolean } | null {
  const m = name.match(/^([A-G][#b]?)(.*)$/);
  if (!m) return null;
  const root = m[1];
  const rest = m[2];
  const isMinor = /^m(?!aj)/.test(rest); // m followed by something other than "aj"
  return { root, isMinor };
}
