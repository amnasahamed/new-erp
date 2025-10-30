import prisma from '../config/database';
import { logger } from '../utils/logger';

/**
 * Generate classes from timetable
 *
 * This job runs daily at 1 AM and:
 * 1. Looks at all active recurring timetables
 * 2. Generates classes for the next 7 days
 * 3. Skips if class already exists
 * 4. Only creates for active/ongoing students
 */
export async function generateDailyClasses() {
  logger.info('Generating classes from timetable...');

  // Get all active timetables for ongoing students
  const timetables = await prisma.timetable.findMany({
    where: {
      isActive: true,
      student: {
        status: 'ongoing',
      },
    },
    include: {
      student: true,
      teacher: true,
    },
  });

  logger.info(`Found ${timetables.length} active timetables`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let classesCreated = 0;
  let classesSkipped = 0;
  let errors = 0;

  // Generate for next 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayOffset);
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 6 = Saturday

    logger.info(
      `Processing date: ${targetDate.toISOString().split('T')[0]} (day ${dayOfWeek})`
    );

    for (const timetable of timetables) {
      try {
        // Skip if this is a specific date timetable and date doesn't match
        if (!timetable.recurring && timetable.specificDate) {
          const specificDate = new Date(timetable.specificDate);
          specificDate.setHours(0, 0, 0, 0);
          if (targetDate.getTime() !== specificDate.getTime()) {
            continue;
          }
        }

        // Skip if this is a recurring timetable and day doesn't match
        if (timetable.recurring && timetable.dayOfWeek !== dayOfWeek) {
          continue;
        }

        // Check if class already exists
        const existingClass = await prisma.class.findFirst({
          where: {
            studentId: timetable.studentId,
            teacherId: timetable.teacherId,
            date: targetDate,
            time: timetable.time,
          },
        });

        if (existingClass) {
          classesSkipped++;
          continue;
        }

        // Create class
        await prisma.class.create({
          data: {
            date: targetDate,
            time: timetable.time,
            subject: timetable.subject,
            teacherId: timetable.teacherId,
            studentId: timetable.studentId,
            duration: timetable.duration,
            gmeetLink: timetable.gmeetLink || timetable.student.gmeetLink || '',
            status: 'upcoming',
          },
        });

        classesCreated++;
        logger.debug(
          `Created class for student ${timetable.student.code} on ${targetDate.toISOString().split('T')[0]}`
        );
      } catch (error) {
        errors++;
        logger.error(
          `Failed to create class for timetable ${timetable.id}:`,
          error
        );
      }
    }
  }

  logger.info(
    `Class generation completed. Created: ${classesCreated}, Skipped (already exists): ${classesSkipped}, Errors: ${errors}`
  );

  return {
    created: classesCreated,
    skipped: classesSkipped,
    errors,
  };
}
