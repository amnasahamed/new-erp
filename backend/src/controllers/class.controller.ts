import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { ClassStatus } from '@prisma/client';

/**
 * Get all classes (with filters)
 * GET /api/classes
 */
export const getClasses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    status,
    teacherId,
    studentId,
    startDate,
    endDate,
    page = '1',
    limit = '50',
  } = req.query;

  const where: any = {};

  if (status) {
    where.status = status as ClassStatus;
  }

  if (teacherId) {
    where.teacherId = teacherId as string;
  }

  if (studentId) {
    where.studentId = studentId as string;
  }

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  // For teachers - only show their classes
  if (req.user?.role === 'teacher') {
    const teacher = await prisma.teacher.findFirst({
      where: { userId: req.user.userId },
    });
    if (teacher) {
      where.teacherId = teacher.id;
    }
  }

  // For parents - only show their children's classes
  if (req.user?.role === 'parent') {
    const students = await prisma.student.findMany({
      where: { parentId: req.user.userId },
      select: { id: true },
    });
    where.studentId = { in: students.map((s) => s.id) };
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const [classes, total] = await Promise.all([
    prisma.class.findMany({
      where,
      include: {
        teacher: true,
        student: true,
      },
      skip,
      take,
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
    }),
    prisma.class.count({ where }),
  ]);

  res.json({
    status: 'success',
    data: {
      classes,
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
 * Get class by ID
 * GET /api/classes/:id
 */
export const getClassById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const classSession = await prisma.class.findUnique({
    where: { id },
    include: {
      teacher: true,
      student: {
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      disputes: true,
    },
  });

  if (!classSession) {
    throw new ApiError(404, 'Class not found');
  }

  res.json({
    status: 'success',
    data: { class: classSession },
  });
};

/**
 * Mark attendance
 * POST /api/classes/:id/attendance
 */
export const markAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { duration, topic, homework, teacherJoined, studentJoined } = req.body;

  const classSession = await prisma.class.findUnique({
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

  if (!classSession) {
    throw new ApiError(404, 'Class not found');
  }

  // Check if user is the assigned teacher
  if (req.user?.role === 'teacher') {
    const teacher = await prisma.teacher.findFirst({
      where: { userId: req.user.userId },
    });
    if (teacher?.id !== classSession.teacherId) {
      throw new ApiError(403, 'You can only mark attendance for your own classes');
    }
  }

  // Check if attendance already marked
  if (classSession.attendanceMarked) {
    throw new ApiError(400, 'Attendance already marked for this class');
  }

  // Update class with attendance
  const updatedClass = await prisma.class.update({
    where: { id },
    data: {
      attendanceMarked: true,
      markedAt: new Date(),
      billingStatus: 'pending', // Set to pending for 24-hour grace period
      status: 'completed' as ClassStatus,
      duration: duration || classSession.duration,
      topic,
      homework,
      teacherJoined: teacherJoined !== undefined ? teacherJoined : true,
      studentJoined: studentJoined !== undefined ? studentJoined : true,
    },
    include: {
      student: {
        include: {
          parent: true,
        },
      },
      teacher: true,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tableName: 'classes',
      recordId: id,
      action: 'UPDATE',
      oldValues: classSession,
      newValues: updatedClass,
      changedBy: req.user?.userId,
    },
  });

  // Create notification for parent
  await prisma.notification.create({
    data: {
      userId: classSession.student.parentId,
      type: 'info',
      message: `Attendance marked for ${classSession.subject} class on ${classSession.date.toISOString().split('T')[0]}. Balance will be deducted in 24 hours if no dispute is raised.`,
      actionUrl: `/parent/classes/${id}`,
    },
  });

  res.json({
    status: 'success',
    data: { class: updatedClass },
    message: 'Attendance marked successfully. Balance will be deducted after 24-hour grace period.',
  });
};

/**
 * Cancel class
 * POST /api/classes/:id/cancel
 */
export const cancelClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { reason } = req.body;

  const classSession = await prisma.class.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          parent: true,
        },
      },
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

  // Check if class can be cancelled
  if (classSession.status !== 'upcoming') {
    throw new ApiError(400, 'Only upcoming classes can be cancelled');
  }

  // Business Rule: Free cancellation only if ≥2 hours before class start
  const classDateTime = new Date(classSession.date);
  const [hours, minutes] = classSession.time.toISOString().split('T')[1].split(':').map(Number);
  classDateTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const hoursUntilClass = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilClass < 2) {
    throw new ApiError(
      400,
      'Classes can only be cancelled at least 2 hours before start time. ' +
      `This class is in ${hoursUntilClass.toFixed(1)} hours.`
    );
  }

  // Cancel the class
  const cancelledClass = await prisma.class.update({
    where: { id },
    data: {
      status: 'cancelled' as ClassStatus,
      cancelledAt: new Date(),
      cancellationReason: reason || 'Cancelled by parent',
    },
    include: {
      student: true,
      teacher: true,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tableName: 'classes',
      recordId: id,
      action: 'UPDATE',
      oldValues: classSession,
      newValues: cancelledClass,
      changedBy: req.user?.userId,
    },
  });

  // Business Rule: Auto-notify teacher on cancellation
  await prisma.notification.create({
    data: {
      userId: classSession.teacher.userId,
      type: 'warning',
      message: `Class cancelled: ${classSession.subject} on ${classSession.date.toISOString().split('T')[0]} with student ${classSession.student.name}. Reason: ${reason || 'Not specified'}`,
      actionUrl: `/teacher/classes/${id}`,
    },
  });

  // Notify parent
  await prisma.notification.create({
    data: {
      userId: classSession.student.parentId,
      type: 'info',
      message: `Class cancelled successfully: ${classSession.subject} on ${classSession.date.toISOString().split('T')[0]}`,
    },
  });

  res.json({
    status: 'success',
    data: { class: cancelledClass },
    message: 'Class cancelled successfully. Teacher has been notified.',
  });
};

/**
 * Join class (update joined status)
 * POST /api/classes/:id/join
 */
export const joinClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { role } = req.body; // 'teacher' or 'student'

  const classSession = await prisma.class.findUnique({
    where: { id },
  });

  if (!classSession) {
    throw new ApiError(404, 'Class not found');
  }

  const updateData: any = {
    status: 'ongoing' as ClassStatus,
  };

  if (role === 'teacher') {
    updateData.teacherJoined = true;
  } else if (role === 'student') {
    updateData.studentJoined = true;
  }

  const updatedClass = await prisma.class.update({
    where: { id },
    data: updateData,
  });

  res.json({
    status: 'success',
    data: { class: updatedClass },
  });
};

