# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GQCars - Premium car dealership platform built with React, TypeScript, and Tailwind CSS. A sophisticated digital platform for browsing, searching, and inquiring about premium vehicles with emphasis on luxury and professional presentation.

## Essential Commands

```bash
# Development
npm run dev          # Start dev server (Vite on port 5173)
npm run build        # TypeScript check + production build  
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run optimize     # Vite optimization
npm run kill         # Kill process on port 5000
```

## Tech Stack

- **Frontend**: React 19.0.0 with TypeScript
- **Build Tool**: Vite 6.3.5 with SWC plugin for fast compilation
- **Styling**: TailwindCSS 4.1.11 with custom CSS variables and Radix color system
- **UI Components**: 
  - Radix UI component library (40+ components)
  - Custom UI components in `src/components/ui/`
  - Phosphor Icons for consistent iconography
  - Lucide React icons as secondary icon set
- **Framework**: @github/spark framework with useKV for client-side persistence
- **State Management**: React hooks + useKV for persistent data
- **Animations**: Framer Motion 12.6.2
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Additional**: 
  - Sonner for toast notifications
  - Date-fns for date manipulation
  - Three.js for 3D elements

## Architecture

### Current Structure
**CRITICAL ISSUE**: The entire application resides in a single 5,973-line `src/App.tsx` file - this is a monolithic anti-pattern that severely impacts maintainability.

### Component Architecture
- **Main Component**: `src/App.tsx` (5,973 lines) - contains entire application
- **UI Components**: `src/components/ui/` - Radix-based design system components
- **Utilities**: `src/lib/utils.ts` - utility functions
- **Hooks**: `src/hooks/use-mobile.ts` - responsive design hook
- **Styling**: Custom CSS variables in theme files

### State Management Pattern
Uses @github/spark framework's `useKV` hook for client-side persistence:
```typescript
const [favoriteVehicles] = useKV("favorite-vehicles", [])
const [searchPreferences] = useKV("search-preferences", {})
const [viewHistory] = useKV("view-history", [])
```

### Key Features in App.tsx
Based on PRD, the application includes:
- Vehicle inventory browser with grid display
- Advanced search and filtering system
- Detailed vehicle information views
- Customer inquiry system
- Favorites and comparison functionality
- Google Maps integration (if configured)

## Custom Theming System

The project uses a sophisticated theming system with CSS variables:

### Color System
- **Neutral Scale**: 12-step neutral colors with alpha variants
- **Accent Colors**: Primary and secondary accent colors
- **Semantic Colors**: fg (foreground), bg (background), focus-ring
- **Custom Variables**: All colors use CSS custom properties

### Spacing & Layout
- **Custom Spacing Scale**: Uses CSS variables (var(--size-*))
- **Border Radius**: Configurable radius system
- **Responsive Design**: Container queries and responsive utilities

## Development Guidelines

### Immediate Refactoring Priority
The 5,973-line App.tsx file must be broken down into:
1. **Screen Components**: Separate files for major views
2. **Feature Components**: Modular components for vehicle browsing, search, etc.
3. **Business Logic**: Custom hooks and utilities
4. **Type Definitions**: Proper TypeScript interfaces

### Code Organization Standards
- Components should be < 500 lines maximum
- Use TypeScript for all new code
- Follow the existing Radix UI component patterns
- Maintain consistency with the custom theming system

### UI/UX Approach
Based on PRD requirements:
- **Premium Feel**: Sophisticated, clean design like high-end showroom
- **Color Palette**: Deep Charcoal, Pearl White, Platinum Silver, Luxury Gold
- **Typography**: Inter font family with proper hierarchy
- **Animations**: Subtle luxury with purposeful motion

### Performance Considerations
- The monolithic App.tsx impacts initial bundle size
- Consider code splitting and lazy loading for major features
- Optimize image loading for vehicle photos
- Use React.memo for expensive components

## Spark Framework Integration

This project uses @github/spark framework:
- **useKV Hook**: Client-side persistent state management
- **Spark Plugins**: Custom Vite plugins for icon proxying
- **Development Tools**: Built-in development utilities

## Component Library Structure

### UI Components Location
All reusable UI components are in `src/components/ui/`:
- Form controls (Button, Input, Select, etc.)
- Layout components (Card, Dialog, Tabs, etc.)  
- Data display (Table, Badge, Avatar, etc.)
- Navigation (Navigation Menu, Breadcrumb, etc.)
- Feedback (Alert, Sonner toasts, etc.)

### Icon Strategy
- **Primary**: Phosphor Icons (@phosphor-icons/react)
- **Secondary**: Lucide React for additional icons
- **Custom**: Vite plugin for optimized icon imports

## Common Development Tasks

### Breaking Down App.tsx
1. Extract screen-level components (Inventory, Vehicle Details, etc.)
2. Create feature-specific hooks for state management
3. Separate business logic from UI rendering
4. Create proper TypeScript interfaces for data structures

### Adding New Features
1. Create components in appropriate directories
2. Use existing UI component patterns
3. Leverage useKV for persistent state needs
4. Follow the established theming system

### Styling Guidelines
1. Use Tailwind classes with custom CSS variable system
2. Maintain design consistency with luxury automotive theme
3. Ensure responsive design across all breakpoints
4. Follow accessibility best practices

## Environment Variables

Based on code analysis, the project may use:
- Google Maps API key (if maps functionality is enabled)
- Any external service API keys should be prefixed with `VITE_`

## Testing & Quality

Currently no formal test suite is configured. Consider adding:
- Unit tests for business logic
- Component testing for UI components  
- Integration tests for user flows
- Lint and format on commit hooks

## Critical Issues to Address

1. **Monolithic Architecture**: 5,973-line App.tsx must be refactored
2. **No Test Coverage**: Add comprehensive testing strategy
3. **Performance**: Large single file impacts development and build times
4. **Maintainability**: Code organization needs immediate attention