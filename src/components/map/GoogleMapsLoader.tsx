import React from 'react'
import { Button } from "@/components/ui/button"
import { Warning } from "@phosphor-icons/react"
import { useGoogleMapsAPI } from "../../hooks/useGoogleMaps"

interface GoogleMapsLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = ({ children, fallback }) => {
  const { isLoaded, isLoading, error } = useGoogleMapsAPI()

  if (error) {
    return (
      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Warning size={24} className="text-amber-500 mx-auto" />
            <p className="text-sm text-muted-foreground">Maps temporarily unavailable</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="text-xs"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      fallback || (
        <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
            </div>
          </div>
        </div>
      )
    )
  }

  if (!isLoaded) {
    return (
      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto opacity-50"></div>
            <p className="text-sm text-muted-foreground">Maps not available</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}