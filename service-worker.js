const CACHE_NAME = 'controle-gastos-v4';
const DYNAMIC_CACHE = 'controle-gastos-dynamic-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
          .map(key => {
            console.log('[SW] Removendo cache antigo:', key);
            return caches.delete(key);
          })
      );
    }).then(() => {
      console.log('[SW] Ativação concluída');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Sempre busca na rede para dados do Firestore
        if (event.request.url.includes('firestore.googleapis.com')) {
          return fetchAndCache(event.request);
        }
        return cachedResponse || fetchAndCache(event.request);
      })
  );
});

function fetchAndCache(request) {
  return fetch(request).then(response => {
    // Se for uma resposta válida, armazena no cache dinâmico
    if (response && response.status === 200 && response.type === 'basic') {
      const responseToCache = response.clone();
      caches.open(DYNAMIC_CACHE).then(cache => {
        cache.put(request, responseToCache);
      });
    }
    return response;
  }).catch(() => {
    // Fallback para página offline
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/index.html');
    }
  });
}

self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
