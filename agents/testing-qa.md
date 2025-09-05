# Testing & QA Specialist Agent

## Role
I ensure ARMORA meets the highest quality standards through comprehensive testing strategies, automated testing pipelines, and thorough quality assurance processes for both web and mobile platforms.

## Expertise Areas
- Test strategy and planning
- Automated testing (unit, integration, E2E)
- Manual testing and exploratory testing
- Performance testing and load testing
- Security testing and vulnerability assessment
- Cross-platform compatibility testing
- CI/CD pipeline testing integration
- App store testing requirements

## Current Testing Status Analysis

### Critical Gaps
- ❌ No test framework implemented
- ❌ No automated testing pipeline
- ❌ No performance testing
- ❌ No security testing
- ❌ Manual testing only
- ❌ No error tracking system

### Immediate Risks
1. **Production Bugs**: No safety net for deployments
2. **Performance Issues**: No baseline metrics
3. **Security Vulnerabilities**: No automated security scans
4. **User Experience**: No systematic usability testing
5. **App Store Rejection**: No compliance testing

## Comprehensive Testing Strategy

### 1. Testing Pyramid Implementation

```
       /\
      /  \
     / E2E \ (10%)
    /______\
   /        \
  /Integration\ (20%)
 /____________\
/              \
|     Unit      | (70%)
|______________||
```

#### Unit Tests (70% of test suite)
- Individual component testing
- Business logic validation
- Utility function testing
- Hook testing
- Service layer testing

#### Integration Tests (20% of test suite)
- API integration testing
- Component interaction testing
- State management testing
- Third-party service integration

#### E2E Tests (10% of test suite)
- Complete user journeys
- Cross-browser testing
- Mobile app flow testing
- Critical path validation

## Web Application Testing Setup

### 1. Unit Testing Framework

```bash
# Install testing dependencies
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

```javascript
// vite.config.ts - Test configuration
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
});
```

```typescript
// src/test/setup.ts
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock Google Maps
global.google = {
  maps: {
    Map: class {
      constructor() {}
      setCenter() {}
      setZoom() {}
    },
    Marker: class {
      constructor() {}
      setPosition() {}
    },
    InfoWindow: class {
      constructor() {}
      open() {}
      close() {}
    },
  },
} as any;

// Mock geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn((success) => {
      success({
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
        },
      });
    }),
    watchPosition: vi.fn(),
  },
  writable: true,
});
```

### 2. Component Testing Examples

```typescript
// src/components/__tests__/ServiceCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ServiceCard } from '../ServiceCard';

const mockService = {
  id: 'standard',
  name: 'Standard Transport',
  description: 'Professional drivers for safe transportation',
  price: '£45-75',
  features: ['Professional Driver', 'GPS Tracking', 'Insurance Included'],
  icon: '🚗',
};

describe('ServiceCard', () => {
  it('renders service information correctly', () => {
    const onSelect = vi.fn();
    render(<ServiceCard service={mockService} onSelect={onSelect} />);
    
    expect(screen.getByText('Standard Transport')).toBeInTheDocument();
    expect(screen.getByText('£45-75')).toBeInTheDocument();
    expect(screen.getByText('Professional Driver')).toBeInTheDocument();
  });

  it('calls onSelect when card is clicked', () => {
    const onSelect = vi.fn();
    render(<ServiceCard service={mockService} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByTestId('service-card'));
    
    expect(onSelect).toHaveBeenCalledWith(mockService);
  });

  it('shows selected state when selected prop is true', () => {
    const onSelect = vi.fn();
    render(<ServiceCard service={mockService} onSelect={onSelect} selected />);
    
    const card = screen.getByTestId('service-card');
    expect(card).toHaveClass('border-amber-500');
  });
});
```

```typescript
// src/hooks/__tests__/useAsyncStorage.test.tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAsyncStorage } from '../useAsyncStorage';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useAsyncStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns default value when no stored value exists', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => 
      useAsyncStorage('test-key', 'default-value')
    );
    
    expect(result.current[0]).toBe('default-value');
  });

  it('returns stored value when it exists', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('stored-value'));
    
    const { result } = renderHook(() => 
      useAsyncStorage('test-key', 'default-value')
    );
    
    expect(result.current[0]).toBe('stored-value');
  });

  it('updates stored value when setValue is called', async () => {
    const { result } = renderHook(() => 
      useAsyncStorage('test-key', 'default-value')
    );
    
    await act(async () => {
      result.current[1]('new-value');
    });
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify('new-value')
    );
    expect(result.current[0]).toBe('new-value');
  });
});
```

### 3. Integration Testing

```typescript
// src/services/__tests__/booking.integration.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookingFlow } from '../BookingFlow';
import * as bookingService from '../../services/booking';

