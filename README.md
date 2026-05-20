# Lark

**The guitar tutor that listens.**

73 songs with real-time tab follow-along. AI coaching after every session. Tuner, chord detector, metronome, chord library. Free. No download.

Live: **[lark.coach](https://lark.coach)**

---

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Audio:** Web Audio API + Pitchy v4 (pitch) + @tonaljs/chord-detect (chords)
- **AI:** @anthropic-ai/sdk — claude-sonnet-4-6 for song coaching + AI tab gen, claude-haiku-4-5 for guitar chat
- **Auth + DB:** Supabase
- **Animations:** framer-motion
- **Deploy:** Vercel (push to main auto-deploys)

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
SUPABASE_SERVICE_ROLE_KEY=...      # delete account endpoint (optional but needed for /api/delete-account)
```

Run the SQL files in `supabase/migrations/` in the Supabase SQL editor to set up tables.

## Routes

| Route | Description |
|---|---|
| `/` | Landing — auth-aware hero (Go to App / Start Playing) |
| `/pricing` | Free / Pro / Studio tiers |
| `/changelog` | Horizontal scroll chapter timeline |
| `/faq` | Accordion FAQ |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/settings` | Standalone settings page (auth-gated) |
| `/auth` | Sign in / sign up / magic link / OAuth |
| `/tuner` | Public tuner (no auth required) |
| `/chords` | Public chord detector (no auth required) |
| `/app` | Dashboard: stats, tools, coming soon |
| `/app/songs` | Song mode — 73 songs, 4 difficulty levels, AI tab gen |
| `/app/tuner` | Tuner (in app shell) |
| `/app/chords` | Chord detector (in app shell) |
| `/app/chord-library` | 120+ chord diagrams |
| `/app/metronome` | Web Audio metronome |
| `/app/settings` | Settings (in app shell) |
| `/api/coach` | AI song feedback, claude-sonnet-4-6, 20 req/hr |
| `/api/chat` | Guitar Q&A, claude-haiku-4-5, 30 req/hr |
| `/api/tabs` | AI tab generation, claude-sonnet-4-6, 10 req/hr |
| `/api/bug-report` | Bug reports (server-side, bypasses RLS) |
| `/api/delete-account` | Delete user account (requires service role key) |

## Version

v0.9
