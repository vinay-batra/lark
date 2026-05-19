'use client';
import { MetronomeView } from '@/components/MetronomeView';
import { motion } from 'framer-motion';
export default function MetronomePage() {
  return (
    <div style={{ maxWidth: 580, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: 32 }}>
        <p className="eyebrow" style={{ marginBottom: 12 }}>METRONOME</p>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Keep time.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text3)', lineHeight: 1.6 }}>
          Accurate to the millisecond using Web Audio scheduling.
        </p>
      </motion.div>
      <MetronomeView />
    </div>
  );
}
