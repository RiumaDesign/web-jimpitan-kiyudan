// View: Master Data Warga (40 KK Awal)
import { db } from '../db.js';

let searchQuery = '';
let statusFilter = 'all';

export function renderMasterWarga() {
  const allWarga = db.getWarga();
  const pbk = db.getActivePembukuan();

  const filtered = allWarga.filter(w => {
    const matchStatus = statusFilter === 'all' || w.status === statusFilter;
    const matchSearch = !searchQuery || 
      w.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
      w.kode_warga.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const aktifCount = allWarga.filter(w => w.status === 'Aktif').length;
  const nonAktifCount = allWarga.length - aktifCount;

  return `
    <div class="card">
      <div class="card-header" style="flex-wrap: wrap;">
        <div>
          <h2 class="card-title">👥 Master Data Warga Dusun Kiyudan</h2>
          <p class="card-subtitle">Kelola daftar warga pembukuan ${pbk.tahun} (40 KK data awal, dapat ditambah/diedit tanpa menghapus histori)</p>
        </div>
        <button class="btn btn-primary" onclick="masterWargaModule.openAddModal()">
          + Tambah Warga Baru
        </button>
      </div>

      <!-- FILTER & SEARCH -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem;">
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="masterWargaModule.setStatusFilter('all')">
            Semua (${allWarga.length})
          </button>
          <button class="btn btn-sm ${statusFilter === 'Aktif' ? 'btn-primary' : 'btn-secondary'}" onclick="masterWargaModule.setStatusFilter('Aktif')">
            Aktif (${aktifCount})
          </button>
          <button class="btn btn-sm ${statusFilter === 'Tidak Aktif' ? 'btn-primary' : 'btn-secondary'}" onclick="masterWargaModule.setStatusFilter('Tidak Aktif')">
            Tidak Aktif (${nonAktifCount})
          </button>
        </div>

        <div style="min-width: 260px;">
          <input 
            type="text" 
            class="form-control form-control-sm" 
            placeholder="🔎 Cari nama / kode warga..." 
            value="${searchQuery}"
            oninput="masterWargaModule.handleSearch(this.value)"
          >
        </div>
      </div>

      <!-- WARGA TABLE -->
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 50px;">No</th>
              <th>Kode Warga</th>
              <th>Nama Lengkap</th>
              <th>Status</th>
              <th>Keterangan</th>
              <th style="text-align: right;">Saldo Tabungan</th>
              <th style="text-align: center; width: 180px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">Tidak ada data warga yang cocok.</td></tr>
            ` : filtered.map((w, idx) => {
              const saldo = db.getSaldoTabunganWarga(w.id, pbk.id);
              return `
                <tr>
                  <td style="color: var(--text-muted);">${idx + 1}</td>
                  <td><span class="badge badge-neutral" style="font-family: monospace;">${w.kode_warga}</span></td>
                  <td><strong>${w.nama}</strong></td>
                  <td>
                    <span class="badge ${w.status === 'Aktif' ? 'badge-success' : 'badge-danger'}">
                      ${w.status}
                    </span>
                  </td>
                  <td style="font-size: 0.8125rem; color: var(--text-secondary);">${w.keterangan || '-'}</td>
                  <td style="text-align: right; font-family: monospace; font-weight: 700; color: var(--primary-700);">
                    Rp ${saldo.toLocaleString('id-ID')}
                  </td>
                  <td style="text-align: center;">
                    <div style="display: flex; gap: 0.35rem; justify-content: center;">
                      <button class="btn btn-sm btn-secondary" title="Edit Data Warga" onclick="masterWargaModule.openEditModal('${w.id}')">
                        ✏️ Edit
                      </button>
                      <button 
                        class="btn btn-sm ${w.status === 'Aktif' ? 'btn-danger' : 'btn-success'}" 
                        title="${w.status === 'Aktif' ? 'Nonaktifkan Warga' : 'Aktifkan Kembali'}"
                        onclick="masterWargaModule.confirmToggleStatus('${w.id}')"
                      >
                        ${w.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export const masterWargaModule = {
  setStatusFilter(val) {
    statusFilter = val;
    app.renderCurrentView();
  },

  handleSearch(val) {
    searchQuery = val;
    app.renderCurrentView();
  },

  openAddModal() {
    const all = db.getWarga();
    const nextNum = all.length + 1;
    const nextCode = `KDY-${String(nextNum).padStart(3, '0')}`;

    const modalHtml = `
      <div class="form-group">
        <label class="form-label">Kode Warga (Otomatis):</label>
        <input type="text" id="addKodeWarga" class="form-control" value="${nextCode}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">Nama Lengkap Warga / KK:</label>
        <input type="text" id="addNamaWarga" class="form-control" placeholder="Contoh: Budi Santoso" required>
      </div>
      <div class="form-group">
        <label class="form-label">Status Warga:</label>
        <select id="addStatusWarga" class="form-control">
          <option value="Aktif" selected>Aktif</option>
          <option value="Tidak Aktif">Tidak Aktif</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Keterangan (Opsional):</label>
        <input type="text" id="addKeteranganWarga" class="form-control" placeholder="Catatan tambahan...">
      </div>
    `;

    app.showCustomModal({
      title: '+ Tambah Master Warga Baru',
      bodyHtml: modalHtml,
      confirmText: 'Simpan Warga',
      onConfirm: () => {
        const nama = document.getElementById('addNamaWarga')?.value.trim();
        const status = document.getElementById('addStatusWarga')?.value;
        const ket = document.getElementById('addKeteranganWarga')?.value.trim();

        if (!nama) {
          alert('Nama warga tidak boleh kosong!');
          return false;
        }

        const newWarga = db.addWarga({
          kode_warga: nextCode,
          nama,
          status,
          keterangan: ket
        });

        db.addAuditLog('Tambah Warga', `Menambahkan warga baru ${nama} (${nextCode})`, 'info');
        app.showToast(`Warga ${nama} berhasil ditambahkan!`);
        app.renderCurrentView();
        return true;
      }
    });
  },

  openEditModal(wargaId) {
    const warga = db.getWarga().find(w => w.id === wargaId);
    if (!warga) return;

    const modalHtml = `
      <div class="form-group">
        <label class="form-label">Kode Warga:</label>
        <input type="text" class="form-control" value="${warga.kode_warga}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">Nama Lengkap Warga / KK:</label>
        <input type="text" id="editNamaWarga" class="form-control" value="${warga.nama}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Status Warga:</label>
        <select id="editStatusWarga" class="form-control">
          <option value="Aktif" ${warga.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
          <option value="Tidak Aktif" ${warga.status === 'Tidak Aktif' ? 'selected' : ''}>Tidak Aktif</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Keterangan:</label>
        <input type="text" id="editKeteranganWarga" class="form-control" value="${warga.keterangan || ''}">
      </div>
    `;

    app.showCustomModal({
      title: `Edit Data Warga: ${warga.nama}`,
      bodyHtml: modalHtml,
      confirmText: 'Lanjutkan Simpan',
      onConfirm: () => {
        const namaBaru = document.getElementById('editNamaWarga')?.value.trim();
        const statusBaru = document.getElementById('editStatusWarga')?.value;
        const ketBaru = document.getElementById('editKeteranganWarga')?.value.trim();

        if (!namaBaru) {
          alert('Nama warga tidak boleh kosong!');
          return false;
        }

        // Trigger confirmation popup as requested
        app.showConfirmModal({
          title: '⚠️ Konfirmasi Perubahan Data Warga',
          message: `Apakah Anda yakin ingin mengubah data warga <strong>${warga.nama}</strong>?<br><br>Perubahan akan dicatat dalam sistem dan audit log.`,
          confirmText: 'Ya, Simpan Perubahan',
          onConfirm: () => {
            db.updateWarga(warga.id, {
              nama: namaBaru,
              status: statusBaru,
              keterangan: ketBaru
            });
            db.addAuditLog('Edit Warga', `Mengubah data warga ${warga.kode_warga} (${warga.nama} -> ${namaBaru})`, 'warning');
            app.showToast('Data warga berhasil diperbarui!');
            app.renderCurrentView();
          }
        });

        return true;
      }
    });
  },

  confirmToggleStatus(wargaId) {
    const warga = db.getWarga().find(w => w.id === wargaId);
    if (!warga) return;

    const nextStatus = warga.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';

    app.showConfirmModal({
      title: '⚠️ Konfirmasi Perubahan Status Warga',
      message: `Anda akan mengubah status <strong>${warga.nama}</strong> (${warga.kode_warga}) menjadi <strong>${nextStatus}</strong>.<br><br><em>Catatan: Histori transaksi terdahulu tetap tersimpan dan tidak akan terhapus.</em>`,
      confirmText: `Ya, Ubah ke ${nextStatus}`,
      onConfirm: () => {
        db.toggleStatusWarga(warga.id);
        db.addAuditLog('Ubah Status Warga', `Mengubah status warga ${warga.nama} menjadi ${nextStatus}`, 'warning');
        app.showToast(`Status warga ${warga.nama} diubah menjadi ${nextStatus}!`);
        app.renderCurrentView();
      }
    });
  }
};
