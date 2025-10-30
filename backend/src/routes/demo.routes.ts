import { Router } from 'express';
import {
  getDemos,
  getDemoById,
  createDemo,
  assignTeacherToDemo,
  recordDemoOutcome,
  getPendingDemos,
} from '../controllers/demo.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize('admin', 'coordinator'), getDemos);
router.get('/pending', authorize('admin', 'coordinator'), getPendingDemos);
router.get('/:id', getDemoById);
router.post('/', createDemo);
router.post('/:id/assign', authorize('admin', 'coordinator'), assignTeacherToDemo);
router.post('/:id/outcome', authorize('admin', 'coordinator'), recordDemoOutcome);

export default router;
