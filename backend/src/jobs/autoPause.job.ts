import prisma from '../config/database';
import { logger } from '../utils/logger';

/**
 * Auto-pause students with zero or insufficient balance
 *
 * Business Rule: Auto-pause timetable when student balance = 0 (or insufficient for next class)
 *
 * This job:
 * 1. Finds all 'ongoing' students
 * 2. Checks if balance is 0 or < minimum class fee (assume 250 as min)
 * 3. Pauses the student
 * 4. Deactivates all their timetables
 * 5. Sends notification to parent
 */
export async function processAutoPause() {
  const MIN_BALANCE_THRESHOLD = 250; // Minimum ₹250 required to continue

  logger.info('Checking for students to auto-pause...');

  // Find ongoing students with balance below threshold
  const studentsToP pause = await prisma.student.findMany({
    where: {
      status: 'ongoing',
      balance: {
        lte: MIN_BALANCE_THRESHOLD,
      },
    },
    include: {
      parent: true,
      timetables: {
        where: { isActive: true },
      },
    },
  });

  logger.info(`Found ${studentsToP pause.length} students to auto-pause`);

  let successCount = 0;
  let errorCount = 0;

  for (const student of studentsToP pause) {
    try {
      await prisma.$transaction(async (tx) => {
        // Update student status to paused
        await tx.student.update({
          where: { id: student.id },
          data: { status: 'paused' },
        });

        // Deactivate all active timetables
        await tx.timetable.updateMany({
          where: {
            studentId: student.id,
            isActive: true,
          },
          data: { isActive: false },
        });

        // Cancel all upcoming classes
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await tx.class.updateMany({
          where: {
            studentId: student.id,
            status: 'upcoming',
            date: {
              gte: today,
            },
          },
          data: {
            status: 'cancelled',
            cancelledAt: new Date(),
            cancellationReason: 'Auto-paused due to insufficient balance',
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            tableName: 'students',
            recordId: student.id,
            action: 'UPDATE',
            oldValues: { status: 'ongoing' },
            newValues: {
              status: 'paused',
              reason: 'Auto-paused due to balance ≤ ₹' + MIN_BALANCE_THRESHOLD,
            },
          },
        });

        // Create notification for parent
        await tx.notification.create({
          data: {
            userId: student.parentId,
            type: 'error',
            message: `URGENT: Student ${student.name}'s classes have been automatically paused due to insufficient balance (₹${student.balance}). Please recharge to resume classes.`,
            actionUrl: `/parent/recharge/${student.id}`,
          },
        });

        // Notify coordinator if department is known
        if (student.departmentId) {
          // Find coordinators for this department
          const coordinators = await tx.user.findMany({
            where: {
              role: 'coordinator',
              departmentId: student.departmentId,
              isActive: true,
            },
          });

          for (const coordinator of coordinators) {
            await tx.notification.create({
              data: {
                userId: coordinator.id,
                type: 'warning',
                message: `Student ${student.code} (${student.name}) has been auto-paused due to insufficient balance.`,
                actionUrl: `/coordinator/students/${student.id}`,
              },
            });
          }
        }
      });

      successCount++;
      logger.info(
        `Successfully auto-paused student ${student.code} (${student.name}). Balance: ₹${student.balance}`
      );
    } catch (error) {
      errorCount++;
      logger.error(
        `Failed to auto-pause student ${student.code} (${student.name}):`,
        error
      );
    }
  }

  logger.info(
    `Auto-pause completed. Success: ${successCount}, Errors: ${errorCount}`
  );

  return {
    total: studentsToP pause.length,
    success: successCount,
    errors: errorCount,
  };
}
