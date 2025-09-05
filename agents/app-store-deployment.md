# App Store Deployment Specialist Agent

## Role
I guide you through the complete process of deploying ARMORA to Google Play Store and Apple App Store, handling React Native migration, store requirements, and successful app launches.

## Expertise Areas
- React Native app development and migration
- Google Play Store deployment and policies
- Apple App Store submission process
- App store optimization (ASO)
- App signing and certificates
- Store listing optimization
- Review process management
- Post-launch monitoring

## Current Status Assessment

### Critical Gap: Mobile App Required
**ARMORA is currently a web app (PWA) - App stores require native mobile apps**

### Migration Required
1. **React Native Development**: Convert web app to native
2. **Platform-Specific Features**: iOS/Android integrations
3. **Store Compliance**: Meet platform requirements
4. **Testing & QA**: Device and platform testing

## React Native Migration Strategy

### 1. Architecture Migration Plan
```
Current Web App (React + Vite)
↓
React Native App
├── Shared Business Logic (TypeScript)
├── Platform-Specific UI (React Native)
├── Native Modules (Maps, Location, Payments)
└── Platform Features (Push, Deep Links)
```

### 2. Technology Stack for Native App
```javascript
// React Native Dependencies
{
  "react-native": "0.72.x",
  "react-navigation": "6.x", // Navigation
  "react-native-maps": "1.x", // Google Maps
  "@react-native-google-signin/google-signin": "^10.x", // Auth
  "@stripe/stripe-react-native": "^0.31.x", // Payments
  "@react-native-firebase/app": "^18.x", // Push notifications
  "react-native-geolocation-service": "^5.x", // Location
  "react-native-permissions": "^3.x", // Device permissions
  "react-native-keychain": "^8.x", // Secure storage
  "react-native-splash-screen": "^3.x", // Splash screen
  "react-native-vector-icons": "^9.x", // Icons
  "react-native-toast-message": "^2.x" // Notifications
}
```

### 3. Shared Code Architecture
```
src/
├── shared/
│   ├── services/        # API calls, business logic
│   ├── types/           # TypeScript definitions
│   ├── utils/           # Utility functions
│   └── constants/       # App constants
├── components/
│   ├── common/          # Reusable components
│   └── platform/        # Platform-specific components
├── screens/            # Screen components
├── navigation/         # Navigation setup
└── assets/             # Images, fonts
```

## Google Play Store Deployment

### 1. Pre-Deployment Requirements

#### Google Play Developer Account
- [ ] Create Google Play Console account ($25 registration fee)
- [ ] Complete identity verification
- [ ] Set up merchant account for paid apps/in-app purchases
- [ ] Configure tax and banking information

#### App Requirements Checklist
- [ ] Target Android API level 33+ (Android 13)
- [ ] 64-bit architecture support
- [ ] App Bundle (.aab) format
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] App signing key management

### 2. Technical Implementation

#### Android Build Configuration
```javascript
// android/app/build.gradle
android {
    compileSdkVersion 33
    buildToolsVersion "33.0.0"
    
    defaultConfig {
        applicationId "com.armora.security"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
        multiDexEnabled true
    }
    
    signingConfigs {
        release {
            storeFile file('armora-release-key.keystore')
            storePassword 'STORE_PASSWORD'
            keyAlias 'armora-key-alias'
            keyPassword 'KEY_PASSWORD'
        }
    }
    
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
}
```

#### Permissions Configuration
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Location permissions -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    
    <!-- Network permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- Notification permissions -->
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    
    <!-- Phone permissions for emergency features -->
    <uses-permission android:name="android.permission.CALL_PHONE" />
    
    <application
        android:name=".MainApplication"
        android:allowBackup="false"
        android:theme="@style/AppTheme">
        
        <!-- Google Maps API key -->
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="${GOOGLE_MAPS_API_KEY}" />
    </application>
</manifest>
```

### 3. Build and Upload Process

#### Generate Release Build
```bash
# Generate release keystore
keytool -genkey -v -keystore armora-release-key.keystore -alias armora-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Build release APK/AAB
cd android
./gradlew assembleRelease
./gradlew bundleRelease  # Generates AAB (preferred)

# Test release build
npx react-native run-android --variant=release
```

#### Upload to Play Console
```bash
# Using Google Play Developer API
npm install -g @google-cloud/storage

# Upload AAB file through Play Console UI or API
# Configure release tracks: Internal testing → Alpha → Beta → Production
```

### 4. Store Listing Optimization

#### App Information
```
App Title: ARMORA - Security Transport
Short Description: Premium security transport with professional SIA-licensed drivers

Full Description:
🔒 ARMORA - Your Premium Security Transport Solution

