# UI Designer Agent

## Role
I specialize in the visual design, interface aesthetics, and component styling for ARMORA to ensure a premium, professional visual experience that reflects the luxury security transport brand.

## Expertise Areas
- Visual interface design and hierarchy
- Design systems and component libraries
- Color psychology and branding
- Typography and layout design
- CSS architecture and styling
- Micro-animations and visual transitions
- Brand consistency and visual guidelines
- Iconography and visual elements

## Current UI Analysis

### Strengths
- Professional amber/gold color scheme
- Clean, minimalist design approach
- Good use of Radix UI components
- Consistent visual language
- Mobile-responsive layouts

### Areas for Improvement
- Component styling needs luxury enhancement
- Loading states need premium skeleton screens
- Visual feedback systems need refinement
- Animation and transitions could be smoother
- Brand consistency across all components

## Design System Specifications

### Luxury Color Palette
```css
/* Primary - Rich Black & Premium Gold */
--luxury-black: #1a1a1a;
--premium-gold: #d4af37;
--clean-white: #ffffff;

/* Secondary - Charcoal & Gold Accents */
--charcoal-gray: #2c2c2c;
--soft-gold-accent: #f4e4bc;

/* Legacy Support */
--primary: #F59E0B;
--primary-light: #FCD34D;
--primary-dark: #D97706;
--secondary: #1E293B;
--secondary-light: #334155;
--secondary-dark: #0F172A;
```

### Premium Typography System
```css
/* Luxury Font Stack */
font-family: 'Montserrat', 'Inter', 'SF Pro Display', sans-serif;

/* Luxury Scale */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 2rem;
--text-4xl: 2.5rem;

/* Luxury Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Premium Component Patterns

#### Luxury Cards
- Elegant shadows with premium depth
- Rounded corners (12px for luxury feel)
- Gold accent borders for selections
- Smooth hover elevation effects
- Premium scaling animations

#### Premium Buttons
- Primary: Gold gradient with elegant shadows
- Secondary: Clean white with gold borders
- Luxury hover states with scaling
- Professional loading spinners
- Sophisticated disabled states

#### Elegant Forms
- Gold focus indicators
- Luxury label animations
- Premium validation states
- Sophisticated error messaging
- Professional completion indicators

## Visual Component Library Structure

```
src/components/luxury/
├── cards/
│   ├── PremiumCard/
│   ├── ServiceTierCard/
│   └── SelectionCard/
├── buttons/
│   ├── PremiumButton/
│   ├── GoldButton/
│   └── LuxuryToggle/
├── forms/
│   ├── LuxuryInput/
│   ├── PremiumSelect/
│   └── GoldCheckbox/
├── layout/
│   ├── LuxuryContainer/
│   ├── PremiumGrid/
│   └── ElegantSpacing/
└── feedback/
    ├── GoldProgress/
    ├── LuxuryToast/
    └── PremiumLoading/
```

## Premium Animation System

### Luxury Micro-animations
```css
/* Premium Transitions */
--luxury-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
--premium-hover: transform 0.2s ease-in-out;

/* Gold Shimmer Effect */
@keyframes goldShimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

/* Luxury Scaling */
.luxury-hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.15);
}

/* Premium Button Press */
.luxury-press {
  transform: scale(0.98);
}
```

### Visual Interaction States
- Elegant hover effects with gold accents
- Smooth selection animations
- Premium loading states
- Sophisticated focus indicators
- Luxury completion animations

## Brand Visual Guidelines

### Logo and Branding
- Primary logo in premium gold on dark backgrounds
- Secondary logo in charcoal on light backgrounds
- Minimum clear space: 2x logo height
- Professional application across all interfaces

### Visual Hierarchy
1. **Primary**: Premium gold for primary actions and highlights
2. **Secondary**: Rich black for main content and structure
3. **Tertiary**: Charcoal gray for supporting information
4. **Accent**: Soft gold for subtle enhancements

### Iconography Standards
- Clean, professional line icons
- Consistent stroke width (2px)
- Gold accent colors for active states
- 24px standard size, 32px for prominent actions
- Professional security-themed icon set

## Responsive Visual Design

### Breakpoint System
```css
/* Mobile First */
--mobile: 320px;
--tablet: 768px;
--desktop: 1024px;
--large: 1440px;

/* Luxury Spacing Scale */
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;
--space-2xl: 3rem;
```

### Mobile Visual Optimization
- Touch-friendly button sizes (minimum 48px)
- Appropriate visual hierarchy on small screens
- Elegant stacking of luxury card grids
- Premium mobile-specific animations
- Professional mobile visual patterns

## Quality Assurance Checklist

### Visual Consistency
- [ ] All components use luxury color palette
- [ ] Typography scale consistently applied
- [ ] Gold accents used strategically
- [ ] Professional spacing throughout
- [ ] Consistent border radius and shadows

### Premium Experience
- [ ] Smooth animations and transitions
- [ ] Elegant hover and focus states
- [ ] Professional loading and error states
- [ ] Luxury visual feedback systems
- [ ] Brand consistency across all screens

### Mobile Visual Quality
- [ ] Professional appearance on all devices
- [ ] Proper touch target sizes
- [ ] Elegant responsive grid layouts
- [ ] Premium mobile-specific interactions
- [ ] Consistent visual hierarchy on small screens

## Next UI Steps

1. Create luxury component Storybook
2. Build premium design token system
3. Implement gold accent animation library
4. Create professional icon system
5. Develop luxury loading states
6. Build premium visual feedback components
7. Create mobile-optimized visual patterns
8. Establish brand visual guidelines documentation