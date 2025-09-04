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

        <div className="p-4 pb-20 space-y-5 max-w-md mx-auto">
          {/* Map Preview Section */}
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
            <CardContent className="p-0">
              <div className="h-32 bg-gradient-to-br from-muted/20 to-muted/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iY3VycmVudENvbG9yIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4K')] opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-1">
                    <MapPin size={24} className="text-primary mx-auto" weight="duotone" />
                    <p className="text-xs text-muted-foreground font-medium">Tap to set pickup location</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form with enhanced styling */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/98">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    placeholder="Pickup location"
                    value={bookingForm.pickup}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, pickup: e.target.value }))}
                    className="pl-10 h-12 border-0 bg-muted/50 focus:bg-background transition-colors"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-sm"></div>
                </div>
                
                <div className="relative">
                  <Input
                    placeholder="Where to?"
                    value={bookingForm.destination}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, destination: e.target.value }))}
                    className="pl-10 h-12 border-0 bg-muted/50 focus:bg-background transition-colors"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-destructive rounded-full shadow-sm"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ride Options with improved spacing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-muted-foreground font-medium">Choose your ride</p>
              <Clock size={14} className="text-muted-foreground" />
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
                    onClick={() => setSelectedService(service.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          selectedService === service.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-primary/10'
                        }`}>
                          <Icon size={22} className={selectedService === service.id ? '' : 'text-primary'} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-base">{service.name}</h3>
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-base">{service.priceRange}</p>
                              <p className="text-xs text-muted-foreground">{service.eta} away</p>
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

          {/* Payment Method with improved design */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center">
                    <CreditCard size={16} />
                  </div>
                  <span className="font-medium">Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Mastercard •••• 4321</span>
                  <NavigationArrow size={14} className="rotate-90 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Confirm Button */}
          <Button 
            onClick={handleBookRide}
            className="w-full h-14 bg-gradient-to-r from-black to-black/90 hover:from-black/90 hover:to-black/80 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            disabled={!bookingForm.pickup || !bookingForm.destination || !selectedService}
          >
            <div className="flex items-center gap-2">
              {selectedService && <Car size={18} />}
              Confirm {selectedService ? rideServices.find(s => s.id === selectedService)?.name : 'Ride'}
            </div>
          </Button>
        </div>

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

        <div className="p-4 space-y-4 max-w-md mx-auto">
          {/* Enhanced Map */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <CardContent className="p-0">
              <RideTrackingMap trip={currentTrip} driver={assignedDriver} />
            </CardContent>
          </Card>

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
                <Button variant="outline" size="sm" className="h-11 font-medium">
                  <Phone size={16} className="mr-2" />
                  Call Driver
                </Button>
                <Button variant="outline" size="sm" className="h-11 font-medium">
                  <Mail size={16} className="mr-2" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trip Details with better visual hierarchy */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Trip Route</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-primary rounded-full flex-shrink-0 shadow-sm"></div>
                  <div>
                    <p className="font-medium">{currentTrip.pickup}</p>
                    <p className="text-xs text-muted-foreground">Pickup location</p>
                  </div>
                </div>
                <div className="ml-2 w-0.5 h-8 bg-gradient-to-b from-primary via-muted to-destructive"></div>
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-destructive rounded-full flex-shrink-0 shadow-sm"></div>
                  <div>
                    <p className="font-medium">{currentTrip.destination}</p>
                    <p className="text-xs text-muted-foreground">Destination</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            variant="destructive" 
            className="w-full h-12 font-semibold rounded-xl"
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
                          toast.success("Destination set from favorites")
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