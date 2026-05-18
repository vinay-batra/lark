'use client';

import { ToolNav } from '@/components/ToolNav';
import { ChordsView } from '@/components/ChordsView';

export default function ChordsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <ToolNav active="chords" />
      <ChordsView />
    </div>
  );
}
