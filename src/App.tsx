import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Shield, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Heart, 
  HeartStraight, 
  NavigationArrow, 
  User, 
  Crosshair, 
  Timer,
  Warning,
  CheckCircle,
  Lightning,
  Eye,
  Lock,
  Certificate,
  Car,
  Siren
} from "@phosphor-icons/react"
import { toast, Toaster } from 'sonner'
import { useKV } from '@github/spark/hooks'

// Security Service Levels
const securityServices = [
  {
    id: 'solo',
    name: 'Solo Security Driver',
    description: 'Licensed security professional with defensive driving training',
    price: 85,
    eta: '4-6 min',
    features: ['Armed security driver', 'Defensive driving certified', 'Background verified', 'Real-time tracking'],
    icon: Shield,
    threat_level: 'low'
  },
  {
    id: 'enhanced',
    name: 'Enhanced Protection',
    description: 'Security driver plus communication support and route monitoring',
    price: 150,
    eta: '6-8 min',
    features: ['Solo driver benefits', 'Route monitoring', 'Communications support', 'Emergency protocols'],
    icon: Eye,
    threat_level: 'medium'
  },
  {
    id: 'executive',
    name: 'Executive Protection',
    description: 'Multi-person security team with advance reconnaissance',
    price: 350,
    eta: '8-12 min',
    features: ['Security team', 'Advance reconnaissance', 'Threat assessment', 'Executive protocols'],
    icon: Users,
    threat_level: 'high'
  }
]

// Risk Assessment Questions
const riskQuestions = [
  {
    id: 'threat_level',
    question: 'What is your current threat awareness level?',
    options: [
      { value: 'none', label: 'No known threats', score: 0 },
      { value: 'general', label: 'General safety concerns', score: 2 },
      { value: 'specific', label: 'Specific threats identified', score: 4 },
      { value: 'immediate', label: 'Immediate danger present', score: 6 }
    ]
  },
  {
    id: 'location_risk',
    question: 'How would you rate the security risk of your current location?',
    options: [
      { value: 'low', label: 'Safe area (downtown business district)', score: 0 },
      { value: 'medium', label: 'Moderate risk (mixed neighborhood)', score: 2 },
      { value: 'high', label: 'High risk (known dangerous area)', score: 4 },
      { value: 'critical', label: 'Critical risk (active threat zone)', score: 6 }
    ]
  },
  {
    id: 'time_sensitivity',
    question: 'How urgent is your transportation need?',
    options: [
      { value: 'planned', label: 'Planned travel (can wait)', score: 0 },
      { value: 'prompt', label: 'Need prompt service (within 15 min)', score: 1 },
      { value: 'urgent', label: 'Urgent (within 5 min)', score: 3 },
      { value: 'emergency', label: 'Emergency evacuation needed', score: 6 }
    ]
  }
]

// Sample security drivers
const securityDrivers = [
  {
    id: 1,
    name: 'Marcus Thompson',
    title: 'Senior Security Operator',
    credentials: ['Licensed Security Professional', 'Defensive Driving Certified', 'Former Military Police'],
    experience: '8 years',
    rating: 4.9,
    completedTrips: 1847,
    specializations: ['Executive Protection', 'Threat Assessment', 'Emergency Response'],
    vehicle: '2024 BMW X5 (Armored)',
    license: 'SEC-4721',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
  },
  {
    id: 2,
    name: 'Sarah Chen',
    title: 'Protection Specialist',
    credentials: ['Advanced Security License', 'Tactical Driving Expert', 'Emergency Medical Training'],
    experience: '6 years',
    rating: 5.0,
    completedTrips: 1205,
    specializations: ['Corporate Security', 'Medical Emergencies', 'High-Risk Transport'],
    vehicle: '2024 Mercedes GLE (Security Package)',
    license: 'SEC-3891',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b586?w=400&q=80'
  }
]

