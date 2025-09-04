import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Car, Phone, Mail, MapPin, Clock, Users, Star, Heart, HeartStraight, NavigationArrow, User, Crosshair, Timer } from "@phosphor-icons/react"
import { toast, Toaster } from 'sonner'
import { useKV } from '@github/spark/hooks'

// Sample ride types and recent trips data
const rideTypes = [
  {
    id: 'economy',
    name: 'Economy',
    description: 'Affordable everyday rides',
    price: 12,
    eta: '3-5 min',
    image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&q=80'
  },
  {
    id: 'comfort',
    name: 'Comfort',
    description: 'Extra legroom and premium vehicles',
    price: 18,
    eta: '4-6 min',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80'
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'High-end cars with top-rated drivers',
    price: 32,
    eta: '5-8 min',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&q=80'
  }
]

const recentTrips = [
  {
    id: 1,
    from: 'Home',
    to: 'Downtown Office',
    date: '2024-01-15',
    price: 15,
    driver: 'Michael Johnson',
    rating: 4.9
  },
  {
    id: 2,
    from: 'Airport Terminal 1',
    to: 'Hotel District',
    date: '2024-01-12',
    price: 28,
    driver: 'Sarah Chen',
    rating: 5.0
  },
  {
    id: 3,
    from: 'Shopping Mall',
    to: 'Home',
    date: '2024-01-10',
    price: 12,
    driver: 'David Rodriguez',
    rating: 4.8
  }
]

const favoriteLocations = [
  { id: 1, name: 'Home', address: '123 Main Street, City' },
  { id: 2, name: 'Work', address: '456 Business Ave, Downtown' },
  { id: 3, name: 'Airport', address: 'International Airport Terminal' },
  { id: 4, name: 'Gym', address: '789 Fitness Center Dr' }
]

