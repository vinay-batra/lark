'use client';

import { motion } from 'framer-motion';
import { Reveal } from '@/components/Reveal';

// Lark's v0.1-v1.6 entries grouped into thematic chapters.
// Each chapter is a coherent arc, not a commit dump.
const CHAPTERS = [
  {
    num: '01',
    name: 'Tools & Polish',
    versions: 'v0.5 - v0.9',
    dateRange: 'May 19, 2026',
    intro: 'Practice became measurable and the app got its first real polish pass.',
    highlights: [
      'Session history: accuracy, streak, and tab count synced to Supabase per user account',
      'Web Audio metronome with lookahead scheduler, tap tempo, and beat accent support',
      '120+ chord diagrams with SVG fingering charts, searchable by name and category',
      'Avatar upload: canvas-resized 200x200 JPEG stored in user_metadata, shown in nav everywhere',
      'Spotlight onboarding tour on first sign-in, smart edge detection, replayable from the menu',
      'Security hardened: rate limits on all API routes, delete account via service role key',
    ],
    tags: ['Stats', 'Metronome', 'Chords', 'Security'],
  },
  {
    num: '02',
    name: 'Intelligence',
    versions: 'v1.0 part 1',
    dateRange: 'May 20, 2026',
    intro: 'Lark learned to hear chords, suggest a learning path, and track you in time.',
    highlights: [
      'Chord detection in song mode: chromagram identifies strummed chords alongside single notes',
      'Four chord-strum songs added: Knockin\' on Heaven\'s Door, Stand By Me, Let It Be, Three Little Birds',
      'Six-stage learning curriculum: stages unlock at 70% accuracy, progress tied to session history',
      'Beat-aware scoring: timeout scales with BPM, end-of-session shows on-beat/late/slow breakdown',
      'Procedural cover art: each song gets a unique vinyl or cassette SVG seeded by title and difficulty',
      'Count-in clicks before the first note, beginner string labels, and stop button during play',
    ],
    tags: ['Chords', 'Curriculum', 'Scoring', 'Art'],
  },
  {
    num: '03',
    name: 'Tab Experience',
    versions: 'v1.0 part 2',
    dateRange: 'May 20, 2026',
    intro: 'The tab view became a proper instrument with real MIDI data and a live playhead.',
    highlights: [
      'Songsterr-style scrolling tab: 6-string staff with a fixed green playhead, notes flow left',
      'Three-tier tab generation: real MIDI from bitmidi, Songsterr metadata, then Claude fallback',
      'All 73 note songs rebuilt with a note-names-first pipeline for improved tab accuracy',
      'Timing pill: ON BEAT / LATE / SLOW flashes after each hit to help you lock to the tempo',
      'LarkChat Safari fix: clip-path circle instead of overflow:hidden, stays visible during songs',
      '29 lint errors cleared, metronome extracted to a reusable module, hero layout corrected',
    ],
    tags: ['Tab View', 'MIDI', 'Songs', 'Polish'],
  },
  {
    num: '04',
    name: 'Quality',
    versions: 'v1.1 - v1.3',
    dateRange: 'May 28, 2026',
    intro: 'A full hardening pass followed by practice upgrades, tighter and deeper in one sprint.',
    highlights: [
      'App-wide audit: unified CSS variable system and consistent spacing across fifty-plus files',
      'Accessibility pass: dialog roles, keyboard Escape, and screen-reader labels throughout',
      'Practice Mode: speed control at 0.5x, 0.75x, and 1x to slow down difficult sections',
      'Section looping: mark any note range and repeat it on a loop until muscle memory locks in',
      '83 verified songs after a full accuracy audit, wrong strings corrected across multiple songs',
      'Branded sign-in emails, friendly error pages, and nightly database cleanup via pg_cron',
    ],
    tags: ['Audit', 'Practice Mode', 'Songs', 'Polish'],
  },
  {
    num: '05',
    name: 'Growth',
    versions: 'v1.4 - v1.5',
    dateRange: 'May 29, 2026',
    intro: 'Lark got shareable, installable, and self-aware.',
    highlights: [
      'Daily Missions: 3 new challenges per day, earn XP, and climb through 10 levels',
      'Next-note hints: opt-in system shows the upcoming note when you are stuck',
      'PWA support: install Lark to your home screen, opens full-screen and feels native',
      'Shareable score cards: generate a result card with your score and lark.coach after every song',
      'Progress page: accuracy trend chart, sessions-per-day bars, top songs, and session history',
      'AI coach rewritten: detects pitch bias, identifies where in songs you miss, uses artist context',
    ],
    tags: ['PWA', 'Missions', 'Progress', 'Coach'],
  },
  {
    num: '06',
    name: 'UI & Clarity',
    versions: 'v1.6',
    dateRange: 'June 1, 2026',
    intro: 'A full UI pass, cleaner defaults, a smarter sidebar, and better in-place tools.',
    highlights: [
      'Light mode is now the default; dark mode persists per-user via localStorage',
      'Settings rebuilt as a sidebar with Profile, Appearance, Detection, and Account tabs',
      'Metronome moved from sidebar to a floating overlay widget on the Songs page',
      'Settings and Metronome removed from the nav, both accessible contextually',
      'AI chat limits split: public pages get 5 per day, in-app gets 15 per day independently',
      'Landing hero demo updated: multi-string tab, hit/miss coloring, G4 label, timing badge',
    ],
    tags: ['UI', 'Settings', 'Chat', 'Light Mode'],
  },
];

