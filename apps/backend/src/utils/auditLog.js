/**
 * Audit Logging Utilities
 * Logs security-relevant actions for compliance and monitoring
 */
import { query } from '../db/pool.js';

export async function logAuditAction(userId, action, resourceType, resourceId, details = {}, req) {
  try {
    const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
    const userAgent = req?.headers?.['user-agent'] || 'unknown';
    
    await query(
      `INSERT INTO audit.logs (account_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, action, resourceType, resourceId, JSON.stringify(details), ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw - audit logging failure shouldn't break the application
  }
}

export const AUDIT_ACTIONS = {
  // Auth
  USER_REGISTERED: 'USER_REGISTERED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  
  // Vault
  VAULT_ITEM_CREATED: 'VAULT_ITEM_CREATED',
  VAULT_ITEM_UPDATED: 'VAULT_ITEM_UPDATED',
  VAULT_ITEM_DELETED: 'VAULT_ITEM_DELETED',
  VAULT_ITEM_VIEWED: 'VAULT_ITEM_VIEWED',
  
  // Notes
  NOTE_CREATED: 'NOTE_CREATED',
  NOTE_UPDATED: 'NOTE_UPDATED',
  NOTE_DELETED: 'NOTE_DELETED',
  NOTE_SHARED: 'NOTE_SHARED',
  NOTE_SHARE_REVOKED: 'NOTE_SHARE_REVOKED',
  
  // Security
  FAILED_LOGIN: 'FAILED_LOGIN',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  DEVICE_TRUST_CHANGED: 'DEVICE_TRUST_CHANGED'
  ,
  TWO_FA_ENABLED: '2FA_ENABLED',
  TWO_FA_DISABLED: '2FA_DISABLED'
};
