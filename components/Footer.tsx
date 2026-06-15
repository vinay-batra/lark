import Link from 'next/link';
import Image from 'next/image';

const COLUMNS = [
  {
    label: 'Company',
    links: [
      { href: '/changelog', label: 'Changelog' },
      { href: '/faq', label: 'FAQ' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
  {
    label: 'Account',
    links: [
      { href: '/auth?mode=signin', label: 'Sign in' },
      { href: '/auth?mode=signup', label: 'Create account' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Image src="/lark-logo.png" alt="Lark" width={30} height={30} style={{ display: 'block' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 19, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.05em' }}>Lark</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7, maxWidth: 300 }}>
              The guitar tutor that listens. Tune, learn, and improve with real audio feedback.
            </p>
          </div>

          {COLUMNS.map(col => (
            <div key={col.label}>
              <p className="ed-label" style={{ marginBottom: 16 }}>{col.label}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {col.links.map(l => (
                  <Link key={l.href} href={l.href} className="footer-link">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="footer-base">
          <span>© 2026 Lark</span>
          <span>The guitar tutor that listens</span>
        </div>
      </div>

      <style>{`
        .site-footer { border-top: 0.5px solid var(--border); background: var(--bg); margin-top: 80px; padding: clamp(56px, 8vh, 80px) 24px 40px; padding-left: clamp(24px, calc(64px - (100vw - 1120px) / 2), 76px); }
        .site-footer-inner { max-width: 1120px; margin: 0 auto; }
        .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 48px; }
        .footer-base { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: clamp(48px, 7vh, 72px); padding-top: 22px; border-top: 0.5px solid var(--border); font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); }
        @media (max-width: 768px) {
          .site-footer { padding-left: 54px; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
        }
      `}</style>
    </footer>
  );
}
