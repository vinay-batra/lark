import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

const MAX_MESSAGE_LEN = 2000;
const MAX_PAGE_URL_LEN = 500;

export async function POST(req: NextRequest) {
  // Anonymous-friendly endpoint (signed-in or not), so rate-limit by IP.
  if (!rateLimit(getClientIP(req), 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many reports. Try again later.' }, { status: 429 });
  }

  let body: { message?: unknown; pageUrl?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { message, pageUrl } = body;

  if (typeof message !== 'string' || !message.trim() || message.length > MAX_MESSAGE_LEN) {
    return NextResponse.json({ error: 'Invalid message.' }, { status: 400 });
  }
  if (pageUrl !== undefined && pageUrl !== null) {
    if (typeof pageUrl !== 'string' || pageUrl.length > MAX_PAGE_URL_LEN) {
      return NextResponse.json({ error: 'Invalid page URL.' }, { status: 400 });
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = serviceKey ?? anonKey;

  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
  }

  // Derive userId from the auth token (NEVER trust a userId in the body, which
  // would let any anonymous caller impersonate any user). If no token, the bug
  // is filed anonymously.
  let userId: string | null = null;
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (token && anonKey) {
    const anonClient = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: { user } } = await anonClient.auth.getUser(token);
    if (user) userId = user.id;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from('lark_bug_reports').insert({
    message: message.trim().slice(0, MAX_MESSAGE_LEN),
    user_id: userId,
    page_url: typeof pageUrl === 'string' ? pageUrl.slice(0, MAX_PAGE_URL_LEN) : null,
  });

  if (error) {
    // Never leak Supabase error details (column names, RLS policy hints, table
    // existence) to the caller.
    // silent
    return NextResponse.json({ error: 'Could not submit.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