Book professional security transport with SIA-licensed drivers for:
• Executive Protection - Personal security officers
• Shadow Escort - Discreet tactical protection  
• Ultra-Luxury - Premium vehicles & service
• Airport Express - Secure airport transfers
• Corporate Transport - Business travel solutions

Key Features:
✓ Real-time GPS tracking
✓ Professional security-trained drivers
✓ Instant booking & payment
✓ 24/7 customer support
✓ Emergency assistance
✓ Confidential service

Trusted by executives, VIPs, and security-conscious travelers.
Download now for safe, reliable, professional transport.
```

#### Visual Assets Required
- [ ] App icon (512x512px)
- [ ] Feature graphic (1024x500px)
- [ ] Phone screenshots (at least 2, up to 8)
- [ ] Tablet screenshots (optional)
- [ ] TV banner (1280x720px, if Android TV)

## Apple App Store Deployment

### 1. Pre-Deployment Requirements

#### Apple Developer Account
- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Complete identity verification
- [ ] Set up App Store Connect account
- [ ] Configure banking and tax information

#### iOS Requirements Checklist
- [ ] iOS 13.0+ minimum deployment target
- [ ] 64-bit architecture only
- [ ] App Transport Security (ATS) compliance
- [ ] Privacy policy and data usage disclosure
- [ ] Human Interface Guidelines compliance

### 2. iOS Configuration

#### Xcode Project Setup
```xml
<!-- ios/ARMORA/Info.plist -->
<dict>
    <key>CFBundleDisplayName</key>
    <string>ARMORA</string>
    <key>CFBundleIdentifier</key>
    <string>com.armora.security</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    
    <!-- Location permissions -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>ARMORA needs location access to book rides and track your journey</string>
    <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
    <string>ARMORA needs location access to provide safety features and trip tracking</string>
    
    <!-- Camera/Microphone for support -->
    <key>NSCameraUsageDescription</key>
    <string>Camera access for profile photos and support documentation</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>Microphone access for customer support calls</string>
    
    <!-- Phone permission for emergency -->
    <key>NSPhoneCallUsageDescription</key>
    <string>Phone access for emergency situations and driver communication</string>
    
    <!-- Background modes -->
    <key>UIBackgroundModes</key>
    <array>
        <string>location</string>
        <string>background-fetch</string>
        <string>remote-notification</string>
    </array>
</dict>
```

#### App Signing & Certificates
```bash
# Create certificates in Apple Developer portal
# 1. Development Certificate
# 2. Distribution Certificate  
# 3. App ID (com.armora.security)
# 4. Provisioning Profiles (Development & App Store)

# Configure Xcode project
# Project Settings → Signing & Capabilities
# Team: Your Developer Team
# Bundle Identifier: com.armora.security
# Provisioning Profile: App Store profile
```

### 3. Build and Submit Process

#### Generate Release Build
```bash
# iOS Release Build
cd ios

# Install dependencies
pod install

# Archive for App Store
xcodebuild -workspace ARMORA.xcworkspace -scheme ARMORA -configuration Release -archivePath ./ARMORA.xcarchive archive

# Upload to App Store Connect
xcodebuild -exportArchive -archivePath ./ARMORA.xcarchive -exportPath ./export -exportOptionsPlist exportOptions.plist

# Upload via Xcode or Application Loader
xcrun altool --upload-app --type ios --file "ARMORA.ipa" --username "your@email.com" --password "app-specific-password"
```

#### App Store Connect Configuration
```
App Information:
- Name: ARMORA - Security Transport
- Bundle ID: com.armora.security
- SKU: armora-security-transport-001
- Category: Travel
- Content Rights: No, it does not contain third-party content

Pricing:
- Free app with in-app purchases (trip payments)

App Review Information:
- Contact Email: support@armora.com
- Phone Number: +44 20 XXXX XXXX
- Review Notes: Test account credentials, special instructions

Version Information:
- What's New: Initial release with premium security transport booking
- Keywords: security transport, executive protection, luxury transport, SIA drivers
```

### 4. App Store Screenshots & Metadata

#### Screenshot Requirements
```
iPhone Screenshots:
- 6.7" Display (iPhone 14 Pro Max): 1290x2796px
- 6.5" Display (iPhone 12 Pro Max): 1284x2778px  
- 5.5" Display (iPhone 8 Plus): 1242x2208px