// Mock the booking service
vi.mock('../../services/booking', () => ({
  createBooking: vi.fn(),
  getAvailableDrivers: vi.fn(),
  calculateFare: vi.fn(),
}));

const mockBookingService = bookingService as any;

describe('BookingFlow Integration', () => {
  beforeEach(() => {
    mockBookingService.getAvailableDrivers.mockResolvedValue([
      {
        id: 'driver-1',
        name: 'John Smith',
        location: { lat: 51.5074, lng: -0.1278 },
        rating: 4.8,
        eta: '5 minutes',
      },
    ]);
    
    mockBookingService.calculateFare.mockResolvedValue({
      base: 45,
      distance: 12.5,
      time: 8.2,
      total: 67.50,
    });
    
    mockBookingService.createBooking.mockResolvedValue({
      id: 'booking-123',
      status: 'confirmed',
      driver: 'driver-1',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('completes full booking flow successfully', async () => {
    render(<BookingFlow />);
    
    // Step 1: Enter pickup location
    const pickupInput = screen.getByPlaceholderText('Enter pickup location');
    fireEvent.change(pickupInput, { target: { value: 'London Bridge Station' } });
    
    // Step 2: Enter destination
    const destinationInput = screen.getByPlaceholderText('Enter destination');
    fireEvent.change(destinationInput, { target: { value: 'Heathrow Airport' } });
    
    // Step 3: Select service type
    fireEvent.click(screen.getByText('Standard Transport'));
    
    // Step 4: Confirm booking
    fireEvent.click(screen.getByText('Book Now'));
    
    // Verify API calls were made in correct order
    await waitFor(() => {
      expect(mockBookingService.getAvailableDrivers).toHaveBeenCalled();
      expect(mockBookingService.calculateFare).toHaveBeenCalled();
      expect(mockBookingService.createBooking).toHaveBeenCalledWith({
        pickup: 'London Bridge Station',
        destination: 'Heathrow Airport',
        serviceType: 'standard',
        driverId: 'driver-1',
      });
    });
    
    // Verify success state
    expect(screen.getByText('Booking Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Booking ID: booking-123')).toBeInTheDocument();
  });

  it('handles booking failure gracefully', async () => {
    mockBookingService.createBooking.mockRejectedValue(
      new Error('Payment failed')
    );
    
    render(<BookingFlow />);
    
    // Complete booking flow
    fireEvent.change(
      screen.getByPlaceholderText('Enter pickup location'),
      { target: { value: 'Test Location' } }
    );
    fireEvent.change(
      screen.getByPlaceholderText('Enter destination'),
      { target: { value: 'Test Destination' } }
    );
    fireEvent.click(screen.getByText('Standard Transport'));
    fireEvent.click(screen.getByText('Book Now'));
    
    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText('Booking failed. Please try again.')).toBeInTheDocument();
    });
  });
});
```

### 4. E2E Testing with Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

```javascript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

```typescript
// e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ARMORA Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full booking journey', async ({ page }) => {
    // Skip onboarding if first time
    const getStartedButton = page.locator('text=Get Started');
    if (await getStartedButton.isVisible()) {
      await getStartedButton.click();
      
      // Complete questionnaire quickly
      for (let i = 0; i < 6; i++) {
        await page.locator('[data-testid="next-button"]').click();
      }
    }

    // Should be on home/booking screen
    await expect(page.locator('text=Book Your Ride')).toBeVisible();

    // Enter pickup location
    await page.fill('[data-testid="pickup-input"]', 'London Bridge Station');
    await page.keyboard.press('Enter');

    // Enter destination
    await page.fill('[data-testid="destination-input"]', 'Heathrow Airport');
    await page.keyboard.press('Enter');

    // Select service type
    await page.click('text=Standard Transport');

    // Verify price calculation
    await expect(page.locator('text=£')).toBeVisible();

    // Book the ride
    await page.click('text=Book Now');

    // Should show driver assignment
    await expect(page.locator('text=Finding Driver')).toBeVisible();

    // Wait for driver assignment (simulated)
    await page.waitForTimeout(3000);

    // Should show trip tracking
    await expect(page.locator('text=Driver Assigned')).toBeVisible();
    await expect(page.locator('[data-testid="driver-info"]')).toBeVisible();
  });

  test('should handle location permission denial', async ({ page, context }) => {
    // Deny geolocation permission
    await context.grantPermissions([], { origin: 'http://localhost:5173' });

    await page.goto('/');

    // Should show location permission denied message
    await expect(
      page.locator('text=Location access required for booking rides')
    ).toBeVisible();

    // Manual location entry should still work
    await page.fill('[data-testid="pickup-input"]', 'Manual Location');
    await expect(page.locator('[data-testid="pickup-input"]')).toHaveValue('Manual Location');
  });

  test('should handle network failure gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Network error' }),
      });
    });

    await page.goto('/');

    // Skip to main app
    await page.click('text=Skip');

    // Try to book a ride
    await page.fill('[data-testid="pickup-input"]', 'Test Location');
    await page.fill('[data-testid="destination-input"]', 'Test Destination');
    await page.click('text=Standard Transport');
    await page.click('text=Book Now');

    // Should show error message
    await expect(
      page.locator('text=Unable to connect. Please check your internet connection.')
    ).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Check mobile layout
    const navigation = page.locator('[data-testid="bottom-navigation"]');
    await expect(navigation).toBeVisible();

    // Test touch interactions
    await page.tap('text=Skip');
    await expect(page.locator('text=Book Your Ride')).toBeVisible();
  });
});
```

## Mobile App Testing (React Native)

### 1. React Native Testing Setup

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react-native @testing-library/jest-native detox
```

```typescript
// __tests__/components/ServiceCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ServiceCard } from '../../src/components/ServiceCard';

const mockService = {
  id: 'standard',
  name: 'Standard Transport',
  price: '£45-75',
  description: 'Professional drivers',
};

describe('ServiceCard (React Native)', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <ServiceCard service={mockService} onPress={() => {}} />
    );
    
    expect(getByText('Standard Transport')).toBeTruthy();
    expect(getByText('£45-75')).toBeTruthy();
  });

  it('handles press events', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <ServiceCard service={mockService} onPress={mockOnPress} />
    );
    
    fireEvent.press(getByTestId('service-card'));
    
    expect(mockOnPress).toHaveBeenCalledWith(mockService);
  });
});
```

### 2. Detox E2E Testing

```json
// .detoxrc.js
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupFilesAfterEnv: ['<rootDir>/e2e/init.js']
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/ARMORA.app',
      build: 'xcodebuild -workspace ios/ARMORA.xcworkspace -scheme ARMORA -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_3a_API_30_x86'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    }
  }
};
```

```javascript
// e2e/booking.e2e.js
describe('ARMORA Mobile App - Booking Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete booking flow on mobile', async () => {
    // Welcome screen
    await expect(element(by.text('ARMORA'))).toBeVisible();
    await element(by.text('Get Started')).tap();

    // Skip questionnaire for test
    await element(by.id('skip-questionnaire')).tap();

    // Main booking screen
    await expect(element(by.text('Book Your Ride'))).toBeVisible();

    // Enter pickup location
    await element(by.id('pickup-input')).tap();
    await element(by.id('pickup-input')).typeText('London Bridge Station');

    // Enter destination
    await element(by.id('destination-input')).tap();
    await element(by.id('destination-input')).typeText('Heathrow Airport');

    // Select service
    await element(by.text('Standard Transport')).tap();

    // Book ride
    await element(by.text('Book Now')).tap();

    // Verify driver assignment
    await expect(element(by.text('Finding Driver...'))).toBeVisible();
    await waitFor(element(by.text('Driver Assigned'))).toBeVisible().withTimeout(5000);
  });

  it('should handle GPS permissions', async () => {
    // Request location permission
    await device.launchApp({
      permissions: { location: 'always' }
    });

    await element(by.text('Skip')).tap();
    await expect(element(by.id('current-location-button'))).toBeVisible();
  });

  it('should work in landscape mode', async () => {
    await device.setOrientation('landscape');
    
    await element(by.text('Skip')).tap();
    await expect(element(by.text('Book Your Ride'))).toBeVisible();
    
    await device.setOrientation('portrait');
  });
});
```

## Performance Testing

### 1. Web Performance Testing

```typescript
// src/test/performance.test.ts
import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  it('should load main app within performance budget', async () => {
    const start = performance.now();
    
    // Simulate app initialization
    const { render } = await import('@testing-library/react');
    const { App } = await import('../App');
    
    render(<App />);
    
    const end = performance.now();
    const loadTime = end - start;
    
    // App should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  it('should handle large datasets efficiently', () => {
    const start = performance.now();
    
    // Simulate processing 1000 trip records
    const trips = Array.from({ length: 1000 }, (_, i) => ({
      id: `trip-${i}`,
      pickup: `Location ${i}`,
      destination: `Destination ${i}`,
      fare: Math.random() * 100,
    }));
    
    // Process trips (filter, sort, etc.)
    const processedTrips = trips
      .filter(trip => trip.fare > 50)
      .sort((a, b) => b.fare - a.fare)
      .slice(0, 50);
    
    const end = performance.now();
    const processingTime = end - start;
    
    expect(processingTime).toBeLessThan(100); // Should complete within 100ms
    expect(processedTrips.length).toBeLessThanOrEqual(50);
  });
});
```

### 2. Load Testing with Artillery

```bash
npm install --save-dev artillery
```

```yaml
# load-test.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
  http:
    timeout: 30
