import type { Metadata } from 'next';
import FaqContent from './FaqContent';

export const metadata: Metadata = {
  title: 'FAQ - Lark',
  description: 'Answers about Lark: how the tuner and chord detector work, privacy, features, and billing.',
  openGraph: {
    title: 'FAQ - Lark',
    description: 'Everything you need to know about Lark, the guitar tutor that listens.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function FaqPage() {
  return <FaqContent />;
}
