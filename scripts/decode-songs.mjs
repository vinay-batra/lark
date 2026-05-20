import { SONGS } from '../lib/songs.ts';

const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function midiToName(m) {
  return PITCH_CLASSES[m % 12] + (Math.floor(m / 12) - 1);
}

for (const s of SONGS) {
  const names = s.notes.map(n => midiToName(n.midi));
  console.log(`ID:${s.id} | ${s.title} -- ${s.artist} [${s.difficulty}, ${s.bpm} BPM, ${s.notes.length} notes]`);
  console.log(names.join(' '));
  console.log('');
}
