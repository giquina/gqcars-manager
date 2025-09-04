import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Heart, 
  NavigationArrow, 
  User, 
  Car,
  CreditCard,
  House,
  List,
  ArrowLeft,
  Plus,
  X,
  Navigation,
  Speedometer,
  Timer,
  Crosshair,
  Warning,
  CheckCircle,
  ChatCircle,
  PaperPlaneTilt,
  Microphone,
  SmileyWink,
  DotsThree,
  MagnifyingGlass,
  Calendar,
  Compass
} from "@phosphor-icons/react"
import { toast, Toaster } from 'sonner'
import { useKV } from '@github/spark/hooks'

// TypeScript declarations for Google Maps API
declare global {
  interface Window {
    google: typeof google
    initMap: () => void
    googleMapsLoaded: boolean
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions)
      setCenter(latLng: LatLng | LatLngLiteral): void
      setZoom(zoom: number): void
      fitBounds(bounds: LatLngBounds): void
      addListener(eventName: string, handler: Function): void
    }
    
    class Marker {
      constructor(opts?: MarkerOptions)
      setMap(map: Map | null): void
      addListener(eventName: string, handler: Function): void
    }
    
    class Geocoder {
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: string) => void): void
    }
    
    class DirectionsService {
      route(request: DirectionsRequest, callback: (result: DirectionsResult, status: string) => void): void
    }
    
    class DirectionsRenderer {
      constructor(opts?: DirectionsRendererOptions)
      setMap(map: Map): void
      setDirections(directions: DirectionsResult): void
    }
    
    class TrafficLayer {
      setMap(map: Map | null): void
      getMap(): Map | null
    }
    
    class InfoWindow {
      constructor(opts?: InfoWindowOptions)
      open(map?: Map, anchor?: Marker): void
      close(): void
      setContent(content: string | Element): void
    }
    
    namespace places {
      class Autocomplete {
        constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions)
        addListener(eventName: string, handler: Function): void
        getPlace(): PlaceResult
      }
    }
    
    namespace event {
      function clearInstanceListeners(instance: any): void
    }
    
    enum TravelMode {
      DRIVING = 'DRIVING',
      WALKING = 'WALKING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT'
    }
    
    enum UnitSystem {
      METRIC = 0,
      IMPERIAL = 1
    }
    
    enum Animation {
      BOUNCE = 1,
      DROP = 2
    }
    
    interface LatLng {
      lat(): number
      lng(): number
    }
    
    interface LatLngLiteral {
      lat: number
      lng: number
    }
    
    interface MapOptions {
      center?: LatLng | LatLngLiteral
      zoom?: number
      minZoom?: number
      maxZoom?: number
      styles?: any[]
      disableDefaultUI?: boolean
      gestureHandling?: string
      zoomControl?: boolean
      streetViewControl?: boolean
      fullscreenControl?: boolean
      mapTypeControl?: boolean
      scaleControl?: boolean
      rotateControl?: boolean
      tilt?: number
    }
    
    interface MarkerOptions {
      position?: LatLng | LatLngLiteral
      map?: Map
      title?: string
      animation?: Animation
      icon?: string | any
    }
    
    class Size {
      constructor(width: number, height: number)
      width: number
      height: number
    }
    
    class Point {
      constructor(x: number, y: number)
      x: number
      y: number
    }
    
    // Add other necessary interfaces
    interface GeocoderRequest {
      location: LatLng | LatLngLiteral
    }
    
    interface GeocoderResult {
      formatted_address: string
    }
    
    interface DirectionsRequest {
      origin: LatLng | LatLngLiteral
      destination: LatLng | LatLngLiteral
      travelMode: TravelMode
      unitSystem?: UnitSystem
      avoidHighways?: boolean
      avoidTolls?: boolean
      optimizeWaypoints?: boolean
    }
    
    interface DirectionsResult {
      routes: DirectionsRoute[]
    }
    
    interface DirectionsRoute {
      bounds: LatLngBounds
      legs: DirectionsLeg[]
    }
    
    interface DirectionsLeg {
      distance?: { text: string }
      duration?: { text: string }
      steps: DirectionsStep[]
    }
    
    interface DirectionsStep {
      // Add step properties as needed
    }
    
    interface LatLngBounds {
      // Add bounds properties as needed
    }
    
    interface DirectionsRendererOptions {
      suppressMarkers?: boolean
      polylineOptions?: any
    }
    
    interface InfoWindowOptions {
      content?: string | Element
      position?: LatLng | LatLngLiteral
    }
    
    interface AutocompleteOptions {
      componentRestrictions?: { country: string }
      fields?: string[]
      types?: string[]
    }
    
    interface PlaceResult {
      place_id?: string
      formatted_address?: string
      geometry?: PlaceGeometry
      name?: string
    }
    
    interface PlaceGeometry {
      location?: LatLng
    }
    
    interface MapMouseEvent {
      latLng?: LatLng
    }
  }
}

// UK Ride Service Levels - Professional Service Types
const rideServices = [
  {
    id: 'standard',
    name: 'GQ Standard',
    description: 'Reliable everyday rides',
    priceRange: '£8.50 - £12.20',
    eta: '2-4 min',
    icon: Car,
    capacity: '1-4 passengers',
    vehicle: 'Economy cars'
  },
  {
    id: 'comfort',
    name: 'GQ Comfort',
    description: 'Premium vehicles with extra space',
    priceRange: '£12.80 - £16.40',
    eta: '3-5 min',
    icon: Shield,
    capacity: '1-4 passengers',
    vehicle: 'Premium cars'
  },
  {
    id: 'executive',
    name: 'GQ Executive', 
    description: 'Luxury vehicles for business',
    priceRange: '£18.50 - £24.90',
    eta: '4-6 min',
    icon: Star,
    capacity: '1-4 passengers',
    vehicle: 'Executive cars'
  },
  {
    id: 'xl',
    name: 'GQ XL',
    description: 'Larger vehicles for groups',
    priceRange: '£15.20 - £19.80',
    eta: '5-7 min',
    icon: Users,
    capacity: '1-6 passengers',
    vehicle: 'Large vehicles'
  }
]

// Sample drivers
const drivers = [
  {
    id: 1,
    name: 'James Wilson',
    rating: 4.9,
    completedTrips: 1247,
    vehicle: 'Toyota Prius - Silver',
    license: 'GK67 XBN',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    eta: 3
  },
  {
    id: 2,
    name: 'Sarah Mitchell',
    rating: 4.8,
    completedTrips: 892,
    vehicle: 'Honda Insight - Black',
    license: 'BV19 MKL',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b586?w=400&q=80',
    eta: 4
  }
]

// Sample London locations for realistic GPS simulation
const londonLocations = [
  { lat: 51.5074, lng: -0.1278, name: "London Bridge" },
  { lat: 51.5155, lng: -0.0922, name: "Tower Bridge" },
  { lat: 51.4994, lng: -0.1244, name: "Borough Market" },
  { lat: 51.5007, lng: -0.1246, name: "Southwark Cathedral" },
  { lat: 51.5033, lng: -0.1195, name: "London Bridge Station" },
  { lat: 51.5081, lng: -0.0759, name: "Canary Wharf" },
  { lat: 51.5118, lng: -0.1301, name: "St Paul's Cathedral" },
  { lat: 51.5139, lng: -0.0986, name: "Bank Station" },
  { lat: 51.5085, lng: -0.1257, name: "Mansion House" },
  { lat: 51.5045, lng: -0.1123, name: "Monument" }
]

