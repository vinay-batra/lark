'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { supabase } from '@/lib/supabase';
import { VERSION } from '@/lib/version';
import { TOUR_KEY } from '@/components/OnboardingTour';

const PREF_KEYS = {
  highSensitivity: 'lark_pref_high_sensitivity',
  defaultTuning:   'lark_pref_default_tuning',
  showFreq:        'lark_pref_show_freq',
};

function Section({ eyebrow, title, children, delay = 0 }: { eyebrow: string; title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '24px 26px', marginBottom: 18 }}
    >
      <div style={{ marginBottom: 22 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</p>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: '14px 0', borderBottom: '0.5px solid var(--border)' }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: hint ? 4 : 0 }}>{label}</p>
        {hint && <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.55 }}>{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 40, height: 22, borderRadius: 99, background: on ? 'var(--accent)' : 'var(--bg3)', border: 'none', position: 'relative', cursor: 'pointer', padding: 0, transition: 'background 0.18s', boxShadow: on ? '0 0 12px rgba(var(--accent-rgb),0.4)' : 'none' }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--card-bg)', position: 'absolute', top: 3, left: on ? 21 : 3, transition: 'left 0.18s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [nameSaved, setNameSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [highSensitivity, setHighSensitivity] = useState(false);
  const [showFreq, setShowFreq] = useState(true);
  const [defaultTuning, setDefaultTuning] = useState('standard');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!supabase) { router.replace('/auth?mode=signin'); return; }
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) { router.replace('/auth?mode=signin'); return; }
      setEmail(u.email ?? null);
      setUserId(u.id);
      setDisplayName(u.user_metadata?.display_name ?? '');
      setAvatarUrl(u.user_metadata?.avatar_url ?? null);
      setLoading(false);
    });
    setHighSensitivity(localStorage.getItem(PREF_KEYS.highSensitivity) === '1');
    setShowFreq(localStorage.getItem(PREF_KEYS.showFreq) !== '0');
    setDefaultTuning(localStorage.getItem(PREF_KEYS.defaultTuning) ?? 'standard');
  }, [router]);

  const saveName = async () => {
    if (!supabase || !displayName.trim()) return;
    await supabase.auth.updateUser({ data: { display_name: displayName.trim() } });
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !userId) return;
    if (file.size > 2 * 1024 * 1024) { setAvatarError('Image must be under 2MB.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setAvatarError('JPG, PNG or WebP only.'); return; }

    setAvatarError('');
    setAvatarUploading(true);
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${userId}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) { setAvatarError('Upload failed. Make sure the "avatars" storage bucket exists in Supabase.'); setAvatarUploading(false); return; }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = urlData.publicUrl + `?t=${Date.now()}`;
    await supabase.auth.updateUser({ data: { avatar_url: url } });
    setAvatarUrl(url);
    setAvatarUploading(false);
  };

  const setPref = (key: string, val: string) => { try { localStorage.setItem(key, val); } catch {} };

  const deleteAccount = async () => {
    if (!supabase) return;
    setDeleting(true);
    setDeleteError('');
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) { setDeleteError('Not signed in.'); setDeleting(false); return; }
    const res = await fetch('/api/delete-account', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) { setDeleteError(data.error ?? 'Could not delete account.'); setDeleting(false); return; }
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return null;

  const initial = (displayName?.[0] ?? email?.[0] ?? '?').toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 80 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 0' }}>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: 40 }}>
          <p className="eyebrow" style={{ marginBottom: 12 }}>ACCOUNT</p>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8 }}>Settings</h1>
          <p style={{ fontSize: 14, color: 'var(--text3)' }}>Manage your profile and preferences.</p>
        </motion.div>

        {/* Profile */}
        <Section eyebrow="PROFILE" title="Your profile" delay={0.1}>
          {/* Avatar */}
          <Row label="Profile picture" hint="Shown in the top-right corner on every page.">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Avatar preview */}
              <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: 'var(--accent-dim)', border: '1.5px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{initial}</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={avatarUploading}
                  className="btn btn-ghost btn-sm"
                >
                  {avatarUploading ? 'UPLOADING...' : 'UPLOAD PHOTO'}
                </button>
                {avatarUrl && (
                  <button
                    onClick={async () => {
                      if (!supabase) return;
                      await supabase.auth.updateUser({ data: { avatar_url: null } });
                      setAvatarUrl(null);
                    }}
                    style={{ fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', padding: 0 }}
                  >
                    REMOVE
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>
          </Row>
          {avatarError && <p style={{ fontSize: 11, color: 'var(--danger, #ef4444)', fontFamily: 'var(--font-mono)', marginTop: 8 }}>{avatarError}</p>}

          {/* Display name */}
          <Row label="Display name" hint="Shown instead of your email across the app.">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); }}
                placeholder={email?.split('@')[0] ?? ''}
                className="input-field"
                style={{ width: 160, height: 36, fontSize: 13, padding: '0 12px' }}
              />
              <button onClick={saveName} className="btn btn-ghost btn-sm">
                {nameSaved ? 'SAVED' : 'SAVE'}
              </button>
            </div>
          </Row>

          {/* Email */}
          <Row label="Email" hint="The address tied to your account.">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text2)' }}>{email}</span>
          </Row>
        </Section>

        {/* Appearance */}
        <Section eyebrow="APPEARANCE" title="Theme" delay={0.18}>
          <Row label="Color mode" hint="Choose how Lark looks.">
            <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--bg3)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
              {(['dark', 'light'] as const).map(t => (
                <button key={t} onClick={() => setTheme(t)} style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: theme === t ? 'var(--accent)' : 'transparent', color: theme === t ? 'var(--bg)' : 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        {/* Detection */}
        <Section eyebrow="DETECTION" title="Audio preferences" delay={0.26}>
          <Row label="High sensitivity" hint="Detect quieter notes. May increase false positives from background noise.">
            <Toggle on={highSensitivity} onChange={v => { setHighSensitivity(v); setPref(PREF_KEYS.highSensitivity, v ? '1' : '0'); }} />
          </Row>
          <Row label="Show frequency" hint="Display Hz alongside note names in the tuner.">
            <Toggle on={showFreq} onChange={v => { setShowFreq(v); setPref(PREF_KEYS.showFreq, v ? '1' : '0'); }} />
          </Row>
          <Row label="Default tuning" hint="Starting reference for the tuner.">
            <select value={defaultTuning} onChange={e => { setDefaultTuning(e.target.value); setPref(PREF_KEYS.defaultTuning, e.target.value); }} className="input-field" style={{ width: 'auto', padding: '8px 12px', fontSize: 12 }} aria-label="Default tuning">
              <option value="standard">Standard (EADGBE)</option>
              <option value="dropd">Drop D</option>
              <option value="dadgad">DADGAD</option>
              <option value="halfstep">Half step down</option>
            </select>
          </Row>
        </Section>

        {/* Account */}
        <Section eyebrow="ACCOUNT" title="Session" delay={0.34}>
          <Row label="App tour" hint="Replay the onboarding walkthrough inside the dashboard.">
            <button className="btn btn-ghost btn-sm" onClick={() => { localStorage.removeItem(TOUR_KEY); router.push('/app'); }}>REPLAY TOUR</button>
          </Row>
          <Row label="Go to App" hint="Open the full practice dashboard.">
            <button className="btn btn-accent btn-sm" onClick={() => router.push('/app')}>OPEN APP</button>
          </Row>
          <Row label="Sign out" hint="End your session on this device.">
            <button className="btn btn-ghost btn-sm" onClick={async () => {
              if (window.confirm('Sign out of Lark?') && supabase) { await supabase.auth.signOut(); router.push('/'); }
            }}>SIGN OUT</button>
          </Row>
        </Section>

        {/* Danger zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: 'var(--card-bg)', border: '0.5px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: '24px 26px', marginBottom: 18 }}
        >
          <div style={{ marginBottom: 22 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: 'var(--danger, #ef4444)', textTransform: 'uppercase', marginBottom: 6 }}>DANGER ZONE</p>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>Delete account</h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 18 }}>
            This permanently deletes your account and all associated data. There is no going back.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ padding: '10px 20px', borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.4)', color: 'var(--danger, #ef4444)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
            >
              DELETE MY ACCOUNT
            </button>
          ) : (
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '0.5px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '18px 20px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
                Are you sure? This cannot be undone.
              </p>
              {deleteError && <p style={{ fontSize: 12, color: 'var(--danger, #ef4444)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>{deleteError}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={deleteAccount}
                  disabled={deleting}
                  style={{ padding: '10px 20px', borderRadius: 9, background: 'var(--danger, #ef4444)', border: 'none', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}
                >
                  {deleting ? 'DELETING...' : 'YES, DELETE'}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }}
                  disabled={deleting}
                  className="btn btn-ghost btn-sm"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textAlign: 'center', marginTop: 32 }}
        >
          {VERSION}
        </motion.p>

      </div>
    </div>
  );
}
