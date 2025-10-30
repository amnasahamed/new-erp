import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { TeacherStatus } from '@prisma/client';

/**
 * Get all teachers (with filters)
 * GET /api/teachers
 */
export const getTeachers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    status,
    subject,
    available,
    page = '1',
    limit = '50',
  } = req.query;

  const where: any = {};

  if (status) {
    where.status = status as TeacherStatus;
  }

  if (subject) {
    where.subject = { contains: subject as string, mode: 'insensitive' };
  }

  if (available !== undefined) {
    where.isAvailable = available === 'true';
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.teacher.count({ where }),
  ]);

  res.json({
    status: 'success',
    data: {
      teachers,
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
 * Get teacher by ID
 * GET /api/teachers/:id
 */
export const getTeacherById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: true,
      availability: true,
      classes: {
        take: 20,
        orderBy: { date: 'desc' },
        include: {
          student: true,
        },
      },
      feedback: {
        take: 10,
        orderBy: { submittedDate: 'desc' },
      },
    },
  });

  if (!teacher) {
    throw new ApiError(404, 'Teacher not found');
  }

  res.json({
    status: 'success',
    data: { teacher },
  });
};

/**
 * Create teacher
 * POST /api/teachers
 */
export const createTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    userId,
    name,
    subject,
    syllabus,
    medium,
    hourlySalary,
    phone,
    teachingStyle,
    gadgets,
    internetType,
  } = req.body;

  if (!userId || !name || !subject || !hourlySalary) {
    throw new ApiError(400, 'userId, name, subject, and hourlySalary are required');
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== 'teacher') {
    throw new ApiError(400, 'User not found or not a teacher');
  }

  // Generate teacher code
  const teacherCount = await prisma.teacher.count();
  const code = `TCH${String(teacherCount + 1).padStart(3, '0')}`;

  // Create teacher
  const teacher = await prisma.teacher.create({
    data: {
      code,
      userId,
      name,
      subject,
      syllabus,
      medium,
      hourlySalary,
      phone,
      teachingStyle,
      gadgets,
      internetType,
      status: 'pending' as TeacherStatus,
    },
    include: {
      user: true,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tableName: 'teachers',
      recordId: teacher.id,
      action: 'INSERT',
      newValues: teacher,
      changedBy: req.user?.userId,
    },
  });

  res.status(201).json({
    status: 'success',
    data: { teacher },
  });
};

/**
 * Update teacher
 * PUT /api/teachers/:id
 */
export const updateTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const updates = req.body;

  const existingTeacher = await prisma.teacher.findUnique({
    where: { id },
  });

  if (!existingTeacher) {
    throw new ApiError(404, 'Teacher not found');
  }

  // Don't allow updating certain fields
  delete updates.id;
  delete updates.code;
  delete updates.userId;

  const teacher = await prisma.teacher.update({
    where: { id },
    data: updates,
    include: {
      user: true,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tableName: 'teachers',
      recordId: id,
      action: 'UPDATE',
      oldValues: existingTeacher,
      newValues: teacher,
      changedBy: req.user?.userId,
    },
  });

  res.json({
    status: 'success',
    data: { teacher },
  });
};

/**
 * Update teacher availability
 * PUT /api/teachers/:id/availability
 */
export const updateTeacherAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { availability } = req.body; // Array of {dayOfWeek, timeSlot, available}

  if (!Array.isArray(availability)) {
    throw new ApiError(400, 'availability must be an array');
  }

  const teacher = await prisma.teacher.findUnique({
    where: { id },
  });

  if (!teacher) {
    throw new ApiError(404, 'Teacher not found');
  }

  // Update or create availability records
  const promises = availability.map((slot: any) =>
    prisma.teacherAvailability.upsert({
      where: {
        teacherId_dayOfWeek_timeSlot: {
          teacherId: id,
          dayOfWeek: slot.dayOfWeek,
          timeSlot: slot.timeSlot,
        },
      },
      update: {
        available: slot.available,
      },
      create: {
        teacherId: id,
        dayOfWeek: slot.dayOfWeek,
        timeSlot: slot.timeSlot,
        available: slot.available,
      },
    })
  );

  await Promise.all(promises);

  // Get updated availability
  const updatedAvailability = await prisma.teacherAvailability.findMany({
    where: { teacherId: id },
    orderBy: [{ dayOfWeek: 'asc' }, { timeSlot: 'asc' }],
  });

  res.json({
    status: 'success',
    data: { availability: updatedAvailability },
  });
};

/**
 * Get teacher schedule
 * GET /api/teachers/:id/schedule
 */
export const getTeacherSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;

  const where: any = {
    teacherId: id,
  };

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  const classes = await prisma.class.findMany({
    where,
    include: {
      student: true,
    },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });

  res.json({
    status: 'success',
    data: { classes },
  });
};

/**
 * Get teacher salary preview
 * GET /api/teachers/:id/salary
 */
export const getTeacherSalary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { month } = req.query; // Format: YYYY-MM

  const teacher = await prisma.teacher.findUnique({
    where: { id },
  });

  if (!teacher) {
    throw new ApiError(404, 'Teacher not found');
  }

  let startDate: Date;
  let endDate: Date;

  if (month) {
    const [year, monthNum] = (month as string).split('-');
    startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    endDate = new Date(parseInt(year), parseInt(monthNum), 0);
  } else {
    // Current month
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  // Get all billed classes for this teacher in the month
  const classes = await prisma.class.findMany({
    where: {
      teacherId: id,
      date: {
        gte: startDate,
        lte: endDate,
      },
      billingStatus: 'billed',
    },
  });

  // Calculate hours and salary
  const totalMinutes = classes.reduce((sum, cls) => sum + cls.duration, 0);
  const hoursTaught = totalMinutes / 60;
  const grossSalary = hoursTaught * teacher.hourlySalary;
  const gst = grossSalary * 0.18; // 18% GST
  const netSalary = grossSalary + gst;

  res.json({
    status: 'success',
    data: {
      month: month || `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`,
      hoursTaught,
      hourlyRate: teacher.hourlySalary,
      grossSalary,
      gst,
      netSalary,
      classCount: classes.length,
    },
  });
};
