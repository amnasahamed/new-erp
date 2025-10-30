import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { DisputeStatus } from '@prisma/client';

/**
 * Get all disputes (with filters)
 * GET /api/disputes
 */
export const getDisputes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    status,
    studentId,
    page = '1',
    limit = '50',
  } = req.query;

  const where: any = {};

  if (status) {
    where.status = status as DisputeStatus;
  }

  if (studentId) {
    where.studentId = studentId as string;
  }

  // For parents - only show their children's disputes
  if (req.user?.role === 'parent') {
    const students = await prisma.student.findMany({
      where: { parentId: req.user.userId },
      select: { id: true },
    });
    where.studentId = { in: students.map((s) => s.id) };
  }

  // For teachers - show disputes for their classes
  if (req.user?.role === 'teacher') {
    const teacher = await prisma.teacher.findFirst({
      where: { userId: req.user.userId },
    });
    if (teacher) {
      const classIds = await prisma.class.findMany({
        where: { teacherId: teacher.id },
        select: { id: true },
      });
      where.classId = { in: classIds.map((c) => c.id) };
    }
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const [disputes, total] = await Promise.all([
    prisma.dispute.findMany({
      where,
      include: {
        student: true,
        class: {
          include: {
            teacher: true,
          },
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.dispute.count({ where }),
  ]);

  res.json({
    status: 'success',
    data: {
      disputes,
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
 * Get dispute by ID
 * GET /api/disputes/:id
 */
export const getDisputeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          parent: true,
        },
      },
      class: {
        include: {
          teacher: true,
        },
      },
      resolver: true,
    },
  });

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  res.json({
    status: 'success',
    data: { dispute },
  });
};

/**
 * Raise dispute
 * POST /api/disputes
 */
export const raiseDispute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { classId, reason } = req.body;

  if (!classId || !reason) {
    throw new ApiError(400, 'classId and reason are required');
  }

  const classSession = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      student: true,
      teacher: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!classSession) {
    throw new ApiError(404, 'Class not found');
  }

  // Check if user is the parent of the student
  if (req.user?.role === 'parent' && classSession.student.parentId !== req.user.userId) {
    throw new ApiError(403, 'You can only raise disputes for your own children');
  }

  // Check if dispute already exists for this class
  const existingDispute = await prisma.dispute.findFirst({
    where: { classId },
  });

  if (existingDispute) {
    throw new ApiError(400, 'A dispute already exists for this class');
  }

  // Create dispute
  const dispute = await prisma.dispute.create({
    data: {
      studentId: classSession.studentId,
      classId,
      classDate: classSession.date,
      reason,
      status: 'open' as DisputeStatus,
    },
    include: {
      student: true,
      class: {
        include: {
          teacher: true,
        },
      },
    },
  });

  // Business Rule: Pause billing on dispute
  await prisma.class.update({
    where: { id: classId },
    data: {
      billingStatus: 'disputed',
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tableName: 'disputes',
      recordId: dispute.id,
      action: 'INSERT',
      newValues: dispute,
      changedBy: req.user?.userId,
    },
  });

  // Notify coordinator
  if (classSession.student.departmentId) {
    const coordinators = await prisma.user.findMany({
      where: {
        role: 'coordinator',
        departmentId: classSession.student.departmentId,
        isActive: true,
      },
    });

    for (const coordinator of coordinators) {
      await prisma.notification.create({
        data: {
          userId: coordinator.id,
          type: 'warning',
          message: `New dispute raised for ${classSession.student.name} - ${classSession.subject} class on ${classSession.date.toISOString().split('T')[0]}`,
          actionUrl: `/coordinator/disputes/${dispute.id}`,
        },
      });
    }
  }

  // Notify teacher
  await prisma.notification.create({
    data: {
      userId: classSession.teacher.userId,
      type: 'warning',
      message: `Dispute raised for your ${classSession.subject} class with ${classSession.student.name} on ${classSession.date.toISOString().split('T')[0]}. Reason: ${reason}`,
      actionUrl: `/teacher/disputes/${dispute.id}`,
    },
  });

  res.status(201).json({
    status: 'success',
    data: { dispute },
    message: 'Dispute raised successfully. Billing has been paused pending resolution.',
  });
};

/**
 * Add teacher response to dispute
 * PUT /api/disputes/:id/response
 */
