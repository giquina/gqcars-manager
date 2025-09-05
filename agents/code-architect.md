# Code Architecture Specialist Agent

## Role
I guide the architectural evolution of ARMORA from a monolithic structure to a scalable, maintainable codebase with proper separation of concerns, clean architecture patterns, and modern development practices.

## Expertise Areas
- Application architecture and design patterns
- Code organization and modular structure
- Component-driven development
- State management architecture
- API design and integration patterns
- TypeScript best practices
- Testing architecture
- Scalability and maintainability

## Current Architecture Analysis

### Critical Issues
- ❌ **Monolithic Structure**: Single 6,017-line App.tsx file
- ❌ **No Separation of Concerns**: UI, business logic, and data mixed
- ❌ **Poor Maintainability**: Changes require editing massive file
- ❌ **No Component Reusability**: Everything embedded inline
- ❌ **Tight Coupling**: Dependencies scattered throughout
- ❌ **No Clear Data Flow**: State management inconsistent
- ❌ **Missing Abstractions**: No service layer or repositories
- ❌ **No Error Boundaries**: Limited error handling

### Architectural Debt
1. **Technical Debt**: Massive refactoring needed
2. **Developer Experience**: Poor code navigation and debugging
3. **Testing Difficulty**: Hard to unit test components
4. **Scalability Issues**: Adding features becomes exponentially harder
5. **Code Reviews**: Nearly impossible to review large changes

## Target Architecture Design

### 1. Layered Architecture

```
┌────────────────────────────────────────────────┐
│                Presentation Layer                │
│    (Screens, Components, UI Logic)             │
├────────────────────────────────────────────────┤
│              Application Layer                 │
│      (Hooks, State Management)                │
├────────────────────────────────────────────────┤
│               Domain Layer                    │
│    (Business Logic, Entities, Rules)         │
├────────────────────────────────────────────────┤
│            Infrastructure Layer               │
│     (APIs, Storage, External Services)       │
└────────────────────────────────────────────────┘
```

### 2. Project Structure Redesign

```
src/
├── app/
│   ├── App.tsx                    # Root app component
│   ├── AppProviders.tsx           # Context providers
│   ├── AppRouter.tsx              # Routing configuration
│   └── store/                     # Global state management
│       ├── index.ts
│       ├── authStore.ts
│       ├── bookingStore.ts
│       └── userStore.ts
├── screens/                       # Screen components
│   ├── Welcome/
│   │   ├── WelcomeScreen.tsx
│   │   ├── WelcomeScreen.test.tsx
│   │   └── index.ts
│   ├── Questionnaire/
│   │   ├── QuestionnaireScreen.tsx
│   │   ├── components/
│   │   │   ├── QuestionCard.tsx
│   │   │   └── ProgressIndicator.tsx
│   │   └── hooks/
│   │       └── useQuestionnaire.ts
│   ├── Home/
│   │   ├── HomeScreen.tsx
│   │   ├── components/
│   │   │   ├── ServiceSelector/
│   │   │   ├── LocationPicker/
│   │   │   └── MapView/
│   │   └── hooks/
│   │       ├── useBooking.ts
│   │       └── useLocationSearch.ts
│   └── TripTracking/
│       ├── TripTrackingScreen.tsx
│       ├── components/
│       └── hooks/
├── components/                    # Shared components
│   ├── ui/                        # Basic UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── Toast/
│   ├── layout/                    # Layout components
│   │   ├── Header/
│   │   ├── Navigation/
│   │   └── Container/
│   └── features/                  # Feature-specific components
│       ├── ServiceCard/
│       ├── DriverCard/
│       ├── TripSummary/
│       └── PaymentForm/
├── domain/                       # Business logic
│   ├── entities/                  # Domain entities
│   │   ├── Trip.ts
│   │   ├── User.ts
│   │   ├── Driver.ts
│   │   └── Service.ts
│   ├── services/                  # Business services
│   │   ├── BookingService.ts
│   │   ├── PaymentService.ts
│   │   ├── LocationService.ts
│   │   └── NotificationService.ts
│   ├── repositories/              # Data access
│   │   ├── TripRepository.ts
│   │   ├── UserRepository.ts
│   │   └── DriverRepository.ts
│   └── validators/                # Business rules
│       ├── tripValidators.ts
│       └── userValidators.ts
├── infrastructure/               # External dependencies
│   ├── api/                       # API clients
│   │   ├── client.ts
│   │   ├── booking/
│   │   ├── payment/
│   │   └── maps/
│   ├── storage/                   # Data persistence
│   │   ├── localStorage.ts
│   │   └── cache.ts
│   └── external/                  # External services
│       ├── googleMaps.ts
│       ├── stripe.ts
│       └── firebase.ts
├── shared/                       # Shared utilities
│   ├── hooks/                     # Custom hooks
│   │   ├── useAsync.ts
│   │   ├── useLocalStorage.ts
│   │   └── useGeolocation.ts
│   ├── utils/                     # Utility functions
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   ├── types/                     # TypeScript types
│   │   ├── api.ts
│   │   ├── common.ts
│   │   └── domain.ts
│   └── config/                    # Configuration
│       ├── env.ts
│       └── constants.ts
└── assets/                       # Static assets
    ├── images/
    ├── icons/
    └── fonts/
```

