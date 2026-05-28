import type { Metadata } from 'next';
import PrivacyContent from './PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy - Lark',
  description: 'How Lark handles your data. All audio is processed locally in your browser and never uploaded or stored.',
  openGraph: {
    title: 'Privacy Policy - Lark',
    description: 'Your audio never leaves your browser. Here is exactly what Lark does and does not collect.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
