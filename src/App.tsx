import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Shield, 
  Phone, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Heart, 
  NavigationArrow, 
  User, 
  Car,
  CreditCard,
  House,
  List,
  ArrowLeft,
  Plus,
  X,
  Crosshair,
  Warning,
  CheckCircle,
  ChatCircle,
  PaperPlaneTilt,
  SmileyWink,
  MagnifyingGlass,
  Bell,
  BellRinging,
  SpeakerHigh
} from "@phosphor-icons/react"
import { toast, Toaster } from 'sonner'
import { useKV } from '@github/spark/hooks'

// ARMORA Premium Personal Security Transport Services
const armoraServices = [
  {
    id: 'essential',
    name: 'Your Essential Protection Cab',
    description: 'SIA-licensed security professional driver with industry best practice protocols - available 24/7',
    priceRange: '£45 - £75',
    eta: '3-8 min',
    icon: Car,
    capacity: '1-3 passengers',
    vehicle: 'Professional vehicle, discrete service',
    popular: true // Most popular choice
  },
  {
    id: 'shadow-escort',
    name: 'Shadow Escort Cab',
    description: 'Drive yourself with professional security coordination - your freedom with protection backup, 24/7 available',
    priceRange: '£150 - £350',
    eta: '5-12 min',
    icon: Shield,
    capacity: '1-4 passengers',
    vehicle: 'Your vehicle + Professional security coordination'
  },
  {
    id: 'executive-security', 
    name: 'Your Executive Security Cab',
    description: 'Enhanced protection transport with SIA close protection officers meeting professional standards - 24/7 service',
    priceRange: '£120 - £250',
    eta: '8-15 min',
    icon: Shield,
    capacity: '1-3 passengers',
    vehicle: 'Executive protection vehicles'
  },
  {
    id: 'signature-experience',
    name: 'Your Signature Experience Cab',
    description: 'Personal security transport concierge - completely tailored to your travel lifestyle, 24/7 availability',
    priceRange: '£180 - £450',
    eta: '10-20 min',
    icon: Star,
    capacity: '1-4 passengers',
    vehicle: 'Rolls-Royce, Bentley premium fleet'
  },
  {
    id: 'airport-express',
    name: 'Airport Security Cab Express',
    description: 'Personal protection for your flight transfers with meet-greet service - 24/7 airport coverage',
    priceRange: '£65 - £120',
    eta: '15-30 min',
    icon: NavigationArrow,
    capacity: '1-6 passengers',
    vehicle: 'Mercedes E-Class, Range Rover'
  },
  {
    id: 'corporate',
    name: 'Corporate Security Cab Service',
    description: 'Your business protection transport - designed for professional demands, available around the clock',
    priceRange: '£40 - £85',
    eta: '5-12 min',
    icon: Users,
    capacity: '1-8 passengers',
    vehicle: 'Mercedes V-Class, BMW X7'
  }
]

// ARMORA Premium Security Drivers & Chauffeurs
const armoraDrivers = [
  {
    id: 1,
    name: 'James Wellington',
    rating: 4.9,
    completedTrips: 847,
    vehicle: 'Mercedes S-Class 580 - Obsidian Black',
    license: 'SIA CPO License',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    eta: 5,
    certifications: ['SIA Close Protection', 'Enhanced DBS Cleared', 'BS 7858 Screened'],
    specialties: ['Executive Protection', 'Diplomatic Transport'],
    languages: ['English', 'French']
  },
  {
    id: 2,
    name: 'Victoria Sterling',
    rating: 4.8,
    completedTrips: 623,
    vehicle: 'Bentley Flying Spur - Sage Green',
    license: 'SIA CPO License', 
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b586?w=400&q=80',
    eta: 7,
    certifications: ['SIA Close Protection', 'Enhanced DBS Cleared', 'BS 7858 Screened'],
    specialties: ['VIP Security', 'Discrete Protection'],
    languages: ['English', 'Italian', 'Spanish']
  },
  {
    id: 3,
    name: 'Marcus Blackwood',
    rating: 4.9,
    completedTrips: 1134,
    vehicle: 'Rolls-Royce Ghost - Arctic White',
    license: 'SIA CPO License',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    eta: 12,
    certifications: ['SIA Close Protection', 'Enhanced DBS Cleared', 'BS 7858 Screened'],
    specialties: ['Ultra-Luxury', 'Government Transport'],
    languages: ['English', 'German']
  }
]

