import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
const router = Router();


// Cập nhật email và/hoặc mật khẩu
router.post('/settings', requireAuth, async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  if (!email && !newPassword) return res.status(400).json({ error: 'No data to update' });
  try {
    // Đổi email
    if (email) {
      await query('UPDATE account.users SET email=$1, updated_at=now() WHERE id=$2', [email, req.user.id]);
    }
    // Đổi mật khẩu
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: 'Missing current password' });
      // Lấy mật khẩu hiện tại
      const { rows } = await query('SELECT password FROM account.users WHERE id=$1', [req.user.id]);
      if (!rows[0]) return res.status(404).json({ error: 'User not found' });
      const valid = await bcrypt.compare(currentPassword, rows[0].password);
      if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
      const hash = await bcrypt.hash(newPassword, 10);
      await query('UPDATE account.users SET password=$1, updated_at=now() WHERE id=$2', [hash, req.user.id]);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});
// Lấy tất cả settings giao diện cho user
router.get('/appearance-settings', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT value FROM account.settings WHERE account_id=$1 AND key=$2',
      [req.user.id, 'user-interface']
    );
    if (rows.length === 0 || !rows[0].value) return res.json({});
    let settings = {};
    try {
      settings = JSON.parse(rows[0].value);
    } catch (e) {}
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch appearance settings' });
  }
});

// Cập nhật settings giao diện cho user (nhiều key-value)
router.post('/appearance-settings', requireAuth, async (req, res) => {
  try {
    const value = JSON.stringify(req.body || {});
    await query(
      `INSERT INTO account.settings (account_id, key, value, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (account_id, key) DO UPDATE SET value=$3, updated_at=now()` ,
      [req.user.id, 'user-interface', value]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update appearance settings' });
  }
});
// Lấy theme giao diện từ settings
router.get('/theme', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT value FROM account.settings WHERE account_id=$1 AND key=$2',
      [req.user.id, 'theme']
    );
    res.json({ theme: rows[0]?.value || 'auto' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
});

// Cập nhật theme giao diện vào settings
router.post('/theme', requireAuth, async (req, res) => {
  const { theme } = req.body;
  if (!['light', 'dark', 'auto'].includes(theme)) {
    return res.status(400).json({ error: 'Invalid theme' });
  }
  try {
    await query(
      `INSERT INTO account.settings (account_id, key, value, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (account_id, key) DO UPDATE SET value=$3, updated_at=now()` ,
      [req.user.id, 'theme', theme]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update theme' });
  }
});


// Lấy thông tin user cơ bản
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      "SELECT id, email, status, to_char(created_at, 'YYYY-MM-DD') AS created_at, to_char(updated_at, 'YYYY-MM-DD') AS updated_at FROM account.users WHERE id=$1",
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    console.log('Fetched user profile for user ID:', req.user.id);
    
    res.json(rows[0]);

  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Lấy thông tin profile chi tiết
router.get('/profile-detail', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      "SELECT display_name, avatar_url, phone, to_char(birthday, 'YYYY-MM-DD') AS birthday, bio FROM account.profiles WHERE account_id=$1",
      [req.user.id]
    );
    res.json(rows[0] || {});
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Cập nhật thông tin profile chi tiết
const profileSchema = z.object({
  display_name: z.string().max(255).optional(),
  avatar_url: z.string().url().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  birthday: z.string().optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
});

router.post('/profile-detail', requireAuth, async (req, res) => {
  const parse = profileSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { display_name, avatar_url, phone, birthday, bio } = parse.data;
  try {
    // Upsert profile
    await query(
      `INSERT INTO account.profiles (account_id, display_name, avatar_url, phone, birthday, bio, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
       ON CONFLICT (account_id) DO UPDATE SET display_name=$2, avatar_url=$3, phone=$4, birthday=$5, bio=$6, updated_at=now()`,
      [req.user.id, display_name, avatar_url, phone, birthday, bio]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Xóa tài khoản
router.delete('/delete-account', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM account.users WHERE id=$1', [req.user.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
