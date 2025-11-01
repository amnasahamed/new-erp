/**
 * API Services Index
 * Export all API services for easy importing
 */

export { apiClient } from './client';
export type { ApiError } from './client';

export { authApi } from './auth';
export type { LoginRequest, LoginResponse, RegisterRequest } from './auth';

export { studentsApi } from './students';
export type {
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentFilters,
} from './students';

export { teachersApi } from './teachers';
export type {
  Teacher,
  TeacherAvailability,
  CreateTeacherRequest,
  UpdateTeacherRequest,
} from './teachers';

export { classesApi } from './classes';
export type {
  Class,
  CreateClassRequest,
  UpdateClassRequest,
  MarkAttendanceRequest,
  ClassFilters,
} from './classes';

export { demosApi } from './demos';
export type {
  DemoRequest,
  CreateDemoRequest,
  UpdateDemoRequest,
  AssignTeacherRequest,
  RecordOutcomeRequest,
} from './demos';

export { disputesApi } from './disputes';
export type {
  Dispute,
  RaiseDisputeRequest,
  ResolveDisputeRequest,
} from './disputes';

export { ledgerApi } from './ledger';
export type {
  LedgerEntry,
  AddPaymentRequest,
  LedgerFilters,
} from './ledger';
