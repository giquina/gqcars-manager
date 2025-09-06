# ARMORA Development Rules & Guidelines

## Project Focus: Mobile-First Security Transport App

### Core Principle
ARMORA is primarily a **mobile application** for iOS and Android app stores. The current React web app serves as an MVP/prototype for testing user flows and business logic before converting to React Native.

## Development Guidelines

### 1. Mobile-First Development

#### Always Consider Mobile
- Design and develop with mobile devices as the primary target
- Ensure all features work excellently on smartphones (iPhone/Android)
- Web app is secondary and serves as prototype/admin interface
- Touch interactions, gestures, and mobile UX patterns are priority

#### React Native Preparation
- Write components that can be easily migrated to React Native
- Avoid web-specific dependencies where possible
- Use mobile-appropriate design patterns
- Plan for native device features (camera, GPS, notifications)

### 2. Architecture Rules

#### Code Organization
- **NO** monolithic files over 500 lines
- Components must be modular and reusable
- Separate business logic from UI components
- Use proper TypeScript types for everything
- Follow React Native-compatible patterns

#### State Management
- Use React hooks for local state
- Implement proper global state management (Zustand/Redux)
- Plan for offline-first mobile experience
- Consider mobile performance in state design

### 3. Security & Compliance

#### Data Protection
- Encrypt all sensitive user data
- Implement proper authentication (JWT + refresh tokens)
- Follow GDPR compliance for EU users
- Secure API communication (HTTPS only)
- No sensitive data in logs or client storage

#### Security Transport Focus
- SIA license verification for all drivers
- Background checks and vetting processes
- Real-time location tracking with privacy controls
- Emergency contact and panic button features
- Secure communication between users and drivers

### 4. App Store Requirements

#### iOS App Store Guidelines
- Follow Apple Human Interface Guidelines
- Implement proper permission requests
- Support all required device sizes
- Pass App Store review process
- Include accessibility features

#### Google Play Store Guidelines
- Follow Material Design principles
- Handle Android permissions properly
- Support Android API levels 21+
- Comply with Play Store policies
- Include required metadata and assets

### 5. Performance Standards

#### Mobile Performance
- App launch time < 3 seconds
- Smooth 60fps scrolling and animations
- Minimal battery drain from GPS tracking
- Efficient memory usage
- Offline capability for core features

#### Bundle Size Limits
- iOS app < 100MB
- Android APK < 100MB
- Initial download < 50MB
- Use code splitting and lazy loading

### 6. Testing Requirements

#### Mandatory Testing
- Unit tests for all business logic (80%+ coverage)
- Integration tests for API interactions
- E2E tests for critical user journeys
- Device testing on iOS and Android
- Performance testing on low-end devices

#### Pre-Deployment Testing
- Test on actual devices (not just simulators)
- Network failure and poor connectivity scenarios
- Battery and performance impact testing
- Security vulnerability scanning
- App store compliance validation

### 7. User Experience Rules

#### Mobile UX Patterns
- Bottom navigation for main sections
- Swipe gestures for common actions
- Pull-to-refresh for data updates
- Touch-friendly button sizes (44x44pt minimum)
- Thumb-reachable navigation zones

#### Security Focus UX
- Clear security indicators and certifications
- Professional, trustworthy design language
- Discrete/private mode options
- Easy emergency access features
- Transparent pricing and service levels

### 8. Technical Stack Rules

#### Approved Technologies
- **Mobile**: React Native 0.73+
- **Web Prototype**: React 19+ with TypeScript
- **Backend**: Node.js/Express or Python/FastAPI
- **Database**: PostgreSQL + Redis + TimescaleDB
- **Maps**: Google Maps API (mobile SDKs)
- **Payments**: Stripe (mobile SDKs)
- **Analytics**: Firebase Analytics + Custom metrics

#### Prohibited/Discouraged
- jQuery or legacy JavaScript libraries
- Heavy web-only libraries in mobile builds
- Inline styles (use StyleSheet on mobile)
- Non-TypeScript code
- Hard-coded API endpoints or keys

### 9. API Design Rules

#### Mobile-Optimized APIs
- RESTful design with GraphQL for complex queries
- Pagination for all list endpoints
- Offline sync capabilities
- Minimal data payloads for mobile networks
- Proper error handling and retry logic

#### Real-Time Features
- WebSocket connections for live tracking
- Push notifications for trip updates
- Background location updates (with user consent)
- Efficient data synchronization

### 10. Deployment Rules

#### Version Control
- Never commit API keys or secrets
- Use semantic versioning (1.0.0)
- Tag releases for app store submissions
- Maintain changelog for each version
- Proper commit messages and PR descriptions

#### App Store Deployment
- iOS: Must pass TestFlight internal testing first
- Android: Use internal testing track initially
- Both: Staged rollout (10% → 50% → 100%)
- Monitor crash rates and user feedback
- Hotfix process for critical issues

### 11. Code Quality Standards

#### TypeScript Rules
- Strict mode enabled
- No `any` types (use proper typing)
- Interfaces for all data structures
- Proper error handling with typed errors
- Export types for reusability

#### Component Rules
- Functional components with hooks
- Proper prop validation
- Memoization for performance (React.memo)
- Custom hooks for reusable logic
- Consistent naming conventions

### 12. Data & Privacy Rules

#### Location Data
- Request minimal necessary permissions
- Allow users to control location sharing
- Anonymize location data after trip completion
- Clear privacy policy about data usage
- Option to delete location history

#### User Data Protection
- Encrypt personal information at rest
- Secure transmission of all data
- Allow users to export their data
- Implement right to be forgotten
- Regular security audits

## Project Priorities (In Order)

### Phase 1: Mobile App Foundation (Next 2 months)
1. React Native app setup and basic navigation
2. Core screens migration (Welcome, Questionnaire, Home)
3. Google Maps integration for mobile
4. Basic trip booking and tracking
5. Payment integration (Stripe React Native)

### Phase 2: App Store Launch (Months 3-4)
1. iOS app store submission
2. Google Play store submission
3. Driver onboarding system
4. Real-time features and notifications
5. Customer support integration

### Phase 3: Scale & Growth (Months 5-6)
1. Corporate features and multi-user accounts
2. Advanced security features
3. Multiple city expansion
4. Analytics and business intelligence
5. Driver companion app

## Emergency Procedures

### Production Issues
- Have rollback plan for app store releases
- Monitor crash reporting (Firebase Crashlytics)
- 24/7 on-call for critical security transport issues
- Direct communication channel with driver network
- Customer support escalation procedures

### Security Incidents
- Immediate incident response team activation
- User notification procedures
- Law enforcement coordination if needed
- Media/PR communication plan
- Post-incident review and improvements

## Success Metrics

### User Engagement
- Daily/Monthly Active Users (DAU/MAU)
- Trip completion rate >95%
- Average session duration
- User retention rates (Day 1, 7, 30)
- App store ratings >4.5 stars

### Business Metrics
- Revenue per user
- Customer acquisition cost
- Driver utilization rates
- Average trip value
- Time to driver assignment <3 minutes

### Technical Metrics
- App crash rate <0.1%
- API response time <500ms
- App launch time <3 seconds
- Battery usage within acceptable limits
- 99.9% uptime for critical services

Remember: This is a security-focused mobile application where user safety and trust are paramount. Every decision should consider the security and professional nature of the service.