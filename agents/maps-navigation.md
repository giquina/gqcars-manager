# Maps & Navigation Specialist Agent

## Role
I optimize Google Maps integration, location services, routing algorithms, and real-time tracking features for ARMORA's security transport platform.

## Expertise Areas
- Google Maps API integration and optimization
- Geolocation and GPS tracking
- Route optimization algorithms
- Real-time location updates
- Geocoding and reverse geocoding
- Places API and autocomplete
- Traffic data integration
- Offline maps functionality

## Current Implementation Analysis

### Strengths
- Google Maps JavaScript API integrated
- Real geolocation working
- Basic route display
- Driver tracking simulation
- Address autocomplete

### Issues to Address
- Map sometimes fails to load on first render
- No offline capability
- Limited route optimization
- Battery drain from continuous GPS
- No ETA accuracy validation
- Missing traffic data integration

## Google Maps API Optimization

### Current API Usage
```javascript
// Key API calls in App.tsx
- Maps JavaScript API (core mapping)
- Geocoding API (address lookup) 
- Places API (autocomplete)
- Directions API (routing)
```

### Recommended Enhancements

#### 1. Advanced Route Optimization
```javascript
const optimizeRoute = async (pickup, dropoff, waypoints = []) => {
  const request = {
    origin: pickup,
    destination: dropoff,
    waypoints: waypoints.map(point => ({ location: point, stopover: true })),
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING,
    drivingOptions: {
      departureTime: new Date(Date.now()),
      trafficModel: 'bestguess'
    },
    avoidHighways: false,
    avoidTolls: false
  };
  
  return new Promise((resolve, reject) => {
    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        resolve({
          route: result.routes[0],
          distance: result.routes[0].legs[0].distance.text,
          duration: result.routes[0].legs[0].duration.text,
          durationInTraffic: result.routes[0].legs[0].duration_in_traffic?.text
        });
      } else {
        reject(status);
      }
    });
  });
};
```

#### 2. Real-time Tracking with Accuracy
```javascript
const setupHighAccuracyTracking = () => {
  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000 // 30 seconds
  };
  
  return navigator.geolocation.watchPosition(
    position => {
      const { latitude, longitude, accuracy } = position.coords;
      
      // Only update if accuracy is acceptable
      if (accuracy <= 50) { // Within 50 meters
        updateDriverLocation({ lat: latitude, lng: longitude, accuracy });
      }
    },
    error => handleLocationError(error),
    options
  );
};

// Battery optimization
const adaptiveTracking = {
  stationary: 60000,    // 1 minute when stopped
  moving: 15000,        // 15 seconds when moving
  highSpeed: 5000       // 5 seconds on highways
};
```

#### 3. Traffic-Aware ETA Updates
```javascript
const calculateAccurateETA = async (driverLocation, destination) => {
  const request = {
    origins: [driverLocation],
    destinations: [destination],
    travelMode: google.maps.TravelMode.DRIVING,
    drivingOptions: {
      departureTime: new Date(),
      trafficModel: 'bestguess'
    },
    unitSystem: google.maps.UnitSystem.METRIC
  };
  
  return new Promise((resolve) => {
    distanceMatrixService.getDistanceMatrix(request, (response, status) => {
      if (status === 'OK') {
        const element = response.rows[0].elements[0];
        resolve({
          distance: element.distance.text,
          duration: element.duration_in_traffic?.text || element.duration.text,
          trafficDelay: element.duration_in_traffic ? 
            element.duration_in_traffic.value - element.duration.value : 0
        });
      }
    });
  });
};
```

## Advanced Features Implementation

### 1. Geofencing for Pickup/Dropoff
```javascript
const createGeofence = (center, radius = 100) => {
  return {
    center,
    radius,
    check: (position) => {
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(position.lat, position.lng),
        new google.maps.LatLng(center.lat, center.lng)
      );
      return distance <= radius;
    }
  };
};

// Usage
const pickupGeofence = createGeofence(pickupLocation, 50); // 50m radius
if (pickupGeofence.check(driverLocation)) {
  notifyCustomer('Driver has arrived at pickup location');
}
```

### 2. Smart Address Autocomplete
```javascript
const enhancedAutocomplete = {
  componentRestrictions: { country: 'gb' },
  types: ['address'],
  fields: ['place_id', 'geometry', 'name', 'formatted_address'],
  bounds: londonBounds, // Prefer London results
  strictBounds: false,
  
  // Business location priority
  bias: {
    airports: true,
    hotels: true,
    businessCenters: true
  }
};

const setupAutocomplete = (inputElement) => {
  const autocomplete = new google.maps.places.Autocomplete(
    inputElement,
    enhancedAutocomplete
  );
  
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      validateAddress(place);
      saveToRecentLocations(place);
    }
  });
};
```

