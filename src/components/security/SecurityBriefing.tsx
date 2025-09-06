import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  Shield, 
  MapPin, 
  Clock, 
  Phone, 
  Star,
  CheckCircle,
  Warning,
  Eye,
  Lock,
  UserCheck,
  Car,
  Route
} from "@phosphor-icons/react"
import { Driver, Trip } from "@/types"
import { useKV } from '@github/spark/hooks'

interface SecurityBriefingProps {
  trip: Trip
  onAcknowledge: () => void
  className?: string
}

interface SecurityProtocol {
  id: string
  title: string
  description: string
  icon: any
  importance: 'critical' | 'important' | 'recommended'
}

const securityProtocols: SecurityProtocol[] = [
  {
    id: 'verify-driver',
    title: 'Verify Driver Identity',
    description: 'Check driver photo, name, and license plate before entering vehicle',
    icon: UserCheck,
    importance: 'critical'
  },
  {
    id: 'share-trip',
    title: 'Share Trip Details',
    description: 'Trip information has been shared with your emergency contacts',
    icon: Shield,
    importance: 'critical'
  },
  {
    id: 'stay-alert',
    title: 'Stay Alert',
    description: 'Remain aware of your surroundings and route throughout the journey',
    icon: Eye,
    importance: 'important'
  },
  {
    id: 'secure-communication',
    title: 'Secure Communication',
    description: 'Use in-app messaging for trip-related communications',
    icon: Lock,
    importance: 'recommended'
  }
]

export const SecurityBriefing: React.FC<SecurityBriefingProps> = ({
  trip,
  onAcknowledge,
  className = ''
}) => {
  const [acknowledgedProtocols, setAcknowledgedProtocols] = useState<string[]>([])
  const [briefingHistory] = useKV('security-briefing-history', [] as string[])
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleProtocolAcknowledgment = (protocolId: string) => {
    setAcknowledgedProtocols(prev => 
      prev.includes(protocolId) 
        ? prev.filter(id => id !== protocolId)
        : [...prev, protocolId]
    )
  }

  const allCriticalProtocolsAcknowledged = securityProtocols
    .filter(protocol => protocol.importance === 'critical')
    .every(protocol => acknowledgedProtocols.includes(protocol.id))

  const handleAcknowledge = () => {
    onAcknowledge()
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-600 border-red-200 bg-red-50'
      case 'important': return 'text-orange-600 border-orange-200 bg-orange-50'
      case 'recommended': return 'text-blue-600 border-blue-200 bg-blue-50'
      default: return 'text-gray-600 border-gray-200 bg-gray-50'
    }
  }

  return (
    <Card className={`${className} border-blue-200 bg-blue-50/50`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield size={24} weight="bold" className="text-blue-600" />
            <CardTitle className="text-blue-900">Security Briefing</CardTitle>
          </div>
          <Badge variant="outline" className="border-blue-300 text-blue-700">
            Required
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Driver Verification Section */}
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <UserCheck size={20} className="mr-2 text-blue-600" />
            Verify Your Driver
          </h3>
          
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="size-16 border-2 border-blue-200">
              <img src={trip.driver.photo} alt={trip.driver.name} className="size-full object-cover" />
            </Avatar>
            
            <div className="flex-1">
              <div className="font-medium text-gray-900">{trip.driver.name}</div>
              <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                <Star size={16} weight="fill" className="text-yellow-400" />
                <span>{trip.driver.rating.toFixed(1)}</span>
                <span>•</span>
                <span>{trip.driver.completedTrips.toLocaleString()} trips</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                License: {trip.driver.license}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Car size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Vehicle Information</span>
            </div>
            <div className="text-sm text-gray-600">{trip.driver.vehicle}</div>
          </div>
        </div>

        {/* Route Overview */}
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Route size={20} className="mr-2 text-blue-600" />
            Route Overview
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="size-3 bg-green-500 rounded-full mt-2" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Pickup Location</div>
                <div className="text-sm text-gray-600">{trip.pickup}</div>
              </div>
            </div>
            
            <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-6" />
            
            <div className="flex items-start space-x-3">
              <div className="size-3 bg-red-500 rounded-full mt-2" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Destination</div>
                <div className="text-sm text-gray-600">{trip.destination}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock size={16} />
              <span>ETA: {trip.estimatedDuration} min</span>
            </div>
            {trip.estimatedDistance && (
              <div className="flex items-center space-x-1">
                <MapPin size={16} />
                <span>{trip.estimatedDistance} miles</span>
              </div>
            )}
          </div>
        </div>

        {/* Security Protocols */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Shield size={20} className="mr-2 text-blue-600" />
              Safety Protocols
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show Less' : 'Show All'}
            </Button>
          </div>

          <div className="space-y-2">
            {securityProtocols
              .filter((protocol, index) => isExpanded || protocol.importance === 'critical' || index < 2)
              .map((protocol) => {
                const IconComponent = protocol.icon
                const isAcknowledged = acknowledgedProtocols.includes(protocol.id)
                
                return (
                  <div
                    key={protocol.id}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      isAcknowledged 
                        ? 'border-green-300 bg-green-50' 
                        : getImportanceColor(protocol.importance)
                    }`}
                    onClick={() => toggleProtocolAcknowledgment(protocol.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {isAcknowledged ? (
                          <CheckCircle size={20} weight="fill" className="text-green-600" />
                        ) : (
                          <IconComponent size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{protocol.title}</h4>
                          {protocol.importance === 'critical' && (
                            <Badge variant="outline" className="border-red-300 text-red-700 text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{protocol.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Emergency Contact Info */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Phone size={20} className="mr-2 text-green-600" />
            Emergency Support
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">24/7 Security Line:</span>
              <span className="font-medium text-gray-900">+1 (800) SECURE-1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trip Support:</span>
              <span className="font-medium text-gray-900">In-app messaging</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Local Emergency:</span>
              <span className="font-medium text-gray-900">911</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Acknowledgment Button */}
        <div className="text-center">
          <Button 
            onClick={handleAcknowledge}
            disabled={!allCriticalProtocolsAcknowledged}
            size="lg"
            className="w-full"
          >
            <CheckCircle size={20} className="mr-2" />
            I Understand & Acknowledge
          </Button>
          
          {!allCriticalProtocolsAcknowledged && (
            <p className="text-sm text-red-600 mt-2">
              Please acknowledge all critical safety protocols to continue
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}