/**
 * Rebuild hardcoded song note arrays from real bitmidi MIDI files.
 *
 * For each song in SONGS, searches bitmidi.com, downloads the best MIDI,
 * extracts the melody (guitar channel + monophonic), converts to note names,
 * then maps to guitar tab positions via note-mapping.
 *
 * Run: node scripts/rebuild-songs-from-midi.mjs
 *
 * Output: writes scripts/midi-song-fixes.json with:
 *   { id: string, title, artist, bpm, notes: [{string, fret, midi}] }
 * for every song that was successfully updated.
 *
 * Then apply: node scripts/apply-midi-fixes.mjs
 */

import { parseMidi } from 'midi-file';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load SONGS from lib/songs.ts via the compiled JS or parse directly ──────
// We read the TS source and extract song metadata without transpiling.
const songsSrc = fs.readFileSync(path.resolve(__dirname, '../lib/songs.ts'), 'utf8');
const songIdMatches = [...songsSrc.matchAll(/id:\s*'([^']+)'[^}]*?title:\s*'([^']+)'[^}]*?artist:\s*'([^']+)'[^}]*?bpm:\s*(\d+)/gs)];
const SONGS = songIdMatches.map(m => ({ id: m[1], title: m[2], artist: m[3], bpm: parseInt(m[4]) }));

console.log(`Found ${SONGS.length} songs to process.\n`);

// ── MIDI parsing helpers (copied from lib/midi-tabs.ts logic) ───────────────
const GUITAR_LOW = 40;
const GUITAR_HIGH = 96;
const DRUM_CH = 9;
const MAX_NOTES = 36;
const PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OPEN_MIDI = [64, 59, 55, 50, 45, 40]; // strings 1-6 (e B G D A E)

function midiToNoteName(midi) {
  return PITCH_NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
}

function midiToTab(midi, prev) {
  const options = [];
  for (let s = 1; s <= 6; s++) {
    const fret = midi - OPEN_MIDI[s - 1];
    if (fret >= 0 && fret <= 22) {
      let score = fret;
      if (fret === 0) score -= 3;
      if (prev) {
        score += Math.abs(s - prev.string) * 0.5;
        score += Math.abs(fret - prev.fret) * 0.3;
      }
      options.push({ string: s, fret, score });
    }
  }
  if (options.length === 0) return null;
  options.sort((a, b) => a.score - b.score);
  return { string: options[0].string, fret: options[0].fret, midi };
}

function extractMelody(midi) {
  // Find guitar channels by program change (24-31)
  const guitarCh = new Set();
  for (const track of midi.tracks) {
    for (const e of track) {
      if (e.type === 'programChange' && 'channel' in e && e.programNumber >= 24 && e.programNumber <= 31)
        guitarCh.add(e.channel);
    }
  }

  // Collect notes per channel
  const notesByCh = new Map();
  for (const track of midi.tracks) {
    let tick = 0;
    const active = new Map();
    for (const e of track) {
      tick += e.deltaTime;
      if (!('channel' in e)) continue;
      const ch = e.channel;
      if (ch === DRUM_CH) continue;
      if (e.type === 'noteOn' && e.velocity > 0) {
        active.set(`${ch}-${e.noteNumber}`, { midi: e.noteNumber, tick });
      } else if (e.type === 'noteOff' || (e.type === 'noteOn' && e.velocity === 0)) {
        const k = `${ch}-${e.noteNumber}`;
        if (active.has(k)) {
          if (!notesByCh.has(ch)) notesByCh.set(ch, []);
          notesByCh.get(ch).push({ midi: active.get(k).midi, tick: active.get(k).tick });
          active.delete(k);
        }
      }
    }
  }

  // Pick best channel (lowest avg pitch among guitar channels = rhythm/riff)
  const candidates = guitarCh.size > 0 ? [...guitarCh] : [...notesByCh.keys()];
  let bestCh = null, bestScore = Infinity;
  const busiest = Math.max(...[...notesByCh.values()].map(n => n.length), 1);
  for (const ch of candidates) {
    const notes = (notesByCh.get(ch) || []).filter(n => n.midi >= GUITAR_LOW && n.midi <= GUITAR_HIGH);
    if (notes.length < 4) continue;
    const avg = notes.reduce((s, n) => s + n.midi, 0) / notes.length;
    const score = avg * (1 + Math.max(0, 1 - notes.length / (busiest * 0.5)));
    if (score < bestScore) { bestScore = score; bestCh = ch; }
  }

  const raw = (notesByCh.get(bestCh) || []).sort((a, b) => a.tick - b.tick);
  const tpb = midi.header.ticksPerBeat || 192;
  const CLUSTER = Math.max(8, Math.floor(tpb / 8));

  // Monophonic: cluster → highest note
  const mono = [];
  let i = 0;
  while (i < raw.length) {
    const ws = raw[i].tick;
    const cluster = [];
    while (i < raw.length && raw[i].tick <= ws + CLUSTER) {
      if (raw[i].midi >= GUITAR_LOW && raw[i].midi <= GUITAR_HIGH) cluster.push(raw[i]);
      i++;
    }
    if (cluster.length === 0) continue;
    mono.push(cluster.reduce((a, b) => a.midi > b.midi ? a : b));
  }

  // Dedup consecutive same pitches
  const deduped = mono.filter((n, idx) => idx === 0 || mono[idx - 1].midi !== n.midi);
  return deduped.slice(0, MAX_NOTES);
}