// Security Tracking Map Component
const SecurityTrackingMap = ({ trip, driver }: { trip: any, driver: any }) => {
  const [driverPosition, setDriverPosition] = useState({ x: 20, y: 80 })
  const [tripProgress, setTripProgress] = useState(0)
  const [eta, setEta] = useState(6)
  const [securityStatus, setSecurityStatus] = useState('secure')
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPosition(prev => {
        const newX = Math.min(prev.x + (Math.random() * 2 + 1), 80)
        const newY = Math.max(prev.y - (Math.random() * 1.5 + 0.5), 20)
        return { x: newX, y: newY }
      })
      
      setTripProgress(prev => Math.min(prev + (Math.random() * 2 + 1), 100))
      setEta(prev => Math.max(prev - 0.1, 0))
      setLastUpdate(new Date())
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="relative bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg h-64 overflow-hidden border border-primary/20 shadow-lg">
      {/* Security Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" className="text-primary">
          <defs>
            <pattern id="security-grid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#security-grid)" />
        </svg>
      </div>

      {/* Secure Route Line */}
      <svg className="absolute inset-0 w-full h-full">
        <path
          d={`M 20% 80% Q 40% 60% 60% 40% T 80% 20%`}
          stroke="rgb(var(--muted-foreground) / 0.2)"
          strokeWidth="4"
          fill="none"
        />
        {/* Secured Route Progress */}
        <path
          d={`M 20% 80% Q 40% 60% 60% 40% T 80% 20%`}
          stroke="rgb(var(--primary))"
          strokeWidth="4"
          fill="none"
          strokeDasharray={`${tripProgress * 4}% ${400 - tripProgress * 4}%`}
          className="transition-all duration-2000"
        />
      </svg>

      {/* Pickup Location */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
        style={{ left: '20%', top: '80%' }}
      >
        <div className="bg-background border border-primary rounded-full p-2 shadow-lg">
          <Shield size={12} className="text-primary" weight="fill" />
        </div>
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap font-medium shadow-lg">
          Pickup
        </div>
      </div>

      {/* Security Driver Position */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-4000"
        style={{ 
          left: `${20 + (60 * (tripProgress / 100))}%`, 
          top: `${80 - (60 * (tripProgress / 100))}%` 
        }}
      >
        <div className="relative">
          {/* Security Pulse */}
          <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-75 scale-150"></div>
          <div className="relative bg-accent border-2 border-background rounded-full p-2 shadow-lg">
            <Car size={12} className="text-accent-foreground" weight="fill" />
          </div>
          {/* Security Status Indicator */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border border-background flex items-center justify-center">
            <CheckCircle size={8} className="text-white" weight="fill" />
          </div>
        </div>
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded whitespace-nowrap font-medium shadow-lg">
          {driver.name}
        </div>
      </div>

      {/* Destination */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
        style={{ left: '80%', top: '20%' }}
      >
        <div className="bg-background border border-accent rounded-full p-2 shadow-lg">
          <NavigationArrow size={12} className="text-accent" weight="fill" />
        </div>
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded whitespace-nowrap font-medium shadow-lg">
          Destination
        </div>
      </div>

      {/* Security Status Badge */}
      <div className="absolute top-3 right-3">
        <Badge className="bg-green-600 text-white animate-pulse px-2 py-1 text-xs font-bold shadow-lg border border-green-400">
          <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
          SECURE
        </Badge>
      </div>

      {/* Security ETA */}
      <div className="absolute top-3 left-3">
        <div className="bg-primary/95 backdrop-blur-md rounded-lg p-2 border border-primary shadow-lg">
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-primary-foreground" />
            <div className="text-primary-foreground">
              <div className="text-xs font-medium">ETA</div>
              <div className="text-sm font-bold">{Math.round(eta)}min</div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Progress */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="bg-background/95 backdrop-blur-md rounded-lg p-3 border border-primary/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lock size={12} className="text-primary" />
              <span className="font-bold text-primary text-xs">Progress</span>
            </div>
            <span className="text-primary font-bold text-xs">{Math.round(tripProgress)}%</span>
          </div>
          <Progress value={tripProgress} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <CheckCircle size={10} className="text-green-500" />
              <span>Updated: {formatTime(lastUpdate)}</span>
            </div>
            <span className="text-primary font-medium">{Math.round((100 - tripProgress) * 0.04)}min left</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState<string>('book')
  const [selectedService, setSelectedService] = useState<string>('')
  const [riskAssessment, setRiskAssessment] = useState<Record<string, string>>({})
  const [assignedDriver, setAssignedDriver] = useState<any>(null)
  const [currentTrip, setCurrentTrip] = useState<any>(null)
  const [showRiskAssessment, setShowRiskAssessment] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    pickup: '',
    destination: '',
    specialInstructions: '',
    emergencyContact: ''
  })
  const [emergencyContacts, setEmergencyContacts] = useKV("emergency-contacts", [] as any[])

  const calculateRiskScore = () => {
    return Object.values(riskAssessment).reduce((total, questionId) => {
      const question = riskQuestions.find(q => q.id === questionId.split('-')[0])
      const option = question?.options.find(o => o.value === questionId.split('-')[1])
      return total + (option?.score || 0)
    }, 0)
  }

  const getRecommendedService = () => {
    const score = calculateRiskScore()
    if (score <= 3) return 'solo'
    if (score <= 8) return 'enhanced'
    return 'executive'
  }

  const handleRiskAssessmentComplete = () => {
    const recommendedService = getRecommendedService()
    setSelectedService(recommendedService)
    setShowRiskAssessment(false)
    setActiveTab('book')
    toast.success(`Security assessment complete. ${securityServices.find(s => s.id === recommendedService)?.name} recommended.`)
  }

  const handleBookSecurity = () => {
    if (!bookingForm.pickup || !bookingForm.destination || !selectedService) {
      toast.error("Please complete all required fields and security assessment")
      return
    }
    
    // Assign security driver
    const driver = securityDrivers[Math.floor(Math.random() * securityDrivers.length)]
    const service = securityServices.find(s => s.id === selectedService)
    
    const securityTrip = {
      id: Date.now(),
      service: service,
      pickup: bookingForm.pickup,
      destination: bookingForm.destination,
      driver: driver,
      status: 'security_assigned',
      riskLevel: calculateRiskScore(),
      startTime: new Date()
    }
    
    setCurrentTrip(securityTrip)
    setAssignedDriver(driver)
    toast.success("Security detail assigned! Your protection specialist is en route.")
    setBookingForm({ pickup: '', destination: '', specialInstructions: '', emergencyContact: '' })
    setActiveTab('active')
  }

  const handleEmergencyAlert = () => {
    toast.error("🚨 EMERGENCY ALERT ACTIVATED - Authorities contacted")
    // In real app: trigger emergency protocols
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Toaster position="top-center" />
      
      {/* Security Header */}
      <header className="bg-primary/95 backdrop-blur-md border-b border-accent/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center shadow-md">
                <Shield size={16} className="text-accent-foreground" weight="bold" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-accent via-accent to-accent/80 bg-clip-text text-transparent">
                  GQCars
                </h1>
                <p className="text-xs text-primary-foreground/80 font-medium">Security Transport</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 h-8 text-xs">
                <User size={14} />
                Profile
              </Button>
              <Button variant="outline" size="icon" className="sm:hidden bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8">
                <User size={14} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6">
        {/* Security Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6">
            <TabsList className="grid w-full grid-cols-4 h-12 bg-card/80 backdrop-blur-sm border border-primary/20 shadow-lg">
              <TabsTrigger 
                value="assess" 
                className="flex flex-col items-center gap-1 py-1 px-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md sm:flex-row sm:gap-2 sm:text-sm sm:px-3 transition-all duration-300"
              >
                <Warning size={14} className="shrink-0 sm:size-16" weight={activeTab === 'assess' ? 'fill' : 'regular'} />
                <span className="font-medium leading-tight hidden sm:inline">Risk Assessment</span>
                <span className="font-medium leading-tight text-[10px] sm:hidden">Risk</span>
              </TabsTrigger>
              <TabsTrigger 
                value="book" 
                className="flex flex-col items-center gap-1 py-1 px-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md sm:flex-row sm:gap-2 sm:text-sm sm:px-3 transition-all duration-300"
              >
                <Shield size={14} className="shrink-0 sm:size-16" weight={activeTab === 'book' ? 'fill' : 'regular'} />
                <span className="font-medium leading-tight hidden sm:inline">Book Security</span>
                <span className="font-medium leading-tight text-[10px] sm:hidden">Book</span>
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className="flex flex-col items-center gap-1 py-1 px-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md sm:flex-row sm:gap-2 sm:text-sm sm:px-3 transition-all duration-300"
              >
                <Eye size={14} className="shrink-0 sm:size-16" weight={activeTab === 'active' ? 'fill' : 'regular'} />
                <span className="font-medium leading-tight hidden sm:inline">Live Tracking</span>
                <span className="font-medium leading-tight text-[10px] sm:hidden">Live</span>
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="flex flex-col items-center gap-1 py-1 px-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md sm:flex-row sm:gap-2 sm:text-sm sm:px-3 transition-all duration-300"
              >
                <Clock size={14} className="shrink-0 sm:size-16" weight={activeTab === 'history' ? 'fill' : 'regular'} />
                <span className="font-medium leading-tight hidden sm:inline">History</span>
                <span className="font-medium leading-tight text-[10px] sm:hidden">History</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Risk Assessment Tab */}
          <TabsContent value="assess" className="space-y-4">
            <Card className="shadow-lg border border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-3">
                  <div className="w-8 h-8 bg-destructive rounded-lg flex items-center justify-center shadow-md">
                    <Warning size={16} className="text-destructive-foreground" weight="fill" />
                  </div>
                  Security Risk Assessment
                </CardTitle>
                <CardDescription className="text-sm text-destructive">
                  Help us determine the appropriate level of protection for your situation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskQuestions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <Label className="text-sm font-medium text-primary">{index + 1}. {question.question}</Label>
                    <RadioGroup
                      value={riskAssessment[question.id] || ''}
                      onValueChange={(value) => setRiskAssessment(prev => ({ ...prev, [question.id]: value }))}
                      className="space-y-2"
                    >
                      {question.options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary/50 transition-all">
                          <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} className="border border-primary" />
                          <Label htmlFor={`${question.id}-${option.value}`} className="text-sm font-medium cursor-pointer flex-1">
                            {option.label}
                          </Label>
                          <Badge variant={option.score >= 4 ? "destructive" : option.score >= 2 ? "secondary" : "outline"} className="text-xs">
                            Risk: {option.score}
                          </Badge>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
                
                {Object.keys(riskAssessment).length === riskQuestions.length && (
                  <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Certificate size={16} className="text-primary" />
                      <h3 className="text-sm font-bold text-primary">Risk Assessment Complete</h3>
                    </div>
                    <p className="text-sm text-primary mb-2">
                      Total Risk Score: <span className="font-bold">{calculateRiskScore()}/18</span>
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Recommended Service: <span className="font-bold text-primary">{securityServices.find(s => s.id === getRecommendedService())?.name}</span>
                    </p>
                    <Button 
                      onClick={handleRiskAssessmentComplete}
                      size="sm"
                      className="w-full h-10 text-sm font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Proceed to Security Booking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Book Security Tab */}
          <TabsContent value="book" className="space-y-4">
            {/* Hero Section */}
            <Card className="relative overflow-hidden border-0 shadow-lg">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/90 to-accent/85" />
              <CardContent className="relative p-8 text-center text-primary-foreground">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold mb-3 leading-tight">Professional Security Transport</h2>
                  <p className="text-sm text-primary-foreground/90 mb-6 leading-relaxed">
                    Licensed security professionals providing safe, discreet transportation services
                  </p>
                  <div className="flex justify-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                      <span>Licensed Security Drivers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                      <span>Background Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                      <span>Real-Time Protection</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Service Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-3">
                <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center shadow-md">
                  <Shield size={12} className="text-primary-foreground" />
                </div>
                Choose Your Security Level
              </h3>
              
              {selectedService && (
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-accent" weight="fill" />
                    <span className="text-sm font-medium text-accent">
                      {securityServices.find(s => s.id === selectedService)?.name} selected based on your risk assessment
                    </span>
                  </div>
                </div>
              )}
              
              <div className="grid gap-3">
                {securityServices.map(service => {
                  const Icon = service.icon
                  return (
                    <Card 
                      key={service.id} 
                      className={`cursor-pointer transition-all duration-500 border group relative overflow-hidden ${
                        selectedService === service.id 
                          ? 'ring-2 ring-accent/50 ring-offset-2 ring-offset-background bg-gradient-to-br from-accent/10 via-accent/5 to-primary/5 border-accent shadow-lg scale-[1.01]' 
                          : 'hover:shadow-lg hover:border-primary/60 hover:scale-[1.005] border-border/30 bg-gradient-to-br from-card via-card to-card/80 hover:from-primary/5 hover:to-accent/5'
                      }`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                              selectedService === service.id ? 'bg-accent' : 'bg-primary'
                            }`}>
                              <Icon size={18} className="text-white" weight="fill" />
                            </div>
                            {selectedService === service.id && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center border border-background">
                                <CheckCircle size={10} className="text-accent-foreground" weight="fill" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-bold text-sm mb-1">{service.name}</h4>
                            <p className="text-muted-foreground text-xs mb-2">{service.description}</p>
                            
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                <Timer size={12} className="text-primary" />
                                <span className="font-medium text-xs">ETA: {service.eta}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Certificate size={12} className="text-primary" />
                                <span className="font-medium text-xs capitalize">{service.threat_level} threat</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              {service.features.slice(0, 2).map((feature, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  <CheckCircle size={10} className="text-accent" weight="fill" />
                                  <span className="text-xs text-muted-foreground">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-right space-y-2">
                            <div className="relative">
                              <p className="text-lg font-black text-primary">£{service.price}</p>
                              <p className="text-xs text-muted-foreground font-medium">per journey</p>
                            </div>
                            <Button 
                              variant={selectedService === service.id ? "default" : "outline"}
                              size="sm"
                              className={`w-full font-bold transition-all duration-300 text-xs h-8 ${
                                selectedService === service.id 
                                  ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-md" 
                                  : "border border-primary/20 hover:border-accent/50 hover:bg-accent/10"
                              }`}
                            >
                              {selectedService === service.id ? (
                                <>
                                  <CheckCircle size={12} className="mr-1" />
                                  Selected
                                </>
                              ) : (
                                <>
                                  <Shield size={12} className="mr-1" />
                                  Select
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Booking Form */}
            <Card className="shadow-lg border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm relative overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center shadow-md">
                    <MapPin size={16} className="text-accent-foreground" weight="bold" />
                  </div>
                  <div>
                    <div>Security Transport Details</div>
                    <p className="text-sm text-muted-foreground font-normal mt-1">Secure booking information</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickup" className="text-sm font-bold flex items-center gap-2 text-primary">
                      <div className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center">
                        <Shield size={10} className="text-primary" />
                      </div>
                      Secure Pickup Location
                    </Label>
                    <div className="relative">
                      <Input
                        id="pickup"
                        placeholder="Enter pickup address or landmark"
                        value={bookingForm.pickup}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, pickup: e.target.value }))}
                        className="h-10 text-sm bg-background/90 border border-primary/20 rounded-lg shadow-sm hover:border-primary/40 focus:border-accent transition-all duration-300 pl-8"
                      />
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                        <MapPin size={14} className="text-primary/60" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination" className="text-sm font-bold flex items-center gap-2 text-accent">
                      <div className="w-5 h-5 bg-accent/10 rounded flex items-center justify-center">
                        <NavigationArrow size={10} className="text-accent" />
                      </div>
                      Secure Destination
                    </Label>
                    <div className="relative">
                      <Input
                        id="destination"
                        placeholder="Where do you need secure transport to?"
                        value={bookingForm.destination}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, destination: e.target.value }))}
                        className="h-10 text-sm bg-background/90 border border-accent/20 rounded-lg shadow-sm hover:border-accent/40 focus:border-accent transition-all duration-300 pl-8"
                      />
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                        <NavigationArrow size={14} className="text-accent/60" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergency-contact" className="text-sm font-bold flex items-center gap-2 text-destructive">
                    <div className="w-5 h-5 bg-destructive/10 rounded flex items-center justify-center">
                      <Phone size={10} className="text-destructive" />
                    </div>
                    Emergency Contact Number
                    <Badge variant="destructive" className="ml-auto text-xs">Required</Badge>
                  </Label>
                  <div className="relative">
                    <Input
                      id="emergency-contact"
                      placeholder="Emergency contact (required for security protocols)"
                      value={bookingForm.emergencyContact}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      className="h-10 text-sm bg-background/90 border border-destructive/20 rounded-lg shadow-sm hover:border-destructive/40 focus:border-destructive transition-all duration-300 pl-8"
                    />
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                      <Phone size={14} className="text-destructive/60" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="special-instructions" className="text-sm font-bold flex items-center gap-2">
                    <div className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center">
                      <Lock size={10} className="text-primary" />
                    </div>
                    Security Instructions 
                    <Badge variant="outline" className="ml-auto text-xs">Optional</Badge>
                  </Label>
                  <Textarea
                    id="special-instructions"
                    placeholder="Any specific security concerns, route preferences, or special instructions for your protection detail..."
                    value={bookingForm.specialInstructions}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    className="min-h-[80px] bg-background/90 border border-primary/20 rounded-lg shadow-sm hover:border-primary/40 focus:border-accent transition-all duration-300 text-sm resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Booking Button */}
            <div className="relative">
              <Button 
                onClick={handleBookSecurity} 
                size="lg" 
                className={`relative w-full h-14 text-sm font-black bg-gradient-to-r from-accent via-accent to-accent/90 hover:from-accent/95 hover:via-accent/95 hover:to-accent/85 text-accent-foreground shadow-lg transition-all duration-500 border-2 border-accent/50 rounded-lg group overflow-hidden ${
                  !bookingForm.pickup || !bookingForm.destination || !selectedService || !bookingForm.emergencyContact
                    ? 'opacity-60 cursor-not-allowed hover:from-accent hover:via-accent hover:to-accent/90' 
                    : 'hover:scale-[1.01] hover:shadow-accent/25'
                }`}
                disabled={!bookingForm.pickup || !bookingForm.destination || !selectedService || !bookingForm.emergencyContact}
              >
                <div className="relative flex items-center justify-center gap-3">
                  <Shield size={20} className="animate-pulse" weight="bold" />
                  <div className="text-center">
                    <div>Request Security Transport</div>
                    {selectedService && (
                      <div className="text-xs font-semibold opacity-90 mt-1">
                        {securityServices.find(s => s.id === selectedService)?.name} • £{securityServices.find(s => s.id === selectedService)?.price}
                      </div>
                    )}
                  </div>
                  <Lightning size={20} className="animate-bounce" weight="bold" />
                </div>
              </Button>
            </div>
          </TabsContent>

          {/* Active Security Tab */}
          <TabsContent value="active" className="space-y-4">
            {currentTrip && assignedDriver ? (
              <div className="space-y-4">
                {/* Real-time Security Tracking */}
                <Card className="shadow-lg border border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-3 text-lg">
                          <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center shadow-md">
                            <Eye size={12} className="text-accent-foreground animate-pulse" />
                          </div>
                          Live Security Tracking
                        </CardTitle>
                        <CardDescription className="text-sm">Real-time monitoring of your security detail</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="bg-background/50 hover:bg-background border border-primary/20 h-8 text-xs">
                        <Crosshair size={12} className="mr-1" />
                        <span className="hidden sm:inline">Center Map</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SecurityTrackingMap trip={currentTrip} driver={assignedDriver} />
                  </CardContent>
                </Card>

                {/* Security Driver Profile */}
                <Card className="shadow-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center shadow-md">
                        <Certificate size={12} className="text-primary-foreground" />
                      </div>
                      Your Security Professional
                    </CardTitle>
                    <CardDescription className="text-sm">Assigned protection specialist details and credentials</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Driver Profile Card */}
                    <div className="relative p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img 
                            src={assignedDriver.photo} 
                            alt={assignedDriver.name}
                            className="w-16 h-16 rounded-lg object-cover border-2 border-primary shadow-lg"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center shadow-md">
                            <CheckCircle size={12} className="text-white" weight="fill" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-primary mb-1">{assignedDriver.name}</h3>
                          <p className="text-accent font-medium text-sm mb-2">{assignedDriver.title}</p>
                          <p className="text-muted-foreground font-medium text-xs mb-3">
                            {assignedDriver.experience} experience • License: {assignedDriver.license}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-yellow-500" weight="fill" />
                              <span className="font-bold text-sm">{assignedDriver.rating}</span>
                              <span className="text-muted-foreground text-xs">({assignedDriver.completedTrips} trips)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Car size={14} className="text-primary" />
                              <span className="font-medium text-xs">{assignedDriver.vehicle}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-bold text-primary text-xs">Security Credentials:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {assignedDriver.credentials.slice(0, 2).map((credential, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  <Certificate size={10} className="text-accent" weight="fill" />
                                  <span className="text-xs font-medium">{credential}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <h4 className="font-bold text-primary mb-1 text-xs">Specializations:</h4>
                            <div className="flex flex-wrap gap-1">
                              {assignedDriver.specializations.slice(0, 2).map((spec, index) => (
                                <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border border-primary/20 text-xs">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Communication & Emergency */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Button className="h-10 flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md text-xs">
                        <Phone size={14} />
                        <span className="font-bold">Call Driver</span>
                      </Button>
                      <Button variant="outline" className="h-10 flex items-center gap-2 border border-primary/20 hover:bg-primary/10 text-xs">
                        <Mail size={14} className="text-primary" />
                        <span className="font-bold">Message</span>
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="h-10 flex items-center gap-2 bg-destructive hover:bg-destructive/90 shadow-md text-xs"
                        onClick={handleEmergencyAlert}
                      >
                        <Siren size={14} />
                        <span className="font-bold">EMERGENCY</span>
                      </Button>
                    </div>

                    {/* Trip Details */}
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <h4 className="font-bold text-sm flex items-center gap-2 mb-4">
                        <MapPin size={14} className="text-accent" />
                        Secure Route Details
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-primary rounded-full shadow-sm"></div>
                          <div>
                            <span className="text-xs text-muted-foreground font-semibold">SECURE PICKUP</span>
                            <p className="font-bold text-sm">{currentTrip.pickup}</p>
                          </div>
                        </div>
                        <div className="ml-1.5 w-0.5 h-8 bg-gradient-to-b from-primary to-accent"></div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-accent rounded-full shadow-sm"></div>
                          <div>
                            <span className="text-xs text-muted-foreground font-semibold">SECURE DESTINATION</span>
                            <p className="font-bold text-sm">{currentTrip.destination}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-muted-foreground font-semibold">SERVICE LEVEL</span>
                            <p className="font-bold text-sm">{currentTrip.service.name}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground font-semibold">STARTED</span>
                            <p className="font-bold text-sm">{currentTrip.startTime.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cancel Trip */}
                    <Button 
                      variant="destructive" 
                      className="w-full h-10 text-sm font-bold shadow-md"
                      onClick={() => {
                        setCurrentTrip(null)
                        setAssignedDriver(null)
                        toast.success("Security transport cancelled")
                      }}
                    >
                      Cancel Security Transport
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="shadow-lg border border-primary/20 bg-card/90 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield size={40} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">No Active Security Detail</h3>
                  <p className="text-muted-foreground mb-6 text-sm max-w-md mx-auto">
                    You don't have any active security transport. Ready to book professional protection?
                  </p>
                  <Button 
                    onClick={() => setActiveTab('assess')}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg h-10 px-6 text-sm font-bold"
                  >
                    <Shield size={16} className="mr-2" />
                    Start Risk Assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Security History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="shadow-lg border border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center shadow-md">
                    <Clock size={12} className="text-primary-foreground" />
                  </div>
                  Security Transport History
                </CardTitle>
                <CardDescription className="text-sm">Your previous professional security services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={24} className="text-muted-foreground" />
                  </div>
                  <h4 className="text-lg font-bold mb-3">No Security History Yet</h4>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                    Your completed security transports will appear here for future reference and rebooking.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('assess')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md h-10 px-6 text-sm"
                  >
                    <Shield size={14} className="mr-2" />
                    Book Your First Security Transport
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Premium Security Footer */}
      <footer className="bg-gradient-to-r from-primary via-primary to-accent/20 border-t border-accent/20 py-8 px-4 mt-12 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Phone size={20} className="text-accent-foreground" weight="bold" />
              </div>
              <h4 className="font-bold text-sm mb-2 text-primary-foreground">24/7 Security Operations</h4>
              <p className="text-primary-foreground/80 text-sm">(555) SECURITY</p>
              <p className="text-xs text-primary-foreground/60">Professional support always available</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Certificate size={20} className="text-accent-foreground" weight="bold" />
              </div>
              <h4 className="font-bold text-sm mb-2 text-primary-foreground">Licensed Professionals</h4>
              <p className="text-primary-foreground/80 text-sm">All security drivers certified</p>
              <p className="text-xs text-primary-foreground/60">Background verified & insured</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Shield size={20} className="text-accent-foreground" weight="bold" />
              </div>
              <h4 className="font-bold text-sm mb-2 text-primary-foreground">Confidential & Secure</h4>
              <p className="text-primary-foreground/80 text-sm">Discretion guaranteed</p>
              <p className="text-xs text-primary-foreground/60">Professional protocols</p>
            </div>
          </div>
          <div className="text-center pt-4 border-t border-primary-foreground/20">
            <p className="text-primary-foreground/80 font-medium text-sm">
              © 2024 GQCars Security Transport. Professional protection services you can trust.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App