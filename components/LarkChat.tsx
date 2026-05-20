'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function getToday(): string {
  // Use local date, not UTC. toISOString() gives UTC which means the limit
  // doesn't reset at local midnight for users west of UTC (e.g. US users hit
  // 11pm, sleep, wake up at 9am — still blocked because it's still the same
  // UTC date until 5-8am local time).
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getStorageKey(): string {
  return `lark_chat_${getToday()}`;
}

function getUsedCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(getStorageKey()) ?? '0', 10);
}

function incrementUsedCount(): number {
  const next = getUsedCount() + 1;
  localStorage.setItem(getStorageKey(), String(next));
  return next;
}

const DAILY_LIMIT = 5;

export function LarkChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Lazy init from localStorage so we don't re-render after first paint just
  // to fill in the count. Re-reads when the chat opens (in the effect below)
  // so cross-tab updates stay accurate.
  const [usedCount, setUsedCount] = useState(() => getUsedCount());
  // Hidden during an active song session so it doesn't overlap the playing UI
  // on mobile (the floating button sits over the tab + countdown bar at 60x60).
  const [songPlaying, setSongPlaying] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);

  // Re-read on open so cross-tab usage shows up. Legitimate setState in effect.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsedCount(getUsedCount());
  }, [open]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ playing: boolean }>;
      setSongPlaying(!!ce.detail?.playing);
      if (ce.detail?.playing) setOpen(false);
    };
    window.addEventListener('lark:song-state', handler);
    return () => window.removeEventListener('lark:song-state', handler);
  }, []);

  if (songPlaying) return null;

  // Intentionally no auto-scroll on response -- user scrolls manually

  const limitReached = usedCount >= DAILY_LIMIT;
  const remaining = Math.max(0, DAILY_LIMIT - usedCount);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || limitReached) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    const newCount = incrementUsedCount();
    setUsedCount(newCount);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? 'Something went wrong. Try again.');
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      }
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Click-outside backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 198 }}
          aria-hidden="true"
        />
      )}

      {/* Toggle button */}
      <button
        id="tour-chat-btn"
        onClick={() => setOpen(prev => !prev)}
        aria-label={open ? 'Close Lark chat' : 'Open Lark chat'}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 201,
          width: 60,
          height: 60,
          borderRadius: '50%',
          // overflow: hidden + translateZ(0) fixes a Safari WebKit bug where
          // position:fixed elements with border-radius render as squares.
          overflow: 'hidden',
          WebkitTransform: 'translateZ(0)',
          background: 'var(--accent)',
          border: 'none',
          color: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.15s, box-shadow 0.15s',
          boxShadow: '0 4px 16px rgba(var(--accent-rgb), 0.35)',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 22px rgba(var(--accent-rgb), 0.5)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(var(--accent-rgb), 0.35)';
        }}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed',
            bottom: 96,
            right: 24,
            zIndex: 201,
            width: 400,
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 560,
            background: 'var(--card-bg)',
            border: '0.5px solid var(--border2)',
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          className="lark-chat-panel"
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px 10px',
              borderBottom: '0.5px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <p
              className="eyebrow"
              style={{ margin: 0 }}
            >
              ASK LARK
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: remaining === 0 ? 'var(--danger)' : 'var(--text3)',
                  letterSpacing: '0.04em',
                }}
              >
                {remaining} / {DAILY_LIMIT} today
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: 'var(--bg3)',
                  border: '0.5px solid var(--border)',
                  color: 'var(--text3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesRef}
            style={{
              flexGrow: 1,
              overflowY: 'auto',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {messages.length === 0 && !limitReached && (
              <div style={{ margin: 'auto', textAlign: 'center', padding: '8px 0' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-dim)', border: '0.5px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Ask Lark</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginBottom: 20, letterSpacing: '0.03em' }}>Guitar questions answered instantly.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['How do I play a B chord?', 'What scales work over minor chords?', 'How do I improve my picking speed?'].map(q => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); }}
                      style={{
                        background: 'var(--bg3)',
                        border: '0.5px solid var(--border2)',
                        borderRadius: 9,
                        padding: '9px 12px',
                        fontSize: 12,
                        color: 'var(--text2)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        lineHeight: 1.4,
                        transition: 'border-color 0.15s, background 0.15s',
                        fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.background = 'var(--accent-dim)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {limitReached && messages.length === 0 && (
              <p
                style={{
                  textAlign: 'center',
                  color: 'var(--text3)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  margin: 'auto',
                  letterSpacing: '0.03em',
                  lineHeight: 1.6,
                }}
              >
                {DAILY_LIMIT} free messages used today. Try again tomorrow.
              </p>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg3)',
                    color: msg.role === 'user' ? 'var(--bg)' : 'var(--text)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    fontSize: 13,
                    lineHeight: 1.6,
                    maxWidth: '85%',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {limitReached && messages.length > 0 && (
              <p
                style={{
                  textAlign: 'center',
                  color: 'var(--text3)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.03em',
                  lineHeight: 1.6,
                  marginTop: 4,
                }}
              >
                {DAILY_LIMIT} free messages used today. Try again tomorrow.
              </p>
            )}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    background: 'var(--bg3)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    display: 'flex',
                    gap: 5,
                    alignItems: 'center',
                  }}
                >
                  {[0, 1, 2].map(n => (
                    <div
                      key={n}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: 'var(--text3)',
                        animation: `larkPulse 1s ease-in-out ${n * 0.18}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p
                style={{
                  fontSize: 11,
                  color: 'var(--danger)',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'center',
                  letterSpacing: '0.03em',
                }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Input row */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '10px 12px 12px',
              borderTop: '0.5px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={limitReached ? 'Limit reached' : 'Ask a guitar question...'}
              rows={1}
              disabled={limitReached}
              style={{
                flex: 1,
                background: 'var(--bg3)',
                border: '0.5px solid var(--border2)',
                borderRadius: 9,
                color: 'var(--text)',
                fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
                fontSize: 13,
                padding: '8px 11px',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.5,
                transition: 'border-color 0.15s',
                opacity: limitReached ? 0.45 : 1,
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border2)'; }}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || loading || limitReached}
              aria-label="Send message"
              style={{
                width: 44,
                height: 44,
                borderRadius: 9,
                background: !input.trim() || loading || limitReached ? 'var(--bg3)' : 'var(--accent)',
                border: '0.5px solid var(--border2)',
                color: !input.trim() || loading || limitReached ? 'var(--text3)' : 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !input.trim() || loading || limitReached ? 'not-allowed' : 'pointer',
                flexShrink: 0,
                alignSelf: 'flex-end',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes larkPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 639px) {
          .lark-chat-panel {
            bottom: 92px !important;
            right: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-height: 60dvh !important;
            border-radius: 16px 16px 0 0 !important;
          }
        }
      `}</style>
    </>
  );
}