export default function ChangelogPage() {
  return (
    <main>
      <section className="ed-section">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <div className="ed-rule" />
          <div className="ed-head"><span className="ed-label">Changelog</span></div>
          <h1 className="ed-title ed-title-sm">Every release,<br />in order.</h1>
          <p className="ed-lead">Lark ships fast. Here is everything built from the first note to now, six chapters deep.</p>
        </motion.div>
      </section>

      <section className="ed-section ed-section-pb" style={{ paddingTop: 'clamp(32px, 4vh, 48px)' }}>
        {CHAPTERS.map((chapter, i) => (
          <Reveal key={chapter.num} delay={0.04}>
            <div style={{ marginTop: i === 0 ? 0 : 'clamp(52px, 8vh, 88px)' }}>
              <div className="ed-rule" />
              <div className="cl-head">
                <div className="ed-head" style={{ marginBottom: 0 }}>
                  <span className="ed-num">{chapter.num}</span>
                  <span className="cl-name">{chapter.name}</span>
                </div>
                <span className="cl-meta">{chapter.versions} / {chapter.dateRange}</span>
              </div>
              <p className="cl-intro">{chapter.intro}</p>
              <ul className="cl-highlights">
                {chapter.highlights.map((h, hi) => (
                  <li key={hi}>{h}</li>
                ))}
              </ul>
              <p className="cl-tags">{chapter.tags.join('   ·   ')}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <style jsx>{`
        .cl-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }
        .cl-name { font-family: var(--font-mono); font-size: clamp(18px, 2.6vw, 28px); font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
        .cl-meta { font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); }
        .cl-intro { font-size: 16px; color: var(--text2); line-height: 1.6; max-width: 620px; margin-bottom: 24px; }
        .cl-highlights { list-style: none; padding: 0; margin: 0 0 22px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 40px; max-width: 940px; }
        .cl-highlights li { font-size: 13.5px; color: var(--text2); line-height: 1.55; position: relative; padding-left: 20px; }
        .cl-highlights li::before { content: ''; position: absolute; left: 0; top: 9px; width: 10px; height: 1px; background: var(--accent); }
        .cl-tags { font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); }
        @media (max-width: 768px) {
          .cl-highlights { grid-template-columns: 1fr; gap: 11px; }
        }
      `}</style>
    </main>
  );
}
