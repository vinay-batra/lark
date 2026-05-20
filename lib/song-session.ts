// Pure helpers used by the SongFollowView state machine. Extracted so the
// component file stays focused on rendering + lifecycle, and so future variants
// (chord-strumming mode, multi-line view) can reuse the same math + labels.

export type TimingBucket = 'on' | 'late' | 'slow';

// Beat-aware per-note timeout. 4 beats long with a 2.5s floor so beginners on
// slow songs don't feel rushed but fast songs stay demanding. Defends against
// bpm <= 0 / NaN (a corrupted saved song would otherwise produce Infinity ms).
export function noteTimeoutMs(bpm: number): number {
  const safe = Number.isFinite(bpm) && bpm > 0 ? bpm : 100;
  const beat = 60000 / safe;
  return Math.max(beat * 4, 2500);
}

// Classify how on-tempo a hit was. timingMs is "time since the previous note
// advanced". Within 1 beat = on, 1-2 beats = late, 2+ beats = slow (still hit).
export function classifyTiming(timingMs: number, bpm: number): TimingBucket {
  const beat = 60000 / bpm;
  if (timingMs <= beat) return 'on';
  if (timingMs <= beat * 2) return 'late';
  return 'slow';
}

// Beginner-friendly string descriptions. The high-e / low-E shorthand is
// guitarist convention; new users see "High E (thinnest)" instead so they
// orient by feel rather than learning the e/E case trick.
export const STRING_DESCRIPTIONS = [
  'High E string (thinnest)',
  'B string (2nd from top)',
  'G string',
  'D string',
  'A string (2nd from bottom)',
  'Low E string (thickest)',
] as const;

export function ordinalFret(fret: number): string {
  const suffix = (fret % 10 === 1 && fret !== 11) ? 'st'
               : (fret % 10 === 2 && fret !== 12) ? 'nd'
               : (fret % 10 === 3 && fret !== 13) ? 'rd' : 'th';
  return `${fret}${suffix} fret`;
}

// Scoring thresholds shared between pitch detection and the audio loop.
export const TOLERANCE_CENTS = 100;
export const CLARITY_THRESHOLD = 0.88;
export const NOTES_PER_LINE = 10;
export const RELEASE_FRAMES = 2;
export const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const;

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
export function getCents(freq: number, targetMidi: number): number {
  return Math.round(1200 * Math.log2(freq / midiToFreq(targetMidi)));
}
