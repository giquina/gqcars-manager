import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Phone, X, SmileyWink, PaperPlaneTilt } from "@phosphor-icons/react"
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { Trip, Driver, Message } from '../../types'
import { quickMessages } from '../../constants/sample-data'

interface ChatSystemProps {
  trip: Trip
  driver: Driver
  isOpen: boolean
  onClose: () => void
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ trip, driver, isOpen, onClose }) => {
  const [messages, setMessages] = useKV(`chat-${trip.id}`, [] as Message[])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [driverTyping, setDriverTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Enhanced notification system for new messages
  useEffect(() => {
    if (!isOpen && trip && messages.length > 0) {
      // Check for new driver messages when chat is closed
      const lastDriverMessage = messages
        .filter(msg => msg.sender === 'driver')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      
      if (lastDriverMessage) {
        const messageAge = new Date().getTime() - new Date(lastDriverMessage.timestamp).getTime()
        if (messageAge < 5000) { // Message is less than 5 seconds old
          // This would trigger unread count update in parent component
          // For demo purposes, we'll show a toast notification
          if (typeof window !== 'undefined') {
            toast.success(`New message from ${driver.name}: ${lastDriverMessage.text.substring(0, 50)}${lastDriverMessage.text.length > 50 ? '...' : ''}`, {
              duration: 4000,
              action: {
                label: "Reply",
                onClick: () => {
                  // This would open the chat in a real implementation
                  console.log("Open chat")
                }
              }
            })
          }
        }
      }
    }
  }, [messages, isOpen, trip, driver.name])

  // Simulate driver messages and typing
  useEffect(() => {
    if (!isOpen) return

    // Add initial driver message if no messages exist
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now(),
        text: `Hello! I'm ${driver.name}, your driver for today. I'm on my way to pick you up. ETA: ${driver.eta} minutes.`,
        sender: 'driver',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages([welcomeMessage])
    }

    // Simulate driver responses
    const responseInterval = setInterval(() => {
      if (Math.random() > 0.85 && messages.length > 0) { // 15% chance every 10 seconds
        const responses = [
          "On my way!",
          "Just around the corner",
          "Should be there in 2 minutes",
          "Thanks for waiting",
          "Traffic is moving well",
          "I can see the pickup location"
        ]
        
        const response: Message = {
          id: Date.now(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'driver',
          timestamp: new Date(),
          type: 'text'
        }
        
        setMessages(prev => [...prev, response])
      }
    }, 10000)

    // Simulate driver typing indicator
    const typingInterval = setInterval(() => {
      if (Math.random() > 0.9) { // 10% chance
        setDriverTyping(true)
        setTimeout(() => setDriverTyping(false), 2000)
      }
    }, 15000)

    return () => {
      clearInterval(responseInterval)
      clearInterval(typingInterval)
    }
  }, [isOpen, messages.length, driver.name, driver.eta, setMessages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, driverTyping])

  // Handle sending messages
  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: 'passenger',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    
    // Show typing indicator
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 1000)
    
    toast.success("💬 Message sent")
  }

  const sendQuickMessage = (text: string) => {
    const message: Message = {
      id: Date.now(),
      text,
      sender: 'passenger',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    toast.success("💬 Quick message sent")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full max-w-md mx-auto bg-background rounded-t-3xl border-t border-border max-h-[85vh] flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-card to-card/95">
          <div className="flex items-center gap-3">
            <img 
              src={driver.photo} 
              alt={driver.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-background"
            />
            <div>
              <h3 className="font-semibold">{driver.name}</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="w-9 h-9 rounded-full">
              <Phone size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="w-9 h-9 rounded-full">
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'passenger' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[80%]">
                {message.sender === 'driver' && (
                  <img 
                    src={driver.photo} 
                    alt={driver.name}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.sender === 'passenger'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-muted-foreground rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <p className={`text-xs text-muted-foreground mt-1 ${
                    message.sender === 'passenger' ? 'text-right' : 'text-left'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Driver typing indicator */}
          {driverTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <img 
                  src={driver.photo} 
                  alt={driver.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Messages */}
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickMessages.slice(0, 3).map((msg, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap h-8 text-xs bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => sendQuickMessage(msg)}
              >
                {msg}
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-gradient-to-r from-card to-card/95">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="pr-12 rounded-full border-2 focus:border-primary transition-colors"
                maxLength={500}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
              >
                <SmileyWink size={16} className="text-muted-foreground" />
              </Button>
            </div>
            
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              <PaperPlaneTilt size={18} className="text-primary-foreground" weight="fill" />
            </Button>
          </div>
          
          {/* Character count */}
          {newMessage.length > 400 && (
            <p className="text-xs text-muted-foreground text-right mt-1">
              {newMessage.length}/500
            </p>
          )}
        </div>
      </div>
    </div>
  )
}