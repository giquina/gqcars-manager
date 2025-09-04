import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  Phone, 
  Mail, 
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
  Navigation,
  Speedometer,
  Timer,
  Crosshair,
  Warning,
  CheckCircle,
  ChatCircle,
  PaperPlaneTilt,
  Microphone,
  SmileyWink,
  DotsThree
} from "@phosphor-icons/react"
import { toast, Toaster } from 'sonner'
import { useKV } from '@github/spark/hooks'

// UK Ride Service Levels
const rideServices = [
  {
    id: 'standard',
    name: 'GQ Standard',
    description: 'Reliable everyday rides',
    priceRange: '£8.50 - £12.20',
    eta: '2-4 min',
    icon: Car,
    capacity: '1-4 passengers'
  },
  {
    id: 'comfort',
    name: 'GQ Comfort',
    description: 'Premium vehicles with extra space',
    priceRange: '£12.80 - £16.40',
    eta: '3-5 min',
    icon: Shield,
    capacity: '1-4 passengers'
  },
  {
    id: 'executive',
    name: 'GQ Executive', 
    description: 'Luxury vehicles for business',
    priceRange: '£18.50 - £24.90',
    eta: '4-6 min',
    icon: Star,
    capacity: '1-4 passengers'
  },
  {
    id: 'xl',
    name: 'GQ XL',
    description: 'Larger vehicles for groups',
    priceRange: '£15.20 - £19.80',
    eta: '5-7 min',
    icon: Users,
    capacity: '1-6 passengers'
  }
]

// Sample drivers
const drivers = [
  {
    id: 1,
    name: 'James Wilson',
    rating: 4.9,
    completedTrips: 1247,
    vehicle: 'Toyota Prius - Silver',
    license: 'GK67 XBN',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    eta: 3
  },
  {
    id: 2,
    name: 'Sarah Mitchell',
    rating: 4.8,
    completedTrips: 892,
    vehicle: 'Honda Insight - Black',
    license: 'BV19 MKL',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b586?w=400&q=80',
    eta: 4
  }
]

// Enhanced GPS tracking and map data
const londonLocations = [
  { name: "Westminster Bridge", lat: 51.5007, lng: -0.1246 },
  { name: "London Bridge", lat: 51.5079, lng: -0.0877 },
  { name: "Tower Bridge", lat: 51.5055, lng: -0.0754 },
  { name: "Kings Cross Station", lat: 51.5308, lng: -0.1238 },
  { name: "Paddington Station", lat: 51.5154, lng: -0.1755 },
  { name: "Oxford Circus", lat: 51.5154, lng: -0.1414 },
  { name: "Piccadilly Circus", lat: 51.5100, lng: -0.1347 },
  { name: "Covent Garden", lat: 51.5118, lng: -0.1226 }
]

// Real-time GPS simulation
const useGPSTracking = (initialPosition: any, destination: any, isActive: boolean) => {
  const [currentPosition, setCurrentPosition] = useState(initialPosition)
  const [route, setRoute] = useState<any[]>([])
  const [progress, setProgress] = useState(0)
  const [eta, setEta] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [bearing, setBearing] = useState(0)

  useEffect(() => {
    if (!isActive || !destination) return

    // Generate route points between pickup and destination
    const routePoints = generateRoute(initialPosition, destination)
    setRoute(routePoints)
    setEta(Math.ceil(routePoints.length * 0.5)) // Rough ETA calculation

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < routePoints.length - 1) {
        const currentPoint = routePoints[currentIndex]
        const nextPoint = routePoints[currentIndex + 1]
        
        setCurrentPosition(currentPoint)
        setProgress((currentIndex / (routePoints.length - 1)) * 100)
        setSpeed(25 + Math.random() * 15) // Simulated speed 25-40 mph
        setBearing(calculateBearing(currentPoint, nextPoint))
        setEta(Math.ceil((routePoints.length - currentIndex) * 0.5))
        
        currentIndex++
      } else {
        setProgress(100)
        setSpeed(0)
        setEta(0)
        clearInterval(interval)
      }
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [isActive, destination])

  return { currentPosition, route, progress, eta, speed, bearing }
}

