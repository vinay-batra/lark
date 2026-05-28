import type { Metadata } from 'next';
import ChangelogContent from './ChangelogContent';

export const metadata: Metadata = {
  title: 'Changelog - Lark',
  description: 'Every update to Lark, from the first live tuner to song mode, the learning path, and AI coaching.',
  openGraph: {
    title: 'Changelog - Lark',
    description: 'The story of how Lark was built, version by version.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function ChangelogPage() {
  return <ChangelogContent />;
}
