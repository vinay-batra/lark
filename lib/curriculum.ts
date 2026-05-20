// Lark learning path. A linear ladder of stages, each focused on a specific
// guitar skill and gated by completing one song from the prior stage with
// at least UNLOCK_ACCURACY accuracy.
//
// Why linear: beginners need a clear "what should I play next" answer.
// A skill tree gives flexibility but also analysis paralysis. The 73 free-play
// songs stay available outside the path; this is the recommended route.

import { getSessions, PracticeSession } from './practice';

export const UNLOCK_ACCURACY = 70; // percent

export interface Stage {
  id: string;
  index: number;
  title: string;
  description: string;
  /** What the player learns from this stage. */
  skill: string;
  /** Song IDs (from lib/songs.ts) that belong to this stage. */
  songIds: string[];
}

export const STAGES: Stage[] = [
  {
    id: 'first-sounds',
    index: 0,
    title: 'First sounds',
    description: 'Single-note riffs on the low strings. Get the mic working and your tuning in the pocket.',
    skill: 'Single-string fretting + alternate picking',
    songIds: ['smoke-on-the-water', 'seven-nation-army', 'iron-man'],
  },
  {
    id: 'open-strings',
    index: 1,
    title: 'Open strings',
    description: 'Melodies that use the open strings as anchors. Builds picking-hand accuracy.',
    skill: 'String crossing + open-string ringing',
    songIds: ['ode-to-joy', 'with-or-without-you', 'every-breath-you-take'],
  },
  {
    id: 'first-chords',
    index: 2,
    title: 'First chords',
    description: 'Three open chords (A, D, E) plus G. Strumming on the beat.',
    skill: 'Open chord shapes + strumming',
    songIds: ['three-little-birds', 'knockin-on-heavens-door'],
  },
  {
    id: 'folk-chords',
    index: 3,
    title: 'Folk chords',
    description: 'Add Am, C, F. Most pop songs in history live in this set.',
    skill: 'Chord transitions under pressure',
    songIds: ['stand-by-me', 'let-it-be-chords', 'let-it-be'],
  },
  {
    id: 'power-chords',
    index: 4,
    title: 'Power chords',
    description: 'Movable two-string shapes. The foundation of rock and metal.',
    skill: 'Power chord shape + palm muting',
    songIds: ['smells-like-teen-spirit', 'paranoid', 'enter-sandman'],
  },
  {
    id: 'lead-playing',
    index: 5,
    title: 'Lead playing',
    description: 'Single-note solos high on the neck. Bigger stretches, faster runs.',
    skill: 'Position shifts + scale fluency',
    songIds: ['sweet-child-o-mine', 'sultans-of-swing', 'comfortably-numb-solo'],
  },
];

export interface StageProgress {
  stage: Stage;
  /** True if this stage's gate has been met (a prior stage song was completed). */
  unlocked: boolean;
  /** Best accuracy across the stage's songs. */
  bestAccuracy: number | null;
  /** Song IDs in this stage that have been completed at >= UNLOCK_ACCURACY. */
  cleared: string[];
  /** Number of sessions played on any of this stage's songs. */
  attempts: number;
}

/**
 * Build per-stage progress from the local session history.
 * The first stage is always unlocked; each subsequent stage unlocks when ANY
 * song in the prior stage has been played at >= UNLOCK_ACCURACY.
 */
export function getCurriculumProgress(): StageProgress[] {
  const sessions = getSessions();
  const sessionsBySong = bySong(sessions);
  let priorCleared = true;
  return STAGES.map(stage => {
    const stageSessions = stage.songIds.flatMap(id => sessionsBySong.get(id) ?? []);
    const cleared = stage.songIds.filter(id => (sessionsBySong.get(id) ?? []).some(s => s.accuracy >= UNLOCK_ACCURACY));
    const bestAccuracy = stageSessions.length > 0 ? Math.max(...stageSessions.map(s => s.accuracy)) : null;
    const progress: StageProgress = {
      stage,
      unlocked: priorCleared,
      bestAccuracy,
      cleared,
      attempts: stageSessions.length,
    };
    priorCleared = cleared.length > 0;
    return progress;
  });
}

/** Map of song-title -> sessions. We don't have song IDs in sessions, so match by title. */
function bySong(sessions: PracticeSession[]): Map<string, PracticeSession[]> {
  const m = new Map<string, PracticeSession[]>();
  for (const s of sessions) {
    // Title comparison is lossy (two songs with same title would collide), but
    // PracticeSession doesn't carry song id. Acceptable for v1.
    const key = titleToId(s.songTitle);
    if (!m.has(key)) m.set(key, []);
    m.get(key)!.push(s);
  }
  return m;
}

/** Convert a song title to its canonical id ("Smoke on the Water" -> "smoke-on-the-water"). */
function titleToId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Find the next song the user should play (first uncleared song in the first unlocked stage). */
export function getNextSong(): { stageIndex: number; songId: string } | null {
  const progress = getCurriculumProgress();
  for (const p of progress) {
    if (!p.unlocked) return null;
    const next = p.stage.songIds.find(id => !p.cleared.includes(id));
    if (next) return { stageIndex: p.stage.index, songId: next };
  }
  return null;
}
