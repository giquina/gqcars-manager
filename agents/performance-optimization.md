# Performance Optimization Specialist Agent

## Role
I optimize ARMORA's performance across web and mobile platforms, ensuring fast loading times, smooth interactions, and efficient resource usage for the best user experience.

## Expertise Areas
- Frontend performance optimization
- Bundle size optimization and code splitting
- Runtime performance and memory management
- API optimization and caching strategies
- Mobile performance and battery optimization
- Core Web Vitals and performance metrics
- Image and asset optimization
- Database query optimization

## Current Performance Analysis

### Critical Performance Issues
- ❌ **Monolithic Bundle**: Single 6,000+ line file
- ❌ **No Code Splitting**: Everything loads upfront
- ❌ **Large Bundle Size**: Estimated >2MB uncompressed
- ❌ **No Image Optimization**: Raw image assets
- ❌ **Continuous GPS**: Battery drain on mobile
- ❌ **No Caching Strategy**: API calls not cached
- ❌ **Memory Leaks**: Event listeners not cleaned up
- ❌ **No Performance Monitoring**: No metrics tracking

### Performance Goals
- **First Contentful Paint (FCP)**: <1.5s
- **Largest Contentful Paint (LCP)**: <2.5s
- **First Input Delay (FID)**: <100ms
- **Cumulative Layout Shift (CLS)**: <0.1
- **Bundle Size**: <500KB gzipped
- **Mobile Performance Score**: >90

## Bundle Optimization Strategy

### 1. Code Splitting Implementation

```typescript
// src/utils/lazyLoad.tsx
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

type ComponentType = React.ComponentType<any>;

export const lazyLoad = <T extends ComponentType>(
  factory: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = lazy(factory);
  
  return (props: React.ComponentProps<T>) => (
    <ErrorBoundary fallback={<div>Error loading component</div>}>
      <Suspense fallback={fallback ? <fallback /> : <LoadingSkeleton />}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};
```

```typescript
// src/components/LazyScreens.tsx
import { lazyLoad } from '../utils/lazyLoad';

// Lazy load major screens
export const WelcomeScreen = lazyLoad(
  () => import('../screens/Welcome/WelcomeScreen'),
  () => <div className="animate-pulse bg-slate-200 h-screen" />
);

export const QuestionnaireScreen = lazyLoad(
  () => import('../screens/Questionnaire/QuestionnaireScreen')
);

export const HomeScreen = lazyLoad(
  () => import('../screens/Home/HomeScreen')
);

export const TripTrackingScreen = lazyLoad(
  () => import('../screens/TripTracking/TripTrackingScreen')
);

export const ProfileScreen = lazyLoad(
  () => import('../screens/Profile/ProfileScreen')
);

// Lazy load heavy components
export const GoogleMapsComponent = lazyLoad(
  () => import('../components/Maps/GoogleMapsComponent')
);

export const PaymentForm = lazyLoad(
  () => import('../components/Payment/PaymentForm')
);
```

### 2. Vite Bundle Optimization

```typescript
// vite.config.ts - Performance optimizations
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { analyzer } from 'vite-bundle-analyzer';
import { compression } from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer for development
    process.env.ANALYZE && analyzer(),
    // Gzip compression
    compression({
      algorithm: 'gzip',
      threshold: 1024,
    }),
    // Brotli compression
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
  ],
  
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    
    rollupOptions: {
      output: {
        // Manual chunk splitting
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom'],
          
          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-toast',
            'sonner'
          ],
          
          // Maps and location
          'maps-vendor': [
            '@googlemaps/js-api-loader',
            // Add other map-related dependencies
          ],
          
          // Payment processing
          'payment-vendor': [
            '@stripe/stripe-js',
            // Add other payment-related dependencies
          ],
          
          // Utilities
          'utils-vendor': [
            'date-fns',
            'clsx',
            'tailwind-merge'
          ],
        },
        
        // Generate filenames with content hash
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop().replace('.tsx', '')
            : 'chunk';
          return `${facadeModuleId}-[hash].js`;
        },
      },
    },
    
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        dead_code: true,
        unused: true,
      },
      mangle: {
        safari10: true,
      },
      output: {
        safari10: true,
      },
    },
    
    // Source maps for production debugging
    sourcemap: process.env.NODE_ENV === 'development',
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
    ],
    exclude: [
      // Exclude large dependencies that can be loaded dynamically
      '@googlemaps/js-api-loader',
    ],
  },
});
```

