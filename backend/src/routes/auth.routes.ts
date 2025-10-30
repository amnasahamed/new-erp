import { Router } from 'express';
import {
  login,
  register,
  verifyTokenEndpoint,
  logout,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /api/auth/register
 * @desc Register new user
 * @access Public (or Admin only in production)
 */
router.post('/register', register);

/**
 * @route GET /api/auth/verify
 * @desc Verify JWT token
 * @access Private
 */
router.get('/verify', authenticate, verifyTokenEndpoint);

/**
 * @route POST /api/auth/logout
 * @desc Logout user (audit log only)
 * @access Private
 */
router.post('/logout', authenticate, logout);

export default router;
