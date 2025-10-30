# ERP Implementation Checklist

This checklist tracks the implementation of the Claps Learn ERP system based on the Builder Validation Checklist.

---

## Phase 1: Backend Foundation (Estimated: 4-6 weeks)

### Database Setup
- [ ] Install PostgreSQL database
- [ ] Run `DATABASE_SCHEMA.sql` to create tables
- [ ] Set up database migrations tool (e.g., Prisma, TypeORM, or Knex)
- [ ] Create seed data for testing
- [ ] Configure database connection pool
- [ ] Set up database backups (8-year retention for financial data)

### API Foundation
- [ ] Set up Express.js (or NestJS) backend
- [ ] Configure TypeScript for backend
- [ ] Set up environment variables (.env)
- [ ] Configure CORS for Next.js frontend
- [ ] Set up API error handling middleware
- [ ] Configure request validation (using Zod or Joi)
- [ ] Set up logging (Winston or Pino)

### Authentication & Authorization
- [ ] Implement JWT authentication
- [ ] Hash passwords using bcrypt
- [ ] Implement DOB password validation (DD-MM-YYYY format)
- [ ] Create authentication middleware
- [ ] Implement role-based authorization middleware
- [ ] Set up session management
- [ ] Implement token refresh mechanism
- [ ] Add logout functionality

---

## Phase 2: Core Business Logic (Estimated: 6-8 weeks)

### 1. Demo Management
- [ ] API: Create demo request
- [ ] API: Assign teacher to demo
- [ ] API: Assign GMeet link to demo
- [ ] API: Record demo outcome (converted/not_interested/follow_up)
- [ ] Business Logic: Prevent multiple active demos per student
- [ ] Business Logic: If converted, create student record
- [ ] Business Logic: Assign same teacher for first class
- [ ] Notification: Send demo confirmation to parent
- [ ] Notification: Send demo assignment to teacher

### 2. Student Registration & Onboarding
- [ ] API: Create student after demo conversion
- [ ] API: Assign static GMeet link to student
- [ ] Business Logic: Block registration without converted demo
- [ ] API: Set up initial timetable
- [ ] Notification: Send welcome message to parent
- [ ] Notification: Send first class details

### 3. Timetable Management
- [ ] API: Create recurring timetable entry
- [ ] API: Create one-time timetable entry
- [ ] API: Update timetable
- [ ] API: Pause timetable
- [ ] API: Resume timetable
- [ ] API: Delete timetable
- [ ] Business Logic: Prevent time conflicts for same student
- [ ] Business Logic: Check teacher availability
- [ ] Business Logic: Validate student balance before scheduling

### 4. Class Management
- [ ] API: Generate classes from timetable (daily cron job)
- [ ] API: Get upcoming classes
- [ ] API: Cancel class (with ≥2h validation)
- [ ] API: Join class (update teacher/student joined status)
- [ ] Business Logic: Free cancellation only if ≥2h before start
- [ ] Business Logic: Notify teacher on cancellation
- [ ] Notification: Reminder 1 hour before class
- [ ] Notification: Parent notification on cancellation

### 5. Attendance & Billing
- [ ] API: Mark attendance
- [ ] API: Update topic and homework
- [ ] Business Logic: Set billing_status = 'pending' on mark
- [ ] Business Logic: Set marked_at timestamp
- [ ] Cron Job: Check classes marked 24+ hours ago
- [ ] Cron Job: Deduct balance if no dispute
- [ ] Cron Job: Update billing_status to 'billed'
- [ ] Business Logic: Update student balance and hours
- [ ] Business Logic: Create ledger entry on deduction
- [ ] Notification: Send attendance confirmation to parent

### 6. Balance Management
- [ ] API: Add payment/recharge
- [ ] API: Get student balance
- [ ] API: Calculate hours from amount
- [ ] Business Logic: Update balance and hours
- [ ] Business Logic: Create ledger entry for payment
- [ ] Business Logic: Auto-pause when balance = 0
- [ ] Business Logic: Low balance alert (< 2 hours)
- [ ] Notification: Low balance warning
- [ ] Notification: Auto-pause notification

### 7. Dispute Management
- [ ] API: Raise dispute
- [ ] API: Get disputes (parent view)
- [ ] API: Get disputes (coordinator view)
- [ ] API: Add teacher response
- [ ] API: Resolve dispute
- [ ] Business Logic: Pause billing on dispute
- [ ] Business Logic: Calculate final adjustment
- [ ] Business Logic: Credit balance if already billed
- [ ] Business Logic: Create ledger entry for adjustment
- [ ] Notification: Alert coordinator on new dispute
- [ ] Notification: Alert teacher on new dispute
- [ ] Notification: Alert parent on resolution

### 8. Ledger & Payments
- [ ] API: Create ledger entry
- [ ] API: Get ledger entries (filtered)
- [ ] API: Export ledger (CSV/PDF)
- [ ] Business Logic: Validate narration is provided
- [ ] Business Logic: Calculate running balance
- [ ] Business Logic: Track payment origin

### 9. Teacher Management
- [ ] API: Create teacher profile
- [ ] API: Update teacher availability
- [ ] API: Get teacher schedule
- [ ] API: Calculate salary preview
- [ ] Business Logic: Update conversion ratio
- [ ] Business Logic: Update average rating

### 10. Salary Processing
- [ ] API: Calculate monthly salary
- [ ] API: Generate salary sheet
- [ ] API: Export salary sheet (CSV/PDF)
- [ ] Business Logic: Calculate hours taught
- [ ] Business Logic: Apply GST (18%)
- [ ] Business Logic: Deduct dispute adjustments
- [ ] API: Mark salary as paid

---

