import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { OPEN_MIDI, Song } from '@/lib/songs';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI tab generation requires ANTHROPIC_API_KEY.' }, { status: 503 });
  }

  if (!rateLimit(getClientIP(req), 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many generation requests. Please wait before trying again.' }, { status: 429 });
  }

  const { query } = await req.json();
  if (!query?.trim()) return NextResponse.json({ error: 'No song query provided.' }, { status: 400 });
  if (query.length > 200) return NextResponse.json({ error: 'Query too long.' }, { status: 400 });

  const system = `You are a guitar tab expert. Generate accurate guitar tablature for the most recognizable riff or intro of the requested song.

Return ONLY a JSON object -- no markdown fences, no explanation.
Format: {"title": "Song Name", "artist": "Artist Name", "notes": [{"s": 1, "f": 0}, ...]}

Rules:
- s: string number 1-6 (1=high e, 2=B, 3=G, 4=D, 5=A, 6=low E), standard EADGBE tuning
- f: fret number 0-24
- Generate 12-20 notes (the main hook or intro, not the whole song)
- Use the most common/beginner-friendly position on the neck
- Never use em dashes`;

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system,
      messages: [{ role: 'user', content: `Generate tabs for: ${query.trim()}` }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '';

    // Strip markdown fences if Claude added them anyway
    const json = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

    let parsed: { title: string; artist: string; notes: { s: number; f: number }[] };
    try {
      parsed = JSON.parse(json);
    } catch {
      return NextResponse.json({ error: 'Could not parse tab data. Try a different song name.' }, { status: 422 });
    }

    if (!Array.isArray(parsed.notes) || parsed.notes.length === 0) {
      return NextResponse.json({ error: 'No notes generated. Try a more specific song name.' }, { status: 422 });
    }

    const song: Song = {
      id: `generated-${Date.now()}`,
      title: parsed.title ?? query,
      artist: parsed.artist ?? 'Unknown',
      difficulty: 'beginner',
      generated: true,
      notes: parsed.notes
        .filter(n => n.s >= 1 && n.s <= 6 && n.f >= 0 && n.f <= 24)
        .map(n => ({
          string: n.s as 1 | 2 | 3 | 4 | 5 | 6,
          fret: n.f,
          midi: OPEN_MIDI[n.s - 1] + n.f,
        })),
    };

    if (song.notes.length === 0) {
      return NextResponse.json({ error: 'Generated tab had invalid notes. Try again.' }, { status: 422 });
    }

    return NextResponse.json({ song });
  } catch {
    return NextResponse.json({ error: 'Generation failed. Try again.' }, { status: 500 });
  }
}
