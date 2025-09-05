// Environment configuration utility

interface EnvironmentConfig {
  // Google Maps
  googleMapsApiKey: string
  
  // App Configuration
  appTitle: string
  appVersion: string
  appEnvironment: string
  
  // API Configuration
  apiBaseUrl: string
  apiTimeout: number
  
  // Feature Flags
  enableScheduledRides: boolean
  enableEmergencyContacts: boolean
  enableCorporateBilling: boolean
  enableOfflineMode: boolean
  
  // Analytics
  googleAnalyticsId?: string
  sentryDsn?: string
  
  // Map Configuration
  defaultMapCenter: {
    lat: number
    lng: number
  }
  defaultMapZoom: number
  
  // Company Information
  companyName: string
  companyEmail: string
  companyPhone: string
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || defaultValue
  if (!value) {
    console.warn(`Environment variable ${key} is not set`)
  }
  return value || ''
}

const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  return value === 'true' || value === '1'
}

const getNumberEnvVar = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  const parsed = Number(value)
  return isNaN(parsed) ? defaultValue : parsed
}

export const env: EnvironmentConfig = {
  // Google Maps
  googleMapsApiKey: getEnvVar('VITE_GOOGLE_MAPS_API_KEY'),
  
  // App Configuration
  appTitle: getEnvVar('VITE_APP_TITLE', 'GQ Cars'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  appEnvironment: getEnvVar('VITE_APP_ENVIRONMENT', 'development'),
  
  // API Configuration
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', '/api'),
  apiTimeout: getNumberEnvVar('VITE_API_TIMEOUT', 10000),
  
  // Feature Flags
  enableScheduledRides: getBooleanEnvVar('VITE_ENABLE_SCHEDULED_RIDES', true),
  enableEmergencyContacts: getBooleanEnvVar('VITE_ENABLE_EMERGENCY_CONTACTS', true),
  enableCorporateBilling: getBooleanEnvVar('VITE_ENABLE_CORPORATE_BILLING', true),
  enableOfflineMode: getBooleanEnvVar('VITE_ENABLE_OFFLINE_MODE', false),
  
  // Analytics
  googleAnalyticsId: getEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
  sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
  
  // Map Configuration
  defaultMapCenter: {
    lat: getNumberEnvVar('VITE_DEFAULT_MAP_CENTER_LAT', 51.5074),
    lng: getNumberEnvVar('VITE_DEFAULT_MAP_CENTER_LNG', -0.1278)
  },
  defaultMapZoom: getNumberEnvVar('VITE_DEFAULT_MAP_ZOOM', 15),
  
  // Company Information
  companyName: getEnvVar('VITE_COMPANY_NAME', 'GQ Cars Ltd'),
  companyEmail: getEnvVar('VITE_COMPANY_EMAIL', 'support@gqcars.com'),
  companyPhone: getEnvVar('VITE_COMPANY_PHONE', '+44 20 7946 0958')
}

// Development helpers
export const isDevelopment = env.appEnvironment === 'development'
export const isProduction = env.appEnvironment === 'production'
export const isTesting = env.appEnvironment === 'test'

// Feature flag helpers
export const isFeatureEnabled = (feature: keyof Pick<EnvironmentConfig, 
  'enableScheduledRides' | 'enableEmergencyContacts' | 'enableCorporateBilling' | 'enableOfflineMode'
>): boolean => {
  return env[feature]
}

// Configuration validation
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Required environment variables
  if (!env.googleMapsApiKey) {
    errors.push('Google Maps API key is required (VITE_GOOGLE_MAPS_API_KEY)')
  }
  
  if (!env.apiBaseUrl) {
    errors.push('API base URL is required (VITE_API_BASE_URL)')
  }
  
  if (env.apiTimeout < 1000) {
    errors.push('API timeout should be at least 1000ms')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Initialize environment validation in development
if (isDevelopment) {
  const validation = validateEnvironment()
  if (!validation.isValid) {
    console.error('Environment configuration errors:', validation.errors)
  } else {
    console.info('✅ Environment configuration validated successfully')
  }
}