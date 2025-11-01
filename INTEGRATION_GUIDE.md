# Frontend-Backend Integration Guide

This guide explains how to integrate the frontend dashboard pages with the backend API.

## Overview

The frontend API client is now complete and ready to use. The authentication slice has been updated as an example. Follow similar patterns to integrate other pages.

## What's Already Done

### ✅ Backend API
- All 7 controllers implemented (auth, student, teacher, class, demo, dispute, ledger)
- JWT authentication and role-based authorization
- Business rule enforcement (demo required, 24-hour grace, 2-hour cancellation, etc.)
- Automated cron jobs (billing, auto-pause, class generation)
- Complete database schema with Prisma ORM

### ✅ Frontend API Client
- **Location**: `src/lib/api/`
- **Services Created**:
  - `client.ts` - Core HTTP client with authentication
  - `auth.ts` - Login, register, logout, verify
  - `students.ts` - Student CRUD, pause/resume
  - `teachers.ts` - Teacher CRUD, availability
  - `classes.ts` - Class management, attendance, cancellation
  - `demos.ts` - Demo workflow, teacher assignment
  - `disputes.ts` - Raise, escalate, resolve disputes
  - `ledger.ts` - Payments, ledger entries, export

### ✅ Authentication Integration
- **File**: `src/store/slices/authSlice.ts`
- Updated to use `authApi` instead of axios
- Automatic token management with localStorage
- Error handling with proper types

## Integration Steps for Each Page

### 1. Student Management Pages

**Files to Update**:
- `src/app/coordinator/students/page.tsx`
- `src/app/admin/students/page.tsx`

**Example Integration**:

```typescript
import { useEffect, useState } from 'react';
import { studentsApi, Student } from '@/lib/api';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const { students } = await studentsApi.list({
        // Add filters as needed
        status: 'ongoing',
      });
      setStudents(students);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseStudent = async (id: string) => {
    try {
      await studentsApi.pause(id, 'Low balance');
      // Reload students after pause
      await loadStudents();
    } catch (err: any) {
      alert('Failed to pause student: ' + err.message);
    }
  };

  // Render your UI with students data
}
```

### 2. Teacher Management Pages

**Files to Update**:
- `src/app/hr/teachers/page.tsx`
- `src/app/admin/teachers/page.tsx`

**Example Integration**:

```typescript
import { teachersApi, Teacher } from '@/lib/api';

const loadTeachers = async () => {
  const { teachers } = await teachersApi.list({
    status: 'active',
  });
  setTeachers(teachers);
};

const updateAvailability = async (teacherId: string, availability: any[]) => {
  await teachersApi.setAvailability(teacherId, availability);
  alert('Availability updated successfully');
};
```

### 3. Class Management Pages

**Files to Update**:
- `src/app/teacher/classes/page.tsx`
- `src/app/admin/classes/page.tsx`

**Example Integration**:

```typescript
import { classesApi, Class } from '@/lib/api';

const loadTodayClasses = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { classes } = await classesApi.list({
    date: today,
    teacherId: currentUser.teacherId, // From Redux state
  });
  setClasses(classes);
};

const markAttendance = async (classId: string, attended: boolean) => {
  try {
    await classesApi.markAttendance(classId, {
      attended,
      notes: 'Class completed successfully',
    });
    alert('Attendance marked. Parent has 24 hours to dispute.');
    await loadTodayClasses();
  } catch (err: any) {
    alert('Failed to mark attendance: ' + err.message);
  }
};

const cancelClass = async (classId: string, reason: string) => {
  try {
    await classesApi.cancel(classId, reason);
    alert('Class cancelled. Teacher has been notified.');
    await loadTodayClasses();
  } catch (err: any) {
    // Backend validates 2-hour rule
    alert('Failed to cancel: ' + err.message);
  }
};
```

### 4. Demo Management Pages

**Files to Update**:
- `src/app/coordinator/demos/page.tsx`

**Example Integration**:

```typescript
import { demosApi, DemoRequest } from '@/lib/api';

const loadDemos = async () => {
  const { demos } = await demosApi.list({
    status: 'pending',
    departmentId: currentUser.departmentId,
  });
  setDemos(demos);
};

const assignTeacher = async (demoId: string, teacherId: string) => {
  try {
    await demosApi.assignTeacher(demoId, {
      teacherId,
      scheduledAt: new Date().toISOString(),
      gmeetLink: 'https://meet.google.com/xxx-xxxx-xxx',
    });
    alert('Teacher assigned successfully');
    await loadDemos();
  } catch (err: any) {
    alert('Failed to assign teacher: ' + err.message);
  }
};

const recordOutcome = async (demoId: string, outcome: 'registered' | 'not_interested' | 'follow_up') => {
  await demosApi.recordOutcome(demoId, {
    outcome,
    notes: 'Demo completed',
  });
  // Backend automatically updates teacher conversion ratio
  alert('Outcome recorded');
};
```