## Domain Layer Design

### 1. Domain Entities

```typescript
// src/domain/entities/Trip.ts
export interface Trip {
  id: string;
  userId: string;
  driverId?: string;
  serviceType: ServiceType;
  pickup: Location;
  destination: Location;
  status: TripStatus;
  fare: Fare;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  metadata: TripMetadata;
}

export interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: LocationType;
  details?: {
    buildingName?: string;
    floor?: string;
    instructions?: string;
  };
}

export interface Fare {
  base: number;
  distance: number;
  time: number;
  surge?: number;
  discount?: number;
  total: number;
  currency: string;
  breakdown: FareBreakdown[];
}

export enum TripStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DRIVER_ASSIGNED = 'driver_assigned',
  DRIVER_ENROUTE = 'driver_enroute',
  DRIVER_ARRIVED = 'driver_arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ServiceType {
  STANDARD = 'standard',
  SHADOW_ESCORT = 'shadow_escort',
  EXECUTIVE_PROTECTION = 'executive_protection',
  ULTRA_LUXURY = 'ultra_luxury',
  AIRPORT_EXPRESS = 'airport_express',
  CORPORATE = 'corporate',
}
```

```typescript
// src/domain/entities/User.ts
export interface User {
  id: string;
  profile: UserProfile;
  preferences: UserPreferences;
  securityLevel: SecurityLevel;
  membership: MembershipTier;
  paymentMethods: PaymentMethod[];
  emergencyContacts: EmergencyContact[];
  verificationStatus: VerificationStatus;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: Date;
  avatar?: string;
  company?: CompanyInfo;
}

export interface UserPreferences {
  defaultServiceType: ServiceType;
  preferredDriverGender?: DriverGender;
  musicPreference?: MusicPreference;
  temperaturePreference?: TemperaturePreference;
  communicationLevel: CommunicationLevel;
  routePreferences: RoutePreference[];
}

export enum SecurityLevel {
  STANDARD = 'standard',
  ENHANCED = 'enhanced',
  EXECUTIVE = 'executive',
  VIP = 'vip',
}
```

### 2. Domain Services

