import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

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

  const { messages }: ChatRequest = await req.json();

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
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
