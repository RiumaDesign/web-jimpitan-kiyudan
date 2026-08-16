// View: Pengaturan Sistem, Ganti Password Admin, Audit Log & Backup / Restore JSON
import { db } from '../db.js';
import { auth } from '../auth.js';

export function renderSettings() {
  const authData = db.getAdminAuth();
  const auditLogs = db.getAuditLogs();
  const config = db.getConfig();

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem;">
      <!-- SECURITY & PASSWORD -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">🔐 Keamanan Akun Administrator</h3>
        </div>

        <div style="background: var(--bg-card-subtle); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; font-size: 0.875rem;">
          <div><strong>Username:</strong> <code>${authData.username}</code></div>
          <div style="color: var(--text-muted); font-size: 0.8125rem; margin-top: 2px;">Akun utama pengelola sistem Dusun Kiyudan</div>
        </div>

        <div class="form-group">
          <label class="form-label">Password Lama:</label>
          <input type="password" id="setOldPassword" class="form-control" placeholder="••••••••">
        </div>

        <div class="form-group">
          <label class="form-label">Password Baru:</label>
          <input type="password" id="setNewPassword" class="form-control" placeholder="Minimal 6 karakter">
        </div>

        <div class="form-group">
          <label class="form-label">Konfirmasi Password Baru:</label>
          <input type="password" id="setConfirmPassword" class="form-control" placeholder="Ulangi password baru">
        </div>

        <button class="btn btn-primary" style="width: 100%;" onclick="settingsModule.handleChangePassword()">
          🔑 Perbarui Password Admin
        </button>
      </div>

      <!-- BACKUP & RESTORE DATABASE -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">💾 Backup & Restore Database</h3>
        </div>
        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
          Ekspor seluruh data warga, histori transaksi, kas, dan pembukuan dalam file JSON aman untuk cadangan data berkala.
        </p>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button class="btn btn-secondary" onclick="settingsModule.downloadBackup()">
            📥 Download Backup Database (JSON)
          </button>

          <div style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.5rem;">
            <label class="form-label">Pulihkan / Restore dari File JSON:</label>
            <input type="file" id="restoreFileInput" class="form-control" accept=".json" onchange="settingsModule.handleRestore(event)">
          </div>

          <div style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.5rem;">
            <button class="btn btn-outline-danger btn-sm" style="width: 100%;" onclick="settingsModule.confirmResetDefault()">
              ⚠️ Reset Database ke Data Awal Bawaan (40 KK)
            </button>
          </div>
        </div>
      </div>

      <!-- AUDIT TRAIL LOG FULL -->
      <div class="card" style="grid-column: 1 / -1;">
        <div class="card-header">
          <div>
            <h3 class="card-title">🛡️ Audit Log Sistem (Total ${auditLogs.length} Catatan)</h3>
            <p class="card-subtitle">Rekam jejak setiap perubahan penting, pengesahan, dan mutasi keuangan</p>
          </div>
        </div>

        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
          <table class="custom-table">
            <thead style="position: sticky; top: 0; background: var(--bg-card-subtle);">
              <tr>
                <th style="width: 160px;">Waktu</th>
                <th>Admin</th>
                <th>Aktivitas</th>
                <th>Detail Catatan</th>
                <th style="width: 90px; text-align: center;">Tipe</th>
              </tr>
            </thead>
            <tbody>
              ${auditLogs.length === 0 ? `
                <tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">Belum ada riwayat audit log.</td></tr>
              ` : auditLogs.map(log => `
                <tr>
                  <td style="white-space: nowrap; font-size: 0.8125rem; color: var(--text-secondary);">
                    ${new Date(log.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td><strong>${log.admin}</strong></td>
                  <td><strong>${log.aktivitas}</strong></td>
                  <td style="font-size: 0.8125rem;">${log.detail}</td>
                  <td style="text-align: center;">
                    <span class="badge ${log.tipe === 'danger' ? 'badge-danger' : (log.tipe === 'warning' ? 'badge-warning' : 'badge-success')}">
                      ${log.tipe.toUpperCase()}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export const settingsModule = {
  handleChangePassword() {
    const oldPass = document.getElementById('setOldPassword')?.value;
    const newPass = document.getElementById('setNewPassword')?.value;
    const confPass = document.getElementById('setConfirmPassword')?.value;

    if (!oldPass || !newPass || !confPass) {
      alert('Semua kolom password wajib diisi!');
      return;
    }

    if (newPass !== confPass) {
      alert('Password baru dan konfirmasi tidak cocok!');
      return;
    }

    app.showConfirmModal({
      title: '⚠️ Konfirmasi Ganti Password',
      message: 'Apakah Anda yakin ingin mengganti password administrator?',
      confirmText: 'Ya, Ganti Password',
      onConfirm: () => {
        const res = auth.changePassword(oldPass, newPass);
        if (res.success) {
          app.showToast(res.message);
          app.renderCurrentView();
        } else {
          alert(res.message);
        }
      }
    });
  },

  downloadBackup() {
    const jsonStr = db.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_jimpitan_kiyudan_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    db.addAuditLog('Backup Database', 'Admin mendownload file cadangan database JSON', 'info');
    app.showToast('File backup database berhasil diunduh!');
  },

  handleRestore(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      app.showConfirmModal({
        title: '⚠️ Konfirmasi Restore Database',
        message: 'Memulihkan database dari file cadangan akan menggantikan seluruh data yang ada saat ini.<br><br>Apakah Anda yakin ingin melanjutkan?',
        confirmText: 'Ya, Pulihkan Database',
        onConfirm: () => {
          const res = db.importRestoreJSON(content);
          if (res.success) {
            db.addAuditLog('Restore Database', 'Admin memulihkan data dari file backup JSON', 'warning');
            app.showToast('Database berhasil dipulihkan!');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            alert('Gagal memulihkan database: ' + res.error);
          }
        }
      });
    };
    reader.readAsText(file);
  },

  confirmResetDefault() {
    app.showConfirmModal({
      title: '⚠️ RESET DATABASE BAWAAN',
      message: 'Tindakan ini akan mengembalikan data ke 40 warga awal dan 4 kelompok bawaan Dusun Kiyudan.<br><br>Apakah Anda yakin?',
      confirmText: 'Ya, Reset ke Awal',
      onConfirm: () => {
        db.resetToDefault();
        db.addAuditLog('Reset Database', 'Admin mereset database ke data awal bawaan', 'danger');
        app.showToast('Database berhasil direset ke data awal!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  }
};