// Google Maps API loader with better error handling
const useGoogleMapsAPI = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      setIsLoading(false)
      return
    }

    // Listen for the API to load
    const handleLoad = () => {
      setIsLoaded(true)
      setIsLoading(false)
      setError(null)
    }

    const handleError = () => {
      setIsLoaded(false)
      setIsLoading(false)
      setError('Failed to load Google Maps API')
    }

    // Add event listeners
    window.addEventListener('google-maps-loaded', handleLoad)
    window.addEventListener('google-maps-error', handleError)

    // Set a timeout in case the API doesn't load
    const timeout = setTimeout(() => {
      if (!window.google) {
        setError('Google Maps API took too long to load')
        setIsLoading(false)
      }
    }, 10000)

    return () => {
      window.removeEventListener('google-maps-loaded', handleLoad)
      window.removeEventListener('google-maps-error', handleError)
      clearTimeout(timeout)
    }
  }, [])

  return { isLoaded, isLoading, error }
}

// Enhanced Google Maps Loading Component
const GoogleMapsLoader = ({ children, fallback }: { 
  children: React.ReactNode, 
  fallback?: React.ReactNode 
}) => {
  const { isLoaded, isLoading, error } = useGoogleMapsAPI()

  if (error) {
    return (
      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Warning size={24} className="text-amber-500 mx-auto" />
            <p className="text-sm text-muted-foreground">Maps temporarily unavailable</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="text-xs"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      fallback || (
        <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
            </div>
          </div>
        </div>
      )
    )
  }

  if (!isLoaded) {
    return (
      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto opacity-50"></div>
            <p className="text-sm text-muted-foreground">Maps not available</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
const useGeolocation = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accuracy, setAccuracy] = useState<number>(0)
  const [heading, setHeading] = useState<number | null>(null)
  const [speed, setSpeed] = useState<number | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)

  const getCurrentLocation = useCallback(() => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setLocation(coords)
        setAccuracy(position.coords.accuracy)
        setHeading(position.coords.heading)
        setSpeed(position.coords.speed)
        
        // Reverse geocoding to get address
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: coords }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              setAddress(results[0].formatted_address)
            }
          })
        }
        
        setLoading(false)
        // No notification needed - GPS is working silently in background
      },
      (error) => {
        let errorMessage = 'Unable to find your location'
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '📍 Please enable location access to find nearby pickup points'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '📍 Location not available - you can manually set your pickup location'
            break
          case error.TIMEOUT:
            errorMessage = '📍 Location search timed out - please try again'
            break
        }
        setError(errorMessage)
        setLoading(false)
        toast.error(errorMessage)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    )
  }, [])

  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation) return

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setLocation(coords)
        setAccuracy(position.coords.accuracy)
        setHeading(position.coords.heading)
        setSpeed(position.coords.speed)
        
        // Update address less frequently to avoid rate limits
        if (window.google && window.google.maps && Math.random() > 0.8) {
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: coords }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              setAddress(results[0].formatted_address)
            }
          })
        }
      },
      (error) => {
        console.warn('Geolocation error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    )
    
    setWatchId(id)
    return id
  }, [])

  const stopWatchingLocation = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
  }, [watchId])

  return { 
    location, 
    address, 
    loading, 
    error, 
    accuracy, 
    heading, 
    speed,
    getCurrentLocation,
    startWatchingLocation,
    stopWatchingLocation
  }
}

// Enhanced Google Maps component with real-time tracking
const GoogleMapView = React.forwardRef<any, { 
  center: { lat: number; lng: number }
  markers?: any[]
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
  className?: string
  showControls?: boolean
  showTraffic?: boolean
  showCurrentLocation?: boolean
  trackingMode?: boolean
}>(({ 
  center, 
  markers = [], 
  onLocationSelect,
  className = "h-64",
  showControls = true,
  showTraffic = false,
  showCurrentLocation = true,
  trackingMode = false
}, ref) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const currentLocationMarkerRef = useRef<google.maps.Marker | null>(null)
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null)
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null)
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)

  // Enhanced Google Maps initialization
  useEffect(() => {
    if (!mapRef.current || !window.google) return

    // Initialize map with enhanced options
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: trackingMode ? 16 : 15,
      minZoom: 8,
      maxZoom: 20,
      styles: [
        // Enhanced map styling for better visibility
        {
          featureType: "all",
          elementType: "geometry.fill",
          stylers: [{ weight: "2.00" }]
        },
        {
          featureType: "all",
          elementType: "geometry.stroke",
          stylers: [{ color: "#9c9c9c" }]
        },
        {
          featureType: "all",
          elementType: "labels.text",
          stylers: [{ visibility: "on" }]
        },
        {
          featureType: "landscape",
          elementType: "all",
          stylers: [{ color: "#f2f2f2" }]
        },
        {
          featureType: "landscape",
          elementType: "geometry.fill",
          stylers: [{ color: "#ffffff" }]
        },
        {
          featureType: "landscape.man_made",
          elementType: "geometry.fill",
          stylers: [{ color: "#ffffff" }]
        },
        {
          featureType: "poi",
          elementType: "all",
          stylers: [{ visibility: trackingMode ? "off" : "simplified" }]
        },
        {
          featureType: "road",
          elementType: "all",
          stylers: [{ saturation: -100 }, { lightness: 45 }]
        },
        {
          featureType: "road",
          elementType: "geometry.fill",
          stylers: [{ color: "#eeeeee" }]
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#7b7b7b" }]
        },
        {
          featureType: "road",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#ffffff" }]
        },
        {
          featureType: "road.highway",
          elementType: "all",
          stylers: [{ visibility: "simplified" }]
        },
        {
          featureType: "road.arterial",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "transit",
          elementType: "all",
          stylers: [{ visibility: trackingMode ? "off" : "simplified" }]
        },
        {
          featureType: "water",
          elementType: "all",
          stylers: [{ color: "#46bcec" }, { visibility: "on" }]
        },
        {
          featureType: "water",
          elementType: "geometry.fill",
          stylers: [{ color: "#c8d7d4" }]
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#070707" }]
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#ffffff" }]
        }
      ],
      disableDefaultUI: !showControls,
      gestureHandling: trackingMode ? 'greedy' : 'cooperative',
      zoomControl: showControls,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: showControls,
      scaleControl: true,
      rotateControl: trackingMode,
      tilt: trackingMode ? 45 : 0
    })

    mapInstanceRef.current = map

    // Initialize services
    directionsServiceRef.current = new window.google.maps.DirectionsService()
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#1976d2',
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    })
    directionsRendererRef.current.setMap(map)

    // Add traffic layer if requested
    if (showTraffic) {
      trafficLayerRef.current = new window.google.maps.TrafficLayer()
      trafficLayerRef.current.setMap(map)
    }

    // Add click listener for location selection
    if (onLocationSelect) {
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const coords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          }
          
          // Reverse geocoding
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: coords }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              onLocationSelect({
                ...coords,
                address: results[0].formatted_address
              })
            }
          })
        }
      })
    }

    return () => {
      // Cleanup
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.setMap(null)
      }
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null)
      }
    }
  }, [center, onLocationSelect, showControls, showTraffic, trackingMode])

  // Update markers when they change
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Add new markers
    markers.forEach(markerData => {
      const marker = new window.google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: mapInstanceRef.current,
        title: markerData.title,
        animation: markerData.animation || null,
        icon: markerData.icon ? {
          url: markerData.icon,
          scaledSize: new window.google.maps.Size(
            markerData.iconSize?.width || 32, 
            markerData.iconSize?.height || 32
          ),
          anchor: new window.google.maps.Point(
            (markerData.iconSize?.width || 32) / 2,
            (markerData.iconSize?.height || 32) / 2
          )
        } : undefined
      })

      if (markerData.onClick) {
        marker.addListener('click', markerData.onClick)
      }

      // Add info window if provided
      if (markerData.infoWindow) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: markerData.infoWindow
        })
        
        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker)
        })
      }

      markersRef.current.push(marker)
    })
  }, [markers])

  // Update map center when it changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center)
      if (trackingMode) {
        mapInstanceRef.current.setZoom(16)
      }
    }
  }, [center, trackingMode])

  // Method to calculate and display route
  const showRoute = useCallback((origin: google.maps.LatLng | google.maps.LatLngLiteral, 
                                destination: google.maps.LatLng | google.maps.LatLngLiteral,
                                travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING) => {
    if (!directionsServiceRef.current || !directionsRendererRef.current) return

    directionsServiceRef.current.route({
      origin,
      destination,
      travelMode,
      avoidHighways: false,
      avoidTolls: false,
      optimizeWaypoints: true
    }, (result, status) => {
      if (status === 'OK' && result) {
        directionsRendererRef.current?.setDirections(result)
        
        // Fit map to route bounds
        if (mapInstanceRef.current && result.routes[0]) {
          mapInstanceRef.current.fitBounds(result.routes[0].bounds)
        }
      } else {
        console.error('Directions request failed:', status)
        toast.error('Unable to calculate route')
      }
    })
  }, [])

  // Expose methods to parent component
  useEffect(() => {
    if (mapInstanceRef.current && ref) {
      // Expose methods to parent via ref
      if (typeof ref === 'function') {
        ref({
          showRoute,
          toggleTraffic: () => {
            if (trafficLayerRef.current) {
              trafficLayerRef.current.setMap(
                trafficLayerRef.current.getMap() ? null : mapInstanceRef.current
              )
            } else if (mapInstanceRef.current) {
              // Create traffic layer if it doesn't exist
              trafficLayerRef.current = new window.google.maps.TrafficLayer()
              trafficLayerRef.current.setMap(mapInstanceRef.current)
            }
          }
        })
      } else if (ref && 'current' in ref) {
        ref.current = {
          showRoute,
          toggleTraffic: () => {
            if (trafficLayerRef.current) {
              trafficLayerRef.current.setMap(
                trafficLayerRef.current.getMap() ? null : mapInstanceRef.current
              )
            } else if (mapInstanceRef.current) {
              // Create traffic layer if it doesn't exist
              trafficLayerRef.current = new window.google.maps.TrafficLayer()
              trafficLayerRef.current.setMap(mapInstanceRef.current)
            }
          }
        }
      }
    }
  }, [showRoute, ref])

  return <div ref={mapRef} className={className} />
})

