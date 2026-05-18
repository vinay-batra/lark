'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

const LINKS = [
  { href: '/', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/changelog', label: 'Changelog' },
  { href: '/faq', label: 'FAQ' },
];

export function PublicNav() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const y = window.scrollY;
      const prev = lastScrollRef.current;
      if (y > 80 && y > prev + 4) setHidden(true);
      else if (y < prev - 4 || y < 80) setHidden(false);
      lastScrollRef.current = y;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

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
          {/* Logo (left column) */}
          <div style={{ justifySelf: 'start' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              <img src="/lark-logo.png" alt="Lark" width={30} height={30} style={{ display: 'block' }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: 17,
                color: 'var(--text)',
                letterSpacing: '0.04em',
              }}>
                Lark
              </span>
            </Link>
          </div>

          {/* Center links (truly centered via grid) */}
          <div className="nav-center" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            {LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link ${pathname === l.href ? 'active' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right cluster */}
          <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: 8, justifySelf: 'end' }}>
            <ThemeToggle />
            <Link href="/auth?mode=signin" className="nav-link" style={{ display: 'inline-flex' }}>
              Sign in
            </Link>
            <Link href="/auth?mode=signup" className="btn btn-accent btn-sm" style={{ padding: '8px 18px' }}>
              Get Started
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button
            className="nav-mobile-trigger"
            aria-label="Toggle menu"
            onClick={() => setOpen(v => !v)}
            style={{
              display: 'none',
              width: 38,
              height: 38,
              border: '1px solid var(--border)',
              borderRadius: 10,
              background: 'transparent',
              color: 'var(--text)',
              alignItems: 'center',
              justifyContent: 'center',
              justifySelf: 'end',
              gridColumn: '3 / 4',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div style={{
          position: 'fixed',
          inset: '64px 0 0 0',
          background: 'var(--bg)',
          zIndex: 99,
          padding: '24px 24px 48px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link ${pathname === l.href ? 'active' : ''}`}
              style={{
                padding: '14px 14px',
                fontSize: 14,
                letterSpacing: '0.04em',
                textTransform: 'none',
              }}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
          <Link href="/auth?mode=signin" className="nav-link" style={{ padding: '14px', fontSize: 14, textTransform: 'none' }}>
            Sign in
          </Link>
          <Link href="/auth?mode=signup" className="btn btn-accent" style={{ marginTop: 10 }}>
            Get Started
          </Link>
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
