# Payment Processing Specialist Agent

## Role
I handle all aspects of payment integration, pricing strategies, financial compliance, and transaction management for ARMORA's premium security transport services.

## Expertise Areas
- Payment gateway integration (Stripe, PayPal, Square)
- PCI DSS compliance
- Pricing models and surge pricing
- Subscription and reservation systems
- Refund and dispute handling
- Multi-currency support
- Financial reporting and reconciliation
- Fraud detection and prevention

## Current Payment Architecture Analysis

### Current State
- Simulated payment flow only
- No real payment processing
- £50 reservation + £25 cancellation fee defined
- Service pricing ranges established
- No backend payment infrastructure

## Payment Integration Strategy

### Recommended Stack
```
Primary: Stripe
- Payment Intents API for reservations
- Connect for driver payouts
- Radar for fraud detection
- Billing for corporate accounts

Secondary: PayPal
- Express checkout option
- International payments

Mobile Wallets:
- Apple Pay
- Google Pay
- Samsung Pay
```

### Payment Flow Architecture

```mermaid
1. Customer books ride
↓
2. Create payment intent (£50 hold)
↓
3. Authorize card (not captured)
↓
4. Trip completion
↓
5. Calculate final fare
↓
6. Capture payment
↓
7. Driver payout (minus commission)
```

## Pricing Model

### Base Pricing Structure
```javascript
const pricingModel = {
  services: {
    standard: {
      base: 45,
      perMile: 2.50,
      perMinute: 0.75,
      minimum: 45,
      maximum: 75
    },
    shadowEscort: {
      base: 150,
      perMile: 5.00,
      perMinute: 2.50,
      minimum: 150,
      maximum: 350
    },
    executiveProtection: {
      base: 120,
      perMile: 4.00,
      perMinute: 2.00,
      minimum: 120,
      maximum: 250
    },
    ultraLuxury: {
      base: 180,
      perMile: 6.00,
      perMinute: 3.00,
      minimum: 180,
      maximum: 450
    }
  },
  
  surgeMultipliers: {
    low: 1.0,
    medium: 1.5,
    high: 2.0,
    extreme: 2.5
  },
  
  timeBasedPricing: {
    peakHours: 1.3,      // 7-9am, 5-7pm
    lateNight: 1.5,      // 12am-5am
    weekend: 1.2,        // Sat-Sun
    holiday: 1.8         // Bank holidays
  }
};
```

### Commission Structure
```javascript
const commissionModel = {
  armora: 0.20,          // 20% platform fee
  driver: 0.80,          // 80% to driver
  processingFee: 0.029,  // 2.9% + 30p Stripe fee
  
  bonuses: {
    highRating: 0.05,    // 5% bonus for 4.8+ rating
    loyalty: 0.03,       // 3% for 100+ trips
    premium: 0.07        // 7% for executive protection
  }
};
```

## Implementation Requirements

### Stripe Integration

#### Backend Setup
```javascript
// Payment Intent Creation
app.post('/api/payments/create-intent', async (req, res) => {
  const { amount, currency, customerId } = req.body;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to pence
    currency: 'gbp',
    customer: customerId,
    capture_method: 'manual', // Don't capture immediately
    metadata: {
      bookingId: req.body.bookingId,
      serviceType: req.body.serviceType
    }
  });
  
  res.json({ clientSecret: paymentIntent.client_secret });
});

// Capture after trip
app.post('/api/payments/capture', async (req, res) => {
  const { paymentIntentId, finalAmount } = req.body;
  
  const intent = await stripe.paymentIntents.capture(
    paymentIntentId,
    { amount_to_capture: finalAmount * 100 }
  );
  
  res.json({ status: intent.status });
});
```

#### Frontend Integration
```javascript
// Payment form component
import { Elements, CardElement, useStripe } from '@stripe/react-stripe-js';

const PaymentForm = () => {
  const stripe = useStripe();
  
  const handlePayment = async () => {
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: { name, email }
        }
      }
    );
  };
};
```

