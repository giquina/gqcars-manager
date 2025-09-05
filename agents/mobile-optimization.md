# Mobile Optimization Specialist Agent

## Role
I ensure ARMORA delivers exceptional mobile performance, responsiveness, and native-like experience across all devices and platforms.

## Expertise Areas
- Progressive Web App (PWA) optimization
- Mobile performance and battery efficiency
- Touch interactions and gestures
- Responsive design and viewport handling
- Service workers and offline functionality
- Mobile-specific APIs (vibration, notifications)
- Cross-platform compatibility
- App store deployment preparation

## Current Mobile Status Analysis

### Strengths
- Mobile-first responsive design
- Touch-friendly interface
- Good use of viewport meta tags
- Smooth scrolling and interactions

### Critical Issues
- No PWA manifest file
- Missing service worker
- iOS Safari specific bugs
- No offline functionality
- Battery drain from continuous GPS
- Large bundle size affecting load times
- Missing native mobile features

## PWA Implementation

### 1. Web App Manifest
```json
// public/manifest.json
{
  "name": "ARMORA Security Transport",
  "short_name": "ARMORA",
  "description": "Premium security transport booking platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#F59E0B",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["transportation", "business", "travel"],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### 2. Service Worker Implementation
```javascript
// public/sw.js
const CACHE_NAME = 'armora-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event with offline fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .catch(() => {
            // Offline fallback
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync for bookings
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncPendingBookings());
  }
});
```

### 3. PWA Registration
```javascript
// src/pwa.ts
export const registerPWA = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Update available notification
          registration.addEventListener('updatefound', () => {
            showUpdateNotification();
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }

  // Install prompt
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
  });
};
```

## Touch Interactions & Gestures

### 1. Enhanced Touch Handling
```javascript
const touchGestures = {
  // Swipe navigation
  swipeLeft: () => goBack(),
  swipeRight: () => openMenu(),
  
  // Map interactions
  doubleTap: (event) => {
    const map = mapRef.current;
    map.setZoom(map.getZoom() + 1);
    map.setCenter(event.latLng);
  },
  
  // Long press for context menu
  longPress: (element, callback) => {
    let pressTimer;
    
    element.addEventListener('touchstart', (e) => {
      pressTimer = setTimeout(() => {
        navigator.vibrate(50); // Haptic feedback
        callback(e);
      }, 800);
    });
    
    element.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
    });
  }
};
```

### 2. Pull-to-Refresh
```javascript
const usePullToRefresh = (onRefresh) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const handleTouchStart = (e) => {
    startY = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e) => {
    if (window.scrollY === 0) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      
      if (distance > 0) {
        setPullDistance(Math.min(distance, 120));
      }
    }
  };
  
  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      onRefresh().finally(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      });
    } else {
      setPullDistance(0);
    }
  };
};
```

## Performance Optimizations

### 1. Bundle Size Optimization
```javascript
// Vite config for mobile optimization
export default defineConfig({
  plugins: [
    react(),
    // PWA plugin
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    }),
    // Bundle analyzer
    bundleAnalyzer()
  ],
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          maps: ['@googlemaps/js-api-loader'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    },
    
    // Minification for mobile
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

### 2. Lazy Loading Implementation
```javascript
// Route-based code splitting
const Welcome = lazy(() => import('./screens/Welcome'));
const Home = lazy(() => import('./screens/Home'));
const TripTracking = lazy(() => import('./screens/TripTracking'));

// Suspense wrapper
const LazyWrapper = ({ children }) => (
  <Suspense fallback={<SkeletonScreen />}>
    {children}
  </Suspense>
);

// Image lazy loading
const LazyImage = ({ src, alt, className }) => {
  const [imgRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  return (
    <div ref={imgRef} className={className}>
      {inView && <img src={src} alt={alt} loading="lazy" />}
    </div>
  );
};
```

### 3. Memory Management
```javascript
const useMemoryOptimization = () => {
  useEffect(() => {
    // Clean up intervals on component unmount
    return () => {
      clearAllIntervals();
      clearLocationWatchers();
      removeEventListeners();
    };
  }, []);
  
  // Throttle location updates
  const throttledLocationUpdate = useCallback(
    throttle((location) => {
      updateLocation(location);
    }, 5000), // 5 second throttle
    []
  );
};
```

## Device-Specific Optimizations

### 1. iOS Safari Fixes
```css
/* Viewport height fix for iOS */
.full-height {
  height: 100vh;
  height: -webkit-fill-available;
}

/* Safe area handling */
.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Prevent zoom on input focus */
input, select, textarea {
  font-size: 16px;
}

/* Smooth scrolling */
* {
  -webkit-overflow-scrolling: touch;
}
```

