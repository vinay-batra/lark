/**
 * Apply MIDI-sourced note fixes to lib/songs.ts.
 * Run AFTER rebuild-songs-from-midi.mjs has produced midi-song-fixes.json.
 *
 * Usage: node scripts/apply-midi-fixes.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixesPath = path.resolve(__dirname, 'midi-song-fixes.json');
const songsPath = path.resolve(__dirname, '../lib/songs.ts');

if (!fs.existsSync(fixesPath)) {
  console.error('midi-song-fixes.json not found. Run rebuild-songs-from-midi.mjs first.');
  process.exit(1);
}

const fixes = JSON.parse(fs.readFileSync(fixesPath, 'utf8'));
let src = fs.readFileSync(songsPath, 'utf8');

let applied = 0;

for (const fix of fixes) {
  // Build the note array string: n(string, fret) calls
  const noteStr = fix.notes
    .map(n => `n(${n.string},${n.fret})`)
    .join(',');

  // Replace the notes array for this song in the source
  // Pattern: id: 'SONG_ID', ..., notes: [ ... ]
  const songRegex = new RegExp(
    `(\\{\\s*id:\\s*'${fix.id}'[\\s\\S]*?notes:\\s*\\[)([\\s\\S]*?)(\\]\\s*\\})`,
    ''
  );
  if (songRegex.test(src)) {
    src = src.replace(songRegex, (_, before, _old, after) => {
      return `${before}\n      ${noteStr},\n    ${after}`;
    });
    applied++;
    console.log(`✓ ${fix.id} (${fix.notes.length} notes from "${fix.source}")`);
  } else {
    console.warn(`✗ Could not find song id "${fix.id}" in songs.ts`);
  }
}

fs.writeFileSync(songsPath, src);
console.log(`\nApplied ${applied}/${fixes.length} fixes to lib/songs.ts`);
