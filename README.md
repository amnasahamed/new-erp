# ERP Dashboard - Multi-Role Management System

A comprehensive multi-role dashboard system built with Next.js 14, TypeScript, Material-UI, and Redux Toolkit.

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

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit + Redux Persist
- **Data Grid**: MUI X Data Grid
- **Charts**: Recharts
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd new-erp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
new-erp/
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── admin/                # Admin dashboard
│   │   ├── coordinator/          # Coordinator dashboard
│   │   ├── teacher/              # Teacher dashboard
│   │   ├── parent/               # Parent dashboard
│   │   ├── hr/                   # HR dashboard
│   │   ├── accountant/           # Accountant dashboard
│   │   ├── login/                # Login page
│   │   ├── unauthorized/         # Unauthorized access page
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page
│   ├── components/               # React components
│   │   ├── auth/                 # Authentication components
│   │   ├── common/               # Shared components
│   │   ├── layout/               # Layout components
│   │   └── providers/            # Context providers
│   ├── store/                    # Redux store
│   │   ├── slices/               # Redux slices
│   │   ├── hooks.ts              # Typed Redux hooks
│   │   └── index.ts              # Store configuration
│   ├── types/                    # TypeScript types
│   │   ├── auth.ts               # Auth types
│   │   ├── roles.ts              # Role types
│   │   └── dashboard.ts          # Dashboard data types
│   └── theme/                    # MUI theme configuration
│       └── theme.ts
├── public/                       # Static files
├── .env.local                    # Environment variables
├── next.config.js                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## Authentication

The application uses a mock authentication system for demo purposes. In production, replace with actual authentication:

### Demo Login

Use any email/password combination and select a role:

- **Admin**: Full system access
- **Coordinator**: Department-specific (select department: AA, BB, CC, DD, EE)
- **Teacher**: Class and attendance management
- **Parent**: Student monitoring
- **HR**: Teacher management
- **Accountant**: Financial management

### Role-Based Access Control

Each route is protected by `AuthGuard` component that checks:
1. User authentication status
2. User role permissions
3. Redirects to login or unauthorized page if needed

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

## API Integration

Currently using mock data. To integrate with real APIs:

1. Update `src/store/slices/authSlice.ts` for authentication
2. Create service files in `src/services/` for each domain
3. Update dashboard pages to fetch real data
4. Replace mock data with API calls

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Adding New Features

1. Create types in `src/types/`
2. Add Redux slice in `src/store/slices/` if needed
3. Create components in `src/components/`
4. Add pages in `src/app/`

## Deployment

### Build

```bash
npm run build
```

### Deploy to Vercel

```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License

## Support

For issues or questions, please create an issue in the repository.
