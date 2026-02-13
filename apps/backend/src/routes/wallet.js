
import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { encryptSensitive, decryptSensitive } from '../utils/encryption.js';

const router = Router();

const walletItemSchema = z.object({
  wallet_type: z.enum(['crypto', 'card', 'id_card', 'bank_account', 'other']).default('other'),
  name: z.string().min(1, 'Name required'),
  address: z.string().optional().nullable(), // Public address or Card Number (masked)
  secret: z.string().min(1, 'Secret/Private Key/Full Number required'), // Will be encrypted
  description: z.string().optional().nullable(),
  metadata: z.record(z.string()).optional() // Extra fields like CVV, Expiry, Network
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

// Get all wallet items
router.get('/items', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, wallet_type, name, address, description, created_at, updated_at
       FROM wallet.items 
       WHERE account_id=$1 
       ORDER BY updated_at DESC`,
      [req.user.id]
    );

    // Decrypt fields for display
    const decryptedRows = rows.map(row => ({
      ...row,
      wallet_type: tryDecrypt(row.wallet_type),
      name: tryDecrypt(row.name),
      address: tryDecrypt(row.address),
      description: tryDecrypt(row.description)
    }));

    res.json(decryptedRows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch wallet items' });
  }
});

// Get single item with secret
router.get('/items/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { rows } = await query(
      `SELECT * FROM wallet.items WHERE account_id=$1 AND id=$2`,
      [req.user.id, id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const item = rows[0];
    
    // Decrypt main fields
    item.wallet_type = tryDecrypt(item.wallet_type);
    item.name = tryDecrypt(item.name);
    item.address = tryDecrypt(item.address);
    item.description = tryDecrypt(item.description);

    // Decrypt secret
    if (item.encrypted_secret) {
      // Postgres returns bytea as Buffer, but our encryptSensitive returns "iv:tag:data" string
      const secretStr = item.encrypted_secret.toString('utf8');
      try {
        // Double check if it's already decrypted or needs decryption (it should always be encrypted in DB)
        // But since we use same helper logic, let's stick to standard decryptSensitive for secret as it was already valid
        item.secret = decryptSensitive(secretStr); 
      } catch (err) {
        console.error('Decryption failed for item secret', id);
        item.secret = '[Decryption Failed]';
      }
      delete item.encrypted_secret;
    }

    // Get Metadata
    const metaRes = await query(
      `SELECT key, value FROM wallet.metadata WHERE wallet_id=$1`,
      [id]
    );
    item.metadata = {};
    metaRes.rows.forEach(r => {
      // Decrypt metadata values
      item.metadata[r.key] = tryDecrypt(r.value);
    });

    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Create item
router.post('/items', requireAuth, async (req, res) => {
  const parse = walletItemSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const { wallet_type, name, address, secret, description, metadata } = parse.data;

  try {
    await query('BEGIN');

    // Encrypt all fields
    const encWalletType = encryptSensitive(wallet_type);
    const encName = encryptSensitive(name);
    const encAddress = address ? encryptSensitive(address) : null;
    const encDescription = description ? encryptSensitive(description) : null;
    
    const encryptedSecretStr = encryptSensitive(secret);
    const secretBuffer = Buffer.from(encryptedSecretStr, 'utf8');

    const { rows } = await query(
      `INSERT INTO wallet.items 
       (account_id, wallet_type, name, address, encrypted_secret, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [req.user.id, encWalletType, encName, encAddress, secretBuffer, encDescription]
    );
    const newItem = rows[0];
    
    // We return plaintext to the frontend
    newItem.name = name; 
    newItem.wallet_type = wallet_type;

    if (metadata && Object.keys(metadata).length > 0) {
      for (const [key, value] of Object.entries(metadata)) {
        await query(
          `INSERT INTO wallet.metadata (wallet_id, key, value) VALUES ($1, $2, $3)`,
          [newItem.id, key, encryptSensitive(String(value))]
        );
      }
    }

    await query('COMMIT');
    res.status(201).json(newItem);
  } catch (e) {
    await query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update item
router.put('/items/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const parse = walletItemSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  
  const { wallet_type, name, address, secret, description, metadata } = parse.data;

  try {
    await query('BEGIN');

    // 1. Check ownership
    const check = await query('SELECT id FROM wallet.items WHERE id=$1 AND account_id=$2', [id, req.user.id]);
    if (check.rows.length === 0) {
      await query('ROLLBACK');
      return res.status(404).json({ error: 'Not found' });
    }

    // 2. Update main fields (Encrypt everything)
    let updateFields = [];
    let params = [];
    let pIdx = 1;

    if (wallet_type) { updateFields.push(`wallet_type=$${pIdx++}`); params.push(encryptSensitive(wallet_type)); }
    if (name) { updateFields.push(`name=$${pIdx++}`); params.push(encryptSensitive(name)); }
    if (address !== undefined) { updateFields.push(`address=$${pIdx++}`); params.push(address ? encryptSensitive(address) : null); }
    if (description !== undefined) { updateFields.push(`description=$${pIdx++}`); params.push(description ? encryptSensitive(description) : null); }
    if (secret) {
      const encrypted = encryptSensitive(secret);
      updateFields.push(`encrypted_secret=$${pIdx++}`);
      params.push(Buffer.from(encrypted, 'utf8'));
    }

    if (updateFields.length > 0) {
      updateFields.push(`updated_at=now()`);
      params.push(id); // Where ID
      params.push(req.user.id); // Where Account ID
      
      await query(
        `UPDATE wallet.items SET ${updateFields.join(', ')} WHERE id=$${pIdx++} AND account_id=$${pIdx++}`,
        params
      );
    }

    // 3. Update metadata (Delete all and recreate encrypted)
    if (metadata) {
      await query(`DELETE FROM wallet.metadata WHERE wallet_id=$1`, [id]);
      for (const [key, value] of Object.entries(metadata)) {
        await query(
          `INSERT INTO wallet.metadata (wallet_id, key, value) VALUES ($1, $2, $3)`,
          [id, key, encryptSensitive(String(value))]
        );
      }
    }

    await query('COMMIT');
    res.json({ success: true });
  } catch (e) {
    await query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Failed to update' });
  }
});

router.delete('/items/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { rowCount } = await query(
      'DELETE FROM wallet.items WHERE account_id=$1 AND id=$2', 
      [req.user.id, id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
