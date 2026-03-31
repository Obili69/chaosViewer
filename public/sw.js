const CACHE_VERSION = 'chaos-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const ASSET_CACHE = `${CACHE_VERSION}-assets`

// Pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(['/', '/login'])
    ).catch(() => {})
  )
  self.skipWaiting()
})

// Clean old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('chaos-') && key !== STATIC_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Never cache API calls (always network)
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // Cache-first for Next.js static chunks (immutable, versioned filenames)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      })
    )
    return
  }

  // Cache-first with 7-day TTL for uploaded files
  if (url.pathname.startsWith('/api/uploads/')) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      })
    )
    return
  }

  // Network-first for all HTML navigation
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached ?? caches.match('/'))
      )
    )
    return
  }
})