### 5. Dispute Management Pages

**Files to Update**:
- `src/app/parent/disputes/page.tsx`
- `src/app/coordinator/disputes/page.tsx`

**Example Integration**:

```typescript
import { disputesApi, Dispute } from '@/lib/api';

const raiseDispute = async (classId: string, reason: string) => {
  try {
    await disputesApi.raise({
      classId,
      reason,
      description: 'Detailed explanation...',
    });
    alert('Dispute raised successfully. Billing paused.');
  } catch (err: any) {
    alert('Failed to raise dispute: ' + err.message);
  }
};

const resolveDispute = async (disputeId: string, adjustmentHours: number) => {
  await disputesApi.resolve(disputeId, {
    finalAdjustmentHours: adjustmentHours,
    resolutionNotes: 'Approved partial refund',
  });
  // Backend automatically credits student if adjustment > 0
  alert('Dispute resolved');
};
```

### 6. Ledger Management Pages

**Files to Update**:
- `src/app/accountant/ledger/page.tsx`
- `src/app/parent/balance/page.tsx`

**Example Integration**:

```typescript
import { ledgerApi, LedgerEntry } from '@/lib/api';

const loadLedger = async (studentId: string) => {
  const { entries } = await ledgerApi.list({
    studentId,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  });
  setEntries(entries);
};

const addPayment = async (studentId: string, amount: number) => {
  try {
    await ledgerApi.addPayment({
      studentId,
      amount,
      narration: 'Payment received via UPI', // Mandatory for audit
      paymentMethod: 'UPI',
      transactionId: 'TXN123456',
    });
    alert('Payment added successfully');
    await loadLedger(studentId);
  } catch (err: any) {
    alert('Failed to add payment: ' + err.message);
  }
};

const exportLedger = async () => {
  try {
    const blob = await ledgerApi.export({ studentId }, 'csv');
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${new Date().toISOString()}.csv`;
    a.click();
  } catch (err: any) {
    alert('Export failed: ' + err.message);
  }
};
```

## Redux Integration

If you prefer using Redux for state management:

### Create API Slices

**Example**: `src/store/slices/studentsSlice.ts`

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { studentsApi, Student } from '@/lib/api';

interface StudentsState {
  students: Student[];
  loading: boolean;
  error: string | null;
}

const initialState: StudentsState = {
  students: [],
  loading: false,
  error: null,
};

export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (filters?: any, { rejectWithValue }) => {
    try {
      const { students } = await studentsApi.list(filters);
      return students;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const pauseStudent = createAsyncThunk(
  'students/pauseStudent',
  async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
    try {
      const student = await studentsApi.pause(id, reason);
      return student;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(pauseStudent.fulfilled, (state, action) => {
        const index = state.students.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      });
  },
});

export default studentsSlice.reducer;
```

## Environment Variables

Create `.env.local` from `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Ensure `NEXT_PUBLIC_API_BASE_URL` points to your backend:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## Error Handling Best Practices

```typescript
import { ApiError } from '@/lib/api';

try {
  const result = await studentsApi.create(data);
  // Success
} catch (error) {
  const apiError = error as ApiError;

  if (apiError.status === 400) {
    // Validation error
    console.error('Validation errors:', apiError.errors);
    // Display field-specific errors to user
  } else if (apiError.status === 403) {
    // Permission denied
    alert('You do not have permission to perform this action');
  } else if (apiError.status === 401) {
    // Unauthorized - token expired
    // apiClient automatically redirects to login
  } else {
    // Generic error
    alert(apiError.message || 'An error occurred');
  }
}
```

## Testing the Integration

1. **Start backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend**:
   ```bash
   npm run dev
   ```

3. **Test login**:
   - Go to http://localhost:3000/login
   - Use test credentials from README.md
   - Check browser DevTools Network tab to see API calls

4. **Verify token**:
   - Check localStorage for `auth_token`
   - Verify Authorization header in API requests

## Next Steps

1. Update each dashboard page to use the API services
2. Replace mock data with real API calls
3. Add loading states and error handling to all pages
4. Test all CRUD operations
5. Verify business rules work correctly (demo required, 24h grace, 2h cancellation)
6. Add optimistic UI updates for better UX
7. Implement proper error messages and user feedback

## Common Issues

**Issue**: 401 Unauthorized errors
- **Solution**: Check token is set correctly, verify backend is running

**Issue**: CORS errors
- **Solution**: Backend already has CORS configured for localhost:3000

**Issue**: Type errors
- **Solution**: All API responses are typed, use the exported types from `@/lib/api`

**Issue**: Network errors
- **Solution**: Verify backend is running on correct port (3001)

## Documentation

- Backend API: See `README.md` API Documentation section
- Business Rules: See `VALIDATION_PROOF.md`
- Database Schema: See `backend/DATABASE_SCHEMA.sql`
- Implementation Progress: See `IMPLEMENTATION_PROGRESS.md`
