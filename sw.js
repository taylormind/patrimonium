/**
 * Patrono — Service Worker
 * Cache-first com fallback de rede. Bump CACHE_VERSION pra invalidar caches antigos.
 */

const CACHE_VERSION = 'patrono-v9';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './manifest.json',
  './assets/icon.svg',
  './assets/icon-maskable.svg',
];

// Recursos externos comuns — cacheados sob demanda (não bloqueia install se falhar)
const RUNTIME_CDN_HOSTS = [
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

// ── INSTALL ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ──
self.addEventListener('fetch', event => {
  const req = event.request;
  // Só GET — não cacheia POST/PUT etc.
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isCdn = RUNTIME_CDN_HOSTS.includes(url.hostname);
  const isLocal = url.origin === self.location.origin;

  // Só cacheia local + CDNs conhecidos
  if (!isLocal && !isCdn) return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // Atualiza em background (stale-while-revalidate leve)
        fetchAndCache(req).catch(() => {});
        return cached;
      }
      return fetchAndCache(req).catch(() => {
        // Offline + sem cache → para navegação, devolve a home
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});

async function fetchAndCache(req) {
  const response = await fetch(req);
  if (response.ok && (response.type === 'basic' || response.type === 'cors')) {
    const cache = await caches.open(CACHE_VERSION);
    cache.put(req, response.clone());
  }
  return response;
}
