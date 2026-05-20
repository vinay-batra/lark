# Lark

**The guitar tutor that listens.**

77 songs with real-time note and chord follow-along. Six-stage learning curriculum. AI coaching after every session. Tuner, chord detector, metronome, chord library. Free. No download.

Live: **[lark.coach](https://lark.coach)**

---

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Audio:** Web Audio API + Pitchy v4 (pitch) + @tonaljs/chord-detect (chromagram chords)
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
SUPABASE_SERVICE_ROLE_KEY=...      # delete account endpoint
```

Run the SQL files in `supabase/migrations/` in the Supabase SQL editor to set up tables.

## Routes

| Route | Description |
|---|---|
| `/` | Landing — auth-aware hero |
| `/pricing` | Free / Pro / Studio tiers |
| `/changelog` | Six-chapter horizontal timeline |
| `/faq` | Accordion FAQ |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/settings` | Standalone settings page (auth-gated) |
| `/auth` | Sign in / sign up / magic link / OAuth |
| `/tuner` | Public tuner (no auth) |
| `/chords` | Public chord detector (no auth) |
| `/app` | Dashboard: stats, tools |
| `/app/learn` | Six-stage learning curriculum |
| `/app/songs` | 77 songs, 4 difficulty levels, AI tab gen |
| `/app/tuner` | Tuner (in app shell) |
| `/app/chords` | Chord detector (in app shell) |
| `/app/chord-library` | 120+ chord diagrams |
| `/app/metronome` | Web Audio metronome |
| `/app/settings` | Settings (in app shell) |
| `/api/coach` | AI song feedback, claude-sonnet-4-6, 20 req/hr |
| `/api/chat` | Guitar Q&A, claude-haiku-4-5, 30 req/hr |
| `/api/tabs` | AI tab generation, claude-sonnet-4-6, 10 req/hr |
| `/api/bug-report` | Bug reports (server-side) |
| `/api/delete-account` | Delete user account |

## Version

v1.0