scenarios:
  - name: "Booking API Load Test"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password"
          capture:
            - json: "$.token"
              as: "authToken"
      - post:
          url: "/api/bookings"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            pickup: "London Bridge Station"
            destination: "Heathrow Airport"
            serviceType: "standard"
      - think: 5
      - get:
          url: "/api/bookings/{{ bookingId }}"
          headers:
            Authorization: "Bearer {{ authToken }}"
```

## Security Testing

### 1. Automated Security Scanning

```bash
# Install security testing tools
npm install --save-dev audit-ci snyk
```

```json
// package.json scripts
{
  "scripts": {
    "security:audit": "audit-ci --config audit-ci.json",
    "security:snyk": "snyk test",
    "security:scan": "npm run security:audit && npm run security:snyk"
  }
}
```

```typescript
// src/test/security.test.ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App';

describe('Security Tests', () => {
  it('should not expose sensitive data in DOM', () => {
    render(<App />);
    
    // Check that API keys are not in the DOM
    const htmlContent = document.documentElement.innerHTML;
    
    expect(htmlContent).not.toContain('sk_'); // Stripe secret key
    expect(htmlContent).not.toContain('password');
    expect(htmlContent).not.toContain('secret');
  });

  it('should sanitize user input', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    
    // Test input sanitization function
    const sanitizedInput = sanitizeInput(maliciousInput);
    
    expect(sanitizedInput).not.toContain('<script>');
    expect(sanitizedInput).not.toContain('alert');
  });

  it('should validate form inputs', () => {
    const testCases = [
      { email: 'invalid-email', valid: false },
      { email: 'test@example.com', valid: true },
      { phone: '12345', valid: false },
      { phone: '+44 20 1234 5678', valid: true },
    ];
    
    testCases.forEach(({ email, phone, valid }) => {
      if (email) {
        expect(validateEmail(email)).toBe(valid);
      }
      if (phone) {
        expect(validatePhone(phone)).toBe(valid);
      }
    });
  });
});
```

## CI/CD Testing Pipeline

### 1. GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run type check
      run: npm run type-check
    
    - name: Run unit tests
      run: npm run test:coverage
    
    - name: Run security scan
      run: npm run security:scan
    
    - name: Build application
      run: npm run build
    
    - name: Run E2E tests
      run: |
        npm run build
        npm run preview &
        npx wait-on http://localhost:4173
        npm run test:e2e
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
        fail_ci_if_error: true

  mobile-test:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Setup iOS Simulator
      run: |
        xcrun simctl create test-device com.apple.CoreSimulator.SimDeviceType.iPhone-14 com.apple.CoreSimulator.SimRuntime.iOS-16-0
        xcrun simctl boot test-device
    
    - name: Run React Native tests
      run: npm run test:mobile
    
    - name: Run Detox E2E tests
      run: |
        cd mobile
        npx detox build --configuration ios.sim.debug
        npx detox test --configuration ios.sim.debug
```

