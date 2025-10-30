import { Router } from 'express';
import {
  getDisputes,
  getDisputeById,
  raiseDispute,
  addTeacherResponse,
  resolveDispute,
  getOpenDisputes,
} from '../controllers/dispute.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getDisputes);
router.get('/open', authorize('admin', 'coordinator'), getOpenDisputes);
router.get('/:id', getDisputeById);
router.post('/', authorize('parent', 'admin'), raiseDispute);
router.put('/:id/response', authorize('teacher', 'admin'), addTeacherResponse);
router.put('/:id/resolve', authorize('coordinator', 'admin'), resolveDispute);

export default router;
