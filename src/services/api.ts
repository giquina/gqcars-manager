// API service layer for future backend integration

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error?: string
  message?: string
}

export interface ApiError {
  message: string
  code?: string | number
  details?: any
}

export class ApiClient {
  private baseUrl: string
  private headers: HeadersInit

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
    this.headers = {
      'Content-Type': 'application/json'
    }
  }

  setAuthToken(token: string) {
    this.headers = {
      ...this.headers,
      Authorization: `Bearer ${token}`
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: this.headers,
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data,
        message: 'Success'
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create default API client instance
export const apiClient = new ApiClient()

// Service interfaces for future implementation
export interface TripsService {
  createTrip(tripData: any): Promise<ApiResponse<any>>
  getTrip(tripId: string): Promise<ApiResponse<any>>
  updateTripStatus(tripId: string, status: string): Promise<ApiResponse<any>>
  getTripHistory(userId: string): Promise<ApiResponse<any[]>>
}

export interface DriversService {
  getNearbyDrivers(location: { lat: number; lng: number }): Promise<ApiResponse<any[]>>
  getDriverDetails(driverId: string): Promise<ApiResponse<any>>
  assignDriver(tripId: string, driverId: string): Promise<ApiResponse<any>>
}

export interface PaymentsService {
  processPayment(tripId: string, paymentMethod: string): Promise<ApiResponse<any>>
  getPaymentMethods(userId: string): Promise<ApiResponse<any[]>>
  addPaymentMethod(userId: string, paymentData: any): Promise<ApiResponse<any>>
}

export interface ScheduledRidesService {
  createScheduledRide(rideData: any): Promise<ApiResponse<any>>
  getScheduledRides(userId: string): Promise<ApiResponse<any[]>>
  updateScheduledRide(rideId: string, rideData: any): Promise<ApiResponse<any>>
  cancelScheduledRide(rideId: string): Promise<ApiResponse<any>>
}

export interface EmergencyContactsService {
  getEmergencyContacts(userId: string): Promise<ApiResponse<any[]>>
  addEmergencyContact(userId: string, contactData: any): Promise<ApiResponse<any>>
  updateEmergencyContact(contactId: string, contactData: any): Promise<ApiResponse<any>>
  deleteEmergencyContact(contactId: string): Promise<ApiResponse<any>>
}

export interface CompanyAccountsService {
  getCompanyAccount(userId: string): Promise<ApiResponse<any>>
  getCompanyInvoices(companyId: string): Promise<ApiResponse<any[]>>
  getUsageMetrics(companyId: string, period: string): Promise<ApiResponse<any>>
}

// Mock implementations for development
export const mockTripsService: TripsService = {
  async createTrip(tripData: any) {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    return { success: true, data: { id: Date.now(), ...tripData }, message: 'Trip created' }
  },
  
  async getTrip(tripId: string) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true, data: { id: tripId, status: 'in_progress' }, message: 'Trip retrieved' }
  },
  
  async updateTripStatus(tripId: string, status: string) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return { success: true, data: { id: tripId, status }, message: 'Trip updated' }
  },
  
  async getTripHistory(userId: string) {
    await new Promise(resolve => setTimeout(resolve, 800))
    return { success: true, data: [], message: 'Trip history retrieved' }
  }
}

export const mockDriversService: DriversService = {
  async getNearbyDrivers(location: { lat: number; lng: number }) {
    await new Promise(resolve => setTimeout(resolve, 1200))
    return { success: true, data: [], message: 'Nearby drivers retrieved' }
  },
  
  async getDriverDetails(driverId: string) {
    await new Promise(resolve => setTimeout(resolve, 400))
    return { success: true, data: { id: driverId, name: 'Mock Driver' }, message: 'Driver details retrieved' }
  },
  
  async assignDriver(tripId: string, driverId: string) {
    await new Promise(resolve => setTimeout(resolve, 600))
    return { success: true, data: { tripId, driverId }, message: 'Driver assigned' }
  }
}

// Error handling utilities
export class ApiError extends Error {
  code?: string | number
  details?: any

  constructor(message: string, code?: string | number, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.details = details
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error
  }
  
  if (error instanceof Error) {
    return new ApiError(error.message)
  }
  
  return new ApiError('Unknown API error occurred')
}

// Retry utility for failed requests
export const withRetry = async <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<ApiResponse<T>> => {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall()
      if (result.success) {
        return result
      }
      lastError = result.error
    } catch (error) {
      lastError = error
    }

    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  return {
    success: false,
    data: null,
    error: `Failed after ${maxRetries} attempts: ${lastError}`
  }
}