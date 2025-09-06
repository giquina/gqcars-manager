import React, { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import { useKV } from '@github/spark/hooks'

// Components
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { HomeView } from './views/HomeView'

// Hooks
import { useGeolocation } from './hooks/useGeolocation'

// Types and Constants
import { BookingForm, Trip, Driver, FavoriteLocation, ScheduledRide, EmergencyContact, CompanyAccount, Location } from './types'
import { drivers, londonLocations } from './constants/sample-data'
import { rideServices } from './constants/ride-services'

// Utils
import { validateBookingForm } from './utils/validation'
import { env, isDevelopment } from './utils/env'
import { toast } from 'sonner'

// Mock company account data
const mockCompanyAccount: CompanyAccount = {
  id: 'company_001',
  name: 'Acme Corporation Ltd',
  billingEmail: 'billing@acme-corp.com',
  status: 'active'
}

function App() {
  // Trip state
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null)
  const [assignedDriver, setAssignedDriver] = useState<Driver | null>(null)
  
  // UI state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [showFullMap, setShowFullMap] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [statusType, setStatusType] = useState<'info' | 'success' | 'warning' | 'error'>('info')
  
  // Form state
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    pickup: '',
    destination: '',
    pickupCoords: null,
    destinationCoords: null
  })
  const [selectedService, setSelectedService] = useState<string>('')
  
  // Persistent data
  const [favorites, setFavorites] = useKV("favorite-locations", [] as FavoriteLocation[])
  const [recentTrips, setRecentTrips] = useKV("recent-trips", [] as Trip[])
  const [scheduledRides, setScheduledRides] = useKV("scheduled-rides", [] as ScheduledRide[])
  const [emergencyContacts, setEmergencyContacts] = useKV("emergency-contacts", [] as EmergencyContact[])
  
  // Geolocation
  const { 
    location: userLocation, 
    address: userAddress, 
    loading: locationLoading, 
    accuracy,
    speed: userSpeed,
    getCurrentLocation,
    startWatchingLocation,
    stopWatchingLocation
  } = useGeolocation()
  
  const [mapCenter, setMapCenter] = useState<Location>(env.defaultMapCenter)
  const [isLocationWatching, setIsLocationWatching] = useState(false)

  // Initialize location tracking
  useEffect(() => {
    getCurrentLocation()
    const watchId = startWatchingLocation()
    setIsLocationWatching(true)
    
    if (!userLocation) {
      showPassengerStatus("📍 Finding your location for pickup...", 'info')
    }
    
    return () => {
      stopWatchingLocation()
      setIsLocationWatching(false)
    }
  }, [getCurrentLocation, startWatchingLocation, stopWatchingLocation])

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
        setStatusMessage('')
        showPassengerStatus("📍 Location found - ready to book from here", 'success')
      }
    }
  }, [userLocation, userAddress, bookingForm.pickup])

  // Utility functions
  const showPassengerStatus = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setStatusMessage(message)
    setStatusType(type)
    if (type === 'info' || type === 'success') {
      setTimeout(() => setStatusMessage(''), 5000)
    }
  }

  const calculateDistance = (point1: Location, point2: Location): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLng = (point2.lng - point1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c * 100) / 100
  }

  const addToFavorites = (location: string, name: string) => {
    const newFavorite: FavoriteLocation = { 
      name, 
      address: location, 
      id: Date.now() 
    }
    setFavorites((prev: FavoriteLocation[]) => [...prev, newFavorite])
  }

  const handleBookRide = () => {
    const validation = validateBookingForm(bookingForm)
    
    if (!validation.success) {
      const firstError = validation.errors?.[0]
      toast.error(firstError?.message || "Please check your booking details")
      return
    }
    
    if (!selectedService) {
      toast.error("🚗 Please choose your ride type")
      return
    }
    
    const driver = drivers[Math.floor(Math.random() * drivers.length)]
    const service = rideServices.find(s => s.id === selectedService)
    
    const distance = calculateDistance(bookingForm.pickupCoords!, bookingForm.destinationCoords!)
    const estimatedDuration = Math.ceil(distance * 2)
    
    const trip: Trip = {
      id: Date.now(),
      service: service!,
      pickup: bookingForm.pickup,
      destination: bookingForm.destination,
      pickupCoords: bookingForm.pickupCoords!,
      destinationCoords: bookingForm.destinationCoords!,
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
    
    setStatusMessage('')
    setTimeout(() => {
      showPassengerStatus(`🚗 ${driver.name} is your driver - arriving in ${driver.eta} minutes`, 'success')
    }, 1000)
    
    setRecentTrips((prev: Trip[]) => [trip, ...prev.slice(0, 9)])
    
    toast.success(`🚗 ${driver.name} is your driver! They'll arrive in ${driver.eta} minutes`, {
      duration: 5000,
      description: `${driver.vehicle} • ${driver.license}`
    })
    
    setBookingForm({ pickup: '', destination: '', pickupCoords: null, destinationCoords: null })
  }

  // Scheduled rides handlers
  const handleScheduleRide = (rideData: Omit<ScheduledRide, 'id' | 'userId'>) => {
    const newRide: ScheduledRide = {
      ...rideData,
      id: `scheduled_${Date.now()}`,
      userId: 'user_001'
    }
    setScheduledRides((prev: ScheduledRide[]) => [...prev, newRide])
  }

  const handleCancelScheduledRide = (rideId: string) => {
    setScheduledRides((prev: ScheduledRide[]) => 
      prev.map(ride => 
        ride.id === rideId 
          ? { ...ride, status: 'canceled' as const }
          : ride
      )
    )
  }

  // Emergency contacts handlers
  const handleAddEmergencyContact = (contactData: Omit<EmergencyContact, 'id' | 'userId'>) => {
    const newContact: EmergencyContact = {
      ...contactData,
      id: `contact_${Date.now()}`,
      userId: 'user_001'
    }
    setEmergencyContacts((prev: EmergencyContact[]) => [...prev, newContact])
  }

  const handleUpdateEmergencyContact = (contactId: string, contactData: Omit<EmergencyContact, 'id' | 'userId'>) => {
    setEmergencyContacts((prev: EmergencyContact[]) =>
      prev.map(contact =>
        contact.id === contactId
          ? { ...contact, ...contactData }
          : contact
      )
    )
  }

  const handleDeleteEmergencyContact = (contactId: string) => {
    setEmergencyContacts((prev: EmergencyContact[]) =>
      prev.filter(contact => contact.id !== contactId)
    )
  }

  if (isDevelopment) {
    console.log('App State:', {
      currentView,
      userLocation,
      bookingForm,
      currentTrip,
      env: {
        googleMapsConfigured: !!env.googleMapsApiKey,
        featuresEnabled: {
          scheduledRides: env.enableScheduledRides,
          emergencyContacts: env.enableEmergencyContacts,
          corporateBilling: env.enableCorporateBilling,
        }
      }
    })
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Toaster position="top-center" />
        
        <HomeView
          userLocation={userLocation}
          userAddress={userAddress}
          locationLoading={locationLoading}
          accuracy={accuracy}
          userSpeed={userSpeed}
          mapCenter={mapCenter}
          setMapCenter={setMapCenter}
          showFullMap={showFullMap}
          setShowFullMap={setShowFullMap}
          isLocationWatching={isLocationWatching}
          statusMessage={statusMessage}
          statusType={statusType}
          setStatusMessage={setStatusMessage}
          bookingForm={bookingForm}
          setBookingForm={setBookingForm}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          favorites={favorites}
          addToFavorites={addToFavorites}
          calculateDistance={calculateDistance}
          getCurrentLocation={getCurrentLocation}
          handleBookRide={handleBookRide}
          showPassengerStatus={showPassengerStatus}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App