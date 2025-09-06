import { useState, useEffect } from 'react'
import { Location } from '../types'

interface GPSTrackingData {
  currentPosition: Location
  route: any[]
  progress: number
  eta: number
  speed: number
  bearing: number
  locationHistory: Location[]
  lastUpdateTime: Date
  isOnRoute: boolean
  trafficDelay: number
}

export const useGPSTracking = (
  initialPosition: Location | null, 
  destination: Location | null, 
  isActive: boolean
): GPSTrackingData => {
  const [currentPosition, setCurrentPosition] = useState<Location>(
    initialPosition || { lat: 51.5074, lng: -0.1278 }
  )
  const [route, setRoute] = useState<any[]>([])
  const [progress, setProgress] = useState(0)
  const [eta, setEta] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [bearing, setBearing] = useState(0)
  const [locationHistory, setLocationHistory] = useState<Location[]>([])
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date())
  const [isOnRoute, setIsOnRoute] = useState(true)
  const [trafficDelay, setTrafficDelay] = useState(0)

  useEffect(() => {
    if (!isActive || !destination || !initialPosition) return

    // Generate detailed route points between pickup and destination
    const routePoints = generateRoute(initialPosition, destination)
    setRoute(routePoints)
    setEta(Math.ceil(routePoints.length * 0.5)) // Rough ETA calculation
    setLocationHistory([initialPosition])

    let currentIndex = 0
    const updateInterval = setInterval(() => {
      if (currentIndex < routePoints.length - 1) {
        const currentPoint = routePoints[currentIndex]
        const nextPoint = routePoints[currentIndex + 1]
        
        // Add slight random variation to simulate real GPS movement
        const gpsVariation = {
          lat: currentPoint.lat + (Math.random() - 0.5) * 0.0001,
          lng: currentPoint.lng + (Math.random() - 0.5) * 0.0001
        }
        
        setCurrentPosition(gpsVariation)
        setProgress((currentIndex / (routePoints.length - 1)) * 100)
        
        // Realistic speed variation based on traffic
        const baseSpeed = 25 + Math.random() * 15 // 25-40 mph base
        const trafficMultiplier = Math.random() > 0.8 ? 0.5 : 1 // 20% chance of traffic slowdown
        const currentSpeed = baseSpeed * trafficMultiplier
        setSpeed(currentSpeed)
        
        // Calculate traffic delay
        if (trafficMultiplier < 1) {
          setTrafficDelay(prev => prev + 1)
        }
        
        setBearing(calculateBearing(currentPoint, nextPoint))
        setEta(Math.ceil((routePoints.length - currentIndex) * 0.5 + trafficDelay * 0.1))
        setLastUpdateTime(new Date())
        setIsOnRoute(Math.random() > 0.05) // 95% chance of being on route
        
        // Update location history
        setLocationHistory(prev => [...prev.slice(-20), gpsVariation]) // Keep last 20 positions
        
        currentIndex++
      } else {
        setProgress(100)
        setSpeed(0)
        setEta(0)
        clearInterval(updateInterval)
      }
    }, 1500) // More frequent updates for smoother tracking

    return () => clearInterval(updateInterval)
  }, [isActive, destination, initialPosition])

  return { 
    currentPosition, 
    route, 
    progress, 
    eta, 
    speed, 
    bearing, 
    locationHistory, 
    lastUpdateTime, 
    isOnRoute, 
    trafficDelay 
  }
}

// Enhanced route generation with more realistic GPS points
const generateRoute = (start: Location, end: Location) => {
  const points = []
  const steps = 25 // More route points for smoother tracking
  
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps
    
    // Add curve variation to simulate real roads
    const curveFactor = Math.sin(ratio * Math.PI * 3) * 0.001
    const roadVariation = (Math.random() - 0.5) * 0.0005
    
    const lat = start.lat + (end.lat - start.lat) * ratio + curveFactor + roadVariation
    const lng = start.lng + (end.lng - start.lng) * ratio + (Math.random() - 0.5) * 0.001 + roadVariation
    
    points.push({ 
      lat, 
      lng, 
      timestamp: Date.now() + i * 1500,
      speed: 25 + Math.random() * 15, // Speed at this point
      isTrafficArea: Math.random() > 0.8 // 20% chance of traffic
    })
  }
  
  return points
}

// Bearing calculation
const calculateBearing = (point1: Location, point2: Location) => {
  const dLng = point2.lng - point1.lng
  const y = Math.sin(dLng) * Math.cos(point2.lat)
  const x = Math.cos(point1.lat) * Math.sin(point2.lat) - 
            Math.sin(point1.lat) * Math.cos(point2.lat) * Math.cos(dLng)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}