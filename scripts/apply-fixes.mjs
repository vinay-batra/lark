import { notesToTabs } from '../lib/note-mapping.ts';

// Curated high-confidence fixes from the audit. Each fix addresses a clear
// problem in the original tab (wrong key, wrong octave, wrong pattern, etc.)
const FIXES = [
  {
    id: 'seven-nation-army',
    preferredString: 5,
    notes: 'E3 E3 G3 E3 D3 C3 B2 C3 B2 A2 E3 E3 G3 E3 D3 C3 B2 C3 B2 A2',
    comment: 'A-string riff in E minor: frets 7-7-10-7-5-3-2-3-2-0 (standard guitar tab octave)',
  },
  {
    id: 'come-as-you-are',
    preferredString: 6,
    notes: 'E2 F#2 E2 E2 G2 A2 G2 F#2 E2 F#2 E2 E2 G2 A2 G2 F#2 E2 F#2 E2 E2',
    comment: 'Low E string riff E-F#-E-E-G-A-G-F#-E in E minor (sounds Eb on Nirvana recording)',
  },
  {
    id: 'brain-stew',
    preferredString: 6,
    notes: 'A2 A2 G2 G2 F#2 F#2 F2 F2 E2 E2 A2 A2 G2 G2 F#2 F#2 F2 F2 E2 E2',
    comment: 'Descending A-G-F#-F-E power chord roots (whole-half-half-half, not chromatic)',
  },
  {
    id: 'enter-sandman',
    preferredString: null,
    notes: 'E2 E3 G3 E2 A2 E2 E3 G3 E2 F#3 G3 E2 E3 G3 E2 A2 E2 E3 G3 E2 F#3 G3',
    comment: 'E pedal with high-string melody (not a single-string scale)',
  },
  {
    id: 'thunderstruck',
    preferredString: 2,
    notes: 'B3 E4 B3 F#4 B3 G4 B3 A4 B3 B4 B3 A4 B3 G4 B3 F#4 B3 E4 B3 F#4 B3 G4',
    comment: 'Open B (B3) pedal alternating with ascending fretted notes',
  },
  {
    id: 'raining-blood',
    preferredString: 6,
    notes: 'E2 F2 G2 G#2 E2 F2 G2 G#2 E2 F2 G2 G#2 A2 E2 F2 G2 G#2 A2 A#2 B2',
    comment: 'Chromatic E-F-G-G#-A ascent on low E',
  },
  {
    id: 'wish-you-were-here',
    preferredString: null,
    notes: 'G3 B3 D4 G4 E4 D4 B3 G3 A3 B3 D4 G4 G3 B3 D4 G4 E4 D4 B3 G3',
    comment: 'G major intro (was incorrectly in E major)',
  },
  {
    id: 'every-breath-you-take',
    preferredString: null,
    notes: 'G#3 G#3 B3 G#3 E3 G#3 G#3 B3 G#3 E3 F#3 F#3 A3 F#3 D#3 F#3 F#3 A3 F#3 D#3',
    comment: 'Ab/G# major add9 (was incorrectly in A major)',
  },
  {
    id: 'crazy-train',
    preferredString: null,
    notes: 'F#3 A3 E3 F#3 D3 F#3 E3 C#3 D3 A2 F#3 A3 E3 F#3 D3 F#3 E3 C#3 D3 A2 F#3 A3',
    comment: 'F# minor iconic riff (was incorrectly in A minor)',
  },
  {
    id: 'la-grange',
    preferredString: null,
    notes: 'A2 C3 D3 D#3 E3 G3 A3 G3 E3 D3 C3 A2 C3 D3 D#3 E3 G3 E3 D3 C3',
    comment: 'A blues with blue note D#/Eb',
  },
];

function noteToTabLiteral(tab) {
  return `n(${tab.string},${tab.fret})`;
}

for (const fix of FIXES) {
  const noteNames = fix.notes.trim().split(/\s+/);
  const prefStr = fix.preferredString ?? undefined;
  const tabs = notesToTabs(noteNames, prefStr);
  if (tabs.length !== noteNames.length) {
    console.error(`WARN ${fix.id}: ${noteNames.length} notes → ${tabs.length} tabs`);
  }
  const literal = tabs.map(noteToTabLiteral).join(',');
  console.log(`### ${fix.id}  (${tabs.length} notes)`);
  console.log(`// ${fix.comment}`);
  console.log(literal);
  console.log('');
}
