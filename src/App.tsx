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
  const [favorites, setFavorites] = useKV("favorite-locations", [] as any[])

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
      
      {/* Simplified Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-primary" weight="bold" />
              <h1 className="text-lg font-bold text-primary">GQCars</h1>
            </div>
            <Button variant="ghost" size="sm" className="h-8">
              <User size={16} />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          {/* Risk Assessment Tab */}
          <TabsContent value="assess" className="space-y-3 py-2">
            <Card className="border border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Warning size={16} className="text-destructive" weight="fill" />
                  Risk Assessment
                </CardTitle>
                <CardDescription className="text-xs">
                  Determine appropriate protection level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {riskQuestions.map((question, index) => (
                  <div key={question.id} className="space-y-2">
                    <Label className="text-xs font-medium">{index + 1}. {question.question}</Label>
                    <RadioGroup
                      value={riskAssessment[question.id] || ''}
                      onValueChange={(value) => setRiskAssessment(prev => ({ ...prev, [question.id]: value }))}
                      className="space-y-1"
                    >
                      {question.options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2 p-2 rounded border hover:border-primary/50 transition-all">
                          <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                          <Label htmlFor={`${question.id}-${option.value}`} className="text-xs cursor-pointer flex-1">
                            {option.label}
                          </Label>
                          <Badge variant={option.score >= 4 ? "destructive" : option.score >= 2 ? "secondary" : "outline"} className="text-xs">
                            {option.score}
                          </Badge>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
                
                {Object.keys(riskAssessment).length === riskQuestions.length && (
                  <div className="mt-3 p-3 bg-primary/10 rounded border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Certificate size={14} className="text-primary" />
                      <h3 className="text-xs font-bold text-primary">Assessment Complete</h3>
                    </div>
                    <p className="text-xs text-primary mb-2">
                      Risk Score: <span className="font-bold">{calculateRiskScore()}/18</span>
                    </p>
                    <Button 
                      onClick={handleRiskAssessmentComplete}
                      size="sm"
                      className="w-full h-8 text-xs"
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Proceed to Booking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Book Security Tab (Home) */}
          <TabsContent value="book" className="space-y-3 py-2">
            {/* Quick Booking */}
            <Card className="border border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield size={16} className="text-primary" />
                  Book Security Transport
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Input
                    placeholder="Pickup location"
                    value={bookingForm.pickup}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, pickup: e.target.value }))}
                    className="h-10 text-sm"
                  />
                  <Input
                    placeholder="Destination"
                    value={bookingForm.destination}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, destination: e.target.value }))}
                    className="h-10 text-sm"
                  />
                  <Input
                    placeholder="Emergency contact (required)"
                    value={bookingForm.emergencyContact}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    className="h-10 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service Selection */}
            {selectedService && (
              <div className="p-2 bg-accent/10 border border-accent/20 rounded text-xs">
                <CheckCircle size={12} className="text-accent inline mr-1" />
                {securityServices.find(s => s.id === selectedService)?.name} selected
              </div>
            )}
            
            <div className="grid gap-2">
              {securityServices.map(service => {
                const Icon = service.icon
                return (
                  <Card 
                    key={service.id} 
                    className={`cursor-pointer transition-all border ${
                      selectedService === service.id 
                        ? 'ring-2 ring-accent border-accent' 
                        : 'hover:border-primary/60'
                    }`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${
                          selectedService === service.id ? 'bg-accent' : 'bg-primary'
                        }`}>
                          <Icon size={14} className="text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{service.name}</h4>
                          <p className="text-xs text-muted-foreground">{service.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs">ETA: {service.eta}</span>
                            <span className="text-xs">£{service.price}</span>
                          </div>
                        </div>
                        
                        {selectedService === service.id && (
                          <CheckCircle size={16} className="text-accent" weight="fill" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Booking Button */}
            <Button 
              onClick={handleBookSecurity} 
              className="w-full h-10 text-sm font-bold bg-accent hover:bg-accent/90"
              disabled={!bookingForm.pickup || !bookingForm.destination || !selectedService || !bookingForm.emergencyContact}
            >
              <Shield size={16} className="mr-2" />
              Request Security Transport
              {selectedService && (
                <span className="ml-2">£{securityServices.find(s => s.id === selectedService)?.price}</span>
              )}
            </Button>
          </TabsContent>

          {/* Active Security Tab */}
          <TabsContent value="active" className="space-y-3 py-2">
            {currentTrip && assignedDriver ? (
              <div className="space-y-3">
                {/* Real-time Security Tracking */}
                <Card className="border border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Eye size={16} className="text-accent animate-pulse" />
                        Live Tracking
                      </CardTitle>
                      <Badge className="bg-green-600 text-white text-xs">
                        SECURE
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SecurityTrackingMap trip={currentTrip} driver={assignedDriver} />
                  </CardContent>
                </Card>

                {/* Compact Driver Profile */}
                <Card className="border border-primary/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={assignedDriver.photo} 
                        alt={assignedDriver.name}
                        className="w-12 h-12 rounded-lg object-cover border border-primary"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-sm">{assignedDriver.name}</h3>
                        <p className="text-xs text-muted-foreground">{assignedDriver.title}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Star size={12} className="text-yellow-500" weight="fill" />
                          <span>{assignedDriver.rating}</span>
                          <span className="text-muted-foreground">•</span>
                          <span>{assignedDriver.vehicle}</span>
                        </div>
                      </div>
                    </div>

                    {/* Communication Buttons */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <Button size="sm" className="h-8 text-xs">
                        <Phone size={12} className="mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <Mail size={12} className="mr-1" />
                        Message
                      </Button>
                      <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={handleEmergencyAlert}>
                        <Siren size={12} className="mr-1" />
                        Emergency
                      </Button>
                    </div>

                    {/* Trip Details */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="font-medium">{currentTrip.pickup}</span>
                      </div>
                      <div className="ml-1 w-0.5 h-4 bg-gradient-to-b from-primary to-accent"></div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="font-medium">{currentTrip.destination}</span>
                      </div>
                    </div>

                    <Button 
                      variant="destructive" 
                      className="w-full h-8 mt-3 text-xs"
                      onClick={() => {
                        setCurrentTrip(null)
                        setAssignedDriver(null)
                        toast.success("Security transport cancelled")
                      }}
                    >
                      Cancel Transport
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border border-primary/20">
                <CardContent className="text-center py-8">
                  <Shield size={32} className="text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">No Active Security</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Ready to book professional protection?
                  </p>
                  <Button 
                    onClick={() => setActiveTab('assess')}
                    className="h-8 px-4 text-sm"
                  >
                    <Shield size={14} className="mr-1" />
                    Start Assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-3 py-2">
            <Card className="border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock size={16} className="text-primary" />
                  Security History
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Clock size={24} className="text-muted-foreground mx-auto mb-3" />
                <h4 className="text-lg font-bold mb-2">No History Yet</h4>
                <p className="text-muted-foreground text-sm mb-4">
                  Your completed security transports will appear here
                </p>
                <Button 
                  onClick={() => setActiveTab('assess')}
                  className="h-8 px-4 text-sm"
                >
                  <Shield size={14} className="mr-1" />
                  Book First Transport
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-3 py-2">
            <Card className="border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart size={16} className="text-primary" />
                  Favorite Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart size={24} className="text-muted-foreground mx-auto mb-3" />
                    <h4 className="text-lg font-bold mb-2">No Favorites Yet</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Save frequently used locations for quick booking
                    </p>
                    <Button 
                      onClick={() => setActiveTab('book')}
                      className="h-8 px-4 text-sm"
                    >
                      <MapPin size={14} className="mr-1" />
                      Add Location
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {favorites.map((location: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/20">
                        <div className="flex items-center gap-3">
                          <MapPin size={16} className="text-primary" />
                          <div>
                            <p className="font-medium text-sm">{location.name}</p>
                            <p className="text-xs text-muted-foreground">{location.address}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setBookingForm(prev => ({ ...prev, pickup: location.address }))
                            setActiveTab('book')
                          }}
                          className="h-8 text-xs"
                        >
                          Use
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
        </Tabs>
      </div>

      {/* Bottom Navigation - Uber Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-5 h-16">
            <button
              onClick={() => setActiveTab('book')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === 'book' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Shield size={20} weight={activeTab === 'book' ? 'fill' : 'regular'} />
              <span className="text-xs font-medium">Home</span>
            </button>
            
            <button
              onClick={() => setActiveTab('assess')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === 'assess' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Warning size={20} weight={activeTab === 'assess' ? 'fill' : 'regular'} />
              <span className="text-xs font-medium">Risk</span>
            </button>

            <button
              onClick={() => setActiveTab('active')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === 'active' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Eye size={20} weight={activeTab === 'active' ? 'fill' : 'regular'} />
              <span className="text-xs font-medium">Activity</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === 'history' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Clock size={20} weight={activeTab === 'history' ? 'fill' : 'regular'} />
              <span className="text-xs font-medium">History</span>
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === 'favorites' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Heart size={20} weight={activeTab === 'favorites' ? 'fill' : 'regular'} />
              <span className="text-xs font-medium">Favorites</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App