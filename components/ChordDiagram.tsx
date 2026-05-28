import type { ChordVoicing } from '@/lib/chords-data';

interface ChordDiagramProps {
  voicing: ChordVoicing;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 80,
  md: 110,
  lg: 140,
};

// Relative dimensions (all based on diagram width)
const PADDING_LEFT_RATIO  = 0.14; // space for X/O symbols
const PADDING_RIGHT_RATIO = 0.10; // space for baseFret label
const PADDING_TOP_RATIO   = 0.14; // space for X/O above nut
const PADDING_BOT_RATIO   = 0.12; // space for string labels

const FRET_COUNT = 4; // visible frets in the window
const STRING_COUNT = 6;
const DIAGRAM_STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];

export function ChordDiagram({ voicing, name, size = 'md' }: ChordDiagramProps) {
  const totalWidth  = SIZE_MAP[size];
  // height = width * aspect so diagram stays proportional
  const totalHeight = Math.round(totalWidth * 1.25);

  const padL = Math.round(totalWidth  * PADDING_LEFT_RATIO);
  const padR = Math.round(totalWidth  * PADDING_RIGHT_RATIO);
  const padT = Math.round(totalHeight * PADDING_TOP_RATIO);
  const padB = Math.round(totalHeight * PADDING_BOT_RATIO);

  const gridW = totalWidth  - padL - padR;
  const gridH = totalHeight - padT - padB;

  const stringGap = gridW / (STRING_COUNT - 1);
  const fretGap   = gridH / FRET_COUNT;

  const baseFret = voicing.baseFret ?? 1;

  // Dot radius relative to string gap
  const dotR = Math.round(stringGap * 0.32);

  // Font sizes
  const xoFontSize   = Math.max(8,  Math.round(totalWidth * 0.095));
  const labelFont    = Math.max(6,  Math.round(totalWidth * 0.075));
  const baseFretFont = Math.max(7,  Math.round(totalWidth * 0.085));

  // Helper: x position for a string index (0=low E, 5=high e, left-to-right)
  const sx = (i: number) => padL + i * stringGap;

  // Helper: y position for a fret number relative to baseFret
  // fret 0 (open) is above the nut - not drawn as a dot
  // fret baseFret => row 0.5 (center of first cell), etc.
  const fy = (fret: number) => padT + (fret - baseFret + 0.5) * fretGap;

  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      aria-label={`${name} chord diagram`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* ── Nut or baseFret indicator ── */}
      {baseFret === 1 ? (
        // Thick nut line
        <line
          x1={padL}
          y1={padT}
          x2={padL + gridW}
          y2={padT}
          stroke="var(--text)"
          strokeWidth={Math.max(3, Math.round(totalWidth * 0.035))}
          strokeLinecap="round"
        />
      ) : (
        // Thin top border when scrolled up the neck
        <line
          x1={padL}
          y1={padT}
          x2={padL + gridW}
          y2={padT}
          stroke="var(--border2)"
          strokeWidth={1}
        />
      )}

      {/* ── Fret lines ── */}
      {Array.from({ length: FRET_COUNT + 1 }).map((_, fi) => {
        const y = padT + fi * fretGap;
        return (
          <line
            key={`fret-${fi}`}
            x1={padL}
            y1={y}
            x2={padL + gridW}
            y2={y}
            stroke="var(--border2)"
            strokeWidth={0.75}
          />
        );
      })}

      {/* ── String lines ── */}
      {Array.from({ length: STRING_COUNT }).map((_, si) => (
        <line
          key={`str-${si}`}
          x1={sx(si)}
          y1={padT}
          x2={sx(si)}
          y2={padT + gridH}
          stroke="var(--text3)"
          strokeWidth={0.75}
        />
      ))}

      {/* ── Barre line ── */}
      {voicing.barre && (() => {
        const b = voicing.barre;
        const barreY  = fy(b.fret);
        const barreX1 = sx(b.from);
        const barreX2 = sx(b.to);
        return (
          <line
            x1={barreX1}
            y1={barreY}
            x2={barreX2}
            y2={barreY}
            stroke="var(--accent)"
            strokeWidth={dotR * 2}
            strokeLinecap="round"
            opacity={0.9}
          />
        );
      })()}

      {/* ── Finger dots ── */}
      {voicing.frets.map((fret, si) => {
        if (fret <= 0) return null; // open or muted - handled separately
        // Skip if this exact position is covered by the barre line visually
        // (we still render it so isolated barre ends are marked)
        const y = fy(fret);
        const x = sx(si);
        const inView = fret >= baseFret && fret <= baseFret + FRET_COUNT - 1;
        if (!inView) return null;
        return (
          <circle
            key={`dot-${si}`}
            cx={x}
            cy={y}
            r={dotR}
            fill="var(--accent)"
          />
        );
      })}

      {/* ── X / O indicators above nut ── */}
      {voicing.frets.map((fret, si) => {
        const x = sx(si);
        const y = padT - xoFontSize * 0.3;
        if (fret === -1) {
          return (
            <text
              key={`mute-${si}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="auto"
              fontSize={xoFontSize}
              fontFamily="var(--font-mono)"
              fontWeight="700"
              fill="var(--text3)"
            >
              x
            </text>
          );
        }
        if (fret === 0) {
          return (
            <circle
              key={`open-${si}`}
              cx={x}
              cy={y - xoFontSize * 0.25}
              r={dotR * 0.75}
              fill="none"
              stroke="var(--text3)"
              strokeWidth={1.2}
            />
          );
        }
        return null;
      })}

      {/* ── String labels at bottom ── */}
      {DIAGRAM_STRING_LABELS.map((label, si) => (
        <text
          key={`label-${si}`}
          x={sx(si)}
          y={padT + gridH + padB * 0.72}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={labelFont}
          fontFamily="var(--font-mono)"
          fill="var(--text3)"
        >
          {label}
        </text>
      ))}

      {/* ── baseFret label (right side) ── */}
      {baseFret > 1 && (
        <text
          x={padL + gridW + padR * 0.5}
          y={padT + fretGap * 0.5}
          textAnchor="start"
          dominantBaseline="middle"
          fontSize={baseFretFont}
          fontFamily="var(--font-mono)"
          fontWeight="700"
          fill="var(--text2)"
        >
          {baseFret}
        </text>
      )}
    </svg>
  );
}
