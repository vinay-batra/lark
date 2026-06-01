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
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg3)', border: `0.5px solid ${open ? 'var(--accent-border)' : 'var(--border2)'}`,
            borderRadius: 9999, padding: '4px 10px 4px 4px',
            cursor: 'pointer', transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = open ? 'var(--accent-border)' : 'var(--border2)'; }}
        >
          {/* Avatar circle */}
          <div style={{ width: 26, height: 26, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image adds no value
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{initial}</span>
            )}
          </div>
          {/* Display name */}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: 210, background: 'var(--card-bg)',
            border: '0.5px solid var(--border2)', borderRadius: 12,
            boxShadow: 'var(--shadow-md)',
            zIndex: 300, overflow: 'hidden',
          }}>
            {/* Identity */}
            <div style={{ padding: '12px 16px 10px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image adds no value
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
