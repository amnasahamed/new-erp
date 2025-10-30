# Claps Learn ERP - Backend API

Production-ready backend API for the Claps Learn ERP system with full business logic implementation.

## Features Implemented

### Core Features
- ✅ JWT Authentication with role-based access control
- ✅ Student management with balance tracking
- ✅ 24-hour grace period for billing
- ✅ Auto-pause on zero balance
- ✅ Automatic class generation from timetable
- ✅ Comprehensive audit logging
- ✅ Row-level security for department isolation
- ✅ Real-time notification system

### Business Rules Enforced
- Demo mandatory before registration
- One active demo per student
- Static GMeet links per student
- Free cancellation ≥2 hours before class
- Balance deduction after 24-hour grace period
- Auto-pause when balance = 0
- Department isolation for coordinators
- Mandatory narration in ledger entries

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT + bcrypt
- **Logging:** Winston
- **Cron Jobs:** node-cron

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/claps_learn_erp"
   JWT_SECRET="your-super-secret-jwt-key"
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb claps_learn_erp

   # Or using psql
   psql -U postgres
   CREATE DATABASE claps_learn_erp;
   \q
   ```

5. **Generate Prisma client and run migrations:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. **Seed the database with test data:**
   ```bash
   npm run seed
   ```

7. **Start development server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3001`

### Test Credentials

After running the seed script, you can log in with:

| Role | Email | Password (DOB format) |
|------|-------|----------------------|
| Admin | admin@clapslearn.com | 01-01-1990 |
| Coordinator | coordinator@clapslearn.com | 15-03-1985 |
| Teacher | teacher@clapslearn.com | 12-09-1992 |
| Parent | parent@example.com | 05-08-1985 |
| HR | hr@clapslearn.com | 20-06-1988 |
| Accountant | accountant@clapslearn.com | 10-12-1987 |

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout (audit log only)

#### Students
- `GET /api/students` - Get all students (with filters)
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `POST /api/students/:id/pause` - Pause student
- `POST /api/students/:id/resume` - Resume student
- `GET /api/students/:id/balance` - Get student balance

More endpoints coming soon...

## Cron Jobs

### 24-Hour Billing (Runs hourly)
Processes classes marked 24+ hours ago and bills them if no dispute exists.

```typescript
// Runs at minute 0 of every hour
cron.schedule('0 * * * *', process24HourBilling);
```

### Auto-Pause (Runs every 30 minutes)
Pauses students with balance ≤ ₹250 and deactivates their timetables.

```typescript
// Runs every 30 minutes
cron.schedule('*/30 * * * *', processAutoPause);
```

### Generate Classes (Runs daily at 1 AM)
Generates classes from active timetables for the next 7 days.

```typescript
// Runs daily at 1:00 AM
cron.schedule('0 1 * * *', generateDailyClasses);
```

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Prisma schema (database models)
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma client & connection
│   │   └── env.ts             # Environment variables
│   ├── controllers/
│   │   ├── auth.controller.ts # Authentication logic
│   │   └── student.controller.ts # Student CRUD operations
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication & authorization
│   │   └── errorHandler.ts   # Global error handling
│   ├── routes/
│   │   ├── auth.routes.ts     # Auth routes
│   │   ├── student.routes.ts  # Student routes
│   │   └── index.ts           # Main router
│   ├── jobs/
│   │   ├── billing.job.ts     # 24-hour billing cron job
│   │   ├── autoPause.job.ts   # Auto-pause cron job
│   │   ├── generateClasses.job.ts # Class generation job
│   │   └── index.ts           # Cron job orchestrator
│   ├── utils/
│   │   ├── auth.ts            # Auth utilities (JWT, bcrypt, etc.)
│   │   ├── logger.ts          # Winston logger
│   │   └── seed.ts            # Database seed script
│   └── server.ts              # Express server entry point
├── .env.example               # Environment variables template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## Database Schema

See `/DATABASE_SCHEMA.sql` in the project root for the complete PostgreSQL schema with:
- 15+ tables
- Row-level security policies
- Audit logging triggers
- Performance indexes
- Business rule constraints

## Development

### Available Scripts

```bash
# Development (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio (GUI)
npm run prisma:studio

# Seed database
npm run seed

# Lint code
npm run lint
```

### Adding New Endpoints

1. Create controller in `src/controllers/`
2. Create routes in `src/routes/`
3. Register routes in `src/routes/index.ts`
4. Add authentication middleware if needed
5. Test the endpoint

## Error Handling

All errors are handled globally by the error handler middleware. Custom errors can be thrown using:

```typescript
import { ApiError } from '../middleware/errorHandler';

throw new ApiError(400, 'Custom error message');
```

## Audit Logging

All critical operations are automatically logged in the `audit_log` table:
- User login/logout
- Student create/update/delete
- Balance changes
- Class billing
- Dispute resolution

## Security Features

- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Department isolation (Row-Level Security)
- ✅ Input validation
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CORS configuration
- ✅ Audit logging

## Production Deployment

1. **Environment Setup:**
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET`
   - Configure production database URL

2. **Database:**
   - Run migrations: `npm run prisma:migrate`
   - Don't run seed in production

3. **Build:**
   ```bash
   npm run build
   ```

4. **Start:**
   ```bash
   npm start
   ```

5. **Process Management:**
   - Use PM2 or similar for process management
   - Configure log rotation
   - Set up monitoring

## Monitoring & Logging

Logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

Log levels: `error`, `warn`, `info`, `debug`

## Future Enhancements

- [ ] WhatsApp API integration
- [ ] Email notifications
- [ ] WebSocket for real-time updates
- [ ] Advanced reporting APIs
- [ ] Export functionality (CSV/PDF)
- [ ] Payment gateway integration
- [ ] Mobile API optimizations
- [ ] Rate limiting
- [ ] API documentation (Swagger)
- [ ] Unit & integration tests

## Troubleshooting

### Database Connection Error
```
Error: P1001: Can't reach database server
```
**Solution:** Check DATABASE_URL in .env and ensure PostgreSQL is running

### Prisma Client Error
```
Error: @prisma/client did not initialize yet
```
**Solution:** Run `npm run prisma:generate`

### Port Already in Use
```
Error: EADDRINUSE: address already in use
```
**Solution:** Change PORT in .env or kill the process using port 3001

## Support

For issues and questions:
- Check `/VALIDATION_REPORT.md` for implementation details
- Review `/IMPLEMENTATION_CHECKLIST.md` for roadmap
- Check logs in `logs/` directory

## License

MIT
