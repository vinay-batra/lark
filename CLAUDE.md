# CLAUDE.md — Lark

Guitar AI tutor. Hears you play, shows you what to play, gives feedback.

---

## Current Focus

**Last shipped: v1.1 (May 28, 2026) — Full quality/hardening audit: a11y, SEO, light/dark parity, per-page metadata, error boundaries, code cleanup. Plus Supabase Pro infra (email templates + pg_cron).**

Live at: `https://lark.coach`
Supabase project: `ebsddbpbvjbcdwfldubx` (on **Pro** plan as of May 28)
Last commit: cd0da0a (Resolve all audit follow-ups: metadata, error boundaries, a11y, copy)

### v1.1 (May 28, 2026) — Hardening pass

Shipped across 3 commits (0c4864d, 2646bf5, cd0da0a):

**Bugs fixed**
- `api/coach/route.ts`: AI coach model was `claude-haiku-4-5`, corrected to `claude-sonnet-4-6`
- `layout.tsx`: added `metadataBase: new URL('https://lark.coach')` so OG image URLs resolve in prod (were falling back to localhost)
- `app/songs/page.tsx`: AbortController now stored in a ref and aborted on unmount (was leaking + setState-after-unmount on tab gen)
- `app/learn/page.tsx`: curriculum progress refreshes when navigating back from a song (newly unlocked stages now appear without reload)
- **Invalid hex-alpha CSS bug**: `${colorVar}80` produced invalid `var(--accent)80`. Broke SongCover colors + TunerView glow. Fixed everywhere with `rgba(var(--x-rgb), a)` + new `DIFFICULTY_RGB` map in lib/songs.ts

**Audit (2646bf5, 32 files)**
- Em dashes purged from all source; hardcoded hex → CSS vars (added `--on-accent`, `--danger-rgb`, `--sharp-rgb`, `--flat-rgb`, full `--diff-*` + `-rgb` palette)
- `console.*` removed from delete-account + bug-report routes
- A11y: `aria-label` on auth inputs; `role="dialog"` + `aria-modal` + Escape-to-close on LarkChat panel and FeedbackButton modal
- SEO: created `public/sitemap.xml` (9 public routes) + `public/robots.txt` (blocks /app, /api)
- Mobile: LarkChat `639px` breakpoint → `768px`; FABs use `env(safe-area-inset-bottom)` for iOS home indicator
- Contact email `hello@lark.coach` → `the404supply@gmail.com` (privacy, terms, pricing)
- Verified all 38 CSS vars symmetrical across dark/light

**Audit follow-ups (cd0da0a, 18 files)**
- **Marketing pages now use server wrapper + client content pattern**: `pricing/`, `faq/`, `changelog/`, `privacy/`, `terms/` each have a server `page.tsx` (exports `metadata` w/ title + description + openGraph) that renders a `*Content.tsx` client component. This is REQUIRED — client components can't export metadata.
- Error boundaries: `app/error.tsx` ("A string snapped") + `app/app/error.tsx` ("This page hit a wrong note")
- `VinylLoader`: vinyl disc is theme-fixed via new vars `--vinyl-body`, `--vinyl-groove`, `--vinyl-shine` (defined identically in both themes; grooves were invisible on light cream bg)
- Mounted guards added to `supabase.auth.getUser().then()` in AppShell, PublicNav, SettingsPanel (prevent setState after unmount)
- Deleted dead `components/TabView.tsx` (replaced by TabStaff long ago)
- FAQ copy de-staled (AI coaching + accounts are live, not "coming")

**Visual audit done (not committed)** — Playwright screenshotted all 9 public pages × mobile/desktop × dark/light (36 shots), plus dashboard pages reviewed via Chrome MCP using a logged-in session. No layout bugs found. The only scare (empty/dim Learn + Settings) was just the `Reveal` fade-in caught mid-hydration — correct behavior.