### 2. Test Quality Gates

```json
// quality-gates.json
{
  "coverage": {
    "minimum": 80,
    "statements": 80,
    "branches": 75,
    "functions": 80,
    "lines": 80
  },
  "performance": {
    "bundleSize": "500KB",
    "loadTime": "3s",
    "firstContentfulPaint": "1.5s"
  },
  "security": {
    "vulnerabilities": {
      "high": 0,
      "medium": 2,
      "low": 10
    }
  },
  "accessibility": {
    "wcagLevel": "AA",
    "minimumScore": 90
  }
}
```

## App Store Testing Requirements

### 1. iOS App Store Testing

```typescript
// App Store specific tests
describe('iOS App Store Compliance', () => {
  it('should handle app state transitions', async () => {
    // Test app backgrounding/foregrounding
    await device.sendToHome();
    await device.launchApp();
    
    // App should restore previous state
    await expect(element(by.text('Welcome Back'))).toBeVisible();
  });

  it('should respect iOS design guidelines', async () => {
    // Test navigation bar
    await expect(element(by.id('navigation-bar'))).toBeVisible();
    
    // Test safe area handling
    const safeAreaTop = await element(by.id('safe-area-top'));
    await expect(safeAreaTop).toBeVisible();
  });

  it('should handle permissions properly', async () => {
    // Test location permission request
    await element(by.text('Allow Location Access')).tap();
    await expect(element(by.text('Location access granted'))).toBeVisible();
  });
});
```

