import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom icons
const pickupIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EF4444" stroke="white" stroke-width="1"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})

const currentLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
})

const driverIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7L8 2L16 2L21 7L21 17C21 18.1 20.1 19 19 19H18C18 17.9 17.1 17 16 17C14.9 17 14 17.9 14 19H10C10 17.9 9.1 17 8 17C6.9 17 6 17.9 6 19H5C3.9 19 3 18.1 3 17V7Z" fill="#10B981" stroke="white" stroke-width="1"/>
      <circle cx="8" cy="19" r="2" fill="#10B981"/>
      <circle cx="16" cy="19" r="2" fill="#10B981"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
})

interface LocationSelectHandlerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  isTrackingMode: boolean
}

const LocationSelectHandler: React.FC<LocationSelectHandlerProps> = ({ onLocationSelect, isTrackingMode }) => {
  useMapEvents({
    click: async (e) => {
      if (!isTrackingMode) {
        const { lat, lng } = e.latlng
        
        // Reverse geocoding using OpenStreetMap Nominatim API
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          )
          const data = await response.json()
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          
          onLocationSelect({ lat, lng, address })
        } catch (error) {
          console.error('Geocoding error:', error)
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

interface LeafletMapComponentProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  selectedLocation?: { lat: number; lng: number }
  currentLocation?: { lat: number; lng: number }
  destinationLocation?: { lat: number; lng: number }
  driverLocation?: { lat: number; lng: number }
  isTrackingMode?: boolean
}

const LeafletMapComponent: React.FC<LeafletMapComponentProps> = ({
  onLocationSelect,
  selectedLocation,
  currentLocation,
  destinationLocation,
  driverLocation,
  isTrackingMode = false
}) => {
  // Default to London center
  const defaultCenter: [number, number] = [51.5074, -0.1278]
  const center: [number, number] = currentLocation 
    ? [currentLocation.lat, currentLocation.lng] 
    : defaultCenter
  const zoom = currentLocation ? 16 : 12

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LocationSelectHandler 
          onLocationSelect={onLocationSelect} 
          isTrackingMode={isTrackingMode} 
        />
        
        {/* Current location marker */}
        {currentLocation && (
          <Marker 
            position={[currentLocation.lat, currentLocation.lng]} 
            icon={currentLocationIcon}
          >
            <Popup>Your current location</Popup>
          </Marker>
        )}
        
        {/* Pickup location marker */}
        {selectedLocation && (
          <Marker 
            position={[selectedLocation.lat, selectedLocation.lng]} 
            icon={pickupIcon}
          >
            <Popup>Pickup location</Popup>
          </Marker>
        )}
        
        {/* Destination marker */}
        {destinationLocation && (
          <Marker 
            position={[destinationLocation.lat, destinationLocation.lng]}
          >
            <Popup>Destination</Popup>
          </Marker>
        )}
        
        {/* Driver location marker */}
        {driverLocation && (
          <Marker 
            position={[driverLocation.lat, driverLocation.lng]} 
            icon={driverIcon}
          >
            <Popup>Driver location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

export default LeafletMapComponent