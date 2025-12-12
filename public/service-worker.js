const CACHE_VERSION = 'v2';
const STATIC_CACHE = `static-assets-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-assets-${CACHE_VERSION}`;

// Core shell that must be cached for the app to boot offline
const APP_SHELL = [
  '/',
  '/index.html',
  './',
  './index.html',
  '/manifest.webmanifest',
  '/logo-dark.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![STATIC_CACHE, DYNAMIC_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  // Always serve navigation requests from cache first so refresh works offline
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));
    return;
  }

  const requestUrl = new URL(request.url);

  // Same-origin assets: prefer cache, refresh in background
  if (requestUrl.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Third-party (e.g. fonts) use network-first with cache fallback
  event.respondWith(networkWithFallback(request, DYNAMIC_CACHE));
});

async function handleNavigation(event) {
  const cache = await caches.open(STATIC_CACHE);

  // Match by request or fallback to the stored index.html
  const cachedPage =
    (await cache.match(event.request, { ignoreSearch: true })) ||
    (await cache.match('/index.html')) ||
    (await cache.match('index.html'));

  try {
    const networkResponse = await fetch(event.request);
    cache.put('/index.html', networkResponse.clone());
    return networkResponse;
  } catch {
    if (cachedPage) return cachedPage;

    return new Response('Offline copy unavailable.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request, { ignoreSearch: true });

  const networkPromise = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return new Response('Offline copy unavailable.', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' },
  });
}

async function networkWithFallback(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request, { ignoreSearch: true });

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('Offline copy unavailable.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}