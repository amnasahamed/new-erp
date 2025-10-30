import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UserRole } from '@prisma/client';

const SALT_ROUNDS = 10;

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  departmentId?: string;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, config.jwt.secret) as JWTPayload;
}

/**
 * Validate DOB password format (DD-MM-YYYY)
 * This is the format required by the business rules
 */
export function validateDOBFormat(password: string): boolean {
  const dobRegex = /^\d{2}-\d{2}-\d{4}$/;
  if (!dobRegex.test(password)) {
    return false;
  }

  // Additional validation: check if it's a valid date
  const [day, month, year] = password.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === year
  );
}

/**
 * Generate user code based on role
 * Format: ADM001, CRD001, TCH001, PAR001, HR001, ACC001
 */
export function generateUserCode(role: UserRole, count: number): string {
  const prefixes: Record<UserRole, string> = {
    admin: 'ADM',
    coordinator: 'CRD',
    teacher: 'TCH',
    parent: 'PAR',
    hr: 'HR',
    accountant: 'ACC',
  };

  const prefix = prefixes[role];
  const paddedCount = String(count + 1).padStart(3, '0');
  return `${prefix}${paddedCount}`;
}

/**
 * Generate student code
 * Format: STU001, STU002, etc.
 */
export function generateStudentCode(count: number): string {
  const paddedCount = String(count + 1).padStart(3, '0');
  return `STU${paddedCount}`;
}

/**
 * Generate invoice number
 * Format: INV-YYYYMMDD-001
 */
export function generateInvoiceNumber(count: number): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const paddedCount = String(count + 1).padStart(3, '0');

  return `INV-${year}${month}${day}-${paddedCount}`;
}
