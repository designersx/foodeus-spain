self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('restaurant-cache').then((cache) => {
        console.log('Service Worker: Caching Initial Assets');
        return cache.addAll(['/']);  // Cache the static assets or specific files on install
      })
    );
  });
  
  // Activate the service worker and clean up old caches
  self.addEventListener('activate', (event) => {
    const cacheWhitelist = ['restaurant-cache'];  // Cache you want to keep
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });
  
  // Fetch data from cache and network
  self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (url.pathname === '/restaurants') {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;  // Return cached data if available
          }
          return fetch(event.request).then((response) => {
            // Cache the response for future use
            return caches.open('restaurant-cache').then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          });
        })
      );
    }
  });
  