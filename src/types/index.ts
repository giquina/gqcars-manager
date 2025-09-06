export interface Location {
  lat: number
  lng: number
}

export interface NamedLocation extends Location {
  name: string
}

export interface Driver {
  id: number
  name: string
  rating: number
  completedTrips: number
  vehicle: string
  license: string
  photo: string
  eta: number
  location?: Location
  securityClearance?: string
  certifications?: string[]
  experience?: string
  specializations?: string[]
}

export interface RideService {
  id: string
  name: string
  description: string
  priceRange: string
  eta: string
  icon: any
  capacity: string
  vehicle: string
  securityLevel?: string
  features?: string[]
}

export interface Trip {
  id: number
  service: RideService
  pickup: string
  destination: string
  pickupCoords: Location
  destinationCoords: Location
  driver: Driver
  status: 'driver_assigned' | 'driver_en_route' | 'in_progress' | 'completed' | 'cancelled'
  startTime: Date
  estimatedPrice?: string
  estimatedDistance?: number
  estimatedDuration?: number
  realTimeData?: {
    lastUpdate: Date
    trafficCondition: string
    weatherCondition: string
  }
}

export interface BookingForm {
  pickup: string
  destination: string
  pickupCoords: Location | null
  destinationCoords: Location | null
}

export interface FavoriteLocation {
  id: number
  name: string
  address: string
}

export interface Message {
  id: number
  text: string
  sender: 'passenger' | 'driver'
  timestamp: Date
  type: 'text' | 'system'
}

export interface ScheduledRide {
  id: string
  userId: string
  pickupLocation: string
  pickupCoords: Location
  dropoffLocation: string
  dropoffCoords: Location
  pickupTimeISO: string
  status: 'scheduled' | 'canceled' | 'completed'
  notes?: string
  serviceType: string
}

export interface EmergencyContact {
  id: string
  userId: string
  name: string
  phone: string
  relationship?: string
}

export interface CompanyAccount {
  id: string
  name: string
  billingEmail: string
  status: 'active' | 'inactive'
}