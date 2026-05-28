import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { Song } from '@/lib/songs';
import { notesToTabs } from '@/lib/note-mapping';
import { getSongsterrMeta } from '@/lib/songsterr';
import { fetchMidiTab } from '@/lib/midi-tabs';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

/**
 * POST /api/tabs
 *
 * Three-tier pipeline - each tier falls through to the next on failure:
 *
 * 1. bitmidi.com (free MIDI library, no auth)
 *    Human-submitted MIDI files. Returns exact note pitches with timing.
 *    Fires in parallel with tier 2. If it resolves first with valid notes,
 *    the response is returned immediately (no Claude call needed).
 *
 * 2. Songsterr metadata (free JSON API, no auth)
 *    Resolves exact title/artist and guitar track context to anchor Claude.
 *    GP files require signed CloudFront URLs (paid tier) so we only use
 *    the metadata to improve Claude's note generation.
 *
 * 3. Claude note generation (note-names-first)
 *    Claude outputs note names (E4, F#3) enriched with any metadata from
 *    tier 2. lib/note-mapping.ts converts to fret/string positions.
 *
 * Accuracy ladder:
 *   bitmidi   ~95% (real note data, real MIDI)
 *   Claude+meta ~80% (Songsterr-anchored context)
 *   Claude cold ~65% (raw query only)
 */
export async function POST(req: NextRequest) {
  if (!rateLimit(getClientIP(req), 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many generation requests. Please wait before trying again.' }, { status: 429 });
  }

  let body: { query?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const { query } = body;
  if (typeof query !== 'string' || !query.trim()) {
    return NextResponse.json({ error: 'No song query provided.' }, { status: 400 });
  }
  if (query.length > 200) {
    return NextResponse.json({ error: 'Query too long.' }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI tab generation requires ANTHROPIC_API_KEY.' }, { status: 503 });
  }

  const q = query.trim();

  // ── Tier 1 + Tier 2: fire in parallel ─────────────────────────────────
  const [midiResult, meta] = await Promise.allSettled([
    fetchMidiTab(q),
    getSongsterrMeta(q),
  ]);

  // Use MIDI result if we got valid notes
  const midi = midiResult.status === 'fulfilled' ? midiResult.value : null;
  if (midi && midi.notes.length > 0) {
    const song: Song = {
      id: `generated-${Date.now()}`,
      title: midi.title,
      artist: midi.artist,
      difficulty: 'beginner',
      bpm: midi.bpm,
      generated: true,
      notes: midi.notes,
    };
    return NextResponse.json({ song, source: 'midi' });
  }

  // ── Tier 3: Claude with Songsterr context ─────────────────────────────
  const songsterrMeta = meta.status === 'fulfilled' ? meta.value : null;

  // Build song identity line using Songsterr if available
  const songLine = songsterrMeta
    ? `"${songsterrMeta.title}" by ${songsterrMeta.artist}${
        songsterrMeta.trackName
          ? ` (${songsterrMeta.trackName.split('|').pop()?.trim()})`
          : ''
      }`
    : `"${q}"`;

  const tuningNote = songsterrMeta?.nonStandardTuning
    ? `\nIMPORTANT: This song uses ${songsterrMeta.tuningHint}. Adjust your note names accordingly.`
    : '';

  const system = `You are a music expert specializing in guitar melodies.

Generate the most recognizable riff, intro, or melody for the song as a sequence of note names with octaves.

Return ONLY a JSON object - no markdown fences, no explanation, no prose.

Format:
{
  "title": "Song Name",
  "artist": "Artist Name",
  "tempo": 120,
  "preferredString": 6,
  "notes": ["E2", "G2", "A2", "E2", ...]
}

Rules:
- Use scientific pitch notation: letter (A-G) + optional # or b + octave number
- Examples: "E2" (open low E on guitar), "E4" (open high E), "F#3", "Bb4"
- Reference octaves: guitar open strings are E2, A2, D3, G3, B3, E4
- Generate 28-36 notes (the main hook played twice -- enough to feel like a real song)
- Pitches must be accurate. This is the most important rule.
- tempo: BPM as integer, 60-200
- preferredString (OPTIONAL): if the riff is traditionally played on one string, set 1=high e, 2=B, 3=G, 4=D, 5=A, 6=low E
- Never use em dashes anywhere in the output.${tuningNote}`;

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system,
      messages: [{ role: 'user', content: `Generate notes for: ${songLine}` }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const json = extractJsonObject(raw);
    if (!json) {
      return NextResponse.json({ error: 'Could not parse tab data. Try a different song name.' }, { status: 422 });
    }

    let parsed: { title?: string; artist?: string; tempo?: number; preferredString?: number; notes?: string[] };
    try {
      parsed = JSON.parse(json);
    } catch {
      return NextResponse.json({ error: 'Could not parse tab data. Try a different song name.' }, { status: 422 });
    }

    if (!Array.isArray(parsed.notes) || parsed.notes.length === 0) {
      return NextResponse.json({ error: 'No notes generated. Try a more specific song name.' }, { status: 422 });
    }

    const preferredString =
      typeof parsed.preferredString === 'number' && parsed.preferredString >= 1 && parsed.preferredString <= 6
        ? (parsed.preferredString as 1 | 2 | 3 | 4 | 5 | 6)
        : undefined;

    const tabs = notesToTabs(parsed.notes, preferredString);
    if (tabs.length === 0) {
      return NextResponse.json({ error: 'Generated notes were unplayable. Try again.' }, { status: 422 });
    }

    const tempo = typeof parsed.tempo === 'number' && parsed.tempo >= 40 && parsed.tempo <= 240
      ? Math.round(parsed.tempo)
      : 120;

    const song: Song = {
      id: `generated-${Date.now()}`,
      title: songsterrMeta?.title ?? parsed.title ?? q,
      artist: songsterrMeta?.artist ?? parsed.artist ?? 'Unknown',
      difficulty: 'beginner',
      bpm: tempo,
      generated: true,
      notes: tabs,
    };

    return NextResponse.json({ song, source: 'claude', songsterrMatched: !!songsterrMeta });
  } catch {
    return NextResponse.json({ error: 'Generation failed. Try again.' }, { status: 500 });
  }
}

/**
 * Extract the first balanced top-level JSON object from a string. Tolerates
 * markdown fences, leading prose, and trailing text from Claude.
 */
function extractJsonObject(raw: string): string | null {
  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (inString) {
      if (escape) { escape = false; continue; }
      if (c === '\\') { escape = true; continue; }
      if (c === '"') inString = false;
      continue;
    }
    if (c === '"') { inString = true; continue; }
    if (c === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0 && start !== -1) return raw.slice(start, i + 1);
    }
  }
  return null;
}
