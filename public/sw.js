// public/sw.js
// Cleanup - Unregister old service worker
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
  // Unregister itself
  self.registration.unregister();
});