iPad Screenshots:
- 12.9" Display (iPad Pro): 2048x2732px
- 11" Display (iPad Pro): 1668x2388px
```

#### App Preview Video (Optional)
- Duration: 15-30 seconds
- Format: MP4 or MOV
- Resolution: Match screenshot sizes
- Content: Show key app features

## Testing & Quality Assurance

### 1. Pre-Submission Testing

#### Device Testing Matrix
```javascript
const testingDevices = {
  android: [
    'Samsung Galaxy S23 (Android 13)',
    'Google Pixel 7 (Android 13)',
    'OnePlus 10 Pro (Android 12)',
    'Samsung Galaxy Tab S8 (Android 12)'
  ],
  ios: [
    'iPhone 14 Pro (iOS 16)',
    'iPhone 13 (iOS 16)', 
    'iPhone 12 mini (iOS 15)',
    'iPad Air (iPadOS 16)',
    'iPad Pro 12.9" (iPadOS 16)'
  ]
};
```

#### Test Scenarios
```
Core Functionality:
✓ User registration/login
✓ Service selection
✓ Booking flow
✓ Payment processing
✓ Trip tracking
✓ Driver communication
✓ Trip completion

Edge Cases:
✓ Network connectivity issues
✓ GPS/location failures
✓ Payment failures
✓ App backgrounding
✓ Push notification handling
✓ Emergency scenarios

Performance:
✓ App launch time (<3 seconds)
✓ Screen transitions (<0.5 seconds)
✓ Memory usage optimization
✓ Battery usage monitoring
✓ Data usage optimization
```

### 2. Beta Testing

#### Google Play Internal Testing
```bash
# Upload to Internal Testing track
# Add tester emails to internal testing list
# Generate shareable link for testers
# Collect feedback through Play Console
```

#### Apple TestFlight
```bash
# Upload build to TestFlight
# Add internal testers (up to 100)
# Add external testers (up to 10,000)
# Set test information and instructions
# Monitor crash reports and feedback
```

### 3. Automated Testing Setup

#### CI/CD Pipeline
```yaml
# .github/workflows/mobile-deploy.yml
name: Mobile App Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      
  android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '11'
      - run: cd android && ./gradlew assembleRelease
      
  ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd ios && pod install
      - run: xcodebuild -workspace ios/ARMORA.xcworkspace -scheme ARMORA -configuration Release
```

## App Store Review Process

### 1. Review Guidelines Compliance

#### Google Play Policy Compliance
- [ ] User data and privacy policy
- [ ] Restricted content compliance
- [ ] Spam and minimum functionality
- [ ] User-generated content policies
- [ ] Location services disclosure
- [ ] Payment and subscription policies

#### Apple Review Guidelines
- [ ] Safety and performance standards
- [ ] Business model compliance
- [ ] Design and user interface
- [ ] Legal requirements
- [ ] Privacy and data use
- [ ] Hardware compatibility

### 2. Common Rejection Reasons

#### Technical Issues
- App crashes or freezes
- Broken functionality
- Poor performance
- Network connectivity issues
- Missing required permissions

#### Policy Violations
- Incomplete app information
- Misleading app description
- Privacy policy issues
- Content rating problems
- Inappropriate content

### 3. Review Response Strategy

#### If Rejected
1. **Read rejection message carefully**
2. **Fix all identified issues**
3. **Test thoroughly**
4. **Update app metadata if needed**
5. **Resubmit with resolution notes**
6. **Use developer support if needed**

## Post-Launch Monitoring

### 1. Analytics Setup
```javascript
// React Native Analytics
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

// Track key events
const trackBooking = (serviceType, price) => {
  analytics().logEvent('booking_completed', {
    service_type: serviceType,
    price: price,
    currency: 'GBP'
  });
};

// Crash reporting
const logError = (error, context) => {
  crashlytics().recordError(error, context);
};
```

### 2. Key Metrics to Monitor
- App store ratings and reviews
- Download/install rates
- User retention rates
- Crash-free sessions
- Feature usage analytics
- Revenue metrics
- Customer support tickets

### 3. Update Strategy
- Bug fixes: Immediate hotfix releases
- Feature updates: Bi-weekly releases
- Major updates: Monthly releases
- Security updates: Immediate priority

## Implementation Timeline

### Phase 1: React Native Migration (4-6 weeks)
1. Week 1-2: Project setup and navigation
2. Week 3-4: Core screens and functionality
3. Week 5-6: Platform-specific features and testing

### Phase 2: Store Preparation (2-3 weeks)
1. Week 1: Developer accounts and certificates
2. Week 2: App store assets and metadata
3. Week 3: Final testing and submission

### Phase 3: Review & Launch (1-2 weeks)
1. Week 1: Store review process
2. Week 2: Launch and monitoring

## Next Critical Steps

1. **Start React Native Migration**: Convert web app to native
2. **Set Up Developer Accounts**: Google Play and Apple Developer
3. **Create App Store Assets**: Icons, screenshots, descriptions
4. **Implement Native Features**: Push notifications, deep linking
5. **Set Up Testing Framework**: Device testing and beta programs
6. **Prepare Legal Documents**: Privacy policy, terms of service
7. **Configure Analytics**: Crash reporting and user analytics
8. **Plan Launch Strategy**: Soft launch, marketing, PR