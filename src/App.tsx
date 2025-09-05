import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Shield, 
  Phone, 
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
  Crosshair,
  Warning,
  CheckCircle,
  ChatCircle,
  PaperPlaneTilt,
  SmileyWink,
  MagnifyingGlass,
  Bell,
  BellRinging,
  SpeakerHigh
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

// ARMORA Premium Personal Security Transport Services
const armoraServices = [
  {
    id: 'essential',
    name: 'Your Essential Protection',
    description: 'SIA-licensed security professional driver with industry best practice protocols',
    priceRange: '£45 - £75',
    eta: '3-8 min',
    icon: Car,
    capacity: '1-3 passengers',
    vehicle: 'Professional vehicle, discrete service',
    popular: true // Most popular choice
  },
  {
    id: 'shadow-escort',
    name: 'Shadow Escort',
    description: 'Drive yourself with professional security coordination - your freedom with protection backup',
    priceRange: '£150 - £350',
    eta: '5-12 min',
    icon: Shield,
    capacity: '1-4 passengers',
    vehicle: 'Your vehicle + Professional security coordination'
  },
  {
    id: 'executive-security', 
    name: 'Your Executive Security',
    description: 'Enhanced protection transport with SIA close protection officers meeting professional standards',
    priceRange: '£120 - £250',
    eta: '8-15 min',
    icon: Shield,
    capacity: '1-3 passengers',
    vehicle: 'Executive protection vehicles'
  },
  {
    id: 'signature-experience',
    name: 'Your Signature Experience',
    description: 'Personal security transport concierge - completely tailored to your travel lifestyle',
    priceRange: '£180 - £450',
    eta: '10-20 min',
    icon: Star,
    capacity: '1-4 passengers',
    vehicle: 'Rolls-Royce, Bentley premium fleet'
  },
  {
    id: 'airport-express',
    name: 'Airport Security Transport',
    description: 'Personal protection for your flight transfers with meet-greet service',
    priceRange: '£65 - £120',
    eta: '15-30 min',
    icon: NavigationArrow,
    capacity: '1-6 passengers',
    vehicle: 'Mercedes E-Class, Range Rover'
  },
  {
    id: 'corporate',
    name: 'Corporate Security Transport',
    description: 'Your business protection transport - designed for professional demands',
    priceRange: '£40 - £85',
    eta: '5-12 min',
    icon: Users,
    capacity: '1-8 passengers',
    vehicle: 'Mercedes V-Class, BMW X7'
  }
]

// ARMORA Premium Security Drivers & Chauffeurs
const armoraDrivers = [
  {
    id: 1,
    name: 'James Wellington',
    rating: 4.9,
    completedTrips: 847,
    vehicle: 'Mercedes S-Class 580 - Obsidian Black',
    license: 'SIA CPO License',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    eta: 5,
    certifications: ['SIA Close Protection', 'Enhanced DBS Cleared', 'BS 7858 Screened'],
    specialties: ['Executive Protection', 'Diplomatic Transport'],
    languages: ['English', 'French']
  },
  {
    id: 2,
    name: 'Victoria Sterling',
    rating: 4.8,
    completedTrips: 623,
    vehicle: 'Bentley Flying Spur - Sage Green',
    license: 'SIA CPO License', 
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b586?w=400&q=80',
    eta: 7,
    certifications: ['SIA Close Protection', 'Enhanced DBS Cleared', 'BS 7858 Screened'],
    specialties: ['VIP Security', 'Discrete Protection'],
    languages: ['English', 'Italian', 'Spanish']
  },
  {
    id: 3,
    name: 'Marcus Blackwood',
    rating: 4.9,
    completedTrips: 1134,
    vehicle: 'Rolls-Royce Ghost - Arctic White',
    license: 'SIA CPO License',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    eta: 12,
    certifications: ['SIA Close Protection', 'Enhanced DBS Cleared', 'BS 7858 Screened'],
    specialties: ['Ultra-Luxury', 'Government Transport'],
    languages: ['English', 'German']
  }
]

// Premium London locations for Armora service areas (Mayfair, Knightsbridge, Belgravia, etc.)
const premiumLondonLocations = [
  { lat: 51.5113, lng: -0.1533, name: "Mayfair - Berkeley Square" },
  { lat: 51.4994, lng: -0.1618, name: "Knightsbridge - Harrods" },
  { lat: 51.4945, lng: -0.1447, name: "Belgravia - Eaton Square" },
  { lat: 51.5033, lng: -0.1276, name: "Westminster - Parliament" },
  { lat: 51.5155, lng: -0.0922, name: "Tower Bridge" },
  { lat: 51.5007, lng: -0.1246, name: "Borough Market" },
  { lat: 51.5081, lng: -0.0759, name: "Canary Wharf" },
  { lat: 51.5118, lng: -0.1301, name: "St Paul's Cathedral" },
  { lat: 51.5139, lng: -0.0986, name: "Bank Station" },
  { lat: 51.4836, lng: -0.1629, name: "South Kensington - V&A Museum" }
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

// Enhanced Google Maps Loading Component - Improved Error Handling
const GoogleMapsLoader = ({ children, fallback }: { 
  children: React.ReactNode, 
  fallback?: React.ReactNode 
}) => {
  const { isLoaded, isLoading, error } = useGoogleMapsAPI()

  if (error) {
    return (
      <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3 p-4">
            <Warning size={28} className="text-amber-500 mx-auto" />
            <div>
              <p className="text-sm font-medium text-gray-700">Map temporarily unavailable</p>
              <p className="text-xs text-gray-500 mt-1">You can still enter addresses manually</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="text-xs h-8 px-3"
            >
              Retry Map
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      fallback || (
        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden rounded-lg">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">Loading Google Maps...</p>
                <p className="text-xs text-gray-500">This may take a few seconds</p>
              </div>
            </div>
          </div>
        </div>
      )
    )
  }

  if (!isLoaded) {
    return (
      <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3 p-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full mx-auto opacity-50 flex items-center justify-center">
              <MapPin size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Map not available</p>
              <p className="text-xs text-gray-500">Continue with manual address entry</p>
            </div>
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
        // GPS working silently in background - no notifications needed
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
        // Only show error for permission denied, not for timeout or unavailable
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    )
  }, [])

  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation) return null

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

  // Enhanced Google Maps initialization - Fixed initialization
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return

    try {
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

      // Initialize services safely
      if (window.google.maps.DirectionsService) {
        directionsServiceRef.current = new window.google.maps.DirectionsService()
      }
      
      if (window.google.maps.DirectionsRenderer) {
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#1976d2',
            strokeWeight: 5,
            strokeOpacity: 0.8
          }
        })
        directionsRendererRef.current.setMap(map)
      }

      // Add traffic layer if requested
      if (showTraffic && window.google.maps.TrafficLayer) {
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
    } catch (error) {
      console.error('Error initializing Google Maps:', error)
    }

    return () => {
      try {
        // Cleanup
        markersRef.current.forEach(marker => {
          if (marker && typeof marker.setMap === 'function') {
            marker.setMap(null)
          }
        })
        markersRef.current = []
        
        if (currentLocationMarkerRef.current && typeof currentLocationMarkerRef.current.setMap === 'function') {
          currentLocationMarkerRef.current.setMap(null)
        }
        
        if (trafficLayerRef.current && typeof trafficLayerRef.current.setMap === 'function') {
          trafficLayerRef.current.setMap(null)
        }
      } catch (error) {
        console.error('Error during cleanup:', error)
      }
    }
  }, [center, onLocationSelect, showControls, showTraffic, trackingMode])

  // Update markers when they change - Enhanced error handling
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return

    try {
      // Clear existing markers safely
      markersRef.current.forEach(marker => {
        if (marker && typeof marker.setMap === 'function') {
          marker.setMap(null)
        }
      })
      markersRef.current = []

      // Add new markers
      markers.forEach(markerData => {
        try {
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
        } catch (error) {
          console.error('Error creating marker:', error)
        }
      })
    } catch (error) {
      console.error('Error updating markers:', error)
    }
  }, [markers])

  // Update map center when it changes - Enhanced safety
  useEffect(() => {
    if (mapInstanceRef.current && center && center.lat && center.lng) {
      try {
        mapInstanceRef.current.setCenter(center)
        if (trackingMode) {
          mapInstanceRef.current.setZoom(16)
        }
      } catch (error) {
        console.error('Error updating map center:', error)
      }
    }
  }, [center, trackingMode])

  // Method to calculate and display route - Enhanced error handling
  const showRoute = useCallback((origin: google.maps.LatLng | google.maps.LatLngLiteral, 
                                destination: google.maps.LatLng | google.maps.LatLngLiteral,
                                travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING) => {
    if (!directionsServiceRef.current || !directionsRendererRef.current || !window.google?.maps) return

    try {
      directionsServiceRef.current.route({
        origin,
        destination,
        travelMode,
        avoidHighways: false,
        avoidTolls: false,
        optimizeWaypoints: true
      }, (result, status) => {
        if (status === 'OK' && result) {
          try {
            directionsRendererRef.current?.setDirections(result)
            
            // Fit map to route bounds
            if (mapInstanceRef.current && result.routes[0]) {
              mapInstanceRef.current.fitBounds(result.routes[0].bounds)
            }
          } catch (error) {
            console.error('Error setting directions:', error)
            toast.error('Unable to display route')
          }
        } else {
          console.error('Directions request failed:', status)
          toast.error('Unable to calculate route')
        }
      })
    } catch (error) {
      console.error('Error in showRoute:', error)
      toast.error('Route calculation failed')
    }
  }, [])

  return <div ref={mapRef} className={className} style={{ minHeight: '200px', width: '100%' }} />
})

GoogleMapView.displayName = 'GoogleMapView'

// Places Autocomplete component - Enhanced Error Handling
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

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'gb' }, // Restrict to UK
        fields: ['place_id', 'formatted_address', 'geometry', 'name'],
        types: ['establishment', 'geocode'] // Include both places and addresses
      })

      autocompleteRef.current = autocomplete

      autocomplete.addListener('place_changed', () => {
        try {
          const place = autocomplete.getPlace()
          if (place.formatted_address) {
            onChange(place.formatted_address)
            if (onPlaceSelect) {
              onPlaceSelect(place)
            }
          }
        } catch (error) {
          console.error('Error in place selection:', error)
        }
      })
    } catch (error) {
      console.error('Error initializing autocomplete:', error)
    }

    return () => {
      try {
        if (autocompleteRef.current && window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
        }
      } catch (error) {
        console.error('Error cleaning up autocomplete:', error)
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

// Enhanced notification system with sound alerts
const useDriverNotifications = (trip: any, driver: any) => {
  const [notifications, setNotifications] = useKV(`driver-notifications-${trip?.id}`, [] as any[])
  const [soundEnabled, setSoundEnabled] = useKV('notification-sound-enabled', true)
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Create notification sound
  useEffect(() => {
    if (soundEnabled) {
      // Create a simple notification sound using Web Audio API
      const createNotificationSound = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // High frequency
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1) // Lower frequency
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2) // High again
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      }

      // Store the sound function for later use
      audioRef.current = { play: createNotificationSound } as any
    }
  }, [soundEnabled])

  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // Driver arrival notification sound - pleasant chime
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15) // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3) // G5
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      } catch (error) {
        console.log('Audio notification not available')
      }
    }
  }, [soundEnabled])

  const sendNotification = useCallback((type: string, message: string, urgent: boolean = false) => {
    const now = Date.now()
    // Prevent spam notifications (minimum 10 seconds between notifications)
    if (now - lastNotificationTime < 10000 && !urgent) return

    const notification = {
      id: now,
      type,
      message,
      timestamp: new Date(),
      urgent,
      read: false
    }

    setNotifications(prev => [notification, ...(prev || []).slice(0, 9)]) // Keep last 10 notifications
    setLastNotificationTime(now)

    // Show toast notification
    if (urgent) {
      toast.success(message, {
        duration: 6000,
        className: 'font-semibold',
        description: type === 'arrival' ? 'Your driver has arrived!' : undefined
      })
    } else {
      toast.info(message, { duration: 4000 })
    }

    // Play sound for important notifications
    if (urgent || type === 'arrival' || type === 'eta_update') {
      playNotificationSound()
    }

    // Vibrate device if available (mobile)
    if (navigator.vibrate && urgent) {
      navigator.vibrate([200, 100, 200]) // Vibration pattern for arrival
    }
  }, [lastNotificationTime, setNotifications, playNotificationSound])

  return {
    notifications,
    soundEnabled,
    setSoundEnabled,
    sendNotification,
    playNotificationSound
  }
}

