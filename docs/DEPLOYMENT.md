# DEPLOYMENT.md - ARMORA Production Deployment Guide

## Deployment Options

### 1. Vercel (Recommended for Frontend)

#### Prerequisites
- Vercel account
- GitHub repository connected

#### Steps
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# For production deployment
vercel --prod
```

#### Environment Variables
Set in Vercel Dashboard:
- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_API_URL` (when backend is ready)

### 2. Netlify

```bash
# Build the project
npm run build

# Deploy using Netlify CLI
npm i -g netlify-cli
netlify deploy --dir=dist
netlify deploy --prod --dir=dist
```

### 3. AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### 4. Traditional VPS (DigitalOcean, Linode, AWS EC2)

#### Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/your-org/armora-app.git
cd armora-app

# Install dependencies
npm install

# Build application
npm run build

# Serve with PM2
pm2 start npm --name "armora" -- run preview
pm2 save
pm2 startup
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Docker Deployment

#### Dockerfile
```dockerfile
# Build stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  armora-frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}
      - VITE_API_URL=${VITE_API_URL}
    restart: unless-stopped
```

## SSL/TLS Setup

### Using Certbot (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Using Cloudflare
1. Add domain to Cloudflare
2. Update nameservers
3. Enable "Full (strict)" SSL/TLS
4. Enable "Always Use HTTPS"

## Environment Configuration

### Production Environment Variables
```env
# Required
VITE_GOOGLE_MAPS_API_KEY=production_api_key
VITE_API_URL=https://api.armora.com
VITE_ENV=production

# Payment (when ready)
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx

# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Feature Flags
VITE_ENABLE_SANDBOX_MODE=false
```

## Pre-Deployment Checklist

### Code Quality
- [ ] Run linter: `npm run lint`
- [ ] Fix all TypeScript errors
- [ ] Remove all console.log statements
- [ ] Update API endpoints to production

### Security
- [ ] Environment variables secured
- [ ] API keys restricted by domain
- [ ] HTTPS enforced
- [ ] Content Security Policy headers
- [ ] CORS properly configured

### Performance
- [ ] Bundle size optimized (<500KB)
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Service worker for offline support

### Testing
- [ ] All features manually tested
- [ ] Cross-browser testing complete
- [ ] Mobile responsiveness verified
- [ ] Error tracking configured (Sentry)

## Monitoring & Maintenance

### Health Checks
```bash
# Add health check endpoint
curl https://your-domain.com/health
```

### Monitoring Services
- **Uptime**: UptimeRobot, Pingdom
- **Performance**: Google Lighthouse CI
- **Errors**: Sentry
- **Analytics**: Google Analytics

### Backup Strategy
```bash
# Database backups (when implemented)
pg_dump armora_db > backup_$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup_*.sql s3://armora-backups/
```

## CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - uses: vercel/action@v3
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Rollback Procedures

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Traditional Server
```bash
# Keep previous builds
pm2 stop armora
mv /var/www/armora /var/www/armora-backup
# Deploy new version
# If issues:
rm -rf /var/www/armora
mv /var/www/armora-backup /var/www/armora
pm2 start armora
```

## Scaling Considerations

### Current Limitations
- Frontend-only (no backend)
- No real payment processing
- Simulated driver system
- No database

### Future Infrastructure
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cloudflare│────▶│  Load       │────▶│  Frontend   │
│     CDN     │     │  Balancer   │     │  Servers    │
└─────────────┘     └─────────────┘     └─────────────┘
                            │
                    ┌───────▼────────┐
                    │   API Gateway   │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐ ┌────────▼────────┐ ┌───────▼────────┐
│  Auth Service  │ │ Booking Service │ │ Driver Service │
└────────────────┘ └─────────────────┘ └────────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────▼────────┐
                    │   PostgreSQL   │
                    │     Redis       │
                    └────────────────┘
```

## Support & Troubleshooting

### Common Issues

#### Google Maps not loading
- Check API key restrictions
- Verify billing enabled
- Check browser console for errors

#### Build failures
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

#### Performance issues
- Enable gzip compression
- Implement CDN
- Optimize bundle size

### Contact
- Technical issues: tech@armora.com
- Deployment support: devops@armora.com

## Post-Deployment

### Verification Steps
1. Test all user flows
2. Verify payment processing (when enabled)
3. Check mobile responsiveness
4. Test error handling
5. Verify analytics tracking
6. Monitor performance metrics

### First Week Monitoring
- Check error rates daily
- Monitor server resources
- Review user feedback
- Track key metrics (bookings, conversions)
- Adjust scaling as needed