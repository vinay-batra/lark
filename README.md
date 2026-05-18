# Lark

**The guitar tutor that listens.**

Lark hears every note you play. Tune your guitar, detect chords, follow songs in real time, and get coaching feedback that actually means something. All in your browser.

Live: [lark-git-main-vinay-batras-projects.vercel.app](https://lark-git-main-vinay-batras-projects.vercel.app)

---

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Audio:** Web Audio API + Pitchy v4 (pitch detection) + @tonaljs/chord-detect (chords)
- **Auth:** Supabase (browser client + SSR middleware)
- **Animations:** framer-motion
- **Deploy:** Vercel (frontend), Supabase (auth + DB)

## Setup

```bash
git clone https://github.com/vinay-batra/lark.git
cd lark
npm install
cp .env.local.example .env.local
# fill in Supabase keys, then:
npm run dev
```

Open `localhost:3000`.

## Env vars

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/tuner` | Public tuner (no auth) |
| `/chords` | Public chord detector (no auth) |
| `/pricing` | Pricing page |
| `/changelog` | Changelog |
| `/faq` | FAQ |
| `/auth` | Sign in / sign up / magic link |
| `/app` | Authenticated dashboard |
| `/app/tuner` | Tuner inside app shell |
| `/app/chords` | Chord detector inside app shell |
| `/app/settings` | Settings |

## Deploy

Frontend auto-deploys on push to `main` via Vercel.

Database migrations live in `supabase/migrations/`. Run them manually in the Supabase SQL editor.

## Version

v0.3
