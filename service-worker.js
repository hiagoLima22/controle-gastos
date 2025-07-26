const CACHE_NAME = "controle-gastos-cache-v2";
const DYNAMIC_CACHE_NAME = "controle-gastos-dynamic-v1";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js",
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"
];

// Estratégia: Cache First, falling back to Network
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Cache aberto");
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação - Limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE_NAME) {
            console.log("Removendo cache antigo:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia: Stale-While-Revalidate para melhor performance
self.addEventListener("fetch", (event) => {
  // Ignora requisições de chrome-extension ou não GET
  if (!event.request.url.startsWith('http') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Atualiza o cache dinâmico
        return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });

      // Retorna do cache se existir, enquanto atualiza em background
      return cachedResponse || fetchPromise;
    }).catch(() => {
      // Fallback para página offline se disponível
      if (event.request.headers.get('accept').includes('text/html')) {
        return caches.match('/index.html');
      }
    })
  );
});

// Mensagens para atualização da UI
self.addEventListener("message", (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
