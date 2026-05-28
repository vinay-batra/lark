# Lark

**The guitar tutor that listens.**

Lark hears every note you play, scores you in real time, and gives AI coaching when you finish. 77 songs, 4 difficulty levels, Songsterr-style scrolling tab, 6-stage learning curriculum. Free. No download.

Live: **[lark.coach](https://lark.coach)**

---

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Audio:** Web Audio API + Pitchy v4 (pitch) + @tonaljs/chord-detect (chromagram) + midi-file (MIDI parsing)
- **AI:** @anthropic-ai/sdk — claude-sonnet-4-6 for coaching + tab gen, claude-haiku-4-5 for guitar chat
- **Auth + DB:** Supabase (browser client + @supabase/ssr)
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

Run the SQL files in `supabase/migrations/` in the Supabase SQL editor to set up tables (incl. `pg_cron` cleanup jobs). Auth email templates live in `supabase/email-templates/` — paste them into Supabase Auth > Email Templates.

## Routes

| Route | Description |
|---|---|
| `/` | Landing — auth-aware hero |
| `/pricing` | Free / Pro / Studio tiers |
| `/changelog` | Seven-chapter horizontal timeline |
| `/faq` | Accordion FAQ |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/settings` | Standalone settings page (auth-gated) |
| `/auth` | Sign in / sign up / magic link / OAuth |
| `/tuner` | Public tuner (no auth) |
| `/chords` | Public chord detector (no auth) |
| `/app` | Dashboard: stats, live tools |
| `/app/learn` | Six-stage learning curriculum |
| `/app/songs` | 77 songs, 4 difficulty levels, AI tab gen |
| `/app/tuner` | Tuner (in app shell) |
| `/app/chords` | Chord detector (in app shell) |
| `/app/chord-library` | 120+ chord diagrams |
| `/app/metronome` | Web Audio metronome |
| `/app/settings` | Settings (in app shell) |
| `/api/coach` | Post-session AI feedback, claude-sonnet-4-6, 20 req/hr |
| `/api/chat` | Guitar Q&A, claude-haiku-4-5, 30 req/hr |
| `/api/tabs` | Tab generation (MIDI → Songsterr → Claude), 10 req/hr |
| `/api/bug-report` | Bug reports (server-side, rate limited) |
| `/api/delete-account` | Delete user account (requires service role key) |

## Version

v1.1