export const addTeacherResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { teacherResponse } = req.body;

  if (!teacherResponse) {
    throw new ApiError(400, 'teacherResponse is required');
  }

  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      class: {
        include: {
          teacher: true,
        },
      },
    },
  });

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  // Check if user is the teacher for this class
  if (req.user?.role === 'teacher') {
    const teacher = await prisma.teacher.findFirst({
      where: { userId: req.user.userId },
    });
    if (teacher?.id !== dispute.class.teacherId) {
      throw new ApiError(403, 'You can only respond to disputes for your own classes');
    }
  }

  const updatedDispute = await prisma.dispute.update({
    where: { id },
    data: { teacherResponse },
    include: {
      student: {
        include: {
          parent: true,
        },
      },
      class: {
        include: {
          teacher: true,
        },
      },
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tableName: 'disputes',
      recordId: id,
      action: 'UPDATE',
      oldValues: dispute,
      newValues: updatedDispute,
      changedBy: req.user?.userId,
    },
  });

  // Notify parent
  await prisma.notification.create({
    data: {
      userId: dispute.student.parentId,
      type: 'info',
      message: `Teacher has responded to your dispute for ${dispute.class.subject} class.`,
      actionUrl: `/parent/disputes/${id}`,
    },
  });

  res.json({
    status: 'success',
    data: { dispute: updatedDispute },
  });
};

/**
 * Resolve dispute
 * PUT /api/disputes/:id/resolve
 */
export const resolveDispute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { resolutionNotes, finalAdjustmentHours } = req.body;

  if (!resolutionNotes) {
    throw new ApiError(400, 'resolutionNotes is required');
  }

  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          parent: true,
        },
      },
      class: {
        include: {
          teacher: true,
        },
      },
    },
  });

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  if (dispute.status !== 'open') {
    throw new ApiError(400, 'Only open disputes can be resolved');
  }

  // Start transaction
  await prisma.$transaction(async (tx) => {
    // Update dispute status
    await tx.dispute.update({
      where: { id },
      data: {
        status: 'resolved' as DisputeStatus,
        resolutionNotes,
        finalAdjustmentHours: finalAdjustmentHours || 0,
        resolvedBy: req.user?.userId,
        resolvedAt: new Date(),
      },
    });

    // If adjustment is positive, credit back to student
    if (finalAdjustmentHours && finalAdjustmentHours > 0) {
      const hourlyRate = dispute.class.teacher.hourlySalary;
      const adjustmentAmount = finalAdjustmentHours * hourlyRate;

      // Update student balance
      const newBalance = dispute.student.balance + adjustmentAmount;
      const newBalanceHours = dispute.student.balanceHours + finalAdjustmentHours;

      await tx.student.update({
        where: { id: dispute.studentId },
        data: {
          balance: newBalance,
          balanceHours: newBalanceHours,
        },
      });

      // Create ledger entry
      await tx.accountLedger.create({
        data: {
          date: new Date(),
          studentId: dispute.studentId,
          particulars: 'Dispute resolution - Credit',
          credit: adjustmentAmount,
          debit: 0,
          balance: newBalance,
          narration: `Credit for dispute ${id}. Resolution: ${resolutionNotes}. Adjustment: ${finalAdjustmentHours} hours (₹${adjustmentAmount})`,
          createdBy: req.user?.userId,
        },
      });

      // Notify parent
      await tx.notification.create({
        data: {
          userId: dispute.student.parentId,
          type: 'success',
          message: `Dispute resolved. ₹${adjustmentAmount.toFixed(2)} (${finalAdjustmentHours} hours) has been credited to your balance.`,
          actionUrl: `/parent/disputes/${id}`,
        },
      });
    } else {
      // No adjustment - just notify
      await tx.notification.create({
        data: {
          userId: dispute.student.parentId,
          type: 'info',
          message: `Dispute resolved. Resolution: ${resolutionNotes}`,
          actionUrl: `/parent/disputes/${id}`,
        },
      });
    }

    // Update class billing status
    await tx.class.update({
      where: { id: dispute.classId },
      data: {
        billingStatus: finalAdjustmentHours && finalAdjustmentHours > 0 ? 'disputed' : 'billed',
      },
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        tableName: 'disputes',
        recordId: id,
        action: 'UPDATE',
        oldValues: dispute,
        newValues: {
          status: 'resolved',
          resolutionNotes,
          finalAdjustmentHours,
          resolvedBy: req.user?.userId,
        },
        changedBy: req.user?.userId,
      },
    });
  });

  // Get updated dispute
  const updatedDispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      student: true,
      class: {
        include: {
          teacher: true,
        },
      },
      resolver: true,
    },
  });

  res.json({
    status: 'success',
    data: { dispute: updatedDispute },
    message: 'Dispute resolved successfully',
  });
};

/**
 * Get open disputes (for coordinators)
 * GET /api/disputes/open
 */
export const getOpenDisputes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const where: any = {
    status: 'open',
  };

  // For coordinators - only show disputes from their department
  if (req.user?.role === 'coordinator' && req.user.departmentId) {
    const students = await prisma.student.findMany({
      where: { departmentId: req.user.departmentId },
      select: { id: true },
    });
    where.studentId = { in: students.map((s) => s.id) };
  }

  const disputes = await prisma.dispute.findMany({
    where,
    include: {
      student: true,
      class: {
        include: {
          teacher: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  res.json({
    status: 'success',
    data: { disputes },
  });
};
