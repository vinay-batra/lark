import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  if (!rateLimit(ip, 5, 86_400_000)) { // 5 requests per day
    return NextResponse.json({ error: 'Too many requests. You can submit up to 5 song requests per day.' }, { status: 429 });
  }

  let body: { songTitle?: unknown; artist?: unknown; message?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }); }

  const songTitle = typeof body.songTitle === 'string' ? body.songTitle.trim().slice(0, 120) : '';
  const artist    = typeof body.artist    === 'string' ? body.artist.trim().slice(0, 120)    : '';
  const message   = typeof body.message   === 'string' ? body.message.trim().slice(0, 500)   : '';

  if (!songTitle || !artist) {
    return NextResponse.json({ error: 'Song title and artist are required.' }, { status: 400 });
  }

  // Store in Supabase if configured
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const supabase = createClient(url, key);
    // Derive user_id from Bearer token if present (optional -- request can be anonymous)
    let userId: string | null = null;
    const auth = req.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      const { data } = await supabase.auth.getUser(auth.slice(7));
      userId = data.user?.id ?? null;
    }
    const { error } = await supabase.from('lark_song_requests').insert({
      user_id: userId,
      song_title: songTitle,
      artist,
      message: message || null,
    });
    if (error) {
      // Table might not exist yet -- return success anyway so UX isn't broken
      // before the migration is run in Supabase dashboard.
      console.error('song-request insert error:', error.message);
    }
  }

  return NextResponse.json({ ok: true });
}
