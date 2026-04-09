const STATIC_CACHE = "mermaid-static-v2";
const RUNTIME_CACHE = "mermaid-runtime-v2";

const STATIC_ASSETS = ["./", "./favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

function isCacheableRequest(request) {
  if (request.method !== "GET") {
    return false;
  }
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return false;
  }
  return true;
}

function isStaticAsset(url) {
  return (
    url.pathname.includes("/_next/static/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".ttf") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".webp")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (!isCacheableRequest(request)) {
    return;
  }

  const url = new URL(request.url);

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          void fetch(request)
            .then((response) => {
              if (response && response.ok) {
                caches.open(STATIC_CACHE).then((cache) => cache.put(request, response.clone()));
              }
            })
            .catch(() => undefined);
          return cached;
        }

        return fetch(request).then((response) => {
          if (response && response.ok) {
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
