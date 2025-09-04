// Google Maps API Type Definitions
declare global {
  interface Window {
    google: {
      maps: {
        Map: any
        Marker: any
        Geocoder: any
        event: {
          clearInstanceListeners: (instance: any) => void
        }
        places: {
          Autocomplete: any
          PlacesService: any
        }
        Size: any
        LatLng: any
        MapMouseEvent: any
      }
    }
  }
}

export {}