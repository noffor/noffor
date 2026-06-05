// public/sw.js
const CACHE_NAME = 'noffor-v2';
const PRECACHE = ['/qa/en', '/default-avatar.png', '/logo.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.match(/\.(js|css|woff2|png|jpg|svg|webp|avif)$/)) {
    event.respondWith(caches.match(event.request).then((c) => c || fetch(event.request)));
    return;
  }
  if (url.hostname.includes('supabase.co')) return;
  event.respondWith(
    fetch(event.request).then((r) => {
      const clone = r.clone();
      caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
      return r;
    }).catch(() => caches.match(event.request))
  );
});