import type { Metadata } from 'next';
import { Space_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Lark — The guitar tutor that listens',
  description:
    'Tune, detect chords, follow songs, and get real feedback on your playing. AI-powered guitar coaching in your browser.',
  openGraph: {
    title: 'Lark — The guitar tutor that listens',
    description: 'AI-powered guitar coaching that hears every note you play.',
    type: 'website',
  },
};

const THEME_SCRIPT = `
(function(){try{
  var t = localStorage.getItem('lark_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceMono.variable} data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