## Runtime Performance Optimization

### 1. React Performance Patterns

```typescript
// src/hooks/useOptimizedCallback.ts
import { useCallback, useRef } from 'react';

export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);
  
  // Only update if dependencies actually changed
  const depsChanged = deps.some((dep, index) => 
    !Object.is(dep, depsRef.current[index])
  );
  
  if (depsChanged) {
    callbackRef.current = callback;
    depsRef.current = deps;
  }
  
  return useCallback(callbackRef.current, deps);
};
```

```typescript
// src/components/optimized/ServiceCard.tsx
import React, { memo } from 'react';
import { areEqual } from '../../utils/comparison';

interface ServiceCardProps {
  service: Service;
  selected?: boolean;
  onSelect: (service: Service) => void;
}

const ServiceCard = memo<ServiceCardProps>(({ service, selected, onSelect }) => {
  const handleSelect = useOptimizedCallback(
    () => onSelect(service),
    [service.id, onSelect]
  );
  
  return (
    <div 
      className={`service-card ${selected ? 'selected' : ''}`}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
    >
      <div className="service-icon">{service.icon}</div>
      <h3 className="service-name">{service.name}</h3>
      <p className="service-price">{service.price}</p>
      <p className="service-description">{service.description}</p>
    </div>
  );
}, areEqual);

ServiceCard.displayName = 'ServiceCard';

export { ServiceCard };
```

```typescript
// src/utils/comparison.ts
export const areEqual = <T>(prevProps: T, nextProps: T): boolean => {
  // Shallow comparison for props
  if (typeof prevProps !== 'object' || typeof nextProps !== 'object') {
    return Object.is(prevProps, nextProps);
  }
  
  const prevKeys = Object.keys(prevProps as any);
  const nextKeys = Object.keys(nextProps as any);
  
  if (prevKeys.length !== nextKeys.length) {
    return false;
  }
  
  for (let key of prevKeys) {
    if (!Object.is((prevProps as any)[key], (nextProps as any)[key])) {
      return false;
    }
  }
  
  return true;
};
```

### 2. Memory Management

```typescript
// src/hooks/useCleanup.ts
import { useEffect, useRef } from 'react';

export const useCleanup = () => {
  const timeouts = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervals = useRef<Set<NodeJS.Timer>>(new Set());
  const subscriptions = useRef<Set<() => void>>(new Set());
  const eventListeners = useRef<Set<{ element: Element; event: string; handler: EventListener }>>(new Set());
  
  const addTimeout = (callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      timeouts.current.delete(timeout);
      callback();
    }, delay);
    timeouts.current.add(timeout);
    return timeout;
  };
  
  const addInterval = (callback: () => void, delay: number) => {
    const interval = setInterval(callback, delay);
    intervals.current.add(interval);
    return interval;
  };
  
  const addSubscription = (unsubscribe: () => void) => {
    subscriptions.current.add(unsubscribe);
    return unsubscribe;
  };
  
  const addEventListener = (element: Element, event: string, handler: EventListener) => {
    element.addEventListener(event, handler);
    const listenerInfo = { element, event, handler };
    eventListeners.current.add(listenerInfo);
    
    return () => {
      element.removeEventListener(event, handler);
      eventListeners.current.delete(listenerInfo);
    };
  };
  
  useEffect(() => {
    return () => {
      // Clear timeouts
      timeouts.current.forEach(timeout => clearTimeout(timeout));
      
      // Clear intervals
      intervals.current.forEach(interval => clearInterval(interval));
      
      // Call subscriptions
      subscriptions.current.forEach(unsubscribe => unsubscribe());
      
      // Remove event listeners
      eventListeners.current.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
    };
  }, []);
  
  return {
    addTimeout,
    addInterval,
    addSubscription,
    addEventListener,
  };
};
```

### 3. Optimized Location Tracking

