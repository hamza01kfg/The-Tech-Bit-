// Service Worker for The Tech Bit PWA
// یہ فائل GitHub Pages کے سب فولڈر میں کام کرنے کے لیے ترتیب دی گئی ہے

const CACHE_NAME = 'thetechbit-v4';
const BASE_PATH = '/The-Tech-Bit-';  // 👈 اپنے ریپو کے نام کے مطابق

// وہ تمام فائلیں جو پہلے سے کیش (cache) کرنی ہیں
const ASSETS = [
    BASE_PATH + '/',
    BASE_PATH + '/index.html',
    BASE_PATH + '/style.css',
    BASE_PATH + '/app.js',
    BASE_PATH + '/manifest.json',
    BASE_PATH + '/products.json',
    BASE_PATH + '/Images/logos/web-logo-512.png',         // لوگو
    BASE_PATH + '/Images/favicons/favicon-192.png',       // فیویکون
    BASE_PATH + '/Images/favicons/favicon-512.png',       // فیویکون
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
];

// ====== انسٹال (Install) ایونٹ ======
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Service Worker: Caching assets');
            return Promise.allSettled(
                ASSETS.map(url => {
                    return cache.add(url).catch(err => {
                        console.warn('Failed to cache:', url, err);
                    });
                })
            );
        })
    );
    self.skipWaiting(); // فوراً ایکٹیو ہو جائے
});

// ====== ایکٹیویٹ (Activate) ایونٹ ======
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => {
                    console.log('Service Worker: Deleting old cache:', key);
                    return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim(); // تمام کھلے صفحات پر فوراً کنٹرول حاصل کرے
});

// ====== فیچ (Fetch) ایونٹ (درست شدہ) ======
self.addEventListener('fetch', event => {
    // صرف GET ریکوئسٹس کے لیے
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            // نیٹ ورک سے فیچ کریں
            const fetchPromise = fetch(event.request)
                .then(response => {
                    // اگر ریسپانس صحیح ہے تو اسے کیش میں محفوظ کر لیں
                    if (response && response.status === 200 && response.type === 'basic') {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, clone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // نیٹ ورک فیل ہونے پر کیشڈ ورژن لوٹائیں
                    if (cached) {
                        return cached;
                    }
                    // اگر کیشڈ بھی نہیں ہے تو
                    return new Response('Offline - Resource not available', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });

            // کیشڈ ریسپانس پہلے لوٹائیں، نیٹ ورک بعد میں
            return cached || fetchPromise;
        })
    );
});

console.log('Service Worker: Loaded successfully');
