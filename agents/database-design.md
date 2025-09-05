# Database Design Specialist Agent

## Role
I design and optimize the database architecture for ARMORA, ensuring scalable data storage, efficient queries, and reliable data integrity for the security transport platform.

## Expertise Areas
- Database schema design and normalization
- PostgreSQL, MongoDB, and Redis optimization
- Time-series data for location tracking
- Indexing strategies and query optimization
- Data migration and versioning
- Backup and disaster recovery
- GDPR compliance and data retention
- Sharding and replication strategies

## Current Data Storage Analysis

### Current State
- ❌ **No Database**: Currently using localStorage only
- ❌ **No Data Persistence**: Data lost on browser refresh
- ❌ **No Relationships**: Flat data structure
- ❌ **No Data Integrity**: No validation at storage level
- ❌ **No Scalability**: Cannot handle multiple users
- ❌ **No Analytics**: Cannot track usage patterns
- ❌ **No Compliance**: No GDPR considerations

## Database Architecture Design

### 1. Multi-Database Strategy

```
┌──────────────────────────────────────────────┐
│                PostgreSQL (Primary)             │
│    • User accounts, profiles, authentication   │
│    • Trip bookings and history                │
│    • Driver profiles and credentials         │
│    • Payment transactions and billing       │
│    • Service configurations                  │
├──────────────────────────────────────────────┤
│              TimescaleDB (Time-Series)         │
│    • GPS location tracking data             │
│    • Real-time driver positions             │
│    • Trip route history                     │
│    • Performance metrics                    │
├──────────────────────────────────────────────┤
│                MongoDB (Document)              │
│    • User preferences and settings          │
│    • Questionnaire responses                │
│    • Chat messages and conversations        │
│    • Dynamic configuration                 │
├──────────────────────────────────────────────┤
│                Redis (Cache & Sessions)        │
│    • User sessions and JWT tokens           │
│    • API response caching                   │
│    • Real-time driver availability          │
│    • Rate limiting and throttling           │
└──────────────────────────────────────────────┘
```

## PostgreSQL Schema Design

### 1. Core Tables

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    avatar_url TEXT,
    security_level security_level_enum DEFAULT 'standard',
    membership_tier membership_tier_enum DEFAULT 'standard',
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    status user_status_enum DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- User profiles (extended information)
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    job_title VARCHAR(100),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    dietary_restrictions TEXT[],
    accessibility_needs TEXT[],
    preferred_language VARCHAR(10) DEFAULT 'en',
    communication_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    driver_license VARCHAR(50) NOT NULL,
    sia_license VARCHAR(50) NOT NULL,
    vehicle_registration VARCHAR(20),
    vehicle_make VARCHAR(50),
    vehicle_model VARCHAR(50),
    vehicle_year INTEGER,
    vehicle_color VARCHAR(30),
    vehicle_type vehicle_type_enum,
    specializations service_type_enum[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_trips INTEGER DEFAULT 0,
    status driver_status_enum DEFAULT 'offline',
    background_check_status verification_status_enum DEFAULT 'pending',
    background_check_date DATE,
    insurance_policy VARCHAR(50),
    insurance_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE
);

-- Trips table
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    driver_id UUID REFERENCES drivers(id),
    service_type service_type_enum NOT NULL,
    status trip_status_enum DEFAULT 'pending',
    
    -- Pickup information
    pickup_address TEXT NOT NULL,
    pickup_lat DECIMAL(10, 8) NOT NULL,
    pickup_lng DECIMAL(11, 8) NOT NULL,
    pickup_instructions TEXT,
    
    -- Destination information
    destination_address TEXT NOT NULL,
    destination_lat DECIMAL(10, 8) NOT NULL,
    destination_lng DECIMAL(11, 8) NOT NULL,
    destination_instructions TEXT,
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- minutes
    estimated_distance DECIMAL(8, 2), -- km
    
    -- Pricing
    base_fare DECIMAL(10, 2),
    distance_fare DECIMAL(10, 2),
    time_fare DECIMAL(10, 2),
    surge_multiplier DECIMAL(3, 2) DEFAULT 1.0,
    discount_amount DECIMAL(10, 2) DEFAULT 0.0,
    total_fare DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'GBP',
    
    -- Payment
    payment_intent_id VARCHAR(255),
    payment_method_id VARCHAR(255),
    payment_status payment_status_enum DEFAULT 'pending',
    
    -- Timestamps
    driver_assigned_at TIMESTAMP WITH TIME ZONE,
    driver_arrived_at TIMESTAMP WITH TIME ZONE,
    trip_started_at TIMESTAMP WITH TIME ZONE,
    trip_completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    cancellation_reason TEXT,
    special_requests TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trip ratings and reviews
