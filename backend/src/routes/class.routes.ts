import { Router } from 'express';
import {
  getClasses,
  getClassById,
  markAttendance,
  cancelClass,
  joinClass,
  getUpcomingClasses,
  getLiveClasses,
} from '../controllers/class.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getClasses);
router.get('/upcoming', getUpcomingClasses);
router.get('/live', authorize('admin', 'coordinator'), getLiveClasses);
router.get('/:id', getClassById);
router.post('/:id/attendance', authorize('teacher', 'admin', 'coordinator'), markAttendance);
router.post('/:id/cancel', authorize('parent', 'admin', 'coordinator'), cancelClass);
router.post('/:id/join', joinClass);

export default router;
