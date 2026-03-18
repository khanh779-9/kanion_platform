import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', rateLimit('auth'), authRoutes);
app.use('/api/vault', rateLimit('api'), vaultRoutes);
app.use('/api/notes', rateLimit('api'), notesRoutes);
app.use('/api/user', rateLimit('api'), userRoutes);
app.use('/api/breach', rateLimit('api'), breachRoutes);
app.use('/api/wallet', rateLimit('api'), walletRoutes);

app.use((err, req, res, next) => {
  console.error('[Unhandled API Error]', {
    method: req.method,
    path: req.originalUrl,
    message: err?.message,
    code: err?.code,
    stack: err?.stack,
  });

  if (res.headersSent) {
    return next(err);
  }

  return res.status(err?.status || 500).json({ error: 'Internal server error' });
});


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


  app.use(express.static(path.join(__dirname, "../public")));

  // API root: show JSON instructions
  app.get("/", (req, res) => {
    res.json({
      message: "Welcome to Kanion Secure Space API!",
      endpoints: {
        auth: {
          register: {
            method: "POST",
            path: "/api/auth/register",
            body: {
              email: "user@example.com",
              password: "yourPassword"
            }
          },
          login: {
            method: "POST",
            path: "/api/auth/login",
            body: {
              email: "user@example.com",
              password: "yourPassword"
            }
          },
          logout: { method: "POST", path: "/api/auth/logout" },
          me: { method: "GET", path: "/api/auth/me" }
        },
        vault: {
          list: { method: "GET", path: "/api/vault" },
          create: {
            method: "POST",
            path: "/api/vault",
            body: {
              name: "My Vault",
              description: "Optional description"
            }
          },
          get: { method: "GET", path: "/api/vault/:id" },
          update: {
            method: "PUT",
            path: "/api/vault/:id",
            body: {
              name: "Updated Vault Name",
              description: "Updated description"
            }
          },
          delete: { method: "DELETE", path: "/api/vault/:id" }
        },
        notes: {
          list: { method: "GET", path: "/api/notes" },
          create: {
            method: "POST",
            path: "/api/notes",
            body: {
              title: "Note title",
              content: "Note content"
            }
          },
          get: { method: "GET", path: "/api/notes/:id" },
          update: {
            method: "PUT",
            path: "/api/notes/:id",
            body: {
              title: "Updated title",
              content: "Updated content"
            }
          },
          delete: { method: "DELETE", path: "/api/notes/:id" }
        },
        user: {
          profile: { method: "GET", path: "/api/user/profile" },
          update: {
            method: "PUT",
            path: "/api/user/profile",
            body: {
              displayName: "New Name",
              avatar: "https://example.com/avatar.png"
            }
          }
        },
        breach: {
          check: {
            method: "POST",
            path: "/api/breach/check",
            body: {
              email: "user@example.com"
            }
          }
        },
        wallet: {
          list: { method: "GET", path: "/api/wallet" },
          create: {
            method: "POST",
            path: "/api/wallet",
            body: {
              name: "My Wallet",
              type: "bank|crypto|cash",
              balance: 0
            }
          },
          get: { method: "GET", path: "/api/wallet/:id" },
          update: {
            method: "PUT",
            path: "/api/wallet/:id",
            body: {
              name: "Updated Wallet Name",
              type: "bank|crypto|cash",
              balance: 1000
            }
          },
          delete: { method: "DELETE", path: "/api/wallet/:id" }
        }
      },
      note: "Replace :id with the actual resource ID. Fields in body are example payloads. All endpoints return JSON. See docs for full schema."
    });
  });

  // Fallback: return JSON 404 for non-API, non-static routes
  app.get("*", (req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  
  app.listen(config.port, () => {
    console.log(`Kanion Secure Space API listening on ${config.backendUrl}`);
  });
}

start().catch(e => {
  console.error('Failed to start server:', e);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]', error);
});
