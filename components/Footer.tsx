import Link from 'next/link';
import { VERSION } from '@/lib/version';

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
      { href: '/app/settings', label: 'Settings' },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{
      borderTop: '0.5px solid var(--border)',
      background: 'var(--bg)',
      padding: '64px 28px 40px',
      marginTop: 64,
    }}>
      <div style={{
        maxWidth: 'var(--max-content)',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.4fr repeat(2, 1fr)',
        gap: 48,
      }} className="footer-grid">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <img src="/lark-logo.png" alt="Lark" width={32} height={32} style={{ display: 'block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.04em' }}>Lark</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7, maxWidth: 320 }}>
            The guitar tutor that listens. Tune, learn, and improve with real audio feedback.
          </p>
        </div>

        {COLUMNS.map(col => (
          <div key={col.label}>
            <p className="eyebrow" style={{ marginBottom: 16 }}>{col.label}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map(l => (
                <Link key={l.href} href={l.href} className="footer-link">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        maxWidth: 'var(--max-content)',
        margin: '48px auto 0',
        paddingTop: 24,
        borderTop: '0.5px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 14,
        flexWrap: 'wrap',
      }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
          © {new Date().getFullYear()} Lark. Built for guitarists.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <Link href="/privacy" className="footer-link" style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
            Privacy
          </Link>
          <Link href="/terms" className="footer-link" style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
            Terms
          </Link>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', margin: 0 }}>
            {VERSION}
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; }
        }
        @media (max-width: 460px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
