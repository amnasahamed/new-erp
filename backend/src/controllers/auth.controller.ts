import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import {
  hashPassword,
  comparePassword,
  generateToken,
  validateDOBFormat,
  generateUserCode,
} from '../utils/auth';
import { ApiError } from '../middleware/errorHandler';
import { UserRole, Department } from '@prisma/client';

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      department: true,
    },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Account is inactive');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId || undefined,
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tableName: 'users',
      recordId: user.id,
      action: 'LOGIN',
      newValues: { lastLogin: new Date() },
      changedBy: user.id,
      changedByName: user.name,
      changedByRole: user.role,
    },
  });

  res.json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        userCode: user.userCode,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department?.code,
        departmentId: user.departmentId,
        avatar: user.avatarUrl,
        phone: user.phone,
      },
      token,
    },
  });
};

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  const {
    name,
    email,
    password,
    role,
    department,
    phone,
    whatsapp,
  } = req.body;

  // Validate required fields
  if (!name || !email || !password || !role) {
    throw new ApiError(400, 'Name, email, password, and role are required');
  }

  // Validate password format (should be DOB: DD-MM-YYYY)
  if (!validateDOBFormat(password)) {
    throw new ApiError(
      400,
      'Password must be in DOB format (DD-MM-YYYY), e.g., 15-08-1990'
    );
  }

  // Check if coordinator has department
  if (role === 'coordinator' && !department) {
    throw new ApiError(400, 'Department is required for coordinator role');
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, 'Email already exists');
  }

  // Get department ID if department code is provided
  let departmentId: string | undefined;
  if (department) {
    const dept = await prisma.departmentModel.findUnique({
      where: { code: department as Department },
    });
    if (!dept) {
      throw new ApiError(400, 'Invalid department code');
    }
    departmentId = dept.id;
  }

  // Generate user code
  const userCount = await prisma.user.count({ where: { role: role as UserRole } });
  const userCode = generateUserCode(role as UserRole, userCount);

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      userCode,
      name,
      email,
      passwordHash,
      role: role as UserRole,
      departmentId,
      phone,
      whatsapp,
    },
    include: {
      department: true,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tableName: 'users',
      recordId: user.id,
      action: 'INSERT',
      newValues: { ...user, passwordHash: '[REDACTED]' },
      changedBy: user.id,
      changedByName: user.name,
      changedByRole: user.role,
    },
  });

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId || undefined,
  });

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        userCode: user.userCode,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department?.code,
        phone: user.phone,
      },
      token,
    },
  });
};

/**
 * Verify token
 * GET /api/auth/verify
 */
export const verifyTokenEndpoint = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // User is already authenticated by middleware
  if (!req.user) {
    throw new ApiError(401, 'Not authenticated');
  }

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: {
      department: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        userCode: user.userCode,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department?.code,
        departmentId: user.departmentId,
        avatar: user.avatarUrl,
        phone: user.phone,
      },
    },
  });
};

/**
 * Logout user (client-side token removal, but we log it)
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    // Create audit log for logout
    await prisma.auditLog.create({
      data: {
        tableName: 'users',
        recordId: req.user.userId,
        action: 'LOGOUT',
        changedBy: req.user.userId,
      },
    });
  }

  res.json({
    status: 'success',
    message: 'Logged out successfully',
  });
};
