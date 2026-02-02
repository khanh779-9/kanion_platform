import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const noteSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  content: z.string().min(1, 'Content required').max(10000),
  color: z.string().max(20).optional().nullable(),
  is_encrypted: z.boolean().optional(),
  password: z.string().optional().nullable()
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id,title,content,color,is_encrypted,created_at,updated_at 
       FROM note.item 
       WHERE account_id=$1 
       ORDER BY updated_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const parse = noteSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  
  const { title, content, color, is_encrypted = false, password } = parse.data;
  
  try {
    const pwd = password ? Buffer.from(password, 'utf8') : null;
    const { rows } = await query(
      `INSERT INTO note.item(account_id,title,content,color,is_encrypted,password)
       VALUES($1,$2,$3,$4,$5,$6) 
       RETURNING id,title,content,color,is_encrypted,created_at,updated_at`,
      [req.user.id, title ?? null, content, color ?? null, is_encrypted, pwd]
    );
    
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const parse = noteSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  
  const fields = parse.data;
  if (fields.password !== undefined) {
    fields.password = fields.password ? Buffer.from(fields.password, 'utf8') : null;
  }
  
  const keys = Object.keys(fields);
  if (keys.length === 0) return res.status(400).json({ error: 'No fields to update' });
  
  const setSql = keys.map((k, i) => `${k}=$${i + 3}`).join(',');
  const params = [req.user.id, id, ...keys.map(k => fields[k] ?? null)];
  
  try {
    const { rowCount, rows } = await query(
      `UPDATE note.item 
       SET ${setSql}, updated_at=now() 
       WHERE account_id=$1 AND id=$2 
       RETURNING id,title,content,color,is_encrypted,created_at,updated_at`,
      params
    );
    
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  
  try {
    const { rowCount } = await query(
      'DELETE FROM note.item WHERE account_id=$1 AND id=$2', 
      [req.user.id, id]
    );
    
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    
    await logAuditAction(
      req.user.id, 
      AUDIT_ACTIONS.NOTE_DELETED, 
      'note', 
      id, 
      {}, 
      req
    );
    
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Share endpoints
router.post('/:id/share', requireAuth, async (req, res) => {
  const id = req.params.id;
  const { password, expired_at, max_views } = req.body || {};
  
  try {
    // Verify ownership
    const ownership = await query(
      'SELECT id FROM note.item WHERE id=$1 AND account_id=$2',
      [id, req.user.id]
    );
    if (ownership.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    
    const hash = password ? await bcrypt.hash(password, 10) : null;
    const { rows } = await query(
      `INSERT INTO note.share(note_id,password_hash,expired_at,max_views)
       VALUES($1,$2,$3,$4)
       RETURNING id,share_token,expired_at,max_views,view_count`,
      [id, hash, expired_at ?? null, max_views ?? null]
    );
    
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create share' });
  }
});

router.get('/share/:token', async (req, res) => {
  const token = req.params.token;
  
  try {
    const { rows } = await query(
      `SELECT s.id, s.note_id, s.password_hash, s.expired_at, s.max_views, s.view_count, i.title, i.content
       FROM note.share s 
       JOIN note.item i ON i.id=s.note_id 
       WHERE s.share_token=$1 AND s.revoked_at IS NULL`,
      [token]
    );
    
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const s = rows[0];
    
    // Expiration and views check
    if (s.expired_at && new Date(s.expired_at) < new Date()) {
      return res.status(410).json({ error: 'Share expired' });
    }
    if (s.max_views && s.view_count >= s.max_views) {
      return res.status(410).json({ error: 'Share expired' });
    }
    
    // Increment view_count
    await query('UPDATE note.share SET view_count=view_count+1 WHERE id=$1', [s.id]);
    
    res.json({ title: s.title, content: s.content, requires_password: !!s.password_hash });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch share' });
  }
});

router.post('/share/:token/verify', async (req, res) => {
  const token = req.params.token;
  const { password } = req.body || {};
  
  try {
    const { rows } = await query(
      'SELECT id,password_hash FROM note.share WHERE share_token=$1 AND revoked_at IS NULL',
      [token]
    );
    
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const s = rows[0];
    if (!s.password_hash) return res.json({ valid: true });
    
    const ok = await bcrypt.compare(password || '', s.password_hash);
    res.json({ valid: ok });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Revoke share
router.post('/share/:token/revoke', requireAuth, async (req, res) => {
  const token = req.params.token;
  
  try {
    // Verify ownership
    const ownership = await query(
      `SELECT s.id FROM note.share s
       JOIN note.item i ON i.id = s.note_id
       WHERE s.share_token=$1 AND i.account_id=$2`,
      [token, req.user.id]
    );
    
    if (ownership.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    
    await query('UPDATE note.share SET revoked_at=now() WHERE share_token=$1', [token]);
    
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to revoke share' });
  }
});

export default router;
