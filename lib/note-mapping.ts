import { OPEN_MIDI, TabNote } from './songs';

// Includes rare enharmonics Claude legitimately uses in flat keys: Cb (=B),
// Fb (=E), B# (=C), E# (=F). Missing these caused valid notes to be silently
// dropped from the generated tab, shifting the melody.
const SEMITONES: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3,
  E: 4, Fb: 4, 'E#': 5, F: 5, 'F#': 6, Gb: 6,
  G: 7, 'G#': 8, Ab: 8,
  A: 9, 'A#': 10, Bb: 10, B: 11, Cb: 11, 'B#': 0,
};

export function parseNoteName(name: string): number | null {
  const match = name.trim().match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
  if (!match) return null;
  const [, letter, accidental, octStr] = match;
  const key = letter.toUpperCase() + accidental;
  const semitone = SEMITONES[key];
  if (semitone === undefined) return null;
  const octave = parseInt(octStr, 10);
  // For B#/Cb the semitone wraps relative to the written octave: B#4 is C5,
  // Cb4 is B3. Adjust octave accordingly so the resulting MIDI is correct.
  let octaveAdj = octave;
  if (key === 'B#') octaveAdj += 1;
  else if (key === 'Cb') octaveAdj -= 1;
  return semitone + (octaveAdj + 1) * 12;
}

export interface MapOpts {
  prevPosition?: { string: 1 | 2 | 3 | 4 | 5 | 6; fret: number };
  preferredString?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function midiToTab(midi: number, opts: MapOpts = {}): TabNote | null {
  const options: { string: 1 | 2 | 3 | 4 | 5 | 6; fret: number; score: number }[] = [];
  for (let s = 1; s <= 6; s++) {
    const fret = midi - OPEN_MIDI[s - 1];
    if (fret >= 0 && fret <= 22) {
      let score = fret;
      if (fret === 0) score -= 3;
      if (opts.prevPosition) {
        score += Math.abs(s - opts.prevPosition.string) * 0.5;
        score += Math.abs(fret - opts.prevPosition.fret) * 0.3;
      }
      options.push({ string: s as 1 | 2 | 3 | 4 | 5 | 6, fret, score });
    }
  }
  if (options.length === 0) return null;

  // Hard preference: if a preferredString is set and the note is reachable there
  // within fret 0-15, force it onto that string.
  if (opts.preferredString) {
    const onPreferred = options.find(o => o.string === opts.preferredString && o.fret <= 15);
    if (onPreferred) {
      return { string: onPreferred.string, fret: onPreferred.fret, midi };
    }
  }

  options.sort((a, b) => a.score - b.score);
  return { string: options[0].string, fret: options[0].fret, midi };
}

const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

/** Convert a MIDI number to scientific pitch notation, e.g. 69 → "A4". */
export function midiToNoteName(midi: number): string {
  const pitchClass = PITCH_CLASSES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${pitchClass}${octave}`;
}

export function notesToTabs(noteNames: string[], preferredString?: 1 | 2 | 3 | 4 | 5 | 6): TabNote[] {
  const result: TabNote[] = [];
  let prevPosition: { string: 1 | 2 | 3 | 4 | 5 | 6; fret: number } | undefined;
  for (const name of noteNames) {
    const midi = parseNoteName(name);
    if (midi === null) continue;
    const tab = midiToTab(midi, { prevPosition, preferredString });
    if (tab) {
      result.push(tab);
      prevPosition = { string: tab.string, fret: tab.fret };
    }
  }
  return result;
}