### Payment Security

#### PCI Compliance Checklist
- [ ] Never store card numbers
- [ ] Use Stripe Elements for card input
- [ ] Implement 3D Secure (SCA)
- [ ] Tokenize all card data
- [ ] Regular security scans
- [ ] SSL/TLS encryption
- [ ] Limit payment data access
- [ ] Audit logs for transactions

#### Fraud Prevention
```javascript
const fraudChecks = {
  velocity: {
    maxTransactionsPerHour: 5,
    maxAmountPerDay: 1000,
    unusualLocationFlag: true
  },
  
  verification: {
    requireCVV: true,
    addressVerification: true,
    require3DS: amount > 100
  },
  
  riskScoring: {
    useStripeRadar: true,
    blockHighRisk: true,
    manualReviewThreshold: 0.7
  }
};
```

### Refund & Dispute Handling

#### Refund Policy
```javascript
const refundPolicy = {
  cancellation: {
    moreThan24Hours: 1.00,      // 100% refund
    between6And24Hours: 0.50,    // 50% refund
    lessThan6Hours: 0.00,        // No refund
    noShow: -25.00               // £25 penalty
  },
  
  serviceIssues: {
    driverNoShow: 1.00,         // 100% + credit
    significantDelay: 0.50,      // 50% refund
    serviceComplaint: 'manual'   // Case by case
  }
};
```

### Corporate Accounts

#### Billing Features
- Monthly invoicing
- Department cost centers
- Spending limits
- Detailed reporting
- VAT invoices
- Purchase orders

#### Implementation
```javascript
const corporateAccount = {
  billing: 'monthly',
  paymentTerms: 30, // days
  creditLimit: 10000,
  approvalWorkflow: true,
  consolidatedInvoicing: true,
  vatRegistered: true
};
```

## Financial Reporting

### Required Reports
1. Daily transaction summary
2. Driver payout reports
3. Tax reports (VAT)
4. Refund and dispute tracking
5. Revenue by service type
6. Commission breakdowns
7. Currency conversion reports

### KPIs to Track
- Average transaction value
- Payment success rate
- Refund rate
- Dispute rate
- Payment method distribution
- Time to payout
- Processing costs

## Regulatory Compliance

### UK Financial Regulations
- FCA registration (if applicable)
- Anti-money laundering (AML)
- Know Your Customer (KYC)
- VAT registration and filing
- Corporation tax

### International Considerations
- Multi-currency support
- Cross-border fees
- Tax implications
- Local payment methods

## Testing Strategy

### Test Scenarios
1. Successful payment flow
2. Insufficient funds
3. Card declined
4. 3D Secure challenge
5. Refund processing
6. Partial captures
7. Currency conversion
8. Subscription billing

### Test Cards (Stripe)
```
Success: 4242 4242 4242 4242
Requires auth: 4000 0025 0000 3155
Declined: 4000 0000 0000 9995
Insufficient funds: 4000 0000 0000 9995
```

## Implementation Roadmap

### Phase 1 (Week 1-2)
1. Stripe account setup
2. Basic payment intent API
3. Card payment form
4. Payment confirmation flow

### Phase 2 (Week 3-4)
1. Reservation system
2. Manual capture flow
3. Refund functionality
4. Basic reporting

### Phase 3 (Week 5-6)
1. Apple/Google Pay
2. Corporate accounts
3. Subscription billing
4. Advanced fraud detection

### Phase 4 (Week 7-8)
1. Driver payouts
2. Financial reporting
3. Tax calculations
4. Dispute management

## Next Critical Steps

1. Create Stripe account and get API keys
2. Implement payment intent backend
3. Add Stripe Elements to frontend
4. Create payment database schema
5. Implement reservation flow
6. Add refund functionality
7. Set up webhook handlers
8. Create financial dashboard