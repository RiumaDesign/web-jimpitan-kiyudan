// View: Manajemen Multi-Pembukuan & Pengarsipan Periode
import { db } from '../db.js';

export function renderPembukuan() {
  const pbkList = db.getPembukuanList();
  const activePbkId = db.getActivePembukuanId();

  return `
    <div class="card">
      <div class="card-header" style="flex-wrap: wrap;">
        <div>
          <h2 class="card-title">📚 Manajemen Sistem Pembukuan & Arsip</h2>
          <p class="card-subtitle">Kelola tahun pembukuan jimpitan multi-periode. Pembukuan lama tetap tersimpan dan dapat dibuka kapan saja.</p>
        </div>
        <button class="btn btn-primary" onclick="pembukuanModule.openNewPembukuanModal()">
          + Buat Pembukuan Baru
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; margin-top: 1rem;">
        ${pbkList.map(p => {
          const isActive = p.id === activePbkId;
          const saldoPemuda = db.getSaldoKasPemuda(p.id);
          const saldoDusun = db.getSaldoKasDusun(p.id);
          const totalTab = db.getTotalSeluruhTabungan(p.id);

          return `
            <div style="background: var(--bg-card-subtle); border: 2px solid ${isActive ? 'var(--primary-500)' : 'var(--border-color)'}; border-radius: var(--radius-lg); padding: 1.5rem; position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div>
                  <span class="badge ${isActive ? 'badge-success' : 'badge-neutral'}">
                    ${isActive ? '🟢 SEDANG AKTIF' : '🔒 ARSIP'}
                  </span>
                  <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); margin-top: 0.35rem;">
                    ${p.nama}
                  </h3>
                  <div style="font-size: 0.8125rem; color: var(--text-muted);">
                    Periode: ${p.tanggal_mulai} s/d ${p.tanggal_selesai}
                  </div>
                </div>
              </div>

              <div style="border-top: 1px solid var(--border-color); padding-top: 0.875rem; margin-bottom: 1.25rem; font-size: 0.875rem; display: flex; flex-direction: column; gap: 0.35rem;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-secondary);">Kas Pemuda:</span>
                  <strong>Rp ${saldoPemuda.toLocaleString('id-ID')}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-secondary);">Kas Dusun:</span>
                  <strong>Rp ${saldoDusun.toLocaleString('id-ID')}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-secondary);">Total Tabungan:</span>
                  <strong style="color: var(--primary-700);">Rp ${totalTab.toLocaleString('id-ID')}</strong>
                </div>
              </div>

              <div>
                ${isActive ? `
                  <button class="btn btn-outline-primary btn-sm" style="width: 100%;" disabled>
                    ✓ Pembukuan Aktif
                  </button>
                ` : `
                  <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="pembukuanModule.switchToPembukuan('${p.id}')">
                    📂 Buka Arsip Pembukuan Ini
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export const pembukuanModule = {
  openNewPembukuanModal() {
    const list = db.getPembukuanList();
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const modalHtml = `
      <div class="form-group">
        <label class="form-label">Nama Pembukuan Baru:</label>
        <input type="text" id="newPbkNama" class="form-control" value="Pembukuan ${nextYear}" required>
      </div>

      <div class="form-group">
        <label class="form-label">Tahun Periode:</label>
        <input type="number" id="newPbkTahun" class="form-control" value="${nextYear}" required>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Tanggal Mulai:</label>
          <input type="date" id="newPbkMulai" class="form-control" value="${nextYear}-01-01" required>
        </div>
        <div class="form-group">
          <label class="form-label">Tanggal Selesai:</label>
          <input type="date" id="newPbkSelesai" class="form-control" value="${nextYear}-12-31" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Saldo Awal Kas Pemuda (Rp):</label>
          <input type="number" id="newPbkSaldoPemuda" class="form-control" value="0" min="0">
        </div>
        <div class="form-group">
          <label class="form-label">Saldo Awal Kas Dusun (Rp):</label>
          <input type="number" id="newPbkSaldoDusun" class="form-control" value="0" min="0">
        </div>
      </div>

      <div style="background: #fef3c7; border: 1px solid #fde68a; color: #92400e; padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.8125rem;">
        ⚠️ <em>Perhatian:</em> Membuat pembukuan baru akan mengarsipkan pembukuan sebelumnya. Histori transaksi tahun lalu tetap dapat dilihat di menu Arsip.
      </div>
    `;

    app.showCustomModal({
      title: '+ Buat Periode Pembukuan Baru',
      bodyHtml: modalHtml,
      confirmText: 'Lanjutkan Pembuatan',
      onConfirm: () => {
        const nama = document.getElementById('newPbkNama')?.value.trim();
        const tahun = document.getElementById('newPbkTahun')?.value;
        const mulai = document.getElementById('newPbkMulai')?.value;
        const selesai = document.getElementById('newPbkSelesai')?.value;
        const saldoPemuda = parseFloat(document.getElementById('newPbkSaldoPemuda')?.value) || 0;
        const saldoDusun = parseFloat(document.getElementById('newPbkSaldoDusun')?.value) || 0;

        if (!nama || !tahun) {
          alert('Nama dan tahun pembukuan wajib diisi!');
          return false;
        }

        app.showConfirmModal({
          title: '⚠️ Konfirmasi Pembukuan Baru',
          message: `Apakah Anda yakin ingin membuat <strong>${nama}</strong>?<br><br>Pembukuan sebelumnya akan diarsipkan dan transaksi baru akan dicatat pada periode ini.`,
          confirmText: 'Ya, Buat Pembukuan',
          onConfirm: () => {
            const pbk = db.createPembukuan({
              nama,
              tahun,
              tanggal_mulai: mulai,
              tanggal_selesai: selesai,
              saldo_awal_pemuda: saldoPemuda,
              saldo_awal_dusun: saldoDusun
            });

            db.addAuditLog('Buat Pembukuan Baru', `Membuat ${nama} (${mulai} s/d ${selesai})`, 'warning');
            app.showToast(`Pembukuan ${nama} berhasil dibuat & diaktifkan!`);
            app.renderCurrentView();
          }
        });

        return true;
      }
    });
  },

  switchToPembukuan(pembukuanId) {
    db.setActivePembukuanId(pembukuanId);
    const pbk = db.getActivePembukuan();
    app.showToast(`Beralih ke arsip: ${pbk.nama}`);
    app.renderCurrentView();
  }
};