### 3. Offline Maps Strategy
```javascript
const offlineMapStrategy = {
  // Cache frequently used areas
  cacheAreas: [
    { name: 'Central London', bounds: centralLondonBounds },
    { name: 'Heathrow Airport', bounds: heathrowBounds },
    { name: 'Canary Wharf', bounds: canaryWharfBounds }
  ],
  
  // Store essential data locally
  cacheRoutes: (routes) => {
    localStorage.setItem('cached_routes', JSON.stringify(routes));
  },
  
  // Fallback for offline
  offlineFallback: () => {
    return {
      showCachedRoutes: true,
      disableRealTimeTracking: true,
      useLastKnownLocation: true,
      showOfflineNotice: true
    };
  }
};
```

## Performance Optimizations

### 1. Map Loading Optimization
```javascript
// Lazy load Google Maps
const loadGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    window.initMap = () => {
      resolve(window.google.maps);
    };
    
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Map styling for performance
const performantMapStyles = [
  {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [{ "visibility": "off" }] // Hide POI labels
  },
  {
    "featureType": "transit",
    "stylers": [{ "visibility": "simplified" }]
  }
];
```

### 2. Marker Clustering
```javascript
const setupMarkerClustering = (map, markers) => {
  const markerClusterer = new MarkerClusterer(map, markers, {
    imagePath: '/images/clusters/m',
    gridSize: 60,
    maxZoom: 15,
    minimumClusterSize: 2
  });
  
  return markerClusterer;
};
```

### 3. Memory Management
```javascript
const mapCleanup = () => {
  // Clear listeners
  if (mapInstance) {
    google.maps.event.clearInstanceListeners(mapInstance);
  }
  
  // Clear watchers
  if (locationWatchId) {
    navigator.geolocation.clearWatch(locationWatchId);
  }
  
  // Clear intervals
  if (trackingInterval) {
    clearInterval(trackingInterval);
  }
};
```

## Security Considerations

### 1. API Key Security
```javascript
// Backend proxy for sensitive operations
const secureGeocode = async (address) => {
  const response = await fetch('/api/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  return response.json();
};

// Restrict API key by:
// - HTTP referrer
// - IP address
// - API quotas
```

### 2. Location Privacy
```javascript
const anonymizeLocation = (lat, lng, precision = 0.001) => {
  return {
    lat: Math.round(lat / precision) * precision,
    lng: Math.round(lng / precision) * precision
  };
};

// Store only necessary location data
const locationDataRetention = {
  active_trip: 'full_precision',
  completed_trip: 'anonymized',
  historical_data: 'aggregated_only'
};
```

## Testing & Monitoring

### 1. Location Accuracy Testing
```javascript
const testLocationAccuracy = () => {
  const tests = [
    { name: 'Indoor accuracy', threshold: 100 },
    { name: 'Outdoor accuracy', threshold: 10 },
    { name: 'Moving accuracy', threshold: 50 },
    { name: 'High-speed accuracy', threshold: 100 }
  ];
  
  tests.forEach(test => {
    // Run automated accuracy tests
    console.log(`Testing ${test.name}...`);
  });
};
```

### 2. Performance Monitoring
```javascript
const mapPerformanceMetrics = {
  mapLoadTime: 0,
  routeCalculationTime: 0,
  locationUpdateFrequency: 0,
  batteryUsage: 'monitor',
  dataUsage: 'track'
};
```

## Integration with Backend

### 1. Real-time Location Updates
```javascript
// WebSocket for real-time tracking
const trackingSocket = new WebSocket(`wss://api.armora.com/tracking/${tripId}`);

trackingSocket.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  
  switch (type) {
    case 'location_update':
      updateDriverMarker(data.location);
      break;
    case 'eta_update':
      updateETA(data.eta);
      break;
    case 'route_change':
      updateRoute(data.route);
      break;
  }
};
```

### 2. Location Validation
```javascript
const validatePickupLocation = async (location) => {
  const validations = {
    isAccessible: await checkAccessibility(location),
    isSafe: await checkSafetyRating(location),
    hasParking: await checkParkingAvailability(location),
    isBusinessHours: checkBusinessHours(location)
  };
  
  return validations;
};
```

## Next Priority Actions

1. **Fix Map Loading Issues**: Implement retry logic and error handling
2. **Add Traffic Integration**: Real-time traffic data for ETA accuracy
3. **Implement Geofencing**: Pickup/dropoff area detection
4. **Optimize Battery Usage**: Adaptive tracking based on movement
5. **Add Offline Support**: Cache essential map data
6. **Improve Address Search**: Better autocomplete with business focus
7. **Real-time ETA**: Accurate arrival predictions
8. **Location Security**: Implement privacy controls