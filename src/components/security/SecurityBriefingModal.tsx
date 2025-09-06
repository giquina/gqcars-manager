import React, { useState } from 'react'
import { Shield, Warning, CheckCircle, Phone, Eye, Car } from '@phosphor-icons/react'
import { RideService, Driver } from '../../types'

interface SecurityBriefingModalProps {
  isOpen: boolean
  onClose: () => void
  onAcknowledge: () => void
  service: RideService
  driver: Driver
}

const getSecurityLevel = (serviceId: string): 'basic' | 'enhanced' | 'executive' | 'convoy' | 'covert' => {
  if (serviceId.includes('basic')) return 'basic'
  if (serviceId.includes('enhanced')) return 'enhanced'
  if (serviceId.includes('executive')) return 'executive'
  if (serviceId.includes('convoy')) return 'convoy'
  if (serviceId.includes('covert')) return 'covert'
  return 'basic'
}

const getBriefingContent = (level: string) => {
  const common = [
    {
      icon: Shield,
      title: 'Driver Verification',
      content: 'Your driver has been background checked and security cleared. Verify their identity using the provided codes.'
    },
    {
      icon: Phone,
      title: 'Emergency Contacts',
      content: 'Emergency services and your designated contacts will be notified in case of any security incident.'
    },
    {
      icon: Warning,
      title: 'Panic Button',
      content: 'Red panic button is available at all times. Press and hold for 3 seconds to trigger emergency response.'
    }
  ]

  const levelSpecific = {
    basic: [
      {
        icon: Eye,
        title: 'Route Monitoring',
        content: 'Your journey will be tracked in real-time by our security operations center.'
      }
    ],
    enhanced: [
      {
        icon: Car,
        title: 'Armored Vehicle',
        content: 'You will be transported in a security-enhanced vehicle with protective features.'
      },
      {
        icon: Shield,
        title: 'Defensive Driving',
        content: 'Your driver is trained in defensive and evasive driving techniques.'
      }
    ],
    executive: [
      {
        icon: Shield,
        title: 'Close Protection',
        content: 'Your driver is a trained close protection specialist with tactical response capabilities.'
      },
      {
        icon: Eye,
        title: 'Counter-Surveillance',
        content: 'Active monitoring for potential threats and counter-surveillance measures are in place.'
      }
    ],
    convoy: [
      {
        icon: Car,
        title: 'Multi-Vehicle Escort',
        content: 'You will have lead and follow vehicles providing comprehensive route security.'
      },
      {
        icon: Phone,
        title: 'Communication Coordination',
        content: 'All vehicles maintain secure communication with the security operations center.'
      }
    ],
    covert: [
      {
        icon: Eye,
        title: 'Discrete Operations',
        content: 'Low-profile protection using unmarked vehicles to avoid unwanted attention.'
      },
      {
        icon: Shield,
        title: 'Covert Training',
        content: 'Your driver is specially trained in covert protection operations.'
      }
    ]
  }

  return [...common, ...(levelSpecific[level] || levelSpecific.basic)]
}

export const SecurityBriefingModal: React.FC<SecurityBriefingModalProps> = ({
  isOpen,
  onClose,
  onAcknowledge,
  service,
  driver
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [acknowledged, setAcknowledged] = useState(false)

  if (!isOpen) return null

  const securityLevel = getSecurityLevel(service.id)
  const briefingItems = getBriefingContent(securityLevel)
  const totalSteps = briefingItems.length

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setAcknowledged(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAcknowledge = () => {
    onAcknowledge()
    onClose()
  }

  const currentItem = briefingItems[currentStep]
  const IconComponent = currentItem.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Security Briefing</h2>
          </div>
          <div className="text-sm text-gray-500">
            {currentStep + 1} of {totalSteps}
          </div>
        </div>

        {!acknowledged ? (
          <>
            {/* Service and Driver Info */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-3 mb-2">
                <service.icon className="text-blue-600" size={20} />
                <span className="font-semibold text-blue-800">{service.name}</span>
              </div>
              <div className="text-sm text-blue-700">
                Driver: <strong>{driver.name}</strong> • {driver.experience}
              </div>
              <div className="text-sm text-blue-700">
                Security Clearance: <strong>{driver.securityClearance}</strong>
              </div>
            </div>

            {/* Current Briefing Item */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconComponent className="text-blue-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-3">{currentItem.title}</h3>
              <p className="text-gray-600 leading-relaxed">{currentItem.content}</p>
            </div>

            {/* Progress Indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {Array.from({ length: totalSteps }, (_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-600' : 
                    index < currentStep ? 'bg-blue-300' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Acknowledgment Screen */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-3">Security Briefing Complete</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                You have been briefed on the security protocols for your {service.name} service. 
                Please acknowledge that you understand these procedures.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                <div className="flex items-start gap-2">
                  <Warning className="text-amber-500 mt-0.5" size={16} />
                  <div className="text-left">
                    <p className="text-amber-800 text-sm font-medium mb-1">Important Reminders:</p>
                    <ul className="text-amber-700 text-xs space-y-1">
                      <li>• Always verify driver identity before entering vehicle</li>
                      <li>• Keep emergency contacts informed of your journey</li>
                      <li>• Use panic button immediately if you feel unsafe</li>
                      <li>• Follow all driver instructions during security incidents</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledge}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                I Understand & Acknowledge
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}