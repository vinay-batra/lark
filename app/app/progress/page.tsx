'use client';

import { useState } from 'react';
import { getSessions, getStreak, PracticeSession } from '@/lib/practice';

// ── Helpers ───────────────────────────────────────────────────────────────────

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function shortDay(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00');
  return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()];
}

function accuracyColor(acc: number): string {
  if (acc >= 80) return 'var(--accent)';
  if (acc >= 50) return 'var(--sharp)';
  return 'var(--danger)';
}

// ── Sub-charts ────────────────────────────────────────────────────────────────

function AccuracyChart({ sessions }: { sessions: PracticeSession[] }) {
  if (sessions.length < 2) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        Play 2+ songs to see your trend
      </div>
    );
  }

  const W = 560, H = 180;
  const PAD = { top: 14, right: 14, bottom: 28, left: 38 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const n = sessions.length;

  const pts = sessions.map((s, i) => ({
    x: PAD.left + (n === 1 ? cW / 2 : (i / (n - 1)) * cW),
    y: PAD.top + (1 - s.accuracy / 100) * cH,
    acc: s.accuracy,
    title: s.songTitle,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  const areaPath = `${linePath} L${last.x.toFixed(1)},${(PAD.top + cH).toFixed(1)} L${PAD.left.toFixed(1)},${(PAD.top + cH).toFixed(1)} Z`;

  const gridPcts = [25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* Y-axis gridlines */}
      {gridPcts.map(pct => {
        const y = PAD.top + (1 - pct / 100) * cH;
        return (
          <g key={pct}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,4" />
            <text x={PAD.left - 5} y={y + 4} textAnchor="end" fill="var(--text-muted)" fontSize="8" fontFamily="'Space Mono',monospace">{pct}</text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill="rgba(var(--accent-rgb),0.07)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5}
          fill={accuracyColor(p.acc)}
          stroke="var(--card-bg)" strokeWidth="2" />
      ))}

      {/* X-axis label: "LAST N SESSIONS" */}
      <text x={W / 2} y={H - 2} textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="'Space Mono',monospace">
        {`LAST ${n} SESSIONS`}
      </text>
    </svg>
  );
}

function SessionsBarChart({ days }: { days: { key: string; count: number; label: string }[] }) {
  const maxCount = Math.max(...days.map(d => d.count), 1);
  const W = 560, H = 110;
  const PAD = { top: 10, right: 8, bottom: 24, left: 8 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const barW = cW / days.length;
  const gap = barW * 0.3;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {days.map((d, i) => {
        const bH = d.count > 0 ? Math.max(4, (d.count / maxCount) * cH) : 2;
        const x = PAD.left + i * barW + gap / 2;
        const y = PAD.top + cH - bH;
        const w = barW - gap;
        return (
          <g key={d.key}>
            <rect x={x} y={y} width={w} height={bH} rx={2}
              fill={d.count > 0 ? 'var(--accent)' : 'var(--bg3)'}
              opacity={d.count > 0 ? 0.85 : 1} />
            <text x={x + w / 2} y={H - 4} textAnchor="middle"
              fill={d.count > 0 ? 'var(--text-muted)' : 'var(--border2)'}
              fontSize="8" fontFamily="'Space Mono',monospace">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const [sessions] = useState<PracticeSession[]>(() => getSessions());
  const streak = getStreak();

  // Stats summary
  const totalSessions = sessions.length;
  const totalHits = sessions.reduce((s, r) => s + r.hits, 0);
  const avgAcc = sessions.length > 0
    ? Math.round(sessions.reduce((s, r) => s + r.accuracy, 0) / sessions.length)
    : null;
  const bestAcc = sessions.length > 0
    ? Math.max(...sessions.map(s => s.accuracy))
    : null;

  // Accuracy chart: last 20 sessions, oldest first
  const chartSessions = sessions.slice(-20);

  // Sessions per day: last 14 days
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = localDateKey(d);
    return {
      key,
      label: shortDay(key),
      count: sessions.filter(s => localDateKey(new Date(s.completedAt)) === key).length,
    };
  });

  // Best songs (highest accuracy per song)
  const bestBySong = Object.values(
    sessions.reduce((acc, s) => {
      const key = `${s.songTitle}__${s.artist}`;
      if (!acc[key] || acc[key].accuracy < s.accuracy) acc[key] = s;
      return acc;
    }, {} as Record<string, PracticeSession>)
  ).sort((a, b) => b.accuracy - a.accuracy).slice(0, 5);

  // Recent sessions (last 10, newest first)
  const recent = sessions.slice(-10).reverse();

  const empty = sessions.length === 0;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <p className="eyebrow" style={{ marginBottom: 16 }}>YOUR PROGRESS</p>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 40 }}>
        {[
          { val: totalSessions.toString(), label: 'Sessions played', accent: totalSessions > 0 },
          { val: streak > 0 ? `${streak}d` : '0', label: 'Day streak', accent: streak > 0 },
          { val: avgAcc !== null ? `${avgAcc}%` : '--', label: 'Avg accuracy', accent: avgAcc !== null },
          { val: bestAcc !== null ? `${bestAcc}%` : '--', label: 'Best accuracy', accent: bestAcc !== null },
          { val: totalHits.toLocaleString(), label: 'Notes hit total', accent: totalHits > 0 },
        ].map(s => (
          <div key={s.label} style={{ padding: '18px 16px', background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 12 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: s.accent ? 'var(--accent)' : 'var(--text3)', letterSpacing: '-0.02em', marginBottom: 4, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {empty ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          <p style={{ marginBottom: 12 }}>No sessions yet.</p>
          <a href="/app/songs" style={{ color: 'var(--accent)', textDecoration: 'none' }}>PLAY A SONG TO START TRACKING</a>
        </div>
      ) : (
        <>
          {/* Accuracy trend */}
          <div style={{ marginBottom: 32, padding: '22px 22px 16px', background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 14 }}>
            <p className="eyebrow" style={{ marginBottom: 16, fontSize: 9 }}>ACCURACY TREND</p>
            <AccuracyChart sessions={chartSessions} />
            <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
              {[{ color: 'var(--accent)', label: '>=80%' }, { color: 'var(--sharp)', label: '50-79%' }, { color: 'var(--danger)', label: '<50%' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sessions per day */}
          <div style={{ marginBottom: 32, padding: '22px 22px 16px', background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 14 }}>
            <p className="eyebrow" style={{ marginBottom: 16, fontSize: 9 }}>SESSIONS PER DAY (last 14 days)</p>
            <SessionsBarChart days={last14Days} />
          </div>

          {/* Best songs + Recent sessions side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>

            {/* Best songs */}
            <div style={{ padding: '22px 20px', background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 14 }}>
              <p className="eyebrow" style={{ marginBottom: 16, fontSize: 9 }}>TOP SONGS</p>
              {bestBySong.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>No data yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {bestBySong.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', minWidth: 14 }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.songTitle}</p>
                        <p style={{ fontSize: 10, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.artist}</p>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: accuracyColor(s.accuracy), flexShrink: 0 }}>{s.accuracy}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent sessions */}
            <div style={{ padding: '22px 20px', background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 14 }}>
              <p className="eyebrow" style={{ marginBottom: 16, fontSize: 9 }}>RECENT SESSIONS</p>
              {recent.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>No sessions yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recent.map((s) => {
                    const d = new Date(s.completedAt);
                    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
                    return (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', minWidth: 30 }}>{dateStr}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.songTitle}</p>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: accuracyColor(s.accuracy), flexShrink: 0 }}>{s.accuracy}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
