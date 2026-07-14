// Service Worker — PWA offline support
const V = "fitness-v3";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
  );
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    (async () => {
      try {
        const res = await fetch(e.request);
        if (res.ok) {
          const clone = res.clone();
          const cache = await caches.open(V);
          cache.put(e.request, clone);
        }
        return res;
      } catch {
        const cache = await caches.open(V);
        const cached = await cache.match(e.request);
        if (cached) return cached;
        // Offline fallback page
        if (e.request.mode === "navigate") {
          const fallback = await cache.match("/");
          if (fallback) return fallback;
        }
        return new Response("Offline", { status: 503 });
      }
    })()
  );
});
