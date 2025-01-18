const CACHE_NAME = 'anki-cache-v2'; // Pakeista versija

const urlsToCache = [
    '/anki-pwa/',
    '/anki-pwa/index.html',
    '/anki-pwa/manifest.json',
    'https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js'
];

self.addEventListener('install', event => {
    // Iš karto aktyvuojame naują service worker
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return Promise.all(
                    urlsToCache.map(url => 
                        cache.add(url).catch(error => 
                            console.error(`Failed to cache ${url}:`, error)
                        )
                    )
                );
            })
            .catch(error => {
                console.error('Failed to cache resources:', error);
            })
    );
});

self.addEventListener('activate', event => {
    // Iš karto pradedame kontroliuoti puslapius
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // Išvalome seną cache
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => caches.delete(cacheName))
                );
            })
        ])
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        // Pirma bandome gauti iš tinklo
        fetch(event.request)
            .catch(() => {
                // Jei nepavyksta, grąžiname iš cache
                return caches.match(event.request);
            })
    );
});
