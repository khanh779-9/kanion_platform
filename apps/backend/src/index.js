import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { ensureMigrations } from './db/migrate.js';
import { rateLimit } from './middleware/rateLimit.js';

import authRoutes from './routes/auth.js';
import vaultRoutes from './routes/vault.js';
import notesRoutes from './routes/notes.js';
import userRoutes from './routes/user.js';
import breachRoutes from './routes/breach.js';
import walletRoutes from './routes/wallet.js';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', rateLimit('auth'), authRoutes);
app.use('/api/vault', rateLimit('api'), vaultRoutes);
app.use('/api/notes', rateLimit('api'), notesRoutes);
app.use('/api/user', rateLimit('api'), userRoutes);
app.use('/api/breach', rateLimit('api'), breachRoutes);
app.use('/api/wallet', rateLimit('api'), walletRoutes);


// Initialize database migrations
async function start() {
  try {
    // Only run migrations if DATABASE_URL is set and RUN_MIGRATIONS is true
    if (config.dbUrl && config.runMigrations) {
      console.log('Running migrations...');
      await ensureMigrations();
      console.log('Migrations completed');
    } else if (!config.dbUrl) {
      console.warn('⚠️  DATABASE_URL not set. Skipping migrations. Set RUN_MIGRATIONS=true to run.');
    }
  } catch (e) {
    console.error('Migration failed:', e.message);
    // Don't exit - still start server to allow debugging
    console.warn('Server starting despite migration error...');
  }

  app.listen(config.port, () => {
    console.log(`Kanion Secure Space API listening on :${config.port}`);
  });
}

start().catch(e => {
  console.error('Failed to start server:', e);
  process.exit(1);
});
