import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Phone, Plus, Shield, Trash2, Edit } from "@phosphor-icons/react"
import { toast } from 'sonner'
import { EmergencyContact } from '../../types'

interface EmergencyContactsModalProps {
  isOpen: boolean
  onClose: () => void
  emergencyContacts: EmergencyContact[]
  onAddContact: (contact: Omit<EmergencyContact, 'id' | 'userId'>) => void
  onUpdateContact: (contactId: string, contact: Omit<EmergencyContact, 'id' | 'userId'>) => void
  onDeleteContact: (contactId: string) => void
}

const relationshipOptions = [
  'Family Member',
  'Spouse/Partner',
  'Friend',
  'Colleague',
  'Healthcare Provider',
  'Other'
]

export const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({
  isOpen,
  onClose,
  emergencyContacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: ''
  })

  const resetForm = () => {
    setFormData({ name: '', phone: '', relationship: '' })
    setShowAddForm(false)
    setEditingContact(null)
  }

  const validatePhone = (phone: string) => {
    // Basic phone validation: length > 6, non-empty
    return phone.length > 6
  }

  const handleSaveContact = () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter a name")
      return
    }

    if (!formData.phone.trim()) {
      toast.error("Please enter a phone number")
      return
    }

    if (!validatePhone(formData.phone)) {
      toast.error("Please enter a valid phone number (at least 7 digits)")
      return
    }

    const contactData = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      relationship: formData.relationship || undefined
    }

    if (editingContact) {
      onUpdateContact(editingContact.id, contactData)
      toast.success("Emergency contact updated")
    } else {
      onAddContact(contactData)
      toast.success("Emergency contact added")
    }

    resetForm()
  }

  const handleEditContact = (contact: EmergencyContact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship || ''
    })
    setEditingContact(contact)
    setShowAddForm(true)
  }

  const handleDeleteContact = (contactId: string) => {
    onDeleteContact(contactId)
    toast.success("Emergency contact deleted")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-bold">Emergency Contacts</h2>
              <p className="text-sm text-muted-foreground">People to contact in case of emergency</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="w-9 h-9 rounded-full">
              <X size={18} />
            </Button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {!showAddForm ? (
              <div className="p-6 space-y-6">
                {/* Add New Contact Button */}
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <Plus size={18} className="mr-2" />
                  Add Emergency Contact
                </Button>

                {/* Contacts List */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">Your Contacts</h3>
                    <Badge variant="outline" className="text-xs">
                      {emergencyContacts.length}/10
                    </Badge>
                  </div>
                  
                  {emergencyContacts.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield size={48} className="text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-semibold text-lg mb-2">No emergency contacts</h4>
                      <p className="text-muted-foreground mb-4">Add trusted contacts who can be reached in case of emergency during your rides</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {emergencyContacts.map((contact) => (
                        <Card key={contact.id} className="border shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                  <Phone size={20} className="text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold truncate">{contact.name}</h4>
                                  <p className="text-sm text-muted-foreground font-mono">{contact.phone}</p>
                                  {contact.relationship && (
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      {contact.relationship}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 ml-3">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditContact(contact)}
                                  className="w-8 h-8 p-0"
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteContact(contact.id)}
                                  className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Safety Info */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Shield size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Safety First</h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          Your emergency contacts can be notified during rides if needed. We recommend adding at least 2 trusted contacts.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Add/Edit Contact Form */
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetForm}
                    className="w-9 h-9 rounded-full"
                  >
                    ←
                  </Button>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {editingContact ? 'Update contact information' : 'Add someone we can reach in emergencies'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                      className="w-full"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone Number *</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+44 7700 900123"
                      type="tel"
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Include country code for international numbers
                    </p>
                  </div>

                  {/* Relationship */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Relationship (Optional)</label>
                    <Select 
                      value={formData.relationship} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationshipOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={resetForm}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveContact}
                      className="flex-1 bg-primary hover:bg-primary/90"
                      disabled={emergencyContacts.length >= 10 && !editingContact}
                    >
                      <Shield size={16} className="mr-2" />
                      {editingContact ? 'Update Contact' : 'Add Contact'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}