```typescript
// src/domain/services/BookingService.ts
import { Trip, TripStatus, ServiceType } from '../entities/Trip';
import { TripRepository } from '../repositories/TripRepository';
import { DriverRepository } from '../repositories/DriverRepository';
import { PaymentService } from './PaymentService';
import { NotificationService } from './NotificationService';
import { validateTrip, calculateFare } from '../validators/tripValidators';

export class BookingService {
  constructor(
    private tripRepository: TripRepository,
    private driverRepository: DriverRepository,
    private paymentService: PaymentService,
    private notificationService: NotificationService
  ) {}

  async createBooking(bookingRequest: CreateBookingRequest): Promise<Trip> {
    // Validate booking request
    const validationResult = validateTrip(bookingRequest);
    if (!validationResult.isValid) {
      throw new BookingValidationError(validationResult.errors);
    }

    // Calculate fare
    const fare = await calculateFare(bookingRequest);

    // Create reservation payment
    const paymentIntent = await this.paymentService.createReservation(
      bookingRequest.userId,
      fare.reservationAmount
    );

    // Create trip entity
    const trip: Trip = {
      id: generateId(),
      userId: bookingRequest.userId,
      serviceType: bookingRequest.serviceType,
      pickup: bookingRequest.pickup,
      destination: bookingRequest.destination,
      status: TripStatus.PENDING,
      fare,
      scheduledAt: bookingRequest.scheduledAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        paymentIntentId: paymentIntent.id,
        source: 'mobile_app',
        requestedFeatures: bookingRequest.features,
      },
    };

    // Save trip
    const savedTrip = await this.tripRepository.save(trip);

    // Send confirmation notification
    await this.notificationService.sendBookingConfirmation(savedTrip);

    // Start driver assignment process
    this.assignDriver(savedTrip.id).catch(console.error);

    return savedTrip;
  }

  async assignDriver(tripId: string): Promise<void> {
    const trip = await this.tripRepository.findById(tripId);
    if (!trip) throw new TripNotFoundError(tripId);

    // Find available drivers
    const availableDrivers = await this.driverRepository.findAvailableDrivers({
      location: trip.pickup.coordinates,
      serviceType: trip.serviceType,
      radius: 10, // 10km radius
    });

    if (availableDrivers.length === 0) {
      await this.handleNoDriversAvailable(trip);
      return;
    }

    // Select best driver based on algorithm
    const selectedDriver = await this.selectBestDriver(availableDrivers, trip);

    // Assign driver
    trip.driverId = selectedDriver.id;
    trip.status = TripStatus.DRIVER_ASSIGNED;
    trip.updatedAt = new Date();

    await this.tripRepository.save(trip);

    // Notify driver and customer
    await Promise.all([
      this.notificationService.notifyDriverAssignment(selectedDriver, trip),
      this.notificationService.notifyCustomerDriverAssigned(trip, selectedDriver),
    ]);
  }

  private async selectBestDriver(
    drivers: Driver[],
    trip: Trip
  ): Promise<Driver> {
    // Driver selection algorithm
    const scoredDrivers = drivers.map(driver => ({
      driver,
      score: this.calculateDriverScore(driver, trip),
    }));

    scoredDrivers.sort((a, b) => b.score - a.score);
    return scoredDrivers[0].driver;
  }

  private calculateDriverScore(driver: Driver, trip: Trip): number {
    let score = 0;

    // Distance factor (closer is better)
    const distance = calculateDistance(driver.location, trip.pickup.coordinates);
    score += Math.max(0, 100 - distance * 10);

    // Rating factor
    score += driver.rating * 20;

    // Experience factor
    score += Math.min(driver.completedTrips / 10, 20);

    // Service specialization
    if (driver.specializations.includes(trip.serviceType)) {
      score += 30;
    }

    return score;
  }
}
```

### 3. Repository Pattern

```typescript
// src/domain/repositories/TripRepository.ts
import { Trip, TripStatus } from '../entities/Trip';

export interface TripRepository {
  save(trip: Trip): Promise<Trip>;
  findById(id: string): Promise<Trip | null>;
  findByUserId(userId: string, options?: FindOptions): Promise<Trip[]>;
  findByStatus(status: TripStatus): Promise<Trip[]>;
  updateStatus(id: string, status: TripStatus): Promise<void>;
  delete(id: string): Promise<void>;
}

interface FindOptions {
  limit?: number;
  offset?: number;
  sortBy?: keyof Trip;
  sortOrder?: 'asc' | 'desc';
}
```

```typescript
// src/infrastructure/repositories/ApiTripRepository.ts
import { Trip, TripStatus } from '../../domain/entities/Trip';
import { TripRepository } from '../../domain/repositories/TripRepository';
import { ApiClient } from '../api/client';

export class ApiTripRepository implements TripRepository {
  constructor(private apiClient: ApiClient) {}

  async save(trip: Trip): Promise<Trip> {
    const response = await this.apiClient.post('/trips', trip);
    return this.mapToEntity(response.data);
  }

  async findById(id: string): Promise<Trip | null> {
    try {
      const response = await this.apiClient.get(`/trips/${id}`);
      return this.mapToEntity(response.data);
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async findByUserId(userId: string, options: FindOptions = {}): Promise<Trip[]> {
    const params = {
      userId,
      limit: options.limit,
      offset: options.offset,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
    };

    const response = await this.apiClient.get('/trips', { params });
    return response.data.map(this.mapToEntity);
  }

  async findByStatus(status: TripStatus): Promise<Trip[]> {
    const response = await this.apiClient.get('/trips', {
      params: { status },
    });
    return response.data.map(this.mapToEntity);
  }

  async updateStatus(id: string, status: TripStatus): Promise<void> {
    await this.apiClient.patch(`/trips/${id}`, { status });
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.delete(`/trips/${id}`);
  }

  private mapToEntity(data: any): Trip {
    return {
      id: data.id,
      userId: data.user_id,
      driverId: data.driver_id,
      serviceType: data.service_type,
      pickup: {
        address: data.pickup_address,
        coordinates: {
          lat: data.pickup_lat,
          lng: data.pickup_lng,
        },
        type: data.pickup_type,
      },
      destination: {
        address: data.destination_address,
        coordinates: {
          lat: data.destination_lat,
          lng: data.destination_lng,
        },
        type: data.destination_type,
      },
      status: data.status,
      fare: data.fare,
      scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      metadata: data.metadata,
    };
  }
}
```

