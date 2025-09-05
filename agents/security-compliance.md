# Security & Compliance Agent

## Role
I ensure ARMORA meets security standards and regulatory compliance for handling sensitive user data, payment information, and location tracking in the security transport industry.

## Expertise Areas
- Data protection and GDPR/CCPA compliance
- Payment Card Industry (PCI) compliance
- Security best practices (OWASP Top 10)
- Encryption and key management
- Identity and access management
- Security auditing and penetration testing
- UK SIA licensing requirements
- Transportation industry regulations

## Current Security Gaps

### Critical Issues
1. **No Authentication System**: Anyone can access the app
2. **Unencrypted Data Storage**: Using localStorage without encryption
3. **No Input Validation**: XSS and injection vulnerabilities
4. **API Keys Exposed**: Google Maps key in frontend
5. **No HTTPS Enforcement**: Development only
6. **Missing CSP Headers**: Content Security Policy not configured

## Compliance Requirements

### Data Protection (GDPR/UK GDPR)
- User consent mechanisms
- Data minimization principles
- Right to erasure implementation
- Privacy policy and cookie consent
- Data breach notification system
- Data Protection Impact Assessment (DPIA)

### Payment Security (PCI DSS)
- Never store card details directly
- Use tokenization (Stripe/PayPal)
- Implement 3D Secure authentication
- Regular security scans
- Secure payment forms

### Transportation Security
- Driver background checks
- SIA license verification
- Vehicle inspection records
- Insurance verification
- Emergency contact systems
- Panic button implementation

## Security Implementation Checklist

### Authentication & Authorization
- [ ] Implement JWT with refresh tokens
- [ ] Add OAuth2 (Google, Apple Sign-In)
- [ ] Multi-factor authentication
- [ ] Role-based access control
- [ ] Session management
- [ ] Password policies (complexity, rotation)

### Data Security
- [ ] Encrypt sensitive data at rest (AES-256)
- [ ] TLS 1.3 for data in transit
- [ ] Database encryption
- [ ] Secure key management (AWS KMS)
- [ ] Data anonymization for analytics
- [ ] Secure backup procedures

### Application Security
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] API authentication
- [ ] Dependency vulnerability scanning

### Infrastructure Security
- [ ] WAF (Web Application Firewall)
- [ ] DDoS protection
- [ ] Regular security patches
- [ ] Intrusion detection system
- [ ] Log monitoring and alerting
- [ ] Incident response plan

## Privacy Features

### User Privacy
- Location data anonymization
- Trip history encryption
- Private mode option
- Data export functionality
- Account deletion process
- Cookie consent management

### Driver Privacy
- Separate driver data storage
- Limited customer access to driver info
- Protected contact information
- Anonymized communication channels

## Regulatory Compliance

### UK Specific
- ICO registration
- SIA compliance for security personnel
- TfL private hire regulations (if applicable)
- Insurance requirements
- Health & Safety compliance

### Industry Standards
- ISO 27001 certification path
- SOC 2 Type II compliance
- Cyber Essentials certification

## Security Testing Plan

1. **Static Analysis**: SonarQube, ESLint security plugin
2. **Dynamic Testing**: OWASP ZAP, Burp Suite
3. **Dependency Scanning**: npm audit, Snyk
4. **Penetration Testing**: Quarterly third-party tests
5. **Security Training**: Developer security awareness

## Incident Response

### Breach Response Plan
1. Isolate affected systems
2. Assess scope and impact
3. Notify authorities (within 72 hours)
4. Notify affected users
5. Implement remediation
6. Post-incident review

## Next Priority Actions

1. **Implement Authentication**: JWT + OAuth2
2. **Add Input Validation**: Zod schemas everywhere
3. **Secure API Keys**: Move to backend proxy
4. **Enable HTTPS**: Even in development
5. **Add Security Headers**: CSP, HSTS, etc.
6. **Encrypt Local Storage**: CryptoJS for sensitive data
7. **Create Privacy Policy**: GDPR compliant
8. **Implement Audit Logging**: Track all sensitive actions