// Driver arrival simulation with real-time notifications
const useDriverArrivalTracking = (trip: any, driver: any, onNotification: (type: string, message: string, urgent?: boolean) => void) => {
  const [estimatedArrival, setEstimatedArrival] = useState(driver?.eta || 5)
  const [driverStatus, setDriverStatus] = useState<'en_route' | 'nearby' | 'arrived' | 'waiting'>('en_route')
  const [lastStatusUpdate, setLastStatusUpdate] = useState(new Date())
  const [arrivalNotificationSent, setArrivalNotificationSent] = useState(false)

  useEffect(() => {
    if (!trip || !driver) return

    let currentEta = driver.eta || 5
    let hasNotifiedNearby = false
    let hasNotifiedArrival = false

    const updateInterval = setInterval(() => {
      // Simulate realistic driver progress
      const timeElapsed = Math.random() * 0.5 + 0.3 // 0.3-0.8 minutes per update
      currentEta = Math.max(0, currentEta - timeElapsed)

      setEstimatedArrival(Math.ceil(currentEta))
      setLastStatusUpdate(new Date())

      // Send notifications based on ETA milestones
      if (currentEta <= 2 && !hasNotifiedNearby) {
        setDriverStatus('nearby')
        hasNotifiedNearby = true
        onNotification('nearby', `🚗 ${driver.name} is 2 minutes away`, true)
      }

      if (currentEta <= 0.5 && !hasNotifiedArrival) {
        setDriverStatus('arrived')
        hasNotifiedArrival = true
        setArrivalNotificationSent(true)
        onNotification('arrival', `✅ ${driver.name} has arrived at your pickup location!`, true)
      }

      // Random traffic/status updates
      if (Math.random() > 0.95 && currentEta > 2) {
        const updates = [
          `📍 ${driver.name} is navigating through traffic`,
          `🛣️ Driver is taking the fastest route`,
          `⏱️ ETA updated: ${Math.ceil(currentEta)} minutes`,
          `🚦 Driver stopped at traffic light`,
          `🧭 ${driver.name} is following GPS directions`
        ]
        const randomUpdate = updates[Math.floor(Math.random() * updates.length)]
        onNotification('eta_update', randomUpdate, false)
      }

      // Stop tracking when arrived
      if (currentEta <= 0) {
        setDriverStatus('waiting')
        clearInterval(updateInterval)
      }
    }, 30000) // Update every 30 seconds for realistic tracking

    // Initial status notification
    onNotification('tracking_started', `📡 Tracking ${driver.name} - ETA: ${driver.eta} minutes`, false)

    return () => clearInterval(updateInterval)
  }, [trip, driver, onNotification])

  return {
    estimatedArrival,
    driverStatus,
    lastStatusUpdate,
    arrivalNotificationSent
  }
}

