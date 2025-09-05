// Google Maps API type declarations
declare global {
  interface Window {
    google: {
      maps: {
        Map: typeof google.maps.Map
        Marker: typeof google.maps.Marker
        Geocoder: typeof google.maps.Geocoder
        ControlPosition: typeof google.maps.ControlPosition
        Size: typeof google.maps.Size
        Point: typeof google.maps.Point
        MapMouseEvent: google.maps.MapMouseEvent
      }
    }
    googleMapsLoaded?: boolean
  }
}

declare namespace google.maps {
  interface MapMouseEvent {
    latLng: google.maps.LatLng | null
  }
  
  interface LatLng {
    lat(): number
    lng(): number
  }
  
  interface Map {
    setCenter(latLng: LatLng | LatLngLiteral): void
    setZoom(zoom: number): void
    addListener(eventName: string, handler: Function): void
  }
  
  interface Marker {
    setMap(map: Map | null): void
  }
  
  interface LatLngLiteral {
    lat: number
    lng: number
  }
  
  interface GeocoderResult {
    formatted_address: string
  }
  
  interface GeocoderRequest {
    location: LatLngLiteral
  }
  
  interface Geocoder {
    geocode(
      request: GeocoderRequest,
      callback: (results: GeocoderResult[] | null, status: string) => void
    ): void
  }
}

export {}