function App() {
  // State management
  const [currentView, setCurrentView] = useState<string>('welcome')
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useKV("armora-onboarding-complete", false)
  const [isFirstLaunch, setIsFirstLaunch] = useKV("armora-first-launch", true)
  const [selectedService, setSelectedService] = useState<string>('')
  const [bookingForm, setBookingForm] = useState({
    pickup: '',
    destination: '',
    pickupCoords: null as { lat: number; lng: number } | null,
    destinationCoords: null as { lat: number; lng: number } | null
  })
  const [favorites, setFavorites] = useKV("favorite-locations", [] as any[])
  const [recentTrips, setRecentTrips] = useKV("recent-trips", [] as any[])

  // Questionnaire state management
  const [questionnaireStep, setQuestionnaireStep] = useState<number>(0)
  const [questionnaireAnswers, setQuestionnaireAnswers] = useKV("questionnaire-answers", {
    workType: [] as string[],
    travelFrequency: '',
    securityStyle: '',
    comfortLevel: '',
    locations: [] as string[],
    customRequirements: '',
    emergencyContact: { name: '', relationship: '', phone: '' }
  })

  // Initialize app flow based on user state
  useEffect(() => {
    if (hasCompletedOnboarding) {
      setCurrentView('home')
    } else {
      setCurrentView('welcome')
    }
  }, [hasCompletedOnboarding])

  // Distance calculation helper
  const calculateDistance = useCallback((point1: any, point2: any) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLng = (point2.lng - point1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c * 100) / 100
  }, [])

  // Dynamic pricing calculation
  const calculateServicePrice = useCallback((service: any, distance: number = 0) => {
    if (!distance || distance === 0) {
      return service.priceRange
    }

    const pricingStructure = {
      'essential': { base: 18.00, perKm: 2.15, securityFee: 2.00 },
      'shadow-escort': { base: 85.00, perKm: 18.50, securityFee: 45.00 },
      'executive-security': { base: 95.00, perKm: 15.80, securityFee: 35.00 },
      'signature-experience': { base: 150.00, perKm: 22.50, securityFee: 28.00 },
      'airport-express': { base: 45.00, perKm: 8.75, securityFee: 12.00 },
      'corporate': { base: 28.00, perKm: 6.20, securityFee: 8.00 }
    } as const

    const pricing = pricingStructure[service.id as keyof typeof pricingStructure]
    if (!pricing) return service.priceRange

    const total = pricing.base + (distance * pricing.perKm) + pricing.securityFee
    return `£${total.toFixed(2)}`
  }, [])

  // Calculate route distance for pricing
  const routeDistance = useMemo(() => {
    if (bookingForm.pickupCoords && bookingForm.destinationCoords) {
      return calculateDistance(bookingForm.pickupCoords, bookingForm.destinationCoords)
    }
    return 0
  }, [bookingForm.pickupCoords, bookingForm.destinationCoords, calculateDistance])

  // Welcome Screen
  if (currentView === 'welcome') {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <Toaster position="top-center" />
        
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-amber-400/15 to-amber-600/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="max-w-sm mx-auto text-center space-y-6 animate-in fade-in duration-1000 relative z-10">
          {/* Logo and Main Branding */}
          <div className="space-y-4">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl relative">
                <Shield size={32} className="text-slate-900" weight="fill" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 rounded-full" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 to-amber-600/20 rounded-full blur-xl animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 bg-clip-text">
                Armora Cabs 24/7
              </h1>
              <p className="text-lg text-amber-100/90 font-medium tracking-wide">
                Professional Security Transport
              </p>
              <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
                Available around the clock for your protection
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 mx-auto bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-400/30">
                  <Shield size={20} className="text-emerald-400" weight="bold" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-300">SIA Licensed</p>
                  <p className="text-[9px] text-slate-400">Government Certified</p>
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <div className="w-10 h-10 mx-auto bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-xl flex items-center justify-center border border-amber-400/30">
                  <Users size={20} className="text-amber-400" weight="fill" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-300">Professional</p>
                  <p className="text-[9px] text-slate-400">Security Drivers</p>
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <div className="w-10 h-10 mx-auto bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-400/30">
                  <Star size={20} className="text-blue-400" weight="fill" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-300">4.9★ Rating</p>
                  <p className="text-[9px] text-slate-400">Premium Service</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-amber-400/20 backdrop-blur-sm">
              <p className="text-sm text-amber-200 font-medium">
                ✨ Professional security-trained drivers
              </p>
            </div>
          </div>

          {/* Main Action Button */}
          <div className="space-y-3">
            <Button 
              onClick={() => {
                setIsFirstLaunch(false)
                setCurrentView('questionnaire')
                setQuestionnaireStep(0)
              }}
              className="w-full h-12 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold text-base rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Button>
            
            <p className="text-sm text-slate-400 font-medium">
              Professional security transport • Available 24/7
            </p>
          </div>

          {/* Bottom Trust Line */}
          <div className="pt-4 border-t border-amber-400/20">
            <p className="text-xs text-amber-300 font-bold">
              Trusted by professionals across London
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Questionnaire Flow
  if (currentView === 'questionnaire') {
    const handleQuestionnaireAnswer = (field: string, value: any) => {
      setQuestionnaireAnswers(prev => ({
        ...prev,
        [field]: value
      }))
    }

    const handleContinue = () => {
      window.scrollTo(0, 0)
      if (questionnaireStep < 6) {
        setQuestionnaireStep(prev => prev + 1)
      } else {
        // Complete questionnaire
        setHasCompletedOnboarding(true)
        setCurrentView('home')
      }
    }

    const handleBack = () => {
      window.scrollTo(0, 0)
      if (questionnaireStep > 0) {
        setQuestionnaireStep(prev => prev - 1)
      } else {
        setCurrentView('welcome')
      }
    }

    const handleSaveAndExit = () => {
      setCurrentView('welcome')
      toast.success("Progress saved. You can continue later.")
    }

    // Step 0: Work Type Selection
    if (questionnaireStep === 0) {
      const workOptions = [
        { id: 'business-leader', title: 'Business Leader', subtitle: 'CEO, manager, executive roles', perfectFor: 'Board meetings, investor presentations, strategic planning' },
        { id: 'business-owner', title: 'Business Owner', subtitle: 'Own a company, startup founder', perfectFor: 'Investor meetings, client pitches, business development', popular: true },
        { id: 'lawyer-legal', title: 'Lawyer/Legal', subtitle: 'Attorney, legal work, court cases', perfectFor: 'Court appearances, client consultations, sensitive legal meetings' },
        { id: 'doctor-medical', title: 'Doctor/Medical', subtitle: 'Healthcare, medical professional', perfectFor: 'Hospital visits, medical conferences, patient consultations' },
        { id: 'banking-finance', title: 'Banking/Finance', subtitle: 'Money, investments, financial services', perfectFor: 'Client portfolio meetings, investment presentations' },
        { id: 'tech-computer', title: 'Tech/Computer', subtitle: 'Software, IT, technology work', perfectFor: 'Client demos, tech conferences, startup meetings' },
        { id: 'real-estate', title: 'Real Estate', subtitle: 'Property, buying/selling homes/buildings', perfectFor: 'Property viewings, client meetings, market tours' },
        { id: 'sales-travel', title: 'Sales/Travel', subtitle: 'Selling, traveling for work', perfectFor: 'Client sales meetings, trade shows, territory visits' }
      ]

      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-background/95 overflow-y-auto">
          <Toaster position="top-center" />
          
          {/* Header */}
          <div className="p-4 border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h1 className="questionnaire-title">
                  <h3>What kind of work do you do?</h3>
                </h1>
                <div className="text-sm text-muted-foreground">Step 1 of 7</div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Pick all that describe your work (you can choose more than one)</p>
              <div className="w-full bg-border/30 rounded-full h-1">
                <div className="bg-primary h-1 rounded-full" style={{ width: '14%' }}></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 pb-32 max-w-md mx-auto space-y-3">
            {workOptions.map(option => {
              const isSelected = questionnaireAnswers.workType.includes(option.id)
              return (
                <Card 
                  key={option.id}
                  className={`questionnaire-card cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-orange-500 bg-orange-50/50 shadow-lg' 
                      : 'hover:shadow-md bg-white border border-border/40'
                  } ${option.popular ? 'work-type-card has-badge' : 'work-type-card'}`}
                  onClick={() => {
                    const currentSelection = questionnaireAnswers.workType
                    if (isSelected) {
                      handleQuestionnaireAnswer('workType', currentSelection.filter(id => id !== option.id))
                    } else {
                      handleQuestionnaireAnswer('workType', [...currentSelection, option.id])
                    }
                  }}
                >
                  {option.popular && (
                    <div className="popular-badge">Most Popular</div>
                  )}
                  <div className={`checkbox-indicator ${isSelected ? 'checked' : ''}`}>
                    <div className="check-dot"></div>
                  </div>
                  <CardContent className="content-padding">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base text-foreground">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                      <p className="text-xs text-muted-foreground">Perfect for: {option.perfectFor}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* Custom Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Other work you do:</label>
              <Input
                placeholder="Describe your specific work situation..."
                className="text-sm"
                maxLength={200}
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
            <div className="max-w-md mx-auto flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleSaveAndExit}
                className="flex-1 h-12 text-sm font-medium"
              >
                Save & Exit
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={questionnaireAnswers.workType.length === 0}
                className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Step 1: Travel Frequency
    if (questionnaireStep === 1) {
      const frequencyOptions = [
        { id: 'sometimes', title: 'Just Sometimes', subtitle: 'Special events and rare occasions', perfectFor: 'Important meetings, special events, airport trips' },
        { id: 'weekly', title: 'About Once a Week', subtitle: 'Regular meetings and weekly commitments', perfectFor: 'Weekly client meetings, regular business appointments' },
        { id: 'daily', title: 'Almost Every Day', subtitle: 'Daily commute and regular work transport', perfectFor: 'Daily office commute, regular work schedule' },
        { id: 'multiple', title: 'Multiple Times Daily', subtitle: 'Very busy schedule with frequent travel', perfectFor: 'Back-to-back meetings, multiple daily appointments' }
      ]

      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-background/95 overflow-y-auto">
          <Toaster position="top-center" />
          
          {/* Header */}
          <div className="p-4 border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h1 className="questionnaire-title">
                  <h3>How often do you need secure transport?</h3>
                </h1>
                <div className="text-sm text-muted-foreground">Step 2 of 7</div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Pick the one that best matches your needs</p>
              <div className="w-full bg-border/30 rounded-full h-1">
                <div className="bg-primary h-1 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 pb-32 max-w-md mx-auto space-y-3">
            {frequencyOptions.map(option => {
              const isSelected = questionnaireAnswers.travelFrequency === option.id
              return (
                <Card 
                  key={option.id}
                  className={`questionnaire-card cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-orange-500 bg-orange-50/50 shadow-lg' 
                      : 'hover:shadow-md bg-white border border-border/40'
                  }`}
                  onClick={() => handleQuestionnaireAnswer('travelFrequency', option.id)}
                >
                  <div className={`checkbox-indicator ${isSelected ? 'checked' : ''}`}>
                    <div className="check-dot"></div>
                  </div>
                  <CardContent className="content-padding">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base text-foreground">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                      <p className="text-xs text-muted-foreground">Perfect for: {option.perfectFor}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
            <div className="max-w-md mx-auto flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="w-20 h-12 text-sm font-medium"
              >
                Back
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveAndExit}
                className="flex-1 h-12 text-sm font-medium"
              >
                Save & Exit
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={!questionnaireAnswers.travelFrequency}
                className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Step 2: Security Style
    if (questionnaireStep === 2) {
      const styleOptions = [
        { id: 'quiet', title: 'Quiet & Discreet', subtitle: 'Barely noticeable, low-key protection', perfectFor: 'Daily routines, business meetings, family outings' },
        { id: 'professional', title: 'Professional & Visible', subtitle: 'Clearly there but business-like', perfectFor: 'Business meetings, corporate events, professional settings' },
        { id: 'premium', title: 'Full Premium Service', subtitle: 'Complete security with top protection', perfectFor: 'High-profile events, VIP occasions, maximum security needs' }
      ]

      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-background/95 overflow-y-auto">
          <Toaster position="top-center" />
          
          {/* Header */}
          <div className="p-4 border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h1 className="questionnaire-title">
                  <h3>How do you want your security to look?</h3>
                </h1>
                <div className="text-sm text-muted-foreground">Step 3 of 7</div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Pick the style that feels right for you</p>
              <div className="w-full bg-border/30 rounded-full h-1">
                <div className="bg-primary h-1 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 pb-32 max-w-md mx-auto space-y-3">
            {styleOptions.map(option => {
              const isSelected = questionnaireAnswers.securityStyle === option.id
              return (
                <Card 
                  key={option.id}
                  className={`questionnaire-card cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-orange-500 bg-orange-50/50 shadow-lg' 
                      : 'hover:shadow-md bg-white border border-border/40'
                  }`}
                  onClick={() => handleQuestionnaireAnswer('securityStyle', option.id)}
                >
                  <div className={`checkbox-indicator ${isSelected ? 'checked' : ''}`}>
                    <div className="check-dot"></div>
                  </div>
                  <CardContent className="content-padding">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base text-foreground">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                      <p className="text-xs text-muted-foreground">Perfect for: {option.perfectFor}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
            <div className="max-w-md mx-auto flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="w-20 h-12 text-sm font-medium"
              >
                Back
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveAndExit}
                className="flex-1 h-12 text-sm font-medium"
              >
                Save & Exit
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={!questionnaireAnswers.securityStyle}
                className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Completion screen for remaining steps
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 flex items-center justify-center p-4">
        <div className="max-w-sm mx-auto text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-white" weight="fill" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
            <p className="text-muted-foreground mb-6">
              Based on your responses, we recommend our Standard Transport service for your security needs.
            </p>
          </div>
          <Button 
            onClick={() => {
              setHasCompletedOnboarding(true)
              setCurrentView('home')
            }}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            Start Using Armora Cabs 24/7
          </Button>
        </div>
      </div>
    )
  }

  // Home/Booking View
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 flex flex-col">
        <Toaster position="top-center" />
        
        {/* Header */}
        <header className="bg-background/98 backdrop-blur-sm border-b border-border/30 p-3 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Car size={12} className="text-primary-foreground" weight="bold" />
              </div>
              <div>
                <h1 className="text-base font-bold">Armora Cabs 24/7</h1>
                <p className="text-[10px] text-muted-foreground">Professional security cab service</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-6 h-6 rounded-full"
              onClick={() => setCurrentView('welcome')}
            >
              <User size={12} />
            </Button>
          </div>
        </header>

        <div className="flex-1 p-4 space-y-4 max-w-md mx-auto pb-20">
          {/* Location Input */}
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-3 space-y-2">
              <div className="space-y-1.5">
                <div className="relative">
                  <Input
                    value={bookingForm.pickup}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, pickup: e.target.value }))}
                    placeholder="Pickup location"
                    className="pl-6 h-8 border-0 bg-muted/50 focus:bg-background text-xs"
                  />
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                
                <div className="relative">
                  <Input
                    value={bookingForm.destination}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="Where to?"
                    className="pl-6 h-8 border-0 bg-muted/50 focus:bg-background text-xs"
                  />
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Selection */}
          <div className="space-y-2">
            <h2 className="text-lg font-bold">Choose Your Security Cab Service</h2>
            
            <div className="grid grid-cols-2 gap-3">
              {armoraServices.map(service => {
                const Icon = service.icon
                const isSelected = selectedService === service.id
                const dynamicPrice = calculateServicePrice(service, routeDistance)
                
                return (
                  <Card 
                    key={service.id}
                    className={`cursor-pointer transition-all duration-200 h-[120px] overflow-hidden relative ${ 
                      isSelected
                        ? 'ring-2 ring-primary bg-primary/10 shadow-lg' 
                        : 'hover:shadow-md bg-white border border-border/40'
                    } ${service.popular ? 'border-green-200' : ''}`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    {service.popular && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-[6px] font-bold px-1 py-0.5 rounded-full">
                        ★
                      </div>
                    )}
                    <CardContent className="p-3 h-full flex flex-col items-center justify-center text-center space-y-1.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ 
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted/70 text-primary'
                      }`}>
                        <Icon size={18} weight={isSelected ? "fill" : "regular"} />
                      </div>
                      
                      <h3 className={`font-bold text-[10px] leading-tight text-center line-clamp-1 ${ 
                        isSelected ? 'text-primary' : 'text-foreground'
                      }`}>
                        {service.name}
                      </h3>
                      
                      <p className={`font-bold text-sm leading-none ${ 
                        isSelected ? 'text-primary' : 'text-foreground'
                      }`}>
                        {dynamicPrice}
                      </p>
                      
                      <div className="space-y-0.5 text-center">
                        <p className="text-[9px] text-muted-foreground leading-none">
                          {service.eta}
                        </p>
                        <p className="text-[9px] text-muted-foreground leading-none">
                          {service.capacity}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Book Button */}
          <Button 
            onClick={() => {
              if (!bookingForm.pickup || !bookingForm.destination || !selectedService) {
                toast.error("Please enter pickup, destination and select a service")
                return
              }
              toast.success("Booking confirmed! Driver will be assigned shortly.")
            }}
            className="w-full h-10 bg-gradient-to-r from-black to-black/90 hover:from-black/90 hover:to-black/80 text-white font-semibold text-sm rounded-xl shadow-lg disabled:opacity-50"
            disabled={!bookingForm.pickup || !bookingForm.destination || !selectedService}
          >
            {!bookingForm.pickup || !bookingForm.destination ? 
              'Enter locations' :
              !selectedService ? 
              'Select service' :
              'Book Security Cab'
            }
          </Button>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 z-50">
          <div className="grid grid-cols-5 h-12 max-w-md mx-auto">
            <button
              onClick={() => setCurrentView('home')}
              className="flex flex-col items-center justify-center gap-0.5 text-primary transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <House size={16} weight="fill" />
              </div>
              <span className="text-[10px] font-semibold">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentView('activity')}
              className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <List size={16} />
              </div>
              <span className="text-[10px]">Activity</span>
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Heart size={16} />
              </div>
              <span className="text-[10px]">Saved</span>
            </button>

            <button
              onClick={() => setCurrentView('account')}
              className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <User size={16} />
              </div>
              <span className="text-[10px]">Account</span>
            </button>

            <button
              onClick={() => setCurrentView('welcome')}
              className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Shield size={16} />
              </div>
              <span className="text-[10px]">Reset</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Activity View
  if (currentView === 'activity') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 p-4 sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold">Your Activity</h1>
            <p className="text-sm text-muted-foreground">Recent trips and bookings</p>
          </div>
        </header>

        <div className="p-4 pb-24 max-w-md mx-auto">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <List size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No trips yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Your security cab bookings will appear here</p>
            <Button onClick={() => setCurrentView('home')} className="h-12 px-6 rounded-xl font-semibold">
              <Car size={18} className="mr-2" />
              Book your first cab
            </Button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 z-50">
          <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
            <button onClick={() => setCurrentView('home')} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <House size={20} />
              <span className="text-xs">Home</span>
            </button>
            <button onClick={() => setCurrentView('activity')} className="flex flex-col items-center justify-center gap-1 text-primary transition-colors">
              <List size={20} weight="fill" />
              <span className="text-xs font-semibold">Activity</span>
            </button>
            <button onClick={() => setCurrentView('favorites')} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Heart size={20} />
              <span className="text-xs">Saved</span>
            </button>
            <button onClick={() => setCurrentView('account')} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <User size={20} />
              <span className="text-xs">Account</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Favorites View
  if (currentView === 'favorites') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 p-4 sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold">Saved Places</h1>
            <p className="text-sm text-muted-foreground">Quick access to your favorites</p>
          </div>
        </header>

        <div className="p-4 pb-24 max-w-md mx-auto">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No saved places</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Save favorite locations for quick booking</p>
            <Button onClick={() => setCurrentView('home')} className="h-12 px-6 rounded-xl font-semibold">
              <Plus size={18} className="mr-2" />
              Add first location
            </Button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 z-50">
          <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
            <button onClick={() => setCurrentView('home')} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <House size={20} />
              <span className="text-xs">Home</span>
            </button>
            <button onClick={() => setCurrentView('activity')} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <List size={20} />
              <span className="text-xs">Activity</span>
            </button>
            <button onClick={() => setCurrentView('favorites')} className="flex flex-col items-center justify-center gap-1 text-primary transition-colors">
              <Heart size={20} weight="fill" />
              <span className="text-xs font-semibold">Saved</span>
            </button>
            <button onClick={() => setCurrentView('account')} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <User size={20} />
              <span className="text-xs">Account</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Account View  
  if (currentView === 'account') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 p-4 sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold">Account</h1>
            <p className="text-sm text-muted-foreground">Manage your profile and settings</p>
          </div>
        </header>

        <div className="p-4 pb-24 space-y-6 max-w-md mx-auto">
          {/* Profile Section */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                    <User size={32} className="text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-1">John Smith</h3>
                  <p className="text-muted-foreground text-sm mb-1">john.smith@email.com</p>
                  <p className="text-muted-foreground text-sm">+44 7700 900123</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Star size={14} className="text-yellow-500" weight="fill" />
                    <span className="text-sm font-medium">4.9 passenger rating</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-3">Settings</h2>
            
            <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <span className="font-medium">Payment Methods</span>
                      <p className="text-xs text-muted-foreground">Manage cards and billing</p>
                    </div>
                  </div>
                  <NavigationArrow size={16} className="rotate-90 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                      <Shield size={20} />
                    </div>
                    <div>
                      <span className="font-medium">Privacy & Safety</span>
                      <p className="text-xs text-muted-foreground">Security settings</p>
                    </div>
                  </div>
                  <NavigationArrow size={16} className="rotate-90 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 z-50">
          <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
            <button onClick={() => setCurrentView('home')} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <House size={20} />
              <span className="text-xs">Home</span>
            </button>
            <button onClick={() => setCurrentView('activity')} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <List size={20} />
              <span className="text-xs">Activity</span>
            </button>
            <button onClick={() => setCurrentView('favorites')} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Heart size={20} />
              <span className="text-xs">Saved</span>
            </button>
            <button onClick={() => setCurrentView('account')} className="flex flex-col items-center justify-center gap-1 text-primary transition-colors">
              <User size={20} weight="fill" />
              <span className="text-xs font-semibold">Account</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default App