// Route generation helper
const generateRoute = (start: any, end: any) => {
  const points = []
  const steps = 15 // Number of route points
  
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps
    const lat = start.lat + (end.lat - start.lat) * ratio + (Math.random() - 0.5) * 0.002
    const lng = start.lng + (end.lng - start.lng) * ratio + (Math.random() - 0.5) * 0.002
    points.push({ lat, lng, timestamp: Date.now() + i * 2000 })
  }
  
  return points
}

// Bearing calculation
const calculateBearing = (point1: any, point2: any) => {
  const dLng = point2.lng - point1.lng
  const y = Math.sin(dLng) * Math.cos(point2.lat)
  const x = Math.cos(point1.lat) * Math.sin(point2.lat) - 
            Math.sin(point1.lat) * Math.cos(point2.lat) * Math.cos(dLng)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

// Real-time chat system for driver-passenger communication
const ChatSystem = ({ trip, driver, isOpen, onClose }: {
  trip: any,
  driver: any,
  isOpen: boolean,
  onClose: () => void
}) => {
  const [messages, setMessages] = useKV(`chat-${trip.id}`, [] as any[])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [driverTyping, setDriverTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Quick message templates
  const quickMessages = [
    "I'm running a few minutes late",
    "Where exactly should I meet you?",
    "Thank you!",
    "Please wait, I'll be right there",
    "Can you see me?",
    "Traffic is heavy, might be delayed"
  ]

  // Enhanced notification system for new messages
  useEffect(() => {
    if (!isOpen && trip && messages.length > 0) {
      // Check for new driver messages when chat is closed
      const lastDriverMessage = messages
        .filter(msg => msg.sender === 'driver')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      
      if (lastDriverMessage) {
        const messageAge = new Date().getTime() - new Date(lastDriverMessage.timestamp).getTime()
        if (messageAge < 5000) { // Message is less than 5 seconds old
          // This would trigger unread count update in parent component
          // For demo purposes, we'll show a toast notification
          if (typeof window !== 'undefined') {
            toast.success(`New message from ${driver.name}: ${lastDriverMessage.text.substring(0, 50)}${lastDriverMessage.text.length > 50 ? '...' : ''}`, {
              duration: 4000,
              action: {
                label: "Reply",
                onClick: () => {
                  // This would open the chat in a real implementation
                  console.log("Open chat")
                }
              }
            })
          }
        }
      }
    }
  }, [messages, isOpen, trip, driver.name])

  // Simulate driver messages and typing
  useEffect(() => {
    if (!isOpen) return

    // Add initial driver message if no messages exist
    if (messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: `Hello! I'm ${driver.name}, your driver for today. I'm on my way to pick you up. ETA: ${driver.eta} minutes.`,
        sender: 'driver',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages([welcomeMessage])
    }

    // Simulate driver responses
    const responseInterval = setInterval(() => {
      if (Math.random() > 0.85 && messages.length > 0) { // 15% chance every 10 seconds
        const responses = [
          "On my way!",
          "Just around the corner",
          "Should be there in 2 minutes",
          "Thanks for waiting",
          "Traffic is moving well",
          "I can see the pickup location"
        ]
        
        const response = {
          id: Date.now(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'driver',
          timestamp: new Date(),
          type: 'text'
        }
        
        setMessages(prev => [...prev, response])
      }
    }, 10000)

    // Simulate driver typing indicator
    const typingInterval = setInterval(() => {
      if (Math.random() > 0.9) { // 10% chance
        setDriverTyping(true)
        setTimeout(() => setDriverTyping(false), 2000)
      }
    }, 15000)

    return () => {
      clearInterval(responseInterval)
      clearInterval(typingInterval)
    }
  }, [isOpen, messages.length, driver.name, driver.eta, setMessages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, driverTyping])

  // Handle sending messages
  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: 'passenger',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    
    // Show typing indicator
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 1000)
    
    toast.success("Message sent")
  }

  const sendQuickMessage = (text: string) => {
    const message = {
      id: Date.now(),
      text,
      sender: 'passenger',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    toast.success("Quick message sent")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full max-w-md mx-auto bg-background rounded-t-3xl border-t border-border max-h-[85vh] flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-card to-card/95">
          <div className="flex items-center gap-3">
            <img 
              src={driver.photo} 
              alt={driver.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-background"
            />
            <div>
              <h3 className="font-semibold">{driver.name}</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="w-9 h-9 rounded-full">
              <Phone size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="w-9 h-9 rounded-full">
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'passenger' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[80%]">
                {message.sender === 'driver' && (
                  <img 
                    src={driver.photo} 
                    alt={driver.name}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.sender === 'passenger'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-muted-foreground rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <p className={`text-xs text-muted-foreground mt-1 ${
                    message.sender === 'passenger' ? 'text-right' : 'text-left'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Driver typing indicator */}
          {driverTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <img 
                  src={driver.photo} 
                  alt={driver.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Messages */}
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickMessages.slice(0, 3).map((msg, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap h-8 text-xs bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => sendQuickMessage(msg)}
              >
                {msg}
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-gradient-to-r from-card to-card/95">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="pr-12 rounded-full border-2 focus:border-primary transition-colors"
                maxLength={500}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
              >
                <SmileyWink size={16} className="text-muted-foreground" />
              </Button>
            </div>
            
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              <PaperPlaneTilt size={18} className="text-primary-foreground" weight="fill" />
            </Button>
          </div>
          
          {/* Character count */}
          {newMessage.length > 400 && (
            <p className="text-xs text-muted-foreground text-right mt-1">
              {newMessage.length}/500
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Enhanced Interactive Map Component
const InteractiveMap = ({ trip, driver, onLocationUpdate }: { 
  trip: any, 
  driver: any, 
  onLocationUpdate?: (location: any) => void 
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapCenter, setMapCenter] = useState({ lat: 51.5074, lng: -0.1278 }) // London center
  const [zoom, setZoom] = useState(13)
  const [isFollowingDriver, setIsFollowingDriver] = useState(true)
  
  // Get pickup and destination coordinates
  const pickupLocation = londonLocations[Math.floor(Math.random() * londonLocations.length)]
  const destinationLocation = londonLocations[Math.floor(Math.random() * londonLocations.length)]
  
  // Use GPS tracking
  const { currentPosition, route, progress, eta, speed, bearing } = useGPSTracking(
    pickupLocation, 
    destinationLocation, 
    true
  )

  // Convert real coordinates to screen position (simplified)
  const coordsToScreen = useCallback((lat: number, lng: number) => {
    const mapBounds = mapRef.current?.getBoundingClientRect()
    if (!mapBounds) return { x: 50, y: 50 }
    
    // Simplified projection for demo - in real app would use proper map projection
    const latRange = 0.02 // Rough degree range shown on map
    const lngRange = 0.03
    
    const x = ((lng - (mapCenter.lng - lngRange/2)) / lngRange) * 100
    const y = ((mapCenter.lat + latRange/2 - lat) / latRange) * 100
    
    return { 
      x: Math.max(5, Math.min(95, x)), 
      y: Math.max(5, Math.min(95, y)) 
    }
  }, [mapCenter])

  // Update map center when following driver
  useEffect(() => {
    if (isFollowingDriver && currentPosition) {
      setMapCenter(currentPosition)
    }
  }, [currentPosition, isFollowingDriver])

  const driverScreen = coordsToScreen(currentPosition.lat, currentPosition.lng)
  const pickupScreen = coordsToScreen(pickupLocation.lat, pickupLocation.lng)
  const destinationScreen = coordsToScreen(destinationLocation.lat, destinationLocation.lng)

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant={isFollowingDriver ? "default" : "outline"}
            size="sm"
            onClick={() => setIsFollowingDriver(!isFollowingDriver)}
            className="h-8 px-3 text-xs"
          >
            <Crosshair size={14} className="mr-1" />
            {isFollowingDriver ? "Following" : "Follow"}
          </Button>
          <Badge variant="secondary" className="text-xs">
            <Navigation size={12} className="mr-1" style={{transform: `rotate(${bearing}deg)`}} />
            {Math.round(bearing)}°
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Speedometer size={12} className="mr-1" />
            {Math.round(speed)} mph
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Timer size={12} className="mr-1" />
            {eta} min
          </Badge>
        </div>
      </div>

      {/* Interactive Map */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-0">
          <div 
            ref={mapRef}
            className="relative bg-gradient-to-br from-slate-100 to-slate-200 h-64 overflow-hidden cursor-move"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = ((e.clientX - rect.left) / rect.width) * 100
              const y = ((e.clientY - rect.top) / rect.height) * 100
              // Handle map interaction
            }}
          >
            {/* Street Grid Pattern */}
            <div className="absolute inset-0">
              <svg width="100%" height="100%" className="opacity-20">
                <defs>
                  <pattern id="streets" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#streets)" />
              </svg>
            </div>

            {/* Route Path */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d={`M ${pickupScreen.x}% ${pickupScreen.y}% Q ${(pickupScreen.x + destinationScreen.x)/2}% ${(pickupScreen.y + destinationScreen.y)/2 - 10}% ${destinationScreen.x}% ${destinationScreen.y}%`}
                stroke="rgb(59 130 246)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="8,4"
                className="opacity-60"
              />
              
              {/* Progress Line */}
              <path
                d={`M ${pickupScreen.x}% ${pickupScreen.y}% Q ${(pickupScreen.x + destinationScreen.x)/2}% ${(pickupScreen.y + destinationScreen.y)/2 - 10}% ${destinationScreen.x}% ${destinationScreen.y}%`}
                stroke="rgb(34 197 94)"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${progress * 2},${200 - progress * 2}`}
                className="opacity-80"
              />
            </svg>

            {/* Pickup Location */}
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
              style={{ left: `${pickupScreen.x}%`, top: `${pickupScreen.y}%` }}
            >
              <div className="relative">
                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg border-2 border-white">
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-25"></div>
                </div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Pickup
                </div>
              </div>
            </div>

            {/* Driver Position */}
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-2000 ease-linear"
              style={{ 
                left: `${driverScreen.x}%`, 
                top: `${driverScreen.y}%`,
                transform: `translate(-50%, -50%) rotate(${bearing}deg)`
              }}
            >
              <div className="relative">
                <div className="w-5 h-5 bg-green-500 rounded-full shadow-xl border-2 border-white flex items-center justify-center">
                  <Car size={12} className="text-white" style={{transform: `rotate(-${bearing}deg)`}} />
                </div>
                <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-30"></div>
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {driver.name}
                </div>
              </div>
            </div>

            {/* Destination */}
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
              style={{ left: `${destinationScreen.x}%`, top: `${destinationScreen.y}%` }}
            >
              <div className="relative">
                <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg border-2 border-white">
                  <NavigationArrow size={10} className="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Destination
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1">
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-8 h-8 p-0"
                onClick={() => setZoom(z => Math.min(z + 1, 18))}
              >
                +
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-8 h-8 p-0"
                onClick={() => setZoom(z => Math.max(z - 1, 8))}
              >
                -
              </Button>
            </div>

            {/* GPS Status */}
            <div className="absolute top-4 left-4">
              <Badge variant="outline" className="bg-background/90 text-xs">
                <CheckCircle size={12} className="mr-1 text-green-500" />
                GPS Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trip Progress */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Trip Progress</span>
            <span className="font-medium">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Started {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>ETA: {eta} min</span>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Updates */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Tracking Active</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Updated {Math.floor(Math.random() * 30)} sec ago
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function App() {
  const [currentView, setCurrentView] = useState<string>('home')
  const [selectedService, setSelectedService] = useState<string>('')
  const [currentTrip, setCurrentTrip] = useState<any>(null)
  const [assignedDriver, setAssignedDriver] = useState<any>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [bookingForm, setBookingForm] = useState({
    pickup: '',
    destination: ''
  })
  const [favorites, setFavorites] = useKV("favorite-locations", [] as any[])
  const [recentTrips, setRecentTrips] = useKV("recent-trips", [] as any[])
  const [paymentMethod, setPaymentMethod] = useState('mastercard')

  const handleBookRide = () => {
    if (!bookingForm.pickup || !bookingForm.destination || !selectedService) {
      toast.error("Please enter pickup location, destination and select a ride type")
      return
    }
    
    const driver = drivers[Math.floor(Math.random() * drivers.length)]
    const service = rideServices.find(s => s.id === selectedService)
    
    // Calculate estimated distance and duration based on selected locations
    const pickupCoords = londonLocations.find(loc => loc.name === bookingForm.pickup) || londonLocations[0]
    const destCoords = londonLocations.find(loc => loc.name === bookingForm.destination) || londonLocations[1]
    
    const distance = calculateDistance(pickupCoords, destCoords)
    const estimatedDuration = Math.ceil(distance * 2) // Rough estimation: 2 minutes per km in city traffic
    
    const trip = {
      id: Date.now(),
      service: service,
      pickup: bookingForm.pickup,
      destination: bookingForm.destination,
      pickupCoords: pickupCoords,
      destinationCoords: destCoords,
      driver: driver,
      status: 'driver_assigned',
      startTime: new Date(),
      estimatedPrice: service?.priceRange,
      estimatedDistance: distance,
      estimatedDuration: estimatedDuration,
      realTimeData: {
        lastUpdate: new Date(),
        trafficCondition: 'moderate',
        weatherCondition: 'clear'
      }
    }
    
    setCurrentTrip(trip)
    setAssignedDriver(driver)
    setCurrentView('tracking')
    setIsChatOpen(false)
    setUnreadMessages(0)
    
    // Add to recent trips
    setRecentTrips((prev: any[]) => [trip, ...prev.slice(0, 9)])
    
    toast.success(`${driver.name} is on the way! GPS tracking active.`)
    setBookingForm({ pickup: '', destination: '' })
  }

  // Distance calculation helper
  const calculateDistance = (point1: any, point2: any) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLng = (point2.lng - point1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c * 100) / 100 // Round to 2 decimal places
  }

  const addToFavorites = (location: string, name: string) => {
    const newFavorite = { name, address: location, id: Date.now() }
    setFavorites((prev: any[]) => [...prev, newFavorite])
    toast.success("Location saved to favorites")
  }

  // Home/Booking View
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        {/* Header with subtle shadow */}
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Car size={18} className="text-primary-foreground" weight="bold" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">GQ Cars</h1>
            </div>
            <Button variant="ghost" size="sm" className="w-9 h-9 rounded-full">
              <User size={18} />
            </Button>
          </div>
        </header>

        <div className="p-4 pb-20 space-y-5 max-w-md mx-auto">
          {/* Map Preview Section with GPS */}
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
            <CardContent className="p-0">
              <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                {/* Mini street grid */}
                <div className="absolute inset-0">
                  <svg width="100%" height="100%" className="opacity-15">
                    <defs>
                      <pattern id="miniStreets" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#miniStreets)" />
                  </svg>
                </div>
                
                {/* Current location indicator */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-25"></div>
                  </div>
                </div>
                
                {/* GPS Status */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs bg-background/90">
                    <CheckCircle size={12} className="mr-1 text-green-500" />
                    GPS Ready
                  </Badge>
                </div>
                
                {/* Set Pickup Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute bottom-2 right-2 h-7 text-xs bg-background/90"
                  onClick={() => {
                    // Simulate getting current location
                    const randomLocation = londonLocations[Math.floor(Math.random() * londonLocations.length)]
                    setBookingForm(prev => ({ ...prev, pickup: randomLocation.name }))
                    toast.success("Current location set as pickup")
                  }}
                >
                  <Crosshair size={12} className="mr-1" />
                  Use Current
                </Button>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Tap map to explore pickup options</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Booking Form with Location Suggestions */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/98">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    placeholder="Pickup location"
                    value={bookingForm.pickup}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, pickup: e.target.value }))}
                    className="pl-10 h-12 border-0 bg-muted/50 focus:bg-background transition-colors"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 px-3 text-xs"
                    onClick={() => {
                      const randomLocation = londonLocations[Math.floor(Math.random() * londonLocations.length)]
                      setBookingForm(prev => ({ ...prev, pickup: randomLocation.name }))
                      toast.success("GPS location set")
                    }}
                  >
                    <Crosshair size={14} className="mr-1" />
                    GPS
                  </Button>
                </div>
                
                <div className="relative">
                  <Input
                    placeholder="Where to?"
                    value={bookingForm.destination}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, destination: e.target.value }))}
                    className="pl-10 h-12 border-0 bg-muted/50 focus:bg-background transition-colors"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                  {bookingForm.destination && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-10 px-2"
                      onClick={() => {
                        addToFavorites(bookingForm.destination, `Saved Location ${favorites.length + 1}`)
                      }}
                    >
                      <Heart size={14} />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Quick Location Suggestions */}
              {(!bookingForm.pickup || !bookingForm.destination) && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Quick locations</p>
                  <div className="flex flex-wrap gap-2">
                    {londonLocations.slice(0, 4).map((location, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          if (!bookingForm.pickup) {
                            setBookingForm(prev => ({ ...prev, pickup: location.name }))
                          } else if (!bookingForm.destination) {
                            setBookingForm(prev => ({ ...prev, destination: location.name }))
                          }
                        }}
                      >
                        <MapPin size={12} className="mr-1" />
                        {location.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ride Options with improved spacing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-muted-foreground font-medium">Choose your ride</p>
              <Clock size={14} className="text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              {rideServices.map(service => {
                const Icon = service.icon
                return (
                  <Card 
                    key={service.id}
                    className={`cursor-pointer transition-all duration-200 border-0 shadow-sm hover:shadow-md ${
                      selectedService === service.id 
                        ? 'ring-2 ring-primary bg-gradient-to-r from-primary/5 to-accent/5 shadow-md' 
                        : 'hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/10'
                    }`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          selectedService === service.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-primary/10'
                        }`}>
                          <Icon size={22} className={selectedService === service.id ? '' : 'text-primary'} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-base">{service.name}</h3>
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-base">{service.priceRange}</p>
                              <p className="text-xs text-muted-foreground">{service.eta} away</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Payment Method with improved design */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center">
                    <CreditCard size={16} />
                  </div>
                  <span className="font-medium">Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Mastercard •••• 4321</span>
                  <NavigationArrow size={14} className="rotate-90 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Confirm Button */}
          <Button 
            onClick={handleBookRide}
            className="w-full h-14 bg-gradient-to-r from-black to-black/90 hover:from-black/90 hover:to-black/80 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            disabled={!bookingForm.pickup || !bookingForm.destination || !selectedService}
          >
            <div className="flex items-center gap-2">
              {selectedService && <Car size={18} />}
              Confirm {selectedService ? rideServices.find(s => s.id === selectedService)?.name : 'Ride'}
            </div>
          </Button>
        </div>

        {/* Bottom Navigation with enhanced design */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50">
          <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
            <button
              onClick={() => setCurrentView('home')}
              className="flex flex-col items-center justify-center gap-1 text-primary transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <House size={20} weight="fill" />
              </div>
              <span className="text-xs font-semibold">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentView('activity')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <List size={20} />
              </div>
              <span className="text-xs">Activity</span>
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <Heart size={20} />
              </div>
              <span className="text-xs">Saved</span>
            </button>

            <button
              onClick={() => setCurrentView('account')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <User size={20} />
              </div>
              <span className="text-xs">Account</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Trip Tracking View
  if (currentView === 'tracking' && currentTrip && assignedDriver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
        <Toaster position="top-center" />
        
        {/* Header with enhanced styling */}
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('home')} className="w-9 h-9 rounded-full">
              <ArrowLeft size={18} />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold truncate">Trip to {currentTrip.destination}</h1>
              <p className="text-xs text-muted-foreground">Tracking your ride</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4 max-w-md mx-auto">
          {/* Enhanced Map */}
          <InteractiveMap trip={currentTrip} driver={assignedDriver} />

          {/* Driver Info with improved layout */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/95">
            <CardContent className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img 
                    src={assignedDriver.photo} 
                    alt={assignedDriver.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{assignedDriver.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Star size={14} className="text-yellow-500" weight="fill" />
                    <span className="font-medium">{assignedDriver.rating}</span>
                    <span>•</span>
                    <span>{assignedDriver.completedTrips} trips</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{assignedDriver.vehicle}</p>
                  <p className="text-sm text-muted-foreground">{assignedDriver.license}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-11 font-medium"
                  onClick={() => {
                    // Simulate calling driver
                    toast.success("Calling driver...")
                  }}
                >
                  <Phone size={16} className="mr-2" />
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-11 font-medium relative"
                  onClick={() => {
                    setIsChatOpen(true)
                    setUnreadMessages(0)
                  }}
                >
                  <ChatCircle size={16} className="mr-2" />
                  Chat
                  {unreadMessages > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 text-xs bg-destructive text-destructive-foreground flex items-center justify-center">
                      {unreadMessages}
                    </Badge>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Trip Details with Real-time Info */}
          <div className="space-y-3">
            <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Trip Route</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 shadow-sm"></div>
                    <div>
                      <p className="font-medium">{currentTrip.pickup}</p>
                      <p className="text-xs text-muted-foreground">Pickup location</p>
                    </div>
                  </div>
                  <div className="ml-2 w-0.5 h-8 bg-gradient-to-b from-blue-500 via-muted to-red-500"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0 shadow-sm"></div>
                    <div>
                      <p className="font-medium">{currentTrip.destination}</p>
                      <p className="text-xs text-muted-foreground">Destination</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Trip Stats */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{currentTrip.estimatedDistance || '3.2'} km</p>
                    <p className="text-xs text-muted-foreground">Distance</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">{currentTrip.estimatedDuration || '12'} min</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">£{currentTrip.estimatedPrice?.split(' - ')[0]?.substring(1) || '12.50'}</p>
                    <p className="text-xs text-muted-foreground">Fare</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Traffic & Weather Conditions */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-3">Current Conditions</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Moderate traffic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Clear weather</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Last updated: {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Button 
            variant="destructive" 
            className="w-full h-12 font-semibold rounded-xl"
            onClick={() => {
              setCurrentTrip(null)
              setAssignedDriver(null)
              setIsChatOpen(false)
              setUnreadMessages(0)
              setCurrentView('home')
              toast.success("Trip cancelled")
            }}
          >
            Cancel Trip
          </Button>
        </div>

        {/* Chat System */}
        {currentTrip && assignedDriver && (
          <ChatSystem 
            trip={currentTrip}
            driver={assignedDriver}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        )}

        {/* Floating Chat Bubble for unread messages */}
        {currentTrip && assignedDriver && !isChatOpen && unreadMessages > 0 && (
          <div className="fixed bottom-20 right-4 z-40">
            <Button
              onClick={() => {
                setIsChatOpen(true)
                setUnreadMessages(0)
              }}
              className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-xl relative animate-bounce"
            >
              <ChatCircle size={24} className="text-primary-foreground" weight="fill" />
              <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 text-xs bg-destructive text-destructive-foreground flex items-center justify-center">
                {unreadMessages}
              </Badge>
            </Button>
          </div>
        )}
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

        <div className="p-4 pb-20 max-w-md mx-auto">
          {recentTrips.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <List size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">When you book your first ride with GQ Cars, it will appear here</p>
              <Button onClick={() => setCurrentView('home')} className="h-12 px-6 rounded-xl font-semibold">
                <Car size={18} className="mr-2" />
                Book your first ride
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrips.map((trip: any) => (
                <Card key={trip.id} className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Car size={18} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{trip.service.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(trip.startTime).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-lg">{trip.estimatedPrice}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-muted-foreground truncate">{trip.pickup}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-destructive rounded-full"></div>
                        <span className="text-muted-foreground truncate">{trip.destination}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                      <span className="text-sm text-muted-foreground">Driver: {trip.driver.name}</span>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        View details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50">
          <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
            <button
              onClick={() => setCurrentView('home')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <House size={20} />
              </div>
              <span className="text-xs">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentView('activity')}
              className="flex flex-col items-center justify-center gap-1 text-primary transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <List size={20} weight="fill" />
              </div>
              <span className="text-xs font-semibold">Activity</span>
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <Heart size={20} />
              </div>
              <span className="text-xs">Saved</span>
            </button>

            <button
              onClick={() => setCurrentView('account')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <User size={20} />
              </div>
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

        <div className="p-4 pb-20 max-w-md mx-auto">
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No saved places</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Save your favorite locations for quick and easy booking</p>
              <Button onClick={() => setCurrentView('home')} className="h-12 px-6 rounded-xl font-semibold">
                <Plus size={18} className="mr-2" />
                Add first location
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((location: any) => (
                <Card key={location.id} className="border-0 shadow-sm bg-gradient-to-r from-card to-card/95 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MapPin size={20} className="text-primary" weight="duotone" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base mb-1">{location.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{location.address}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="ml-3 h-9 px-4 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => {
                          setBookingForm(prev => ({ ...prev, destination: location.address }))
                          setCurrentView('home')
                          toast.success("Destination set from favorites")
                        }}
                      >
                        Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50">
          <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
            <button
              onClick={() => setCurrentView('home')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <House size={20} />
              </div>
              <span className="text-xs">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentView('activity')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <List size={20} />
              </div>
              <span className="text-xs">Activity</span>
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className="flex flex-col items-center justify-center gap-1 text-primary transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <Heart size={20} weight="fill" />
              </div>
              <span className="text-xs font-semibold">Saved</span>
            </button>

            <button
              onClick={() => setCurrentView('account')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <User size={20} />
              </div>
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

        <div className="p-4 pb-20 space-y-6 max-w-md mx-auto">
          {/* Profile Section with enhanced design */}
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

          {/* Settings with improved visual hierarchy */}
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
                      <Clock size={20} />
                    </div>
                    <div>
                      <span className="font-medium">Trip History</span>
                      <p className="text-xs text-muted-foreground">View all your journeys</p>
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
                      <Phone size={20} />
                    </div>
                    <div>
                      <span className="font-medium">Help & Support</span>
                      <p className="text-xs text-muted-foreground">Get assistance 24/7</p>
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
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50">
          <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
            <button
              onClick={() => setCurrentView('home')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <House size={20} />
              </div>
              <span className="text-xs">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentView('activity')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <List size={20} />
              </div>
              <span className="text-xs">Activity</span>
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <Heart size={20} />
              </div>
              <span className="text-xs">Saved</span>
            </button>

            <button
              onClick={() => setCurrentView('account')}
              className="flex flex-col items-center justify-center gap-1 text-primary transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <User size={20} weight="fill" />
              </div>
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