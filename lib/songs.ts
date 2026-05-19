// Standard tuning open-string MIDI: e=64 B=59 G=55 D=50 A=45 E=40
export const OPEN_MIDI = [64, 59, 55, 50, 45, 40] as const;
export const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'] as const;

export interface TabNote {
  string: 1 | 2 | 3 | 4 | 5 | 6;
  fret: number;
  midi: number;
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner:     'var(--accent)',  // green
  intermediate: '#f59e0b',        // yellow
  advanced:     '#ef4444',        // red
  expert:       '#ec4899',        // pink
};

export const DIFFICULTY_DIM: Record<Difficulty, string> = {
  beginner:     'var(--accent-dim)',
  intermediate: 'rgba(245,158,11,0.1)',
  advanced:     'rgba(239,68,68,0.1)',
  expert:       'rgba(236,72,153,0.1)',
};

export const DIFFICULTY_BORDER: Record<Difficulty, string> = {
  beginner:     'var(--accent-border)',
  intermediate: 'rgba(245,158,11,0.3)',
  advanced:     'rgba(239,68,68,0.3)',
  expert:       'rgba(236,72,153,0.3)',
};

export const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: Difficulty;
  generated?: boolean;
  notes: TabNote[];
}

function n(string: 1 | 2 | 3 | 4 | 5 | 6, fret: number): TabNote {
  return { string, fret, midi: OPEN_MIDI[string - 1] + fret };
}

