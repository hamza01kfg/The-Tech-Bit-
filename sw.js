const CACHE_NAME = 'thetechbit-v4';
const BASE_PATH = '/The-Tech-Bit-';
const ASSETS = [
    BASE_PATH + '/',
    BASE_PATH + '/index.html',
    BASE_PATH + '/style.css',
    BASE_PATH + '/app.js',
    BASE_PATH + '/manifest.json',
    BASE_PATH + '/products.json',
    BASE_PATH + '/Images/logos/web-logo-512.png',
    BASE_PATH + '/Images/favicons/favicon-192.png',
    BASE_PATH + '/Images/favicons/favicon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
];
self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => Promise.allSettled(ASSETS.map(url => cache.add(url).catch(err=>console.warn(url,err))))));
    self.skipWaiting();
});
self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
    self.clients.claim();
});
self.addEventListener('fetch', event => {
    if(event.request.method!=='GET') return;
    event.respondWith(caches.match(event.request).then(cached => fetch(event.request).then(res=>{ if(res&&res.status===200&&res.type==='basic'){ const clone=res.clone(); caches.open(CACHE_NAME).then(cache=>cache.put(event.request,clone)); } return res; }).catch(()=>cached || new Response('Offline',{status:503}))));
});
