'use client';

import { Song, DIFFICULTY_COLORS } from '@/lib/songs';

// Deterministic hash so the same song always gets the same cover.
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

interface Props {
  song: Pick<Song, 'id' | 'title' | 'artist' | 'difficulty'>;
  size?: number;
}

// Two cover styles, picked by hash for variety. Both share the same
// difficulty color so the visual taxonomy stays consistent.
//   0 = vinyl-record style (concentric rings + label)
//   1 = cassette-style (two reels + tape window)
export function SongCover({ song, size = 56 }: Props) {
  const h = hash(song.id || song.title);
  const variant = h % 2;
  const accent = DIFFICULTY_COLORS[song.difficulty];
  const angle = (h % 360);
  const initials = getInitials(song.title);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size / 8),
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        background: `linear-gradient(${angle}deg, ${accent}33, var(--bg3) 60%)`,
        border: `0.5px solid ${accent}55`,
      }}
      aria-hidden
    >
      {variant === 0 ? <VinylVariant size={size} accent={accent} initials={initials} /> : <CassetteVariant size={size} accent={accent} initials={initials} />}
    </div>
  );
}

function VinylVariant({ size, accent, initials }: { size: number; accent: string; initials: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.42;
  const labelR = size * 0.16;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0 }}>
      {/* record body */}
      <circle cx={cx} cy={cy} r={outerR} fill="var(--bg)" stroke={`${accent}88`} strokeWidth="0.5" />
      {/* grooves */}
      <circle cx={cx} cy={cy} r={outerR * 0.85} fill="none" stroke={`${accent}33`} strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r={outerR * 0.65} fill="none" stroke={`${accent}33`} strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r={outerR * 0.45} fill="none" stroke={`${accent}33`} strokeWidth="0.5" />
      {/* label */}
      <circle cx={cx} cy={cy} r={labelR} fill={accent} />
      <circle cx={cx} cy={cy} r={size * 0.025} fill="var(--bg)" />
      {/* initials in upper-right */}
      <text
        x={size * 0.86}
        y={size * 0.22}
        fontFamily="var(--font-mono), monospace"
        fontSize={size * 0.13}
        fontWeight="700"
        fill={accent}
        textAnchor="end"
        letterSpacing="0.05em"
      >
        {initials}
      </text>
    </svg>
  );
}

function CassetteVariant({ size, accent, initials }: { size: number; accent: string; initials: string }) {
  const reelR = size * 0.13;
  const leftCx = size * 0.32;
  const rightCx = size * 0.68;
  const cy = size * 0.5;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0 }}>
      {/* tape window background */}
      <rect x={size * 0.18} y={size * 0.34} width={size * 0.64} height={size * 0.32} rx={size * 0.04} fill="var(--bg)" stroke={`${accent}55`} strokeWidth="0.5" />
      {/* reels */}
      <circle cx={leftCx} cy={cy} r={reelR} fill="none" stroke={accent} strokeWidth="1" />
      <circle cx={leftCx} cy={cy} r={reelR * 0.4} fill={accent} />
      <circle cx={rightCx} cy={cy} r={reelR} fill="none" stroke={accent} strokeWidth="1" />
      <circle cx={rightCx} cy={cy} r={reelR * 0.4} fill={accent} />
      {/* tape line */}
      <line x1={leftCx + reelR} y1={cy} x2={rightCx - reelR} y2={cy} stroke={`${accent}66`} strokeWidth="0.5" />
      {/* initials top-left */}
      <text
        x={size * 0.12}
        y={size * 0.22}
        fontFamily="var(--font-mono), monospace"
        fontSize={size * 0.13}
        fontWeight="700"
        fill={accent}
        letterSpacing="0.05em"
      >
        {initials}
      </text>
    </svg>
  );
}

function getInitials(title: string): string {
  const cleaned = title.replace(/[^a-zA-Z\s]/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(w => w.length > 0 && !['the', 'of', 'a', 'an', 'and'].includes(w.toLowerCase()));
  if (words.length === 0) return title.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
