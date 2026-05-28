// Daily Missions + XP system.
// 3 missions per day, deterministically generated from the date (same all day,
// different each day). Progress calculated from existing localStorage data --
// no event system needed.

import { getSessions } from './practice';
import { STAGES } from './curriculum';
import { SONGS, Difficulty } from './songs';

// ── Types ─────────────────────────────────────────────────────────────────────

export type MissionType =
  | 'play_songs'   // Play N songs today
  | 'accuracy'     // Hit X% accuracy on any song today
  | 'curriculum'   // Play a song from Stage N+
  | 'tuner'        // Open the tuner today
  | 'difficulty'   // Play a song of a specific difficulty today
  | 'streak';      // Play at least one song today (keep streak alive)

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  desc: string;
  xp: number;
  /** Numeric threshold: songs count, accuracy %, etc. */
  target: number;
  current: number;
  completed: boolean;
  /** For difficulty missions: the minimum difficulty that counts. */
  difficulty?: Difficulty;
  /** For curriculum missions: play any song from this stage or higher. */
  stageIndex?: number;
}

// ── XP + Level ────────────────────────────────────────────────────────────────

const XP_KEY = 'lark_xp';

// XP thresholds for each level (index = level - 1).
const LEVEL_THRESHOLDS = [0, 300, 800, 1800, 3500, 6500, 11000, 18000, 28000, 42000];

export function getTotalXp(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(XP_KEY) ?? '0', 10) || 0;
}

export function addXp(amount: number): void {
  if (typeof window === 'undefined') return;
  const current = getTotalXp();
  localStorage.setItem(XP_KEY, String(current + amount));
}

export function getLevel(): number {
  const xp = getTotalXp();
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, LEVEL_THRESHOLDS.length);
}

export interface LevelProgress {
  xp: number;           // total XP
  level: number;
  xpInLevel: number;    // XP earned within current level
  xpForNext: number;    // XP needed to reach next level from current level start
  pct: number;          // 0-100
  maxed: boolean;
}

