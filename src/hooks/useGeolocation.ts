import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export const useGeolocation = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accuracy, setAccuracy] = useState<number>(0)
  const [heading, setHeading] = useState<number | null>(null)
  const [speed, setSpeed] = useState<number | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)

  const getCurrentLocation = useCallback(() => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setLocation(coords)
        setAccuracy(position.coords.accuracy)
        setHeading(position.coords.heading)
        setSpeed(position.coords.speed)
        
        // Reverse geocoding to get address
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: coords }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              setAddress(results[0].formatted_address)
            }
          })
        }
        
        setLoading(false)
      },
      (error) => {
        let errorMessage = 'Unable to find your location'
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '📍 Please enable location access to find nearby pickup points'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '📍 Location not available - you can manually set your pickup location'
            break
          case error.TIMEOUT:
            errorMessage = '📍 Location search timed out - please try again'
            break
        }
        setError(errorMessage)
        setLoading(false)
        toast.error(errorMessage)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    )
  }, [])

  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation) return

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setLocation(coords)
        setAccuracy(position.coords.accuracy)
        setHeading(position.coords.heading)
        setSpeed(position.coords.speed)
        
        // Update address less frequently to avoid rate limits
        if (window.google && window.google.maps && Math.random() > 0.8) {
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: coords }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              setAddress(results[0].formatted_address)
            }
          })
        }
      },
      (error) => {
        console.warn('Geolocation error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    )
    
    setWatchId(id)
    return id
  }, [])

  const stopWatchingLocation = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
  }, [watchId])

  return { 
    location, 
    address, 
    loading, 
    error, 
    accuracy, 
    heading, 
    speed,
    getCurrentLocation,
    startWatchingLocation,
    stopWatchingLocation
  }
}