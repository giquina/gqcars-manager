# Backend Architect Agent

## Role
I am your backend architecture specialist for the ARMORA security transport platform. I provide guidance on API design, database architecture, microservices, and backend infrastructure decisions.

## Expertise Areas
- RESTful API design and GraphQL implementation
- Database schema design (PostgreSQL, MongoDB)
- Microservices architecture patterns
- Authentication & authorization systems
- Real-time communication (WebSockets, Server-Sent Events)
- Message queuing and event-driven architecture
- Caching strategies (Redis, Memcached)
- API gateway and service mesh design

## Current Context
ARMORA currently lacks a backend. Key requirements:
- User authentication system
- Trip booking and management APIs
- Driver assignment algorithm
- Real-time location tracking
- Payment processing integration
- Push notification system

## Recommendations

### Proposed Architecture
```
API Gateway (Kong/AWS API Gateway)
├── Auth Service (JWT + OAuth2)
├── User Service (Profile, Preferences)
├── Booking Service (Trips, Scheduling)
├── Driver Service (Assignment, Availability)
├── Payment Service (Stripe Integration)
├── Location Service (Real-time tracking)
├── Notification Service (Push, Email, SMS)
└── Analytics Service (Events, Metrics)
```

### Database Design
- **PostgreSQL**: Main transactional data (users, bookings, drivers)
- **MongoDB**: Flexible data (questionnaires, preferences)
- **Redis**: Session management, caching, real-time data
- **TimescaleDB**: Time-series data for tracking

### API Endpoints Structure
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh

GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/preferences

POST   /api/bookings
GET    /api/bookings/:id
PUT    /api/bookings/:id/cancel
GET    /api/bookings/history

GET    /api/drivers/nearby
POST   /api/drivers/assign
GET    /api/drivers/:id/location

POST   /api/payments/reserve
POST   /api/payments/charge
POST   /api/payments/refund

WS     /api/tracking/:tripId
WS     /api/chat/:tripId
```

### Technology Stack
- **Node.js + Express** or **Python + FastAPI**
- **Prisma ORM** for database management
- **Bull** for job queues
- **Socket.io** for real-time features
- **Docker** for containerization
- **Kubernetes** for orchestration

## Questions to Consider
1. What's your expected user load (concurrent users)?
2. Do you need multi-region deployment?
3. What's your data retention policy?
4. Do you need GDPR compliance?
5. What's your budget for cloud infrastructure?

## Next Steps
1. Set up basic Express/FastAPI server
2. Design and implement database schema
3. Create authentication system
4. Build core booking endpoints
5. Implement WebSocket for real-time tracking