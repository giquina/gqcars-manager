import React, { useRef, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Location } from '../../types'

interface Marker {
  lat: number
  lng: number
  title?: string
  animation?: google.maps.Animation
  icon?: string | any
  iconSize?: { width: number; height: number }
  onClick?: () => void
  infoWindow?: string
}

interface GoogleMapViewProps {
  center: Location
  markers?: Marker[]
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
  className?: string
  showControls?: boolean
  showTraffic?: boolean
  showCurrentLocation?: boolean
  trackingMode?: boolean
}

export const GoogleMapView = React.forwardRef<any, GoogleMapViewProps>(({ 
  center, 
  markers = [], 
  onLocationSelect,
  className = "h-64",
  showControls = true,
  showTraffic = false,
  showCurrentLocation = true,
  trackingMode = false
}, ref) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const currentLocationMarkerRef = useRef<google.maps.Marker | null>(null)
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null)
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null)
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)

  // Enhanced Google Maps initialization
  useEffect(() => {
    if (!mapRef.current || !window.google) return

    // Initialize map with enhanced options
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: trackingMode ? 16 : 15,
      minZoom: 8,
      maxZoom: 20,
      styles: [
        // Enhanced map styling for better visibility
        {
          featureType: "all",
          elementType: "geometry.fill",
          stylers: [{ weight: "2.00" }]
        },
        {
          featureType: "all",
          elementType: "geometry.stroke",
          stylers: [{ color: "#9c9c9c" }]
        },
        {
          featureType: "all",
          elementType: "labels.text",
          stylers: [{ visibility: "on" }]
        },
        {
          featureType: "landscape",
          elementType: "all",
          stylers: [{ color: "#f2f2f2" }]
        },
        {
          featureType: "landscape",
          elementType: "geometry.fill",
          stylers: [{ color: "#ffffff" }]
        },
        {
          featureType: "poi",
          elementType: "all",
          stylers: [{ visibility: trackingMode ? "off" : "simplified" }]
        },
        {
          featureType: "road",
          elementType: "all",
          stylers: [{ saturation: -100 }, { lightness: 45 }]
        },
        {
          featureType: "road",
          elementType: "geometry.fill",
          stylers: [{ color: "#eeeeee" }]
        },
        {
          featureType: "water",
          elementType: "all",
          stylers: [{ color: "#46bcec" }, { visibility: "on" }]
        },
        {
          featureType: "water",
          elementType: "geometry.fill",
          stylers: [{ color: "#c8d7d4" }]
        }
      ],
      disableDefaultUI: !showControls,
      gestureHandling: trackingMode ? 'greedy' : 'cooperative',
      zoomControl: showControls,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: showControls,
      scaleControl: true,
      rotateControl: trackingMode,
      tilt: trackingMode ? 45 : 0
    })

    mapInstanceRef.current = map

    // Initialize services
    directionsServiceRef.current = new window.google.maps.DirectionsService()
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#1976d2',
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    })
    directionsRendererRef.current.setMap(map)

    // Add traffic layer if requested
    if (showTraffic) {
      trafficLayerRef.current = new window.google.maps.TrafficLayer()
      trafficLayerRef.current.setMap(map)
    }

    // Add click listener for location selection
    if (onLocationSelect) {
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const coords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          }
          
          // Reverse geocoding
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: coords }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              onLocationSelect({
                ...coords,
                address: results[0].formatted_address
              })
            }
          })
        }
      })
    }

    return () => {
      // Cleanup
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.setMap(null)
      }
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null)
      }
    }
  }, [center, onLocationSelect, showControls, showTraffic, trackingMode])

  // Update markers when they change
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Add new markers
    markers.forEach(markerData => {
      const marker = new window.google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: mapInstanceRef.current,
        title: markerData.title,
        animation: markerData.animation || null,
        icon: markerData.icon ? {
          url: markerData.icon,
          scaledSize: new window.google.maps.Size(
            markerData.iconSize?.width || 32, 
            markerData.iconSize?.height || 32
          ),
          anchor: new window.google.maps.Point(
            (markerData.iconSize?.width || 32) / 2,
            (markerData.iconSize?.height || 32) / 2
          )
        } : undefined
      })

      if (markerData.onClick) {
        marker.addListener('click', markerData.onClick)
      }

      // Add info window if provided
      if (markerData.infoWindow) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: markerData.infoWindow
        })
        
        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker)
        })
      }

      markersRef.current.push(marker)
    })
  }, [markers])

  // Update map center when it changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center)
      if (trackingMode) {
        mapInstanceRef.current.setZoom(16)
      }
    }
  }, [center, trackingMode])

  // Method to calculate and display route
  const showRoute = useCallback((origin: google.maps.LatLng | google.maps.LatLngLiteral, 
                                destination: google.maps.LatLng | google.maps.LatLngLiteral,
                                travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING) => {
    if (!directionsServiceRef.current || !directionsRendererRef.current) return

    directionsServiceRef.current.route({
      origin,
      destination,
      travelMode,
      avoidHighways: false,
      avoidTolls: false,
      optimizeWaypoints: true
    }, (result, status) => {
      if (status === 'OK' && result) {
        directionsRendererRef.current?.setDirections(result)
        
        // Fit map to route bounds
        if (mapInstanceRef.current && result.routes[0]) {
          mapInstanceRef.current.fitBounds(result.routes[0].bounds)
        }
      } else {
        console.error('Directions request failed:', status)
        toast.error('Unable to calculate route')
      }
    })
  }, [])

  // Expose methods to parent component
  useEffect(() => {
    if (mapInstanceRef.current && ref) {
      const methods = {
        showRoute,
        toggleTraffic: () => {
          if (trafficLayerRef.current) {
            trafficLayerRef.current.setMap(
              trafficLayerRef.current.getMap() ? null : mapInstanceRef.current
            )
          } else if (mapInstanceRef.current) {
            trafficLayerRef.current = new window.google.maps.TrafficLayer()
            trafficLayerRef.current.setMap(mapInstanceRef.current)
          }
        }
      }

      if (typeof ref === 'function') {
        ref(methods)
      } else if (ref && 'current' in ref) {
        ref.current = methods
      }
    }
  }, [showRoute, ref])

  return <div ref={mapRef} className={className} />
})

GoogleMapView.displayName = 'GoogleMapView'