export const SONGS: Song[] = [
  // ── BEGINNER ─────────────────────────────────────────────────────────────
  { id: 'smoke-on-the-water', title: 'Smoke on the Water', artist: 'Deep Purple', difficulty: 'beginner',
    notes: [n(4,0),n(4,3),n(4,5),n(4,0),n(4,3),n(4,6),n(4,5),n(4,0),n(4,3),n(4,5),n(4,3),n(4,0)] },
  { id: 'seven-nation-army', title: 'Seven Nation Army', artist: 'The White Stripes', difficulty: 'beginner',
    notes: [n(1,0),n(1,0),n(1,3),n(1,0),n(2,3),n(2,1),n(2,0),n(2,0),n(2,1)] },
  { id: 'ode-to-joy', title: 'Ode to Joy', artist: 'Beethoven', difficulty: 'beginner',
    notes: [n(1,0),n(1,0),n(1,1),n(1,3),n(1,3),n(1,1),n(1,0),n(2,3),n(2,1),n(2,1),n(2,3),n(1,0),n(1,0),n(2,3),n(2,3)] },
  { id: 'twinkle-twinkle', title: 'Twinkle Twinkle', artist: 'Traditional', difficulty: 'beginner',
    notes: [n(2,1),n(2,1),n(1,3),n(1,3),n(1,5),n(1,5),n(1,3),n(1,1),n(1,1),n(1,0),n(1,0),n(2,3),n(2,3),n(2,1)] },
  { id: 'happy-birthday', title: 'Happy Birthday', artist: 'Traditional', difficulty: 'beginner',
    notes: [n(1,3),n(1,3),n(1,5),n(1,3),n(1,8),n(1,7),n(1,3),n(1,3),n(1,5),n(1,3),n(1,10),n(1,8),n(1,3),n(1,3),n(1,15),n(1,12),n(1,8),n(1,7),n(1,5)] },
  { id: 'nothing-else-matters', title: 'Nothing Else Matters', artist: 'Metallica', difficulty: 'beginner',
    notes: [n(6,0),n(5,2),n(4,2),n(3,0),n(2,0),n(1,0),n(2,0),n(3,0),n(4,2),n(5,2),n(6,0),n(5,2),n(4,2),n(3,0),n(2,0),n(1,0)] },
  { id: 'back-in-black', title: 'Back in Black', artist: 'AC/DC', difficulty: 'beginner',
    notes: [n(6,0),n(6,0),n(6,0),n(6,5),n(6,7),n(6,7),n(6,5),n(6,3),n(6,0),n(6,5),n(6,7),n(6,7),n(6,5),n(6,3),n(6,0)] },
  { id: 'eye-of-the-tiger', title: 'Eye of the Tiger', artist: 'Survivor', difficulty: 'beginner',
    notes: [n(6,0),n(6,0),n(6,3),n(6,5),n(6,0),n(6,0),n(6,3),n(6,5),n(6,4),n(6,3),n(6,0)] },
  { id: 'iron-man', title: 'Iron Man', artist: 'Black Sabbath', difficulty: 'beginner',
    // Black Sabbath tune Bb (half step down). Use -1 fret vs standard to get correct pitches.
    // Bb2=n(6,6), D3=n(6,9), C#3=n(6,8), Ab2=n(6,4)
    notes: [n(6,6),n(6,6),n(6,6),n(6,9),n(6,8),n(6,4),n(6,4),n(6,6),n(6,8),n(6,6)] },
  { id: 'paranoid', title: 'Paranoid', artist: 'Black Sabbath', difficulty: 'beginner',
    notes: [n(6,0),n(6,2),n(6,3),n(6,2),n(6,0),n(6,0),n(6,3),n(6,2),n(6,0)] },
  { id: 'come-as-you-are', title: 'Come As You Are', artist: 'Nirvana', difficulty: 'beginner',
    notes: [n(6,0),n(6,0),n(6,3),n(6,0),n(6,0),n(6,2),n(6,0),n(6,0),n(6,3),n(6,3),n(6,2)] },
  { id: 'brain-stew', title: 'Brain Stew', artist: 'Green Day', difficulty: 'beginner',
    notes: [n(6,0),n(6,0),n(5,10),n(5,10),n(5,9),n(5,9),n(5,8),n(5,8),n(5,7),n(5,7)] },
  { id: 'boulevard-of-broken-dreams', title: 'Boulevard of Broken Dreams', artist: 'Green Day', difficulty: 'beginner',
    notes: [n(6,1),n(6,1),n(6,4),n(6,6),n(6,1),n(6,1),n(6,4),n(6,7),n(6,6)] },
  { id: 'mr-brightside', title: 'Mr. Brightside', artist: 'The Killers', difficulty: 'beginner',
    notes: [n(1,6),n(1,6),n(1,6),n(1,5),n(1,3),n(1,5),n(1,6),n(1,8),n(1,8),n(1,6),n(1,5),n(1,3)] },
  { id: 'creep', title: 'Creep', artist: 'Radiohead', difficulty: 'beginner',
    notes: [n(1,3),n(1,7),n(1,8),n(1,7),n(1,3),n(1,2),n(1,3),n(1,7),n(1,3)] },
  { id: 'yellow', title: 'Yellow', artist: 'Coldplay', difficulty: 'beginner',
    // "Look at the stars, look how they shine for you" vocal melody in B major
    // B4=e|7, C#5=e|9, G#4=e|4, F#4=e|2, A#4=e|6
    notes: [n(1,7),n(1,7),n(1,7),n(1,9),n(1,7),n(1,4),n(1,2),n(1,4),n(1,6),n(1,7)] },
  { id: 'with-or-without-you', title: 'With or Without You', artist: 'U2', difficulty: 'beginner',
    // D string bass ostinato: D3, A2, B2, G2 (the famous repeating bass line)
    notes: [n(4,0),n(5,0),n(2,0),n(3,0),n(4,0),n(5,0),n(2,0),n(3,0),n(4,0),n(5,0)] },
  { id: 'in-the-end', title: 'In the End', artist: 'Linkin Park', difficulty: 'beginner',
    notes: [n(2,1),n(2,3),n(1,0),n(1,3),n(1,0),n(2,3),n(2,1),n(1,0),n(2,3),n(2,1)] },
  { id: 'numb', title: 'Numb', artist: 'Linkin Park', difficulty: 'beginner',
    notes: [n(1,4),n(1,6),n(1,8),n(1,11),n(1,8),n(1,6),n(1,4),n(1,6),n(1,4)] },
  { id: 'every-breath-you-take', title: 'Every Breath You Take', artist: 'The Police', difficulty: 'beginner',
    // Iconic arpeggio in A major: A3, E4, F#4, D4, A3
    // Uses B and e strings in first position
    notes: [n(5,0),n(1,0),n(1,2),n(2,3),n(5,0),n(1,0),n(1,2),n(1,5),n(2,3),n(5,0)] },
  { id: 'wonderful-tonight', title: 'Wonderful Tonight', artist: 'Eric Clapton', difficulty: 'beginner',
    // Intro melody in G: D4, E4, G4, A4, G4, F#4, E4, D4
    notes: [n(2,3),n(1,0),n(1,3),n(1,5),n(1,3),n(1,2),n(1,0),n(2,3),n(1,0),n(2,3)] },
  { id: 'sweet-home-alabama', title: 'Sweet Home Alabama', artist: 'Lynyrd Skynyrd', difficulty: 'beginner',
    notes: [n(3,2),n(3,0),n(3,2),n(4,0),n(3,0),n(3,2),n(2,3),n(3,2),n(3,0)] },
  { id: 'good-riddance', title: 'Good Riddance', artist: 'Green Day', difficulty: 'beginner',
    notes: [n(3,0),n(3,2),n(3,4),n(3,5),n(3,4),n(3,2),n(3,0),n(3,2),n(3,0)] },
  { id: 'let-it-be', title: 'Let It Be', artist: 'The Beatles', difficulty: 'beginner',
    notes: [n(2,1),n(2,3),n(1,0),n(1,3),n(1,0),n(2,3),n(2,1),n(2,1)] },
  { id: 'hey-jude', title: 'Hey Jude', artist: 'The Beatles', difficulty: 'beginner',
    notes: [n(1,1),n(1,3),n(1,5),n(1,6),n(1,5),n(1,3),n(1,1),n(1,3),n(1,1)] },
  { id: 'yesterday', title: 'Yesterday', artist: 'The Beatles', difficulty: 'beginner',
    notes: [n(3,0),n(3,2),n(3,3),n(3,5),n(3,7),n(3,3),n(3,5),n(3,3),n(3,2),n(3,0)] },
  { id: 'jolene', title: 'Jolene', artist: 'Dolly Parton', difficulty: 'beginner',
    notes: [n(2,4),n(1,0),n(1,2),n(1,4),n(1,5),n(1,4),n(1,2),n(1,0),n(2,4),n(2,4)] },
  { id: 'country-roads', title: 'Take Me Home, Country Roads', artist: 'John Denver', difficulty: 'beginner',
    notes: [n(1,3),n(1,5),n(1,7),n(1,10),n(1,7),n(1,5),n(1,3),n(1,0),n(2,3),n(2,0)] },
  { id: 'hallelujah', title: 'Hallelujah', artist: 'Leonard Cohen', difficulty: 'beginner',
    notes: [n(1,0),n(1,3),n(1,5),n(1,7),n(1,5),n(1,3),n(1,5),n(1,7),n(1,5)] },
  { id: 'let-her-go', title: 'Let Her Go', artist: 'Passenger', difficulty: 'beginner',
    notes: [n(2,0),n(2,1),n(2,3),n(2,5),n(2,3),n(2,1),n(2,0),n(3,0),n(2,1),n(2,3)] },
  { id: 'shallow', title: 'Shallow', artist: 'Lady Gaga', difficulty: 'beginner',
    notes: [n(4,0),n(4,2),n(3,0),n(3,2),n(3,4),n(3,2),n(3,0),n(2,0),n(3,2),n(3,0)] },
  // ── INTERMEDIATE ─────────────────────────────────────────────────────────
  { id: 'enter-sandman', title: 'Enter Sandman', artist: 'Metallica', difficulty: 'intermediate',
    notes: [n(6,0),n(6,0),n(6,7),n(6,9),n(6,7),n(6,5),n(6,3),n(6,0),n(6,3),n(6,0)] },
  { id: 'thunderstruck', title: 'Thunderstruck', artist: 'AC/DC', difficulty: 'intermediate',
    notes: [n(2,0),n(2,2),n(2,3),n(2,5),n(2,7),n(2,8),n(2,10),n(2,12),n(2,10),n(2,8),n(2,7),n(2,5),n(2,3),n(2,2),n(2,0)] },
  { id: 'smells-like-teen-spirit', title: 'Smells Like Teen Spirit', artist: 'Nirvana', difficulty: 'intermediate',
    notes: [n(6,1),n(6,1),n(6,6),n(6,6),n(6,4),n(6,4),n(6,9),n(6,9),n(6,1),n(6,1),n(6,6),n(6,6)] },
  { id: 'sweet-child-o-mine', title: "Sweet Child O' Mine", artist: "Guns N' Roses", difficulty: 'intermediate',
    notes: [n(3,7),n(1,0),n(3,7),n(1,0),n(1,3),n(1,0),n(1,3),n(2,5),n(3,5),n(2,5),n(3,5),n(3,7)] },
  { id: 'welcome-to-the-jungle', title: 'Welcome to the Jungle', artist: "Guns N' Roses", difficulty: 'intermediate',
    notes: [n(5,0),n(5,0),n(5,4),n(5,5),n(5,7),n(5,5),n(5,4),n(5,0),n(5,4),n(5,5),n(5,7)] },
  { id: 'crazy-train', title: 'Crazy Train', artist: 'Ozzy Osbourne', difficulty: 'intermediate',
    notes: [n(5,0),n(5,0),n(5,0),n(5,7),n(5,0),n(5,9),n(5,10),n(5,7),n(5,0)] },
  { id: 'highway-to-hell', title: 'Highway to Hell', artist: 'AC/DC', difficulty: 'intermediate',
    notes: [n(1,5),n(1,5),n(1,3),n(1,5),n(1,3),n(1,0),n(1,3),n(1,5),n(1,5),n(1,10),n(1,8)] },
  { id: 'dont-stop-believin', title: "Don't Stop Believin'", artist: 'Journey', difficulty: 'intermediate',
    notes: [n(1,0),n(1,2),n(1,7),n(1,9),n(1,5),n(1,7),n(1,2),n(1,0),n(1,0),n(2,0),n(1,2)] },
  { id: 'losing-my-religion', title: 'Losing My Religion', artist: 'R.E.M.', difficulty: 'intermediate',
    // Iconic mandolin/guitar intro riff in A minor: A3, E3, F3, G3, A3, G3, F3, E3
    notes: [n(5,0),n(4,2),n(4,3),n(3,0),n(5,0),n(3,0),n(4,3),n(4,2),n(5,0),n(4,2),n(3,2)] },
  { id: 'under-the-bridge', title: 'Under the Bridge', artist: 'Red Hot Chili Peppers', difficulty: 'intermediate',
    notes: [n(1,0),n(1,2),n(1,4),n(1,7),n(1,5),n(1,4),n(1,2),n(1,0),n(2,0),n(2,2)] },
  { id: 'wish-you-were-here', title: 'Wish You Were Here', artist: 'Pink Floyd', difficulty: 'intermediate',
    notes: [n(1,0),n(1,0),n(1,4),n(1,4),n(1,5),n(1,4),n(1,0),n(1,0),n(1,2),n(1,0)] },
  { id: 'stairway-to-heaven', title: 'Stairway to Heaven', artist: 'Led Zeppelin', difficulty: 'intermediate',
    notes: [n(5,0),n(4,2),n(3,0),n(2,1),n(1,0),n(2,1),n(3,0),n(4,2),n(5,0),n(4,3),n(3,2),n(2,3),n(1,2)] },
  { id: 'hotel-california', title: 'Hotel California', artist: 'Eagles', difficulty: 'intermediate',
    notes: [n(2,0),n(2,7),n(1,5),n(1,0),n(2,7),n(2,3),n(1,0),n(2,7),n(1,3),n(2,3)] },
  { id: 'walk-this-way', title: 'Walk This Way', artist: 'Aerosmith', difficulty: 'intermediate',
    notes: [n(5,0),n(5,3),n(5,5),n(5,0),n(5,3),n(5,7),n(5,5),n(5,3),n(5,0)] },
  { id: 'blackbird', title: 'Blackbird', artist: 'The Beatles', difficulty: 'intermediate',
    notes: [n(3,0),n(3,2),n(3,3),n(3,5),n(3,7),n(3,8),n(1,0),n(1,3),n(1,0),n(3,8),n(3,7)] },
  { id: 'wonderwall', title: 'Wonderwall', artist: 'Oasis', difficulty: 'intermediate',
    notes: [n(3,0),n(2,0),n(1,0),n(2,0),n(3,0),n(2,0),n(1,0),n(2,0),n(3,0),n(2,0)] },
  { id: 'iris', title: 'Iris', artist: 'Goo Goo Dolls', difficulty: 'intermediate',
    notes: [n(1,5),n(1,7),n(1,9),n(1,7),n(1,5),n(1,4),n(1,5),n(1,7),n(1,9),n(1,12)] },
  { id: 'zombie', title: 'Zombie', artist: 'The Cranberries', difficulty: 'intermediate',
    notes: [n(1,0),n(1,2),n(1,3),n(1,5),n(1,5),n(1,3),n(1,2),n(1,0),n(1,2),n(1,3)] },
  { id: 'whole-lotta-love', title: 'Whole Lotta Love', artist: 'Led Zeppelin', difficulty: 'intermediate',
    notes: [n(6,0),n(6,0),n(6,3),n(6,5),n(6,0),n(6,0),n(6,3),n(6,5),n(6,4),n(6,5)] },
  { id: 'sunshine-of-your-love', title: 'Sunshine of Your Love', artist: 'Cream', difficulty: 'intermediate',
    notes: [n(4,0),n(4,0),n(5,3),n(4,0),n(3,0),n(4,0),n(5,0),n(3,0),n(4,0)] },
  { id: 'house-of-the-rising-sun', title: 'House of the Rising Sun', artist: 'The Animals', difficulty: 'intermediate',
    notes: [n(5,0),n(3,2),n(2,1),n(1,0),n(5,0),n(3,2),n(2,1),n(1,0),n(5,2),n(3,2),n(2,0),n(1,0)] },
  { id: 'paint-it-black', title: 'Paint It Black', artist: 'Rolling Stones', difficulty: 'intermediate',
    notes: [n(6,4),n(6,4),n(6,2),n(6,0),n(5,2),n(5,0),n(4,2),n(4,0),n(3,0),n(3,2),n(2,0),n(2,1)] },
  { id: 'more-than-words', title: 'More Than Words', artist: 'Extreme', difficulty: 'intermediate',
    notes: [n(3,0),n(2,0),n(2,3),n(1,3),n(1,7),n(1,3),n(2,3),n(2,0),n(3,0)] },
  { id: 'my-hero', title: 'My Hero', artist: 'Foo Fighters', difficulty: 'intermediate',
    notes: [n(6,7),n(6,7),n(6,10),n(6,0),n(6,0),n(6,3),n(6,5),n(6,0)] },
  // ── ADVANCED ─────────────────────────────────────────────────────────────
  { id: 'comfortably-numb-solo', title: 'Comfortably Numb (Solo)', artist: 'Pink Floyd', difficulty: 'advanced',
    notes: [n(1,15),n(1,15),n(1,13),n(1,12),n(1,13),n(1,15),n(1,13),n(1,12),n(1,10),n(1,12),n(1,13),n(1,15),n(1,12),n(1,10),n(1,8)] },
  { id: 'sultans-of-swing', title: 'Sultans of Swing', artist: 'Dire Straits', difficulty: 'advanced',
    notes: [n(4,0),n(3,2),n(3,4),n(3,5),n(3,7),n(3,5),n(3,4),n(3,2),n(4,0),n(3,4),n(3,5),n(3,7),n(1,5),n(1,7),n(1,8)] },
  { id: 'layla-intro', title: 'Layla (Intro)', artist: 'Eric Clapton', difficulty: 'advanced',
    notes: [n(1,10),n(1,8),n(1,6),n(1,5),n(1,3),n(1,5),n(1,6),n(1,8),n(1,10),n(2,10),n(2,8),n(2,6),n(2,5),n(2,3)] },
  { id: 'la-grange', title: 'La Grange', artist: 'ZZ Top', difficulty: 'advanced',
    notes: [n(5,0),n(5,3),n(5,5),n(5,7),n(5,5),n(5,3),n(5,0),n(5,3),n(6,0),n(6,3),n(6,5),n(6,7)] },
  { id: 'pride-and-joy', title: 'Pride and Joy', artist: 'Stevie Ray Vaughan', difficulty: 'advanced',
    notes: [n(6,0),n(5,2),n(5,3),n(5,5),n(5,7),n(5,5),n(5,3),n(5,2),n(6,0),n(5,2),n(5,3),n(5,5)] },
  { id: 'fade-to-black', title: 'Fade to Black (Intro)', artist: 'Metallica', difficulty: 'advanced',
    notes: [n(5,0),n(4,2),n(3,0),n(2,1),n(1,0),n(2,1),n(3,2),n(4,0),n(5,3),n(4,2),n(3,0),n(2,0),n(1,0)] },
  { id: 'hotel-california-solo', title: 'Hotel California (Solo)', artist: 'Eagles', difficulty: 'advanced',
    notes: [n(1,14),n(1,12),n(1,14),n(1,12),n(1,11),n(2,14),n(2,12),n(2,14),n(2,12),n(2,10),n(3,12),n(3,11),n(3,9)] },
  { id: 'little-wing', title: 'Little Wing', artist: 'Jimi Hendrix', difficulty: 'advanced',
    notes: [n(1,0),n(2,8),n(1,8),n(1,7),n(2,8),n(1,5),n(1,7),n(2,5),n(1,5),n(1,3),n(2,5),n(1,3),n(2,3),n(1,0)] },
  { id: 'one-metallica', title: 'One (Intro)', artist: 'Metallica', difficulty: 'advanced',
    notes: [n(6,0),n(5,2),n(4,0),n(3,2),n(2,0),n(3,2),n(4,0),n(5,2),n(6,0),n(5,0),n(4,2),n(3,0),n(2,1),n(1,0)] },
  { id: 'eruption-intro', title: 'Eruption (Opening)', artist: 'Van Halen', difficulty: 'advanced',
    notes: [n(1,17),n(1,17),n(1,15),n(1,17),n(1,15),n(1,14),n(1,12),n(1,14),n(1,12),n(1,10),n(1,12),n(1,10),n(1,9),n(1,7)] },
  { id: 'while-my-guitar', title: 'While My Guitar Gently Weeps', artist: 'The Beatles', difficulty: 'advanced',
    notes: [n(5,0),n(4,2),n(3,2),n(2,2),n(1,0),n(2,2),n(3,2),n(4,2),n(5,3),n(4,5),n(3,4),n(2,5),n(1,3)] },
  { id: 'voodoo-child', title: 'Voodoo Child (Slight Return)', artist: 'Jimi Hendrix', difficulty: 'advanced',
    notes: [n(6,0),n(5,3),n(4,2),n(3,2),n(2,0),n(3,2),n(6,0),n(5,3),n(4,2),n(3,2),n(2,3),n(2,0)] },
  // ── EXPERT ───────────────────────────────────────────────────────────────
  { id: 'master-of-puppets', title: 'Master of Puppets (Riff)', artist: 'Metallica', difficulty: 'expert',
    notes: [n(6,0),n(6,0),n(6,0),n(6,0),n(6,1),n(6,0),n(6,1),n(6,0),n(6,1),n(6,0),n(6,0),n(6,3),n(6,2),n(6,0),n(6,3),n(6,2)] },
  { id: 'through-fire-flames', title: 'Through the Fire and Flames', artist: 'DragonForce', difficulty: 'expert',
    notes: [n(1,0),n(1,3),n(1,5),n(1,7),n(1,8),n(1,7),n(1,5),n(1,3),n(1,5),n(1,7),n(1,8),n(1,10),n(1,12),n(1,10),n(1,8),n(1,7)] },
  { id: 'raining-blood', title: 'Raining Blood', artist: 'Slayer', difficulty: 'expert',
    notes: [n(6,0),n(6,0),n(6,0),n(6,6),n(6,5),n(6,3),n(6,0),n(6,0),n(6,6),n(6,5),n(6,3),n(6,0),n(6,5),n(6,3),n(6,0)] },
  { id: 'eruption-full', title: 'Eruption (Full)', artist: 'Van Halen', difficulty: 'expert',
    notes: [n(1,17),n(1,17),n(1,15),n(1,17),n(1,12),n(1,15),n(1,12),n(1,10),n(1,12),n(1,10),n(1,9),n(1,7),n(1,9),n(1,7),n(1,5),n(1,7),n(1,5),n(1,3),n(1,0)] },
  { id: 'holy-wars', title: 'Holy Wars...The Punishment Due', artist: 'Megadeth', difficulty: 'expert',
    notes: [n(6,0),n(6,2),n(6,3),n(6,5),n(6,6),n(6,3),n(6,5),n(6,0),n(6,2),n(6,3),n(6,5),n(6,6),n(6,8),n(6,7),n(6,5)] },
  { id: 'tornado-of-souls', title: 'Tornado of Souls (Solo)', artist: 'Megadeth', difficulty: 'expert',
    notes: [n(1,12),n(1,15),n(1,17),n(1,15),n(1,12),n(1,15),n(1,12),n(1,10),n(1,12),n(1,10),n(1,9),n(1,12),n(1,9),n(1,7),n(1,9),n(1,7)] },
];
