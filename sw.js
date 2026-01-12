const CACHE_NAME = 'orion-hq-v2';
const ASSETS = [
  './',
  './index.html',
  './404.html',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@phosphor-icons/web',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Rajdhani:wght@500;600;700&display=swap'
];

// Install Event: Cache core assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});

// Fetch Event: Stale-while-revalidate strategy
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Return cached response if found
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        // Update cache with new version if network request succeeds
        if (e.request.method === 'GET' && networkResponse.ok) {
           caches.open(CACHE_NAME).then((cache) => {
             cache.put(e.request, networkResponse.clone());
           });
        }
        return networkResponse;
      }).catch(() => {
        // If network fails (offline), stick with cached
      });

      return cachedResponse || fetchPromise;
    })
  );
});
