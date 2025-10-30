import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { DemoStatus, DemoOutcome } from '@prisma/client';

/**
 * Get all demo requests (with filters)
 * GET /api/demos
 */
export const getDemos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    status,
    outcome,
    page = '1',
    limit = '50',
  } = req.query;

  const where: any = {};

  if (status) {
    where.status = status as DemoStatus;
  }

  if (outcome) {
    where.outcome = outcome as DemoOutcome;
  }

  // For coordinators - only show demos from their department
  if (req.user?.role === 'coordinator' && req.user.departmentId) {
    // Get students from coordinator's department
    const students = await prisma.student.findMany({
      where: { departmentId: req.user.departmentId },
      select: { id: true },
    });
    where.studentId = { in: students.map((s) => s.id) };
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const [demos, total] = await Promise.all([
    prisma.demoRequest.findMany({
      where,
      include: {
        student: true,
        teacher: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.demoRequest.count({ where }),
  ]);

  res.json({
    status: 'success',
    data: {
      demos,
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
 * Get demo by ID
 * GET /api/demos/:id
 */
export const getDemoById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const demo = await prisma.demoRequest.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          parent: true,
        },
      },
      teacher: true,
    },
  });

  if (!demo) {
    throw new ApiError(404, 'Demo request not found');
  }

  res.json({
    status: 'success',
    data: { demo },
  });
};

/**
 * Create demo request
 * POST /api/demos
 */
export const createDemo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    parentName,
    studentName,
    parentId,
    studentId,
    preferredTime,
    subject,
    notes,
  } = req.body;

  if (!parentName || !preferredTime || !subject) {
    throw new ApiError(400, 'parentName, preferredTime, and subject are required');
  }

  // Business Rule: Only one active demo per student at a time
  if (studentId) {
    const existingDemo = await prisma.demoRequest.findFirst({
      where: {
        studentId,
        status: {
          in: ['pending', 'assigned'],
        },
      },
    });

    if (existingDemo) {
      throw new ApiError(
        400,
        'Student already has an active demo request. Please complete or close the existing demo first.'
      );
    }
  }

  // Create demo request
  const demo = await prisma.demoRequest.create({
    data: {
      parentName,
      studentName,
      parentId,
      studentId,
      preferredTime: new Date(preferredTime),
      subject,
      notes,
      status: 'pending' as DemoStatus,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tableName: 'demo_requests',
      recordId: demo.id,
      action: 'INSERT',
      newValues: demo,
      changedBy: req.user?.userId,
    },
  });

  // Notify coordinators
  if (req.user?.departmentId) {
    const coordinators = await prisma.user.findMany({
      where: {
        role: 'coordinator',
        departmentId: req.user.departmentId,
        isActive: true,
      },
    });

    for (const coordinator of coordinators) {
      await prisma.notification.create({
        data: {
          userId: coordinator.id,
          type: 'info',
          message: `New demo request from ${parentName} for ${subject}. Preferred time: ${new Date(preferredTime).toLocaleString()}`,
          actionUrl: `/coordinator/demos/${demo.id}`,
        },
      });
    }
  }

  res.status(201).json({
    status: 'success',
    data: { demo },
  });
};

/**
 * Assign teacher to demo
 * POST /api/demos/:id/assign
 */
