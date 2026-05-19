'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserMenu } from './UserMenu';
import { OnboardingTour, TOUR_KEY } from './OnboardingTour';
import { loadSessionsFromSupabase, loadSavedSongsFromSupabase } from '@/lib/practice';

const NAV = [
  { href: '/app',              label: 'Home',       tourId: '',               icon: <path d="M3 12L12 3l9 9M5 10v10h14V10"/> },
  { href: '/app/tuner',        label: 'Tuner',      tourId: '',               icon: <path d="M2 12h3l3-9 4 18 3-9 3 5 4-5"/> },
  { href: '/app/chords',       label: 'Chords',     tourId: '',               icon: <><rect x="3" y="6" width="18" height="12" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="8" y1="6" x2="8" y2="18"/><line x1="14" y1="6" x2="14" y2="18"/></> },
  { href: '/app/songs',        label: 'Songs',      tourId: 'tour-songs',     icon: <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></> },
  { href: '/app/chord-library',label: 'Chord Book', tourId: 'tour-chord-book',icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></> },
  { href: '/app/metronome',    label: 'Metronome',  tourId: 'tour-metronome', icon: <><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></> },
  { href: '/app/settings',     label: 'Settings',   tourId: '',               icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></> },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (isSupabaseConfigured && !u) { router.push('/auth?mode=signin'); return; }
      setEmail(u?.email ?? null);
      setDisplayName(u?.user_metadata?.display_name ?? null);
      setSignedIn(!!u);
      if (u) {
        loadSessionsFromSupabase();
        loadSavedSongsFromSupabase();
        // Show tour on first login
        if (!localStorage.getItem(TOUR_KEY)) {
          setTimeout(() => setShowTour(true), 800);
        }
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      setEmail(u?.email ?? null);
      setDisplayName(u?.user_metadata?.display_name ?? null);
      setSignedIn(!!u);
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  useEffect(() => { setMobileNavOpen(false); }, [pathname]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleTourDone = () => {
    setShowTour(false);
    localStorage.setItem(TOUR_KEY, '1');
  };

  const replayTour = () => {
    localStorage.removeItem(TOUR_KEY);
    setShowTour(true);
  };

  return (
    <>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'grid', gridTemplateColumns: '240px 1fr' }} className="app-shell">

        {/* Sidebar */}
        <aside style={{ background: 'var(--card-bg)', borderRight: '0.5px solid var(--border)', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 4, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }} className="app-sidebar">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', marginBottom: 18, textDecoration: 'none' }}>
            <img src="/lark-logo.png" alt="Lark" width={28} height={28} style={{ display: 'block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.04em' }}>Lark</span>
          </Link>

          <p className="eyebrow" style={{ padding: '6px 12px', fontSize: 9, marginBottom: 4, opacity: 0.7 }}>MENU</p>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV.map(item => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={item.tourId || undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12,
                    fontWeight: active ? 700 : 500, letterSpacing: '0.04em',
                    color: active ? 'var(--accent)' : 'var(--text2)',
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'background 0.15s, color 0.15s', textDecoration: 'none',
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

          {/* Sidebar bottom: sign in CTA when not signed in */}
          {!signedIn && (
            <div style={{ marginTop: 'auto', padding: '12px 4px' }}>
              <Link href="/auth?mode=signin" className="btn btn-accent btn-sm" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
                SIGN IN
              </Link>
            </div>
          )}
        </aside>

        {/* Main column */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header style={{ height: 56, borderBottom: '0.5px solid var(--border)', background: 'var(--nav-bg)', backdropFilter: 'blur(14px)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
                className="mobile-nav-trigger"
                style={{ display: 'none', width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: '0.12em' }}>
                {(NAV.find(n => n.href === pathname)?.label ?? 'App').toUpperCase()}
              </span>
            </div>

            {signedIn ? (
              <UserMenu
                email={email}
                displayName={displayName}
                onSignOut={signOut}
                onReplayTour={replayTour}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* ThemeToggle is inside UserMenu when signed in; show standalone when not */}
                <Link href="/auth?mode=signin" className="btn btn-ghost btn-sm">SIGN IN</Link>
              </div>
            )}
          </header>

          <main style={{ flex: 1, padding: '32px 28px 64px', minWidth: 0 }}>
            {children}
          </main>
        </div>

        {/* Mobile drawer */}
        {mobileNavOpen && (
          <div onClick={() => setMobileNavOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: 260, background: 'var(--card-bg)', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
              <Link href="/" onClick={() => setMobileNavOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', marginBottom: 14, textDecoration: 'none' }}>
                <img src="/lark-logo.png" alt="Lark" width={28} height={28} style={{ display: 'block' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.04em' }}>Lark</span>
              </Link>
              {NAV.map(item => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileNavOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: active ? 700 : 500, color: active ? 'var(--accent)' : 'var(--text2)', background: active ? 'var(--accent-dim)' : 'transparent', textDecoration: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
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

      {/* Onboarding tour */}
      {showTour && <OnboardingTour onDone={handleTourDone} />}
    </>
  );
}
