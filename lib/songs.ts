// Standard tuning open-string MIDI: e=64 B=59 G=55 D=50 A=45 E=40
export const OPEN_MIDI = [64, 59, 55, 50, 45, 40] as const;
export const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'] as const;

export interface TabNote {
  string: 1 | 2 | 3 | 4 | 5 | 6; // 1=high e, 6=low E
  fret: number;
  midi: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: 'beginner' | 'intermediate';
  generated?: boolean; // true for AI-generated songs
  notes: TabNote[];
}

function n(string: 1 | 2 | 3 | 4 | 5 | 6, fret: number): TabNote {
  return { string, fret, midi: OPEN_MIDI[string - 1] + fret };
}

export const SONGS: Song[] = [
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    difficulty: 'beginner',
    notes: [
      n(1,0), n(1,0), n(1,1), n(1,3),
      n(1,3), n(1,1), n(1,0), n(2,3),
      n(2,1), n(2,1), n(2,3), n(1,0),
      n(1,0), n(2,3), n(2,3),
    ],
  },
  {
    id: 'seven-nation-army',
    title: 'Seven Nation Army',
    artist: 'The White Stripes',
    difficulty: 'beginner',
    notes: [
      n(1,0), n(1,0), n(1,3), n(1,0),
      n(2,3), n(2,1), n(2,0), n(2,0), n(2,1),
    ],
  },
  {
    id: 'smoke-on-the-water',
    title: 'Smoke on the Water',
    artist: 'Deep Purple',
    difficulty: 'beginner',
    notes: [
      n(4,0), n(4,3), n(4,5),
      n(4,0), n(4,3), n(4,6), n(4,5),
      n(4,0), n(4,3), n(4,5), n(4,3), n(4,0),
    ],
  },
  {
    id: 'nothing-else-matters',
    title: 'Nothing Else Matters',
    artist: 'Metallica',
    difficulty: 'beginner',
    // Em arpeggiation: E2 B2 E3 G3 B3 E4 and back
    notes: [
      n(6,0), n(5,2), n(4,2), n(3,0), n(2,0), n(1,0),
      n(2,0), n(3,0), n(4,2), n(5,2),
      n(6,0), n(5,2), n(4,2), n(3,0), n(2,0), n(1,0),
    ],
  },
  {
    id: 'come-as-you-are',
    title: 'Come As You Are',
    artist: 'Nirvana',
    difficulty: 'beginner',
    // Main riff on low E string
    notes: [
      n(6,0), n(6,0), n(6,3), n(6,0),
      n(6,0), n(6,2), n(6,0), n(6,0),
      n(6,3), n(6,3), n(6,2),
    ],
  },
  {
    id: 'twinkle-twinkle',
    title: 'Twinkle Twinkle',
    artist: 'Traditional',
    difficulty: 'beginner',
    notes: [
      n(2,1), n(2,1), n(1,3), n(1,3),
      n(1,5), n(1,5), n(1,3),
      n(1,1), n(1,1), n(1,0), n(1,0),
      n(2,3), n(2,3), n(2,1),
    ],
  },
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    artist: 'Traditional',
    difficulty: 'beginner',
    notes: [
      n(1,3), n(1,3), n(1,5), n(1,3), n(1,8), n(1,7),
      n(1,3), n(1,3), n(1,5), n(1,3), n(1,10), n(1,8),
      n(1,3), n(1,3), n(1,15), n(1,12), n(1,8), n(1,7), n(1,5),
      n(1,13), n(1,13), n(1,12), n(1,8), n(1,10), n(1,8),
    ],
  },
];