/**
 * Get upcoming classes (for dashboards)
 * GET /api/classes/upcoming
 */
export const getUpcomingClasses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { limit = '10' } = req.query;

  const where: any = {
    status: 'upcoming',
    date: {
      gte: new Date(),
    },
  };

  // Filter by role
  if (req.user?.role === 'teacher') {
    const teacher = await prisma.teacher.findFirst({
      where: { userId: req.user.userId },
    });
    if (teacher) {
      where.teacherId = teacher.id;
    }
  } else if (req.user?.role === 'parent') {
    const students = await prisma.student.findMany({
      where: { parentId: req.user.userId },
      select: { id: true },
    });
    where.studentId = { in: students.map((s) => s.id) };
  }

  const classes = await prisma.class.findMany({
    where,
    include: {
      teacher: true,
      student: true,
    },
    take: parseInt(limit as string),
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });

  res.json({
    status: 'success',
    data: { classes },
  });
};

/**
 * Get today's live classes (for admin monitoring)
 * GET /api/classes/live
 */
export const getLiveClasses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const classes = await prisma.class.findMany({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
      status: {
        in: ['upcoming', 'ongoing'],
      },
    },
    include: {
      teacher: true,
      student: true,
    },
    orderBy: { time: 'asc' },
  });

  res.json({
    status: 'success',
    data: { classes },
  });
};
