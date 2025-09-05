# 🚗 GQ Cars - Premium Ride Booking App

A modern, fully-featured ride-booking application built with React 19, TypeScript, and real Google Maps integration. Designed for the UK market with professional drivers and premium service levels.

## ✨ Features

### 🎯 **Core Ride Booking**
- **Real-time GPS tracking** with live location updates
- **Google Maps integration** with Places API autocomplete
- **Multiple service levels** (Standard, Comfort, Executive, XL)
- **Instant driver assignment** with professional driver profiles
- **Live trip tracking** with ETA updates and route visualization
- **Chat system** with drivers during trips

### 📅 **Advanced Features**
- **Scheduled rides** - Plan trips in advance
- **Emergency contacts** - Safety-first approach with trusted contacts
- **Corporate billing** - Business account management
- **Favorite locations** - Quick access to frequent destinations
- **Trip history** - Complete journey records
- **Offline support** - PWA with service worker caching

### 🛡️ **Enterprise-Grade Quality**
- **TypeScript throughout** - Full type safety
- **Zod validation** - Runtime type checking
- **Error boundaries** - Graceful error handling
- **Accessibility** - ARIA labels and keyboard navigation
- **Responsive design** - Mobile-first approach
- **Performance optimized** - Lazy loading and code splitting

## 🏗️ Architecture

### **Modern Tech Stack**
- **React 19** with Concurrent Features
- **TypeScript** for type safety
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Tailwind CSS 4** for styling
- **Radix UI** for accessible components
- **Zod** for schema validation

### **Project Structure**
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI primitives
│   ├── map/            # Google Maps integration
│   ├── chat/           # Driver chat system
│   ├── scheduling/     # Scheduled rides
│   ├── contacts/       # Emergency contacts
│   ├── corporate/      # Business features
│   ├── common/         # Shared components
│   └── navigation/     # App navigation
├── views/              # Main application views
├── hooks/              # Custom React hooks
├── services/           # API and service layer
├── utils/              # Utility functions
├── constants/          # App constants and config
└── types/              # TypeScript type definitions
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or pnpm
- Google Maps API key

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd gqcars-manager

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Add your Google Maps API key
echo "VITE_GOOGLE_MAPS_API_KEY=your_api_key_here" >> .env

# Start development server
npm run dev
```

### **Environment Configuration**
Create a `.env` file with the following variables:

```bash
# Required
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Optional - App Configuration
VITE_APP_TITLE=GQ Cars
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# API Configuration  
VITE_API_BASE_URL=https://api.gqcars.com
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_SCHEDULED_RIDES=true
VITE_ENABLE_EMERGENCY_CONTACTS=true
VITE_ENABLE_CORPORATE_BILLING=true

# Map Settings
VITE_DEFAULT_MAP_CENTER_LAT=51.5074
VITE_DEFAULT_MAP_CENTER_LNG=-0.1278
```

## 📱 PWA Features

### **Offline Support**
- Service worker with intelligent caching strategies
- Background sync for offline actions
- Offline fallbacks for critical functionality

### **Native App Experience**
- App manifest for home screen installation
- Push notifications for trip updates
- Native sharing capabilities
- Keyboard shortcuts and gestures

### **Performance**
- Cache-first for static assets
- Network-first for API requests
- Stale-while-revalidate for dynamic content

## 🔧 Development

### **Available Scripts**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### **Code Quality**
- **ESLint** for code linting
- **TypeScript** for type checking
- **Error boundaries** for error handling
- **Component testing** with React Testing Library
- **End-to-end testing** with Playwright

### **Development Tools**
- **Hot Module Replacement** for fast development
- **TypeScript IntelliSense** in VS Code
- **Chrome DevTools** integration
- **React Developer Tools** support

## 🌍 Google Maps Integration

### **Features**
- **Real-time GPS** with high accuracy positioning
- **Places Autocomplete** with UK-focused results
- **Geocoding** for address resolution
- **Directions API** for route calculation
- **Traffic layer** for real-time conditions

### **Configuration**
The app uses the Google Maps JavaScript API with the following services:
- Maps JavaScript API
- Places API  
- Geocoding API
- Directions API

Ensure your API key has these services enabled in the Google Cloud Console.

## 📊 Features Implementation Status

| Feature | Status | Description |
|---------|--------|-------------|
| ✅ Core Booking | Complete | Full ride booking with real GPS |
| ✅ Google Maps | Complete | Live maps with Places API |
| ✅ Driver Matching | Complete | Instant driver assignment |
| ✅ Live Tracking | Complete | Real-time trip monitoring |
| ✅ Chat System | Complete | In-app driver communication |
| ✅ Scheduled Rides | Complete | Advance trip planning |
| ✅ Emergency Contacts | Complete | Safety contact management |
| ✅ Corporate Billing | Complete | Business account features |
| ✅ Trip History | Complete | Complete journey records |
| ✅ PWA Support | Complete | Offline functionality |
| ✅ TypeScript | Complete | Full type safety |
| ✅ Accessibility | Complete | WCAG 2.1 compliance |

## 🔐 Security & Privacy

### **Data Protection**
- No sensitive data stored in localStorage
- Secure API communication (HTTPS only)
- Location data encrypted in transit
- GDPR-compliant data handling

### **Security Measures**
- Input validation with Zod schemas
- XSS protection through React
- CSRF token implementation ready
- Environment variable configuration

## 🚀 Deployment

### **Production Build**
```bash
npm run build
```

### **Deployment Options**
- **Vercel** - Recommended for React apps
- **Netlify** - Good for static hosting
- **AWS S3 + CloudFront** - Enterprise solution
- **Docker** - Container deployment

### **Performance Optimization**
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Service worker caching strategies
- Bundle size analysis with webpack-bundle-analyzer

## 📈 Monitoring & Analytics

### **Performance Monitoring**
- Core Web Vitals tracking
- Real User Monitoring (RUM)
- Error tracking with Sentry
- Custom performance metrics

### **Business Analytics**
- Trip completion rates
- User engagement metrics
- Driver efficiency tracking
- Revenue analytics

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

### **Code Style**
- Use TypeScript for all new code
- Follow the existing component patterns
- Add proper accessibility attributes
- Include error boundaries for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For technical support or questions:
- 📧 Email: support@gqcars.com
- 📱 Phone: +44 20 7946 0958
- 💬 Chat: Available in the app

---

**Built with ❤️ for the UK ride-booking market** | [GQ Cars Ltd](https://gqcars.com)