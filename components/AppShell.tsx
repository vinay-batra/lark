'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ThemeToggle } from './ThemeToggle';

interface UserState {
  email: string | null;
  signedIn: boolean;
}

const NAV = [
  { href: '/app', label: 'Home',
    icon: <path d="M3 12L12 3l9 9M5 10v10h14V10"/> },
  { href: '/app/tuner', label: 'Tuner',
    icon: <path d="M2 12h3l3-9 4 18 3-9 3 5 4-5"/> },
  { href: '/app/chords', label: 'Chords',
    icon: <><rect x="3" y="6" width="18" height="12" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="8" y1="6" x2="8" y2="18"/><line x1="14" y1="6" x2="14" y2="18"/></> },
  { href: '/app/settings', label: 'Settings',
    icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></> },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserState>({ email: null, signedIn: false });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (isSupabaseConfigured && !data.user) {
        router.push('/auth?mode=signin');
        return;
      }
      setUser({ email: data.user?.email ?? null, signedIn: !!data.user });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser({ email: session?.user?.email ?? null, signedIn: !!session?.user });
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => { setMobileNavOpen(false); }, [pathname]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'grid',
      gridTemplateColumns: '240px 1fr',
    }} className="app-shell">

      {/* Sidebar */}
      <aside style={{
        background: 'var(--bg2)',
        borderRight: '0.5px solid var(--border)',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }} className="app-sidebar">
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '8px 12px',
          marginBottom: 22,
        }}>
          <img src="/lark-logo.png" alt="Lark" width={28} height={28} style={{ display: 'block' }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 17,
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '0.04em',
          }}>
            Lark
          </span>
        </Link>

        <p className="eyebrow" style={{ padding: '6px 12px', fontSize: 9, marginBottom: 4, opacity: 0.7 }}>
          MENU
        </p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '0.04em',
                  color: active ? 'var(--accent)' : 'var(--text2)',
                  background: active ? 'var(--accent-dim)' : 'transparent',
                  borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg3)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon}
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            padding: '12px 14px',
            background: 'var(--card-bg)',
            border: '0.5px solid var(--border)',
            borderRadius: 10,
          }}>
            <p className="eyebrow" style={{ fontSize: 8, marginBottom: 6 }}>
              {user.signedIn ? 'SIGNED IN AS' : 'GUEST'}
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text2)',
              wordBreak: 'break-all',
              marginBottom: user.signedIn ? 10 : 0,
            }}>
              {user.email ?? 'Not signed in'}
            </p>
            {user.signedIn ? (
              <button onClick={signOut} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text3)',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                letterSpacing: '0.08em',
              }}>
                SIGN OUT
              </button>
            ) : (
              <Link href="/auth?mode=signin" className="btn btn-accent btn-sm" style={{ width: '100%' }}>
                SIGN IN
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          height: 56,
          borderBottom: '0.5px solid var(--border)',
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(14px)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="mobile-nav-trigger"
              style={{
                display: 'none',
                width: 36, height: 36, borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: '0.12em' }}>
              {(NAV.find(n => n.href === pathname)?.label ?? 'App').toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px 28px 64px', minWidth: 0 }}>
          {children}
        </main>
      </div>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 260,
              background: 'var(--bg2)',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <Link href="/" onClick={() => setMobileNavOpen(false)} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '8px 12px',
              marginBottom: 14,
            }}>
              <img src="/lark-logo.png" alt="Lark" width={28} height={28} style={{ display: 'block' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.04em' }}>Lark</span>
            </Link>
            {NAV.map(item => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: 8,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    color: active ? 'var(--accent)' : 'var(--text2)',
                    background: active ? 'var(--accent-dim)' : 'transparent',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon}
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 880px) {
          .app-shell { grid-template-columns: 1fr !important; }
          .app-sidebar { display: none !important; }
          .mobile-nav-trigger { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}
