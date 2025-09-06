import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  ShieldCheck,
  Crown,
  Clock,
  Car,
  Users,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Star
} from "@phosphor-icons/react"

interface SecurityLevel {
  id: string
  name: string
  icon: React.ReactNode
  priceRange: string
  estimatedTime: string
  vehicleType: string
  features: string[]
  description: string
  badge?: string
  popular?: boolean
}

interface SecurityLevelSelectionProps {
  onSecurityLevelSelect: (level: string, price: string, time: string) => void
  selectedLevel: string | null
  onBack: () => void
  onContinue: () => void
}

const securityLevels: SecurityLevel[] = [
  {
    id: 'essential',
    name: 'Essential Security',
    icon: <Shield className="w-6 h-6" />,
    priceRange: '£15-25',
    estimatedTime: '3-5 min',
    vehicleType: 'Professional Vehicle',
    description: 'Basic security transport with trained driver',
    features: [
      'Vetted security driver',
      'GPS tracking',
      'Emergency contact',
      'Basic threat assessment'
    ]
  },
  {
    id: 'executive',
    name: 'Executive Protection',
    icon: <ShieldCheck className="w-6 h-6" />,
    priceRange: '£35-50',
    estimatedTime: '2-3 min',
    vehicleType: 'Executive Vehicle',
    description: 'Enhanced security with close protection officer',
    features: [
      'Close protection officer',
      'Advanced route planning',
      'Real-time threat monitoring',
      'Secure communication',
      'Executive vehicle'
    ],
    popular: true,
    badge: 'Most Popular'
  },
  {
    id: 'vip',
    name: 'VIP Security',
    icon: <Crown className="w-6 h-6" />,
    priceRange: '£55-75',
    estimatedTime: '1-2 min',
    vehicleType: 'Luxury Armored Vehicle',
    description: 'Premium security with armored transport',
    features: [
      'Armored luxury vehicle',
      'Multi-agent security team',
      'Counter-surveillance',
      'Secure convoy option',
      'VIP treatment',
      'Priority dispatch'
    ],
    badge: 'Premium'
  }
]

const SecurityLevelCard: React.FC<{
  level: SecurityLevel
  isSelected: boolean
  onSelect: () => void
}> = ({ level, isSelected, onSelect }) => {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'ring-2 ring-primary border-primary bg-primary/5' 
          : 'hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              isSelected 
                ? 'bg-primary text-white' 
                : 'bg-neutral-3'
            }`}>
              {level.icon}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {level.name}
                {level.popular && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Star className="w-3 h-3 mr-1" />
                    {level.badge}
                  </Badge>
                )}
                {level.badge && !level.popular && (
                  <Badge variant="secondary">{level.badge}</Badge>
                )}
              </CardTitle>
              <p className="text-sm text-neutral-11 mt-1">{level.description}</p>
            </div>
          </div>
          {isSelected && (
            <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Price and Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-primary">{level.priceRange}</span>
            </div>
            <div className="flex items-center gap-1 text-neutral-11">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{level.estimatedTime}</span>
            </div>
          </div>
        </div>

        {/* Vehicle Type */}
        <div className="flex items-center gap-2 text-neutral-11">
          <Car className="w-4 h-4" />
          <span className="text-sm">{level.vehicleType}</span>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-12">Features included:</h4>
          <div className="grid grid-cols-1 gap-1">
            {level.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-neutral-11">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const SecurityLevelSelection: React.FC<SecurityLevelSelectionProps> = ({
  onSecurityLevelSelect,
  selectedLevel,
  onBack,
  onContinue
}) => {
  const handleLevelSelect = (level: SecurityLevel) => {
    onSecurityLevelSelect(level.name, level.priceRange, level.estimatedTime)
  }

  const selectedLevelData = securityLevels.find(level => level.name === selectedLevel)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Choose Your Security Level
          </CardTitle>
          <p className="text-sm text-neutral-11">
            Select the security service that best matches your requirements
          </p>
        </CardHeader>
      </Card>

      {/* Security Level Options */}
      <div className="space-y-4">
        {securityLevels.map((level) => (
          <SecurityLevelCard
            key={level.id}
            level={level}
            isSelected={selectedLevel === level.name}
            onSelect={() => handleLevelSelect(level)}
          />
        ))}
      </div>

      {/* Summary and Actions */}
      {selectedLevel && (
        <Card className="bg-neutral-1 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Selected: {selectedLevel}</h3>
                  <p className="text-sm text-neutral-11">
                    Estimated arrival: {selectedLevelData?.estimatedTime}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {selectedLevelData?.priceRange}
                  </div>
                  <p className="text-xs text-neutral-11">Estimated cost</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Location
        </Button>
        <Button 
          onClick={onContinue}
          disabled={!selectedLevel}
          className="flex-1"
          size="lg"
        >
          Continue to Confirmation
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-blue-900">Security Guarantee</h4>
              <p className="text-sm text-blue-800">
                All our security personnel are fully vetted, licensed, and undergo continuous training. 
                Your safety is our priority with 24/7 support and real-time monitoring.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SecurityLevelSelection