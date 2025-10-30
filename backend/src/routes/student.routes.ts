import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  pauseStudent,
  resumeStudent,
  getStudentBalance,
} from '../controllers/student.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/students
 * @desc Get all students with filters
 * @access Private (admin, coordinator, hr, accountant)
 */
router.get(
  '/',
  authorize('admin', 'coordinator', 'hr', 'accountant'),
  getStudents
);

/**
 * @route GET /api/students/:id
 * @desc Get student by ID
 * @access Private (admin, coordinator, parent, teacher)
 */
router.get('/:id', getStudentById);

/**
 * @route POST /api/students
 * @desc Create new student
 * @access Private (admin, coordinator)
 */
router.post('/', authorize('admin', 'coordinator'), createStudent);

/**
 * @route PUT /api/students/:id
 * @desc Update student
 * @access Private (admin, coordinator)
 */
router.put('/:id', authorize('admin', 'coordinator'), updateStudent);

/**
 * @route POST /api/students/:id/pause
 * @desc Pause student
 * @access Private (admin, coordinator)
 */
router.post('/:id/pause', authorize('admin', 'coordinator'), pauseStudent);

/**
 * @route POST /api/students/:id/resume
 * @desc Resume student
 * @access Private (admin, coordinator)
 */
router.post('/:id/resume', authorize('admin', 'coordinator'), resumeStudent);

/**
 * @route GET /api/students/:id/balance
 * @desc Get student balance
 * @access Private (admin, coordinator, parent, accountant)
 */
router.get(
  '/:id/balance',
  authorize('admin', 'coordinator', 'parent', 'accountant'),
  getStudentBalance
);

export default router;