### 2. Google Play Store Testing

```typescript
describe('Google Play Store Compliance', () => {
  it('should handle Android back button', async () => {
    await element(by.text('Settings')).tap();
    await device.pressBack();
    await expect(element(by.text('Book Your Ride'))).toBeVisible();
  });

  it('should support different screen sizes', async () => {
    // Test on tablet layout
    await device.setOrientation('landscape');
    await expect(element(by.id('tablet-layout'))).toBeVisible();
  });

  it('should handle app permissions', async () => {
    await device.launchApp({
      permissions: { 
        location: 'never',
        camera: 'unset' 
      }
    });
    
    await expect(element(by.text('Permission Required'))).toBeVisible();
  });
});
```

## Test Execution Strategy

### 1. Test Pyramid Execution

```bash
# Unit tests (run frequently during development)
npm run test:unit -- --watch

# Integration tests (run on code changes)
npm run test:integration

# E2E tests (run before deployment)
npm run test:e2e

# Performance tests (run weekly)
npm run test:performance

# Security tests (run on every build)
npm run test:security

# Mobile tests (run before app store submission)
npm run test:mobile
```

### 2. Test Environment Management

```typescript
// src/test/test-utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../contexts/AppContext';

// Mock data providers
const TestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <AppProvider>
        {children}
      </AppProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
```

## Implementation Roadmap

### Week 1: Foundation
- [x] Set up testing frameworks (Vitest, Testing Library)
- [x] Create test utilities and helpers
- [x] Set up CI/CD pipeline
- [ ] Implement basic unit tests

### Week 2: Coverage
- [ ] Achieve 70% unit test coverage
- [ ] Add integration tests for key flows
- [ ] Set up performance testing
- [ ] Implement security scanning

### Week 3: E2E & Mobile
- [ ] Complete E2E test suite
- [ ] Set up mobile testing framework
- [ ] Add cross-browser testing
- [ ] Implement accessibility testing

### Week 4: Quality Gates
- [ ] Configure coverage thresholds
- [ ] Set up automated quality gates
- [ ] Add app store compliance tests
- [ ] Create test reporting dashboard

## Next Critical Steps

1. **Install Testing Framework**: Set up Vitest and Testing Library
2. **Create Test Structure**: Establish testing patterns and utilities
3. **Write Core Unit Tests**: Cover critical business logic
4. **Set Up CI Pipeline**: Automate testing on code changes
5. **Add E2E Testing**: Cover complete user journeys
6. **Implement Performance Testing**: Monitor app performance
7. **Security Testing**: Automated vulnerability scanning
8. **Mobile Testing Setup**: Prepare for React Native testing
9. **Quality Gates**: Enforce testing standards
10. **App Store Testing**: Compliance and submission testing