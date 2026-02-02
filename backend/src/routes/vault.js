import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { encryptSensitive, decryptSensitive } from '../utils/encryption.js';

const router = Router();

const upsertSchema = z.object({
  type: z.enum(['website', 'email', 'server', 'database', 'application', 'other']).optional().default('other'),
  name: z.string().min(1, 'Name required').max(150),
  email: z.string().max(255).optional().nullable().refine(
    v => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
    { message: 'Invalid email' }
  ),
  password: z.string().optional().nullable(),
  otp_secret: z.string().optional().nullable(),
  description: z.string().max(1000).optional().nullable()
});

router.get('/items', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id,type,name,email,otp_secret,description,created_at,updated_at
       FROM vault.items 
       WHERE account_id=$1 
       ORDER BY updated_at DESC`,
      [req.user.id]
    );

    const items = rows.map(item => ({
      ...item,
      otp_secret: item.otp_secret ? decryptSensitive(item.otp_secret) : null
    }));

    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.get('/items/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  
  try {
    const { rows } = await query(
      `SELECT * FROM vault.items WHERE account_id=$1 AND id=$2`,
      [req.user.id, id]
    );
    
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const item = rows[0];
    // Decrypt sensitive fields
    if (item.password) item.password = decryptSensitive(item.password);
    if (item.otp_secret) item.otp_secret = decryptSensitive(item.otp_secret);
    
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

router.post('/items', requireAuth, async (req, res) => {
  const parse = upsertSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  
  const { type, name, email, password, otp_secret, description } = parse.data;
  
  try {
    // Encrypt sensitive fields
    const encryptedPassword = password ? encryptSensitive(password) : null;
    const encryptedOtp = otp_secret ? encryptSensitive(otp_secret) : null;
    
    const { rows } = await query(
      `INSERT INTO vault.items
       (account_id,type,name,email,password,otp_secret,description)
       VALUES($1,$2,$3,$4,$5,$6,$7)
       RETURNING id,type,name,email,description,created_at,updated_at`,
      [req.user.id, type || 'other', name, email ?? null, 
       encryptedPassword ?? null, encryptedOtp ?? null, description ?? null]
    );
    
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

router.put('/items/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  
  const parse = upsertSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  
  const fields = parse.data;
  const keys = Object.keys(fields);
  if (keys.length === 0) return res.status(400).json({ error: 'No fields to update' });
  
  try {
    // Encrypt sensitive fields
    if (fields.password) fields.password = encryptSensitive(fields.password);
    if (fields.otp_secret) fields.otp_secret = encryptSensitive(fields.otp_secret);
    
    const setSql = keys.map((k, i) => `${k}=$${i + 3}`).join(',');
    const params = [req.user.id, id, ...keys.map(k => fields[k] ?? null)];
    
    const { rowCount, rows } = await query(
      `UPDATE vault.items 
       SET ${setSql}, updated_at=now() 
       WHERE account_id=$1 AND id=$2 
       RETURNING id,type,name,email,description,created_at,updated_at`,
      params
    );
    
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/items/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  
  try {
    const { rowCount } = await query(
      'DELETE FROM vault.items WHERE account_id=$1 AND id=$2', 
      [req.user.id, id]
    );
    
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
