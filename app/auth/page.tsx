'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

type Mode = 'signin' | 'signup' | 'magic' | 'reset';

function AuthInner() {
  const router = useRouter();
  const search = useSearchParams();
  const initialMode = (search?.get('mode') as Mode) || 'signin';
  const [mode, setMode] = useState<Mode>(initialMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => { setError(null); setSuccess(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!supabase) {
      setError('Authentication is not configured yet. Add Supabase env vars to .env.local.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/app');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        setSuccess('Check your email to confirm your account.');
      } else if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        setSuccess('Magic link sent. Check your email.');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=signin`,
        });
        if (error) throw error;
        setSuccess('Password reset link sent.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    reset();
    if (!supabase) {
      setError('Authentication is not configured yet.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/app` },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const title = mode === 'signin' ? 'Welcome back'
    : mode === 'signup' ? 'Create your account'
    : mode === 'magic' ? 'Magic link sign in'
    : 'Reset password';
  const subtitle = mode === 'signin' ? 'Sign in to pick up where you left off.'
    : mode === 'signup' ? 'Free forever. Sign up to track progress.'
    : mode === 'magic' ? 'We email you a link. One click, you are in.'
    : 'We email you a link to set a new password.';
  const ctaLabel = mode === 'signin' ? 'SIGN IN'
    : mode === 'signup' ? 'CREATE ACCOUNT'
    : mode === 'magic' ? 'SEND MAGIC LINK'
    : 'SEND RESET LINK';

  const showPassword = mode === 'signin' || mode === 'signup';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '20px 28px' }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--accent)',
          letterSpacing: '0.04em',
        }}>
          Lark
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 60px' }}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%',
            maxWidth: 440,
            background: 'var(--card-bg)',
            border: '0.5px solid var(--border)',
            borderRadius: 18,
            padding: 'clamp(28px, 5vw, 40px)',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top accent stripe */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 3,
            background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
          }} />

          <p className="eyebrow" style={{ marginBottom: 10 }}>{mode === 'signup' ? 'GET STARTED' : 'LARK'}</p>
          <h1 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            {title}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 28 }}>
            {subtitle}
          </p>

          {/* Mode tabs (signin / signup only) */}
          {(mode === 'signin' || mode === 'signup') && (
            <div style={{
              display: 'flex',
              gap: 4,
              padding: 4,
              background: 'var(--bg2)',
              borderRadius: 10,
              marginBottom: 22,
              border: '0.5px solid var(--border)',
            }}>
              {(['signin', 'signup'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); reset(); }}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: 7,
                    border: 'none',
                    background: mode === m ? 'var(--accent)' : 'transparent',
                    color: mode === m ? '#061b0e' : 'var(--text2)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {m === 'signin' ? 'SIGN IN' : 'SIGN UP'}
                </button>
              ))}
            </div>
          )}

          {/* OAuth */}
          {(mode === 'signin' || mode === 'signup') && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  disabled={loading}
                  className="btn btn-ghost"
                  style={{ padding: '11px 14px', fontSize: 12, letterSpacing: '0.06em' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.32z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.3 9.14 5.38 12 5.38z"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('github')}
                  disabled={loading}
                  className="btn btn-ghost"
                  style={{ padding: '11px 14px', fontSize: 12, letterSpacing: '0.06em' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.17c-3.34.72-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.83 1.23 1.83 1.23 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  GitHub
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>OR</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--text3)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
              />
            </div>

            {showPassword && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--text3)',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}>
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button type="button" onClick={() => { setMode('reset'); reset(); }} style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)',
                      background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em',
                    }}>
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                  className="input-field"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--danger)',
                    padding: '10px 12px',
                    background: 'var(--danger-dim)',
                    border: '0.5px solid var(--danger)',
                    borderRadius: 8,
                  }}
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--accent)',
                    padding: '10px 12px',
                    background: 'var(--accent-dim)',
                    border: '0.5px solid var(--accent-border)',
                    borderRadius: 8,
                  }}
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-accent btn-lg"
              style={{ marginTop: 6, width: '100%' }}
            >
              {loading ? 'WORKING…' : ctaLabel}
            </button>
          </form>

          {/* Footer links */}
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            {(mode === 'signin' || mode === 'signup') && (
              <button onClick={() => { setMode('magic'); reset(); }} style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)',
                background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em',
                padding: 4,
              }}>
                Sign in with a magic link instead
              </button>
            )}
            {(mode === 'magic' || mode === 'reset') && (
              <button onClick={() => { setMode('signin'); reset(); }} style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)',
                background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em',
              }}>
                ← Back to sign in
              </button>
            )}
          </div>

          {!isSupabaseConfigured && (
            <div style={{
              marginTop: 22,
              padding: '12px 14px',
              background: 'var(--sharp-dim)',
              border: '0.5px solid var(--sharp)',
              borderRadius: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--sharp)',
              lineHeight: 1.5,
            }}>
              Heads up: Supabase env vars not set. Auth is in preview mode. See <code style={{ fontFamily: 'inherit' }}>.env.local.example</code>.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
      <AuthInner />
    </Suspense>
  );
}
