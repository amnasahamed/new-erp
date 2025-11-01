# React Hooks Usage Guide

This guide shows how to use the custom React hooks to integrate dashboard pages with the backend API.

## Overview

All API integration hooks are located in `src/hooks/` and provide a consistent interface for:
- Automatic data fetching on component mount
- Loading states
- Error handling
- CRUD operations with optimistic UI updates
- Automatic state management

## Available Hooks

| Hook | Purpose | File |
|------|---------|------|
| `useStudents` | Student management | `useStudents.ts` |
| `useTeachers` | Teacher management | `useTeachers.ts` |
| `useTeacherAvailability` | Teacher availability | `useTeachers.ts` |
| `useClasses` | Class management | `useClasses.ts` |
| `useTodayClasses` | Today's classes only | `useClasses.ts` |
| `useDemos` | Demo request management | `useDemos.ts` |
| `useDisputes` | Dispute management | `useDisputes.ts` |
| `useLedger` | Ledger & payment management | `useLedger.ts` |

## Quick Start Examples

### 1. Student List with Pause/Resume

```typescript
'use client';

import { useStudents } from '@/hooks';
import { Button, CircularProgress, Alert } from '@mui/material';

export default function StudentList() {
  const { students, loading, error, pauseStudent, resumeStudent } = useStudents({
    status: 'ongoing', // Filter for ongoing students
  });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div>
      {students.map(student => (
        <div key={student.id}>
          <h3>{student.name}</h3>
          <p>Balance: ₹{student.balance}</p>
          <p>Status: {student.status}</p>

          {student.status === 'ongoing' ? (
            <Button onClick={() => pauseStudent(student.id, 'User requested')}>
              Pause
            </Button>
          ) : (
            <Button onClick={() => resumeStudent(student.id)}>
              Resume
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 2. Teacher's Today's Classes

```typescript
'use client';

import { useTodayClasses } from '@/hooks';
import { useAppSelector } from '@/store/hooks';

