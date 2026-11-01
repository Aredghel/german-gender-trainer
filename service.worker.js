const CACHE_NAME = "german-gender-trainer-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./vocabulary-part1.js",
  "./vocabulary-part2.js",
  "./vocabulary-part3.js",
  "./vocabulary-part4.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(networkResponse => {

            if (
              !networkResponse ||
              networkResponse.status !== 200
            ) {
              return networkResponse;
            }

            const responseClone =
              networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(
                  event.request,
                  responseClone
                );
              });

            return networkResponse;
          });
      })
      .catch(() => {
        return caches.match("./index.html");
      })
  );
});