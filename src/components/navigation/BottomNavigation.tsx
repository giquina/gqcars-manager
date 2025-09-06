import React from 'react'
import { House, List, Heart, User, Shield } from "@phosphor-icons/react"

interface BottomNavigationProps {
  currentView: string
  onNavigate: (view: string) => void
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onNavigate }) => {
  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: House,
      weight: 'fill' as const,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: List,
      weight: 'regular' as const,
    },
    {
      id: 'favorites',
      label: 'Saved',
      icon: Heart,
      weight: 'regular' as const,
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      weight: 'regular' as const,
    },
    {
      id: 'welcome',
      label: 'Reset',
      icon: Shield,
      weight: 'regular' as const,
    },
  ]

  return (
    <div className="bottom-navigation bg-background/95 backdrop-blur-sm border-t border-border/50 z-30">
      <div className="bottom-nav-container">
        <div className="grid grid-cols-5 h-12">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive 
                    ? 'text-amber-600' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label={item.label}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <Icon 
                    size={16} 
                    weight={isActive && item.id === 'home' ? 'fill' : 'regular'} 
                  />
                </div>
                <span className={`text-[10px] ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BottomNavigation