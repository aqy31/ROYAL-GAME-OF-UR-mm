const CACHE_NAME = 'ur-game-cache-pro-v1';

// تنصيب السيرفس ووركر
self.addEventListener('install', (event) => {
    self.skipWaiting(); // تفعيل فوري للإصدار الجديد
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache); // مسح الكاش القديم لتوفير المساحة
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// الحركة السحرية: جلب الملفات
self.addEventListener('fetch', (event) => {
    // تجاهل طلبات الأونلاين (PeerJS) حتى لا تتعطل الغرف
    if (event.request.url.includes('peerjs') || event.request.url.includes('stun')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // 1. إذا الملف موجود في الكاش (سبق تحميله)، افتحه فوراً بصفر ثانية!
            if (cachedResponse) {
                return cachedResponse;
            }

            // 2. إذا الملف غير موجود، حمله من النت، ثم احفظه في الكاش للمرة القادمة
            return fetch(event.request).then((networkResponse) => {
                // التأكد من أن الرد سليم قبل حفظه
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // في حال انقطاع النت كلياً
                console.log('You are offline and asset is not cached.');
            });
        })
    );
});
