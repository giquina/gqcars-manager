import React, { useState } from 'react'
import { Warning, Phone, Shield } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PanicButtonProps {
  onPanic: () => void
  currentTrip?: any
  isVisible?: boolean
}

export const PanicButton: React.FC<PanicButtonProps> = ({ 
  onPanic, 
  currentTrip,
  isVisible = true 
}) => {
  const [isPressed, setIsPressed] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handlePanicPress = () => {
    if (isPressed) return

    setIsPressed(true)
    setCountdown(3)

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          triggerEmergencyResponse()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    toast.error('🚨 Emergency alert activated! Press again to cancel', {
      duration: 3000,
      action: {
        label: 'Cancel',
        onClick: () => {
          clearInterval(countdownInterval)
          setIsPressed(false)
          setCountdown(0)
          toast.success('Emergency alert cancelled')
        }
      }
    })

    setTimeout(() => {
      setIsPressed(false)
      setCountdown(0)
    }, 3000)
  }

  const triggerEmergencyResponse = () => {
    onPanic()
    
    toast.error('🚨 EMERGENCY SERVICES CONTACTED', {
      duration: 10000,
      description: 'Police, security team, and emergency contacts have been notified'
    })

    if (currentTrip?.driver) {
      toast.info(`📞 Driver ${currentTrip.driver.name} notified of emergency`, {
        duration: 5000
      })
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={handlePanicPress}
        disabled={isPressed && countdown > 0}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center
          shadow-lg transition-all duration-200 
          ${isPressed 
            ? 'bg-red-600 animate-pulse scale-110' 
            : 'bg-red-500 hover:bg-red-600 hover:scale-105'
          }
          active:scale-95 border-2 border-white
        `}
        aria-label="Emergency Panic Button"
      >
        {countdown > 0 ? (
          <span className="text-white font-bold text-xl">{countdown}</span>
        ) : (
          <Warning className="text-white" size={28} weight="bold" />
        )}
      </button>
      
      {isPressed && (
        <div className="absolute -top-12 right-0 bg-red-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
          Emergency Alert Active
        </div>
      )}
    </div>
  )
}

export const EmergencyResponseModal: React.FC<{ 
  isOpen: boolean
  onClose: () => void 
  currentTrip?: any
}> = ({ isOpen, onClose, currentTrip }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-red-500" size={24} />
          <h2 className="text-xl font-bold text-red-600">Emergency Response Activated</h2>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="text-green-500" size={16} />
            <span>Emergency services contacted: 999</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="text-blue-500" size={16} />
            <span>Security team notified</span>
          </div>
          {currentTrip?.driver && (
            <div className="flex items-center gap-2 text-sm">
              <Warning className="text-orange-500" size={16} />
              <span>Driver {currentTrip.driver.name} alerted</span>
            </div>
          )}
        </div>
        
        <div className="bg-red-50 p-3 rounded-lg mb-4">
          <p className="text-red-700 text-sm">
            <strong>Stay on the line.</strong> Emergency responders are being dispatched to your location. 
            Your driver has been instructed to proceed to the nearest safe location.
          </p>
        </div>
        
        <button
          onClick={onClose}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Understood
        </button>
      </div>
    </div>
  )
}