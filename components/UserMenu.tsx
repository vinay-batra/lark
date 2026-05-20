'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

interface UserMenuProps {
  email: string | null;
  displayName: string | null;
  avatarUrl?: string | null;
  onSignOut: () => void;
  onReplayTour: () => void;
}

export function UserMenu({ email, displayName, avatarUrl, onSignOut, onReplayTour }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const name = displayName ?? email?.split('@')[0] ?? '?';
  const initial = name[0]?.toUpperCase() ?? '?';

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const menuItem = (label: string, onClick: () => void, danger = false) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', padding: '10px 16px',
        fontSize: 13, color: danger ? 'var(--danger)' : 'var(--text2)',
        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        fontFamily: 'inherit', transition: 'background 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <ThemeToggle />
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(v => !v)}
          title={name}
          style={{
            width: 32, height: 32, borderRadius: '50%', overflow: 'hidden',
            background: avatarUrl ? 'transparent' : (open ? 'var(--accent)' : 'var(--accent-dim)'),
            border: `1.5px solid ${open ? 'var(--accent)' : 'var(--accent-border)'}`,
            color: open ? '#061b0e' : 'var(--accent)',
            fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s', padding: 0,
          }}
          onMouseEnter={e => { if (!open) { e.currentTarget.style.borderColor = 'var(--accent)'; } }}
          onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = 'var(--accent-border)'; } }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            initial
          )}
        </button>

        {open && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: 210, background: 'var(--card-bg)',
            border: '0.5px solid var(--border2)', borderRadius: 12,
            boxShadow: '0 12px 40px rgba(0,0,0,0.4), 0 0 0 0.5px var(--border)',
            zIndex: 300, overflow: 'hidden',
          }}>
            {/* Identity */}
            <div style={{ padding: '12px 16px 10px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{initial}</span>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {name}
                </p>
                {email && <p style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>}
              </div>
            </div>

            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', fontSize: 13, color: 'var(--text2)', textDecoration: 'none', transition: 'background 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              Settings
            </Link>

            {menuItem('Replay Tour', () => { setOpen(false); onReplayTour(); })}

            <div style={{ height: '0.5px', background: 'var(--border)', margin: '2px 0' }} />

            {menuItem('Sign Out', () => { setOpen(false); onSignOut(); }, true)}
          </div>
        )}
      </div>
    </div>
  );
}
