# React Native Migration Specialist Agent

## Role
I guide the technical migration from your current React web app to React Native, ensuring code reusability, platform optimization, and successful mobile app deployment.

## Expertise Areas
- React to React Native migration strategies
- Cross-platform code sharing
- Native module integration
- Platform-specific optimizations
- Performance optimization for mobile
- State management migration
- API integration for mobile
- Testing frameworks for React Native

## Migration Assessment

### Current Web App Analysis
**File:** `src/App.tsx` (6,017 lines)

#### Reusable Components (70%)
- Business logic and state management
- API calls and data handling
- Form validation and user flows
- Payment integration logic
- Map integration concepts

#### Platform-Specific Replacements (30%)
- DOM elements → React Native components
- CSS styling → StyleSheet API
- Browser APIs → React Native APIs
- Web navigation → React Navigation
- Local storage → AsyncStorage

## Migration Strategy

### Phase 1: Project Setup & Foundation

#### 1.1 Initialize React Native Project
```bash
# Create new React Native project
npx react-native@latest init ARMORAMobile --template react-native-template-typescript

cd ARMORAMobile

# Install essential dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated
npm install @react-native-async-storage/async-storage
npm install react-native-vector-icons

# iOS setup
cd ios && pod install && cd ..

# Test installation
npx react-native run-ios
npx react-native run-android
```

#### 1.2 Project Structure Setup
```
ARMORAMobile/
├── src/
│   ├── components/
│   │   ├── common/          # Shared UI components
│   │   ├── forms/           # Form components
│   │   └── layout/          # Layout components
│   ├── screens/
│   │   ├── Welcome/
│   │   ├── Questionnaire/
│   │   ├── Home/
│   │   ├── TripTracking/
│   │   └── Profile/
│   ├── navigation/
│   ├── services/        # API calls (shared with web)
│   ├── hooks/           # Custom hooks (shared)
│   ├── utils/           # Utilities (shared)
│   ├── types/           # TypeScript types (shared)
│   └── constants/       # App constants (shared)
├── shared/              # Shared code with web app
│   ├── business-logic/
│   ├── api/
│   └── types/
└── assets/
    ├── images/
    ├── fonts/
    └── icons/
```

### Phase 2: Core Components Migration

#### 2.1 Component Mapping Strategy

```typescript
// Web to React Native component mapping
const componentMapping = {
  // Layout
  'div': 'View',
  'span': 'Text', 
  'button': 'TouchableOpacity',
  'input': 'TextInput',
  'img': 'Image',
  'ul/ol': 'FlatList',
  'li': 'View',
  
  // Navigation
  'window.location': 'navigation.navigate()',
  'onClick': 'onPress',
  'onChange': 'onChangeText',
  
  // Storage
  'localStorage': 'AsyncStorage',
  'sessionStorage': 'AsyncStorage (with TTL)',
  
  // Styling
  'CSS classes': 'StyleSheet.create()',
  'CSS modules': 'Inline styles',
  'Tailwind': 'Custom style system'
};
```

#### 2.2 Base Components Library

```typescript
// src/components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false
}) => {
  return (
    <TouchableOpacity 
      style={[styles.button, styles[variant], disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: '#F59E0B',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: '#F59E0B',
  },
  dangerText: {
    color: 'white',
  },
});
```

#### 2.3 Navigation Setup

```typescript
// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import QuestionnaireScreen from '../screens/Questionnaire/QuestionnaireScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import TripTrackingScreen from '../screens/TripTracking/TripTrackingScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Account" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName="Welcome"
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="TripTracking" component={TripTrackingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### Phase 3: Screen Migration

#### 3.1 Welcome Screen Migration

```typescript
// src/screens/Welcome/WelcomeScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Button } from '../../components/common/Button';

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompleted = await AsyncStorage.getItem('armora-onboarding-complete');
      const isFirstLaunch = await AsyncStorage.getItem('armora-first-launch');
      
      if (hasCompleted === 'true' && isFirstLaunch !== 'true') {
        navigation.navigate('Main');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('armora-first-launch', 'false');
      navigation.navigate('Questionnaire');
    } catch (error) {
      console.error('Error updating first launch status:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      <View style={styles.content}>
        <Image 
          source={require('../../assets/images/armora-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>ARMORA</Text>
        <Text style={styles.subtitle}>Premium Security Transport</Text>
        
        <Text style={styles.description}>
          Professional security transport with SIA-licensed drivers for 
          executives, VIPs, and security-conscious travelers.
        </Text>
        
        <View style={styles.features}>
          {features.map((feature, index) => (
            <View key={index} style={styles.feature}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.footer}>
        <Button 
          title="Get Started" 
          onPress={handleGetStarted}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
};

const features = [
  { icon: '🛡️', text: 'SIA-Licensed Security Professionals' },
  { icon: '📍', text: 'Real-Time GPS Tracking' },
  { icon: '🚗', text: 'Premium Vehicle Fleet' },
  { icon: '📞', text: '24/7 Customer Support' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  features: {
    width: '100%',
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 14,
    color: '#D1D5DB',
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});

export default WelcomeScreen;
```

### Phase 4: Native Integrations

#### 4.1 Maps Integration

```typescript
// Install react-native-maps
npm install react-native-maps

// iOS: Add to Podfile
pod 'react-native-google-maps', :path => '../node_modules/react-native-maps'

// Android: Add API key to AndroidManifest.xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_API_KEY"/>
```

```typescript
// src/components/maps/MapView.tsx
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

interface MapProps {
  drivers?: Driver[];
  userLocation?: Location;
  onLocationChange?: (location: Location) => void;
}

export const AppMapView: React.FC<MapProps> = ({
  drivers = [],
  userLocation,
  onLocationChange
}) => {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onLocationChange?.(location);
        
        // Center map on user location
        mapRef.current?.animateToRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      },
      (error) => {
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyle}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={true}
      >
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            coordinate={{
              latitude: driver.location.lat,
              longitude: driver.location.lng,
            }}
            title={driver.name}
            description={`${driver.vehicle} - ${driver.eta} away`}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

const mapStyle = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  // Add more custom styling
];
```

#### 4.2 Push Notifications

```typescript
// Install Firebase
npm install @react-native-firebase/app @react-native-firebase/messaging

// src/services/notifications.ts
import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';

class NotificationService {
  async requestPermission() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const authStatus = await messaging().requestPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
             authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    }
  }

  async getToken() {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  setupMessageHandlers() {
    // Foreground messages
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message:', remoteMessage);
      this.showLocalNotification(remoteMessage);
    });

    // Background/Quit state messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message:', remoteMessage);
    });

    return unsubscribe;
  }

  private showLocalNotification(message: any) {
    // Show in-app notification
    // You can use a toast library or custom notification component
  }
}

