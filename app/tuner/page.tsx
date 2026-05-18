'use client';

import { ToolNav } from '@/components/ToolNav';
import { TunerView } from '@/components/TunerView';

export default function TunerPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <ToolNav active="tuner" />
      <TunerView />
    </div>
  );
}
