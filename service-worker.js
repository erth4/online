const CACHE_VERSION = 'b4f9a1d';
const CACHE_NAME = `user-online-pwa-${CACHE_VERSION}`;

const urlsToCache = [
    '/',
    '/index.html',
    '/main.css',
    '/db.js',
    '/helper.js',
    '/main.js',
    '/favicon.ico'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("message", event => {
    const data = event.data;
    if (data.type === "SHOW_ACTIVE_USERS") {
        self.registration.showNotification("📊 Pengguna Aktif", {
            body: `Saat ini ada ${data.count} pengguna aktif.`,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: "active-users",
            renotify: false
        });
    }
});

self.addEventListener("notificationclick", event => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
            for (let client of windowClients) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow("https://user-online.vercel.app");
            }
        })
    );
});
