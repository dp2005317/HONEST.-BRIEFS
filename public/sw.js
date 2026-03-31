const SHELL_CACHE = 'hb-shell-v1';
const RUNTIME_CACHE = 'hb-runtime-v1';
const APP_SHELL = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/logo.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, '/offline.html'));
    return;
  }

  if (url.pathname.startsWith('/api/news')) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    APP_SHELL.includes(url.pathname)
  ) {
    event.respondWith(cacheFirst(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, fallbackPath) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = (await cache.match(request)) || (await caches.match(request));
    if (cached) {
      return cached;
    }

    if (request.mode === 'navigate' && fallbackPath) {
      return caches.match(fallbackPath);
    }

    if (request.headers.get('accept')?.includes('application/json')) {
      return new Response(JSON.stringify({ articles: [], hasMore: false, offline: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    throw error;
  }
}
