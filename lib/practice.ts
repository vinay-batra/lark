import { Song, TabNote } from './songs';

const SESSIONS_KEY = 'lark_sessions';
const SAVED_KEY = 'lark_saved_songs';
const GEN_KEY = 'lark_gen_history';
export const GEN_LIMIT = 3;
const GEN_WINDOW_DAYS = 3;

// ── Types ────────────────────────────────────────────────────────────────────

export interface PracticeSession {
  id: string;
  songTitle: string;
  artist: string;
  accuracy: number;
  hits: number;
  total: number;
  completedAt: string; // ISO
}

export interface SavedSong {
  id: string;
  title: string;
  artist: string;
  customName?: string;
  notes: TabNote[];
  savedAt: string; // ISO
  generated: boolean;
}

// ── Sessions ─────────────────────────────────────────────────────────────────

export function getSessions(): PracticeSession[] {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? '[]');
  } catch { return []; }
}

export function saveSession(s: Omit<PracticeSession, 'id'>): void {
  const sessions = getSessions();
  sessions.push({ ...s, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` });
  // Keep last 500
  if (sessions.length > 500) sessions.splice(0, sessions.length - 500);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getStreak(): number {
  const sessions = getSessions();
  if (sessions.length === 0) return 0;
  const days = Array.from(new Set(sessions.map(s => s.completedAt.slice(0, 10)))).sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) / 86400000;
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}

export function getAvgAccuracy(): number | null {
  const sessions = getSessions();
  if (sessions.length === 0) return null;
  return Math.round(sessions.reduce((s, r) => s + r.accuracy, 0) / sessions.length);
}

// ── Saved songs ───────────────────────────────────────────────────────────────

export function getSavedSongs(): SavedSong[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]');
  } catch { return []; }
}

export function saveSong(song: Song, customName?: string): SavedSong {
  const saved: SavedSong = {
    id: `saved-${Date.now()}`,
    title: song.title,
    artist: song.artist,
    customName,
    notes: song.notes,
    savedAt: new Date().toISOString(),
    generated: song.generated ?? false,
  };
  const list = getSavedSongs();
  list.unshift(saved);
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  return saved;
}

export function renameSavedSong(id: string, customName: string): void {
  const list = getSavedSongs().map(s => s.id === id ? { ...s, customName } : s);
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

export function deleteSavedSong(id: string): void {
  const list = getSavedSongs().filter(s => s.id !== id);
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

export function isSongSaved(songId: string): boolean {
  return getSavedSongs().some(s => s.id === songId || s.title === songId);
}

// ── AI generation rate limit ──────────────────────────────────────────────────

function getGenHistory(): number[] {
  try {
    return JSON.parse(localStorage.getItem(GEN_KEY) ?? '[]');
  } catch { return []; }
}

function recentGens(history: number[]): number[] {
  const cutoff = Date.now() - GEN_WINDOW_DAYS * 86400000;
  return history.filter(t => t > cutoff);
}

export function canGenerate(): { allowed: boolean; remaining: number; resetIn: string | null } {
  const recent = recentGens(getGenHistory());
  const remaining = Math.max(0, GEN_LIMIT - recent.length);
  if (remaining > 0) return { allowed: true, remaining, resetIn: null };
  // Find when the oldest gen expires
  const oldest = Math.min(...recent);
  const resetAt = oldest + GEN_WINDOW_DAYS * 86400000;
  const msLeft = resetAt - Date.now();
  const hoursLeft = Math.ceil(msLeft / 3600000);
  const resetIn = hoursLeft >= 24 ? `${Math.ceil(hoursLeft / 24)}d` : `${hoursLeft}h`;
  return { allowed: false, remaining: 0, resetIn };
}

export function recordGeneration(): void {
  const history = recentGens(getGenHistory());
  history.push(Date.now());
  localStorage.setItem(GEN_KEY, JSON.stringify(history));
}

export function getGenCount(): number {
  return recentGens(getGenHistory()).length;
}
