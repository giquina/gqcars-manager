import React, { useState, useEffect } from 'react'
import { Eye, EyeClosed, Copy, Shield, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface DiscretePickupCodesProps {
  tripId: number | string
  driverName: string
  onCodeVerified?: (verified: boolean) => void
}

const generatePickupCode = (): string => {
  const words = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel']
  const numbers = Math.floor(Math.random() * 900) + 100
  const word = words[Math.floor(Math.random() * words.length)]
  return `${word}-${numbers}`
}

const generateVerificationCode = (): string => {
  return Math.floor(Math.random() * 9000 + 1000).toString()
}

export const DiscretePickupCodes: React.FC<DiscretePickupCodesProps> = ({
  tripId,
  driverName,
  onCodeVerified
}) => {
  const [pickupCode] = useState(() => generatePickupCode())
  const [verificationCode] = useState(() => generateVerificationCode())
  const [showCodes, setShowCodes] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [driverCodeInput, setDriverCodeInput] = useState('')
  const [showVerificationModal, setShowVerificationModal] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Code copied to clipboard')
    }).catch(() => {
      toast.error('Failed to copy code')
    })
  }

  const verifyDriverCode = () => {
    if (driverCodeInput === verificationCode) {
      setIsVerified(true)
      setShowVerificationModal(false)
      onCodeVerified?.(true)
      toast.success('✅ Driver verified successfully', {
        description: 'It is safe to enter the vehicle'
      })
    } else {
      toast.error('❌ Verification failed', {
        description: 'Code does not match. Do not enter the vehicle.'
      })
      onCodeVerified?.(false)
    }
    setDriverCodeInput('')
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="text-amber-600" size={20} />
        <h3 className="font-semibold text-amber-800">Secure Pickup Protocol</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-amber-700 block mb-1">
            Your Pickup Code
          </label>
          <div className="flex items-center gap-2">
            <div className={`
              flex-1 p-2 bg-white rounded border font-mono text-lg
              ${showCodes ? 'text-black' : 'text-transparent bg-gray-100'}
            `}>
              {showCodes ? pickupCode : '••••••••••'}
            </div>
            <button
              onClick={() => setShowCodes(!showCodes)}
              className="p-2 text-amber-600 hover:text-amber-800"
              aria-label={showCodes ? 'Hide code' : 'Show code'}
            >
              {showCodes ? <EyeClosed size={20} /> : <Eye size={20} />}
            </button>
            <button
              onClick={() => copyToClipboard(pickupCode)}
              className="p-2 text-amber-600 hover:text-amber-800"
              aria-label="Copy code"
            >
              <Copy size={20} />
            </button>
          </div>
          <p className="text-xs text-amber-600 mt-1">
            Give this code to the driver: "{driverName}"
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-amber-700 block mb-1">
            Driver Verification Code
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-2 bg-white rounded border font-mono text-lg">
              {showCodes ? verificationCode : '••••'}
            </div>
            {isVerified && (
              <CheckCircle className="text-green-500" size={20} />
            )}
          </div>
          <p className="text-xs text-amber-600 mt-1">
            The driver will provide you with this code to verify their identity
          </p>
        </div>

        <button
          onClick={() => setShowVerificationModal(true)}
          className={`
            w-full py-2 px-4 rounded-lg font-medium transition-colors
            ${isVerified 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-amber-600 text-white hover:bg-amber-700'
            }
          `}
        >
          {isVerified ? 'Driver Verified ✓' : 'Verify Driver Code'}
        </button>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-amber-500" size={24} />
              <h2 className="text-xl font-bold">Verify Driver</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              The driver should provide you with a 4-digit verification code. 
              Enter it below to confirm their identity.
            </p>

            <input
              type="text"
              value={driverCodeInput}
              onChange={(e) => setDriverCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Enter 4-digit code"
              className="w-full p-3 border rounded-lg text-center font-mono text-lg mb-4"
              maxLength={4}
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowVerificationModal(false)
                  setDriverCodeInput('')
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={verifyDriverCode}
                disabled={driverCodeInput.length !== 4}
                className="flex-1 py-2 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-amber-100 rounded-lg">
        <p className="text-xs text-amber-700">
          <strong>Security Protocol:</strong> Only enter the vehicle after both codes have been exchanged 
          and verified. If codes don't match, contact security immediately.
        </p>
      </div>
    </div>
  )
}