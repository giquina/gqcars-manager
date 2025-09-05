import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, Mail, CheckCircle, CreditCard, FileText } from "@phosphor-icons/react"
import { toast } from 'sonner'
import { CompanyAccount } from '../../types'

interface CorporateBillingSectionProps {
  companyAccount: CompanyAccount
  onViewInvoices?: () => void
  onContactBilling?: () => void
}

export const CorporateBillingSection: React.FC<CorporateBillingSectionProps> = ({
  companyAccount,
  onViewInvoices,
  onContactBilling
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Corporate Account</h3>
        <Badge 
          variant={companyAccount.status === 'active' ? 'default' : 'secondary'}
          className={companyAccount.status === 'active' ? 'bg-green-500 text-white' : ''}
        >
          {companyAccount.status === 'active' ? (
            <>
              <CheckCircle size={12} className="mr-1" />
              Active
            </>
          ) : (
            'Inactive'
          )}
        </Badge>
      </div>

      {/* Company Information Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building size={24} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-blue-900 mb-2">{companyAccount.name}</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-700">
                  <Mail size={16} />
                  <span className="text-sm">{companyAccount.billingEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <CreditCard size={16} />
                  <span className="text-sm">Centralized billing enabled</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Features */}
      <div className="grid grid-cols-1 gap-3">
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-primary" />
                </div>
                <div>
                  <h5 className="font-semibold">Billing & Invoices</h5>
                  <p className="text-sm text-muted-foreground">View company invoices and billing history</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  if (onViewInvoices) {
                    onViewInvoices()
                  } else {
                    toast.info("Invoice history coming soon")
                  }
                }}
              >
                View →
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center">
                  <Mail size={20} className="text-secondary-foreground" />
                </div>
                <div>
                  <h5 className="font-semibold">Billing Support</h5>
                  <p className="text-sm text-muted-foreground">Contact our billing team for assistance</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  if (onContactBilling) {
                    onContactBilling()
                  } else {
                    toast.info("Opening support chat...")
                  }
                }}
              >
                Contact →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Benefits */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <h5 className="font-semibold text-green-800 mb-3">Corporate Account Benefits</h5>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle size={16} />
              <span className="text-sm">Centralized billing and invoicing</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle size={16} />
              <span className="text-sm">Monthly usage reports</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle size={16} />
              <span className="text-sm">Priority customer support</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle size={16} />
              <span className="text-sm">Volume discounts available</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Status Info */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Building size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-blue-800 mb-1">Account Information</h5>
              <p className="text-sm text-blue-700 leading-relaxed">
                Your rides are automatically charged to the company account. All receipts and billing 
                information are sent to the billing administrator at {companyAccount.billingEmail}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}