**Still unverified (needs Vinay, can't be done in code):** audio actually working (mic), VinylLoader light-mode by eye (only shows during AI gen), email delivery, auth signup/OAuth/reset flows.

### Supabase Pro decisions (May 28)
- Upgraded to **Pro**. Skipped **Custom Domain** add-on ($10/mo — not worth it; OAuth screen still shows `*.supabase.co`, decided that's fine). Skipped **Resend custom SMTP** (decided not worth setup; auth emails go through Supabase default, Pro raises limit 3/hr → 30/hr).
- DONE in dashboard: pasted the 4 branded email templates from `supabase/email-templates/` into Auth > Email Templates; ran the `pg_cron` migration in SQL editor (daily cleanup of lark_gen_history 30d + lark_bug_reports 90d).
- There's a **test account** for browser testing: display name "Test", email `vinaybatra2010@gmail.com`.

Routes (22 total):
- `/` — Landing. Auth-aware: "GO TO APP" when signed in, "START PLAYING" -> signup when not.
- `/pricing` — 3-tier (Free / Pro $8 / Studio $24, paid coming soon).
- `/changelog` — Horizontal scroll-snap chapter timeline (6 chapters).
- `/faq` — Accordion FAQ with aria-expanded.
- `/auth` — Sign in / sign up / magic link / reset. Google + GitHub OAuth live.
- `/settings` — Standalone auth-gated settings (SettingsPanel layout="standalone").
- `/privacy`, `/terms` — Policy pages.
- `/tuner`, `/chords` — Public audio tools (no auth).
- `/app` — Dashboard: stats, tools, coming soon.
- `/app/learn` — Learning path: 6-stage curriculum (First sounds -> Lead playing).
- `/app/tuner`, `/app/chords`, `/app/chord-library`, `/app/songs`, `/app/metronome` — Authenticated tools.
- `/app/settings` — In-app settings (SettingsPanel layout="in-app").
- `/api/coach` — Claude AI song feedback, 20/hr.
- `/api/chat` — Guitar Q&A, claude-haiku-4-5, 30/hr.
- `/api/tabs` — AI tab gen (note-names-first), claude-sonnet-4-6, 10/hr.
- `/api/bug-report` — Server-side bug reports, rate limited, derives userId from token.
- `/api/delete-account` — Delete user via service role key.

### Key decisions made in v1.0

**Chord detection**: `lib/chord-detection.ts` -- chromagram + @tonaljs/chord-detect. `TabNote.chord?` optional field. When set, SongFollowView switches from Pitchy pitch detection to chromagram + chordMatches() (loose: Am matches Am7). 4 chord songs added: Knockin' on Heaven's Door, Stand By Me, Let It Be (Chords), Three Little Birds.

**Curriculum** (`/app/learn`): 6-stage linear ladder (First sounds, Open strings, First chords, Folk chords, Power chords, Lead playing). Unlock rule: any song in prior stage at >= 70% accuracy. Progress tracked from practice.ts session history. `lib/curriculum.ts` + `app/app/learn/page.tsx`.

**Beat-aware scoring**: Per-note timeout = max(4 beats, 2.5s). End-of-session timing broken into on-beat / late / slow buckets. Real-time ON BEAT / LATE / SLOW pill flashes after each hit during play.

**Song covers**: `SongCover` component generates deterministic per-song album art (vinyl or cassette variant, difficulty-colored, title initials). Shown 48px in SongCard, 120px in SongFollowView idle, 36px in curriculum cards.

**Vinyl loader**: `VinylLoader` component replaces dot pulses during AI generation (tab gen panel: 96px + rotating ticker text; AI coach analyzing: 44px; generate button: 14px mini-record).

**Songs expanded**: All 73 single-note songs expanded from 20-25 notes to 36 notes each. 4 chord songs added (16 chord events each). Total: 77 songs.

**Settings dedup**: Both `/settings` and `/app/settings` now render `<SettingsPanel layout="standalone|in-app" />`. Each page is a 4-line wrapper. SettingsPanel.tsx is the single source of truth for all settings UI.

**Metronome extracted**: `lib/metronome-scheduler.ts` -- lookahead Web Audio scheduler pulled out of SongFollowView. Reusable. Handles beat-flash buffering via setTimeout array cleared on stop.

**Audio fixes**: mountedRef guard prevents mic/context leak on unmount during getUserMedia. AudioContext double-close guarded (ctx.state check). armedRef stays true on miss-timeout (only disarms on hit). Count-in clicks at 660/660/660/1320 Hz before first note.

**Security hardened**: Rate limit uses rightmost XFF hop (Vercel-verified). bug-report derives userId from Bearer token, rate limited 5/hr, generic error responses. tabs route wraps req.json() in try/catch. delete-account rate limited. Avatar validates data:image/ prefix + 100KB cap. Display name capped at 60 chars.

**0 lint errors**: Down from 29 (15 errors + 14 warnings) to 0.

### Recent additions since v1.0
**TabStaff**: `components/TabStaff.tsx` -- replaces page-by-page TabView. Songsterr-style continuous 6-string staff with fixed green playhead. Notes scroll left past the bar; past notes fade, current note glows. All notes rendered in one strip, scroll position driven by `currentIndex`.

**LarkChat fixes**: FAB button uses `clip-path: circle(50%)` instead of overflow:hidden (fixes Safari/Chrome square rendering when stacking contexts are active). Button always visible during song play; only the chat panel auto-closes.

**Song regeneration**: All 73 note-melody songs regenerated with Claude note-names-first pipeline. Spot-checked: Smoke on the Water (G-Bb-C correct), Seven Nation Army, Brain Stew, Come As You Are, Nothing Else Matters all verified correct.

**Three-tier tab generation** (`/api/tabs`):
1. bitmidi.com -- real MIDI files, guitar channel via GM program 24-31, monophonic melody extraction, consecutive dedup
2. Songsterr metadata -- correct title/artist, non-standard tuning detection (Drop D, Eb, etc.)
3. Claude note-names-first -- fallback only

### Next up
1. Stripe for Pro tier (needs parent for under-18 TOS)
2. Get 5 real users playing curriculum Stage 1 and watch them
3. Song accuracy: tabs are Claude-generated. Fix options: license Songsterr/UG API commercially, or manual song-by-song verification

---

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack), TypeScript
- **Styling**: CSS variables only (no Tailwind), Space Mono for accent/numbers
- **Animation**: framer-motion + IntersectionObserver-based `Reveal` component
- **Audio**: Web Audio API + Pitchy v4 (pitch) + @tonaljs/chord-detect (chords)
- **AI**: @anthropic-ai/sdk (server-side only, `/api/coach` route)
- **Auth**: Supabase (browser client + @supabase/ssr middleware)
- **Deploy**: Vercel (push to main auto-deploys)
- **Local path**: `~/Downloads/lark/`
- **Domain**: lark.coach (bought on Vercel)

---

## Critical Rules — Never Break These

- CSS variables only, never hardcode hex colors
- Space Mono for accents/numbers/eyebrows
- `overscroll-behavior: none` globally
- Tuner + chord detector run entirely client-side
- `pitchy` is in `transpilePackages` in next.config.ts (ESM-only)
- Web Audio `AudioContext` must be created inside a click handler (user gesture required)
- Always stop media stream tracks on cleanup
- Cancel `requestAnimationFrame` on unmount
- No emojis in UI
- No em dashes in source files
- Theme is set via `data-theme="dark" | "light"` on `<html>` — never hardcode dark colors

---

## Theme System

- CSS variables defined twice: `:root, [data-theme="dark"]` and `[data-theme="light"]`
- `ThemeProvider` (`components/ThemeProvider.tsx`) wraps the app
- `useTheme()` hook gives `{ theme, toggle, setTheme }`
- Persisted to `localStorage.lark_theme`
- SSR-safe: inline script in `<head>` reads localStorage and sets `data-theme` before paint to prevent FOUC
- Default: dark
- `ThemeToggle` component is a 36×36 sun/moon icon button

### Dark vars
`--bg: #080c14`, `--accent: #22c55e` (green), warm cream text

### Light vars
`--bg: #faf9f6` (warm cream), `--accent: #16a34a` (darker green), dark warm-gray text

---

## File Structure

```
lark/
  app/
    layout.tsx              <- root, ThemeProvider + theme script + GlobalUI
    globals.css             <- all themes + utility classes
    (marketing)/            <- route group: PublicNav + Footer wrap
      layout.tsx
      page.tsx              <- / (landing, auth-aware hero; client)
      pricing/              <- page.tsx (server, metadata) + PricingContent.tsx (client)
      changelog/            <- page.tsx (server, metadata) + ChangelogContent.tsx (7 chapters, client)
      faq/                  <- page.tsx (server, metadata) + FaqContent.tsx (client)
      settings/page.tsx     <- /settings -- renders <SettingsPanel layout="standalone" />
      privacy/              <- page.tsx (server, metadata) + PrivacyContent.tsx (client)
      terms/                <- page.tsx (server, metadata) + TermsContent.tsx (client)
    error.tsx               <- root error boundary ("A string snapped")
    auth/page.tsx           <- /auth (own layout, no nav)
    tuner/page.tsx          <- /tuner (ToolNav)
    chords/page.tsx         <- /chords (ToolNav)
    app/
      layout.tsx            <- AppShell wrapper
      page.tsx              <- /app (dashboard: stats -> tools -> coming soon)
      learn/page.tsx        <- /app/learn (6-stage curriculum, stage cards, song picker)
      songs/page.tsx        <- /app/songs (77 songs incl chord songs, library, AI gen)
      chord-library/page.tsx <- /app/chord-library
      metronome/page.tsx    <- /app/metronome
      tuner/page.tsx        <- /app/tuner
      chords/page.tsx       <- /app/chords
      settings/page.tsx     <- /app/settings -- renders <SettingsPanel layout="in-app" />
    api/
      coach/route.ts        <- AI song feedback (rate limited 20/hr)
      chat/route.ts         <- Guitar Q&A, claude-haiku-4-5 (30/hr)
      tabs/route.ts         <- AI tab gen note-names-first, claude-sonnet-4-6 (10/hr)
      bug-report/route.ts   <- Bug reports, rate limited, derives userId from token
      delete-account/route.ts <- Delete user via service role key, rate limited
    app/error.tsx           <- in-app error boundary ("This page hit a wrong note")
  components/
    AppShell.tsx            <- sidebar + topbar, auth state, UserMenu (mounted-guard on getUser)
    PublicNav.tsx           <- auth-aware: avatar pill when signed in
    UserMenu.tsx            <- avatar + name pill + dropdown
    SettingsPanel.tsx       <- all settings UI (deduped), layout prop: standalone | in-app
    LarkChat.tsx            <- floating AI chat, hides during song play
    FeedbackButton.tsx      <- flag button, calls /api/bug-report
    GlobalUI.tsx            <- mounts LarkChat + FeedbackButton globally
    TabStaff.tsx            <- Songsterr-style scrolling 6-string staff with green playhead
    SongFollowView.tsx      <- song play: pitch + chord detection, metronome, timing
    SongCover.tsx           <- deterministic per-song album art (vinyl/cassette SVG)
    VinylLoader.tsx         <- spinning vinyl record loader with ticker text
    MetronomeView.tsx       <- standalone metronome
    TunerView.tsx           <- pitch detection UI
    ChordsView.tsx          <- chromagram chord detection
    OnboardingTour.tsx      <- 8-step spotlight tour (TOUR_KEY in localStorage)
    ChordDiagram.tsx        <- SVG chord fingering diagrams
    Footer.tsx              <- 3-col: brand / Company / Account + bird watermark
    Reveal.tsx              <- IntersectionObserver scroll-triggered fade-up
  lib/
    supabase.ts             <- browser client singleton
    songs.ts                <- 77 songs: 73 note-melodies + 4 chord-strum songs
    practice.ts             <- session tracking, saved songs, bug reports, gen limit
    rate-limit.ts           <- in-memory sliding window rate limiter (rightmost XFF hop)
    note-mapping.ts         <- note name -> MIDI -> tab position (with preferredString)
    song-session.ts         <- pure helpers: noteTimeoutMs, classifyTiming, STRING_DESCRIPTIONS
    metronome-scheduler.ts  <- lookahead Web Audio metronome, reusable handle
    chord-detection.ts      <- buildChromagram, detectChordFromChroma, chordMatches
    curriculum.ts           <- STAGES array, getCurriculumProgress, getNextSong
    version.ts              <- VERSION string (currently v1.1)
  proxy.ts                  <- SSR auth refresh (Next.js 16 renamed middleware)
  supabase/migrations/      <- SQL files to run in Supabase SQL editor (incl. pg_cron)
  supabase/email-templates/ <- branded auth email HTML (paste into Supabase Auth UI)
  public/sitemap.xml        <- 9 public routes
  public/robots.txt         <- blocks /app and /api
```

### Critical patterns from v1.1 (do not regress)
- **Hex-alpha is invalid CSS**: never do `${cssVar}80`. Use `rgba(var(--x-rgb), 0.5)`. RGB-channel vars exist for accent, danger, sharp, flat, and all difficulty colors.
- **Client components can't export `metadata`**: any marketing page needing SEO metadata must be a server `page.tsx` rendering a client `*Content.tsx`.
- **Vinyl loader colors are theme-fixed** (`--vinyl-body/groove/shine`), not `var(--bg)` — a vinyl record is black in both themes.
- Async `supabase.auth.getUser().then(setState)` needs a `mounted` flag + cleanup.

---

## Component Patterns

### Eyebrow
`<p className="eyebrow">SOME LABEL</p>`
- Space Mono 10px, 0.22em letter-spacing, accent color, uppercase, 700 weight

### Reveal
`<Reveal delay={0.1}>...</Reveal>` — IntersectionObserver-based fade-up. Used everywhere on marketing pages. Threshold 0.12, rootMargin -40px.

### Buttons
- `.btn .btn-accent` — solid green pill, hover glow shadow
- `.btn .btn-ghost` — transparent + border, hover green
- `.btn .btn-outline` — border only, hover full green fill
- `.btn-lg` for hero CTAs, `.btn-sm` for compact

---

## Auth Pattern (Supabase)

`lib/supabase.ts`:
- `getSupabase()` returns `SupabaseClient | null` based on env vars
- `isSupabaseConfigured` boolean for graceful degradation
- Auth page checks this and shows a "preview mode" warning if missing

To enable auth:
1. Create Supabase project at supabase.com
2. Copy URL + anon key
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```
4. Restart dev server. Sign up / sign in / magic link / Google OAuth / GitHub OAuth all work.

Proxy (`proxy.ts` — Next.js 16 renamed `middleware` to `proxy`) calls `supabase.auth.getUser()` on every request to refresh JWTs. Exported function is named `proxy`, not `middleware`. No-ops if env vars missing.

---

## Audio Architecture

### Tuner (live, v0.1)
- `AudioContext` + `getUserMedia` → `MediaStreamSource` → `AnalyserNode` (fftSize: 2048)
- `getFloatTimeDomainData` → Pitchy `PitchDetector.forFloat32Array()`
- `detector.findPitch(input, sampleRate)` returns `[pitch_hz, clarity_0_to_1]`
- Clarity threshold: 0.92
- Pitch range: 60–1400 Hz
- `requestAnimationFrame` loop, cancelled on stop/unmount

### Chords (live, v0.1)
- AnalyserNode fftSize: 4096 (better frequency resolution)
- `getFloatFrequencyData` → custom `buildChromagram` (folds FFT bins into 12 pitch classes)
- Rolling average over last 10 frames for stability
- Active threshold: 0.45 (normalized chroma magnitude)
- `@tonaljs/chord-detect` `detect()` matches active notes to chord names
- Returns chord, alternatives, individual notes, full chromagram for viz

### Pitch math
- MIDI note: `Math.round(12 * Math.log2(freq / 440) + 69)`
- Cents offset: `Math.round(1200 * Math.log2(detected / target))`
- In tune: `|cents| < 5`
- Close: `|cents| < 15`

### TypeScript ArrayBuffer gotcha
Newer TS strict mode flags `Float32Array<ArrayBufferLike>` vs `Float32Array<ArrayBuffer>`. Cast at the Web Audio API call site:
```ts
analyser.getFloatFrequencyData(freqData as Float32Array<ArrayBuffer>);
```

---

## Song Mode (v1.0)

### Architecture
- `lib/songs.ts` — `Song` + `TabNote` types. `TabNote.chord?` optional field enables chord-strum mode.
- `lib/song-session.ts` — pure helpers: `noteTimeoutMs`, `classifyTiming`, `STRING_DESCRIPTIONS`, `ordinalFret`, shared constants.
- `lib/metronome-scheduler.ts` — reusable lookahead Web Audio metronome. Returns a `MetronomeHandle` with `.stop()`.
- `lib/chord-detection.ts` — `buildChromagram`, `avgChromagram`, `detectChordFromChroma`, `chordMatches`.
- `components/SongFollowView.tsx` — score-following + chord detection + real-time timing pill.
- `app/app/songs/page.tsx` — song library, difficulty filter, AI tab gen with VinylLoader.
- `app/api/coach/route.ts` — claude-sonnet-4-6, 200 tokens, beat-aware timing in prompt.

### Score-following logic
- Note tolerance: 100 cents (1 semitone)
- Clarity threshold: 0.88
- Per-note timeout: `max(4 * beatMs, 2500)` — scales with song tempo
- `armedRef` + release detection: sustained note won't double-count. Disarms on hit, stays armed on miss.
- `advancedRef` race guard prevents concurrent `advanceNote` calls.
- Refs are the source of truth inside the RAF loop; state is synced for rendering.

### Chord detection mode
When `target.chord` is set, the detect loop switches from Pitchy pitch detection to:
1. `getFloatFrequencyData` at fftSize 4096 (bumped from 2048 for chord songs)
2. `buildChromagram` -> 10-frame rolling average
3. `detectChordFromChroma` (threshold 0.45, tonaljs chord-detect)
4. `chordMatches(detected, target.chord)` — loose match: same root + same minor/major family
5. On match, clears chord history and calls `advanceNote(true, 0)`

### AI Coach
- 30s timeout with `AbortController` + `cancelled` flag prevents setState after unmount.
- `claude-sonnet-4-6`, 200 tokens. Beat-aware timing injected into prompt.
- Gracefully degrades if `ANTHROPIC_API_KEY` missing.

### Songs
77 songs total in `lib/songs.ts`:
- 73 note-melody songs (beginner/intermediate/advanced/expert), each 36 notes
- 4 chord-strum songs: Knockin' on Heaven's Door, Stand By Me, Let It Be (Chords), Three Little Birds
- Add note songs via `n(string, fret)` helper
- Add chord songs via `c(chord, string, fret)` helper

### Curriculum
`lib/curriculum.ts` — 6-stage linear ladder, unlocks on 70%+ accuracy in prior stage.
`app/app/learn/page.tsx` — stage cards with progress, song tiles, lock/unlock state.

---

## Deployment

- **Frontend**: push to `main` -> Vercel auto-deploys
- **Domain**: lark.coach
- **Env vars on Vercel**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

---

## Setup (fresh clone)

```bash
cd ~/Downloads/lark
npm install
cp .env.local.example .env.local  # then fill in Supabase keys
npm run dev
```

Open `localhost:3000`.

---

## What Was Built

### v0.2 (May 18, 2026) — World class push

**Foundation**
- Light + dark theme system with `data-theme` attribute, CSS variable swap
- SSR-safe theme script prevents FOUC
- `ThemeProvider` context, `useTheme` hook, `ThemeToggle` icon button
- Persists to `localStorage.lark_theme`

**Components (lifted patterns from Corvo)**
- `Card` + `CardHeader` — same hover lift, accent stripe, 14px radius
- `PublicNav` — hide-on-scroll, theme toggle, mobile drawer, active link styling
- `Footer` — 4-column grid (brand + Product + Company + Account)
- `AppShell` — sidebar + topbar shell for /app routes
- `ToolNav` — minimal nav for /tuner and /chords with segmented tool switcher
- `Reveal` — IntersectionObserver scroll reveal, used everywhere

**Marketing site**
- Route group `(marketing)` so all marketing pages share PublicNav + Footer
- Landing: cinematic hero with floating accent orbs, feature grid (Tuner + Chords + Song Mode soon + AI Coach soon), 3-step "how it works", trust card, final CTA
- About: story + 3 principles cards (Listen First / Advisor Not Tool / No Friction)
- Pricing: 3 tiers (Free now / Pro $8 coming / Studio $24 coming), founding member pre-launch note
- FAQ: 4 sections (Getting Started / Privacy / Features / Billing) with animated accordion

**Auth**
- `/auth` page with mode tabs (Sign In / Sign Up), magic link mode, reset password mode
- Google + GitHub OAuth buttons
- Graceful degradation when Supabase env vars missing (preview mode warning)
- Animated success/error toasts (framer-motion)

**App shell**
- `/app` dashboard: greeting (time-of-day + username), live tools, coming-soon cards, practice stats placeholder
- `/app/settings`: appearance (theme picker), detection prefs (sensitivity + show-freq + default tuning), account (email + sign out), about (version + feedback)
- Sidebar collapses on mobile with drawer pattern
- Topbar with theme toggle persists across app routes

**Polish on v0.1**
- Tuner and Chords pages updated to use shared `ToolNav` with theme toggle + tool switcher
- Both work cleanly in light and dark themes
- Em dash removals + accessibility focus rings

**Dependencies added**
- framer-motion (animations)
- @supabase/supabase-js + @supabase/ssr (auth)

### v0.1 (May 17, 2026) — Tuner MVP + Chord Detector

Initial Next.js scaffold with Space Mono dark theme. `/tuner` real-time pitch detection via Web Audio + Pitchy. `/chords` chromagram-based chord detection with @tonaljs/chord-detect. Detected note display, cents meter, 6-string reference, chord chip visualization, alternatives list.
