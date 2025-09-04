import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  X
} from "@phosphor-icons/react"
import { toast, Toaster } from 'sonner'
import { useKV } from '@github/spark/hooks'

// UK Ride Service Levels
const rideServices = [
  {
    id: 'standard',
    name: 'GQ Standard',
    description: 'Reliable everyday rides',
    priceRange: '£8.50 - £12.20',
    eta: '2-4 min',
    icon: Car,
    capacity: '1-4 passengers'
  },
  {
    id: 'comfort',
    name: 'GQ Comfort',
    description: 'Premium vehicles with extra space',
    priceRange: '£12.80 - £16.40',
    eta: '3-5 min',
    icon: Shield,
    capacity: '1-4 passengers'
  },
  {
    id: 'executive',
    name: 'GQ Executive', 
    description: 'Luxury vehicles for business',
    priceRange: '£18.50 - £24.90',
    eta: '4-6 min',
    icon: Star,
    capacity: '1-4 passengers'
  },
  {
    id: 'xl',
    name: 'GQ XL',
    description: 'Larger vehicles for groups',
    priceRange: '£15.20 - £19.80',
    eta: '5-7 min',
    icon: Users,
    capacity: '1-6 passengers'
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

// Map component for ride tracking
const RideTrackingMap = ({ trip, driver }: { trip: any, driver: any }) => {
  const [driverPosition, setDriverPosition] = useState({ x: 20, y: 80 })
  const [tripProgress, setTripProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPosition(prev => ({
        x: Math.min(prev.x + 1.5, 80),
        y: Math.max(prev.y - 1, 20)
      }))
      setTripProgress(prev => Math.min(prev + 2, 100))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative bg-gradient-to-br from-muted/10 to-muted/30 rounded-lg h-48 overflow-hidden border">
      {/* Map grid background */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Route line */}
      <svg className="absolute inset-0 w-full h-full">
        <path
          d="M 20% 80% Q 50% 50% 80% 20%"
          stroke="rgb(100 116 139)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
        />
      </svg>

      {/* Pickup location */}
      <div className="absolute" style={{ left: '20%', top: '80%', transform: 'translate(-50%, -50%)' }}>
        <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-md">
          <MapPin size={12} weight="fill" />
        </div>
      </div>

      {/* Driver position */}
      <div 
        className="absolute transition-all duration-3000" 
        style={{ left: `${driverPosition.x}%`, top: `${driverPosition.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        <div className="bg-accent text-accent-foreground rounded-full p-1.5 shadow-md">
          <Car size={12} weight="fill" />
        </div>
      </div>

      {/* Destination */}
      <div className="absolute" style={{ left: '80%', top: '20%', transform: 'translate(-50%, -50%)' }}>
        <div className="bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-md">
          <NavigationArrow size={12} weight="fill" />
        </div>
      </div>

      {/* ETA display */}
      <div className="absolute top-2 left-2 bg-background/90 backdrop-blur rounded px-2 py-1 text-xs font-medium">
        {driver.eta} min away
      </div>
    </div>
  )
}

function App() {
  const [currentView, setCurrentView] = useState<string>('home')
  const [selectedService, setSelectedService] = useState<string>('')
  const [currentTrip, setCurrentTrip] = useState<any>(null)
  const [assignedDriver, setAssignedDriver] = useState<any>(null)
  const [bookingForm, setBookingForm] = useState({
    pickup: '',
    destination: ''
  })
  const [favorites, setFavorites] = useKV("favorite-locations", [] as any[])
  const [recentTrips, setRecentTrips] = useKV("recent-trips", [] as any[])
  const [paymentMethod, setPaymentMethod] = useState('mastercard')

  const handleBookRide = () => {
    if (!bookingForm.pickup || !bookingForm.destination || !selectedService) {
      toast.error("Please enter pickup location, destination and select a ride type")
      return
    }
    
    const driver = drivers[Math.floor(Math.random() * drivers.length)]
    const service = rideServices.find(s => s.id === selectedService)
    
    const trip = {
      id: Date.now(),
      service: service,
      pickup: bookingForm.pickup,
      destination: bookingForm.destination,
      driver: driver,
      status: 'driver_assigned',
      startTime: new Date(),
      estimatedPrice: service?.priceRange
    }
    
    setCurrentTrip(trip)
    setAssignedDriver(driver)
    setCurrentView('tracking')
    
    // Add to recent trips
    setRecentTrips((prev: any[]) => [trip, ...prev.slice(0, 9)])
    
    toast.success(`${driver.name} is on the way!`)
    setBookingForm({ pickup: '', destination: '' })
  }

  const addToFavorites = (location: string, name: string) => {
    const newFavorite = { name, address: location, id: Date.now() }
    setFavorites((prev: any[]) => [...prev, newFavorite])
    toast.success("Location saved to favorites")
  }

  // Home/Booking View
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-background">
        <Toaster position="top-center" />
        
        {/* Header */}
        <header className="bg-background border-b p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car size={20} className="text-primary" weight="bold" />
              <h1 className="text-lg font-bold">GQ Cars</h1>
            </div>
            <Button variant="ghost" size="sm">
              <User size={16} />
            </Button>
          </div>
        </header>

        <div className="p-4 pb-20 space-y-4">
          {/* Booking Form */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Pickup location"
                    value={bookingForm.pickup}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, pickup: e.target.value }))}
                    className="pl-8"
                  />
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
                </div>
                
                <div className="relative">
                  <Input
                    placeholder="Where to?"
                    value={bookingForm.destination}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, destination: e.target.value }))}
                    className="pl-8"
                  />
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-destructive rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ride Options */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground px-1">Choose a ride, or swipe up for more</p>
            {rideServices.map(service => {
              const Icon = service.icon
              return (
                <Card 
                  key={service.id}
                  className={`cursor-pointer transition-all ${
                    selectedService === service.id 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon size={20} className="text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">{service.name}</h3>
                          <div className="text-right">
                            <p className="font-bold text-sm">{service.priceRange}</p>
                            <p className="text-xs text-muted-foreground">{service.eta} dropoff</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Payment Method */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} />
                  <span className="text-sm">Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Mastercard •••• 4321</span>
                  <NavigationArrow size={12} className="rotate-90" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confirm Button */}
          <Button 
            onClick={handleBookRide}
            className="w-full h-12 bg-black hover:bg-black/90 text-white font-semibold"
            disabled={!bookingForm.pickup || !bookingForm.destination || !selectedService}
          >
            Confirm {selectedService ? rideServices.find(s => s.id === selectedService)?.name : 'Ride'}
          </Button>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
          <div className="grid grid-cols-4 h-16">
            <button
              onClick={() => setCurrentView('home')}
              className="flex flex-col items-center justify-center gap-1 text-primary"
            >
              <House size={18} weight="fill" />
              <span className="text-xs font-medium">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentView('activity')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <List size={18} />
              <span className="text-xs">Activity</span>
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <Heart size={18} />
              <span className="text-xs">Saved</span>
            </button>

            <button
              onClick={() => setCurrentView('account')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <User size={18} />
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
      <div className="min-h-screen bg-background">
        <Toaster position="top-center" />
        
        {/* Header */}
        <header className="bg-background border-b p-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('home')}>
              <ArrowLeft size={16} />
            </Button>
            <h1 className="font-semibold">Trip to {currentTrip.destination}</h1>
          </div>
        </header>

        <div className="p-4 space-y-4">
          {/* Map */}
          <RideTrackingMap trip={currentTrip} driver={assignedDriver} />

          {/* Driver Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={assignedDriver.photo} 
                  alt={assignedDriver.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{assignedDriver.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star size={12} className="text-yellow-500" weight="fill" />
                    <span>{assignedDriver.rating}</span>
                    <span>•</span>
                    <span>{assignedDriver.vehicle}</span>
                  </div>
                  <p className="text-sm font-medium">{assignedDriver.license}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Phone size={14} className="mr-2" />
                  Call
                </Button>
                <Button variant="outline" size="sm">
                  <Mail size={14} className="mr-2" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trip Details */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">{currentTrip.pickup}</span>
              </div>
              <div className="ml-1 w-0.5 h-6 bg-gradient-to-b from-primary to-destructive"></div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                <span className="text-sm">{currentTrip.destination}</span>
              </div>
            </CardContent>
          </Card>

          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => {
              setCurrentTrip(null)
              setAssignedDriver(null)
              setCurrentView('home')
              toast.success("Trip cancelled")
            }}
          >
            Cancel Trip
          </Button>
        </div>
      </div>
    )
  }

  // Activity View
  if (currentView === 'activity') {
    return (
      <div className="min-h-screen bg-background">
        <Toaster position="top-center" />
        
        <header className="bg-background border-b p-3">
          <h1 className="text-lg font-semibold">Your Activity</h1>
        </header>

        <div className="p-4 pb-20">
          {recentTrips.length === 0 ? (
            <div className="text-center py-12">
              <List size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-4">When you book your first ride, it will appear here</p>
              <Button onClick={() => setCurrentView('home')}>
                <Car size={16} className="mr-2" />
                Book a ride
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrips.map((trip: any) => (
                <Card key={trip.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{trip.service.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {new Date(trip.startTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        {trip.pickup}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-destructive rounded-full"></div>
                        {trip.destination}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm">{trip.driver.name}</span>
                      <span className="font-semibold">{trip.estimatedPrice}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
          <div className="grid grid-cols-4 h-16">
            <button
              onClick={() => setCurrentView('home')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <House size={18} />
              <span className="text-xs">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentView('activity')}
              className="flex flex-col items-center justify-center gap-1 text-primary"
            >
              <List size={18} weight="fill" />
              <span className="text-xs font-medium">Activity</span>
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <Heart size={18} />
              <span className="text-xs">Saved</span>
            </button>

            <button
              onClick={() => setCurrentView('account')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <User size={18} />
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
      <div className="min-h-screen bg-background">
        <Toaster position="top-center" />
        
        <header className="bg-background border-b p-3">
          <h1 className="text-lg font-semibold">Saved Places</h1>
        </header>

        <div className="p-4 pb-20">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No saved places</h3>
              <p className="text-muted-foreground mb-4">Save your favorite locations for quick booking</p>
              <Button onClick={() => setCurrentView('home')}>
                <Plus size={16} className="mr-2" />
                Add location
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((location: any) => (
                <Card key={location.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <MapPin size={18} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{location.name}</h3>
                          <p className="text-sm text-muted-foreground">{location.address}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setBookingForm(prev => ({ ...prev, destination: location.address }))
                          setCurrentView('home')
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
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
          <div className="grid grid-cols-4 h-16">
            <button
              onClick={() => setCurrentView('home')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <House size={18} />
              <span className="text-xs">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentView('activity')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <List size={18} />
              <span className="text-xs">Activity</span>
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className="flex flex-col items-center justify-center gap-1 text-primary"
            >
              <Heart size={18} weight="fill" />
              <span className="text-xs font-medium">Saved</span>
            </button>

            <button
              onClick={() => setCurrentView('account')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <User size={18} />
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
      <div className="min-h-screen bg-background">
        <Toaster position="top-center" />
        
        <header className="bg-background border-b p-3">
          <h1 className="text-lg font-semibold">Account</h1>
        </header>

        <div className="p-4 pb-20 space-y-4">
          {/* Profile Section */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">John Smith</h3>
                  <p className="text-muted-foreground">john.smith@email.com</p>
                  <p className="text-muted-foreground">+44 7700 900123</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="space-y-1">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} />
                    <span>Payment Methods</span>
                  </div>
                  <NavigationArrow size={14} className="rotate-90" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock size={18} />
                    <span>Trip History</span>
                  </div>
                  <NavigationArrow size={14} className="rotate-90" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone size={18} />
                    <span>Help & Support</span>
                  </div>
                  <NavigationArrow size={14} className="rotate-90" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
          <div className="grid grid-cols-4 h-16">
            <button
              onClick={() => setCurrentView('home')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <House size={18} />
              <span className="text-xs">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentView('activity')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <List size={18} />
              <span className="text-xs">Activity</span>
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <Heart size={18} />
              <span className="text-xs">Saved</span>
            </button>

            <button
              onClick={() => setCurrentView('account')}
              className="flex flex-col items-center justify-center gap-1 text-primary"
            >
              <User size={18} weight="fill" />
              <span className="text-xs font-medium">Account</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default App