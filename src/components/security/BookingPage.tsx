import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Navigation, 
  Clock,
  Shield,
  ArrowRight,
  Crosshair
} from "@phosphor-icons/react"
import { useKV } from '@github/spark/hooks'
import SecurityLevelSelection from './SecurityLevelSelection'

interface BookingState {
  pickupAddress: string
  destinationAddress: string
  selectedSecurityLevel: string | null
  estimatedPrice: string
  estimatedTime: string
}

const MapPlaceholder = ({ onLocationSelect, pickupAddress }: { 
  onLocationSelect: (lat: number, lng: number, address: string) => void
  pickupAddress: string
}) => {
  return (
    <div className="relative w-full h-80 bg-neutral-2 rounded-lg border overflow-hidden">
      {/* Map header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border">
          <div className="flex items-center gap-2 text-sm text-neutral-11">
            <MapPin className="w-4 h-4" />
            {pickupAddress || "Tap to select pickup location"}
          </div>
        </div>
      </div>
      
      {/* Placeholder map content */}
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Navigation className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-neutral-12">Interactive Map</p>
            <p className="text-sm text-neutral-11">Real-time location and routing</p>
          </div>
        </div>
      </div>
      
      {/* Current location button */}
      <button 
        onClick={() => onLocationSelect(51.5074, -0.1278, "Current Location")}
        className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg border flex items-center justify-center hover:bg-neutral-1 transition-colors"
      >
        <Crosshair className="w-5 h-5 text-neutral-11" />
      </button>
    </div>
  )
}

const BookingPage: React.FC = () => {
  const [bookingState, setBookingState] = useKV<BookingState>("security-booking", {
    pickupAddress: "",
    destinationAddress: "",
    selectedSecurityLevel: null,
    estimatedPrice: "",
    estimatedTime: ""
  })

  const [currentStep, setCurrentStep] = useState<'location' | 'security' | 'confirmation'>('location')
  const [isAddressLoading, setIsAddressLoading] = useState(false)

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setBookingState(prev => ({
      ...prev,
      pickupAddress: address
    }))
  }

  const handleAddressChange = (field: 'pickupAddress' | 'destinationAddress', value: string) => {
    setBookingState(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSecurityLevelSelect = (level: string, price: string, time: string) => {
    setBookingState(prev => ({
      ...prev,
      selectedSecurityLevel: level,
      estimatedPrice: price,
      estimatedTime: time
    }))
  }

  const canProceedToSecurity = bookingState.pickupAddress && bookingState.destinationAddress
  const canProceedToConfirmation = canProceedToSecurity && bookingState.selectedSecurityLevel

  const handleProceedToSecurity = () => {
    if (canProceedToSecurity) {
      setCurrentStep('security')
    }
  }

  const handleConfirmBooking = () => {
    if (canProceedToConfirmation) {
      setCurrentStep('confirmation')
      // Here you would typically send the booking to your backend
      console.log('Booking confirmed:', bookingState)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-1">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Security Transport</h1>
              <p className="text-sm text-neutral-11">Professional security services</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-4 py-4">
          <div className={`flex items-center gap-2 ${currentStep === 'location' ? 'text-primary' : currentStep === 'security' || currentStep === 'confirmation' ? 'text-green-600' : 'text-neutral-8'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'location' ? 'bg-primary text-white' : currentStep === 'security' || currentStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-neutral-3'}`}>
              1
            </div>
            <span className="text-sm font-medium hidden sm:block">Location</span>
          </div>
          <div className="w-8 h-px bg-neutral-4" />
          <div className={`flex items-center gap-2 ${currentStep === 'security' ? 'text-primary' : currentStep === 'confirmation' ? 'text-green-600' : 'text-neutral-8'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'security' ? 'bg-primary text-white' : currentStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-neutral-3'}`}>
              2
            </div>
            <span className="text-sm font-medium hidden sm:block">Security</span>
          </div>
          <div className="w-8 h-px bg-neutral-4" />
          <div className={`flex items-center gap-2 ${currentStep === 'confirmation' ? 'text-primary' : 'text-neutral-8'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'confirmation' ? 'bg-primary text-white' : 'bg-neutral-3'}`}>
              3
            </div>
            <span className="text-sm font-medium hidden sm:block">Confirm</span>
          </div>
        </div>

        {currentStep === 'location' && (
          <div className="space-y-6">
            {/* Map View */}
            <Card>
              <CardContent className="p-0">
                <MapPlaceholder 
                  onLocationSelect={handleLocationSelect}
                  pickupAddress={bookingState.pickupAddress}
                />
              </CardContent>
            </Card>

            {/* Address Inputs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Journey Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-12">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Enter pickup address..."
                      value={bookingState.pickupAddress}
                      onChange={(e) => handleAddressChange('pickupAddress', e.target.value)}
                      className="pl-10"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-8" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-12">
                    Destination
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Enter destination address..."
                      value={bookingState.destinationAddress}
                      onChange={(e) => handleAddressChange('destinationAddress', e.target.value)}
                      className="pl-10"
                    />
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-8" />
                  </div>
                </div>

                <Button 
                  onClick={handleProceedToSecurity}
                  disabled={!canProceedToSecurity}
                  className="w-full"
                  size="lg"
                >
                  Continue to Security Selection
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'security' && (
          <SecurityLevelSelection
            onSecurityLevelSelect={handleSecurityLevelSelect}
            selectedLevel={bookingState.selectedSecurityLevel}
            onBack={() => setCurrentStep('location')}
            onContinue={() => setCurrentStep('confirmation')}
          />
        )}

        {currentStep === 'confirmation' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Booking Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium">Journey</p>
                      <p className="text-sm text-neutral-11">
                        From: {bookingState.pickupAddress}
                      </p>
                      <p className="text-sm text-neutral-11">
                        To: {bookingState.destinationAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Security Level</p>
                      <p className="text-sm text-neutral-11">{bookingState.selectedSecurityLevel}</p>
                    </div>
                    <Badge variant="secondary">{bookingState.estimatedPrice}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Estimated Arrival</p>
                      <p className="text-sm text-neutral-11">{bookingState.estimatedTime}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('security')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleConfirmBooking}
                    className="flex-1"
                    size="lg"
                  >
                    Book Security Transport
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingPage