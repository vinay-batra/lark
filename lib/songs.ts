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
  generated?: boolean;
  notes: TabNote[];
}

function n(string: 1 | 2 | 3 | 4 | 5 | 6, fret: number): TabNote {
  return { string, fret, midi: OPEN_MIDI[string - 1] + fret };
}

export const SONGS: Song[] = [
  // ── Classics / Beginner ───────────────────────────────────────────────────
  {
    id: 'smoke-on-the-water',
    title: 'Smoke on the Water',
    artist: 'Deep Purple',
    difficulty: 'beginner',
    notes: [n(4,0),n(4,3),n(4,5),n(4,0),n(4,3),n(4,6),n(4,5),n(4,0),n(4,3),n(4,5),n(4,3),n(4,0)],
  },
  {
    id: 'seven-nation-army',
    title: 'Seven Nation Army',
    artist: 'The White Stripes',
    difficulty: 'beginner',
    notes: [n(1,0),n(1,0),n(1,3),n(1,0),n(2,3),n(2,1),n(2,0),n(2,0),n(2,1)],
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    difficulty: 'beginner',
    notes: [n(1,0),n(1,0),n(1,1),n(1,3),n(1,3),n(1,1),n(1,0),n(2,3),n(2,1),n(2,1),n(2,3),n(1,0),n(1,0),n(2,3),n(2,3)],
  },
  {
    id: 'twinkle-twinkle',
    title: 'Twinkle Twinkle',
    artist: 'Traditional',
    difficulty: 'beginner',
    notes: [n(2,1),n(2,1),n(1,3),n(1,3),n(1,5),n(1,5),n(1,3),n(1,1),n(1,1),n(1,0),n(1,0),n(2,3),n(2,3),n(2,1)],
  },
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    artist: 'Traditional',
    difficulty: 'beginner',
    notes: [n(1,3),n(1,3),n(1,5),n(1,3),n(1,8),n(1,7),n(1,3),n(1,3),n(1,5),n(1,3),n(1,10),n(1,8),n(1,3),n(1,3),n(1,15),n(1,12),n(1,8),n(1,7),n(1,5)],
  },
  // ── Rock / Metal ─────────────────────────────────────────────────────────
  {
    id: 'nothing-else-matters',
    title: 'Nothing Else Matters',
    artist: 'Metallica',
    difficulty: 'beginner',
    notes: [n(6,0),n(5,2),n(4,2),n(3,0),n(2,0),n(1,0),n(2,0),n(3,0),n(4,2),n(5,2),n(6,0),n(5,2),n(4,2),n(3,0),n(2,0),n(1,0)],
  },
  {
    id: 'enter-sandman',
    title: 'Enter Sandman',
    artist: 'Metallica',
    difficulty: 'intermediate',
    notes: [n(6,0),n(6,0),n(6,7),n(6,9),n(6,7),n(6,5),n(6,3),n(6,0),n(6,3),n(6,0)],
  },
  {
    id: 'iron-man',
    title: 'Iron Man',
    artist: 'Black Sabbath',
    difficulty: 'beginner',
    notes: [n(6,7),n(6,7),n(6,10),n(6,9),n(6,5),n(6,5),n(6,7),n(6,9),n(6,7)],
  },
  {
    id: 'paranoid',
    title: 'Paranoid',
    artist: 'Black Sabbath',
    difficulty: 'beginner',
    notes: [n(6,0),n(6,2),n(6,3),n(6,2),n(6,0),n(6,0),n(6,3),n(6,2),n(6,0)],
  },
  {
    id: 'back-in-black',
    title: 'Back in Black',
    artist: 'AC/DC',
    difficulty: 'beginner',
    notes: [n(6,0),n(6,0),n(6,0),n(6,5),n(6,7),n(6,7),n(6,5),n(6,3),n(6,0),n(6,5),n(6,7),n(6,7),n(6,5),n(6,3),n(6,0)],
  },
  {
    id: 'thunderstruck',
    title: 'Thunderstruck',
    artist: 'AC/DC',
    difficulty: 'intermediate',
    notes: [n(2,0),n(2,2),n(2,3),n(2,5),n(2,7),n(2,8),n(2,10),n(2,12),n(2,10),n(2,8),n(2,7),n(2,5),n(2,3),n(2,2),n(2,0)],
  },
  {
    id: 'eye-of-the-tiger',
    title: 'Eye of the Tiger',
    artist: 'Survivor',
    difficulty: 'beginner',
    notes: [n(6,0),n(6,0),n(6,3),n(6,5),n(6,0),n(6,0),n(6,3),n(6,5),n(6,4),n(6,3),n(6,0)],
  },
  {
    id: 'crazy-train',
    title: 'Crazy Train',
    artist: 'Ozzy Osbourne',
    difficulty: 'intermediate',
    notes: [n(5,0),n(5,0),n(5,0),n(5,7),n(5,0),n(5,9),n(5,10),n(5,7),n(5,0)],
  },
  {
    id: 'highway-to-hell',
    title: 'Highway to Hell',
    artist: 'AC/DC',
    difficulty: 'beginner',
    notes: [n(1,5),n(1,5),n(1,3),n(1,5),n(1,3),n(1,0),n(1,3),n(1,5),n(1,5),n(1,10),n(1,8)],
  },
  {
    id: 'come-as-you-are',
    title: 'Come As You Are',
    artist: 'Nirvana',
    difficulty: 'beginner',
    notes: [n(6,0),n(6,0),n(6,3),n(6,0),n(6,0),n(6,2),n(6,0),n(6,0),n(6,3),n(6,3),n(6,2)],
  },
  {
    id: 'smells-like-teen-spirit',
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    difficulty: 'intermediate',
    notes: [n(6,1),n(6,1),n(6,6),n(6,6),n(6,4),n(6,4),n(6,9),n(6,9),n(6,1),n(6,1),n(6,6),n(6,6)],
  },
  {
    id: 'sweet-child-o-mine',
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    difficulty: 'intermediate',
    notes: [n(3,7),n(1,0),n(3,7),n(1,0),n(1,3),n(1,0),n(1,3),n(2,5),n(3,5),n(2,5),n(3,5),n(3,7)],
  },
  {
    id: 'welcome-to-the-jungle',
    title: 'Welcome to the Jungle',
    artist: "Guns N' Roses",
    difficulty: 'intermediate',
    notes: [n(5,0),n(5,0),n(5,4),n(5,5),n(5,7),n(5,5),n(5,4),n(5,0),n(5,4),n(5,5),n(5,7)],
  },
  {
    id: 'walk-this-way',
    title: 'Walk This Way',
    artist: 'Aerosmith',
    difficulty: 'beginner',
    notes: [n(5,0),n(5,3),n(5,5),n(5,0),n(5,3),n(5,7),n(5,5),n(5,3),n(5,0)],
  },
  {
    id: 'brain-stew',
    title: 'Brain Stew',
    artist: 'Green Day',
    difficulty: 'beginner',
    notes: [n(6,0),n(6,0),n(5,10),n(5,10),n(5,9),n(5,9),n(5,8),n(5,8),n(5,7),n(5,7)],
  },
  {
    id: 'boulevard-of-broken-dreams',
    title: 'Boulevard of Broken Dreams',
    artist: 'Green Day',
    difficulty: 'beginner',
    notes: [n(6,1),n(6,1),n(6,4),n(6,6),n(6,1),n(6,1),n(6,4),n(6,7),n(6,6)],
  },
  {
    id: 'my-hero',
    title: 'My Hero',
    artist: 'Foo Fighters',
    difficulty: 'intermediate',
    notes: [n(6,7),n(6,7),n(6,10),n(6,0),n(6,0),n(6,3),n(6,5),n(6,0)],
  },
  // ── Pop / Alternative ────────────────────────────────────────────────────
  {
    id: 'mr-brightside',
    title: 'Mr. Brightside',
    artist: 'The Killers',
    difficulty: 'beginner',
    notes: [n(1,6),n(1,6),n(1,6),n(1,5),n(1,3),n(1,5),n(1,6),n(1,8),n(1,8),n(1,6),n(1,5),n(1,3)],
  },
  {
    id: 'dont-stop-believin',
    title: "Don't Stop Believin'",
    artist: 'Journey',
    difficulty: 'beginner',
    notes: [n(1,0),n(1,2),n(1,7),n(1,9),n(1,5),n(1,7),n(1,2),n(1,0),n(1,0),n(2,0),n(1,2)],
  },
  {
    id: 'creep',
    title: 'Creep',
    artist: 'Radiohead',
    difficulty: 'beginner',
    notes: [n(1,3),n(1,7),n(1,8),n(1,7),n(1,3),n(1,2),n(1,3),n(1,7),n(1,3)],
  },
  {
    id: 'yellow',
    title: 'Yellow',
    artist: 'Coldplay',
    difficulty: 'beginner',
    notes: [n(1,3),n(1,5),n(1,7),n(1,10),n(1,12),n(1,10),n(1,7),n(1,5),n(1,3)],
  },
  {
    id: 'with-or-without-you',
    title: 'With or Without You',
    artist: 'U2',
    difficulty: 'beginner',
    notes: [n(2,3),n(1,0),n(1,2),n(1,5),n(1,7),n(1,5),n(1,3),n(1,2),n(1,0),n(2,3)],
  },
  {
    id: 'losing-my-religion',
    title: 'Losing My Religion',
    artist: 'R.E.M.',
    difficulty: 'beginner',
    notes: [n(1,0),n(1,2),n(1,3),n(1,5),n(1,7),n(1,5),n(1,3),n(1,2),n(1,0)],
  },
  {
    id: 'in-the-end',
    title: 'In the End',
    artist: 'Linkin Park',
    difficulty: 'beginner',
    notes: [n(2,1),n(2,3),n(1,0),n(1,3),n(1,0),n(2,3),n(2,1),n(1,0),n(2,3),n(2,1)],
  },
  {
    id: 'numb',
    title: 'Numb',
    artist: 'Linkin Park',
    difficulty: 'beginner',
    notes: [n(1,4),n(1,6),n(1,8),n(1,11),n(1,8),n(1,6),n(1,4),n(1,6),n(1,4)],
  },
  {
    id: 'every-breath-you-take',
    title: 'Every Breath You Take',
    artist: 'The Police',
    difficulty: 'beginner',
    notes: [n(1,5),n(1,7),n(1,9),n(1,7),n(1,5),n(1,4),n(1,5),n(1,0),n(1,5),n(1,4)],
  },
  {
    id: 'under-the-bridge',
    title: 'Under the Bridge',
    artist: 'Red Hot Chili Peppers',
    difficulty: 'intermediate',
    notes: [n(1,0),n(1,2),n(1,4),n(1,7),n(1,5),n(1,4),n(1,2),n(1,0),n(2,0),n(2,2)],
  },
  // ── Classic Rock / Blues ─────────────────────────────────────────────────
  {
    id: 'wish-you-were-here',
    title: 'Wish You Were Here',
    artist: 'Pink Floyd',
    difficulty: 'beginner',
    notes: [n(1,0),n(1,0),n(1,4),n(1,4),n(1,5),n(1,4),n(1,0),n(1,0),n(1,2),n(1,0)],
  },
  {
    id: 'hotel-california',
    title: 'Hotel California',
    artist: 'Eagles',
    difficulty: 'intermediate',
    notes: [n(2,0),n(2,7),n(1,5),n(1,0),n(2,7),n(2,3),n(1,0),n(2,7),n(1,3),n(2,3)],
  },
  {
    id: 'stairway-to-heaven',
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    difficulty: 'intermediate',
    notes: [n(5,0),n(4,2),n(3,0),n(2,1),n(1,0),n(2,1),n(3,0),n(4,2),n(5,0),n(4,3),n(3,2),n(2,3),n(1,2)],
  },
  {
    id: 'wonderful-tonight',
    title: 'Wonderful Tonight',
    artist: 'Eric Clapton',
    difficulty: 'beginner',
    notes: [n(1,3),n(1,5),n(1,3),n(2,3),n(1,0),n(2,3),n(2,1),n(2,3),n(1,0)],
  },
  {
    id: 'sweet-home-alabama',
    title: 'Sweet Home Alabama',
    artist: 'Lynyrd Skynyrd',
    difficulty: 'beginner',
    notes: [n(3,2),n(3,0),n(3,2),n(4,0),n(3,0),n(3,2),n(2,3),n(3,2),n(3,0)],
  },
  {
    id: 'good-riddance',
    title: 'Good Riddance (Time of Your Life)',
    artist: 'Green Day',
    difficulty: 'beginner',
    notes: [n(3,0),n(3,2),n(3,4),n(3,5),n(3,4),n(3,2),n(3,0),n(3,2),n(3,0)],
  },
  // ── Beatles ──────────────────────────────────────────────────────────────
  {
    id: 'let-it-be',
    title: 'Let It Be',
    artist: 'The Beatles',
    difficulty: 'beginner',
    notes: [n(2,1),n(2,3),n(1,0),n(1,3),n(1,0),n(2,3),n(2,1),n(2,1)],
  },
  {
    id: 'hey-jude',
    title: 'Hey Jude',
    artist: 'The Beatles',
    difficulty: 'beginner',
    notes: [n(1,1),n(1,3),n(1,5),n(1,6),n(1,5),n(1,3),n(1,1),n(1,3),n(1,1)],
  },
  {
    id: 'blackbird',
    title: 'Blackbird',
    artist: 'The Beatles',
    difficulty: 'beginner',
    notes: [n(3,0),n(3,2),n(3,3),n(3,5),n(3,7),n(3,8),n(1,0),n(1,3),n(1,0),n(3,8),n(3,7)],
  },
  {
    id: 'yesterday',
    title: 'Yesterday',
    artist: 'The Beatles',
    difficulty: 'beginner',
    notes: [n(3,0),n(3,2),n(3,3),n(3,5),n(3,7),n(3,3),n(3,5),n(3,3),n(3,2),n(3,0)],
  },
  // ── Country / Folk ───────────────────────────────────────────────────────
  {
    id: 'jolene',
    title: 'Jolene',
    artist: 'Dolly Parton',
    difficulty: 'beginner',
    notes: [n(2,4),n(1,0),n(1,2),n(1,4),n(1,5),n(1,4),n(1,2),n(1,0),n(2,4),n(2,4)],
  },
  {
    id: 'country-roads',
    title: 'Take Me Home, Country Roads',
    artist: 'John Denver',
    difficulty: 'beginner',
    notes: [n(1,3),n(1,5),n(1,7),n(1,10),n(1,7),n(1,5),n(1,3),n(1,0),n(2,3),n(2,0)],
  },
  {
    id: 'more-than-words',
    title: 'More Than Words',
    artist: 'Extreme',
    difficulty: 'beginner',
    notes: [n(3,0),n(2,0),n(2,3),n(1,3),n(1,7),n(1,3),n(2,3),n(2,0),n(3,0)],
  },
  // ── Pop hits ─────────────────────────────────────────────────────────────
  {
    id: 'wonderwall',
    title: 'Wonderwall',
    artist: 'Oasis',
    difficulty: 'beginner',
    notes: [n(3,0),n(2,0),n(1,0),n(2,0),n(3,0),n(2,0),n(1,0),n(2,0),n(3,0),n(2,0)],
  },
  {
    id: 'zombie',
    title: 'Zombie',
    artist: 'The Cranberries',
    difficulty: 'beginner',
    notes: [n(1,0),n(1,2),n(1,3),n(1,5),n(1,5),n(1,3),n(1,2),n(1,0),n(1,2),n(1,3)],
  },
  {
    id: 'iris',
    title: 'Iris',
    artist: 'Goo Goo Dolls',
    difficulty: 'beginner',
    notes: [n(1,5),n(1,7),n(1,9),n(1,7),n(1,5),n(1,4),n(1,5),n(1,7),n(1,9),n(1,12)],
  },
  {
    id: 'let-her-go',
    title: 'Let Her Go',
    artist: 'Passenger',
    difficulty: 'beginner',
    notes: [n(2,0),n(2,1),n(2,3),n(2,5),n(2,3),n(2,1),n(2,0),n(3,0),n(2,1),n(2,3)],
  },
  {
    id: 'hallelujah',
    title: 'Hallelujah',
    artist: 'Leonard Cohen',
    difficulty: 'beginner',
    notes: [n(1,0),n(1,3),n(1,5),n(1,7),n(1,5),n(1,3),n(1,5),n(1,7),n(1,5)],
  },
  {
    id: 'shallow',
    title: 'Shallow',
    artist: 'Lady Gaga',
    difficulty: 'beginner',
    notes: [n(4,0),n(4,2),n(3,0),n(3,2),n(3,4),n(3,2),n(3,0),n(2,0),n(3,2),n(3,0)],
  },
];
