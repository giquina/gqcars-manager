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
    <div className="relative bg-muted/30 rounded-lg h-80 overflow-hidden border">
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
          strokeWidth="4"
          fill="none"
        />
        {/* Completed Route */}
        <path
          d={`M 20% 80% Q 40% 60% 60% 40% T 80% 20%`}
          stroke="rgb(var(--accent))"
          strokeWidth="4"
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
        <div className="bg-background border-2 border-accent rounded-full p-2 shadow-lg">
          <MapPin size={18} className="text-accent" weight="fill" />
        </div>
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded whitespace-nowrap font-medium">
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
          <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-primary border-2 border-background rounded-full p-2 shadow-lg">
            <Car size={18} className="text-primary-foreground" weight="fill" />
          </div>
        </div>
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap font-medium">
          {trip.driver}
        </div>
      </div>

      {/* Destination */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
        style={{ left: '80%', top: '20%' }}
      >
        <div className="bg-background border-2 border-destructive rounded-full p-2 shadow-lg">
          <NavigationArrow size={18} className="text-destructive" weight="fill" />
        </div>
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded whitespace-nowrap font-medium">
          Destination
        </div>
      </div>

      {/* Live Updates Badge */}
      <div className="absolute top-3 right-3">
        <Badge className="bg-accent text-accent-foreground animate-pulse">
          <div className="w-2 h-2 bg-accent-foreground rounded-full mr-1 animate-pulse" />
          Live
        </Badge>
      </div>

      {/* ETA Banner */}
      <div className="absolute top-3 left-3">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 border">
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-accent" />
            <span className="text-sm font-medium">ETA: {Math.round(eta)}min</span>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Trip Progress</span>
            <span className="text-xs text-muted-foreground">{Math.round(tripProgress)}%</span>
          </div>
          <Progress value={tripProgress} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
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
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Header */}
      <header className="bg-card border-b px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              GQ<span className="text-accent">Cars</span>
            </h1>
            <p className="text-xs text-muted-foreground">Passenger App</p>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <User size={16} className="mr-2" />
            Profile
          </Button>
          <Button variant="outline" size="icon" className="sm:hidden">
            <User size={16} />
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="book" className="flex flex-col items-center gap-1 py-3 px-1 text-xs sm:flex-row sm:gap-2 sm:text-sm sm:px-4">
              <Car size={16} className="shrink-0" />
              <span className="whitespace-nowrap">Book</span>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex flex-col items-center gap-1 py-3 px-1 text-xs sm:flex-row sm:gap-2 sm:text-sm sm:px-4">
              <NavigationArrow size={16} className="shrink-0" />
              <span className="whitespace-nowrap">Active</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex flex-col items-center gap-1 py-3 px-1 text-xs sm:flex-row sm:gap-2 sm:text-sm sm:px-4">
              <Clock size={16} className="shrink-0" />
              <span className="whitespace-nowrap">History</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex flex-col items-center gap-1 py-3 px-1 text-xs sm:flex-row sm:gap-2 sm:text-sm sm:px-4">
              <Heart size={16} className="shrink-0" />
              <span className="whitespace-nowrap">Favorites</span>
            </TabsTrigger>
          </TabsList>

          {/* Book Ride Tab */}
          <TabsContent value="book" className="space-y-6">
            {/* Hero Section */}
            <Card className="relative overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80')",
                }}
              />
              <CardContent className="relative p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Where to?</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Get a ride in minutes with GQCars
                </p>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle>Book Your Ride</CardTitle>
                <CardDescription>Enter your pickup and destination</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup">Pickup Location</Label>
                  <Input
                    id="pickup"
                    placeholder="Enter pickup address"
                    value={bookingForm.pickup}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, pickup: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    placeholder="Where are you going?"
                    value={bookingForm.destination}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, destination: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Special instructions for your driver"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ride Type Selection */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Choose Your Ride</h3>
              <div className="grid gap-4">
                {rideTypes.map(ride => (
                  <Card 
                    key={ride.id} 
                    className={`cursor-pointer transition-all ${
                      selectedRide === ride.id ? 'ring-2 ring-accent bg-accent/5' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedRide(ride.id)}
                  >
                    <CardContent className="flex items-center p-4">
                      <img 
                        src={ride.image} 
                        alt={ride.name}
                        className="w-16 h-12 object-cover rounded mr-4"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{ride.name}</h4>
                        <p className="text-sm text-muted-foreground">{ride.description}</p>
                        <p className="text-sm text-muted-foreground">ETA: {ride.eta}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${ride.price}</p>
                        <Badge variant={selectedRide === ride.id ? "default" : "secondary"}>
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
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={!bookingForm.pickup || !bookingForm.destination || !selectedRide}
            >
              Book Ride
            </Button>
          </TabsContent>

          {/* Active Trip Tab */}
          <TabsContent value="active" className="space-y-6">
            {currentTrip ? (
              <div className="space-y-4">
                {/* Real-time Map */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Crosshair size={20} className="text-accent" />
                          Live Tracking
                        </CardTitle>
                        <CardDescription>Follow your driver in real-time</CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Crosshair size={16} className="mr-2" />
                        Center Map
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RealTimeMap trip={currentTrip} />
                  </CardContent>
                </Card>

                {/* Trip Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trip Information</CardTitle>
                    <CardDescription>Driver and vehicle details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Driver Info Card */}
                    <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                          <User size={20} className="text-accent-foreground" weight="fill" />
                        </div>
                        <div>
                          <p className="font-semibold">{currentTrip.driver}</p>
                          <p className="text-sm text-muted-foreground">{currentTrip.vehicle}</p>
                          <p className="text-sm text-muted-foreground">License: {currentTrip.plate}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={14} className="text-yellow-500" weight="fill" />
                            <span className="text-sm font-medium">4.9</span>
                            <span className="text-xs text-muted-foreground">(245 trips)</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-accent text-accent-foreground mb-2">Verified Driver</Badge>
                        <p className="text-sm text-muted-foreground">Member since 2019</p>
                      </div>
                    </div>
                    
                    {/* Trip Route */}
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium text-sm">Trip Route</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-accent rounded-full"></div>
                          <span className="text-sm font-medium">From: {currentTrip.pickup}</span>
                        </div>
                        <div className="ml-1.5 w-0.5 h-4 bg-border"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-destructive rounded-full"></div>
                          <span className="text-sm font-medium">To: {currentTrip.destination}</span>
                        </div>
                      </div>
                      {tripStartTime && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Timer size={16} className="text-muted-foreground" />
                          <span className="text-sm">Trip started: {tripStartTime.toLocaleTimeString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Phone size={16} />
                        <span className="hidden sm:inline">Call Driver</span>
                        <span className="sm:hidden">Call</span>
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Mail size={16} />
                        <span className="hidden sm:inline">Message</span>
                        <span className="sm:hidden">Text</span>
                      </Button>
                    </div>

                    {/* Emergency & Cancel */}
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full text-orange-600 border-orange-200 hover:bg-orange-50">
                        Emergency Assistance
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full"
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
              <Card>
                <CardContent className="text-center py-12">
                  <Car size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Active Trips</h3>
                  <p className="text-muted-foreground mb-6">
                    You don't have any active trips right now.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('book')}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Book a Ride
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Trip History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Recent Trips</h3>
              {recentTrips.map(trip => (
                <Card key={trip.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={16} className="text-muted-foreground" />
                        <span className="font-medium">{trip.from}</span>
                        <NavigationArrow size={16} className="text-muted-foreground" />
                        <span className="font-medium">{trip.to}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{trip.date}</p>
                      <p className="text-sm text-muted-foreground">Driver: {trip.driver}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">${trip.price}</p>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500" weight="fill" />
                          <span className="text-sm">{trip.rating}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isTripFavorited(trip.id) ? "default" : "outline"}
                        onClick={() => toggleFavoriteTrip(trip.id)}
                      >
                        {isTripFavorited(trip.id) ? (
                          <Heart size={16} weight="fill" />
                        ) : (
                          <Heart size={16} />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            {/* Favorite Locations */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Favorite Locations</h3>
              <div className="grid gap-3">
                {favoriteLocations.map(location => (
                  <Card key={location.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h4 className="font-semibold">{location.name}</h4>
                        <p className="text-sm text-muted-foreground">{location.address}</p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleQuickBook(location)}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        Book Here
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Favorite Trips */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Favorite Trips</h3>
              {favoriteTrips.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <HeartStraight size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h4 className="font-semibold mb-2">No Favorite Trips Yet</h4>
                    <p className="text-muted-foreground text-sm">
                      Mark trips as favorites from your trip history to see them here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {recentTrips.filter(trip => favoriteTrips.includes(trip.id)).map(trip => (
                    <Card key={trip.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin size={16} className="text-muted-foreground" />
                            <span className="font-medium">{trip.from}</span>
                            <NavigationArrow size={16} className="text-muted-foreground" />
                            <span className="font-medium">{trip.to}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Last trip: {trip.date}</p>
                        </div>
                        <Button 
                          size="sm"
                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
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
      <footer className="bg-muted py-8 px-4 mt-12 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <Phone size={24} className="mx-auto mb-2 text-accent" />
              <p className="font-semibold">24/7 Support</p>
              <p className="text-sm text-muted-foreground">(555) 123-RIDE</p>
            </div>
            <div>
              <MapPin size={24} className="mx-auto mb-2 text-accent" />
              <p className="font-semibold">Available Citywide</p>
              <p className="text-sm text-muted-foreground">All neighborhoods</p>
            </div>
            <div>
              <Car size={24} className="mx-auto mb-2 text-accent" />
              <p className="font-semibold">Safe & Reliable</p>
              <p className="text-sm text-muted-foreground">Licensed drivers</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 GQCars. Your trusted ride-sharing partner.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App