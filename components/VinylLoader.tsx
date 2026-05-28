'use client';

interface Props {
  size?: number;
  label?: string;
  // Optional second label that fades in/out beneath the main label.
  // Used for the multi-stage "Reading the song -> Mapping to frets -> Tuning"
  // sequence while the AI generates a tab.
  ticker?: string[];
}

// Spinning vinyl record loader. Used during AI tab generation and AI Coach
// analysis. Brand-matching (accent color, monospaced label) and feels much
// more on-theme than a generic spinner.
export function VinylLoader({ size = 64, label, ticker }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const labelR = size * 0.16;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <style>{`
        @keyframes vinylGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(var(--accent-rgb), 0.3)); }
          50% { filter: drop-shadow(0 0 12px rgba(var(--accent-rgb), 0.6)); }
        }
        @keyframes tickerFade {
          0%, 100% { opacity: 0; transform: translateY(4px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          animation: 'spin 2s linear infinite, vinylGlow 2.4s ease-in-out infinite',
        }}
      >
        {/* outer rim -- vinyl body is a fixed dark disc in both themes */}
        <circle cx={cx} cy={cy} r={outerR} fill="var(--vinyl-body)" stroke="var(--accent)" strokeWidth="0.5" />
        {/* grooves */}
        <circle cx={cx} cy={cy} r={outerR * 0.88} fill="none" stroke="var(--vinyl-groove)" strokeWidth="0.5" />
        <circle cx={cx} cy={cy} r={outerR * 0.72} fill="none" stroke="var(--vinyl-groove)" strokeWidth="0.5" />
        <circle cx={cx} cy={cy} r={outerR * 0.55} fill="none" stroke="var(--vinyl-groove)" strokeWidth="0.5" />
        <circle cx={cx} cy={cy} r={outerR * 0.4} fill="none" stroke="var(--vinyl-groove)" strokeWidth="0.5" />
        {/* light reflection arc -- adds the sense of motion when spinning */}
        <path
          d={`M ${cx} ${cy - outerR * 0.92} A ${outerR * 0.92} ${outerR * 0.92} 0 0 1 ${cx + outerR * 0.92} ${cy}`}
          fill="none"
          stroke="var(--vinyl-shine)"
          strokeWidth="0.5"
        />
        {/* label */}
        <circle cx={cx} cy={cy} r={labelR} fill="var(--accent)" />
        {/* center hole */}
        <circle cx={cx} cy={cy} r={size * 0.025} fill="var(--vinyl-body)" />
      </svg>

      {label && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          {label}
        </span>
      )}

      {ticker && ticker.length > 0 && (
        <div style={{ height: 14, position: 'relative', width: 220, textAlign: 'center' }}>
          {ticker.map((t, i) => (
            <span
              key={t}
              style={{
                position: 'absolute',
                inset: 0,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                opacity: 0,
                animation: `tickerFade ${ticker.length * 2}s ease-in-out infinite`,
                animationDelay: `${i * 2}s`,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
