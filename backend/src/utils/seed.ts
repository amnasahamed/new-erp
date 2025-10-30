import prisma from '../config/database';
import { hashPassword } from './auth';
import { logger } from './logger';

async function seed() {
  logger.info('Starting database seed...');

  try {
    // Create departments
    logger.info('Creating departments...');
    const departments = await Promise.all([
      prisma.departmentModel.upsert({
        where: { code: 'AA' },
        update: {},
        create: {
          code: 'AA',
          name: 'Department AA',
          whatsappNumber: '+919876543210',
        },
      }),
      prisma.departmentModel.upsert({
        where: { code: 'BB' },
        update: {},
        create: {
          code: 'BB',
          name: 'Department BB',
          whatsappNumber: '+919876543211',
        },
      }),
      prisma.departmentModel.upsert({
        where: { code: 'CC' },
        update: {},
        create: {
          code: 'CC',
          name: 'Department CC',
          whatsappNumber: '+919876543212',
        },
      }),
    ]);

    // Create admin user (password: 01-01-1990)
    logger.info('Creating admin user...');
    const adminPassword = await hashPassword('01-01-1990');
    const admin = await prisma.user.upsert({
      where: { email: 'admin@clapslearn.com' },
      update: {},
      create: {
        userCode: 'ADM001',
        name: 'Admin User',
        email: 'admin@clapslearn.com',
        passwordHash: adminPassword,
        role: 'admin',
        phone: '+919876543200',
      },
    });

    // Create coordinator (password: 15-03-1985)
    logger.info('Creating coordinator...');
    const coordinatorPassword = await hashPassword('15-03-1985');
    const coordinator = await prisma.user.upsert({
      where: { email: 'coordinator@clapslearn.com' },
      update: {},
      create: {
        userCode: 'CRD001',
        name: 'Coordinator AA',
        email: 'coordinator@clapslearn.com',
        passwordHash: coordinatorPassword,
        role: 'coordinator',
        departmentId: departments[0].id,
        phone: '+919876543201',
      },
    });

    // Create HR user (password: 20-06-1988)
    logger.info('Creating HR user...');
    const hrPassword = await hashPassword('20-06-1988');
    const hr = await prisma.user.upsert({
      where: { email: 'hr@clapslearn.com' },
      update: {},
      create: {
        userCode: 'HR001',
        name: 'HR Manager',
        email: 'hr@clapslearn.com',
        passwordHash: hrPassword,
        role: 'hr',
        phone: '+919876543202',
      },
    });

    // Create accountant (password: 10-12-1987)
    logger.info('Creating accountant...');
    const accountantPassword = await hashPassword('10-12-1987');
    const accountant = await prisma.user.upsert({
      where: { email: 'accountant@clapslearn.com' },
      update: {},
      create: {
        userCode: 'ACC001',
        name: 'Accountant',
        email: 'accountant@clapslearn.com',
        passwordHash: accountantPassword,
        role: 'accountant',
        phone: '+919876543203',
      },
    });

    // Create parent user (password: 05-08-1985)
    logger.info('Creating parent user...');
    const parentPassword = await hashPassword('05-08-1985');
    const parent = await prisma.user.upsert({
      where: { email: 'parent@example.com' },
      update: {},
      create: {
        userCode: 'PAR001',
        name: 'Suresh Kumar (Parent)',
        email: 'parent@example.com',
        passwordHash: parentPassword,
        role: 'parent',
        phone: '+919876543204',
        whatsapp: '+919876543204',
      },
    });

    // Create teacher (password: 12-09-1992)
    logger.info('Creating teacher...');
    const teacherUserPassword = await hashPassword('12-09-1992');
    const teacherUser = await prisma.user.upsert({
      where: { email: 'teacher@clapslearn.com' },
      update: {},
      create: {
        userCode: 'TCH001-USR',
        name: 'Rajesh Menon (Teacher)',
        email: 'teacher@clapslearn.com',
        passwordHash: teacherUserPassword,
        role: 'teacher',
        phone: '+919876543205',
      },
    });

    const teacher = await prisma.teacher.upsert({
      where: { code: 'TCH001' },
      update: {},
      create: {
        code: 'TCH001',
        userId: teacherUser.id,
        name: 'Rajesh Menon',
        subject: 'Mathematics',
        syllabus: 'CBSE, ICSE, State Board',
        medium: 'English, Malayalam',
        rating: 4.5,
        conversionRatio: 72.5,
        hourlySalary: 250,
        status: 'active',
        phone: '+919876543205',
        teachingStyle: 'Interactive and concept-focused teaching',
        gadgets: 'Laptop, Wacom Tablet, Good quality webcam',
        internetType: 'Broadband 100 Mbps',
        isAvailable: true,
      },
    });

    // Create student
    logger.info('Creating student...');
    const student = await prisma.student.upsert({
      where: { code: 'STU001' },
      update: {},
      create: {
        code: 'STU001',
        name: 'Arjun Kumar',
        departmentId: departments[0].id,
        parentId: parent.id,
        balance: 2500,
        balanceHours: 10.0,
        status: 'ongoing',
        classSyllabus: 'CBSE Class 10',
        gmeetLink: 'https://meet.google.com/abc-defg-hij',
        parentWhatsapp: '+919876543204',
        demoCompletedDate: new Date('2025-10-01'),
        firstClassDate: new Date('2025-10-05'),
      },
    });

    // Create demo request
    logger.info('Creating demo request...');
    await prisma.demoRequest.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        parentName: 'Lakshmi Nair',
        studentName: 'Priya',
        preferredTime: new Date('2025-11-01T14:00:00Z'),
        subject: 'Physics',
        status: 'pending',
        notes: 'Interested in physics tutoring for Class 9',
      },
    });

    // Create timetable for student
    logger.info('Creating timetable...');
    await prisma.timetable.create({
      data: {
        studentId: student.id,
        teacherId: teacher.id,
        subject: 'Mathematics',
        dayOfWeek: 1, // Monday
        time: new Date('1970-01-01T10:00:00Z'),
        duration: 60,
        recurring: true,
        gmeetLink: student.gmeetLink,
        isActive: true,
      },
    });

    // Create teacher availability
    logger.info('Creating teacher availability...');
    const days = [1, 2, 3, 4, 5]; // Monday to Friday
    const timeSlots = ['10:00 AM', '2:00 PM', '4:00 PM'];

    for (const day of days) {
      for (const slot of timeSlots) {
        await prisma.teacherAvailability.create({
          data: {
            teacherId: teacher.id,
            dayOfWeek: day,
            timeSlot: slot,
            available: true,
          },
        });
      }
    }

    // Create a sample class
    logger.info('Creating sample class...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 0, 0, 0);

    await prisma.class.create({
      data: {
        date: yesterday,
        time: new Date('1970-01-01T10:00:00Z'),
        subject: 'Mathematics',
        teacherId: teacher.id,
        studentId: student.id,
        duration: 60,
        gmeetLink: student.gmeetLink!,
        status: 'completed',
        attendanceMarked: true,
        markedAt: new Date(yesterday.getTime() + 65 * 60 * 1000), // 65 minutes after start
        billingStatus: 'pending', // Will be billed by cron job
        topic: 'Quadratic Equations',
        homework: 'Complete exercises 1-10 from chapter 4',
        teacherJoined: true,
        studentJoined: true,
      },
    });

    // Create ledger entry (initial payment)
    logger.info('Creating ledger entry...');
    await prisma.accountLedger.create({
      data: {
        date: new Date('2025-10-01'),
        studentId: student.id,
        particulars: 'Initial payment',
        credit: 2500,
        debit: 0,
        balance: 2500,
        invoiceNo: 'INV-20251001-001',
        narration: 'Initial payment via UPI - Registration fee',
        paymentOrigin: 'domestic',
        createdBy: coordinator.id,
      },
    });

    logger.info('Seed completed successfully!');
    logger.info('\n=== Test Credentials ===');
    logger.info('Admin: admin@clapslearn.com / 01-01-1990');
    logger.info('Coordinator: coordinator@clapslearn.com / 15-03-1985');
    logger.info('Teacher: teacher@clapslearn.com / 12-09-1992');
    logger.info('Parent: parent@example.com / 05-08-1985');
    logger.info('HR: hr@clapslearn.com / 20-06-1988');
    logger.info('Accountant: accountant@clapslearn.com / 10-12-1987');
    logger.info('========================\n');
  } catch (error) {
    logger.error('Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      logger.info('Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed script failed:', error);
      process.exit(1);
    });
}

export default seed;
