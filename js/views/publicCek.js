// View: Cek Tabungan Mandiri Warga & Cetak PDF (Tanpa Login)
import { db } from '../db.js';

let selectedWarga = null;
let currentFilterPeriod = 'semua'; // 'semua' | '2026' | '2026-08'
let sortOrderDate = 'DESC'; // 'DESC' (Terbaru) | 'ASC' (Terlama)

export function renderPublicCek() {
  const wargaList = db.getWarga().filter(w => w.status === 'Aktif');

  return `
    <div class="card" style="max-width: 860px; margin: 0 auto;">
      <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
        <div>
          <h2 class="card-title" style="font-size: 1.35rem;">🔎 Cek Tabungan & Histori Warga</h2>
          <p class="card-subtitle">Warga Dusun Kiyudan dapat mengecek saldo tabungan dan mencetak laporan mandiri tanpa login</p>
        </div>
      </div>

      <!-- SEARCH INPUT SECTION -->
      <div style="margin: 1.5rem 0;">
        <label class="form-label" style="font-size: 1rem; margin-bottom: 0.5rem;">
          Masukkan Nama Warga atau Kode Warga (contoh: Anwari / KDY-001):
        </label>
        <div style="display: flex; gap: 0.5rem;">
          <div style="position: relative; flex: 1;">
            <input 
              type="text" 
              id="searchWargaInput" 
              class="form-control" 
              placeholder="Ketik nama Anda di sini..." 
              autocomplete="off"
              oninput="publicCekModule.handleSearchInput(this.value)"
              onkeydown="if(event.key === 'Enter') publicCekModule.searchSubmit()"
              style="padding: 0.75rem 1rem; font-size: 1rem;"
            >
            <div id="searchSuggestionsBox" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 20; max-height: 220px; overflow-y: auto; margin-top: 4px;"></div>
          </div>
          <button class="btn btn-primary" onclick="publicCekModule.searchSubmit()">
            🔍 Cari Data
          </button>
        </div>
        <p class="input-help">Tip: Ketik beberapa huruf nama Anda lalu pilih nama Anda dari daftar saran.</p>
      </div>

      <!-- RESULT SECTION -->
      <div id="wargaResultContainer" style="display: none;">
        <!-- Filled dynamically -->
      </div>
    </div>
  `;
}

