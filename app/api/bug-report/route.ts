import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let body: { message: string; pageUrl?: string; userId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { message, pageUrl, userId } = body;
  if (!message?.trim() || message.length > 5000) {
    return NextResponse.json({ error: 'Invalid message.' }, { status: 400 });
  }

  // Use service role key if available (bypasses RLS entirely),
  // otherwise fall back to anon key
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.from('lark_bug_reports').insert({
    message: message.trim(),
    user_id: userId ?? null,
    page_url: pageUrl ?? null,
  });

  if (error) {
    console.error('[bug-report]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
