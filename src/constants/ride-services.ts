import { Car, Shield, Star, Users, UserCheck } from "@phosphor-icons/react"

export const rideServices = [
  {
    id: 'basic-security',
    name: 'Basic Security',
    description: 'Vetted drivers with basic security training',
    priceRange: '£15.50 - £22.80',
    eta: '3-5 min',
    icon: Car,
    capacity: '1-4 passengers',
    vehicle: 'Secure vehicles',
    securityLevel: 'Basic',
    features: ['Background-checked drivers', 'Real-time tracking', 'Emergency contacts']
  },
  {
    id: 'enhanced-security',
    name: 'Enhanced Security',
    description: 'Professional security drivers with defensive driving',
    priceRange: '£25.50 - £35.40',
    eta: '4-6 min',
    icon: Shield,
    capacity: '1-4 passengers',
    vehicle: 'Armored sedans',
    securityLevel: 'Enhanced',
    features: ['Ex-military/police drivers', 'Defensive driving certified', 'Panic button', 'Discrete pickup codes']
  },
  {
    id: 'executive-protection',
    name: 'Executive Protection', 
    description: 'Close protection specialists for high-risk clients',
    priceRange: '£45.00 - £65.90',
    eta: '5-8 min',
    icon: Star,
    capacity: '1-4 passengers',
    vehicle: 'Executive armored vehicles',
    securityLevel: 'Executive',
    features: ['Close protection trained', 'Tactical planning', 'Counter-surveillance', 'Secure communications']
  },
  {
    id: 'convoy-security',
    name: 'Convoy Security',
    description: 'Multi-vehicle protection for groups and families',
    priceRange: '£75.20 - £120.80',
    eta: '8-12 min',
    icon: Users,
    capacity: '1-8 passengers',
    vehicle: 'Multi-vehicle convoy',
    securityLevel: 'Convoy',
    features: ['Multi-vehicle escort', 'Lead and follow cars', 'Communication coordination', 'Route security']
  },
  {
    id: 'covert-security',
    name: 'Covert Security',
    description: 'Discrete protection with unmarked vehicles',
    priceRange: '£38.90 - £52.40',
    eta: '6-10 min',
    icon: UserCheck,
    capacity: '1-4 passengers',
    vehicle: 'Unmarked secure vehicles',
    securityLevel: 'Covert',
    features: ['Unmarked vehicles', 'Covert operations trained', 'Low-profile protection', 'Counter-surveillance']
  }
]