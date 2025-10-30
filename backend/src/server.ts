import express, { Application } from 'express';
import cors from 'cors';
import 'express-async-errors';
import { config } from './config/env';
import { logger } from './utils/logger';
import { checkDatabaseConnection } from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler';
import routes from './routes';
import { startCronJobs } from './jobs';

const app: Application = express();

// Middleware
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Check database connection
    const isDbConnected = await checkDatabaseConnection();
    if (!isDbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start cron jobs
    if (config.cron.enabled) {
      startCronJobs();
      logger.info('Cron jobs started');
    }

    // Start listening
    app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Frontend URL: ${config.cors.origin}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