## State Management Architecture

### 1. Zustand Store Design

```typescript
// src/app/store/index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { AuthStore, createAuthStore } from './authStore';
import { BookingStore, createBookingStore } from './bookingStore';
import { UserStore, createUserStore } from './userStore';

export interface RootStore {
  auth: AuthStore;
  booking: BookingStore;
  user: UserStore;
}

export const useStore = create<RootStore>()()
  devtools(
    persist(
      immer((set, get) => ({
        auth: createAuthStore(set, get),
        booking: createBookingStore(set, get),
        user: createUserStore(set, get),
      })),
      {
        name: 'armora-store',
        partialize: (state) => ({
          auth: {
            token: state.auth.token,
            refreshToken: state.auth.refreshToken,
          },
          user: {
            profile: state.user.profile,
            preferences: state.user.preferences,
          },
        }),
      }
    ),
    { name: 'ARMORA Store' }
  )
);

// Typed selectors
export const useAuth = () => useStore(state => state.auth);
export const useBooking = () => useStore(state => state.booking);
export const useUser = () => useStore(state => state.user);
```

```typescript
// src/app/store/bookingStore.ts
import { Trip, TripStatus, ServiceType } from '../../domain/entities/Trip';
import { BookingService } from '../../domain/services/BookingService';
import { CreateBookingRequest } from '../../shared/types/api';

export interface BookingStore {
  // State
  currentTrip: Trip | null;
  recentTrips: Trip[];
  availableServices: ServiceType[];
  selectedService: ServiceType | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  createBooking: (request: CreateBookingRequest) => Promise<void>;
  selectService: (service: ServiceType) => void;
  clearSelectedService: () => void;
  updateTripStatus: (tripId: string, status: TripStatus) => void;
  loadRecentTrips: () => Promise<void>;
  cancelTrip: (tripId: string) => Promise<void>;
  clearError: () => void;
}

export const createBookingStore = (set: any, get: any): BookingStore => ({
  // Initial state
  currentTrip: null,
  recentTrips: [],
  availableServices: Object.values(ServiceType),
  selectedService: null,
  loading: false,
  error: null,
  
  // Actions
  createBooking: async (request: CreateBookingRequest) => {
    set((state: any) => {
      state.booking.loading = true;
      state.booking.error = null;
    });
    
    try {
      const bookingService = new BookingService(
        // Inject dependencies here
      );
      
      const trip = await bookingService.createBooking(request);
      
      set((state: any) => {
        state.booking.currentTrip = trip;
        state.booking.loading = false;
      });
    } catch (error) {
      set((state: any) => {
        state.booking.error = error.message;
        state.booking.loading = false;
      });
    }
  },
  
  selectService: (service: ServiceType) => {
    set((state: any) => {
      state.booking.selectedService = service;
    });
  },
  
  clearSelectedService: () => {
    set((state: any) => {
      state.booking.selectedService = null;
    });
  },
  
  updateTripStatus: (tripId: string, status: TripStatus) => {
    set((state: any) => {
      if (state.booking.currentTrip?.id === tripId) {
        state.booking.currentTrip.status = status;
      }
      
      const tripIndex = state.booking.recentTrips.findIndex(
        (trip: Trip) => trip.id === tripId
      );
      
      if (tripIndex !== -1) {
        state.booking.recentTrips[tripIndex].status = status;
      }
    });
  },
  
  loadRecentTrips: async () => {
    set((state: any) => {
      state.booking.loading = true;
    });
    
    try {
      // Load recent trips from repository
      const trips = await tripRepository.findByUserId(get().auth.userId);
      
      set((state: any) => {
        state.booking.recentTrips = trips;
        state.booking.loading = false;
      });
    } catch (error) {
      set((state: any) => {
        state.booking.error = error.message;
        state.booking.loading = false;
      });
    }
  },
  
  cancelTrip: async (tripId: string) => {
    try {
      await bookingService.cancelTrip(tripId);
      
      set((state: any) => {
        if (state.booking.currentTrip?.id === tripId) {
          state.booking.currentTrip.status = TripStatus.CANCELLED;
        }
      });
    } catch (error) {
      set((state: any) => {
        state.booking.error = error.message;
      });
    }
  },
  
  clearError: () => {
    set((state: any) => {
      state.booking.error = null;
    });
  },
});
```