export default new NotificationService();
```

#### 4.3 Payment Integration

```typescript
// Install Stripe React Native
npm install @stripe/stripe-react-native

// src/components/payments/PaymentForm.tsx
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import {
  CardField,
  useStripe,
  CardFieldInput,
} from '@stripe/stripe-react-native';

import { Button } from '../common/Button';

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: any) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onSuccess,
  onError
}) => {
  const { confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(null);

  const handlePayment = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Error', 'Please enter complete card details');
      return;
    }

    setLoading(true);

    try {
      // Create payment intent on your backend
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to pence
          currency: 'gbp',
        }),
      });

      const { client_secret } = await response.json();

      const { error, paymentIntent } = await confirmPayment(client_secret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        onError(error);
      } else {
        onSuccess(paymentIntent);
      }
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <CardField
        postalCodeEnabled={true}
        placeholders={{
          number: '4242 4242 4242 4242',
        }}
        cardStyle={{
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
        }}
        style={{
          width: '100%',
          height: 50,
          marginVertical: 20,
        }}
        onCardChange={(cardDetails) => {
          setCardDetails(cardDetails);
        }}
      />
      
      <Button
        title={`Pay £${amount}`}
        onPress={handlePayment}
        loading={loading}
        disabled={!cardDetails?.complete}
      />
    </View>
  );
};
```

### Phase 5: State Management Migration

#### 5.1 AsyncStorage Implementation

```typescript
// src/hooks/useAsyncStorage.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAsyncStorage = <T>(
  key: string,
  defaultValue: T
): [T, (value: T) => Promise<void>, boolean] => {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadValue();
  }, []);

  const loadValue = async () => {
    try {
      const storedValue = await AsyncStorage.getItem(key);
      if (storedValue !== null) {
        setValue(JSON.parse(storedValue));
      }
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const updateValue = async (newValue: T) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
      setValue(newValue);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  return [value, updateValue, loading];
};
```

#### 5.2 Context Migration

```typescript
// src/contexts/AppContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useAsyncStorage } from '../hooks/useAsyncStorage';

interface AppContextType {
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => Promise<void>;
  favorites: Location[];
  setFavorites: (locations: Location[]) => Promise<void>;
  recentTrips: Trip[];
  setRecentTrips: (trips: Trip[]) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useAsyncStorage(
    'armora-onboarding-complete',
    false
  );
  
  const [favorites, setFavorites] = useAsyncStorage<Location[]>(
    'favorite-locations',
    []
  );
  
  const [recentTrips, setRecentTrips] = useAsyncStorage<Trip[]>(
    'recent-trips',
    []
  );

  return (
    <AppContext.Provider
      value={{
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        favorites,
        setFavorites,
        recentTrips,
        setRecentTrips,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
```

### Phase 6: Testing & Quality Assurance

#### 6.1 Testing Setup

```json
// package.json - Testing dependencies
{
  "devDependencies": {
    "@testing-library/react-native": "^12.4.0",
    "@testing-library/jest-native": "^5.4.2",
    "jest": "^29.6.3",
    "detox": "^20.13.0"
  }
}
```

```typescript
// __tests__/screens/WelcomeScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import WelcomeScreen from '../../src/screens/Welcome/WelcomeScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders welcome screen correctly', () => {
    const { getByText } = render(<WelcomeScreen />);
    
    expect(getByText('ARMORA')).toBeTruthy();
    expect(getByText('Premium Security Transport')).toBeTruthy();
    expect(getByText('Get Started')).toBeTruthy();
  });

  test('navigates to questionnaire when get started is pressed', async () => {
    const { getByText } = render(<WelcomeScreen />);
    
    fireEvent.press(getByText('Get Started'));
    
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'armora-first-launch',
        'false'
      );
      expect(mockNavigate).toHaveBeenCalledWith('Questionnaire');
    });
  });
});
```

#### 6.2 E2E Testing with Detox

```javascript
// e2e/firstTest.e2e.js
describe('ARMORA App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show welcome screen on first launch', async () => {
    await expect(element(by.text('ARMORA'))).toBeVisible();
    await expect(element(by.text('Get Started'))).toBeVisible();
  });

  it('should navigate through onboarding flow', async () => {
    await element(by.text('Get Started')).tap();
    await expect(element(by.text('Security Assessment'))).toBeVisible();
    
    // Complete questionnaire
    await element(by.id('next-button')).tap();
    // ... continue through questionnaire steps
    
    await expect(element(by.text('Book Your Ride'))).toBeVisible();
  });

  it('should allow booking a ride', async () => {
    // Navigate to main screen
    await element(by.text('Skip')).tap();
    
    // Select pickup location
    await element(by.id('pickup-input')).tap();
    await element(by.id('pickup-input')).typeText('London Bridge Station');
    
    // Select destination
    await element(by.id('destination-input')).tap();
    await element(by.id('destination-input')).typeText('Heathrow Airport');
    
    // Select service
    await element(by.text('Standard Transport')).tap();
    
    // Book ride
    await element(by.text('Book Now')).tap();
    
    await expect(element(by.text('Finding Driver...'))).toBeVisible();
  });
});
```

### Phase 7: Performance Optimization

#### 7.1 Bundle Size Optimization

```javascript
// metro.config.js
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  transformer: {
    minifierConfig: {
      mangle: {
        keep_fnames: true,
      },
      output: {
        ascii_only: true,
        quote_keys: true,
        wrap_iife: true,
      },
      sourceMap: {
        includeSources: false,
      },
      toplevel: false,
      compress: {
        reduce_funcs: false,
      },
    },
  },
  resolver: {
    alias: {
      '@': './src',
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

#### 7.2 Memory Management

```typescript
// src/hooks/useMemoryOptimization.ts
import { useEffect, useRef } from 'react';

export const useMemoryOptimization = () => {
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const intervals = useRef<NodeJS.Timer[]>([]);
  const subscriptions = useRef<(() => void)[]>([]);

  const addTimeout = (callback: () => void, delay: number) => {
    const timeout = setTimeout(callback, delay);
    timeouts.current.push(timeout);
    return timeout;
  };

  const addInterval = (callback: () => void, delay: number) => {
    const interval = setInterval(callback, delay);
    intervals.current.push(interval);
    return interval;
  };

  const addSubscription = (unsubscribe: () => void) => {
    subscriptions.current.push(unsubscribe);
  };

  useEffect(() => {
    return () => {
      // Clean up timeouts
      timeouts.current.forEach(timeout => clearTimeout(timeout));
      
      // Clean up intervals
      intervals.current.forEach(interval => clearInterval(interval));
      
      // Clean up subscriptions
      subscriptions.current.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  return {
    addTimeout,
    addInterval,
    addSubscription,
  };
};
```

## Implementation Timeline

### Week 1-2: Foundation Setup
- [x] React Native project initialization
- [x] Basic navigation structure
- [x] Core component library
- [x] Shared code architecture

### Week 3-4: Screen Migration
- [ ] Welcome screen implementation
- [ ] Questionnaire screens
- [ ] Home/booking screen
- [ ] Trip tracking screen
- [ ] Profile screens

### Week 5-6: Native Integrations
- [ ] Google Maps integration
- [ ] Location services
- [ ] Push notifications
- [ ] Payment processing
- [ ] Device permissions

### Week 7-8: Testing & Polish
- [ ] Unit test implementation
- [ ] E2E test setup
- [ ] Performance optimization
- [ ] Platform-specific fixes
- [ ] App store preparation

## Code Sharing Strategy

### Shared Modules
```
shared/
├── api/
│   ├── booking.ts
│   ├── auth.ts
│   └── payments.ts
├── types/
│   ├── Trip.ts
│   ├── User.ts
│   └── Driver.ts
├── utils/
│   ├── validation.ts
│   ├── formatting.ts
│   └── constants.ts
└── hooks/
    ├── useDebounce.ts
    └── useGeolocation.ts
```

## Next Critical Steps

1. **Initialize React Native Project**: Set up development environment
2. **Create Shared Code Structure**: Extract reusable logic from web app
3. **Implement Navigation**: Set up React Navigation structure
4. **Build Core Components**: Create mobile-optimized UI components
5. **Migrate Key Screens**: Convert web screens to React Native
6. **Integrate Native Features**: Maps, location, notifications
7. **Set Up Testing**: Unit and E2E testing frameworks
8. **Optimize Performance**: Bundle size and runtime optimization
9. **Platform Testing**: iOS and Android compatibility
10. **Prepare for App Stores**: Build process and submission prep