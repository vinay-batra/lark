# Lark

**The guitar tutor that listens.**

Lark hears every note you play, scores you in real time, and gives AI coaching when you finish. 83 songs, Practice Mode, Daily Missions, XP system, and a 6-stage learning curriculum. Free. Installable as a PWA.

Live: **[lark.coach](https://lark.coach)**

---

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Audio:** Web Audio API + Pitchy v4 (pitch) + @tonaljs/chord-detect (chromagram) + midi-file (MIDI parsing)
- **AI:** @anthropic-ai/sdk -- claude-sonnet-4-6 for coaching + tab gen, claude-haiku-4-5 for guitar chat
- **Auth + DB:** Supabase (browser client + @supabase/ssr), Pro plan
- **Animations:** framer-motion
- **Deploy:** Vercel (push to main auto-deploys to lark.coach)

## Setup

```bash
git clone https://github.com/vinay-batra/lark.git
cd lark
npm install
cp .env.local.example .env.local
# fill in env vars, then:
npm run dev
```

## Env vars

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...              # AI coaching, tab generation, chat
SUPABASE_SERVICE_ROLE_KEY=...      # delete account endpoint
```

Run the SQL files in `supabase/migrations/` in the Supabase SQL editor to set up tables (incl. `pg_cron` cleanup jobs). Auth email templates live in `supabase/email-templates/` -- paste them into Supabase Auth > Email Templates.

## Routes (24 total)

| Route | Description |
|---|---|
| `/` | Landing -- auth-aware hero with social proof stats |
| `/pricing` | Free / Pro / Studio tiers |
| `/changelog` | Six-chapter horizontal timeline |
| `/faq` | Accordion FAQ |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/settings` | Standalone settings page (auth-gated) |
| `/auth` | Sign in / sign up / magic link / OAuth |
| `/tuner` | Public tuner (no auth) |
| `/chords` | Public chord detector (no auth) |
| `/app` | Dashboard: stats, daily missions, XP level, live tools |
| `/app/progress` | Progress page: accuracy trend chart, sessions per day, top songs |
| `/app/learn` | Six-stage learning curriculum (unlocks at 70% accuracy) |
| `/app/songs` | 83 songs, Practice Mode, AI tab gen, song requests |
| `/app/tuner` | Tuner (in app shell, marks daily mission) |
| `/app/chords` | Chord detector (in app shell) |
| `/app/chord-library` | 120+ chord diagrams |
| `/app/metronome` | Web Audio metronome (not in sidebar; floating widget on songs page) |
| `/app/settings` | Settings (sidebar layout; also accessible via user menu dropdown) |
| `/api/coach` | Post-session AI feedback, claude-sonnet-4-6, 20 req/hr |
| `/api/chat` | Guitar Q&A, claude-haiku-4-5, 30 req/hr |
| `/api/tabs` | Tab generation (MIDI + Songsterr + Claude), 10 req/hr |
| `/api/bug-report` | Bug reports (server-side, rate limited) |
| `/api/delete-account` | Delete user account (requires service role key) |

## Version

v1.6 (June 1, 2026)

### Changelog summary

| Version | What shipped |
|---|---|
| v1.6 | Light mode default, settings sidebar redesign, metronome overlay, split chat limits, sidebar cleanup |
| v1.5 | Progress page, improved AI coach (pitch bias + miss pattern), social proof landing |
| v1.4 | PWA, shareable session cards, song requests, marketing page updates |
| v1.3 | Practice Mode (speed/loop/hints), Daily Missions, XP system (10 levels) |
| v1.3b | Full 83-song accuracy audit -- 7 intermediate/advanced songs corrected |
| v1.2 | 6 new songs (83 total), Iron Man + Every Breath You Take fixed, onboarding overhaul |
| v1.1 | Full quality audit: a11y, SEO, light/dark, metadata, error boundaries, Supabase Pro |
| v1.0 | Chord songs, 6-stage curriculum, beat-aware scoring, AI tab gen, 77 songs |
| v0.1-v0.9 | Tuner, chord detector, song mode, AI coach, brand, avatar, security |
