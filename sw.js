const CACHE_NAME = 'thetechbit-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/products.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching assets');
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(err => console.warn('Failed to cache:', url, err)))
      );
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch (درست شدہ)
self.addEventListener('fetch', event => {
  // صرف GET ریکوئسٹ
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request)
        .then(response => {
          // صرف کامیاب ریسپانس ہی کیش کریں
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // نیٹ ورک فیل ہونے پر کیشڈ ورژن لوٹائیں، اگر موجود ہو
          if (cached) return cached;
          // اگر کیشڈ بھی نہیں تو خالی ریسپانس یا ایرر پیج
          return new Response('Offline - Resource not available', { status: 503 });
        });

      return cached || fetchPromise;
    })
  );
});