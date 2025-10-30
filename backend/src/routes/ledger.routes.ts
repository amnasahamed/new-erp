import { Router } from 'express';
import {
  getLedgerEntries,
  getLedgerEntryById,
  addPayment,
  getStudentLedger,
  getLedgerSummary,
  exportLedger,
} from '../controllers/ledger.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize('admin', 'accountant', 'coordinator'), getLedgerEntries);
router.get('/summary', authorize('admin', 'accountant'), getLedgerSummary);
router.get('/export', authorize('admin', 'accountant'), exportLedger);
router.get('/student/:studentId', getStudentLedger);
router.get('/:id', getLedgerEntryById);
router.post('/payment', authorize('admin', 'accountant', 'coordinator'), addPayment);

export default router;
