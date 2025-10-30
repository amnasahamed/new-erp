import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { generateInvoiceNumber } from '../utils/auth';
import { PaymentOrigin } from '@prisma/client';

/**
 * Get ledger entries (with filters)
 * GET /api/ledger
 */
export const getLedgerEntries = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    studentId,
    startDate,
    endDate,
    type, // 'credit' or 'debit'
    page = '1',
    limit = '50',
  } = req.query;

  const where: any = {};

  if (studentId) {
    where.studentId = studentId as string;
  }

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  if (type === 'credit') {
    where.credit = { gt: 0 };
  } else if (type === 'debit') {
    where.debit = { gt: 0 };
  }

  // For parents - only show their children's ledger
  if (req.user?.role === 'parent') {
    const students = await prisma.student.findMany({
      where: { parentId: req.user.userId },
      select: { id: true },
    });
    where.studentId = { in: students.map((s) => s.id) };
  }

  // For coordinators - only show ledger from their department
  if (req.user?.role === 'coordinator' && req.user.departmentId) {
    const students = await prisma.student.findMany({
      where: { departmentId: req.user.departmentId },
      select: { id: true },
    });
    where.studentId = { in: students.map((s) => s.id) };
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const [entries, total] = await Promise.all([
    prisma.accountLedger.findMany({
      where,
      include: {
        student: true,
        creator: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      skip,
      take,
      orderBy: { date: 'desc' },
    }),
    prisma.accountLedger.count({ where }),
  ]);

  res.json({
    status: 'success',
    data: {
      entries,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    },
  });
};

/**
 * Get ledger entry by ID
 * GET /api/ledger/:id
 */
export const getLedgerEntryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const entry = await prisma.accountLedger.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          parent: true,
        },
      },
      creator: true,
    },
  });

  if (!entry) {
    throw new ApiError(404, 'Ledger entry not found');
  }

  res.json({
    status: 'success',
    data: { entry },
  });
};

/**
 * Add payment/recharge
 * POST /api/ledger/payment
 */
export const addPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    studentId,
    amount,
    narration,
    paymentOrigin,
    invoiceNo,
  } = req.body;

  if (!studentId || !amount || !narration) {
    throw new ApiError(400, 'studentId, amount, and narration are required');
  }

  if (amount <= 0) {
    throw new ApiError(400, 'Amount must be greater than 0');
  }

  // Business Rule: Narration is mandatory for audit compliance
  if (!narration || narration.trim().length === 0) {
    throw new ApiError(400, 'Narration is required for audit compliance');
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  // Generate invoice number if not provided
  const ledgerCount = await prisma.accountLedger.count();
  const generatedInvoiceNo = invoiceNo || generateInvoiceNumber(ledgerCount);

  // Calculate hours from amount (using default rate of ₹250/hour)
  const hourlyRate = 250; // This could come from settings
  const hours = amount / hourlyRate;

  // Start transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update student balance
    const newBalance = student.balance + amount;
    const newBalanceHours = student.balanceHours + hours;

    const updatedStudent = await tx.student.update({
      where: { id: studentId },
      data: {
        balance: newBalance,
        balanceHours: newBalanceHours,
        // If student was paused, keep them paused - they need to manually resume
      },
    });

    // Create ledger entry
    const ledgerEntry = await tx.accountLedger.create({
      data: {
        date: new Date(),
        studentId,
        particulars: 'Payment received',
        credit: amount,
        debit: 0,
        balance: newBalance,
        invoiceNo: generatedInvoiceNo,
        narration,
        paymentOrigin: (paymentOrigin as PaymentOrigin) || 'domestic',
        createdBy: req.user?.userId,
      },
      include: {
        student: true,
      },
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        tableName: 'account_ledger',
        recordId: ledgerEntry.id,
        action: 'INSERT',
        newValues: ledgerEntry,
        changedBy: req.user?.userId,
      },
    });

    // Notify parent
    await tx.notification.create({
      data: {
        userId: student.parentId,
        type: 'success',
        message: `Payment of ₹${amount} received successfully. New balance: ₹${newBalance.toFixed(2)} (${newBalanceHours.toFixed(1)} hours)`,
        actionUrl: `/parent/balance`,
      },
    });

    return { ledgerEntry, updatedStudent };
  });

  res.status(201).json({
    status: 'success',
    data: {
      ledgerEntry: result.ledgerEntry,
      student: result.updatedStudent,
    },
    message: 'Payment added successfully',
  });
};

/**
 * Get student ledger
 * GET /api/ledger/student/:studentId
 */
export const getStudentLedger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { studentId } = req.params;
  const { limit = '50' } = req.query;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  // Check access permissions
  if (req.user?.role === 'parent' && student.parentId !== req.user.userId) {
    throw new ApiError(403, 'You can only view ledger for your own children');
  }

  if (req.user?.role === 'coordinator' && student.departmentId !== req.user.departmentId) {
    throw new ApiError(403, 'You can only view ledger for students in your department');
  }

  const entries = await prisma.accountLedger.findMany({
    where: { studentId },
    include: {
      creator: {
        select: {
          name: true,
          role: true,
        },
      },
    },
    take: parseInt(limit as string),
    orderBy: { date: 'desc' },
  });

  res.json({
    status: 'success',
    data: {
      student: {
        id: student.id,
        code: student.code,
        name: student.name,
        balance: student.balance,
        balanceHours: student.balanceHours,
      },
      entries,
    },
  });
};

/**
 * Get ledger summary (for accountant)
 * GET /api/ledger/summary
 */
export const getLedgerSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { startDate, endDate } = req.query;

  const where: any = {};

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  } else {
    // Default to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    where.date = {
      gte: firstDay,
      lte: lastDay,
    };
  }

  const entries = await prisma.accountLedger.findMany({
    where,
    select: {
      credit: true,
      debit: true,
      paymentOrigin: true,
    },
  });

  const totalRevenue = entries.reduce((sum, entry) => sum + entry.credit, 0);
  const totalExpenses = entries.reduce((sum, entry) => sum + entry.debit, 0);
  const netProfit = totalRevenue - totalExpenses;

  const domesticPayments = entries
    .filter((e) => e.paymentOrigin === 'domestic')
    .reduce((sum, entry) => sum + entry.credit, 0);

  const internationalPayments = entries
    .filter((e) => e.paymentOrigin === 'international')
    .reduce((sum, entry) => sum + entry.credit, 0);

  res.json({
    status: 'success',
    data: {
      totalRevenue,
      totalExpenses,
      netProfit,
      domesticPayments,
      internationalPayments,
      entryCount: entries.length,
    },
  });
};

/**
 * Export ledger (CSV format)
 * GET /api/ledger/export
 */
export const exportLedger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { studentId, startDate, endDate } = req.query;

  const where: any = {};

  if (studentId) {
    where.studentId = studentId as string;
  }

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  const entries = await prisma.accountLedger.findMany({
    where,
    include: {
      student: true,
    },
    orderBy: { date: 'desc' },
  });

  // Generate CSV
  const csvHeader = 'Date,Student Code,Student Name,Particulars,Credit,Debit,Balance,Invoice No,Narration\n';
  const csvRows = entries.map((entry) =>
    [
      entry.date.toISOString().split('T')[0],
      entry.student.code,
      entry.student.name,
      entry.particulars,
      entry.credit,
      entry.debit,
      entry.balance,
      entry.invoiceNo || '',
      `"${entry.narration}"`,
    ].join(',')
  );

  const csv = csvHeader + csvRows.join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="ledger-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
};
