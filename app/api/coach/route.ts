import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

interface SessionEvent {
  expected: string;
  hit: boolean;
  centsOff: number | null;
  timingMs?: number | null;
}

interface CoachRequest {
  song: string;
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

  const { song, bpm, events, totalNotes, hits } = body;

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

  const missedNotes = events.filter(e => !e.hit).map(e => e.expected);
  const noteCounts: Record<string, number> = {};
  for (const note of missedNotes) {
    noteCounts[note] = (noteCounts[note] ?? 0) + 1;
  }
  const topMissed = Object.entries(noteCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const missedSummary = topMissed.length > 0
    ? topMissed.map(([note, count]) => `${note} (missed ${count}x)`).join(', ')
    : 'none';

  const hitEvents = events.filter(e => e.hit && e.centsOff !== null);
  const avgCentsOff = hitEvents.length > 0
    ? Math.round(hitEvents.reduce((sum, e) => sum + Math.abs(e.centsOff!), 0) / hitEvents.length)
    : 0;

  // Validate BPM: a client-supplied 0, negative, or non-finite value would
  // make beatMs = Infinity / NaN and the resulting prompt nonsensical.
  const validBpm = typeof bpm === 'number' && Number.isFinite(bpm) && bpm > 0 && bpm < 400 ? bpm : null;
  const beatMs = validBpm ? 60000 / validBpm : null;
  const onTimeHits = beatMs != null
    ? events.filter(e => e.hit && e.timingMs != null && e.timingMs! <= beatMs).length
    : null;
  const timingPct = onTimeHits != null && hits > 0 ? Math.round((onTimeHits / hits) * 100) : null;

  const system = `You are Lark, an AI guitar tutor. Give specific, actionable feedback on the student's practice session. Be encouraging but honest. Use guitar-specific language. Keep it under 120 words. Write 2-3 short conversational sentences -- no bullet points. Address intonation, missed notes, and one concrete tip. Never use em dashes.`;

  const timingLine = timingPct != null
    ? `\nRhythm: ${timingPct}% of hit notes played within 1 beat${validBpm ? ` at ${validBpm} BPM` : ''}`
    : '';
  const userMsg = `Song: "${song}"
Accuracy: ${accuracy}% (${hits}/${totalNotes} notes hit)
Notes most missed: ${missedSummary}${avgCentsOff > 0 ? `\nAverage intonation offset on hits: ${avgCentsOff} cents` : ''}${timingLine}`;

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 200,
      system,
      messages: [{ role: 'user', content: userMsg }],
    });
    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    const text = raw.replace(/—/g, '-').replace(/–/g, '-').trim();
    return NextResponse.json({ feedback: text });
  } catch {
    return NextResponse.json({ feedback: null }, { status: 500 });
  }
}
