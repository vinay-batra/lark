'use client';

import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/Reveal';

// ── Chapter data ──────────────────────────────────────────────────────────────
// Lark's v0.1-v0.8 entries grouped into 4 thematic chapters.
// Each chapter is a coherent arc, not a commit dump.
const CHAPTERS = [
  {
    num: '01',
    name: 'Tools',
    versions: 'v0.1 -> v0.2',
    dateRange: 'May 17 -> May 18, 2026',
    intro: 'Lark started as two tools: hear a note, name it -- hear a chord, name it. Everything 100% client-side, no backend.',
    highlights: [
      'Real-time pitch detection via Web Audio and Pitchy -- note, octave, cents offset',
      'Chord detection via chromagram analysis and @tonaljs -- alternatives shown',
      'Authenticated app shell with sidebar, topbar, and mobile drawer',
      'Light and dark theme system with FOUC fix and localStorage persistence',
      'Google and GitHub OAuth, magic link, and password reset flows',
      'Marketing site: landing, pricing, FAQ, and about pages',
    ],
    tags: ['Audio', 'Auth', 'Themes', 'Launch'],
  },
  {
    num: '02',
    name: 'Song Mode',
    versions: 'v0.3 -> v0.4',
    dateRange: 'May 18, 2026',
    intro: 'Lark grew from a detector into a teacher -- follow a song note-by-note and get specific AI feedback after each session.',
    highlights: [
      'Lark logo and brand system: favicon, apple-touch-icon, og-image',
      'Security headers, mobile-optimized layouts, email waitlist',
      '73 songs with real-time tab score-following -- green on hit, red on miss',
      'AI Coach powered by Claude: specific guitar feedback after each song session',
      'AI tab generation -- type any song name, get playable tabs instantly',
      'Per-note timeout and RAF-loop score-following with hit/miss tracking',
    ],
    tags: ['Song Mode', 'AI Coach', 'Brand', 'Mobile'],
  },
  {
    num: '03',
    name: 'Rhythm & Persistence',
    versions: 'v0.5 -> v0.6',
    dateRange: 'May 19, 2026',
    intro: 'Sessions became permanent and practice became measurable -- plus a metronome, a chord library, and 73 songs.',
    highlights: [
      'Save songs and build a personal library, synced to Supabase per account',
      'Dashboard with real sessions, streak, accuracy, and tabs generated from live data',
      'AI tab generation rate limit: 3 free generations per 3 days',
      'Web Audio metronome with look-ahead scheduling, tap tempo, and time signatures',
      '120+ chord diagrams with SVG fingering charts, searchable by name or category',
      '73 songs across 4 difficulty levels: beginner, intermediate, advanced, expert',
    ],
    tags: ['Persistence', 'Metronome', 'Stats', 'Library'],
  },
  {
    num: '04',
    name: 'Polish & Security',
    versions: 'v0.7 -> v0.8',
    dateRange: 'May 19, 2026',
    intro: 'Onboarding got a tour, the codebase got a security audit, and a critical RAF bug got squashed.',
    highlights: [
      'Top-right UserMenu: avatar initial, Settings link, Replay Tour, Sign Out',
      '5-step spotlight onboarding tour on first sign-in, replayable from menu',
      'Display name in Settings saved to Supabase user metadata',
      'Bug report modal that saves directly to the database',
      'Critical RAF loop fix: stopped advancing after first correct note -- all subsequent notes now register',
      'Note corrections for Iron Man, Yellow, Wonderful Tonight, Every Breath You Take',
    ],
    tags: ['Onboarding', 'Security', 'Bug Fix', 'Polish'],
  },
  {
    num: '05',
    name: 'Platform Polish',
    versions: 'v0.9',
    dateRange: 'May 19, 2026',
    intro: 'Profile pictures, auth-aware nav everywhere, 14 corrected songs, 38 mobile issues fixed, and a full security audit across all API routes.',
    highlights: [
      'Avatar upload: canvas resize to 200x200, compressed to JPEG, stored in account -- shows in nav and dashboard on every page',
      'Auth-aware PublicNav and AppShell: signed-in users see name + avatar pill with Go to App, Settings, Sign Out dropdown',
      'Standalone /settings page with display name, profile picture, theme, audio prefs, and danger zone (delete account)',
      '14 song pitch errors corrected (Seven Nation Army was on wrong strings, Back in Black had G instead of G#); all 73 songs expanded to 20-25 notes',
      'Rate limiting on all 3 API routes; server-side bug reports; delete account via Supabase service role',
      'Mobile audit: 880px breakpoints fixed to 768px, touch targets enlarged, hero fixed for short screens, chat panel overflow corrected',
    ],
    tags: ['Profile', 'Mobile', 'Security', 'Songs'],
  },
  {
    num: '06',
    name: 'Intelligence & Curriculum',
    versions: 'v1.0',
    dateRange: 'May 20, 2026',
    intro: 'Lark grew a brain and a learning path. Chord detection, a six-stage curriculum, every song cover-arted, every bug audited.',
    highlights: [
      'Polyphonic chord detection: chromagram + tonal analysis detects Am, G, C, D and more -- four chord-strum songs added (Knockin\' on Heaven\'s Door, Stand By Me, Let It Be, Three Little Birds)',
      'Learning path (/app/learn): six-stage curriculum from first riffs to lead solos, unlocks on 70%+ accuracy, tracks progress from session history',
      'Procedural song cover art: every song gets a unique vinyl or cassette-style SVG cover seeded by its title -- shown in song cards, the play screen, and curriculum tiles',
      'Beat-aware scoring: per-note timeout scales with BPM, end-of-session breakdown shows on-beat / late / slow counts, real-time ON BEAT pill flashes after each hit during play',
      'Count-in clicks during 3-2-1 countdown, beginner-friendly note labels (\"High E string (thinnest)\"), stop button during play, mic-denied recovery instructions',
      'Full security + quality audit: rate limit IP spoofing fixed, 29 lint errors eliminated, settings deduplicated into a shared SettingsPanel, metronome extracted to reusable lib',
    ],
    tags: ['Chords', 'Curriculum', 'Audio', 'Polish'],
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
              Stripe for Pro, session replay, and adaptive difficulty tuning based on your real practice data are next on the roadmap.
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