export const assignTeacherToDemo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { teacherId, gmeetLink } = req.body;

  if (!teacherId || !gmeetLink) {
    throw new ApiError(400, 'teacherId and gmeetLink are required');
  }

  const demo = await prisma.demoRequest.findUnique({
    where: { id },
    include: {
      teacher: true,
    },
  });

  if (!demo) {
    throw new ApiError(404, 'Demo request not found');
  }

  if (demo.status !== 'pending') {
    throw new ApiError(400, 'Demo is not in pending status');
  }

  // Check if teacher exists and is available
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher) {
    throw new ApiError(404, 'Teacher not found');
  }

  if (!teacher.isAvailable) {
    throw new ApiError(400, 'Teacher is not available');
  }

  // Update demo with teacher and GMeet link
  const updatedDemo = await prisma.demoRequest.update({
    where: { id },
    data: {
      teacherId,
      gmeetLink,
      status: 'assigned' as DemoStatus,
    },
    include: {
      teacher: {
        include: {
          user: true,
        },
      },
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tableName: 'demo_requests',
      recordId: id,
      action: 'UPDATE',
      oldValues: demo,
      newValues: updatedDemo,
      changedBy: req.user?.userId,
    },
  });

  // Notify teacher
  await prisma.notification.create({
    data: {
      userId: teacher.userId,
      type: 'info',
      message: `Demo assigned: ${demo.subject} for ${demo.parentName} on ${demo.preferredTime.toLocaleString()}`,
      actionUrl: `/teacher/demos/${id}`,
    },
  });

  // Notify parent if parentId exists
  if (demo.parentId) {
    await prisma.notification.create({
      data: {
        userId: demo.parentId,
        type: 'success',
        message: `Demo scheduled with ${teacher.name} for ${demo.subject} on ${demo.preferredTime.toLocaleString()}. GMeet link: ${gmeetLink}`,
      },
    });
  }

  res.json({
    status: 'success',
    data: { demo: updatedDemo },
    message: 'Teacher assigned successfully',
  });
};

/**
 * Record demo outcome
 * POST /api/demos/:id/outcome
 */
export const recordDemoOutcome = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { outcome, notes } = req.body;

  if (!outcome) {
    throw new ApiError(400, 'outcome is required (registered, not_interested, follow_up)');
  }

  const demo = await prisma.demoRequest.findUnique({
    where: { id },
    include: {
      teacher: true,
    },
  });

  if (!demo) {
    throw new ApiError(404, 'Demo request not found');
  }

  if (demo.status !== 'assigned') {
    throw new ApiError(400, 'Demo must be in assigned status to record outcome');
  }

  // Update demo with outcome
  const updatedDemo = await prisma.demoRequest.update({
    where: { id },
    data: {
      outcome: outcome as DemoOutcome,
      status: 'completed' as DemoStatus,
      completedDate: new Date(),
      notes: notes || demo.notes,
    },
    include: {
      teacher: true,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tableName: 'demo_requests',
      recordId: id,
      action: 'UPDATE',
      oldValues: demo,
      newValues: updatedDemo,
      changedBy: req.user?.userId,
    },
  });

  // Update teacher conversion ratio
  if (demo.teacherId) {
    const teacherDemos = await prisma.demoRequest.count({
      where: {
        teacherId: demo.teacherId,
        status: 'completed',
      },
    });

    const convertedDemos = await prisma.demoRequest.count({
      where: {
        teacherId: demo.teacherId,
        status: 'completed',
        outcome: 'registered',
      },
    });

    const conversionRatio = teacherDemos > 0 ? (convertedDemos / teacherDemos) * 100 : 0;

    await prisma.teacher.update({
      where: { id: demo.teacherId },
      data: { conversionRatio },
    });
  }

  // Notify parent
  if (demo.parentId) {
    let message = '';
    if (outcome === 'registered') {
      message = `Demo completed successfully! You can now proceed with registration for ${demo.subject}.`;
    } else if (outcome === 'not_interested') {
      message = `Demo completed. Thank you for your time. Feel free to request another demo anytime.`;
    } else {
      message = `Demo completed. We'll follow up with you soon.`;
    }

    await prisma.notification.create({
      data: {
        userId: demo.parentId,
        type: outcome === 'registered' ? 'success' : 'info',
        message,
        actionUrl: outcome === 'registered' ? `/parent/register` : undefined,
      },
    });
  }

  res.json({
    status: 'success',
    data: { demo: updatedDemo },
    message: 'Demo outcome recorded successfully',
  });
};

/**
 * Get pending demos (for coordinators)
 * GET /api/demos/pending
 */
export const getPendingDemos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const where: any = {
    status: 'pending',
  };

  // For coordinators - only show demos from their department
  if (req.user?.role === 'coordinator' && req.user.departmentId) {
    const students = await prisma.student.findMany({
      where: { departmentId: req.user.departmentId },
      select: { id: true },
    });
    where.studentId = { in: students.map((s) => s.id) };
  }

  const demos = await prisma.demoRequest.findMany({
    where,
    include: {
      student: true,
    },
    orderBy: { preferredTime: 'asc' },
  });

  res.json({
    status: 'success',
    data: { demos },
  });
};
