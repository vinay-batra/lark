'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { supabase } from '@/lib/supabase';

const LINKS = [
  { href: '/', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/changelog', label: 'Changelog' },
  { href: '/faq', label: 'FAQ' },
];

export function PublicNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const lastScrollRef = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auth state
  const [user, setUser] = useState<{ email: string; displayName: string | null; avatarUrl: string | null } | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) setUser({ email: u.email ?? '', displayName: u.user_metadata?.display_name ?? null, avatarUrl: u.user_metadata?.avatar_url ?? null });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;
      if (u) setUser({ email: u.email ?? '', displayName: u.user_metadata?.display_name ?? null, avatarUrl: u.user_metadata?.avatar_url ?? null });
      else setUser(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const prev = lastScrollRef.current;
      if (y > 80 && y > prev + 4) setHidden(true);
      else if (y < prev - 4 || y < 80) setHidden(false);
      lastScrollRef.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
  };

  const initial = user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?';
  const name = user?.displayName ?? user?.email?.split('@')[0] ?? '';

  return (
    <>
      <nav className={`public-nav ${hidden && !open ? 'hidden' : ''}`}>
        <div style={{
          height: '100%',
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: '0 28px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 24,
        }}>
          {/* Logo */}
          <div style={{ justifySelf: 'start' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              <img src="/lark-logo.png" alt="Lark" width={30} height={30} style={{ display: 'block' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 17, color: 'var(--text)', letterSpacing: '0.04em' }}>
                Lark
              </span>
            </Link>
          </div>

          {/* Center links */}
          <div className="nav-center" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} className={`nav-link ${pathname === l.href ? 'active' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right cluster */}
          <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: 8, justifySelf: 'end' }}>
            <ThemeToggle />

            {user ? (
              /* Signed-in: avatar + name + dropdown */
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--bg3)', border: '0.5px solid var(--border2)',
                    borderRadius: 9999, padding: '5px 12px 5px 5px',
                    cursor: 'pointer', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; }}
                >
                  <div style={{ width: 26, height: 26, borderRadius: '50%', overflow: 'hidden', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--bg)' }}>{initial}</span>
                    )}
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)', fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name}
                  </span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5" strokeLinecap="round" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--card-bg)', border: '0.5px solid var(--border2)',
                    borderRadius: 12, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                    overflow: 'hidden', zIndex: 200,
                  }}>
                    {[
                      { label: 'Go to Dashboard', href: '/app' },
                      { label: 'Settings', href: '/settings' },
                    ].map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'block', padding: '11px 16px',
                          fontSize: 13, color: 'var(--text)', textDecoration: 'none',
                          transition: 'background 0.12s',
                          fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ height: '0.5px', background: 'var(--border)' }} />
                    <button
                      onClick={signOut}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '11px 16px', fontSize: 13, color: 'var(--danger, #ef4444)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        transition: 'background 0.12s',
                        fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Signed-out: sign in + get started */
              <>
                <Link href="/auth?mode=signin" className="nav-link" style={{ display: 'inline-flex' }}>Sign in</Link>
                <Link href="/auth?mode=signup" className="btn btn-accent btn-sm" style={{ padding: '8px 18px' }}>Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile trigger */}
          <button
            className="nav-mobile-trigger"
            aria-label="Toggle menu"
            onClick={() => setOpen(v => !v)}
            style={{
              display: 'none', width: 38, height: 38,
              border: '1px solid var(--border)', borderRadius: 10,
              background: 'transparent', color: 'var(--text)',
              alignItems: 'center', justifyContent: 'center',
              justifySelf: 'end', gridColumn: '3 / 4',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div style={{
          position: 'fixed', inset: '64px 0 0 0',
          background: 'var(--bg)', zIndex: 99,
          padding: '24px 24px 48px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className={`nav-link ${pathname === l.href ? 'active' : ''}`}
              style={{ padding: '14px 14px', fontSize: 14, letterSpacing: '0.04em', textTransform: 'none' }}>
              {l.label}
            </Link>
          ))}
          <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
          {user ? (
            <>
              <Link href="/app" className="btn btn-accent" style={{ marginBottom: 8 }}>Go to Dashboard</Link>
              <Link href="/settings" className="btn btn-ghost">Settings</Link>
              <button onClick={signOut} className="btn btn-ghost" style={{ color: 'var(--danger, #ef4444)', marginTop: 8 }}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/auth?mode=signin" className="nav-link" style={{ padding: '14px', fontSize: 14, textTransform: 'none' }}>Sign in</Link>
              <Link href="/auth?mode=signup" className="btn btn-accent" style={{ marginTop: 10 }}>Get Started</Link>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 880px) {
          :global(.nav-center) { display: none !important; }
          :global(.nav-right) { display: none !important; }
          .nav-mobile-trigger { display: inline-flex !important; }
        }
      `}</style>
    </>
  );
}
