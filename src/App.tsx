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

// Type declarations for Google Maps
declare global {
  interface Window {
    google?: {
      maps: any
    }
    googleMapsLoaded?: boolean
  }
}

const GoogleMapComponent = ({ 
  onLocationSelect, 
  selectedLocation, 
  currentLocation,
  destinationLocation,
  driverLocation,
  isTrackingMode = false
}: {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  selectedLocation?: { lat: number; lng: number }
  currentLocation?: { lat: number; lng: number }
  destinationLocation?: { lat: number; lng: number }
  driverLocation?: { lat: number; lng: number }
  isTrackingMode?: boolean
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const destinationMarkerRef = useRef<any>(null)
  const currentLocationMarkerRef = useRef<any>(null)
  const driverMarkerRef = useRef<any>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const geocoderRef = useRef<any>(null)

  // Initialize map when Google Maps API is ready
  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current || !window.google?.maps) return

      // Default to London center
      const defaultCenter = { lat: 51.5074, lng: -0.1278 }
      
      const map = new window.google.maps.Map(mapRef.current, {
        center: currentLocation || defaultCenter,
        zoom: currentLocation ? 16 : 12,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP
        }
      })

      googleMapRef.current = map
      geocoderRef.current = new window.google.maps.Geocoder()

      // Add current location marker if available
      if (currentLocation) {
        currentLocationMarkerRef.current = new window.google.maps.Marker({
          position: currentLocation,
          map: map,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24)
          },
          title: "Your current location"
        })
      }

      // Add click listener only if not in tracking mode
      if (!isTrackingMode) {
        map.addListener('click', (event: any) => {
          if (event.latLng) {
            const location = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            }
            
            // Add/update pickup marker
            if (markerRef.current) {
              markerRef.current.setMap(null)
            }
            
            markerRef.current = new window.google.maps.Marker({
              position: location,
              map: map,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EF4444" stroke="white" stroke-width="1"/>
                    <circle cx="12" cy="9" r="2.5" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(32, 32),
                anchor: new window.google.maps.Point(16, 32)
              },
              title: "Pickup location"
            })

            // Reverse geocode to get address
            if (geocoderRef.current) {
              geocoderRef.current.geocode(
                { location: location },
                (results: any, status: string) => {
                  if (status === 'OK' && results && results[0]) {
                    const address = results[0].formatted_address
                    onLocationSelect({
                      lat: location.lat,
                      lng: location.lng,
                      address: address
                    })
                    toast.success("Pickup location selected", {
                      description: address
                    })
                  } else {
                    onLocationSelect({
                      lat: location.lat,
                      lng: location.lng,
                      address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                    })
                  }
                }
              )
            }
          }
        })
      }

      setIsMapLoaded(true)
    }

    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      initializeMap()
    } else {
      // Listen for Google Maps load event
      const handleMapsLoad = () => {
        initializeMap()
      }
      window.addEventListener('google-maps-loaded', handleMapsLoad)
      
      return () => {
        window.removeEventListener('google-maps-loaded', handleMapsLoad)
      }
    }
  }, [currentLocation, onLocationSelect, isTrackingMode])

  // Update driver location marker with real-time tracking
  useEffect(() => {
    if (googleMapRef.current && driverLocation && isTrackingMode) {
      // Remove existing driver marker
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setMap(null)
      }
      
      // Add new driver marker with car icon
      driverMarkerRef.current = new window.google.maps.Marker({
        position: driverLocation,
        map: googleMapRef.current,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="11" width="18" height="8" rx="2" fill="#1D4ED8" stroke="white" stroke-width="1"/>
              <circle cx="7" cy="17" r="1.5" fill="white"/>
              <circle cx="17" cy="17" r="1.5" fill="white"/>
              <path d="M5 11V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" stroke="white" stroke-width="1"/>
              <circle cx="12" cy="12" r="1" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        },
        title: "Your security driver",
        zIndex: 1000
      })

      // Auto-center map to show both driver and pickup location
      if (selectedLocation) {
        const bounds = new window.google.maps.LatLngBounds()
        bounds.extend(driverLocation)
        bounds.extend(selectedLocation)
        
        // Add some padding to the bounds
        googleMapRef.current.fitBounds(bounds, {
          padding: { top: 50, right: 50, bottom: 50, left: 50 }
        })
        
        // Ensure minimum zoom level for city view
        window.google.maps.event.addListenerOnce(googleMapRef.current, 'bounds_changed', () => {
          if (googleMapRef.current.getZoom() > 16) {
            googleMapRef.current.setZoom(16)
          }
        })
      }
    }
  }, [driverLocation, selectedLocation, isTrackingMode])

  // Update destination marker when destination changes
  useEffect(() => {
    if (googleMapRef.current && destinationLocation) {
      // Remove existing destination marker
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setMap(null)
      }
      
      // Add new destination marker
      destinationMarkerRef.current = new window.google.maps.Marker({
        position: destinationLocation,
        map: googleMapRef.current,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#22C55E" stroke="white" stroke-width="1"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32)
        },
        title: "Destination"
      })

      // Adjust map bounds to include both pickup and destination
      if (selectedLocation) {
        const bounds = new window.google.maps.LatLngBounds()
        bounds.extend(selectedLocation)
        bounds.extend(destinationLocation)
        googleMapRef.current.fitBounds(bounds)
      }
    }
  }, [destinationLocation, selectedLocation])

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser")
      return
    }

    toast.loading("Getting your location...")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        
        if (googleMapRef.current) {
          googleMapRef.current.setCenter(location)
          googleMapRef.current.setZoom(16)
          
          // Add current location marker
          if (currentLocationMarkerRef.current) {
            currentLocationMarkerRef.current.setMap(null)
          }
          
          currentLocationMarkerRef.current = new window.google.maps.Marker({
            position: location,
            map: googleMapRef.current,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24)
            },
            title: "Your current location"
          })
        }
        
        toast.success("Location found!")
      },
      (error) => {
        console.error("Error getting location:", error)
        toast.error("Could not get your location")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  return (
    <div className="relative h-48 bg-slate-100 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto flex items-center justify-center animate-pulse">
              <Crosshair size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Loading map...</p>
              <p className="text-xs text-slate-500">Tap map to set pickup point</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Map Controls */}
      <div className="absolute top-3 right-3 space-y-2">
        <Button 
          size="sm" 
          variant="secondary" 
          className="w-8 h-8 p-0 bg-white/95 hover:bg-white shadow-md"
          onClick={getCurrentLocation}
          title="Center on current location"
        >
          <Crosshair size={14} />
        </Button>
      </div>
      
      {/* Status Indicator */}
      {isMapLoaded && (
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            {isTrackingMode ? (
              <>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-slate-700">
                  Live tracking active
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-slate-700">
                  {selectedLocation ? 'Pickup selected' : 'Tap to select pickup'}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ARMORA Premium Branded Security Transport Services with detailed information
const armoraServices = [
  {
    id: 'essential',
    name: 'Armora Essential',
    tagline: 'Professional protection, everyday value',
    description: 'Perfect for daily business needs',
    priceRange: '£45 - £75',
    eta: '3-8 min',
    icon: Car,
    capacity: '1-3 passengers',
    vehicle: 'Professional vehicle, discrete service',
    popular: true,
    recommended: true,
    detailedInfo: {
      whoItsFor: [
        'Business professionals with regular transport needs',
        'Executives attending daily meetings and appointments', 
        'Professionals requiring reliable, secure transport',
        'Anyone wanting professional service without premium cost'
      ],
      whyPeopleChoose: [
        'Most cost-effective way to get SIA-licensed security',
        'Perfect balance of professionalism and affordability',
        'Reliable service with trained security professionals',
        'Discrete protection that doesn\'t draw attention'
      ],
      whatYouGet: [
        'SIA-licensed professional security driver',
        'Unmarked vehicle for discrete transport',
        'Basic security protocols and route planning',
        'Professional communication and service',
        'Emergency response capabilities'
      ],
      idealSituations: [
        'Daily commute to office or business meetings',
        'Airport transfers and travel connections',
        'Regular business appointments and client visits',
        'Shopping trips and personal errands requiring security'
      ]
    }
  },
  {
    id: 'shadow-escort',
    name: 'Shadow Escort',
    tagline: 'Drive your own car with security backup',
    description: 'Revolutionary security concept - you drive, we follow',
    priceRange: '£120 - £180',
    eta: '5-12 min',
    icon: NavigationArrow,
    capacity: '1-4 passengers',
    vehicle: 'Your vehicle + discrete security escort',
    new: true,
    detailedInfo: {
      whoItsFor: [
        'Luxury car owners who want to drive themselves',
        'High-profile individuals who value independence',
        'Business executives with expensive personal vehicles',
        'Clients who want security backup without giving up control'
      ],
      whyPeopleChoose: [
        'Unique service - drive your own luxury vehicle safely',
        'Maintain personal freedom while having security backup',
        'Perfect for luxury shopping and social events',
        'Revolutionary concept not available elsewhere'
      ],
      whatYouGet: [
        'Professional security vehicle following 50-200m behind',
        'Real-time GPS coordination between vehicles',
        'Immediate response if any incidents occur',
        'Route coordination and traffic management',
        'Emergency backup and assistance'
      ],
      idealSituations: [
        'Luxury shopping in Mayfair and Knightsbridge',
        'Business meetings where you want to arrive in your own car',
        'Social events and evening entertainment',
        'Any situation where you want independence with security'
      ]
    }
  },
  {
    id: 'executive',
    name: 'Armora Executive',
    tagline: 'VIP protection for high-profile travel',
    description: 'Maximum security coverage',
    priceRange: '£180 - £450',
    eta: '10-20 min',
    icon: Star,
    capacity: '1-4 passengers',
    vehicle: 'Rolls-Royce, Bentley premium fleet',
    detailedInfo: {
      whoItsFor: [
        'High-profile executives and VIPs',
        'Celebrities and public figures',
        'Government officials and diplomats',
        'Ultra-high-net-worth individuals'
      ],
      whyPeopleChoose: [
        'Maximum security with luxury transport',
        'Multiple security personnel for comprehensive protection',
        'Ultra-luxury vehicles (Rolls-Royce, Bentley)',
        'Highest level of professional service available'
      ],
      whatYouGet: [
        'Multiple SIA-licensed close protection officers',
        'Ultra-luxury vehicle fleet (Rolls-Royce, Bentley)',
        'Comprehensive security planning and risk assessment',
        'Advanced security protocols and procedures',
        'Concierge-level service and attention to detail'
      ],
      idealSituations: [
        'High-profile business events and conferences',
        'VIP social events and galas',
        'Government and diplomatic functions',
        'Any situation requiring maximum security and luxury'
      ]
    }
  },
  {
    id: 'group',
    name: 'Armora Group',
    tagline: 'Secure transport for larger parties',
    description: 'Group protection specialist',
    priceRange: '£65 - £120',
    eta: '15-30 min',
    icon: Users,
    capacity: '1-6 passengers',
    vehicle: 'Mercedes E-Class, Range Rover',
    detailedInfo: {
      whoItsFor: [
        'Business teams and corporate groups',
        'Families requiring group security transport',
        'Executive teams attending events together',
        'Corporate clients with multiple passengers'
      ],
      whyPeopleChoose: [
        'Cost-effective security for multiple passengers',
        'Specialized in group coordination and logistics',
        'Professional vehicles suitable for team transport',
        'Group security planning and management'
      ],
      whatYouGet: [
        'Large capacity vehicles (Mercedes E-Class, Range Rover)',
        'Group coordination and logistics management',
        'Security planning for multiple passengers',
        'Professional team transport service',
        'Coordinated arrival and departure planning'
      ],
      idealSituations: [
        'Corporate team meetings and conferences',
        'Group airport transfers and travel',
        'Family events requiring security transport',
        'Business events with multiple executives'
      ]
    }
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

const App = () => {
  // State management
  const [currentView, setCurrentView] = useState<string>('welcome')
  const [selectedService, setSelectedService] = useState<string>('')
  const [expandedService, setExpandedService] = useState<string>('')
  
  // KV state - declare separately to avoid initialization order issues
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useKV("armora-onboarding-complete", false)
  const [isFirstLaunch, setIsFirstLaunch] = useKV("armora-first-launch", true)
  const [favorites, setFavorites] = useKV("favorite-locations", [] as any[])
  const [recentTrips, setRecentTrips] = useKV("recent-trips", [] as any[])
  const [paymentReservations, setPaymentReservations] = useKV("payment-reservations", [] as any[])
  const [currentTrip, setCurrentTrip] = useKV("current-trip", null as any)
  const [questionnaireAnswers, setQuestionnaireAnswers] = useKV("questionnaire-answers", {
    workType: [] as string[],
    travelFrequency: '',
    securityStyle: '',
    comfortLevel: '',
    locations: [] as string[],
    customRequirements: ''
  })
  
  // Form and booking state
  const [bookingForm, setBookingForm] = useState({
    pickup: '',
    destination: '',
    pickupCoords: null as { lat: number; lng: number } | null,
    destinationCoords: null as { lat: number; lng: number } | null
  })
  
  // Map and location state
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [selectedDestinationLocation, setSelectedDestinationLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  
  // Autocomplete and geocoding state
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([])
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)
  const [isGeocodingPickup, setIsGeocodingPickup] = useState(false)
  const [isGeocodingDestination, setIsGeocodingDestination] = useState(false)
  
  // Driver tracking and trip states
  const [assignedDriver, setAssignedDriver] = useState<any>(null)
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null)
  const [tripStatus, setTripStatus] = useState<'searching' | 'driver_assigned' | 'driver_arriving' | 'arrived' | 'in_progress' | 'completed'>('searching')
  const [driverTrackingInterval, setDriverTrackingInterval] = useState<NodeJS.Timeout | null>(null)
  const [driverDistance, setDriverDistance] = useState<number>(0)
  const [estimatedArrival, setEstimatedArrival] = useState<number>(0)

  // Driver chat state
  const [messages, setMessages] = useState([
    { id: 1, from: 'driver', text: 'Hello! I\'m your security driver James. I\'ll be with you in 5 minutes.', time: '2:34 PM' },
    { id: 2, from: 'driver', text: 'I\'m driving a black Mercedes S-Class. Look for license plate MB21 ABC.', time: '2:35 PM' }
  ])
  const [newMessage, setNewMessage] = useState('')

  // Notification system for driver updates
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [lastNotification, setLastNotification] = useState('')

  // Enable notifications on first interaction
  useEffect(() => {
    const enableNotifications = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        setNotificationsEnabled(permission === 'granted')
      } else if (Notification.permission === 'granted') {
        setNotificationsEnabled(true)
      }
    }
    
    // Request permissions when app loads
    enableNotifications()
  }, [])

  // Play notification sound
  const playNotificationSound = useCallback((type: 'arrival' | 'approaching' | 'assigned' = 'arrival') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Different tones for different notifications
      const frequencies = {
        assigned: [440, 550], // A4 to C#5
        approaching: [523, 659], // C5 to E5
        arrival: [659, 784, 880] // E5 to G5 to A5
      }
      
      const notes = frequencies[type]
      
      notes.forEach((freq, index) => {
        setTimeout(() => {
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        }, index * 200)
      })
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + (notes.length * 0.3))
    } catch (error) {
      console.log('Audio notification failed:', error)
    }
    
    // Vibration fallback
    if ('vibrate' in navigator) {
      const patterns = {
        assigned: [100],
        approaching: [100, 100, 100],
        arrival: [200, 100, 200, 100, 200]
      }
      navigator.vibrate(patterns[type])
    }
  }, [])

  // Send push notification
  const sendNotification = useCallback((title: string, body: string, type: 'arrival' | 'approaching' | 'assigned' = 'arrival') => {
    if (notificationsEnabled && 'Notification' in window) {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'armora-driver-update',
        requireInteraction: type === 'arrival',
        actions: type === 'arrival' ? [
          { action: 'view', title: 'View Trip' }
        ] : undefined
      })
      
      notification.onclick = () => {
        window.focus()
        setCurrentView('trip-tracking')
        notification.close()
      }
      
      setTimeout(() => notification.close(), 8000) // Auto close after 8 seconds
    }
    
    // Play sound
    playNotificationSound(type)
    
    setLastNotification(title)
  }, [notificationsEnabled, playNotificationSound])

  // Trip rating state
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')

  // Questionnaire state management
  const [questionnaireStep, setQuestionnaireStep] = useState<number>(0)

  // Initialize app flow based on user state
  useEffect(() => {
    if (hasCompletedOnboarding) {
      setCurrentView('home')
    } else {
      setCurrentView('welcome')
    }
  }, [hasCompletedOnboarding])

  // Close suggestion dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Check if click is outside pickup suggestions
      if (!target.closest('.pickup-input-container')) {
        setShowPickupSuggestions(false)
      }
      
      // Check if click is outside destination suggestions  
      if (!target.closest('.destination-input-container')) {
        setShowDestinationSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Get user's current location on app start
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log("Could not get current location:", error)
          // Default to London center
          setCurrentLocation({
            lat: 51.5074,
            lng: -0.1278
          })
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    }
  }, [])

  // Handle pickup location selection from map
  const handleLocationSelect = useCallback((location: { lat: number; lng: number; address: string }) => {
    setSelectedPickupLocation(location)
    setBookingForm(prev => ({
      ...prev,
      pickup: location.address,
      pickupCoords: { lat: location.lat, lng: location.lng }
    }))
    setShowPickupSuggestions(false)
  }, [])

  // Geocoding and Places API integration
  const geocodeAddress = useCallback(async (address: string, isDestination: boolean = false) => {
    if (!window.google?.maps || !address.trim()) return []
    
    try {
      const geocoder = new window.google.maps.Geocoder()
      const placesService = new window.google.maps.places.PlacesService(document.createElement('div'))
      
      // Use Places Autocomplete for better results
      return new Promise((resolve) => {
        const request = {
          input: address,
          location: currentLocation ? new window.google.maps.LatLng(currentLocation.lat, currentLocation.lng) : undefined,
          radius: currentLocation ? 50000 : undefined, // 50km radius
          componentRestrictions: { country: 'GB' }, // UK only
          types: ['establishment', 'geocode'] // Include businesses and addresses
        }
        
        const autocompleteService = new window.google.maps.places.AutocompleteService()
        autocompleteService.getPlacePredictions(request, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            const suggestions = predictions.slice(0, 5).map(prediction => ({
              description: prediction.description,
              place_id: prediction.place_id,
              structured_formatting: prediction.structured_formatting
            }))
            resolve(suggestions)
          } else {
            // Fallback to basic geocoding
            geocoder.geocode(
              { 
                address: address + ', UK',
                region: 'GB'
              },
              (results, status) => {
                if (status === 'OK' && results && results.length > 0) {
                  const suggestions = results.slice(0, 3).map(result => ({
                    description: result.formatted_address,
                    place_id: result.place_id,
                    geometry: result.geometry
                  }))
                  resolve(suggestions)
                } else {
                  resolve([])
                }
              }
            )
          }
        })
      })
    } catch (error) {
      console.error('Geocoding error:', error)
      return []
    }
  }, [currentLocation])

  // Get detailed place information
  const getPlaceDetails = useCallback(async (placeId: string) => {
    if (!window.google?.maps) return null
    
    try {
      return new Promise((resolve, reject) => {
        const placesService = new window.google.maps.places.PlacesService(document.createElement('div'))
        placesService.getDetails(
          {
            placeId: placeId,
            fields: ['geometry', 'formatted_address', 'name']
          },
          (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
              resolve({
                lat: place.geometry?.location?.lat(),
                lng: place.geometry?.location?.lng(),
                address: place.formatted_address || place.name,
                name: place.name
              })
            } else {
              reject(new Error('Place details not found'))
            }
          }
        )
      })
    } catch (error) {
      console.error('Place details error:', error)
      return null
    }
  }, [])

  // Handle pickup address input with autocomplete
  const handlePickupChange = useCallback(async (value: string) => {
    setBookingForm(prev => ({ ...prev, pickup: value }))
    
    if (value.length > 2) {
      setIsGeocodingPickup(true)
      setShowPickupSuggestions(true)
      const suggestions = await geocodeAddress(value, false)
      setPickupSuggestions(suggestions as any[])
      setIsGeocodingPickup(false)
    } else {
      setPickupSuggestions([])
      setShowPickupSuggestions(false)
    }
  }, [geocodeAddress])

  // Handle destination address input with autocomplete  
  const handleDestinationChange = useCallback(async (value: string) => {
    setBookingForm(prev => ({ ...prev, destination: value }))
    
    if (value.length > 2) {
      setIsGeocodingDestination(true)
      setShowDestinationSuggestions(true)
      const suggestions = await geocodeAddress(value, true)
      setDestinationSuggestions(suggestions as any[])
      setIsGeocodingDestination(false)
    } else {
      setDestinationSuggestions([])
      setShowDestinationSuggestions(false)
    }
  }, [geocodeAddress])

  // Handle suggestion selection for pickup
  const handlePickupSuggestionSelect = useCallback(async (suggestion: any) => {
    setShowPickupSuggestions(false)
    setBookingForm(prev => ({ ...prev, pickup: suggestion.description }))
    
    if (suggestion.place_id) {
      const placeDetails = await getPlaceDetails(suggestion.place_id)
      if (placeDetails) {
        setSelectedPickupLocation({
          lat: placeDetails.lat,
          lng: placeDetails.lng,
          address: placeDetails.address
        })
        setBookingForm(prev => ({
          ...prev,
          pickup: placeDetails.address,
          pickupCoords: { lat: placeDetails.lat, lng: placeDetails.lng }
        }))
        toast.success("Pickup location selected")
      }
    } else if (suggestion.geometry) {
      // Fallback for geocoded results
      const location = {
        lat: suggestion.geometry.location.lat(),
        lng: suggestion.geometry.location.lng(),
        address: suggestion.description
      }
      setSelectedPickupLocation(location)
      setBookingForm(prev => ({
        ...prev,
        pickup: location.address,
        pickupCoords: { lat: location.lat, lng: location.lng }
      }))
      toast.success("Pickup location selected")
    }
  }, [getPlaceDetails])

  // Handle suggestion selection for destination
  const handleDestinationSuggestionSelect = useCallback(async (suggestion: any) => {
    setShowDestinationSuggestions(false)
    setBookingForm(prev => ({ ...prev, destination: suggestion.description }))
    
    if (suggestion.place_id) {
      const placeDetails = await getPlaceDetails(suggestion.place_id)
      if (placeDetails) {
        setSelectedDestinationLocation({
          lat: placeDetails.lat,
          lng: placeDetails.lng,
          address: placeDetails.address
        })
        setBookingForm(prev => ({
          ...prev,
          destination: placeDetails.address,
          destinationCoords: { lat: placeDetails.lat, lng: placeDetails.lng }
        }))
        toast.success("Destination selected")
      }
    } else if (suggestion.geometry) {
      // Fallback for geocoded results
      const location = {
        lat: suggestion.geometry.location.lat(),
        lng: suggestion.geometry.location.lng(),
        address: suggestion.description
      }
      setSelectedDestinationLocation(location)
      setBookingForm(prev => ({
        ...prev,
        destination: location.address,
        destinationCoords: { lat: location.lat, lng: location.lng }
      }))
      toast.success("Destination selected")
    }
  }, [getPlaceDetails])

  // Distance calculation helper
  const calculateDistance = useCallback((point1: any, point2: any) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLng = (point2.lng - point1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c * 100) / 100
  }, [])

  // Real-time driver location tracking
  const startDriverTracking = useCallback(() => {
    if (driverTrackingInterval) {
      clearInterval(driverTrackingInterval)
    }
    
    const interval = setInterval(() => {
      setDriverLocation(currentDriverLocation => {
        if (!currentDriverLocation || !selectedPickupLocation || tripStatus === 'completed') {
          return currentDriverLocation
        }
        
        // Calculate movement towards pickup location
        const targetLat = selectedPickupLocation.lat
        const targetLng = selectedPickupLocation.lng
        
        // Move driver closer to pickup (simulate GPS updates every 5 seconds)
        const speed = 0.0003 // Approximate movement per update (roughly 30-40mph in city)
        const latDiff = targetLat - currentDriverLocation.lat
        const lngDiff = targetLng - currentDriverLocation.lng
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff)
        
        if (distance < 0.0005) { // Very close to pickup (within ~50m)
          if (tripStatus !== 'arrived') {
            setTripStatus('arrived')
            setDriverDistance(0)
            setEstimatedArrival(0)
            
            // Enhanced arrival notification
            sendNotification(
              "Your Security Driver Has Arrived!",
              `${assignedDriver?.name} is waiting at your pickup location`,
              'arrival'
            )
            
            toast.success("Your security driver has arrived!", {
              description: "Driver is waiting at pickup location",
              action: {
                label: "View",
                onClick: () => setCurrentView('trip-tracking')
              }
            })
          }
          return currentDriverLocation
        }
        
        // Calculate new position moving towards target
        const newLat = currentDriverLocation.lat + (latDiff / distance) * speed
        const newLng = currentDriverLocation.lng + (lngDiff / distance) * speed
        
        const newLocation = { lat: newLat, lng: newLng }
        
        // Update distance and ETA
        const newDistance = calculateDistance(newLocation, selectedPickupLocation)
        setDriverDistance(newDistance)
        
        // Calculate ETA based on distance (city driving speed ~20-30mph average)
        const etaMinutes = Math.max(1, Math.round(newDistance * 2.5 + Math.random() * 2))
        setEstimatedArrival(etaMinutes)
        
        // Update trip status based on distance
        if (newDistance < 0.5 && tripStatus === 'driver_assigned') { // Within 500m
          setTripStatus('driver_arriving')
          
          // Enhanced approaching notification
          sendNotification(
            "Your Security Driver is Approaching!",
            `${assignedDriver?.name} will arrive in ${etaMinutes} minute${etaMinutes > 1 ? 's' : ''}`,
            'approaching'
          )
          
          toast.success("Your security driver is approaching!", {
            description: `Arriving in ${etaMinutes} minute${etaMinutes > 1 ? 's' : ''}`,
            action: {
              label: "Track",
              onClick: () => setCurrentView('trip-tracking')
            }
          })
        }
        
        return newLocation
      })
    }, 5000) // Update every 5 seconds for real-time feel
    
    setDriverTrackingInterval(interval)
  }, [selectedPickupLocation, tripStatus, calculateDistance, sendNotification, assignedDriver])

  // Enhanced driver assignment with real-time tracking simulation
  const assignDriver = useCallback(() => {
    const randomDriver = armoraDrivers[Math.floor(Math.random() * armoraDrivers.length)]
    setAssignedDriver(randomDriver)
    setTripStatus('driver_assigned')
    
    // Simulate initial driver location (2-5km away from pickup)
    if (selectedPickupLocation) {
      const initialDriverLocation = {
        lat: selectedPickupLocation.lat + (Math.random() - 0.5) * 0.05, // ~2.5km radius
        lng: selectedPickupLocation.lng + (Math.random() - 0.5) * 0.05
      }
      setDriverLocation(initialDriverLocation)
      
      // Calculate initial distance and ETA
      const distance = calculateDistance(initialDriverLocation, selectedPickupLocation)
      setDriverDistance(distance)
      setEstimatedArrival(Math.round(distance * 2 + Math.random() * 5)) // Rough ETA in minutes
    }
    
    toast.success(`${randomDriver.name} has been assigned as your security driver!`, {
      description: `${randomDriver.vehicle} • ETA: ${randomDriver.eta} minutes`,
      action: {
        label: "Track Live",
        onClick: () => setCurrentView('trip-tracking')
      }
    })
    
    // Enhanced driver assignment notification
    sendNotification(
      "Security Driver Assigned!",
      `${randomDriver.name} is on the way in ${randomDriver.vehicle}`,
      'assigned'
    )
    
    // Start real-time location updates
    startDriverTracking()
    
  }, [selectedPickupLocation, calculateDistance, sendNotification, startDriverTracking])

  // Stop tracking when component unmounts or trip completes
  useEffect(() => {
    return () => {
      if (driverTrackingInterval) {
        clearInterval(driverTrackingInterval)
      }
    }
  }, [driverTrackingInterval])

  // Stop tracking when trip is completed
  useEffect(() => {
    if (tripStatus === 'completed' && driverTrackingInterval) {
      clearInterval(driverTrackingInterval)
      setDriverTrackingInterval(null)
    }
  }, [tripStatus, driverTrackingInterval])

  // Enhanced trip completion with tracking cleanup
  const completeTrip = useCallback(() => {
    setTripStatus('completed')
    setCurrentTrip(null)
    setAssignedDriver(null)
    setDriverLocation(null)
    setDriverDistance(0)
    setEstimatedArrival(0)
    
    // Stop real-time tracking
    if (driverTrackingInterval) {
      clearInterval(driverTrackingInterval)
      setDriverTrackingInterval(null)
    }
    
    toast.success("Trip completed successfully!", {
      description: "Please rate your security transport experience"
    })
    setCurrentView('trip-rating')
  }, [driverTrackingInterval])
  const createPaymentReservation = useCallback((serviceId: string, amount: number) => {
    const reservation = {
      id: Date.now().toString(),
      serviceId,
      amount,
      status: 'reserved',
      createdAt: new Date().toISOString(),
      type: 'service_selection'
    }
    
    setPaymentReservations(prev => [...prev, reservation])
    toast.success(`£${amount} reserved for service selection`)
    return reservation.id
  }, [setPaymentReservations])

  const cancelPaymentReservation = useCallback((reservationId: string) => {
    setPaymentReservations(prev => 
      prev.map(res => 
        res.id === reservationId 
          ? { ...res, status: 'cancelled', cancelledAt: new Date().toISOString() }
          : res
      )
    )
    
    // Charge cancellation fee
    const cancellationFee = {
      id: Date.now().toString(),
      amount: 25,
      status: 'charged',
      createdAt: new Date().toISOString(),
      type: 'cancellation_fee',
      description: 'Service cancellation fee'
    }
    
    setPaymentReservations(prev => [...prev, cancellationFee])
    toast.warning("Service cancelled. £25 cancellation fee charged.")
  }, [setPaymentReservations])

  const confirmPaymentReservation = useCallback((reservationId: string) => {
    setPaymentReservations(prev => 
      prev.map(res => 
        res.id === reservationId 
          ? { ...res, status: 'confirmed', confirmedAt: new Date().toISOString() }
          : res
      )
    )
    toast.success("Service selected! Payment confirmed.")
  }, [setPaymentReservations])

  // Dynamic pricing calculation
  const calculateServicePrice = useCallback((service: any, distance: number = 0) => {
    if (!distance || distance === 0) {
      return service.priceRange
    }

    const pricingStructure = {
      'essential': { base: 18.00, perKm: 2.15, securityFee: 2.00 },
      'professional': { base: 85.00, perKm: 18.50, securityFee: 45.00 },
      'business': { base: 95.00, perKm: 15.80, securityFee: 35.00 },
      'executive': { base: 150.00, perKm: 22.50, securityFee: 28.00 },
      'group': { base: 45.00, perKm: 8.75, securityFee: 12.00 },
      'express': { base: 28.00, perKm: 6.20, securityFee: 8.00 }
    } as const

    const pricing = pricingStructure[service.id as keyof typeof pricingStructure]
    if (!pricing) return service.priceRange

    const total = pricing.base + (distance * pricing.perKm) + pricing.securityFee
    return `£${total.toFixed(2)}`
  }, [])

  // Calculate route distance for pricing
  const routeDistance = useMemo(() => {
    if (selectedPickupLocation && selectedDestinationLocation) {
      return calculateDistance(
        { lat: selectedPickupLocation.lat, lng: selectedPickupLocation.lng },
        { lat: selectedDestinationLocation.lat, lng: selectedDestinationLocation.lng }
      )
    }
    return 0
  }, [selectedPickupLocation, selectedDestinationLocation, calculateDistance])



  // Welcome Screen
  if (currentView === 'welcome') {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <Toaster position="top-center" />
        
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-amber-400/15 to-amber-600/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="max-w-sm mx-auto text-center space-y-6 animate-in fade-in duration-1000 relative z-10">
          {/* Logo and Main Branding */}
          <div className="space-y-4">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl relative">
                <Shield size={32} className="text-slate-900" weight="fill" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 rounded-full" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 to-amber-600/20 rounded-full blur-xl animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 bg-clip-text">
                Armora Cabs 24/7
              </h1>
              <p className="text-lg text-amber-100/90 font-medium tracking-wide">
                Professional Security Transport
              </p>
              <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
                Available around the clock for your protection
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 mx-auto bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-400/30">
                  <Shield size={20} className="text-emerald-400" weight="bold" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-300">SIA Licensed</p>
                  <p className="text-[9px] text-slate-400">Government Certified</p>
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <div className="w-10 h-10 mx-auto bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-xl flex items-center justify-center border border-amber-400/30">
                  <Users size={20} className="text-amber-400" weight="fill" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-300">Professional</p>
                  <p className="text-[9px] text-slate-400">Security Drivers</p>
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <div className="w-10 h-10 mx-auto bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-400/30">
                  <Star size={20} className="text-blue-400" weight="fill" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-300">4.9★ Rating</p>
                  <p className="text-[9px] text-slate-400">Premium Service</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-amber-400/20 backdrop-blur-sm">
              <p className="text-sm text-amber-200 font-medium">
                ✨ Professional security-trained drivers
              </p>
            </div>
          </div>

          {/* Main Action Button */}
          <div className="space-y-3">
            <Button 
              onClick={() => {
                setIsFirstLaunch(false)
                setCurrentView('questionnaire')
                setQuestionnaireStep(0)
              }}
              className="w-full h-12 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold text-base rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Button>
            
            <p className="text-sm text-slate-400 font-medium">
              Professional security transport • Available 24/7
            </p>
          </div>

          {/* Bottom Trust Line */}
          <div className="pt-4 border-t border-amber-400/20">
            <p className="text-xs text-amber-300 font-bold">
              Trusted by professionals across London
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Questionnaire Flow
  if (currentView === 'questionnaire') {
    const handleQuestionnaireAnswer = (field: string, value: any) => {
      setQuestionnaireAnswers(prev => ({
        ...prev,
        [field]: value
      }))
    }

    const handleContinue = () => {
      window.scrollTo(0, 0)
      if (questionnaireStep < 5) {
        setQuestionnaireStep(prev => prev + 1)
      } else {
        // Complete questionnaire
        setHasCompletedOnboarding(true)
        setCurrentView('home')
      }
    }

    const handleBack = () => {
      window.scrollTo(0, 0)
      if (questionnaireStep > 0) {
        setQuestionnaireStep(prev => prev - 1)
      } else {
        setCurrentView('welcome')
      }
    }

    const handleSaveAndExit = () => {
      setCurrentView('welcome')
      toast.success("Progress saved. You can continue later.")
    }

    // Step 0: Work Type Selection
    if (questionnaireStep === 0) {
      const workOptions = [
        { id: 'business-leader', title: 'Business Leader', subtitle: 'CEO, manager, executive roles', perfectFor: 'Board meetings, investor presentations, strategic planning' },
        { id: 'business-owner', title: 'Business Owner', subtitle: 'Own a company, startup founder', perfectFor: 'Investor meetings, client pitches, business development' },
        { id: 'lawyer-legal', title: 'Lawyer/Legal', subtitle: 'Attorney, legal work, court cases', perfectFor: 'Court appearances, client consultations, sensitive legal meetings' },
        { id: 'doctor-medical', title: 'Doctor/Medical', subtitle: 'Healthcare, medical professional', perfectFor: 'Hospital visits, medical conferences, patient consultations' },
        { id: 'banking-finance', title: 'Banking/Finance', subtitle: 'Money, investments, financial services', perfectFor: 'Client portfolio meetings, investment presentations' },
        { id: 'tech-computer', title: 'Tech/Computer', subtitle: 'Software, IT, technology work', perfectFor: 'Client demos, tech conferences, startup meetings' },
        { id: 'real-estate', title: 'Real Estate', subtitle: 'Property, buying/selling homes/buildings', perfectFor: 'Property viewings, client meetings, market tours' },
        { id: 'sales-travel', title: 'Sales/Travel', subtitle: 'Selling, traveling for work', perfectFor: 'Client sales meetings, trade shows, territory visits' },
        { id: 'entertainment', title: 'Entertainment', subtitle: 'Artists, dancers, performers', perfectFor: 'Shows, performances, rehearsals, entertainment venues' },
        { id: 'musician', title: 'Musician', subtitle: 'Music industry professional', perfectFor: 'Concerts, studio sessions, music events, tours' },
        { id: 'celebrity', title: 'Celebrity/Public Figure', subtitle: 'High-profile public personalities', perfectFor: 'Public appearances, events, discrete travel, media activities' },
        { id: 'prefer-not-say', title: 'Prefer Not to Say', subtitle: 'Keep work information private', perfectFor: 'Any professional activities requiring discrete transport' }
      ]

      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-background/95 overflow-y-auto">
          <Toaster position="top-center" />
          
          {/* Header */}
          <div className="p-4 border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-md mx-auto">
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <div className="questionnaire-title flex-1 pr-2">
                    <h3>What kind of work do you do?</h3>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">Step 1 of 6</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Pick all that describe your work (you can choose more than one)</p>
              <div className="w-full bg-border/30 rounded-full h-1">
                <div className="bg-primary h-1 rounded-full" style={{ width: '17%' }}></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 pb-32 max-w-md mx-auto space-y-3">
            {workOptions.map(option => {
              const isSelected = questionnaireAnswers.workType.includes(option.id)
              return (
                <Card 
                  key={option.id}
                  className={`questionnaire-card cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-primary bg-gradient-to-br from-amber-50/80 to-amber-100/60 shadow-lg' 
                      : 'hover:shadow-md bg-white border border-border/40'
                  } work-type-card`}
                  onClick={() => {
                    const currentSelection = questionnaireAnswers.workType
                    if (isSelected) {
                      handleQuestionnaireAnswer('workType', currentSelection.filter(id => id !== option.id))
                    } else {
                      handleQuestionnaireAnswer('workType', [...currentSelection, option.id])
                    }
                  }}
                >
                  <div className={`checkbox-indicator ${isSelected ? 'checked' : ''}`}>
                    <div className="check-dot"></div>
                  </div>
                  <CardContent className="content-padding">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base text-foreground">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                      <p className="text-xs text-muted-foreground">Perfect for: {option.perfectFor}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* Custom Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Other work you do:</label>
              <Input
                placeholder="Describe your specific work situation..."
                className="text-sm"
                maxLength={200}
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
            <div className="max-w-md mx-auto flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleSaveAndExit}
                className="flex-1 h-12 text-sm font-medium"
              >
                Save & Exit
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={questionnaireAnswers.workType.length === 0}
                className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold text-sm"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Step 1: Travel Frequency
    if (questionnaireStep === 1) {
      const frequencyOptions = [
        { id: 'sometimes', title: 'Just Sometimes', subtitle: 'Special events and rare occasions', perfectFor: 'Important meetings, special events, airport trips' },
        { id: 'weekly', title: 'About Once a Week', subtitle: 'Regular meetings and weekly commitments', perfectFor: 'Weekly client meetings, regular business appointments' },
        { id: 'daily', title: 'Almost Every Day', subtitle: 'Daily commute and regular work transport', perfectFor: 'Daily office commute, regular work schedule' },
        { id: 'multiple', title: 'Multiple Times Daily', subtitle: 'Very busy schedule with frequent travel', perfectFor: 'Back-to-back meetings, multiple daily appointments' },
        { id: 'prefer-not-say', title: 'Prefer Not to Say', subtitle: 'Keep travel frequency private', perfectFor: 'Any transport needs requiring discrete service' }
      ]

      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-background/95 overflow-y-auto">
          <Toaster position="top-center" />
          
          {/* Header */}
          <div className="p-4 border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-md mx-auto">
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <div className="questionnaire-title flex-1 pr-2">
                    <h3>How often do you need secure transport?</h3>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">Step 2 of 6</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Pick the one that best matches your needs</p>
              <div className="w-full bg-border/30 rounded-full h-1">
                <div className="bg-primary h-1 rounded-full" style={{ width: '33%' }}></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 pb-32 max-w-md mx-auto space-y-3">
            {frequencyOptions.map(option => {
              const isSelected = questionnaireAnswers.travelFrequency === option.id
              return (
                <Card 
                  key={option.id}
                  className={`questionnaire-card cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-primary bg-gradient-to-br from-amber-50/80 to-amber-100/60 shadow-lg' 
                      : 'hover:shadow-md bg-white border border-border/40'
                  }`}
                  onClick={() => handleQuestionnaireAnswer('travelFrequency', option.id)}
                >
                  <div className={`checkbox-indicator ${isSelected ? 'checked' : ''}`}>
                    <div className="check-dot"></div>
                  </div>
                  <CardContent className="content-padding">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base text-foreground">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                      <p className="text-xs text-muted-foreground">Perfect for: {option.perfectFor}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
            <div className="max-w-md mx-auto flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="w-20 h-12 text-sm font-medium"
              >
                Back
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveAndExit}
                className="flex-1 h-12 text-sm font-medium"
              >
                Save & Exit
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={!questionnaireAnswers.travelFrequency}
                className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold text-sm"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Step 2: Security Style
    if (questionnaireStep === 2) {
      const styleOptions = [
        { id: 'quiet', title: 'Quiet & Discreet', subtitle: 'Barely noticeable, low-key protection', perfectFor: 'Daily routines, business meetings, family outings' },
        { id: 'professional', title: 'Professional & Visible', subtitle: 'Clearly there but business-like', perfectFor: 'Business meetings, corporate events, professional settings' },
        { id: 'premium', title: 'Full Premium Service', subtitle: 'Complete security with top protection', perfectFor: 'High-profile events, VIP occasions, maximum security needs' },
        { id: 'prefer-not-say', title: 'Prefer Not to Say', subtitle: 'Keep security preferences private', perfectFor: 'Any protection needs requiring discrete coordination' }
      ]

      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-background/95 overflow-y-auto">
          <Toaster position="top-center" />
          
          {/* Header */}
          <div className="p-4 border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-md mx-auto">
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <div className="questionnaire-title flex-1 pr-2">
                    <h3>How do you want your security to look?</h3>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">Step 3 of 6</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Pick the style that feels right for you</p>
              <div className="w-full bg-border/30 rounded-full h-1">
                <div className="bg-primary h-1 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 pb-32 max-w-md mx-auto space-y-3">
            {styleOptions.map(option => {
              const isSelected = questionnaireAnswers.securityStyle === option.id
              return (
                <Card 
                  key={option.id}
                  className={`questionnaire-card cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-primary bg-gradient-to-br from-amber-50/80 to-amber-100/60 shadow-lg' 
                      : 'hover:shadow-md bg-white border border-border/40'
                  }`}
                  onClick={() => handleQuestionnaireAnswer('securityStyle', option.id)}
                >
                  <div className={`checkbox-indicator ${isSelected ? 'checked' : ''}`}>
                    <div className="check-dot"></div>
                  </div>
                  <CardContent className="content-padding">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base text-foreground">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                      <p className="text-xs text-muted-foreground">Perfect for: {option.perfectFor}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
            <div className="max-w-md mx-auto flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="w-20 h-12 text-sm font-medium"
              >
                Back
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveAndExit}
                className="flex-1 h-12 text-sm font-medium"
              >
                Save & Exit
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={!questionnaireAnswers.securityStyle}
                className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold text-sm"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Step 3: Comfort Level
    if (questionnaireStep === 3) {
      const comfortOptions = [
        { id: 'minimal', title: 'Barely There', subtitle: 'Almost invisible, emergency-only', perfectFor: 'Normal daily activities, family time, casual outings' },
        { id: 'subtle', title: 'Quietly Present', subtitle: 'Professional but unobtrusive', perfectFor: 'Business meetings, professional settings, client visits' },
        { id: 'visible', title: 'Clearly Visible', subtitle: 'Obviously providing security', perfectFor: 'Public events, high-profile situations, deterrent presence' },
        { id: 'maximum', title: 'Maximum Protection', subtitle: 'Full security, very visible', perfectFor: 'High-risk situations, VIP events, maximum safety needs' },
        { id: 'prefer-not-say', title: 'Prefer Not to Say', subtitle: 'Keep comfort preferences private', perfectFor: 'Any security transport requiring discrete planning' }
      ]

      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-background/95 overflow-y-auto">
          <Toaster position="top-center" />
          
          {/* Header */}
          <div className="p-4 border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-md mx-auto">
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <div className="questionnaire-title flex-1 pr-2">
                    <h3>How much security presence feels right?</h3>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">Step 4 of 6</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Choose what feels comfortable for you</p>
              <div className="w-full bg-border/30 rounded-full h-1">
                <div className="bg-primary h-1 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 pb-32 max-w-md mx-auto space-y-3">
            {comfortOptions.map(option => {
              const isSelected = questionnaireAnswers.comfortLevel === option.id
              return (
                <Card 
                  key={option.id}
                  className={`questionnaire-card cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-primary bg-gradient-to-br from-amber-50/80 to-amber-100/60 shadow-lg' 
                      : 'hover:shadow-md bg-white border border-border/40'
                  }`}
                  onClick={() => handleQuestionnaireAnswer('comfortLevel', option.id)}
                >
                  <div className={`checkbox-indicator ${isSelected ? 'checked' : ''}`}>
                    <div className="check-dot"></div>
                  </div>
                  <CardContent className="content-padding">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base text-foreground">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                      <p className="text-xs text-muted-foreground">Perfect for: {option.perfectFor}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
            <div className="max-w-md mx-auto flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="w-20 h-12 text-sm font-medium"
              >
                Back
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveAndExit}
                className="flex-1 h-12 text-sm font-medium"
              >
                Save & Exit
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={!questionnaireAnswers.comfortLevel}
                className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold text-sm"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Step 4: Location Preferences
    if (questionnaireStep === 4) {
      const locationOptions = [
        { id: 'city-center', title: 'City Center', subtitle: 'Urban business districts, downtown areas', perfectFor: 'Business meetings, corporate events, shopping' },
        { id: 'airports', title: 'Airports & Transport', subtitle: 'Travel hubs, stations, transit security', perfectFor: 'Flight transfers, travel connections, luggage security' },
        { id: 'corporate', title: 'Corporate Events', subtitle: 'Conferences, meetings, business functions', perfectFor: 'Board meetings, presentations, networking events' },
        { id: 'social', title: 'Social Events', subtitle: 'Galas, parties, entertainment venues', perfectFor: 'Evening events, celebrations, entertainment' },
        { id: 'residential', title: 'Residential Areas', subtitle: 'Home, neighborhoods, private locations', perfectFor: 'Daily routine, family activities, personal errands' },
        { id: 'multiple', title: 'Various Locations', subtitle: 'All over London and beyond', perfectFor: 'Flexible needs, changing schedules, diverse activities' },
        { id: 'prefer-not-say', title: 'Prefer Not to Say', subtitle: 'Keep location information private', perfectFor: 'Any destinations requiring maximum discrete service' }
      ]

      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-background/95 overflow-y-auto">
          <Toaster position="top-center" />
          
          {/* Header */}
          <div className="p-4 border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-md mx-auto">
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <div className="questionnaire-title flex-1 pr-2">
                    <h3>Where do you typically need protection?</h3>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">Step 5 of 6</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Pick all areas where you need security transport</p>
              <div className="w-full bg-border/30 rounded-full h-1">
                <div className="bg-primary h-1 rounded-full" style={{ width: '83%' }}></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 pb-32 max-w-md mx-auto space-y-3">
            {locationOptions.map(option => {
              const isSelected = questionnaireAnswers.locations.includes(option.id)
              return (
                <Card 
                  key={option.id}
                  className={`questionnaire-card cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-primary bg-gradient-to-br from-amber-50/80 to-amber-100/60 shadow-lg' 
                      : 'hover:shadow-md bg-white border border-border/40'
                  }`}
                  onClick={() => {
                    const currentSelection = questionnaireAnswers.locations
                    if (isSelected) {
                      handleQuestionnaireAnswer('locations', currentSelection.filter(id => id !== option.id))
                    } else {
                      handleQuestionnaireAnswer('locations', [...currentSelection, option.id])
                    }
                  }}
                >
                  <div className={`checkbox-indicator ${isSelected ? 'checked' : ''}`}>
                    <div className="check-dot"></div>
                  </div>
                  <CardContent className="content-padding">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base text-foreground">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                      <p className="text-xs text-muted-foreground">Perfect for: {option.perfectFor}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
            <div className="max-w-md mx-auto flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="w-20 h-12 text-sm font-medium"
              >
                Back
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveAndExit}
                className="flex-1 h-12 text-sm font-medium"
              >
                Save & Exit
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={questionnaireAnswers.locations.length === 0}
                className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold text-sm"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Step 5: Custom Requirements (Final Step)
    if (questionnaireStep === 5) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-background/95 overflow-y-auto">
          <Toaster position="top-center" />
          
          {/* Header */}
          <div className="p-4 border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-md mx-auto">
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <div className="questionnaire-title flex-1 pr-2">
                    <h3>Any specific security needs?</h3>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">Step 6 of 6</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Tell us about any special requirements (optional)</p>
              <div className="w-full bg-border/30 rounded-full h-1">
                <div className="bg-primary h-1 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 pb-32 max-w-md mx-auto space-y-6">
            <Card className="border border-border/40 bg-white">
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="font-bold text-base mb-2">Custom Security Requirements</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Describe any specific security concerns, accessibility needs, or special requests
                  </p>
                  <textarea
                    value={questionnaireAnswers.customRequirements}
                    onChange={(e) => handleQuestionnaireAnswer('customRequirements', e.target.value)}
                    placeholder="e.g., Need wheelchair accessible vehicle, require discrete service for sensitive meetings, have specific time constraints..."
                    className="w-full h-32 p-3 border border-border/40 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-muted-foreground">Optional - helps us personalize your service</p>
                    <p className="text-xs text-muted-foreground">{questionnaireAnswers.customRequirements.length}/500</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-amber-200/50 bg-gradient-to-br from-amber-50/30 to-amber-100/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-amber-800 mb-1">Your Privacy Matters</h4>
                    <p className="text-xs text-amber-700">
                      All information is confidential and used only to provide better security transport service. 
                      We follow strict privacy protocols.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
            <div className="max-w-md mx-auto flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="w-20 h-12 text-sm font-medium"
              >
                Back
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveAndExit}
                className="flex-1 h-12 text-sm font-medium"
              >
                Save & Exit
              </Button>
              <Button 
                onClick={handleContinue}
                className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold text-sm"
              >
                Complete
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Completion screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 flex items-center justify-center p-4">
        <div className="max-w-sm mx-auto text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-white" weight="fill" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
            <p className="text-muted-foreground mb-6">
              Based on your responses, we recommend our Armora Essential service for your security needs.
            </p>
          </div>
          <Button 
            onClick={() => {
              setHasCompletedOnboarding(true)
              setCurrentView('home')
            }}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
          >
            Start Using Armora Cabs 24/7
          </Button>
        </div>
      </div>
    )
  }

  // Service Selection View
  if (currentView === 'service-selection') {
    const serviceOptions = [
      { 
        id: 'essential', 
        title: 'Armora Essential', 
        subtitle: 'Professional protection, everyday value', 
        description: 'Perfect for: Daily commutes, business meetings, airport transfers. SIA-licensed driver, unmarked vehicle, basic security protocols.',
        priceRange: '£45 - £75',
        recommended: true
      },
      { 
        id: 'shadow-escort', 
        title: 'Shadow Escort', 
        subtitle: 'Drive your own car with security backup', 
        description: 'Perfect for: Luxury shopping, social events, business meetings. You drive your vehicle while security follows discretely behind.',
        priceRange: '£120 - £180',
        new: true
      },
      { 
        id: 'executive', 
        title: 'Armora Executive', 
        subtitle: 'VIP protection for high-profile travel', 
        description: 'Perfect for: High-profile events, maximum security needs. Multiple personnel, luxury vehicles, comprehensive protection coverage.',
        priceRange: '£180 - £450'
      },
      { 
        id: 'group', 
        title: 'Armora Group', 
        subtitle: 'Secure transport for larger parties', 
        description: 'Perfect for: Team travel, corporate events, group transport. Large security vehicles, group coordination, team protection.',
        priceRange: '£65 - £120'
      }
    ]

    // Set default selection to Essential if none selected
    if (!selectedService) {
      setSelectedService('essential')
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 overflow-y-auto">
        <Toaster position="top-center" />
        
        {/* Header */}
        <div className="p-4 border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <div className="questionnaire-title flex-1 pr-2">
                  <h3>Choose Your Security Service</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  onClick={() => setCurrentView('home')}
                >
                  <X size={12} />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Select the service level that matches your needs</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-32 max-w-md mx-auto space-y-3">
          {serviceOptions.map(option => {
            const isSelected = selectedService === option.id
            return (
              <Card 
                key={option.id}
                className={`questionnaire-card cursor-pointer transition-all duration-200 relative ${
                  isSelected 
                    ? 'ring-2 ring-primary bg-gradient-to-br from-amber-50/80 to-amber-100/60 shadow-lg' 
                    : 'hover:shadow-md bg-white border border-border/40'
                }`}
                onClick={() => setSelectedService(option.id)}
              >
                {option.recommended && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full z-5">
                    Recommended
                  </div>
                )}
                {option.new && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-5">
                    NEW
                  </div>
                )}
                <div className={`checkbox-indicator ${isSelected ? 'checked' : ''}`}>
                  <div className="check-dot"></div>
                </div>
                <CardContent className="content-padding">
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-foreground">{option.title}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{option.subtitle}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{option.description}</p>
                    <p className="text-sm font-bold text-primary">{option.priceRange}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
          <div className="max-w-md mx-auto flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('home')}
              className="w-20 h-12 text-sm font-medium"
            >
              Back
            </Button>
            <Button 
              onClick={() => {
                setCurrentView('home')
                const selectedServiceName = serviceOptions.find(s => s.id === selectedService)?.title || 'service'
                toast.success(`${selectedServiceName} selected! Enter your locations to continue.`)
              }}
              disabled={!selectedService}
              className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold text-sm"
            >
              Continue with {serviceOptions.find(s => s.id === selectedService)?.title || 'Service'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Home/Booking View
  if (currentView === 'home') {
    // Check if locations are entered for pricing display
    const hasLocations = Boolean(selectedPickupLocation && selectedDestinationLocation)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 flex flex-col no-overflow">
        <Toaster position="top-center" />
        
        {/* Header */}
        <header className="bg-background/98 backdrop-blur-sm border-b border-border/30 p-3 sticky top-0 z-10 no-overflow">
          <div className="content-wrapper">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                  <Car size={12} className="text-slate-900" weight="bold" />
                </div>
                <div>
                  <h1 className="text-base font-bold responsive-text">Armora Cabs 24/7</h1>
                  <p className="text-[10px] text-muted-foreground responsive-text">Professional security cab service</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-6 h-6 rounded-full"
                onClick={() => setCurrentView('welcome')}
              >
                <User size={12} />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 professional-spacing space-y-4 pb-24 no-overflow">
          <div className="content-wrapper space-y-4">
            {/* Google Maps Section */}
            <Card className="border-0 shadow-sm bg-card overflow-hidden">
              <GoogleMapComponent
                currentLocation={currentLocation}
                selectedLocation={selectedPickupLocation ? { lat: selectedPickupLocation.lat, lng: selectedPickupLocation.lng } : undefined}
                destinationLocation={selectedDestinationLocation ? { lat: selectedDestinationLocation.lat, lng: selectedDestinationLocation.lng } : undefined}
                onLocationSelect={handleLocationSelect}
              />
            </Card>

            {/* Location Input */}
            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-3 space-y-2">
                <div className="space-y-1.5 relative">
                  <div className="relative pickup-input-container">
                    <Input
                      value={bookingForm.pickup}
                      onChange={(e) => handlePickupChange(e.target.value)}
                      onFocus={() => {
                        if (pickupSuggestions.length > 0) {
                          setShowPickupSuggestions(true)
                        }
                      }}
                      placeholder="Pickup location (or tap map above)"
                      className="pl-6 h-8 border-0 bg-muted/50 focus:bg-background text-xs w-full"
                    />
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                    {isGeocodingPickup && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    
                    {/* Pickup Suggestions Dropdown */}
                    {showPickupSuggestions && pickupSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-border/50 rounded-lg shadow-lg z-50 mt-1 max-h-40 overflow-y-auto">
                        {pickupSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handlePickupSuggestionSelect(suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-muted/50 border-b border-border/30 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-muted-foreground flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {suggestion.structured_formatting?.main_text || suggestion.description.split(',')[0]}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {suggestion.structured_formatting?.secondary_text || suggestion.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="relative destination-input-container">
                    <Input
                      value={bookingForm.destination}
                      onChange={(e) => handleDestinationChange(e.target.value)}
                      onFocus={() => {
                        if (destinationSuggestions.length > 0) {
                          setShowDestinationSuggestions(true)
                        }
                      }}
                      placeholder="Where to?"
                      className="pl-6 h-8 border-0 bg-muted/50 focus:bg-background text-xs w-full"
                    />
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
                    {isGeocodingDestination && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    
                    {/* Destination Suggestions Dropdown */}
                    {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-border/50 rounded-lg shadow-lg z-50 mt-1 max-h-40 overflow-y-auto">
                        {destinationSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleDestinationSuggestionSelect(suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-muted/50 border-b border-border/30 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-muted-foreground flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {suggestion.structured_formatting?.main_text || suggestion.description.split(',')[0]}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {suggestion.structured_formatting?.secondary_text || suggestion.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Quick Location Buttons */}
                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-7 px-2 flex-shrink-0"
                    onClick={() => {
                      if (currentLocation) {
                        // Use reverse geocoding to get address for current location
                        if (window.google?.maps) {
                          const geocoder = new window.google.maps.Geocoder()
                          geocoder.geocode(
                            { location: currentLocation },
                            (results, status) => {
                              if (status === 'OK' && results && results[0]) {
                                const address = results[0].formatted_address
                                setBookingForm(prev => ({ 
                                  ...prev, 
                                  pickup: address,
                                  pickupCoords: currentLocation 
                                }))
                                setSelectedPickupLocation({
                                  lat: currentLocation.lat,
                                  lng: currentLocation.lng,
                                  address: address
                                })
                                toast.success("Using current location as pickup")
                              }
                            }
                          )
                        } else {
                          setBookingForm(prev => ({ 
                            ...prev, 
                            pickup: "Current location",
                            pickupCoords: currentLocation 
                          }))
                          toast.success("Using current location as pickup")
                        }
                      } else {
                        toast.error("Current location not available")
                      }
                    }}
                  >
                    <Crosshair size={12} className="mr-1" />
                    Use Current
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-7 px-2 flex-shrink-0"
                    onClick={() => {
                      handleDestinationChange("Heathrow Airport")
                    }}
                  >
                    ✈️ Airport
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-7 px-2 flex-shrink-0"
                    onClick={() => {
                      handleDestinationChange("London King's Cross")
                    }}
                  >
                    🚂 King's Cross
                  </Button>
                </div>
              </CardContent>
            </Card>

          {/* Current Service Selection */}
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-base text-foreground">Choose Your Service</h3>
                
                <div className="space-y-3">
                  {armoraServices.map(service => {
                    const isSelected = selectedService === service.id
                    const isExpanded = expandedService === service.id
                    const IconComponent = service.icon
                    
                    // Show callout price if no locations, otherwise show route-based or original price
                    const displayPrice = hasLocations 
                      ? calculateServicePrice(service, routeDistance) 
                      : "£50 minimum"
                    
                    return (
                      <div key={service.id} className="space-y-0">
                        <Card 
                          className={`cursor-pointer transition-all duration-200 relative overflow-hidden ${
                            isSelected 
                              ? 'ring-2 ring-primary bg-gradient-to-br from-amber-50/80 to-amber-100/60 shadow-lg' 
                              : 'hover:shadow-md bg-white border border-border/40'
                          }`}
                          onClick={() => {
                            setSelectedService(service.id)
                            // Toggle expansion when clicking on the card
                            if (isExpanded) {
                              setExpandedService('')
                            } else {
                              setExpandedService(service.id)
                            }
                          }}
                        >
                          {service.popular && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full z-10">
                              Popular
                            </div>
                          )}
                          {service.new && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                              NEW
                            </div>
                          )}
                          <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 ${
                            isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/50'
                          } flex items-center justify-center`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                          </div>
                          <CardContent className="p-4 pt-8">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <IconComponent size={20} className="text-primary flex-shrink-0" />
                                <h4 className="font-bold text-base text-foreground">{service.name}</h4>
                                <div className={`ml-auto transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180' : 'rotate-0'
                                }`}>
                                  <NavigationArrow size={16} className="text-muted-foreground" />
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{service.tagline}</p>
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold text-primary">{displayPrice}</p>
                                  {!hasLocations && (
                                    <p className="text-xs text-amber-600 font-medium">Callout charge</p>
                                  )}
                                  <p className="text-xs text-muted-foreground">{service.eta} • {service.capacity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">{service.vehicle}</p>
                                </div>
                              </div>
                              <div className="pt-1">
                                <p className="text-xs text-primary/70 font-medium">Tap for detailed information ↓</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Expanded Information Panel */}
                        {isExpanded && (
                          <>
                            <Card className="border-t-0 bg-gradient-to-br from-amber-50/30 to-amber-100/20 border border-amber-200/50 rounded-t-none animate-in slide-in-from-top-2 duration-300">
                              <CardContent className="p-4 space-y-4">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-bold text-sm text-amber-800 mb-2 flex items-center gap-2">
                                      <Users size={14} className="text-amber-600" />
                                      Who is this service for?
                                    </h4>
                                    <ul className="space-y-1">
                                      {service.detailedInfo.whoItsFor.map((item, index) => (
                                        <li key={index} className="text-xs text-amber-700 flex items-start gap-2">
                                          <div className="w-1 h-1 bg-amber-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <h4 className="font-bold text-sm text-amber-800 mb-2 flex items-center gap-2">
                                      <Star size={14} className="text-amber-600" />
                                      Why people choose this service
                                    </h4>
                                    <ul className="space-y-1">
                                      {service.detailedInfo.whyPeopleChoose.map((item, index) => (
                                        <li key={index} className="text-xs text-amber-700 flex items-start gap-2">
                                          <div className="w-1 h-1 bg-amber-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <h4 className="font-bold text-sm text-amber-800 mb-2 flex items-center gap-2">
                                      <Shield size={14} className="text-amber-600" />
                                      What you get
                                    </h4>
                                    <ul className="space-y-1">
                                      {service.detailedInfo.whatYouGet.map((item, index) => (
                                        <li key={index} className="text-xs text-amber-700 flex items-start gap-2">
                                          <div className="w-1 h-1 bg-amber-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <h4 className="font-bold text-sm text-amber-800 mb-2 flex items-center gap-2">
                                      <MapPin size={14} className="text-amber-600" />
                                      Ideal situations
                                    </h4>
                                    <ul className="space-y-1">
                                      {service.detailedInfo.idealSituations.map((item, index) => (
                                        <li key={index} className="text-xs text-amber-700 flex items-start gap-2">
                                          <div className="w-1 h-1 bg-amber-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* CTA Buttons - Directly Above Bottom Navigation */}
                            <div className="fixed bottom-12 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-3 z-40">
                              <div className="max-w-md mx-auto flex gap-3">
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setExpandedService('')
                                    // If there's an active reservation for this service, cancel it
                                    const activeReservation = paymentReservations.find(
                                      res => res.serviceId === service.id && res.status === 'reserved'
                                    )
                                    if (activeReservation) {
                                      cancelPaymentReservation(activeReservation.id)
                                    }
                                  }}
                                  className="flex-1 h-12 text-sm font-medium border-2 border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={() => {
                                    // Create payment reservation
                                    const reservationId = createPaymentReservation(service.id, 50)
                                    
                                    // Set as selected service
                                    setSelectedService(service.id)
                                    setExpandedService('')
                                    
                                    // Confirm the reservation
                                    setTimeout(() => {
                                      confirmPaymentReservation(reservationId)
                                    }, 500)
                                  }}
                                  className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold text-sm"
                                >
                                  Select {
                                    service.id === 'shadow-escort' ? 'Escort' :
                                    service.id === 'essential' ? 'Essential' :
                                    service.id === 'executive' ? 'Executive' :
                                    service.id === 'group' ? 'Group' :
                                    'Service'
                                  }
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Book Button */}
          <Button 
            onClick={() => {
              if (!selectedPickupLocation || !selectedDestinationLocation || !selectedService) {
                toast.error("Please enter pickup, destination and select a service")
                return
              }
              
              // Check if there's already a confirmed reservation
              const confirmedReservation = paymentReservations.find(
                res => res.serviceId === selectedService && res.status === 'confirmed'
              )
              
              if (!confirmedReservation) {
                toast.error("Please select a service to continue")
                return
              }
              
              const selectedServiceName = armoraServices.find(s => s.id === selectedService)?.name || 'service'
              toast.success(`Booking confirmed! Your ${selectedServiceName} driver will be assigned shortly.`)
              
              // Add to recent trips
              const newTrip = {
                id: Date.now().toString(),
                service: selectedServiceName,
                pickup: selectedPickupLocation.address,
                destination: selectedDestinationLocation.address,
                date: new Date().toISOString(),
                status: 'confirmed',
                driverId: null
              }
              setRecentTrips(prev => [newTrip, ...prev])
              setCurrentTrip(newTrip)
              
              // Assign driver and start tracking
              setTimeout(() => {
                assignDriver()
                setCurrentView('trip-tracking')
              }, 1500)
            }}
            className="w-full h-10 bg-gradient-to-r from-black to-black/90 hover:from-black/90 hover:to-black/80 text-white font-semibold text-sm rounded-xl shadow-lg disabled:opacity-50"
            disabled={!selectedPickupLocation || !selectedDestinationLocation || !selectedService || !paymentReservations.find(res => res.serviceId === selectedService && res.status === 'confirmed')}
          >
            {!selectedPickupLocation || !selectedDestinationLocation ? 
              'Enter locations' :
              !selectedService ? 
              'Select service' :
              !paymentReservations.find(res => res.serviceId === selectedService && res.status === 'confirmed') ?
              'Please select a service above' :
              `Book ${armoraServices.find(s => s.id === selectedService)?.name || 'Security Cab'}`
            }
          </Button>
        </div>

        {/* Bottom Navigation - Always Visible */}
        <div className="bottom-navigation bg-background/95 backdrop-blur-sm border-t border-border/50 z-30">
          <div className="bottom-nav-container">
            <div className="grid grid-cols-5 h-12">
              <button
                onClick={() => setCurrentView('home')}
                className="flex flex-col items-center justify-center gap-0.5 text-amber-600 transition-colors"
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
                onClick={() => setCurrentView('welcome')}
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
      </div>
    )
  }

  return null
}

export default App