// View: Manajemen Keuangan & Buku Kas (Pemuda, Dusun, Tabungan, Pengeluaran, Koreksi)
import { db } from '../db.js';

let activeTab = 'kas_pemuda'; // 'kas_pemuda' | 'kas_dusun' | 'tabungan' | 'koreksi'
let sortOrderDate = 'DESC'; // 'DESC' (Terbaru) | 'ASC' (Terlama)

export function renderKeuangan() {
  const pbk = db.getActivePembukuan();
  const saldoPemuda = db.getSaldoKasPemuda(pbk.id);
  const saldoDusun = db.getSaldoKasDusun(pbk.id);
  const totalTabungan = db.getTotalSeluruhTabungan(pbk.id);

  let kasPemudaList = db.getKasPemuda(pbk.id);
  let kasDusunList = db.getKasDusun(pbk.id);
  const wargaList = db.getWarga().filter(w => w.status === 'Aktif');
  let allTrx = db.getAllTransaksi().filter(t => t.pembukuan_id === pbk.id);

  // Sort by date
  kasPemudaList.sort((a, b) => {
    return sortOrderDate === 'ASC' 
      ? new Date(a.tanggal) - new Date(b.tanggal) 
      : new Date(b.tanggal) - new Date(a.tanggal);
  });

  kasDusunList.sort((a, b) => {
    return sortOrderDate === 'ASC' 
      ? new Date(a.tanggal) - new Date(b.tanggal) 
      : new Date(b.tanggal) - new Date(a.tanggal);
  });

  allTrx.sort((a, b) => {
    return sortOrderDate === 'ASC' 
      ? new Date(a.tanggal) - new Date(b.tanggal) 
      : new Date(b.tanggal) - new Date(a.tanggal);
  });

  return `
    <div>
      <!-- TOP FINANCIAL STATS -->
      <div class="stats-grid">
        <div class="stat-card gold">
          <div class="stat-content">
            <h3>💰 Saldo Kas Pemuda</h3>
            <div class="stat-value">Rp ${saldoPemuda.toLocaleString('id-ID')}</div>
            <div class="stat-meta">50% jimpitan & kegiatan pemuda</div>
          </div>
          <div class="stat-icon-wrap"><span>⚡</span></div>
        </div>

        <div class="stat-card blue">
          <div class="stat-content">
            <h3>🏘️ Saldo Kas Dusun</h3>
            <div class="stat-value">Rp ${saldoDusun.toLocaleString('id-ID')}</div>
            <div class="stat-meta">50% jimpitan & sosial dusun</div>
          </div>
          <div class="stat-icon-wrap"><span>🏛️</span></div>
        </div>

        <div class="stat-card purple">
          <div class="stat-content">
            <h3>💳 Total Tabungan Warga</h3>
            <div class="stat-value">Rp ${totalTabungan.toLocaleString('id-ID')}</div>
            <div class="stat-meta">Tersimpan dari 40+ KK</div>
          </div>
          <div class="stat-icon-wrap"><span>👛</span></div>
        </div>
      </div>

      <!-- MAIN LEDGER CARD WITH TABS -->
      <div class="card">
        <div class="card-header" style="flex-wrap: wrap; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn ${activeTab === 'kas_pemuda' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="keuanganModule.switchTab('kas_pemuda')">
              ⚡ Buku Kas Pemuda
            </button>
            <button class="btn ${activeTab === 'kas_dusun' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="keuanganModule.switchTab('kas_dusun')">
              🏘️ Buku Kas Dusun
            </button>
            <button class="btn ${activeTab === 'tabungan' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="keuanganModule.switchTab('tabungan')">
              💳 Rekap Tabungan Warga
            </button>
            <button class="btn ${activeTab === 'koreksi' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="keuanganModule.switchTab('koreksi')">
              🛠️ Koreksi Transaksi
            </button>
          </div>

          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            ${(activeTab === 'kas_pemuda' || activeTab === 'kas_dusun' || activeTab === 'koreksi') ? `
              <button class="btn btn-outline-secondary btn-sm" onclick="keuanganModule.toggleDateSort()" title="Klik untuk mengubah urutan tanggal">
                ${sortOrderDate === 'DESC' ? '⬇️ Terbaru' : '⬆️ Terlama'}
              </button>
            ` : ''}
            <button class="btn btn-warning btn-sm" onclick="keuanganModule.openAddPengeluaranModal()">
              + Tambah Pengeluaran
            </button>
          </div>
        </div>

        <!-- TAB CONTENT: KAS PEMUDA -->
        ${activeTab === 'kas_pemuda' ? `
          <div style="margin-top: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h3 style="font-size: 1.125rem; font-weight: 800;">Buku Kas Pemuda — ${pbk.nama}</h3>
              <span class="badge badge-success">Saldo: Rp ${saldoPemuda.toLocaleString('id-ID')}</span>
            </div>
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th style="cursor: pointer;" onclick="keuanganModule.toggleDateSort()" title="Klik untuk mengurutkan tanggal">
                      Tanggal ${sortOrderDate === 'DESC' ? '⬇️' : '⬆️'}
                    </th>
                    <th>Kategori / Sumber</th>
                    <th>Keterangan</th>
                    <th>Petugas / PIC</th>
                    <th style="text-align: right;">Masuk (Rp)</th>
                    <th style="text-align: right;">Keluar (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  ${kasPemudaList.length === 0 ? `
                    <tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">Belum ada mutasi Kas Pemuda.</td></tr>
                  ` : kasPemudaList.map(item => `
                    <tr>
                      <td style="white-space: nowrap;">${item.tanggal}</td>
                      <td><span class="badge ${item.jenis === 'masuk' ? 'badge-success' : 'badge-danger'}">${item.kategori || item.sumber}</span></td>
                      <td>${item.keterangan}</td>
                      <td><small>${item.petugas || '-'}</small></td>
                      <td style="text-align: right; font-family: monospace; font-weight: 700; color: #059669;">
                        ${item.jenis === 'masuk' ? '+ ' + Number(item.nominal).toLocaleString('id-ID') : '-'}
                      </td>
                      <td style="text-align: right; font-family: monospace; font-weight: 700; color: #dc2626;">
                        ${item.jenis === 'keluar' ? '- ' + Number(item.nominal).toLocaleString('id-ID') : '-'}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- TAB CONTENT: KAS DUSUN -->
        ${activeTab === 'kas_dusun' ? `
          <div style="margin-top: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h3 style="font-size: 1.125rem; font-weight: 800;">Buku Kas Dusun — ${pbk.nama}</h3>
              <span class="badge badge-info">Saldo: Rp ${saldoDusun.toLocaleString('id-ID')}</span>
            </div>
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th style="cursor: pointer;" onclick="keuanganModule.toggleDateSort()" title="Klik untuk mengurutkan tanggal">
                      Tanggal ${sortOrderDate === 'DESC' ? '⬇️' : '⬆️'}
                    </th>
                    <th>Kategori / Sumber</th>
                    <th>Keterangan</th>
                    <th>Petugas / PIC</th>
                    <th style="text-align: right;">Masuk (Rp)</th>
                    <th style="text-align: right;">Keluar (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  ${kasDusunList.length === 0 ? `
                    <tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">Belum ada mutasi Kas Dusun.</td></tr>
                  ` : kasDusunList.map(item => `
                    <tr>
                      <td style="white-space: nowrap;">${item.tanggal}</td>
                      <td><span class="badge ${item.jenis === 'masuk' ? 'badge-success' : 'badge-danger'}">${item.kategori || item.sumber}</span></td>
                      <td>${item.keterangan}</td>
                      <td><small>${item.petugas || '-'}</small></td>
                      <td style="text-align: right; font-family: monospace; font-weight: 700; color: #059669;">
                        ${item.jenis === 'masuk' ? '+ ' + Number(item.nominal).toLocaleString('id-ID') : '-'}
                      </td>
                      <td style="text-align: right; font-family: monospace; font-weight: 700; color: #dc2626;">
                        ${item.jenis === 'keluar' ? '- ' + Number(item.nominal).toLocaleString('id-ID') : '-'}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- TAB CONTENT: TABUNGAN WARGA -->
        ${activeTab === 'tabungan' ? `
          <div style="margin-top: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h3 style="font-size: 1.125rem; font-weight: 800;">Daftar Saldo Tabungan 40 KK Warga</h3>
              <span class="badge badge-purple">Total: Rp ${totalTabungan.toLocaleString('id-ID')}</span>
            </div>
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th style="width: 50px;">No</th>
                    <th>Kode</th>
                    <th>Nama Warga</th>
                    <th>Status</th>
                    <th style="text-align: right;">Saldo Tabungan</th>
                    <th style="text-align: center; width: 190px;">Aksi Tabungan</th>
                  </tr>
                </thead>
                <tbody>
                  ${wargaList.map((w, idx) => {
                    const saldo = db.getSaldoTabunganWarga(w.id, pbk.id);
                    return `
                      <tr>
                        <td>${idx + 1}</td>
                        <td><span class="badge badge-neutral" style="font-family: monospace;">${w.kode_warga}</span></td>
                        <td><strong>${w.nama}</strong></td>
                        <td><span class="badge badge-success">${w.status}</span></td>
                        <td style="text-align: right; font-family: monospace; font-weight: 800; font-size: 1rem; color: var(--primary-700);">
                          Rp ${saldo.toLocaleString('id-ID')}
                        </td>
                        <td style="text-align: center;">
                          <button class="btn btn-sm btn-outline-primary" onclick="keuanganModule.openTarikTabunganModal('${w.id}', ${saldo})">
                            💸 Tarik / Keluar
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- TAB CONTENT: KOREKSI TRANSAKSI -->
        ${activeTab === 'koreksi' ? `
          <div style="margin-top: 1.25rem;">
            <div style="background: #fef3c7; border: 1px solid #fde68a; color: #92400e; padding: 1rem; border-radius: var(--radius-md); font-size: 0.875rem; margin-bottom: 1rem;">
              ⚠️ <strong>Perhatian:</strong> Fitur Koreksi digunakan untuk memperbaiki kesalahan ketik / nominal oleh petugas pada transaksi yang <strong>sudah disahkan</strong> tanpa menghapus histori terdahulu. Setiap koreksi wajib memasukkan alasan dan tercatat pada audit log.
            </div>

            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th style="cursor: pointer;" onclick="keuanganModule.toggleDateSort()" title="Klik untuk mengurutkan tanggal">
                      Tanggal ${sortOrderDate === 'DESC' ? '⬇️' : '⬆️'}
                    </th>
                    <th>Kode Warga</th>
                    <th>Nama Warga</th>
                    <th>Status</th>
                    <th style="text-align: right;">Jimpitan</th>
                    <th style="text-align: right;">Tabungan</th>
                    <th style="text-align: right;">Total</th>
                    <th style="text-align: center;">Histori Koreksi</th>
                    <th style="text-align: center; width: 100px;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  ${allTrx.slice(0, 50).map(t => `
                    <tr>
                      <td>${t.tanggal}</td>
                      <td><span class="badge badge-neutral" style="font-family: monospace;">${t.kode_warga}</span></td>
                      <td><strong>${t.nama_warga}</strong></td>
                      <td><span class="badge ${t.status === 'Sudah Setor' ? 'badge-success' : 'badge-warning'}">${t.status}</span></td>
                      <td style="text-align: right; font-family: monospace;">Rp ${(t.jimpitan || 0).toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; color: var(--primary-700);">Rp ${(t.tabungan || 0).toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; font-weight: 700;">Rp ${(t.total || 0).toLocaleString('id-ID')}</td>
                      <td style="text-align: center;">
                        ${(t.koreksi_histori && t.koreksi_histori.length > 0) ? `
                          <span class="badge badge-warning" title="${t.koreksi_histori.map(h => h.alasan).join('; ')}">
                            ${t.koreksi_histori.length}x Dikoreksi
                          </span>
                        ` : '<span style="color: var(--text-muted); font-size: 0.75rem;">Asli</span>'}
                      </td>
                      <td style="text-align: center;">
                        <button class="btn btn-sm btn-secondary" onclick="keuanganModule.openKoreksiModal('${t.id}')">
                          ✏️ Koreksi
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

export const keuanganModule = {
  switchTab(tabName) {
    activeTab = tabName;
    app.renderCurrentView();
  },

  toggleDateSort() {
    sortOrderDate = sortOrderDate === 'DESC' ? 'ASC' : 'DESC';
    app.renderCurrentView();
  },

  openAddPengeluaranModal() {
    const pbk = db.getActivePembukuan();
    const modalHtml = `
      <div class="form-group">
        <label class="form-label">Sumber Kas:</label>
        <select id="pengeluaranKasSelect" class="form-control">
          <option value="Kas Pemuda">Kas Pemuda</option>
          <option value="Kas Dusun">Kas Dusun</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Tanggal Pengeluaran:</label>
        <input type="date" id="pengeluaranTanggal" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
      </div>

      <div class="form-group">
        <label class="form-label">Kategori Pengeluaran:</label>
        <select id="pengeluaranKategori" class="form-control">
          <option value="Kegiatan Pemuda">Kegiatan Pemuda</option>
          <option value="Sosial & Warga">Sosial & Warga</option>
          <option value="Pembangunan & Sarana">Pembangunan & Sarana</option>
          <option value="Operasional Pos Ronda">Operasional Pos Ronda</option>
          <option value="Peringatan HUT RI">Peringatan HUT RI</option>
          <option value="Lainnya">Lainnya</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Nominal Pengeluaran (Rp):</label>
        <input type="number" id="pengeluaranNominal" class="form-control" placeholder="Contoh: 150000" min="1000" step="1000" required>
      </div>

      <div class="form-group">
        <label class="form-label">Keterangan / Uraian Penggunaan:</label>
        <input type="text" id="pengeluaranKeterangan" class="form-control" placeholder="Contoh: Pembelian lampu & kabel pos ronda" required>
      </div>

      <div class="form-group">
        <label class="form-label">Penanggung Jawab / Petugas:</label>
        <input type="text" id="pengeluaranPetugas" class="form-control" value="Pengurus Pemuda" required>
      </div>
    `;

    app.showCustomModal({
      title: '+ Tambah Pengeluaran Kas',
      bodyHtml: modalHtml,
      confirmText: 'Lanjutkan Pengeluaran',
      onConfirm: () => {
        const sumber = document.getElementById('pengeluaranKasSelect')?.value;
        const tanggal = document.getElementById('pengeluaranTanggal')?.value;
        const kategori = document.getElementById('pengeluaranKategori')?.value;
        const nominal = parseFloat(document.getElementById('pengeluaranNominal')?.value) || 0;
        const keterangan = document.getElementById('pengeluaranKeterangan')?.value.trim();
        const petugas = document.getElementById('pengeluaranPetugas')?.value.trim();

        if (nominal <= 0 || !keterangan) {
          alert('Nominal dan keterangan pengeluaran wajib diisi!');
          return false;
        }

        // Trigger confirmation popup as required
        app.showConfirmModal({
          title: '⚠️ Konfirmasi Tambah Pengeluaran',
          message: `Anda akan mencatat pengeluaran sebesar <strong>Rp ${nominal.toLocaleString('id-ID')}</strong> dari <strong>${sumber}</strong>.<br><br><strong>Keterangan:</strong> ${keterangan}<br><br>Apakah Anda yakin ingin memproses transaksi ini?`,
          confirmText: 'Ya, Simpan Pengeluaran',
          onConfirm: () => {
            const entry = {
              pembukuan_id: pbk.id,
              tanggal,
              jenis: 'keluar',
              sumber: 'Pengeluaran',
              kategori,
              nominal,
              keterangan,
              petugas
            };

            if (sumber === 'Kas Pemuda') {
              db.addKasPemudaEntry(entry);
            } else {
              db.addKasDusunEntry(entry);
            }

            db.addAuditLog('Tambah Pengeluaran', `Pengeluaran ${sumber} Rp ${nominal.toLocaleString('id-ID')} (${keterangan})`, 'warning');
            app.showToast(`Pengeluaran ${sumber} berhasil dicatat!`);
            app.renderCurrentView();
          }
        });

        return true;
      }
    });
  },

  openTarikTabunganModal(wargaId, currentSaldo) {
    const warga = db.getWarga().find(w => w.id === wargaId);
    if (!warga) return;

    const modalHtml = `
      <div style="background: var(--bg-card-subtle); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid var(--border-color);">
        <div><strong>Warga:</strong> ${warga.nama} (${warga.kode_warga})</div>
        <div><strong>Saldo Tabungan Saat Ini:</strong> <span style="font-size: 1.25rem; font-weight: 800; color: var(--primary-700); font-family: monospace;">Rp ${currentSaldo.toLocaleString('id-ID')}</span></div>
      </div>

      <div class="form-group">
        <label class="form-label">Nominal Penarikan Tabungan (Rp):</label>
        <input type="number" id="tarikNominal" class="form-control" max="${currentSaldo}" min="1000" step="1000" placeholder="Masukkan jumlah yang ditarik...">
      </div>

      <div class="form-group">
        <label class="form-label">Tanggal Penarikan:</label>
        <input type="date" id="tarikTanggal" class="form-control" value="${new Date().toISOString().split('T')[0]}">
      </div>

      <div class="form-group">
        <label class="form-label">Alasan / Keterangan Penarikan:</label>
        <input type="text" id="tarikAlasan" class="form-control" placeholder="Contoh: Kebutuhan Idul Fitri / Pendidikan anak">
      </div>
    `;

    app.showCustomModal({
      title: `Penarikan Tabungan: ${warga.nama}`,
      bodyHtml: modalHtml,
      confirmText: 'Proses Penarikan',
      onConfirm: () => {
        const nominal = parseFloat(document.getElementById('tarikNominal')?.value) || 0;
        const tanggal = document.getElementById('tarikTanggal')?.value;
        const alasan = document.getElementById('tarikAlasan')?.value.trim() || 'Penarikan tabungan';

        if (nominal <= 0 || nominal > currentSaldo) {
          alert('Nominal penarikan tidak valid atau melebihi saldo tabungan!');
          return false;
        }

        app.showConfirmModal({
          title: '⚠️ Konfirmasi Penarikan Tabungan',
          message: `Apakah Anda yakin ingin memproses penarikan tabungan sebesar <strong>Rp ${nominal.toLocaleString('id-ID')}</strong> untuk <strong>${warga.nama}</strong>?`,
          confirmText: 'Ya, Setujui Penarikan',
          onConfirm: () => {
            const pbk = db.getActivePembukuan();
            const trx = {
              id: `WD-${Date.now()}-${warga.kode_warga}`,
              pembukuan_id: pbk.id,
              warga_id: warga.id,
              kode_warga: warga.kode_warga,
              nama_warga: warga.nama,
              tanggal,
              jenis: 'penarikan_tabungan',
              nominal,
              status: 'Sudah Setor',
              catatan: `Penarikan: ${alasan}`,
              created_at: new Date().toISOString()
            };
            db.saveTransaksiBatch([trx]);
            db.addAuditLog('Penarikan Tabungan', `Penarikan tabungan ${warga.nama} sebesar Rp ${nominal.toLocaleString('id-ID')}`, 'warning');
            app.showToast('Penarikan tabungan berhasil diproses!');
            app.renderCurrentView();
          }
        });

        return true;
      }
    });
  },

  openKoreksiModal(trxId) {
    const all = db.getAllTransaksi();
    const trx = all.find(t => t.id === trxId);
    if (!trx) return;

    const modalHtml = `
      <div style="background: #fee2e2; border: 1px solid #fecaca; color: #991b1b; padding: 1rem; border-radius: var(--radius-md); font-size: 0.8125rem; margin-bottom: 1rem;">
        ⚠️ <strong>TRANSAKSI SUDAH DISAHKAN</strong><br>
        Perubahan pada transaksi ini akan mengubah histori kalkulasi jimpitan / tabungan warga <strong>${trx.nama_warga}</strong>.
      </div>

      <div style="background: var(--bg-card-subtle); padding: 0.75rem 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid var(--border-color); font-size: 0.875rem;">
        <div><strong>Warga:</strong> ${trx.nama_warga} (${trx.kode_warga}) • <strong>Tanggal:</strong> ${trx.tanggal}</div>
        <div><strong>Nilai Saat Ini:</strong> Jimpitan Rp ${(trx.jimpitan || 0).toLocaleString('id-ID')} | Tabungan Rp ${(trx.tabungan || 0).toLocaleString('id-ID')} (Total Rp ${(trx.total || 0).toLocaleString('id-ID')})</div>
      </div>

      <div class="form-group">
        <label class="form-label">Nominal Jimpitan Baru (Rp):</label>
        <input type="number" id="koreksiJimpitan" class="form-control" value="${trx.jimpitan || 3000}" min="0" step="1000">
      </div>

      <div class="form-group">
        <label class="form-label">Nominal Tabungan Baru (Rp):</label>
        <input type="number" id="koreksiTabungan" class="form-control" value="${trx.tabungan || 0}" min="0" step="1000">
      </div>

      <div class="form-group">
        <label class="form-label">Alasan Koreksi (WAJIB DIISI):</label>
        <textarea id="koreksiAlasan" class="form-control" rows="3" placeholder="Contoh: Salah input nominal jimpitan saat di pos ronda" required></textarea>
      </div>
    `;

    app.showCustomModal({
      title: `🛠️ Koreksi Transaksi: ${trx.nama_warga}`,
      bodyHtml: modalHtml,
      confirmText: 'Lanjutkan Koreksi',
      onConfirm: () => {
        const newJimp = parseFloat(document.getElementById('koreksiJimpitan')?.value) || 0;
        const newTab = parseFloat(document.getElementById('koreksiTabungan')?.value) || 0;
        const alasan = document.getElementById('koreksiAlasan')?.value.trim();

        if (!alasan) {
          alert('Alasan koreksi wajib diisi!');
          return false;
        }

        app.showConfirmModal({
          title: '⚠️ Konfirmasi Koreksi Transaksi',
          message: `Anda akan mengubah setoran <strong>${trx.nama_warga}</strong>:<br>
            • Jimpitan: Rp ${(trx.jimpitan || 0).toLocaleString('id-ID')} ➔ <strong>Rp ${newJimp.toLocaleString('id-ID')}</strong><br>
            • Tabungan: Rp ${(trx.tabungan || 0).toLocaleString('id-ID')} ➔ <strong>Rp ${newTab.toLocaleString('id-ID')}</strong><br>
            • Alasan: <em>"${alasan}"</em><br><br>
            Lanjutkan pembaruan?`,
          confirmText: 'Ya, Simpan Koreksi',
          onConfirm: () => {
            try {
              db.executeKoreksiTransaksi({
                pengambilanId: trx.pengambilan_id,
                trxId: trx.id,
                updatedFields: {
                  jimpitan: newJimp,
                  tabungan: newTab,
                  total: newJimp + newTab
                },
                reason: alasan,
                admin: 'gemukireng'
              });

              app.showToast('Transaksi berhasil dikoreksi & dampak kas diperbarui!');
              app.renderCurrentView();
            } catch (err) {
              alert('Gagal mengoreksi transaksi: ' + err.message);
            }
          }
        });

        return true;
      }
    });
  }
};
