# GQCars - Premium Car Dealership Platform

A sophisticated digital platform for browsing, searching, and inquiring about premium vehicles with an emphasis on luxury and professional presentation.

**Experience Qualities**: 
1. **Premium** - Convey luxury and quality through refined typography, generous spacing, and elegant interactions
2. **Trustworthy** - Build confidence through clear information, professional imagery placeholders, and transparent pricing
3. **Effortless** - Enable intuitive browsing with smart filters, seamless navigation, and streamlined contact forms

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple interconnected features including inventory browsing, filtering, detailed views, and inquiry management with persistent user preferences and favorites

## Essential Features

**Vehicle Inventory Browser**
- Functionality: Display grid of available vehicles with images, key specs, and pricing
- Purpose: Allow customers to quickly scan available inventory and identify vehicles of interest
- Trigger: Landing on homepage or clicking "Browse Inventory"
- Progression: Grid view → Filter/sort options → Vehicle cards with hover details → Click for full details
- Success criteria: Users can see all vehicles, understand key information at a glance, and navigate to details

**Advanced Vehicle Search & Filtering**
- Functionality: Filter by make, model, year, price range, mileage, fuel type, transmission
- Purpose: Help customers narrow down options based on their specific needs and budget
- Trigger: Using filter sidebar or search bar on inventory page
- Progression: Select filters → Real-time results update → Clear/modify filters → Save search preferences
- Success criteria: Results update instantly, filters are intuitive, saved preferences persist

**Detailed Vehicle Information**
- Functionality: Comprehensive vehicle details including specs, features, multiple photos, history
- Purpose: Provide all information needed for purchase decision without requiring in-person visit
- Trigger: Clicking on vehicle card from inventory or search results
- Progression: Vehicle card click → Detailed view with image gallery → Specifications tabs → Contact/inquiry actions
- Success criteria: All relevant information is accessible, images are prominent, contact options are clear

**Customer Inquiry System**
- Functionality: Contact forms for specific vehicles, general inquiries, and financing questions
- Purpose: Capture qualified leads and enable direct communication about specific vehicles
- Trigger: "Contact About This Car" buttons, general contact page, financing calculator
- Progression: Click inquiry → Form with pre-filled vehicle info → Submit → Confirmation with next steps
- Success criteria: Forms are pre-populated, submissions are confirmed, follow-up process is clear

**Favorites & Comparison**
- Functionality: Save vehicles to favorites list and compare up to 3 vehicles side-by-side
- Purpose: Help customers organize their search and make informed decisions between options
- Trigger: Heart icon on vehicle cards, "Compare" checkboxes, "My Favorites" page
- Progression: Heart click → Added to favorites → Access favorites page → Select compare → Side-by-side view
- Success criteria: Favorites persist across sessions, comparison is visually clear and informative

## Edge Case Handling

- **No Search Results**: Display helpful message with suggestions to broaden search criteria and link to full inventory
- **Sold Vehicles**: Show "SOLD" overlay on cards with option to find similar vehicles and notify about similar arrivals
- **Form Errors**: Inline validation with specific guidance for required fields and format requirements
- **Mobile Navigation**: Collapsible filter sidebar and responsive grid that maintains usability on small screens
- **Slow Image Loading**: Skeleton placeholders and progressive image loading with optimized thumbnails

## Design Direction

The design should evoke premium automotive luxury - sophisticated, clean, and confident like a high-end showroom. Rich interface with strategic use of space, premium typography, and subtle animations that reinforce quality and attention to detail.

## Color Selection

Custom palette with sophisticated automotive luxury feel
- **Primary Color**: Deep Charcoal (oklch(0.25 0.02 240)) - Communicates sophistication and premium quality, used for primary actions and headers
- **Secondary Colors**: Pearl White (oklch(0.97 0.005 180)) for backgrounds and Platinum Silver (oklch(0.75 0.015 200)) for subtle accents
- **Accent Color**: Luxury Gold (oklch(0.70 0.15 85)) - Premium highlight for CTAs, pricing, and featured elements
- **Foreground/Background Pairings**: 
  - Background Pearl White (oklch(0.97 0.005 180)): Deep Charcoal text (oklch(0.25 0.02 240)) - Ratio 4.9:1 ✓
  - Primary Deep Charcoal (oklch(0.25 0.02 240)): Pearl White text (oklch(0.97 0.005 180)) - Ratio 4.9:1 ✓
  - Accent Luxury Gold (oklch(0.70 0.15 85)): Deep Charcoal text (oklch(0.25 0.02 240)) - Ratio 3.2:1 ✓
  - Card Platinum Silver (oklch(0.75 0.015 200)): Deep Charcoal text (oklch(0.25 0.02 240)) - Ratio 3.8:1 ✓

## Font Selection

Typography should convey premium automotive elegance with excellent readability - a sophisticated sans-serif that balances modernity with timeless appeal, similar to luxury car branding.

- **Typographic Hierarchy**: 
  - H1 (Site Title): Inter Bold/32px/tight letter spacing for strong brand presence
  - H2 (Section Headers): Inter SemiBold/24px/normal spacing for clear content organization  
  - H3 (Vehicle Names): Inter Medium/20px/slight letter spacing for premium feel
  - Body Text: Inter Regular/16px/relaxed line height for comfortable reading
  - Price/Stats: Inter Bold/18px/tabular numbers for emphasis and alignment
  - Labels: Inter Medium/14px/uppercase for subtle hierarchy

## Animations

Subtle luxury with purposeful motion that enhances the premium experience - refined transitions that guide attention without distraction, similar to high-end automotive interfaces.

- **Purposeful Meaning**: Smooth page transitions communicate quality craftsmanship, hover effects suggest premium interactivity, filter animations reinforce responsive functionality
- **Hierarchy of Movement**: Primary focus on vehicle card interactions and image galleries, secondary attention to navigation and filter states, minimal background motion

## Component Selection

- **Components**: Card for vehicle listings, Dialog for detailed views and forms, Tabs for vehicle specifications, Select for filters, Button with variants for different action levels, Badge for vehicle status/features, Carousel for image galleries
- **Customizations**: Enhanced Card with premium shadows and borders, custom Badge styles for vehicle features (NEW, CERTIFIED, etc.), styled Select components with automotive iconography
- **States**: Buttons with subtle depth changes on hover/press, Cards with smooth scale and shadow transitions, Form inputs with elegant focus states using gold accent
- **Icon Selection**: Car, Engine, Fuel, Calendar, MapPin, Heart, Star, Filter, Search, Phone for intuitive automotive context
- **Spacing**: Generous padding using Tailwind's 6-8 scale for premium feel, consistent 4-6 gaps between related elements, 8-12 for section separation
- **Mobile**: Responsive grid (1 col mobile, 2 tablet, 3-4 desktop), collapsible filter drawer, touch-optimized buttons and cards, simplified navigation with hamburger menu