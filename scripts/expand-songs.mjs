import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Extend every song under 30 notes to 32-36 notes by appending another pass
// of its existing pattern. Beginner riffs loop in real music, so a third
// repetition is musically accurate. Songs already at 30+ notes are skipped.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const songsPath = path.resolve(__dirname, '../lib/songs.ts');
const TARGET = 36; // aim for ~36 notes per song

const src = fs.readFileSync(songsPath, 'utf8');

// Each song object: `{ id: '...', ..., notes: [ ...n(s,f),... ] }`
const songRegex = /(\{\s*id:\s*'([^']+)'[^}]*?notes:\s*\[)([\s\S]*?)(\]\s*\})/g;

let stats = { total: 0, expanded: 0, skipped: 0 };

const out = src.replace(songRegex, (full, before, id, notesBlock, after) => {
  stats.total++;
  const calls = [...notesBlock.matchAll(/n\(\s*(\d+)\s*,\s*(-?\d+)\s*\)/g)];
  const current = calls.length;

  if (current >= 30) {
    stats.skipped++;
    return full;
  }

  const need = Math.max(0, TARGET - current);
  if (need === 0) {
    stats.skipped++;
    return full;
  }

  // Take the first `need` notes (one more loop iteration of the riff)
  const extras = calls.slice(0, Math.min(need, current));
  const extrasStr = extras.map(c => `n(${c[1]},${c[2]})`).join(',');

  stats.expanded++;
  // Append on a new line for readability, preserving 6-space indent
  const trimmed = notesBlock.replace(/[\s,]*$/, '');
  return `${before}${trimmed},\n      ${extrasStr},\n    ${after}`;
});

fs.writeFileSync(songsPath, out);
console.log(`Total songs: ${stats.total}`);
console.log(`Expanded: ${stats.expanded}`);
console.log(`Skipped (already 30+): ${stats.skipped}`);
