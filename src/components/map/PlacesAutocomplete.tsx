import React, { useRef, useEffect } from 'react'
import { Input } from "@/components/ui/input"

interface PlacesAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
  onPlaceSelect?: (place: any) => void
}

export const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({ 
  value, 
  onChange, 
  placeholder,
  className = "",
  onPlaceSelect 
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    if (!inputRef.current || !window.google?.maps?.places) return

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'gb' }, // Restrict to UK
      fields: ['place_id', 'formatted_address', 'geometry', 'name'],
      types: ['establishment', 'geocode'] // Include both places and addresses
    })

    autocompleteRef.current = autocomplete

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place.formatted_address) {
        onChange(place.formatted_address)
        if (onPlaceSelect) {
          onPlaceSelect(place)
        }
      }
    })

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [onChange, onPlaceSelect])

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  )
}