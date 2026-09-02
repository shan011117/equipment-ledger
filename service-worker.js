// Service Worker - 离线缓存
const CACHE_NAME = 'gyfj-ledger-v2';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './seed-data.json',
    './icon-192.png',
    './icon-512.png',
    './使用说明.html'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                ASSETS.map((url) => {
                    return cache.add(url).catch(() => {
                        console.log('缓存失败:', url);
                    });
                })
            );
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then((cached) => {
            const fetchPromise = fetch(event.request).then((response) => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone).catch(() => {});
                    });
                }
                return response;
            }).catch(() => {
                return cached;
            });
            return cached || fetchPromise;
        })
    );
});
