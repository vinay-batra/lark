// Generates a 1200x630 shareable score card on an off-screen Canvas element.
// Uses Space Mono if it is loaded in the document, falls back to Courier New.
// Returns a Blob (PNG) ready for Web Share API or <a download>.

export interface ShareCardParams {
  songTitle: string;
  artist: string;
  accuracy: number;   // 0-100
  hits: number;
  total: number;
  bpm: number;
  timingPct: number | null;  // % of hits that were on-beat
}

const W = 1200;
const H = 630;

function mono(size: number, bold = false) {
  return `${bold ? '700' : '400'} ${size}px "Space Mono","Courier New",monospace`;
}

function scoreColor(accuracy: number): string {
  if (accuracy >= 80) return '#22c55e';
  if (accuracy >= 50) return '#f59e0b';
  return '#ef4444';
}

export async function generateShareCard(params: ShareCardParams): Promise<Blob> {
  const { songTitle, artist, accuracy, hits, total, bpm, timingPct } = params;

  // Wait for web fonts so Space Mono is available in canvas context.
  if (typeof document !== 'undefined') {
    await document.fonts.ready;
  }

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── Background ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#080c14';
  ctx.fillRect(0, 0, W, H);

  // Subtle green radial glow (top-left)
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 600);
  glow.addColorStop(0, 'rgba(34,197,94,0.10)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Second glow (bottom-right)
  const glow2 = ctx.createRadialGradient(W, H, 0, W, H, 500);
  glow2.addColorStop(0, 'rgba(34,197,94,0.06)');
  glow2.addColorStop(1, 'transparent');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // ── Left accent bar ─────────────────────────────────────────────────────────
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(0, 0, 5, H);

  // ── Top-left: branding ──────────────────────────────────────────────────────
  ctx.font = mono(22, true);
  ctx.fillStyle = '#e2e8d0';
  ctx.textAlign = 'left';
  ctx.fillText('LARK', 40, 52);

  ctx.font = mono(13);
  ctx.fillStyle = '#22c55e';
  ctx.fillText('lark.coach', 40, 74);

  // ── Center: song info + score ───────────────────────────────────────────────
  ctx.textAlign = 'center';
  const cx = W / 2;

  // Eyebrow
  ctx.font = mono(11);
  ctx.fillStyle = '#22c55e';
  ctx.fillText('I  J U S T  P L A Y E D', cx, H / 2 - 130);

  // Song title (auto-scale for long titles)
  const titleFontSize = songTitle.length > 24 ? 32 : songTitle.length > 18 ? 38 : 46;
  ctx.font = mono(titleFontSize, true);
  ctx.fillStyle = '#e2e8d0';
  ctx.fillText(songTitle, cx, H / 2 - 72);

  // Artist
  ctx.font = mono(17);
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(artist, cx, H / 2 - 38);

  // ── Big score number ────────────────────────────────────────────────────────
  ctx.font = mono(108, true);
  ctx.fillStyle = scoreColor(accuracy);
  ctx.fillText(`${accuracy}%`, cx, H / 2 + 70);

  // ── Sub-stats ───────────────────────────────────────────────────────────────
  ctx.font = mono(14);
  ctx.fillStyle = '#64748b';
  ctx.fillText(`${hits} of ${total} notes correct  |  ${bpm} BPM`, cx, H / 2 + 104);

  if (timingPct !== null) {
    ctx.fillText(`${timingPct}% on the beat`, cx, H / 2 + 126);
  }

  // ── Bottom thin line + tagline ──────────────────────────────────────────────
  ctx.fillStyle = 'rgba(34,197,94,0.2)';
  ctx.fillRect(40, H - 58, W - 80, 1);

  ctx.font = mono(12);
  ctx.fillStyle = '#22c55e';
  ctx.textAlign = 'right';
  ctx.fillText('lark.coach -- the guitar tutor that listens', W - 40, H - 30);

  // ── Return as PNG blob ──────────────────────────────────────────────────────
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/png'
    );
  });
}

/** Share or download a score card. Returns 'shared', 'downloaded', or 'error'. */
export async function shareScore(params: ShareCardParams): Promise<'shared' | 'downloaded' | 'error'> {
  try {
    const blob = await generateShareCard(params);
    const fileName = `lark-${params.accuracy}pct.png`;

    // Web Share API (mobile + modern desktop)
    if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [new File([blob], fileName, { type: 'image/png' })] })) {
      await navigator.share({
        title: `I played ${params.songTitle} on Lark`,
        text: `Hit ${params.accuracy}% accuracy on "${params.songTitle}" by ${params.artist}. Practice at lark.coach`,
        files: [new File([blob], fileName, { type: 'image/png' })],
      });
      return 'shared';
    }

    // Fallback: download the image
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return 'downloaded';
  } catch {
    return 'error';
  }
}
