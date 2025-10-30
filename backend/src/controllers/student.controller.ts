import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { generateStudentCode } from '../utils/auth';
import { StudentStatus, Department } from '@prisma/client';

/**
 * Get all students (with filters)
 * GET /api/students
 */
export const getStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    status,
    department,
    lowBalance,
    page = '1',
    limit = '50',
  } = req.query;

  const where: any = {};

  // Apply filters
  if (status) {
    where.status = status;
  }

  if (department) {
    const dept = await prisma.departmentModel.findUnique({
      where: { code: department as Department },
    });
    if (dept) {
      where.departmentId = dept.id;
    }
  }

  // Department access control for coordinators
  if (req.user?.role === 'coordinator' && req.user.departmentId) {
    where.departmentId = req.user.departmentId;
  }

  // Low balance filter (< 500)
  if (lowBalance === 'true') {
    where.balance = { lt: 500 };
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        department: true,
        parent: {
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
    prisma.student.count({ where }),
  ]);

  res.json({
    status: 'success',
    data: {
      students,
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
 * Get student by ID
 * GET /api/students/:id
 */
export const getStudentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      department: true,
      parent: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      classes: {
        take: 10,
        orderBy: { date: 'desc' },
        include: {
          teacher: true,
        },
      },
      disputes: {
        where: { status: 'open' },
      },
    },
  });

  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  // Check department access
  if (
    req.user?.role === 'coordinator' &&
    student.departmentId !== req.user.departmentId
  ) {
    throw new ApiError(403, 'Access denied to this student');
  }

  res.json({
    status: 'success',
    data: { student },
  });
};

/**
 * Create student (after demo conversion)
 * POST /api/students
 */
export const createStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    departmentId,
    parentId,
    classSyllabus,
    gmeetLink,
    parentWhatsapp,
    demoRequestId,
  } = req.body;

  // Validate required fields
  if (!name || !departmentId || !parentId) {
    throw new ApiError(400, 'Name, departmentId, and parentId are required');
  }

  // Check if demo request exists and is converted
  if (demoRequestId) {
    const demo = await prisma.demoRequest.findUnique({
      where: { id: demoRequestId },
    });

    if (!demo) {
      throw new ApiError(404, 'Demo request not found');
    }

    if (demo.outcome !== 'registered') {
      throw new ApiError(
        400,
        'Demo must be marked as converted before creating student'
      );
    }
  }

  // Generate student code
  const studentCount = await prisma.student.count();
  const code = generateStudentCode(studentCount);

  // Create student
  const student = await prisma.student.create({
    data: {
      code,
      name,
      departmentId,
      parentId,
      classSyllabus,
      gmeetLink,
      parentWhatsapp,
      status: 'ongoing' as StudentStatus,
      demoCompletedDate: new Date(),
    },
    include: {
      department: true,
      parent: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Update demo request if provided
  if (demoRequestId) {
    await prisma.demoRequest.update({
      where: { id: demoRequestId },
      data: { studentId: student.id },
    });
  }

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tableName: 'students',
      recordId: student.id,
      action: 'INSERT',
      newValues: student,
      changedBy: req.user?.userId,
    },
  });

  // Create notification for parent
  await prisma.notification.create({
    data: {
      userId: parentId,
      type: 'success',
      message: `Welcome! Student ${name} has been successfully registered.`,
    },
  });

  res.status(201).json({
    status: 'success',
    data: { student },
  });
};

/**
 * Update student
 * PUT /api/students/:id
 */
export const updateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const updates = req.body;

  // Get existing student
  const existingStudent = await prisma.student.findUnique({
    where: { id },
  });

  if (!existingStudent) {
    throw new ApiError(404, 'Student not found');
  }

  // Check department access
  if (
    req.user?.role === 'coordinator' &&
    existingStudent.departmentId !== req.user.departmentId
  ) {
    throw new ApiError(403, 'Access denied to this student');
  }

  // Don't allow updating certain fields
  delete updates.id;
  delete updates.code;
  delete updates.balance;
  delete updates.balanceHours;

  // Update student
  const student = await prisma.student.update({
    where: { id },
    data: updates,
    include: {
      department: true,
      parent: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tableName: 'students',
      recordId: id,
      action: 'UPDATE',
      oldValues: existingStudent,
      newValues: student,
      changedBy: req.user?.userId,
    },
  });

  res.json({
    status: 'success',
    data: { student },
  });
};

/**
 * Pause student
 * POST /api/students/:id/pause
 */
export const pauseStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const student = await prisma.student.update({
    where: { id },
    data: { status: 'paused' as StudentStatus },
    include: {
      parent: true,
    },
  });

  // Pause all active timetables
  await prisma.timetable.updateMany({
    where: { studentId: id, isActive: true },
    data: { isActive: false },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: student.parentId,
      type: 'warning',
      message: `Student ${student.name}'s classes have been paused.`,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tableName: 'students',
      recordId: id,
      action: 'UPDATE',
      newValues: { status: 'paused' },
      changedBy: req.user?.userId,
    },
  });

  res.json({
    status: 'success',
    data: { student },
    message: 'Student paused successfully',
  });
};

/**
 * Resume student
 * POST /api/students/:id/resume
 */
export const resumeStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const student = await prisma.student.findUnique({
    where: { id },
  });

  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  // Check if student has sufficient balance
  if (student.balance < 250) {
    throw new ApiError(
      400,
      'Cannot resume student with insufficient balance. Please recharge first.'
    );
  }

  const updatedStudent = await prisma.student.update({
    where: { id },
    data: { status: 'ongoing' as StudentStatus },
    include: {
      parent: true,
    },
  });

  // Resume all paused timetables
  await prisma.timetable.updateMany({
    where: { studentId: id, isActive: false },
    data: { isActive: true },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: updatedStudent.parentId,
      type: 'success',
      message: `Student ${updatedStudent.name}'s classes have been resumed.`,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tableName: 'students',
      recordId: id,
      action: 'UPDATE',
      newValues: { status: 'ongoing' },
      changedBy: req.user?.userId,
    },
  });

  res.json({
    status: 'success',
    data: { student: updatedStudent },
    message: 'Student resumed successfully',
  });
};

/**
 * Get student balance
 * GET /api/students/:id/balance
 */
export const getStudentBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const student = await prisma.student.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      code: true,
      balance: true,
      balanceHours: true,
      status: true,
    },
  });

  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  res.json({
    status: 'success',
    data: { student },
  });
};
