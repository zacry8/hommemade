// Service Worker for Future-Proof Image Optimization
const CACHE_NAME = 'hommemade-images-v1';
const IMAGE_CACHE_NAME = 'hommemade-optimized-images-v1';

// Images to pre-cache for offline availability
const ESSENTIAL_IMAGES = [
  '/portfolio/branding/ahrt__ad_neon-classic.png',
  '/portfolio/branding/playoutside__earthday-merch_drop.png',
  '/portfolio/graphic-design/AHrT-Evil-Eye-Brand-Identity-1.jpg'
];

// Install event - pre-cache essential images
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(IMAGE_CACHE_NAME).then(cache => {
      console.log('🔧 Service Worker: Pre-caching essential images');
      return cache.addAll(ESSENTIAL_IMAGES.map(img => {
        // Try optimized version first, fallback to original
        const optimizedUrl = `/_vercel/image?url=${encodeURIComponent(img)}&w=800&q=75`;
        return optimizedUrl;
      }));
    }).catch(error => {
      console.warn('Service Worker: Pre-cache failed, continuing without cache:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - intelligent image caching and optimization fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Handle image requests
  if (event.request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|webp|avif)$/i)) {
    event.respondWith(handleImageRequest(event.request));
  }
  // Handle Vercel image optimization requests
  else if (url.pathname.startsWith('/_vercel/image')) {
    event.respondWith(handleOptimizedImageRequest(event.request));
  }
});

// Handle regular image requests with smart caching
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  
  try {
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📦 Service Worker: Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('💾 Service Worker: Cached image:', request.url);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('🚨 Service Worker: Image fetch failed:', request.url, error);
    
    // Try to return cached version as last resort
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline placeholder if available
    return new Response('Image unavailable offline', { 
      status: 404, 
      statusText: 'Not Found' 
    });
  }
}

// Handle Vercel optimized image requests with fallback strategy
async function handleOptimizedImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const url = new URL(request.url);
  
  try {
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📦 Service Worker: Serving optimized image from cache:', request.url);
      return cachedResponse;
    }
    
    // Try to fetch optimized version
    const optimizedResponse = await fetch(request);
    
    if (optimizedResponse.ok) {
      // Cache the optimized version
      cache.put(request, optimizedResponse.clone());
      console.log('💾 Service Worker: Cached optimized image:', request.url);
      return optimizedResponse;
    }
    
    // If optimization fails, try original image
    const originalUrl = decodeURIComponent(url.searchParams.get('url'));
    if (originalUrl) {
      console.warn('⚠️ Service Worker: Optimization failed, trying original:', originalUrl);
      
      const originalRequest = new Request(originalUrl, {
        mode: 'cors',
        credentials: 'same-origin'
      });
      
      const originalResponse = await fetch(originalRequest);
      
      if (originalResponse.ok) {
        // Cache the original as backup
        cache.put(originalRequest, originalResponse.clone());
        return originalResponse;
      }
    }
    
    throw new Error('Both optimized and original image failed');
    
  } catch (error) {
    console.error('🚨 Service Worker: Optimized image request failed:', request.url, error);
    
    // Try cached original as last resort
    const originalUrl = decodeURIComponent(url.searchParams.get('url') || '');
    if (originalUrl) {
      const originalRequest = new Request(originalUrl);
      const cachedOriginal = await cache.match(originalRequest);
      if (cachedOriginal) {
        console.log('🔄 Service Worker: Fallback to cached original:', originalUrl);
        return cachedOriginal;
      }
    }
    
    // Return error response
    return new Response('Optimized image unavailable', { 
      status: 404, 
      statusText: 'Not Found' 
    });
  }
}

// Message handling for cache management
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(IMAGE_CACHE_NAME).then(() => {
        console.log('🗑️ Service Worker: Image cache cleared');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  if (event.data && event.data.type === 'PRELOAD_IMAGES') {
    const imageUrls = event.data.urls || [];
    event.waitUntil(
      preloadImages(imageUrls).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

// Preload specific images
async function preloadImages(imageUrls) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  
  const preloadPromises = imageUrls.map(async url => {
    try {
      // Try optimized version first
      const optimizedUrl = `/_vercel/image?url=${encodeURIComponent(url)}&w=800&q=75`;
      const response = await fetch(optimizedUrl);
      
      if (response.ok) {
        await cache.put(optimizedUrl, response.clone());
        console.log('📥 Service Worker: Preloaded optimized:', url);
      } else {
        // Fallback to original
        const originalResponse = await fetch(url);
        if (originalResponse.ok) {
          await cache.put(url, originalResponse.clone());
          console.log('📥 Service Worker: Preloaded original:', url);
        }
      }
    } catch (error) {
      console.warn('⚠️ Service Worker: Failed to preload:', url, error);
    }
  });
  
  await Promise.allSettled(preloadPromises);
}