// View: Laporan Keuangan & Generator PDF Bulanan / Tahunan / Rentang Kustom / Per Warga
import { db } from '../db.js';

let filterJenis = 'bulanan'; // 'bulanan' | 'tahunan' | 'rentang' | 'warga'
let filterBulan = '08';
let filterTahun = '2026';
let rangeStartMonth = '08';
let rangeStartYear = '2026';
let rangeEndMonth = '05';
let rangeEndYear = '2027';
let sortOrderDate = 'DESC'; // 'DESC' (Terbaru) | 'ASC' (Terlama)

export function renderLaporan() {
  const pbk = db.getActivePembukuan();
  const wargaList = db.getWarga().filter(w => w.status === 'Aktif');

  return `
    <div>
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header" style="flex-wrap: wrap;">
          <div>
            <h2 class="card-title">📊 Pusat Laporan Keuangan & Unduh / Cetak PDF</h2>
            <p class="card-subtitle">Generate laporan resmi bulanan, tahunan, rentang periode kustom, dan rekapitulasi 40 KK warga</p>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="laporanModule.downloadPDF()" title="Unduh atau cetak dokumen PDF resmi">
              📥 Unduh / Cetak Dokumen PDF
            </button>
          </div>
        </div>

        <!-- FILTER CONTROLS -->
        <div style="background: var(--bg-card-subtle); padding: 1.25rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
          <div class="form-row" style="align-items: flex-end;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Jenis Laporan:</label>
              <select class="form-control" onchange="laporanModule.changeJenis(this.value)">
                <option value="bulanan" ${filterJenis === 'bulanan' ? 'selected' : ''}>Laporan Keuangan Bulanan</option>
                <option value="tahunan" ${filterJenis === 'tahunan' ? 'selected' : ''}>Laporan Keuangan Tahunan</option>
                <option value="rentang" ${filterJenis === 'rentang' ? 'selected' : ''}>Laporan Rentang Periode Kustom</option>
                <option value="warga" ${filterJenis === 'warga' ? 'selected' : ''}>Laporan Rekapitulasi Seluruh Warga (40 KK)</option>
              </select>
            </div>

            ${filterJenis === 'bulanan' ? `
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Pilih Bulan:</label>
                <select class="form-control" onchange="laporanModule.changeBulan(this.value)">
                  <option value="01" ${filterBulan === '01' ? 'selected' : ''}>Januari</option>
                  <option value="02" ${filterBulan === '02' ? 'selected' : ''}>Februari</option>
                  <option value="03" ${filterBulan === '03' ? 'selected' : ''}>Maret</option>
                  <option value="04" ${filterBulan === '04' ? 'selected' : ''}>April</option>
                  <option value="05" ${filterBulan === '05' ? 'selected' : ''}>Mei</option>
                  <option value="06" ${filterBulan === '06' ? 'selected' : ''}>Juni</option>
                  <option value="07" ${filterBulan === '07' ? 'selected' : ''}>Juli</option>
                  <option value="08" ${filterBulan === '08' ? 'selected' : ''}>Agustus</option>
                  <option value="09" ${filterBulan === '09' ? 'selected' : ''}>September</option>
                  <option value="10" ${filterBulan === '10' ? 'selected' : ''}>Oktober</option>
                  <option value="11" ${filterBulan === '11' ? 'selected' : ''}>November</option>
                  <option value="12" ${filterBulan === '12' ? 'selected' : ''}>Desember</option>
                </select>
              </div>
            ` : ''}

            ${filterJenis !== 'rentang' ? `
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Tahun Pembukuan:</label>
                <select class="form-control" onchange="laporanModule.changeTahun(this.value)">
                  <option value="2025" ${filterTahun === '2025' ? 'selected' : ''}>Tahun 2025</option>
                  <option value="2026" ${filterTahun === '2026' ? 'selected' : ''}>Tahun 2026</option>
                  <option value="2027" ${filterTahun === '2027' ? 'selected' : ''}>Tahun 2027</option>
                  <option value="2028" ${filterTahun === '2028' ? 'selected' : ''}>Tahun 2028</option>
                </select>
              </div>
            ` : ''}

            ${filterJenis === 'rentang' ? `
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Dari (Bulan & Tahun):</label>
                <div style="display: flex; gap: 0.25rem;">
                  <select class="form-control" onchange="laporanModule.changeRangeStartMonth(this.value)">
                    <option value="01" ${rangeStartMonth === '01' ? 'selected' : ''}>Jan</option>
                    <option value="02" ${rangeStartMonth === '02' ? 'selected' : ''}>Feb</option>
                    <option value="03" ${rangeStartMonth === '03' ? 'selected' : ''}>Mar</option>
                    <option value="04" ${rangeStartMonth === '04' ? 'selected' : ''}>Apr</option>
                    <option value="05" ${rangeStartMonth === '05' ? 'selected' : ''}>Mei</option>
                    <option value="06" ${rangeStartMonth === '06' ? 'selected' : ''}>Jun</option>
                    <option value="07" ${rangeStartMonth === '07' ? 'selected' : ''}>Jul</option>
                    <option value="08" ${rangeStartMonth === '08' ? 'selected' : ''}>Ags</option>
                    <option value="09" ${rangeStartMonth === '09' ? 'selected' : ''}>Sep</option>
                    <option value="10" ${rangeStartMonth === '10' ? 'selected' : ''}>Okt</option>
                    <option value="11" ${rangeStartMonth === '11' ? 'selected' : ''}>Nov</option>
                    <option value="12" ${rangeStartMonth === '12' ? 'selected' : ''}>Des</option>
                  </select>
                  <select class="form-control" onchange="laporanModule.changeRangeStartYear(this.value)">
                    <option value="2025" ${rangeStartYear === '2025' ? 'selected' : ''}>2025</option>
                    <option value="2026" ${rangeStartYear === '2026' ? 'selected' : ''}>2026</option>
                    <option value="2027" ${rangeStartYear === '2027' ? 'selected' : ''}>2027</option>
                    <option value="2028" ${rangeStartYear === '2028' ? 'selected' : ''}>2028</option>
                  </select>
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Sampai (Bulan & Tahun):</label>
                <div style="display: flex; gap: 0.25rem;">
                  <select class="form-control" onchange="laporanModule.changeRangeEndMonth(this.value)">
                    <option value="01" ${rangeEndMonth === '01' ? 'selected' : ''}>Jan</option>
                    <option value="02" ${rangeEndMonth === '02' ? 'selected' : ''}>Feb</option>
                    <option value="03" ${rangeEndMonth === '03' ? 'selected' : ''}>Mar</option>
                    <option value="04" ${rangeEndMonth === '04' ? 'selected' : ''}>Apr</option>
                    <option value="05" ${rangeEndMonth === '05' ? 'selected' : ''}>Mei</option>
                    <option value="06" ${rangeEndMonth === '06' ? 'selected' : ''}>Jun</option>
                    <option value="07" ${rangeEndMonth === '07' ? 'selected' : ''}>Jul</option>
                    <option value="08" ${rangeEndMonth === '08' ? 'selected' : ''}>Ags</option>
                    <option value="09" ${rangeEndMonth === '09' ? 'selected' : ''}>Sep</option>
                    <option value="10" ${rangeEndMonth === '10' ? 'selected' : ''}>Okt</option>
                    <option value="11" ${rangeEndMonth === '11' ? 'selected' : ''}>Nov</option>
                    <option value="12" ${rangeEndMonth === '12' ? 'selected' : ''}>Des</option>
                  </select>
                  <select class="form-control" onchange="laporanModule.changeRangeEndYear(this.value)">
                    <option value="2025" ${rangeEndYear === '2025' ? 'selected' : ''}>2025</option>
                    <option value="2026" ${rangeEndYear === '2026' ? 'selected' : ''}>2026</option>
                    <option value="2027" ${rangeEndYear === '2027' ? 'selected' : ''}>2027</option>
                    <option value="2028" ${rangeEndYear === '2028' ? 'selected' : ''}>2028</option>
                  </select>
                </div>
              </div>
            ` : ''}

            <div class="form-group" style="margin-bottom: 0;">
              <button class="btn btn-outline-secondary" onclick="laporanModule.toggleDateSort()" title="Klik untuk mengubah urutan tanggal">
                ${sortOrderDate === 'DESC' ? '⬇️ Tanggal Terbaru' : '⬆️ Tanggal Terlama'}
              </button>
            </div>
          </div>
        </div>

        <!-- REPORT PREVIEW SECTION -->
        <div id="reportPreviewContent">
          ${laporanModule.generateReportHtml(pbk)}
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// HELPER: GET MONTHS IN RANGE
// -------------------------------------------------------------
function getMonthsInRange(startYear, startMonth, endYear, endMonth) {
  let sY = parseInt(startYear);
  let sM = parseInt(startMonth);
  let eY = parseInt(endYear);
  let eM = parseInt(endMonth);

  if (sY > eY || (sY === eY && sM > eM)) {
    [sY, eY] = [eY, sY];
    [sM, eM] = [eM, sM];
  }

  const months = [];
  const monthNames = { '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April', '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus', '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember' };

  let current = new Date(sY, sM - 1, 1);
  const end = new Date(eY, eM - 1, 1);

  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    months.push({
      key: `${y}-${m}`,
      year: String(y),
      month: m,
      label: `${monthNames[m]} ${y}`
    });
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

// -------------------------------------------------------------
// FINANCIAL RECAP BY CUSTOM RANGE (Across Years & Months)
// -------------------------------------------------------------
function getFinancialRecapByRange(startPeriod, endPeriod) {
  if (startPeriod > endPeriod) {
    const tmp = startPeriod;
    startPeriod = endPeriod;
    endPeriod = tmp;
  }

  const allKasPemuda = db.getKasPemuda('semua');
  const allKasDusun = db.getKasDusun('semua');
  const allPengambilan = db.getPengambilanList().filter(p => p.status === 'POSTED');
  const allTrx = db.getAllTransaksi();
  const wargaList = db.getWarga().filter(w => w.status === 'Aktif');

  const inRange = (dStr) => {
    if (!dStr) return false;
    const pKey = dStr.slice(0, 7);
    return pKey >= startPeriod && pKey <= endPeriod;
  };

  const pList = allKasPemuda.filter(k => inRange(k.tanggal));
  const dList = allKasDusun.filter(k => inRange(k.tanggal));
  const sList = allPengambilan.filter(p => inRange(p.tanggal));
  const tList = allTrx.filter(t => inRange(t.tanggal));

  const masukPemuda = pList.filter(k => k.jenis === 'masuk').reduce((a, b) => a + (parseFloat(b.nominal) || 0), 0);
  const keluarPemuda = pList.filter(k => k.jenis === 'keluar').reduce((a, b) => a + (parseFloat(b.nominal) || 0), 0);
  const sisaPemuda = masukPemuda - keluarPemuda;

  const masukDusun = dList.filter(k => k.jenis === 'masuk').reduce((a, b) => a + (parseFloat(b.nominal) || 0), 0);
  const keluarDusun = dList.filter(k => k.jenis === 'keluar').reduce((a, b) => a + (parseFloat(b.nominal) || 0), 0);
  const sisaDusun = masukDusun - keluarDusun;

  let masukTabungan = 0;
  let keluarTabungan = 0;
  tList.forEach(t => {
    if (t.status === 'Sudah Setor' && t.tabungan) masukTabungan += parseFloat(t.tabungan);
    if (t.jenis === 'penarikan_tabungan') keluarTabungan += parseFloat(t.nominal || 0);
  });
  const sisaTabungan = Math.max(0, masukTabungan - keluarTabungan);

  let totalJimpitan = 0;
  sList.forEach(p => {
    totalJimpitan += (parseFloat(p.total_jimpitan) || 0);
  });

  const totalMasukAll = masukPemuda + masukDusun + masukTabungan;
  const totalKeluarAll = keluarPemuda + keluarDusun + keluarTabungan;
  const totalSisaDanaAll = sisaPemuda + sisaDusun + sisaTabungan;

  return {
    startPeriod,
    endPeriod,
    masukPemuda, keluarPemuda, sisaPemuda,
    masukDusun, keluarDusun, sisaDusun,
    masukTabungan, keluarTabungan, sisaTabungan,
    totalJimpitan,
    totalMasukAll, totalKeluarAll, totalSisaDanaAll,
    wargaCount: wargaList.length,
    pList, dList, sList, tList
  };
}

// -------------------------------------------------------------
// FINANCIAL RECAP CALCULATION HELPER (Single Period)
// -------------------------------------------------------------
function getFinancialRecapData(pbkId, filterYear = null, filterMonth = null) {
  const kasPemuda = db.getKasPemuda(pbkId);
  const kasDusun = db.getKasDusun(pbkId);
  const wargaList = db.getWarga().filter(w => w.status === 'Aktif');
  const allPengambilan = db.getPengambilanList().filter(p => p.pembukuan_id === pbkId && p.status === 'POSTED');
  const allTrx = db.getAllTransaksi().filter(t => t.pembukuan_id === pbkId);

  let pList = kasPemuda;
  let dList = kasDusun;
  let sList = allPengambilan;
  let tList = allTrx;

  if (filterYear) {
    pList = pList.filter(k => k.tanggal.startsWith(String(filterYear)));
    dList = dList.filter(k => k.tanggal.startsWith(String(filterYear)));
    sList = sList.filter(p => p.tanggal.startsWith(String(filterYear)));
    tList = tList.filter(t => t.tanggal.startsWith(String(filterYear)));
  }

  if (filterMonth) {
    const pKey = `${filterYear}-${filterMonth}`;
    pList = pList.filter(k => k.tanggal.startsWith(pKey));
    dList = dList.filter(k => k.tanggal.startsWith(pKey));
    sList = sList.filter(p => p.tanggal.startsWith(pKey));
    tList = tList.filter(t => t.tanggal.startsWith(pKey));
  }

  const masukPemuda = pList.filter(k => k.jenis === 'masuk').reduce((a, b) => a + (parseFloat(b.nominal) || 0), 0);
  const keluarPemuda = pList.filter(k => k.jenis === 'keluar').reduce((a, b) => a + (parseFloat(b.nominal) || 0), 0);
  const sisaPemuda = masukPemuda - keluarPemuda;

  const masukDusun = dList.filter(k => k.jenis === 'masuk').reduce((a, b) => a + (parseFloat(b.nominal) || 0), 0);
  const keluarDusun = dList.filter(k => k.jenis === 'keluar').reduce((a, b) => a + (parseFloat(b.nominal) || 0), 0);
  const sisaDusun = masukDusun - keluarDusun;

  let masukTabungan = 0;
  let keluarTabungan = 0;
  tList.forEach(t => {
    if (t.status === 'Sudah Setor' && t.tabungan) masukTabungan += parseFloat(t.tabungan);
    if (t.jenis === 'penarikan_tabungan') keluarTabungan += parseFloat(t.nominal || 0);
  });
  const sisaTabungan = Math.max(0, masukTabungan - keluarTabungan);

  const totalMasukAll = masukPemuda + masukDusun + masukTabungan;
  const totalKeluarAll = keluarPemuda + keluarDusun + keluarTabungan;
  const totalSisaDanaAll = sisaPemuda + sisaDusun + sisaTabungan;

  return {
    masukPemuda, keluarPemuda, sisaPemuda,
    masukDusun, keluarDusun, sisaDusun,
    masukTabungan, keluarTabungan, sisaTabungan,
    totalMasukAll, totalKeluarAll, totalSisaDanaAll,
    wargaCount: wargaList.length
  };
}

function renderRecapBalanceCardHtml(recap, titleLabel) {
  return `
    <div style="background: var(--bg-card); border: 2px solid var(--primary-600); border-radius: var(--radius-lg); padding: 1.25rem; margin-top: 1.5rem; box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.875rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h4 style="font-size: 1.125rem; font-weight: 800; color: var(--primary-900); margin: 0;">
            💰 REKAPITULASI DANA KAS PEMUDA, KAS DUSUN & TABUNGAN (${titleLabel})
          </h4>
          <p style="font-size: 0.8125rem; color: var(--text-secondary); margin: 2px 0 0 0;">
            Posisi total penerimaan, rincian pengeluaran per kas, dan sisa dana bersih yang tersimpan
          </p>
        </div>
        <span class="badge badge-success">✓ Dana Terverifikasi</span>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Sumber Pos Dana / Kas</th>
              <th style="text-align: right;">Total Pemasukan (Rp)</th>
              <th style="text-align: right;">Total Pengeluaran (Rp)</th>
              <th style="text-align: right;">Sisa Dana / Saldo (Rp)</th>
              <th style="text-align: center;">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>⚡ Kas Pemuda</strong> (50% Jimpitan & Kegiatan)</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700; color: #059669;">+ Rp ${recap.masukPemuda.toLocaleString('id-ID')}</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700; color: #dc2626;">- Rp ${recap.keluarPemuda.toLocaleString('id-ID')}</td>
              <td style="text-align: right; font-family: monospace; font-weight: 800; font-size: 1rem; color: var(--primary-700);">Rp ${recap.sisaPemuda.toLocaleString('id-ID')}</td>
              <td style="text-align: center;"><span class="badge badge-success">Kas Aktif</span></td>
            </tr>
            <tr>
              <td><strong>🏘️ Kas Dusun</strong> (50% Jimpitan & Pembangunan/Sosial)</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700; color: #059669;">+ Rp ${recap.masukDusun.toLocaleString('id-ID')}</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700; color: #dc2626;">- Rp ${recap.keluarDusun.toLocaleString('id-ID')}</td>
              <td style="text-align: right; font-family: monospace; font-weight: 800; font-size: 1rem; color: #2563eb;">Rp ${recap.sisaDusun.toLocaleString('id-ID')}</td>
              <td style="text-align: center;"><span class="badge badge-info">Kas Aktif</span></td>
            </tr>
            <tr>
              <td><strong>💳 Tabungan Warga</strong> (${recap.wargaCount} KK Terdaftar)</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700; color: #059669;">+ Rp ${recap.masukTabungan.toLocaleString('id-ID')}</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700; color: #dc2626;">- Rp ${recap.keluarTabungan.toLocaleString('id-ID')}</td>
              <td style="text-align: right; font-family: monospace; font-weight: 800; font-size: 1rem; color: var(--accent-purple);">Rp ${recap.sisaTabungan.toLocaleString('id-ID')}</td>
              <td style="text-align: center;"><span class="badge badge-purple">Hak Milik Warga</span></td>
            </tr>
            <tr style="background: var(--bg-card-subtle); font-weight: 800; font-size: 1.05rem;">
              <td>TOTAL SISA SALDO / DANA KESELURUHAN SISTEM:</td>
              <td style="text-align: right; font-family: monospace; color: #059669;">+ Rp ${recap.totalMasukAll.toLocaleString('id-ID')}</td>
              <td style="text-align: right; font-family: monospace; color: #dc2626;">- Rp ${recap.totalKeluarAll.toLocaleString('id-ID')}</td>
              <td style="text-align: right; font-family: monospace; color: var(--primary-900); font-size: 1.15rem;">Rp ${recap.totalSisaDanaAll.toLocaleString('id-ID')}</td>
              <td style="text-align: center;"><span class="badge badge-success">Dana Aman</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export const laporanModule = {
  changeJenis(val) {
    filterJenis = val;
    app.renderCurrentView();
  },

  changeBulan(val) {
    filterBulan = val;
    app.renderCurrentView();
  },

  changeTahun(val) {
    filterTahun = val;
    app.renderCurrentView();
  },

  changeRangeStartMonth(val) {
    rangeStartMonth = val;
    app.renderCurrentView();
  },

  changeRangeStartYear(val) {
    rangeStartYear = val;
    app.renderCurrentView();
  },

  changeRangeEndMonth(val) {
    rangeEndMonth = val;
    app.renderCurrentView();
  },

  changeRangeEndYear(val) {
    rangeEndYear = val;
    app.renderCurrentView();
  },

  toggleDateSort() {
    sortOrderDate = sortOrderDate === 'DESC' ? 'ASC' : 'DESC';
    app.renderCurrentView();
  },

  generateReportHtml(pbk) {
    const allPengambilan = db.getPengambilanList();
    const allTrx = db.getAllTransaksi();
    const kasPemuda = db.getKasPemuda('semua');
    const kasDusun = db.getKasDusun('semua');
    const wargaList = db.getWarga().filter(w => w.status === 'Aktif');

    if (filterJenis === 'bulanan') {
      const monthNames = { '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April', '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus', '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember' };
      const periodKey = `${filterTahun}-${filterBulan}`;
      
      let filteredPengambilan = allPengambilan.filter(p => p.tanggal.startsWith(periodKey));
      filteredPengambilan.sort((a, b) => {
        return sortOrderDate === 'ASC' 
          ? new Date(a.tanggal) - new Date(b.tanggal) 
          : new Date(b.tanggal) - new Date(a.tanggal);
      });

      let totalJimp = 0;
      let totalTab = 0;
      filteredPengambilan.forEach(p => {
        totalJimp += (p.total_jimpitan || 0);
        totalTab += (p.total_tabungan || 0);
      });

      const pengeluaranPemuda = kasPemuda.filter(k => k.jenis === 'keluar' && k.tanggal.startsWith(periodKey)).reduce((a, b) => a + (b.nominal || 0), 0);
      const pengeluaranDusun = kasDusun.filter(k => k.jenis === 'keluar' && k.tanggal.startsWith(periodKey)).reduce((a, b) => a + (b.nominal || 0), 0);

      const recap = getFinancialRecapData(pbk.id, filterTahun, filterBulan);

      return `
        <div>
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
              <h3 style="font-size: 1.25rem; font-weight: 800; text-transform: uppercase;">
                LAPORAN KEUANGAN BULAN ${monthNames[filterBulan].toUpperCase()} ${filterTahun}
              </h3>
              <p style="font-size: 0.875rem; color: var(--text-secondary);">Dusun Kiyudan, Desa Majaksingi, Borobudur</p>
            </div>

            <div class="stats-grid" style="margin-bottom: 1.5rem;">
              <div class="stat-card">
                <div class="stat-content">
                  <h3>Total Jimpitan Masuk</h3>
                  <div class="stat-value" style="color: var(--primary-700);">Rp ${totalJimp.toLocaleString('id-ID')}</div>
                  <div class="stat-meta">50% Pemuda: Rp ${(totalJimp*0.5).toLocaleString('id-ID')} | 50% Dusun: Rp ${(totalJimp*0.5).toLocaleString('id-ID')}</div>
                </div>
              </div>

              <div class="stat-card purple">
                <div class="stat-content">
                  <h3>Total Tabungan Masuk</h3>
                  <div class="stat-value">Rp ${totalTab.toLocaleString('id-ID')}</div>
                  <div class="stat-meta">Saldo tabungan warga bulan ini</div>
                </div>
              </div>

              <div class="stat-card gold">
                <div class="stat-content">
                  <h3>Pengeluaran Pemuda</h3>
                  <div class="stat-value" style="color: #dc2626;">Rp ${pengeluaranPemuda.toLocaleString('id-ID')}</div>
                  <div class="stat-meta">Kegiatan & operasional</div>
                </div>
              </div>

              <div class="stat-card blue">
                <div class="stat-content">
                  <h3>Pengeluaran Dusun</h3>
                  <div class="stat-value" style="color: #dc2626;">Rp ${pengeluaranDusun.toLocaleString('id-ID')}</div>
                  <div class="stat-meta">Pembangunan & sosial</div>
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h4 style="font-size: 1rem; font-weight: 700; margin: 0;">Rincian Pengambilan Mingguan Bulan Ini:</h4>
              <small style="color: var(--text-muted);">Urutan: ${sortOrderDate === 'DESC' ? 'Terbaru' : 'Terlama'}</small>
            </div>
            <div class="table-responsive" style="margin-bottom: 1.5rem;">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th style="cursor: pointer;" onclick="laporanModule.toggleDateSort()" title="Klik untuk mengurutkan tanggal">
                      Tanggal ${sortOrderDate === 'DESC' ? '⬇️' : '⬆️'}
                    </th>
                    <th>Kelompok</th>
                    <th>Status</th>
                    <th style="text-align: right;">Total Jimpitan</th>
                    <th style="text-align: right;">Total Tabungan</th>
                    <th style="text-align: right;">Total Setor</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredPengambilan.length === 0 ? `
                    <tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">Tidak ada jadwal pengambilan pada bulan ini.</td></tr>
                  ` : filteredPengambilan.map(p => `
                    <tr>
                      <td><strong>${p.tanggal}</strong> (${p.hari})</td>
                      <td>${p.kelompok_nama}</td>
                      <td><span class="badge ${p.status === 'POSTED' ? 'badge-success' : 'badge-warning'}">${p.status}</span></td>
                      <td style="text-align: right; font-family: monospace; font-weight: 600;">Rp ${(p.total_jimpitan || 0).toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; font-weight: 600; color: var(--primary-700);">Rp ${(p.total_tabungan || 0).toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; font-weight: 800;">Rp ${(p.total_sistem || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- RECAP BALANCE CARD BULANAN -->
            ${renderRecapBalanceCardHtml(recap, `Bulan ${monthNames[filterBulan]} ${filterTahun}`)}
          </div>
        </div>
      `;
    }

    if (filterJenis === 'tahunan') {
      const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

      let grandJimpitan = 0;
      let grandTabungan = 0;
      let grandPengeluaranPemuda = 0;
      let grandPengeluaranDusun = 0;

      const monthlyRows = months.map((m, idx) => {
        const pKey = `${filterTahun}-${m}`;
        const pList = allPengambilan.filter(p => p.tanggal.startsWith(pKey));
        let jimp = 0;
        let tab = 0;
        pList.forEach(p => {
          jimp += (p.total_jimpitan || 0);
          tab += (p.total_tabungan || 0);
        });
        const pengPem = kasPemuda.filter(k => k.jenis === 'keluar' && k.tanggal.startsWith(pKey)).reduce((a, b) => a + (b.nominal || 0), 0);
        const pengDus = kasDusun.filter(k => k.jenis === 'keluar' && k.tanggal.startsWith(pKey)).reduce((a, b) => a + (b.nominal || 0), 0);

        grandJimpitan += jimp;
        grandTabungan += tab;
        grandPengeluaranPemuda += pengPem;
        grandPengeluaranDusun += pengDus;

        return {
          bulan: monthNames[idx],
          jimpitan: jimp,
          tabungan: tab,
          pengeluaranPemuda: pengPem,
          pengeluaranDusun: pengDus
        };
      });

      const recap = getFinancialRecapData(pbk.id, filterTahun);

      return `
        <div>
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
              <h3 style="font-size: 1.25rem; font-weight: 800; text-transform: uppercase;">
                LAPORAN KEUANGAN TAHUNAN ${filterTahun}
              </h3>
              <p style="font-size: 0.875rem; color: var(--text-secondary);">Akumulasi 12 Bulan Pembukuan Dusun Kiyudan</p>
            </div>

            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Bulan</th>
                    <th style="text-align: right;">Total Jimpitan</th>
                    <th style="text-align: right;">Kas Pemuda (50%)</th>
                    <th style="text-align: right;">Kas Dusun (50%)</th>
                    <th style="text-align: right;">Tabungan</th>
                    <th style="text-align: right;">Pengeluaran Pemuda</th>
                    <th style="text-align: right;">Pengeluaran Dusun</th>
                  </tr>
                </thead>
                <tbody>
                  ${monthlyRows.map(row => `
                    <tr>
                      <td><strong>${row.bulan}</strong></td>
                      <td style="text-align: right; font-family: monospace; font-weight: 600;">Rp ${row.jimpitan.toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace;">Rp ${(row.jimpitan * 0.5).toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace;">Rp ${(row.jimpitan * 0.5).toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; color: var(--primary-700); font-weight: 600;">Rp ${row.tabungan.toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; color: #dc2626;">Rp ${row.pengeluaranPemuda.toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; color: #dc2626;">Rp ${row.pengeluaranDusun.toLocaleString('id-ID')}</td>
                    </tr>
                  `).join('')}
                  <tr style="background: var(--bg-card-subtle); font-weight: 800; font-size: 1rem;">
                    <td>TOTAL KESELURUHAN ${filterTahun}</td>
                    <td style="text-align: right; font-family: monospace; color: var(--primary-700);">Rp ${grandJimpitan.toLocaleString('id-ID')}</td>
                    <td style="text-align: right; font-family: monospace;">Rp ${(grandJimpitan * 0.5).toLocaleString('id-ID')}</td>
                    <td style="text-align: right; font-family: monospace;">Rp ${(grandJimpitan * 0.5).toLocaleString('id-ID')}</td>
                    <td style="text-align: right; font-family: monospace; color: var(--accent-purple);">Rp ${grandTabungan.toLocaleString('id-ID')}</td>
                    <td style="text-align: right; font-family: monospace; color: #dc2626;">Rp ${grandPengeluaranPemuda.toLocaleString('id-ID')}</td>
                    <td style="text-align: right; font-family: monospace; color: #dc2626;">Rp ${grandPengeluaranDusun.toLocaleString('id-ID')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- RECAP BALANCE CARD TAHUNAN -->
            ${renderRecapBalanceCardHtml(recap, `Akumulasi 12 Bulan Tahun ${filterTahun}`)}
          </div>
        </div>
      `;
    }

    if (filterJenis === 'rentang') {
      const monthList = getMonthsInRange(rangeStartYear, rangeStartMonth, rangeEndYear, rangeEndMonth);
      const sPeriod = `${rangeStartYear}-${rangeStartMonth}`;
      const ePeriod = `${rangeEndYear}-${rangeEndMonth}`;
      const rangeRecap = getFinancialRecapByRange(sPeriod, ePeriod);

      let grandJimpitan = 0;
      let grandTabungan = 0;
      let grandPengeluaranPemuda = 0;
      let grandPengeluaranDusun = 0;

      const monthlyRows = monthList.map(item => {
        const pList = allPengambilan.filter(p => p.tanggal.startsWith(item.key));
        let jimp = 0;
        let tab = 0;
        pList.forEach(p => {
          jimp += (p.total_jimpitan || 0);
          tab += (p.total_tabungan || 0);
        });
        const pengPem = kasPemuda.filter(k => k.jenis === 'keluar' && k.tanggal.startsWith(item.key)).reduce((a, b) => a + (b.nominal || 0), 0);
        const pengDus = kasDusun.filter(k => k.jenis === 'keluar' && k.tanggal.startsWith(item.key)).reduce((a, b) => a + (b.nominal || 0), 0);

        grandJimpitan += jimp;
        grandTabungan += tab;
        grandPengeluaranPemuda += pengPem;
        grandPengeluaranDusun += pengDus;

        return {
          label: item.label,
          jimpitan: jimp,
          tabungan: tab,
          pengeluaranPemuda: pengPem,
          pengeluaranDusun: pengDus
        };
      });

      return `
        <div>
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
              <h3 style="font-size: 1.25rem; font-weight: 800; text-transform: uppercase;">
                LAPORAN KEUANGAN RENTANG PERIODE KUSTOM
              </h3>
              <p style="font-size: 0.875rem; color: var(--text-secondary);">
                Periode: <strong>${monthList[0].label}</strong> s/d <strong>${monthList[monthList.length - 1].label}</strong> (${monthList.length} Bulan)
              </p>
            </div>

            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Bulan / Periode</th>
                    <th style="text-align: right;">Total Jimpitan</th>
                    <th style="text-align: right;">Kas Pemuda (50%)</th>
                    <th style="text-align: right;">Kas Dusun (50%)</th>
                    <th style="text-align: right;">Tabungan</th>
                    <th style="text-align: right;">Pengeluaran Pemuda</th>
                    <th style="text-align: right;">Pengeluaran Dusun</th>
                  </tr>
                </thead>
                <tbody>
                  ${monthlyRows.map(row => `
                    <tr>
                      <td><strong>${row.label}</strong></td>
                      <td style="text-align: right; font-family: monospace; font-weight: 600;">Rp ${row.jimpitan.toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace;">Rp ${(row.jimpitan * 0.5).toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace;">Rp ${(row.jimpitan * 0.5).toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; color: var(--primary-700); font-weight: 600;">Rp ${row.tabungan.toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; color: #dc2626;">Rp ${row.pengeluaranPemuda.toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; color: #dc2626;">Rp ${row.pengeluaranDusun.toLocaleString('id-ID')}</td>
                    </tr>
                  `).join('')}
                  <tr style="background: var(--bg-card-subtle); font-weight: 800; font-size: 1rem;">
                    <td>TOTAL KESELURUHAN RENTANG</td>
                    <td style="text-align: right; font-family: monospace; color: var(--primary-700);">Rp ${grandJimpitan.toLocaleString('id-ID')}</td>
                    <td style="text-align: right; font-family: monospace;">Rp ${(grandJimpitan * 0.5).toLocaleString('id-ID')}</td>
                    <td style="text-align: right; font-family: monospace;">Rp ${(grandJimpitan * 0.5).toLocaleString('id-ID')}</td>
                    <td style="text-align: right; font-family: monospace; color: var(--accent-purple);">Rp ${grandTabungan.toLocaleString('id-ID')}</td>
                    <td style="text-align: right; font-family: monospace; color: #dc2626;">Rp ${grandPengeluaranPemuda.toLocaleString('id-ID')}</td>
                    <td style="text-align: right; font-family: monospace; color: #dc2626;">Rp ${grandPengeluaranDusun.toLocaleString('id-ID')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- RECAP BALANCE CARD RENTANG -->
            ${renderRecapBalanceCardHtml(rangeRecap, `Rentang ${monthList[0].label} s/d ${monthList[monthList.length - 1].label}`)}
          </div>
        </div>
      `;
    }

    if (filterJenis === 'warga') {
      const recap = getFinancialRecapData(pbk.id, filterTahun);

      return `
        <div>
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
              <h3 style="font-size: 1.25rem; font-weight: 800; text-transform: uppercase;">
                REKAPITULASI TABUNGAN 40 KK WARGA — TAHUN ${filterTahun}
              </h3>
              <p style="font-size: 0.875rem; color: var(--text-secondary);">Daftar Seluruh Warga Aktif Dusun Kiyudan</p>
            </div>

            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Kode</th>
                    <th>Nama Warga</th>
                    <th>Status</th>
                    <th style="text-align: center;">Frekuensi Setor</th>
                    <th style="text-align: right;">Saldo Tabungan</th>
                  </tr>
                </thead>
                <tbody>
                  ${wargaList.map((w, idx) => {
                    const saldo = db.getSaldoTabunganWarga(w.id, pbk.id);
                    const countSetor = allTrx.filter(t => t.warga_id === w.id && t.status === 'Sudah Setor').length;
                    return `
                      <tr>
                        <td>${idx + 1}</td>
                        <td><span class="badge badge-neutral" style="font-family: monospace;">${w.kode_warga}</span></td>
                        <td><strong>${w.nama}</strong></td>
                        <td><span class="badge badge-success">${w.status}</span></td>
                        <td style="text-align: center;"><span class="badge badge-info">${countSetor}x Setor</span></td>
                        <td style="text-align: right; font-family: monospace; font-weight: 800; font-size: 1rem; color: var(--primary-700);">
                          Rp ${saldo.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                  <tr style="background: var(--bg-card-subtle); font-weight: 800; font-size: 1rem;">
                    <td colspan="5" style="text-align: right;">TOTAL SALDO TABUNGAN WARGA:</td>
                    <td style="text-align: right; font-family: monospace; color: var(--primary-700);">
                      Rp ${db.getTotalSeluruhTabungan(pbk.id).toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- RECAP BALANCE CARD -->
            ${renderRecapBalanceCardHtml(recap, `Posisi Kas & Tabungan 40 KK`)}
          </div>
        </div>
      `;
    }
  },

  // -------------------------------------------------------------
  // PREPARE PRINT & DOWNLOAD PDF TEMPLATE
  // -------------------------------------------------------------
  preparePrintHTML() {
    const pbk = db.getActivePembukuan();
    const wargaList = db.getWarga().filter(w => w.status === 'Aktif');
    const allPengambilan = db.getPengambilanList();
    const allTrx = db.getAllTransaksi();
    const kasPemuda = db.getKasPemuda('semua');
    const kasDusun = db.getKasDusun('semua');

    const printContainer = document.getElementById('print-container');
    if (!printContainer) return { filename: 'Laporan.pdf' };

    let reportTitle = '';
    let reportSubtitle = '';
    let reportTableHtml = '';
    let filename = '';

    let recap;
    if (filterJenis === 'rentang') {
      const sPeriod = `${rangeStartYear}-${rangeStartMonth}`;
      const ePeriod = `${rangeEndYear}-${rangeEndMonth}`;
      recap = getFinancialRecapByRange(sPeriod, ePeriod);
    } else if (filterJenis === 'bulanan') {
      recap = getFinancialRecapData(pbk.id, filterTahun, filterBulan);
    } else {
      recap = getFinancialRecapData(pbk.id, filterTahun);
    }

    const recapTableHtml = `
      <div class="print-section-title" style="margin-top: 1.25rem;">REKAPITULASI DANA: PEMASUKAN, PENGELUARAN & SISA SALDO KAS</div>
      <table class="print-table">
        <thead>
          <tr>
            <th>Sumber Pos Dana / Kas</th>
            <th class="text-right" style="width: 130px;">Pemasukan (Rp)</th>
            <th class="text-right" style="width: 130px;">Pengeluaran (Rp)</th>
            <th class="text-right" style="width: 140px;">Sisa Saldo Bersih (Rp)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. Kas Pemuda</strong> (50% Jimpitan & Kegiatan Pemuda)</td>
            <td class="text-right">Rp ${recap.masukPemuda.toLocaleString('id-ID')}</td>
            <td class="text-right">Rp ${recap.keluarPemuda.toLocaleString('id-ID')}</td>
            <td class="text-right"><strong>Rp ${recap.sisaPemuda.toLocaleString('id-ID')}</strong></td>
          </tr>
          <tr>
            <td><strong>2. Kas Dusun</strong> (50% Jimpitan & Sosial Pembangunan)</td>
            <td class="text-right">Rp ${recap.masukDusun.toLocaleString('id-ID')}</td>
            <td class="text-right">Rp ${recap.keluarDusun.toLocaleString('id-ID')}</td>
            <td class="text-right"><strong>Rp ${recap.sisaDusun.toLocaleString('id-ID')}</strong></td>
          </tr>
          <tr>
            <td><strong>3. Tabungan Warga</strong> (Akumulasi ${wargaList.length} KK Terdaftar)</td>
            <td class="text-right">Rp ${recap.masukTabungan.toLocaleString('id-ID')}</td>
            <td class="text-right">Rp ${recap.keluarTabungan.toLocaleString('id-ID')}</td>
            <td class="text-right"><strong>Rp ${recap.sisaTabungan.toLocaleString('id-ID')}</strong></td>
          </tr>
          <tr class="total-row">
            <td>TOTAL SISA SALDO / DANA KESELURUHAN SISTEM:</td>
            <td class="text-right">Rp ${recap.totalMasukAll.toLocaleString('id-ID')}</td>
            <td class="text-right">Rp ${recap.totalKeluarAll.toLocaleString('id-ID')}</td>
            <td class="text-right"><strong>Rp ${recap.totalSisaDanaAll.toLocaleString('id-ID')}</strong></td>
          </tr>
        </tbody>
      </table>
    `;

    if (filterJenis === 'rentang') {
      const monthList = getMonthsInRange(rangeStartYear, rangeStartMonth, rangeEndYear, rangeEndMonth);
      reportTitle = 'LAPORAN KEUANGAN REKAPITULASI RENTANG PERIODE KUSTOM';
      reportSubtitle = `Periode: ${monthList[0].label} s/d ${monthList[monthList.length - 1].label} (${monthList.length} Bulan) • Dusun Kiyudan`;
      filename = `Laporan_Keuangan_Rentang_${rangeStartYear}-${rangeStartMonth}_sd_${rangeEndYear}-${rangeEndMonth}.pdf`;

      let grandJimpitan = 0;
      let grandTabungan = 0;
      let grandPengeluaranPemuda = 0;
      let grandPengeluaranDusun = 0;

      const monthlyRows = monthList.map(item => {
        const pList = allPengambilan.filter(p => p.tanggal.startsWith(item.key));
        let jimp = 0;
        let tab = 0;
        pList.forEach(p => {
          jimp += (p.total_jimpitan || 0);
          tab += (p.total_tabungan || 0);
        });
        const pengPem = kasPemuda.filter(k => k.jenis === 'keluar' && k.tanggal.startsWith(item.key)).reduce((a, b) => a + (b.nominal || 0), 0);
        const pengDus = kasDusun.filter(k => k.jenis === 'keluar' && k.tanggal.startsWith(item.key)).reduce((a, b) => a + (b.nominal || 0), 0);

        grandJimpitan += jimp;
        grandTabungan += tab;
        grandPengeluaranPemuda += pengPem;
        grandPengeluaranDusun += pengDus;

        return {
          label: item.label,
          jimpitan: jimp,
          tabungan: tab,
          pengeluaranPemuda: pengPem,
          pengeluaranDusun: pengDus
        };
      });

      reportTableHtml = `
        <table class="print-meta-table">
          <tr>
            <td style="width: 25%;"><strong>Rentang Periode</strong></td>
            <td style="width: 25%;">: ${monthList[0].label} – ${monthList[monthList.length - 1].label}</td>
            <td style="width: 25%;"><strong>Total KK Terdaftar</strong></td>
            <td style="width: 25%;">: ${wargaList.length} KK Warga</td>
          </tr>
          <tr>
            <td><strong>Total Jimpitan Rentang</strong></td>
            <td>: Rp ${grandJimpitan.toLocaleString('id-ID')}</td>
            <td><strong>Total Tabungan Rentang</strong></td>
            <td>: Rp ${grandTabungan.toLocaleString('id-ID')}</td>
          </tr>
          <tr>
            <td><strong>Pengeluaran Pemuda</strong></td>
            <td>: Rp ${grandPengeluaranPemuda.toLocaleString('id-ID')}</td>
            <td><strong>Pengeluaran Dusun</strong></td>
            <td>: Rp ${grandPengeluaranDusun.toLocaleString('id-ID')}</td>
          </tr>
        </table>

        <div class="print-section-title">Rekapitulasi ${monthList.length} Bulan Penerimaan & Pengeluaran:</div>
        <table class="print-table">
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th>Bulan / Periode</th>
              <th class="text-right">Total Jimpitan</th>
              <th class="text-right">Kas Pemuda (50%)</th>
              <th class="text-right">Kas Dusun (50%)</th>
              <th class="text-right">Tabungan Warga</th>
              <th class="text-right">Pengeluaran Pemuda</th>
              <th class="text-right">Pengeluaran Dusun</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyRows.map((row, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td><strong>${row.label}</strong></td>
                <td class="text-right">Rp ${row.jimpitan.toLocaleString('id-ID')}</td>
                <td class="text-right">Rp ${(row.jimpitan * 0.5).toLocaleString('id-ID')}</td>
                <td class="text-right">Rp ${(row.jimpitan * 0.5).toLocaleString('id-ID')}</td>
                <td class="text-right">Rp ${row.tabungan.toLocaleString('id-ID')}</td>
                <td class="text-right">Rp ${row.pengeluaranPemuda.toLocaleString('id-ID')}</td>
                <td class="text-right">Rp ${row.pengeluaranDusun.toLocaleString('id-ID')}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2" class="text-right">TOTAL KESELURUHAN RENTANG:</td>
              <td class="text-right">Rp ${grandJimpitan.toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${(grandJimpitan * 0.5).toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${(grandJimpitan * 0.5).toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${grandTabungan.toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${grandPengeluaranPemuda.toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${grandPengeluaranDusun.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        ${recapTableHtml}
      `;
    } else if (filterJenis === 'bulanan') {
      const monthNames = { '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April', '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus', '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember' };
      const periodKey = `${filterTahun}-${filterBulan}`;
      reportTitle = `LAPORAN KEUANGAN BULAN ${monthNames[filterBulan].toUpperCase()} ${filterTahun}`;
      reportSubtitle = `Dusun Kiyudan, Desa Majaksingi — Basis Transparansi ${wargaList.length} KK`;
      filename = `Laporan_Keuangan_Bulanan_Kiyudan_${filterBulan}_${filterTahun}.pdf`;

      const filteredPengambilan = allPengambilan.filter(p => p.tanggal.startsWith(periodKey));
      let totalJimp = 0;
      let totalTab = 0;
      filteredPengambilan.forEach(p => {
        totalJimp += (p.total_jimpitan || 0);
        totalTab += (p.total_tabungan || 0);
      });

      const pengeluaranPemuda = kasPemuda.filter(k => k.jenis === 'keluar' && k.tanggal.startsWith(periodKey));
      const totalPengPemuda = pengeluaranPemuda.reduce((a, b) => a + (b.nominal || 0), 0);

      const pengeluaranDusun = kasDusun.filter(k => k.jenis === 'keluar' && k.tanggal.startsWith(periodKey));
      const totalPengDusun = pengeluaranDusun.reduce((a, b) => a + (b.nominal || 0), 0);

      reportTableHtml = `
        <table class="print-meta-table">
          <tr>
            <td style="width: 25%;"><strong>Bulan / Tahun</strong></td>
            <td style="width: 25%;">: ${monthNames[filterBulan]} ${filterTahun}</td>
            <td style="width: 25%;"><strong>Total KK Terdaftar</strong></td>
            <td style="width: 25%;">: ${wargaList.length} KK Warga</td>
          </tr>
          <tr>
            <td><strong>Total Jimpitan Masuk</strong></td>
            <td>: Rp ${totalJimp.toLocaleString('id-ID')}</td>
            <td><strong>Total Tabungan Masuk</strong></td>
            <td>: Rp ${totalTab.toLocaleString('id-ID')}</td>
          </tr>
          <tr>
            <td><strong>Total Pengeluaran Pemuda</strong></td>
            <td>: Rp ${totalPengPemuda.toLocaleString('id-ID')}</td>
            <td><strong>Total Pengeluaran Dusun</strong></td>
            <td>: Rp ${totalPengDusun.toLocaleString('id-ID')}</td>
          </tr>
        </table>

        <div class="print-section-title">1. Tabel Penerimaan Jimpitan Mingguan</div>
        <table class="print-table">
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th style="width: 90px;">Tanggal</th>
              <th>Kelompok</th>
              <th style="width: 80px;">Partisipasi</th>
              <th class="text-right">Jimpitan (Rp)</th>
              <th class="text-right">Kas Pemuda (50%)</th>
              <th class="text-right">Kas Dusun (50%)</th>
              <th class="text-right">Tabungan (Rp)</th>
              <th class="text-right">Total Setor (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${filteredPengambilan.length === 0 ? `
              <tr><td colspan="9" class="text-center" style="padding: 10px;">Tidak ada sesi pengambilan pada bulan ini.</td></tr>
            ` : filteredPengambilan.map((p, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td class="text-center">${p.tanggal}</td>
                <td>${p.kelompok_nama}</td>
                <td class="text-center">${p.warga_dicatat_count || 40}/${p.total_warga_count || 40} KK</td>
                <td class="text-right">${(p.total_jimpitan || 0).toLocaleString('id-ID')}</td>
                <td class="text-right">${((p.total_jimpitan || 0) * 0.5).toLocaleString('id-ID')}</td>
                <td class="text-right">${((p.total_jimpitan || 0) * 0.5).toLocaleString('id-ID')}</td>
                <td class="text-right">${(p.total_tabungan || 0).toLocaleString('id-ID')}</td>
                <td class="text-right"><strong>${(p.total_sistem || 0).toLocaleString('id-ID')}</strong></td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4" class="text-right">TOTAL BULAN INI:</td>
              <td class="text-right">Rp ${totalJimp.toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${(totalJimp * 0.5).toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${(totalJimp * 0.5).toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${totalTab.toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${(totalJimp + totalTab).toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        <div class="print-section-title" style="margin-top: 1rem;">2. Tabel Pengeluaran Kas</div>
        <table class="print-table">
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th style="width: 90px;">Tanggal</th>
              <th style="width: 100px;">Sumber Kas</th>
              <th style="width: 130px;">Kategori</th>
              <th>Uraian Pengeluaran</th>
              <th style="width: 110px;">Penanggung Jawab</th>
              <th class="text-right" style="width: 110px;">Nominal (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${[...pengeluaranPemuda.map(k => ({...k, sumberKas: 'Kas Pemuda'})), ...pengeluaranDusun.map(k => ({...k, sumberKas: 'Kas Dusun'}))].length === 0 ? `
              <tr><td colspan="7" class="text-center" style="padding: 10px;">Tidak ada pengeluaran pada bulan ini.</td></tr>
            ` : [...pengeluaranPemuda.map(k => ({...k, sumberKas: 'Kas Pemuda'})), ...pengeluaranDusun.map(k => ({...k, sumberKas: 'Kas Dusun'}))].map((k, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td class="text-center">${k.tanggal}</td>
                <td class="text-center">${k.sumberKas}</td>
                <td>${k.kategori}</td>
                <td>${k.keterangan}</td>
                <td>${k.petugas || '-'}</td>
                <td class="text-right">Rp ${Number(k.nominal).toLocaleString('id-ID')}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="6" class="text-right">TOTAL PENGELUARAN BULAN INI:</td>
              <td class="text-right">Rp ${(totalPengPemuda + totalPengDusun).toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        ${recapTableHtml}
      `;
    } else if (filterJenis === 'tahunan') {
      reportTitle = `LAPORAN KEUANGAN TAHUNAN — TAHUN ${filterTahun}`;
      reportSubtitle = `Akumulasi 12 Bulan Transparansi Jimpitan & Kas Dusun Kiyudan (${wargaList.length} KK)`;
      filename = `Laporan_Keuangan_Tahunan_Kiyudan_${filterTahun}.pdf`;

      const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

      let grandJimpitan = 0;
      let grandTabungan = 0;
      let grandPengeluaranPemuda = 0;
      let grandPengeluaranDusun = 0;

      const monthlyRows = months.map((m, idx) => {
        const pKey = `${filterTahun}-${m}`;
        const pList = allPengambilan.filter(p => p.tanggal.startsWith(pKey));
        let jimp = 0;
        let tab = 0;
        pList.forEach(p => {
          jimp += (p.total_jimpitan || 0);
          tab += (p.total_tabungan || 0);
        });
        const pengPem = kasPemuda.filter(k => k.jenis === 'keluar' && k.tanggal.startsWith(pKey)).reduce((a, b) => a + (b.nominal || 0), 0);
        const pengDus = kasDusun.filter(k => k.jenis === 'keluar' && k.tanggal.startsWith(pKey)).reduce((a, b) => a + (b.nominal || 0), 0);

        grandJimpitan += jimp;
        grandTabungan += tab;
        grandPengeluaranPemuda += pengPem;
        grandPengeluaranDusun += pengDus;

        return {
          bulan: monthNames[idx],
          jimpitan: jimp,
          tabungan: tab,
          pengeluaranPemuda: pengPem,
          pengeluaranDusun: pengDus
        };
      });

      reportTableHtml = `
        <table class="print-meta-table">
          <tr>
            <td style="width: 25%;"><strong>Tahun Pembukuan</strong></td>
            <td style="width: 25%;">: ${filterTahun}</td>
            <td style="width: 25%;"><strong>Total KK Terdaftar</strong></td>
            <td style="width: 25%;">: ${wargaList.length} KK Warga</td>
          </tr>
          <tr>
            <td><strong>Total Jimpitan 1 Tahun</strong></td>
            <td>: Rp ${grandJimpitan.toLocaleString('id-ID')}</td>
            <td><strong>Total Tabungan 1 Tahun</strong></td>
            <td>: Rp ${grandTabungan.toLocaleString('id-ID')}</td>
          </tr>
          <tr>
            <td><strong>Pengeluaran Pemuda 1 Thn</strong></td>
            <td>: Rp ${grandPengeluaranPemuda.toLocaleString('id-ID')}</td>
            <td><strong>Pengeluaran Dusun 1 Thn</strong></td>
            <td>: Rp ${grandPengeluaranDusun.toLocaleString('id-ID')}</td>
          </tr>
        </table>

        <div class="print-section-title">Rekapitulasi 12 Bulan Jimpitan & Pengeluaran:</div>
        <table class="print-table">
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th>Bulan</th>
              <th class="text-right">Total Jimpitan</th>
              <th class="text-right">Kas Pemuda (50%)</th>
              <th class="text-right">Kas Dusun (50%)</th>
              <th class="text-right">Tabungan Warga</th>
              <th class="text-right">Pengeluaran Pemuda</th>
              <th class="text-right">Pengeluaran Dusun</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyRows.map((row, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td><strong>${row.bulan}</strong></td>
                <td class="text-right">Rp ${row.jimpitan.toLocaleString('id-ID')}</td>
                <td class="text-right">Rp ${(row.jimpitan * 0.5).toLocaleString('id-ID')}</td>
                <td class="text-right">Rp ${(row.jimpitan * 0.5).toLocaleString('id-ID')}</td>
                <td class="text-right">Rp ${row.tabungan.toLocaleString('id-ID')}</td>
                <td class="text-right">Rp ${row.pengeluaranPemuda.toLocaleString('id-ID')}</td>
                <td class="text-right">Rp ${row.pengeluaranDusun.toLocaleString('id-ID')}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2" class="text-right">TOTAL KESELURUHAN ${filterTahun}:</td>
              <td class="text-right">Rp ${grandJimpitan.toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${(grandJimpitan * 0.5).toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${(grandJimpitan * 0.5).toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${grandTabungan.toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${grandPengeluaranPemuda.toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${grandPengeluaranDusun.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        ${recapTableHtml}
      `;
    } else if (filterJenis === 'warga') {
      reportTitle = `REKAPITULASI TABUNGAN SELURUH KK WARGA — TAHUN ${filterTahun}`;
      reportSubtitle = `Basis Data: ${wargaList.length} KK Terdaftar di Dusun Kiyudan`;
      filename = `Rekapitulasi_Tabungan_40KK_Kiyudan_${filterTahun}.pdf`;

      reportTableHtml = `
        <table class="print-meta-table">
          <tr>
            <td style="width: 25%;"><strong>Tahun Pembukuan</strong></td>
            <td style="width: 25%;">: ${filterTahun}</td>
            <td style="width: 25%;"><strong>Total KK Terdaftar</strong></td>
            <td style="width: 25%;">: ${wargaList.length} KK Warga</td>
          </tr>
          <tr>
            <td><strong>Total Saldo Tabungan</strong></td>
            <td>: Rp ${db.getTotalSeluruhTabungan(pbk.id).toLocaleString('id-ID')}</td>
            <td><strong>Status Data</strong></td>
            <td>: Resmi Pembukuan Dusun Kiyudan</td>
          </tr>
        </table>

        <table class="print-table">
          <thead>
            <tr>
              <th style="width: 35px;">No</th>
              <th style="width: 90px;">Kode Warga</th>
              <th>Nama Kepala Keluarga (KK)</th>
              <th style="width: 80px;">Status</th>
              <th style="width: 90px;">Frekuensi Setor</th>
              <th class="text-right" style="width: 140px;">Saldo Tabungan (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${wargaList.map((w, idx) => {
              const saldo = db.getSaldoTabunganWarga(w.id, pbk.id);
              const countSetor = allTrx.filter(t => t.warga_id === w.id && t.status === 'Sudah Setor').length;
              return `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td class="text-center"><strong>${w.kode_warga}</strong></td>
                  <td>${w.nama}</td>
                  <td class="text-center">${w.status}</td>
                  <td class="text-center">${countSetor}x Setor</td>
                  <td class="text-right"><strong>Rp ${saldo.toLocaleString('id-ID')}</strong></td>
                </tr>
              `;
            }).join('')}
            <tr class="total-row">
              <td colspan="5" class="text-right">TOTAL TABUNGAN SELURUH ${wargaList.length} KK:</td>
              <td class="text-right">Rp ${db.getTotalSeluruhTabungan(pbk.id).toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        ${recapTableHtml}
      `;
    }

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
        <h3>${reportTitle}</h3>
        <p>${reportSubtitle}</p>
      </div>

      ${reportTableHtml}

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

  printCurrentReport() {
    const { filename } = this.preparePrintHTML();
    document.title = filename.replace('.pdf', '');
    window.print();
  },

  downloadPDF() {
    const { filename } = this.preparePrintHTML();
    app.downloadPDFFromContainer(filename);
  }
};
