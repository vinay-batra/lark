import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

interface SessionEvent {
  expected: string;      // note name e.g. "C#4"
  hit: boolean;
  centsOff: number | null;
  timingMs?: number | null;
}

interface CoachRequest {
  song: string;
  artist?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  isChordSong?: boolean;
  bpm?: number;
  events: SessionEvent[];
  totalNotes: number;
  hits: number;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      feedback: 'Add ANTHROPIC_API_KEY to your environment variables to enable AI coaching.',
    });
  }

  if (!rateLimit(getClientIP(req), 20, 60 * 60 * 1000)) {
    return NextResponse.json({ feedback: 'Too many requests. Please wait a bit before trying again.' }, { status: 429 });
  }

  let body: CoachRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ feedback: null }, { status: 400 });
  }

  const { song, artist, difficulty, isChordSong, bpm, events, totalNotes, hits } = body;

  if (!song || typeof song !== 'string' || song.length > 200) {
    return NextResponse.json({ feedback: null }, { status: 400 });
  }
  if (!Array.isArray(events) || events.length > 500) {
    return NextResponse.json({ feedback: null }, { status: 400 });
  }
  if (typeof totalNotes !== 'number' || totalNotes <= 0) {
    return NextResponse.json({ feedback: null }, { status: 400 });
  }
  if (typeof hits !== 'number' || hits < 0 || hits > totalNotes) {
    return NextResponse.json({ feedback: null }, { status: 400 });
  }

  const accuracy = Math.round((hits / totalNotes) * 100);

  // Top missed notes (up to 4, sorted by miss count)
  const missedNotes = events.filter(e => !e.hit).map(e => e.expected);
  const noteCounts: Record<string, number> = {};
  for (const note of missedNotes) {
    noteCounts[note] = (noteCounts[note] ?? 0) + 1;
  }
  const topMissed = Object.entries(noteCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([note, count]) => `${note} (${count}x)`);

  // Intonation: avg cents off on hits (pitch accuracy)
  const hitEvents = events.filter(e => e.hit && e.centsOff !== null);
  const avgCentsOff = hitEvents.length > 0
    ? Math.round(hitEvents.reduce((sum, e) => sum + Math.abs(e.centsOff!), 0) / hitEvents.length)
    : 0;

  // Detect consistent pitch bias (sharp vs flat)
  const biasedHits = hitEvents.filter(e => Math.abs(e.centsOff!) > 10);
  const sharpCount = biasedHits.filter(e => e.centsOff! > 0).length;
  const flatCount = biasedHits.filter(e => e.centsOff! < 0).length;
  const pitchBias = biasedHits.length >= 3
    ? (sharpCount > flatCount * 1.5 ? 'tends sharp' : flatCount > sharpCount * 1.5 ? 'tends flat' : null)
    : null;

  // Timing
  const validBpm = typeof bpm === 'number' && Number.isFinite(bpm) && bpm > 0 && bpm < 400 ? bpm : null;
  const beatMs = validBpm ? 60000 / validBpm : null;
  const onTimeHits = beatMs != null
    ? events.filter(e => e.hit && e.timingMs != null && e.timingMs! <= beatMs).length
    : null;
  const timingPct = onTimeHits != null && hits > 0 ? Math.round((onTimeHits / hits) * 100) : null;

  // Identify timing pattern: are misses clustered at the start, middle, or end?
  const missIndices = events.map((e, i) => ({ hit: e.hit, i })).filter(e => !e.hit).map(e => e.i);
  let missPattern = '';
  if (missIndices.length >= 3) {
    const avgMissPos = missIndices.reduce((s, i) => s + i, 0) / missIndices.length;
    const relPos = avgMissPos / totalNotes;
    if (relPos < 0.35) missPattern = 'mostly at the start';
    else if (relPos > 0.65) missPattern = 'mostly toward the end';
    else missPattern = 'scattered throughout';
  }

  // Build the system prompt
  const system = `You are Lark, a sharp and encouraging guitar coach. A student just finished a song and you are giving them feedback.

Style rules:
- Under 110 words total -- every word must earn its place
- 2 to 3 short sentences. No bullet points. No numbered lists.
- Be specific: reference the actual missed notes, timing numbers, or intonation details given to you
- Be actionable: end with one concrete, testable practice instruction the player can do right now
- Match energy to score: warm and affirming at 80%+, direct and constructive at 50-79%, honest and motivating below 50%
- Use natural guitar vocabulary (fret, string, position, pick attack, barre, ring, mute, bend, etc.)
- Never use em dashes. Never say "great job" or "well done" -- show don't tell.`;

  // Build the user message with rich context
  const lines: string[] = [];
  lines.push(`Song: "${song}"${artist ? ` by ${artist}` : ''}${difficulty ? ` (${difficulty})` : ''}${validBpm ? ` at ${validBpm} BPM` : ''}${isChordSong ? ' -- chord strum mode' : ''}`);
  lines.push(`Score: ${accuracy}% -- ${hits} of ${totalNotes} ${isChordSong ? 'chords' : 'notes'} correct`);

  if (topMissed.length > 0) {
    lines.push(`Most missed: ${topMissed.join(', ')}`);
  } else {
    lines.push('No missed notes.');
  }

  if (avgCentsOff > 0) {
    const biasNote = pitchBias ? ` (${pitchBias})` : '';
    lines.push(`Intonation: ${avgCentsOff} cents off on average${biasNote}`);
  }

  if (timingPct !== null) {
    lines.push(`Timing: ${timingPct}% of hits landed within 1 beat${missPattern ? '; misses ' + missPattern : ''}`);
  }

  const userMsg = lines.join('\n');

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system,
      messages: [{ role: 'user', content: userMsg }],
    });
    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    // Strip any em dashes the model might still produce
    const text = raw.replace(/—|–/g, '-').replace(/—|–/g, '-').trim();
    return NextResponse.json({ feedback: text });
  } catch {
    return NextResponse.json({ feedback: null }, { status: 500 });
  }
}
