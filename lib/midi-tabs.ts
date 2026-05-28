/**
 * MIDI-to-guitar-tab pipeline.
 *
 * Source: bitmidi.com (free, human-submitted MIDI library, no auth required)
 * Pipeline:
 *   1. Scrape bitmidi search results for the query
 *   2. Download the top-matching MIDI file
 *   3. Parse with midi-file (lightweight, no browser deps)
 *   4. Pick the best non-drum guitar/melody track
 *   5. Extract up to MAX_NOTES notes with timing
 *   6. Convert MIDI pitches to guitar fret/string via note-mapping.ts
 *
 * Why MIDI over Songsterr GP files:
 *   Songsterr serves GP files via signed CloudFront URLs that require a
 *   logged-in session. bitmidi.com serves raw MIDI files with no auth.
 *   MIDI gives absolute note pitches (same accuracy as GP for melody),
 *   though it lacks fingering/vibrato/slide details that GP files have.
 */

import { parseMidi, MidiData } from 'midi-file';
import { notesToTabs, midiToNoteName } from './note-mapping';
import type { TabNote } from './songs';

const SEARCH_TIMEOUT_MS = 6_000;
const DOWNLOAD_TIMEOUT_MS = 10_000;
const MAX_NOTES = 36;
const DRUM_CHANNEL = 9; // General MIDI percussion channel (0-indexed)

export interface MidiTabResult {
  title: string;
  artist: string;
  bpm: number;
  notes: TabNote[];
}

// ── 1. Search bitmidi.com ──────────────────────────────────────────────────

interface BitmidiHit {
  uploadPath: string; // e.g. "/uploads/38559.mid"
  title: string;       // e.g. "Deep Purple - Smoke On The Water.mid"
}

