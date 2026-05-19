import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

interface SessionEvent {
  expected: string;
  hit: boolean;
  centsOff: number | null;
}

interface CoachRequest {
  song: string;
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

  const { song, events, totalNotes, hits }: CoachRequest = await req.json();
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

  const system = `You are Lark, an AI guitar tutor. Give specific, actionable feedback on the student's practice session. Be encouraging but honest. Use guitar-specific language. Keep it under 120 words. Write 2-3 short conversational sentences -- no bullet points. Address intonation, missed notes, and one concrete tip. Never use em dashes.`;

  const userMsg = `Song: "${song}"
Accuracy: ${accuracy}% (${hits}/${totalNotes} notes hit)
Notes most missed: ${missedSummary}${avgCentsOff > 0 ? `\nAverage intonation offset on hits: ${avgCentsOff} cents` : ''}`;

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system,
      messages: [{ role: 'user', content: userMsg }],
    });
    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    const text = raw.replace(/—/g, '-').replace(/–/g, '-');
    return NextResponse.json({ feedback: text });
  } catch {
    return NextResponse.json({ feedback: null }, { status: 500 });
  }
}
