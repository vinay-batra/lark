/**
 * Regenerate all 73 song note arrays using Claude (note-names-first approach).
 *
 * Uses the same pipeline as /api/tabs:
 *   Claude → note names (E4, F#3) → notesToTabs() → fret/string positions
 *
 * This is more accurate than the original hand-crafted fret positions because
 * Claude knows melodies as note names much more reliably than as fret numbers.
 *
 * Usage: node scripts/regenerate-songs.mjs
 *
 * Reads ANTHROPIC_API_KEY from .env.local. Rewrites lib/songs.ts in place.
 * Takes ~5-8 minutes (73 API calls with rate limiting).
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKey = envContent.match(/ANTHROPIC_API_KEY=(.+)/)?.[1]?.trim();
if (!apiKey) { console.error('No ANTHROPIC_API_KEY in .env.local'); process.exit(1); }

const client = new Anthropic({ apiKey });

// Open-string MIDI values for standard tuning
const OPEN_MIDI = [64, 59, 55, 50, 45, 40]; // strings 1-6

const SEMITONES = {
  'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'Fb':4,'E#':5,'F':5,
  'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11,'Cb':11,'B#':0
};

function parseNoteName(name) {
  const m = name.trim().match(/^([A-G][#b]?)(-?\d+)$/);
  if (!m) return null;
  const semi = SEMITONES[m[1]];
  if (semi === undefined) return null;
  const octave = parseInt(m[2]);
  let adj = octave;
  if (m[1] === 'B#') adj++;
  if (m[1] === 'Cb') adj--;
  return semi + (adj + 1) * 12;
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
  if (!options.length) return null;
  options.sort((a, b) => a.score - b.score);
  return { string: options[0].string, fret: options[0].fret, midi };
}

function notesToTabs(noteNames, preferredString) {
  const result = [];
  let prev = null;
  for (const name of noteNames) {
    const midi = parseNoteName(name);
    if (midi === null) continue;
    let tab = null;
    if (preferredString) {
      const fret = midi - OPEN_MIDI[preferredString - 1];
      if (fret >= 0 && fret <= 15) tab = { string: preferredString, fret, midi };
    }
    if (!tab) tab = midiToTab(midi, prev);
    if (tab) { result.push(tab); prev = tab; }
  }
  return result;
}

function extractJsonObject(raw) {
  let depth = 0, start = -1, inStr = false, escape = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (inStr) {
      if (escape) { escape = false; continue; }
      if (c === '\\') { escape = true; continue; }
      if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; continue; }
    if (c === '{') { if (!depth) start = i; depth++; }
    else if (c === '}') { depth--; if (!depth && start !== -1) return raw.slice(start, i + 1); }
  }
  return null;
}

// Load current songs to get their metadata
const songsSrc = fs.readFileSync(path.resolve(__dirname, '../lib/songs.ts'), 'utf8');
const songMatches = [...songsSrc.matchAll(
  /\{\s*id:\s*'([^']+)'[^}]*?title:\s*'([^']+)'[^}]*?artist:\s*'([^']+)'[^}]*?difficulty:\s*'([^']+)'[^}]*?bpm:\s*(\d+)/gs
)];
const songs = songMatches.map(m => ({
  id: m[1], title: m[2], artist: m[3], difficulty: m[4], bpm: parseInt(m[5])
}));

console.log(`Regenerating ${songs.length} songs...\n`);

const system = `You are a guitar teacher transcribing the most recognizable riff or melody of a song for beginners.

Return ONLY a JSON object, no markdown, no explanation:
{
  "notes": ["E2", "G2", "A2", ...],
  "preferredString": 6
}

Rules:
- notes: 32-36 note names in scientific pitch notation (letter + optional #/b + octave)
  Guitar open strings: E2 A2 D3 G3 B3 E4. Most riffs stay within 2 octaves.
- Transcribe the MOST ICONIC riff or intro -- what everyone recognizes in the first 5 seconds
- Play it through roughly 3 times so beginners get enough repetition
- preferredString (1=high e, 6=low E): set ONLY if the whole riff stays on one string.
  Examples: "Smoke on the Water" uses D string (4), "Seven Nation Army" uses A string (5).
  Omit or set null for multi-string riffs.
- ACCURACY is critical. If unsure, pick the most common beginner guitar position for this song.`;

const results = [];
const failed = [];

for (let i = 0; i < songs.length; i++) {
  const song = songs[i];
  process.stdout.write(`[${i+1}/${songs.length}] ${song.title} (${song.artist}) ... `);

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system,
      messages: [{
        role: 'user',
        content: `Transcribe: "${song.title}" by ${song.artist} — ${song.difficulty}, ${song.bpm} BPM`,
      }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const json = extractJsonObject(raw);
    if (!json) throw new Error('no JSON in response');

    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed.notes) || parsed.notes.length < 8) throw new Error('too few notes');

    const preferredString = (parsed.preferredString >= 1 && parsed.preferredString <= 6)
      ? parsed.preferredString : undefined;

    const tabs = notesToTabs(parsed.notes, preferredString);
    if (tabs.length < 8) throw new Error('note mapping produced too few tabs');

    results.push({ id: song.id, tabs, noteNames: parsed.notes });

    console.log(`✓ ${tabs.length} notes`);

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 1200));
  } catch (err) {
    console.log(`✗ ${err.message}`);
    failed.push(song.id);
    await new Promise(r => setTimeout(r, 800));
  }
}

// Apply fixes to lib/songs.ts
let src = fs.readFileSync(path.resolve(__dirname, '../lib/songs.ts'), 'utf8');
let applied = 0;

for (const { id, tabs } of results) {
  const noteStr = tabs.map(t => `n(${t.string},${t.fret})`).join(',');
  const regex = new RegExp(
    `(\\{\\s*id:\\s*'${id.replace(/-/g,'\\-')}'[\\s\\S]*?notes:\\s*\\[)([\\s\\S]*?)(\\]\\s*\\})`,
    ''
  );
  if (regex.test(src)) {
    src = src.replace(regex, (_, before, _old, after) =>
      `${before}\n      ${noteStr},\n    ${after}`
    );
    applied++;
  }
}

fs.writeFileSync(path.resolve(__dirname, '../lib/songs.ts'), src);
console.log(`\n✓ Applied ${applied} fixes to lib/songs.ts`);
if (failed.length) {
  console.log(`✗ ${failed.length} songs skipped (keeping original):`, failed.join(', '));
}
