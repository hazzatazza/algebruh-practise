const CACHE_NAME = 'algebra-cache-v1';

// These are the core files needed to load the UI shell
const INITIAL_ASSETS = [
    './',
    './index.html',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://unpkg.com/@ruffle-rs/ruffle'
];

// 1. Install Stage: Pre-cache the UI
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(INITIAL_ASSETS);
        })
    );
    self.skipWaiting();
});

// 2. Activate Stage: Cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// 3. Fetch Stage: The "Network First" strategy
// This tries the internet first (to get the newest version), 
// but if it fails (offline), it grabs the saved version from cache.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If the network request works, save a copy to the cache
                const resClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, resClone);
                });
                return response;
            })
            .catch(() => {
                // If network fails (offline), look in the cache
                return caches.match(event.request);
            })
    );
});
