const CACHE_NAME = 'frozen-warriors-v1';

// On install - don't cache anything, always fetch fresh
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

// On activate - clear all old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        return caches.delete(key);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// On fetch - always go to network first, fallback to cache
self.addEventListener('fetch', function(e) {
  // Only handle same-origin requests
  if (!e.request.url.startsWith(self.location.origin)) return;
  
  e.respondWith(
    fetch(e.request).then(function(response) {
      // Cache a copy of the response
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(e.request, clone);
      });
      return response;
    }).catch(function() {
      // Network failed, try cache
      return caches.match(e.request);
    })
  );
});
