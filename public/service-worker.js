/* Hand-written service worker: caches the app shell so the app can be
   installed and opened offline. Bump CACHE_NAME to force an update. */

const CACHE_NAME = 'meme-generator-v2'

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './img/Trollface.png',
  './favicon.ico',
  './android-chrome-192x192.png',
  './android-chrome-512x512.png',
  './apple-touch-icon.png'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const {request} = event
  const url = new URL(request.url)

  // Only handle same-origin GETs; leave imgflip, ads and analytics alone
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // Pages: network first so updates show up, fall back to the cached shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Only the app itself is the offline shell, not other pages like privacy.html
          if (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy))
          }
          return response
        })
        .catch(() => caches.match('./index.html'))
    )
    return
  }

  // Static assets: serve from cache, refresh in the background
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
          }
          return response
        })
        .catch(() => cached)
      return cached || network
    })
  )
})
