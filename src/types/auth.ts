import { UserRole, Department } from './roles';

export interface User {
  id: string;
  userCode: string; // User code (e.g., ADM001, CRD001, TCH001, PAR001)
  name: string;
  email: string;
  role: UserRole;
  department?: Department; // Required for Coordinator role, optional for others
  departmentId?: string; // Foreign key to departments table
  avatar?: string;
  phone?: string;
  whatsapp?: string; // WhatsApp number for notifications
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
