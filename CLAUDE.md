# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ARMORA - Premium security transport mobile application. The project contains a React web MVP (current state) that will be migrated to React Native for iOS and Android app store deployment. Primary focus is mobile app development with the web version serving as prototype.

## Critical Project Focus: Mobile-First Development

**This is a MOBILE APP project.** The React web app is an MVP/prototype. All development decisions should prioritize:
- React Native compatibility
- iOS and Android app store deployment
- Mobile UX patterns and performance
- Native device features (GPS, camera, notifications)

## Tech Stack

### Current (Web MVP)
- React 19.0.0 with TypeScript
- Vite 6.3.5 build tool
- TailwindCSS 4.1.11 with custom CSS variables
- Radix UI component library (40+ components)
- Google Maps JavaScript API
- @github/spark framework with useKV for persistence

### Target (Mobile Apps)  
- React Native 0.73+ for iOS/Android
- React Navigation for mobile navigation
- React Native Maps for Google Maps integration
- React Native Firebase for notifications
- Stripe React Native SDK for payments

## Essential Commands

```bash
# Development
npm run dev          # Start dev server on port 5173

# Build & Deploy  
npm run build        # TypeScript check + production build
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint

# Utilities
npm run kill         # Kill process on port 5000
```

## Architecture

### Current Architecture (Web MVP)
**WARNING: Monolithic Anti-Pattern** - The entire application currently resides in `src/App.tsx` (6,000+ lines). This must be refactored before React Native migration.

Current view-based navigation:
```typescript
const [currentView, setCurrentView] = useState<string>('welcome')
```

Main views: `welcome`, `questionnaire`, `home`, `trip-tracking`, `trip-rating`, `scheduled-rides`

### State Management
- Current: `@github/spark/hooks` useKV for persistence (web-only)
- Target: Zustand or Redux Toolkit for cross-platform state
- Plan for offline-first mobile experience with proper sync

### Required Refactoring for Mobile
1. Break `App.tsx` into modular components (<500 lines each)
2. Separate screens into individual files under `src/screens/`
3. Create reusable components in `src/components/`
4. Implement proper navigation architecture
5. Replace web-specific dependencies

### Key Persistent Data
```typescript
useKV("armora-onboarding-complete", false)
useKV("armora-first-launch", true)  
useKV("favorite-locations", [])
useKV("recent-trips", [])
useKV("payment-reservations", [])
```

## Google Maps Integration

Fully integrated with Google Maps APIs:
- Maps JavaScript API for mapping
- Geocoding API for address lookup
- Places API for autocomplete
- Directions API for routing

Environment variable: `VITE_GOOGLE_MAPS_API_KEY`

## Service Architecture

### Service Levels
- Standard Transport (£45-75)
- Shadow Escort (£150-350)
- Executive Protection (£120-250)
- Ultra-Luxury (£180-450)
- Airport Express (£65-120)
- Corporate Transport (£40-85)

### User Flow
1. Welcome → Security Questionnaire → Home/Booking
2. Service Selection → Payment Reservation (£50 min)
3. Driver Assignment → Live Tracking → Trip Completion

## Development Guidelines (From RULES.md)

### Mobile-First Rules
- **NO** monolithic files over 500 lines
- Components must be React Native compatible
- Follow touch-first UX patterns
- Plan for native device features (camera, GPS, notifications)
- Use mobile-appropriate state management

### Current Limitations (Web MVP)
- Frontend-only (no backend API)
- Simulated payment processing and driver assignment
- No formal test suite
- Monolithic architecture that needs refactoring

### Security Transport Focus
- SIA license verification for all drivers
- Background checks and vetting processes
- Real-time location tracking with privacy controls
- Emergency contact and panic button features

## Specialized AI Agents Available

The `/agents/` directory contains 13 specialized advisors for different aspects of development:

- `react-native-migration.md` - Converting web app to React Native
- `app-store-deployment.md` - iOS and Android app store deployment
- `mobile-optimization.md` - Mobile performance and battery optimization  
- `backend-architect.md` - API design and microservices architecture
- `security-compliance.md` - GDPR, PCI DSS, and data protection
- `payment-specialist.md` - Stripe integration and financial compliance
- `maps-navigation.md` - Google Maps optimization for mobile
- `testing-qa.md` - Comprehensive testing strategy
- `performance-optimization.md` - Bundle size and runtime optimization
- `ui-ux-designer.md` - Mobile-first design patterns
- `code-architect.md` - Breaking down monolithic code
- `database-design.md` - PostgreSQL, Redis, and TimescaleDB
- `business-analyst.md` - Market analysis and feature prioritization

## Common Mobile Development Tasks

### Start React Native Migration
1. Consult `/agents/react-native-migration.md` for detailed guidance
2. Set up React Native development environment
3. Create new RN project with TypeScript
4. Begin component extraction from `App.tsx`

### Prepare for App Store Deployment  
1. Review `/agents/app-store-deployment.md`
2. Set up Apple Developer and Google Play accounts
3. Create app store assets and metadata
4. Configure app signing and certificates

### Performance Optimization
1. Use `/agents/performance-optimization.md` for guidance
2. Break down monolithic `App.tsx` file
3. Implement code splitting and lazy loading
4. Optimize for mobile networks and battery usage