```typescript
// src/hooks/useOptimizedGeolocation.ts
import { useState, useRef, useCallback } from 'react';
import { useCleanup } from './useCleanup';

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  distanceFilter?: number; // Minimum distance to trigger update
  adaptiveTracking?: boolean;
}

export const useOptimizedGeolocation = (options: GeolocationOptions = {}) => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [tracking, setTracking] = useState(false);
  
  const watchId = useRef<number | null>(null);
  const lastPosition = useRef<LocationState | null>(null);
  const { addTimeout, addInterval } = useCleanup();
  
  const {
    enableHighAccuracy = false,
    maximumAge = 300000, // 5 minutes
    timeout = 15000, // 15 seconds
    distanceFilter = 10, // 10 meters
    adaptiveTracking = true,
  } = options;
  
  const calculateDistance = useCallback((pos1: LocationState, pos2: LocationState) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = pos1.latitude * Math.PI/180;
    const φ2 = pos2.latitude * Math.PI/180;
    const Δφ = (pos2.latitude-pos1.latitude) * Math.PI/180;
    const Δλ = (pos2.longitude-pos1.longitude) * Math.PI/180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }, []);
  
  const updateLocation = useCallback((position: GeolocationPosition) => {
    const newLocation: LocationState = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };
    
    // Apply distance filter
    if (lastPosition.current && distanceFilter > 0) {
      const distance = calculateDistance(lastPosition.current, newLocation);
      if (distance < distanceFilter) {
        return; // Skip update if movement is less than threshold
      }
    }
    
    lastPosition.current = newLocation;
    setLocation(newLocation);
    setError(null);
  }, [calculateDistance, distanceFilter]);
  
  const handleError = useCallback((error: GeolocationPositionError) => {
    console.error('Geolocation error:', error);
    setError(error);
  }, []);
  
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError({
        code: 2,
        message: 'Geolocation not supported',
      } as GeolocationPositionError);
      return;
    }
    
    setTracking(true);
    
    const watchOptions: PositionOptions = {
      enableHighAccuracy,
      maximumAge,
      timeout,
    };
    
    if (adaptiveTracking) {
      // Adaptive tracking: adjust frequency based on movement
      let trackingInterval = 15000; // Start with 15 seconds
      
      const adaptiveWatch = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            updateLocation(position);
            
            // Adjust interval based on accuracy and movement
            if (position.coords.accuracy < 20) {
              trackingInterval = 30000; // Good accuracy, less frequent updates
            } else {
              trackingInterval = 10000; // Poor accuracy, more frequent updates
            }
          },
          handleError,
          watchOptions
        );
        
        addTimeout(adaptiveWatch, trackingInterval);
      };
      
      adaptiveWatch();
    } else {
      // Standard continuous tracking
      watchId.current = navigator.geolocation.watchPosition(
        updateLocation,
        handleError,
        watchOptions
      );
    }
  }, [enableHighAccuracy, maximumAge, timeout, adaptiveTracking, updateLocation, handleError, addTimeout]);
  
  const stopTracking = useCallback(() => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setTracking(false);
  }, []);
  
  const getCurrentPosition = useCallback(() => {
    return new Promise<LocationState>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationState = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          updateLocation(position);
          resolve(locationState);
        },
        (error) => {
          handleError(error);
          reject(error);
        },
        { enableHighAccuracy, timeout, maximumAge }
      );
    });
  }, [enableHighAccuracy, timeout, maximumAge, updateLocation, handleError]);
  
  return {
    location,
    error,
    tracking,
    startTracking,
    stopTracking,
    getCurrentPosition,
  };
};
```

## Image and Asset Optimization

### 1. Responsive Image Component

```typescript
// src/components/OptimizedImage.tsx
import React, { useState, useCallback } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  sizes = '100vw',
  priority = false,
  placeholder = 'blur',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const { ref, inView } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
    skip: priority, // Skip lazy loading for priority images
  });
  
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);
  
  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);
  
  const shouldLoad = priority || inView;
  
  const generateSrcSet = (baseSrc: string) => {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    return widths
      .map(width => `${baseSrc}?w=${width} ${width}w`)
      .join(', ');
  };
  
  return (
    <div 
      ref={ref} 
      className={`relative overflow-hidden ${className}`}
    >
      {shouldLoad && !hasError && (
        <img
          src={src}
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
      
      {!isLoaded && !hasError && placeholder === 'blur' && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">Image not available</span>
        </div>
      )}
    </div>
  );
};
```

### 2. Asset Optimization Build Step