export function getLevelProgress(): LevelProgress {
  const xp = getTotalXp();
  const level = getLevel();
  const floorXp = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const ceilXp = LEVEL_THRESHOLDS[level] ?? null;
  const maxed = ceilXp === null;
  const xpInLevel = xp - floorXp;
  const xpForNext = maxed ? 0 : (ceilXp ?? 0) - floorXp;
  const pct = maxed || xpForNext === 0 ? 100 : Math.min(100, Math.round((xpInLevel / xpForNext) * 100));
  return { xp, level, xpInLevel, xpForNext, pct, maxed };
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function localDateKey(d?: Date): string {
  const date = d ?? new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ── Seeded PRNG (deterministic, date-based) ───────────────────────────────────

function seededRand(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) | 0;
  }
  return () => {
    h ^= h << 13; h ^= h >> 17; h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}

// ── Mission pool ──────────────────────────────────────────────────────────────

type MissionTemplate = Omit<Mission, 'id' | 'current' | 'completed'>;

const POOL_EASY: MissionTemplate[] = [
  { type: 'play_songs', title: 'First Note', desc: 'Play any 1 song today.', xp: 100, target: 1 },
  { type: 'tuner', title: 'In Tune', desc: 'Open the tuner today.', xp: 100, target: 1 },
  { type: 'streak', title: 'Keep the Streak', desc: 'Play at least one song today.', xp: 100, target: 1 },
  { type: 'accuracy', title: 'Clean Run', desc: 'Hit 60% accuracy on any song.', xp: 100, target: 60 },
];

const POOL_MEDIUM: MissionTemplate[] = [
  { type: 'play_songs', title: 'Warm Up', desc: 'Play 3 songs today.', xp: 200, target: 3 },
  { type: 'accuracy', title: 'Sharp Ears', desc: 'Hit 75% accuracy on any song.', xp: 200, target: 75 },
  { type: 'curriculum', title: 'Stage 1 Riff', desc: 'Play a First Sounds song from the Learning Path.', xp: 200, target: 1, stageIndex: 0 },
  { type: 'curriculum', title: 'Open Strings', desc: 'Play an Open Strings song from the Learning Path.', xp: 200, target: 1, stageIndex: 1 },
  { type: 'difficulty', title: 'Level Up', desc: 'Play any intermediate song.', xp: 200, target: 1, difficulty: 'intermediate' },
];

const POOL_HARD: MissionTemplate[] = [
  { type: 'play_songs', title: 'Practice Session', desc: 'Play 5 songs today.', xp: 300, target: 5 },
  { type: 'accuracy', title: 'Nailed It', desc: 'Hit 85% accuracy on any song.', xp: 300, target: 85 },
  { type: 'difficulty', title: 'Challenge Mode', desc: 'Play an advanced or expert song.', xp: 300, target: 1, difficulty: 'advanced' },
  { type: 'curriculum', title: 'Rock Out', desc: 'Play a song from Stage 3 or higher in the Learning Path.', xp: 300, target: 1, stageIndex: 2 },
  { type: 'accuracy', title: 'Perfect Run', desc: 'Hit 90% accuracy on any song.', xp: 300, target: 90 },
];

// ── Core: getDailyMissions ────────────────────────────────────────────────────

export function getDailyMissions(): Mission[] {
  const dateKey = localDateKey();
  const rand = seededRand(dateKey);

  const pick = <T,>(pool: T[]) => pool[Math.floor(rand() * pool.length)];
  const templates: MissionTemplate[] = [pick(POOL_EASY), pick(POOL_MEDIUM), pick(POOL_HARD)];

  // Load which mission IDs were already awarded XP today (to avoid double-awarding).
  const completionKey = `lark_missions_${dateKey}`;
  let awardedIds: string[] = [];
  try { awardedIds = JSON.parse(localStorage.getItem(completionKey) ?? '[]'); } catch { /* noop */ }

  // Gather today's sessions and tuner flag once.
  const todaySessions = getSessions().filter(s => localDateKey(new Date(s.completedAt)) === dateKey);
  const tunerOpenedToday = typeof window !== 'undefined'
    ? localStorage.getItem(`lark_tuner_${dateKey}`) === '1'
    : false;

  const updated: string[] = [...awardedIds];

  const missions: Mission[] = templates.map((template, i) => {
    const id = `${dateKey}-${i}`;
    let current = 0;

    switch (template.type) {
      case 'play_songs':
        current = Math.min(todaySessions.length, template.target);
        break;

      case 'accuracy':
        current = todaySessions.some(s => s.accuracy >= template.target) ? template.target : 0;
        break;

      case 'tuner':
        current = tunerOpenedToday ? 1 : 0;
        break;

      case 'streak':
        current = todaySessions.length > 0 ? 1 : 0;
        break;

      case 'difficulty': {
        // 'advanced' missions also count 'expert' songs.
        const validTitles = SONGS
          .filter(s => {
            if (template.difficulty === 'advanced') return s.difficulty === 'advanced' || s.difficulty === 'expert';
            return s.difficulty === template.difficulty;
          })
          .map(s => s.title);
        current = todaySessions.some(s => validTitles.includes(s.songTitle)) ? 1 : 0;
        break;
      }

      case 'curriculum': {
        const minStage = template.stageIndex ?? 0;
        const validSongIds = STAGES
          .filter(s => s.index >= minStage)
          .flatMap(s => s.songIds);
        const validTitles = SONGS.filter(s => validSongIds.includes(s.id)).map(s => s.title);
        current = todaySessions.some(s => validTitles.includes(s.songTitle)) ? 1 : 0;
        break;
      }
    }

    const alreadyAwarded = awardedIds.includes(id);
    const justCompleted = !alreadyAwarded && current >= template.target;

    // Award XP once, persist to prevent double-award across re-renders.
    if (justCompleted) {
      addXp(template.xp);
      updated.push(id);
    }

    return { ...template, id, current, completed: alreadyAwarded || justCompleted };
  });

  // Persist updated awarded list if anything changed.
  if (updated.length !== awardedIds.length) {
    try { localStorage.setItem(completionKey, JSON.stringify(updated)); } catch { /* noop */ }
  }

  return missions;
}

/** Call when the user navigates to the tuner so the tuner mission can complete. */
export function markTunerOpened(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`lark_tuner_${localDateKey()}`, '1');
}