GoogleMapView.displayName = 'GoogleMapView'

// Places Autocomplete component
const PlacesAutocomplete = ({ 
  value, 
  onChange, 
  placeholder,
  className = "",
  onPlaceSelect 
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
  onPlaceSelect?: (place: any) => void
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    if (!inputRef.current || !window.google?.maps?.places) return

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'gb' }, // Restrict to UK
      fields: ['place_id', 'formatted_address', 'geometry', 'name'],
      types: ['establishment', 'geocode'] // Include both places and addresses
    })

    autocompleteRef.current = autocomplete

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place.formatted_address) {
        onChange(place.formatted_address)
        if (onPlaceSelect) {
          onPlaceSelect(place)
        }
      }
    })

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [onChange, onPlaceSelect])

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  )
}

// Enhanced Real-time GPS tracking with live location updates
const useGPSTracking = (initialPosition: any, destination: any, isActive: boolean) => {
  const [currentPosition, setCurrentPosition] = useState(initialPosition)
  const [route, setRoute] = useState<any[]>([])
  const [progress, setProgress] = useState(0)
  const [eta, setEta] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [bearing, setBearing] = useState(0)
  const [locationHistory, setLocationHistory] = useState<any[]>([])
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date())
  const [isOnRoute, setIsOnRoute] = useState(true)
  const [trafficDelay, setTrafficDelay] = useState(0)

  useEffect(() => {
    if (!isActive || !destination) return

    // Generate detailed route points between pickup and destination
    const routePoints = generateRoute(initialPosition, destination)
    setRoute(routePoints)
    setEta(Math.ceil(routePoints.length * 0.5)) // Rough ETA calculation
    setLocationHistory([initialPosition])

    let currentIndex = 0
    const updateInterval = setInterval(() => {
      if (currentIndex < routePoints.length - 1) {
        const currentPoint = routePoints[currentIndex]
        const nextPoint = routePoints[currentIndex + 1]
        
        // Add slight random variation to simulate real GPS movement
        const gpsVariation = {
          lat: currentPoint.lat + (Math.random() - 0.5) * 0.0001,
          lng: currentPoint.lng + (Math.random() - 0.5) * 0.0001
        }
        
        setCurrentPosition(gpsVariation)
        setProgress((currentIndex / (routePoints.length - 1)) * 100)
        
        // Realistic speed variation based on traffic
        const baseSpeed = 25 + Math.random() * 15 // 25-40 mph base
        const trafficMultiplier = Math.random() > 0.8 ? 0.5 : 1 // 20% chance of traffic slowdown
        const currentSpeed = baseSpeed * trafficMultiplier
        setSpeed(currentSpeed)
        
        // Calculate traffic delay
        if (trafficMultiplier < 1) {
          setTrafficDelay(prev => prev + 1)
        }
        
        setBearing(calculateBearing(currentPoint, nextPoint))
        setEta(Math.ceil((routePoints.length - currentIndex) * 0.5 + trafficDelay * 0.1))
        setLastUpdateTime(new Date())
        setIsOnRoute(Math.random() > 0.05) // 95% chance of being on route
        
        // Update location history
        setLocationHistory(prev => [...prev.slice(-20), gpsVariation]) // Keep last 20 positions
        
        currentIndex++
      } else {
        setProgress(100)
        setSpeed(0)
        setEta(0)
        clearInterval(updateInterval)
      }
    }, 1500) // More frequent updates for smoother tracking

    return () => clearInterval(updateInterval)
  }, [isActive, destination, initialPosition])

  return { 
    currentPosition, 
    route, 
    progress, 
    eta, 
    speed, 
    bearing, 
    locationHistory, 
    lastUpdateTime, 
    isOnRoute, 
    trafficDelay 
  }
}

// Enhanced route generation with more realistic GPS points
const generateRoute = (start: any, end: any) => {
  const points = []
  const steps = 25 // More route points for smoother tracking
  
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps
    
    // Add curve variation to simulate real roads
    const curveFactor = Math.sin(ratio * Math.PI * 3) * 0.001
    const roadVariation = (Math.random() - 0.5) * 0.0005
    
    const lat = start.lat + (end.lat - start.lat) * ratio + curveFactor + roadVariation
    const lng = start.lng + (end.lng - start.lng) * ratio + (Math.random() - 0.5) * 0.001 + roadVariation
    
    points.push({ 
      lat, 
      lng, 
      timestamp: Date.now() + i * 1500,
      speed: 25 + Math.random() * 15, // Speed at this point
      isTrafficArea: Math.random() > 0.8 // 20% chance of traffic
    })
  }
  
  return points
}

