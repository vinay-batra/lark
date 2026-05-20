/**
 * Songsterr metadata client.
 *
 * The Songsterr search API is public and returns accurate song metadata
 * (title, artist, guitar track names, tuning, difficulty). The actual Guitar
 * Pro tab files are served via signed CloudFront URLs that require a logged-in
 * session -- we can't access them without auth.
 *
 * What we use this for:
 *   - Confirming the song exists and resolving the exact title/artist
 *   - Getting guitar track context (lead vs rhythm, instrument type)
 *   - Detecting non-standard tuning (drop D, etc.)
 *   - Providing that verified context to Claude for better note generation
 *
 * When Songsterr has a commercial API tier or the tab files become accessible,
 * swap in the full GP parsing pipeline from the commented-out section below.
 */

const SEARCH_TIMEOUT_MS = 6_000;

// OPEN_MIDI for standard guitar tuning: e=64 B=59 G=55 D=50 A=45 E=40
const STANDARD_TUNING = [64, 59, 55, 50, 45, 40];

// Guitar instrument IDs used by Songsterr (instrumentId field)
const GUITAR_INSTRUMENT_IDS = new Set([
  25, 26, 27, 28, 29, 30, // various guitar types
  31, 32,                  // nylon, acoustic
]);

export interface SongsterrTrack {
  instrumentId: number;
  instrument: string;
  name: string;
  views: number;
  tuning?: number[];
  difficulty?: number;
  hash: string;
}

export interface SongsterrSong {
  songId: number;
  title: string;
  artist: string;
  tracks: SongsterrTrack[];
  popularTrackGuitar?: number;
  defaultTrack?: number;
}

export interface SongsterrMeta {
  /** Canonical song title from Songsterr */
  title: string;
  /** Canonical artist name from Songsterr */
  artist: string;
  /** Guitar track name (e.g., "Kirk Hammett | Lead Guitar") — gives Claude context */
  trackName: string;
  /** True if the guitar track uses non-standard tuning */
  nonStandardTuning: boolean;
  /** Tuning description if non-standard, e.g. "Drop D" */
  tuningHint: string;
}

/**
 * Search Songsterr and return enriched metadata for the top guitar match.
 * Returns null if the song isn't found or the request fails.
 */
export async function getSongsterrMeta(query: string): Promise<SongsterrMeta | null> {
  try {
    const url = `https://www.songsterr.com/api/songs?search=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; lark.coach/1.0)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const songs: SongsterrSong[] = await res.json();
    if (!Array.isArray(songs) || songs.length === 0) return null;

    const song = songs[0];
    if (!song?.songId) return null;

    // Find the best guitar track
    const guitarTrack = pickGuitarTrack(song);

    const tuning = guitarTrack?.tuning ?? STANDARD_TUNING;
    const nonStandardTuning = !isStandardTuning(tuning);
    const tuningHint = nonStandardTuning ? describeTuning(tuning) : '';

    return {
      title: song.title,
      artist: song.artist,
      trackName: guitarTrack?.name ?? '',
      nonStandardTuning,
      tuningHint,
    };
  } catch {
    return null;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function pickGuitarTrack(song: SongsterrSong): SongsterrTrack | null {
  const tracks = song.tracks ?? [];
  if (tracks.length === 0) return null;

  // Use popularTrackGuitar index if available
  const popularIdx = song.popularTrackGuitar ?? song.defaultTrack;
  if (popularIdx != null && tracks[popularIdx]) {
    const t = tracks[popularIdx];
    if (GUITAR_INSTRUMENT_IDS.has(t.instrumentId)) return t;
  }

  // Otherwise pick by views among guitar tracks
  const guitarTracks = tracks.filter(t => GUITAR_INSTRUMENT_IDS.has(t.instrumentId));
  if (guitarTracks.length > 0) {
    return guitarTracks.sort((a, b) => (b.views ?? 0) - (a.views ?? 0))[0];
  }

  // Fall back to any non-drum, non-bass track
  const nonBass = tracks.filter(t => t.instrumentId !== 1024 && t.instrumentId !== 33 && t.instrumentId !== 34);
  if (nonBass.length > 0) return nonBass[0];

  return tracks[0];
}

function isStandardTuning(tuning: number[]): boolean {
  if (tuning.length !== STANDARD_TUNING.length) return false;
  return tuning.every((v, i) => v === STANDARD_TUNING[i]);
}

function describeTuning(tuning: number[]): string {
  // Drop D: low string is D (38) instead of E (40)
  if (tuning.length === 6 && tuning[5] === 38 && tuning.slice(0, 5).every((v, i) => v === STANDARD_TUNING[i])) {
    return 'Drop D tuning (low string dropped to D)';
  }
  // Half-step down: all strings down 1 semitone
  if (tuning.length === 6 && tuning.every((v, i) => v === STANDARD_TUNING[i] - 1)) {
    return 'Half-step down tuning (Eb Ab Db Gb Bb Eb)';
  }
  // Full-step down
  if (tuning.length === 6 && tuning.every((v, i) => v === STANDARD_TUNING[i] - 2)) {
    return 'Full-step down tuning (D G C F A D)';
  }
  // Drop C
  if (tuning.length === 6 && tuning[5] === 36 && tuning.slice(0, 5).every((v, i) => v === STANDARD_TUNING[i] - 2)) {
    return 'Drop C tuning';
  }
  return 'Non-standard tuning';
}