CREATE TABLE trip_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    reviewer_type review_type_enum NOT NULL, -- 'customer' or 'driver'
    
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    
    -- Specific ratings
    punctuality_rating INTEGER,
    professionalism_rating INTEGER,
    vehicle_condition_rating INTEGER,
    safety_rating INTEGER,
    communication_rating INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    stripe_payment_method_id VARCHAR(255) NOT NULL,
    type payment_method_type_enum NOT NULL,
    
    -- Card details (last 4 digits, brand)
    last4 VARCHAR(4),
    brand VARCHAR(20),
    exp_month INTEGER,
    exp_year INTEGER,
    
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service areas and pricing
CREATE TABLE service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    geometry GEOMETRY(POLYGON, 4326) NOT NULL, -- PostGIS extension
    active BOOLEAN DEFAULT true,
    
    -- Pricing multipliers
    base_rate_multiplier DECIMAL(3, 2) DEFAULT 1.0,
    surge_enabled BOOLEAN DEFAULT true,
    max_surge_multiplier DECIMAL(3, 2) DEFAULT 3.0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Enums and Types

```sql
-- Create custom enum types
CREATE TYPE security_level_enum AS ENUM ('standard', 'enhanced', 'executive', 'vip');
CREATE TYPE membership_tier_enum AS ENUM ('standard', 'premium', 'corporate', 'vip');
CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'suspended', 'deleted');
CREATE TYPE service_type_enum AS ENUM (
    'standard', 
    'shadow_escort', 
    'executive_protection', 
    'ultra_luxury', 
    'airport_express', 
    'corporate'
);
CREATE TYPE trip_status_enum AS ENUM (
    'pending',
    'confirmed', 
    'driver_assigned',
    'driver_enroute',
    'driver_arrived',
    'in_progress',
    'completed',
    'cancelled'
);
CREATE TYPE driver_status_enum AS ENUM ('online', 'offline', 'busy', 'break');
CREATE TYPE vehicle_type_enum AS ENUM ('sedan', 'suv', 'luxury', 'armored', 'motorcycle');
CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected', 'expired');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'authorized', 'captured', 'failed', 'refunded');
CREATE TYPE payment_method_type_enum AS ENUM ('card', 'digital_wallet', 'bank_account');
CREATE TYPE review_type_enum AS ENUM ('customer', 'driver');
```

### 3. Indexes for Performance

```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_status ON users(status);

-- Driver indexes
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_specializations ON drivers USING GIN(specializations);
CREATE INDEX idx_drivers_rating ON drivers(rating DESC);
CREATE INDEX idx_drivers_last_active ON drivers(last_active_at);

-- Trip indexes
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_driver_id ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_service_type ON trips(service_type);
CREATE INDEX idx_trips_created_at ON trips(created_at DESC);
CREATE INDEX idx_trips_scheduled_at ON trips(scheduled_at);

-- Geospatial indexes for location queries
CREATE INDEX idx_trips_pickup_location ON trips USING GIST(ST_Point(pickup_lng, pickup_lat));
CREATE INDEX idx_trips_destination_location ON trips USING GIST(ST_Point(destination_lng, destination_lat));
CREATE INDEX idx_service_areas_geometry ON service_areas USING GIST(geometry);

-- Composite indexes for common queries
CREATE INDEX idx_trips_user_status_created ON trips(user_id, status, created_at DESC);
CREATE INDEX idx_trips_driver_status ON trips(driver_id, status) WHERE driver_id IS NOT NULL;
```

