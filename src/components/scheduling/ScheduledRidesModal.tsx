import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Calendar, Clock, MapPin, Car } from "@phosphor-icons/react"
import { toast } from 'sonner'
import { Input as LocationInput } from "@/components/ui/input"
import { rideServices } from '../../constants/ride-services'
import { ScheduledRide, Location } from '../../types'
import LeafletMap from '../LeafletMap'

interface ScheduledRidesModalProps {
  isOpen: boolean
  onClose: () => void
  onScheduleRide: (ride: Omit<ScheduledRide, 'id' | 'userId'>) => void
  scheduledRides: ScheduledRide[]
  onCancelRide: (rideId: string) => void
}

export const ScheduledRidesModal: React.FC<ScheduledRidesModalProps> = ({
  isOpen,
  onClose,
  onScheduleRide,
  scheduledRides,
  onCancelRide
}) => {
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [mapMode, setMapMode] = useState<'pickup' | 'dropoff'>('pickup')
  const [formData, setFormData] = useState({
    pickupLocation: '',
    pickupCoords: null as Location | null,
    dropoffLocation: '',
    dropoffCoords: null as Location | null,
    pickupDateTime: '',
    serviceType: '',
    notes: ''
  })

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    if (mapMode === 'pickup') {
      setFormData(prev => ({
        ...prev,
        pickupLocation: location.address,
        pickupCoords: { lat: location.lat, lng: location.lng }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        dropoffLocation: location.address,
        dropoffCoords: { lat: location.lat, lng: location.lng }
      }))
    }
    setShowMap(false)
    toast.success(`${mapMode === 'pickup' ? 'Pickup' : 'Dropoff'} location selected`)
  }

  const handleScheduleRide = () => {
    // Validation
    if (!formData.pickupLocation || !formData.dropoffLocation || !formData.pickupDateTime || !formData.serviceType) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!formData.pickupCoords || !formData.dropoffCoords) {
      toast.error("Please select valid locations from the suggestions")
      return
    }

    const pickupTime = new Date(formData.pickupDateTime)
    if (pickupTime <= new Date()) {
      toast.error("Pickup time must be in the future")
      return
    }

    const scheduledRide: Omit<ScheduledRide, 'id' | 'userId'> = {
      pickupLocation: formData.pickupLocation,
      pickupCoords: formData.pickupCoords,
      dropoffLocation: formData.dropoffLocation,
      dropoffCoords: formData.dropoffCoords,
      pickupTimeISO: pickupTime.toISOString(),
      status: 'scheduled',
      serviceType: formData.serviceType,
      notes: formData.notes || undefined
    }

    onScheduleRide(scheduledRide)
    
    // Reset form
    setFormData({
      pickupLocation: '',
      pickupCoords: null,
      dropoffLocation: '',
      dropoffCoords: null,
      pickupDateTime: '',
      serviceType: '',
      notes: ''
    })
    setShowScheduleForm(false)
    toast.success("📅 Ride scheduled successfully!")
  }

  const upcomingRides = scheduledRides
    .filter(ride => new Date(ride.pickupTimeISO) > new Date() && ride.status === 'scheduled')
    .sort((a, b) => new Date(a.pickupTimeISO).getTime() - new Date(b.pickupTimeISO).getTime())

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-bold">Scheduled Rides</h2>
              <p className="text-sm text-muted-foreground">Plan your rides in advance</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="w-9 h-9 rounded-full">
              <X size={18} />
            </Button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {!showScheduleForm ? (
              <div className="p-6 space-y-6">
                {/* Schedule New Ride Button */}
                <Button 
                  onClick={() => setShowScheduleForm(true)}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <Calendar size={18} className="mr-2" />
                  Schedule New Ride
                </Button>

                {/* Upcoming Rides List */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Upcoming Rides</h3>
                  
                  {upcomingRides.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar size={48} className="text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-semibold text-lg mb-2">No scheduled rides</h4>
                      <p className="text-muted-foreground mb-4">Schedule your first ride to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingRides.map((ride) => {
                        const service = rideServices.find(s => s.id === ride.serviceType)
                        const pickupDate = new Date(ride.pickupTimeISO)
                        
                        return (
                          <Card key={ride.id} className="border shadow-sm">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    {service && <service.icon size={20} className="text-primary" />}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{service?.name || 'Unknown Service'}</h4>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Clock size={14} />
                                      <span>
                                        {pickupDate.toLocaleDateString('en-GB', { 
                                          day: 'numeric', 
                                          month: 'short',
                                          year: 'numeric'
                                        })} at {pickupDate.toLocaleTimeString('en-GB', { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Scheduled
                                </Badge>
                              </div>

                              <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm truncate">{ride.pickupLocation}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span className="text-sm truncate">{ride.dropoffLocation}</span>
                                </div>
                              </div>

                              {ride.notes && (
                                <div className="mb-4 p-2 bg-muted/50 rounded-md">
                                  <p className="text-sm text-muted-foreground">{ride.notes}</p>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs"
                                  onClick={() => {
                                    // Would open edit form in real implementation
                                    toast.info("Edit functionality coming soon")
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs text-destructive hover:text-destructive"
                                  onClick={() => {
                                    onCancelRide(ride.id)
                                    toast.success("Ride cancelled")
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Schedule Form */
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowScheduleForm(false)}
                    className="w-9 h-9 rounded-full"
                  >
                    ←
                  </Button>
                  <div>
                    <h3 className="font-semibold text-lg">Schedule New Ride</h3>
                    <p className="text-sm text-muted-foreground">Plan your future journey</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Pickup Location */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pickup Location *</label>
                    <div className="flex gap-2">
                      <LocationInput
                        value={formData.pickupLocation}
                        onChange={(e) => {
                          const value = e.target.value
                          setFormData(prev => ({ 
                            ...prev, 
                            pickupLocation: value,
                            pickupCoords: value.trim() ? { lat: 51.5074, lng: -0.1278 } : null
                          }))
                        }}
                        placeholder="Enter pickup location"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setMapMode('pickup')
                          setShowMap(true)
                        }}
                      >
                        <MapPin size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Dropoff Location */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Destination *</label>
                    <div className="flex gap-2">
                      <LocationInput
                        value={formData.dropoffLocation}
                        onChange={(e) => {
                          const value = e.target.value
                          setFormData(prev => ({ 
                            ...prev, 
                            dropoffLocation: value,
                            dropoffCoords: value.trim() ? { lat: 51.5074, lng: -0.1278 } : null
                          }))
                        }}
                        placeholder="Enter destination"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setMapMode('dropoff')
                          setShowMap(true)
                        }}
                      >
                        <MapPin size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Pickup Date & Time */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pickup Date & Time *</label>
                    <Input
                      type="datetime-local"
                      value={formData.pickupDateTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, pickupDateTime: e.target.value }))}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full"
                    />
                  </div>

                  {/* Service Type */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Service Type *</label>
                    <Select value={formData.serviceType} onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {rideServices.map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex items-center gap-2">
                              <service.icon size={16} />
                              <span>{service.name}</span>
                              <span className="text-xs text-muted-foreground">({service.priceRange})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any special instructions or notes..."
                      className="w-full"
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowScheduleForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleScheduleRide}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      <Calendar size={16} className="mr-2" />
                      Schedule Ride
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[80vh]">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="font-semibold">Select {mapMode === 'pickup' ? 'Pickup' : 'Dropoff'} Location</h3>
                  <p className="text-sm text-muted-foreground">Click on the map to select a location</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowMap(false)} className="w-9 h-9 rounded-full">
                  <X size={18} />
                </Button>
              </div>
              <div className="h-[500px]">
                <LeafletMap
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={mapMode === 'pickup' ? formData.pickupCoords : formData.dropoffCoords}
                  isTrackingMode={false}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}