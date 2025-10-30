import prisma from '../config/database';
import { logger } from '../utils/logger';

/**
 * Process 24-hour billing
 *
 * Business Rule: Balance not deducted immediately after attendance marking.
 * Deduction happens at T+24h if no dispute is raised.
 *
 * This job:
 * 1. Finds all classes marked 24+ hours ago
 * 2. Checks if they have billing_status = 'pending'
 * 3. Checks if there's no dispute
 * 4. Deducts balance from student
 * 5. Creates ledger entry
 * 6. Updates billing_status to 'billed'
 */
export async function process24HourBilling() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  logger.info(`Checking for classes to bill (marked before ${twentyFourHoursAgo.toISOString()})`);

  // Find classes that need billing
  const classesToBill = await prisma.class.findMany({
    where: {
      attendanceMarked: true,
      billingStatus: 'pending',
      markedAt: {
        lte: twentyFourHoursAgo,
      },
      // No active disputes
      disputes: {
        none: {
          status: { in: ['open', 'escalated'] },
        },
      },
    },
    include: {
      student: true,
      teacher: true,
    },
  });

  logger.info(`Found ${classesToBill.length} classes to bill`);

  let successCount = 0;
  let errorCount = 0;

  for (const classSession of classesToBill) {
    try {
      // Calculate fee (duration in minutes * hourly rate / 60)
      const hourlyRate = classSession.teacher.hourlySalary;
      const hours = classSession.duration / 60;
      const fee = hours * hourlyRate;

      // Check if student has sufficient balance
      if (classSession.student.balance < fee) {
        logger.warn(
          `Student ${classSession.student.code} has insufficient balance (${classSession.student.balance} < ${fee}). Skipping billing.`
        );
        continue;
      }

      // Start transaction
      await prisma.$transaction(async (tx) => {
        // Update student balance
        const newBalance = classSession.student.balance - fee;
        const newBalanceHours = classSession.student.balanceHours - hours;

        await tx.student.update({
          where: { id: classSession.studentId },
          data: {
            balance: newBalance,
            balanceHours: Math.max(0, newBalanceHours), // Don't go negative
          },
        });

        // Create ledger entry
        await tx.accountLedger.create({
          data: {
            date: new Date(),
            studentId: classSession.studentId,
            particulars: `Class - ${classSession.subject}`,
            credit: 0,
            debit: fee,
            balance: newBalance,
            narration: `${classSession.subject} class on ${classSession.date.toISOString().split('T')[0]} with teacher ${classSession.teacher.name}. Duration: ${classSession.duration} mins.`,
          },
        });

        // Update class billing status
        await tx.class.update({
          where: { id: classSession.id },
          data: {
            billingStatus: 'billed',
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            tableName: 'classes',
            recordId: classSession.id,
            action: 'UPDATE',
            newValues: {
              billingStatus: 'billed',
              balanceDeducted: fee,
            },
          },
        });

        // Create notification for parent
        await tx.notification.create({
          data: {
            userId: classSession.student.parentId,
            type: 'info',
            message: `₹${fee.toFixed(2)} deducted for ${classSession.subject} class on ${classSession.date.toISOString().split('T')[0]}. New balance: ₹${newBalance.toFixed(2)}`,
          },
        });

        // Check for low balance and send warning
        if (newBalance < 500) {
          await tx.notification.create({
            data: {
              userId: classSession.student.parentId,
              type: 'warning',
              message: `Low Balance Warning: Only ₹${newBalance.toFixed(2)} remaining. Please recharge to avoid auto-pause.`,
            },
          });
        }
      });

      successCount++;
      logger.info(
        `Successfully billed class ${classSession.id} for student ${classSession.student.code}. Fee: ₹${fee}`
      );
    } catch (error) {
      errorCount++;
      logger.error(
        `Failed to bill class ${classSession.id} for student ${classSession.student.code}:`,
        error
      );
    }
  }

  logger.info(
    `24-hour billing completed. Success: ${successCount}, Errors: ${errorCount}`
  );

  return {
    total: classesToBill.length,
    success: successCount,
    errors: errorCount,
  };
}
