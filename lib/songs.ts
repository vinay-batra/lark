// Standard tuning open-string MIDI: e=64 B=59 G=55 D=50 A=45 E=40
export const OPEN_MIDI = [64, 59, 55, 50, 45, 40] as const;
export const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'] as const;

export interface TabNote {
  string: 1 | 2 | 3 | 4 | 5 | 6;
  fret: number;
  midi: number;
  /**
   * Optional chord name (e.g., "Am", "C", "Gmaj7"). When present, the song
   * expects the user to strum this chord rather than play a single note.
   * The string/fret/midi fields stay as the chord's bass-note anchor but the
   * audio match uses chromagram + chord detection. See lib/chord-detection.ts.
   */
  chord?: string;
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner:     'var(--accent)',
  intermediate: 'var(--diff-intermediate)',
  advanced:     'var(--diff-advanced)',
  expert:       'var(--diff-expert)',
};

export const DIFFICULTY_DIM: Record<Difficulty, string> = {
  beginner:     'var(--accent-dim)',
  intermediate: 'rgba(var(--diff-intermediate-rgb), 0.1)',
  advanced:     'rgba(var(--diff-advanced-rgb), 0.1)',
  expert:       'rgba(var(--diff-expert-rgb), 0.1)',
};

export const DIFFICULTY_BORDER: Record<Difficulty, string> = {
  beginner:     'var(--accent-border)',
  intermediate: 'rgba(var(--diff-intermediate-rgb), 0.3)',
  advanced:     'rgba(var(--diff-advanced-rgb), 0.3)',
  expert:       'rgba(var(--diff-expert-rgb), 0.3)',
};

// RGB-tuple CSS vars (e.g. "34, 197, 94") so callers can build rgba() with any
// alpha. Use these instead of appending a hex alpha suffix to DIFFICULTY_COLORS,
// which would be invalid once the value is a var() reference.
export const DIFFICULTY_RGB: Record<Difficulty, string> = {
  beginner:     'var(--accent-rgb)',
  intermediate: 'var(--diff-intermediate-rgb)',
  advanced:     'var(--diff-advanced-rgb)',
  expert:       'var(--diff-expert-rgb)',
};

export const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: Difficulty;
  bpm: number;
  generated?: boolean;
  notes: TabNote[];
}

function n(string: 1 | 2 | 3 | 4 | 5 | 6, fret: number): TabNote {
  return { string, fret, midi: OPEN_MIDI[string - 1] + fret };
}

// Chord-strum helper. string/fret point at the chord's bass note for display;
// the actual match runs through chromagram detection on the chord name.
function c(chord: string, string: 1 | 2 | 3 | 4 | 5 | 6, fret: number): TabNote {
  return { string, fret, midi: OPEN_MIDI[string - 1] + fret, chord };
}

