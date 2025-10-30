import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  cron: {
    enabled: process.env.ENABLE_CRON_JOBS === 'true',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  whatsapp: {
    apiKey: process.env.WHATSAPP_API_KEY || '',
    apiUrl: process.env.WHATSAPP_API_URL || '',
  },
} as const;

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is not set. Please set it in .env file');
}

if (process.env.JWT_SECRET === 'fallback-secret-change-in-production' && config.nodeEnv === 'production') {
  throw new Error('JWT_SECRET must be set in production environment');
}