export default function TodayClassSchedule() {
  const { user } = useAppSelector(state => state.auth);

  // Get today's classes for current teacher
  const { classes, loading, error, markAttendance } = useTodayClasses(
    user?.teacherId // Automatically filters by teacherId
  );

  const handleMarkAttendance = async (classId: string) => {
    const success = await markAttendance(classId, {
      attended: true,
      notes: 'Class completed successfully',
    });

    if (success) {
      alert('Attendance marked! Parent has 24 hours to dispute.');
    }
  };

  if (loading) return <div>Loading today's classes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Today's Classes</h2>
      {classes.map(classSession => (
        <div key={classSession.id}>
          <p>{new Date(classSession.scheduledAt).toLocaleTimeString()}</p>
          <p>Student: {classSession.student?.name}</p>
          <p>Duration: {classSession.duration} hours</p>

          {!classSession.attendanceMarked && (
            <button onClick={() => handleMarkAttendance(classSession.id)}>
              Mark Attendance
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 3. Demo Pipeline Management

```typescript
'use client';

import { useDemos, useTeachers } from '@/hooks';
import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';

export default function DemoPipeline() {
  const { user } = useAppSelector(state => state.auth);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  // Get pending demos for coordinator's department
  const { demos, loading, error, assignTeacher, recordOutcome } = useDemos({
    status: 'pending',
    departmentId: user?.departmentId,
  });

  const { teachers } = useTeachers({ status: 'active' });

  const handleAssignTeacher = async (demoId: string, teacherId: string) => {
    const success = await assignTeacher(demoId, {
      teacherId,
      scheduledAt: new Date().toISOString(),
      gmeetLink: 'https://meet.google.com/xxx-xxxx-xxx',
    });

    if (success) {
      alert('Teacher assigned successfully!');
    }
  };

  const handleMarkConverted = async (demoId: string) => {
    const success = await recordOutcome(demoId, {
      outcome: 'registered',
      notes: 'Demo successful, student registered',
    });

    if (success) {
      alert('Demo marked as converted! Teacher conversion ratio updated.');
    }
  };

  if (loading) return <div>Loading demos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Pending Demo Requests</h2>
      {demos.map(demo => (
        <div key={demo.id}>
          <h3>{demo.studentName}</h3>
          <p>Parent: {demo.parentName}</p>
          <p>Status: {demo.status}</p>

          {demo.status === 'pending' && (
            <select onChange={(e) => handleAssignTeacher(demo.id, e.target.value)}>
              <option value="">Assign Teacher</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          {demo.status === 'assigned' && (
            <div>
              <button onClick={() => handleMarkConverted(demo.id)}>
                Mark as Converted
              </button>
              <button onClick={() => recordOutcome(demo.id, {
                outcome: 'not_interested',
                notes: 'Parent not interested',
              })}>
                Mark as Not Interested
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 4. Dispute Resolution

```typescript
'use client';

import { useDisputes } from '@/hooks';
import { useState } from 'react';

export default function DisputeQueue() {
  const { disputes, loading, error, resolveDispute, escalateDispute } = useDisputes({
    status: 'open',
  });

  const [adjustmentHours, setAdjustmentHours] = useState<number>(0);

  const handleResolve = async (disputeId: string) => {
    const success = await resolveDispute(disputeId, {
      finalAdjustmentHours: adjustmentHours,
      resolutionNotes: 'Approved partial credit',
    });

    if (success) {
      alert('Dispute resolved! Student credited if adjustment > 0.');
    }
  };

  if (loading) return <div>Loading disputes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Open Disputes</h2>
      {disputes.map(dispute => (
        <div key={dispute.id}>
          <h3>{dispute.class?.student.name}</h3>
          <p>Reason: {dispute.reason}</p>
          <p>Description: {dispute.description}</p>

          <input
            type="number"
            step="0.5"
            placeholder="Adjustment Hours"
            onChange={(e) => setAdjustmentHours(parseFloat(e.target.value))}
          />

          <button onClick={() => handleResolve(dispute.id)}>
            Resolve
          </button>

          <button onClick={() => escalateDispute(dispute.id)}>
            Escalate to Admin
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 5. Add Payment to Student Account

```typescript
'use client';

import { useLedger } from '@/hooks';
import { useState } from 'react';

export default function AddPayment({ studentId }: { studentId: string }) {
  const { loading, error, addPayment, exportLedger } = useLedger({ studentId });
  const [amount, setAmount] = useState<number>(0);
  const [narration, setNarration] = useState<string>('');

  const handleAddPayment = async () => {
    if (!narration) {
      alert('Narration is required for audit compliance');
      return;
    }

    const entry = await addPayment({
      studentId,
      amount,
      narration,
      paymentMethod: 'UPI',
    });

    if (entry) {
      alert('Payment added successfully!');
      setAmount(0);
      setNarration('');
    }
  };

  const handleExport = () => {
    exportLedger({ studentId }, 'csv');
  };

  return (
    <div>
      <h2>Add Payment</h2>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(parseFloat(e.target.value))}
      />

      <input
        type="text"
        placeholder="Narration (required for audit)"
        value={narration}
        onChange={(e) => setNarration(e.target.value)}
      />

      <button onClick={handleAddPayment} disabled={loading}>
        Add Payment
      </button>

      <button onClick={handleExport}>
        Export Ledger
      </button>

      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

## Advanced Usage

### Filtering and Refetching

```typescript
const { students, fetchStudents } = useStudents();

// Refetch with new filters
const searchStudents = (searchTerm: string) => {
  fetchStudents({ search: searchTerm });
};

// Refetch current data
const refreshData = () => {
  fetchStudents();
};
```

### Error Handling

```typescript
const { students, error, createStudent } = useStudents();

const handleCreate = async (data) => {
  const newStudent = await createStudent(data);

  if (newStudent) {
    // Success
    alert('Student created successfully!');
  } else {
    // Error is automatically set in the hook
    // Display it from the error state
    console.error(error);
  }
};
```

### Multiple Hooks in One Component

```typescript
function CoordinatorDashboard() {
  const { user } = useAppSelector(state => state.auth);

  const { students } = useStudents({ departmentId: user?.departmentId });
  const { demos } = useDemos({ departmentId: user?.departmentId });
  const { disputes } = useDisputes({ status: 'open' });

  // Use all three data sources in your component
  return (
    <div>
      <StatCard title="Active Students" value={students.length} />
      <StatCard title="Pending Demos" value={demos.length} />
      <StatCard title="Open Disputes" value={disputes.length} />
    </div>
  );
}
```

## Hook Return Values

### Common Pattern

All hooks return an object with:

| Property | Type | Description |
|----------|------|-------------|
| `data` | Array | Main data (students, classes, etc.) |
| `loading` | boolean | Loading state |
| `error` | string \| null | Error message if any |
| `fetch*` | function | Refresh data with optional filters |
| `create*` | function | Create new entity |
| `update*` | function | Update existing entity |
| `delete*` | function | Delete entity |

### Example: useStudents

```typescript
const {
  students,        // Student[]
  loading,         // boolean
  error,           // string | null
  total,           // number
  fetchStudents,   // (filters?) => Promise<void>
  createStudent,   // (data) => Promise<Student | null>
  updateStudent,   // (id, data) => Promise<Student | null>
  pauseStudent,    // (id, reason?) => Promise<boolean>
  resumeStudent,   // (id) => Promise<boolean>
  deleteStudent,   // (id) => Promise<boolean>
} = useStudents();
```

## Integration Checklist

To integrate a dashboard page:

- [ ] Import the appropriate hook(s)
- [ ] Replace mock data with hook data
- [ ] Use `loading` state to show loading indicator
- [ ] Use `error` state to show error messages
- [ ] Call hook methods for CRUD operations
- [ ] Remove mock functions and replace with real API calls
- [ ] Test all operations (create, update, delete, etc.)

## Tips

1. **Auto-fetch**: Data is fetched automatically when component mounts
2. **Optimistic Updates**: Hook updates local state immediately for better UX
3. **Error Handling**: Errors are caught and set in state automatically
4. **Type Safety**: All hooks are fully typed with TypeScript
5. **Consistency**: All hooks follow the same pattern for easy learning

## Next Steps

1. Replace mock data in dashboard components with these hooks
2. Remove old mock data arrays
3. Remove old mock functions
4. Test with real backend API
5. Add loading spinners and error messages to UI
