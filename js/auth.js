// Auth Manager untuk Admin Panel Sistem Jimpitan Kiyudan
import { db } from './db.js';

const SESSION_KEY = 'kiyudan_admin_session';

export const auth = {
  isLoggedIn() {
    const session = sessionStorage.getItem(SESSION_KEY);
    return !!session;
  },

  getCurrentUser() {
    if (!this.isLoggedIn()) return null;
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY));
    } catch {
      return null;
    }
  },

  login(username, password) {
    const authData = db.getAdminAuth();
    if (username.trim() === authData.username && password === authData.password) {
      const session = {
        username: authData.username,
        role: 'Administrator',
        loginTime: new Date().toISOString()
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      db.addAuditLog('Login Admin', `Admin ${username} berhasil masuk sistem`, 'info', username);
      return { success: true };
    }
    return { success: false, message: 'Username atau password admin salah!' };
  },

  logout() {
    const user = this.getCurrentUser();
    if (user) {
      db.addAuditLog('Logout Admin', `Admin ${user.username} keluar sistem`, 'info', user.username);
    }
    sessionStorage.removeItem(SESSION_KEY);
  },

  changePassword(oldPassword, newPassword) {
    const authData = db.getAdminAuth();
    if (oldPassword !== authData.password) {
      return { success: false, message: 'Password lama tidak sesuai!' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password baru minimal 6 karakter!' };
    }
    db.updateAdminPassword(newPassword);
    db.addAuditLog('Ganti Password', 'Admin berhasil memperbarui password', 'warning', authData.username);
    return { success: true, message: 'Password berhasil diperbarui!' };
  }
};
