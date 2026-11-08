/* Fankurve Service Worker
 * - App-Dateien: erst Netzwerk (damit Updates sofort ankommen), offline aus dem Cache
 * - Team-Logos: aus dem Cache, im Hintergrund aktualisiert
 * - Sportdaten (API): immer live, offline letzter Stand */
const SHELL = 'fankurve-shell-v1';
const IMAGES = 'fankurve-img-v1';
const DATA = 'fankurve-data-v1';
const PRECACHE = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  const keep = [SHELL, IMAGES, DATA];
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function networkFirst(req, cacheName, matchOpts) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, matchOpts);
    if (hit) return hit;
    if (req.mode === 'navigate') return cache.match('./index.html');
    throw err;
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(IMAGES);
  const hit = await cache.match(req);
  const update = fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || update;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    e.respondWith(networkFirst(req, SHELL, { ignoreSearch: true }));
  } else if (url.hostname === 'a.espncdn.com') {
    e.respondWith(staleWhileRevalidate(req));
  } else if (url.hostname === 'site.api.espn.com') {
    e.respondWith(networkFirst(req, DATA));
  }
});
