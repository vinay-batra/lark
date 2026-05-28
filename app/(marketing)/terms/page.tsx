import type { Metadata } from 'next';
import TermsContent from './TermsContent';

export const metadata: Metadata = {
  title: 'Terms of Service - Lark',
  description: 'The terms of service for using Lark, the guitar tutor that listens.',
  openGraph: {
    title: 'Terms of Service - Lark',
    description: 'The terms for using Lark.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
