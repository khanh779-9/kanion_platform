import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pool, query } from './pool.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function ensureExtension() {
  try {
    await query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  } catch (e) {
    console.warn('pgcrypto extension warning:', e.message);
  }
}

async function runSqlFile(file) {
  // From src/db/migrate.js to backend/sql/
  const p = resolve(__dirname, '../../sql', file);
  console.log('Loading SQL file from:', p);
  const sql = readFileSync(p, 'utf8');
  await pool.query(sql);
}

async function seedStatuses() {
  await query(
    `INSERT INTO account.statuses (code, description, is_active)
     VALUES ('active','Active', true), ('inactive','Inactive', true), ('suspended','Suspended', true)
     ON CONFLICT (code) DO NOTHING;`
  );
}

export async function ensureMigrations() {
  try {
    await ensureExtension();
    await runSqlFile('001_init.sql');
    await seedStatuses();
    console.log('Migrations and seed completed.');
  } catch (e) {
    console.error('Migration failed:', e);
    throw e;
  }
}

async function main() {
  try {
    await ensureMigrations();
  } catch (e) {
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