## Component Architecture

### 1. Screen Component Pattern

```typescript
// src/screens/Home/HomeScreen.tsx
import React, { useEffect } from 'react';
import { useBooking, useUser } from '../../app/store';
import { ServiceSelector } from './components/ServiceSelector';
import { LocationPicker } from './components/LocationPicker';
import { MapView } from './components/MapView';
import { BookingForm } from './components/BookingForm';
import { useBooking as useBookingHook } from './hooks/useBooking';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const HomeScreen: React.FC = () => {
  const { selectedService, loading, error } = useBooking();
  const { profile } = useUser();
  const { handleBookingSubmit, isSubmitting } = useBookingHook();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <div className="home-screen">
        <header className="welcome-header">
          <h1>Welcome back, {profile?.firstName}</h1>
          <p>Where would you like to go?</p>
        </header>
        
        <main className="booking-content">
          <ServiceSelector />
          
          {selectedService && (
            <>
              <LocationPicker />
              <MapView />
              <BookingForm 
                onSubmit={handleBookingSubmit}
                loading={isSubmitting}
              />
            </>
          )}
        </main>
        
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
```

### 2. Feature Component Pattern

```typescript
// src/screens/Home/components/ServiceSelector/ServiceSelector.tsx
import React, { memo } from 'react';
import { ServiceType } from '../../../../domain/entities/Trip';
import { useBooking } from '../../../../app/store';
import { ServiceCard } from '../../../../components/features/ServiceCard';
import { getServiceDetails } from '../../../../shared/utils/serviceHelpers';

interface ServiceSelectorProps {
  className?: string;
  onServiceSelect?: (service: ServiceType) => void;
}

export const ServiceSelector = memo<ServiceSelectorProps>(({ 
  className = '',
  onServiceSelect 
}) => {
  const { availableServices, selectedService, selectService } = useBooking();
  
  const handleServiceSelect = (service: ServiceType) => {
    selectService(service);
    onServiceSelect?.(service);
  };
  
  return (
    <section className={`service-selector ${className}`}>
      <h2 className="service-selector__title">
        Choose Your Service
      </h2>
      
      <div className="service-selector__grid">
        {availableServices.map(service => {
          const details = getServiceDetails(service);
          
          return (
            <ServiceCard
              key={service}
              service={{
                type: service,
                ...details,
              }}
              selected={selectedService === service}
              onSelect={() => handleServiceSelect(service)}
            />
          );
        })}
      </div>
    </section>
  );
});

ServiceSelector.displayName = 'ServiceSelector';
```

### 3. Custom Hook Pattern

```typescript
// src/screens/Home/hooks/useBooking.ts
import { useState, useCallback } from 'react';
import { useBooking as useBookingStore } from '../../../app/store';
import { CreateBookingRequest } from '../../../shared/types/api';
import { useToast } from '../../../shared/hooks/useToast';
import { useNavigation } from '../../../shared/hooks/useNavigation';

export const useBooking = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createBooking, selectedService, clearError } = useBookingStore();
  const { showToast } = useToast();
  const { navigate } = useNavigation();
  
  const handleBookingSubmit = useCallback(
    async (bookingData: Omit<CreateBookingRequest, 'serviceType'>) => {
      if (!selectedService) {
        showToast('Please select a service', 'error');
        return;
      }
      
      setIsSubmitting(true);
      clearError();
      
      try {
        await createBooking({
          ...bookingData,
          serviceType: selectedService,
        });
        
        showToast('Booking created successfully!', 'success');
        navigate('/trip-tracking');
      } catch (error) {
        showToast('Failed to create booking. Please try again.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedService, createBooking, clearError, showToast, navigate]
  );
  
  return {
    handleBookingSubmit,
    isSubmitting,
  };
};
```