## Phase 3: Notifications & Integrations (Estimated: 4-6 weeks)

### Notification Service
- [ ] Set up notification service architecture
- [ ] Create notification queue (using Redis or RabbitMQ)
- [ ] Implement notification worker
- [ ] API: Send notification
- [ ] API: Mark notification as read
- [ ] API: Get user notifications

### WhatsApp Integration
- [ ] Choose WhatsApp Business API provider (Twilio, MessageBird, etc.)
- [ ] Set up API credentials
- [ ] Create WhatsApp message templates
- [ ] Implement send WhatsApp message function
- [ ] Track WhatsApp delivery status
- [ ] Handle WhatsApp failures

### Email Notifications
- [ ] Set up email service (SendGrid, AWS SES, etc.)
- [ ] Create email templates
- [ ] Implement send email function
- [ ] Track email delivery

### In-App Notifications
- [ ] Implement notification polling/WebSocket
- [ ] Create notification badge component
- [ ] Create notification center UI
- [ ] Implement real-time updates

---

## Phase 4: Compliance & Reporting (Estimated: 3-4 weeks)

### Audit Logging
- [ ] Verify audit triggers are working
- [ ] Create audit log viewer (admin only)
- [ ] API: Get audit logs
- [ ] API: Export audit logs
- [ ] Set up 8-year retention policy

### GST Compliance
- [ ] API: Calculate GST report
- [ ] API: Export GST report (Excel/PDF)
- [ ] Business Logic: Track GST by department
- [ ] Business Logic: Track GST payable

### Reports
- [ ] API: Daily report (low balance, first class, disputes)
- [ ] API: Monthly analytics
- [ ] API: Department summary
- [ ] API: Teacher performance report
- [ ] API: Student progress report
- [ ] Export functionality: CSV
- [ ] Export functionality: PDF
- [ ] Export functionality: Excel

### Data Protection
- [ ] Implement data encryption at rest
- [ ] Implement data encryption in transit (HTTPS)
- [ ] Create data retention policy
- [ ] Create data deletion procedure (GDPR)
- [ ] Implement user consent management

---

## Phase 5: Edge Cases & Polish (Estimated: 2-3 weeks)

### Edge Case Handling
- [ ] Handle demo no-show (teacher)
- [ ] Handle demo no-show (student)
- [ ] Handle teacher illness/emergency
- [ ] Handle student pause during active classes
- [ ] Handle payment gateway failures
- [ ] Handle network issues during class
- [ ] Handle overlapping timetable slots
- [ ] Handle teacher deletion with active students
- [ ] Handle student deletion with balance
- [ ] Handle dispute raised after 24h (refund request)
- [ ] Handle coordinator unavailable

### Error Handling
- [ ] Add error boundaries to all React components
- [ ] Implement global API error handler
- [ ] Create user-friendly error messages
- [ ] Log all errors to monitoring service
- [ ] Implement retry logic for failed operations

### Performance Optimization
- [ ] Add database indexes (already in schema)
- [ ] Implement query optimization
- [ ] Add caching (Redis)
- [ ] Implement pagination for all lists
- [ ] Add loading states
- [ ] Optimize bundle size
- [ ] Implement lazy loading

### Security
- [ ] Security audit
- [ ] Penetration testing
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Input validation on all endpoints

### Testing
- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical workflows
- [ ] Load testing
- [ ] Stress testing

---

## Phase 6: Deployment & Monitoring (Estimated: 2 weeks)

### Deployment
- [ ] Set up production database
- [ ] Set up backend hosting (AWS, DigitalOcean, etc.)
- [ ] Set up frontend hosting (Vercel, Netlify)
- [ ] Configure environment variables
- [ ] Set up SSL certificates
- [ ] Configure domain and DNS
- [ ] Set up CI/CD pipeline

### Monitoring
- [ ] Set up application monitoring (Datadog, New Relic)
- [ ] Set up error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Set up performance monitoring
- [ ] Create health check endpoints
- [ ] Set up alerting

### Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] User guide for each role
- [ ] Admin guide
- [ ] Developer documentation
- [ ] Deployment guide

---

## Current Status

### Completed ✅
- [x] Frontend UI for all 6 roles
- [x] TypeScript type definitions
- [x] Role-based routing
- [x] Mock data structure
- [x] Material-UI design system
- [x] Database schema design
- [x] Validation report

### In Progress 🟡
- [ ] Backend implementation (not started)

### Not Started ❌
- [ ] API endpoints
- [ ] Business logic enforcement
- [ ] Notification system
- [ ] WhatsApp integration
- [ ] Audit logging
- [ ] Testing
- [ ] Deployment

---

## Priority Items for MVP

### Must Have (P0)
1. Backend API setup
2. Database connection
3. Authentication (JWT)
4. Student registration after demo
5. Timetable creation
6. Attendance marking
7. Balance deduction
8. Ledger tracking

### Should Have (P1)
9. Notification service
10. WhatsApp integration
11. Dispute management
12. 24-hour grace period
13. Auto-pause on zero balance
14. Salary calculation

### Nice to Have (P2)
15. Advanced reporting
16. Export functionality
17. Real-time updates
18. Mobile app

---

## Team Recommendations

### Minimum Team Size: 2-3 Developers

**Backend Developer:**
- Set up database and API
- Implement business logic
- Handle notifications and integrations
- 15-20 weeks of work

**Frontend Developer:**
- Connect frontend to API
- Implement real-time updates
- Add error handling and loading states
- 10-15 weeks of work

**Full-Stack Developer (Optional):**
- Help with integration
- Write tests
- Set up deployment
- 5-10 weeks of work

### Estimated Timeline: 5-6 months to production-ready system
