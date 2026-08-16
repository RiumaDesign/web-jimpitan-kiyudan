// View: Pengambilan Jimpitan Mingguan, Rekonsiliasi & Koreksi Data Posting
import { db } from '../db.js';

let currentMainTab = 'input'; // 'input' | 'histori'
let activeSession = null;
let sessionTransactions = [];
let isCorrectionMode = false;
let correctionReason = '';
let currentFilterStatus = 'all'; // 'all' | 'Sudah Setor' | 'Tidak Ada' | 'Ditunda' | 'Belum Didatangi'
let currentSearchQuery = '';

// Histori Tab States
let historyFilterStatus = 'all'; // 'all' | 'DRAFT' | 'POSTED' | 'CORRECTED'
let historySearchQuery = '';
let sortOrderDate = 'DESC'; // 'DESC' | 'ASC'

export function renderPengambilan() {
  const pbk = db.getActivePembukuan();
  const groups = db.getGroups();
  const wargaList = db.getWarga().filter(w => w.status === 'Aktif');

  // Initialize or load active session
  if (!activeSession) {
    initDefaultSession();
  }

  return `
    <div class="pengambilan-container">
      <!-- SUB NAVIGATION / TAB SWITCHER -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
        <div style="display: flex; gap: 0.5rem; background: var(--bg-card); padding: 0.35rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
          <button 
            class="btn ${currentMainTab === 'input' ? 'btn-primary' : 'btn-ghost'} btn-sm" 
            onclick="pengambilanModule.switchMainTab('input')"
          >
            📋 ${isCorrectionMode ? '🔵 Mode Koreksi Pengambilan' : 'Pengambilan Jimpitan'}
          </button>
          <button 
            class="btn ${currentMainTab === 'histori' ? 'btn-primary' : 'btn-ghost'} btn-sm" 
            onclick="pengambilanModule.switchMainTab('histori')"
          >
            📜 Histori Sesi Pengambilan
          </button>
        </div>

        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <button class="btn btn-outline-secondary btn-sm" onclick="pengambilanModule.switchMainTab('histori')">
            🔍 Buka Sesi Lain
          </button>
          <button class="btn btn-warning btn-sm" onclick="pengambilanModule.createNewSessionModal()">
            + Buat Sesi Baru
          </button>
        </div>
      </div>

      <!-- MAIN TAB: HISTORI PENGAMBILAN -->
      ${currentMainTab === 'histori' ? renderHistoriSection(pbk) : renderInputSection(pbk, groups, wargaList)}
    </div>
  `;
}

