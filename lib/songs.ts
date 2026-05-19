export interface SongNote {
  note: string;   // e.g. 'E4' -- used for pitch detection only
  midi: number;   // MIDI number for frequency comparison
  hint: string;   // e.g. 'e|0' or 'D|5' -- string name | fret number
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: 'beginner' | 'intermediate';
  notes: SongNote[];
}

function n(note: string, midi: number, hint: string): SongNote {
  return { note, midi, hint };
}

// String open-string MIDI: E2=40 A2=45 D3=50 G3=55 B3=59 e4=64
// fret = midi - open_string_midi

export const SONGS: Song[] = [
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    difficulty: 'beginner',
    notes: [
      n('E4', 64, 'e|0'), n('E4', 64, 'e|0'), n('F4', 65, 'e|1'), n('G4', 67, 'e|3'),
      n('G4', 67, 'e|3'), n('F4', 65, 'e|1'), n('E4', 64, 'e|0'), n('D4', 62, 'B|3'),
      n('C4', 60, 'B|1'), n('C4', 60, 'B|1'), n('D4', 62, 'B|3'), n('E4', 64, 'e|0'),
      n('E4', 64, 'e|0'), n('D4', 62, 'B|3'), n('D4', 62, 'B|3'),
    ],
  },
  {
    id: 'seven-nation-army',
    title: 'Seven Nation Army',
    artist: 'The White Stripes',
    difficulty: 'beginner',
    notes: [
      n('E4', 64, 'e|0'), n('E4', 64, 'e|0'), n('G4', 67, 'e|3'), n('E4', 64, 'e|0'),
      n('D4', 62, 'B|3'), n('C4', 60, 'B|1'), n('B3', 59, 'B|0'), n('B3', 59, 'B|0'), n('C4', 60, 'B|1'),
    ],
  },
  {
    id: 'smoke-on-the-water',
    title: 'Smoke on the Water',
    artist: 'Deep Purple',
    difficulty: 'beginner',
    notes: [
      n('D3', 50, 'D|0'), n('F3', 53, 'D|3'), n('G3', 55, 'D|5'),
      n('D3', 50, 'D|0'), n('F3', 53, 'D|3'), n('Ab3', 56, 'D|6'), n('G3', 55, 'D|5'),
      n('D3', 50, 'D|0'), n('F3', 53, 'D|3'), n('G3', 55, 'D|5'), n('F3', 53, 'D|3'), n('D3', 50, 'D|0'),
    ],
  },
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    artist: 'Traditional',
    difficulty: 'beginner',
    notes: [
      n('G4', 67, 'e|3'), n('G4', 67, 'e|3'), n('A4', 69, 'e|5'), n('G4', 67, 'e|3'), n('C5', 72, 'e|8'), n('B4', 71, 'e|7'),
      n('G4', 67, 'e|3'), n('G4', 67, 'e|3'), n('A4', 69, 'e|5'), n('G4', 67, 'e|3'), n('D5', 74, 'e|10'), n('C5', 72, 'e|8'),
      n('G4', 67, 'e|3'), n('G4', 67, 'e|3'), n('G5', 79, 'e|15'), n('E5', 76, 'e|12'), n('C5', 72, 'e|8'), n('B4', 71, 'e|7'), n('A4', 69, 'e|5'),
      n('F5', 77, 'e|13'), n('F5', 77, 'e|13'), n('E5', 76, 'e|12'), n('C5', 72, 'e|8'), n('D5', 74, 'e|10'), n('C5', 72, 'e|8'),
    ],
  },
  {
    id: 'twinkle-twinkle',
    title: 'Twinkle Twinkle',
    artist: 'Traditional',
    difficulty: 'beginner',
    notes: [
      n('C4', 60, 'B|1'), n('C4', 60, 'B|1'), n('G4', 67, 'e|3'), n('G4', 67, 'e|3'),
      n('A4', 69, 'e|5'), n('A4', 69, 'e|5'), n('G4', 67, 'e|3'),
      n('F4', 65, 'e|1'), n('F4', 65, 'e|1'), n('E4', 64, 'e|0'), n('E4', 64, 'e|0'),
      n('D4', 62, 'B|3'), n('D4', 62, 'B|3'), n('C4', 60, 'B|1'),
    ],
  },
];
