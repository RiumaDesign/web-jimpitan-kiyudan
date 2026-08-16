// View: Master Kelompok & Penasehat Dusun Kiyudan
import { db } from '../db.js';

export function renderMasterKelompok() {
  const groups = db.getGroups();
  const penasehat = db.getPenasehat();

  const totalAnggota = groups.reduce((acc, g) => acc + g.anggota.length, 0);

  return `
    <div>
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <div>
            <h2 class="card-title">🔄 Struktur 4 Kelompok Petugas Jimpitan</h2>
            <p class="card-subtitle">Total ${totalAnggota} Petugas Pemuda (Rotasi: Kelompok 1 ➔ 2 ➔ 3 ➔ 4 ➔ 1 setiap minggu)</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
          ${groups.map(g => `
            <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                  <h3 style="font-size: 1.125rem; font-weight: 800; color: var(--primary-800);">
                    ${g.nama}
                  </h3>
                  <span class="badge badge-info">${g.anggota.length} Anggota</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem;">
                  ${g.anggota.map((nama, i) => `
                    <div style="background: var(--bg-card); padding: 0.4rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 0.875rem; display: flex; justify-content: space-between;">
                      <span><strong>${i + 1}.</strong> ${nama}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <button class="btn btn-secondary btn-sm" onclick="masterKelompokModule.openEditGroupModal('${g.id}')">
                ✏️ Edit Anggota Kelompok
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- PENASEHAT SECTION -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">🛡️ Susunan Penasehat Jimpitan Dusun Kiyudan</h3>
            <p class="card-subtitle">Tokoh masyarakat pembina transparansi jimpitan & kas</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="masterKelompokModule.openEditPenasehatModal()">
            ✏️ Kelola Penasehat
          </button>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
          ${penasehat.map(p => `
            <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-color); padding: 0.625rem 1.25rem; border-radius: var(--radius-md); font-weight: 700; font-size: 0.9375rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>⭐</span>
              <span>${p}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export const masterKelompokModule = {
  openEditGroupModal(groupId) {
    const groups = db.getGroups();
    const grp = groups.find(g => g.id === groupId);
    if (!grp) return;

    const modalHtml = `
      <div class="form-group">
        <label class="form-label">Nama Kelompok:</label>
        <input type="text" id="editGroupName" class="form-control" value="${grp.nama}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Daftar Anggota (Pisahkan dengan koma):</label>
        <textarea id="editGroupMembers" class="form-control" rows="4">${grp.anggota.join(', ')}</textarea>
        <p class="input-help">Contoh: Iwan, Humam, Kusnadi, Feri, Pi'i, Harno</p>
      </div>
    `;

    app.showCustomModal({
      title: `Edit ${grp.nama}`,
      bodyHtml: modalHtml,
      confirmText: 'Simpan Perubahan',
      onConfirm: () => {
        const nama = document.getElementById('editGroupName')?.value.trim();
        const membersText = document.getElementById('editGroupMembers')?.value.trim();

        if (!nama || !membersText) {
          alert('Nama dan anggota tidak boleh kosong!');
          return false;
        }

        const members = membersText.split(',').map(m => m.trim()).filter(m => m.length > 0);

        app.showConfirmModal({
          title: '⚠️ Konfirmasi Perubahan Kelompok',
          message: `Apakah Anda yakin ingin memperbarui susunan <strong>${grp.nama}</strong> dengan <strong>${members.length} anggota</strong>?`,
          confirmText: 'Ya, Simpan',
          onConfirm: () => {
            const idx = groups.findIndex(g => g.id === groupId);
            if (idx !== -1) {
              groups[idx].nama = nama;
              groups[idx].anggota = members;
              db.saveGroups(groups);
              db.addAuditLog('Edit Kelompok', `Memperbarui susunan anggota ${nama}`, 'info');
              app.showToast('Susunan kelompok berhasil disimpan!');
              app.renderCurrentView();
            }
          }
        });

        return true;
      }
    });
  },

  openEditPenasehatModal() {
    const penasehat = db.getPenasehat();
    const modalHtml = `
      <div class="form-group">
        <label class="form-label">Daftar Penasehat Dusun (Pisahkan dengan koma):</label>
        <textarea id="editPenasehatList" class="form-control" rows="4">${penasehat.join(', ')}</textarea>
        <p class="input-help">Contoh: P. Joko, P. Jono, P. Pawit, P. Muhsin</p>
      </div>
    `;

    app.showCustomModal({
      title: 'Kelola Penasehat Dusun Kiyudan',
      bodyHtml: modalHtml,
      confirmText: 'Simpan Penasehat',
      onConfirm: () => {
        const text = document.getElementById('editPenasehatList')?.value.trim();
        if (!text) {
          alert('Daftar penasehat tidak boleh kosong!');
          return false;
        }
        const updated = text.split(',').map(p => p.trim()).filter(p => p.length > 0);
        db.savePenasehat(updated);
        db.addAuditLog('Edit Penasehat', `Memperbarui daftar penasehat (${updated.join(', ')})`, 'info');
        app.showToast('Daftar penasehat berhasil disimpan!');
        app.renderCurrentView();
        return true;
      }
    });
  }
};
