
import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { encryptSensitive, decryptSensitive } from '../utils/encryption.js';
import axios from 'axios';

const router = Router();

// Schema for adding a new monitor
const monitorSchema = z.object({
  monitor_type: z.enum(['email', 'username', 'domain', 'phone', 'wallet', 'password', 'custom']).default('email'),
  monitor_value: z.string().min(1, 'Value required'),
  status: z.enum(['active', 'paused', 'deleted']).default('active')
});

function safeDecrypt(text) {
  if (!text) return text;
  try {
    return decryptSensitive(text);
  } catch (e) {
    return text;
  }
}

// Mock HIBP check (or real if API key exists)
async function checkBreach(value) {
  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) {
    // Simulation Mode
    if (value.includes('pwned')) {
      return {
        breached: true,
        breach_source: 'Simulated Breach (HIBP)',
        breach_date: new Date().toISOString(),
        raw_data: { Title: 'Adobe', Domain: 'adobe.com', BreachDate: '2013-10-04', Description: 'This is a simulated breach for testing purposes.' }
      };
    }
    return { breached: false };
  }

  // Real API Call
  try {
    const encodedAccount = encodeURIComponent(value);
    const response = await axios.get(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodedAccount}?truncateResponse=false`, {
      headers: {
        'hibp-api-key': apiKey,
        'user-agent': 'Kanion-Platform'
      }
    });

    if (response.data && response.data.length > 0) {
      const latest = response.data[0];
      return {
        breached: true,
        breach_source: latest.Title,
        breach_date: latest.BreachDate,
        raw_data: latest
      };
    }
    return { breached: false };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { breached: false }; // Not found = safe
    }
    console.error('HIBP API Error:', error.message);
    throw new Error('Failed to check breach status');
  }
}

// Get all monitors for user
router.get('/monitor', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT m.*, r.breached, r.breach_source, r.checked_at 
       FROM breach.monitor m
       LEFT JOIN LATERAL (
         SELECT breached, breach_source, checked_at 
         FROM breach.result r 
         WHERE r.monitor_id = m.id 
         ORDER BY r.checked_at DESC 
         LIMIT 1
       ) r ON true
       WHERE m.user_id = $1 AND m.status != 'deleted'
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );

    const monitors = rows.map(m => ({
      ...m,
      monitor_value: safeDecrypt(m.monitor_value)
    }));

    res.json(monitors);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch monitors' });
  }
});

// Add a new monitor
router.post('/monitor', requireAuth, async (req, res) => {
  const parse = monitorSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const { monitor_type, monitor_value, status } = parse.data;

  try {
    // Check if already exists (Fetch all and check in code because encryption is non-deterministic)
    const existingRows = await query(
      `SELECT monitor_value FROM breach.monitor WHERE user_id=$1 AND status != 'deleted'`,
      [req.user.id]
    );

    const isDuplicate = existingRows.rows.some(r => safeDecrypt(r.monitor_value) === monitor_value);

    if (isDuplicate) {
      return res.status(409).json({ error: 'Already monitoring this value' });
    }

    // Encrypt
    const encryptedValue = encryptSensitive(monitor_value);

    const { rows } = await query(
      `INSERT INTO breach.monitor (user_id, monitor_type, monitor_value, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, monitor_type, encryptedValue, status]
    );

    // Trigger initial check using the plaintext value
    const newMonitor = rows[0];
    const checkResult = await checkBreach(monitor_value);

    await query(
      `INSERT INTO breach.result (monitor_id, breached, breach_source, breach_date, raw_data)
       VALUES ($1, $2, $3, $4, $5)`,
      [newMonitor.id, checkResult.breached, checkResult.breach_source, checkResult.breach_date, checkResult.raw_data ? JSON.stringify(checkResult.raw_data) : null]
    );

    newMonitor.monitor_value = monitor_value; // Return plaintext to user

    res.status(201).json({ ...newMonitor, ...checkResult });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create monitor' });
  }
});

// Manual verify/check endpoint
router.post('/check', requireAuth, async (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ error: 'Value required' });

  try {
    const result = await checkBreach(value);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/monitor/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await query(
      `UPDATE breach.monitor SET status='deleted' WHERE id=$1 AND user_id=$2`,
      [id, req.user.id]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