// Enhanced Real-time chat system for driver-passenger communication
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
  const [isOnline, setIsOnline] = useState(true)
  const [messageStatus, setMessageStatus] = useState<'sending' | 'sent' | 'delivered' | 'read'>('sent')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Enhanced quick message templates with categories
  const quickMessages = {
    common: [
      "I'm here! 👋",
      "Running 2-3 minutes late",
      "On my way",
      "Thank you!",
      "Have a great day!"
    ],
    location: [
      "Where exactly should I meet you?",
      "I'm by the main entrance",
      "Can you see me?",
      "I'm in the [vehicle description]",
      "Please come to [specific location]"
    ],
    traffic: [
      "Traffic is heavy, might be delayed",
      "Taking alternate route",
      "Road closure ahead",
      "ETA updated due to traffic",
      "Clear roads ahead"
    ],
    assistance: [
      "Need help with luggage?",
      "Please buckle up",
      "Comfortable temperature?",
      "Any preferred route?",
      "Playing your preferred music"
    ]
  }

  // Smart message suggestions based on trip context
  const getSmartSuggestions = () => {
    const tripProgress = Math.random() // Simulate trip progress
    const timeOfDay = new Date().getHours()
    
    if (tripProgress < 0.2) {
      // Trip just started
      return [
        "Thanks for the pickup!",
        "The temperature is perfect",
        "Please take the fastest route",
        "I'm not in a rush"
      ]
    } else if (tripProgress < 0.8) {
      // Mid-trip
      return [
        "How much longer?",
        "This route looks good",
        "Thanks for the smooth ride",
        "Could we stop briefly?"
      ]
    } else {
      // Near destination
      return [
        "Perfect, thank you!",
        "You can drop me here",
        "Thanks for the great service",
        "Have a wonderful day!"
      ]
    }
  }

  // Auto-suggestions based on driver messages
  const getContextualReplies = (lastDriverMessage: string) => {
    const message = lastDriverMessage.toLowerCase()
    
    if (message.includes('here') || message.includes('arrived')) {
      return ["Coming out now!", "Be right there", "Can you see me?"]
    } else if (message.includes('traffic') || message.includes('delay')) {
      return ["No problem!", "Thanks for letting me know", "Take your time"]
    } else if (message.includes('route') || message.includes('way')) {
      return ["Sounds good", "Whatever works best", "I trust your judgment"]
    } else if (message.includes('temperature') || message.includes('music')) {
      return ["Perfect, thanks!", "That's great", "Much appreciated"]
    }
    
    return ["👍", "Thank you", "Sounds good"]
  }

  const [selectedQuickCategory, setSelectedQuickCategory] = useState<keyof typeof quickMessages>('common')
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredMessages, setFilteredMessages] = useState<any[]>([])

  // Enhanced emoji reactions
  const quickReactions = ['👍', '👌', '🙏', '😊', '🚗', '⏰', '📍', '✅']

  // Message search functionality
  useEffect(() => {
    if (searchQuery && messages) {
      const filtered = messages.filter(msg => 
        msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredMessages(filtered)
    } else {
      setFilteredMessages([])
    }
  }, [searchQuery, messages])

  // Clear search when chat opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setIsSearchOpen(false)
    }
  }, [isOpen])

  // Update smart suggestions when messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastDriverMessage = messages
        .filter(msg => msg.sender === 'driver')
        .slice(-1)[0]
      
      if (lastDriverMessage) {
        setSmartSuggestions(getContextualReplies(lastDriverMessage.text))
      } else {
        setSmartSuggestions(getSmartSuggestions())
      }
    } else {
      setSmartSuggestions(getSmartSuggestions())
    }
  }, [messages])

  // Enhanced message delivery simulation
  useEffect(() => {
    if (!isOpen || !driver?.name) return

    // Add welcome message with enhanced detail
    if (!messages || messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: `Hello! I'm ${driver.name}, your protection officer for today. I'm en route to your pickup location with an ETA of ${driver.eta} minutes. Please let me know if you have any specific requirements or if there are any changes to your pickup location.`,
        sender: 'driver',
        timestamp: new Date(),
        type: 'welcome',
        status: 'delivered',
        reactions: []
      }
      setMessages([welcomeMessage])
    }

    // Simulate realistic driver responses with better timing
    const responseInterval = setInterval(() => {
      if (Math.random() > 0.97 && messages && messages.length > 0) { // 3% chance every 15 seconds
        const contextualResponses = [
          "Just passed [landmark], should be there in 3 minutes",
          "Navigating through some traffic, but still on schedule",
          "Perfect timing, just pulled up to your location",
          "Thanks for your patience during this busy period",
          "Hope you're having a great day!",
          "GPS is showing clear roads ahead",
          "I can see the pickup point, looking for you now"
        ]
        
        const response = {
          id: Date.now(),
          text: contextualResponses[Math.floor(Math.random() * contextualResponses.length)],
          sender: 'driver',
          timestamp: new Date(),
          type: 'text',
          status: 'delivered',
          reactions: []
        }
        
        setMessages(prev => [...(prev || []), response])
      }
    }, 15000) // Every 15 seconds

    // Enhanced typing indicator with realistic patterns
    const typingInterval = setInterval(() => {
      if (Math.random() > 0.92) { // 8% chance every 20 seconds
        setDriverTyping(true)
        setTimeout(() => setDriverTyping(false), Math.random() * 3000 + 1000) // 1-4 seconds
      }
    }, 20000)

    return () => {
      clearInterval(responseInterval)
      clearInterval(typingInterval)
    }
  }, [isOpen, messages?.length, driver?.name, driver?.eta, setMessages])

  // Connection status simulation
  useEffect(() => {
    const connectionInterval = setInterval(() => {
      // Simulate occasional connection issues (5% chance)
      if (Math.random() > 0.95) {
        setIsOnline(false)
        setTimeout(() => setIsOnline(true), Math.random() * 3000 + 1000)
      }
    }, 30000)

    return () => clearInterval(connectionInterval)
  }, [])

  // Auto-scroll with smooth behavior
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }
  }, [messages, driverTyping])

  // Enhanced message sending with delivery status
  const sendMessage = async (text?: string, type: string = 'text') => {
    const messageText = text || newMessage.trim()
    if (!messageText) return

    const tempId = Date.now()
    const message = {
      id: tempId,
      text: messageText,
      sender: 'passenger',
      timestamp: new Date(),
      type,
      status: 'sending',
      reactions: []
    }

    setMessages(prev => [...(prev || []), message])
    setNewMessage('')
    
    // Simulate delivery status updates
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'sent' } : msg
      ))
    }, 500)

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'delivered' } : msg
      ))
    }, 1500)

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'read' } : msg
      ))
    }, 3000)
    
    // Show typing indicator briefly
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 800)
    
    toast.success("💬 Message sent to driver")
  }

  // Add emoji reaction to message
  const addReaction = (messageId: number, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find((r: any) => r.emoji === emoji)
        if (existingReaction) {
          // Remove reaction if it exists
          return {
            ...msg,
            reactions: msg.reactions.filter((r: any) => r.emoji !== emoji)
          }
        } else {
          // Add new reaction
          return {
            ...msg,
            reactions: [
              ...(msg.reactions || []),
              { emoji, sender: 'passenger', timestamp: new Date() }
            ]
          }
        }
      }
      return msg
    }))
  }

  // Handle file attachment (placeholder for future implementation)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // For now, just show a preview (in real app, would upload to server)
    const reader = new FileReader()
    reader.onload = (e) => {
      setAttachmentPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Voice note placeholder (for future implementation)
  const sendVoiceNote = () => {
    toast.info("🎤 Voice messages coming soon!")
  }

  // Share location placeholder
  const shareLocation = () => {
    sendMessage("📍 Shared my current location", 'location')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full max-w-md mx-auto bg-background rounded-t-3xl border-t border-border max-h-[90vh] flex flex-col">
        {/* Enhanced Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-card to-card/95 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={driver.photo} 
                alt={driver.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-background shadow-sm"
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base">{driver.name}</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-muted-foreground">
                  {isOnline ? (driverTyping ? 'Typing...' : 'Online') : 'Reconnecting...'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{driver.vehicle} • {driver.license}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-10 h-10 rounded-full hover:bg-muted"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <MagnifyingGlass size={18} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-10 h-10 rounded-full hover:bg-primary hover:text-primary-foreground"
              onClick={() => {
                toast.success("📞 Calling driver...")
              }}
            >
              <Phone size={18} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="w-10 h-10 rounded-full hover:bg-destructive hover:text-destructive-foreground"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="p-3 border-b border-border bg-muted/30">
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="pl-10 h-9 bg-background"
              />
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={12} />
                </Button>
              )}
            </div>
            {filteredMessages.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Enhanced Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-96">
          {!isOnline && (
            <div className="text-center py-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-yellow-700">
                  <Warning size={16} />
                  <span className="text-sm font-medium">Connection lost</span>
                </div>
                <p className="text-xs text-yellow-600 mt-1">Reconnecting to secure chat...</p>
              </div>
            </div>
          )}
          
          {/* Display filtered messages if searching, otherwise show all */}
          {(searchQuery ? filteredMessages : messages) && (searchQuery ? filteredMessages : messages).length > 0 ? (searchQuery ? filteredMessages : messages).map((message) => {
            const shouldHighlight = searchQuery && message.text.toLowerCase().includes(searchQuery.toLowerCase())
            
            return (
              <div
                key={message.id}
                className={`flex ${message.sender === 'passenger' ? 'justify-end' : 'justify-start'} ${
                  shouldHighlight ? 'bg-yellow-50 p-2 rounded-lg border border-yellow-200' : ''
                }`}
              >
                <div className="flex items-end gap-2 max-w-[85%]">
                  {message.sender === 'driver' && (
                    <img 
                      src={driver.photo} 
                      alt={driver.name}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-border"
                    />
                  )}
                  <div className="space-y-1">
                    <div className="relative group">
                      <div
                        className={`px-4 py-3 rounded-2xl relative ${
                          message.sender === 'passenger'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : message.type === 'welcome'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200 rounded-bl-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">
                          {shouldHighlight ? (
                            <>
                              {message.text.split(new RegExp(`(${searchQuery})`, 'gi')).map((part: string, index: number) =>
                                part.toLowerCase() === searchQuery.toLowerCase() ? (
                                  <span key={index} className="bg-yellow-300 px-1 rounded font-semibold">
                                    {part}
                                  </span>
                                ) : (
                                  part
                                )
                              )}
                            </>
                          ) : (
                            message.text
                          )}
                        </p>
                        
                        {/* Message status indicators for passenger messages */}
                        {message.sender === 'passenger' && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 flex items-center justify-center">
                            {message.status === 'sending' && (
                              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            )}
                            {message.status === 'sent' && (
                              <CheckCircle size={12} className="text-blue-400" />
                            )}
                            {message.status === 'delivered' && (
                              <div className="flex gap-0.5">
                                <CheckCircle size={10} className="text-green-400" />
                                <CheckCircle size={10} className="text-green-400" />
                              </div>
                            )}
                            {message.status === 'read' && (
                              <div className="flex gap-0.5">
                                <CheckCircle size={10} className="text-green-600" weight="fill" />
                                <CheckCircle size={10} className="text-green-600" weight="fill" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Quick reaction buttons on hover */}
                      {!searchQuery && (
                        <div className="absolute -bottom-6 left-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {quickReactions.slice(0, 4).map((emoji) => (
                            <Button
                              key={emoji}
                              variant="ghost"
                              size="sm"
                              className="w-6 h-6 p-0 bg-background/90 hover:bg-primary hover:text-primary-foreground rounded-full text-xs border border-border/50"
                              onClick={() => addReaction(message.id, emoji)}
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Message reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {message.reactions.map((reaction: any, idx: number) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-muted/70 rounded-full text-xs cursor-pointer hover:bg-muted"
                            onClick={() => addReaction(message.id, reaction.emoji)}
                          >
                            {reaction.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Timestamp and status */}
                    <div className={`flex items-center gap-2 mt-1 ${
                      message.sender === 'passenger' ? 'justify-end' : 'justify-start'
                    }`}>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          }) : (
            <div className="text-center text-muted-foreground py-8">
              <ChatCircle size={48} className="mx-auto mb-4 opacity-50" />
              {searchQuery ? (
                <>
                  <p className="text-sm">No messages found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </>
              ) : (
                <>
                  <p className="text-sm">Start a conversation with your driver</p>
                  <p className="text-xs mt-1">Messages are secure and private</p>
                </>
              )}
            </div>
          )}
          
          {/* Enhanced Driver typing indicator */}
          {driverTyping && !searchQuery && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <img 
                  src={driver.photo} 
                  alt={driver.name}
                  className="w-7 h-7 rounded-full object-cover border border-border"
                />
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Quick Messages with Categories and Smart Suggestions */}
        <div className="border-t border-border bg-muted/30 p-3">
          {/* Smart suggestions based on context */}
          {smartSuggestions.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Smart replies
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {smartSuggestions.slice(0, 3).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="default"
                    size="sm"
                    className="whitespace-nowrap h-8 text-xs bg-primary/90 hover:bg-primary text-primary-foreground transition-colors flex-shrink-0 rounded-full"
                    onClick={() => sendMessage(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Category tabs */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {Object.keys(quickMessages).map((category) => (
              <Button
                key={category}
                variant={selectedQuickCategory === category ? "default" : "outline"}
                size="sm"
                className="capitalize text-xs h-7 px-3 whitespace-nowrap"
                onClick={() => setSelectedQuickCategory(category as keyof typeof quickMessages)}
              >
                {category}
              </Button>
            ))}
          </div>
          
          {/* Quick message buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickMessages[selectedQuickCategory].slice(0, 3).map((msg, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap h-8 text-xs bg-background hover:bg-primary hover:text-primary-foreground transition-colors flex-shrink-0"
                onClick={() => sendMessage(msg)}
              >
                {msg}
              </Button>
            ))}
          </div>
        </div>

        {/* Enhanced Message Input */}
        <div className="p-4 border-t border-border bg-gradient-to-r from-card to-card/95 rounded-b-3xl">
          {/* Attachment preview */}
          {attachmentPreview && (
            <div className="mb-3 p-2 bg-muted/50 rounded-lg flex items-center justify-between">
              <span className="text-xs text-muted-foreground">📎 Image ready to send</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setAttachmentPreview(null)}
              >
                <X size={12} />
              </Button>
            </div>
          )}
          
          <div className="flex items-end gap-2">
            {/* Additional action buttons */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus size={16} className="text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
                onClick={shareLocation}
              >
                <MapPin size={16} className="text-muted-foreground" />
              </Button>
            </div>
            
            {/* Message input */}
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isOnline ? "Type a message..." : "Reconnecting..."}
                disabled={!isOnline}
                className="pr-20 rounded-full border-2 focus:border-primary transition-colors min-h-[44px] resize-none"
                maxLength={500}
              />
              
              {/* Emoji and voice buttons */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <SmileyWink size={16} className="text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full"
                  onClick={sendVoiceNote}
                >
                  <Bell size={16} className="text-muted-foreground" />
                </Button>
              </div>
            </div>
            
            {/* Send button */}
            <Button
              onClick={() => sendMessage()}
              disabled={!newMessage.trim() || !isOnline}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all flex-shrink-0"
            >
              <PaperPlaneTilt size={20} className="text-primary-foreground" weight="fill" />
            </Button>
          </div>
          
          {/* Character count and connection status */}
          <div className="flex justify-between items-center mt-2">
            {newMessage.length > 400 && (
              <p className="text-xs text-muted-foreground">
                {newMessage.length}/500
              </p>
            )}
            {!isOnline && (
              <p className="text-xs text-yellow-600 flex items-center gap-1">
                <Warning size={12} />
                Reconnecting...
              </p>
            )}
          </div>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  )
}

// Real-time Live Tracking component for active trips with enhanced notifications
const LiveTrackingMap = ({ trip, driver, onArrival }: {
  trip: any,
  driver: any,
  onArrival?: () => void
}) => {
  const [driverLocation, setDriverLocation] = useState(driver.location || premiumLondonLocations[0])
  const [estimatedArrival, setEstimatedArrival] = useState(driver.eta || 5)
  const [routeInfo, setRouteInfo] = useState<any>(null)
  const [isTrackingActive, setIsTrackingActive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Enhanced notification system
  const { notifications, soundEnabled, setSoundEnabled, sendNotification } = useDriverNotifications(trip, driver)
  
  // Driver arrival tracking with notifications
  const { 
    estimatedArrival: trackedETA, 
    driverStatus, 
    lastStatusUpdate,
    arrivalNotificationSent 
  } = useDriverArrivalTracking(trip, driver, sendNotification)

  // Update ETA from tracking system
  useEffect(() => {
    setEstimatedArrival(trackedETA)
  }, [trackedETA])

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
          if (onArrival && !arrivalNotificationSent) {
            setTimeout(onArrival, 1000)
          }
        }

        setLastUpdate(new Date())
        return { lat: newLat, lng: newLng }
      })
    }, 2000) // Update every 2 seconds for smooth movement

    return () => clearInterval(updateInterval)
  }, [isTrackingActive, trip.status, trip.pickupCoords, trip.destinationCoords, onArrival, arrivalNotificationSent])

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
          <circle cx="16" cy="16" r="12" fill="${driverStatus === 'arrived' ? '#10B981' : '#3B82F6'}" stroke="white" stroke-width="3"/>
          <path d="M8 16l4 4 8-8" stroke="white" stroke-width="2" fill="none"/>
        </svg>
      `),
      animation: driverStatus === 'arrived' ? window.google?.maps?.Animation?.BOUNCE : undefined,
      infoWindow: `
        <div style="padding: 8px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${driver.name}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">
            ${driver.vehicle}<br/>
            License: ${driver.license}<br/>
            Status: ${driverStatus === 'arrived' ? 'Arrived!' : `ETA: ${estimatedArrival} min`}
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
      {/* Enhanced Live Status Banner with Driver Status */}
      <Card className={`border-0 shadow-sm ${
        driverStatus === 'arrived' 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
          : driverStatus === 'nearby'
          ? 'bg-gradient-to-r from-yellow-50 to-orange-50'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                driverStatus === 'arrived' ? 'bg-green-500' :
                driverStatus === 'nearby' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}></div>
              <div>
                <h3 className={`font-semibold ${
                  driverStatus === 'arrived' ? 'text-green-700' :
                  driverStatus === 'nearby' ? 'text-yellow-700' : 'text-blue-700'
                }`}>
                  {driverStatus === 'arrived' ? '✅ Driver Arrived!' :
                   driverStatus === 'nearby' ? '🚗 Driver Almost Here' : '📡 Live Tracking Active'}
                </h3>
                <p className={`text-sm ${
                  driverStatus === 'arrived' ? 'text-green-600' :
                  driverStatus === 'nearby' ? 'text-yellow-600' : 'text-blue-600'
                }`}>
                  {driverStatus === 'arrived' ? 'Your driver is at the pickup location' :
                   driverStatus === 'nearby' ? `${driver.name} is ${estimatedArrival} minutes away` :
                   `Driver is ${estimatedArrival} minutes away`}
                </p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <SpeakerHigh size={12} /> : <SpeakerHigh size={12} className="opacity-50" />}
              </Button>
              <p className={`text-xs ${
                driverStatus === 'arrived' ? 'text-green-600' :
                driverStatus === 'nearby' ? 'text-yellow-600' : 'text-blue-600'
              }`}>
                Last update
              </p>
              <p className={`text-xs font-mono ${
                driverStatus === 'arrived' ? 'text-green-700' :
                driverStatus === 'nearby' ? 'text-yellow-700' : 'text-blue-700'
              }`}>
                {lastStatusUpdate.toLocaleTimeString('en-GB', { 
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
              <div className={`w-2 h-2 rounded-full animate-pulse mr-2 ${
                driverStatus === 'arrived' ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              {driverStatus === 'arrived' ? 'Driver Arrived' : 'Real-time GPS'}
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

          {/* Driver info overlay with status */}
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={driver.photo} 
                      alt={driver.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-background"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                      driverStatus === 'arrived' ? 'bg-green-500' :
                      driverStatus === 'nearby' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{driver.name}</h4>
                    <p className="text-xs text-muted-foreground">{driver.vehicle} • {driver.license}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      driverStatus === 'arrived' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {driverStatus === 'arrived' ? 'Here!' : `${estimatedArrival} min`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {driverStatus === 'arrived' ? 'Pickup' : 'ETA'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications Panel */}
      {notifications && notifications.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <BellRinging size={16} />
                Live Updates
              </h4>
              <Badge variant="outline" className="text-xs">
                {notifications.filter(n => !n.read).length} new
              </Badge>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    notification.urgent ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.timestamp).toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            toast.info('Traffic layer toggle coming soon')
          }}
        >
          Traffic
        </Button>
      </div>
    </div>
  )
}

function App() {
  // Debug function to reset app state
  const resetToWelcome = () => {
    // Clear all stored data
    localStorage.removeItem('armora-onboarding-complete')
    localStorage.removeItem('armora-first-launch')
    window.location.reload()
  }

  // Enhanced state management with welcome screen and onboarding
  const [currentView, setCurrentView] = useState<string>('welcome')
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useKV("armora-onboarding-complete", false)
  const [isFirstLaunch, setIsFirstLaunch] = useKV("armora-first-launch", true)
  const [onboardingStep, setOnboardingStep] = useKV("armora-onboarding-step", 0)
  const [onboardingData, setOnboardingData] = useKV("armora-onboarding-data", {
    workType: [],
    workTypeCustom: '',
    travelFrequency: '',
    travelFrequencyCustom: '',
    serviceStyle: '',
    serviceStyleCustom: '',
    securityComfort: '',
    securityComfortCustom: '',
    locations: [],
    locationsCustom: '',
    riskConcerns: [],
    riskConcernsCustom: '',
    emergencyContact1: { name: '', relationship: '', phone: '' },
    emergencyContact2: { name: '', relationship: '', phone: '' },
    emergencyResponse: '',
    emergencyInstructions: ''
  })
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
  const [notificationSettings, setNotificationSettings] = useKV("notification-settings", {
    soundEnabled: true,
    vibrationEnabled: true,
    arrivalAlerts: true
  })
  
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

  // Initialize app flow based on user state - Check for saved progress
  useEffect(() => {
    // Check if user has saved progress in onboarding
    if (onboardingStep > 0 && !hasCompletedOnboarding) {
      // Resume from saved step
      setCurrentView('onboarding')
    } else if (hasCompletedOnboarding) {
      // Go directly to home
      setCurrentView('home')
    } else {
      // Start from welcome
      setCurrentView('welcome')
    }
  }, [])

  // Apply no-scroll only to welcome and onboarding pages
  useEffect(() => {
    const body = document.body
    const root = document.getElementById('root')
    
    if (currentView === 'welcome' || currentView === 'onboarding') {
      // Prevent scrolling on welcome and onboarding pages
      body.classList.add('no-scroll')
      if (root) root.classList.add('no-scroll-container')
    } else {
      // Allow scrolling on all other pages
      body.classList.remove('no-scroll')
      if (root) root.classList.remove('no-scroll-container')
    }
    
    // Cleanup on unmount
    return () => {
      body.classList.remove('no-scroll')
      if (root) root.classList.remove('no-scroll-container')
    }
  }, [currentView])

  // Update map center when user location is found - with proper dependency management
  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation)
    }
  }, [userLocation])

  // Separate effect for setting pickup location to avoid infinite loops and excessive notifications
  const [hasSetInitialPickup, setHasSetInitialPickup] = useState(false)
  
  useEffect(() => {
    if (userLocation && userAddress && !hasSetInitialPickup) {
      setBookingForm(prev => ({ 
        ...prev, 
        pickup: userAddress,
        pickupCoords: userLocation 
      }))
      setHasSetInitialPickup(true)
      // Only show location success once, no repeated notifications
      setStatusMessage('')
    }
  }, [userLocation, userAddress, hasSetInitialPickup])

  // Initialize location and start watching when app loads
  useEffect(() => {
    let isMounted = true
    
    const initLocation = () => {
      if (isMounted && getCurrentLocation && startWatchingLocation) {
        // Get current location once
        getCurrentLocation()
        
        // Start continuous tracking
        startWatchingLocation()
        setIsLocationWatching(true)
        
        // No intrusive status messages - GPS indicator shows status
      }
    }
    
    initLocation()
    
    return () => {
      isMounted = false
      if (stopWatchingLocation) {
        stopWatchingLocation()
      }
      setIsLocationWatching(false)
    }
  }, [getCurrentLocation, startWatchingLocation, stopWatchingLocation])

  // Function to show passenger-relevant status messages (with auto-hide)
  const showPassengerStatus = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setStatusMessage(message)
    setStatusType(type)
    // Auto-hide status after 3 seconds for less intrusive experience
    setTimeout(() => setStatusMessage(''), 3000)
  }, [])

  // Example passenger status updates that would be appropriate:
  // - "🚗 Driver is 3 minutes away"
  // - "📍 Ready to book - pickup and destination set"
  // - "⚠️ High demand in your area - longer wait times expected"
  // - "✅ Payment method confirmed"
  // - "🎯 Favorite location saved successfully"

  // Distance calculation helper
  const calculateDistance = useCallback((point1: any, point2: any) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLng = (point2.lng - point1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c * 100) / 100 // Round to 2 decimal places
  }, [])

  // Dynamic pricing calculation based on route distance and service level
  const calculateServicePrice = useCallback((service: any, distance: number = 0) => {
    if (!distance || distance === 0) {
      return service.priceRange // Return original range if no distance
    }

    // Base pricing structure for each service type
    const pricingStructure = {
      'essential': { base: 18.00, perKm: 2.15, securityFee: 2.00 },
      'shadow-escort': { base: 85.00, perKm: 18.50, securityFee: 45.00 },
      'executive-security': { base: 95.00, perKm: 15.80, securityFee: 35.00 },
      'signature-experience': { base: 150.00, perKm: 22.50, securityFee: 28.00 },
      'airport-express': { base: 45.00, perKm: 8.75, securityFee: 12.00 },
      'corporate': { base: 28.00, perKm: 6.20, securityFee: 8.00 }
    }

    const pricing = pricingStructure[service.id as keyof typeof pricingStructure]
    if (!pricing) return service.priceRange

    // Calculate total price
    const baseFare = pricing.base
    const distanceFare = distance * pricing.perKm
    const securityFee = pricing.securityFee
    const total = baseFare + distanceFare + securityFee

    return `£${total.toFixed(2)}`
  }, [])

  const handleBookRide = useCallback(() => {
    if (!bookingForm.pickup || !bookingForm.destination || !selectedService) {
      toast.error("🚗 Please set pickup location, destination, and choose your ride type")
      return
    }
    
    if (!bookingForm.pickupCoords || !bookingForm.destinationCoords) {
      toast.error("📍 Please select valid locations from the suggestions")
      return
    }
    
    const service = armoraServices.find(s => s.id === selectedService)
    const distance = calculateDistance(bookingForm.pickupCoords, bookingForm.destinationCoords)
    const estimatedDuration = Math.ceil(distance * 2) // Rough estimation: 2 minutes per km in city traffic
    const finalPrice = calculateServicePrice(service, distance)
    
    // Create trip object for confirmation
    const tripData = {
      id: Date.now(),
      service: service,
      pickup: bookingForm.pickup,
      destination: bookingForm.destination,
      pickupCoords: bookingForm.pickupCoords,
      destinationCoords: bookingForm.destinationCoords,
      estimatedPrice: finalPrice,
      estimatedDistance: distance,
      estimatedDuration: estimatedDuration,
      realTimeData: {
        lastUpdate: new Date(),
        trafficCondition: 'moderate',
        weatherCondition: 'clear'
      }
    }
    
    // Store trip data and go to confirmation
    setCurrentTrip(tripData)
    setCurrentView('booking-confirmation')
    
  }, [bookingForm, selectedService, calculateDistance, calculateServicePrice])

  const confirmBooking = useCallback(() => {
    if (!currentTrip) return
    
    // Assign driver and complete booking
    const driver = armoraDrivers[Math.floor(Math.random() * armoraDrivers.length)]
    
    const finalTrip = {
      ...currentTrip,
      driver: driver,
      status: 'driver_assigned',
      startTime: new Date()
    }
    
    setCurrentTrip(finalTrip)
    setAssignedDriver(driver)
    setCurrentView('tracking')
    setIsChatOpen(false)
    setUnreadMessages(0)
    
    // Add to recent trips
    setRecentTrips((prev: any[]) => [finalTrip, ...prev.slice(0, 9)])
    
    // Show success notification
    toast.success(`🚗 Your security transport professional assigned: ${driver.name}`, {
      duration: 4000,
      description: `${driver.vehicle} • ETA: ${driver.eta} minutes`
    })
    
    // Clear form for next booking
    setBookingForm({ pickup: '', destination: '', pickupCoords: null, destinationCoords: null })
    setHasSetInitialPickup(false)
  }, [currentTrip, setRecentTrips])

  // Calculate route distance for pricing
  const routeDistance = useMemo(() => {
    if (bookingForm.pickupCoords && bookingForm.destinationCoords) {
      return calculateDistance(bookingForm.pickupCoords, bookingForm.destinationCoords)
    }
    return 0
  }, [bookingForm.pickupCoords, bookingForm.destinationCoords, calculateDistance])

  const addToFavorites = useCallback((location: string, name: string) => {
    const newFavorite = { name, address: location, id: Date.now() }
    setFavorites((prev: any[]) => [...prev, newFavorite])
    // Don't show duplicate toast here since it's handled at the button level
  }, [setFavorites])

  // Modern Welcome Screen with Enhanced Design - Compact Version
  if (currentView === 'welcome') {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <Toaster position="top-center" />
        
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-amber-400/15 to-amber-600/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="max-w-sm mx-auto text-center space-y-6 animate-in fade-in duration-1000 relative z-10">
          {/* Compact Logo and Branding */}
          <div className="space-y-5">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl relative">
                <Shield size={36} className="text-slate-900" weight="fill" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 rounded-full" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 to-amber-600/20 rounded-full blur-xl animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 bg-clip-text">
                Armora
              </h1>
              <p className="text-lg text-amber-100/90 font-medium tracking-wide">
                Personalizing your security service
              </p>
              <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
                Your protection, perfectly tailored
              </p>
            </div>
          </div>

          {/* Compact Feature Highlights */}
          <div className="space-y-3">
            <div className="grid gap-2.5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-amber-400/20 shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400/30 to-amber-600/30 rounded-lg flex items-center justify-center">
                  <Shield size={16} className="text-amber-300" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-white">SIA Licensed</p>
                  <p className="text-xs text-slate-300">Your security transport professionals</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-amber-400/20 shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400/30 to-amber-600/30 rounded-lg flex items-center justify-center">
                  <Car size={16} className="text-amber-300" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-white">Personal Protection</p>
                  <p className="text-xs text-slate-300">Security transport designed around your life</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-amber-400/20 shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400/30 to-amber-600/30 rounded-lg flex items-center justify-center">
                  <Star size={16} className="text-amber-300" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-white">6000+ Journeys</p>
                  <p className="text-xs text-slate-300">Personal security, professional delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Continue Button */}
          <div className="space-y-3">
            {onboardingStep > 0 && !hasCompletedOnboarding ? (
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setCurrentView('onboarding')
                  }}
                  className="w-full h-12 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-slate-900 font-bold text-lg rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Resume Profile
                </Button>
                <p className="text-xs text-green-200 text-center">
                  Continue from step {onboardingStep + 1} of 10
                </p>
              </div>
            ) : (
              <Button 
                onClick={() => {
                  setIsFirstLaunch(false)
                  setCurrentView('onboarding')
                  setOnboardingStep(0)
                }}
                className="w-full h-12 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold text-lg rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Create Profile
              </Button>
            )}
            
            <p className="text-xs text-slate-400 italic">
              "Your protection transport, perfectly tailored"
            </p>
          </div>

          {/* Compact Trust Indicators */}
          <div className="pt-4 border-t border-amber-400/20">
            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-300">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Shield size={10} className="text-amber-400" />
                <span className="font-medium">SIA Licensed</span>
              </div>
              <div className="w-px h-2.5 bg-amber-400/30"></div>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <CheckCircle size={10} className="text-amber-400" />
                <span className="font-medium">BS 7858 Screened</span>
              </div>
              <div className="w-px h-2.5 bg-amber-400/30"></div>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Star size={10} className="text-amber-400" />
                <span className="font-medium">Professional Standards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Luxury Onboarding Flow with Hybrid Questions
  if (currentView === 'onboarding') {
    const totalSteps = 10
    const currentStep = onboardingStep + 1
    const progressPercentage = (currentStep / totalSteps) * 100

    const updateOnboardingData = (field: string, value: any) => {
      setOnboardingData(prev => ({ ...prev, [field]: value }))
    }

    const toggleArrayValue = (field: string, value: string) => {
      setOnboardingData(prev => ({
        ...prev,
        [field]: prev[field].includes(value) 
          ? prev[field].filter((item: string) => item !== value)
          : [...prev[field], value]
      }))
    }

    const nextStep = () => {
      if (onboardingStep < totalSteps - 1) {
        const newStep = onboardingStep + 1
        setOnboardingStep(newStep)
        // Auto-save progress
        toast.success("💾 Progress saved", { duration: 1500 })
      } else {
        // Complete onboarding
        setHasCompletedOnboarding(true)
        setOnboardingStep(0) // Reset step counter
        setCurrentView('onboarding-complete')
      }
    }

    const prevStep = () => {
      if (onboardingStep > 0) {
        const newStep = onboardingStep - 1
        setOnboardingStep(newStep)
        // Auto-save progress
        toast.success("💾 Progress saved", { duration: 1500 })
      }
    }

    const saveAndExit = () => {
      // Save current progress and return to welcome
      toast.success("✅ Your security transport profile progress has been saved. Resume anytime!")
      setCurrentView('welcome')
    }

    const resetAssessment = () => {
      // Clear all progress
      setOnboardingStep(0)
      setOnboardingData({
        workType: [],
        workTypeCustom: '',
        travelFrequency: '',
        travelFrequencyCustom: '',
        serviceStyle: '',
        serviceStyleCustom: '',
        securityComfort: '',
        securityComfortCustom: '',
        locations: [],
        locationsCustom: '',
        riskConcerns: [],
        riskConcernsCustom: '',
        emergencyContact1: { name: '', relationship: '', phone: '' },
        emergencyContact2: { name: '', relationship: '', phone: '' },
        emergencyResponse: '',
        emergencyInstructions: ''
      })
      setCurrentView('welcome')
      toast.success("🔄 Your security transport assessment has been reset")
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <Toaster position="top-center" />
        
        {/* Luxury Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-amber-400/10 to-amber-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-to-r from-slate-400/5 to-slate-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        {/* Compact Professional Header */}
        <header className="relative z-10 p-3 border-b border-amber-400/20 bg-slate-900/80 backdrop-blur-sm">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Shield size={12} className="text-slate-900" weight="bold" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white">Professional Security Assessment</h1>
                  <p className="text-[9px] text-amber-200">Industry best practice consultation</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={saveAndExit}
                  className="text-amber-200 hover:text-white hover:bg-amber-400/20 border border-amber-400/30 h-6 px-2 text-[10px]"
                >
                  Save
                </Button>
                {onboardingStep > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={prevStep}
                    className="text-amber-200 hover:text-white hover:bg-amber-400/20 border border-amber-400/30 h-6 px-2 text-[10px]"
                  >
                    Back
                  </Button>
                )}
              </div>
            </div>
            
            {/* Compact Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-amber-200">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-10 p-3 max-w-md mx-auto">{/* Further reduced padding */}
          {/* Slide 0: Assessment Introduction */}
          {onboardingStep === 0 && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 mx-auto bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-lg flex items-center justify-center border border-amber-400/30">
                  <User size={20} className="text-amber-400" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-base font-bold text-white">Create your personal security transport profile</h2>
                  <p className="text-xs text-slate-300 leading-snug">
                    Professional consultation to match your protection transport needs with industry best practices.
                  </p>
                </div>

                <div className="grid gap-1.5 text-left">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/60 border border-amber-400/20">
                    <CheckCircle size={10} className="text-amber-400 flex-shrink-0" />
                    <span className="text-[10px] text-slate-200">Professional risk assessment and service matching</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/60 border border-amber-400/20">
                    <CheckCircle size={10} className="text-amber-400 flex-shrink-0" />
                    <span className="text-[10px] text-slate-200">Industry best practice consultation process</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/60 border border-amber-400/20">
                    <CheckCircle size={10} className="text-amber-400 flex-shrink-0" />
                    <span className="text-[10px] text-slate-200">Duty of care and professional responsibility</span>
                  </div>
                </div>

                <div className="p-2 bg-amber-400/10 rounded-lg border border-amber-400/30">
                  <p className="text-[10px] text-amber-200">
                    🛡️ <strong>Professional standard:</strong> Working to SIA industry best practices
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={nextStep}
                  className="w-full h-9 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold rounded-xl shadow-xl transition-all duration-300 text-sm"
                >
                  Start Assessment
                </Button>
                
                {onboardingStep > 0 && (
                  <div className="text-center">
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={resetAssessment}
                      className="text-slate-400 hover:text-slate-300 text-xs h-6"
                    >
                      Reset Assessment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Slide 1: Work Type Selection */}
          {onboardingStep === 1 && (
            <div className="space-y-3 animate-in fade-in duration-500">
              <div className="text-center space-y-1.5">
                <h2 className="text-base font-bold text-white">What kind of work do you do?</h2>
                <p className="text-xs text-amber-200">✓ You can pick more than one option</p>
                <p className="text-xs text-slate-300">Choose all that describe your work</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'Business Leader', desc: 'CEO, manager, executive' },
                  { value: 'Business Owner', desc: 'Own a company, startup founder' },
                  { value: 'Doctor/Medical', desc: 'Healthcare, medical professional' },
                  { value: 'Lawyer/Legal', desc: 'Attorney, legal work, court cases' },
                  { value: 'Tech/Computer', desc: 'Software, IT, technology work' },
                  { value: 'Banking/Finance', desc: 'Money, investments, financial services' },
                  { value: 'Real Estate', desc: 'Property, buying/selling homes/buildings' },
                  { value: 'Sales/Travel', desc: 'Selling, traveling for work' }
                ].map((option) => (
                  <Card 
                    key={option.value}
                    className={`cursor-pointer transition-all duration-200 h-[60px] relative ${ 
                      onboardingData.workType.includes(option.value)
                        ? 'bg-gradient-to-br from-amber-400/20 to-amber-600/20 border-amber-400 shadow-lg' 
                        : 'bg-slate-800/60 border-slate-600 hover:border-amber-400/50 hover:bg-slate-800/80'
                    }`}
                    onClick={() => toggleArrayValue('workType', option.value)}
                  >
                    {/* Professional checkbox indicator */}
                    <div className={`absolute top-1 right-1 w-4 h-4 border border-amber-400 rounded text-center text-xs leading-3 ${
                      onboardingData.workType.includes(option.value) 
                        ? 'bg-amber-400 text-slate-900' 
                        : 'bg-transparent'
                    }`}>
                      {onboardingData.workType.includes(option.value) ? '✓' : ''}
                    </div>
                    <CardContent className="p-2.5 text-center h-full flex flex-col justify-center">
                      <h3 className="font-semibold text-white text-xs leading-tight mb-0.5">{option.value}</h3>
                      <p className="text-[9px] text-slate-300 leading-tight">{option.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-amber-200">Other work you do:</label>
                <textarea
                  value={onboardingData.workTypeCustom}
                  onChange={(e) => updateOnboardingData('workTypeCustom', e.target.value)}
                  placeholder="Describe your work in simple terms..."
                  className="w-full h-12 px-3 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors resize-none text-xs"
                  maxLength={500}
                />
                <p className="text-[9px] text-slate-400">{onboardingData.workTypeCustom.length}/500 characters</p>
              </div>

              <div className="p-2 bg-amber-400/10 rounded-lg border border-amber-400/30">
                <p className="text-xs text-amber-200">
                  <strong>Example:</strong> You can pick both "Business Owner" and "Tech Work"
                </p>
              </div>

              <Button 
                onClick={nextStep}
                disabled={onboardingData.workType.length === 0 && !onboardingData.workTypeCustom.trim()}
                className="w-full h-9 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold rounded-xl shadow-xl transition-all duration-300 disabled:opacity-50 text-sm"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Slide 2: Travel Frequency */}
          {onboardingStep === 2 && (
            <div className="space-y-3 animate-in fade-in duration-500">
              <div className="text-center space-y-1.5">
                <h2 className="text-base font-bold text-white">How often do you need secure transport?</h2>
                <p className="text-xs text-slate-300">Pick the one that best matches your needs</p>
              </div>

              <div className="space-y-1.5">
                {[
                  { value: 'Just Sometimes', desc: 'Special events, rare occasions' },
                  { value: 'About Once a Week', desc: 'Regular meetings, weekly events' },
                  { value: 'Almost Every Day', desc: 'Daily commute, regular work travel' },
                  { value: 'Multiple Times Daily', desc: 'Very busy, lots of travel' }
                ].map((option) => (
                  <Card 
                    key={option.value}
                    className={`cursor-pointer transition-all duration-200 ${ 
                      onboardingData.travelFrequency === option.value
                        ? 'bg-gradient-to-r from-amber-400/20 to-amber-600/20 border-amber-400 shadow-lg' 
                        : 'bg-slate-800/60 border-slate-600 hover:border-amber-400/50 hover:bg-slate-800/80'
                    }`}
                    onClick={() => updateOnboardingData('travelFrequency', option.value)}
                  >
                    <CardContent className="p-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white text-xs">{option.value}</h3>
                          <p className="text-[10px] text-slate-300">{option.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${ 
                          onboardingData.travelFrequency === option.value 
                            ? 'bg-amber-400 border-amber-400' 
                            : 'border-slate-500'
                        }`}>
                          {onboardingData.travelFrequency === option.value && (
                            <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-amber-200">Different schedule or specific details:</label>
                <textarea
                  value={onboardingData.travelFrequencyCustom}
                  onChange={(e) => updateOnboardingData('travelFrequencyCustom', e.target.value)}
                  placeholder="Tell us about your travel schedule..."
                  className="w-full h-12 px-3 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors resize-none text-xs"
                  maxLength={300}
                />
                <p className="text-[9px] text-slate-400">{onboardingData.travelFrequencyCustom.length}/300 characters</p>
              </div>

              <Button 
                onClick={nextStep}
                disabled={!onboardingData.travelFrequency && !onboardingData.travelFrequencyCustom.trim()}
                className="w-full h-9 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold rounded-xl shadow-xl transition-all duration-300 disabled:opacity-50 text-sm"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Slide 3: Service Style Preference */}
          {onboardingStep === 3 && (
            <div className="space-y-3 animate-in fade-in duration-500">
              <div className="text-center space-y-1.5">
                <h2 className="text-base font-bold text-white">How do you want your security to look?</h2>
                <p className="text-xs text-slate-300">Pick the style that feels right for you</p>
              </div>

              <div className="grid gap-2">
                {[
                  { 
                    value: 'Quiet & Discrete', 
                    desc: 'Barely noticeable, low-key protection',
                    features: ['Unmarked cars', 'Normal clothing', 'Almost invisible']
                  },
                  { 
                    value: 'Professional & Visible', 
                    desc: 'Clearly there but business-like',
                    features: ['Professional look', 'Clear identification', 'Business appropriate']
                  },
                  { 
                    value: 'Full Premium Service', 
                    desc: 'Complete luxury with top protection',
                    features: ['Luxury cars', 'Multiple security', 'VIP treatment']
                  }
                ].map((option) => (
                  <Card 
                    key={option.value}
                    className={`cursor-pointer transition-all duration-200 ${ 
                      onboardingData.serviceStyle === option.value
                        ? 'bg-gradient-to-br from-amber-400/20 to-amber-600/20 border-amber-400 shadow-lg' 
                        : 'bg-slate-800/60 border-slate-600 hover:border-amber-400/50 hover:bg-slate-800/80'
                    }`}
                    onClick={() => updateOnboardingData('serviceStyle', option.value)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-sm">{option.value}</h3>
                          <p className="text-xs text-slate-300">{option.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${ 
                          onboardingData.serviceStyle === option.value 
                            ? 'bg-amber-400 border-amber-400' 
                            : 'border-slate-500'
                        }`}>
                          {onboardingData.serviceStyle === option.value && (
                            <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {option.features.map((feature, idx) => (
                          <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-slate-700/60 text-slate-300 rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-amber-200">Special requests or other needs:</label>
                <textarea
                  value={onboardingData.serviceStyleCustom}
                  onChange={(e) => updateOnboardingData('serviceStyleCustom', e.target.value)}
                  placeholder="Tell us what you need in simple words..."
                  className="w-full h-12 px-3 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors resize-none text-xs"
                  maxLength={500}
                />
                <p className="text-[9px] text-slate-400">{onboardingData.serviceStyleCustom.length}/500 characters</p>
              </div>

              <Button 
                onClick={nextStep}
                disabled={!onboardingData.serviceStyle && !onboardingData.serviceStyleCustom.trim()}
                className="w-full h-9 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold rounded-xl shadow-xl transition-all duration-300 disabled:opacity-50 text-sm"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Slide 4: Security Comfort Level */}
          {onboardingStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-lg font-bold text-white">How much security presence makes you feel comfortable?</h2>
                <p className="text-xs text-slate-300">Choose what feels right for you</p>
              </div>

              <div className="space-y-2">
                {[
                  { value: 'Barely There', intensity: 1, desc: 'Almost invisible, emergency only' },
                  { value: 'Quietly Present', intensity: 2, desc: 'There but not obvious' },
                  { value: 'Clearly Visible', intensity: 3, desc: 'Obviously providing security' },
                  { value: 'High Visibility', intensity: 4, desc: 'Very obvious, strong deterrent' },
                  { value: 'Maximum Protection', intensity: 5, desc: 'Full security, multiple people' }
                ].map((option) => (
                  <Card 
                    key={option.value}
                    className={`cursor-pointer transition-all duration-200 ${ 
                      onboardingData.securityComfort === option.value
                        ? 'bg-gradient-to-r from-amber-400/20 to-amber-600/20 border-amber-400 shadow-lg' 
                        : 'bg-slate-800/60 border-slate-600 hover:border-amber-400/50 hover:bg-slate-800/80'
                    }`}
                    onClick={() => updateOnboardingData('securityComfort', option.value)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white text-sm">{option.value}</h3>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${ 
                                  i < option.intensity ? 'bg-amber-400' : 'bg-slate-600'
                                }`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-300">{option.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${ 
                          onboardingData.securityComfort === option.value 
                            ? 'bg-amber-400 border-amber-400' 
                            : 'border-slate-500'
                        }`}>
                          {onboardingData.securityComfort === option.value && (
                            <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-amber-200">What makes you feel most comfortable:</label>
                <textarea
                  value={onboardingData.securityComfortCustom}
                  onChange={(e) => updateOnboardingData('securityComfortCustom', e.target.value)}
                  placeholder="Tell us what makes you feel safe and comfortable..."
                  className="w-full h-14 px-3 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors resize-none text-sm"
                  maxLength={400}
                />
                <p className="text-[10px] text-slate-400">{onboardingData.securityComfortCustom.length}/400 characters</p>
              </div>

              <Button 
                onClick={nextStep}
                disabled={!onboardingData.securityComfort && !onboardingData.securityComfortCustom.trim()}
                className="w-full h-10 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold rounded-xl shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Slide 5: Travel Patterns & Locations */}
          {onboardingStep === 5 && (
            <div className="space-y-3 animate-in fade-in duration-500">
              <div className="text-center space-y-1.5">
                <h2 className="text-base font-bold text-white">Where do you usually need secure transport?</h2>
                <p className="text-xs text-amber-200">✓ You can pick more than one place</p>
                <p className="text-xs text-slate-300">Choose all that you visit</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'City Center', desc: 'Downtown, business districts' },
                  { value: 'Airports & Travel', desc: 'Flights, train stations' },
                  { value: 'Work Events', desc: 'Meetings, conferences' },
                  { value: 'Social Events', desc: 'Parties, entertainment' },
                  { value: 'Home Areas', desc: 'Neighborhoods, home' },
                  { value: 'International', desc: 'Overseas, other countries' }
                ].map((option) => (
                  <Card 
                    key={option.value}
                    className={`cursor-pointer transition-all duration-200 h-[60px] relative ${ 
                      onboardingData.locations.includes(option.value)
                        ? 'bg-gradient-to-br from-amber-400/20 to-amber-600/20 border-amber-400 shadow-lg' 
                        : 'bg-slate-800/60 border-slate-600 hover:border-amber-400/50 hover:bg-slate-800/80'
                    }`}
                    onClick={() => toggleArrayValue('locations', option.value)}
                  >
                    {/* Professional checkbox indicator */}
                    <div className={`absolute top-1 right-1 w-4 h-4 border border-amber-400 rounded text-center text-xs leading-3 ${
                      onboardingData.locations.includes(option.value) 
                        ? 'bg-amber-400 text-slate-900' 
                        : 'bg-transparent'
                    }`}>
                      {onboardingData.locations.includes(option.value) ? '✓' : ''}
                    </div>
                    <CardContent className="p-2.5 text-center h-full flex flex-col justify-center">
                      <h3 className="font-semibold text-white text-xs leading-tight mb-0.5">{option.value}</h3>
                      <p className="text-[9px] text-slate-300 leading-tight">{option.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-amber-200">Specific places you go to:</label>
                <textarea
                  value={onboardingData.locationsCustom}
                  onChange={(e) => updateOnboardingData('locationsCustom', e.target.value)}
                  placeholder="List specific places, addresses, or areas you visit..."
                  className="w-full h-12 px-3 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors resize-none text-xs"
                  maxLength={500}
                />
                <p className="text-[9px] text-slate-400">{onboardingData.locationsCustom.length}/500 characters</p>
              </div>

              <div className="p-2 bg-amber-400/10 rounded-lg border border-amber-400/30">
                <p className="text-xs text-amber-200">
                  <strong>Example:</strong> You can pick "City Center" and "Work Events"
                </p>
              </div>

              <Button 
                onClick={nextStep}
                disabled={onboardingData.locations.length === 0 && !onboardingData.locationsCustom.trim()}
                className="w-full h-9 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold rounded-xl shadow-xl transition-all duration-300 disabled:opacity-50 text-sm"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Slide 6: Risk Assessment */}
          {onboardingStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center space-y-3">
                <h2 className="text-xl font-bold text-white">Professional risk assessment consultation</h2>
                <p className="text-sm text-slate-300">Industry best practice requires understanding your security transport context</p>
              </div>

              <div className="space-y-3">
                {[
                  { value: 'Standard Business Travel', desc: 'Regular professional transport needs', level: 'standard' },
                  { value: 'High-Profile Professional', desc: 'Public recognition, media attention', level: 'elevated' },
                  { value: 'Business Competition', desc: 'Competitive industry considerations', level: 'elevated' },
                  { value: 'Legal Proceedings', desc: 'Court appearances, legal matters', level: 'enhanced' },
                  { value: 'Previous Security Concerns', desc: 'Past incidents or ongoing considerations', level: 'enhanced' },
                  { value: 'Preventive Security Only', desc: 'No specific concerns, standard protection', level: 'standard' }
                ].map((option) => (
                  <Card 
                    key={option.value}
                    className={`cursor-pointer transition-all duration-200 ${
                      onboardingData.riskConcerns.includes(option.value)
                        ? 'bg-gradient-to-r from-amber-400/20 to-amber-600/20 border-amber-400 shadow-lg' 
                        : 'bg-slate-800/60 border-slate-600 hover:border-amber-400/50 hover:bg-slate-800/80'
                    }`}
                    onClick={() => toggleArrayValue('riskConcerns', option.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-white">{option.value}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              option.level === 'enhanced' ? 'bg-blue-400/20 text-blue-300' :
                              option.level === 'elevated' ? 'bg-yellow-400/20 text-yellow-300' :
                              'bg-green-400/20 text-green-300'
                            }`}>
                              {option.level}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mt-1">{option.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          onboardingData.riskConcerns.includes(option.value) 
                            ? 'bg-amber-400 border-amber-400' 
                            : 'border-slate-500'
                        }`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-amber-200">Additional context for professional assessment:</label>
                <textarea
                  value={onboardingData.riskConcernsCustom}
                  onChange={(e) => updateOnboardingData('riskConcernsCustom', e.target.value)}
                  placeholder="Share any specific requirements or considerations for your security transport service (confidential)..."
                  className="w-full h-24 px-4 py-3 bg-slate-800/60 border border-amber-400/50 rounded-xl text-white placeholder-slate-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors resize-none"
                  maxLength={800}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">{onboardingData.riskConcernsCustom.length}/800 characters</p>
                  <div className="flex items-center gap-1 text-xs text-amber-300">
                    <Shield size={12} />
                    <span>Confidential & Secure</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={nextStep}
                disabled={onboardingData.riskConcerns.length === 0 && !onboardingData.riskConcernsCustom.trim()}
                className="w-full h-12 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold rounded-xl shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Slide 7: Emergency Contacts */}
          {onboardingStep === 7 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-3 text-center">
                <h2 className="text-lg font-bold text-white">Emergency contact information</h2>
                <p className="text-sm text-slate-300">Industry best practice for professional duty of care</p>
              </div>

              <div className="space-y-6">
                {/* Primary Contact */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-amber-200">Primary Contact</h3>
                  <div className="grid gap-3">
                    <Input
                      value={onboardingData.emergencyContact1.name}
                      onChange={(e) => updateOnboardingData('emergencyContact1', {...onboardingData.emergencyContact1, name: e.target.value})}
                      placeholder="Full name"
                      className="bg-slate-800/60 border-slate-600 text-white placeholder-slate-400 focus:border-amber-400"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={onboardingData.emergencyContact1.relationship}
                        onChange={(e) => updateOnboardingData('emergencyContact1', {...onboardingData.emergencyContact1, relationship: e.target.value})}
                        className="px-3 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      >
                        <option value="">Relationship</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Partner">Partner</option>
                        <option value="Family">Family</option>
                        <option value="Friend">Friend</option>
                        <option value="Colleague">Colleague</option>
                        <option value="Assistant">Assistant</option>
                        <option value="Other">Other</option>
                      </select>
                      <Input
                        value={onboardingData.emergencyContact1.phone}
                        onChange={(e) => updateOnboardingData('emergencyContact1', {...onboardingData.emergencyContact1, phone: e.target.value})}
                        placeholder="Phone number"
                        type="tel"
                        className="bg-slate-800/60 border-slate-600 text-white placeholder-slate-400 focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary Contact */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-amber-200">Secondary Contact (Optional)</h3>
                  <div className="grid gap-3">
                    <Input
                      value={onboardingData.emergencyContact2.name}
                      onChange={(e) => updateOnboardingData('emergencyContact2', {...onboardingData.emergencyContact2, name: e.target.value})}
                      placeholder="Full name"
                      className="bg-slate-800/60 border-slate-600 text-white placeholder-slate-400 focus:border-amber-400"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={onboardingData.emergencyContact2.relationship}
                        onChange={(e) => updateOnboardingData('emergencyContact2', {...onboardingData.emergencyContact2, relationship: e.target.value})}
                        className="px-3 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      >
                        <option value="">Relationship</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Partner">Partner</option>
                        <option value="Family">Family</option>
                        <option value="Friend">Friend</option>
                        <option value="Colleague">Colleague</option>
                        <option value="Assistant">Assistant</option>
                        <option value="Other">Other</option>
                      </select>
                      <Input
                        value={onboardingData.emergencyContact2.phone}
                        onChange={(e) => updateOnboardingData('emergencyContact2', {...onboardingData.emergencyContact2, phone: e.target.value})}
                        placeholder="Phone number"
                        type="tel"
                        className="bg-slate-800/60 border-slate-600 text-white placeholder-slate-400 focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={nextStep}
                disabled={!onboardingData.emergencyContact1.name || !onboardingData.emergencyContact1.phone}
                className="w-full h-12 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold rounded-xl shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Slide 8: Emergency Response Preferences */}
          {onboardingStep === 8 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-3 text-center">
                <h2 className="text-lg font-bold text-white">Professional response preferences</h2>
                <p className="text-sm text-slate-300">How should we coordinate in exceptional situations?</p>
              </div>

              <div className="space-y-3">
                {[
                  { value: 'Contact family first', desc: 'Notify contacts before authorities', priority: '1st: Family, 2nd: Local authorities' },
                  { value: 'Authorities first', desc: 'Local authorities immediately, then contacts', priority: '1st: Local authorities, 2nd: Family' },
                  { value: 'Medical conditions priority', desc: 'Health information shared immediately', priority: 'Medical info shared first' },
                  { value: 'Discrete response', desc: 'Minimize public attention during incidents', priority: 'Low-profile incident response' }
                ].map((option) => (
                  <Card 
                    key={option.value}
                    className={`cursor-pointer transition-all duration-200 ${
                      onboardingData.emergencyResponse === option.value
                        ? 'bg-gradient-to-r from-amber-400/20 to-amber-600/20 border-amber-400 shadow-lg' 
                        : 'bg-slate-800/60 border-slate-600 hover:border-amber-400/50 hover:bg-slate-800/80'
                    }`}
                    onClick={() => updateOnboardingData('emergencyResponse', option.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{option.value}</h3>
                          <p className="text-sm text-slate-300">{option.desc}</p>
                          <p className="text-xs text-amber-300 mt-1">{option.priority}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          onboardingData.emergencyResponse === option.value 
                            ? 'bg-amber-400 border-amber-400' 
                            : 'border-slate-500'
                        }`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-amber-200">Professional considerations, medical info, or special instructions:</label>
                <textarea
                  value={onboardingData.emergencyInstructions}
                  onChange={(e) => updateOnboardingData('emergencyInstructions', e.target.value)}
                  placeholder="Response preferences, medical conditions, allergies, medications, or special instructions for professional coordination..."
                  className="w-full h-24 px-4 py-3 bg-slate-800/60 border border-amber-400/50 rounded-xl text-white placeholder-slate-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors resize-none"
                  maxLength={600}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">{onboardingData.emergencyInstructions.length}/600 characters</p>
                  <div className="flex items-center gap-1 text-xs text-amber-300">
                    <Shield size={12} />
                    <span>Professional Confidentiality</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={nextStep}
                disabled={!onboardingData.emergencyResponse}
                className="w-full h-12 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold rounded-xl shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                Complete Assessment
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Onboarding Complete - Service Recommendations
  if (currentView === 'onboarding-complete') {
    // Generate personalized recommendations based on collected data
    const generateRecommendations = () => {
      let recommendedService = 'Your Essential Protection'
      let recommendationReason = 'Based on your personal protection transport needs'
      
      if (onboardingData.riskConcerns.includes('Threat Assessment') || onboardingData.riskConcerns.includes('High-Profile Visibility')) {
        recommendedService = 'Your Executive Security'
        recommendationReason = 'Enhanced security transport recommended due to your elevated risk profile'
      }
      
      if (onboardingData.serviceStyle === 'Ultra-Premium' || onboardingData.workType.includes('Public Figure')) {
        recommendedService = 'Your Signature Experience'
        recommendationReason = 'Premium security transport service matching your professional profile'
      }
      
      if (onboardingData.workType.includes('Corporate Executive') && onboardingData.travelFrequency === 'Daily') {
        recommendedService = 'Corporate Security Transport'
        recommendationReason = 'Regular business protection transport with executive-level service'
      }

      return { service: recommendedService, reason: recommendationReason }
    }

    const recommendations = generateRecommendations()

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <Toaster position="top-center" />
        
        {/* Luxury Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-amber-400/20 to-amber-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-400/10 to-emerald-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="max-w-lg mx-auto text-center space-y-8 animate-in fade-in duration-1000 relative z-10">
          {/* Success Animation */}
          <div className="space-y-6">
            <div className="relative">
              <div className="w-28 h-28 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl relative">
                <CheckCircle size={52} className="text-white" weight="fill" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 rounded-full" />
              </div>
              <div className="absolute -inset-6 bg-gradient-to-r from-emerald-400/30 to-emerald-600/30 rounded-full blur-xl animate-pulse" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-white">Your Personal Security Transport Profile is Complete</h1>
              <p className="text-lg text-emerald-200">Welcome to your personalized protection transport with Armora</p>
            </div>
          </div>

          {/* Personalized Recommendations */}
          <Card className="bg-slate-800/60 border-amber-400/30 shadow-2xl">
            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold text-white">Your Professional Security Transport Profile</h2>
                <div className="p-6 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-2xl border border-amber-400/30">
                  <h3 className="text-lg font-bold text-amber-200 mb-2">Your Recommended Security Transport Service</h3>
                  <p className="text-2xl font-bold text-white">{recommendations.service}</p>
                  <p className="text-sm text-slate-300 mt-2">{recommendations.reason}</p>
                  <div className="mt-4 pt-4 border-t border-amber-400/30">
                    <p className="text-xs text-amber-200">
                      ✓ All operatives hold valid SIA licenses (legally required)<br/>
                      ✓ Enhanced DBS background checks completed<br/>
                      ✓ BS 7858 security screening (industry best practice)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-amber-200">Your Security Transport Requirements Summary:</h3>
                <div className="grid gap-3 text-left">
                  {onboardingData.workType.length > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-lg">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span className="text-sm text-slate-200">
                        Professional: {onboardingData.workType.join(', ')}
                        {onboardingData.workTypeCustom && ` - ${onboardingData.workTypeCustom.substring(0, 50)}${onboardingData.workTypeCustom.length > 50 ? '...' : ''}`}
                      </span>
                    </div>
                  )}
                  
                  {onboardingData.serviceStyle && (
                    <div className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-lg">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span className="text-sm text-slate-200">Style: {onboardingData.serviceStyle}</span>
                    </div>
                  )}
                  
                  {onboardingData.travelFrequency && (
                    <div className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-lg">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span className="text-sm text-slate-200">Frequency: {onboardingData.travelFrequency}</span>
                    </div>
                  )}
                  
                  {onboardingData.locations.length > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-lg">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span className="text-sm text-slate-200">
                        Locations: {onboardingData.locations.slice(0, 2).join(', ')}
                        {onboardingData.locations.length > 2 && ` +${onboardingData.locations.length - 2} more`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-600">
                <div className="flex items-center gap-2 justify-center text-emerald-300">
                  <Shield size={16} />
                  <span className="text-sm">Your protection transport team will review these details</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="space-y-4">
            <Button 
              onClick={() => {
                setHasCompletedOnboarding(true)
                setCurrentView('home')
                toast.success("🎉 Welcome to your personalized security transport service!")
              }}
              className="w-full h-14 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold text-lg rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Access My Security Transport Service
            </Button>
            
            <p className="text-sm text-slate-300 italic">
              "Your custom transport requirements have been securely recorded"
            </p>
          </div>

          {/* Luxury Trust Indicators */}
          <div className="pt-6 border-t border-amber-400/20">
            <div className="flex items-center justify-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Shield size={12} className="text-emerald-400" />
                <span>Encrypted Storage</span>
              </div>
              <div className="w-px h-4 bg-amber-400/30"></div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-emerald-400" />
                <span>Profile Complete</span>
              </div>
              <div className="w-px h-4 bg-amber-400/30"></div>
              <div className="flex items-center gap-1.5">
                <Star size={12} className="text-emerald-400" />
                <span>Ready to Serve</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Booking Confirmation Screen
  if (currentView === 'booking-confirmation' && currentTrip) {
    const service = currentTrip.service
    const distance = currentTrip.estimatedDistance
    const duration = currentTrip.estimatedDuration
    const price = currentTrip.estimatedPrice
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        {/* Header */}
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/30 p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('home')} className="w-9 h-9 rounded-full">
              <ArrowLeft size={18} />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold">Confirm Your Security Transport Service</h1>
              <p className="text-xs text-muted-foreground">Review your personalized trip details</p>
            </div>
          </div>
        </header>

        <div className="p-4 pb-24 space-y-4 max-w-md mx-auto">
          {/* Service Summary */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                {React.createElement(service?.icon || Car, {
                  size: 32,
                  className: "text-primary-foreground",
                  weight: "fill"
                })}
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary">{service?.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{service?.description}</p>
              </div>
              <div className="bg-card/50 rounded-xl p-4 space-y-2">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{price}</p>
                  <p className="text-xs text-muted-foreground">Total fare • {distance?.toFixed(1)}km • ~{duration} min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Route */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
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

          {/* Trip Details */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Journey Details</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{distance?.toFixed(1)} km</p>
                  <p className="text-xs text-muted-foreground">Distance</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">~{duration} min</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{service?.capacity}</p>
                  <p className="text-xs text-muted-foreground">Capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Payment Method</p>
                    <p className="text-sm text-muted-foreground">Mastercard •••• 4321</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-green-600" />
                <h3 className="font-semibold text-green-800">Professional Security Standards</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle size={12} className="text-green-600" />
                  <span>All drivers hold valid SIA licenses (legally required)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={12} className="text-green-600" />
                  <span>Enhanced DBS background checks (legally required)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={12} className="text-green-600" />
                  <span>BS 7858 security screening (industry best practice)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={12} className="text-green-600" />
                  <span>Professional liability insurance coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={12} className="text-green-600" />
                  <span>Real-time journey tracking and coordination</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={12} className="text-green-600" />
                  <span>24/7 professional support and monitoring</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Actions */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={confirmBooking}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold rounded-xl shadow-lg"
            >
              Confirm Your Security Transport - {price}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('home')}
              className="w-full h-10"
            >
              Back to Edit Trip
            </Button>
          </div>

          {/* Terms */}
          <div className="text-center text-xs text-muted-foreground pt-2">
            <p>By booking, you agree to our Terms of Service and acknowledge our Privacy Policy.</p>
          </div>
        </div>
      </div>
    )
  }

  // Home/Booking View
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 flex flex-col">
        <Toaster position="top-center" />
        
        {/* Compact Header */}
        <header className="bg-background/98 backdrop-blur-sm border-b border-border/30 p-3 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Car size={12} className="text-primary-foreground" weight="bold" />
              </div>
              <div>
                <h1 className="text-base font-bold">Armora</h1>
                <p className="text-[10px] text-muted-foreground">Personalizing your security service</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isLocationWatching && (
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" title="GPS active" />
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-6 h-6 rounded-full"
                onClick={() => {
                  // Reset to welcome screen
                  setCurrentView('welcome')
                  setIsFirstLaunch(true)
                  setHasCompletedOnboarding(false)
                  toast.success("🔄 App reset to welcome screen")
                }}
              >
                <User size={12} />
              </Button>
            </div>
          </div>
        </header>

        {/* Essential Status Messages Only - Driver Related Info */}
        {statusMessage && (statusMessage.includes('Driver') || statusMessage.includes('arriving') || statusMessage.includes('assigned')) && (
          <div className="mx-4 mt-2 p-2 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-xs font-medium text-green-700">{statusMessage}</p>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 space-y-2 max-w-md mx-auto pb-20">{/* Added pb-20 for bottom navigation space */}
          {/* Compact Map Preview */}
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/90">
            <CardContent className="p-0">
              <div className="relative">
                <GoogleMapsLoader
                  fallback={
                    <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden rounded-lg">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-1">
                          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-xs font-medium text-gray-700">Loading Map...</p>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <GoogleMapView
                    center={mapCenter}
                    markers={userLocation ? [{
                      lat: userLocation.lat,
                      lng: userLocation.lng,
                      title: "Your Current Location",
                      icon: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                          <circle cx="10" cy="10" r="3" fill="white"/>
                        </svg>
                      `),
                      infoWindow: `
                        <div style="padding: 4px; font-family: Inter, sans-serif; text-align: center;">
                          <h3 style="margin: 0; font-size: 10px; font-weight: 600; color: #1f2937;">📍 You are here</h3>
                        </div>
                      `
                    }] : []}
                    onLocationSelect={(location) => {
                      if (!bookingForm.pickup) {
                        setBookingForm(prev => ({
                          ...prev,
                          pickup: location.address,
                          pickupCoords: { lat: location.lat, lng: location.lng }
                        }))
                        toast.success("📍 Pickup location set")
                      } else if (!bookingForm.destination) {
                        setBookingForm(prev => ({
                          ...prev,
                          destination: location.address,
                          destinationCoords: { lat: location.lat, lng: location.lng }
                        }))
                        toast.success("🎯 Destination confirmed")
                      }
                    }}
                    className="h-32"
                    showControls={false}
                    showCurrentLocation={true}
                    showTraffic={false}
                  />
                </GoogleMapsLoader>
                
                {/* Minimal GPS Status */}
                <div className="absolute top-2 left-2">
                  <div className={`w-2 h-2 rounded-full ${userLocation ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`}></div>
                </div>
                
                {/* Quick GPS Action */}
                <div className="absolute top-1 right-1">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-6 h-6 p-0 bg-background/90 rounded-full border-0"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                  >
                    <Crosshair size={10} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Minimal Current Location Display */}
          {userLocation && userAddress && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs font-medium text-green-700 truncate flex-1">
                📍 {userAddress.split(',')[0]}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => {
                  if (userAddress && userLocation) {
                    setBookingForm(prev => ({
                      ...prev,
                      pickup: userAddress,
                      pickupCoords: userLocation
                    }))
                  }
                }}
              >
                Use
              </Button>
            </div>
          )}

          {/* Ultra Compact Booking Form */}
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-3 space-y-2">
              <div className="space-y-1.5">
                <div className="relative">
                  <GoogleMapsLoader>
                    <PlacesAutocomplete
                      value={bookingForm.pickup}
                      onChange={(value) => setBookingForm(prev => ({ ...prev, pickup: value }))}
                      placeholder="Pickup location"
                      className="pl-6 h-8 border-0 bg-muted/50 focus:bg-background text-xs"
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
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                
                <div className="relative">
                  <GoogleMapsLoader>
                    <PlacesAutocomplete
                      value={bookingForm.destination}
                      onChange={(value) => setBookingForm(prev => ({ ...prev, destination: value }))}
                      placeholder="Where to?"
                      className="pl-6 h-8 border-0 bg-muted/50 focus:bg-background text-xs"
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
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </div>
              
              {/* Trip Summary */}
              {bookingForm.pickupCoords && bookingForm.destinationCoords && (() => {
                const distance = calculateDistance(bookingForm.pickupCoords, bookingForm.destinationCoords)
                const service = selectedService ? armoraServices.find(s => s.id === selectedService) : null
                const price = service ? calculateServicePrice(service, distance) : null
                
                return (
                  <div className="p-1.5 bg-muted/30 rounded text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{distance.toFixed(1)} km</span>
                      <span>~{Math.ceil(distance * 2)} min</span>
                      {price && <span className="font-bold text-green-600">{price}</span>}
                    </div>
                    {selectedService && (
                      <span className="text-green-700 font-medium">Ready</span>
                    )}
                  </div>
                )
              })()}
            </CardContent>
          </Card>

          {/* Ultra Compact Service Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Choose Your Personal Protection Transport Level</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetToWelcome}
                className="h-6 px-2 text-xs bg-primary/10 border-primary/20 hover:bg-primary hover:text-primary-foreground"
              >
                <Shield size={10} className="mr-1" />
                Welcome
              </Button>
            </div>
            
            {/* Compact 2x3 Service Grid - Two services per row */}
            <div className="grid grid-cols-2 gap-3">
              {armoraServices.map(service => {
                const Icon = service.icon
                const isSelected = selectedService === service.id
                const dynamicPrice = calculateServicePrice(service, routeDistance)
                
                return (
                  <Card 
                    key={service.id}
                    className={`cursor-pointer transition-all duration-200 h-[120px] overflow-hidden relative ${ 
                      isSelected
                        ? 'ring-2 ring-primary bg-primary/10 shadow-lg' 
                        : 'hover:shadow-md bg-white border border-border/40'
                    } ${service.popular ? 'border-green-200' : ''}`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    {/* Small Badge for Popular */}
                    {service.popular && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-[6px] font-bold px-1 py-0.5 rounded-full">
                        ★
                      </div>
                    )}
                    <CardContent className="p-3 h-full flex flex-col items-center justify-center text-center space-y-1.5">
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ 
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted/70 text-primary'
                      }`}>
                        <Icon size={18} weight={isSelected ? "fill" : "regular"} />
                      </div>
                      
                      {/* Service Name */}
                      <h3 className={`font-bold text-[10px] leading-tight text-center line-clamp-1 ${ 
                        isSelected ? 'text-primary' : 'text-foreground'
                      }`}>
                        {service.name}
                      </h3>
                      
                      {/* Price */}
                      <p className={`font-bold text-sm leading-none ${ 
                        isSelected ? 'text-primary' : 'text-foreground'
                      }`}>
                        {dynamicPrice}
                      </p>
                      
                      {/* ETA and Capacity */}
                      <div className="space-y-0.5 text-center">
                        <p className="text-[9px] text-muted-foreground leading-none">
                          {service.eta}
                        </p>
                        <p className="text-[9px] text-muted-foreground leading-none">
                          {service.capacity}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Selected Service Description */}
            {selectedService && (() => {
              const service = armoraServices.find(s => s.id === selectedService)
              const dynamicPrice = calculateServicePrice(service, routeDistance)
              return (
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      {React.createElement(service?.icon || Car, {
                        size: 14,
                        className: "text-primary",
                        weight: "fill"
                      })}
                      <h4 className="font-bold text-sm text-primary">
                        {service?.name}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {service?.description}
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-1">
                      <div className="text-center">
                        <p className="font-bold text-sm text-primary">
                          {dynamicPrice}
                        </p>
                        <p className="text-[8px] text-muted-foreground">
                          {routeDistance > 0 ? `For ${routeDistance.toFixed(1)}km` : 'Price Range'}
                        </p>
                      </div>
                      <div className="w-px h-6 bg-primary/20"></div>
                      <div className="text-center">
                        <p className="font-bold text-sm text-accent">
                          {service?.eta}
                        </p>
                        <p className="text-[8px] text-muted-foreground">Arrival</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Minimal Payment and Book Button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard size={12} className="text-muted-foreground" />
                <span className="text-xs font-medium">Mastercard •••• 4321</span>
              </div>
              <NavigationArrow size={8} className="rotate-90 text-muted-foreground" />
            </div>

            <Button 
              onClick={handleBookRide}
              className="w-full h-10 bg-gradient-to-r from-black to-black/90 hover:from-black/90 hover:to-black/80 text-white font-semibold text-sm rounded-xl shadow-lg disabled:opacity-50"
              disabled={!bookingForm.pickup || !bookingForm.destination || !selectedService || !bookingForm.pickupCoords || !bookingForm.destinationCoords}
            >
              <div className="flex items-center gap-2">
                {selectedService && <Car size={14} />}
                {!bookingForm.pickup || !bookingForm.destination ? 
                  'Enter locations' :
                  !selectedService ? 
                  'Select protection transport' :
                  !bookingForm.pickupCoords || !bookingForm.destinationCoords ?
                  'Select valid locations' :
                  (() => {
                    const service = armoraServices.find(s => s.id === selectedService)
                    const dynamicPrice = calculateServicePrice(service, routeDistance)
                    return `Book ${service?.name} - ${dynamicPrice}`
                  })()
                }
              </div>
            </Button>
          </div>
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

        {/* Compact Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 z-50">
          <div className="grid grid-cols-5 h-12 max-w-md mx-auto">
            <button
              onClick={() => setCurrentView('home')}
              className="flex flex-col items-center justify-center gap-0.5 text-primary transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <House size={16} weight="fill" />
              </div>
              <span className="text-[10px] font-semibold">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentView('activity')}
              className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <List size={16} />
              </div>
              <span className="text-[10px]">Activity</span>
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Heart size={16} />
              </div>
              <span className="text-[10px]">Saved</span>
            </button>

            <button
              onClick={() => setCurrentView('account')}
              className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <User size={16} />
              </div>
              <span className="text-[10px]">Account</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('welcome')
                setIsFirstLaunch(true)
                setHasCompletedOnboarding(false)
                toast.success("🏠 Welcome Screen")
              }}
              className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Shield size={16} />
              </div>
              <span className="text-[10px]">Reset</span>
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
              <h1 className="font-semibold truncate">Your Security Transport to {currentTrip.destination}</h1>
              <p className="text-xs text-muted-foreground">Tracking your protection transport</p>
            </div>
          </div>
        </header>

        {/* Driver Status Updates with Enhanced Notifications */}
        {currentTrip && assignedDriver && (() => {
          const timeSinceBooking = Math.floor((new Date().getTime() - new Date(currentTrip.startTime).getTime()) / (1000 * 60))
          const etaStatus = assignedDriver.eta <= 2 ? 'arriving' : assignedDriver.eta <= 5 ? 'nearby' : 'en_route'
          
          return (
            <div className={`mx-4 mt-4 p-4 rounded-xl border-2 transition-all duration-300 ${
              etaStatus === 'arriving' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg' 
                : etaStatus === 'nearby'
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-md'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full animate-pulse ${
                  etaStatus === 'arriving' ? 'bg-green-500' :
                  etaStatus === 'nearby' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${
                    etaStatus === 'arriving' ? 'text-green-800' :
                    etaStatus === 'nearby' ? 'text-yellow-800' : 'text-blue-800'
                  }`}>
                    {etaStatus === 'arriving' ? '🚗 Your Security Transport Professional Arriving Now!' :
                     etaStatus === 'nearby' ? `🔔 ${assignedDriver.name} is ${assignedDriver.eta} minutes away` :
                     `📍 Your protection transport specialist ${assignedDriver.name} is en route`}
                  </p>
                  <p className={`text-xs mt-1 ${
                    etaStatus === 'arriving' ? 'text-green-600' :
                    etaStatus === 'nearby' ? 'text-yellow-600' : 'text-blue-600'
                  }`}>
                    {etaStatus === 'arriving' ? 'Your secure transport is ready for pickup' :
                     etaStatus === 'nearby' ? 'Your security transport professional is almost here!' :
                     `Estimated arrival: ${assignedDriver.eta} minutes • Your transport booked ${timeSinceBooking}min ago`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const newSoundSetting = !notificationSettings.soundEnabled
                    setNotificationSettings(prev => ({ ...prev, soundEnabled: newSoundSetting }))
                    toast.success(newSoundSetting ? '🔊 Sound alerts enabled' : '🔇 Sound alerts disabled')
                  }}
                >
                  {notificationSettings.soundEnabled ? (
                    <SpeakerHigh size={16} className="text-green-600" />
                  ) : (
                    <SpeakerHigh size={16} className="opacity-50" />
                  )}
                </Button>
              </div>
            </div>
          )
        })()}

        <div className="p-4 pb-24 space-y-4 max-w-md mx-auto">{/* Enhanced Live Tracking Map */}
          <LiveTrackingMap 
            trip={currentTrip} 
            driver={{...assignedDriver, location: userLocation}} 
            onArrival={() => {
              toast.success("🚗 Your security transport professional has arrived!")
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
                  className="h-11 font-medium hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
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
                  className="h-11 font-medium relative hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                  onClick={() => {
                    setIsChatOpen(true)
                    setUnreadMessages(0)
                  }}
                >
                  <ChatCircle size={16} className="mr-2" />
                  Chat
                  {unreadMessages > 0 && (
                    <>
                      <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 text-xs bg-destructive text-destructive-foreground flex items-center justify-center font-bold">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </Badge>
                      <div className="absolute inset-0 border-2 border-blue-400 rounded-lg animate-pulse"></div>
                    </>
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
              toast.success("❌ Your security transport has been cancelled")
            }}
          >
            Cancel Security Transport
          </Button>
        </div>

        {/* Enhanced Chat System with Notifications */}
        {currentTrip && assignedDriver && (
          <ChatSystem 
            trip={currentTrip}
            driver={assignedDriver}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        )}

        {/* Enhanced Floating Chat Bubble with Smart Notifications */}
        {currentTrip && assignedDriver && !isChatOpen && (
          <div className="fixed bottom-24 right-4 z-40">
            {/* Unread message bubble */}
            {unreadMessages > 0 ? (
              <Button
                onClick={() => {
                  setIsChatOpen(true)
                  setUnreadMessages(0)
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-2xl relative animate-bounce border-2 border-background"
              >
                <ChatCircle size={28} className="text-primary-foreground" weight="fill" />
                <Badge className="absolute -top-2 -right-2 w-7 h-7 rounded-full p-0 text-sm bg-destructive text-destructive-foreground flex items-center justify-center font-bold border-2 border-background">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </Badge>
                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30"></div>
              </Button>
            ) : (
              /* Regular chat button */
              <Button
                onClick={() => setIsChatOpen(true)}
                className="w-14 h-14 rounded-full bg-muted/90 hover:bg-primary hover:text-primary-foreground shadow-xl transition-all duration-300 border border-border/50"
              >
                <ChatCircle size={24} className="opacity-70" />
              </Button>
            )}
            
            {/* Driver status indicator */}
            <div className="absolute -top-1 -left-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background animate-pulse">
              <div className="absolute inset-1 bg-white rounded-full"></div>
            </div>
          </div>
        )}

        {/* Smart Message Preview Notification */}
        {currentTrip && assignedDriver && !isChatOpen && unreadMessages > 0 && (() => {
          // Get the latest driver message for preview
          const messages = JSON.parse(localStorage.getItem(`chat-${currentTrip.id}`) || '[]')
          const lastDriverMessage = messages
            .filter((msg: any) => msg.sender === 'driver')
            .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
          
          if (lastDriverMessage) {
            return (
              <div className="fixed bottom-44 right-4 z-30 max-w-xs">
                <Card className="bg-background/95 backdrop-blur-sm border border-border shadow-2xl animate-in slide-in-from-right duration-300">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <img 
                        src={assignedDriver.photo} 
                        alt={assignedDriver.name}
                        className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{assignedDriver.name}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(lastDriverMessage.timestamp).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2">
                          {lastDriverMessage.text.length > 50 
                            ? `${lastDriverMessage.text.substring(0, 50)}...`
                            : lastDriverMessage.text
                          }
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0 flex-shrink-0"
                        onClick={() => setUnreadMessages(0)}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 h-8"
                      onClick={() => {
                        setIsChatOpen(true)
                        setUnreadMessages(0)
                      }}
                    >
                      Reply
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )
          }
          return null
        })()}

        {/* Chat Activity Indicator */}
        {currentTrip && assignedDriver && !isChatOpen && (() => {
          const isDriverTyping = Math.random() > 0.95 // Simulate driver typing
          if (isDriverTyping) {
            return (
              <div className="fixed bottom-32 right-20 z-30">
                <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <img 
                      src={assignedDriver.photo} 
                      alt={assignedDriver.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
          return null
        })()}
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
            <h1 className="text-xl font-bold">Your Security Transport Activity</h1>
            <p className="text-sm text-muted-foreground">Recent protection transport services and bookings</p>
          </div>
        </header>

        <div className="p-4 pb-24 max-w-md mx-auto">
          {recentTrips.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <List size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No security transports yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">When you book your first personalized protection transport with Armora, it will appear here</p>
              <Button onClick={() => setCurrentView('home')} className="h-12 px-6 rounded-xl font-semibold">
                <Car size={18} className="mr-2" />
                Book your first security transport
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
                      <span className="text-sm text-muted-foreground">Security Professional: {trip.driver.name}</span>
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

        {/* Bottom Navigation Activity */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 z-50">
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

        <div className="p-4 pb-24 max-w-md mx-auto">
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

        {/* Bottom Navigation Favorites */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 z-50">
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

        <div className="p-4 pb-24 space-y-6 max-w-md mx-auto">
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

        {/* Bottom Navigation Account */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 z-50">
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