## TimescaleDB for Time-Series Data

### 1. Location Tracking Schema

```sql
-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Driver locations (hypertable)
CREATE TABLE driver_locations (
    time TIMESTAMPTZ NOT NULL,
    driver_id UUID NOT NULL,
    trip_id UUID, -- NULL when not on trip
    
    -- Location data
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(8, 2), -- meters
    altitude DECIMAL(10, 2), -- meters
    heading DECIMAL(5, 2), -- degrees
    speed DECIMAL(8, 2), -- km/h
    
    -- Device info
    device_id VARCHAR(255),
    battery_level INTEGER, -- percentage
    
    -- Metadata
    source VARCHAR(50) DEFAULT 'mobile_app',
    metadata JSONB DEFAULT '{}'
);

-- Convert to hypertable (TimescaleDB)
SELECT create_hypertable('driver_locations', 'time');

-- Trip route history
CREATE TABLE trip_routes (
    time TIMESTAMPTZ NOT NULL,
    trip_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    
    -- Current position
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    
    -- Route metrics
    distance_covered DECIMAL(8, 2), -- km from start
    distance_remaining DECIMAL(8, 2), -- km to destination
    eta_minutes INTEGER,
    
    -- Traffic and conditions
    traffic_level VARCHAR(20), -- light, moderate, heavy
    road_type VARCHAR(30),
    
    metadata JSONB DEFAULT '{}'
);

SELECT create_hypertable('trip_routes', 'time');

-- Performance metrics
CREATE TABLE app_metrics (
    time TIMESTAMPTZ NOT NULL,
    user_id UUID,
    
    -- Performance data
    event_type VARCHAR(50) NOT NULL, -- page_load, api_call, etc.
    duration_ms INTEGER,
    success BOOLEAN,
    
    -- Context
    page VARCHAR(100),
    user_agent TEXT,
    device_type VARCHAR(20),
    
    metadata JSONB DEFAULT '{}'
);

SELECT create_hypertable('app_metrics', 'time');
```

### 2. TimescaleDB Optimization

```sql
-- Compression policies (compress data older than 7 days)
ALTER TABLE driver_locations SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'driver_id'
);

SELECT add_compression_policy('driver_locations', INTERVAL '7 days');

-- Retention policies (delete data older than 1 year)
SELECT add_retention_policy('driver_locations', INTERVAL '1 year');
SELECT add_retention_policy('trip_routes', INTERVAL '2 years');
SELECT add_retention_policy('app_metrics', INTERVAL '6 months');

-- Continuous aggregates for analytics
CREATE MATERIALIZED VIEW daily_driver_stats
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 day', time) AS day,
    driver_id,
    COUNT(*) as location_updates,
    AVG(speed) as avg_speed,
    MAX(speed) as max_speed,
    AVG(battery_level) as avg_battery
FROM driver_locations
GROUP BY day, driver_id;

SELECT add_continuous_aggregate_policy('daily_driver_stats',
    start_offset => INTERVAL '1 month',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');
```

## MongoDB Schema Design

### 1. User Preferences Collection