## Error Handling Architecture

### 1. Error Boundary System

```typescript
// src/shared/components/ErrorBoundary/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../../utils/errorLogging';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error
    logError(error, { 
      componentStack: errorInfo.componentStack,
      errorBoundary: true 
    });
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="error-boundary">
          <h2>Oops! Something went wrong</h2>
          <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="error-details">
              <summary>Error Details</summary>
              <pre>{this.state.error?.message}</pre>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </details>
          )}
          
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. Global Error Handler

```typescript
// src/shared/utils/errorLogging.ts
interface ErrorContext {
  userId?: string;
  userAgent?: string;
  url?: string;
  timestamp?: number;
  additionalInfo?: Record<string, any>;
}

export const logError = async (
  error: Error,
  context: ErrorContext = {}
) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...context,
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorLog);
  }
  
  // Send to error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }
};

// Global error handlers
window.addEventListener('error', (event) => {
  logError(event.error, {
    additionalInfo: {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    },
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
    additionalInfo: {
      type: 'unhandledrejection',
      reason: event.reason,
    },
  });
});
```

## Migration Implementation Plan

### Phase 1: Foundation (Week 1-2)
1. **Create new project structure**
2. **Set up domain layer with entities**
3. **Implement repository interfaces**
4. **Set up Zustand store architecture**
5. **Create basic component structure**

### Phase 2: Core Components (Week 3-4)
1. **Extract and refactor Welcome screen**
2. **Break down Questionnaire into components**
3. **Refactor Home screen architecture**
4. **Create reusable UI components**
5. **Implement error boundaries**

### Phase 3: Business Logic (Week 5-6)
1. **Implement domain services**
2. **Create API repositories**
3. **Migrate state management**
4. **Add proper error handling**
5. **Implement validation layer**

### Phase 4: Testing & Polish (Week 7-8)
1. **Add comprehensive unit tests**
2. **Integration testing**
3. **Performance optimization**
4. **Documentation**
5. **Code review and refinement**

## Migration Script

```typescript
// scripts/migrate-architecture.ts
import fs from 'fs/promises';
import path from 'path';

class ArchitectureMigrator {
  private readonly sourceFile = 'src/App.tsx';
  private readonly backupFile = 'src/App.backup.tsx';
  
  async migrate() {
    console.log('Starting architecture migration...');
    
    // 1. Create backup
    await this.createBackup();
    
    // 2. Create directory structure
    await this.createDirectoryStructure();
    
    // 3. Extract components
    await this.extractComponents();
    
    // 4. Create domain layer
    await this.createDomainLayer();
    
    // 5. Set up state management
    await this.setupStateManagement();
    
    // 6. Update imports and references
    await this.updateImports();
    
    console.log('Migration completed!');
  }
  
  private async createBackup() {
    const content = await fs.readFile(this.sourceFile, 'utf-8');
    await fs.writeFile(this.backupFile, content);
    console.log('✓ Backup created');
  }
  
  private async createDirectoryStructure() {
    const directories = [
      'src/app',
      'src/screens',
      'src/components/ui',
      'src/components/layout',
      'src/components/features',
      'src/domain/entities',
      'src/domain/services',
      'src/domain/repositories',
      'src/infrastructure/api',
      'src/infrastructure/storage',
      'src/shared/hooks',
      'src/shared/utils',
      'src/shared/types',
    ];
    
    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }
    
    console.log('✓ Directory structure created');
  }
  
  // Additional migration methods...
}

// Run migration
new ArchitectureMigrator().migrate().catch(console.error);
```

## Next Critical Steps

1. **Create Backup**: Backup current App.tsx before migration
2. **Set Up Directory Structure**: Create organized folder hierarchy
3. **Extract Domain Entities**: Define Trip, User, Driver entities
4. **Implement Repository Pattern**: Abstract data access layer
5. **Create Component Architecture**: Break down monolithic components
6. **Set Up State Management**: Implement Zustand stores
7. **Add Error Boundaries**: Proper error handling throughout app
8. **Create Migration Script**: Automate the refactoring process
9. **Add Unit Tests**: Test new architecture components
10. **Performance Optimization**: Ensure refactoring improves performance