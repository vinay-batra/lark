import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Hard cap to prevent log spam / abuse: a real user only needs this once.
  if (!rateLimit(getClientIP(req), 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || (!serviceKey && !anonKey)) {
    return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
  }

  // Verify the token by getting the user with the anon client
  const anonClient = createClient(url, anonKey!, { auth: { persistSession: false } });
  const { data: { user }, error: userErr } = await anonClient.auth.getUser(token);
  if (userErr || !user) return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });

  if (!serviceKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your Vercel environment variables.' }, { status: 503 });
  }

  // Delete with admin client
  const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { error: deleteErr } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteErr) {
    console.error('[delete-account]', deleteErr.message);
    return NextResponse.json({ error: 'Could not delete account. Try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