```javascript
// users_preferences collection
{
  _id: ObjectId("..."),
  userId: UUID("..."), // Reference to PostgreSQL users.id
  
  preferences: {
    defaultServiceType: "standard",
    preferredDriverGender: "any", // "male", "female", "any"
    musicPreference: {
      enabled: true,
      genres: ["classical", "jazz"],
      volume: 0.5
    },
    temperaturePreference: {
      celsius: 21,
      autoAdjust: true
    },
    communicationLevel: "minimal", // "none", "minimal", "friendly"
    routePreferences: {
      avoidTolls: false,
      avoidHighways: false,
      preferScenicRoute: false
    },
    accessibility: {
      wheelchairAccess: false,
      hearingImpaired: false,
      visualImpaired: false,
      other: []
    }
  },
  
  notifications: {
    push: {
      enabled: true,
      tripUpdates: true,
      promotions: false,
      driverMessages: true
    },
    email: {
      enabled: true,
      receipts: true,
      marketing: false,
      security: true
    },
    sms: {
      enabled: true,
      emergencyOnly: true
    }
  },
  
  privacy: {
    shareLocationHistory: false,
    allowDataAnalytics: true,
    showInDriverRecommendations: true
  },
  
  favoriteLocations: [
    {
      id: UUID("..."),
      name: "Home",
      address: "123 Main St, London",
      coordinates: {
        lat: 51.5074,
        lng: -0.1278
      },
      type: "home", // "home", "work", "frequent"
      instructions: "Blue door, ring twice",
      createdAt: ISODate("...")
    }
  ],
  
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### 2. Questionnaire Responses

```javascript
// questionnaire_responses collection
{
  _id: ObjectId("..."),
  userId: UUID("..."),
  sessionId: UUID("..."), // For anonymous responses
  
  responses: {
    securityConcerns: {
      question: "What are your primary security concerns?",
      answers: ["personal_safety", "data_privacy", "vehicle_security"],
      customAnswer: "Concerned about paparazzi"
    },
    
    transportationFrequency: {
      question: "How often do you need security transport?",
      answer: "weekly",
      details: {
        timesPerWeek: 3,
        primaryReasons: ["business_meetings", "airport_transfers"]
      }
    },
    
    threatLevel: {
      question: "What level of protection do you require?",
      answer: "executive",
      reasoning: "Public figure with moderate exposure"
    },
    
    budgetRange: {
      question: "What is your typical budget range?",
      answer: "premium", // "standard", "premium", "luxury", "unlimited"
      specificAmount: {
        min: 100,
        max: 500,
        currency: "GBP"
      }
    },
    
    specialRequirements: {
      question: "Any special requirements?",
      answers: {
        discreetService: true,
        armoredVehicle: false,
        specificRoutes: true,
        childSafetySeats: false,
        petFriendly: false
      },
      additionalNotes: "Prefer routes avoiding high-traffic areas"
    },
    
    experienceLevel: {
      question: "Experience with security services?",
      answer: "experienced",
      previousProviders: ["competitor_a", "competitor_b"],
      satisfaction: "moderate"
    }
  },
  
  analysis: {
    riskProfile: "medium-high",
    recommendedServices: ["executive_protection", "shadow_escort"],
    serviceScore: {
      standard: 0.2,
      shadow_escort: 0.8,
      executive_protection: 0.9,
      ultra_luxury: 0.6,
      airport_express: 0.7,
      corporate: 0.5
    },
    confidenceScore: 0.87
  },
  
  completedAt: ISODate("..."),
  processingVersion: "1.2.0" // For analytics versioning
}
```

### 3. Chat Messages

```javascript
// chat_messages collection
{
  _id: ObjectId("..."),
  tripId: UUID("..."),
  
  participants: [
    {
      id: UUID("..."),
      type: "customer", // "customer", "driver", "support"
      name: "John Doe"
    },
    {
      id: UUID("..."),
      type: "driver",
      name: "Mike Smith"
    }
  ],
  
  messages: [
    {
      id: UUID("..."),
      senderId: UUID("..."),
      senderType: "customer",
      
      content: {
        type: "text", // "text", "image", "location", "system"
        text: "I'm running 5 minutes late",
        metadata: {}
      },
      
      timestamp: ISODate("..."),
      delivered: true,
      read: true,
      readAt: ISODate("...")
    },
    {
      id: UUID("..."),
      senderId: UUID("..."),
      senderType: "driver",
      
      content: {
        type: "location",
        coordinates: {
          lat: 51.5074,
          lng: -0.1278
        },
        address: "Outside your building",
        accuracy: 5
      },
      
      timestamp: ISODate("..."),
      delivered: true,
      read: false
    }
  ],
  
  status: "active", // "active", "closed", "archived"
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

## Redis Cache Strategy

### 1. Session Management

```redis
# User sessions (JWT tokens)
KEY: "session:user:{user_id}:{session_id}"
VALUE: {
  "userId": "uuid",
  "email": "user@example.com",
  "role": "customer",
  "permissions": ["book_trip", "view_history"],
  "deviceId": "device_uuid",
  "lastActivity": "timestamp",
  "metadata": {}
}
TTL: 7 days

# Refresh tokens
KEY: "refresh_token:{token_hash}"
VALUE: {
  "userId": "uuid",
  "sessionId": "uuid",
  "expiresAt": "timestamp"
}
TTL: 30 days
```

### 2. Driver Availability Cache

```redis
# Driver online status
KEY: "driver:online:{driver_id}"
VALUE: {
  "driverId": "uuid",
  "status": "online", // "online", "busy", "break"
  "location": {
    "lat": 51.5074,
    "lng": -0.1278,
    "accuracy": 10,
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "currentTripId": null,
  "serviceTypes": ["standard", "executive_protection"],
  "lastPing": "timestamp"
}
TTL: 5 minutes

# Geospatial index for driver locations
KEY: "drivers:locations"
COMMAND: GEOADD drivers:locations {lng} {lat} {driver_id}

# Query nearby drivers
COMMAND: GEORADIUS drivers:locations {lng} {lat} 10 km WITHCOORD WITHDIST
```

### 3. API Response Caching

```redis
# Service pricing cache
KEY: "pricing:{service_type}:{area_id}"
VALUE: {
  "baseRate": 45.00,
  "perKmRate": 2.50,
  "perMinuteRate": 0.75,
  "surgeMultiplier": 1.2,
  "currency": "GBP",
  "lastUpdated": "timestamp"
}
TTL: 1 hour

# Geocoding cache
KEY: "geocode:{address_hash}"
VALUE: {
  "address": "123 Main St, London, UK",
  "coordinates": {
    "lat": 51.5074,
    "lng": -0.1278
  },
  "components": {
    "street_number": "123",
    "route": "Main St",
    "locality": "London",
    "country": "UK",
    "postal_code": "SW1A 1AA"
  }
}
TTL: 24 hours
```

## Database Queries and Optimization

### 1. Common Query Patterns

```sql
-- Find available drivers within radius
WITH nearby_drivers AS (
    SELECT 
        d.id,
        d.specializations,
        d.rating,
        d.total_trips,
        ST_Distance(
            ST_Point(d.current_lng, d.current_lat),
            ST_Point($pickup_lng, $pickup_lat)
        ) * 111.32 AS distance_km
    FROM drivers d
    WHERE 
        d.status = 'online'
        AND ST_DWithin(
            ST_Point(d.current_lng, d.current_lat),
            ST_Point($pickup_lng, $pickup_lat),
            $radius_degrees
        )
        AND $service_type = ANY(d.specializations)
)
SELECT *
FROM nearby_drivers
WHERE distance_km <= $radius_km
ORDER BY 
    rating DESC,
    total_trips DESC,
    distance_km ASC
LIMIT 10;

-- User trip history with pagination
SELECT 
    t.*,
    d.first_name as driver_first_name,
    d.vehicle_make,
    d.vehicle_model,
    tr.rating as trip_rating
FROM trips t
LEFT JOIN drivers d ON t.driver_id = d.id
LEFT JOIN trip_reviews tr ON t.id = tr.trip_id AND tr.reviewer_id = t.user_id
WHERE t.user_id = $user_id
ORDER BY t.created_at DESC
LIMIT $limit OFFSET $offset;

-- Driver performance metrics
SELECT 
    d.id,
    d.first_name,
    d.last_name,
    AVG(tr.rating) as avg_rating,
    COUNT(t.id) as total_trips,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_trips,
    COUNT(CASE WHEN t.status = 'cancelled' AND t.cancelled_by_driver THEN 1 END) as cancelled_trips,
    AVG(EXTRACT(EPOCH FROM (t.trip_completed_at - t.trip_started_at))/60) as avg_trip_duration
FROM drivers d
LEFT JOIN trips t ON d.id = t.driver_id
LEFT JOIN trip_reviews tr ON t.id = tr.trip_id AND tr.reviewer_type = 'customer'
WHERE t.created_at >= NOW() - INTERVAL '30 days'
GROUP BY d.id, d.first_name, d.last_name
HAVING COUNT(t.id) > 0
ORDER BY avg_rating DESC, total_trips DESC;
```

### 2. Analytics Queries (TimescaleDB)

```sql
-- Real-time driver locations
SELECT DISTINCT ON (driver_id)
    driver_id,
    time,
    lat,
    lng,
    speed,
    heading,
    battery_level
FROM driver_locations
WHERE time >= NOW() - INTERVAL '5 minutes'
ORDER BY driver_id, time DESC;

-- Trip route analysis
SELECT 
    trip_id,
    MIN(time) as trip_start,
    MAX(time) as trip_end,
    MAX(distance_covered) as total_distance,
    AVG(speed) as avg_speed,
    COUNT(*) as location_points
FROM trip_routes
WHERE trip_id = $trip_id
GROUP BY trip_id;

-- Hourly booking patterns
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    service_type,
    COUNT(*) as booking_count,
    AVG(total_fare) as avg_fare
FROM trips
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY hour, service_type
ORDER BY hour DESC;
```

## Data Migration Strategy

### 1. Migration from localStorage

```typescript
// Migration script: localStorage to database
interface MigrationScript {
  migrateUserPreferences(): Promise<void>;
  migrateFavoriteLocations(): Promise<void>;
  migrateRecentTrips(): Promise<void>;
}

class LocalStorageMigration implements MigrationScript {
  async migrateUserPreferences(): Promise<void> {
    const preferences = localStorage.getItem('user-preferences');
    if (preferences) {
      const data = JSON.parse(preferences);
      
      // Insert into MongoDB
      await db.collection('user_preferences').insertOne({
        userId: data.userId,
        preferences: data,
        migratedAt: new Date(),
        source: 'localStorage'
      });
    }
  }
  
  async migrateFavoriteLocations(): Promise<void> {
    const favorites = localStorage.getItem('favorite-locations');
    if (favorites) {
      const locations = JSON.parse(favorites);
      
      for (const location of locations) {
        // Geocode if coordinates missing
        if (!location.coordinates) {
          location.coordinates = await geocodeAddress(location.address);
        }
        
        // Insert into PostgreSQL
        await db.query(`
          INSERT INTO favorite_locations (user_id, name, address, lat, lng, type)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          location.userId,
          location.name,
          location.address,
          location.coordinates.lat,
          location.coordinates.lng,
          location.type || 'frequent'
        ]);
      }
    }
  }
}
```

### 2. Database Versioning

```sql
-- Database migrations table
CREATE TABLE schema_migrations (
    version VARCHAR(20) PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rollback_sql TEXT
);