// Bearing calculation
const calculateBearing = (point1: any, point2: any) => {
  const dLng = point2.lng - point1.lng
  const y = Math.sin(dLng) * Math.cos(point2.lat)
  const x = Math.cos(point1.lat) * Math.sin(point2.lat) - 
            Math.sin(point1.lat) * Math.cos(point2.lat) * Math.cos(dLng)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

// Real-time chat system for driver-passenger communication
const ChatSystem = ({ trip, driver, isOpen, onClose }: {
  trip: any,
  driver: any,
  isOpen: boolean,
  onClose: () => void
}) => {
  const [messages, setMessages] = useKV(`chat-${trip.id}`, [] as any[])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [driverTyping, setDriverTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Quick message templates
  const quickMessages = [
    "I'm running a few minutes late",
    "Where exactly should I meet you?",
    "Thank you!",
    "Please wait, I'll be right there",
    "Can you see me?",
    "Traffic is heavy, might be delayed"
  ]

  // Enhanced notification system for new messages
  useEffect(() => {
    if (!isOpen && trip && messages.length > 0) {
      // Check for new driver messages when chat is closed
      const lastDriverMessage = messages
        .filter(msg => msg.sender === 'driver')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      
      if (lastDriverMessage) {
        const messageAge = new Date().getTime() - new Date(lastDriverMessage.timestamp).getTime()
        if (messageAge < 5000) { // Message is less than 5 seconds old
          // This would trigger unread count update in parent component
          // For demo purposes, we'll show a toast notification
          if (typeof window !== 'undefined') {
            toast.success(`New message from ${driver.name}: ${lastDriverMessage.text.substring(0, 50)}${lastDriverMessage.text.length > 50 ? '...' : ''}`, {
              duration: 4000,
              action: {
                label: "Reply",
                onClick: () => {
                  // This would open the chat in a real implementation
                  console.log("Open chat")
                }
              }
            })
          }
        }
      }
    }
  }, [messages, isOpen, trip, driver.name])

  // Simulate driver messages and typing
  useEffect(() => {
    if (!isOpen) return

    // Add initial driver message if no messages exist
    if (messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: `Hello! I'm ${driver.name}, your driver for today. I'm on my way to pick you up. ETA: ${driver.eta} minutes.`,
        sender: 'driver',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages([welcomeMessage])
    }

    // Simulate driver responses
    const responseInterval = setInterval(() => {
      if (Math.random() > 0.85 && messages.length > 0) { // 15% chance every 10 seconds
        const responses = [
          "On my way!",
          "Just around the corner",
          "Should be there in 2 minutes",
          "Thanks for waiting",
          "Traffic is moving well",
          "I can see the pickup location"
        ]
        
        const response = {
          id: Date.now(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'driver',
          timestamp: new Date(),
          type: 'text'
        }
        
        setMessages(prev => [...prev, response])
      }
    }, 10000)

    // Simulate driver typing indicator
    const typingInterval = setInterval(() => {
      if (Math.random() > 0.9) { // 10% chance
        setDriverTyping(true)
        setTimeout(() => setDriverTyping(false), 2000)
      }
    }, 15000)

    return () => {
      clearInterval(responseInterval)
      clearInterval(typingInterval)
    }
  }, [isOpen, messages.length, driver.name, driver.eta, setMessages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, driverTyping])

  // Handle sending messages
  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: 'passenger',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    
    // Show typing indicator
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 1000)
    
    toast.success("💬 Message sent")
  }

  const sendQuickMessage = (text: string) => {
    const message = {
      id: Date.now(),
      text,
      sender: 'passenger',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    toast.success("💬 Quick message sent")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full max-w-md mx-auto bg-background rounded-t-3xl border-t border-border max-h-[85vh] flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-card to-card/95">
          <div className="flex items-center gap-3">
            <img 
              src={driver.photo} 
              alt={driver.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-background"
            />
            <div>
              <h3 className="font-semibold">{driver.name}</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="w-9 h-9 rounded-full">
              <Phone size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="w-9 h-9 rounded-full">
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'passenger' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[80%]">
                {message.sender === 'driver' && (
                  <img 
                    src={driver.photo} 
                    alt={driver.name}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.sender === 'passenger'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-muted-foreground rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <p className={`text-xs text-muted-foreground mt-1 ${
                    message.sender === 'passenger' ? 'text-right' : 'text-left'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Driver typing indicator */}
          {driverTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <img 
                  src={driver.photo} 
                  alt={driver.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Messages */}
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickMessages.slice(0, 3).map((msg, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap h-8 text-xs bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => sendQuickMessage(msg)}
              >
                {msg}
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-gradient-to-r from-card to-card/95">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="pr-12 rounded-full border-2 focus:border-primary transition-colors"
                maxLength={500}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
              >
                <SmileyWink size={16} className="text-muted-foreground" />
              </Button>
            </div>
            
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              <PaperPlaneTilt size={18} className="text-primary-foreground" weight="fill" />
            </Button>
          </div>
          
          {/* Character count */}
          {newMessage.length > 400 && (
            <p className="text-xs text-muted-foreground text-right mt-1">
              {newMessage.length}/500
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Real-time Live Tracking component for active trips
const LiveTrackingMap = ({ trip, driver, onArrival }: {
  trip: any,
  driver: any,
  onArrival?: () => void
}) => {
  const [driverLocation, setDriverLocation] = useState(driver.location || londonLocations[0])
  const [estimatedArrival, setEstimatedArrival] = useState(driver.eta || 5)
  const [routeInfo, setRouteInfo] = useState<any>(null)
  const [isTrackingActive, setIsTrackingActive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const mapRef = useRef<any>(null)

  // Real-time driver position simulation with more realistic movement
  useEffect(() => {
    if (!isTrackingActive) return

    const updateInterval = setInterval(() => {
      setDriverLocation(prev => {
        // Simulate movement toward pickup/destination
        const target = trip.status === 'driver_en_route' ? trip.pickupCoords : trip.destinationCoords
        if (!target) return prev

        // Calculate movement direction
        const deltaLat = (target.lat - prev.lat) * 0.1 // Move 10% closer each update
        const deltaLng = (target.lng - prev.lng) * 0.1

        // Add realistic GPS variance
        const newLat = prev.lat + deltaLat + (Math.random() - 0.5) * 0.0001
        const newLng = prev.lng + deltaLng + (Math.random() - 0.5) * 0.0001

        // Check if arrived
        const distance = Math.sqrt(Math.pow(target.lat - newLat, 2) + Math.pow(target.lng - newLng, 2))
        if (distance < 0.001) { // Very close to destination
          setEstimatedArrival(0)
          if (onArrival) {
            setTimeout(onArrival, 1000)
          }
        } else {
          // Update ETA based on distance
          const roughDistance = distance * 111000 // Convert to meters roughly
          setEstimatedArrival(Math.ceil(roughDistance / 500)) // Assuming 500m/min average speed
        }

        setLastUpdate(new Date())
        return { lat: newLat, lng: newLng }
      })
    }, 2000) // Update every 2 seconds for smooth movement

    return () => clearInterval(updateInterval)
  }, [isTrackingActive, trip.status, trip.pickupCoords, trip.destinationCoords, onArrival])

  // Calculate route when component mounts
  useEffect(() => {
    if (window.google && trip.pickupCoords && trip.destinationCoords) {
      const directionsService = new window.google.maps.DirectionsService()
      
      directionsService.route({
        origin: trip.pickupCoords,
        destination: trip.destinationCoords,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, (result, status) => {
        if (status === 'OK' && result) {
          setRouteInfo({
            distance: result.routes[0].legs[0].distance?.text,
            duration: result.routes[0].legs[0].duration?.text,
            steps: result.routes[0].legs[0].steps
          })
        }
      })
    }
  }, [trip.pickupCoords, trip.destinationCoords])

  const markers = [
    // Driver marker with real-time position
    {
      lat: driverLocation.lat,
      lng: driverLocation.lng,
      title: `${driver.name} - Your Driver`,
      icon: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="#22C55E" stroke="white" stroke-width="3"/>
          <path d="M8 16l4 4 8-8" stroke="white" stroke-width="2" fill="none"/>
        </svg>
      `),
      animation: window.google?.maps?.Animation?.BOUNCE,
      infoWindow: `
        <div style="padding: 8px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${driver.name}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">
            ${driver.vehicle}<br/>
            License: ${driver.license}<br/>
            ETA: ${estimatedArrival} minutes
          </p>
        </div>
      `
    },
    // Pickup marker
    {
      lat: trip.pickupCoords.lat,
      lng: trip.pickupCoords.lng,
      title: 'Pickup Location',
      icon: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="3"/>
          <circle cx="16" cy="16" r="4" fill="white"/>
        </svg>
      `),
      infoWindow: `
        <div style="padding: 8px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">Pickup Point</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${trip.pickup}</p>
        </div>
      `
    },
    // Destination marker
    {
      lat: trip.destinationCoords.lat,
      lng: trip.destinationCoords.lng,
      title: 'Destination',
      icon: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C11.03 2 7 6.03 7 11c0 7.25 9 17 9 17s9-9.75 9-17c0-4.97-4.03-9-9-9z" fill="#EF4444" stroke="white" stroke-width="2"/>
          <circle cx="16" cy="11" r="3" fill="white"/>
        </svg>
      `),
      infoWindow: `
        <div style="padding: 8px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">Destination</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${trip.destination}</p>
        </div>
      `
    }
  ]

  return (
    <div className="space-y-4">
      {/* Live Status Banner */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-semibold text-green-700">Live Tracking Active</h3>
                <p className="text-sm text-green-600">
                  Driver is {estimatedArrival === 0 ? 'arriving now' : `${estimatedArrival} minutes away`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-600">Last update</p>
              <p className="text-xs font-mono text-green-700">
                {lastUpdate.toLocaleTimeString('en-GB', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Map with Live Tracking */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-0">
          <GoogleMapView
            center={driverLocation}
            markers={markers}
            className="h-80"
            showControls={true}
            showTraffic={true}
            trackingMode={true}
          />
          
          {/* Map overlay controls */}
          <div className="absolute top-4 left-4 space-y-2">
            <Badge variant="outline" className="bg-background/95 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              Real-time GPS
            </Badge>
            {routeInfo && (
              <div className="bg-background/95 rounded-lg p-2 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <NavigationArrow size={12} />
                  <span>{routeInfo.distance}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>{routeInfo.duration}</span>
                </div>
              </div>
            )}
          </div>

          {/* Driver info overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={driver.photo} 
                    alt={driver.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-background"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{driver.name}</h4>
                    <p className="text-xs text-muted-foreground">{driver.vehicle} • {driver.license}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      {estimatedArrival === 0 ? 'Arriving' : `${estimatedArrival} min`}
                    </p>
                    <p className="text-xs text-muted-foreground">ETA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Route Information */}
      {routeInfo && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-3">Route Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{routeInfo.distance}</p>
                <p className="text-xs text-muted-foreground">Total Distance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{routeInfo.duration}</p>
                <p className="text-xs text-muted-foreground">Estimated Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking Controls */}
      <div className="flex gap-2">
        <Button
          variant={isTrackingActive ? "default" : "outline"}
          size="sm"
          className="flex-1 h-10"
          onClick={() => setIsTrackingActive(!isTrackingActive)}
        >
          {isTrackingActive ? (
            <>
              <CheckCircle size={16} className="mr-2" />
              Tracking Active
            </>
          ) : (
            <>
              <Warning size={16} className="mr-2" />
              Start Tracking
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-4"
          onClick={() => {
            try {
              if (mapRef.current && typeof mapRef.current.toggleTraffic === 'function') {
                mapRef.current.toggleTraffic()
              }
            } catch (error) {
              console.warn('Traffic toggle error:', error)
              toast.error('Traffic layer temporarily unavailable')
            }
          }}
        >
          Traffic
        </Button>
      </div>
    </div>
  )
}

function App() {
  const [currentView, setCurrentView] = useState<string>('home')
  const [selectedService, setSelectedService] = useState<string>('')
  const [currentTrip, setCurrentTrip] = useState<any>(null)
  const [assignedDriver, setAssignedDriver] = useState<any>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [bookingForm, setBookingForm] = useState({
    pickup: '',
    destination: '',
    pickupCoords: null as { lat: number; lng: number } | null,
    destinationCoords: null as { lat: number; lng: number } | null
  })
  const [favorites, setFavorites] = useKV("favorite-locations", [] as any[])
  const [recentTrips, setRecentTrips] = useKV("recent-trips", [] as any[])
  const [paymentMethod, setPaymentMethod] = useState('mastercard')
  
  // Real geolocation integration with continuous tracking
  const { 
    location: userLocation, 
    address: userAddress, 
    loading: locationLoading, 
    accuracy,
    heading,
    speed: userSpeed,
    getCurrentLocation,
    startWatchingLocation,
    stopWatchingLocation
  } = useGeolocation()
  const [mapCenter, setMapCenter] = useState({ lat: 51.5074, lng: -0.1278 }) // Default to London
  const [showFullMap, setShowFullMap] = useState(false)
  const [isLocationWatching, setIsLocationWatching] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [statusType, setStatusType] = useState<'info' | 'success' | 'warning' | 'error'>('info')

  // Update map center when user location is found
  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation)
      if (!bookingForm.pickup && userAddress) {
        setBookingForm(prev => ({ 
          ...prev, 
          pickup: userAddress,
          pickupCoords: userLocation 
        }))
      }
    }
  }, [userLocation, userAddress, bookingForm.pickup])

  // Initialize location and start watching when app loads
  useEffect(() => {
    getCurrentLocation()
    
    // Start continuous tracking for better user experience
    const watchId = startWatchingLocation()
    setIsLocationWatching(true)
    
    return () => {
      stopWatchingLocation()
      setIsLocationWatching(false)
    }
  }, [getCurrentLocation, startWatchingLocation, stopWatchingLocation])

  // Function to show passenger-relevant status messages
  const showPassengerStatus = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setStatusMessage(message)
    setStatusType(type)
    // Auto-hide status after 5 seconds for non-critical messages
    if (type === 'info' || type === 'success') {
      setTimeout(() => setStatusMessage(''), 5000)
    }
  }

  // Example passenger status updates that would be appropriate:
  // - "🚗 Driver is 3 minutes away"
  // - "📍 Ready to book - pickup and destination set"
  // - "⚠️ High demand in your area - longer wait times expected"
  // - "✅ Payment method confirmed"
  // - "🎯 Favorite location saved successfully"

  const handleBookRide = () => {
    if (!bookingForm.pickup || !bookingForm.destination || !selectedService) {
      toast.error("🚗 Please set pickup location, destination, and choose your ride type")
      return
    }
    
    if (!bookingForm.pickupCoords || !bookingForm.destinationCoords) {
      toast.error("📍 Please select valid locations from the suggestions")
      return
    }
    
    const driver = drivers[Math.floor(Math.random() * drivers.length)]
    const service = rideServices.find(s => s.id === selectedService)
    
    const distance = calculateDistance(bookingForm.pickupCoords, bookingForm.destinationCoords)
    const estimatedDuration = Math.ceil(distance * 2) // Rough estimation: 2 minutes per km in city traffic
    
    const trip = {
      id: Date.now(),
      service: service,
      pickup: bookingForm.pickup,
      destination: bookingForm.destination,
      pickupCoords: bookingForm.pickupCoords,
      destinationCoords: bookingForm.destinationCoords,
      driver: driver,
      status: 'driver_assigned',
      startTime: new Date(),
      estimatedPrice: service?.priceRange,
      estimatedDistance: distance,
      estimatedDuration: estimatedDuration,
      realTimeData: {
        lastUpdate: new Date(),
        trafficCondition: 'moderate',
        weatherCondition: 'clear'
      }
    }
    
    setCurrentTrip(trip)
    setAssignedDriver(driver)
    setCurrentView('tracking')
    setIsChatOpen(false)
    setUnreadMessages(0)
    
    // Clear any previous status and show driver assignment
    setStatusMessage('')
    setTimeout(() => {
      showPassengerStatus(`🚗 ${driver.name} is your driver - arriving in ${driver.eta} minutes`, 'success')
    }, 1000)
    
    // Add to recent trips
    setRecentTrips((prev: any[]) => [trip, ...prev.slice(0, 9)])
    
    // Show passenger-relevant notification instead of technical details
    showPassengerStatus(`🚗 ${driver.name} is your driver - arriving in ${driver.eta} minutes`, 'success')
    toast.success(`🚗 ${driver.name} is your driver! They'll arrive in ${driver.eta} minutes`, {
      duration: 5000,
      description: `${driver.vehicle} • ${driver.license}`
    })
    setBookingForm({ pickup: '', destination: '', pickupCoords: null, destinationCoords: null })
  }

  // Distance calculation helper
  const calculateDistance = (point1: any, point2: any) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLng = (point2.lng - point1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c * 100) / 100 // Round to 2 decimal places
  }

  const addToFavorites = (location: string, name: string) => {
    const newFavorite = { name, address: location, id: Date.now() }
    setFavorites((prev: any[]) => [...prev, newFavorite])
    // Don't show duplicate toast here since it's handled at the button level
  }

  // Home/Booking View
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        {/* Header with subtle shadow */}
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Car size={18} className="text-primary-foreground" weight="bold" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">GQ Cars</h1>
            </div>
            <Button variant="ghost" size="sm" className="w-9 h-9 rounded-full">
              <User size={18} />
            </Button>
          </div>
        </header>

        {/* Passenger Status Banner - Only show relevant information */}
        {statusMessage && (
          <div className={`mx-4 mt-4 p-3 rounded-lg border-l-4 ${
            statusType === 'success' ? 'bg-green-50 border-green-500 text-green-700' :
            statusType === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-700' :
            statusType === 'error' ? 'bg-red-50 border-red-500 text-red-700' :
            'bg-blue-50 border-blue-500 text-blue-700'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {statusType === 'success' && <CheckCircle size={16} />}
                {statusType === 'warning' && <Warning size={16} />}
                {statusType === 'error' && <X size={16} />}
                {statusType === 'info' && <CheckCircle size={16} />}
                <p className="text-sm font-medium">{statusMessage}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setStatusMessage('')}
                className="h-6 w-6 p-0 hover:bg-transparent"
              >
                <X size={12} />
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 pb-20 space-y-4 max-w-md mx-auto">
          {/* Enhanced Map Preview with Real Google Maps */}
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
            <CardContent className="p-0">
              <div className="relative">
                <GoogleMapsLoader>
                  <GoogleMapView
                    center={mapCenter}
                    markers={userLocation ? [{
                      lat: userLocation.lat,
                      lng: userLocation.lng,
                      title: "Your Location",
                      icon: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="10" cy="10" r="6" fill="#3B82F6" stroke="white" stroke-width="2"/>
                          <circle cx="10" cy="10" r="2" fill="white"/>
                        </svg>
                      `),
                      animation: window.google?.maps?.Animation?.BOUNCE
                    }] : []}
                    onLocationSelect={(location) => {
                      if (!bookingForm.pickup) {
                        setBookingForm(prev => ({
                          ...prev,
                          pickup: location.address,
                          pickupCoords: { lat: location.lat, lng: location.lng }
                        }))
                        showPassengerStatus("📍 Pickup location confirmed", 'success')
                        toast.success("📍 Pickup location set")
                      } else if (!bookingForm.destination) {
                        setBookingForm(prev => ({
                          ...prev,
                          destination: location.address,
                          destinationCoords: { lat: location.lat, lng: location.lng }
                        }))
                        showPassengerStatus("🎯 Destination confirmed - ready to book", 'success')
                        toast.success("🎯 Destination confirmed")
                      }
                    }}
                    className="h-40"
                    showControls={false}
                    showCurrentLocation={true}
                  />
                </GoogleMapsLoader>
                
                {/* Compact GPS Status */}
                <div className="absolute top-3 left-3">
                  <Badge variant="outline" className="bg-background/95 text-xs border-0 shadow-sm px-2 py-1">
                    {userLocation ? (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-700 font-medium">GPS</span>
                      </div>
                    ) : locationLoading ? (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-blue-600">Locating</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Warning size={12} className="text-amber-500" />
                        <span className="text-amber-600">No GPS</span>
                      </div>
                    )}
                  </Badge>
                </div>
                
                {/* Compact Map Hint */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                    <p className="text-xs text-muted-foreground text-center">
                      Tap to set {!bookingForm.pickup ? 'pickup' : !bookingForm.destination ? 'destination' : 'location'}
                    </p>
                  </div>
                </div>
                
                {/* Compact Quick Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-8 h-8 p-0 bg-background/90 shadow-sm rounded-full"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Crosshair size={14} />
                    )}
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-8 h-8 p-0 bg-background/90 shadow-sm rounded-full"
                    onClick={() => setShowFullMap(true)}
                  >
                    <MagnifyingGlass size={14} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compact Location Display */}
          {userLocation && (
            <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Compass size={12} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs mb-0.5">Current Location</p>
                      <p className="text-xs text-muted-foreground truncate">{userAddress || 'Getting address...'}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs shrink-0"
                    onClick={() => {
                      if (userAddress && userLocation) {
                        setBookingForm(prev => ({
                          ...prev,
                          pickup: userAddress,
                          pickupCoords: userLocation
                        }))
                        showPassengerStatus("📍 Using your current location as pickup", 'success')
                        toast.success("📍 Using current location as pickup")
                      }
                    }}
                  >
                    Use
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Improved Booking Form */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/98">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="relative">
                  <GoogleMapsLoader>
                    <PlacesAutocomplete
                      value={bookingForm.pickup}
                      onChange={(value) => setBookingForm(prev => ({ ...prev, pickup: value }))}
                      placeholder="Pickup location"
                      className="pl-8 h-10 border-0 bg-muted/50 focus:bg-background transition-colors text-sm"
                      onPlaceSelect={(place) => {
                        if (place.geometry?.location) {
                          setBookingForm(prev => ({
                            ...prev,
                            pickup: place.formatted_address || place.name,
                            pickupCoords: {
                              lat: place.geometry.location.lat(),
                              lng: place.geometry.location.lng()
                            }
                          }))
                          setMapCenter({
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                          })
                        }
                      }}
                    />
                  </GoogleMapsLoader>
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm"></div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 text-xs"
                    onClick={() => {
                      if (userLocation && userAddress) {
                        setBookingForm(prev => ({
                          ...prev,
                          pickup: userAddress,
                          pickupCoords: userLocation
                        }))
                        toast.success("📍 GPS location set as pickup")
                      } else {
                        getCurrentLocation()
                      }
                    }}
                    disabled={locationLoading}
                  >
                    <Crosshair size={12} className="mr-1" />
                    GPS
                  </Button>
                </div>
                
                <div className="relative">
                  <GoogleMapsLoader>
                    <PlacesAutocomplete
                      value={bookingForm.destination}
                      onChange={(value) => setBookingForm(prev => ({ ...prev, destination: value }))}
                      placeholder="Where to?"
                      className="pl-8 h-10 border-0 bg-muted/50 focus:bg-background transition-colors text-sm"
                      onPlaceSelect={(place) => {
                        if (place.geometry?.location) {
                          setBookingForm(prev => ({
                            ...prev,
                            destination: place.formatted_address || place.name,
                            destinationCoords: {
                              lat: place.geometry.location.lat(),
                              lng: place.geometry.location.lng()
                            }
                          }))
                        }
                      }}
                    />
                  </GoogleMapsLoader>
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm"></div>
                  {bookingForm.destination && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-1.5"
                      onClick={() => {
                        addToFavorites(bookingForm.destination, `Saved Location ${favorites.length + 1}`)
                        toast.success("❤️ Location saved to favorites")
                      }}
                    >
                      <Heart size={12} />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Distance Display with Booking Ready Status */}
              {bookingForm.pickupCoords && bookingForm.destinationCoords && selectedService && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={12} className="text-green-600" />
                      <span className="font-medium text-green-700">Ready to book</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <NavigationArrow size={10} />
                        <span>{calculateDistance(bookingForm.pickupCoords, bookingForm.destinationCoords).toFixed(1)} km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        <span>~{Math.ceil(calculateDistance(bookingForm.pickupCoords, bookingForm.destinationCoords) * 2)} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Compact Distance Display */}
              {bookingForm.pickupCoords && bookingForm.destinationCoords && !selectedService && (
                <div className="mt-2 p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <NavigationArrow size={12} className="text-muted-foreground" />
                      <span className="font-medium">{calculateDistance(bookingForm.pickupCoords, bookingForm.destinationCoords).toFixed(1)} km</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-muted-foreground" />
                      <span className="font-medium">~{Math.ceil(calculateDistance(bookingForm.pickupCoords, bookingForm.destinationCoords) * 2)} min</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Compact Quick Picks */}
              {(!bookingForm.destination) && favorites.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground font-medium">Quick destinations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {favorites.slice(0, 3).map((fav, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => {
                          setBookingForm(prev => ({
                            ...prev,
                            destination: fav.address
                          }))
                        }}
                      >
                        <Heart size={10} className="mr-1" />
                        {fav.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compact Ride Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-muted-foreground font-medium">Choose your ride</p>
              <Clock size={12} className="text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              {rideServices.map(service => {
                const Icon = service.icon
                return (
                  <Card 
                    key={service.id}
                    className={`cursor-pointer transition-all duration-200 border-0 shadow-sm hover:shadow-md ${ 
                      selectedService === service.id 
                        ? 'ring-2 ring-primary bg-gradient-to-r from-primary/5 to-accent/5 shadow-md' 
                        : 'hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/10'
                    }`}
                    onClick={() => {
                      setSelectedService(service.id)
                      showPassengerStatus(`${service.name} selected - ${service.priceRange}`, 'info')
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          selectedService === service.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-primary/10'
                        }`}>
                          <Icon size={18} className={selectedService === service.id ? '' : 'text-primary'} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-sm leading-tight">{service.name}</h3>
                              <p className="text-xs text-muted-foreground leading-tight">{service.capacity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm leading-tight">{service.priceRange}</p>
                              <p className="text-xs text-muted-foreground leading-tight">{service.eta}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Compact Payment Method */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-muted-foreground" />
                  <span className="font-medium text-sm">Mastercard •••• 4321</span>
                </div>
                <NavigationArrow size={12} className="rotate-90 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Confirm Button with validation */}
          <Button 
            onClick={handleBookRide}
            className="w-full h-12 bg-gradient-to-r from-black to-black/90 hover:from-black/90 hover:to-black/80 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            disabled={!bookingForm.pickup || !bookingForm.destination || !selectedService || !bookingForm.pickupCoords || !bookingForm.destinationCoords}
          >
            <div className="flex items-center gap-2">
              {selectedService && <Car size={16} />}
              {!bookingForm.pickup || !bookingForm.destination ? 
                'Enter pickup & destination' :
                !selectedService ? 
                'Select ride type' :
                !bookingForm.pickupCoords || !bookingForm.destinationCoords ?
                'Select valid locations' :
                `Confirm ${rideServices.find(s => s.id === selectedService)?.name}`
              }
            </div>
          </Button>

          {/* Compact Booking Tips */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-accent/5 to-primary/5">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-accent mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-medium text-xs">Quick tips</h4>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    <li>• Enable GPS for precise pickup</li>
                    <li>• Save favorites for faster booking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Map Modal */}
        {showFullMap && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">Select Location</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullMap(false)}
                    className="w-8 h-8 p-0"
                  >
                    <X size={16} />
                  </Button>
                </div>
                <GoogleMapsLoader>
                  <GoogleMapView
                    center={mapCenter}
                    markers={userLocation ? [{
                      lat: userLocation.lat,
                      lng: userLocation.lng,
                      title: "Your Location",
                      icon: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="10" cy="10" r="6" fill="#3B82F6" stroke="white" stroke-width="2"/>
                          <circle cx="10" cy="10" r="2" fill="white"/>
                        </svg>
                      `)
                    }] : []}
                    onLocationSelect={(location) => {
                      if (!bookingForm.pickup) {
                        setBookingForm(prev => ({
                          ...prev,
                          pickup: location.address,
                          pickupCoords: { lat: location.lat, lng: location.lng }
                        }))
                        toast.success("Pickup location set")
                      } else if (!bookingForm.destination) {
                        setBookingForm(prev => ({
                          ...prev,
                          destination: location.address,
                          destinationCoords: { lat: location.lat, lng: location.lng }
                        }))
                        toast.success("Destination set")
                      }
                      setShowFullMap(false)
                    }}
                    className="h-96"
                    showControls={true}
                    showCurrentLocation={true}
                  />
                </GoogleMapsLoader>
                <div className="p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground text-center">
                    Tap anywhere on the map to set your {!bookingForm.pickup ? 'pickup location' : 'destination'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bottom Navigation with enhanced design */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50">
          <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
            <button
              onClick={() => setCurrentView('home')}
              className="flex flex-col items-center justify-center gap-1 text-primary transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <House size={20} weight="fill" />
              </div>
              <span className="text-xs font-semibold">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentView('activity')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <List size={20} />
              </div>
              <span className="text-xs">Activity</span>
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <Heart size={20} />
              </div>
              <span className="text-xs">Saved</span>
            </button>

            <button
              onClick={() => setCurrentView('account')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <User size={20} />
              </div>
              <span className="text-xs">Account</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Trip Tracking View
  if (currentView === 'tracking' && currentTrip && assignedDriver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        {/* Header with enhanced styling */}
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('home')} className="w-9 h-9 rounded-full">
              <ArrowLeft size={18} />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold truncate">Trip to {currentTrip.destination}</h1>
              <p className="text-xs text-muted-foreground">Tracking your ride</p>
            </div>
          </div>
        </header>

        {/* Driver Status Updates */}
        {currentTrip && assignedDriver && (
          <div className="mx-4 mt-4 p-3 rounded-lg bg-green-50 border-l-4 border-green-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-green-700">
                {assignedDriver.name} is {assignedDriver.eta} minutes away
              </p>
            </div>
          </div>
        )}

        <div className="p-4 space-y-4 max-w-md mx-auto">{/* Enhanced Live Tracking Map */}
          <LiveTrackingMap 
            trip={currentTrip} 
            driver={{...assignedDriver, location: userLocation}} 
            onArrival={() => {
              toast.success("🚗 Driver has arrived!")
              // Could transition to in-trip mode here
            }}
          />

          {/* Driver Info with improved layout */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/95">
            <CardContent className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img 
                    src={assignedDriver.photo} 
                    alt={assignedDriver.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{assignedDriver.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Star size={14} className="text-yellow-500" weight="fill" />
                    <span className="font-medium">{assignedDriver.rating}</span>
                    <span>•</span>
                    <span>{assignedDriver.completedTrips} trips</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{assignedDriver.vehicle}</p>
                  <p className="text-sm text-muted-foreground">{assignedDriver.license}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-11 font-medium"
                  onClick={() => {
                    // Simulate calling driver
                    toast.success("📞 Calling driver...")
                  }}
                >
                  <Phone size={16} className="mr-2" />
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-11 font-medium relative"
                  onClick={() => {
                    setIsChatOpen(true)
                    setUnreadMessages(0)
                  }}
                >
                  <ChatCircle size={16} className="mr-2" />
                  Chat
                  {unreadMessages > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 text-xs bg-destructive text-destructive-foreground flex items-center justify-center">
                      {unreadMessages}
                    </Badge>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Trip Details with Real-time Info */}
          <div className="space-y-3">
            <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Trip Route</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 shadow-sm"></div>
                    <div>
                      <p className="font-medium">{currentTrip.pickup}</p>
                      <p className="text-xs text-muted-foreground">Pickup location</p>
                    </div>
                  </div>
                  <div className="ml-2 w-0.5 h-8 bg-gradient-to-b from-blue-500 via-muted to-red-500"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0 shadow-sm"></div>
                    <div>
                      <p className="font-medium">{currentTrip.destination}</p>
                      <p className="text-xs text-muted-foreground">Destination</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Trip Stats */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{currentTrip.estimatedDistance || '3.2'} km</p>
                    <p className="text-xs text-muted-foreground">Distance</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">{currentTrip.estimatedDuration || '12'} min</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">£{currentTrip.estimatedPrice?.split(' - ')[0]?.substring(1) || '12.50'}</p>
                    <p className="text-xs text-muted-foreground">Fare</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Traffic & Weather Conditions */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-3">Current Conditions</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Moderate traffic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Clear weather</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Last updated: {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Button 
            variant="destructive" 
            className="w-full h-12 font-semibold rounded-xl"
            onClick={() => {
              setCurrentTrip(null)
              setAssignedDriver(null)
              setIsChatOpen(false)
              setUnreadMessages(0)
              setCurrentView('home')
              toast.success("❌ Trip cancelled")
            }}
          >
            Cancel Trip
          </Button>
        </div>

        {/* Chat System */}
        {currentTrip && assignedDriver && (
          <ChatSystem 
            trip={currentTrip}
            driver={assignedDriver}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        )}

        {/* Floating Chat Bubble for unread messages */}
        {currentTrip && assignedDriver && !isChatOpen && unreadMessages > 0 && (
          <div className="fixed bottom-20 right-4 z-40">
            <Button
              onClick={() => {
                setIsChatOpen(true)
                setUnreadMessages(0)
              }}
              className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-xl relative animate-bounce"
            >
              <ChatCircle size={24} className="text-primary-foreground" weight="fill" />
              <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 text-xs bg-destructive text-destructive-foreground flex items-center justify-center">
                {unreadMessages}
              </Badge>
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Activity View
  if (currentView === 'activity') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 p-4 sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold">Your Activity</h1>
            <p className="text-sm text-muted-foreground">Recent trips and bookings</p>
          </div>
        </header>

        <div className="p-4 pb-20 max-w-md mx-auto">
          {recentTrips.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <List size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">When you book your first ride with GQ Cars, it will appear here</p>
              <Button onClick={() => setCurrentView('home')} className="h-12 px-6 rounded-xl font-semibold">
                <Car size={18} className="mr-2" />
                Book your first ride
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrips.map((trip: any) => (
                <Card key={trip.id} className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Car size={18} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{trip.service.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(trip.startTime).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-lg">{trip.estimatedPrice}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-muted-foreground truncate">{trip.pickup}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-destructive rounded-full"></div>
                        <span className="text-muted-foreground truncate">{trip.destination}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                      <span className="text-sm text-muted-foreground">Driver: {trip.driver.name}</span>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        View details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50">
          <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
            <button
              onClick={() => setCurrentView('home')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <House size={20} />
              </div>
              <span className="text-xs">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentView('activity')}
              className="flex flex-col items-center justify-center gap-1 text-primary transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <List size={20} weight="fill" />
              </div>
              <span className="text-xs font-semibold">Activity</span>
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <Heart size={20} />
              </div>
              <span className="text-xs">Saved</span>
            </button>

            <button
              onClick={() => setCurrentView('account')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <User size={20} />
              </div>
              <span className="text-xs">Account</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Favorites View
  if (currentView === 'favorites') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 p-4 sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold">Saved Places</h1>
            <p className="text-sm text-muted-foreground">Quick access to your favorites</p>
          </div>
        </header>

        <div className="p-4 pb-20 max-w-md mx-auto">
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No saved places</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Save your favorite locations for quick and easy booking</p>
              <Button onClick={() => setCurrentView('home')} className="h-12 px-6 rounded-xl font-semibold">
                <Plus size={18} className="mr-2" />
                Add first location
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((location: any) => (
                <Card key={location.id} className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MapPin size={20} className="text-primary" weight="duotone" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base mb-1">{location.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{location.address}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="ml-3 h-9 px-4 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => {
                          setBookingForm(prev => ({ ...prev, destination: location.address }))
                          setCurrentView('home')
                          toast.success("🎯 Destination set from favorites")
                        }}
                      >
                        Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50">
          <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
            <button
              onClick={() => setCurrentView('home')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <House size={20} />
              </div>
              <span className="text-xs">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentView('activity')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <List size={20} />
              </div>
              <span className="text-xs">Activity</span>
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className="flex flex-col items-center justify-center gap-1 text-primary transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <Heart size={20} weight="fill" />
              </div>
              <span className="text-xs font-semibold">Saved</span>
            </button>

            <button
              onClick={() => setCurrentView('account')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <User size={20} />
              </div>
              <span className="text-xs">Account</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Account View
  if (currentView === 'account') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 p-4 sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold">Account</h1>
            <p className="text-sm text-muted-foreground">Manage your profile and settings</p>
          </div>
        </header>

        <div className="p-4 pb-20 space-y-6 max-w-md mx-auto">
          {/* Profile Section with enhanced design */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                    <User size={32} className="text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-1">John Smith</h3>
                  <p className="text-muted-foreground text-sm mb-1">john.smith@email.com</p>
                  <p className="text-muted-foreground text-sm">+44 7700 900123</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Star size={14} className="text-yellow-500" weight="fill" />
                    <span className="text-sm font-medium">4.9 passenger rating</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings with improved visual hierarchy */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-3">Settings</h2>
            
            <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <span className="font-medium">Payment Methods</span>
                      <p className="text-xs text-muted-foreground">Manage cards and billing</p>
                    </div>
                  </div>
                  <NavigationArrow size={16} className="rotate-90 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                      <Clock size={20} />
                    </div>
                    <div>
                      <span className="font-medium">Trip History</span>
                      <p className="text-xs text-muted-foreground">View all your journeys</p>
                    </div>
                  </div>
                  <NavigationArrow size={16} className="rotate-90 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                      <Phone size={20} />
                    </div>
                    <div>
                      <span className="font-medium">Help & Support</span>
                      <p className="text-xs text-muted-foreground">Get assistance 24/7</p>
                    </div>
                  </div>
                  <NavigationArrow size={16} className="rotate-90 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                      <Shield size={20} />
                    </div>
                    <div>
                      <span className="font-medium">Privacy & Safety</span>
                      <p className="text-xs text-muted-foreground">Security settings</p>
                    </div>
                  </div>
                  <NavigationArrow size={16} className="rotate-90 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50">
          <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
            <button
              onClick={() => setCurrentView('home')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <House size={20} />
              </div>
              <span className="text-xs">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentView('activity')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <List size={20} />
              </div>
              <span className="text-xs">Activity</span>
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <Heart size={20} />
              </div>
              <span className="text-xs">Saved</span>
            </button>

            <button
              onClick={() => setCurrentView('account')}
              className="flex flex-col items-center justify-center gap-1 text-primary transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <User size={20} weight="fill" />
              </div>
              <span className="text-xs font-semibold">Account</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default App