import React, { useState } from 'react'
import { Star, Shield, CheckCircle, User, Car, Phone } from '@phosphor-icons/react'
import { Trip, Driver } from '../../types'
import { toast } from 'sonner'

interface SecurityRatingModalProps {
  isOpen: boolean
  onClose: () => void
  trip: Trip
  driver: Driver
  onRatingSubmitted: (rating: SecurityRating) => void
}

interface SecurityRating {
  overallRating: number
  securityProfessionalism: number
  vehicleSecurity: number
  communicationClarity: number
  protocolAdherence: number
  responseTime: number
  discretion: number
  feedback: string
  recommendDriver: boolean
  incidentFree: boolean
}

const ratingCategories = [
  { 
    key: 'securityProfessionalism' as keyof SecurityRating, 
    label: 'Security Professionalism', 
    description: 'Professional conduct and security expertise',
    icon: Shield 
  },
  { 
    key: 'vehicleSecurity' as keyof SecurityRating, 
    label: 'Vehicle Security Features', 
    description: 'Condition and security features of the vehicle',
    icon: Car 
  },
  { 
    key: 'communicationClarity' as keyof SecurityRating, 
    label: 'Communication', 
    description: 'Clear, timely, and professional communication',
    icon: Phone 
  },
  { 
    key: 'protocolAdherence' as keyof SecurityRating, 
    label: 'Protocol Adherence', 
    description: 'Following security procedures and protocols',
    icon: CheckCircle 
  },
  { 
    key: 'responseTime' as keyof SecurityRating, 
    label: 'Response Time', 
    description: 'Punctuality and response to requests',
    icon: CheckCircle 
  },
  { 
    key: 'discretion' as keyof SecurityRating, 
    label: 'Discretion & Privacy', 
    description: 'Maintaining confidentiality and low profile',
    icon: User 
  }
]

export const SecurityRatingModal: React.FC<SecurityRatingModalProps> = ({
  isOpen,
  onClose,
  trip,
  driver,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState<SecurityRating>({
    overallRating: 5,
    securityProfessionalism: 5,
    vehicleSecurity: 5,
    communicationClarity: 5,
    protocolAdherence: 5,
    responseTime: 5,
    discretion: 5,
    feedback: '',
    recommendDriver: true,
    incidentFree: true
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingChange = (category: keyof SecurityRating, value: number) => {
    setRating(prev => ({ ...prev, [category]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      onRatingSubmitted(rating)
      
      toast.success('Security service rating submitted', {
        description: 'Thank you for your feedback on the security transport service'
      })
      
      onClose()
    } catch (error) {
      toast.error('Failed to submit rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateOverallRating = () => {
    const ratings = [
      rating.securityProfessionalism,
      rating.vehicleSecurity,
      rating.communicationClarity,
      rating.protocolAdherence,
      rating.responseTime,
      rating.discretion
    ]
    return Math.round(ratings.reduce((sum, r) => sum + r, 0) / ratings.length)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Rate Security Transport Service</h2>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>Trip with {driver.name} • {trip.service.name}</p>
            <p>{trip.pickup} → {trip.destination}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Rating */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3">Overall Rating</h3>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(prev => ({ ...prev, overallRating: star }))}
                  className="transition-colors"
                >
                  <Star
                    size={32}
                    weight={star <= rating.overallRating ? "fill" : "regular"}
                    className={star <= rating.overallRating ? "text-yellow-400" : "text-gray-300"}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {rating.overallRating === 1 && "Poor - Significant issues"}
              {rating.overallRating === 2 && "Fair - Below expectations"}
              {rating.overallRating === 3 && "Good - Met basic expectations"}
              {rating.overallRating === 4 && "Very Good - Exceeded expectations"}
              {rating.overallRating === 5 && "Excellent - Outstanding service"}
            </p>
          </div>

          {/* Security-Specific Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold">Security Service Details</h3>
            {ratingCategories.map(({ key, label, description, icon: Icon }) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <Icon className="text-blue-600 mt-1" size={18} />
                  <div className="flex-1">
                    <h4 className="font-medium">{label}</h4>
                    <p className="text-xs text-gray-600">{description}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(key, star)}
                        className="transition-colors"
                      >
                        <Star
                          size={20}
                          weight={star <= (rating[key] as number) ? "fill" : "regular"}
                          className={star <= (rating[key] as number) ? "text-yellow-400" : "text-gray-300"}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-medium">{rating[key]}/5</span>
                </div>
              </div>
            ))}
          </div>

          {/* Security Assessment */}
          <div className="space-y-4">
            <h3 className="font-semibold">Security Assessment</h3>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Was the journey incident-free?</span>
              <button
                onClick={() => setRating(prev => ({ ...prev, incidentFree: !prev.incidentFree }))}
                className={`
                  w-12 h-6 rounded-full transition-colors
                  ${rating.incidentFree ? 'bg-green-500' : 'bg-red-500'}
                `}
              >
                <div className={`
                  w-5 h-5 bg-white rounded-full transition-transform
                  ${rating.incidentFree ? 'translate-x-6' : 'translate-x-0.5'}
                `} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Would you request this driver again?</span>
              <button
                onClick={() => setRating(prev => ({ ...prev, recommendDriver: !prev.recommendDriver }))}
                className={`
                  w-12 h-6 rounded-full transition-colors
                  ${rating.recommendDriver ? 'bg-blue-500' : 'bg-gray-400'}
                `}
              >
                <div className={`
                  w-5 h-5 bg-white rounded-full transition-transform
                  ${rating.recommendDriver ? 'translate-x-6' : 'translate-x-0.5'}
                `} />
              </button>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium mb-2">Additional Feedback</label>
            <textarea
              value={rating.feedback}
              onChange={(e) => setRating(prev => ({ ...prev, feedback: e.target.value }))}
              placeholder="Share any specific comments about the security service, driver performance, or suggestions for improvement..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{rating.feedback.length}/500 characters</p>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base fare ({trip.service.name})</span>
                <span>£{((Math.random() * 20) + 25).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Security premium</span>
                <span>£{((Math.random() * 10) + 5).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Distance: {trip.estimatedDistance?.toFixed(1) || '5.2'} km</span>
                <span>£{((Math.random() * 5) + 3).toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>£{((Math.random() * 35) + 33).toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Payment automatically processed • Receipt sent via email
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Skip Rating
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  )
}