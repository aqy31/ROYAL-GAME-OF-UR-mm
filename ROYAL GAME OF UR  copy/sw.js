const CACHE_NAME = 'ur-game-cache-v1';

// أول ما يشتغل الملف
self.addEventListener('install', event => {
    self.skipWaiting();
});

// تفعيل الملف
self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

// هذا الجزء هو اللي يسوي السحر ويحفظ الملفات
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // إذا الملف موجود بالكاش (مخزون سابقاً)، افتحه بدون نت
            if (response) {
                return response;
            }
            // إذا ماكو، جيبه من النت واحفظه للمرات الجاية
            return fetch(event.request).then(fetchResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    // نحفظ نسخة من أي صورة أو صوت أو مكتبة تتحمل
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                });
            }).catch(error => {
                console.log('Offline mode active: ', error);
            });
        })
    );
});