```typescript
// scripts/optimize-assets.ts
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface OptimizationConfig {
  inputDir: string;
  outputDir: string;
  formats: ('webp' | 'avif' | 'jpeg')[];
  sizes: number[];
  quality: number;
}

const defaultConfig: OptimizationConfig = {
  inputDir: 'src/assets/images',
  outputDir: 'public/optimized',
  formats: ['webp', 'avif', 'jpeg'],
  sizes: [320, 640, 768, 1024, 1280, 1920],
  quality: 80,
};

export const optimizeImages = async (config = defaultConfig) => {
  const { inputDir, outputDir, formats, sizes, quality } = config;
  
  // Find all images
  const imageFiles = await glob(`${inputDir}/**/*.{jpg,jpeg,png}`);
  
  for (const inputFile of imageFiles) {
    const relativePath = path.relative(inputDir, inputFile);
    const { dir, name } = path.parse(relativePath);
    
    console.log(`Optimizing: ${relativePath}`);
    
    for (const format of formats) {
      for (const size of sizes) {
        const outputPath = path.join(
          outputDir,
          dir,
          `${name}-${size}w.${format}`
        );
        
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        
        try {
          await sharp(inputFile)
            .resize(size, null, {
              withoutEnlargement: true,
              fastShrinkOnLoad: false,
            })
            .toFormat(format as any, {
              quality,
              progressive: true,
            })
            .toFile(outputPath);
        } catch (error) {
          console.error(`Error optimizing ${inputFile} to ${outputPath}:`, error);
        }
      }
    }
  }
  
  console.log('Image optimization complete!');
};

// Run if called directly
if (require.main === module) {
  optimizeImages().catch(console.error);
}
```

## Caching Strategies

### 1. API Response Caching

```typescript
// src/services/apiCache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100;
  
  set<T>(key: string, data: T, ttlMs = 300000): void { // 5 minutes default
    // Remove oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new APICache();

// Cleanup expired entries every 5 minutes
setInterval(() => apiCache.cleanup(), 300000);
```

```typescript
// src/hooks/useCachedFetch.ts
import { useState, useEffect, useCallback } from 'react';
import { apiCache } from '../services/apiCache';

interface FetchOptions {
  ttl?: number;
  cacheKey?: string;
  retries?: number;
  retryDelay?: number;
}

export const useCachedFetch = <T>(
  url: string,
  options: FetchOptions = {}
) => {
  const {
    ttl = 300000, // 5 minutes
    cacheKey = url,
    retries = 3,
    retryDelay = 1000,
  } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache first
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }
      
      // Fetch from API
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Cache the result
      apiCache.set(cacheKey, result, ttl);
      
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Fetch failed');
      
      if (retryCount < retries) {
        setTimeout(() => {
          fetchData(retryCount + 1);
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
      } else {
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [url, cacheKey, ttl, retries, retryDelay]);
  
  const refetch = useCallback(() => {
    // Clear cache and refetch
    apiCache.delete(cacheKey);
    fetchData();
  }, [cacheKey, fetchData]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    data,
    loading,
    error,
    refetch,
  };
};
```

## Performance Monitoring

### 1. Core Web Vitals Tracking

