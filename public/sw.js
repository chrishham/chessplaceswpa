/** An empty service worker! */
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open('chessPlacesCache').then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});

// self.addEventListener('push', function(event) {
//   event.waitUntil(
//     self.registration.showNotification('Got Push?', {
//       body: 'Push Message received'
//    }));
// });

self.addEventListener('push', ev => {
  const data = ev.data.json();
  console.log('Got push', data);
  self.registration.showNotification(data.title, {
    body: 'Hello, World!',
    icon: 'http://mongoosejs.com/docs/images/mongoose5_62x30_transparent.png'
  });
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('chessPlacesCache').then(function(cache) {
      return cache.addAll(
        [
          '/style.css',
          '/favicon.ico',
          '/index.js',
          '/index.html',
          '/helper.js'
        ]
      );
    })
  );
});