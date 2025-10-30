import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/auth';
import { ApiError } from './errorHandler';
import { UserRole } from '@prisma/client';
import prisma from '../config/database';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to authenticate user via JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyToken(token);

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true, role: true, departmentId: true },
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User not found or inactive');
    }

    // Attach user to request
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, 'Invalid or expired token'));
    }
  }
};

/**
 * Middleware to authorize user based on roles
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, 'You do not have permission to access this resource')
      );
    }

    next();
  };
};

/**
 * Middleware to check department access (for coordinators)
 * Coordinators can only access data from their department
 */
export const checkDepartmentAccess = (departmentIdParam: string = 'departmentId') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, 'User not authenticated'));
      }

      // Admins and HR can access all departments
      if (req.user.role === 'admin' || req.user.role === 'hr') {
        return next();
      }

      // Coordinators can only access their own department
      if (req.user.role === 'coordinator') {
        const requestedDepartmentId =
          req.params[departmentIdParam] ||
          req.body[departmentIdParam] ||
          req.query[departmentIdParam];

        if (requestedDepartmentId && requestedDepartmentId !== req.user.departmentId) {
          return next(
            new ApiError(403, 'You do not have access to this department')
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to set Prisma context for Row-Level Security (RLS)
 * This sets session variables for database-level access control
 */
export const setPrismaContext = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user) {
    // Set session variables for RLS policies
    try {
      await prisma.$executeRawUnsafe(
        `SET LOCAL app.current_user_id = '${req.user.userId}'`
      );
      await prisma.$executeRawUnsafe(
        `SET LOCAL app.current_user_role = '${req.user.role}'`
      );
      if (req.user.departmentId) {
        await prisma.$executeRawUnsafe(
          `SET LOCAL app.current_user_department_id = '${req.user.departmentId}'`
        );
      }
    } catch (error) {
      // Log but don't fail the request
      console.error('Failed to set Prisma context:', error);
    }
  }
  next();
};
