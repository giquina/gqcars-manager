# TODO.md - ARMORA Mobile Security Transport App

## Project Status: Mobile App Development Phase

**Primary Focus**: Convert React web MVP to React Native mobile apps for iOS and Android app store deployment

### 🔴 Critical - GitHub Spark Token Limit Issue (URGENT)

#### Immediate Token Management (Priority #1)
- [ ] Create 4 modular Spark projects to split features:
  - [ ] ARMORA-Auth (Welcome, Questionnaire, Login, Profile)
  - [ ] ARMORA-Booking (Service selection, Location, Pricing)
  - [ ] ARMORA-Tracking (Real-time map, Driver tracking, Communication)
  - [ ] ARMORA-Payments (Payment methods, Billing, Transaction history)
- [ ] Copy current screens to appropriate Spark projects
- [ ] Switch to targeted edits only (no global prompts)
- [ ] Set up GitHub repository for code backup when approaching limits

#### React Native Migration (Priority #2)
- [ ] Export working Spark prototypes to GitHub repository
- [ ] Set up React Native development environment
- [ ] Initialize new React Native project with TypeScript
- [ ] Use Spark prototypes as reference for mobile implementation
- [ ] Set up navigation (React Navigation)
- [ ] Configure platform-specific settings (iOS/Android)

#### Mobile-Specific Integrations
- [ ] Integrate React Native Maps (Google Maps)
- [ ] Set up React Native location services
- [ ] Implement push notifications (Firebase)
- [ ] Configure deep linking for app URLs
- [ ] Add camera access for profile photos
- [ ] Implement biometric authentication (Face ID/Touch ID)

#### Backend Infrastructure (For Mobile APIs)
- [ ] Set up mobile-optimized API server (Node.js/Express)
- [ ] Design database schema for mobile app data
- [ ] Create mobile-specific API endpoints:
  - [ ] User authentication (JWT + refresh tokens)
  - [ ] Trip booking and real-time updates
  - [ ] Driver assignment and tracking
  - [ ] Mobile payment processing (Stripe)
  - [ ] Push notification services
  - [ ] File upload for documents/photos

#### App Store Deployment Preparation
- [ ] iOS app configuration and certificates
- [ ] Android app signing and Google Play setup
- [ ] App store metadata and screenshots
- [ ] Privacy policy and terms of service
- [ ] App store review preparation and testing
- [ ] Beta testing setup (TestFlight/Google Play Internal)

#### Mobile Payment Integration
- [ ] Integrate Stripe React Native SDK
- [ ] Implement Apple Pay and Google Pay
- [ ] Mobile payment security and PCI compliance
- [ ] Payment method storage and management
- [ ] Subscription handling for premium features
- [ ] Refund processing for mobile transactions

#### Authentication & Security
- [ ] Implement JWT-based authentication
- [ ] Add OAuth integration (Google, Apple)
- [ ] Create user role management (customer, driver, admin)
- [ ] Implement API rate limiting
- [ ] Add request validation and sanitization
- [ ] Set up SSL/TLS certificates

### 🟡 High Priority - Core Features

#### Code Refactoring
- [ ] Break down App.tsx into modular components
- [ ] Create separate files for each view/screen
- [ ] Implement proper routing (React Router)
- [ ] Add proper TypeScript interfaces
- [ ] Create reusable service modules
- [ ] Implement proper error boundaries

#### Testing Infrastructure
- [ ] Set up Vitest for unit testing
- [ ] Add React Testing Library
- [ ] Create component tests
- [ ] Add integration tests for API calls
- [ ] Implement E2E tests with Playwright
- [ ] Add CI/CD pipeline with GitHub Actions

#### State Management
- [ ] Evaluate and implement global state solution (Zustand/Redux Toolkit)
- [ ] Create proper data flow architecture
- [ ] Implement optimistic updates
- [ ] Add offline support with service workers
- [ ] Create data synchronization logic

#### Performance Optimization
- [ ] Implement code splitting
- [ ] Add lazy loading for routes
- [ ] Optimize bundle size
- [ ] Add image optimization
- [ ] Implement caching strategies
- [ ] Add performance monitoring (Sentry)

### 🟢 Medium Priority - Enhanced Features

#### User Experience
- [ ] Add proper loading states
- [ ] Implement skeleton screens
- [ ] Add pull-to-refresh functionality
- [ ] Create better error messages
- [ ] Add tooltips and help text
- [ ] Implement proper form validation feedback

