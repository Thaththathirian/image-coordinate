const CACHE_VERSION = 'v6';
const STATIC_CACHE = `static-assets-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-assets-${CACHE_VERSION}`;
const IMAGE_CACHE = `image-assets-${CACHE_VERSION}`;

// Core shell that must be cached for the app to boot offline
const APP_SHELL = [
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
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
            .filter((key) => ![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE].includes(key))
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
    // Special handling for assets that should be cached aggressively
    if (requestUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
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

  // Match by request or fallback to the stored index.html
  const cachedPage =
    (await cache.match(event.request, { ignoreSearch: true })) ||
    (await cache.match('/index.html')) ||
    (await cache.match('index.html')) ||
    (await cache.match('./index.html'));

  try {
    const networkResponse = await fetch(event.request);
    // Cache the HTML page for offline use
    if (networkResponse.ok) {
      cache.put('/index.html', networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // Always try to serve cached content when offline
    if (cachedPage) {
      return cachedPage;
    }

    // If no cached page is available, serve a simple HTML page that can load the app
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Image Coordinator - Offline</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f3f4f6;
            color: #374151;
          }
          .container {
            text-align: center;
            max-width: 400px;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h2>You're offline</h2>
          <p>Loading your previously saved work...</p>
          <p class="text-sm text-gray-600 mt-4">If this takes too long, please check your internet connection.</p>
        </div>
        <script>
          // Try to reload the page after a short delay to allow network recovery
          setTimeout(() => {
            if (navigator.onLine) {
              window.location.reload();
            }
          }, 3000);
        </script>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
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
    // Return a placeholder or error response for images
    if (request.url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
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
  } catch (error) {
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
  } catch (error) {
    // For data URLs, we can try to return the original request
    return fetch(request).catch(() => {
      return new Response('', {
        status: 404,
        statusText: 'Data URL not available offline'
      });
    });
  }
}