export const publicCekModule = {
  handleSearchInput(query) {
    const box = document.getElementById('searchSuggestionsBox');
    if (!box) return;

    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      box.style.display = 'none';
      return;
    }

    const wargaList = db.getWarga().filter(w => w.status === 'Aktif');
    const matched = wargaList.filter(w => 
      w.nama.toLowerCase().includes(trimmed) || 
      w.kode_warga.toLowerCase().includes(trimmed)
    );

    if (matched.length === 0) {
      box.innerHTML = `<div style="padding: 0.75rem 1rem; color: var(--text-muted); font-size: 0.875rem;">Tidak ditemukan warga dengan nama "${query}"</div>`;
      box.style.display = 'block';
      return;
    }

    box.innerHTML = matched.map(w => `
      <div 
        style="padding: 0.65rem 1rem; cursor: pointer; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;"
        onmouseover="this.style.backgroundColor='var(--bg-card-subtle)'"
        onmouseout="this.style.backgroundColor='transparent'"
        onclick="publicCekModule.confirmWargaIdentity('${w.id}')"
      >
        <div>
          <strong>${w.nama}</strong>
          <span style="color: var(--text-muted); font-size: 0.8125rem; margin-left: 0.5rem;">(${w.kode_warga})</span>
        </div>
        <span class="badge badge-success">Pilih</span>
      </div>
    `).join('');
    box.style.display = 'block';
  },

  searchSubmit() {
    const val = document.getElementById('searchWargaInput')?.value.trim();
    if (!val) return;

    const wargaList = db.getWarga().filter(w => w.status === 'Aktif');
    const found = wargaList.find(w => 
      w.nama.toLowerCase() === val.toLowerCase() || 
      w.kode_warga.toLowerCase() === val.toLowerCase()
    );

    if (found) {
      this.confirmWargaIdentity(found.id);
    } else {
      // check partial match
      const matched = wargaList.filter(w => w.nama.toLowerCase().includes(val.toLowerCase()));
      if (matched.length === 1) {
        this.confirmWargaIdentity(matched[0].id);
      } else {
        this.handleSearchInput(val);
      }
    }
  },

  confirmWargaIdentity(wargaId) {
    // Hide suggestions
    const box = document.getElementById('searchSuggestionsBox');
    if (box) box.style.display = 'none';

    const warga = db.getWarga().find(w => w.id === wargaId);
    if (!warga) return;

    // Show safe verification confirmation popup
    app.showConfirmModal({
      title: 'Konfirmasi Identitas Warga',
      message: `Ditemukan data untuk warga <strong>${warga.nama}</strong> (Kode: ${warga.kode_warga}).<br><br>Apakah ini adalah data Anda?`,
      confirmText: 'Ya, Lihat Data Saya',
      cancelText: 'Bukan Saya',
      onConfirm: () => {
        selectedWarga = warga;
        this.displayWargaData(warga);
      }
    });
  },

  displayWargaData(warga) {
    const container = document.getElementById('wargaResultContainer');
    if (!container) return;

    const pbk = db.getActivePembukuan();
    const saldo = db.getSaldoTabunganWarga(warga.id, pbk.id);
    let trxList = db.getTransaksiByWarga(warga.id, pbk.id);

    // Filter by period
    if (currentFilterPeriod === '2026-08') {
      trxList = trxList.filter(t => t.tanggal && t.tanggal.startsWith('2026-08'));
    } else if (currentFilterPeriod === '2026') {
      trxList = trxList.filter(t => t.tanggal && t.tanggal.startsWith('2026'));
    } else if (currentFilterPeriod === '2026-08_2027-05') {
      trxList = trxList.filter(t => {
        if (!t.tanggal) return false;
        const pKey = t.tanggal.slice(0, 7);
        return pKey >= '2026-08' && pKey <= '2027-05';
      });
    }

    // Sort by date
    trxList.sort((a, b) => {
      return sortOrderDate === 'ASC' 
        ? new Date(a.tanggal) - new Date(b.tanggal) 
        : new Date(b.tanggal) - new Date(a.tanggal);
    });

    container.innerHTML = `
      <div style="background: var(--bg-card-subtle); border-radius: var(--radius-lg); padding: 1.5rem; border: 1px solid var(--border-color); margin-top: 1rem;">
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1rem;">
          <div>
            <span class="badge badge-info" style="font-size: 0.8125rem;">Kode Warga: ${warga.kode_warga}</span>
            <h2 style="font-size: 1.625rem; font-weight: 800; color: var(--primary-800); margin: 0.25rem 0;">
              ${warga.nama}
            </h2>
            <div style="font-size: 0.875rem; color: var(--text-secondary);">
              Status: <span class="badge badge-success">${warga.status}</span> • Periode: ${pbk.nama}
            </div>
          </div>
          <div style="text-align: right; background: var(--bg-card); border: 2px solid var(--primary-500); padding: 1rem 1.5rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
              Saldo Tabungan Anda
            </div>
            <div style="font-size: 1.75rem; font-weight: 800; color: var(--primary-600); font-family: monospace;">
              Rp ${saldo.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <!-- ACTIONS & PERIOD FILTER -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <label style="font-size: 0.875rem; font-weight: 600;">Filter Periode:</label>
              <select class="form-control" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.875rem;" onchange="publicCekModule.filterHistory(this.value)">
                <option value="semua" ${currentFilterPeriod === 'semua' ? 'selected' : ''}>Semua Transaksi</option>
                <option value="2026-08" ${currentFilterPeriod === '2026-08' ? 'selected' : ''}>Bulan Agustus 2026</option>
                <option value="2026" ${currentFilterPeriod === '2026' ? 'selected' : ''}>Tahun 2026</option>
                <option value="2026-08_2027-05" ${currentFilterPeriod === '2026-08_2027-05' ? 'selected' : ''}>Rentang Ags 2026 – Mei 2027</option>
              </select>
            </div>

            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <label style="font-size: 0.875rem; font-weight: 600;">Urutan Tanggal:</label>
              <button class="btn btn-outline-secondary btn-sm" onclick="publicCekModule.toggleDateSort()" title="Klik untuk mengubah urutan tanggal">
                ${sortOrderDate === 'DESC' ? '⬇️ Tanggal Terbaru' : '⬆️ Tanggal Terlama'}
              </button>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="publicCekModule.downloadIndividualPDF('${warga.id}')" title="Unduh atau cetak dokumen PDF rekapitulasi tabungan">
              📥 Unduh / Cetak Dokumen PDF
            </button>
          </div>
        </div>

        <!-- TRANSACTION TABLE -->
        <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem;">📜 Riwayat Transaksi Jimpitan & Tabungan:</h4>
        ${trxList.length === 0 ? `
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">Belum ada riwayat transaksi jimpitan / tabungan pada periode ini.</div>
        ` : `
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th style="cursor: pointer;" onclick="publicCekModule.toggleDateSort()" title="Klik untuk mengurutkan tanggal">
                    Tanggal ${sortOrderDate === 'DESC' ? '⬇️' : '⬆️'}
                  </th>
                  <th>Status Setor</th>
                  <th style="text-align: right;">Jimpitan</th>
                  <th style="text-align: right;">Tabungan</th>
                  <th style="text-align: right;">Total Setor</th>
                </tr>
              </thead>
              <tbody>
                ${trxList.map(t => `
                  <tr>
                    <td><strong>${publicCekModule.formatDate(t.tanggal)}</strong></td>
                    <td>
                      <span class="badge ${t.status === 'Sudah Setor' ? 'badge-success' : (t.status === 'Tidak Ada' ? 'badge-warning' : 'badge-neutral')}">
                        ${t.status}
                      </span>
                    </td>
                    <td style="text-align: right; font-family: monospace; font-weight: 600;">
                      ${t.jimpitan ? 'Rp ' + Number(t.jimpitan).toLocaleString('id-ID') : '-'}
                    </td>
                    <td style="text-align: right; font-family: monospace; font-weight: 700; color: var(--primary-700);">
                      ${t.tabungan ? '+Rp ' + Number(t.tabungan).toLocaleString('id-ID') : '-'}
                    </td>
                    <td style="text-align: right; font-family: monospace; font-weight: 800;">
                      ${t.total ? 'Rp ' + Number(t.total).toLocaleString('id-ID') : '-'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    container.style.display = 'block';
  },

  toggleDateSort() {
    sortOrderDate = sortOrderDate === 'DESC' ? 'ASC' : 'DESC';
    if (selectedWarga) {
      this.displayWargaData(selectedWarga);
    }
  },

  filterHistory(val) {
    currentFilterPeriod = val;
    if (selectedWarga) {
      this.displayWargaData(selectedWarga);
    }
  },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d} ${months[parseInt(m) - 1]} ${y}`;
  },

  preparePrintHTML(wargaId) {
    const warga = db.getWarga().find(w => w.id === wargaId);
    if (!warga) return { filename: 'Laporan_Tabungan.pdf' };

    const pbk = db.getActivePembukuan();
    const saldo = db.getSaldoTabunganWarga(warga.id, pbk.id);
    let trxList = db.getTransaksiByWarga(warga.id, pbk.id);

    // Apply same date sorting for PDF
    trxList.sort((a, b) => {
      return sortOrderDate === 'ASC' 
        ? new Date(a.tanggal) - new Date(b.tanggal) 
        : new Date(b.tanggal) - new Date(a.tanggal);
    });

    const printContainer = document.getElementById('print-container');
    if (!printContainer) return { filename: `Laporan_Tabungan_${warga.kode_warga}.pdf` };

    const filename = `Laporan_Tabungan_${warga.kode_warga}_${warga.nama.replace(/\s+/g, '_')}_${pbk.tahun}.pdf`;

    printContainer.innerHTML = `
      <div class="print-kop">
        <img src="assets/img/logo_kiyudan.jpg" class="print-kop-logo" alt="Logo Dusun">
        <div class="print-kop-text">
          <h2>PEMUDA DUSUN KIYUDAN</h2>
          <h3>DESA MAJAKSINGI, KECAMATAN BOROBUDUR, KABUPATEN MAGELANG</h3>
          <p class="kop-sub">Semboyan: Guyub Rukun Maju Bersama • Sekretariat: Balai Dusun Kiyudan</p>
        </div>
      </div>

      <div class="print-title-box">
        <h3>LAPORAN REKAPITULASI TABUNGAN & JIMPITAN WARGA</h3>
        <p>Tahun Pembukuan: ${pbk.tahun}</p>
      </div>

      <table class="print-meta-table">
        <tr>
          <td style="width: 140px;"><strong>Kode Warga</strong></td>
          <td style="width: 10px;">:</td>
          <td>${warga.kode_warga}</td>
          <td style="width: 140px;"><strong>Tanggal Cetak</strong></td>
          <td style="width: 10px;">:</td>
          <td>${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
        </tr>
        <tr>
          <td><strong>Nama Warga</strong></td>
          <td>:</td>
          <td><strong>${warga.nama}</strong></td>
          <td><strong>Status Warga</strong></td>
          <td>:</td>
          <td>${warga.status}</td>
        </tr>
      </table>

      <table class="print-table">
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th>Tanggal Setoran</th>
            <th>Status Kunjungan</th>
            <th class="text-right">Jimpitan (Rp)</th>
            <th class="text-right">Tabungan (Rp)</th>
            <th class="text-right">Total Setor (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${trxList.map((t, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td>${publicCekModule.formatDate(t.tanggal)}</td>
              <td class="text-center">${t.status}</td>
              <td class="text-right">${t.jimpitan ? Number(t.jimpitan).toLocaleString('id-ID') : '-'}</td>
              <td class="text-right">${t.tabungan ? Number(t.tabungan).toLocaleString('id-ID') : '-'}</td>
              <td class="text-right">${t.total ? Number(t.total).toLocaleString('id-ID') : '-'}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="4" class="text-right"><strong>TOTAL SALDO TABUNGAN SAAT INI</strong></td>
            <td colspan="2" class="text-right" style="font-size: 11pt;"><strong>Rp ${saldo.toLocaleString('id-ID')}</strong></td>
          </tr>
        </tbody>
      </table>

      <div class="print-signatures">
        <div class="signature-block">
          <div>Mengetahui,</div>
          <div class="signature-title">Ketua Pemuda Dusun Kiyudan</div>
          <div class="signature-space"></div>
          <div class="signature-name">Humam Syarif</div>
        </div>
        <div class="signature-block">
          <div>Dusun Kiyudan, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <div class="signature-title">Bendahara Jimpitan</div>
          <div class="signature-space"></div>
          <div class="signature-name">Bendahara Pemuda</div>
        </div>
      </div>
    `;

    return { filename };
  },

  printIndividualPDF(wargaId) {
    const { filename } = this.preparePrintHTML(wargaId);
    document.title = filename.replace('.pdf', '');
    window.print();
  },

  downloadIndividualPDF(wargaId) {
    const { filename } = this.preparePrintHTML(wargaId);
    app.downloadPDFFromContainer(filename);
  }
};
