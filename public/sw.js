// Lark Service Worker — network-first with static asset caching.
// API routes and auth flows are always fetched from network.

const CACHE = 'lark-v1.3';

const STATIC_PRECACHE = [
  '/',
  '/tuner',
  '/chords',
  '/offline',
];

// Routes to never cache (always hit network)
const BYPASS = [
  '/api/',
  '/auth',
  '/_next/webpack-hmr',
  'supabase.co',
  'anthropic',
];

function shouldBypass(url) {
  return BYPASS.some(p => url.includes(p));
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first, cache fallback ─────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Only handle GET; bypass API / auth / HMR
  if (request.method !== 'GET' || shouldBypass(url)) return;

  event.respondWith(
    fetch(request)
      .then((res) => {
        // Cache successful responses for HTML pages and static assets
        if (res.ok && (res.type === 'basic' || res.type === 'cors')) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
        }
        return res;
      })
      .catch(() =>
        // Network failed -- try cache, else show offline page
        caches.match(request).then((cached) =>
          cached ?? caches.match('/offline')
        )
      )
  );
});
