const VERSION = '__BUILD_VERSION__';
const PRECACHE = [/*__PRECACHE__*/];
const CACHE = `qweryt-${VERSION}`;
const RUNTIME = 'qweryt-runtime';

const precache = async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(PRECACHE.map(url => new Request(url, { cache: 'reload' })));
};

const cleanup = async () => {
    const keys = await caches.keys();
    const stale = keys.filter(key => key.startsWith('qweryt-') && key !== CACHE && key !== RUNTIME);
    await Promise.all(stale.map(key => caches.delete(key)));
    await self.clients.claim();
};

self.addEventListener('install', event => {
    if (!self.registration.active) self.skipWaiting();
    event.waitUntil(precache());
});

self.addEventListener('message', event => {
    if (event.data === 'skip-waiting') self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(cleanup());
});

const fromPrecache = async request => {
    const cache = await caches.open(CACHE);
    return cache.match(request);
};

const shellResponse = async request => (await fromPrecache('/')) ?? fetch(request);

const cacheFirst = async request => {
    const cached = await fromPrecache(request);
    if (cached) return cached;
    const runtime = await caches.open(RUNTIME);
    const stored = await runtime.match(request);
    if (stored) return stored;
    const response = await fetch(request);
    if (response.ok) runtime.put(request, response.clone());
    return response;
};

self.addEventListener('fetch', event => {
    const { request } = event;
    if (request.method !== 'GET') return;
    if (new URL(request.url).origin !== self.location.origin) return;

    event.respondWith(request.mode === 'navigate' ? shellResponse(request) : cacheFirst(request));
});
