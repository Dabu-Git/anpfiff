/* Anpfiff Service Worker
 * - App-Dateien: erst Netzwerk (damit Updates sofort ankommen), offline aus dem Cache
 * - Team-Logos und Schriften: aus dem Cache (Logos werden wöchentlich erneuert)
 * - Sportdaten (API): immer live, offline letzter Stand */
const SHELL = 'anpfiff-shell-v3';
const DATA = 'anpfiff-data-v3';
const FONTS = 'anpfiff-font-v1';
const WEEK = Math.floor(Date.now() / 6048e5);
const IMG_PREFIX = 'anpfiff-img-w';
const IMAGES = IMG_PREFIX + WEEK;
const DATA_MAX = 60;
const PRECACHE = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];

// Behalten: aktuelle Caches und die Logos der Vorwoche (als Offline-Reserve)
const keep = k => [SHELL, DATA, FONTS, IMAGES, IMG_PREFIX + (WEEK - 1)].includes(k);
const cleanup = () => caches.keys().then(keys => Promise.all(keys.filter(k => !keep(k)).map(k => caches.delete(k))));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(cleanup().then(() => self.clients.claim()));
});

// Älteste Einträge entfernen, damit der Daten-Cache nicht unbegrenzt wächst
async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map(k => cache.delete(k)));
}
let writes = 0;

async function networkFirst(req, cacheName, matchOpts, max) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) {
      const done = cache.put(req, res.clone());
      if (max && ++writes % 20 === 0) done.then(() => trim(cacheName, max)).catch(() => {});
    }
    return res;
  } catch (err) {
    const hit = await cache.match(req, matchOpts);
    if (hit) return hit;
    if (req.mode === 'navigate') return cache.match('./index.html');
    throw err;
  }
}

// Logos ändern sich fast nie: direkt aus dem Cache, ohne jedes Mal das Netz zu fragen.
// Der Abruf läuft mit CORS, damit die Antwort prüfbar ist und wenig Speicher belegt.
async function cachedImage(req) {
  const cache = await caches.open(IMAGES);
  const hit = await cache.match(req.url);
  if (hit) return hit;
  try {
    const res = await fetch(req.url, { mode: 'cors', credentials: 'omit' });
    if (res.ok) cache.put(req.url, res.clone());
    return res;
  } catch (err) {
    return (await caches.match(req.url)) || fetch(req);
  }
}

async function cachedFont(req, revalidate) {
  const cache = await caches.open(FONTS);
  const hit = await cache.match(req);
  if (hit && !revalidate) return hit;
  const update = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; });
  if (!hit) return update;
  update.catch(() => {});
  return hit;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    e.respondWith(networkFirst(req, SHELL, { ignoreSearch: true }));
  } else if (url.hostname === 'a.espncdn.com') {
    e.respondWith(cachedImage(req));
  } else if (url.hostname === 'site.api.espn.com' || url.hostname === 'de.wikipedia.org') {
    e.respondWith(networkFirst(req, DATA, undefined, DATA_MAX));
  } else if (url.hostname === 'fonts.gstatic.com') {
    e.respondWith(cachedFont(req, false));
  } else if (url.hostname === 'fonts.googleapis.com') {
    e.respondWith(cachedFont(req, true));
  }
});
