if('serviceWorker' in navigator){
    window.addEventListener('load',()=>{
        navigator.serviceWorker.register('./sw.js').then((reg)=>{
            console.log("registation successfull",reg.scope);
        }).catch((err)=>{
            console.log("error",err);
        })
    })
}

self.addEventListener('install', evt=> {
    console.log("service worker has been installed");
});

var CACHE_VERSION = 1;
var CURRENT_CACHES = {
  font: 'font-cache-v' + CACHE_VERSION
};

self.addEventListener('activate', function(event) {
  var expectedCacheNamesSet = new Set(Object.values(CURRENT_CACHES));
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (!expectedCacheNamesSet.has(cacheName)) {
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('Handling fetch event for', event.request.url);

  event.respondWith(
    caches.open(CURRENT_CACHES.font).then(function(cache) {
      return cache.match(event.request).then(function(response) {
        if (response) {
          console.log(' Found response in cache:', response);
          return response;
        }
        console.log(' No response for %s found in cache. About to fetch ' +
          'from network...', event.request.url);
        return fetch(event.request.clone()).then(function(response) {
          console.log('  Response for %s from network is: %O',
            event.request.url, response);

          if (response.status < 400 &&
              response.headers.has('content-type') &&
              response.headers.get('content-type').match(/^font\//i)) {
            console.log('  Caching the response to', event.request.url);
            cache.put(event.request, response.clone());
          } else {
            console.log('  Not caching the response to', event.request.url);
          }
         return response;
        });
      }).catch(function(error) {
        console.error('  Error in fetch handler:', error);
        throw error;
      });
    })
  );
});
