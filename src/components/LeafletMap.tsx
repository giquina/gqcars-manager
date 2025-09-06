import React, { useRef, useEffect, useCallback, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import { Icon, LatLngExpression, Map as LeafletMap } from 'leaflet'
import { toast } from 'sonner'
import { Location } from '../types'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

interface MarkerData {
  lat: number
  lng: number
  title?: string
  icon?: string | any
  iconSize?: { width: number; height: number }
  onClick?: () => void
  infoWindow?: string
}

interface LeafletMapProps {
  center: Location
  zoom?: number
  markers?: MarkerData[]
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
  className?: string
  showControls?: boolean
  showCurrentLocation?: boolean
  trackingMode?: boolean
}

// Custom icon for current location
const currentLocationIcon = new Icon({
  iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#3B82F6" stroke="white" stroke-width="3" opacity="0.9"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
      <circle cx="16" cy="16" r="3" fill="#3B82F6"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
})

// Component to handle map clicks
const MapClickHandler: React.FC<{ onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void }> = ({ onLocationSelect }) => {
  useMapEvents({
    click: async (e) => {
      if (onLocationSelect) {
        const { lat, lng } = e.latlng
        
        // Simple reverse geocoding using Nominatim (OpenStreetMap's service)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          )
          const data = await response.json()
          
          onLocationSelect({
            lat,
            lng,
            address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          })
        } catch (error) {
          console.error('Reverse geocoding failed:', error)
          onLocationSelect({
            lat,
            lng,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          })
        }
      }
    }
  })
  
  return null
}

// Component to update map center programmatically
const MapCenterUpdater: React.FC<{ center: Location }> = ({ center }) => {
  const map = useMap()
  
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom())
  }, [center, map])
  
  return null
}

export const LeafletMapComponent: React.FC<LeafletMapProps> = ({
  center,
  zoom = 13,
  markers = [],
  onLocationSelect,
  className = "h-64",
  showControls = true,
  showCurrentLocation = true,
  trackingMode = false
}) => {
  const mapRef = useRef<LeafletMap>(null)
  const [mapReady, setMapReady] = useState(false)

  // Create custom icons for markers
  const createCustomIcon = useCallback((markerData: MarkerData) => {
    if (markerData.icon && typeof markerData.icon === 'string') {
      return new Icon({
        iconUrl: markerData.icon,
        iconSize: [markerData.iconSize?.width || 32, markerData.iconSize?.height || 32],
        iconAnchor: [(markerData.iconSize?.width || 32) / 2, (markerData.iconSize?.height || 32) / 2],
        popupAnchor: [0, -(markerData.iconSize?.height || 32) / 2]
      })
    }
    return undefined
  }, [])

  const handleMapReady = useCallback(() => {
    setMapReady(true)
  }, [])

  return (
    <div className={className} style={{ position: 'relative' }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={trackingMode ? 16 : zoom}
        className="w-full h-full rounded-lg"
        zoomControl={showControls}
        scrollWheelZoom={true}
        whenReady={handleMapReady}
        ref={mapRef}
        style={{ zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        
        {/* Handle map clicks */}
        <MapClickHandler onLocationSelect={onLocationSelect} />
        
        {/* Update map center when it changes */}
        <MapCenterUpdater center={center} />
        
        {/* Render custom markers */}
        {markers.map((marker, index) => {
          const customIcon = createCustomIcon(marker)
          
          return (
            <Marker
              key={index}
              position={[marker.lat, marker.lng]}
              icon={customIcon || (showCurrentLocation && marker.title?.includes('Current') ? currentLocationIcon : undefined)}
              eventHandlers={{
                click: marker.onClick ? () => marker.onClick!() : undefined
              }}
            >
              {marker.infoWindow && (
                <Popup>
                  <div dangerouslySetInnerHTML={{ __html: marker.infoWindow }} />
                </Popup>
              )}
              {marker.title && !marker.infoWindow && (
                <Popup>
                  <div>{marker.title}</div>
                </Popup>
              )}
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default LeafletMapComponent