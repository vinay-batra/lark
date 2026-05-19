'use client';

export function FeedbackButton() {
  return (
    <a
      href="mailto:the404supply@gmail.com?subject=Lark Feedback"
      title="Send feedback"
      aria-label="Send feedback"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 200,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: 'var(--card-bg)',
        border: '0.5px solid var(--border2)',
        color: 'var(--text3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        transition: 'border-color 0.15s, color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s',
        boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.borderColor = 'var(--accent-border)';
        el.style.color = 'var(--accent)';
        el.style.background = 'var(--accent-dim)';
        el.style.transform = 'translateY(-1px)';
        el.style.boxShadow = '0 4px 16px rgba(var(--accent-rgb),0.18)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.borderColor = 'var(--border2)';
        el.style.color = 'var(--text3)';
        el.style.background = 'var(--card-bg)';
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
        <line x1="4" y1="22" x2="4" y2="15"/>
      </svg>
    </a>
  );
}
