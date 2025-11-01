# Claps Learn ERP System

A comprehensive Enterprise Resource Planning system for managing educational operations, including student management, teacher coordination, class scheduling, billing, and administrative functions.

Built with Next.js 14, TypeScript, Material-UI, Redux Toolkit (Frontend) and Express.js, Prisma, PostgreSQL (Backend).

## Features

### 6 Role-Based Dashboards

1. **Admin Dashboard**
   - Daily cross-check (low balance students, pending tasks)
   - Live class monitoring with auto-refresh
   - Department-wise summaries
   - System alerts and notifications
   - Export reports (CSV/PDF)

2. **Coordinator Dashboard** (Department-Scoped)
   - Student list management with filters
   - Demo pipeline management
   - Dispute resolution queue
   - Timetable builder
   - In-app notifications

3. **Teacher Dashboard**
   - Today's class schedule with GMeet links
   - Attendance marking system
   - Salary preview (hours taught + projected income)
   - Weekly availability grid
   - Exam logging and feedback view

4. **Parent Dashboard**
   - Balance summary with recharge options
   - Upcoming classes (7-day view)
   - Recent attendance history
   - Dispute raising and tracking
   - Feedback submission

5. **HR Dashboard**
   - Teacher onboarding pipeline
   - Teacher list with filters
   - Performance metrics (ratings, conversion, complaints)
   - Availability management

6. **Accountant Dashboard**
   - Ledger overview with manual entry
   - Student balance audit
   - Salary processing with GST
   - GST compliance reports
   - Dispute adjustment tracking

## Tech Stack

**Frontend:**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit + Redux Persist
- **Data Grid**: MUI X Data Grid
- **Charts**: Recharts
- **Date Handling**: date-fns

**Backend:**
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 14
- **Authentication**: JWT with bcrypt
- **Scheduling**: node-cron
- **Logging**: Winston

**Infrastructure:**
- **Containerization**: Docker & Docker Compose

## Quick Start (Recommended)

### Prerequisites

