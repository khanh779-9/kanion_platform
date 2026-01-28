/**
 * Data Encryption Utilities
 * Handles encryption/decryption of sensitive fields
 */
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCODING = 'hex';

// In production, this should come from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 
  crypto.scryptSync(process.env.JWT_SECRET || 'devsecret', 'salt', 32);

/**
 * Encrypt sensitive data (passwords, OTP secrets, etc.)
 */
export function encryptSensitive(data) {
  if (!data) return null;
  
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(data, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);
    
    const authTag = cipher.getAuthTag();
    
    // Return: iv + authTag + encrypted data
    return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Data encryption failed');
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptSensitive(encrypted) {
  if (!encrypted) return null;
  
  try {
    const [ivHex, authTagHex, encryptedData] = encrypted.split(':');
    
    const iv = Buffer.from(ivHex, ENCODING);
    const authTag = Buffer.from(authTagHex, ENCODING);
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Data decryption failed');
  }
}

/**
 * Hash data for verification (one-way)
 */
export function hashData(data) {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}
