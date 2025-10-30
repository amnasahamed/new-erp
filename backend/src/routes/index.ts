import { Router } from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import teacherRoutes from './teacher.routes';
import classRoutes from './class.routes';
import disputeRoutes from './dispute.routes';
import ledgerRoutes from './ledger.routes';
import demoRoutes from './demo.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/classes', classRoutes);
router.use('/disputes', disputeRoutes);
router.use('/ledger', ledgerRoutes);
router.use('/demos', demoRoutes);

export default router;
