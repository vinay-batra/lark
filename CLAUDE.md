# CLAUDE.md — Lark

Guitar AI tutor. Hears you play, shows you what to play, gives feedback.

---

## Current Focus

**Last shipped: v0.9 (May 19, 2026) — Full platform polish: auth-aware nav, settings with avatar, song corrections, mobile audit, security.**

Live at: `https://lark.coach`
Supabase project: `ebsddbpbvjbcdwfldubx`

Routes (20 total):
- `/` — Landing. Auth-aware: "GO TO APP" when signed in, "START PLAYING" -> signup when not.
- `/pricing` — 3-tier (Free / Pro $8 / Studio $24, paid coming soon). "Free to learn. Pro when you're ready."
- `/changelog` — Horizontal scroll-snap chapter timeline (4 chapters, Corvo pattern)
- `/faq` — Accordion FAQ with aria-expanded
- `/auth` — Sign in / sign up / magic link / reset. Google + GitHub OAuth live.
- `/settings` — Standalone settings page (auth-gated): display name, avatar upload (canvas resize -> base64 -> user_metadata), theme, audio prefs, danger zone (sign out + delete account)
- `/privacy` — Privacy policy page
- `/terms` — Terms of service page
- `/tuner` — Public tuner (no auth)
- `/chords` — Public chord detector (no auth)
- `/app` — Dashboard: Your Stats (sessions, streak, accuracy, tabs) -> Live Tools -> Coming Soon
- `/app/tuner` — Tuner inside AppShell
- `/app/chords` — Chord detector inside AppShell
- `/app/chord-library` — 120+ chord diagrams, searchable, expandable cards
- `/app/songs` — 73 songs (4 difficulty levels), song library, AI tab generation
- `/app/metronome` — Web Audio metronome (look-ahead scheduler, tap tempo, time signatures)
- `/app/settings` — In-app settings (same as /settings)
- `/api/coach` — POST: Claude AI song feedback (rate limited 20/hr)
- `/api/chat` — POST: Guitar Q&A chat, claude-haiku-4-5 (rate limited 30/hr, 5/day client-side)
- `/api/tabs` — POST: AI tab generation, claude-sonnet-4-6 (rate limited 10/hr)
- `/api/bug-report` — POST: Saves bug reports server-side (bypasses RLS)
- `/api/delete-account` — POST: Deletes user via service role key (requires SUPABASE_SERVICE_ROLE_KEY)

### Key decisions made in v0.9 session

**Auth-aware PublicNav**: When signed in shows avatar pill (photo or initial) + display name + chevron dropdown with "Go to App" / "Settings" / "Sign out". When not signed in shows "Sign in" + "Get Started". Same dropdown pattern in AppShell UserMenu.

**Avatar upload**: Uses canvas resize (200x200 center-crop, JPEG 0.85) -> base64 stored directly in user_metadata.avatar_url. No Supabase Storage bucket needed.

