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
    PaymentRequest?: any
    ApplePaySession?: any
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
  
  // Payment methods and processing state
  const [paymentMethods, setPaymentMethods] = useKV("payment-methods", [] as any[])
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useKV("default-payment-method", null as any)
  const [billingAddress, setBillingAddress] = useKV("billing-address", null as any)
  const [paymentHistory, setPaymentHistory] = useKV("payment-history", [] as any[])
  
  // Digital wallet support
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false)
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false)
  
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

  // Check for digital wallet availability
  useEffect(() => {
    // Check for Apple Pay availability
    if (window.PaymentRequest && window.ApplePaySession) {
      const applePayMethod = {
        supportedMethods: 'https://apple.com/apple-pay',
        data: {
          version: 3,
          merchantIdentifier: 'merchant.com.armora.cabs',
          merchantCapabilities: ['supports3DS'],
          supportedNetworks: ['visa', 'masterCard', 'amex'],
          countryCode: 'GB'
        }
      }
      
      try {
        const paymentRequest = new PaymentRequest([applePayMethod], {
          total: { label: 'Test', amount: { currency: 'GBP', value: '1.00' } }
        })
        
        paymentRequest.canMakePayment().then(result => {
          setIsApplePayAvailable(!!result)
        }).catch(() => {
          setIsApplePayAvailable(false)
        })
      } catch (error) {
        setIsApplePayAvailable(false)
      }
    }

    // Check for Google Pay availability
    if (window.PaymentRequest) {
      const googlePayMethod = {
        supportedMethods: 'https://google.com/pay',
        data: {
          environment: 'TEST', // Change to 'PRODUCTION' for live
          apiVersion: 2,
          apiVersionMinor: 0,
          merchantInfo: {
            merchantName: 'Armora Cabs 24/7',
            merchantId: '12345678901234567890'
          },
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX']
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'stripe',
                gatewayMerchantId: 'armora_merchant_id'
              }
            }
          }]
        }
      }
      
      try {
        const paymentRequest = new PaymentRequest([googlePayMethod], {
          total: { label: 'Test', amount: { currency: 'GBP', value: '1.00' } }
        })
        
        paymentRequest.canMakePayment().then(result => {
          setIsGooglePayAvailable(!!result)
        }).catch(() => {
          setIsGooglePayAvailable(false)
        })
      } catch (error) {
        setIsGooglePayAvailable(false)
      }
    }
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

  // Receipt system state
  const [currentReceipt, setCurrentReceipt] = useState<any>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [receipts, setReceipts] = useKV("trip-receipts", [] as any[])

  // Payment processing state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [newCardForm, setNewCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingPostcode: ''
  })
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentErrors, setPaymentErrors] = useState<{[key: string]: string}>({})

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

  // Detailed Receipt Modal Component
  const ReceiptModal = () => {
    if (!showReceiptModal || !currentReceipt) return null

    const receipt = currentReceipt
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[95vh] overflow-y-auto">
          {/* Receipt Header */}
          <div className="p-6 border-b border-border/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Trip Receipt</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowReceiptModal(false)}
                className="w-8 h-8 rounded-full p-0"
              >
                <X size={16} />
              </Button>
            </div>
            
            {/* Company Information */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <Shield size={20} className="text-slate-900" weight="fill" />
              </div>
              <h3 className="font-bold text-lg">{receipt.company.name}</h3>
              <div className="text-sm text-muted-foreground">
                <p>{receipt.company.address}</p>
                <p>{receipt.company.city}</p>
                <p>VAT: {receipt.company.vatNumber}</p>
              </div>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="p-6 space-y-6">
            {/* Receipt Information */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Receipt Number:</span>
                <span className="text-sm font-bold">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Issue Date:</span>
                <span className="text-sm">{new Date(receipt.issueDate).toLocaleDateString('en-GB')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Booking Reference:</span>
                <span className="text-sm font-mono">{receipt.trip.bookingReference}</span>
              </div>
            </div>

            <div className="border-t border-border/30 pt-4">
              <h4 className="font-semibold mb-3 text-amber-700">Journey Details</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">{receipt.trip.service}</p>
                  <p className="text-xs text-muted-foreground">{receipt.trip.serviceDescription}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">{receipt.trip.tripDate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <p className="font-medium">{receipt.trip.tripTime}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground">From:</span>
                      <p className="text-sm font-medium break-words">{receipt.trip.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground">To:</span>
                      <p className="text-sm font-medium break-words">{receipt.trip.destinationLocation}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Distance:</span>
                    <p className="font-medium">{receipt.trip.distance}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{receipt.trip.actualDuration}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver & Vehicle Information */}
            <div className="border-t border-border/30 pt-4">
              <h4 className="font-semibold mb-3 text-amber-700">Security Driver</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{receipt.driver.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">License:</span>
                  <span className="font-mono text-xs">{receipt.driver.licenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle:</span>
                  <span className="font-medium">{receipt.driver.vehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plate:</span>
                  <span className="font-mono">{receipt.driver.licensePlate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-500 fill-current" />
                    <span className="font-medium">{receipt.driver.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Billing */}
            <div className="border-t border-border/30 pt-4">
              <h4 className="font-semibold mb-3 text-amber-700">Billing Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Fare:</span>
                  <span>£{receipt.billing.baseFare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Distance ({receipt.trip.distance}):</span>
                  <span>£{receipt.billing.distanceFare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Service Fee:</span>
                  <span>£{receipt.billing.securityFee.toFixed(2)}</span>
                </div>
                {receipt.billing.surcharges.amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-xs">{receipt.billing.surcharges.description}:</span>
                    <span>£{receipt.billing.surcharges.amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-border/20 pt-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">£{receipt.billing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT ({(receipt.billing.vat.rate * 100).toFixed(0)}%):</span>
                    <span>£{receipt.billing.vat.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border/20">
                    <span>Total:</span>
                    <span>£{receipt.billing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="border-t border-border/30 pt-4">
              <h4 className="font-semibold mb-3 text-amber-700">Payment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-medium">{receipt.payment.method} •••• {receipt.payment.cardLast4}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-xs">{receipt.payment.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auth Code:</span>
                  <span className="font-mono text-xs">{receipt.payment.authCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className="bg-green-100 text-green-800">{receipt.payment.status}</Badge>
                </div>
              </div>
            </div>

            {/* Security & Compliance */}
            <div className="border-t border-border/30 pt-4">
              <h4 className="font-semibold mb-3 text-amber-700">Security Compliance</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>✓ {receipt.security.driverBackgroundCheck}</p>
                <p>✓ {receipt.security.insuranceCover}</p>
                <p>✓ {receipt.security.vehicleInspection}</p>
                <p>✓ {receipt.security.complianceStandard}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border/30 pt-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Thank you for choosing Armora Cabs 24/7
              </p>
              <p className="text-xs text-muted-foreground">
                Professional Security Transport • Available 24/7
              </p>
              <p className="text-xs text-muted-foreground">
                {receipt.company.phone} • {receipt.company.email}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-border/30 space-y-3">
            <Button 
              onClick={() => {
                // Simulate email receipt
                toast.success("Receipt emailed to your registered address")
              }}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
            >
              Email Receipt
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                onClick={() => {
                  // Simulate download
                  toast.success("Receipt downloaded as PDF")
                }}
                className="h-10"
              >
                Download PDF
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  // Copy receipt link
                  navigator.clipboard.writeText(`https://armoracabs.co.uk/receipt/${receipt.receiptNumber}`)
                  toast.success("Receipt link copied")
                }}
                className="h-10"
              >
                Share Link
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Payment Modal Component
  const PaymentModal = () => {
    if (!showPaymentModal) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Payment Methods</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full p-0"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Digital Wallet Options */}
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-sm text-muted-foreground">Quick Payment</h3>
              
              <div className="grid gap-3">
                {/* Apple Pay Button */}
                {isApplePayAvailable && (
                  <Button
                    onClick={async () => {
                      const success = await processApplePayPayment(50, "Armora Service Selection")
                      if (success) {
                        setShowPaymentModal(false)
                        toast.success("Apple Pay payment successful!")
                      }
                    }}
                    disabled={isProcessingPayment}
                    className="w-full h-12 bg-black hover:bg-black/90 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                      <span className="text-black text-xs font-bold">🍎</span>
                    </div>
                    Pay with Apple Pay
                  </Button>
                )}

                {/* Google Pay Button */}
                {isGooglePayAvailable && (
                  <Button
                    onClick={async () => {
                      const success = await processGooglePayPayment(50, "Armora Service Selection")
                      if (success) {
                        setShowPaymentModal(false)
                        toast.success("Google Pay payment successful!")
                      }
                    }}
                    disabled={isProcessingPayment}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">G</span>
                    </div>
                    Pay with Google Pay
                  </Button>
                )}

                {/* Show message if no digital wallets available */}
                {!isApplePayAvailable && !isGooglePayAvailable && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700 text-center">
                      Digital wallets not available on this device
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Existing Payment Methods */}
            {paymentMethods.length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-sm text-muted-foreground">Saved Payment Methods</h3>
                {paymentMethods.map(method => (
                  <Card 
                    key={method.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedPaymentMethod === method.id
                        ? 'ring-2 ring-primary bg-gradient-to-br from-amber-50/80 to-amber-100/60'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-8 rounded-md flex items-center justify-center ${
                            method.type === 'apple-pay' ? 'bg-black' :
                            method.type === 'google-pay' ? 'bg-blue-600' :
                            'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}>
                            {method.type === 'apple-pay' ? (
                              <span className="text-white text-xs">🍎</span>
                            ) : method.type === 'google-pay' ? (
                              <span className="text-white text-xs font-bold">G</span>
                            ) : (
                              <CreditCard size={16} className="text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {method.type === 'apple-pay' ? 'Apple Pay' :
                               method.type === 'google-pay' ? 'Google Pay' :
                               `${method.cardType.toUpperCase()} •••• ${method.last4}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {method.type === 'apple-pay' || method.type === 'google-pay' ? 
                                'Digital Wallet' :
                                `${method.nameOnCard} • Expires ${method.expiryMonth}/${method.expiryYear}`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            selectedPaymentMethod === method.id 
                              ? 'border-primary bg-primary' 
                              : 'border-muted-foreground/50'
                          } flex items-center justify-center`}>
                            {selectedPaymentMethod === method.id && (
                              <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Add New Card Form */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Add New Card</h3>
              
              <div className="space-y-3">
                <div>
                  <Input
                    placeholder="Card number"
                    value={newCardForm.cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value)
                      setNewCardForm(prev => ({ ...prev, cardNumber: formatted }))
                      if (paymentErrors.cardNumber) {
                        setPaymentErrors(prev => ({ ...prev, cardNumber: '' }))
                      }
                    }}
                    className={`${paymentErrors.cardNumber ? 'border-red-500' : ''}`}
                    maxLength={19}
                  />
                  {paymentErrors.cardNumber && (
                    <p className="text-xs text-red-500 mt-1">{paymentErrors.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      placeholder="MM/YY"
                      value={newCardForm.expiryDate}
                      onChange={(e) => {
                        const formatted = formatExpiryDate(e.target.value)
                        setNewCardForm(prev => ({ ...prev, expiryDate: formatted }))
                        if (paymentErrors.expiryDate) {
                          setPaymentErrors(prev => ({ ...prev, expiryDate: '' }))
                        }
                      }}
                      className={`${paymentErrors.expiryDate ? 'border-red-500' : ''}`}
                      maxLength={5}
                    />
                    {paymentErrors.expiryDate && (
                      <p className="text-xs text-red-500 mt-1">{paymentErrors.expiryDate}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      placeholder="CVV"
                      value={newCardForm.cvv}
                      onChange={(e) => {
                        const cvv = e.target.value.replace(/\D/g, '').substr(0, 4)
                        setNewCardForm(prev => ({ ...prev, cvv }))
                        if (paymentErrors.cvv) {
                          setPaymentErrors(prev => ({ ...prev, cvv: '' }))
                        }
                      }}
                      className={`${paymentErrors.cvv ? 'border-red-500' : ''}`}
                      maxLength={4}
                    />
                    {paymentErrors.cvv && (
                      <p className="text-xs text-red-500 mt-1">{paymentErrors.cvv}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Input
                    placeholder="Name on card"
                    value={newCardForm.nameOnCard}
                    onChange={(e) => {
                      setNewCardForm(prev => ({ ...prev, nameOnCard: e.target.value }))
                      if (paymentErrors.nameOnCard) {
                        setPaymentErrors(prev => ({ ...prev, nameOnCard: '' }))
                      }
                    }}
                    className={`${paymentErrors.nameOnCard ? 'border-red-500' : ''}`}
                  />
                  {paymentErrors.nameOnCard && (
                    <p className="text-xs text-red-500 mt-1">{paymentErrors.nameOnCard}</p>
                  )}
                </div>

                <div>
                  <Input
                    placeholder="Billing postcode"
                    value={newCardForm.billingPostcode}
                    onChange={(e) => {
                      setNewCardForm(prev => ({ ...prev, billingPostcode: e.target.value.toUpperCase() }))
                      if (paymentErrors.billingPostcode) {
                        setPaymentErrors(prev => ({ ...prev, billingPostcode: '' }))
                      }
                    }}
                    className={`${paymentErrors.billingPostcode ? 'border-red-500' : ''}`}
                    maxLength={8}
                  />
                  {paymentErrors.billingPostcode && (
                    <p className="text-xs text-red-500 mt-1">{paymentErrors.billingPostcode}</p>
                  )}
                </div>
              </div>

              {/* Security Message */}
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-green-800">Secure Payment</p>
                    <p className="text-xs text-green-700">
                      Your card details are encrypted and securely processed. We never store your full card number.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1"
                  disabled={isProcessingPayment}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    if (selectedPaymentMethod || await addPaymentMethod()) {
                      setShowPaymentModal(false)
                      toast.success("Payment method selected")
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
                  disabled={isProcessingPayment || (!selectedPaymentMethod && !newCardForm.cardNumber)}
                >
                  {isProcessingPayment ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    selectedPaymentMethod ? 'Use Selected Method' : 'Add & Use Card'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

  // Generate comprehensive trip receipt
  const generateTripReceipt = useCallback((tripData: any, paymentData: any, driverData: any) => {
    const receiptId = `ARM-${Date.now().toString().slice(-8).toUpperCase()}`
    const journeyDate = new Date()
    const vatRate = 0.20 // UK VAT rate of 20%
    
    // Calculate journey distance and time
    const distance = routeDistance || 5.2 // Use calculated or default
    const estimatedDuration = Math.round(distance * 3.5) // Rough time estimate
    
    // Calculate detailed pricing breakdown
    const serviceData = armoraServices.find(s => s.id === selectedService)
    const baseFare = 18.00
    const distanceFare = distance * 2.45
    const securityFee = serviceData?.id === 'essential' ? 8.50 : 
                       serviceData?.id === 'shadow-escort' ? 45.00 :
                       serviceData?.id === 'executive' ? 85.00 : 25.00
    const timeOfDayMultiplier = new Date().getHours() >= 22 || new Date().getHours() <= 6 ? 1.25 : 1.0
    const surchargeAmount = timeOfDayMultiplier > 1 ? (baseFare + distanceFare) * 0.25 : 0
    
    const subtotal = baseFare + distanceFare + securityFee + surchargeAmount
    const vatAmount = subtotal * vatRate
    const totalAmount = subtotal + vatAmount
    
    const receipt = {
      id: receiptId,
      receiptNumber: receiptId,
      issueDate: journeyDate.toISOString(),
      
      // Company Information
      company: {
        name: "Armora Cabs 24/7 Limited",
        address: "25 Victoria Street, Westminster",
        city: "London SW1H 0EX",
        phone: "+44 20 7946 0958",
        email: "receipts@armoracabs.co.uk",
        website: "www.armoracabs.co.uk",
        vatNumber: "GB 123 4567 89",
        companyNumber: "12345678"
      },
      
      // Trip Details
      trip: {
        service: serviceData?.name || 'Armora Essential',
        serviceDescription: serviceData?.tagline || 'Professional security transport',
        bookingReference: `BK${Date.now().toString().slice(-6)}`,
        tripDate: journeyDate.toLocaleDateString('en-GB', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        }),
        tripTime: journeyDate.toLocaleTimeString('en-GB', { 
          hour: '2-digit', minute: '2-digit' 
        }),
        pickupLocation: selectedPickupLocation?.address || tripData.pickup,
        destinationLocation: selectedDestinationLocation?.address || tripData.destination,
        distance: `${distance.toFixed(1)} miles`,
        estimatedDuration: `${estimatedDuration} minutes`,
        actualDuration: `${estimatedDuration + Math.floor(Math.random() * 10 - 5)} minutes`
      },
      
      // Driver & Vehicle Information
      driver: {
        name: driverData.name,
        licenseNumber: `SIA-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        driverId: driverData.id,
        vehicle: driverData.vehicle,
        licensePlate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        rating: driverData.rating,
        completedTrips: driverData.completedTrips
      },
      
      // Detailed Billing Breakdown
      billing: {
        baseFare: baseFare,
        distanceFare: distanceFare,
        securityFee: securityFee,
        surcharges: {
          timeOfDay: surchargeAmount > 0 ? surchargeAmount : 0,
          description: surchargeAmount > 0 ? "Night surcharge (22:00-06:00)" : null
        },
        subtotal: subtotal,
        vat: {
          rate: vatRate,
          amount: vatAmount
        },
        total: totalAmount,
        currency: "GBP"
      },
      
      // Payment Information
      payment: {
        method: paymentData.method || 'Card',
        cardLast4: paymentData.cardLast4 || '****',
        transactionId: `TXN${Date.now().toString().slice(-10)}`,
        paymentDate: journeyDate.toISOString(),
        status: 'Completed',
        authCode: Math.random().toString(36).substr(2, 8).toUpperCase()
      },
      
      // Security & Compliance
      security: {
        driverBackgroundCheck: "Enhanced DBS Cleared",
        insuranceCover: "£5,000,000 Public Liability",
        vehicleInspection: "Valid MOT & Insurance",
        complianceStandard: "BS 7858:2019 Certified"
      },
      
      // Customer Information (Optional for privacy)
      customer: {
        bookingAccount: "Personal Account",
        loyaltyMember: false,
        corporateAccount: false
      },
      
      // Additional Information
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0",
        type: "Security Transport Receipt",
        vatIncluded: true,
        currency: "GBP",
        region: "United Kingdom"
      }
    }
    
    return receipt
  }, [selectedService, selectedPickupLocation, selectedDestinationLocation, routeDistance, armoraServices])

  // Enhanced trip completion with receipt generation
  const completeTrip = useCallback(() => {
    if (!assignedDriver || !currentTrip) return
    
    // Generate comprehensive receipt
    const receipt = generateTripReceipt(
      currentTrip,
      { method: 'Card', cardLast4: '4567' }, // This would come from actual payment data
      assignedDriver
    )
    
    // Save receipt to storage
    setReceipts(prev => [receipt, ...prev])
    setCurrentReceipt(receipt)
    
    // Update trip with receipt reference
    const updatedTrip = {
      ...currentTrip,
      status: 'completed',
      receiptId: receipt.id,
      completedAt: new Date().toISOString()
    }
    
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
    
    // Update recent trips with receipt reference
    setRecentTrips(prev => prev.map(trip => 
      trip.id === currentTrip.id ? updatedTrip : trip
    ))
    
    toast.success("Trip completed! Receipt generated", {
      description: `Receipt #${receipt.receiptNumber}`,
      action: {
        label: "View Receipt",
        onClick: () => setShowReceiptModal(true)
      }
    })
    
    setCurrentView('trip-rating')
  }, [driverTrackingInterval, currentTrip, assignedDriver, generateTripReceipt, setReceipts, setRecentTrips])
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

  // Enhanced payment processing functions
  const validateCardNumber = (cardNumber: string): boolean => {
    // Remove spaces and hyphens
    const cleanNumber = cardNumber.replace(/[\s-]/g, '')
    
    // Check if it's all digits and proper length
    if (!/^\d{13,19}$/.test(cleanNumber)) return false
    
    // Luhn algorithm validation
    let sum = 0
    let isEven = false
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i])
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      isEven = !isEven
    }
    return sum % 10 === 0
  }

  const validateExpiryDate = (expiry: string): boolean => {
    const [month, year] = expiry.split('/')
    if (!month || !year) return false
    
    const monthNum = parseInt(month)
    const yearNum = parseInt('20' + year)
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    
    if (monthNum < 1 || monthNum > 12) return false
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) return false
    
    return true
  }

  const validateCVV = (cvv: string, cardNumber: string): boolean => {
    // American Express has 4-digit CVV, others have 3
    const isAmex = cardNumber.replace(/[\s-]/g, '').startsWith('34') || cardNumber.replace(/[\s-]/g, '').startsWith('37')
    return isAmex ? /^\d{4}$/.test(cvv) : /^\d{3}$/.test(cvv)
  }

  const getCardType = (cardNumber: string): string => {
    const number = cardNumber.replace(/[\s-]/g, '')
    if (/^4/.test(number)) return 'visa'
    if (/^5[1-5]/.test(number)) return 'mastercard'
    if (/^3[47]/.test(number)) return 'amex'
    if (/^6/.test(number)) return 'discover'
    return 'unknown'
  }

  const formatCardNumber = (value: string): string => {
    const number = value.replace(/[\s-]/g, '')
    const groups = number.match(/.{1,4}/g) || []
    return groups.join(' ').substr(0, 19) // Max 16 digits + 3 spaces
  }

  const formatExpiryDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2)
    }
    return cleaned
  }

  const validatePaymentForm = (): boolean => {
    const errors: {[key: string]: string} = {}
    
    if (!newCardForm.cardNumber || !validateCardNumber(newCardForm.cardNumber)) {
      errors.cardNumber = 'Please enter a valid card number'
    }
    
    if (!newCardForm.expiryDate || !validateExpiryDate(newCardForm.expiryDate)) {
      errors.expiryDate = 'Please enter a valid expiry date'
    }
    
    if (!newCardForm.cvv || !validateCVV(newCardForm.cvv, newCardForm.cardNumber)) {
      errors.cvv = 'Please enter a valid CVV'
    }
    
    if (!newCardForm.nameOnCard.trim()) {
      errors.nameOnCard = 'Please enter the name on the card'
    }
    
    if (!newCardForm.billingPostcode.trim()) {
      errors.billingPostcode = 'Please enter your billing postcode'
    }
    
    setPaymentErrors(errors)
    return Object.keys(errors).length === 0
  }

  const processPayment = useCallback(async (amount: number, description: string): Promise<boolean> => {
    setIsProcessingPayment(true)
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate payment success/failure (95% success rate)
      const isSuccess = Math.random() > 0.05
      
      if (isSuccess) {
        const payment = {
          id: Date.now().toString(),
          amount,
          description,
          status: 'completed',
          paymentMethod: selectedPaymentMethod || 'new-card',
          createdAt: new Date().toISOString(),
          cardLast4: newCardForm.cardNumber.slice(-4) || '****'
        }
        
        setPaymentHistory(prev => [payment, ...prev])
        
        toast.success(`Payment of £${amount.toFixed(2)} processed successfully`)
        return true
      } else {
        toast.error("Payment failed. Please try again or use a different card.")
        return false
      }
    } catch (error) {
      toast.error("Payment processing error. Please try again.")
      return false
    } finally {
      setIsProcessingPayment(false)
    }
  }, [selectedPaymentMethod, newCardForm.cardNumber, setPaymentHistory])

  const addPaymentMethod = useCallback(async () => {
    if (!validatePaymentForm()) return false
    
    setIsProcessingPayment(true)
    
    try {
      // Simulate card tokenization
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newPaymentMethod = {
        id: Date.now().toString(),
        type: 'card',
        cardType: getCardType(newCardForm.cardNumber),
        last4: newCardForm.cardNumber.replace(/[\s-]/g, '').slice(-4),
        expiryMonth: newCardForm.expiryDate.split('/')[0],
        expiryYear: '20' + newCardForm.expiryDate.split('/')[1],
        nameOnCard: newCardForm.nameOnCard,
        billingPostcode: newCardForm.billingPostcode,
        isDefault: paymentMethods.length === 0,
        createdAt: new Date().toISOString()
      }
      
      setPaymentMethods(prev => [...prev, newPaymentMethod])
      
      if (newPaymentMethod.isDefault) {
        setDefaultPaymentMethod(newPaymentMethod.id)
      }
      
      // Clear form
      setNewCardForm({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: '',
        billingPostcode: ''
      })
      setPaymentErrors({})
      
      toast.success("Payment method added successfully")
      return true
    } catch (error) {
      toast.error("Failed to add payment method. Please try again.")
      return false
    } finally {
      setIsProcessingPayment(false)
    }
  }, [newCardForm, paymentMethods.length, setPaymentMethods, setDefaultPaymentMethod])

  // Apple Pay payment processing
  const processApplePayPayment = useCallback(async (amount: number, description: string): Promise<boolean> => {
    if (!isApplePayAvailable) {
      toast.error("Apple Pay is not available on this device")
      return false
    }

    setIsProcessingPayment(true)
    
    try {
      const paymentRequest = {
        countryCode: 'GB',
        currencyCode: 'GBP',
        supportedNetworks: ['visa', 'masterCard', 'amex'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: description,
          amount: amount.toFixed(2)
        }
      }

      // @ts-ignore - Apple Pay Session
      const session = new ApplePaySession(3, paymentRequest)
      
      return new Promise((resolve) => {
        session.onvalidatemerchant = (event: any) => {
          // In production, validate with your payment processor
          session.completeMerchantValidation({})
        }

        session.onpaymentauthorized = (event: any) => {
          // Process the payment token with your payment processor
          const payment = {
            id: Date.now().toString(),
            amount,
            description,
            status: 'completed',
            paymentMethod: 'apple-pay',
            createdAt: new Date().toISOString(),
            cardLast4: '****' // Apple Pay doesn't expose card details
          }
          
          setPaymentHistory(prev => [payment, ...prev])
          
          // Add Apple Pay as a payment method if not already added
          const existingApplePay = paymentMethods.find(method => method.type === 'apple-pay')
          if (!existingApplePay) {
            const applePayMethod = {
              id: 'apple-pay-' + Date.now(),
              type: 'apple-pay',
              cardType: 'apple-pay',
              last4: '****',
              nameOnCard: 'Apple Pay',
              isDefault: paymentMethods.length === 0,
              createdAt: new Date().toISOString()
            }
            setPaymentMethods(prev => [...prev, applePayMethod])
          }
          
          session.completePayment(ApplePaySession.STATUS_SUCCESS)
          toast.success(`Apple Pay payment of £${amount.toFixed(2)} processed successfully`)
          resolve(true)
        }

        session.oncancel = () => {
          toast.info("Apple Pay payment cancelled")
          resolve(false)
        }

        session.begin()
      })
    } catch (error) {
      toast.error("Apple Pay payment failed. Please try again.")
      return false
    } finally {
      setIsProcessingPayment(false)
    }
  }, [isApplePayAvailable, paymentMethods, setPaymentHistory, setPaymentMethods])

  // Google Pay payment processing
  const processGooglePayPayment = useCallback(async (amount: number, description: string): Promise<boolean> => {
    if (!isGooglePayAvailable) {
      toast.error("Google Pay is not available on this device")
      return false
    }

    setIsProcessingPayment(true)
    
    try {
      const googlePayMethod = {
        supportedMethods: 'https://google.com/pay',
        data: {
          environment: 'TEST', // Change to 'PRODUCTION' for live
          apiVersion: 2,
          apiVersionMinor: 0,
          merchantInfo: {
            merchantName: 'Armora Cabs 24/7',
            merchantId: '12345678901234567890'
          },
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX']
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'stripe',
                gatewayMerchantId: 'armora_merchant_id'
              }
            }
          }]
        }
      }

      const paymentDetails = {
        total: {
          label: description,
          amount: {
            currency: 'GBP',
            value: amount.toFixed(2)
          }
        }
      }

      const paymentRequest = new PaymentRequest([googlePayMethod], paymentDetails)
      
      const paymentResponse = await paymentRequest.show()
      
      // Process the payment with your payment processor
      const payment = {
        id: Date.now().toString(),
        amount,
        description,
        status: 'completed',
        paymentMethod: 'google-pay',
        createdAt: new Date().toISOString(),
        cardLast4: '****' // Google Pay may provide masked PAN
      }
      
      setPaymentHistory(prev => [payment, ...prev])
      
      // Add Google Pay as a payment method if not already added
      const existingGooglePay = paymentMethods.find(method => method.type === 'google-pay')
      if (!existingGooglePay) {
        const googlePayMethod = {
          id: 'google-pay-' + Date.now(),
          type: 'google-pay',
          cardType: 'google-pay',
          last4: '****',
          nameOnCard: 'Google Pay',
          isDefault: paymentMethods.length === 0,
          createdAt: new Date().toISOString()
        }
        setPaymentMethods(prev => [...prev, googlePayMethod])
      }
      
      await paymentResponse.complete('success')
      toast.success(`Google Pay payment of £${amount.toFixed(2)} processed successfully`)
      return true
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.info("Google Pay payment cancelled")
      } else {
        toast.error("Google Pay payment failed. Please try again.")
      }
      return false
    } finally {
      setIsProcessingPayment(false)
    }
  }, [isGooglePayAvailable, paymentMethods, setPaymentHistory, setPaymentMethods])

  const removePaymentMethod = useCallback((methodId: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== methodId))
    
    if (defaultPaymentMethod === methodId) {
      const remainingMethods = paymentMethods.filter(method => method.id !== methodId)
      setDefaultPaymentMethod(remainingMethods.length > 0 ? remainingMethods[0].id : null)
    }
    
    toast.success("Payment method removed")
  }, [paymentMethods, defaultPaymentMethod, setPaymentMethods, setDefaultPaymentMethod])

  const setDefaultMethod = useCallback((methodId: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    )
    setDefaultPaymentMethod(methodId)
    toast.success("Default payment method updated")
  }, [setPaymentMethods, setDefaultPaymentMethod])

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
                                    // Check if user has payment method
                                    if (paymentMethods.length === 0 && !defaultPaymentMethod) {
                                      setShowPaymentModal(true)
                                      toast.info("Please add a payment method to continue")
                                      return
                                    }
                                    
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
            onClick={async () => {
              if (!selectedPickupLocation || !selectedDestinationLocation || !selectedService) {
                toast.error("Please enter pickup, destination and select a service")
                return
              }
              
              // Check if user has payment method or digital wallet available
              if (paymentMethods.length === 0 && !defaultPaymentMethod && !isApplePayAvailable && !isGooglePayAvailable) {
                setShowPaymentModal(true)
                toast.info("Please add a payment method to complete booking")
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
              
              // Calculate final trip cost
              const selectedServiceData = armoraServices.find(s => s.id === selectedService)
              const finalAmount = routeDistance > 0 
                ? parseFloat(calculateServicePrice(selectedServiceData!, routeDistance).replace('£', ''))
                : 50 // Minimum callout charge
              
              let paymentSuccess = false
              
              // Try digital wallets first if available and no saved methods
              if (paymentMethods.length === 0 && (isApplePayAvailable || isGooglePayAvailable)) {
                if (isApplePayAvailable) {
                  paymentSuccess = await processApplePayPayment(
                    finalAmount, 
                    `${selectedServiceData?.name} - ${selectedPickupLocation.address} to ${selectedDestinationLocation.address}`
                  )
                } else if (isGooglePayAvailable) {
                  paymentSuccess = await processGooglePayPayment(
                    finalAmount, 
                    `${selectedServiceData?.name} - ${selectedPickupLocation.address} to ${selectedDestinationLocation.address}`
                  )
                }
              } else {
                // Use regular payment processing
                paymentSuccess = await processPayment(
                  finalAmount, 
                  `${selectedServiceData?.name} - ${selectedPickupLocation.address} to ${selectedDestinationLocation.address}`
                )
              }
              
              if (!paymentSuccess) {
                return // Payment failed, don't proceed
              }
              
              const selectedServiceName = selectedServiceData?.name || 'service'
              toast.success(`Booking confirmed! Your ${selectedServiceName} driver will be assigned shortly.`)
              
              // Add to recent trips
              const newTrip = {
                id: Date.now().toString(),
                service: selectedServiceName,
                pickup: selectedPickupLocation.address,
                destination: selectedDestinationLocation.address,
                date: new Date().toISOString(),
                status: 'confirmed',
                driverId: null,
                amount: finalAmount
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
            disabled={!selectedPickupLocation || !selectedDestinationLocation || !selectedService || isProcessingPayment}
          >
            {isProcessingPayment ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing payment...
              </div>
            ) : (
              !selectedPickupLocation || !selectedDestinationLocation ? 
                'Enter locations' :
                !selectedService ? 
                'Select service' :
                paymentMethods.length === 0 && !isApplePayAvailable && !isGooglePayAvailable ?
                'Add payment method' :
                `Book ${armoraServices.find(s => s.id === selectedService)?.name || 'Security Cab'}`
            )}
          </Button>
          </div>
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

        <PaymentModal />
        <ReceiptModal />
      </div>
    )
  }

  // Payment Methods Management View
  if (currentView === 'payment-methods') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        {/* Header */}
        <header className="bg-background/98 backdrop-blur-sm border-b border-border/30 p-4 sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('account')}
                className="w-8 h-8 rounded-full p-0"
              >
                <ArrowLeft size={16} />
              </Button>
              <div>
                <h1 className="text-lg font-bold">Payment Methods</h1>
                <p className="text-xs text-muted-foreground">Manage your cards and billing</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 pb-24 max-w-md mx-auto space-y-6">
          {/* Payment Methods List */}
          {paymentMethods.length > 0 ? (
            <div className="space-y-4">
              <h2 className="font-semibold text-sm text-muted-foreground">Your Payment Methods</h2>
              {paymentMethods.map(method => (
                <Card key={method.id} className="border border-border/40">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-8 rounded-md flex items-center justify-center ${
                          method.type === 'apple-pay' ? 'bg-black' :
                          method.type === 'google-pay' ? 'bg-blue-600' :
                          'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}>
                          {method.type === 'apple-pay' ? (
                            <span className="text-white text-xs">🍎</span>
                          ) : method.type === 'google-pay' ? (
                            <span className="text-white text-xs font-bold">G</span>
                          ) : (
                            <CreditCard size={16} className="text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {method.type === 'apple-pay' ? 'Apple Pay' :
                             method.type === 'google-pay' ? 'Google Pay' :
                             `${method.cardType.toUpperCase()} •••• ${method.last4}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {method.type === 'apple-pay' || method.type === 'google-pay' ? 
                              'Digital Wallet' :
                              method.nameOnCard
                            }
                          </p>
                          {method.type !== 'apple-pay' && method.type !== 'google-pay' && (
                            <p className="text-xs text-muted-foreground">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {method.isDefault && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                        <div className="flex gap-1">
                          {!method.isDefault && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setDefaultMethod(method.id)}
                              className="text-xs h-7 px-2"
                            >
                              Set Default
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => removePaymentMethod(method.id)}
                            className="text-xs h-7 px-2"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-border/40">
              <CardContent className="p-6 text-center">
                <CreditCard size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Payment Methods</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add a payment method to book security transport services
                </p>
              </CardContent>
            </Card>
          )}

          {/* Add New Payment Method Button */}
          <Button 
            onClick={() => setShowPaymentModal(true)}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
          >
            <Plus size={16} className="mr-2" />
            Add Payment Method
          </Button>

          {/* Recent Receipts */}
          {receipts.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-sm text-muted-foreground">Recent Receipts</h2>
              {receipts.slice(0, 5).map(receipt => (
                <Card 
                  key={receipt.id} 
                  className="border border-border/40 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setCurrentReceipt(receipt)
                    setShowReceiptModal(true)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{receipt.trip.service}</p>
                        <p className="text-xs text-muted-foreground">
                          Receipt #{receipt.receiptNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(receipt.issueDate).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">£{receipt.billing.total.toFixed(2)}</p>
                        <Badge variant="secondary" className="text-xs">
                          {receipt.payment.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Payment History */}
          {paymentHistory.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-sm text-muted-foreground">Recent Payments</h2>
              {paymentHistory.slice(0, 5).map(payment => (
                <Card key={payment.id} className="border border-border/40">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{payment.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString('en-GB')} • 
                          Card ending {payment.cardLast4}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">£{payment.amount.toFixed(2)}</p>
                        <Badge variant="secondary" className="text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <PaymentModal />
        <ReceiptModal />
      </div>
    )
  }

  // Activity/Trip History View
  if (currentView === 'activity') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        {/* Header */}
        <header className="bg-background/98 backdrop-blur-sm border-b border-border/30 p-4 sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('home')}
                className="w-8 h-8 rounded-full p-0"
              >
                <ArrowLeft size={16} />
              </Button>
              <div>
                <h1 className="text-lg font-bold">Trip Activity</h1>
                <p className="text-xs text-muted-foreground">Your recent security transport history</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 pb-24 max-w-md mx-auto space-y-6">
          {/* Current Trip */}
          {currentTrip && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm text-muted-foreground">Current Trip</h2>
              <Card className="border border-amber-200 bg-gradient-to-br from-amber-50/50 to-amber-100/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-base">{currentTrip.service}</h3>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-muted-foreground">From:</span>
                      <span className="font-medium">{currentTrip.pickup}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-medium">{currentTrip.destination}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setCurrentView('trip-tracking')}
                    className="w-full mt-3 h-10 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
                  >
                    Track Live
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Trips */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground">Recent Trips ({recentTrips.length})</h2>
            
            {recentTrips.length > 0 ? (
              <div className="space-y-3">
                {recentTrips.slice(0, 10).map(trip => (
                  <Card key={trip.id} className="border border-border/40">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{trip.service}</h3>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {new Date(trip.date).toLocaleDateString('en-GB')}
                          </p>
                          <p className="text-sm font-bold text-green-600">£{trip.amount?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <span className="text-muted-foreground truncate">{trip.pickup}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-muted-foreground truncate">{trip.destination}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="secondary" className="text-xs">
                          {trip.status}
                        </Badge>
                        <div className="flex gap-2">
                          {trip.receiptId && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs h-7"
                              onClick={() => {
                                const receipt = receipts.find(r => r.id === trip.receiptId)
                                if (receipt) {
                                  setCurrentReceipt(receipt)
                                  setShowReceiptModal(true)
                                } else {
                                  toast.error("Receipt not found")
                                }
                              }}
                            >
                              View Receipt
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            Book Again
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-border/40">
                <CardContent className="p-8 text-center">
                  <List size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No trips yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Book your first security transport to see trip history here
                  </p>
                  <Button 
                    onClick={() => setCurrentView('home')}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
                  >
                    Book Your First Trip
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-navigation bg-background/95 backdrop-blur-sm border-t border-border/50 z-30">
          <div className="bottom-nav-container">
            <div className="grid grid-cols-5 h-12">
              <button
                onClick={() => setCurrentView('home')}
                className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <House size={16} />
                </div>
                <span className="text-[10px]">Home</span>
              </button>
              
              <button
                onClick={() => setCurrentView('activity')}
                className="flex flex-col items-center justify-center gap-0.5 text-amber-600 transition-colors"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <List size={16} weight="fill" />
                </div>
                <span className="text-[10px] font-semibold">Activity</span>
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

  // Favorites/Saved Locations View
  if (currentView === 'favorites') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        {/* Header */}
        <header className="bg-background/98 backdrop-blur-sm border-b border-border/30 p-4 sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('home')}
                className="w-8 h-8 rounded-full p-0"
              >
                <ArrowLeft size={16} />
              </Button>
              <div>
                <h1 className="text-lg font-bold">Saved Locations</h1>
                <p className="text-xs text-muted-foreground">Your favorite destinations and pickup spots</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 pb-24 max-w-md mx-auto space-y-6">
          {/* Saved Locations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-muted-foreground">Saved Locations ({favorites.length})</h2>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  // Add current location as favorite
                  if (selectedPickupLocation) {
                    const newFavorite = {
                      id: Date.now().toString(),
                      name: 'Recent Location',
                      address: selectedPickupLocation.address,
                      coordinates: selectedPickupLocation,
                      type: 'custom',
                      addedAt: new Date().toISOString()
                    }
                    setFavorites(prev => [newFavorite, ...prev])
                    toast.success("Location added to favorites")
                  } else {
                    toast.error("No location selected to save")
                  }
                }}
                className="text-xs h-7"
              >
                <Plus size={12} className="mr-1" />
                Add
              </Button>
            </div>
            
            {favorites.length > 0 ? (
              <div className="space-y-3">
                {favorites.map(favorite => (
                  <Card key={favorite.id} className="border border-border/40">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {favorite.type === 'home' ? <House size={20} className="text-amber-600" /> :
                             favorite.type === 'work' ? <User size={20} className="text-amber-600" /> :
                             <MapPin size={20} className="text-amber-600" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm truncate">{favorite.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">{favorite.address}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Use as pickup location
                              setSelectedPickupLocation(favorite.coordinates)
                              setBookingForm(prev => ({
                                ...prev,
                                pickup: favorite.address,
                                pickupCoords: favorite.coordinates
                              }))
                              setCurrentView('home')
                              toast.success("Set as pickup location")
                            }}
                            className="text-xs h-7"
                          >
                            Use
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              setFavorites(prev => prev.filter(f => f.id !== favorite.id))
                              toast.success("Location removed from favorites")
                            }}
                            className="text-xs h-7 w-7 p-0"
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-border/40">
                <CardContent className="p-8 text-center">
                  <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No saved locations</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Save your frequently visited places for quick booking
                  </p>
                  <Button 
                    onClick={() => setCurrentView('home')}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
                  >
                    Add Your First Location
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Add Presets */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground">Quick Add</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => {
                  const homeFavorite = {
                    id: 'home-' + Date.now(),
                    name: 'Home',
                    address: 'Add your home address',
                    coordinates: { lat: 0, lng: 0, address: 'Add your home address' },
                    type: 'home',
                    addedAt: new Date().toISOString()
                  }
                  setFavorites(prev => [homeFavorite, ...prev])
                  toast.success("Home added - tap to set address")
                }}
              >
                <House size={24} className="text-muted-foreground" />
                <span className="text-xs">Add Home</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => {
                  const workFavorite = {
                    id: 'work-' + Date.now(),
                    name: 'Work',
                    address: 'Add your work address',
                    coordinates: { lat: 0, lng: 0, address: 'Add your work address' },
                    type: 'work',
                    addedAt: new Date().toISOString()
                  }
                  setFavorites(prev => [workFavorite, ...prev])
                  toast.success("Work added - tap to set address")
                }}
              >
                <User size={24} className="text-muted-foreground" />
                <span className="text-xs">Add Work</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-navigation bg-background/95 backdrop-blur-sm border-t border-border/50 z-30">
          <div className="bottom-nav-container">
            <div className="grid grid-cols-5 h-12">
              <button
                onClick={() => setCurrentView('home')}
                className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <House size={16} />
                </div>
                <span className="text-[10px]">Home</span>
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
                className="flex flex-col items-center justify-center gap-0.5 text-amber-600 transition-colors"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <Heart size={16} weight="fill" />
                </div>
                <span className="text-[10px] font-semibold">Saved</span>
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

  // Trip Tracking View
  if (currentView === 'trip-tracking') {
    if (!assignedDriver || !currentTrip) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-background/95 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <Car size={32} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">No Active Trip</h2>
              <p className="text-muted-foreground mb-4">Book a security transport to track your driver</p>
              <Button 
                onClick={() => setCurrentView('home')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
              >
                Book a Trip
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        {/* Header */}
        <header className="bg-background/98 backdrop-blur-sm border-b border-border/30 p-4 sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('home')}
                className="w-8 h-8 rounded-full p-0"
              >
                <ArrowLeft size={16} />
              </Button>
              <div className="flex-1">
                <h1 className="text-lg font-bold">Live Tracking</h1>
                <p className="text-xs text-muted-foreground">Your security driver is on the way</p>
              </div>
              {/* Notification Bell */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 rounded-full p-0 relative"
                onClick={() => {
                  if (notificationsEnabled) {
                    toast.info("Notifications are enabled")
                  } else {
                    toast.info("Enable notifications for driver updates")
                  }
                }}
              >
                {notificationsEnabled ? <BellRinging size={16} className="text-amber-600" /> : <Bell size={16} />}
                {lastNotification && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 pb-24 max-w-md mx-auto space-y-4">
          {/* Trip Status Card */}
          <Card className="border border-amber-200 bg-gradient-to-br from-amber-50/50 to-amber-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base">{currentTrip.service}</h3>
                <Badge className={`${
                  tripStatus === 'arrived' ? 'bg-green-100 text-green-800' :
                  tripStatus === 'driver_arriving' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {tripStatus === 'arrived' ? 'Driver Arrived' :
                   tripStatus === 'driver_arriving' ? 'Approaching' :
                   tripStatus === 'driver_assigned' ? 'On the Way' : 'Searching'}
                </Badge>
              </div>
              
              {/* Driver ETA */}
              {estimatedArrival > 0 && tripStatus !== 'arrived' && (
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-amber-600" />
                  <span className="text-sm font-medium">
                    Arriving in {estimatedArrival} minute{estimatedArrival > 1 ? 's' : ''}
                  </span>
                  {driverDistance > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({driverDistance.toFixed(1)} km away)
                    </span>
                  )}
                </div>
              )}

              {/* Trip Route */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-medium truncate">{currentTrip.pickup}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-medium truncate">{currentTrip.destination}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Map */}
          <Card className="border-0 shadow-sm bg-card overflow-hidden">
            <GoogleMapComponent
              currentLocation={currentLocation}
              selectedLocation={selectedPickupLocation ? { lat: selectedPickupLocation.lat, lng: selectedPickupLocation.lng } : undefined}
              destinationLocation={selectedDestinationLocation ? { lat: selectedDestinationLocation.lat, lng: selectedDestinationLocation.lng } : undefined}
              driverLocation={driverLocation || undefined}
              onLocationSelect={() => {}} // Disabled during tracking
              isTrackingMode={true}
            />
          </Card>

          {/* Driver Information */}
          {assignedDriver && (
            <Card className="border border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                    <img 
                      src={assignedDriver.photo} 
                      alt={assignedDriver.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">{assignedDriver.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star size={14} className="text-amber-500 fill-current" />
                      <span>{assignedDriver.rating}</span>
                      <span>•</span>
                      <span>{assignedDriver.completedTrips} trips</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{assignedDriver.vehicle}</p>
                    <p className="text-xs font-medium text-green-600">{assignedDriver.license}</p>
                  </div>
                </div>
                
                {/* Communication Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentView('driver-chat')}
                    className="flex items-center gap-2"
                  >
                    <ChatCircle size={16} />
                    Message
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      toast.success("Calling your security driver...")
                      // In real app, this would initiate a call
                    }}
                    className="flex items-center gap-2"
                  >
                    <Phone size={16} />
                    Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trip Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                toast.info("Emergency features coming soon")
              }}
              className="h-12 flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              <Warning size={16} />
              Emergency
            </Button>
            <Button 
              onClick={() => {
                if (tripStatus === 'arrived') {
                  completeTrip()
                } else {
                  toast.info("Trip will complete when you reach your destination")
                }
              }}
              className="h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
              disabled={tripStatus !== 'arrived'}
            >
              {tripStatus === 'arrived' ? 'Complete Trip' : 'In Progress'}
            </Button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-navigation bg-background/95 backdrop-blur-sm border-t border-border/50 z-30">
          <div className="bottom-nav-container">
            <div className="grid grid-cols-5 h-12">
              <button
                onClick={() => setCurrentView('home')}
                className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <House size={16} />
                </div>
                <span className="text-[10px]">Home</span>
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

  // Driver Chat View
  if (currentView === 'driver-chat') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 flex flex-col">
        <Toaster position="top-center" />
        
        {/* Header */}
        <header className="bg-background/98 backdrop-blur-sm border-b border-border/30 p-4 sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('trip-tracking')}
                className="w-8 h-8 rounded-full p-0"
              >
                <ArrowLeft size={16} />
              </Button>
              {assignedDriver && (
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    <img 
                      src={assignedDriver.photo} 
                      alt={assignedDriver.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-base font-bold">{assignedDriver.name}</h1>
                    <p className="text-xs text-muted-foreground">Security Driver • SIA Licensed</p>
                  </div>
                </div>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 rounded-full p-0"
                onClick={() => {
                  toast.success("Calling your security driver...")
                }}
              >
                <Phone size={16} />
              </Button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 p-4 pb-20 max-w-md mx-auto w-full space-y-4 overflow-y-auto">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.from === 'driver' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-[75%] p-3 rounded-2xl ${
                message.from === 'driver' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.from === 'driver' ? 'text-gray-500' : 'text-slate-700'
                }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-background/95 backdrop-blur-sm border-t border-border/50 p-4 sticky bottom-0">
          <div className="max-w-md mx-auto">
            <div className="flex gap-3 items-center">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newMessage.trim()) {
                    const message = {
                      id: Date.now(),
                      from: 'user',
                      text: newMessage.trim(),
                      time: new Date().toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                    }
                    setMessages(prev => [...prev, message])
                    setNewMessage('')
                    
                    // Simulate driver response
                    setTimeout(() => {
                      const responses = [
                        "Understood, I'll be there shortly.",
                        "Thank you for the update.",
                        "I can see you on my GPS. Almost there!",
                        "Please wait near the entrance.",
                        "I'm the black Mercedes, just arriving now."
                      ]
                      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
                      const driverMessage = {
                        id: Date.now() + 1,
                        from: 'driver',
                        text: randomResponse,
                        time: new Date().toLocaleTimeString('en-GB', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      }
                      setMessages(prev => [...prev, driverMessage])
                    }, 1000 + Math.random() * 2000)
                  }
                }}
              />
              <Button 
                onClick={() => {
                  if (newMessage.trim()) {
                    const message = {
                      id: Date.now(),
                      from: 'user',
                      text: newMessage.trim(),
                      time: new Date().toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                    }
                    setMessages(prev => [...prev, message])
                    setNewMessage('')
                  }
                }}
                disabled={!newMessage.trim()}
                className="w-10 h-10 p-0 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900"
              >
                <PaperPlaneTilt size={16} weight="fill" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Trip Rating View
  if (currentView === 'trip-rating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 flex items-center justify-center p-4">
        <div className="max-w-sm mx-auto text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-white" weight="fill" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">Trip Completed!</h2>
            <p className="text-muted-foreground mb-6">
              How was your security transport experience?
            </p>
          </div>

          {/* Rating Stars */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
                  star <= rating 
                    ? 'bg-amber-100 text-amber-600 scale-110' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                <Star size={20} weight={star <= rating ? 'fill' : 'regular'} />
              </button>
            ))}
          </div>

          {/* Feedback */}
          <div className="text-left space-y-3">
            <label className="text-sm font-medium">Additional Feedback (Optional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full h-24 p-3 border border-border/40 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right">{feedback.length}/300</p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={() => {
                if (rating === 0) {
                  toast.error("Please rate your experience")
                  return
                }
                
                // Save rating and feedback
                toast.success("Thank you for your feedback!", {
                  description: "Your receipt is ready",
                  action: {
                    label: "View Receipt",
                    onClick: () => setShowReceiptModal(true)
                  }
                })
                
                // Reset trip state
                setRating(0)
                setFeedback('')
                setCurrentView('home')
              }}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
              disabled={rating === 0}
            >
              Submit Rating
            </Button>
            
            {currentReceipt && (
              <Button 
                variant="outline"
                onClick={() => setShowReceiptModal(true)}
                className="w-full h-12"
              >
                View Trip Receipt
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => setCurrentView('home')}
              className="w-full h-12"
            >
              Skip Rating
            </Button>
          </div>
        </div>
        
        <ReceiptModal />
      </div>
    )
  }

  // Receipts Management View
  if (currentView === 'receipts') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        {/* Header */}
        <header className="bg-background/98 backdrop-blur-sm border-b border-border/30 p-4 sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('account')}
                className="w-8 h-8 rounded-full p-0"
              >
                <ArrowLeft size={16} />
              </Button>
              <div>
                <h1 className="text-lg font-bold">Trip Receipts</h1>
                <p className="text-xs text-muted-foreground">Detailed billing and journey records</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 pb-24 max-w-md mx-auto space-y-6">
          {/* Receipts Summary */}
          <Card className="border border-border/40">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{receipts.length}</p>
                  <p className="text-xs text-muted-foreground">Total Receipts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    £{receipts.reduce((sum, receipt) => sum + receipt.billing.total, 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    £{receipts.length > 0 ? (receipts.reduce((sum, receipt) => sum + receipt.billing.total, 0) / receipts.length).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground">Average Trip</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                toast.success("Monthly statement downloading...")
              }}
              className="h-12 flex flex-col gap-1"
            >
              <div className="text-xs font-semibold">Download</div>
              <div className="text-xs text-muted-foreground">Monthly Statement</div>
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                toast.success("Tax summary downloading...")
              }}
              className="h-12 flex flex-col gap-1"
            >
              <div className="text-xs font-semibold">Download</div>
              <div className="text-xs text-muted-foreground">Tax Summary</div>
            </Button>
          </div>

          {/* All Receipts */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground">All Receipts ({receipts.length})</h2>
            
            {receipts.length > 0 ? (
              <div className="space-y-3">
                {receipts.map(receipt => (
                  <Card 
                    key={receipt.id} 
                    className="border border-border/40 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setCurrentReceipt(receipt)
                      setShowReceiptModal(true)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-sm">{receipt.trip.service}</h3>
                            <p className="text-xs text-muted-foreground">
                              Receipt #{receipt.receiptNumber}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-base text-green-600">£{receipt.billing.total.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(receipt.issueDate).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            <span className="text-muted-foreground truncate">{receipt.trip.pickupLocation}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-muted-foreground truncate">{receipt.trip.destinationLocation}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/20">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{receipt.trip.distance}</span>
                            <span>{receipt.trip.actualDuration}</span>
                            <span>{receipt.driver.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {receipt.payment.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs bg-muted/30 rounded-lg p-2">
                          <div className="text-center">
                            <div className="font-medium">£{receipt.billing.subtotal.toFixed(2)}</div>
                            <div className="text-muted-foreground">Subtotal</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">£{receipt.billing.vat.amount.toFixed(2)}</div>
                            <div className="text-muted-foreground">VAT (20%)</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{receipt.payment.method}</div>
                            <div className="text-muted-foreground">•••• {receipt.payment.cardLast4}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-border/40">
                <CardContent className="p-8 text-center">
                  <List size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No receipts yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete trips to generate detailed receipts with full billing breakdown
                  </p>
                  <Button 
                    onClick={() => setCurrentView('home')}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
                  >
                    Book Your First Trip
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <ReceiptModal />
      </div>
    )
  }

  // Account Management View  
  if (currentView === 'account') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        {/* Header */}
        <header className="bg-background/98 backdrop-blur-sm border-b border-border/30 p-4 sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('home')}
                className="w-8 h-8 rounded-full p-0"
              >
                <ArrowLeft size={16} />
              </Button>
              <div>
                <h1 className="text-lg font-bold">Account</h1>
                <p className="text-xs text-muted-foreground">Manage your Armora profile</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 pb-24 max-w-md mx-auto space-y-6">
          {/* Profile Section */}
          <Card className="border border-border/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                  <User size={24} className="text-slate-900" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Welcome to Armora</h3>
                  <p className="text-sm text-muted-foreground">Professional Security Transport</p>
                  <p className="text-xs text-muted-foreground">Member since {new Date().getFullYear()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Options */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground">Account Settings</h2>
            
            <Card 
              className="border border-border/40 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setCurrentView('payment-methods')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Payment Methods</p>
                      <p className="text-xs text-muted-foreground">
                        {paymentMethods.length === 0 
                          ? (isApplePayAvailable || isGooglePayAvailable ? 
                             'Digital wallets available' : 'No payment methods added')
                          : `${paymentMethods.length} payment method${paymentMethods.length > 1 ? 's' : ''} saved`
                        }
                      </p>
                    </div>
                  </div>
                  <NavigationArrow size={16} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border border-border/40 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setCurrentView('receipts')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <List size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Trip Receipts</p>
                      <p className="text-xs text-muted-foreground">
                        {receipts.length} receipt{receipts.length !== 1 ? 's' : ''} available
                      </p>
                    </div>
                  </div>
                  <NavigationArrow size={16} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Phone size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Emergency Contacts</p>
                      <p className="text-xs text-muted-foreground">Optional safety feature</p>
                    </div>
                  </div>
                  <NavigationArrow size={16} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trip Summary */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground">Trip Summary</h2>
            
            <Card className="border border-border/40">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{recentTrips.length}</p>
                    <p className="text-xs text-muted-foreground">Total Trips</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      £{receipts.reduce((sum, receipt) => sum + receipt.billing.total, 0).toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{receipts.length}</p>
                    <p className="text-xs text-muted-foreground">Receipts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Support Section */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground">Support</h2>
            
            <Card className="border border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">24/7 Support</p>
                    <p className="text-xs text-muted-foreground">Professional assistance available anytime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reset App */}
          <Button 
            variant="outline"
            onClick={() => {
              setHasCompletedOnboarding(false)
              setCurrentView('welcome')
              toast.success("App reset. You can complete the assessment again.")
            }}
            className="w-full h-12 border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            Reset Assessment
          </Button>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-navigation bg-background/95 backdrop-blur-sm border-t border-border/50 z-30">
          <div className="bottom-nav-container">
            <div className="grid grid-cols-5 h-12">
              <button
                onClick={() => setCurrentView('home')}
                className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <House size={16} />
                </div>
                <span className="text-[10px]">Home</span>
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
                className="flex flex-col items-center justify-center gap-0.5 text-amber-600 transition-colors"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <User size={16} weight="fill" />
                </div>
                <span className="text-[10px] font-semibold">Account</span>
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

        <ReceiptModal />
      </div>
    )
  }

  return null
}

export default App