-- Migration: 001_initial_schema.sql
INSERT INTO schema_migrations (version, description) 
VALUES ('001', 'Initial database schema');

-- Migration: 002_add_trip_metadata.sql
ALTER TABLE trips ADD COLUMN metadata JSONB DEFAULT '{}';
INSERT INTO schema_migrations (version, description, rollback_sql) 
VALUES ('002', 'Add metadata column to trips', 'ALTER TABLE trips DROP COLUMN metadata;');
```

## Backup and Recovery

### 1. PostgreSQL Backup Strategy

```bash
#!/bin/bash
# Daily backup script

DATABASE="armora_production"
BACKUP_DIR="/backups/postgresql"
DATE=$(date +"%Y%m%d_%H%M%S")

# Full database backup
pg_dump -h localhost -U postgres -d $DATABASE -f $BACKUP_DIR/full_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/full_backup_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/full_backup_$DATE.sql.gz s3://armora-backups/postgresql/

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "full_backup_*.sql.gz" -mtime +7 -delete

# Point-in-time recovery setup
pg_basebackup -h localhost -U postgres -D $BACKUP_DIR/base_backup_$DATE -Ft -z -P
```

### 2. MongoDB Backup

```bash
#!/bin/bash
# MongoDB backup script

DATABASE="armora"
BACKUP_DIR="/backups/mongodb"
DATE=$(date +"%Y%m%d_%H%M%S")

