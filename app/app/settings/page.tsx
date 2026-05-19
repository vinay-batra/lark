'use client';

import { useEffect, useState } from 'react';
import { VERSION } from '@/lib/version';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Reveal } from '@/components/Reveal';

const PREF_KEYS = {
  highSensitivity: 'lark_pref_high_sensitivity',
  defaultTuning: 'lark_pref_default_tuning',
  showFreq: 'lark_pref_show_freq',
};

interface SectionProps {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}

function Section({ eyebrow, title, children }: SectionProps) {
  return (
    <Reveal>
      <div style={{
        background: 'var(--card-bg)',
        border: '0.5px solid var(--border)',
        borderRadius: 16,
        padding: '24px 26px',
        marginBottom: 18,
      }}>
        <div style={{ marginBottom: 22 }}>
          <p className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</p>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 17,
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.01em',
          }}>
            {title}
          </h2>
        </div>
        {children}
      </div>
    </Reveal>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="settings-row" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 18,
      padding: '14px 0',
      borderBottom: '0.5px solid var(--border)',
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: hint ? 4 : 0 }}>
          {label}
        </p>
        {hint && <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.55 }}>{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 99,
        background: on ? 'var(--accent)' : 'var(--bg3)',
        border: 'none',
        position: 'relative',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 0.18s',
        boxShadow: on ? `0 0 12px rgba(var(--accent-rgb), 0.4)` : 'none',
      }}
    >
      <div style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: 3,
        left: on ? 21 : 3,
        transition: 'left 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState<string | null>(null);
  const [highSensitivity, setHighSensitivity] = useState(false);
  const [showFreq, setShowFreq] = useState(true);
  const [defaultTuning, setDefaultTuning] = useState('standard');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHighSensitivity(localStorage.getItem(PREF_KEYS.highSensitivity) === '1');
    setShowFreq(localStorage.getItem(PREF_KEYS.showFreq) !== '0');
    setDefaultTuning(localStorage.getItem(PREF_KEYS.defaultTuning) ?? 'standard');
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    }
  }, []);

  const setPref = (key: string, value: string) => {
    try { localStorage.setItem(key, value); } catch {}
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 36 }}
      >
        <p className="eyebrow" style={{ marginBottom: 12 }}>PROFILE</p>
        <h1 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 32,
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: 8,
        }}>
          Settings
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text3)' }}>
          Tweak how Lark looks and behaves.
        </p>
      </motion.div>

      <Section eyebrow="APPEARANCE" title="Theme">
        <Row label="Color mode" hint="Choose how Lark looks. Synced across the whole app.">
          <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--bg3)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
            {(['dark', 'light'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: theme === t ? 'var(--accent)' : 'transparent',
                  color: theme === t ? '#061b0e' : 'var(--text2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      <Section eyebrow="DETECTION" title="Audio preferences">
        <Row label="High sensitivity" hint="Detect quieter notes. May increase false positives from background noise.">
          <Toggle on={highSensitivity} onChange={v => { setHighSensitivity(v); setPref(PREF_KEYS.highSensitivity, v ? '1' : '0'); }} />
        </Row>
        <Row label="Show frequency" hint="Display Hz alongside note names in the tuner.">
          <Toggle on={showFreq} onChange={v => { setShowFreq(v); setPref(PREF_KEYS.showFreq, v ? '1' : '0'); }} />
        </Row>
        <Row label="Default tuning" hint="Starting reference for the tuner.">
          <select
            value={defaultTuning}
            onChange={e => { setDefaultTuning(e.target.value); setPref(PREF_KEYS.defaultTuning, e.target.value); }}
            className="input-field"
            style={{ width: 'auto', padding: '8px 12px', fontSize: 12 }}
          >
            <option value="standard">Standard (EADGBE)</option>
            <option value="dropd">Drop D</option>
            <option value="dadgad">DADGAD</option>
            <option value="halfstep">Half step down</option>
          </select>
        </Row>
      </Section>

      <Section eyebrow="ACCOUNT" title="Your account">
        {!isSupabaseConfigured ? (
          <div style={{ padding: '16px 0', fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>
            Account features come online once Supabase is wired up. Add <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>NEXT_PUBLIC_SUPABASE_URL</code> and <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>.env.local</code>.
          </div>
        ) : email ? (
          <>
            <Row label="Email" hint="The address tied to your account.">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text2)' }}>{email}</span>
            </Row>
            <Row label="Sign out" hint="End your session on this device.">
              <button
                className="btn btn-ghost btn-sm"
                onClick={async () => { if (supabase) { await supabase.auth.signOut(); window.location.href = '/'; } }}
              >
                SIGN OUT
              </button>
            </Row>
          </>
        ) : (
          <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.55 }}>
              You are not signed in. Create an account to save progress and unlock AI feedback when it ships.
            </p>
            <a href="/auth?mode=signup" className="btn btn-accent btn-sm">SIGN UP</a>
          </div>
        )}
      </Section>

      <Section eyebrow="ABOUT" title="Lark">
        <Row label="Version" hint="Latest build deployed.">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>{VERSION}</span>
        </Row>
      </Section>
    </div>
  );
}