#### Communication Features
- [ ] Implement real-time chat with WebSockets
- [ ] Add push notifications
- [ ] Create SMS notifications
- [ ] Add email confirmations
- [ ] Implement in-app calling (WebRTC)

#### Analytics & Monitoring
- [ ] Add Google Analytics/Mixpanel
- [ ] Implement error tracking (Sentry)
- [ ] Add performance monitoring
- [ ] Create admin dashboard
- [ ] Add business metrics tracking

#### Advanced Features
- [ ] Add multi-language support (i18n)
- [ ] Implement ride sharing options
- [ ] Add corporate account management
- [ ] Create loyalty program
- [ ] Add trip scheduling API
- [ ] Implement surge pricing logic

### 🔵 Low Priority - Nice to Have

#### Mobile App Development
- [ ] Evaluate React Native migration
- [ ] Create iOS app
- [ ] Create Android app
- [ ] Implement biometric authentication
- [ ] Add Apple Pay/Google Pay

#### Additional Features
- [ ] Add voice commands
- [ ] Implement AR navigation
- [ ] Create driver companion app
- [ ] Add vehicle inspection checklists
- [ ] Create expense reporting

### 🚨 Current Sprint Focus - Spark Token Crisis Resolution (Next 2 Weeks)

1. **Week 1 - Immediate Spark Restructure** 
   - [ ] Create ARMORA-Auth Spark project (Welcome, Questionnaire, User flows)
   - [ ] Create ARMORA-Booking Spark project (Service selection, Location, Pricing)
   - [ ] Create ARMORA-Tracking Spark project (Map, Driver tracking, Status updates)
   - [ ] Create ARMORA-Payments Spark project (Payment methods, Billing, Receipts)
   - [ ] Copy and distribute current screens across new Spark projects
   - [ ] Test individual features in each modular Spark
   - [ ] Use ONLY targeted edits (click-to-edit specific components)

2. **Week 2 - Sustainable Development Workflow**
   - [ ] Set up main GitHub repository for code backup
   - [ ] Export working Spark components when approaching token limits
   - [ ] Implement hybrid workflow (Spark prototyping + GitHub development)
   - [ ] Document modular Spark development process
   - [ ] Prepare for React Native migration using Spark prototypes as reference

### 📈 Mobile App Development Milestones (Updated for Spark Issues)

- **Milestone 1** (Current): React Web MVP Complete ✅
- **Milestone 1.5** (URGENT - 1 week): Spark Token Crisis Resolved ⚠️
- **Milestone 2** (3 weeks): Modular Spark Features Complete
- **Milestone 3** (5 weeks): GitHub Repository with Exported Components
- **Milestone 4** (7 weeks): React Native iOS App Beta
- **Milestone 5** (9 weeks): React Native Android App Beta
- **Milestone 6** (11 weeks): App Store Submissions (iOS & Android)
- **Milestone 7** (13 weeks): Backend API Integration
- **Milestone 8** (15 weeks): Mobile App Store Launch

### 🚨 Critical Issues

- [ ] **GitHub Spark Token Limit Exceeded (133,383/128,000 tokens)**
  - Error: model_max_prompt_tokens_exceeded 
  - Blocking further development in current Spark session
  - Requires immediate modular restructure

### 🐛 Known Bugs

- [ ] Map occasionally fails to load on first render
- [ ] Sound notifications don't work on iOS Safari
- [ ] Questionnaire progress not saved on refresh
- [ ] Date picker allows past dates for scheduling
- [ ] Receipt download not working on mobile

### 📝 Technical Debt

- [ ] App.tsx is 6000+ lines (needs splitting)
- [ ] No error logging system
- [ ] Hardcoded values throughout code
- [ ] Missing TypeScript types in many places
- [ ] No API response caching
- [ ] Inefficient re-renders in map component

### 🔒 Security Considerations

- [ ] Add input sanitization
- [ ] Implement CSRF protection
- [ ] Add API key rotation
- [ ] Create security audit logs
- [ ] Implement PCI compliance for payments
- [ ] Add GDPR compliance features

### 📱 Platform-Specific Issues

- [ ] iOS: Status bar overlaps content
- [ ] Android: Back button behavior inconsistent
- [ ] Safari: Geolocation permission issues
- [ ] Chrome: Autoplay policy affects sounds

## Notes

- Priority levels: 🔴 Critical, 🟡 High, 🟢 Medium, 🔵 Low
- Update this file weekly with progress
- Move completed items to CHANGELOG.md
- Review with team during sprint planning