import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  MagnifyingGlass, 
  Crosshair, 
  Clock,
  Star,
  House,
  ArrowLeft
} from "@phosphor-icons/react"
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

const LocationSelector = ({ 
  type = 'pickup', // 'pickup' or 'destination'
  value = '',
  onChange,
  onLocationSelect,
  placeholder,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(value)
  const [suggestions, setSuggestions] = useState([])
  const [recentLocations] = useKV('recent-locations', [])
  const [favoriteLocations] = useKV('favorite-locations', [])
  const inputRef = useRef(null)

  // Mock location data - in real app this would come from Google Places API
  const mockSuggestions = [
    {
      id: 1,
      address: "123 Corporate Plaza, Downtown",
      secondaryText: "Business District",
      type: "business",
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 2,
      address: "456 Executive Tower, Midtown",
      secondaryText: "Financial District",
      type: "business",
      coordinates: { lat: 40.7580, lng: -73.9855 }
    },
    {
      id: 3,
      address: "789 Security Plaza, Uptown",
      secondaryText: "Government Quarter",
      type: "government",
      coordinates: { lat: 40.7831, lng: -73.9712 }
    },
    {
      id: 4,
      address: "JFK International Airport",
      secondaryText: "Terminal 1 - Departure Level",
      type: "airport",
      coordinates: { lat: 40.6413, lng: -73.7781 }
    },
    {
      id: 5,
      address: "LaGuardia Airport",
      secondaryText: "Terminal B - Arrivals",
      type: "airport",
      coordinates: { lat: 40.7769, lng: -73.8740 }
    }
  ]

  useEffect(() => {
    if (searchQuery.length > 2) {
      // Filter suggestions based on search query
      const filtered = mockSuggestions.filter(location =>
        location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.secondaryText.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [searchQuery])

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    onChange?.(value)
  }

  const handleLocationSelect = (location) => {
    setSearchQuery(location.address)
    setIsOpen(false)
    onChange?.(location.address)
    onLocationSelect?.(location)
    
    toast.success(`${type === 'pickup' ? 'Pickup' : 'Destination'} location set`, {
      description: location.address
    })
  }

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            address: "Current Location",
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            type: "current"
          }
          handleLocationSelect(location)
        },
        (error) => {
          toast.error("Location access denied", {
            description: "Please enable location services"
          })
        }
      )
    }
  }

  const getLocationIcon = (type) => {
    switch (type) {
      case 'business':
        return <House className="w-4 h-4 text-blue-500" />
      case 'airport':
        return <MapPin className="w-4 h-4 text-green-500" />
      case 'government':
        return <Star className="w-4 h-4 text-purple-500" />
      case 'current':
        return <Crosshair className="w-4 h-4 text-orange-500" />
      default:
        return <MapPin className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || `Enter ${type} location`}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="pl-10 pr-12 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
        />
        <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCurrentLocation}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8"
        >
          <Crosshair className="w-4 h-4" />
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 z-50 mt-2"
            >
              <Card className="shadow-xl border-0 bg-white">
                <CardContent className="p-0 max-h-80 overflow-y-auto">
                  {/* Current Location Option */}
                  <div
                    onClick={handleCurrentLocation}
                    className="flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Crosshair className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Use current location</p>
                      <p className="text-sm text-gray-500">Enable GPS for precise pickup</p>
                    </div>
                  </div>

                  {/* Recent Locations */}
                  {recentLocations.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Recent</span>
                        </div>
                      </div>
                      {recentLocations.slice(0, 3).map((location, index) => (
                        <div
                          key={`recent-${index}`}
                          onClick={() => handleLocationSelect(location)}
                          className="flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              {getLocationIcon(location.type)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{location.address}</p>
                            {location.secondaryText && (
                              <p className="text-sm text-gray-500">{location.secondaryText}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Favorites */}
                  {favoriteLocations.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Favorites</span>
                        </div>
                      </div>
                      {favoriteLocations.slice(0, 2).map((location, index) => (
                        <div
                          key={`favorite-${index}`}
                          onClick={() => handleLocationSelect(location)}
                          className="flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <Star className="w-5 h-5 text-yellow-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{location.address}</p>
                            <p className="text-sm text-gray-500">{location.secondaryText}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search Suggestions */}
                  {suggestions.length > 0 && (
                    <div>
                      {(recentLocations.length > 0 || favoriteLocations.length > 0) && (
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                          <div className="flex items-center space-x-2">
                            <MagnifyingGlass className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Suggestions</span>
                          </div>
                        </div>
                      )}
                      {suggestions.map((location) => (
                        <div
                          key={location.id}
                          onClick={() => handleLocationSelect(location)}
                          className="flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              {getLocationIcon(location.type)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{location.address}</p>
                            <p className="text-sm text-gray-500">{location.secondaryText}</p>
                          </div>
                          {location.type === 'business' && (
                            <Badge variant="secondary" className="text-xs">
                              Corporate
                            </Badge>
                          )}
                          {location.type === 'airport' && (
                            <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                              Airport
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No results */}
                  {searchQuery.length > 2 && suggestions.length === 0 && (
                    <div className="p-8 text-center">
                      <MagnifyingGlass className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No locations found</p>
                      <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LocationSelector