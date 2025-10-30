export enum UserRole {
  ADMIN = 'admin',
  COORDINATOR = 'coordinator',
  TEACHER = 'teacher',
  PARENT = 'parent',
  HR = 'hr',
  ACCOUNTANT = 'accountant',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.COORDINATOR]: 'Coordinator',
  [UserRole.TEACHER]: 'Teacher',
  [UserRole.PARENT]: 'Parent',
  [UserRole.HR]: 'HR',
  [UserRole.ACCOUNTANT]: 'Accountant',
};

export const ROLE_ROUTES: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/admin/dashboard',
  [UserRole.COORDINATOR]: '/coordinator/dashboard',
  [UserRole.TEACHER]: '/teacher/dashboard',
  [UserRole.PARENT]: '/parent/dashboard',
  [UserRole.HR]: '/hr/dashboard',
  [UserRole.ACCOUNTANT]: '/accountant/dashboard',
};

export type Department = 'AA' | 'BB' | 'CC' | 'DD' | 'EE';

export const DEPARTMENTS: Department[] = ['AA', 'BB', 'CC', 'DD', 'EE'];