async function searchBitmidi(query: string): Promise<BitmidiHit[]> {
  const url = `https://bitmidi.com/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html',
    },
    signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
  });
  if (!res.ok) return [];

  const html = await res.text();

  // Extract /uploads/{id}.mid paths
  const pathMatches = [...html.matchAll(/\/uploads\/(\d+)\.mid/g)];
  // Extract title attributes near the MIDI links
  const titleMatches = [...html.matchAll(/title="([^"]+\.mid)"/g)];

  return pathMatches.slice(0, 5).map((m, i) => ({
    uploadPath: m[0],
    title: titleMatches[i]?.[1]?.replace('.mid', '') ?? '',
  }));
}

// ── 2. Download MIDI file ──────────────────────────────────────────────────

async function downloadMidi(uploadPath: string): Promise<Buffer | null> {
  const url = `https://bitmidi.com${uploadPath}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://bitmidi.com' },
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

// ── 3+4+5. Parse and extract notes ────────────────────────────────────────

interface NoteEvent {
  midi: number;
  tickStart: number;
  tickDuration: number;
  channel: number;
}

function extractNotes(midi: MidiData): NoteEvent[] {
  // Collect all notes per channel (skipping drums = channel 9)
  const notesByChannel = new Map<number, NoteEvent[]>();
  const guitarProgramChannels = new Set<number>();

  for (const track of midi.tracks) {
    let tick = 0;
    const active = new Map<string, { midi: number; tickStart: number }>();

    for (const event of track) {
      tick += event.deltaTime;
      if (!('channel' in event)) continue;
      const ch = (event as { channel: number }).channel;
      if (ch === DRUM_CHANNEL) continue;

      // Track guitar program assignments
      if (event.type === 'programChange' && 'programNumber' in event) {
        const prog = (event as { programNumber: number }).programNumber;
        if (prog >= 24 && prog <= 31) guitarProgramChannels.add(ch);
      }

      if (event.type === 'noteOn' && 'velocity' in event && (event as { velocity: number }).velocity > 0) {
        active.set(`${ch}-${event.noteNumber}`, { midi: event.noteNumber, tickStart: tick });
      } else if (event.type === 'noteOff' || (event.type === 'noteOn' && (event as { velocity: number }).velocity === 0)) {
        const key = `${ch}-${event.noteNumber}`;
        const start = active.get(key);
        if (start) {
          if (!notesByChannel.has(ch)) notesByChannel.set(ch, []);
          notesByChannel.get(ch)!.push({
            midi: start.midi,
            tickStart: start.tickStart,
            tickDuration: tick - start.tickStart,
            channel: ch,
          });
          active.delete(key);
        }
      }
    }
  }

  // Pick the SINGLE best guitar channel. Strategy:
  //   1. Among GM-guitar channels, pick the one with the lowest average pitch
  //      (rhythm/riff guitar sits lower on the neck than lead guitar).
  //   2. If no GM-guitar channels, pick the non-drum channel with most notes
  //      in guitar range (40-88) that also has the lowest average pitch.
  // Mixing all channels together produces garbage (simultaneous parts collide).
  const candidates = guitarProgramChannels.size > 0
    ? [...guitarProgramChannels]
    : [...notesByChannel.keys()];

  let bestChannel: number | null = null;
  let bestScore = Infinity;

  for (const ch of candidates) {
    const notes = notesByChannel.get(ch) ?? [];
    const inRange = notes.filter(n => n.midi >= GUITAR_LOW && n.midi <= GUITAR_HIGH);
    if (inRange.length < 4) continue; // too few notes to be useful
    const avgMidi = inRange.reduce((s, n) => s + n.midi, 0) / inRange.length;
    // Score = average pitch (lower = more likely to be the main riff)
    // Penalise channels with very few notes relative to the busiest channel
    const busiest = Math.max(...[...notesByChannel.values()].map(ns => ns.length));
    const penaltyFactor = 1 + Math.max(0, 1 - inRange.length / (busiest * 0.5));
    const score = avgMidi * penaltyFactor;
    if (score < bestScore) { bestScore = score; bestChannel = ch; }
  }

  if (bestChannel === null) {
    // Last resort: merge all non-drum notes
    const all: NoteEvent[] = [];
    for (const [, notes] of notesByChannel) all.push(...notes);
    return all;
  }

  return notesByChannel.get(bestChannel) ?? [];
}

// Guitar MIDI range: low E2 (40) to high fret on high e (max ~100 for reasonable positions)
const GUITAR_LOW = 40;
const GUITAR_HIGH = 96;

/**
 * Convert polyphonic note events into a monophonic melody sequence.
 *
 * Steps:
 *   1. Sort all notes by start tick.
 *   2. Cluster simultaneous (or near-simultaneous) notes together using a
 *      tick window sized relative to the song's ticks-per-beat. From each
 *      cluster take the HIGHEST note (melody lives in the top voice).
 *   3. Remove consecutive duplicate pitches - these are timing repetitions
 *      (e.g., the iconic double-stops in Smoke on the Water appear as G G Bb Bb
 *      because both strings play the same note at successive ticks) that would
 *      make the riff feel doubled/stuttery in play-along mode.
 *   4. Filter to guitar range.
 */
function pickMelodyTrack(notes: NoteEvent[], ticksPerBeat: number): NoteEvent[] {
  if (notes.length === 0) return [];

  const sorted = [...notes].sort((a, b) => a.tickStart - b.tickStart);

  // Cluster window: 1/16th note's worth of ticks - small enough to group
  // simultaneous notes, large enough to survive MIDI quantisation offsets.
  const CLUSTER_TICKS = Math.max(8, Math.floor(ticksPerBeat / 8));

  const mono: NoteEvent[] = [];
  let i = 0;
  while (i < sorted.length) {
    const windowStart = sorted[i].tickStart;
    const cluster: NoteEvent[] = [];
    while (i < sorted.length && sorted[i].tickStart <= windowStart + CLUSTER_TICKS) {
      const n = sorted[i];
      if (n.midi >= GUITAR_LOW && n.midi <= GUITAR_HIGH) cluster.push(n);
      i++;
    }
    if (cluster.length === 0) continue;
    // Highest note in cluster = melody voice
    const top = cluster.reduce((a, b) => a.midi > b.midi ? a : b);
    mono.push(top);
  }

  // Remove consecutive duplicate pitches (timing repetitions from double-stops,
  // tremolo picking, etc.) so each pitch appears once in the sequence.
  const deduped: NoteEvent[] = [];
  for (const note of mono) {
    if (deduped.length === 0 || deduped[deduped.length - 1].midi !== note.midi) {
      deduped.push(note);
    }
  }

  return deduped;
}

function getBpm(midi: MidiData): number {
  for (const track of midi.tracks) {
    for (const event of track) {
      if (event.type === 'setTempo') {
        // tempo is microseconds per beat
        const bpm = Math.round(60_000_000 / event.microsecondsPerBeat);
        if (bpm >= 40 && bpm <= 300) return bpm;
      }
    }
  }
  return 120;
}

// ── Public entry point ─────────────────────────────────────────────────────

export async function fetchMidiTab(query: string, artistHint?: string): Promise<MidiTabResult | null> {
  // Build a search query. If we have artist info, include it for better match.
  const searchQuery = artistHint ? `${artistHint} ${query}` : query;

  const hits = await searchBitmidi(searchQuery);
  if (hits.length === 0) return null;

  // Try hits in order until one parses successfully
  for (const hit of hits) {
    const buf = await downloadMidi(hit.uploadPath);
    if (!buf || buf.length < 14) continue; // too small to be a valid MIDI

    // Verify MIDI header
    if (buf.toString('ascii', 0, 4) !== 'MThd') continue;

    let midi: MidiData;
    try {
      midi = parseMidi(buf);
    } catch {
      continue;
    }

    const allNotes = extractNotes(midi);
    if (allNotes.length === 0) continue;

    const ticksPerBeat = midi.header.ticksPerBeat ?? 192;
    const melodyNotes = pickMelodyTrack(allNotes, ticksPerBeat);
    if (melodyNotes.length === 0) continue;

    const bpm = getBpm(midi);

    // Take the first MAX_NOTES notes. After deduplication the melody notes are
    // the actual note sequence, so the first 36 IS the main riff/intro.
    const selected = melodyNotes.slice(0, MAX_NOTES);

    // Convert MIDI note numbers to note names, then to guitar tab positions
    const noteNames = selected.map(n => midiToNoteName(n.midi));
    const tabs = notesToTabs(noteNames);

    if (tabs.length === 0) continue;

    // Parse title/artist from the filename
    const { title, artist } = parseBitmidiTitle(hit.title, query, artistHint);

    return { title, artist, bpm, notes: tabs };
  }

  return null;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Extract a clean title and artist from a bitmidi filename like
 * "Deep Purple - Smoke On The Water".
 */
function parseBitmidiTitle(
  bitmidiTitle: string,
  queryFallback: string,
  artistFallback?: string,
): { title: string; artist: string } {
  // Common pattern: "Artist - Song Title"
  const dashMatch = bitmidiTitle.match(/^(.+?)\s*[-–]\s*(.+)$/);
  if (dashMatch) {
    return { artist: dashMatch[1].trim(), title: dashMatch[2].trim() };
  }
  return { artist: artistFallback ?? 'Unknown', title: queryFallback };
}
