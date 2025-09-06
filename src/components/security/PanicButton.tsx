import React, { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Shield, Warning, CheckCircle } from "@phosphor-icons/react"
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface EmergencyAlert {
  id: string
  timestamp: Date
  location: {
    lat: number
    lng: number
  } | null
  status: 'active' | 'resolved' | 'cancelled'
  type: 'panic' | 'medical' | 'security'
  tripId?: string
}

interface PanicButtonProps {
  tripId?: string
  className?: string
  variant?: 'floating' | 'discrete' | 'prominent'
}

export const PanicButton: React.FC<PanicButtonProps> = ({ 
  tripId, 
  className = '', 
  variant = 'discrete' 
}) => {
  const [isActivating, setIsActivating] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [emergencyAlerts, setEmergencyAlerts] = useKV('emergency-alerts', [] as EmergencyAlert[])
  const [alertOpen, setAlertOpen] = useState(false)

  // Get current location
  const getCurrentLocation = useCallback(() => {
    return new Promise<{lat: number, lng: number}>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCurrentLocation(location)
          resolve(location)
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      )
    })
  }, [])

  const activateEmergencyAlert = useCallback(async (alertType: 'panic' | 'medical' | 'security') => {
    setIsActivating(true)
    
    try {
      // Get current location
      let location: {lat: number, lng: number} | null = null
      try {
        location = await getCurrentLocation()
      } catch (error) {
        console.warn('Could not get location for emergency alert:', error)
      }

      // Create emergency alert
      const newAlert: EmergencyAlert = {
        id: `alert-${Date.now()}`,
        timestamp: new Date(),
        location,
        status: 'active',
        type: alertType,
        tripId
      }

      // Save to local storage
      setEmergencyAlerts(prev => [newAlert, ...prev])

      // Show countdown with progress
      let countdownValue = 10
      setCountdown(countdownValue)
      
      const countdownInterval = setInterval(() => {
        countdownValue--
        setCountdown(countdownValue)
        
        if (countdownValue <= 0) {
          clearInterval(countdownInterval)
          // Simulate emergency services notification
          toast.success('Emergency alert sent to security monitoring center', {
            duration: 5000,
            description: 'Help is on the way. Stay calm and follow safety protocols.'
          })
          setIsActivating(false)
          setAlertOpen(false)
        }
      }, 1000)

      // Log emergency alert activation
      console.log('Emergency alert activated:', newAlert)

    } catch (error) {
      console.error('Failed to activate emergency alert:', error)
      toast.error('Failed to send emergency alert. Please try again or call emergency services directly.')
      setIsActivating(false)
    }
  }, [getCurrentLocation, setEmergencyAlerts, tripId])

  const cancelActivation = useCallback(() => {
    setIsActivating(false)
    setCountdown(0)
    setAlertOpen(false)
    toast.info('Emergency alert cancelled')
  }, [])

  const buttonStyles = {
    floating: "fixed bottom-20 right-4 z-50 size-16 rounded-full shadow-lg bg-red-600 hover:bg-red-700 text-white border-2 border-red-500",
    discrete: "bg-red-600 hover:bg-red-700 text-white border border-red-500 shadow-sm",
    prominent: "bg-red-600 hover:bg-red-700 text-white border-2 border-red-500 shadow-md h-12"
  }

  if (isActivating) {
    return (
      <Card className="fixed inset-4 z-50 bg-red-50 border-red-200 shadow-xl">
        <CardContent className="flex flex-col items-center justify-center h-full text-center space-y-6">
          <div className="flex items-center space-x-2 text-red-600">
            <Warning size={32} weight="bold" />
            <h2 className="text-2xl font-bold">Emergency Alert Activating</h2>
          </div>
          
          <div className="space-y-4 w-full max-w-md">
            <p className="text-red-800 font-medium">
              Security monitoring will be notified in {countdown} seconds
            </p>
            
            <Progress value={(10 - countdown) * 10} className="w-full h-3" />
            
            <div className="flex space-x-3">
              <Button 
                variant="destructive" 
                onClick={cancelActivation}
                className="flex-1"
              >
                Cancel Alert
              </Button>
              <Button 
                variant="outline" 
                onClick={() => activateEmergencyAlert('panic')}
                className="flex-1"
              >
                Send Now
              </Button>
            </div>
          </div>

          <div className="text-sm text-red-700 bg-red-100 p-3 rounded-lg">
            <p className="font-medium">What happens next:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Security team receives immediate notification</li>
              <li>Your location is shared with response team</li>
              <li>Emergency contacts are notified</li>
              <li>Local authorities may be contacted if needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          className={`${buttonStyles[variant]} ${className}`}
          size={variant === 'floating' ? 'icon' : 'default'}
        >
          <Shield size={variant === 'floating' ? 24 : 16} weight="bold" />
          {variant !== 'floating' && (
            <span className="ml-2">Emergency</span>
          )}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2 text-red-600">
            <Warning size={24} weight="bold" />
            <AlertDialogTitle>Emergency Alert</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            This will immediately notify our security monitoring center and your emergency contacts. 
            Use only in genuine emergency situations.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Select emergency type:</p>
          </div>
        </div>

        <AlertDialogFooter className="flex-col space-y-2">
          <div className="flex flex-col space-y-2 w-full">
            <Button 
              variant="destructive" 
              onClick={() => activateEmergencyAlert('panic')}
              className="w-full"
            >
              <Shield size={16} weight="bold" />
              Security Emergency
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => activateEmergencyAlert('medical')}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Warning size={16} weight="bold" />
              Medical Emergency
            </Button>
          </div>
          <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Component to show active emergency alerts status
export const EmergencyStatus: React.FC = () => {
  const [emergencyAlerts] = useKV('emergency-alerts', [] as EmergencyAlert[])
  
  const activeAlerts = emergencyAlerts.filter(alert => alert.status === 'active')

  if (activeAlerts.length === 0) {
    return null
  }

  return (
    <Card className="bg-red-50 border-red-200 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 text-red-600">
          <CheckCircle size={20} weight="bold" />
          <span className="font-semibold">Active Emergency Alert</span>
        </div>
        <p className="text-sm text-red-700 mt-1">
          Security monitoring has been notified. Help is on the way.
        </p>
        <div className="mt-2 text-xs text-red-600">
          Alert ID: {activeAlerts[0].id}
        </div>
      </CardContent>
    </Card>
  )
}