**Song corrections**: 14 songs had wrong pitches (Seven Nation Army was on wrong strings entirely, Back in Black had G instead of G#, Comfortably Numb was 4 frets too high). All 73 songs expanded to 20-25 notes.

**Mobile breakpoint**: Everything was at 880px (wrong). All breakpoints corrected to 768px.

**Rate limiting**: All 3 API routes (coach/chat/tabs) have server-side in-memory sliding window limiter via lib/rate-limit.ts.

**Danger zone**: /settings page has two-step delete account confirmation -> POST /api/delete-account -> requires SUPABASE_SERVICE_ROLE_KEY env var.

**Bug reports**: Routed through /api/bug-report (server-side) to bypass Supabase RLS. Table: lark_bug_reports -- run supabase/migrations/20260519100000_lark_bug_reports.sql.

### Next up
1. Stripe for Pro tier (needs parent for under-18 TOS)
2. Add SUPABASE_SERVICE_ROLE_KEY to Vercel env vars (needed for delete account)
3. Create lark_bug_reports table in Supabase (run migration SQL)
4. Expand song notes further -- 20-25 is good, 30-40 would be better for learning full songs

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
      page.tsx              <- / (landing, auth-aware hero)
      pricing/page.tsx      <- /pricing
      changelog/page.tsx    <- /changelog (horizontal timeline)
      faq/page.tsx          <- /faq
      settings/page.tsx     <- /settings (standalone auth-gated settings)
      privacy/page.tsx      <- /privacy
      terms/page.tsx        <- /terms
    auth/page.tsx           <- /auth (own layout, no nav)
    tuner/page.tsx          <- /tuner (ToolNav)
    chords/page.tsx         <- /chords (ToolNav)
    app/
      layout.tsx            <- AppShell wrapper
      page.tsx              <- /app (dashboard: stats -> tools -> coming soon)
      songs/page.tsx        <- /app/songs (73 songs, library, AI gen)
      chord-library/page.tsx <- /app/chord-library
      metronome/page.tsx    <- /app/metronome
      tuner/page.tsx        <- /app/tuner
      chords/page.tsx       <- /app/chords
      settings/page.tsx     <- /app/settings
    api/
      coach/route.ts        <- AI song feedback (rate limited 20/hr)
      chat/route.ts         <- Guitar Q&A, claude-haiku-4-5 (30/hr)
      tabs/route.ts         <- AI tab gen, claude-sonnet-4-6 (10/hr)
      bug-report/route.ts   <- Bug reports (server-side, bypasses RLS)
      delete-account/route.ts <- Delete user via service role key
  components/
    AppShell.tsx            <- sidebar + topbar, auth state, UserMenu
    PublicNav.tsx           <- auth-aware: avatar pill when signed in
    UserMenu.tsx            <- avatar + name pill + dropdown
    LarkChat.tsx            <- floating AI chat (id="tour-chat-btn")
    FeedbackButton.tsx      <- flag button, calls /api/bug-report
    GlobalUI.tsx            <- mounts LarkChat + FeedbackButton globally
    SongFollowView.tsx      <- song play UI: pitch detection + metronome beat
    MetronomeView.tsx       <- standalone metronome
    TunerView.tsx           <- pitch detection UI
    ChordsView.tsx          <- chromagram chord detection
    OnboardingTour.tsx      <- 8-step spotlight tour (TOUR_KEY in localStorage)
    ChordDiagram.tsx        <- SVG chord fingering diagrams
    Footer.tsx              <- 3-col: brand / Company / Account + bird watermark
    Reveal.tsx              <- IntersectionObserver scroll-triggered fade-up
  lib/
    supabase.ts             <- browser client singleton
    songs.ts                <- 73 songs (Song interface with bpm field)
    practice.ts             <- session tracking, saved songs, bug reports
    rate-limit.ts           <- in-memory sliding window rate limiter
    version.ts              <- VERSION string
  proxy.ts                  <- SSR auth refresh (Next.js 16 renamed middleware)
  supabase/migrations/      <- SQL files to run in Supabase SQL editor
```

---

## Component Patterns (from Corvo)

### Card
```tsx
<Card trackColor="var(--accent)">
  <CardHeader eyebrow="Optional" title="Title" />
  ...
</Card>
```
- `0.5px solid var(--border)`, `border-radius: 14`, `padding: 22px 24px`
- Hover: green left border accent + deeper shadow + transition
- Use `trackColor` prop for a permanent status stripe

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

## Song Mode (v0.4)

### Architecture
- `lib/songs.ts` — `Song` + `SongNote` types. Each note has a display name (e.g. `E4`) and MIDI number for frequency comparison.
- `components/SongFollowView.tsx` — score-following component. Uses same Pitchy pitch detection as Tuner.
- `app/app/songs/page.tsx` — song list UI + SongFollowView when a song is selected.
- `app/api/coach/route.ts` — POST endpoint. Sends session stats to `claude-sonnet-4-6`, returns 2-3 sentence feedback.

### Score-following logic (incremental, not full DTW)
- Note tolerance: 100 cents (1 semitone) — generous for beginners
- Clarity threshold: 0.88 (slightly looser than Tuner's 0.92)
- Per-note timeout: 4 seconds. If user doesn't play the right note in time, auto-advance as a miss.
- `advancedRef` prevents double-advance race between RAF loop and timeout.
- Refs (`noteIndexRef`, `sessionNotesRef`) are the source of truth inside the RAF loop. State is synced for rendering.

### AI Coach
- Requires `ANTHROPIC_API_KEY` env var (server-side only, never `NEXT_PUBLIC_`).
- Gracefully degrades: returns a setup message if key is missing.
- Called once per session after all notes are played.
- Input: song title, per-note hit/miss + cents offset, totals.
- Model: `claude-sonnet-4-6`, max 200 tokens.

### Songs
Defined in `lib/songs.ts`: Ode to Joy, Seven Nation Army, Smoke on the Water, Happy Birthday, Twinkle Twinkle. All beginner difficulty. Add more by appending to the `SONGS` array.

---

## Deployment

- **Frontend**: push to `main` → Vercel auto-deploys
- **Backend**: none yet. Will be Railway + FastAPI when AI features ship.
- **Domain**: lark.fm (preferred) or lark.app on Vercel dashboard
- **Env vars on Vercel**: add the two Supabase vars under Project Settings → Environment Variables

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
