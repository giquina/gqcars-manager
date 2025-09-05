import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { House, List, Heart, User } from "@phosphor-icons/react"

interface BottomNavigationProps {
  currentView: string
  onNavigate: (view: string) => void
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onNavigate }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigation = (path: string, viewName: string) => {
    navigate(path)
    onNavigate(viewName)
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50">
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
        <button
          onClick={() => handleNavigation('/', 'home')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Home"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <House size={20} weight={isActive('/') ? "fill" : "regular"} />
          </div>
          <span className={`text-xs ${isActive('/') ? 'font-semibold' : ''}`}>Home</span>
        </button>
        
        <button
          onClick={() => handleNavigation('/activity', 'activity')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/activity') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Activity"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <List size={20} weight={isActive('/activity') ? "fill" : "regular"} />
          </div>
          <span className={`text-xs ${isActive('/activity') ? 'font-semibold' : ''}`}>Activity</span>
        </button>

        <button
          onClick={() => handleNavigation('/favorites', 'favorites')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/favorites') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Saved places"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <Heart size={20} weight={isActive('/favorites') ? "fill" : "regular"} />
          </div>
          <span className={`text-xs ${isActive('/favorites') ? 'font-semibold' : ''}`}>Saved</span>
        </button>

        <button
          onClick={() => handleNavigation('/account', 'account')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/account') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Account"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <User size={20} weight={isActive('/account') ? "fill" : "regular"} />
          </div>
          <span className={`text-xs ${isActive('/account') ? 'font-semibold' : ''}`}>Account</span>
        </button>
      </div>
    </div>
  )
}