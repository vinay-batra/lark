'use client';

import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/Reveal';

// ── Chapter data ──────────────────────────────────────────────────────────────
// Lark's v0.1-v1.1 entries grouped into thematic chapters.
// Each chapter is a coherent arc, not a commit dump.
const CHAPTERS = [
  {
    num: '01',
    name: 'Origins',
    versions: 'v0.1 - v0.4',
    dateRange: 'May 17-18, 2026',
    intro: 'Lark launched as two live audio tools and became a guitar teacher in two days.',
    highlights: [
      'Live tuner: Web Audio and Pitchy show note, octave, and cents offset in real time',
      'Chord detector: chromagram analysis names any chord from your mic with alternatives listed',
      '73 songs with tab score-following: green on hit, red on miss, per-note pitch matching',
      'AI Coach: Claude gives specific post-session feedback on missed notes and intonation',
      'AI tab generation: type any song name and get playable tabs back in seconds',
      'Google and GitHub OAuth, magic link sign-in, password reset, and full app shell',
    ],
    tags: ['Audio', 'Songs', 'AI Coach', 'Auth'],
  },
  {
    num: '02',
    name: 'Tools & Polish',
    versions: 'v0.5 - v0.9',
    dateRange: 'May 19, 2026',
    intro: 'Practice became measurable and the app got its first real polish pass.',
    highlights: [
      'Session history: accuracy, streak, and tab count synced to Supabase per user account',
      'Web Audio metronome with lookahead scheduler, tap tempo, and beat accent support',
      '120+ chord diagrams with SVG fingering charts, searchable by name and category',
      'Avatar upload: canvas-resized 200x200 JPEG stored in user_metadata, shown in nav everywhere',
      '8-step spotlight onboarding tour on first sign-in, replayable any time from the menu',
      'Security hardened: rate limits on all API routes, delete account via service role key',
    ],
    tags: ['Stats', 'Metronome', 'Chords', 'Security'],
  },
  {
    num: '03',
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
    num: '04',
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
    num: '05',
    name: 'Quality',
    versions: 'v1.1 - v1.3',
    dateRange: 'May 28, 2026',
    intro: 'A full hardening pass followed by practice upgrades -- tighter and deeper in one sprint.',
    highlights: [
      'App-wide audit: unified CSS variable system and consistent spacing across fifty-plus files',
      'Accessibility pass: dialog roles, keyboard Escape, and screen-reader labels throughout',
      'Practice Mode: speed control at 0.5x, 0.75x, and 1x to slow down difficult sections',
      'Section looping: mark any note range and repeat it on a loop until muscle memory locks in',
      '83 verified songs after a full accuracy audit -- wrong strings corrected across multiple songs',
      'Branded sign-in emails, friendly error pages, and nightly database cleanup via pg_cron',
    ],
    tags: ['Audit', 'Practice Mode', 'Songs', 'Polish'],
  },
  {
    num: '06',
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
];

// ── Inline scroll-reveal (no external dep needed, matches Corvo pattern) ──────
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
    if (inView) {
      let rafA = 0, rafB = 0;
      rafA = requestAnimationFrame(() => { rafB = requestAnimationFrame(() => setVisible(true)); });
      return () => { cancelAnimationFrame(rafA); cancelAnimationFrame(rafB); };
    }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function ScrollReveal({
  children,
  delay = 0,
  from = 'up',
  distance = 30,
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  from?: 'up' | 'left' | 'right';
  distance?: number;
  style?: React.CSSProperties;
}) {
  const { ref, visible } = useReveal(0.1);
  const transform =
    from === 'left'
      ? `translateX(-${distance}px)`
      : from === 'right'
      ? `translateX(${distance}px)`
      : `translateY(${distance}px)`;
  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : transform,
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ChangelogPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: 'var(--text)' }}>
      <style>{`
        * { box-sizing: border-box; }
        .lk-tag {
          padding: 3px 10px;
          background: rgba(var(--accent-rgb), 0.08);
          border: 1px solid rgba(var(--accent-rgb), 0.3);
          border-radius: 20px;
          font-size: 10px;
          color: var(--accent);
          letter-spacing: 0.5px;
          font-family: var(--font-mono);
        }
        .lk-eras-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(var(--accent-rgb), 0.35) transparent;
        }
        .lk-eras-scroll::-webkit-scrollbar { height: 6px; }
        .lk-eras-scroll::-webkit-scrollbar-track {
          background: transparent;
          margin: 0 56px;
        }
        .lk-eras-scroll::-webkit-scrollbar-thumb {
          background: rgba(var(--accent-rgb), 0.3);
          border-radius: 4px;
        }
        .lk-eras-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--accent-rgb), 0.55);
        }
        .lk-chapter-card {
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s cubic-bezier(0.16,1,0.3,1);
          will-change: transform;
        }
        .lk-chapter-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 18px 40px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(var(--accent-rgb),0.28) !important;
        }
        .lk-era-dot {
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s;
        }
        .lk-era:hover .lk-era-dot {
          transform: translate(-50%, -50%) scale(1.18);
          box-shadow: 0 0 0 5px rgba(var(--accent-rgb),0.2), 0 0 22px rgba(var(--accent-rgb),0.45) !important;
        }
        @keyframes lk-pdot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        @media (max-width: 768px) {
          .lk-hero { padding: 80px 20px 48px !important; }
          .lk-eras-wrap { padding: 0 0 80px !important; }
          .lk-eras-scroll { padding-left: 20px !important; padding-right: 20px !important; }
          .lk-era { width: min(82vw, 340px) !important; margin-right: 48px !important; }
          .lk-era:last-child { margin-right: 0 !important; }
          .lk-footer { padding: 60px 20px 80px !important; }
        }
      `}</style>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div
        className="lk-hero"
        style={{ textAlign: 'center', padding: '120px 56px 72px' }}
      >
        <ScrollReveal from="up" delay={0}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              border: '1px solid rgba(var(--accent-rgb), 0.35)',
              borderRadius: 24,
              marginBottom: 28,
              background: 'rgba(var(--accent-rgb), 0.07)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'inline-block',
                animation: 'lk-pdot 2s infinite',
              }}
            />
            <span
              style={{
                fontSize: 10,
                letterSpacing: '0.22em',
                color: 'var(--accent)',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
              }}
            >
              What&apos;s new
            </span>
          </div>
        </ScrollReveal>

        <Reveal from="up" delay={0.05}>
          <h1
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(30px, 4.2vw, 56px)',
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Every release,{' '}
            <span style={{ color: 'var(--accent)', textShadow: '0 0 50px rgba(var(--accent-rgb),0.3)' }}>
              in order.
            </span>
          </h1>
        </Reveal>

        <ScrollReveal from="up" delay={0.1}>
          <p style={{ fontSize: 15, color: 'var(--text2)', fontWeight: 300, maxWidth: 440, margin: '0 auto', lineHeight: 1.65 }}>
            Lark ships fast. Here&apos;s everything built from the first note to now.
          </p>
        </ScrollReveal>
      </div>

      {/* ── Horizontal chapter timeline ────────────────────────────────────── */}
      <ScrollReveal from="up" delay={0.1}>
        <div className="lk-eras-wrap" style={{ position: 'relative', paddingBottom: 96 }}>

          {/* Scroll hint */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: 10,
                letterSpacing: '0.22em',
                color: 'var(--text3)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Six chapters &middot; scroll
            </span>
            <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
              <path d="M2 5h17M14 1l4 4-4 4" stroke="var(--text3)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Horizontal scroll container */}
          <div
            className="lk-eras-scroll"
            style={{
              display: 'flex',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: 'x mandatory',
              paddingLeft: 'max(56px, calc((100vw - 1280px) / 2))',
              paddingRight: 'max(56px, calc((100vw - 1280px) / 2))',
              paddingTop: 4,
              paddingBottom: 32,
              scrollPaddingLeft: 56,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {CHAPTERS.map((chapter, i) => {
              const isFirst = i === 0;
              const isLast = i === CHAPTERS.length - 1;
              return (
                <div
                  key={chapter.num}
                  className="lk-era"
                  style={{
                    flexShrink: 0,
                    scrollSnapAlign: 'center',
                    width: 390,
                    marginRight: isLast ? 0 : 52,
                  }}
                >
                  {/* Timeline strip: connecting line + dot above card */}
                  <div style={{ position: 'relative', height: 36, marginBottom: 22 }}>
                    {/* Continuous connecting line, extends into margin to meet next card */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: isFirst ? '50%' : 0,
                        right: isLast ? '50%' : -52,
                        height: 1.5,
                        background: 'rgba(var(--accent-rgb), 0.38)',
                        transform: 'translateY(-50%)',
                      }}
                    />
                    {/* Dot marker */}
                    <div
                      className="lk-era-dot"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        border: '4px solid var(--bg)',
                        boxShadow: '0 0 0 3px rgba(var(--accent-rgb),0.18), 0 0 14px rgba(var(--accent-rgb),0.32)',
                      }}
                    />
                  </div>

                  {/* Card */}
                  <div
                    className="lk-chapter-card"
                    style={{
                      width: '100%',
                      background: 'var(--card-bg)',
                      border: '0.5px solid var(--border)',
                      borderRadius: 18,
                      padding: '28px 28px 24px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 10px 28px rgba(0,0,0,0.12), 0 0 0 0.5px var(--border)',
                    }}
                  >
                    {/* Chapter meta row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 16,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--text3)',
                          letterSpacing: '0.22em',
                          textTransform: 'uppercase',
                        }}
                      >
                        CHAPTER {chapter.num}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--accent)',
                          background: 'rgba(var(--accent-rgb), 0.08)',
                          border: '1px solid rgba(var(--accent-rgb), 0.25)',
                          borderRadius: 6,
                          padding: '3px 9px',
                          letterSpacing: 0.4,
                        }}
                      >
                        {chapter.versions}
                      </span>
                    </div>

                    {/* Chapter name */}
                    <h3
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 22,
                        fontWeight: 700,
                        color: 'var(--text)',
                        letterSpacing: '-0.04em',
                        lineHeight: 1.12,
                        marginBottom: 8,
                      }}
                    >
                      {chapter.name}
                    </h3>

                    {/* Date range */}
                    <p
                      style={{
                        fontSize: 11,
                        color: 'var(--text3)',
                        fontFamily: 'var(--font-mono)',
                        marginBottom: 16,
                        letterSpacing: 0.3,
                      }}
                    >
                      {chapter.dateRange}
                    </p>

                    {/* Intro sentence */}
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--text2)',
                        lineHeight: 1.65,
                        marginBottom: 18,
                        fontStyle: 'italic',
                      }}
                    >
                      {chapter.intro}
                    </p>

                    {/* Highlights */}
                    <ul
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: '0 0 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      {chapter.highlights.map((h, hi) => (
                        <li
                          key={hi}
                          style={{
                            fontSize: 12.5,
                            color: 'var(--text2)',
                            lineHeight: 1.55,
                            paddingLeft: 16,
                            position: 'relative',
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 7,
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              background: 'var(--accent)',
                            }}
                          />
                          {h}
                        </li>
                      ))}
                    </ul>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {chapter.tags.map((tag) => (
                        <span key={tag} className="lk-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
}
