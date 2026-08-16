// Audit Log Helper
import { db } from './db.js';
import { auth } from './auth.js';

export function logActivity(action, detail, type = 'info') {
  const user = auth.getCurrentUser();
  const username = user ? user.username : 'Sistem/Publik';
  return db.addAuditLog(action, detail, type, username);
}
