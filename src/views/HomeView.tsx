import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Car, 
  CreditCard, 
  NavigationArrow, 
  CheckCircle, 
  Warning, 
  X, 
  Clock, 
  Heart, 
  Crosshair, 
  MagnifyingGlass, 
  Navigation,
  Compass,
  Speedometer
} from "@phosphor-icons/react"
import LeafletMap from '../components/LeafletMap'
import { rideServices } from '../constants/ride-services'
import { BookingForm, FavoriteLocation, Location } from '../types'

interface HomeViewProps {
  userLocation: Location | null
  userAddress: string
  locationLoading: boolean
  accuracy: number | null
  userSpeed: number | null
  mapCenter: Location
  setMapCenter: (center: Location) => void
  showFullMap: boolean
  setShowFullMap: (show: boolean) => void
  isLocationWatching: boolean
  statusMessage: string
  statusType: 'info' | 'success' | 'warning' | 'error'
  setStatusMessage: (message: string) => void
  bookingForm: BookingForm
  setBookingForm: React.Dispatch<React.SetStateAction<BookingForm>>
  selectedService: string
  setSelectedService: (service: string) => void
  favorites: FavoriteLocation[]
  addToFavorites: (location: string, name: string) => void
  calculateDistance: (point1: Location, point2: Location) => number
  getCurrentLocation: () => void
  handleBookRide: () => void
  showPassengerStatus: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

export const HomeView: React.FC<HomeViewProps> = ({
  userLocation,
  userAddress,
  locationLoading,
  accuracy,
  userSpeed,
  mapCenter,
  setMapCenter,
  showFullMap,
  setShowFullMap,
  isLocationWatching,
  statusMessage,
  statusType,
  setStatusMessage,
  bookingForm,
  setBookingForm,
  selectedService,
  setSelectedService,
  favorites,
  addToFavorites,
  calculateDistance,
  getCurrentLocation,
  handleBookRide,
  showPassengerStatus
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
      {/* Header with enhanced gradient and location awareness */}
      <header className="bg-gradient-to-r from-background/98 to-background/95 backdrop-blur-md border-b border-border/30 p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/90 to-accent rounded-xl flex items-center justify-center shadow-lg">
              <Car size={20} className="text-primary-foreground" weight="bold" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">GQ Cars</h1>
              {userLocation && (
                <p className="text-xs text-muted-foreground">
                  📍 {userAddress ? userAddress.split(',')[0] : 'Locating...'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLocationWatching && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live GPS tracking active" />
            )}
            <Button variant="ghost" size="sm" className="w-10 h-10 rounded-full">
              <User size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* Passenger Status Banner */}
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
        {/* Enhanced Map Preview */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/90 ring-1 ring-border/10">
          <CardContent className="p-0">
            <div className="relative">
              <LeafletMap
                onLocationSelect={(location) => {
                  if (!bookingForm.pickup) {
                    setBookingForm(prev => ({
                      ...prev,
                      pickup: location.address,
                      pickupCoords: { lat: location.lat, lng: location.lng }
                    }))
                    showPassengerStatus("📍 Pickup location confirmed", 'success')
                  } else if (!bookingForm.destination) {
                    setBookingForm(prev => ({
                      ...prev,
                      destination: location.address,
                      destinationCoords: { lat: location.lat, lng: location.lng }
                    }))
                    showPassengerStatus("🎯 Destination confirmed - ready to book", 'success')
                  }
                }}
                currentLocation={userLocation || undefined}
                selectedLocation={bookingForm.pickupCoords}
                destinationLocation={bookingForm.destinationCoords}
              />
              
              {/* Enhanced GPS Status with Location Details */}
              <div className="absolute top-4 left-4 space-y-2">
                <Badge variant="outline" className="bg-background/95 backdrop-blur-sm text-xs border-0 shadow-lg px-3 py-1.5">
                  {userLocation ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-700 font-semibold">Live GPS</span>
                      {accuracy && (
                        <span className="text-green-600 text-xs">±{Math.round(accuracy)}m</span>
                      )}
                    </div>
                  ) : locationLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-blue-600 font-medium">Finding you...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Warning size={12} className="text-amber-500" />
                      <span className="text-amber-600 font-medium">Enable GPS</span>
                    </div>
                  )}
                </Badge>
                
                {/* Speed and Movement Info */}
                {userLocation && userSpeed !== null && userSpeed > 0 && (
                  <Badge variant="outline" className="bg-background/95 backdrop-blur-sm text-xs border-0 shadow-sm px-2 py-1">
                    <div className="flex items-center gap-1">
                      <Speedometer size={10} className="text-blue-500" />
                      <span className="text-blue-600">{Math.round(userSpeed * 3.6)} km/h</span>
                    </div>
                  </Badge>
                )}
              </div>
              
              {/* Enhanced Interactive Map Guide */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-border/20">
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {!bookingForm.pickup ? 'Tap map to set pickup location' : 
                       !bookingForm.destination ? 'Tap map to set destination' : 
                       'Locations set - ready to book!'}
                    </p>
                    {userLocation && (
                      <p className="text-xs text-muted-foreground">
                        📍 {userAddress ? userAddress.split(',')[0] : 'Getting address...'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Quick Action Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-3">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-12 h-12 p-0 bg-background/95 backdrop-blur-sm shadow-lg rounded-full border-0 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  title="Find my location"
                >
                  {locationLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Crosshair size={18} className={userLocation ? 'text-green-600' : ''} />
                  )}
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-12 h-12 p-0 bg-background/95 backdrop-blur-sm shadow-lg rounded-full border-0 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  onClick={() => setShowFullMap(true)}
                  title="Open full map"
                >
                  <MagnifyingGlass size={18} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Current Location Display with Actions */}
        {userLocation && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/8 to-accent/8 ring-1 ring-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0 relative">
                    <Compass size={16} className="text-primary" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-background animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">Your Current Location</p>
                      {accuracy && accuracy < 50 && (
                        <Badge variant="outline" className="h-5 px-1.5 text-xs bg-green-50 text-green-700 border-green-200">
                          High accuracy
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate leading-tight">
                      {userAddress || 'Getting precise address...'}
                    </p>
                    {accuracy && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Accurate to ±{Math.round(accuracy)} meters
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 px-4 text-sm shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  onClick={() => {
                    if (userAddress && userLocation) {
                      setBookingForm(prev => ({
                        ...prev,
                        pickup: userAddress,
                        pickupCoords: userLocation
                      }))
                      showPassengerStatus("📍 Using your current location as pickup", 'success')
                    }
                  }}
                >
                  Use as Pickup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rest of the component continues... */}
        {/* Booking Form, Ride Options, etc. */}
        
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
              <LeafletMap
                onLocationSelect={(location) => {
                  if (!bookingForm.pickup) {
                    setBookingForm(prev => ({
                      ...prev,
                      pickup: location.address,
                      pickupCoords: { lat: location.lat, lng: location.lng }
                    }))
                  } else if (!bookingForm.destination) {
                    setBookingForm(prev => ({
                      ...prev,
                      destination: location.address,
                      destinationCoords: { lat: location.lat, lng: location.lng }
                    }))
                  }
                  setShowFullMap(false)
                }}
                currentLocation={userLocation || undefined}
                selectedLocation={bookingForm.pickupCoords}
                destinationLocation={bookingForm.destinationCoords}
              />
              <div className="p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground text-center">
                  Tap anywhere on the map to set your {!bookingForm.pickup ? 'pickup location' : 'destination'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}