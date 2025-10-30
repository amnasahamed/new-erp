import { Router } from 'express';
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  updateTeacherAvailability,
  getTeacherSchedule,
  getTeacherSalary,
} from '../controllers/teacher.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize('admin', 'hr', 'coordinator'), getTeachers);
router.get('/:id', getTeacherById);
router.post('/', authorize('admin', 'hr'), createTeacher);
router.put('/:id', authorize('admin', 'hr'), updateTeacher);
router.put('/:id/availability', authorize('admin', 'teacher'), updateTeacherAvailability);
router.get('/:id/schedule', getTeacherSchedule);
router.get('/:id/salary', authorize('admin', 'teacher', 'accountant'), getTeacherSalary);

export default router;
