import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NavigationArrow, Clock, CheckCircle, Warning } from "@phosphor-icons/react"
import { GoogleMapView } from './GoogleMapView'
import { toast } from 'sonner'
import { Trip, Driver } from '../../types'

interface LiveTrackingMapProps {
  trip: Trip
  driver: Driver
  onArrival?: () => void
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ trip, driver, onArrival }) => {
  const [driverLocation, setDriverLocation] = useState(driver.location || { lat: 51.5074, lng: -0.1278 })
  const [estimatedArrival, setEstimatedArrival] = useState(driver.eta || 5)
  const [routeInfo, setRouteInfo] = useState<any>(null)
  const [isTrackingActive, setIsTrackingActive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const mapRef = useRef<any>(null)

  // Real-time driver position simulation with more realistic movement
  useEffect(() => {
    if (!isTrackingActive) return

    const updateInterval = setInterval(() => {
      setDriverLocation(prev => {
        // Simulate movement toward pickup/destination
        const target = trip.status === 'driver_en_route' ? trip.pickupCoords : trip.destinationCoords
        if (!target) return prev

        // Calculate movement direction
        const deltaLat = (target.lat - prev.lat) * 0.1 // Move 10% closer each update
        const deltaLng = (target.lng - prev.lng) * 0.1

        // Add realistic GPS variance
        const newLat = prev.lat + deltaLat + (Math.random() - 0.5) * 0.0001
        const newLng = prev.lng + deltaLng + (Math.random() - 0.5) * 0.0001

        // Check if arrived
        const distance = Math.sqrt(Math.pow(target.lat - newLat, 2) + Math.pow(target.lng - newLng, 2))
        if (distance < 0.001) { // Very close to destination
          setEstimatedArrival(0)
          if (onArrival) {
            setTimeout(onArrival, 1000)
          }
        } else {
          // Update ETA based on distance
          const roughDistance = distance * 111000 // Convert to meters roughly
          setEstimatedArrival(Math.ceil(roughDistance / 500)) // Assuming 500m/min average speed
        }

        setLastUpdate(new Date())
        return { lat: newLat, lng: newLng }
      })
    }, 2000) // Update every 2 seconds for smooth movement

    return () => clearInterval(updateInterval)
  }, [isTrackingActive, trip.status, trip.pickupCoords, trip.destinationCoords, onArrival])

  // Calculate route when component mounts
  useEffect(() => {
    if (window.google && trip.pickupCoords && trip.destinationCoords) {
      const directionsService = new window.google.maps.DirectionsService()
      
      directionsService.route({
        origin: trip.pickupCoords,
        destination: trip.destinationCoords,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, (result, status) => {
        if (status === 'OK' && result) {
          setRouteInfo({
            distance: result.routes[0].legs[0].distance?.text,
            duration: result.routes[0].legs[0].duration?.text,
            steps: result.routes[0].legs[0].steps
          })
        }
      })
    }
  }, [trip.pickupCoords, trip.destinationCoords])

  const markers = [
    // Driver marker with real-time position
    {
      lat: driverLocation.lat,
      lng: driverLocation.lng,
      title: `${driver.name} - Your Driver`,
      icon: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="#22C55E" stroke="white" stroke-width="3"/>
          <path d="M8 16l4 4 8-8" stroke="white" stroke-width="2" fill="none"/>
        </svg>
      `),
      animation: window.google?.maps?.Animation?.BOUNCE,
      infoWindow: `
        <div style="padding: 8px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${driver.name}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">
            ${driver.vehicle}<br/>
            License: ${driver.license}<br/>
            ETA: ${estimatedArrival} minutes
          </p>
        </div>
      `
    },
    // Pickup marker
    {
      lat: trip.pickupCoords.lat,
      lng: trip.pickupCoords.lng,
      title: 'Pickup Location',
      icon: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="3"/>
          <circle cx="16" cy="16" r="4" fill="white"/>
        </svg>
      `),
      infoWindow: `
        <div style="padding: 8px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">Pickup Point</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${trip.pickup}</p>
        </div>
      `
    },
    // Destination marker
    {
      lat: trip.destinationCoords.lat,
      lng: trip.destinationCoords.lng,
      title: 'Destination',
      icon: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C11.03 2 7 6.03 7 11c0 7.25 9 17 9 17s9-9.75 9-17c0-4.97-4.03-9-9-9z" fill="#EF4444" stroke="white" stroke-width="2"/>
          <circle cx="16" cy="11" r="3" fill="white"/>
        </svg>
      `),
      infoWindow: `
        <div style="padding: 8px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">Destination</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${trip.destination}</p>
        </div>
      `
    }
  ]

  return (
    <div className="space-y-4">
      {/* Live Status Banner */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-semibold text-green-700">Live Tracking Active</h3>
                <p className="text-sm text-green-600">
                  Driver is {estimatedArrival === 0 ? 'arriving now' : `${estimatedArrival} minutes away`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-600">Last update</p>
              <p className="text-xs font-mono text-green-700">
                {lastUpdate.toLocaleTimeString('en-GB', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Map with Live Tracking */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-0">
          <GoogleMapView
            center={driverLocation}
            markers={markers}
            className="h-80"
            showControls={true}
            showTraffic={true}
            trackingMode={true}
          />
          
          {/* Map overlay controls */}
          <div className="absolute top-4 left-4 space-y-2">
            <Badge variant="outline" className="bg-background/95 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              Real-time GPS
            </Badge>
            {routeInfo && (
              <div className="bg-background/95 rounded-lg p-2 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <NavigationArrow size={12} />
                  <span>{routeInfo.distance}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>{routeInfo.duration}</span>
                </div>
              </div>
            )}
          </div>

          {/* Driver info overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={driver.photo} 
                    alt={driver.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-background"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{driver.name}</h4>
                    <p className="text-xs text-muted-foreground">{driver.vehicle} • {driver.license}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      {estimatedArrival === 0 ? 'Arriving' : `${estimatedArrival} min`}
                    </p>
                    <p className="text-xs text-muted-foreground">ETA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Route Information */}
      {routeInfo && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-3">Route Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{routeInfo.distance}</p>
                <p className="text-xs text-muted-foreground">Total Distance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{routeInfo.duration}</p>
                <p className="text-xs text-muted-foreground">Estimated Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking Controls */}
      <div className="flex gap-2">
        <Button
          variant={isTrackingActive ? "default" : "outline"}
          size="sm"
          className="flex-1 h-10"
          onClick={() => setIsTrackingActive(!isTrackingActive)}
        >
          {isTrackingActive ? (
            <>
              <CheckCircle size={16} className="mr-2" />
              Tracking Active
            </>
          ) : (
            <>
              <Warning size={16} className="mr-2" />
              Start Tracking
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-4"
          onClick={() => {
            try {
              if (mapRef.current && typeof mapRef.current.toggleTraffic === 'function') {
                mapRef.current.toggleTraffic()
              }
            } catch (error) {
              console.warn('Traffic toggle error:', error)
              toast.error('Traffic layer temporarily unavailable')
            }
          }}
        >
          Traffic
        </Button>
      </div>
    </div>
  )
}