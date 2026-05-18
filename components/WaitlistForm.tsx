'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    if (supabase) {
      const { error } = await supabase.from('waitlist').insert({ email });
      if (error && error.code !== '23505') {
        setMsg('Something went wrong. Try again.');
        setStatus('error');
        return;
      }
    }

    setStatus('success');
    setMsg('');
    setEmail('');
  };

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 28px',
          background: 'var(--accent-dim)',
          border: '0.5px solid var(--accent-border)',
          borderRadius: 12,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', letterSpacing: '0.06em' }}>
            You are on the list.
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        placeholder="your@email.com"
        className="input-field"
        style={{ maxWidth: 300, flex: '1 1 220px' }}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn btn-accent"
        style={{ flexShrink: 0 }}
      >
        {status === 'loading' ? 'JOINING...' : 'JOIN WAITLIST'}
      </button>
      {msg && (
        <p style={{ width: '100%', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--danger)' }}>
          {msg}
        </p>
      )}
    </form>
  );
}