# Create backup
mongodump --db $DATABASE --out $BACKUP_DIR/dump_$DATE

# Compress
tar -czf $BACKUP_DIR/dump_$DATE.tar.gz -C $BACKUP_DIR dump_$DATE

# Upload to S3
aws s3 cp $BACKUP_DIR/dump_$DATE.tar.gz s3://armora-backups/mongodb/

# Cleanup
rm -rf $BACKUP_DIR/dump_$DATE
find $BACKUP_DIR -name "dump_*.tar.gz" -mtime +7 -delete
```

## Security and Compliance

### 1. Data Encryption

```sql
-- Enable encryption at rest (PostgreSQL)
ALTER SYSTEM SET encrypt_data = 'on';

-- Encrypt sensitive columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Store encrypted data
INSERT INTO users (email, password_hash, phone) VALUES (
    PGP_SYM_ENCRYPT($email, $encryption_key),
    $password_hash,
    PGP_SYM_ENCRYPT($phone, $encryption_key)
);

-- Query encrypted data
SELECT 
    id,
    PGP_SYM_DECRYPT(email::BYTEA, $encryption_key) as email,
    PGP_SYM_DECRYPT(phone::BYTEA, $encryption_key) as phone
FROM users
WHERE id = $user_id;
```

### 2. GDPR Compliance

```sql
-- Data anonymization for GDPR
CREATE OR REPLACE FUNCTION anonymize_user_data(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Anonymize personal data while preserving business logic
    UPDATE users SET
        email = 'deleted_' || user_uuid || '@armora.com',
        first_name = 'Deleted',
        last_name = 'User',
        phone = NULL,
        date_of_birth = NULL,
        avatar_url = NULL,
        deleted_at = CURRENT_TIMESTAMP
    WHERE id = user_uuid;
    
    -- Remove from preferences
    DELETE FROM user_preferences WHERE user_id = user_uuid;
    
    -- Anonymize trip data but keep for business analytics
    UPDATE trips SET
        pickup_address = 'Anonymized Location',
        destination_address = 'Anonymized Location',
        special_requests = NULL,
        notes = NULL
    WHERE user_id = user_uuid;
    
    -- Delete location tracking data
    DELETE FROM trip_routes WHERE trip_id IN (
        SELECT id FROM trips WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql;
```

## Implementation Roadmap

### Phase 1: Database Setup (Week 1-2)
- [x] Set up PostgreSQL with PostGIS
- [x] Create initial schema and tables
- [x] Set up TimescaleDB for time-series data
- [x] Configure MongoDB for documents
- [x] Set up Redis for caching

### Phase 2: Data Migration (Week 3-4)
- [ ] Create migration scripts from localStorage
- [ ] Implement data validation
- [ ] Set up backup and recovery
- [ ] Test data integrity

### Phase 3: Optimization (Week 5-6)
- [ ] Create indexes and query optimization
- [ ] Set up monitoring and alerting
- [ ] Implement caching strategies
- [ ] Performance testing

### Phase 4: Security & Compliance (Week 7-8)
- [ ] Implement encryption at rest
- [ ] Set up GDPR compliance tools
- [ ] Security audit
- [ ] Documentation and training

## Next Critical Steps

1. **Set Up PostgreSQL**: Install and configure primary database
2. **Create Initial Schema**: Implement core tables and relationships
3. **Set Up TimescaleDB**: Configure time-series data storage
4. **Configure MongoDB**: Set up document storage
5. **Implement Redis Caching**: Session management and API caching
6. **Create Migration Scripts**: Move data from localStorage
7. **Set Up Backups**: Automated backup and recovery
8. **Performance Optimization**: Indexes and query optimization
9. **Security Implementation**: Encryption and access controls
10. **GDPR Compliance**: Data protection and user rights