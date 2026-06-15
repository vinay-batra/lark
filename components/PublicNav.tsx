'use client';

import Link from 'next/link';
import Image from 'next/image';
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

const ArrowRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

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
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const u = data.user;
      if (u) setUser({ email: u.email ?? '', displayName: u.user_metadata?.display_name ?? null, avatarUrl: u.user_metadata?.avatar_url ?? null });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;
      if (u) setUser({ email: u.email ?? '', displayName: u.user_metadata?.display_name ?? null, avatarUrl: u.user_metadata?.avatar_url ?? null });
      else setUser(null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  // Close dropdown on outside click or Esc. iOS Safari's tap doesn't always
  // fire `mousedown`, so we also listen on `touchstart`. Esc gives keyboard
  // users an escape hatch.
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, [dropdownOpen]);

  // Esc closes the mobile drawer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

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

  // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <nav className={`ed-nav ${hidden && !open ? 'hidden' : ''}`}>
        <div className="ed-nav-inner">
          {/* Left: wordmark + account (signed in) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              <Image src="/lark-logo.png" alt="Lark" width={28} height={28} style={{ display: 'block' }} priority />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, color: 'var(--text)', letterSpacing: '0.06em' }}>Lark</span>
            </Link>

            {user && (
              <div ref={dropdownRef} className="ed-nav-acct" style={{ position: 'relative' }}>
                <button className="ed-avatar-btn" onClick={() => setDropdownOpen(v => !v)} aria-haspopup="menu" aria-expanded={dropdownOpen} aria-label="Account menu">
                  <span className="ed-avatar">
                    {user?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image adds no value
                      <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--on-accent)' }}>{initial}</span>
                    )}
                  </span>
                  <span className="ed-avatar-name">{name}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5" strokeLinecap="round" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="ed-menu" role="menu" style={{ left: 0, right: 'auto' }}>
                    {[{ label: 'Go to app', href: '/app' }, { label: 'Settings', href: '/settings' }].map(item => (
                      <Link key={item.href} href={item.href} role="menuitem" className="ed-menu-item" onClick={() => setDropdownOpen(false)}>
                        {item.label}
                        <ArrowRight size={13} />
                      </Link>
                    ))}
                    <button onClick={signOut} role="menuitem" className="ed-menu-item danger">Sign out</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop cluster */}
          <div className="ed-nav-desktop">
            <div className="ed-nav-links">
              {LINKS.map(l => (
                <Link key={l.href} href={l.href} className={`ed-nav-link ${pathname === l.href ? 'active' : ''}`}>
                  {l.label}
                </Link>
              ))}
            </div>

            <span className="ed-nav-sep" />
            <ThemeToggle />

            {!user && (
              <>
                <Link href="/auth?mode=signin" className="ed-nav-link">Sign in</Link>
                <Link href="/auth?mode=signup" className="ed-nav-cta">
                  Start playing
                  <ArrowRight />
                </Link>
              </>
            )}
          </div>

          {/* Mobile trigger */}
          <button
            className="ed-nav-trigger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="public-nav-mobile"
            onClick={() => setOpen(v => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open
                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div
          id="public-nav-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          style={{ position: 'fixed', inset: '56px 0 0 0', background: 'var(--bg)', zIndex: 99, padding: '24px 24px 48px', display: 'flex', flexDirection: 'column' }}
        >
          {LINKS.map((l, i) => (
            <Link key={l.href} href={l.href} className={`ed-nav-link ${pathname === l.href ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'baseline', gap: 14, padding: '16px 0', borderBottom: '0.5px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{String(i + 1).padStart(2, '0')}</span>
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'flex-start' }}>
            {user ? (
              <>
                <Link href="/app" className="ed-nav-cta">Go to app<ArrowRight /></Link>
                <Link href="/settings" className="ed-nav-link">Settings</Link>
                <button onClick={signOut} className="ed-nav-link danger" style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
              </>
            ) : (
              <>
                <Link href="/auth?mode=signin" className="ed-nav-link">Sign in</Link>
                <Link href="/auth?mode=signup" className="ed-nav-cta">Start playing<ArrowRight /></Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
