/* WHW Trip Companion — offline service worker.
   Caches the app shell so the site works from the trail without signal.
   Strategy: cache-first for the shell + fonts + supabase-js; network for
   live Supabase data (never cached here — falls back to localStorage in app). */
const CACHE = 'whw-shell-v1';
const SHELL = [
  '/',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Cache-first for the shell (navigation) + supabase-js + google fonts css/woff2
  const isShell = e.request.mode === 'navigate' || url.pathname === '/';
  const isFontHost = url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com');
  const isSupabaseJs = url.hostname === 'cdn.jsdelivr.net';
  if (isShell || isFontHost || isSupabaseJs) {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: isFontHost }).then((hit) => hit || fetch(e.request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return resp;
      }).catch(() => caches.match('/')))
    );
    return;
  }
  // Supabase API (data): network-only — offline handling lives in the app (localStorage fallback).
});
