import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { useKV } from '@github/spark/hooks'

const AppTest = () => {
  const [currentView, setCurrentView] = useState<string>('home')
  const [testData, setTestData] = useKV("test-data", "Hello World")

  return (
    <div className="min-h-screen bg-white p-4">
      <h1 className="text-2xl font-bold mb-4">Armora Test App</h1>
      <p className="mb-4">Current view: {currentView}</p>
      <p className="mb-4">Test data: {testData}</p>
      <Button 
        onClick={() => setCurrentView('test')}
        className="mr-2"
      >
        Change View
      </Button>
      <Button 
        onClick={() => setTestData('Updated!')}
        variant="outline"
      >
        Update Data
      </Button>
    </div>
  )
}

export default AppTest