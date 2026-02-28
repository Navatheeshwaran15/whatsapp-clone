const CACHE_NAME = 'chatflow-v1';

// Resources to cache on install (app shell)
const APP_SHELL_URLS = [
  '/',
  '/manifest.json',
  '/assets/generated/pwa-icon-192.dim_192x192.png',
  '/assets/generated/pwa-icon-512.dim_512x512.png',
  '/assets/generated/chatflow-logo.dim_256x256.png',
  '/assets/generated/default-avatar.dim_128x128.png',
];

// Patterns to NEVER cache — ICP/Internet Identity API calls
function isICPRequest(url) {
  return (
    url.includes('.ic0.app') ||
    url.includes('.icp0.io') ||
    url.includes('canister') ||
    url.includes('identity.ic0.app') ||
    url.includes('internetcomputer.org')
  );
}

// Install: cache the app shell
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL_URLS).catch(function (err) {
        console.warn('Some app shell resources could not be cached:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) {
            return name !== CACHE_NAME;
          })
          .map(function (name) {
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first for app shell, network-only for ICP API calls
self.addEventListener('fetch', function (event) {
  const url = event.request.url;

  // Never intercept ICP/Internet Identity requests
  if (isICPRequest(url)) {
    return;
  }

  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Not in cache — fetch from network and cache for next time
      return fetch(event.request).then(function (networkResponse) {
        // Only cache successful responses
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(function () {
        // Offline fallback: return the cached root if available
        return caches.match('/');
      });
    })
  );
});