### 2. Android Optimizations
```javascript
// Chrome address bar handling
const useViewportHeight = () => {
  const [vh, setVh] = useState(window.innerHeight * 0.01);
  
  useEffect(() => {
    const updateVh = () => {
      setVh(window.innerHeight * 0.01);
    };
    
    window.addEventListener('resize', updateVh);
    window.addEventListener('orientationchange', updateVh);
    
    return () => {
      window.removeEventListener('resize', updateVh);
      window.removeEventListener('orientationchange', updateVh);
    };
  }, []);
  
  useEffect(() => {
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }, [vh]);
};
```

## Native Feature Integration

### 1. Vibration API
```javascript
const useHapticFeedback = () => {
  const vibrate = (pattern) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };
  
  return {
    light: () => vibrate(50),
    medium: () => vibrate(100),
    heavy: () => vibrate(200),
    double: () => vibrate([100, 50, 100])
  };
};
```

### 2. Share API
```javascript
const useNativeShare = () => {
  const share = async (data) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch (error) {
        fallbackShare(data);
      }
    } else {
      fallbackShare(data);
    }
  };
  
  const shareTrip = (tripData) => {
    share({
      title: 'ARMORA Trip',
      text: `Track my journey with ARMORA`,
      url: `https://armora.com/track/${tripData.id}`
    });
  };
  
  return { share, shareTrip };
};
```

### 3. Background App Refresh
```javascript
const useBackgroundSync = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('background-sync');
      });
    }
  }, []);
};
```

## Offline Functionality

### 1. Offline Detection
```javascript
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};
```

### 2. Offline Data Storage
```javascript
const useOfflineStorage = () => {
  const storeForOffline = (key, data) => {
    const offlineData = {
      data,
      timestamp: Date.now(),
      synced: false
    };
    
    localStorage.setItem(`offline_${key}`, JSON.stringify(offlineData));
  };
  
  const syncOfflineData = async () => {
    const offlineKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('offline_'));
    
    for (const key of offlineKeys) {
      const data = JSON.parse(localStorage.getItem(key));
      if (!data.synced) {
        try {
          await syncToServer(data.data);
          localStorage.removeItem(key);
        } catch (error) {
          console.log('Sync failed, will retry later');
        }
      }
    }
  };
};
```

## Performance Monitoring

### 1. Metrics Collection
```javascript
const usePerformanceMetrics = () => {
  useEffect(() => {
    // Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            trackMetric('LCP', entry.startTime);
            break;
          case 'first-input':
            trackMetric('FID', entry.processingStart - entry.startTime);
            break;
          case 'layout-shift':
            if (!entry.hadRecentInput) {
              trackMetric('CLS', entry.value);
            }
            break;
        }
      });
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  }, []);
};
```

## Testing Strategy

### 1. Device Testing Matrix
```javascript
const testingMatrix = {
  devices: [
    'iPhone 14 Pro (iOS 16+)',
    'iPhone 12 (iOS 15+)',
    'Samsung Galaxy S23 (Android 13+)',
    'Google Pixel 7 (Android 13+)',
    'iPad Air (iPadOS 16+)'
  ],
  
  browsers: [
    'Safari (iOS)',
    'Chrome Mobile',
    'Firefox Mobile',
    'Samsung Internet',
    'Edge Mobile'
  ],
  
  scenarios: [
    'Booking flow',
    'Trip tracking',
    'Offline usage',
    'Background operation',
    'Push notifications'
  ]
};
```

## React Native Migration Path

### 1. Component Compatibility
```javascript
// Shared component architecture
const Button = ({ children, onPress, ...props }) => {
  const Component = Platform.select({
    web: 'button',
    native: TouchableOpacity
  });
  
  return (
    <Component onPress={onPress} {...props}>
      {children}
    </Component>
  );
};
```

### 2. Navigation Strategy
```javascript
// React Navigation setup for future RN app
const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Tracking" component={TrackingScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
```

## Next Priority Actions

1. **Create PWA Manifest**: Enable add-to-home-screen
2. **Implement Service Worker**: Offline functionality and caching
3. **Add Touch Gestures**: Swipe navigation and long press
4. **Fix iOS Safari Issues**: Viewport and scroll problems
5. **Optimize Bundle Size**: Code splitting and lazy loading
6. **Add Haptic Feedback**: Native-like interactions
7. **Implement Background Sync**: Offline booking queue
8. **Create Install Prompt**: PWA installation flow
9. **Add Performance Monitoring**: Track Core Web Vitals
10. **Test Across Devices**: Comprehensive mobile testing