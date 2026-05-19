# CLAUDE.md — Lark

Guitar AI tutor. Hears you play, shows you what to play, gives feedback.

---

## Current Focus

**Last shipped: v0.4 (May 18, 2026) — Song Mode with score-following + AI Coach via Claude API.**

Live at: `https://lark-git-main-vinay-batras-projects.vercel.app`
Supabase project: `ebsddbpbvjbcdwfldubx` (auth live, waitlist table needs migration)

13 routes:
- `/` — Cinematic landing. Single OPEN APP CTA. Green CSS multi-gradient bg. Email waitlist.
- `/pricing` — 3-tier (Free / Pro $8 / Studio $24, paid coming soon)
- `/changelog` — Timeline with v0.1 / v0.2 / v0.3 entries
- `/faq` — Accordion FAQ, 4 sections
- `/auth` — Sign in / sign up / magic link / reset. Google + GitHub OAuth live.
- `/tuner` — Public tuner (no auth)
- `/chords` — Public chord detector (no auth)
- `/app` — Auth-gated dashboard (redirects to /auth if not signed in)
- `/app/tuner` — Tuner inside AppShell
- `/app/chords` — Chords inside AppShell
- `/app/songs` — Song Mode: pick a song, play note-by-note, get AI coaching
- `/app/settings` — Theme, audio prefs, account, version
- `/api/coach` — POST endpoint: sends session data to Claude, returns guitar feedback

### Next up
1. Run waitlist migration in Supabase SQL editor (`supabase/migrations/20260518000000_waitlist.sql`)
2. Add ANTHROPIC_API_KEY to Vercel env vars (Project Settings -> Environment Variables)
3. Stripe for Pro tier (needs parent for under-18 TOS)
4. Progress tracking (session history, stats in /app dashboard)
5. Backend (Railway + FastAPI) when needed for heavier AI features

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
    layout.tsx              ← root, ThemeProvider + theme script
    globals.css             ← all themes + utility classes
    (marketing)/            ← route group: PublicNav + Footer wrap
      layout.tsx
      page.tsx              ← /  (landing)
      about/page.tsx        ← /about
      pricing/page.tsx      ← /pricing
      faq/page.tsx          ← /faq
    auth/page.tsx           ← /auth  (own layout, no nav)
    tuner/page.tsx          ← /tuner (ToolNav)
    chords/page.tsx         ← /chords (ToolNav)
    app/
      layout.tsx            ← AppShell wrapper
      page.tsx              ← /app (dashboard)
      settings/page.tsx     ← /app/settings
  components/
    Card.tsx                ← reusable card w/ hover lift (from Corvo)
    PublicNav.tsx           ← hide-on-scroll, theme toggle, mobile drawer
    Footer.tsx              ← 4-col grid, links, version
    ThemeProvider.tsx       ← context + provider
    ThemeToggle.tsx         ← sun/moon icon button
    AppShell.tsx            ← /app sidebar + topbar
    ToolNav.tsx             ← /tuner + /chords mini-nav
    Reveal.tsx              ← scroll-triggered fade-up
  lib/
    supabase.ts             ← browser client, isSupabaseConfigured
    theme.ts                ← Theme type, applyTheme, getStoredTheme
  proxy.ts                  ← SSR auth refresh (was middleware.ts; Next.js 16 renamed)
  .env.local.example        ← Supabase env var template
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
