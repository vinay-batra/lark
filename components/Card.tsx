'use client';

import { memo, useState } from 'react';

interface CardProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  trackColor?: string;
}

const BASE: React.CSSProperties = {
  border: '0.5px solid var(--border)',
  borderRadius: 14,
  padding: '22px 24px',
  background: 'var(--card-bg)',
  boxShadow: 'var(--shadow)',
};

export const Card = memo(function Card({ children, style = {}, trackColor }: CardProps) {
  const [hov, setHov] = useState(false);
  const cardStyle: React.CSSProperties = {
    ...BASE,
    ...style,
    borderLeft: trackColor
      ? `2px solid ${trackColor}`
      : hov
      ? '2px solid rgba(34,197,94,0.45)'
      : '0.5px solid var(--border)',
    boxShadow: hov ? 'var(--shadow-md)' : 'var(--shadow)',
    transition: 'border-left 0.15s, box-shadow 0.15s',
  };
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={cardStyle}
    >
      {children}
    </div>
  );
});

interface CardHeaderProps {
  eyebrow?: string;
  title: string;
}

export function CardHeader({ eyebrow, title }: CardHeaderProps) {
  return (
    <div style={{ marginBottom: 18 }}>
      {eyebrow && (
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.22em',
          color: 'var(--accent)',
          textTransform: 'uppercase',
          fontWeight: 700,
          marginBottom: 6,
        }}>
          {eyebrow}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 3, height: 14, background: 'var(--accent)', borderRadius: 1, flexShrink: 0 }} />
        <h2 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.2px',
        }}>
          {title}
        </h2>
      </div>
    </div>
  );
}
