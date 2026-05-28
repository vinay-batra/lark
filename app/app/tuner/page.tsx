'use client';

import { useEffect } from 'react';
import { TunerView } from '@/components/TunerView';
import { markTunerOpened } from '@/lib/missions';

export default function AppTunerPage() {
  // Mark tuner opened today so the "In Tune" daily mission can complete.
  useEffect(() => { markTunerOpened(); }, []);
  return <TunerView />;
}
