'use client';

import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/Reveal';

// ── Chapter data ──────────────────────────────────────────────────────────────
// Lark's v0.1-v0.8 entries grouped into 4 thematic chapters.
// Each chapter is a coherent arc, not a commit dump.
const CHAPTERS = [
  {
    num: '01',
    name: 'First Sounds',
    versions: 'v0.1 - v0.2',
    dateRange: 'May 17-18, 2026',
    intro: 'Lark started as two live audio tools -- hear a note, name it. Hear a chord, name it. No backend, no account, just the mic.',
    highlights: [
      'Real-time pitch detection via Web Audio and Pitchy: note, octave, and cents offset displayed live',
      'Chord detection via chromagram analysis: identifies any chord from mic audio with alternatives listed',
      'Light and dark theme system with FOUC prevention, CSS variables, and localStorage persistence',
      'Google and GitHub OAuth, magic link sign-in, and password reset -- all gracefully degraded when unconfigured',
      'Authenticated app shell with sidebar, topbar, and collapsible mobile drawer',
      'Marketing site shipped: landing page, pricing, FAQ with accordion, and changelog',
    ],
    tags: ['Audio', 'Auth', 'Themes', 'Launch'],
  },
  {
    num: '02',
    name: 'Song Mode',
    versions: 'v0.3 - v0.4',
    dateRange: 'May 18, 2026',
    intro: 'Lark became a teacher. Follow a song note-by-note, see every hit and miss in real time, and get AI coaching when you finish.',
    highlights: [
      '73 songs with live tab score-following: pitch detection on each note, green on hit, red on miss',
      'AI Coach: after every session Claude gives specific feedback on missed notes and intonation',
      'AI tab generation: type any song name, get playable tabs back in seconds using Claude',
      'Score-following loop: per-note pitch matching with 100-cent tolerance and 4-second timeout',
      'Lark brand system: logo, favicon, og-image, and bird-themed identity across marketing and app',
      'Per-note hit/miss tracking with RAF loop, advancing on correct pitch with race condition guard',
    ],
    tags: ['Songs', 'AI Coach', 'Brand', 'Audio'],
  },
  {
    num: '03',
    name: 'Practice Tools',
    versions: 'v0.5 - v0.6',
    dateRange: 'May 19, 2026',
    intro: 'Practice became measurable. Sessions, streaks, and accuracy now save to your account. Plus a metronome and 120+ chord diagrams.',
    highlights: [
      'Session history: accuracy, streak, and tabs generated all tracked and synced to Supabase per user',
      'Personal song library: save any song, rename it, and replay from a private collection',
      'Web Audio metronome: look-ahead scheduler, tap tempo, multiple time signatures, and beat accent',
      '120+ chord diagrams with SVG fingering charts, searchable by name and filterable by category',
      'AI tab generation rate limit: 3 free generations per 3-day window with a dot-counter progress UI',
      'Dashboard with live stats pulled from session history including streak and average accuracy',
    ],
    tags: ['Stats', 'Metronome', 'Chords', 'Library'],
  },
  {
    num: '04',
    name: 'Polish & Profile',
    versions: 'v0.7 - v0.9',
    dateRange: 'May 19, 2026',
    intro: 'Profile pictures, auth-aware nav, a full security audit, 14 corrected songs, and 38 mobile issues fixed in one sprint.',
    highlights: [
      'Avatar upload: canvas-resized to 200x200 JPEG stored in Supabase user_metadata, visible everywhere in nav',
      'Auth-aware nav: signed-in users see their name and avatar pill with Go to App, Settings, Sign Out',
      '8-step spotlight onboarding tour on first sign-in with smart edge detection, replayable from the menu',
      'Security hardened: rate limits on all API routes, server-side bug reports, delete account via service role',
      '14 song pitch errors corrected (Seven Nation Army was on wrong strings entirely) and all songs expanded',
      'Mobile audit: wrong 880px breakpoints fixed, touch targets enlarged, hero layout corrected for short screens',
    ],
    tags: ['Profile', 'Security', 'Onboarding', 'Mobile'],
  },
  {
    num: '05',
    name: 'Intelligence',
    versions: 'v1.0 part 1',
    dateRange: 'May 20, 2026',
    intro: 'Lark learned to hear chords, suggest a learning path, and show you where you are in time. The audio engine got smarter.',
    highlights: [
      'Chord detection in song mode: chromagram analysis identifies strummed chords alongside single notes',
      'Four chord-strum songs added: Knockin\' on Heaven\'s Door, Stand By Me, Let It Be, Three Little Birds',
      'Six-stage learning curriculum (/app/learn): stages unlock at 70% accuracy and track your session history',
      'Beat-aware scoring: timeout scales with song BPM, end-of-session shows on-beat/late/slow breakdown',
      'Procedural cover art: each song gets a unique vinyl or cassette SVG seeded by title and difficulty',
      'Count-in clicks before first note, beginner string labels (\"High E, thinnest\"), stop button during play',
    ],
    tags: ['Chords', 'Curriculum', 'Scoring', 'Art'],
  },
  {
    num: '06',
    name: 'Tab Experience',
    versions: 'v1.0 part 2',
    dateRange: 'May 20, 2026',
    intro: 'The tab view became a proper instrument. Continuous scroll, a green playhead, real MIDI data, and a cleaner pipeline.',
    highlights: [
      'Songsterr-style scrolling tab: 6-string staff with a fixed green playhead, notes flow continuously left',
      'Three-tier tab generation: bitmidi MIDI (real note data) then Songsterr metadata then Claude fallback',
      'Song regeneration: all 73 note songs rebuilt with note-names-first pipeline for improved accuracy',
      'Real-time timing pill: ON BEAT / LATE / SLOW flashes after each hit to help you lock to the tempo',
      'LarkChat fixes: clip-path circle fix for Safari square-button bug, button stays visible during songs',
      'Hero centering fixed, 29 lint errors eliminated, metronome extracted to reusable library module',
    ],
    tags: ['Tab View', 'MIDI', 'Songs', 'Polish'],
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

      {/* ── What's next footer ──────────────────────────────────────────────── */}
      <div
        className="lk-footer"
        style={{ borderTop: '1px solid var(--border)', padding: '80px 56px 120px' }}
      >
        <ScrollReveal from="up" delay={0}>
          <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.3em',
                color: 'var(--accent)',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              What&apos;s next
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(20px, 3vw, 30px)',
                fontWeight: 700,
                color: 'var(--text)',
                letterSpacing: '-0.03em',
                marginBottom: 12,
                lineHeight: 1.2,
              }}
            >
              Still building.
            </h2>
            <p
              style={{
                fontSize: 14,
                color: 'var(--text3)',
                fontWeight: 300,
                lineHeight: 1.7,
                maxWidth: 420,
                margin: '0 auto 32px',
              }}
            >
              Stripe for Pro, session replay, and real licensed tab data are next. Lark is built by one person who also plays guitar.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 22px',
                border: '0.5px solid rgba(var(--accent-rgb), 0.3)',
                borderRadius: 12,
                background: 'rgba(var(--accent-rgb), 0.05)',
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
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--accent)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Active development
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
