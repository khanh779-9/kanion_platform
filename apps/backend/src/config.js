import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'devsecret',
  nodeEnv: process.env.NODE_ENV || 'development',
  runMigrations: process.env.RUN_MIGRATIONS === 'true'
};