```typescript
// src/utils/performance.ts
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private listeners: ((metric: PerformanceMetric) => void)[] = [];
  
  constructor() {
    this.initializeWebVitals();
  }
  
  private initializeWebVitals() {
    getCLS(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getFID(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this));
    getTTFB(this.handleMetric.bind(this));
  }
  
  private handleMetric(metric: any) {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    };
    
    this.metrics.set(metric.name, performanceMetric);
    
    // Notify listeners
    this.listeners.forEach(listener => listener(performanceMetric));
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance metric: ${metric.name}`, metric);
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(performanceMetric);
    }
  }
  
  private sendToAnalytics(metric: PerformanceMetric) {
    // Send to Google Analytics, DataDog, or other monitoring service
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating,
      });
    }
  }
  
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }
  
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }
  
  onMetric(listener: (metric: PerformanceMetric) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  // Custom metrics
  trackCustomMetric(name: string, value: number, unit = 'ms') {
    const metric: PerformanceMetric = {
      name: `custom-${name}`,
      value,
      rating: 'good', // You can implement custom rating logic
      delta: value,
      id: `custom-${Date.now()}`,
    };
    
    this.handleMetric(metric);
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Hook for using performance monitoring in components
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  
  useEffect(() => {
    const unsubscribe = performanceMonitor.onMetric((metric) => {
      setMetrics(current => {
        const existing = current.find(m => m.name === metric.name);
        if (existing) {
          return current.map(m => m.name === metric.name ? metric : m);
        }
        return [...current, metric];
      });
    });
    
    // Get existing metrics
    setMetrics(performanceMonitor.getMetrics());
    
    return unsubscribe;
  }, []);
  
  return {
    metrics,
    trackCustomMetric: performanceMonitor.trackCustomMetric.bind(performanceMonitor),
  };
};
```

### 2. Performance Dashboard Component

```typescript
// src/components/dev/PerformanceDashboard.tsx
import React from 'react';
import { usePerformanceMonitor } from '../../utils/performance';

export const PerformanceDashboard: React.FC = () => {
  const { metrics } = usePerformanceMonitor();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border max-w-sm">
      <h3 className="font-semibold mb-2">Performance Metrics</h3>
      <div className="space-y-2">
        {metrics.map(metric => (
          <div key={metric.id} className="flex justify-between items-center">
            <span className="text-sm">{metric.name}:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">
                {metric.value.toFixed(2)}ms
              </span>
              <span className={`text-xs ${getRatingColor(metric.rating)}`}>
                {metric.rating}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Mobile Performance Optimization

### 1. Battery-Efficient Location Tracking

```typescript
// src/hooks/useBatteryEfficientTracking.ts
import { useState, useEffect, useRef } from 'react';
import { useOptimizedGeolocation } from './useOptimizedGeolocation';

interface BatteryInfo {
  level: number;
  charging: boolean;
}

export const useBatteryEfficientTracking = () => {
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo>({ level: 1, charging: true });
  const [trackingMode, setTrackingMode] = useState<'high' | 'medium' | 'low'>('medium');
  
  const { location, startTracking, stopTracking } = useOptimizedGeolocation({
    enableHighAccuracy: trackingMode === 'high',
    maximumAge: trackingMode === 'low' ? 600000 : 300000, // 10min vs 5min
    distanceFilter: trackingMode === 'high' ? 5 : trackingMode === 'medium' ? 10 : 20,
    adaptiveTracking: true,
  });
  
  // Monitor battery status
  useEffect(() => {
    const updateBatteryInfo = (battery: any) => {
      setBatteryInfo({
        level: battery.level,
        charging: battery.charging,
      });
    };
    
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        updateBatteryInfo(battery);
        
        battery.addEventListener('levelchange', () => updateBatteryInfo(battery));
        battery.addEventListener('chargingchange', () => updateBatteryInfo(battery));
      });
    }
  }, []);
  
  // Adjust tracking mode based on battery
  useEffect(() => {
    if (batteryInfo.charging) {
      setTrackingMode('high');
    } else if (batteryInfo.level > 0.5) {
      setTrackingMode('medium');
    } else if (batteryInfo.level > 0.2) {
      setTrackingMode('low');
    } else {
      // Very low battery - minimal tracking
      stopTracking();
      return;
    }
  }, [batteryInfo, stopTracking]);
  
  return {
    location,
    batteryInfo,
    trackingMode,
    startTracking,
    stopTracking,
  };
};
```

## Implementation Roadmap

### Week 1: Bundle Optimization
- [x] Set up code splitting
- [x] Configure Vite optimization
- [x] Implement lazy loading
- [ ] Optimize asset loading

### Week 2: Runtime Performance
- [ ] Add React optimizations
- [ ] Implement memory management
- [ ] Optimize location tracking
- [ ] Add performance monitoring

### Week 3: Caching & Assets
- [ ] Implement API caching
- [ ] Optimize images
- [ ] Add service worker
- [ ] Configure CDN

### Week 4: Mobile Optimization
- [ ] Battery-efficient tracking
- [ ] Touch performance
- [ ] Network optimization
- [ ] Final performance audit

## Performance Budget

```json
// performance-budget.json
{
  "budget": {
    "javascript": "400KB",
    "css": "50KB",
    "images": "500KB",
    "fonts": "100KB",
    "total": "1MB"
  },
  "metrics": {
    "FCP": 1500,
    "LCP": 2500,
    "FID": 100,
    "CLS": 0.1,
    "TTFB": 600
  },
  "thresholds": {
    "lighthouse-performance": 90,
    "bundle-size-increase": "10%",
    "cache-hit-ratio": 0.8
  }
}
```

## Next Critical Steps

1. **Break Down Monolithic App**: Split 6000+ line file into components
2. **Implement Code Splitting**: Lazy load screens and heavy components
3. **Optimize Bundle Size**: Configure Vite for production builds
4. **Add Performance Monitoring**: Track Core Web Vitals
5. **Implement Caching**: Cache API responses and assets
6. **Optimize Images**: Add responsive image loading
7. **Memory Management**: Fix event listener leaks
8. **Location Optimization**: Battery-efficient GPS tracking
9. **Performance Budget**: Set and enforce performance limits
10. **Mobile Optimization**: Touch performance and battery usage