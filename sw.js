const CACHE_NAME = 'angel-tour-app-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,600;14..32,700&family=Poppins:wght@500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Archivos cacheados para modo offline');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('❌ Error al cachear archivos:', error);
      })
  );
  // Activar el SW inmediatamente
  self.skipWaiting();
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, devolverlo
        if (response) {
          return response;
        }
        
        // Si no, hacer la petición a la red
        return fetch(event.request)
          .then(response => {
            // Clonar la respuesta para cachearla
            const responseClone = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                // Solo cachear recursos exitosos y de la misma origen
                if (response.status === 200 && event.request.url.startsWith(self.location.origin)) {
                  cache.put(event.request, responseClone);
                }
              });
            
            return response;
          })
          .catch(() => {
            // Fallback para cuando no hay conexión
            return new Response('Sin conexión a internet', {
              status: 503,
              statusText: 'Servicio no disponible'
            });
          });
      })
  );
});

// Activación y limpieza de cachés antiguos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('🗑️ Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tomar control de todas las pestañas abiertas
  self.clients.claim();
});
