'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';

const TOOLS: { id: 'tuner' | 'chords'; label: string; href: string }[] = [
  { id: 'tuner', label: 'Tuner', href: '/tuner' },
  { id: 'chords', label: 'Chords', href: '/chords' },
];

export function ToolNav({ active }: { active: 'tuner' | 'chords' }) {
  return (
    <nav style={{
      height: 56,
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      borderBottom: '0.5px solid var(--border)',
      gap: 12,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Image src="/lark-logo.png" alt="Lark" width={26} height={26} style={{ display: 'block' }} priority />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.04em' }}>Lark</span>
      </Link>

      <div style={{
        marginLeft: 16,
        display: 'flex',
        gap: 4,
        padding: 4,
        background: 'var(--bg3)',
        borderRadius: 10,
        border: '0.5px solid var(--border)',
      }}>
        {TOOLS.map(t => (
          <Link
            key={t.id}
            href={t.href}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: active === t.id ? 'var(--accent)' : 'transparent',
              color: active === t.id ? 'var(--on-accent)' : 'var(--text2)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.12em',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {t.label.toUpperCase()}
          </Link>
        ))}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/app" className="nav-link" style={{ padding: '8px 12px', fontSize: 11 }}>
          App
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
