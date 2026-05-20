import { supabase } from './supabase';
import { TabNote } from './songs';

const SESSIONS_KEY = 'lark_sessions';
const SAVED_KEY = 'lark_saved_songs';
const GEN_KEY = 'lark_gen_history';
export const GEN_LIMIT = 3;
const GEN_WINDOW_DAYS = 3;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PracticeSession {
  id: string;
  songTitle: string;
  artist: string;
  accuracy: number;
  hits: number;
  total: number;
  completedAt: string;
}

export interface SavedSong {
  id: string;
  title: string;
  artist: string;
  customName?: string;
  notes: TabNote[];
  bpm?: number;
  savedAt: string;
  generated: boolean;
}

// ── Local helpers ─────────────────────────────────────────────────────────────

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; }
}
function writeLocal(key: string, val: unknown) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export function getSessions(): PracticeSession[] {
  return readLocal<PracticeSession[]>(SESSIONS_KEY, []);
}

export async function saveSession(s: Omit<PracticeSession, 'id'>): Promise<void> {
  const session: PracticeSession = { ...s, id: `${Date.now()}` };
  const sessions = getSessions();
  sessions.push(session);
  if (sessions.length > 500) sessions.splice(0, sessions.length - 500);
  writeLocal(SESSIONS_KEY, sessions);

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('lark_sessions').insert({
        user_id: user.id,
        song_title: s.songTitle,
        artist: s.artist,
        accuracy: s.accuracy,
        hits: s.hits,
        total: s.total,
        completed_at: s.completedAt,
      });
    }
  }
}

export async function loadSessionsFromSupabase(): Promise<void> {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data } = await supabase
    .from('lark_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(500);
  if (!data) return;
  const sessions: PracticeSession[] = data.map(r => ({
    id: r.id,
    songTitle: r.song_title,
    artist: r.artist,
    accuracy: r.accuracy,
    hits: r.hits,
    total: r.total,
    completedAt: r.completed_at,
  }));
  writeLocal(SESSIONS_KEY, sessions);
}

// Returns YYYY-MM-DD in the user's local timezone, so streaks don't reset
// when practicing near midnight or across DST shifts. ISO-UTC bucketing
// (the previous implementation) miscounts for any user not in UTC.
function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getStreak(): number {
  const sessions = getSessions();
  if (sessions.length === 0) return 0;
  const days = Array.from(new Set(sessions.map(s => localDateKey(new Date(s.completedAt))))).sort().reverse();
  const todayD = new Date();
  const yesterdayD = new Date(todayD.getTime() - 86400000);
  const today = localDateKey(todayD);
  const yesterday = localDateKey(yesterdayD);
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = Math.round((new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) / 86400000);
    if (diff === 1) streak++;
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
  return readLocal<SavedSong[]>(SAVED_KEY, []);
}

export async function saveSong(song: { id?: string; title: string; artist: string; notes: TabNote[]; bpm?: number; generated?: boolean }, customName?: string): Promise<SavedSong> {
  // Dedupe: if a song with this canonical id (or matching title+artist for
  // pre-id legacy saves) already exists, return it instead of inserting a
  // duplicate. Prevents a row-per-retry pileup after refresh.
  const list = getSavedSongs();
  const canonicalId = song.id ?? `${song.title}-${song.artist}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const existing = list.find(s =>
    (song.id && s.id === song.id) ||
    (s.title === song.title && s.artist === song.artist)
  );
  if (existing) return existing;

  const saved: SavedSong = {
    id: song.id?.startsWith('saved-') ? song.id : `saved-${canonicalId}-${Date.now()}`,
    title: song.title,
    artist: song.artist,
    customName,
    notes: song.notes,
    bpm: song.bpm,
    savedAt: new Date().toISOString(),
    generated: song.generated ?? false,
  };
  list.unshift(saved);
  writeLocal(SAVED_KEY, list);

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('lark_saved_songs').insert({
        id: saved.id,
        user_id: user.id,
        title: saved.title,
        artist: saved.artist,
        custom_name: saved.customName ?? null,
        notes_json: saved.notes,
        generated: saved.generated,
        saved_at: saved.savedAt,
      });
    }
  }
  return saved;
}

export async function loadSavedSongsFromSupabase(): Promise<void> {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data } = await supabase
    .from('lark_saved_songs')
    .select('*')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false });
  if (!data) return;
  const songs: SavedSong[] = data.map(r => ({
    id: r.id,
    title: r.title,
    artist: r.artist,
    customName: r.custom_name ?? undefined,
    notes: r.notes_json,
    bpm: r.bpm ?? undefined,
    savedAt: r.saved_at,
    generated: r.generated,
  }));
  writeLocal(SAVED_KEY, songs);
}

export async function renameSavedSong(id: string, customName: string): Promise<void> {
  const list = getSavedSongs().map(s => s.id === id ? { ...s, customName } : s);
  writeLocal(SAVED_KEY, list);
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('lark_saved_songs').update({ custom_name: customName }).eq('id', id).eq('user_id', user.id);
  }
}

export async function deleteSavedSong(id: string): Promise<void> {
  writeLocal(SAVED_KEY, getSavedSongs().filter(s => s.id !== id));
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('lark_saved_songs').delete().eq('id', id).eq('user_id', user.id);
  }
}

// ── AI gen rate limit ─────────────────────────────────────────────────────────

function recentLocalGens(): number[] {
  const history = readLocal<number[]>(GEN_KEY, []);
  const cutoff = Date.now() - GEN_WINDOW_DAYS * 86400000;
  return history.filter(t => t > cutoff);
}

export function canGenerate(): { allowed: boolean; remaining: number; resetIn: string | null } {
  const recent = recentLocalGens();
  const remaining = Math.max(0, GEN_LIMIT - recent.length);
  if (remaining > 0) return { allowed: true, remaining, resetIn: null };
  const oldest = Math.min(...recent);
  const msLeft = oldest + GEN_WINDOW_DAYS * 86400000 - Date.now();
  const h = Math.ceil(msLeft / 3600000);
  return { allowed: false, remaining: 0, resetIn: h >= 24 ? `${Math.ceil(h / 24)}d` : `${h}h` };
}

export function recordGeneration(): void {
  const history = recentLocalGens();
  history.push(Date.now());
  writeLocal(GEN_KEY, history);

  if (supabase) {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase!.from('lark_gen_history').insert({ user_id: user.id });
    });
  }
}

export function getGenCount(): number {
  return recentLocalGens().length;
}

// ── Bug reports ───────────────────────────────────────────────────────────────

export async function submitBugReport(message: string): Promise<{ ok: boolean; errMsg?: string }> {
  const pageUrl = typeof window !== 'undefined' ? window.location.pathname : null;
  // Send the user's access token; the server resolves user_id from it. We
  // deliberately do NOT send userId in the body — it would be spoofable.
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  try {
    const res = await fetch('/api/bug-report', {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, pageUrl }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, errMsg: data.error ?? 'Failed to send.' };
    return { ok: true };
  } catch {
    return { ok: false, errMsg: 'Network error. Check your connection.' };
  }
}
