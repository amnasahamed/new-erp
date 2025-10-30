import cron from 'node-cron';
import { logger } from '../utils/logger';
import { process24HourBilling } from './billing.job';
import { processAutoPause } from './autoPause.job';
import { generateDailyClasses } from './generateClasses.job';

/**
 * Start all cron jobs
 */
export function startCronJobs() {
  logger.info('Starting cron jobs...');

  // Process 24-hour billing - runs every hour
  // Checks for classes marked 24+ hours ago and bills them
  cron.schedule('0 * * * *', async () => {
    logger.info('Running 24-hour billing job...');
    try {
      await process24HourBilling();
      logger.info('24-hour billing job completed successfully');
    } catch (error) {
      logger.error('24-hour billing job failed:', error);
    }
  });

  // Auto-pause students with zero balance - runs every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    logger.info('Running auto-pause job...');
    try {
      await processAutoPause();
      logger.info('Auto-pause job completed successfully');
    } catch (error) {
      logger.error('Auto-pause job failed:', error);
    }
  });

  // Generate classes from timetable - runs daily at 1 AM
  cron.schedule('0 1 * * *', async () => {
    logger.info('Running generate classes job...');
    try {
      await generateDailyClasses();
      logger.info('Generate classes job completed successfully');
    } catch (error) {
      logger.error('Generate classes job failed:', error);
    }
  });

  logger.info('All cron jobs scheduled successfully');
}
