// Service Worker for GQ Cars PWA
const CACHE_NAME = 'gq-cars-v1.0.0'
const STATIC_CACHE = `${CACHE_NAME}-static`
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`
const API_CACHE = `${CACHE_NAME}-api`

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Add more static assets as needed
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    }).then(() => {
      return self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName.startsWith('gq-cars-') && cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return
  }

  // Skip Google Maps API requests (they should always be fresh)
  if (url.hostname === 'maps.googleapis.com' || url.hostname === 'maps.gstatic.com') {
    return fetch(request)
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - cache with network-first strategy
    event.respondWith(handleApiRequest(request))
  } else if (STATIC_ASSETS.includes(url.pathname)) {
    // Static assets - cache-first strategy
    event.respondWith(handleStaticAssets(request))
  } else {
    // Other requests - stale-while-revalidate strategy
    event.respondWith(handleDynamicRequest(request))
  }
})

// Cache-first strategy for static assets
async function handleStaticAssets(request) {
  try {
    const cache = await caches.open(STATIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Static asset fetch failed:', error)
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/index.html')
    }
    
    throw error
  }
}

// Network-first strategy for API requests with offline fallback
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] API request failed, trying cache:', error)
    
    const cache = await caches.open(API_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      // Add a header to indicate this is from cache
      const response = cachedResponse.clone()
      response.headers.set('X-Cache-Status', 'HIT')
      return response
    }
    
    // Return a fallback response for critical API endpoints
    if (request.url.includes('/location') || request.url.includes('/drivers')) {
      return new Response(JSON.stringify({
        error: 'Service temporarily unavailable',
        offline: true,
        message: 'Please check your internet connection'
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache-Status': 'MISS'
        }
      })
    }
    
    throw error
  }
}

// Stale-while-revalidate strategy for dynamic content
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  // Fetch from network in background
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(error => {
    console.log('[SW] Network request failed:', error)
    return null
  })
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse
  }
  
  // Otherwise wait for network
  return networkPromise || new Response('Offline', { status: 503 })
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'trip-booking') {
    event.waitUntil(syncTripBookings())
  } else if (event.tag === 'emergency-contact') {
    event.waitUntil(syncEmergencyContacts())
  }
})

// Sync trip bookings when back online
async function syncTripBookings() {
  try {
    // Get offline trip bookings from IndexedDB
    const offlineBookings = await getOfflineBookings()
    
    for (const booking of offlineBookings) {
      try {
        const response = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking)
        })
        
        if (response.ok) {
          await removeOfflineBooking(booking.id)
          console.log('[SW] Synced offline booking:', booking.id)
        }
      } catch (error) {
        console.log('[SW] Failed to sync booking:', error)
      }
    }
  } catch (error) {
    console.log('[SW] Background sync failed:', error)
  }
}

// Sync emergency contacts when back online
async function syncEmergencyContacts() {
  try {
    // Implementation would depend on IndexedDB setup
    console.log('[SW] Syncing emergency contacts...')
  } catch (error) {
    console.log('[SW] Emergency contacts sync failed:', error)
  }
}

// Push notifications for trip updates
self.addEventListener('push', (event) => {
  const options = {
    body: 'Your driver is arriving soon!',
    icon: '/icon-192x192.png',
    badge: '/badge-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/tracking',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View Trip',
        icon: '/icon-view.png'
      },
      {
        action: 'contact',
        title: 'Contact Driver',
        icon: '/icon-phone.png'
      }
    ]
  }

  if (event.data) {
    const payload = event.data.json()
    options.body = payload.message || options.body
    options.data = { ...options.data, ...payload }
  }

  event.waitUntil(
    self.registration.showNotification('GQ Cars', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const action = event.action
  const data = event.notification.data

  if (action === 'view') {
    event.waitUntil(
      clients.openWindow(data.url || '/tracking')
    )
  } else if (action === 'contact') {
    event.waitUntil(
      clients.openWindow('/tracking#chat')
    )
  } else {
    // Default click action
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Utility functions for IndexedDB operations
// These would be implemented based on specific offline storage needs
async function getOfflineBookings() {
  // Placeholder - would use IndexedDB to get offline bookings
  return []
}

async function removeOfflineBooking(id) {
  // Placeholder - would remove booking from IndexedDB
  console.log('[SW] Removing offline booking:', id)
}