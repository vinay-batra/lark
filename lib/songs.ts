export interface SongNote {
  note: string;
  midi: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: 'beginner' | 'intermediate';
  notes: SongNote[];
}

function n(note: string, midi: number): SongNote {
  return { note, midi };
}

export const SONGS: Song[] = [
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    difficulty: 'beginner',
    notes: [
      n('E4', 64), n('E4', 64), n('F4', 65), n('G4', 67),
      n('G4', 67), n('F4', 65), n('E4', 64), n('D4', 62),
      n('C4', 60), n('C4', 60), n('D4', 62), n('E4', 64),
      n('E4', 64), n('D4', 62), n('D4', 62),
    ],
  },
  {
    id: 'seven-nation-army',
    title: 'Seven Nation Army',
    artist: 'The White Stripes',
    difficulty: 'beginner',
    notes: [
      n('E4', 64), n('E4', 64), n('G4', 67), n('E4', 64),
      n('D4', 62), n('C4', 60), n('B3', 59), n('B3', 59), n('C4', 60),
    ],
  },
  {
    id: 'smoke-on-the-water',
    title: 'Smoke on the Water',
    artist: 'Deep Purple',
    difficulty: 'beginner',
    notes: [
      n('D3', 50), n('F3', 53), n('G3', 55),
      n('D3', 50), n('F3', 53), n('Ab3', 56), n('G3', 55),
      n('D3', 50), n('F3', 53), n('G3', 55), n('F3', 53), n('D3', 50),
    ],
  },
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    artist: 'Traditional',
    difficulty: 'beginner',
    notes: [
      n('G4', 67), n('G4', 67), n('A4', 69), n('G4', 67), n('C5', 72), n('B4', 71),
      n('G4', 67), n('G4', 67), n('A4', 69), n('G4', 67), n('D5', 74), n('C5', 72),
      n('G4', 67), n('G4', 67), n('G5', 79), n('E5', 76), n('C5', 72), n('B4', 71), n('A4', 69),
      n('F5', 77), n('F5', 77), n('E5', 76), n('C5', 72), n('D5', 74), n('C5', 72),
    ],
  },
  {
    id: 'twinkle-twinkle',
    title: 'Twinkle Twinkle',
    artist: 'Traditional',
    difficulty: 'beginner',
    notes: [
      n('C4', 60), n('C4', 60), n('G4', 67), n('G4', 67),
      n('A4', 69), n('A4', 69), n('G4', 67),
      n('F4', 65), n('F4', 65), n('E4', 64), n('E4', 64),
      n('D4', 62), n('D4', 62), n('C4', 60),
    ],
  },
];