- **Docker Desktop** (version 20.10 or higher) - [Download here](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (version 2.0 or higher) - Included with Docker Desktop
- **Git**

### One-Command Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd new-erp
   ```

2. **Run the automated setup script**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

   The setup script will automatically:
   - ✓ Check for Docker and Docker Compose prerequisites
   - ✓ Create environment configuration files
   - ✓ Generate secure JWT secret
   - ✓ Build Docker images for all services
   - ✓ Start PostgreSQL, Backend API, and Frontend
   - ✓ Run database migrations
   - ✓ Seed database with test data

3. **Access the application**:
   - **Frontend Dashboard**: http://localhost:3000
   - **Backend API**: http://localhost:3001/api
   - **Database**: PostgreSQL on localhost:5432

### Test Credentials

After setup, log in with these test accounts:

| Role | Email | Password (DOB Format) | Department |
|------|-------|----------------------|------------|
| **Admin** | admin@clapslearn.com | 01-01-1990 | All |
| **Coordinator** | coordinator@clapslearn.com | 15-03-1985 | Dept AA |
| **Teacher** | teacher@clapslearn.com | 10-05-1992 | - |
| **Parent** | parent@clapslearn.com | 20-07-1988 | - |
| **HR** | hr@clapslearn.com | 05-11-1987 | - |
| **Accountant** | accountant@clapslearn.com | 25-09-1989 | - |

**Password Format**: DD-MM-YYYY (Date of Birth)

## Manual Installation (Without Docker)

If you prefer not to use Docker:

### Backend Setup

1. **Install PostgreSQL** and create database:
   ```bash
   createdb claps_learn_erp
   ```

2. **Configure backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Run database migrations**:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run seed
   ```

4. **Start backend server**:
   ```bash
   npm run dev
   ```
   Backend runs on http://localhost:3001

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.local.example .env.local
   # Set NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
   ```

3. **Start frontend**:
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:3000

## Business Rules Enforced

The system enforces critical business rules at the backend level:

- ✓ **Demo Required**: Students cannot register without a completed, converted demo
- ✓ **One Active Demo**: Only one active demo request allowed per student at a time
- ✓ **24-Hour Grace Period**: Parents have 24 hours to raise disputes after attendance is marked
- ✓ **Automatic Billing**: Balance is deducted automatically after 24-hour grace period
- ✓ **2-Hour Cancellation**: Classes can only be cancelled at least 2 hours before start time
- ✓ **Teacher Notification**: Teachers are automatically notified of class cancellations
- ✓ **Auto-Pause**: Students are paused when balance ≤ ₹250
- ✓ **Department Isolation**: Coordinators can only access their department's data
- ✓ **HR Restrictions**: HR cannot edit student GMeet links (only coordinators)
- ✓ **Audit Compliance**: All financial transactions require narration for audit trails

## Project Structure

```
new-erp/
├── backend/                      # Backend API
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema (15 models)
│   │   └── migrations/           # Database migrations
│   ├── src/
│   │   ├── controllers/          # Business logic controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── student.controller.ts
│   │   │   ├── teacher.controller.ts
│   │   │   ├── class.controller.ts
│   │   │   ├── demo.controller.ts
│   │   │   ├── dispute.controller.ts
│   │   │   └── ledger.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT auth & RBAC
│   │   │   └── errorHandler.ts   # Global error handling
│   │   ├── routes/               # API route definitions
│   │   ├── jobs/                 # Cron jobs
│   │   │   ├── billing.job.ts    # 24-hour billing processor
│   │   │   ├── autoPause.job.ts  # Auto-pause on low balance
│   │   │   └── generateClasses.job.ts
│   │   ├── utils/                # Helpers & utilities
│   │   └── server.ts             # Express app entry
│   ├── Dockerfile                # Backend container
│   ├── .env.example              # Environment template
│   └── package.json
├── src/                          # Frontend (Next.js)
│   ├── app/                      # App router pages
│   │   ├── admin/                # Admin dashboard
│   │   ├── coordinator/          # Coordinator dashboard
│   │   ├── teacher/              # Teacher dashboard
│   │   ├── parent/               # Parent dashboard
│   │   ├── hr/                   # HR dashboard
│   │   ├── accountant/           # Accountant dashboard
│   │   └── login/                # Login page
│   ├── components/               # React components
│   │   ├── auth/                 # Auth components
│   │   ├── common/               # Shared components
│   │   └── layout/               # Layout components
│   ├── store/                    # Redux store
│   │   └── slices/               # Redux slices
│   ├── types/                    # TypeScript types
│   └── theme/                    # MUI theme
├── docker-compose.yml            # Multi-container orchestration
├── Dockerfile.frontend           # Frontend container
├── setup.sh                      # Automated setup script
├── VALIDATION_REPORT.md          # Implementation validation
├── VALIDATION_PROOF.md           # Business rules proof
└── README.md                     # This file
```

## Authentication & Security

The system uses **JWT-based authentication** with the following security features:

### Authentication Flow
1. User logs in with email and password (DOB format: DD-MM-YYYY)
2. Backend validates credentials and generates JWT token
3. Token is sent to frontend and stored securely
4. All API requests include token in Authorization header
5. Backend middleware validates token and checks permissions

### Role-Based Access Control (RBAC)

Six distinct roles with specific permissions:

- **Admin**: Full system access across all departments
- **Coordinator**: Department-specific access (can only view/edit their department)
- **Teacher**: Class management, attendance, availability, salary preview
- **Parent**: View student details, balance, classes, raise disputes
- **HR**: Teacher onboarding, performance tracking, availability management
- **Accountant**: Ledger management, payments, salary processing, reports

### Security Features
- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with configurable expiration (default: 7 days)
- Middleware authentication on all protected routes
- Department-level data isolation for coordinators
- Audit logging for all critical operations
- Row-level security ready (RLS policies in DATABASE_SCHEMA.sql)

## Key Features

### Dashboard Components

- **StatCard**: Reusable stat card component
- **StatusBadge**: Color-coded status badges
- **DashboardLayout**: Common layout with sidebar and header
- **AuthGuard**: Route protection component

### State Management

- Redux Toolkit for state management
- Redux Persist for auth state persistence
- Typed hooks for better TypeScript support

### Responsive Design

- Mobile-first design
- Responsive navigation drawer
- Adaptive tables and grids

## API Documentation

The backend provides a comprehensive REST API at `http://localhost:3001/api`:

### Authentication Endpoints
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify` - Verify credentials
- `POST /api/auth/logout` - User logout

### Student Management
- `GET /api/students` - List students (with filters: status, department, search)
- `POST /api/students` - Create student (validates demo conversion)
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/:id/pause` - Pause student (deactivates timetable)
- `POST /api/students/:id/resume` - Resume student

### Teacher Management
- `GET /api/teachers` - List teachers
- `POST /api/teachers` - Create teacher
- `GET /api/teachers/:id` - Get teacher details
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher
- `GET /api/teachers/:id/availability` - Get availability
- `POST /api/teachers/:id/availability` - Set availability

### Class Management
- `GET /api/classes` - List classes (filter by date, teacher, student, status)
- `POST /api/classes` - Create class
- `GET /api/classes/:id` - Get class details
- `PUT /api/classes/:id` - Update class
- `POST /api/classes/:id/attendance` - Mark attendance (starts 24h grace period)
- `POST /api/classes/:id/cancel` - Cancel class (validates 2-hour rule, notifies teacher)

### Demo Workflow
- `GET /api/demos` - List demo requests
- `POST /api/demos` - Create demo (enforces one-active-demo rule)
- `GET /api/demos/:id` - Get demo details
- `PUT /api/demos/:id` - Update demo
- `POST /api/demos/:id/assign` - Assign teacher to demo
- `POST /api/demos/:id/outcome` - Record outcome (updates teacher conversion ratio)

### Dispute Management
- `GET /api/disputes` - List disputes
- `POST /api/disputes` - Raise dispute (pauses billing on class)
- `GET /api/disputes/:id` - Get dispute details
- `POST /api/disputes/:id/escalate` - Escalate to admin
- `POST /api/disputes/:id/resolve` - Resolve with adjustment (credits student if approved)

### Account Ledger
- `GET /api/ledger` - Get ledger entries (filter by student, date range, type)
- `POST /api/ledger/payment` - Add payment (requires narration for audit)
- `GET /api/ledger/export` - Export to CSV/Excel

### Authentication Required
All endpoints (except `/api/auth/login` and `/api/auth/register`) require JWT token:
```
Authorization: Bearer <jwt-token>
```

### Role-Based Authorization
Endpoints check user roles and department access via middleware.

## Frontend Integration (In Progress)

The frontend currently uses mock data. To complete integration:

1. Create API client service (`src/services/api.ts`)
2. Update Redux slices to call real API endpoints
3. Replace mock data in dashboard components
4. Handle authentication tokens in Redux store
5. Add error handling and loading states

## Automated Jobs (Cron)

The backend runs three critical automated jobs:

### 1. Billing Job (Every Hour)
**File**: `backend/src/jobs/billing.job.ts`
- Processes classes where 24-hour grace period has expired
- Deducts balance from student accounts
- Creates ledger entries for billing
- Marks classes as 'billed'
- Skips classes with open disputes

### 2. Auto-Pause Job (Every 30 Minutes)
**File**: `backend/src/jobs/autoPause.job.ts`
- Finds students with balance ≤ ₹250
- Changes status to 'paused'
- Deactivates their timetable entries
- Cancels future scheduled classes
- Sends notifications to parents

### 3. Class Generation Job (Daily at 1 AM)
**File**: `backend/src/jobs/generateClasses.job.ts`
- Reads active timetable entries
- Generates class sessions for upcoming days
- Creates Class records with proper timestamps
- Links students and teachers

## Development

### Available Scripts

**Backend:**
- `cd backend && npm run dev` - Start backend in dev mode
- `cd backend && npm run build` - Build backend for production
- `cd backend && npm run prisma:studio` - Open Prisma Studio (DB GUI)
- `cd backend && npm run prisma:migrate` - Run database migrations
- `cd backend && npm run seed` - Seed database with test data

**Frontend:**
- `npm run dev` - Start Next.js development server
- `npm run build` - Build frontend for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

**Docker:**
- `docker-compose up -d` - Start all services in background
- `docker-compose down` - Stop all services
- `docker-compose logs backend` - View backend logs
- `docker-compose logs frontend` - View frontend logs
- `docker-compose exec backend npm run prisma:studio` - Open Prisma Studio

### Adding New Features

1. **Backend**: Create controller → Add routes → Update middleware if needed
2. **Frontend**: Create types → Add Redux slice → Create components → Add pages
3. **Database**: Update `schema.prisma` → Run migrations → Update seed data

## Troubleshooting

### Docker Issues

**Problem**: Containers fail to start
```bash
# Check logs for specific service
docker-compose logs postgres
docker-compose logs backend
docker-compose logs frontend

# Restart all services
docker-compose down
docker-compose up -d

# Rebuild containers if code changed
docker-compose up -d --build
```

**Problem**: Database connection errors
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check database is healthy
docker-compose exec postgres pg_isready -U erp_user

# Connect to database directly
docker-compose exec postgres psql -U erp_user -d claps_learn_erp
```

**Problem**: Port already in use
```bash
# Find process using port (example: 3001)
lsof -i :3001
# Or on Windows:
netstat -ano | findstr :3001

# Kill the process or change port in docker-compose.yml
```

### Backend Issues

**Problem**: Prisma migration fails
```bash
cd backend
npm run prisma:reset  # Resets database (WARNING: deletes all data)
npm run prisma:migrate
npm run seed
```

**Problem**: JWT token invalid
- Check JWT_SECRET is set in backend/.env
- Ensure frontend is sending token in Authorization header
- Token may have expired (default: 7 days) - login again

### Frontend Issues

**Problem**: API calls fail
- Verify backend is running on http://localhost:3001
- Check NEXT_PUBLIC_API_BASE_URL in .env.local
- Check browser console for CORS errors
- Ensure JWT token is being sent with requests

**Problem**: Build fails
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Permission Issues (Linux/Mac)

```bash
# Make setup.sh executable
chmod +x setup.sh

# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Fix file ownership issues
sudo chown -R $USER:$USER .
```

## Deployment

### Production Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a strong random value
- [ ] Update database credentials (not default erp_user/erp_password)
- [ ] Disable or remove test user accounts
- [ ] Enable HTTPS/TLS
- [ ] Configure production CORS settings
- [ ] Set NODE_ENV=production
- [ ] Enable Row Level Security (RLS) in PostgreSQL
- [ ] Set up proper logging and monitoring
- [ ] Configure backup strategy for database
- [ ] Review and harden security settings

### Deploy to VPS/Cloud

1. **Prepare server** (Ubuntu/Debian):
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose git
   ```

2. **Clone and configure**:
   ```bash
   git clone <repository-url>
   cd new-erp
   ./setup.sh
   ```

3. **Configure reverse proxy** (nginx):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
       }

       location /api {
           proxy_pass http://localhost:3001;
       }
   }
   ```

### Deploy Frontend to Vercel

```bash
# Build and deploy frontend only
npm run build
vercel deploy --prod
```

Note: When deploying frontend separately, update NEXT_PUBLIC_API_BASE_URL to your backend URL.

## Documentation

Comprehensive documentation is available:

- **[VALIDATION_REPORT.md](./VALIDATION_REPORT.md)** - Complete validation of all business requirements (95% complete)
- **[VALIDATION_PROOF.md](./VALIDATION_PROOF.md)** - Proof that business rules work correctly with code references
- **[IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)** - Development progress tracking
- **[DATABASE_SCHEMA.sql](./backend/DATABASE_SCHEMA.sql)** - Complete PostgreSQL schema with RLS policies and audit triggers

## Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** and test thoroughly
4. **Commit with descriptive messages**:
   ```bash
   git commit -m "Add amazing feature that does X"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request** with description of changes

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all existing tests pass
- Follow the existing code structure

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

Need help? Here's how to get support:

- **Issues**: [Create an issue](https://github.com/your-repo/new-erp/issues) for bugs or feature requests
- **Email**: support@clapslearn.com
- **Documentation**: Check the `/docs` folder and markdown files in the repo

## Acknowledgments

- Built for **Claps Learn** educational institution
- Uses industry-standard technologies (Next.js, Express, PostgreSQL)
- Implements comprehensive business logic for ERP operations
- Designed with security, audit compliance, and scalability in mind

---

**Version**: 1.0.0
**Last Updated**: 2024
**Maintainer**: Claps Learn Development Team
