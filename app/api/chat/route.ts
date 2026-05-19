import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Chat not configured.' }, { status: 503 });
  }

  if (!rateLimit(getClientIP(req), 30, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please wait before sending more messages.' }, { status: 429 });
  }

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { messages } = body;

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return NextResponse.json({ error: 'Invalid messages.' }, { status: 400 });
  }
  for (const msg of messages) {
    if (!msg || (msg.role !== 'user' && msg.role !== 'assistant')) {
      return NextResponse.json({ error: 'Invalid message role.' }, { status: 400 });
    }
    if (typeof msg.content !== 'string' || msg.content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json({ error: 'Message too long.' }, { status: 400 });
    }
  }

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system:
        'You are Lark, an AI guitar tutor. Answer guitar questions: chords, scales, technique, music theory, songs, practice tips. Keep answers under 120 words. Be specific and practical. No bullet points. No em dashes. No asterisks.',
      messages,
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    const text = raw.replace(/—/g, '-').replace(/–/g, '-');
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