// -------------------------------------------------------------
// RENDER TAB 1: INPUT / KOREKSI PENGAMBILAN
// -------------------------------------------------------------
function renderInputSection(pbk, groups, wargaList) {
  // Calculate live stats
  const countSudah = sessionTransactions.filter(t => t.status === 'Sudah Setor').length;
  const countTidakAda = sessionTransactions.filter(t => t.status === 'Tidak Ada').length;
  const countDitunda = sessionTransactions.filter(t => t.status === 'Ditunda').length;
  const countBelum = sessionTransactions.filter(t => t.status === 'Belum Didatangi').length;

  let sumJimpitan = 0;
  let sumTabungan = 0;
  sessionTransactions.forEach(t => {
    if (t.status === 'Sudah Setor') {
      sumJimpitan += (parseFloat(t.jimpitan) || 0);
      sumTabungan += (parseFloat(t.tabungan) || 0);
    }
  });
  const sumTotalSistem = sumJimpitan + sumTabungan;

  const uangFisik = parseFloat(activeSession.uang_fisik) || 0;
  const selisih = uangFisik - sumTotalSistem;
  const isSesuai = selisih === 0;

  // Filtered rows
  const filteredRows = sessionTransactions.filter(t => {
    const matchStatus = currentFilterStatus === 'all' || t.status === currentFilterStatus;
    const matchSearch = !currentSearchQuery || 
      t.nama_warga.toLowerCase().includes(currentSearchQuery.toLowerCase()) || 
      t.kode_warga.toLowerCase().includes(currentSearchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return `
    <div>
      <!-- CORRECTION OR POSTED NOTICE BANNER -->
      ${activeSession.status === 'POSTED' ? (
        isCorrectionMode ? `
          <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="font-weight: 800; color: #1e40af; font-size: 1.05rem; display: flex; align-items: center; gap: 0.5rem;">
                <span>🔵 POSTED — DALAM MODE KOREKSI DATA</span>
                ${activeSession.koreksi_count ? `<span class="badge badge-warning">🟠 ${activeSession.koreksi_count}x Pernah Dikoreksi</span>` : ''}
              </div>
              <div style="font-size: 0.875rem; color: #1e3a8a; margin-top: 4px;">
                Alasan Sesi: <em>"${correctionReason || activeSession.last_koreksi_reason || 'Koreksi input petugas oleh admin'}"</em><br>
                <small style="color: #475569;">Setiap koreksi pada nominal jimpitan akan otomatis menghasilkan mutasi penyesuaian 50% Kas Pemuda & 50% Kas Dusun dengan audit trail.</small>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="pengambilanModule.exitCorrectionMode()">
              ✖️ Selesai & Tutup Mode Koreksi
            </button>
          </div>
        ` : `
          <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="font-weight: 800; color: #166534; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span>✓ Sesi Ini Sudah Disahkan (POSTED)</span>
                ${activeSession.koreksi_count ? `<span class="badge badge-warning">🟠 ${activeSession.koreksi_count}x Dikoreksi</span>` : ''}
              </div>
              <div style="font-size: 0.875rem; color: #15803d; margin-top: 2px;">
                Disahkan pada ${activeSession.posted_at ? new Date(activeSession.posted_at).toLocaleString('id-ID') : activeSession.tanggal}. Data telah memengaruhi buku kas & saldo tabungan.
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-warning btn-sm" onclick="pengambilanModule.promptCorrectionModal('${activeSession.id}')">
                ✏️ Masuk Mode Koreksi
              </button>
              <button class="btn btn-primary btn-sm" onclick="pengambilanModule.downloadSingleSessionPDF('${activeSession.id}')" title="Unduh atau cetak Berita Acara PDF">
                📥 Unduh / Cetak Dokumen PDF
              </button>
            </div>
          </div>
        `
      ) : ''}

      <!-- HEADER SESSION BAR -->
      <div class="pengambilan-header-bar">
        <div class="pengambilan-info">
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 700; color: var(--primary-700);">
            <span>ID Sesi: <strong>${activeSession.kode_pengambilan || activeSession.id}</strong></span>
            <span>•</span>
            <span class="badge ${activeSession.status === 'POSTED' ? 'badge-success' : 'badge-warning'}">
              ${activeSession.status === 'POSTED' ? '✓ Disahkan (POSTED)' : 'Mode Input (DRAFT)'}
            </span>
          </div>
          <h2 style="margin-top: 0.25rem;">
            Pengambilan Jimpitan: ${activeSession.kelompok_nama}
          </h2>
          <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">
            📅 ${activeSession.tanggal} (${activeSession.hari}) • Pembukuan: ${pbk.nama}
          </div>
          <div class="petugas-chips">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); align-self: center;">Petugas:</span>
            ${(activeSession.petugas || []).map(p => `<span class="petugas-chip">👤 ${p}</span>`).join('')}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" onclick="pengambilanModule.openSessionConfigModal()">
              ⚙️ Ubah Tanggal / Jadwal
            </button>
            <button class="btn btn-primary btn-sm" onclick="pengambilanModule.createNewSessionModal()">
              + Sesi Baru
            </button>
          </div>
          <div style="font-size: 0.8125rem; color: var(--text-muted);">
            Progress Kunjungan: <strong>${countSudah + countTidakAda + countDitunda} / ${sessionTransactions.length} KK</strong>
          </div>
        </div>
      </div>

      <!-- STATUS FILTER BUTTONS / PROGRESS -->
      <div class="status-progress-grid">
        <div class="status-progress-card ${currentFilterStatus === 'all' ? 'active' : ''}" onclick="pengambilanModule.setStatusFilter('all')">
          <div class="status-dot gray"></div>
          <div>
            <div class="count">${sessionTransactions.length}</div>
            <div class="label">Semua Warga</div>
          </div>
        </div>

        <div class="status-progress-card ${currentFilterStatus === 'Sudah Setor' ? 'active' : ''}" onclick="pengambilanModule.setStatusFilter('Sudah Setor')">
          <div class="status-dot green"></div>
          <div>
            <div class="count" style="color: #10b981;">${countSudah}</div>
            <div class="label">✓ Sudah Setor</div>
          </div>
        </div>

        <div class="status-progress-card ${currentFilterStatus === 'Tidak Ada' ? 'active' : ''}" onclick="pengambilanModule.setStatusFilter('Tidak Ada')">
          <div class="status-dot yellow"></div>
          <div>
            <div class="count" style="color: #f59e0b;">${countTidakAda}</div>
            <div class="label">🟡 Tidak Ada</div>
          </div>
        </div>

        <div class="status-progress-card ${currentFilterStatus === 'Ditunda' ? 'active' : ''}" onclick="pengambilanModule.setStatusFilter('Ditunda')">
          <div class="status-dot orange"></div>
          <div>
            <div class="count" style="color: #f97316;">${countDitunda}</div>
            <div class="label">🟠 Ditunda</div>
          </div>
        </div>

        <div class="status-progress-card ${currentFilterStatus === 'Belum Didatangi' ? 'active' : ''}" onclick="pengambilanModule.setStatusFilter('Belum Didatangi')">
          <div class="status-dot gray"></div>
          <div>
            <div class="count" style="color: #94a3b8;">${countBelum}</div>
            <div class="label">⚪ Belum Didatangi</div>
          </div>
        </div>
      </div>

      <!-- 40 KK INTERACTIVE TABLE -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header" style="flex-wrap: wrap;">
          <div>
            <h3 class="card-title">
              📋 TABEL ${isCorrectionMode ? 'KOREKSI SETORAN 40 KK WARGA' : 'INPUT SETORAN 40 KK WARGA'}
            </h3>
            <p class="card-subtitle">
              ${isCorrectionMode ? 'Klik baris atau tombol Koreksi untuk memperbaiki nominal/status warga' : 'Klik baris mana pun atau tombol Edit untuk memasukkan data setoran warga'}
            </p>
          </div>
          <div style="min-width: 240px;">
            <input 
              type="text" 
              class="form-control form-control-sm" 
              placeholder="🔎 Cari nama / kode warga..." 
              value="${currentSearchQuery}"
              oninput="pengambilanModule.handleSearch(this.value)"
            >
          </div>
        </div>

        <div class="table-responsive" style="max-height: 540px; overflow-y: auto;">
          <table class="custom-table">
            <thead style="position: sticky; top: 0; z-index: 5; background: var(--bg-card-subtle);">
              <tr>
                <th style="width: 50px;">No</th>
                <th>Kode</th>
                <th>Nama Warga</th>
                <th style="text-align: right;">Jimpitan</th>
                <th style="text-align: right;">Tabungan</th>
                <th style="text-align: right;">Total Setor</th>
                <th>Status Kunjungan</th>
                ${isCorrectionMode ? '<th style="text-align: center;">Audit Koreksi</th>' : ''}
                <th style="text-align: center; width: 110px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRows.length === 0 ? `
                <tr><td colspan="${isCorrectionMode ? 9 : 8}" style="text-align: center; padding: 2rem; color: var(--text-muted);">Tidak ada warga yang sesuai dengan filter pencarian.</td></tr>
              ` : filteredRows.map((t, idx) => `
                <tr 
                  class="table-jimpitan-row ${t.status === 'Sudah Setor' ? 'status-sudah' : (t.status === 'Tidak Ada' ? 'status-tidak-ada' : (t.status === 'Ditunda' ? 'status-ditunda' : 'status-belum'))}"
                  onclick="pengambilanModule.openInputModal('${t.warga_id}')"
                >
                  <td style="color: var(--text-muted); font-size: 0.8125rem;">${idx + 1}</td>
                  <td><span class="badge badge-neutral" style="font-family: monospace;">${t.kode_warga}</span></td>
                  <td><strong>${t.nama_warga}</strong></td>
                  <td style="text-align: right;" class="nominal-val">
                    ${t.status === 'Sudah Setor' ? 'Rp ' + Number(t.jimpitan).toLocaleString('id-ID') : '-'}
                  </td>
                  <td style="text-align: right; color: var(--primary-700);" class="nominal-val">
                    ${t.status === 'Sudah Setor' && t.tabungan ? 'Rp ' + Number(t.tabungan).toLocaleString('id-ID') : (t.status === 'Sudah Setor' ? 'Rp 0' : '-')}
                  </td>
                  <td style="text-align: right; font-weight: 800;" class="nominal-val">
                    ${t.status === 'Sudah Setor' ? 'Rp ' + Number(t.total).toLocaleString('id-ID') : '-'}
                  </td>
                  <td>
                    <span class="badge ${t.status === 'Sudah Setor' ? 'badge-success' : (t.status === 'Tidak Ada' ? 'badge-warning' : (t.status === 'Ditunda' ? 'badge-info' : 'badge-neutral'))}">
                      ${t.status}
                    </span>
                  </td>
                  ${isCorrectionMode ? `
                    <td style="text-align: center;">
                      ${(t.koreksi_histori && t.koreksi_histori.length > 0) ? `
                        <span class="badge badge-warning" title="${t.koreksi_histori.map(h => h.alasan).join('; ')}">
                          ${t.koreksi_histori.length}x Dikoreksi
                        </span>
                      ` : '<span style="color: var(--text-muted); font-size: 0.75rem;">Asli</span>'}
                    </td>
                  ` : ''}
                  <td style="text-align: center;" onclick="event.stopPropagation()">
                    <button class="btn btn-sm ${isCorrectionMode ? 'btn-warning' : 'btn-outline-primary'}" onclick="pengambilanModule.openInputModal('${t.warga_id}')">
                      ${isCorrectionMode ? '✏️ Koreksi' : '✏️ Edit'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- RINGKASAN SISTEM HASIL PENGAMBILAN & REKONSILIASI -->
      <div class="reconciliation-panel">
        <div class="card-header">
          <div>
            <h3 class="card-title" style="font-size: 1.25rem;">⚖️ Ringkasan Sistem & Rekonsiliasi Uang Fisik</h3>
            <p class="card-subtitle">Hitungan aktual seluruh nominal jimpitan + tabungan warga vs uang fisik bendahara</p>
          </div>
        </div>

        <div class="live-summary-box">
          <div class="summary-item">
            <span class="label">Total Jimpitan Aktual (50:50)</span>
            <span class="val">Rp ${sumJimpitan.toLocaleString('id-ID')}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
              Pemuda: Rp ${(sumJimpitan * 0.5).toLocaleString('id-ID')} • Dusun: Rp ${(sumJimpitan * 0.5).toLocaleString('id-ID')}
            </span>
          </div>

          <div class="summary-item">
            <span class="label">Total Tabungan Warga</span>
            <span class="val">Rp ${sumTabungan.toLocaleString('id-ID')}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
              100% masuk saldo tabungan masing-masing warga
            </span>
          </div>

          <div class="summary-item highlight">
            <span class="label">TOTAL UANG SISTEM</span>
            <span class="val">Rp ${sumTotalSistem.toLocaleString('id-ID')}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
              Dari ${countSudah} KK warga yang menyetor
            </span>
          </div>
        </div>

        <!-- UANG FISIK & REKONSILIASI FORM -->
        <div style="margin-top: 1.5rem; background: var(--bg-card-subtle); border-radius: var(--radius-lg); padding: 1.5rem; border: 1px solid var(--border-color);">
          <div class="form-row">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 1rem; font-weight: 700;">
                💵 Jumlah Uang Fisik Diterima Bendahara (Rp):
              </label>
              <input 
                type="number" 
                class="form-control" 
                style="font-size: 1.25rem; font-weight: 800; font-family: monospace;" 
                value="${uangFisik || ''}"
                placeholder="Masukkan nominal uang tunai..."
                oninput="pengambilanModule.handleUangFisikChange(this.value)"
              >
              <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                <button class="btn btn-sm btn-secondary" onclick="pengambilanModule.matchUangFisik(${sumTotalSistem})">
                  ⚡ Samakan dengan Sistem (Rp ${sumTotalSistem.toLocaleString('id-ID')})
                </button>
              </div>
            </div>

            <div>
              <div class="reconciliation-status-card ${isSesuai ? 'sesuai' : 'selisih'}" style="margin-top: 0;">
                <span style="font-size: 1.75rem;">${isSesuai ? '✓' : '⚠️'}</span>
                <div>
                  <h4 style="font-size: 1rem; font-weight: 800; margin-bottom: 2px;">
                    STATUS: ${isSesuai ? 'SESUAI (Selisih Rp 0)' : `ADA SELISIH (Rp ${selisih.toLocaleString('id-ID')})`}
                  </h4>
                  <p style="font-size: 0.8125rem; opacity: 0.9;">
                    ${isSesuai 
                      ? 'Uang fisik tepat cocok dengan total setoran sistem. Siap untuk disahkan!' 
                      : 'Uang fisik berbeda dengan sistem. Anda wajib memasukkan catatan/alasan audit di bawah ini.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- AUDIT NOTE (REQUIRED IF SELISIH) -->
          <div style="margin-top: 1.25rem;">
            <label class="form-label">
              Catatan Audit / Alasan Rekonsiliasi: ${!isSesuai ? '<span style="color: var(--accent-red); font-weight: bold;">(WAJIB DIISI JIKA ADA SELISIH)</span>' : '<span style="color: var(--text-muted);">(Opsional)</span>'}
            </label>
            <input 
              type="text" 
              id="catatanAuditInput" 
              class="form-control" 
              placeholder="Contoh: Selisih Rp 1.000 karena pembulatan koin fisik" 
              value="${activeSession.catatan_audit || ''}"
              oninput="pengambilanModule.handleCatatanAuditChange(this.value)"
            >
          </div>

          <!-- POSTING / SAVE ACTION BUTTONS -->
          <div style="margin-top: 1.5rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
            <div style="font-size: 0.875rem; color: var(--text-secondary);">
              ${activeSession.status === 'POSTED' 
                ? '🔒 <em>Sesi ini berstatus POSTED. Perubahan individual langsung memperbarui mutasi dan kas terkait.</em>'
                : '🔒 <em>Pengesahan akan memposting otomatis 50% Kas Pemuda, 50% Kas Dusun, dan saldo tabungan warga.</em>'}
            </div>
            <div style="display: flex; gap: 0.75rem;">
              ${activeSession.status !== 'POSTED' ? `
                <button class="btn btn-secondary" onclick="pengambilanModule.saveDraft()">
                  💾 Simpan Draft
                </button>
                <button 
                  class="btn btn-success btn-lg" 
                  id="btnSahakanPosting"
                  onclick="pengambilanModule.confirmPostingModal()"
                >
                  🚀 SAHKAN & POSTING KE KAS
                </button>
              ` : `
                <button class="btn btn-secondary" onclick="pengambilanModule.saveDraft()">
                  💾 Simpan Perubahan Catatan
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// RENDER TAB 2: HISTORI SEMUA PENGAMBILAN & KOREKSI POSTING
// -------------------------------------------------------------
function renderHistoriSection(pbk) {
  let list = db.getPengambilanList().filter(p => p.pembukuan_id === pbk.id);

  // Filter Status
  if (historyFilterStatus === 'DRAFT') {
    list = list.filter(p => p.status !== 'POSTED');
  } else if (historyFilterStatus === 'POSTED') {
    list = list.filter(p => p.status === 'POSTED');
  } else if (historyFilterStatus === 'CORRECTED') {
    list = list.filter(p => p.koreksi_count && p.koreksi_count > 0);
  }

  // Filter Search
  if (historySearchQuery) {
    const q = historySearchQuery.toLowerCase();
    list = list.filter(p => 
      p.tanggal.includes(q) || 
      (p.kelompok_nama && p.kelompok_nama.toLowerCase().includes(q)) ||
      (p.kode_pengambilan && p.kode_pengambilan.toLowerCase().includes(q))
    );
  }

  // Sort Date
  list.sort((a, b) => {
    return sortOrderDate === 'ASC' 
      ? new Date(a.tanggal) - new Date(b.tanggal) 
      : new Date(b.tanggal) - new Date(a.tanggal);
  });

  return `
    <div class="card">
      <div class="card-header" style="flex-wrap: wrap;">
        <div>
          <h2 class="card-title">📜 Histori Seluruh Sesi Pengambilan Jimpitan</h2>
          <p class="card-subtitle">Daftar sesi pengambilan jimpitan mingguan tahun ${pbk.tahun}. Satu tanggal bersifat unik per pembukuan.</p>
        </div>
        <button class="btn btn-warning" onclick="pengambilanModule.createNewSessionModal()">
          + Buat Pengambilan Baru
        </button>
      </div>

      <!-- FILTER CONTROLS BAR -->
      <div style="background: var(--bg-card-subtle); padding: 1rem 1.25rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button 
              class="btn ${historyFilterStatus === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm"
              onclick="pengambilanModule.setHistoryFilter('all')"
            >
              Semua Status (${db.getPengambilanList().filter(p => p.pembukuan_id === pbk.id).length})
            </button>
            <button 
              class="btn ${historyFilterStatus === 'POSTED' ? 'btn-primary' : 'btn-secondary'} btn-sm"
              onclick="pengambilanModule.setHistoryFilter('POSTED')"
            >
              ✓ Posted (${db.getPengambilanList().filter(p => p.pembukuan_id === pbk.id && p.status === 'POSTED').length})
            </button>
            <button 
              class="btn ${historyFilterStatus === 'CORRECTED' ? 'btn-primary' : 'btn-secondary'} btn-sm"
              onclick="pengambilanModule.setHistoryFilter('CORRECTED')"
            >
              🟠 Pernah Dikoreksi (${db.getPengambilanList().filter(p => p.pembukuan_id === pbk.id && p.koreksi_count > 0).length})
            </button>
            <button 
              class="btn ${historyFilterStatus === 'DRAFT' ? 'btn-primary' : 'btn-secondary'} btn-sm"
              onclick="pengambilanModule.setHistoryFilter('DRAFT')"
            >
              📝 Draft / Belum Posting (${db.getPengambilanList().filter(p => p.pembukuan_id === pbk.id && p.status !== 'POSTED').length})
            </button>
          </div>

          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button class="btn btn-outline-secondary btn-sm" onclick="pengambilanModule.toggleDateSort()" title="Klik untuk mengubah urutan tanggal">
              ${sortOrderDate === 'DESC' ? '⬇️ Tanggal Terbaru' : '⬆️ Tanggal Terlama'}
            </button>
            <input 
              type="text" 
              class="form-control form-control-sm" 
              placeholder="🔎 Cari tanggal / kelompok..." 
              value="${historySearchQuery}"
              oninput="pengambilanModule.handleHistorySearch(this.value)"
              style="width: 200px;"
            >
          </div>
        </div>
      </div>

      <!-- TABLE OF ALL SESSIONS -->
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 40px;">No</th>
              <th style="cursor: pointer;" onclick="pengambilanModule.toggleDateSort()">
                Tanggal & Hari ${sortOrderDate === 'DESC' ? '⬇️' : '⬆️'}
              </th>
              <th>Kelompok Bertugas</th>
              <th>Partisipasi</th>
              <th style="text-align: right;">Total Jimpitan</th>
              <th style="text-align: right;">Kas Pemuda</th>
              <th style="text-align: right;">Kas Dusun</th>
              <th style="text-align: right;">Tabungan</th>
              <th style="text-align: right;">Total Setor</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: center; width: 220px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${list.length === 0 ? `
              <tr><td colspan="11" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">Tidak ada data pengambilan yang sesuai dengan filter.</td></tr>
            ` : list.map((p, idx) => `
              <tr>
                <td style="color: var(--text-muted);">${idx + 1}</td>
                <td>
                  <strong>${p.tanggal}</strong><br>
                  <small style="color: var(--text-muted);">${p.hari}</small>
                </td>
                <td>
                  <strong>${p.kelompok_nama}</strong>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">ID: ${p.kode_pengambilan || p.id}</div>
                </td>
                <td>
                  <span class="badge badge-neutral">${p.warga_dicatat_count || 40} / ${p.total_warga_count || 40} KK</span>
                </td>
                <td style="text-align: right; font-family: monospace; font-weight: 600;">
                  Rp ${(p.total_jimpitan || 0).toLocaleString('id-ID')}
                </td>
                <td style="text-align: right; font-family: monospace; color: var(--text-secondary);">
                  Rp ${((p.total_jimpitan || 0) * 0.5).toLocaleString('id-ID')}
                </td>
                <td style="text-align: right; font-family: monospace; color: var(--text-secondary);">
                  Rp ${((p.total_jimpitan || 0) * 0.5).toLocaleString('id-ID')}
                </td>
                <td style="text-align: right; font-family: monospace; font-weight: 600; color: var(--primary-700);">
                  Rp ${(p.total_tabungan || 0).toLocaleString('id-ID')}
                </td>
                <td style="text-align: right; font-family: monospace; font-weight: 800; font-size: 0.95rem;">
                  Rp ${(p.total_sistem || 0).toLocaleString('id-ID')}
                </td>
                <td style="text-align: center;">
                  <span class="badge ${p.status === 'POSTED' ? 'badge-success' : 'badge-warning'}">
                    ${p.status === 'POSTED' ? '✓ POSTED' : '📝 DRAFT'}
                  </span>
                  ${p.koreksi_count ? `
                    <div style="margin-top: 3px;">
                      <span class="badge badge-warning" style="font-size: 0.6875rem;" title="Terakhir: ${p.last_koreksi_reason || ''}">
                        🟠 ${p.koreksi_count}x Dikoreksi
                      </span>
                    </div>
                  ` : ''}
                </td>
                    <div style="display: flex; gap: 0.35rem; justify-content: center; flex-wrap: wrap;">
                      <button class="btn btn-sm btn-secondary" onclick="pengambilanModule.loadSession('${p.id}', false)" title="Buka Detail">
                        👁️ Detail
                      </button>
                      ${p.status === 'POSTED' ? `
                        <button class="btn btn-sm btn-warning" onclick="pengambilanModule.promptCorrectionModal('${p.id}')" title="Koreksi Data Posting">
                          ✏️ Koreksi
                        </button>
                      ` : `
                        <button class="btn btn-sm btn-primary" onclick="pengambilanModule.loadSession('${p.id}', false)" title="Lanjutkan Input">
                          ✏️ Input
                        </button>
                      `}
                      <button class="btn btn-sm btn-primary" onclick="pengambilanModule.downloadSingleSessionPDF('${p.id}')" title="Unduh atau cetak Berita Acara PDF">
                        📥 PDF
                      </button>
                    </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// DEFAULT SESSION INITIALIZATION
// -------------------------------------------------------------
function initDefaultSession() {
  const pengambilanList = db.getPengambilanList();
  // Check if there is an in-progress draft session
  const draft = pengambilanList.find(p => p.status === 'DRAFT');
  if (draft) {
    activeSession = draft;
    sessionTransactions = db.getTransaksiByPengambilan(draft.id);
  } else {
    // If no draft, load the latest posted session or default to 23 Agustus 2026
    const latest = pengambilanList[0];
    if (latest) {
      activeSession = latest;
      sessionTransactions = db.getTransaksiByPengambilan(latest.id);
    } else {
      const pbk = db.getActivePembukuan();
      const groups = db.getGroups();
      const grp4 = groups.find(g => g.id === 'kelompok-4') || groups[0];
      const newSessionId = `JMP-${pbk.tahun}-001`;

      activeSession = {
        id: newSessionId,
        kode_pengambilan: newSessionId,
        pembukuan_id: pbk.id,
        tanggal: '2026-08-23',
        hari: 'Malam Minggu',
        kelompok_id: grp4.id,
        kelompok_nama: grp4.nama,
        petugas: grp4.anggota,
        status: 'DRAFT',
        total_jimpitan: 0,
        total_tabungan: 0,
        total_sistem: 0,
        uang_fisik: 0,
        selisih: 0,
        catatan_audit: '',
        warga_dicatat_count: 0,
        total_warga_count: 40
      };

      const wargaList = db.getWarga().filter(w => w.status === 'Aktif');
      sessionTransactions = wargaList.map(w => ({
        id: `TRX-${activeSession.id}-${w.kode_warga}`,
        pengambilan_id: activeSession.id,
        pembukuan_id: pbk.id,
        warga_id: w.id,
        kode_warga: w.kode_warga,
        nama_warga: w.nama,
        tanggal: activeSession.tanggal,
        jimpitan: 3000,
        tabungan: 0,
        total: 3000,
        status: 'Belum Didatangi',
        catatan: '',
        koreksi_histori: []
      }));
    }
  }
}

// -------------------------------------------------------------
// MODULE EXPORT & METHODS
// -------------------------------------------------------------
export const pengambilanModule = {
  switchMainTab(tab) {
    currentMainTab = tab;
    app.renderCurrentView();
  },

  setStatusFilter(status) {
    currentFilterStatus = status;
    app.renderCurrentView();
  },

  setHistoryFilter(filter) {
    historyFilterStatus = filter;
    app.renderCurrentView();
  },

  toggleDateSort() {
    sortOrderDate = sortOrderDate === 'DESC' ? 'ASC' : 'DESC';
    app.renderCurrentView();
  },

  handleSearch(query) {
    currentSearchQuery = query;
    app.renderCurrentView();
  },

  handleHistorySearch(query) {
    historySearchQuery = query;
    app.renderCurrentView();
  },

  loadSession(sessionId, enterCorrection = false, reason = '') {
    const session = db.getPengambilanById(sessionId);
    if (!session) {
      alert('Sesi pengambilan tidak ditemukan!');
      return;
    }
    activeSession = session;
    sessionTransactions = db.getTransaksiByPengambilan(sessionId);
    isCorrectionMode = enterCorrection;
    correctionReason = reason;
    currentMainTab = 'input';
    app.renderCurrentView();
  },

  exitCorrectionMode() {
    isCorrectionMode = false;
    correctionReason = '';
    app.renderCurrentView();
  },

  // -------------------------------------------------------------
  // KOREKSI DATA POSTING POPUP DIALOG
  // -------------------------------------------------------------
  promptCorrectionModal(sessionId) {
    const session = db.getPengambilanById(sessionId);
    if (!session) return;

    const modalHtml = `
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem; font-size: 0.875rem;">
        <div style="display: grid; grid-template-columns: 100px 1fr; gap: 0.35rem; margin-bottom: 0.5rem;">
          <strong>Tanggal:</strong> <span>${session.tanggal} (${session.hari})</span>
          <strong>Kelompok:</strong> <span>${session.kelompok_nama}</span>
          <strong>Status:</strong> <span class="badge badge-success">✓ POSTED</span>
          <strong>Total Setoran:</strong> <span>Rp ${(session.total_sistem || 0).toLocaleString('id-ID')}</span>
        </div>
        <div style="color: #92400e; font-weight: 600; margin-top: 0.5rem;">
          ⚠️ Data ini sudah masuk ke pembukuan dan telah memengaruhi saldo kas/tabungan. Perubahan akan otomatis menghitung ulang transaksi yang terdampak dan dicatat pada Audit Log.
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" style="font-weight: 700;">
          Alasan Koreksi <span style="color: var(--accent-red);">(Wajib Diisi):</span>
        </label>
        <textarea 
          id="promptAlasanKoreksi" 
          class="form-control" 
          rows="3" 
          placeholder="Contoh: Salah input nominal tabungan Anwari (seharusnya Rp 10.000, tercatat Rp 20.000)"
          required
        ></textarea>
      </div>
    `;

    app.showCustomModal({
      title: '⚠️ KOREKSI DATA YANG SUDAH DIPOSTING',
      bodyHtml: modalHtml,
      confirmText: '🛠️ Lanjutkan Koreksi',
      onConfirm: () => {
        const alasan = document.getElementById('promptAlasanKoreksi')?.value.trim();
        if (!alasan) {
          alert('Alasan koreksi wajib diisi sebelum melanjutkan!');
          return false;
        }

        pengambilanModule.loadSession(sessionId, true, alasan);
        return true;
      }
    });
  },

  handleUangFisikChange(val) {
    activeSession.uang_fisik = parseFloat(val) || 0;
    this.updateLiveTotals();
  },

  matchUangFisik(total) {
    activeSession.uang_fisik = total;
    this.updateLiveTotals();
    app.renderCurrentView();
  },

  handleCatatanAuditChange(val) {
    activeSession.catatan_audit = val.trim();
  },

  updateLiveTotals() {
    let sumJimpitan = 0;
    let sumTabungan = 0;
    let dicatatCount = 0;

    sessionTransactions.forEach(t => {
      if (t.status === 'Sudah Setor') {
        sumJimpitan += (parseFloat(t.jimpitan) || 0);
        sumTabungan += (parseFloat(t.tabungan) || 0);
        dicatatCount++;
      } else if (t.status === 'Tidak Ada' || t.status === 'Ditunda') {
        dicatatCount++;
      }
    });

    activeSession.total_jimpitan = sumJimpitan;
    activeSession.total_tabungan = sumTabungan;
    activeSession.total_sistem = sumJimpitan + sumTabungan;
    activeSession.warga_dicatat_count = dicatatCount;
    activeSession.total_warga_count = sessionTransactions.length;
    activeSession.selisih = (parseFloat(activeSession.uang_fisik) || 0) - activeSession.total_sistem;
  },

  saveDraft() {
    this.updateLiveTotals();
    db.saveOrUpdatePengambilan(activeSession);
    db.saveTransaksiBatch(sessionTransactions);
    app.showToast('Data pengambilan berhasil disimpan!');
    app.renderCurrentView();
  },

  // -------------------------------------------------------------
  // INPUT & KOREKSI SETORAN WARGA MODAL
  // -------------------------------------------------------------
  openInputModal(wargaId) {
    const trx = sessionTransactions.find(t => t.warga_id === wargaId);
    if (!trx) return;

    const isPosted = activeSession.status === 'POSTED';
    const oldJimp = trx.status === 'Sudah Setor' ? (parseFloat(trx.jimpitan) || 0) : 0;
    const oldTab = trx.status === 'Sudah Setor' ? (parseFloat(trx.tabungan) || 0) : 0;
    const oldTotal = trx.status === 'Sudah Setor' ? (parseFloat(trx.total) || 0) : 0;

    const modalHtml = `
      <div style="margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
          <div>
            <span class="badge badge-info" style="font-family: monospace;">${trx.kode_warga}</span>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--primary-800); margin: 2px 0 0 0;">
              ${trx.nama_warga}
            </h3>
          </div>
          <span class="badge ${trx.status === 'Sudah Setor' ? 'badge-success' : (trx.status === 'Tidak Ada' ? 'badge-warning' : 'badge-neutral')}">
            ${trx.status}
          </span>
        </div>
      </div>

      ${isPosted ? `
        <!-- SNAPSHOT DATA SEBELUM KOREKSI -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: var(--radius-md); padding: 0.75rem 1rem; margin-bottom: 1rem; font-size: 0.8125rem;">
          <strong style="color: var(--text-secondary);">📌 DATA SAAT INI (SEBELUM KOREKSI):</strong>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-top: 4px; font-family: monospace;">
            <div>Jimpitan: <strong>Rp ${oldJimp.toLocaleString('id-ID')}</strong></div>
            <div>Tabungan: <strong>Rp ${oldTab.toLocaleString('id-ID')}</strong></div>
            <div>Total: <strong>Rp ${oldTotal.toLocaleString('id-ID')}</strong></div>
          </div>
        </div>
      ` : ''}

      <!-- TOMBOL CEPAT PRESET -->
      <div style="margin-bottom: 1.25rem;">
        <div style="font-size: 0.8125rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase;">
          ⚡ TOMBOL CEPAT KOMBINASI:
        </div>
        <button class="quick-combo-btn" onclick="pengambilanModule.applyPreset(3000, 10000, 'Sudah Setor', ${oldJimp}, ${oldTab})">
          <span>⚡ Rp 13.000 (3K Jimpitan + 10K Tabungan)</span>
          <span>➜</span>
        </button>
        <button class="quick-combo-btn" onclick="pengambilanModule.applyPreset(3000, 5000, 'Sudah Setor', ${oldJimp}, ${oldTab})">
          <span>⚡ Rp 8.000 (3K Jimpitan + 5K Tabungan)</span>
          <span>➜</span>
        </button>
        <button class="quick-combo-btn" onclick="pengambilanModule.applyPreset(3000, 20000, 'Sudah Setor', ${oldJimp}, ${oldTab})">
          <span>⚡ Rp 23.000 (3K Jimpitan + 20K Tabungan)</span>
          <span>➜</span>
        </button>
        <button class="quick-combo-btn" style="background: #f1f5f9; border-color: #cbd5e1; color: #334155;" onclick="pengambilanModule.applyPreset(3000, 0, 'Sudah Setor', ${oldJimp}, ${oldTab})">
          <span>🔗 Rp 3.000 (Jimpitan Saja)</span>
          <span>➜</span>
        </button>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
          <button class="btn btn-warning btn-sm" onclick="pengambilanModule.applyPreset(0, 0, 'Tidak Ada', ${oldJimp}, ${oldTab})">
            🟡 Warga Tidak Ada
          </button>
          <button class="btn btn-secondary btn-sm" onclick="pengambilanModule.applyPreset(0, 0, 'Ditunda', ${oldJimp}, ${oldTab})">
            🟠 Pengambilan Ditunda
          </button>
        </div>
      </div>

      <!-- MANUAL INPUT WITH CHIPS -->
      <div style="background: var(--bg-card-subtle); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <!-- STATUS SELECTION -->
        <div class="form-group">
          <label class="form-label">Status Kunjungan:</label>
          <select id="modalStatusSelect" class="form-control" onchange="pengambilanModule.handleModalStatusChange(this.value, ${oldJimp}, ${oldTab})">
            <option value="Sudah Setor" ${trx.status === 'Sudah Setor' ? 'selected' : ''}>🟢 Sudah Setor</option>
            <option value="Tidak Ada" ${trx.status === 'Tidak Ada' ? 'selected' : ''}>🟡 Tidak Ada (Rumah Kosong)</option>
            <option value="Ditunda" ${trx.status === 'Ditunda' ? 'selected' : ''}>🟠 Ditunda</option>
            <option value="Belum Didatangi" ${trx.status === 'Belum Didatangi' ? 'selected' : ''}>⚪ Belum Didatangi</option>
          </select>
        </div>

        <div id="modalSetoranSection" style="${trx.status === 'Sudah Setor' || trx.status === 'Belum Didatangi' ? 'display: block;' : 'display: none;'}">
          <!-- JIMPITAN -->
          <div class="form-group">
            <label class="form-label">Nominal Jimpitan (Min. Rp 3.000):</label>
            <input 
              type="number" 
              id="modalJimpitanInput" 
              class="form-control" 
              value="${trx.jimpitan || 3000}"
              min="3000"
              step="500"
              oninput="pengambilanModule.calcModalTotal(${oldJimp}, ${oldTab})"
            >
            <div class="chip-group">
              <button class="chip-btn" onclick="pengambilanModule.setJimpitanChip(3000, ${oldJimp}, ${oldTab})">3rb</button>
              <button class="chip-btn" onclick="pengambilanModule.setJimpitanChip(5000, ${oldJimp}, ${oldTab})">5rb</button>
              <button class="chip-btn" onclick="pengambilanModule.setJimpitanChip(10000, ${oldJimp}, ${oldTab})">10rb</button>
              <button class="chip-btn" onclick="pengambilanModule.setJimpitanChip(20000, ${oldJimp}, ${oldTab})">20rb</button>
            </div>
            <div id="jimpitanErrorMsg" style="display: none; color: var(--accent-red); font-size: 0.75rem; font-weight: 700; margin-top: -8px; margin-bottom: 8px;">
              ⚠️ Nominal jimpitan minimal Rp 3.000 jika warga menyetor!
            </div>
          </div>

          <!-- TABUNGAN -->
          <div class="form-group">
            <label class="form-label">Nominal Tabungan (Bebas):</label>
            <input 
              type="number" 
              id="modalTabunganInput" 
              class="form-control" 
              value="${trx.tabungan || 0}"
              min="0"
              step="1000"
              oninput="pengambilanModule.calcModalTotal(${oldJimp}, ${oldTab})"
            >
            <div class="chip-group">
              <button class="chip-btn" onclick="pengambilanModule.setTabunganChip(0, ${oldJimp}, ${oldTab})">0</button>
              <button class="chip-btn" onclick="pengambilanModule.setTabunganChip(5000, ${oldJimp}, ${oldTab})">5rb</button>
              <button class="chip-btn" onclick="pengambilanModule.setTabunganChip(10000, ${oldJimp}, ${oldTab})">10rb</button>
              <button class="chip-btn" onclick="pengambilanModule.setTabunganChip(20000, ${oldJimp}, ${oldTab})">20rb</button>
              <button class="chip-btn" onclick="pengambilanModule.setTabunganChip(50000, ${oldJimp}, ${oldTab})">50rb</button>
            </div>
          </div>

          <!-- TOTAL -->
          <div style="background: var(--bg-card); padding: 0.875rem 1rem; border-radius: var(--radius-md); border: 2px solid var(--primary-500); display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 700; font-size: 0.9375rem;">TOTAL SETOR (Jimpitan + Tabungan):</span>
            <span id="modalTotalDisplay" style="font-size: 1.4rem; font-weight: 800; color: var(--primary-600); font-family: monospace;">
              Rp ${Number(trx.total || 3000).toLocaleString('id-ID')}
            </span>
          </div>

          ${isPosted ? `
            <!-- LIVE FINANCIAL IMPACT PREVIEW -->
            <div id="modalImpactBox" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-sm); padding: 0.75rem; margin-top: 0.75rem; font-size: 0.8125rem;">
              <strong style="color: #166534;">📊 DAMPAK KEUANGAN KOREKSI:</strong>
              <div id="modalImpactDetails" style="margin-top: 4px; line-height: 1.5;">
                Menghitung dampak...
              </div>
            </div>

            <!-- MANDATORY REASON FOR INDIVIDUAL CORRECTION -->
            <div class="form-group" style="margin-top: 0.75rem; margin-bottom: 0;">
              <label class="form-label" style="font-weight: 700;">
                Alasan Koreksi Warga Ini <span style="color: var(--accent-red);">(Wajib):</span>
              </label>
              <input 
                type="text" 
                id="modalIndividualReason" 
                class="form-control" 
                placeholder="Contoh: Salah input nominal tabungan"
                value="${correctionReason || ''}"
                required
              >
            </div>
          ` : ''}
        </div>
      </div>
    `;

    app.showCustomModal({
      title: isPosted ? `🛠️ Koreksi Setoran: ${trx.nama_warga}` : `Input Setoran: ${trx.nama_warga}`,
      bodyHtml: modalHtml,
      confirmText: isPosted ? '💾 Simpan Koreksi' : '💾 Simpan Data',
      onConfirm: () => {
        return pengambilanModule.saveModalTrx(wargaId, isPosted);
      }
    });

    // Run live calculation initially
    setTimeout(() => {
      this.calcModalTotal(oldJimp, oldTab);
    }, 50);
  },

  handleModalStatusChange(val, oldJimp = 0, oldTab = 0) {
    const sec = document.getElementById('modalSetoranSection');
    if (!sec) return;
    if (val === 'Tidak Ada' || val === 'Ditunda') {
      sec.style.display = 'none';
    } else {
      sec.style.display = 'block';
    }
    this.calcModalTotal(oldJimp, oldTab);
  },

  setJimpitanChip(val, oldJimp = 0, oldTab = 0) {
    const input = document.getElementById('modalJimpitanInput');
    if (input) {
      input.value = val;
      this.calcModalTotal(oldJimp, oldTab);
    }
  },

  setTabunganChip(val, oldJimp = 0, oldTab = 0) {
    const input = document.getElementById('modalTabunganInput');
    if (input) {
      input.value = val;
      this.calcModalTotal(oldJimp, oldTab);
    }
  },

  calcModalTotal(oldJimp = 0, oldTab = 0) {
    const status = document.getElementById('modalStatusSelect')?.value || 'Sudah Setor';
    let jimp = 0;
    let tab = 0;

    if (status === 'Sudah Setor') {
      jimp = parseFloat(document.getElementById('modalJimpitanInput')?.value) || 0;
      tab = parseFloat(document.getElementById('modalTabunganInput')?.value) || 0;
    }

    const err = document.getElementById('jimpitanErrorMsg');
    const disp = document.getElementById('modalTotalDisplay');

    if (status === 'Sudah Setor' && jimp < 3000) {
      if (err) err.style.display = 'block';
    } else {
      if (err) err.style.display = 'none';
    }

    if (disp) {
      disp.innerText = `Rp ${(jimp + tab).toLocaleString('id-ID')}`;
    }

    // Impact preview for POSTED sessions
    const impactDetails = document.getElementById('modalImpactDetails');
    if (impactDetails) {
      const deltaJimp = jimp - oldJimp;
      const deltaTab = tab - oldTab;
      const deltaTotal = (jimp + tab) - (oldJimp + oldTab);

      let txt = `• Selisih Total Setoran: <strong>${deltaTotal >= 0 ? '+' : ''}Rp ${deltaTotal.toLocaleString('id-ID')}</strong><br>`;
      if (deltaTab !== 0) {
        txt += `• Saldo Tabungan Warga: <strong>${deltaTab >= 0 ? '+' : ''}Rp ${deltaTab.toLocaleString('id-ID')}</strong><br>`;
      } else {
        txt += `• Saldo Tabungan Warga: <em>Tidak berubah</em><br>`;
      }

      if (deltaJimp !== 0) {
        const half = Math.abs(deltaJimp * 0.5);
        txt += `• Kas Pemuda (50%): <strong>${deltaJimp > 0 ? '+' : '-'}Rp ${half.toLocaleString('id-ID')}</strong> • Kas Dusun (50%): <strong>${deltaJimp > 0 ? '+' : '-'}Rp ${half.toLocaleString('id-ID')}</strong>`;
      } else {
        txt += `• Kas Pemuda & Kas Dusun: <em>Tidak berubah (Jimpitan tetap)</em>`;
      }
      impactDetails.innerHTML = txt;
    }
  },

  applyPreset(jimpitan, tabungan, status, oldJimp = 0, oldTab = 0) {
    const jInput = document.getElementById('modalJimpitanInput');
    const tInput = document.getElementById('modalTabunganInput');
    const sSelect = document.getElementById('modalStatusSelect');

    if (jInput) jInput.value = jimpitan;
    if (tInput) tInput.value = tabungan;
    if (sSelect) {
      sSelect.value = status;
      this.handleModalStatusChange(status, oldJimp, oldTab);
    }
    this.calcModalTotal(oldJimp, oldTab);
  },

  saveModalTrx(wargaId, isPosted = false) {
    const status = document.getElementById('modalStatusSelect')?.value || 'Sudah Setor';
    let jimpitan = 0;
    let tabungan = 0;

    if (status === 'Sudah Setor') {
      jimpitan = parseFloat(document.getElementById('modalJimpitanInput')?.value) || 0;
      tabungan = parseFloat(document.getElementById('modalTabunganInput')?.value) || 0;

      // Strict validation: minimal 3.000 for jimpitan
      if (jimpitan < 3000) {
        alert('Nominal jimpitan minimal Rp 3.000 jika warga menyetor!');
        return false;
      }
    }

    const trx = sessionTransactions.find(t => t.warga_id === wargaId);
    if (!trx) return false;

    if (isPosted) {
      const reason = document.getElementById('modalIndividualReason')?.value.trim();
      if (!reason) {
        alert('Alasan koreksi wajib diisi!');
        return false;
      }

      try {
        const result = db.executeKoreksiTransaksi({
          pengambilanId: activeSession.id,
          trxId: trx.id,
          updatedFields: { status, jimpitan, tabungan, total: jimpitan + tabungan },
          reason: reason,
          admin: 'gemukireng'
        });

        activeSession = result.session;
        sessionTransactions = db.getTransaksiByPengambilan(activeSession.id);
        app.showToast('Koreksi berhasil disimpan & dampak kas telah diperbarui!');
        app.renderCurrentView();
        return true;
      } catch (err) {
        alert('Gagal menyimpan koreksi: ' + err.message);
        return false;
      }
    } else {
      // Draft mode update
      const idx = sessionTransactions.findIndex(t => t.warga_id === wargaId);
      if (idx !== -1) {
        sessionTransactions[idx].status = status;
        sessionTransactions[idx].jimpitan = jimpitan;
        sessionTransactions[idx].tabungan = tabungan;
        sessionTransactions[idx].total = jimpitan + tabungan;
      }

      this.updateLiveTotals();
      app.renderCurrentView();
      return true;
    }
  },

  // -------------------------------------------------------------
  // POSTING SESSION & AUDIT
  // -------------------------------------------------------------
  confirmPostingModal() {
    this.updateLiveTotals();

    const sumJimpitan = activeSession.total_jimpitan;
    const sumTabungan = activeSession.total_tabungan;
    const totalSistem = activeSession.total_sistem;
    const uangFisik = parseFloat(activeSession.uang_fisik) || 0;
    const selisih = uangFisik - totalSistem;
    const catatan = activeSession.catatan_audit || '';

    // Requirement: If selisih != 0, catatan is mandatory!
    if (selisih !== 0 && !catatan.trim()) {
      app.showAlertModal({
        title: 'Catatan Audit Wajib Diisi',
        message: `Terdapat selisih uang sebesar <strong>Rp ${selisih.toLocaleString('id-ID')}</strong>.<br><br>Anda <strong>wajib mengisi Catatan Audit / Alasan Rekonsiliasi</strong> sebelum pengesahan dapat diproses!`,
        type: 'danger'
      });
      return;
    }

    const bagianPemuda = sumJimpitan * 0.5;
    const bagianDusun = sumJimpitan * 0.5;

    const confirmHtml = `
      <div style="background: var(--bg-card-subtle); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); font-size: 0.875rem; line-height: 1.6;">
        <div style="margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
          <strong>Tanggal Pengambilan:</strong> ${activeSession.tanggal} (${activeSession.hari})<br>
          <strong>Kelompok Bertugas:</strong> ${activeSession.kelompok_nama}<br>
          <strong>Warga Dicatat:</strong> ${activeSession.warga_dicatat_count} / ${activeSession.total_warga_count} KK
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
          <div>
            <span style="color: var(--text-muted);">Total Jimpitan:</span><br>
            <strong style="font-size: 1rem; color: var(--primary-700);">Rp ${sumJimpitan.toLocaleString('id-ID')}</strong>
          </div>
          <div>
            <span style="color: var(--text-muted);">Total Tabungan:</span><br>
            <strong style="font-size: 1rem; color: var(--accent-purple);">Rp ${sumTabungan.toLocaleString('id-ID')}</strong>
          </div>
          <div>
            <span style="color: var(--text-muted);">Total Uang Sistem:</span><br>
            <strong>Rp ${totalSistem.toLocaleString('id-ID')}</strong>
          </div>
          <div>
            <span style="color: var(--text-muted);">Uang Fisik Bendahara:</span><br>
            <strong>Rp ${uangFisik.toLocaleString('id-ID')}</strong>
          </div>
        </div>

        <div style="background: var(--bg-card); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 0.75rem;">
          <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">📌 PEMBAGIAN OTOMATIS JIMPITAN (50 : 50):</div>
          <div>⚡ Masuk Kas Pemuda (+50%): <strong>+Rp ${bagianPemuda.toLocaleString('id-ID')}</strong></div>
          <div>🏘️ Masuk Kas Dusun (+50%): <strong>+Rp ${bagianDusun.toLocaleString('id-ID')}</strong></div>
        </div>

        <div>
          <strong>Status Selisih:</strong> <span class="badge ${selisih === 0 ? 'badge-success' : 'badge-danger'}">${selisih === 0 ? 'SESUAI (Rp 0)' : 'Rp ' + selisih.toLocaleString('id-ID')}</span>
          ${catatan ? `<br><strong>Catatan Audit:</strong> <em>"${catatan}"</em>` : ''}
        </div>
      </div>
    `;

    app.showConfirmModal({
      title: '⚠️ Konfirmasi Pengesahan & Posting Kas',
      message: confirmHtml,
      confirmText: '🚀 Ya, Sahkan & Posting',
      onConfirm: () => {
        pengambilanModule.executePosting();
      }
    });
  },

  executePosting() {
    this.updateLiveTotals();
    activeSession.status = 'POSTED';
    activeSession.posted_at = new Date().toISOString();

    // 1. Save Pengambilan
    db.saveOrUpdatePengambilan(activeSession);

    // 2. Save Transactions
    db.saveTransaksiBatch(sessionTransactions);

    // 3. Post 50% to Kas Pemuda
    const bagianPemuda = activeSession.total_jimpitan * 0.5;
    if (bagianPemuda > 0) {
      db.addKasPemudaEntry({
        pembukuan_id: activeSession.pembukuan_id,
        tanggal: activeSession.tanggal,
        jenis: 'masuk',
        sumber: 'Jimpitan 50%',
        kategori: 'Jimpitan Mingguan',
        nominal: bagianPemuda,
        keterangan: `Bagian 50% Jimpitan ${activeSession.tanggal} (${activeSession.kelompok_nama})`,
        petugas: activeSession.kelompok_nama
      });
    }

    // 4. Post 50% to Kas Dusun
    const bagianDusun = activeSession.total_jimpitan * 0.5;
    if (bagianDusun > 0) {
      db.addKasDusunEntry({
        pembukuan_id: activeSession.pembukuan_id,
        tanggal: activeSession.tanggal,
        jenis: 'masuk',
        sumber: 'Jimpitan 50%',
        kategori: 'Jimpitan Mingguan',
        nominal: bagianDusun,
        keterangan: `Bagian 50% Jimpitan ${activeSession.tanggal} (${activeSession.kelompok_nama})`,
        petugas: activeSession.kelompok_nama
      });
    }

    // 5. Audit Log
    db.addAuditLog(
      'Posting Kas Jimpitan',
      `Mengesahkan pengambilan ${activeSession.kode_pengambilan || activeSession.id} (${activeSession.kelompok_nama}) total Rp ${activeSession.total_sistem.toLocaleString('id-ID')}`,
      'info'
    );

    app.showToast('Pengambilan berhasil disahkan dan diposting ke Kas!');
    app.renderCurrentView();
  },

  // -------------------------------------------------------------
  // CONFIG & DATE EDIT (WITH STRICT UNIQUE VALIDATION)
  // -------------------------------------------------------------
  openSessionConfigModal() {
    const pbk = db.getActivePembukuan();
    const groups = db.getGroups();
    const isPosted = activeSession.status === 'POSTED';

    const modalHtml = `
      <div class="form-group">
        <label class="form-label">Tanggal Pengambilan:</label>
        <input type="date" id="cfgTanggal" class="form-control" value="${activeSession.tanggal}">
        <small style="color: var(--text-muted);">Satu tanggal hanya boleh memiliki satu sesi per tahun pembukuan.</small>
      </div>

      <div class="form-group">
        <label class="form-label">Hari & Keterangan:</label>
        <select id="cfgHari" class="form-control">
          <option value="Malam Minggu" ${activeSession.hari === 'Malam Minggu' ? 'selected' : ''}>Malam Minggu (Normal)</option>
          <option value="Malam Senin (Ditunda Hujan)" ${activeSession.hari.includes('Malam Senin') ? 'selected' : ''}>Malam Senin (Ditunda Hujan / Halangan - Kelompok Tetap)</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Kelompok Penanggung Jawab:</label>
        <select id="cfgKelompok" class="form-control" ${isPosted ? 'disabled' : ''}>
          ${groups.map(g => `
            <option value="${g.id}" ${g.id === activeSession.kelompok_id ? 'selected' : ''}>
              ${g.nama} (${g.anggota.length} orang)
            </option>
          `).join('')}
        </select>
        ${isPosted ? '<small style="color: #ea580c;">Kelompok terkunci karena sesi sudah diposting.</small>' : ''}
      </div>
    `;

    app.showCustomModal({
      title: 'Ubah Jadwal / Konfigurasi Sesi',
      bodyHtml: modalHtml,
      confirmText: 'Simpan Konfigurasi',
      onConfirm: () => {
        const tgl = document.getElementById('cfgTanggal')?.value;
        const hari = document.getElementById('cfgHari')?.value;
        const grpId = document.getElementById('cfgKelompok')?.value;
        const grp = groups.find(g => g.id === grpId);

        // Check date conflict
        if (tgl !== activeSession.tanggal) {
          const conflict = db.checkTanggalPengambilanExists(pbk.id, tgl, activeSession.id);
          if (conflict) {
            alert(`⚠️ Tanggal ${tgl} sudah digunakan oleh ${conflict.kelompok_nama} (${conflict.status}). Silakan pilih tanggal lain!`);
            return false;
          }
        }

        activeSession.tanggal = tgl;
        activeSession.hari = hari;
        if (grp && !isPosted) {
          activeSession.kelompok_id = grp.id;
          activeSession.kelompok_nama = grp.nama;
          activeSession.petugas = grp.anggota;
        }

        // update date on child transaction rows
        sessionTransactions.forEach(t => t.tanggal = tgl);
        db.saveOrUpdatePengambilan(activeSession);
        db.saveTransaksiBatch(sessionTransactions);

        db.addAuditLog(
          'Ubah Konfigurasi Sesi',
          `Ubah jadwal pengambilan ${activeSession.id} menjadi tanggal ${tgl} (${hari})`,
          'info'
        );

        app.showToast('Jadwal sesi berhasil diperbarui!');
        app.renderCurrentView();
        return true;
      }
    });
  },

  // -------------------------------------------------------------
  // CREATE NEW SESSION (UNIQUE DATE VALIDATION)
  // -------------------------------------------------------------
  createNewSessionModal() {
    const pbk = db.getActivePembukuan();
    const groups = db.getGroups();
    const list = db.getPengambilanList().filter(p => p.pembukuan_id === pbk.id);
    const nextCode = `JMP-${pbk.tahun}-${String(list.length + 1).padStart(3, '0')}`;

    const modalHtml = `
      <div class="form-group">
        <label class="form-label">Kode Pengambilan:</label>
        <input type="text" id="newCode" class="form-control" value="${nextCode}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">Tanggal Pengambilan:</label>
        <input type="date" id="newTanggal" class="form-control" value="${new Date().toISOString().split('T')[0]}">
        <small style="color: var(--text-muted);">Sistem akan otomatis mengecek apakah tanggal sudah digunakan sebelumnya.</small>
      </div>
      <div class="form-group">
        <label class="form-label">Hari Pengambilan:</label>
        <select id="newHari" class="form-control">
          <option value="Malam Minggu">Malam Minggu (Normal)</option>
          <option value="Malam Senin (Ditunda Hujan)">Malam Senin (Ditunda Hujan / Halangan)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Kelompok Petugas Bertugas:</label>
        <select id="newKelompok" class="form-control">
          ${groups.map(g => `<option value="${g.id}">${g.nama} (${g.anggota.join(', ')})</option>`).join('')}
        </select>
      </div>
    `;

    app.showCustomModal({
      title: '+ Buat Sesi Pengambilan Baru',
      bodyHtml: modalHtml,
      confirmText: 'Mulai Pengambilan',
      onConfirm: () => {
        const tgl = document.getElementById('newTanggal')?.value;
        const hari = document.getElementById('newHari')?.value;
        const grpId = document.getElementById('newKelompok')?.value;
        const grp = groups.find(g => g.id === grpId);

        // 1. Check Unique Date + Pembukuan
        const existing = db.checkTanggalPengambilanExists(pbk.id, tgl);
        if (existing) {
          app.showAlertModal({
            title: '⚠️ Tanggal Pengambilan Sudah Digunakan',
            message: `
              <div style="font-size: 0.9375rem; line-height: 1.6;">
                Pengambilan tanggal <strong>${tgl}</strong> sudah tercatat sebagai <strong>${existing.kelompok_nama}</strong> (Status: <span class="badge ${existing.status === 'POSTED' ? 'badge-success' : 'badge-warning'}">${existing.status}</span>).<br><br>
                Dalam satu pembukuan, <strong>satu tanggal hanya boleh memiliki satu sesi pengambilan</strong>.<br><br>
                Silakan buka data pengambilan tersebut dari menu <strong>Histori Pengambilan</strong> jika ingin melihat atau melakukan koreksi.
              </div>
            `,
            type: 'warning'
          });
          return false;
        }

        // 2. Create new session
        activeSession = {
          id: nextCode,
          kode_pengambilan: nextCode,
          pembukuan_id: pbk.id,
          tanggal: tgl,
          hari: hari,
          kelompok_id: grp.id,
          kelompok_nama: grp.nama,
          petugas: grp.anggota,
          status: 'DRAFT',
          total_jimpitan: 0,
          total_tabungan: 0,
          total_sistem: 0,
          uang_fisik: 0,
          selisih: 0,
          catatan_audit: '',
          warga_dicatat_count: 0,
          total_warga_count: 40
        };

        const wargaList = db.getWarga().filter(w => w.status === 'Aktif');
        sessionTransactions = wargaList.map(w => ({
          id: `TRX-${activeSession.id}-${w.kode_warga}`,
          pengambilan_id: activeSession.id,
          pembukuan_id: pbk.id,
          warga_id: w.id,
          kode_warga: w.kode_warga,
          nama_warga: w.nama,
          tanggal: activeSession.tanggal,
          jimpitan: 3000,
          tabungan: 0,
          total: 3000,
          status: 'Belum Didatangi',
          catatan: '',
          koreksi_histori: []
        }));

        db.saveOrUpdatePengambilan(activeSession);
        db.saveTransaksiBatch(sessionTransactions);
        isCorrectionMode = false;
        correctionReason = '';
        currentMainTab = 'input';
        app.showToast('Sesi pengambilan baru berhasil dibuat!');
        app.renderCurrentView();
        return true;
      }
    });
  },

  // -------------------------------------------------------------
  // CETAK & UNDUH PDF SESI PENGAMBILAN
  // -------------------------------------------------------------
  prepareSingleSessionHTML(sessionId) {
    const session = db.getPengambilanById(sessionId);
    if (!session) return { filename: 'Berita_Acara_Pengambilan.pdf' };
    const trxList = db.getTransaksiByPengambilan(sessionId);
    const pbk = db.getActivePembukuan();

    const printContainer = document.getElementById('print-container');
    if (!printContainer) return { filename: `Berita_Acara_${session.tanggal}.pdf` };

    const filename = `Berita_Acara_Jimpitan_${session.tanggal}_${session.kelompok_nama.replace(/\s+/g, '_')}.pdf`;

    printContainer.innerHTML = `
      <div class="print-page">
        <!-- KOP SURAT RESMI -->
        <div class="print-kop">
          <img src="assets/img/logo_kiyudan.jpg" class="print-kop-logo" alt="Logo Dusun">
          <div class="print-kop-text">
            <h2>PEMUDA DUSUN KIYUDAN</h2>
            <h3>DESA MAJAKSINGI, KECAMATAN BOROBUDUR, KABUPATEN MAGELANG</h3>
            <p class="kop-sub">Semboyan: Guyub Rukun Maju Bersama • Sekretariat: Balai Dusun Kiyudan</p>
          </div>
        </div>

        <div class="print-title-box">
          <div class="print-title">BERITA ACARA & REKAPITULASI PENGAMBILAN JIMPITAN</div>
          <div class="print-subtitle">ID Sesi: ${session.kode_pengambilan || session.id} • Tanggal: ${session.tanggal} (${session.hari})</div>
        </div>

        <!-- META TABLE -->
        <table class="print-meta-table">
          <tr>
            <td style="width: 25%;"><strong>Tanggal Pengambilan</strong></td>
            <td style="width: 25%;">: ${session.tanggal} (${session.hari})</td>
            <td style="width: 25%;"><strong>Kelompok Bertugas</strong></td>
            <td style="width: 25%;">: ${session.kelompok_nama}</td>
          </tr>
          <tr>
            <td><strong>Status Pengesahan</strong></td>
            <td>: ${session.status} ${session.koreksi_count ? `(${session.koreksi_count}x Dikoreksi)` : ''}</td>
            <td><strong>Petugas Lapangan</strong></td>
            <td>: ${(session.petugas || []).join(', ')}</td>
          </tr>
          <tr>
            <td><strong>Total Jimpitan (50:50)</strong></td>
            <td>: Rp ${(session.total_jimpitan || 0).toLocaleString('id-ID')}</td>
            <td><strong>Total Tabungan Warga</strong></td>
            <td>: Rp ${(session.total_tabungan || 0).toLocaleString('id-ID')}</td>
          </tr>
          <tr>
            <td><strong>Total Setoran Sistem</strong></td>
            <td>: <strong>Rp ${(session.total_sistem || 0).toLocaleString('id-ID')}</strong></td>
            <td><strong>Uang Fisik Diterima</strong></td>
            <td>: Rp ${(session.uang_fisik || session.total_sistem || 0).toLocaleString('id-ID')}</td>
          </tr>
        </table>

        <!-- 40 KK TRANSACTION TABLE -->
        <div class="print-section-title">Daftar Rincian Setoran 40 KK Warga:</div>
        <table class="print-table">
          <thead>
            <tr>
              <th style="width: 25px;">No</th>
              <th style="width: 70px;">Kode</th>
              <th>Nama Warga</th>
              <th style="width: 100px;">Status</th>
              <th class="text-right" style="width: 90px;">Jimpitan (Rp)</th>
              <th class="text-right" style="width: 90px;">Tabungan (Rp)</th>
              <th class="text-right" style="width: 100px;">Total (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${trxList.map((t, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td class="text-center" style="font-family: monospace;">${t.kode_warga}</td>
                <td><strong>${t.nama_warga}</strong></td>
                <td>${t.status}</td>
                <td class="text-right">${t.status === 'Sudah Setor' ? Number(t.jimpitan).toLocaleString('id-ID') : '-'}</td>
                <td class="text-right">${t.status === 'Sudah Setor' ? Number(t.tabungan).toLocaleString('id-ID') : '-'}</td>
                <td class="text-right"><strong>${t.status === 'Sudah Setor' ? Number(t.total).toLocaleString('id-ID') : '-'}</strong></td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4" class="text-right">TOTAL SESI INI:</td>
              <td class="text-right">Rp ${(session.total_jimpitan || 0).toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${(session.total_tabungan || 0).toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${(session.total_sistem || 0).toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        <!-- SIGNATURE SECTION -->
        <div class="print-signatures">
          <div class="sig-box">
            <div class="sig-title">Mengetahui,<br>Ketua Pemuda Dusun Kiyudan</div>
            <div class="sig-name">Humam Syarif</div>
            <div class="sig-role">Ketua Pemuda</div>
          </div>
          <div class="sig-box">
            <div class="sig-title">Koordinator Lapangan,<br>Penanggung Jawab Kelompok</div>
            <div class="sig-name">${session.kelompok_nama}</div>
            <div class="sig-role">Petugas Bertugas</div>
          </div>
          <div class="sig-box">
            <div class="sig-title">Disahkan Oleh,<br>Bendahara Jimpitan</div>
            <div class="sig-name">Bendahara Pemuda</div>
            <div class="sig-role">Pengelola Kas & Tabungan</div>
          </div>
        </div>
      </div>
    `;

    return { filename };
  },

  printSingleSessionPDF(sessionId) {
    const { filename } = this.prepareSingleSessionHTML(sessionId);
    document.title = filename.replace('.pdf', '');
    setTimeout(() => {
      window.print();
    }, 150);
  },

  downloadSingleSessionPDF(sessionId) {
    const { filename } = this.prepareSingleSessionHTML(sessionId);
    app.downloadPDFFromContainer(filename);
  }
};
