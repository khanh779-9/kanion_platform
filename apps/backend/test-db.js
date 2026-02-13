#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

console.log('=== Environment Check ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ set' : '✗ missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ set' : '✗ missing');
console.log('PORT:', process.env.PORT || 3000);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:5173');

// Test database connection
import pg from 'pg';

const { Pool } = pg;

async function testConnection() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('\n=== Testing Database Connection ===');
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connected:', result.rows[0]);
    
    // Check if tables exist
    console.log('\n=== Checking Tables ===');
    const tables = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('account', 'note', 'vault', 'audit', 'notification')
      ORDER BY table_schema, table_name
    `);
    
    if (tables.rowCount === 0) {
      console.log('✗ No tables found. Need to run migrations.');
    } else {
      console.log(`✓ Found ${tables.rowCount} tables:`);
      tables.rows.forEach(t => console.log(`  - ${t.table_schema}.${t.table_name}`));
    }
    
  } catch (e) {
    console.error('✗ Database error:', e.message);
  } finally {
    await pool.end();
  }
}

testConnection();