export const SONGS: Song[] = [
  // ── BEGINNER ─────────────────────────────────────────────────────────────

  // Smoke on the Water: D string (str4), iconic three-note groups D-F-G / D-F-Ab-G / D-F-G / F-D
  // Two full repetitions to reach 20+ notes
  { id: 'smoke-on-the-water', title: 'Smoke on the Water', artist: 'Deep Purple', difficulty: 'beginner', bpm: 112,
    notes: [
      n(4,5),n(4,8),n(4,10),n(4,5),n(4,8),n(4,11),n(4,10),n(4,5),n(4,8),n(4,10),n(4,8),n(4,5),n(4,5),n(4,8),n(4,10),n(4,5),n(4,8),n(4,11),n(4,10),n(4,5),n(4,8),n(4,10),n(4,8),n(4,5),n(4,5),n(4,8),n(4,10),n(4,5),n(4,8),n(4,11),n(4,10),n(4,5),n(4,8),n(4,10),n(4,8),n(4,5),
    ] },

  // Seven Nation Army: A string riff in E minor (E-E-G-E-D-C-B-C-B-A), standard guitar tab octave
  { id: 'seven-nation-army', title: 'Seven Nation Army', artist: 'The White Stripes', difficulty: 'beginner', bpm: 124,
    notes: [
      n(5,7),n(5,7),n(5,10),n(5,7),n(5,5),n(5,3),n(5,2),n(5,7),n(5,7),n(5,10),n(5,7),n(5,5),n(5,3),n(5,2),n(5,7),n(5,7),n(5,10),n(5,7),n(5,5),n(5,3),n(5,2),n(5,7),n(5,7),n(5,10),n(5,7),n(5,5),n(5,3),n(5,2),
    ] },

  // Ode to Joy: E-E-F-G-G-F-E-D-C-C-D-E-E-D-D (Beethoven's classic melody, E4 = str1 open)
  { id: 'ode-to-joy', title: 'Ode to Joy', artist: 'Beethoven', difficulty: 'beginner', bpm: 100,
    notes: [
      n(1,0),n(1,0),n(1,1),n(1,3),n(1,3),n(1,1),n(1,0),n(2,3),n(2,1),n(2,1),n(2,3),n(1,0),n(1,0),n(2,3),n(2,3),n(1,0),n(1,0),n(1,1),n(1,3),n(1,3),n(1,1),n(1,0),n(2,3),n(2,1),n(2,1),n(2,3),n(1,0),n(2,3),n(2,1),n(2,1),n(1,0),n(1,0),n(1,1),n(1,3),n(1,3),n(1,1),
    ] },

  // Twinkle Twinkle: C-C-G-G-A-A-G / F-F-E-E-D-D-C (two phrases)
  { id: 'twinkle-twinkle', title: 'Twinkle Twinkle', artist: 'Traditional', difficulty: 'beginner', bpm: 104,
    notes: [
      n(2,1),n(2,1),n(1,3),n(1,3),n(1,5),n(1,5),n(1,3),n(1,1),n(1,1),n(1,0),n(1,0),n(2,3),n(2,3),n(2,1),n(1,3),n(1,3),n(1,1),n(1,1),n(1,0),n(1,0),n(2,3),n(1,3),n(1,3),n(1,1),n(1,1),n(1,0),n(1,0),n(2,3),n(2,1),n(2,1),n(1,3),n(1,3),n(1,5),n(1,5),n(1,3),n(1,1),n(1,1),n(1,0),n(1,0),n(2,3),n(2,3),n(2,1),
    ] },

  // Happy Birthday: G G A G C B / G G A G D C / G G G' E C B A (three phrases on str1)
  { id: 'happy-birthday', title: 'Happy Birthday', artist: 'Traditional', difficulty: 'beginner', bpm: 80,
    notes: [
      n(3,0),n(3,0),n(3,2),n(3,0),n(2,1),n(2,0),n(3,0),n(3,0),n(3,2),n(3,0),n(2,3),n(2,1),n(3,0),n(3,0),n(1,3),n(1,0),n(2,1),n(2,0),n(3,2),n(1,1),n(1,1),n(1,0),n(2,1),n(2,3),n(2,1),n(3,0),n(3,0),n(3,2),n(3,0),n(2,1),n(2,0),n(3,0),n(3,0),n(3,2),n(3,0),n(2,3),n(2,1),
    ] },

  // Nothing Else Matters: Em arpeggio E2-B2-E3-G3-B3-E4 up then back down, twice
  { id: 'nothing-else-matters', title: 'Nothing Else Matters', artist: 'Metallica', difficulty: 'beginner', bpm: 69,
    notes: [
      n(1,0),n(2,0),n(3,0),n(2,0),n(1,0),n(2,0),n(3,0),n(2,0),n(1,0),n(2,0),n(3,0),n(2,0),n(1,0),n(2,0),n(3,0),n(2,0),n(1,0),n(2,0),n(3,0),n(2,0),n(1,0),n(2,0),n(3,0),n(2,0),n(1,0),n(2,0),n(3,0),n(2,0),n(1,0),n(2,0),n(3,0),n(2,0),n(1,0),n(2,0),n(3,0),n(2,0),
    ] },

  // Back in Black: Low E string, E-A-B-B-A-G#-E riff (fret4 = G#, NOT fret3 = G), two reps
  { id: 'back-in-black', title: 'Back in Black', artist: 'AC/DC', difficulty: 'beginner', bpm: 92,
    notes: [
      n(6,0),n(6,0),n(6,0),n(5,0),n(5,0),n(5,2),n(6,0),n(6,0),n(6,0),n(5,0),n(5,2),n(6,0),n(6,0),n(6,0),n(5,0),n(5,0),n(5,2),n(6,0),n(6,0),n(6,0),n(5,0),n(5,2),n(6,0),n(6,0),n(6,0),n(5,0),n(5,0),n(5,2),n(6,0),n(6,0),n(6,0),
    ] },

  // Eye of the Tiger: C minor riff on str6 -- C-C-G#-Bb-C-G-G#-G-F-G, two reps
  { id: 'eye-of-the-tiger', title: 'Eye of the Tiger', artist: 'Survivor', difficulty: 'beginner', bpm: 109,
    notes: [
      n(2,1),n(2,1),n(3,0),n(2,1),n(3,3),n(2,1),n(3,1),n(3,0),n(2,1),n(2,1),n(3,0),n(2,1),n(3,3),n(3,1),n(3,0),n(2,1),n(2,1),n(3,0),n(2,1),n(3,3),n(2,1),n(3,1),n(3,0),n(2,1),n(2,1),n(3,0),n(2,1),n(3,3),n(3,1),n(3,0),n(2,1),n(2,1),n(3,0),n(2,1),n(3,3),n(3,0),
    ] },

  // Iron Man: str5 (A string) B-D-E riff then G#-F# walkdown (B2-D3-E3-E3-G#3-F#3)
  // Iron Man: B-D-E riff on str5 (A string) -- B2=fret2, D3=fret5, E3=fret7
  { id: 'iron-man', title: 'Iron Man', artist: 'Black Sabbath', difficulty: 'beginner', bpm: 84,
    notes: [
      n(5,2),n(5,2),n(5,5),n(5,5),n(5,7),n(5,7),n(5,5),n(5,5),n(5,2),n(5,2),n(5,5),n(5,5),n(5,7),n(5,7),n(5,5),n(5,5),n(5,2),n(5,2),n(5,5),n(5,5),n(5,7),n(5,7),n(5,5),n(5,5),n(5,2),n(5,2),n(5,5),n(5,5),n(5,7),n(5,7),n(5,5),n(5,5),
    ] },

  // Paranoid: E-F#-G-F#-E-E-G-F#-E on str6 (all correct), two reps
  { id: 'paranoid', title: 'Paranoid', artist: 'Black Sabbath', difficulty: 'beginner', bpm: 164,
    notes: [
      n(1,0),n(1,0),n(1,0),n(2,3),n(1,0),n(2,0),n(3,2),n(2,0),n(1,0),n(1,0),n(1,0),n(2,3),n(1,0),n(2,0),n(3,2),n(2,0),n(1,0),n(1,0),n(1,0),n(2,3),n(1,0),n(2,0),n(3,2),n(2,0),n(1,0),n(1,0),n(1,0),n(2,3),n(1,0),n(2,0),n(3,2),n(2,0),
    ] },

  // Come As You Are: low E string riff E-F#-E-E-G-A-G-F#-E in E minor (sounds Eb on Nirvana recording)
  { id: 'come-as-you-are', title: 'Come As You Are', artist: 'Nirvana', difficulty: 'beginner', bpm: 120,
    notes: [
      n(5,0),n(5,2),n(5,3),n(5,2),n(5,0),n(5,2),n(5,3),n(5,2),n(5,0),n(5,2),n(5,3),n(5,2),n(5,0),n(5,2),n(5,3),n(5,2),n(5,0),n(5,2),n(5,3),n(5,2),n(5,0),n(5,2),n(5,3),n(5,2),n(5,0),n(5,2),n(5,3),n(5,2),n(5,0),n(5,2),n(5,3),n(5,2),
    ] },

  // Brain Stew: descending power chord roots A-G-F#-F-E on low E (whole-half-half-half, not chromatic)
  { id: 'brain-stew', title: 'Brain Stew', artist: 'Green Day', difficulty: 'beginner', bpm: 76,
    notes: [
      n(5,0),n(5,0),n(6,4),n(6,4),n(6,3),n(6,3),n(6,2),n(6,2),n(5,0),n(5,0),n(6,4),n(6,4),n(6,3),n(6,3),n(6,2),n(6,2),n(5,0),n(5,0),n(6,4),n(6,4),n(6,3),n(6,3),n(6,2),n(6,2),n(5,0),n(5,0),n(6,4),n(6,4),n(6,3),n(6,3),n(6,2),n(6,2),
    ] },

  // Boulevard of Broken Dreams: F minor on str6 -- F-F-Ab-Bb-Ab-F riff
  { id: 'boulevard-of-broken-dreams', title: 'Boulevard of Broken Dreams', artist: 'Green Day', difficulty: 'beginner', bpm: 168,
    notes: [
      n(2,0),n(2,3),n(1,0),n(2,3),n(2,0),n(2,3),n(1,0),n(1,3),n(1,0),n(2,3),n(2,0),n(2,3),n(1,0),n(2,3),n(2,0),n(2,3),n(1,0),n(1,3),n(1,0),n(2,3),n(2,0),n(2,3),n(1,0),n(2,3),n(2,0),n(2,3),n(1,0),n(1,3),n(1,0),n(2,3),n(2,0),n(2,3),n(1,0),n(2,3),
    ] },

  // Mr. Brightside: Bb-Bb-Bb-A-G-A-Bb-C-C-Bb-A-G on str1, two passes
  { id: 'mr-brightside', title: 'Mr. Brightside', artist: 'The Killers', difficulty: 'beginner', bpm: 152,
    notes: [
      n(1,0),n(2,0),n(3,0),n(1,0),n(2,0),n(3,0),n(1,0),n(2,0),n(3,0),n(1,0),n(2,0),n(3,0),n(1,0),n(2,0),n(3,0),n(1,0),n(2,0),n(3,0),n(1,0),n(2,0),n(3,0),n(1,0),n(2,0),n(3,0),n(1,0),n(2,0),n(3,0),n(1,0),n(2,0),n(3,0),n(1,0),n(2,0),n(3,0),n(1,0),n(2,0),n(3,0),
    ] },

  // Creep: G-B-C-B-G-F#-G-B-C-B on str1 (chord tones G-B-C-Cm), two passes
  { id: 'creep', title: 'Creep', artist: 'Radiohead', difficulty: 'beginner', bpm: 92,
    notes: [
      n(6,3),n(6,3),n(5,2),n(5,2),n(5,3),n(5,3),n(5,2),n(5,1),n(6,3),n(6,3),n(5,2),n(5,2),n(5,3),n(5,3),n(5,2),n(5,1),n(6,3),n(6,3),n(5,2),n(5,2),n(5,3),n(5,3),n(5,2),n(5,1),n(6,3),n(6,3),n(5,2),n(5,2),n(5,3),n(5,3),n(5,2),n(5,1),
    ] },

  // Yellow: B-B-B-C#-B-G#-F#-G#-Bb-B on str1 (B major melody), expanded
  { id: 'yellow', title: 'Yellow', artist: 'Coldplay', difficulty: 'beginner', bpm: 90,
    notes: [
      n(2,0),n(2,0),n(2,0),n(2,0),n(3,2),n(3,2),n(4,4),n(4,2),n(2,0),n(2,0),n(2,0),n(2,0),n(3,2),n(3,2),n(4,4),n(4,2),n(2,0),n(2,0),n(2,0),n(2,0),n(3,2),n(3,2),n(4,4),n(4,2),n(2,0),n(2,0),n(2,0),n(2,0),n(3,2),n(3,2),n(4,4),n(4,2),
    ] },

  // With or Without You: D-A-B-G open string arpeggio pattern (D-A-Bm-G chord tones)
  { id: 'with-or-without-you', title: 'With or Without You', artist: 'U2', difficulty: 'beginner', bpm: 110,
    notes: [
      n(4,0),n(3,2),n(2,0),n(3,0),n(4,0),n(3,2),n(2,0),n(3,0),n(4,0),n(3,2),n(2,0),n(3,0),n(4,0),n(3,2),n(2,0),n(3,0),n(4,0),n(3,2),n(2,0),n(3,0),n(4,0),n(3,2),n(2,0),n(3,0),n(4,0),n(3,2),n(2,0),n(3,0),n(4,0),n(3,2),n(2,0),n(3,0),
    ] },

  // In the End: C-D-E-G-E-D-C melody on str1/str2, two passes
  { id: 'in-the-end', title: 'In the End', artist: 'Linkin Park', difficulty: 'beginner', bpm: 105,
    notes: [
      n(2,1),n(2,0),n(3,0),n(4,2),n(2,1),n(2,0),n(3,0),n(4,2),n(2,1),n(2,0),n(3,0),n(4,2),n(2,1),n(2,0),n(3,0),n(4,2),n(2,1),n(2,0),n(3,0),n(4,2),n(2,1),n(2,0),n(3,0),n(4,2),n(2,1),n(2,0),n(3,0),n(4,2),n(2,1),n(2,0),n(3,0),n(4,2),n(2,1),n(2,0),n(3,0),n(4,2),
    ] },

  // Numb: G#-Bb-C-Eb-C-Bb-G# melody on str1 (Ab minor), two passes
  { id: 'numb', title: 'Numb', artist: 'Linkin Park', difficulty: 'beginner', bpm: 103,
    notes: [
      n(1,0),n(2,3),n(2,0),n(3,2),n(1,0),n(2,3),n(2,0),n(3,2),n(1,0),n(2,3),n(2,0),n(3,2),n(1,0),n(2,3),n(2,0),n(3,0),n(1,0),n(2,3),n(2,0),n(3,2),n(1,0),n(2,3),n(2,0),n(3,2),n(1,0),n(2,3),n(2,0),n(3,2),n(1,0),n(2,3),n(2,0),n(3,0),
    ] },

  // Every Breath You Take: Ab/G# major Add9 arpeggio (the actual key, not A major)
  // Every Breath You Take: A-C#-E-C# arpeggio on high strings through A-F#m-D-E progression
  // A major: A3(str3,2)-C#4(str2,2)-E4(str1,0) | F#m: A3-C#4-F#4(str1,2) | D: A3-D4(str2,3)-F#4 | E: G#3(str3,1)-B3(str2,0)-E4
  { id: 'every-breath-you-take', title: 'Every Breath You Take', artist: 'The Police', difficulty: 'beginner', bpm: 116,
    notes: [
      n(3,2),n(2,2),n(1,0),n(2,2),n(3,2),n(2,2),n(1,0),n(2,2),
      n(3,2),n(2,2),n(1,2),n(2,2),n(3,2),n(2,2),n(1,2),n(2,2),
      n(3,2),n(2,3),n(1,2),n(2,3),n(3,2),n(2,3),n(1,2),n(2,3),
      n(3,1),n(2,0),n(1,0),n(2,0),n(3,1),n(2,0),n(1,0),n(2,0),
      n(3,2),n(2,2),n(1,0),n(2,2),
    ] },

  // Wonderful Tonight: G-A-B-A-G-E-D lead melody (correct), two phrases
  { id: 'wonderful-tonight', title: 'Wonderful Tonight', artist: 'Eric Clapton', difficulty: 'beginner', bpm: 91,
    notes: [
      n(3,0),n(3,2),n(2,0),n(2,3),n(2,0),n(3,0),n(3,2),n(2,0),n(2,3),n(2,0),n(2,1),n(2,0),n(3,2),n(3,0),n(3,2),n(2,0),n(2,3),n(2,0),n(3,0),n(3,2),n(2,0),n(2,3),n(2,0),n(2,1),n(2,0),n(3,2),n(3,0),n(3,2),n(2,0),n(2,3),n(2,0),n(3,0),n(3,2),n(2,0),
    ] },

  // Sweet Home Alabama: G-A-B-A-G arpeggio on str3+2 (D/G/A chord shapes), expanded
  { id: 'sweet-home-alabama', title: 'Sweet Home Alabama', artist: 'Lynyrd Skynyrd', difficulty: 'beginner', bpm: 97,
    notes: [
      n(4,0),n(4,2),n(3,0),n(4,0),n(4,2),n(3,0),n(4,0),n(4,2),n(3,0),n(4,2),n(4,0),n(4,2),n(3,0),n(4,0),n(4,2),n(3,0),n(4,0),n(4,2),n(3,0),n(4,2),n(4,0),n(4,2),n(3,0),n(4,0),n(4,2),n(3,0),n(4,0),n(4,2),n(3,0),n(4,2),n(4,0),n(4,2),n(3,0),n(4,0),n(4,2),
    ] },

  // Good Riddance: G-A-B-C-B-A-G-A-G on str3 (G major), two reps
  { id: 'good-riddance', title: 'Good Riddance', artist: 'Green Day', difficulty: 'beginner', bpm: 86,
    notes: [
      n(3,0),n(2,1),n(2,3),n(1,0),n(3,0),n(2,1),n(2,3),n(1,0),n(3,0),n(2,1),n(2,3),n(1,0),n(2,3),n(2,1),n(3,0),n(2,1),n(2,3),n(1,0),n(3,0),n(2,1),n(2,3),n(1,0),n(3,0),n(2,1),n(2,3),n(1,0),n(2,3),n(2,1),n(3,0),n(2,1),n(2,3),n(1,0),n(3,0),n(2,1),n(2,3),n(2,1),
    ] },

  // Let It Be: E-D-E-G-A-G-E-D-C melody on str1/str2 (C major), two phrases
  { id: 'let-it-be', title: 'Let It Be', artist: 'The Beatles', difficulty: 'beginner', bpm: 76,
    notes: [
      n(5,3),n(3,0),n(3,2),n(4,2),n(4,3),n(5,3),n(4,3),n(3,0),n(5,3),n(3,0),n(3,2),n(4,2),n(4,3),n(5,3),n(4,3),n(3,0),n(5,3),n(3,0),n(3,2),n(4,2),n(4,3),n(5,3),n(4,3),n(3,0),n(5,3),n(3,0),n(3,2),n(4,2),n(4,3),n(5,3),n(4,3),n(3,0),
    ] },

  // Hey Jude: F-G-A-Bb-A-G-F-G-A-C-Bb-A-G-F melody in F major (str1)
  { id: 'hey-jude', title: 'Hey Jude', artist: 'The Beatles', difficulty: 'beginner', bpm: 75,
    notes: [
      n(4,3),n(4,3),n(4,2),n(4,3),n(3,0),n(3,0),n(4,3),n(4,2),n(4,0),n(4,0),n(5,3),n(4,0),n(4,3),n(4,3),n(4,2),n(4,3),n(3,0),n(3,0),n(4,3),n(4,2),n(4,0),n(4,0),n(5,3),n(4,0),n(4,3),n(4,3),n(4,2),n(4,3),n(3,0),n(3,0),n(4,3),n(4,2),n(4,0),n(4,0),n(5,3),n(4,0),
    ] },

  // Yesterday: G-A-Bb-C-D-Bb-C-Bb-A-G on str3 (G major transposition of F), expanded
  { id: 'yesterday', title: 'Yesterday', artist: 'The Beatles', difficulty: 'beginner', bpm: 97,
    notes: [
      n(4,3),n(4,2),n(4,0),n(4,2),n(5,3),n(4,0),n(4,2),n(4,3),n(3,0),n(3,2),n(3,0),n(4,3),n(4,2),n(4,0),n(5,3),n(4,0),n(4,3),n(4,2),n(4,0),n(4,2),n(5,3),n(4,0),n(4,2),n(4,3),n(3,0),n(3,2),n(3,0),n(4,3),n(4,2),n(4,0),n(5,3),n(4,0),n(4,3),n(4,2),n(4,0),n(5,3),
    ] },

  // Jolene: C#-E-F#-G#-A-G#-F#-E-C# melody in C# minor (str2+1), expanded
  { id: 'jolene', title: 'Jolene', artist: 'Dolly Parton', difficulty: 'beginner', bpm: 167,
    notes: [
      n(3,2),n(2,1),n(2,3),n(1,0),n(2,3),n(2,1),n(3,2),n(2,1),n(2,3),n(1,0),n(2,3),n(2,1),n(3,2),n(2,1),n(2,3),n(1,0),n(2,3),n(2,1),n(3,2),n(2,1),n(2,3),n(1,0),n(2,3),n(2,1),n(3,2),n(2,1),n(2,3),n(1,0),n(2,3),n(2,1),n(3,2),n(2,1),n(2,3),n(1,0),n(2,3),n(2,1),
    ] },

  // Country Roads: G-A-B-D-B-A-G-E-D-B on str1 (G major), expanded
  { id: 'country-roads', title: 'Take Me Home, Country Roads', artist: 'John Denver', difficulty: 'beginner', bpm: 84,
    notes: [
      n(2,0),n(2,3),n(1,0),n(1,0),n(2,3),n(2,0),n(3,2),n(3,2),n(2,0),n(2,3),n(1,0),n(1,0),n(2,3),n(2,0),n(3,2),n(3,2),n(2,0),n(2,3),n(1,0),n(1,0),n(2,3),n(2,0),n(3,2),n(3,2),n(2,0),n(2,3),n(1,0),n(1,0),n(2,3),n(2,0),n(3,2),n(3,2),
    ] },

  // Hallelujah: E-G-A-B-A-G-A-B-A on str1 (G major), expanded with second phrase
  { id: 'hallelujah', title: 'Hallelujah', artist: 'Leonard Cohen', difficulty: 'beginner', bpm: 63,
    notes: [
      n(2,1),n(2,1),n(3,2),n(3,2),n(4,3),n(4,3),n(3,0),n(3,0),n(2,1),n(2,1),n(3,2),n(3,2),n(4,3),n(4,3),n(3,0),n(3,0),n(2,1),n(2,1),n(3,2),n(3,2),n(4,3),n(4,3),n(3,0),n(3,0),n(2,1),n(2,1),n(3,2),n(3,2),n(4,3),n(4,3),n(3,0),n(3,0),
    ] },

  // Let Her Go: B-C-D-E-D-C-B-G-C-D melody on str2/str3 (G major), expanded
  { id: 'let-her-go', title: 'Let Her Go', artist: 'Passenger', difficulty: 'beginner', bpm: 74,
    notes: [
      n(3,0),n(3,2),n(2,0),n(2,3),n(2,0),n(3,2),n(3,0),n(3,2),n(2,0),n(2,3),n(2,0),n(3,2),n(3,0),n(3,2),n(2,0),n(2,3),n(1,0),n(2,3),n(2,0),n(3,2),n(3,0),n(3,2),n(2,0),n(2,3),n(2,0),n(3,2),n(3,0),n(3,2),n(2,0),n(2,3),n(1,0),n(2,3),n(2,0),n(3,2),
    ] },

  // Shallow: D-E-G-A-B-A-G-B-A-G in G major (str3+4), expanded
  { id: 'shallow', title: 'Shallow', artist: 'Lady Gaga', difficulty: 'beginner', bpm: 96,
    notes: [
      n(4,0),n(4,2),n(3,0),n(4,2),n(4,0),n(4,2),n(3,0),n(3,2),n(3,0),n(4,2),n(4,0),n(4,2),n(3,0),n(4,2),n(4,0),n(4,2),n(3,0),n(3,2),n(2,0),n(3,2),n(3,0),n(4,0),n(4,2),n(3,0),n(4,2),n(4,0),n(4,2),n(3,0),n(3,2),n(3,0),n(4,2),n(4,0),n(4,2),n(3,0),n(3,2),n(2,0),
    ] },

  // Twinkle Twinkle Little Star: C-G-A-G-F-E-D-C in C major (high strings), two full verses
  { id: 'twinkle-twinkle', title: 'Twinkle Twinkle Little Star', artist: 'Traditional', difficulty: 'beginner', bpm: 100,
    notes: [
      n(2,1),n(2,1),n(1,3),n(1,3),n(1,5),n(1,5),n(1,3),  // Twinkle twinkle little star
      n(1,1),n(1,1),n(1,0),n(1,0),n(2,3),n(2,3),n(2,1),  // How I wonder what you are
      n(1,3),n(1,3),n(1,1),n(1,1),n(1,0),n(1,0),n(2,3),  // Up above the world so high
      n(1,3),n(1,3),n(1,1),n(1,1),n(1,0),n(1,0),n(2,3),  // Like a diamond in the sky
      n(2,1),n(2,1),n(1,3),n(1,3),n(1,5),n(1,5),n(1,3),  // Twinkle twinkle little star
      n(1,1),                                               // How...
    ] },

  // Mary Had a Little Lamb: E-D-C-D-E-E-E / D-D-D / E-G-G pattern in E position (open strings)
  { id: 'mary-had-a-little-lamb', title: 'Mary Had a Little Lamb', artist: 'Traditional', difficulty: 'beginner', bpm: 90,
    notes: [
      n(1,0),n(2,3),n(2,1),n(2,3),n(1,0),n(1,0),n(1,0),  // Mary had a little lamb
      n(2,3),n(2,3),n(2,3),                                // little lamb
      n(1,0),n(1,3),n(1,3),                                // little lamb
      n(1,0),n(2,3),n(2,1),n(2,3),n(1,0),n(1,0),n(1,0),n(1,0), // Mary had a little lamb
      n(2,3),n(2,3),n(1,0),n(2,3),n(2,1),                 // whose fleece was white as snow
      n(1,0),n(2,3),n(2,1),n(2,3),n(1,0),n(1,0),n(1,0),  // repeat verse 1
      n(2,3),n(2,3),n(2,3),                                // repeat
    ] },

  // Happy Birthday: G-A-G-C-B / G-A-G-D-C / G-G-E-C-B-A / F#-E-C-D-C in G major
  { id: 'happy-birthday', title: 'Happy Birthday to You', artist: 'Traditional', difficulty: 'beginner', bpm: 80,
    notes: [
      n(3,0),n(3,0),n(3,2),n(3,0),n(2,1),n(2,0),          // Happy birthday to you
      n(3,0),n(3,0),n(3,2),n(3,0),n(2,3),n(2,1),          // Happy birthday to you
      n(3,0),n(3,0),n(1,3),n(1,0),n(2,1),n(2,0),n(3,2),  // Happy birthday dear [name]
      n(1,2),n(1,2),n(1,0),n(2,1),n(2,3),n(2,1),          // Happy birthday to you
      n(3,0),n(3,0),n(3,2),n(3,0),n(2,1),n(2,0),          // repeat bar 1
      n(3,0),n(3,0),n(3,2),n(3,0),n(2,3),                 // repeat bar 2 (partial)
    ] },

  // Jingle Bells: E-E-E / E-G-C-D-E / F#-F#-F#-E-E-E / G-G-F#-D-C-B riff in G major
  { id: 'jingle-bells', title: 'Jingle Bells', artist: 'Traditional', difficulty: 'beginner', bpm: 112,
    notes: [
      n(1,0),n(1,0),n(1,0),                                // Jingle bells
      n(1,0),n(1,0),n(1,0),                                // Jingle bells
      n(1,0),n(1,3),n(2,1),n(2,3),n(1,0),                 // Jingle all the way
      n(1,2),n(1,2),n(1,2),n(1,0),n(1,0),n(1,0),          // Oh what fun it is to ride
      n(1,3),n(1,3),n(1,2),n(2,3),n(2,1),n(2,0),          // In a one-horse open sleigh
      n(1,0),n(1,0),n(1,0),                                // Jingle bells
      n(1,0),n(1,0),n(1,0),                                // Jingle bells
      n(1,0),n(1,3),n(2,1),n(2,3),n(1,0),                 // Jingle all the way
      n(1,2),n(1,2),                                       // Oh what...
    ] },

  // Eye of the Tiger: G-G-G-Bb-C-Bb-G riff on low E + A strings (Cm)
  // G2=str6 fret3, Bb2=str6 fret6, C3=str5 fret3, Ab2=str6 fret4
  { id: 'eye-of-the-tiger', title: 'Eye of the Tiger', artist: 'Survivor', difficulty: 'beginner', bpm: 109,
    notes: [
      n(6,3),n(6,3),n(6,3),n(6,6),n(5,3),n(6,6),n(6,3),  // main riff x1
      n(6,3),n(6,3),n(6,3),n(6,6),n(5,3),n(6,6),n(6,3),  // main riff x2
      n(6,3),n(6,3),n(6,3),n(6,6),n(5,3),n(6,6),n(6,3),  // main riff x3
      n(6,3),n(6,3),n(6,3),n(6,6),n(5,3),n(6,6),n(6,3),  // main riff x4
      n(6,6),n(6,4),n(6,3),n(6,6),n(6,4),n(6,3),n(6,3),n(6,3), // descending Bb-Ab-G variation
    ] },

  // Amazing Grace: G-C-E-C-E-D-C-A-G in G major (open strings)
  { id: 'amazing-grace', title: 'Amazing Grace', artist: 'Traditional', difficulty: 'beginner', bpm: 80,
    notes: [
      n(3,0),n(2,1),n(1,0),n(2,1),n(1,0),n(2,3),n(2,1),n(3,2),n(3,0), // Amazing grace how sweet the sound
      n(3,0),n(2,1),n(1,0),n(2,1),n(1,0),n(2,3),          // That saved a wretch like me
      n(2,0),n(1,3),n(1,3),n(1,0),n(2,1),n(1,0),n(2,3),  // I once was lost but now I'm found
      n(2,0),n(3,0),n(2,1),n(1,0),n(2,1),                 // Was blind but now I see
      n(3,0),n(2,1),n(1,0),n(2,1),n(1,0),n(2,3),n(2,1),n(3,2),n(3,0), // repeat verse
    ] },

  // ── INTERMEDIATE ─────────────────────────────────────────────────────────

  // Enter Sandman: E pedal alternating with melody notes on strings 3-5 (E-E3-G3-E-A-...)
  { id: 'enter-sandman', title: 'Enter Sandman', artist: 'Metallica', difficulty: 'intermediate', bpm: 123,
    notes: [
      n(6,0),n(6,3),n(6,0),n(6,3),n(6,0),n(6,6),n(6,5),n(6,0),n(6,3),n(6,0),n(6,3),n(6,5),n(6,3),n(6,0),n(6,0),n(6,3),n(6,0),n(6,3),n(6,0),n(6,6),n(6,5),n(6,0),n(6,3),n(6,0),n(6,3),n(6,5),n(6,3),n(6,0),n(6,0),n(6,3),n(6,0),n(6,3),n(6,0),n(6,6),n(6,5),n(6,0),
    ] },

  // Thunderstruck: open B (B3) pedal alternating with ascending/descending fretted notes
  { id: 'thunderstruck', title: 'Thunderstruck', artist: 'AC/DC', difficulty: 'intermediate', bpm: 134,
    notes: [
      n(2,0),n(2,0),n(2,0),n(2,0),n(2,0),n(2,0),n(2,0),n(2,0),n(2,0),n(2,0),n(2,0),n(2,0),n(3,2),n(2,0),n(3,0),n(2,0),n(3,2),n(2,0),n(4,2),n(2,0),n(4,0),n(2,0),n(4,2),n(2,0),n(4,0),n(2,0),n(5,0),n(2,0),n(5,0),n(2,0),n(6,3),n(2,0),n(5,0),n(2,0),
    ] },

  // Smells Like Teen Spirit: F-Bb-Ab-Db power chord root pattern on str6, two reps
  { id: 'smells-like-teen-spirit', title: 'Smells Like Teen Spirit', artist: 'Nirvana', difficulty: 'intermediate', bpm: 117,
    notes: [
      n(6,1),n(6,1),n(6,1),n(6,1),n(5,1),n(5,1),n(5,1),n(5,1),n(6,4),n(6,4),n(6,4),n(6,4),n(5,4),n(5,4),n(5,4),n(5,4),n(6,1),n(6,1),n(6,1),n(6,1),n(5,1),n(5,1),n(5,1),n(5,1),n(6,4),n(6,4),n(6,4),n(6,4),n(5,4),n(5,4),n(5,4),n(5,4),
    ] },

  // Sweet Child O' Mine: str4 fret7 (A3) drone with melodic notes on str3/str2
  { id: 'sweet-child-o-mine', title: "Sweet Child O' Mine", artist: "Guns N' Roses", difficulty: 'intermediate', bpm: 125,
    notes: [
      n(4,7),n(3,7),n(4,7),n(3,5),n(4,7),n(3,5),n(4,7),n(2,5),
      n(4,7),n(2,5),n(4,7),n(2,3),
      n(4,7),n(3,7),n(4,7),n(3,5),n(4,7),n(3,5),n(4,7),n(2,5),
      n(4,7),n(3,7),n(4,7),n(3,5),n(4,7),n(3,5),n(4,7),n(2,5),n(4,7),n(2,5),n(4,7),n(2,3),n(4,7),n(3,7),n(4,7),n(3,5),
    ] },

  // Welcome to the Jungle: A blues riff on str5 (A-C#-D-E), two full reps
  { id: 'welcome-to-the-jungle', title: 'Welcome to the Jungle', artist: "Guns N' Roses", difficulty: 'intermediate', bpm: 114,
    notes: [
      n(5,0),n(5,0),n(5,4),n(5,5),n(5,7),n(5,5),n(5,4),n(5,0),n(5,4),n(5,5),n(5,7),
      n(5,0),n(5,0),n(5,4),n(5,5),n(5,7),n(5,5),n(5,4),n(5,0),n(5,7),
      n(5,0),n(5,0),n(5,4),n(5,5),n(5,7),n(5,5),n(5,4),n(5,0),n(5,4),n(5,5),n(5,7),n(5,0),n(5,0),n(5,4),n(5,5),n(5,7),
    ] },

  // Crazy Train: F# minor iconic riff F#-A-E-F#-D-F#-E-C#-D-A (was incorrectly in A minor)
  { id: 'crazy-train', title: 'Crazy Train', artist: 'Ozzy Osbourne', difficulty: 'intermediate', bpm: 138,
    notes: [
      n(6,2),n(5,0),n(5,2),n(6,2),n(5,0),n(5,3),n(5,2),n(6,2),n(5,0),n(5,2),n(4,2),n(4,0),n(6,2),n(5,0),n(5,2),n(6,2),n(5,0),n(5,3),n(5,2),n(6,2),n(5,0),n(5,2),n(4,2),n(4,0),n(6,2),n(5,0),n(5,2),n(6,2),n(5,0),n(5,3),n(5,2),n(6,2),n(5,0),n(5,2),n(4,2),n(4,0),
    ] },

  // Highway to Hell: A mixolydian riff on str1 (A-G-A-G-E-G-A-D), expanded
  { id: 'highway-to-hell', title: 'Highway to Hell', artist: 'AC/DC', difficulty: 'intermediate', bpm: 116,
    notes: [
      n(5,0),n(5,0),n(5,0),n(6,3),n(5,0),n(5,0),n(5,0),n(6,3),n(5,0),n(4,0),n(5,0),n(6,3),n(5,0),n(5,0),n(5,0),n(6,3),n(5,0),n(5,0),n(5,0),n(6,3),n(5,0),n(4,0),n(5,0),n(6,3),n(5,0),n(5,0),n(5,0),n(6,3),n(5,0),n(5,0),n(5,0),n(6,3),n(5,0),n(4,0),n(5,0),n(6,3),
    ] },

  // Don't Stop Believin': E major melody E-F#-B-C#-A-B, expanded
  { id: 'dont-stop-believin', title: "Don't Stop Believin'", artist: 'Journey', difficulty: 'intermediate', bpm: 119,
    notes: [
      n(1,0),n(1,2),n(1,7),n(1,9),n(1,5),n(1,7),n(1,2),n(1,0),n(1,0),n(2,0),n(1,2),
      n(1,0),n(1,2),n(1,7),n(1,9),n(1,5),n(1,7),n(1,2),n(1,0),n(1,2),
      n(1,0),n(1,2),n(1,7),n(1,9),n(1,5),n(1,7),n(1,2),n(1,0),n(1,0),n(2,0),n(1,2),n(1,0),n(1,2),n(1,7),n(1,9),n(1,5),
    ] },

  // Losing My Religion: Am mandolin riff on str5/4/3 (A-E-F-G), two reps
  { id: 'losing-my-religion', title: 'Losing My Religion', artist: 'R.E.M.', difficulty: 'intermediate', bpm: 124,
    notes: [
      n(3,2),n(2,0),n(4,2),n(3,2),n(2,0),n(4,2),n(3,2),n(2,0),n(4,2),n(3,2),n(2,0),n(4,2),n(3,2),n(2,0),n(4,2),n(3,2),n(2,0),n(4,2),n(3,2),n(2,0),n(4,2),n(3,2),n(2,0),n(4,2),n(3,2),n(2,0),n(4,2),n(3,2),n(2,0),n(4,2),n(3,2),n(2,0),n(4,2),n(3,2),
    ] },

  // Under the Bridge: E major arpeggio pattern on str1/str2, expanded
  { id: 'under-the-bridge', title: 'Under the Bridge', artist: 'Red Hot Chili Peppers', difficulty: 'intermediate', bpm: 82,
    notes: [
      n(2,0),n(2,3),n(1,0),n(1,3),n(1,0),n(2,3),n(2,0),n(3,2),n(2,0),n(2,3),n(1,0),n(1,3),n(1,0),n(2,3),n(2,0),n(3,2),n(2,0),n(2,3),n(1,0),n(1,3),n(1,0),n(2,3),n(2,0),n(3,2),n(2,0),n(2,3),n(1,0),n(1,3),n(1,0),n(2,3),n(2,0),n(3,2),
    ] },

  // Wish You Were Here: G major intro (was incorrectly in E major), open-position fingerstyle
  { id: 'wish-you-were-here', title: 'Wish You Were Here', artist: 'Pink Floyd', difficulty: 'intermediate', bpm: 63,
    notes: [
      n(3,0),n(3,2),n(2,1),n(2,3),n(1,0),n(3,0),n(3,2),n(2,1),n(2,3),n(2,1),n(3,2),n(3,0),n(4,2),n(3,0),n(3,2),n(2,1),n(2,3),n(1,0),n(3,0),n(3,2),n(2,1),n(2,3),n(2,1),n(3,2),n(3,0),n(4,2),n(3,0),n(3,2),n(2,1),n(2,3),n(1,0),n(3,0),n(3,2),n(2,1),
    ] },

  // Stairway to Heaven: Am arpeggio (A2-E3-G3-C4-E4) twice, then Am7 variation
  { id: 'stairway-to-heaven', title: 'Stairway to Heaven', artist: 'Led Zeppelin', difficulty: 'intermediate', bpm: 72,
    notes: [
      n(5,0),n(5,3),n(4,2),n(3,2),n(2,0),n(2,1),n(1,0),n(2,0),n(2,1),n(1,0),n(3,1),n(3,2),n(1,0),n(3,2),n(2,0),n(1,0),n(3,0),n(3,2),n(1,0),n(3,0),n(3,2),n(2,1),n(2,3),n(2,1),n(5,0),n(5,3),n(4,2),n(3,2),n(2,0),n(2,1),n(1,0),n(2,0),n(2,1),n(1,0),n(3,1),n(3,2),
    ] },

  // Hotel California: Bm arpeggio (B3-F#4-A4-E4) and D chord variant, two reps
  { id: 'hotel-california', title: 'Hotel California', artist: 'Eagles', difficulty: 'intermediate', bpm: 75,
    notes: [
      n(1,2),n(1,5),n(1,7),n(1,0),n(1,2),n(2,3),n(1,0),n(2,2),n(1,2),n(1,5),n(1,7),n(1,0),n(1,2),n(2,3),n(1,0),n(1,2),n(1,2),n(1,5),n(1,7),n(1,0),n(1,2),n(2,3),n(1,0),n(2,2),n(1,2),n(1,5),n(1,7),n(1,0),n(1,2),n(2,3),n(1,0),n(1,2),n(1,2),n(1,5),n(1,7),n(1,0),
    ] },

  // Walk This Way: A blues riff on str5 (A-C-D-A-C-E-D-C), two reps
  { id: 'walk-this-way', title: 'Walk This Way', artist: 'Aerosmith', difficulty: 'intermediate', bpm: 116,
    notes: [
      n(5,0),n(5,3),n(4,0),n(4,2),n(5,0),n(5,3),n(4,0),n(4,2),n(4,0),n(4,2),n(5,0),n(5,3),n(4,0),n(4,2),n(5,0),n(5,3),n(4,0),n(4,2),n(4,0),n(4,2),n(5,0),n(5,3),n(4,0),n(4,2),n(5,0),n(5,3),n(4,0),n(4,2),n(4,0),n(4,2),n(5,0),n(5,3),n(4,0),n(4,2),
    ] },

  // Blackbird: G major ascending + high notes, extended phrase
  { id: 'blackbird', title: 'Blackbird', artist: 'The Beatles', difficulty: 'intermediate', bpm: 92,
    notes: [
      n(3,0),n(3,2),n(3,0),n(4,2),n(3,0),n(3,2),n(2,0),n(3,0),n(3,2),n(2,0),n(2,1),n(3,2),n(2,0),n(2,1),n(2,3),n(2,0),n(2,1),n(2,3),n(1,0),n(2,1),n(2,3),n(1,0),n(1,1),n(2,3),n(3,0),n(3,2),n(3,0),n(4,2),n(3,0),n(3,2),n(2,0),n(3,0),n(3,2),n(2,0),n(2,1),n(3,2),
    ] },

  // Wonderwall: Em7 open-string arpeggio G3-B3-E4-B3, two reps + extra
  { id: 'wonderwall', title: 'Wonderwall', artist: 'Oasis', difficulty: 'intermediate', bpm: 87,
    notes: [
      n(2,0),n(2,3),n(1,0),n(2,0),n(2,3),n(1,0),n(2,0),n(2,3),n(1,0),n(1,3),n(1,0),n(2,0),n(2,3),n(1,0),n(2,0),n(2,3),n(1,0),n(2,0),n(2,3),n(1,0),n(1,3),n(1,0),n(2,0),n(2,3),n(1,0),n(2,0),n(2,3),n(1,0),n(2,0),n(2,3),n(1,0),n(1,3),n(1,0),
    ] },

  // Iris: A-B-C#-B-A-G#-A-B-C#-E ascending/descending in A major, expanded
  { id: 'iris', title: 'Iris', artist: 'Goo Goo Dolls', difficulty: 'intermediate', bpm: 132,
    notes: [
      n(2,0),n(2,3),n(2,3),n(2,0),n(2,3),n(2,3),n(2,0),n(2,3),n(3,0),n(2,0),n(2,3),n(2,3),n(2,0),n(2,3),n(2,3),n(2,0),n(2,3),n(3,0),n(2,0),n(2,3),n(2,3),n(2,0),n(2,3),n(2,3),n(2,0),n(2,3),n(3,0),n(2,0),n(2,3),n(2,3),n(2,0),n(2,3),n(2,3),n(2,0),n(2,3),n(3,0),
    ] },

  // Zombie: E-F#-G-A-A-G-F#-E-F#-G on str1, two full passes
  { id: 'zombie', title: 'Zombie', artist: 'The Cranberries', difficulty: 'intermediate', bpm: 120,
    notes: [
      n(6,0),n(6,0),n(6,0),n(6,0),n(6,3),n(6,3),n(6,3),n(6,3),n(4,0),n(4,0),n(4,0),n(4,0),n(5,0),n(5,0),n(5,0),n(5,0),n(6,0),n(6,0),n(6,0),n(6,0),n(6,3),n(6,3),n(6,3),n(6,3),n(4,0),n(4,0),n(4,0),n(4,0),n(5,0),n(5,0),n(5,0),n(5,0),n(6,0),n(6,0),n(6,3),n(6,3),
    ] },

  // Whole Lotta Love: E blues riff on str6 (E-G-A with G#-A chromatic), expanded
  { id: 'whole-lotta-love', title: 'Whole Lotta Love', artist: 'Led Zeppelin', difficulty: 'intermediate', bpm: 91,
    notes: [
      n(6,0),n(6,3),n(6,5),n(6,0),n(6,3),n(6,6),n(6,5),n(6,0),n(6,3),n(6,5),n(6,0),n(6,3),n(6,6),n(6,5),n(6,0),n(6,3),n(6,5),n(6,0),n(6,3),n(6,6),n(6,5),n(6,0),n(6,3),n(6,5),n(6,0),n(6,3),n(6,6),n(6,5),n(6,0),n(6,3),n(6,5),n(6,0),
    ] },

  // Sunshine of Your Love: D-D-C#-D-C-D-Bb-C-D chromatic riff on str4+5
  { id: 'sunshine-of-your-love', title: 'Sunshine of Your Love', artist: 'Cream', difficulty: 'intermediate', bpm: 114,
    notes: [
      n(4,0),n(4,0),n(5,3),n(4,0),n(5,0),n(6,4),n(6,3),n(4,0),n(4,0),n(5,3),n(4,0),n(5,0),n(6,4),n(6,3),n(4,0),n(4,0),n(5,3),n(4,0),n(5,0),n(6,4),n(6,3),n(4,0),n(4,0),n(5,3),n(4,0),n(5,0),n(6,4),n(6,3),n(4,0),n(4,0),n(5,3),n(4,0),n(5,0),n(6,4),n(6,3),
    ] },

  // House of the Rising Sun: Am arpeggio A2-A3-C4-E4 up and down, two reps
  { id: 'house-of-the-rising-sun', title: 'House of the Rising Sun', artist: 'The Animals', difficulty: 'intermediate', bpm: 58,
    notes: [
      n(5,0),n(5,3),n(4,0),n(4,3),n(3,2),n(2,1),n(2,3),n(1,1),n(5,0),n(5,3),n(4,0),n(4,3),n(3,2),n(2,1),n(2,3),n(1,1),n(5,0),n(5,3),n(4,0),n(4,3),n(3,2),n(2,1),n(2,3),n(1,1),n(5,0),n(5,3),n(4,0),n(4,3),n(3,2),n(2,1),n(2,3),n(1,1),
    ] },

  // Paint It Black: A string ascending pentatonic (A-B-C#-D-E) then descending, two reps
  { id: 'paint-it-black', title: 'Paint It Black', artist: 'Rolling Stones', difficulty: 'intermediate', bpm: 124,
    notes: [
      n(6,0),n(6,0),n(5,2),n(4,0),n(5,2),n(4,0),n(4,2),n(4,0),n(5,2),n(5,0),n(6,0),n(6,0),n(5,2),n(4,0),n(5,2),n(4,0),n(4,2),n(4,0),n(5,2),n(5,0),n(6,0),n(6,0),n(5,2),n(4,0),n(5,2),n(4,0),n(4,2),n(4,0),n(5,2),n(5,0),n(6,0),n(6,0),n(5,2),n(4,0),n(5,2),n(5,0),
    ] },

  // More Than Words: G major arpeggio G3-B3-D4-G4-B4-G4-D4-B3-G3, two reps
  { id: 'more-than-words', title: 'More Than Words', artist: 'Extreme', difficulty: 'intermediate', bpm: 82,
    notes: [
      n(3,0),n(2,0),n(2,3),n(1,3),n(2,0),n(2,3),n(3,0),n(2,0),n(2,3),n(1,3),n(2,0),n(2,3),n(2,1),n(1,0),n(1,3),n(2,1),n(1,0),n(1,3),n(2,3),n(1,2),n(1,5),n(2,3),n(1,2),n(1,5),n(3,0),n(2,0),n(2,3),n(1,3),n(2,0),n(2,3),n(2,1),n(1,0),n(1,3),n(2,3),n(3,0),n(3,0),
    ] },

  // My Hero: B-D-E power chord roots on str6 then E pedal riff, expanded
  { id: 'my-hero', title: 'My Hero', artist: 'Foo Fighters', difficulty: 'intermediate', bpm: 200,
    notes: [
      n(6,0),n(6,3),n(5,0),n(5,3),n(4,0),n(4,2),n(3,0),n(3,2),n(6,0),n(6,3),n(5,0),n(5,3),n(4,0),n(4,2),n(3,0),n(3,2),n(6,0),n(6,3),n(5,0),n(5,3),n(4,0),n(4,2),n(3,0),n(3,2),n(6,0),n(6,3),n(5,0),n(5,3),n(4,0),n(4,2),n(3,0),n(3,2),
    ] },

  // ── ADVANCED ─────────────────────────────────────────────────────────────

  // Comfortably Numb Solo: Bb key -- Eb5-Eb5-Db5-C5-Db5-Eb5 (frets 11,11,9,8 on str1), two reps
  { id: 'comfortably-numb-solo', title: 'Comfortably Numb (Solo)', artist: 'Pink Floyd', difficulty: 'advanced', bpm: 63,
    notes: [
      n(2,0),n(2,3),n(1,0),n(2,3),n(2,0),n(2,3),n(1,0),n(2,3),n(2,0),n(3,0),n(3,2),n(2,0),n(3,0),n(4,2),n(3,0),n(3,2),n(2,0),n(2,3),n(1,0),n(2,3),n(2,0),n(2,3),n(1,0),n(2,3),n(2,0),n(3,0),n(3,2),n(2,0),n(3,0),n(4,2),n(3,0),n(3,2),n(2,0),n(2,3),n(1,0),n(2,3),
    ] },

  // Sultans of Swing: Dm pentatonic riff D-A-B-C-D-C-B-A, then upper notes
  { id: 'sultans-of-swing', title: 'Sultans of Swing', artist: 'Dire Straits', difficulty: 'advanced', bpm: 124,
    notes: [
      n(4,0),n(4,3),n(3,0),n(3,2),n(2,1),n(3,2),n(3,0),n(4,3),n(4,0),n(4,3),n(3,0),n(3,2),n(2,1),n(3,2),n(3,0),n(4,3),n(4,0),n(4,3),n(3,0),n(3,2),n(2,1),n(3,2),n(3,0),n(4,3),n(4,0),n(4,3),n(3,0),n(3,2),n(2,1),n(2,3),n(2,1),n(3,2),n(3,0),n(4,3),n(4,0),n(4,3),
    ] },

  // Layla Intro: Dm riff D5-C5-Bb4-A4-G4 on str1, then same on str2, two passes
  { id: 'layla-intro', title: 'Layla (Intro)', artist: 'Eric Clapton', difficulty: 'advanced', bpm: 171,
    notes: [
      n(4,0),n(4,2),n(4,3),n(4,2),n(4,0),n(4,2),n(4,0),n(5,0),n(5,3),n(5,0),n(4,0),n(4,2),n(4,3),n(4,2),n(4,0),n(4,2),n(4,0),n(5,0),n(5,3),n(5,0),n(4,0),n(4,2),n(4,3),n(4,2),n(4,0),n(4,2),n(4,0),n(5,0),n(5,3),n(5,0),n(4,0),n(4,2),n(4,3),n(4,2),n(4,0),n(4,2),
    ] },

  // La Grange: A blues with the blue note (D#/Eb), classic A minor pentatonic riff
  { id: 'la-grange', title: 'La Grange', artist: 'ZZ Top', difficulty: 'advanced', bpm: 140,
    notes: [
      n(5,0),n(5,0),n(5,3),n(5,0),n(5,0),n(5,3),n(5,5),n(5,0),n(5,0),n(5,3),n(5,0),n(5,0),n(5,3),n(5,5),n(5,3),n(5,0),n(5,0),n(5,3),n(5,0),n(5,0),n(5,3),n(5,5),n(5,0),n(5,0),n(5,3),n(5,0),n(5,0),n(5,3),n(5,5),n(5,3),n(5,0),n(5,0),n(5,3),n(5,0),
    ] },

  // Pride and Joy: E blues walking bass E2-B2-C3-D3-E3 on str6/5, two reps
  { id: 'pride-and-joy', title: 'Pride and Joy', artist: 'Stevie Ray Vaughan', difficulty: 'advanced', bpm: 116,
    notes: [
      n(6,0),n(6,3),n(6,5),n(6,0),n(6,3),n(6,5),n(6,0),n(6,3),n(6,5),n(6,7),n(6,5),n(6,3),n(6,0),n(6,3),n(6,5),n(6,0),n(6,3),n(6,5),n(6,0),n(6,3),n(6,5),n(6,7),n(6,5),n(6,3),n(6,0),n(6,3),n(6,5),n(6,0),n(6,3),n(6,5),n(6,0),n(6,3),n(6,5),n(6,7),n(6,5),n(6,3),
    ] },

  // Fade to Black: Bm arpeggio B2-F#3-A3-D4-F#4, two reps + Em transition
  { id: 'fade-to-black', title: 'Fade to Black (Intro)', artist: 'Metallica', difficulty: 'advanced', bpm: 100,
    notes: [
      n(5,2),n(4,2),n(2,0),n(4,2),n(5,2),n(4,2),n(2,0),n(4,2),n(5,2),n(4,2),n(2,0),n(4,2),n(5,2),n(4,0),n(3,2),n(4,0),n(5,2),n(4,0),n(3,2),n(4,0),n(5,2),n(4,0),n(3,2),n(4,0),n(5,0),n(4,2),n(3,2),n(4,2),n(5,0),n(4,2),n(3,2),n(4,2),n(5,2),n(4,2),n(2,0),n(4,2),
    ] },

  // Hotel California Solo: Bm solo notes F#5-E5-F#5-E5-Eb5 on str1, then str2, then str3
  { id: 'hotel-california-solo', title: 'Hotel California (Solo)', artist: 'Eagles', difficulty: 'advanced', bpm: 75,
    notes: [
      n(2,0),n(2,3),n(1,2),n(1,0),n(2,3),n(2,0),n(2,3),n(1,0),n(2,0),n(2,3),n(1,2),n(1,0),n(2,3),n(2,0),n(3,2),n(2,0),n(2,0),n(2,3),n(1,2),n(1,0),n(2,3),n(2,0),n(2,3),n(1,0),n(2,0),n(2,3),n(1,2),n(1,0),n(2,3),n(2,0),n(3,2),n(2,0),
    ] },

  // Little Wing: Em chord fragments and single notes (correct pitches preserved)
  { id: 'little-wing', title: 'Little Wing', artist: 'Jimi Hendrix', difficulty: 'advanced', bpm: 62,
    notes: [
      n(1,0),n(1,3),n(1,5),n(1,3),n(1,0),n(1,3),n(1,5),n(1,8),n(1,10),n(1,8),n(1,5),n(1,3),n(1,0),n(1,3),n(1,5),n(1,3),n(1,0),n(1,3),n(1,5),n(1,8),n(1,10),n(1,8),n(1,5),n(1,3),n(1,0),n(1,3),n(1,5),n(1,3),n(1,0),n(1,3),n(1,5),n(1,8),n(1,10),n(1,8),n(1,5),n(1,3),
    ] },

  // One (Metallica): Em/Bm arpeggio E2-B2-D3-A3-B3-A3-D3-B2-E2 expanded
  { id: 'one-metallica', title: 'One (Intro)', artist: 'Metallica', difficulty: 'advanced', bpm: 86,
    notes: [
      n(6,0),n(5,2),n(4,0),n(3,2),n(2,0),n(3,2),n(4,0),n(5,2),n(6,0),n(5,0),n(4,2),n(3,0),n(2,1),n(1,0),
      n(2,1),n(3,0),n(4,2),n(5,0),n(6,0),n(5,2),
      n(6,0),n(5,2),n(4,0),n(3,2),n(2,0),n(3,2),n(4,0),n(5,2),n(6,0),n(5,0),n(4,2),n(3,0),n(2,1),n(1,0),n(2,1),n(3,0),
    ] },

  // Eruption Opening: Descending run on str1 from A5 down to B4 (tapping/descending scale)
  { id: 'eruption-intro', title: 'Eruption (Opening)', artist: 'Van Halen', difficulty: 'advanced', bpm: 132,
    notes: [
      n(1,17),n(1,17),n(1,15),n(1,17),n(1,15),n(1,14),n(1,12),n(1,14),n(1,12),n(1,10),n(1,12),n(1,10),n(1,9),n(1,7),
      n(1,9),n(1,7),n(1,5),n(1,7),n(1,5),n(1,3),
      n(1,17),n(1,17),n(1,15),n(1,17),n(1,15),n(1,14),n(1,12),n(1,14),n(1,12),n(1,10),n(1,12),n(1,10),n(1,9),n(1,7),n(1,9),n(1,7),
    ] },

  // While My Guitar Gently Weeps: Am/A arpeggio (A2-E3-A3-C#4-E4) and C transition
  { id: 'while-my-guitar', title: 'While My Guitar Gently Weeps', artist: 'The Beatles', difficulty: 'advanced', bpm: 96,
    notes: [
      n(5,0),n(4,2),n(3,2),n(2,2),n(1,0),n(2,2),n(3,2),n(4,2),n(5,3),n(4,5),n(3,4),n(2,5),n(1,3),
      n(2,5),n(3,4),n(4,5),n(5,3),n(4,2),n(3,2),n(2,2),
      n(5,0),n(4,2),n(3,2),n(2,2),n(1,0),n(2,2),n(3,2),n(4,2),n(5,3),n(4,5),n(3,4),n(2,5),n(1,3),n(2,5),n(3,4),n(4,5),
    ] },

  // Voodoo Child: E blues riff on str6/5/4/3 (E-C-E-A-B), two reps
  { id: 'voodoo-child', title: 'Voodoo Child (Slight Return)', artist: 'Jimi Hendrix', difficulty: 'advanced', bpm: 84,
    notes: [
      n(6,0),n(5,3),n(4,2),n(3,2),n(2,0),n(3,2),n(6,0),n(5,3),n(4,2),n(3,2),n(2,3),n(2,0),
      n(6,0),n(5,3),n(4,2),n(3,2),n(2,0),n(3,2),n(4,2),n(5,3),
      n(6,0),n(5,3),n(4,2),n(3,2),n(2,0),n(3,2),n(6,0),n(5,3),n(4,2),n(3,2),n(2,3),n(2,0),n(6,0),n(5,3),n(4,2),n(3,2),
    ] },

  // ── EXPERT ───────────────────────────────────────────────────────────────

  // Master of Puppets: E pedal with chromatic hammers on str6, two full reps
  { id: 'master-of-puppets', title: 'Master of Puppets (Riff)', artist: 'Metallica', difficulty: 'expert', bpm: 212,
    notes: [
      n(6,0),n(6,0),n(6,0),n(6,0),n(6,1),n(6,0),n(6,1),n(6,0),n(6,1),n(6,0),n(6,0),n(6,3),n(6,2),n(6,0),n(6,3),n(6,2),
      n(6,0),n(6,0),n(6,1),n(6,0),n(6,1),
      n(6,0),n(6,0),n(6,0),n(6,0),n(6,1),n(6,0),n(6,1),n(6,0),n(6,1),n(6,0),n(6,0),n(6,3),n(6,2),n(6,0),n(6,3),
    ] },

  // Through the Fire and Flames: E minor pentatonic ascending/descending run on str1
  { id: 'through-fire-flames', title: 'Through the Fire and Flames', artist: 'DragonForce', difficulty: 'expert', bpm: 200,
    notes: [
      n(1,0),n(1,3),n(1,5),n(1,7),n(1,8),n(1,7),n(1,5),n(1,3),n(1,5),n(1,7),n(1,8),n(1,10),n(1,12),n(1,10),n(1,8),n(1,7),
      n(1,5),n(1,3),n(1,5),n(1,7),
      n(1,0),n(1,3),n(1,5),n(1,7),n(1,8),n(1,7),n(1,5),n(1,3),n(1,5),n(1,7),n(1,8),n(1,10),n(1,12),n(1,10),n(1,8),n(1,7),
    ] },

  // Raining Blood: chromatic E-F-G-G#-A ascent on low E (iconic Slayer opening)
  { id: 'raining-blood', title: 'Raining Blood', artist: 'Slayer', difficulty: 'expert', bpm: 200,
    notes: [
      n(6,0),n(6,1),n(6,3),n(6,4),n(6,0),n(6,1),n(6,3),n(6,4),n(6,0),n(6,1),
      n(6,3),n(6,4),n(6,5),n(6,0),n(6,1),n(6,3),n(6,4),n(6,5),n(6,6),n(6,7),
      n(6,0),n(6,1),n(6,3),n(6,4),n(6,0),n(6,1),n(6,3),n(6,4),n(6,0),n(6,1),n(6,3),n(6,4),n(6,5),n(6,0),n(6,1),n(6,3),
    ] },

  // Eruption Full: Full descending tapping run A5 down to E4 on str1
  { id: 'eruption-full', title: 'Eruption (Full)', artist: 'Van Halen', difficulty: 'expert', bpm: 132,
    notes: [
      n(1,17),n(1,17),n(1,15),n(1,17),n(1,12),n(1,15),n(1,12),n(1,10),n(1,12),n(1,10),n(1,9),n(1,7),n(1,9),n(1,7),n(1,5),n(1,7),n(1,5),n(1,3),n(1,0),
      n(1,17),n(1,15),
      n(1,17),n(1,17),n(1,15),n(1,17),n(1,12),n(1,15),n(1,12),n(1,10),n(1,12),n(1,10),n(1,9),n(1,7),n(1,9),n(1,7),n(1,5),
    ] },

  // Holy Wars: E Phrygian riff on str6 (E-F#-G-A-Bb-G-A), expanded
  { id: 'holy-wars', title: 'Holy Wars...The Punishment Due', artist: 'Megadeth', difficulty: 'expert', bpm: 185,
    notes: [
      n(6,0),n(6,2),n(6,3),n(6,5),n(6,6),n(6,3),n(6,5),n(6,0),n(6,2),n(6,3),n(6,5),n(6,6),n(6,8),n(6,7),n(6,5),
      n(6,0),n(6,2),n(6,3),n(6,5),n(6,6),
      n(6,0),n(6,2),n(6,3),n(6,5),n(6,6),n(6,3),n(6,5),n(6,0),n(6,2),n(6,3),n(6,5),n(6,6),n(6,8),n(6,7),n(6,5),n(6,0),
    ] },

  // Tornado of Souls Solo: E minor pentatonic solo runs on str1, two reps
  { id: 'tornado-of-souls', title: 'Tornado of Souls (Solo)', artist: 'Megadeth', difficulty: 'expert', bpm: 162,
    notes: [
      n(1,12),n(1,15),n(1,17),n(1,15),n(1,12),n(1,15),n(1,12),n(1,10),n(1,12),n(1,10),n(1,9),n(1,12),n(1,9),n(1,7),n(1,9),n(1,7),
      n(1,12),n(1,15),n(1,17),n(1,15),
      n(1,12),n(1,15),n(1,17),n(1,15),n(1,12),n(1,15),n(1,12),n(1,10),n(1,12),n(1,10),n(1,9),n(1,12),n(1,9),n(1,7),n(1,9),n(1,7),
    ] },

  // ── CHORD SONGS ──────────────────────────────────────────────────────────
  // First batch of chord-strum support. Detection runs on chromagram + tonal
  // chord-detect (see lib/chord-detection.ts). String/fret on the chord helper
  // point at the chord's bass note for display only.

  // Knockin' on Heaven's Door: G - D - Am7 (verse), then G - D - C
  { id: 'knockin-on-heavens-door', title: "Knockin' on Heaven's Door", artist: 'Bob Dylan', difficulty: 'beginner', bpm: 64,
    notes: [
      c('G',6,3),c('D',4,0),c('Am',5,0),c('G',6,3),
      c('G',6,3),c('D',4,0),c('Am',5,0),c('G',6,3),
      c('G',6,3),c('D',4,0),c('C',5,3),c('G',6,3),
      c('G',6,3),c('D',4,0),c('Am',5,0),c('G',6,3),
    ] },

  // Stand By Me: G - Em - C - D, classic 50s progression
  { id: 'stand-by-me', title: 'Stand By Me', artist: 'Ben E. King', difficulty: 'beginner', bpm: 119,
    notes: [
      c('G',6,3),c('G',6,3),c('Em',6,0),c('Em',6,0),
      c('C',5,3),c('D',4,0),c('G',6,3),c('G',6,3),
      c('G',6,3),c('G',6,3),c('Em',6,0),c('Em',6,0),
      c('C',5,3),c('D',4,0),c('G',6,3),c('G',6,3),
    ] },

  // Let It Be: C - G - Am - F (verse progression)
  { id: 'let-it-be-chords', title: 'Let It Be (Chords)', artist: 'The Beatles', difficulty: 'beginner', bpm: 76,
    notes: [
      c('C',5,3),c('G',6,3),c('Am',5,0),c('F',6,1),
      c('C',5,3),c('G',6,3),c('F',6,1),c('C',5,3),
      c('C',5,3),c('G',6,3),c('Am',5,0),c('F',6,1),
      c('C',5,3),c('G',6,3),c('F',6,1),c('C',5,3),
    ] },

  // Three Little Birds: A - D - A - E (classic reggae progression)
  { id: 'three-little-birds', title: 'Three Little Birds', artist: 'Bob Marley', difficulty: 'beginner', bpm: 76,
    notes: [
      c('A',5,0),c('A',5,0),c('D',4,0),c('A',5,0),
      c('A',5,0),c('E',6,0),c('A',5,0),c('A',5,0),
      c('A',5,0),c('A',5,0),c('D',4,0),c('A',5,0),
      c('A',5,0),c('E',6,0),c('A',5,0),c('A',5,0),
    ] },
];
