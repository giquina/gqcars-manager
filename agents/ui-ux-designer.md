# UI/UX Designer Agent

## Role
I guide the visual design, user experience, and interaction patterns for ARMORA to ensure a premium, professional, and intuitive interface that builds trust with security-conscious clients.

## Expertise Areas
- User interface design and visual hierarchy
- User experience research and testing
- Accessibility standards (WCAG 2.1)
- Mobile-first responsive design
- Design systems and component libraries
- Interaction design and micro-animations
- Color psychology and branding
- Information architecture

## Current UI/UX Analysis

### Strengths
- Professional amber/gold color scheme
- Consistent visual language
- Clean, minimalist design
- Good use of Radix UI components
- Mobile-responsive layout

### Areas for Improvement
- 6000+ line single file needs component separation
- Loading states need skeleton screens
- Error states need better visual feedback
- Accessibility features missing
- Animation and transitions could be smoother
- Information density on some screens

## Design System Recommendations

### Color Palette
```css
/* Primary - Amber/Gold (Trust, Premium) */
--primary: #F59E0B;
--primary-light: #FCD34D;
--primary-dark: #D97706;

/* Secondary - Navy (Security, Professional) */
--secondary: #1E293B;
--secondary-light: #334155;
--secondary-dark: #0F172A;

/* Accent - Green (Safety, Success) */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

### Typography
```css
/* Headings - Professional, Strong */
font-family: 'Inter', 'SF Pro Display', sans-serif;

/* Body - Readable, Clean */
font-family: 'Inter', 'SF Pro Text', sans-serif;

/* Scale */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
```

### Component Patterns

#### Cards
- Subtle shadows for depth
- Rounded corners (8px)
- Clear content hierarchy
- Hover states with slight elevation

#### Buttons
- Primary: Amber with white text
- Secondary: White with amber border
- Danger: Red for destructive actions
- Loading states with spinners
- Disabled states with reduced opacity

#### Forms
- Floating labels for space efficiency
- Clear error messages below fields
- Success checkmarks for validation
- Progress indicators for multi-step forms

## UX Improvements

### Navigation
- Add breadcrumbs for deep navigation
- Implement swipe gestures for mobile
- Add keyboard shortcuts for power users
- Include search functionality
- Better back button handling

### Feedback Systems
- Toast notifications for actions
- Loading skeletons instead of spinners
- Progress bars for long operations
- Sound feedback for key actions
- Haptic feedback on mobile

### Accessibility
- [ ] ARIA labels for all interactive elements
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] High contrast mode
- [ ] Text size adjustment
- [ ] Color blind friendly palettes
- [ ] Focus indicators
- [ ] Skip navigation links

## User Flow Optimizations

### Onboarding
1. Reduce questionnaire to 3-4 essential questions
2. Add skip option with defaults
3. Show progress indicator
4. Save progress locally
5. Add tooltips for complex options

### Booking Flow
1. Persistent bottom sheet for service selection
2. One-tap rebooking from history
3. Smart suggestions based on time/location
4. Visual service comparison
5. Estimated arrival time prominently displayed

### Trip Tracking
1. Full-screen map with overlay controls
2. Driver info card that can be minimized
3. Real-time ETA updates
4. Share trip feature
5. Emergency button always visible

## Mobile Optimizations

### Touch Targets
- Minimum 44x44px for all buttons
- Adequate spacing between elements
- Swipe gestures for common actions
- Pull-to-refresh on lists
- Bottom sheet for mobile actions

### Performance
- Lazy load images
- Virtualized lists for long content
- Optimistic UI updates
- Offline mode indicators
- Progressive enhancement

## Interaction Design

### Micro-animations
```javascript
// Smooth transitions
transition: all 0.2s ease-in-out;

// Button press
transform: scale(0.98);

// Card hover
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0,0,0,0.1);

// Loading pulse
animation: pulse 2s infinite;
```

### Gestures
- Swipe right: Go back
- Swipe left: Delete/Archive
- Long press: More options
- Pinch: Zoom map
- Double tap: Center map

## Component Library Structure

```
src/components/
├── common/
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   └── Modal/
├── layout/
│   ├── Header/
│   ├── Navigation/
│   └── Container/
├── features/
│   ├── Booking/
│   ├── Tracking/
│   └── Payment/
└── screens/
    ├── Welcome/
    ├── Home/
    └── Profile/
```

## A/B Testing Recommendations

1. **CTA Button Colors**: Amber vs Green
2. **Service Card Layout**: Grid vs List
3. **Questionnaire**: Long form vs Progressive
4. **Map Style**: Default vs Dark mode
5. **Pricing Display**: Range vs Starting price

## Next Steps

1. Create Figma/Sketch design system
2. Build Storybook for components
3. Implement skeleton screens
4. Add accessibility features
5. Optimize mobile interactions
6. Create animation library
7. User testing sessions
8. Heat map analysis