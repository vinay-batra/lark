'use client';

import { useState } from 'react';
import { submitBugReport } from '@/lib/practice';

type State = 'idle' | 'open' | 'submitting' | 'done' | 'error';

export function FeedbackButton() {
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');

  const [errMsg, setErrMsg] = useState('');

  const submit = async () => {
    if (!message.trim()) return;
    setState('submitting');
    const result = await submitBugReport(message.trim());
    if (result.ok) {
      setState('done');
      setTimeout(() => { setState('idle'); setMessage(''); }, 2000);
    } else {
      setErrMsg(result.errMsg ?? 'Failed to send.');
      setState('error');
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setState('open')}
        title="Report a bug"
        aria-label="Report a bug"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 200,
          width: 44, height: 44, borderRadius: '50%',
          background: 'var(--card-bg)', border: '0.5px solid var(--border2)',
          color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        }}
        onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--accent-border)'; el.style.color = 'var(--accent)'; el.style.background = 'var(--accent-dim)'; el.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--border2)'; el.style.color = 'var(--text3)'; el.style.background = 'var(--card-bg)'; el.style.transform = 'translateY(0)'; }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
          <line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
      </button>

      {/* Modal */}
      {state !== 'idle' && (
        <div
          onClick={e => { if (e.target === e.currentTarget) { setState('idle'); setMessage(''); } }}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '0 24px 88px' }}
        >
          <div style={{ width: 'min(100%, 360px)', background: 'var(--card-bg)', border: '0.5px solid var(--border2)', borderRadius: 16, padding: '22px 22px 18px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: 4 }}>FEEDBACK</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Report a bug</p>
              </div>
              <button onClick={() => { setState('idle'); setMessage(''); }} aria-label="Close feedback form" style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg3)', border: '0.5px solid var(--border)', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {state === 'done' ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', letterSpacing: '0.08em' }}>REPORT SENT</p>
              </div>
            ) : (
              <>
                <textarea
                  autoFocus
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe what's broken or missing..."
                  rows={4}
                  style={{ width: '100%', background: 'var(--bg3)', border: '0.5px solid var(--border2)', borderRadius: 10, color: 'var(--text)', fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif', fontSize: 13, padding: '12px 14px', resize: 'none', outline: 'none', lineHeight: 1.6, marginBottom: 12, boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border2)'; }}
                />
                {state === 'error' && (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--danger)', marginBottom: 10 }}>
                    {errMsg}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => { setState('idle'); setMessage(''); }} className="btn btn-ghost btn-sm">CANCEL</button>
                  <button onClick={submit} disabled={!message.trim() || state === 'submitting'} className="btn btn-accent btn-sm">
                    {state === 'submitting' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', animation: 'pulse 0.8s ease-in-out infinite' }} />
                        SENDING
                      </span>
                    ) : 'SEND'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
