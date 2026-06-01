'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { supabase } from '@/lib/supabase';
import { VERSION } from '@/lib/version';
import { TOUR_KEY } from '@/components/OnboardingTour';

const PREF_KEYS = {
  highSensitivity: 'lark_pref_high_sensitivity',
  defaultTuning:   'lark_pref_default_tuning',
  showFreq:        'lark_pref_show_freq',
};

interface Props {
  layout?: 'standalone' | 'in-app';
}

function Row({ label, hint, children, last }: { label: string; hint?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className="settings-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: '16px 0', borderBottom: last ? 'none' : '0.5px solid var(--border)' }}>
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
    <button
      onClick={() => onChange(!on)}
      style={{ width: 40, height: 22, minHeight: 44, borderRadius: 99, background: on ? 'var(--accent)' : 'var(--bg3)', border: 'none', position: 'relative', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', transition: 'background 0.18s', boxShadow: on ? '0 0 12px rgba(var(--accent-rgb),0.4)' : 'none' }}
    >
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--card-bg)', position: 'absolute', top: 3, left: on ? 21 : 3, transition: 'left 0.18s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
    </button>
  );
}

const TABS = [
  { id: 'profile',    label: 'Profile' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'detection',  label: 'Detection' },
  { id: 'account',    label: 'Account' },
];

export function SettingsPanel({ layout = 'standalone' }: Props) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('profile');

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
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
    if (!supabase) {
      if (layout === 'standalone') router.replace('/auth?mode=signin');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      else setLoading(false);
      return;
    }
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const u = data.user;
      if (!u && layout === 'standalone') { router.replace('/auth?mode=signin'); return; }
      setEmail(u?.email ?? null);
      setDisplayName(u?.user_metadata?.display_name ?? '');
      setAvatarUrl(u?.user_metadata?.avatar_url ?? null);
      if (!u) setActiveTab('appearance');
      setLoading(false);
    });
    setHighSensitivity(localStorage.getItem(PREF_KEYS.highSensitivity) === '1');
    setShowFreq(localStorage.getItem(PREF_KEYS.showFreq) !== '0');
    setDefaultTuning(localStorage.getItem(PREF_KEYS.defaultTuning) ?? 'standard');
    return () => { mounted = false; };
  }, [router, layout]);

  const saveName = async () => {
    if (!supabase || !displayName.trim()) return;
    const safe = displayName.trim().slice(0, 60);
    await supabase.auth.updateUser({ data: { display_name: safe } });
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setAvatarError('JPG, PNG or WebP only.'); return; }
    setAvatarError('');
    setAvatarUploading(true);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const SIZE = 200;
          const canvas = document.createElement('canvas');
          canvas.width = SIZE; canvas.height = SIZE;
          const ctx = canvas.getContext('2d')!;
          const scale = Math.max(SIZE / img.width, SIZE / img.height);
          const w = img.width * scale; const h = img.height * scale;
          ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = reject;
        img.src = ev.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    if (!dataUrl.startsWith('data:image/')) { setAvatarError('Invalid image.'); setAvatarUploading(false); return; }
    if (dataUrl.length > 100_000) { setAvatarError('Image too large. Try a smaller photo.'); setAvatarUploading(false); return; }
    await supabase.auth.updateUser({ data: { avatar_url: dataUrl } });
    setAvatarUrl(dataUrl);
    setAvatarUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const setPref = (key: string, val: string) => { try { localStorage.setItem(key, val); } catch { /* localStorage unavailable */ } };

  const deleteAccount = async () => {
    if (!supabase) return;
    setDeleting(true); setDeleteError('');
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

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        if (!email) return <p style={{ fontSize: 14, color: 'var(--text3)', paddingTop: 8 }}>Sign in to manage your profile.</p>;
        return (
          <>
            <Row label="Profile picture" hint="Shown in the top-right corner. Automatically cropped and compressed.">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: 'var(--accent-dim)', border: '1.5px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{initial}</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button onClick={() => fileRef.current?.click()} disabled={avatarUploading} className="btn btn-ghost btn-sm">
                    {avatarUploading ? 'UPLOADING...' : 'UPLOAD PHOTO'}
                  </button>
                  {avatarUrl && (
                    <button onClick={async () => { if (!supabase) return; await supabase.auth.updateUser({ data: { avatar_url: null } }); setAvatarUrl(null); }} style={{ fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', padding: 0 }}>REMOVE</button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </div>
            </Row>
            {avatarError && <p style={{ fontSize: 11, color: 'var(--danger)', fontFamily: 'var(--font-mono)', marginTop: 8 }}>{avatarError}</p>}
            <Row label="Display name" hint="Shown instead of your email across the app.">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveName(); }} placeholder={email?.split('@')[0] ?? ''} className="input-field" maxLength={60} style={{ width: 160, height: 36, fontSize: 13, padding: '0 12px' }} />
                <button onClick={saveName} disabled={!displayName.trim()} className="btn btn-accent btn-sm">{nameSaved ? 'SAVED' : 'SAVE'}</button>
              </div>
            </Row>
            <Row label="Email" hint="The address tied to your account." last>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text2)' }}>{email}</span>
            </Row>
          </>
        );

      case 'appearance':
        return (
          <Row label="Color mode" hint="Choose how Lark looks." last>
            <div style={{ display: 'flex', gap: 3, padding: 3, background: 'var(--bg3)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
              {(['dark', 'light'] as const).map(t => (
                <button key={t} onClick={() => setTheme(t)} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: theme === t ? 'var(--accent)' : 'transparent', color: theme === t ? 'var(--on-accent)' : 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </Row>
        );

      case 'detection':
        return (
          <>
            <Row label="High sensitivity" hint="Detect quieter notes. May increase false positives from background noise.">
              <Toggle on={highSensitivity} onChange={v => { setHighSensitivity(v); setPref(PREF_KEYS.highSensitivity, v ? '1' : '0'); }} />
            </Row>
            <Row label="Show frequency" hint="Display Hz alongside note names in the tuner.">
              <Toggle on={showFreq} onChange={v => { setShowFreq(v); setPref(PREF_KEYS.showFreq, v ? '1' : '0'); }} />
            </Row>
            <Row label="Default tuning" hint="Starting reference for the tuner." last>
              <select value={defaultTuning} onChange={e => { setDefaultTuning(e.target.value); setPref(PREF_KEYS.defaultTuning, e.target.value); }} className="input-field" style={{ width: 'auto', padding: '8px 12px', fontSize: 12 }} aria-label="Default tuning">
                <option value="standard">Standard (EADGBE)</option>
                <option value="dropd">Drop D</option>
                <option value="dadgad">DADGAD</option>
                <option value="halfstep">Half step down</option>
              </select>
            </Row>
          </>
        );

      case 'account':
        return (
          <>
            <Row label="App tour" hint="Replay the onboarding walkthrough inside the dashboard.">
              <button className="btn btn-ghost btn-sm" onClick={() => { localStorage.removeItem(TOUR_KEY); router.push('/app'); }}>REPLAY TOUR</button>
            </Row>
            {layout === 'standalone' && (
              <Row label="Go to App" hint="Open the full practice dashboard.">
                <button className="btn btn-accent btn-sm" onClick={() => router.push('/app')}>OPEN APP</button>
              </Row>
            )}
            <Row label="Sign out" hint="End your session on this device." last={!email}>
              <button className="btn btn-ghost btn-sm" onClick={async () => { if (window.confirm('Sign out of Lark?') && supabase) { await supabase.auth.signOut(); router.push('/'); } }}>SIGN OUT</button>
            </Row>

            {email && (
              <div style={{ marginTop: 32, padding: '22px 24px', background: 'var(--card-bg)', border: '0.5px solid rgba(var(--danger-rgb), 0.28)', borderRadius: 12 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: 'var(--danger)', textTransform: 'uppercase', marginBottom: 6 }}>DANGER ZONE</p>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 10, letterSpacing: '-0.01em' }}>Delete account</h3>
                <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 16 }}>This permanently deletes your account and all associated data. There is no going back.</p>
                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: '9px 18px', borderRadius: 8, background: 'rgba(var(--danger-rgb), 0.08)', border: '0.5px solid rgba(var(--danger-rgb), 0.4)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(var(--danger-rgb), 0.15)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(var(--danger-rgb), 0.08)'; }}>DELETE MY ACCOUNT</button>
                ) : (
                  <div style={{ background: 'rgba(var(--danger-rgb), 0.06)', border: '0.5px solid rgba(var(--danger-rgb), 0.25)', borderRadius: 10, padding: '16px 18px' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Are you sure? This cannot be undone.</p>
                    {deleteError && <p style={{ fontSize: 12, color: 'var(--danger)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>{deleteError}</p>}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={deleteAccount} disabled={deleting} style={{ padding: '9px 18px', borderRadius: 8, background: 'var(--danger)', border: 'none', color: 'var(--on-danger)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}>{deleting ? 'DELETING...' : 'YES, DELETE'}</button>
                      <button onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }} disabled={deleting} className="btn btn-ghost btn-sm">CANCEL</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: 32 }}>{VERSION}</p>
          </>
        );

      default:
        return null;
    }
  };

  const sidebar = (
    <nav className="settings-sidebar" style={{ width: 192, flexShrink: 0 }}>
      <p className="eyebrow" style={{ fontSize: 9, marginBottom: 10, paddingLeft: 12, color: 'var(--text-muted)' }}>SETTINGS</p>
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '9px 12px',
            borderRadius: 8,
            border: 'none',
            borderLeft: `2.5px solid ${activeTab === tab.id ? 'var(--accent)' : 'transparent'}`,
            background: activeTab === tab.id ? 'var(--accent-dim)' : 'transparent',
            color: activeTab === tab.id ? 'var(--accent)' : 'var(--text2)',
            fontFamily: 'inherit',
            fontSize: 13,
            fontWeight: activeTab === tab.id ? 700 : 500,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
            marginBottom: 2,
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );

  const tabLabel = TABS.find(t => t.id === activeTab)?.label ?? '';

  const contentPane = (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, paddingBottom: 16, borderBottom: '0.5px solid var(--border)' }}>
        <div style={{ width: 3, height: 20, background: 'var(--accent)', borderRadius: 99, flexShrink: 0 }} />
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{tabLabel}</h2>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const inner = (
    <div className="settings-layout" style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
      {sidebar}
      {contentPane}
    </div>
  );

  if (layout === 'standalone') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 80 }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '72px 24px 0' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: 44 }}
          >
            <p className="eyebrow" style={{ marginBottom: 10 }}>ACCOUNT</p>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Settings</h1>
          </motion.div>
          {inner}
        </div>
        <style jsx>{`
          @media (max-width: 768px) {
            .settings-layout { flex-direction: column !important; }
            .settings-sidebar { width: 100% !important; display: flex !important; flex-direction: row !important; overflow-x: auto !important; padding-bottom: 4px; gap: 2px; }
            .settings-sidebar button { flex-shrink: 0; border-left: none !important; border-bottom: 2.5px solid transparent; border-radius: 8px !important; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {inner}
      <style jsx>{`
        @media (max-width: 768px) {
          .settings-layout { flex-direction: column !important; }
          .settings-sidebar { width: 100% !important; display: flex !important; flex-direction: row !important; overflow-x: auto !important; padding-bottom: 4px; gap: 2px; }
          .settings-sidebar button { flex-shrink: 0; border-left: none !important; border-bottom: 2.5px solid transparent; border-radius: 8px !important; }
        }
      `}</style>
    </>
  );
}
