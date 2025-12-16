const CACHE_VERSION = 'generate-v1';
const STATIC_CACHE = `generate-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `generate-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `generate-images-${CACHE_VERSION}`;

// Core shell that must be cached for the app to boot offline
const APP_SHELL = [
  '/generate/',
  '/generate/index.html',
  '/generate/manifest.webmanifest',
  '/generate/icons/icon-192.png',
  '/generate/icons/icon-512.png',
];

// Supported image extensions (only png, jpg, jpeg as requested)
const SUPPORTED_IMAGE_EXTENSIONS = /\.(png|jpe?g)$/i;

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
            .filter((key) => ![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // const url = new URL(event.request.url);

 // 🚫 IMPORTANT: do NOT control the Generate app
  // if (url.pathname.startsWith('/generate/')) {
  //   return;
  // }

  if (request.method !== 'GET') {
    return;
  }

  // Always serve navigation requests from cache first so refresh works offline
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));
    return;
  }

  const requestUrl = new URL(request.url);

  // Handle blob URLs (uploaded images) - cache them
  if (requestUrl.protocol === 'blob:') {
    event.respondWith(cacheBlobRequest(request, IMAGE_CACHE));
    return;
  }

  // Handle data URLs (base64 encoded images)
  if (requestUrl.protocol === 'data:') {
    event.respondWith(cacheDataRequest(request, IMAGE_CACHE));
    return;
  }

  // Same-origin assets: prefer cache, refresh in background
  if (requestUrl.origin === self.location.origin) {
    // Special handling for images (only png, jpg, jpeg)
    if (requestUrl.pathname.match(SUPPORTED_IMAGE_EXTENSIONS)) {
      event.respondWith(cacheFirst(request, IMAGE_CACHE));
      return;
    }

    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Third-party (e.g. fonts) use network-first with cache fallback
  event.respondWith(networkWithFallback(request, DYNAMIC_CACHE));
});

async function handleNavigation(event) {
  const cache = await caches.open(STATIC_CACHE);

  try {
    const networkResponse = await fetch(event.request);
    if (networkResponse && networkResponse.ok) {
      cache.put('/generate/index.html', networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network failed');
  } catch {
    return (
      (await cache.match('/generate/')) ||
      (await cache.match('/generate/index.html'))
    );
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

// Cache-first strategy for images and static assets
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return a placeholder or error response for images (only png, jpg, jpeg)
    if (request.url.match(SUPPORTED_IMAGE_EXTENSIONS)) {
      return new Response('', {
        status: 404,
        statusText: 'Image not available offline'
      });
    }
    throw error;
  }
}

// Handle blob URLs (uploaded files)
async function cacheBlobRequest(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
      // Clone the response before caching
      const responseClone = networkResponse.clone();
      // Use a stable key for blob URLs since they change on each upload
      const cacheKey = new Request(request.url.split('#')[0] || request.url);
      cache.put(cacheKey, responseClone);
    }
    return networkResponse;
  } catch {
    return new Response('', {
      status: 404,
      statusText: 'Blob not available offline'
    });
  }
}

// Handle data URLs (base64 encoded content)
async function cacheDataRequest(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    return networkResponse;
  } catch {
    // For data URLs, we can try to return the original request
    return fetch(request).catch(() => {
      return new Response('', {
        status: 404,
        statusText: 'Data URL not available offline'
      });
    });
  }
}