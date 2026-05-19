# Lark

**The guitar tutor that listens.**

73 songs with real-time tab follow-along. AI coaching after every session. Tuner, chord detector, metronome, chord library. Free. No download.

Live: **[lark.coach](https://lark.coach)**

---

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Audio:** Web Audio API + Pitchy v4 (pitch) + @tonaljs/chord-detect (chords)
- **AI:** @anthropic-ai/sdk -- claude-sonnet-4-6 for song coaching + AI tab gen, claude-haiku-4-5 for chat
- **Auth + DB:** Supabase
- **Animations:** framer-motion
- **Deploy:** Vercel

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
ANTHROPIC_API_KEY=...          # AI coaching, tab generation, chat
```

Run `supabase/migrations/` in Supabase SQL editor to set up DB tables.

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/tuner` | Public tuner |
| `/chords` | Public chord detector |
| `/app` | Dashboard |
| `/app/songs` | Song mode (73 songs, AI tab gen) |
| `/app/tuner` | Tuner |
| `/app/chords` | Chord detector |
| `/app/chord-library` | 120+ chord diagrams |
| `/app/metronome` | Web Audio metronome |
| `/app/settings` | Theme, audio, profile |
| `/api/coach` | AI song feedback (claude-sonnet-4-6) |
| `/api/tabs` | AI tab generation (claude-sonnet-4-6) |
| `/api/chat` | Guitar Q&A chat (claude-haiku-4-5) |

## Version

v0.8
