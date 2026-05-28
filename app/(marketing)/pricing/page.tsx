import type { Metadata } from 'next';
import PricingContent from './PricingContent';

export const metadata: Metadata = {
  title: 'Pricing - Lark',
  description: 'The tuner and chord detector are free forever. Pro and Studio plans add higher limits and team features when paid plans launch.',
  openGraph: {
    title: 'Pricing - Lark',
    description: 'Free forever tuner and chord detector. Pro and Studio plans coming soon.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function PricingPage() {
  return <PricingContent />;
}
