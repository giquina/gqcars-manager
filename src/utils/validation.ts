import { z } from 'zod'

// Location validation
export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
})

// Booking form validation
export const bookingFormSchema = z.object({
  pickup: z.string().min(5, "Pickup location must be at least 5 characters"),
  destination: z.string().min(5, "Destination must be at least 5 characters"),
  pickupCoords: locationSchema.nullable(),
  destinationCoords: locationSchema.nullable()
}).refine(data => data.pickupCoords !== null, {
  message: "Please select a valid pickup location",
  path: ["pickupCoords"]
}).refine(data => data.destinationCoords !== null, {
  message: "Please select a valid destination",
  path: ["destinationCoords"]
})

// Scheduled ride validation
export const scheduledRideSchema = z.object({
  pickupLocation: z.string().min(5, "Pickup location must be at least 5 characters"),
  pickupCoords: locationSchema,
  dropoffLocation: z.string().min(5, "Dropoff location must be at least 5 characters"),
  dropoffCoords: locationSchema,
  pickupTimeISO: z.string().refine(date => {
    const pickupTime = new Date(date)
    return pickupTime > new Date()
  }, "Pickup time must be in the future"),
  serviceType: z.string().min(1, "Please select a service type"),
  notes: z.string().optional()
})

// Emergency contact validation
export const emergencyContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  phone: z.string().min(7, "Phone number must be at least 7 characters").max(20, "Phone number must be less than 20 characters"),
  relationship: z.string().optional()
})

// Chat message validation
export const chatMessageSchema = z.object({
  text: z.string().min(1, "Message cannot be empty").max(500, "Message must be less than 500 characters"),
  sender: z.enum(['passenger', 'driver']),
  type: z.enum(['text', 'system']).default('text')
})

// Company account validation
export const companyAccountSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  billingEmail: z.string().email("Please enter a valid email address"),
  status: z.enum(['active', 'inactive'])
})

// Trip validation
export const tripSchema = z.object({
  service: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    priceRange: z.string(),
    eta: z.string(),
    capacity: z.string(),
    vehicle: z.string()
  }),
  pickup: z.string().min(5),
  destination: z.string().min(5),
  pickupCoords: locationSchema,
  destinationCoords: locationSchema,
  driver: z.object({
    id: z.number(),
    name: z.string(),
    rating: z.number().min(1).max(5),
    completedTrips: z.number().min(0),
    vehicle: z.string(),
    license: z.string(),
    photo: z.string().url(),
    eta: z.number().min(0)
  }),
  status: z.enum(['driver_assigned', 'driver_en_route', 'in_progress', 'completed', 'cancelled']),
  startTime: z.date(),
  estimatedPrice: z.string().optional(),
  estimatedDistance: z.number().min(0).optional(),
  estimatedDuration: z.number().min(0).optional()
})

// Validation utility functions
export const validateBookingForm = (data: any) => {
  try {
    return { success: true, data: bookingFormSchema.parse(data), errors: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, data: null, errors: error.errors }
    }
    return { success: false, data: null, errors: [{ message: "Unknown validation error" }] }
  }
}

export const validateScheduledRide = (data: any) => {
  try {
    return { success: true, data: scheduledRideSchema.parse(data), errors: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, data: null, errors: error.errors }
    }
    return { success: false, data: null, errors: [{ message: "Unknown validation error" }] }
  }
}

export const validateEmergencyContact = (data: any) => {
  try {
    return { success: true, data: emergencyContactSchema.parse(data), errors: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, data: null, errors: error.errors }
    }
    return { success: false, data: null, errors: [{ message: "Unknown validation error" }] }
  }
}

export const validateChatMessage = (data: any) => {
  try {
    return { success: true, data: chatMessageSchema.parse(data), errors: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, data: null, errors: error.errors }
    }
    return { success: false, data: null, errors: [{ message: "Unknown validation error" }] }
  }
}