import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, Phone, Mail, MapPin, Clock, Users, Star, Heart, HeartStraight, NavigationArrow, User } from "@phosphor-icons/react"
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

function App() {
  const [selectedRide, setSelectedRide] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>('book')
  const [favoriteTrips, setFavoriteTrips] = useKV("favorite-trips", [] as number[])
  const [pickupLocation, setPickupLocation] = useState('')
  const [destination, setDestination] = useState('')
  const [currentTrip, setCurrentTrip] = useState<any>(null)
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
      <header className="bg-card border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">
            GQ<span className="text-accent">Cars</span>
          </h1>
          <Button variant="outline" size="sm">
            <User size={16} className="mr-2" />
            Profile
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="book" className="flex items-center gap-2">
              <Car size={16} />
              Book
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <NavigationArrow size={16} />
              Active
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock size={16} />
              History
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart size={16} />
              Favorites
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
              <Card>
                <CardHeader>
                  <CardTitle>Your Active Trip</CardTitle>
                  <CardDescription>Driver is on the way</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
                    <div>
                      <p className="font-semibold">{currentTrip.driver}</p>
                      <p className="text-sm text-muted-foreground">{currentTrip.vehicle}</p>
                      <p className="text-sm text-muted-foreground">License: {currentTrip.plate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">ETA: {currentTrip.eta}</p>
                      <Badge className="bg-accent text-accent-foreground">En Route</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-muted-foreground" />
                      <span className="text-sm">From: {currentTrip.pickup}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <NavigationArrow size={16} className="text-muted-foreground" />
                      <span className="text-sm">To: {currentTrip.destination}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Phone size={16} className="mr-2" />
                      Call Driver
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Mail size={16} className="mr-2" />
                      Message
                    </Button>
                  </div>

                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => {
                      setCurrentTrip(null)
                      toast.success("Trip cancelled")
                    }}
                  >
                    Cancel Trip
                  </Button>
                </CardContent>
              </Card>
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
      <footer className="bg-muted py-8 px-6 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
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