function getBpm(midi) {
  for (const track of midi.tracks) {
    for (const e of track) {
      if (e.type === 'setTempo' && e.microsecondsPerBeat > 0) {
        const bpm = Math.round(60_000_000 / e.microsecondsPerBeat);
        if (bpm >= 40 && bpm <= 300) return bpm;
      }
    }
  }
  return null;
}

// ── bitmidi search + download ────────────────────────────────────────────────
async function searchBitmidi(query) {
  try {
    const res = await fetch(`https://bitmidi.com/search?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const paths = [...html.matchAll(/\/uploads\/(\d+)\.mid/g)].map(m => m[0]);
    const titles = [...html.matchAll(/title="([^"]+\.mid)"/g)].map(m => m[1]);
    return paths.slice(0, 3).map((p, i) => ({ path: p, title: titles[i] || '' }));
  } catch { return []; }
}

async function downloadAndParse(path) {
  try {
    const res = await fetch(`https://bitmidi.com${path}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://bitmidi.com' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.slice(0, 4).toString('ascii') !== 'MThd') return null;
    return parseMidi(new Uint8Array(buf));
  } catch { return null; }
}

// ── Main ─────────────────────────────────────────────────────────────────────
const fixes = [];
const failed = [];

for (const song of SONGS) {
  const query = `${song.artist} ${song.title}`;
  process.stdout.write(`[${SONGS.indexOf(song) + 1}/${SONGS.length}] ${song.title} ... `);

  const hits = await searchBitmidi(query);
  let found = false;

  for (const hit of hits) {
    const midi = await downloadAndParse(hit.path);
    if (!midi) continue;

    const melodyNotes = extractMelody(midi);
    if (melodyNotes.length < 8) continue;

    // Convert MIDI → tab positions
    let prev = null;
    const tabNotes = [];
    for (const mn of melodyNotes) {
      const tab = midiToTab(mn.midi, prev);
      if (tab) { tabNotes.push(tab); prev = tab; }
    }
    if (tabNotes.length < 8) continue;

    const detectedBpm = getBpm(midi);
    const bpm = detectedBpm ?? song.bpm;

    // Print the note names for inspection
    const noteNames = melodyNotes.map(n => midiToNoteName(n.midi)).join(' ');
    console.log(`✓ (${hit.title}) → ${noteNames}`);

    fixes.push({
      id: song.id,
      title: song.title,
      artist: song.artist,
      bpm,
      source: hit.title,
      notes: tabNotes,
    });
    found = true;
    break;
  }

  if (!found) {
    console.log(`✗ not found on bitmidi`);
    failed.push(song.id);
  }

  // Brief pause between requests
  await new Promise(r => setTimeout(r, 200));
}

// Write results
const outPath = path.resolve(__dirname, 'midi-song-fixes.json');
fs.writeFileSync(outPath, JSON.stringify(fixes, null, 2));
console.log(`\n✓ ${fixes.length} songs updated, ${failed.length} not found.`);
console.log(`Written to: ${outPath}`);
console.log('\nFailed songs (keeping original data):');
failed.forEach(id => console.log(' ', id));
