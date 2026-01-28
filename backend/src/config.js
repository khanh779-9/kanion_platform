import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  dbUrl: process.env.DATABASE_URL || 'postgres://postgres:G0Lp3NJdGCjy6P2e@db.cmcbomljqmmbkzjbthcw.supabase.co:5432/kanion_database',
  jwtSecret: process.env.JWT_SECRET || 'devsecret',
  nodeEnv: process.env.NODE_ENV || 'development'
};