// Real-time Map Component
const RealTimeMap = ({ trip }: { trip: any }) => {
  const [driverPosition, setDriverPosition] = useState({ x: 20, y: 80 })
  const [tripProgress, setTripProgress] = useState(0)
  const [eta, setEta] = useState(4)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPosition(prev => {
        const newX = Math.min(prev.x + (Math.random() * 3 + 1), 80)
        const newY = Math.max(prev.y - (Math.random() * 2 + 1), 20)
        return { x: newX, y: newY }
      })
      
      setTripProgress(prev => Math.min(prev + (Math.random() * 3 + 1), 100))
      setEta(prev => Math.max(prev - 0.15, 0))
      setLastUpdate(new Date())
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="relative bg-muted/30 rounded-xl h-80 overflow-hidden border shadow-lg">
      {/* Map Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" className="text-muted-foreground">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Route Line - Main Path */}
      <svg className="absolute inset-0 w-full h-full">
        <path
          d={`M 20% 80% Q 40% 60% 60% 40% T 80% 20%`}
          stroke="rgb(var(--muted-foreground) / 0.3)"
          strokeWidth="6"
          fill="none"
        />
        {/* Completed Route */}
        <path
          d={`M 20% 80% Q 40% 60% 60% 40% T 80% 20%`}
          stroke="rgb(var(--accent))"
          strokeWidth="6"
          fill="none"
          strokeDasharray={`${tripProgress * 3}% ${300 - tripProgress * 3}%`}
          className="transition-all duration-1000"
        />
      </svg>

      {/* Pickup Location */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
        style={{ left: '20%', top: '80%' }}
      >
        <div className="bg-background border-2 border-accent rounded-full p-3 shadow-xl">
          <MapPin size={20} className="text-accent" weight="fill" />
        </div>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold shadow-lg">
          Pickup
        </div>
      </div>

      {/* Driver Position */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-3000"
        style={{ 
          left: `${20 + (60 * (tripProgress / 100))}%`, 
          top: `${80 - (60 * (tripProgress / 100))}%` 
        }}
      >
        <div className="relative">
          {/* Driver Location Pulse */}
          <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75 scale-125"></div>
          <div className="relative bg-primary border-2 border-background rounded-full p-3 shadow-xl">
            <Car size={20} className="text-primary-foreground" weight="fill" />
          </div>
        </div>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold shadow-lg">
          {trip.driver}
        </div>
      </div>

      {/* Destination */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
        style={{ left: '80%', top: '20%' }}
      >
        <div className="bg-background border-2 border-destructive rounded-full p-3 shadow-xl">
          <NavigationArrow size={20} className="text-destructive" weight="fill" />
        </div>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold shadow-lg">
          Destination
        </div>
      </div>

      {/* Live Updates Badge */}
      <div className="absolute top-4 right-4">
        <Badge className="bg-accent text-accent-foreground animate-pulse px-3 py-1 shadow-lg">
          <div className="w-2 h-2 bg-accent-foreground rounded-full mr-2 animate-pulse" />
          Live
        </Badge>
      </div>

      {/* ETA Banner */}
      <div className="absolute top-4 left-4">
        <div className="bg-background/95 backdrop-blur-md rounded-xl p-3 border shadow-lg">
          <div className="flex items-center gap-2">
            <Timer size={18} className="text-accent" />
            <span className="font-bold">ETA: {Math.round(eta)}min</span>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-background/95 backdrop-blur-md rounded-xl p-4 border shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold">Trip Progress</span>
            <span className="text-muted-foreground font-semibold">{Math.round(tripProgress)}%</span>
          </div>
          <Progress value={tripProgress} className="h-3 mb-3" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Last update: {formatTime(lastUpdate)}</span>
            <span>{Math.round((100 - tripProgress) * 0.03)}min remaining</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [selectedRide, setSelectedRide] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>('book')
  const [favoriteTrips, setFavoriteTrips] = useKV("favorite-trips", [] as number[])
  const [pickupLocation, setPickupLocation] = useState('')
  const [destination, setDestination] = useState('')
  const [currentTrip, setCurrentTrip] = useState<any>(null)
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null)
  const [bookingForm, setBookingForm] = useState({
    pickup: '',
    destination: '',
    notes: ''
  })

  const toggleFavoriteTrip = (tripId: number) => {
    setFavoriteTrips((currentFavorites) => {
      const isFavorited = currentFavorites.includes(tripId)
      if (isFavorited) {
        toast.success("Removed from favorite trips")
        return currentFavorites.filter(id => id !== tripId)
      } else {
        toast.success("Added to favorite trips")
        return [...currentFavorites, tripId]
      }
    })
  }

  const isTripFavorited = (tripId: number) => favoriteTrips.includes(tripId)

  const handleBookRide = () => {
    if (!bookingForm.pickup || !bookingForm.destination || !selectedRide) {
      toast.error("Please fill in pickup location, destination, and select a ride type")
      return
    }
    
    // Simulate booking
    const mockTrip = {
      id: Date.now(),
      type: selectedRide,
      pickup: bookingForm.pickup,
      destination: bookingForm.destination,
      driver: 'Alex Thompson',
      vehicle: '2023 Honda Accord',
      plate: 'ABC-1234',
      eta: '4 minutes',
      status: 'driver_assigned'
    }
    
    setCurrentTrip(mockTrip)
    setTripStartTime(new Date())
    toast.success("Ride booked! Your driver is on the way.")
    setBookingForm({ pickup: '', destination: '', notes: '' })
    setSelectedRide('')
    setActiveTab('active')
  }

  const handleQuickBook = (location: any) => {
    setBookingForm(prev => ({ ...prev, destination: location.address }))
    setActiveTab('book')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <Car size={20} className="text-white" weight="bold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  GQCars
                </h1>
                <p className="text-xs text-muted-foreground font-medium">Passenger</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 bg-background/50 hover:bg-background">
              <User size={16} />
              Profile
            </Button>
            <Button variant="outline" size="icon" className="sm:hidden bg-background/50 hover:bg-background">
              <User size={16} />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-8">
            <TabsList className="grid w-full grid-cols-4 h-14 bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
              <TabsTrigger 
                value="book" 
                className="flex flex-col items-center gap-1.5 py-2 px-2 text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md sm:flex-row sm:gap-2 sm:text-sm sm:px-4 transition-all duration-200"
              >
                <Car size={18} className="shrink-0" weight={activeTab === 'book' ? 'fill' : 'regular'} />
                <span className="font-medium">Book</span>
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className="flex flex-col items-center gap-1.5 py-2 px-2 text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md sm:flex-row sm:gap-2 sm:text-sm sm:px-4 transition-all duration-200"
              >
                <NavigationArrow size={18} className="shrink-0" weight={activeTab === 'active' ? 'fill' : 'regular'} />
                <span className="font-medium">Active</span>
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="flex flex-col items-center gap-1.5 py-2 px-2 text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md sm:flex-row sm:gap-2 sm:text-sm sm:px-4 transition-all duration-200"
              >
                <Clock size={18} className="shrink-0" weight={activeTab === 'history' ? 'fill' : 'regular'} />
                <span className="font-medium">History</span>
              </TabsTrigger>
              <TabsTrigger 
                value="favorites" 
                className="flex flex-col items-center gap-1.5 py-2 px-2 text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md sm:flex-row sm:gap-2 sm:text-sm sm:px-4 transition-all duration-200"
              >
                <Heart size={18} className="shrink-0" weight={activeTab === 'favorites' ? 'fill' : 'regular'} />
                <span className="font-medium">Favorites</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Book Ride Tab */}
          <TabsContent value="book" className="space-y-8">
            {/* Hero Section */}
            <Card className="relative overflow-hidden border-0 shadow-2xl">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-accent/90" />
              <CardContent className="relative p-12 text-center text-white">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-4xl font-bold mb-4 leading-tight">Where to?</h2>
                  <p className="text-xl text-white/90 mb-8 leading-relaxed">
                    Get a safe, reliable ride in minutes with GQCars
                  </p>
                  <div className="flex justify-center gap-8 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span>24/7 Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span>Verified Drivers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span>Real-time Tracking</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <MapPin size={18} className="text-accent-foreground" />
                  </div>
                  Book Your Ride
                </CardTitle>
                <CardDescription className="text-base">Enter your pickup and destination locations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="pickup" className="text-sm font-semibold">Pickup Location</Label>
                  <Input
                    id="pickup"
                    placeholder="Enter pickup address or landmark"
                    value={bookingForm.pickup}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, pickup: e.target.value }))}
                    className="h-12 text-base bg-background/50"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="destination" className="text-sm font-semibold">Destination</Label>
                  <Input
                    id="destination"
                    placeholder="Where would you like to go?"
                    value={bookingForm.destination}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, destination: e.target.value }))}
                    className="h-12 text-base bg-background/50"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="notes" className="text-sm font-semibold">Special Instructions <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for your driver..."
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="min-h-[80px] bg-background/50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ride Type Selection */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Car size={18} className="text-primary-foreground" />
                </div>
                Choose Your Ride
              </h3>
              <div className="grid gap-4">
                {rideTypes.map(ride => (
                  <Card 
                    key={ride.id} 
                    className={`cursor-pointer transition-all duration-300 border-2 ${
                      selectedRide === ride.id 
                        ? 'ring-2 ring-accent ring-offset-2 bg-accent/5 border-accent shadow-xl' 
                        : 'hover:shadow-lg hover:border-accent/50 border-border/50 bg-card/50'
                    }`}
                    onClick={() => setSelectedRide(ride.id)}
                  >
                    <CardContent className="flex items-center p-6">
                      <div className="relative w-20 h-16 mr-6">
                        <img 
                          src={ride.image} 
                          alt={ride.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {selectedRide === ride.id && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                            <span className="text-xs text-accent-foreground font-bold">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{ride.name}</h4>
                        <p className="text-muted-foreground mb-1">{ride.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock size={14} />
                          <span>ETA: {ride.eta}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${ride.price}</p>
                        <Badge 
                          variant={selectedRide === ride.id ? "default" : "secondary"}
                          className={selectedRide === ride.id ? "bg-accent text-accent-foreground" : ""}
                        >
                          {selectedRide === ride.id ? 'Selected' : 'Select'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Book Button */}
            <Button 
              onClick={handleBookRide} 
              size="lg" 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              disabled={!bookingForm.pickup || !bookingForm.destination || !selectedRide}
            >
              <Car size={20} className="mr-3" />
              Book Your Ride Now
            </Button>
          </TabsContent>

          {/* Active Trip Tab */}
          <TabsContent value="active" className="space-y-8">
            {currentTrip ? (
              <div className="space-y-6">
                {/* Real-time Map */}
                <Card className="shadow-xl border-0">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                            <Crosshair size={18} className="text-accent-foreground animate-pulse" />
                          </div>
                          Live Tracking
                        </CardTitle>
                        <CardDescription className="text-base">Follow your driver in real-time</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="bg-background/50 hover:bg-background">
                        <Crosshair size={16} className="mr-2" />
                        <span className="hidden sm:inline">Center Map</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RealTimeMap trip={currentTrip} />
                  </CardContent>
                </Card>

                {/* Trip Details */}
                <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <User size={18} className="text-primary-foreground" />
                      </div>
                      Trip Information
                    </CardTitle>
                    <CardDescription className="text-base">Driver and vehicle details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Driver Info Card */}
                    <div className="relative p-6 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border-2 border-accent/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center shadow-lg">
                              <User size={24} className="text-white" weight="fill" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <span className="text-xs text-white font-bold">✓</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold">{currentTrip.driver}</h4>
                            <p className="text-muted-foreground font-medium">{currentTrip.vehicle}</p>
                            <p className="text-sm text-muted-foreground">License: <span className="font-mono">{currentTrip.plate}</span></p>
                            <div className="flex items-center gap-1 mt-2">
                              <Star size={16} className="text-yellow-500" weight="fill" />
                              <span className="font-bold text-lg">4.9</span>
                              <span className="text-sm text-muted-foreground ml-1">(245 rides)</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-accent text-accent-foreground mb-2 px-3 py-1">Verified Driver</Badge>
                          <p className="text-sm text-muted-foreground">Since 2019</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Trip Route */}
                    <div className="space-y-4 p-6 bg-muted/30 rounded-xl border">
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        <MapPin size={18} className="text-accent" />
                        Trip Route
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-accent rounded-full shadow-md"></div>
                          <div>
                            <span className="text-sm text-muted-foreground">FROM</span>
                            <p className="font-semibold">{currentTrip.pickup}</p>
                          </div>
                        </div>
                        <div className="ml-2 w-0.5 h-8 bg-gradient-to-b from-accent to-destructive"></div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-destructive rounded-full shadow-md"></div>
                          <div>
                            <span className="text-sm text-muted-foreground">TO</span>
                            <p className="font-semibold">{currentTrip.destination}</p>
                          </div>
                        </div>
                      </div>
                      {tripStartTime && (
                        <div className="flex items-center gap-3 pt-4 border-t border-border">
                          <Timer size={18} className="text-muted-foreground" />
                          <div>
                            <span className="text-sm text-muted-foreground">STARTED</span>
                            <p className="font-semibold">{tripStartTime.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-12 flex items-center gap-3 bg-background/50 hover:bg-background hover:shadow-md">
                        <Phone size={18} className="text-accent" />
                        <span className="font-semibold">Call</span>
                      </Button>
                      <Button variant="outline" className="h-12 flex items-center gap-3 bg-background/50 hover:bg-background hover:shadow-md">
                        <Mail size={18} className="text-accent" />
                        <span className="font-semibold">Message</span>
                      </Button>
                    </div>

                    {/* Emergency & Cancel */}
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full h-12 text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 font-semibold">
                        🚨 Emergency Assistance
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full h-12 font-semibold shadow-lg"
                        onClick={() => {
                          setCurrentTrip(null)
                          setTripStartTime(null)
                          toast.success("Trip cancelled successfully")
                        }}
                      >
                        Cancel Trip
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="text-center py-16">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Car size={40} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">No Active Trips</h3>
                  <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                    You don't have any active trips right now. Ready to go somewhere?
                  </p>
                  <Button 
                    onClick={() => setActiveTab('book')}
                    size="lg"
                    className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground shadow-xl h-12 px-8"
                  >
                    <Car size={20} className="mr-3" />
                    Book a Ride
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Trip History Tab */}
          <TabsContent value="history" className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Clock size={18} className="text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Recent Trips</h3>
              </div>
              {recentTrips.map(trip => (
                <Card key={trip.id} className="shadow-lg border-0 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-accent rounded-full"></div>
                        <span className="font-bold text-lg">{trip.from}</span>
                        <NavigationArrow size={18} className="text-muted-foreground" />
                        <span className="font-bold text-lg">{trip.to}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Clock size={14} />
                          {trip.date}
                        </p>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <User size={14} />
                          Driver: {trip.driver}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${trip.price}</p>
                        <div className="flex items-center gap-1 justify-end">
                          <Star size={16} className="text-yellow-500" weight="fill" />
                          <span className="font-bold">{trip.rating}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isTripFavorited(trip.id) ? "default" : "outline"}
                        onClick={() => toggleFavoriteTrip(trip.id)}
                        className={isTripFavorited(trip.id) ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "hover:bg-accent/10"}
                      >
                        {isTripFavorited(trip.id) ? (
                          <Heart size={18} weight="fill" />
                        ) : (
                          <Heart size={18} />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-8">
            {/* Favorite Locations */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <MapPin size={18} className="text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Favorite Locations</h3>
              </div>
              <div className="grid gap-4">
                {favoriteLocations.map(location => (
                  <Card key={location.id} className="shadow-lg border-0 bg-card/50 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
                          <MapPin size={20} className="text-white" weight="fill" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{location.name}</h4>
                          <p className="text-muted-foreground">{location.address}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleQuickBook(location)}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 h-10 font-semibold"
                      >
                        Book Here
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Favorite Trips */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Heart size={18} className="text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Favorite Trips</h3>
              </div>
              {favoriteTrips.length === 0 ? (
                <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="text-center py-16">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <HeartStraight size={40} className="text-muted-foreground" />
                    </div>
                    <h4 className="text-xl font-bold mb-4">No Favorite Trips Yet</h4>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                      Mark trips as favorites from your trip history to see them here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recentTrips.filter(trip => favoriteTrips.includes(trip.id)).map(trip => (
                    <Card key={trip.id} className="shadow-lg border-0 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                      <CardContent className="flex items-center justify-between p-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-accent rounded-full"></div>
                            <span className="font-bold text-lg">{trip.from}</span>
                            <NavigationArrow size={18} className="text-muted-foreground" />
                            <span className="font-bold text-lg">{trip.to}</span>
                          </div>
                          <p className="text-muted-foreground">Last trip: {trip.date}</p>
                        </div>
                        <Button 
                          size="sm"
                          className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 h-10 font-semibold"
                        >
                          Book Again
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-muted via-card to-muted border-t py-12 px-4 mt-16 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Phone size={28} className="text-white" weight="bold" />
              </div>
              <h4 className="font-bold text-lg mb-2">24/7 Support</h4>
              <p className="text-muted-foreground">(555) 123-RIDE</p>
              <p className="text-sm text-muted-foreground">Always here to help</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MapPin size={28} className="text-white" weight="bold" />
              </div>
              <h4 className="font-bold text-lg mb-2">Available Citywide</h4>
              <p className="text-muted-foreground">All neighborhoods</p>
              <p className="text-sm text-muted-foreground">Expanding daily</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Car size={28} className="text-white" weight="bold" />
              </div>
              <h4 className="font-bold text-lg mb-2">Safe & Reliable</h4>
              <p className="text-muted-foreground">Licensed drivers</p>
              <p className="text-sm text-muted-foreground">Background checked</p>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-border">
            <p className="text-muted-foreground font-medium">
              © 2024 GQCars. Your trusted ride-sharing partner.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App