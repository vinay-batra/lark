export interface ChordVoicing {
  // frets[0]=low E string, frets[5]=high e string
  // -1 = muted, 0 = open, 1-24 = fret number
  frets: [number, number, number, number, number, number];
  fingers?: [number, number, number, number, number, number]; // 0=none, 1-4=finger
  baseFret?: number; // starting fret for diagram (default 1)
  barre?: { fret: number; from: number; to: number }; // from/to are string indices 0-5
}

export interface ChordEntry {
  name: string;   // "Am"
  full: string;   // "A Minor"
  category: 'major' | 'minor' | 'seventh' | 'sus' | 'add' | 'barre' | 'power';
  voicings: ChordVoicing[];
}

export const CHORD_LIBRARY: ChordEntry[] = [
  // ───────── MAJOR (open) ─────────
  {
    name: 'C',
    full: 'C Major',
    category: 'major',
    voicings: [
      {
        frets: [-1, 3, 2, 0, 1, 0],
        fingers: [0, 3, 2, 0, 1, 0],
      },
    ],
  },
  {
    name: 'D',
    full: 'D Major',
    category: 'major',
    voicings: [
      {
        frets: [-1, -1, 0, 2, 3, 2],
        fingers: [0, 0, 0, 1, 3, 2],
      },
    ],
  },
  {
    name: 'E',
    full: 'E Major',
    category: 'major',
    voicings: [
      {
        frets: [0, 2, 2, 1, 0, 0],
        fingers: [0, 2, 3, 1, 0, 0],
      },
    ],
  },
  {
    name: 'F',
    full: 'F Major',
    category: 'major',
    voicings: [
      {
        frets: [1, 1, 2, 3, 3, 1],
        fingers: [1, 1, 2, 4, 3, 1],
        barre: { fret: 1, from: 0, to: 5 },
      },
    ],
  },
  {
    name: 'G',
    full: 'G Major',
    category: 'major',
    voicings: [
      {
        frets: [3, 2, 0, 0, 0, 3],
        fingers: [2, 1, 0, 0, 0, 3],
      },
      {
        frets: [3, 2, 0, 0, 3, 3],
        fingers: [2, 1, 0, 0, 3, 4],
      },
    ],
  },
  {
    name: 'A',
    full: 'A Major',
    category: 'major',
    voicings: [
      {
        frets: [-1, 0, 2, 2, 2, 0],
        fingers: [0, 0, 1, 2, 3, 0],
      },
    ],
  },
  {
    name: 'B',
    full: 'B Major',
    category: 'major',
    voicings: [
      {
        frets: [-1, 2, 4, 4, 4, 2],
        fingers: [0, 1, 2, 3, 4, 1],
        barre: { fret: 2, from: 1, to: 5 },
      },
    ],
  },

  // ───────── MINOR (open) ─────────
  {
    name: 'Am',
    full: 'A Minor',
    category: 'minor',
    voicings: [
      {
        frets: [-1, 0, 2, 2, 1, 0],
        fingers: [0, 0, 2, 3, 1, 0],
      },
    ],
  },
  {
    name: 'Dm',
    full: 'D Minor',
    category: 'minor',
    voicings: [
      {
        frets: [-1, -1, 0, 2, 3, 1],
        fingers: [0, 0, 0, 2, 3, 1],
      },
    ],
  },
  {
    name: 'Em',
    full: 'E Minor',
    category: 'minor',
    voicings: [
      {
        frets: [0, 2, 2, 0, 0, 0],
        fingers: [0, 2, 3, 0, 0, 0],
      },
    ],
  },
  {
    name: 'Bm',
    full: 'B Minor',
    category: 'minor',
    voicings: [
      {
        frets: [-1, 2, 4, 4, 3, 2],
        fingers: [0, 1, 3, 4, 2, 1],
        barre: { fret: 2, from: 1, to: 5 },
      },
    ],
  },
  {
    name: 'Fm',
    full: 'F Minor',
    category: 'minor',
    voicings: [
      {
        frets: [1, 1, 3, 3, 2, 1],
        fingers: [1, 1, 3, 4, 2, 1],
        barre: { fret: 1, from: 0, to: 5 },
      },
    ],
  },
  {
    name: 'Cm',
    full: 'C Minor',
    category: 'minor',
    voicings: [
      {
        frets: [-1, 3, 5, 5, 4, 3],
        fingers: [0, 1, 3, 4, 2, 1],
        baseFret: 3,
        barre: { fret: 3, from: 1, to: 5 },
      },
    ],
  },

  // ───────── SEVENTH ─────────
  {
    name: 'A7',
    full: 'A Dominant 7th',
    category: 'seventh',
    voicings: [
      {
        frets: [-1, 0, 2, 0, 2, 0],
        fingers: [0, 0, 2, 0, 3, 0],
      },
    ],
  },
  {
    name: 'B7',
    full: 'B Dominant 7th',
    category: 'seventh',
    voicings: [
      {
        frets: [-1, 2, 1, 2, 0, 2],
        fingers: [0, 2, 1, 3, 0, 4],
      },
    ],
  },
  {
    name: 'C7',
    full: 'C Dominant 7th',
    category: 'seventh',
    voicings: [
      {
        frets: [-1, 3, 2, 3, 1, 0],
        fingers: [0, 3, 2, 4, 1, 0],
      },
    ],
  },
  {
    name: 'D7',
    full: 'D Dominant 7th',
    category: 'seventh',
    voicings: [
      {
        frets: [-1, -1, 0, 2, 1, 2],
        fingers: [0, 0, 0, 3, 1, 2],
      },
    ],
  },
  {
    name: 'E7',
    full: 'E Dominant 7th',
    category: 'seventh',
    voicings: [
      {
        frets: [0, 2, 0, 1, 0, 0],
        fingers: [0, 2, 0, 1, 0, 0],
      },
    ],
  },
  {
    name: 'G7',
    full: 'G Dominant 7th',
    category: 'seventh',
    voicings: [
      {
        frets: [3, 2, 0, 0, 0, 1],
        fingers: [3, 2, 0, 0, 0, 1],
      },
    ],
  },

  // ───────── SUS / ADD ─────────
  {
    name: 'Cadd9',
    full: 'C Add 9',
    category: 'add',
    voicings: [
      {
        frets: [-1, 3, 2, 0, 3, 0],
        fingers: [0, 3, 2, 0, 4, 0],
      },
    ],
  },
  {
    name: 'Dsus2',
    full: 'D Suspended 2nd',
    category: 'sus',
    voicings: [
      {
        frets: [-1, -1, 0, 2, 3, 0],
        fingers: [0, 0, 0, 1, 2, 0],
      },
    ],
  },
  {
    name: 'Dsus4',
    full: 'D Suspended 4th',
    category: 'sus',
    voicings: [
      {
        frets: [-1, -1, 0, 2, 3, 3],
        fingers: [0, 0, 0, 1, 3, 4],
      },
    ],
  },
  {
    name: 'Esus4',
    full: 'E Suspended 4th',
    category: 'sus',
    voicings: [
      {
        frets: [0, 2, 2, 2, 0, 0],
        fingers: [0, 1, 2, 3, 0, 0],
      },
    ],
  },
  {
    name: 'Asus2',
    full: 'A Suspended 2nd',
    category: 'sus',
    voicings: [
      {
        frets: [-1, 0, 2, 2, 0, 0],
        fingers: [0, 0, 1, 2, 0, 0],
      },
    ],
  },
  {
    name: 'Gsus2',
    full: 'G Suspended 2nd',
    category: 'sus',
    voicings: [
      {
        frets: [3, 2, 0, 0, 0, 1],
        fingers: [3, 2, 0, 0, 0, 1],
      },
    ],
  },

  // ───────── POWER CHORDS ─────────
  {
    name: 'E5',
    full: 'E Power Chord',
    category: 'power',
    voicings: [
      {
        frets: [0, 2, 2, -1, -1, -1],
        fingers: [0, 1, 3, 0, 0, 0],
      },
    ],
  },
  {
    name: 'A5',
    full: 'A Power Chord',
    category: 'power',
    voicings: [
      {
        frets: [-1, 0, 2, 2, -1, -1],
        fingers: [0, 0, 1, 3, 0, 0],
      },
    ],
  },
  {
    name: 'D5',
    full: 'D Power Chord',
    category: 'power',
    voicings: [
      {
        frets: [-1, -1, 0, 2, 3, -1],
        fingers: [0, 0, 0, 1, 3, 0],
      },
    ],
  },
  {
    name: 'G5',
    full: 'G Power Chord',
    category: 'power',
    voicings: [
      {
        frets: [3, 5, 5, -1, -1, -1],
        fingers: [1, 3, 4, 0, 0, 0],
        baseFret: 3,
      },
    ],
  },

  // ───────── BARRE (position) ─────────
  {
    name: 'A/V',
    full: 'A Major (5th fret barre)',
    category: 'barre',
    voicings: [
      {
        frets: [5, 7, 7, 6, 5, 5],
        fingers: [1, 3, 4, 2, 1, 1],
        baseFret: 5,
        barre: { fret: 5, from: 0, to: 5 },
      },
    ],
  },
  {
    name: 'D/V',
    full: 'D Major (5th fret barre)',
    category: 'barre',
    voicings: [
      {
        frets: [-1, 5, 7, 7, 7, 5],
        fingers: [0, 1, 2, 3, 4, 1],
        baseFret: 5,
        barre: { fret: 5, from: 1, to: 5 },
      },
    ],
  },
  {
    name: 'E/VII',
    full: 'E Major (7th fret barre)',
    category: 'barre',
    voicings: [
      {
        frets: [7, 9, 9, 8, 7, 7],
        fingers: [1, 3, 4, 2, 1, 1],
        baseFret: 7,
        barre: { fret: 7, from: 0, to: 5 },
      },
    ],
  },
];
