import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lark',
    short_name: 'Lark',
    description: 'The guitar tutor that listens. Play songs, get scored, improve fast.',
    start_url: '/app',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#080c14',
    theme_color: '#080c14',
    categories: ['music', 'education'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Songs',
        short_name: 'Songs',
        description: 'Browse and play songs',
        url: '/app/songs',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Tuner',
        short_name: 'Tuner',
        description: 'Tune your guitar',
        url: '/app/tuner',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Learn',
        short_name: 'Learn',
        description: 'Learning path',
        url: '/app/learn',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
