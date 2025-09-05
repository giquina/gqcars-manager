import { useState, useEffect } from 'react'

export const useGoogleMapsAPI = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      setIsLoading(false)
      return
    }

    // Listen for the API to load
    const handleLoad = () => {
      setIsLoaded(true)
      setIsLoading(false)
      setError(null)
    }

    const handleError = () => {
      setIsLoaded(false)
      setIsLoading(false)
      setError('Failed to load Google Maps API')
    }

    // Add event listeners
    window.addEventListener('google-maps-loaded', handleLoad)
    window.addEventListener('google-maps-error', handleError)

    // Set a timeout in case the API doesn't load
    const timeout = setTimeout(() => {
      if (!window.google) {
        setError('Google Maps API took too long to load')
        setIsLoading(false)
      }
    }, 10000)

    return () => {
      window.removeEventListener('google-maps-loaded', handleLoad)
      window.removeEventListener('google-maps-error', handleError)
      clearTimeout(timeout)
    }
  }, [])

  return { isLoaded, isLoading, error }
}