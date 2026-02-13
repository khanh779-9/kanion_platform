import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { encryptSensitive, decryptSensitive } from '../utils/encryption.js';

const router = Router();

const upsertSchema = z.object({
  type: z.enum(['website', 'email', 'server', 'database', 'application', 'other']).optional().default('other'),
  name: z.string().min(1, 'Name required').max(150),
  username: z.string().max(150).optional().nullable(),
  email: z.string().max(255).optional().nullable().refine(
    v => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
    { message: 'Invalid email' }
  ),
  password: z.string().optional().nullable(),
  otp_secret: z.string().optional().nullable(),
  description: z.string().max(1000).optional().nullable()
});

// Helper to safely decrypt fields (handles legacy plaintext data)
function tryDecrypt(value) {
  if (!value) return value;
  try {
    // If it looks like our encrypted format (iv:tag:data), try to decrypt
    if (value.includes(':') && value.split(':').length === 3) {
       return decryptSensitive(value);
    }
    return value; // Return as-is if not encrypted
  } catch (e) {
    return value; // Fallback to original on error
  }
}

router.get('/items', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id,type,name,username,email,otp_secret,description,created_at,updated_at
       FROM vault.items 
       WHERE account_id=$1 
       ORDER BY updated_at DESC`,
      [req.user.id]
    );

    const items = rows.map(item => ({
      ...item,
      ...item,
      // type is plaintext
      name: tryDecrypt(item.name),
      username: tryDecrypt(item.username),
      email: tryDecrypt(item.email),
      description: tryDecrypt(item.description),
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
    // Decrypt sensitive fields
    // item.type is plaintext (Enum)
    item.name = tryDecrypt(item.name);
    item.username = tryDecrypt(item.username);
    item.email = tryDecrypt(item.email);
    item.description = tryDecrypt(item.description);

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
  
  const { type, name, username, email, password, otp_secret, description } = parse.data;
  
  try {
    // Encrypt sensitive fields
    const encryptedType = type || 'other'; // Keep type as plaintext for DB Enum compatibility
    const encryptedName = encryptSensitive(name);
    const encryptedUsername = username ? encryptSensitive(username) : null;
    const encryptedEmail = email ? encryptSensitive(email) : null;
    const encryptedPassword = password ? encryptSensitive(password) : null;
    const encryptedOtp = otp_secret ? encryptSensitive(otp_secret) : null;
    const encryptedDescription = description ? encryptSensitive(description) : null;
    
    const { rows } = await query(
      `INSERT INTO vault.items
       (account_id,type,name,username,email,password,otp_secret,description)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id,created_at,updated_at`,
      [req.user.id, encryptedType, encryptedName, encryptedUsername, encryptedEmail, 
       encryptedPassword, encryptedOtp, encryptedDescription]
    );
    
    // Return plaintext to client
    const newItem = rows[0];
    newItem.type = type || 'other';
    newItem.name = name;
    newItem.username = username;
    newItem.email = email;
    newItem.description = description;
    
    res.status(201).json(newItem);
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
    // Encrypt fields before updating
    // Note: 'type' is NOT encrypted because the DB uses an ENUM type (vault.vault_type)
    if (fields.name) fields.name = encryptSensitive(fields.name);
    if (fields.username) fields.username = encryptSensitive(fields.username);
    if (fields.email) fields.email = encryptSensitive(fields.email);
    if (fields.description) fields.description = encryptSensitive(fields.description);
    if (fields.password) fields.password = encryptSensitive(fields.password);
    if (fields.otp_secret) fields.otp_secret = encryptSensitive(fields.otp_secret);
    
    const setSql = keys.map((k, i) => `${k}=$${i + 3}`).join(',');
    const params = [req.user.id, id, ...keys.map(k => fields[k] ?? null)];
    
    const { rowCount, rows } = await query(
      `UPDATE vault.items 
       SET ${setSql}, updated_at=now() 
       WHERE account_id=$1 AND id=$2 
       RETURNING id,created_at,updated_at`,
      params
    );
    
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    
    res.json({ success: true });
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
