'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // silent
  }, [error]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
      <p className="eyebrow" style={{ marginBottom: 18, color: 'var(--danger)' }}>SOMETHING WENT WRONG</p>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 14, maxWidth: 460 }}>
        This page hit a wrong note.
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.6, maxWidth: 400, marginBottom: 26 }}>
        Something broke while loading this view. Try again or head back to your dashboard.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={reset} className="btn btn-accent">TRY AGAIN</button>
        <Link href="/app" className="btn btn-outline">BACK TO DASHBOARD</Link>
      </div>
    </div>
  );
}
