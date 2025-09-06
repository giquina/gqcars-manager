import React, { useState } from 'react'
import { Warning, Shield, Clock, MapPin, User, FileText } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Trip, Driver } from '../../types'

interface IncidentReportModalProps {
  isOpen: boolean
  onClose: () => void
  trip?: Trip
  driver?: Driver
  location?: { lat: number; lng: number }
}

type IncidentType = 'security_concern' | 'suspicious_activity' | 'vehicle_issue' | 'route_deviation' | 'communication_issue' | 'other'
type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

interface IncidentReport {
  type: IncidentType
  severity: SeverityLevel
  description: string
  location: string
  timestamp: Date
  witnesses: boolean
  policeNotified: boolean
  immediateAssistanceNeeded: boolean
}

const incidentTypes: { value: IncidentType; label: string; icon: any }[] = [
  { value: 'security_concern', label: 'Security Concern', icon: Shield },
  { value: 'suspicious_activity', label: 'Suspicious Activity', icon: Warning },
  { value: 'vehicle_issue', label: 'Vehicle Issue', icon: Warning },
  { value: 'route_deviation', label: 'Unauthorized Route Change', icon: MapPin },
  { value: 'communication_issue', label: 'Communication Problem', icon: User },
  { value: 'other', label: 'Other', icon: FileText }
]

const severityLevels: { value: SeverityLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Low - Minor concern', color: 'text-green-600' },
  { value: 'medium', label: 'Medium - Needs attention', color: 'text-yellow-600' },
  { value: 'high', label: 'High - Urgent response needed', color: 'text-orange-600' },
  { value: 'critical', label: 'Critical - Immediate emergency', color: 'text-red-600' }
]

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  isOpen,
  onClose,
  trip,
  driver,
  location
}) => {
  const [report, setReport] = useState<IncidentReport>({
    type: 'security_concern',
    severity: 'medium',
    description: '',
    location: '',
    timestamp: new Date(),
    witnesses: false,
    policeNotified: false,
    immediateAssistanceNeeded: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<'form' | 'confirmation' | 'submitted'>('form')

  const handleSubmit = async () => {
    if (!report.description.trim()) {
      toast.error('Please provide a description of the incident')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setStep('submitted')
      
      // Auto-close after showing confirmation
      setTimeout(() => {
        onClose()
        setStep('form')
        setReport({
          type: 'security_concern',
          severity: 'medium',
          description: '',
          location: '',
          timestamp: new Date(),
          witnesses: false,
          policeNotified: false,
          immediateAssistanceNeeded: false
        })
      }, 5000)

      toast.success('Incident report submitted successfully', {
        description: 'Security team has been notified and will respond accordingly'
      })

    } catch (error) {
      toast.error('Failed to submit incident report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirm = () => {
    setStep('confirmation')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {step === 'form' && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Warning className="text-red-500" size={24} />
                <h2 className="text-xl font-bold">Report Security Incident</h2>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Report any security concerns or incidents immediately
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Trip Information */}
              {trip && driver && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Trip Information</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Trip ID: {trip.id}</p>
                    <p>Driver: {driver.name}</p>
                    <p>Vehicle: {driver.vehicle}</p>
                    <p>Service: {trip.service.name}</p>
                  </div>
                </div>
              )}

              {/* Incident Type */}
              <div>
                <label className="block text-sm font-medium mb-3">Incident Type</label>
                <div className="grid grid-cols-1 gap-2">
                  {incidentTypes.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setReport(prev => ({ ...prev, type: value }))}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left
                        ${report.type === value 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon size={16} className={report.type === value ? 'text-red-500' : 'text-gray-400'} />
                      <span className="text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity Level */}
              <div>
                <label className="block text-sm font-medium mb-3">Severity Level</label>
                <div className="space-y-2">
                  {severityLevels.map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => setReport(prev => ({ ...prev, severity: value }))}
                      className={`
                        w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors text-left
                        ${report.severity === value 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <span className="text-sm">{label}</span>
                      <div className={`w-3 h-3 rounded-full ${value === 'low' ? 'bg-green-500' : value === 'medium' ? 'bg-yellow-500' : value === 'high' ? 'bg-orange-500' : 'bg-red-500'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Incident Description</label>
                <textarea
                  value={report.description}
                  onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what happened, when it occurred, and any other relevant details..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">{report.description.length}/1000 characters</p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">Location Details</label>
                <input
                  type="text"
                  value={report.location}
                  onChange={(e) => setReport(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Specific location or additional context"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Were there witnesses?</span>
                  <button
                    onClick={() => setReport(prev => ({ ...prev, witnesses: !prev.witnesses }))}
                    className={`
                      w-12 h-6 rounded-full transition-colors
                      ${report.witnesses ? 'bg-blue-500' : 'bg-gray-300'}
                    `}
                  >
                    <div className={`
                      w-5 h-5 bg-white rounded-full transition-transform
                      ${report.witnesses ? 'translate-x-6' : 'translate-x-0.5'}
                    `} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Have police been notified?</span>
                  <button
                    onClick={() => setReport(prev => ({ ...prev, policeNotified: !prev.policeNotified }))}
                    className={`
                      w-12 h-6 rounded-full transition-colors
                      ${report.policeNotified ? 'bg-blue-500' : 'bg-gray-300'}
                    `}
                  >
                    <div className={`
                      w-5 h-5 bg-white rounded-full transition-transform
                      ${report.policeNotified ? 'translate-x-6' : 'translate-x-0.5'}
                    `} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Do you need immediate assistance?</span>
                  <button
                    onClick={() => setReport(prev => ({ ...prev, immediateAssistanceNeeded: !prev.immediateAssistanceNeeded }))}
                    className={`
                      w-12 h-6 rounded-full transition-colors
                      ${report.immediateAssistanceNeeded ? 'bg-red-500' : 'bg-gray-300'}
                    `}
                  >
                    <div className={`
                      w-5 h-5 bg-white rounded-full transition-transform
                      ${report.immediateAssistanceNeeded ? 'translate-x-6' : 'translate-x-0.5'}
                    `} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Review & Submit
              </button>
            </div>
          </>
        )}

        {step === 'confirmation' && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Shield className="text-red-500" size={24} />
                <h2 className="text-xl font-bold">Confirm Incident Report</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Report Summary</h3>
                <div className="space-y-2 text-sm text-red-700">
                  <p><strong>Type:</strong> {incidentTypes.find(t => t.value === report.type)?.label}</p>
                  <p><strong>Severity:</strong> {severityLevels.find(s => s.value === report.severity)?.label}</p>
                  <p><strong>Time:</strong> {report.timestamp.toLocaleString()}</p>
                  {report.location && <p><strong>Location:</strong> {report.location}</p>}
                  <p><strong>Description:</strong> {report.description}</p>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-amber-800 text-sm">
                  <strong>What happens next:</strong> Your report will be immediately sent to our security operations center. 
                  {report.immediateAssistanceNeeded && ' Emergency response team will be dispatched to your location.'}
                  {report.severity === 'critical' && ' This has been marked as critical priority.'}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </>
        )}

        {step === 'submitted' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-green-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Report Submitted Successfully</h3>
            <p className="text-gray-600 mb-4">
              Your incident report has been received and our security team has been notified.
            </p>
            <div className="bg-green-50 p-4 rounded-lg text-left">
              <p className="text-green-800 text-sm">
                <strong>Report ID:</strong> INC-{Date.now().toString().slice(-6)}<br/>
                <strong>Status:</strong> Under Investigation<br/>
                <strong>Priority:</strong> {severityLevels.find(s => s.value === report.severity)?.label}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}