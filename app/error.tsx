'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // silent
  }, [error]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', background: 'var(--bg)' }}>
      <p className="eyebrow" style={{ marginBottom: 18, color: 'var(--danger)' }}>SOMETHING WENT WRONG</p>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 16, maxWidth: 520 }}>
        A string snapped.
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text3)', lineHeight: 1.6, maxWidth: 420, marginBottom: 30 }}>
        Lark hit an unexpected error. Try again, and if it keeps happening let us know.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={reset} className="btn btn-accent btn-lg">TRY AGAIN</button>
        <Link href="/" className="btn btn-outline btn-lg">GO HOME</Link>
      </div>
    </main>
  );
}
