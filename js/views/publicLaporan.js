// View: Transparansi Laporan Keuangan Publik (Mingguan, Bulanan, Tahunan, Rentang Kustom & Rekap 40 KK)
import { db } from '../db.js';

let publicFilterTab = 'mingguan'; // 'mingguan' | 'bulanan' | 'tahunan' | 'rentang' | 'rekap_kk'
let selectedBulan = '08';
let selectedTahun = '2026';
let rangeStartMonth = '08';
let rangeStartYear = '2026';
let rangeEndMonth = '05';
let rangeEndYear = '2027';
let sortOrderDate = 'DESC'; // 'DESC' (Terbaru) | 'ASC' (Terlama)

export function renderPublicLaporan() {
  const pbk = db.getActivePembukuan();
  const wargaList = db.getWarga().filter(w => w.status === 'Aktif');
  
  let recap;
  if (publicFilterTab === 'rentang') {
    const sPeriod = `${rangeStartYear}-${rangeStartMonth}`;
    const ePeriod = `${rangeEndYear}-${rangeEndMonth}`;
    recap = getFinancialRecapByRange(sPeriod, ePeriod);
  } else if (publicFilterTab === 'bulanan') {
    recap = getFinancialRecapData(pbk.id, selectedTahun, selectedBulan);
  } else {
    recap = getFinancialRecapData(pbk.id, selectedTahun);
  }

  return `
    <div class="public-laporan-container">
      <!-- HEADER CARD -->
      <div class="card" style="margin-bottom: 1.5rem; background: linear-gradient(135deg, var(--bg-card), var(--bg-card-subtle)); border: 2px solid var(--primary-500);">
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: var(--primary-50); color: var(--primary-800); padding: 0.3rem 0.75rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 800; margin-bottom: 0.5rem;">
              <span>🌐 TRANSPARANSI PUBLIK TERBUKA</span>
              <span>•</span>
              <span>Dusun Kiyudan</span>
            </div>
            <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--primary-900); line-height: 1.2; letter-spacing: -0.01em;">
              Laporan Keuangan & Jimpitan Warga
            </h1>
            <p style="font-size: 0.9375rem; color: var(--text-secondary); margin-top: 0.25rem;">
              Data transparan dari total <strong>${wargaList.length} KK terdaftar</strong> pada ${pbk.nama}. Dibuka secara akuntabel untuk seluruh masyarakat.
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="publicLaporanModule.downloadPDF()" title="Unduh atau cetak dokumen PDF resmi">
              📥 Unduh / Cetak Dokumen PDF
            </button>
          </div>
        </div>
      </div>

      <!-- 4 TRANSPARANSI SUMMARY METRICS -->
      <div class="stats-grid">
        <div class="stat-card gold">
          <div class="stat-content">
            <h3>💰 Sisa Saldo Kas Pemuda</h3>
            <div class="stat-value">Rp ${recap.sisaPemuda.toLocaleString('id-ID')}</div>
            <div class="stat-meta">Masuk: Rp ${recap.masukPemuda.toLocaleString('id-ID')} | Keluar: Rp ${recap.keluarPemuda.toLocaleString('id-ID')}</div>
          </div>
          <div class="stat-icon-wrap"><span>⚡</span></div>
        </div>

        <div class="stat-card blue">
          <div class="stat-content">
            <h3>🏘️ Sisa Saldo Kas Dusun</h3>
            <div class="stat-value">Rp ${recap.sisaDusun.toLocaleString('id-ID')}</div>
            <div class="stat-meta">Masuk: Rp ${recap.masukDusun.toLocaleString('id-ID')} | Keluar: Rp ${recap.keluarDusun.toLocaleString('id-ID')}</div>
          </div>
          <div class="stat-icon-wrap"><span>🏛️</span></div>
        </div>

        <div class="stat-card purple">
          <div class="stat-content">
            <h3>💳 Total Tabungan Warga</h3>
            <div class="stat-value">Rp ${recap.sisaTabungan.toLocaleString('id-ID')}</div>
            <div class="stat-meta">Tersimpan dari ${wargaList.length} KK aktif</div>
          </div>
          <div class="stat-icon-wrap"><span>👛</span></div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <h3>🌐 Total Akumulasi Dana</h3>
            <div class="stat-value" style="color: var(--primary-800);">Rp ${recap.totalSisaDanaAll.toLocaleString('id-ID')}</div>
            <div class="stat-meta">Kas Pemuda + Dusun + Tabungan</div>
          </div>
          <div class="stat-icon-wrap"><span>💎</span></div>
        </div>
      </div>

      <!-- TAB & FILTER CONTROLLER -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header" style="flex-wrap: wrap; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn ${publicFilterTab === 'mingguan' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="publicLaporanModule.switchTab('mingguan')">
              📅 Laporan Mingguan
            </button>
            <button class="btn ${publicFilterTab === 'bulanan' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="publicLaporanModule.switchTab('bulanan')">
              📆 Laporan Bulanan
            </button>
            <button class="btn ${publicFilterTab === 'tahunan' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="publicLaporanModule.switchTab('tahunan')">
              📈 Laporan Tahunan
            </button>
            <button class="btn ${publicFilterTab === 'rentang' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="publicLaporanModule.switchTab('rentang')">
              🗓️ Rentang Periode Kustom
            </button>
            <button class="btn ${publicFilterTab === 'rekap_kk' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="publicLaporanModule.switchTab('rekap_kk')">
              👥 Rekapitulasi ${wargaList.length} KK
            </button>
          </div>

          <!-- DYNAMIC SUB-FILTERS -->
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            ${publicFilterTab === 'bulanan' ? `
              <select class="form-control" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.875rem;" onchange="publicLaporanModule.changeBulan(this.value)">
                <option value="01" ${selectedBulan === '01' ? 'selected' : ''}>Januari</option>
                <option value="02" ${selectedBulan === '02' ? 'selected' : ''}>Februari</option>
                <option value="03" ${selectedBulan === '03' ? 'selected' : ''}>Maret</option>
                <option value="04" ${selectedBulan === '04' ? 'selected' : ''}>April</option>
                <option value="05" ${selectedBulan === '05' ? 'selected' : ''}>Mei</option>
                <option value="06" ${selectedBulan === '06' ? 'selected' : ''}>Juni</option>
                <option value="07" ${selectedBulan === '07' ? 'selected' : ''}>Juli</option>
                <option value="08" ${selectedBulan === '08' ? 'selected' : ''}>Agustus</option>
                <option value="09" ${selectedBulan === '09' ? 'selected' : ''}>September</option>
                <option value="10" ${selectedBulan === '10' ? 'selected' : ''}>Oktober</option>
                <option value="11" ${selectedBulan === '11' ? 'selected' : ''}>November</option>
                <option value="12" ${selectedBulan === '12' ? 'selected' : ''}>Desember</option>
              </select>
              <select class="form-control" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.875rem;" onchange="publicLaporanModule.changeTahun(this.value)">
                <option value="2025" ${selectedTahun === '2025' ? 'selected' : ''}>Tahun 2025</option>
                <option value="2026" ${selectedTahun === '2026' ? 'selected' : ''}>Tahun 2026</option>
                <option value="2027" ${selectedTahun === '2027' ? 'selected' : ''}>Tahun 2027</option>
                <option value="2028" ${selectedTahun === '2028' ? 'selected' : ''}>Tahun 2028</option>
              </select>
            ` : ''}

            ${publicFilterTab === 'tahunan' || publicFilterTab === 'mingguan' || publicFilterTab === 'rekap_kk' ? `
              <select class="form-control" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.875rem;" onchange="publicLaporanModule.changeTahun(this.value)">
                <option value="2025" ${selectedTahun === '2025' ? 'selected' : ''}>Tahun 2025</option>
                <option value="2026" ${selectedTahun === '2026' ? 'selected' : ''}>Tahun 2026</option>
                <option value="2027" ${selectedTahun === '2027' ? 'selected' : ''}>Tahun 2027</option>
                <option value="2028" ${selectedTahun === '2028' ? 'selected' : ''}>Tahun 2028</option>
              </select>
            ` : ''}
          </div>
        </div>

        <!-- RANGE PICKER BAR FOR 'RENTANG' TAB -->
        ${publicFilterTab === 'rentang' ? `
          <div style="background: var(--bg-card-subtle); padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span style="font-weight: 700; font-size: 0.875rem; color: var(--primary-900);">🗓️ Rentang Filter:</span>
              
              <!-- DARI BULAN/TAHUN -->
              <div style="display: inline-flex; align-items: center; gap: 0.25rem;">
                <small style="font-weight: 600;">Dari:</small>
                <select class="form-control" style="width: auto; padding: 0.3rem 0.6rem; font-size: 0.8125rem;" onchange="publicLaporanModule.changeRangeStartMonth(this.value)">
                  <option value="01" ${rangeStartMonth === '01' ? 'selected' : ''}>Januari</option>
                  <option value="02" ${rangeStartMonth === '02' ? 'selected' : ''}>Februari</option>
                  <option value="03" ${rangeStartMonth === '03' ? 'selected' : ''}>Maret</option>
                  <option value="04" ${rangeStartMonth === '04' ? 'selected' : ''}>April</option>
                  <option value="05" ${rangeStartMonth === '05' ? 'selected' : ''}>Mei</option>
                  <option value="06" ${rangeStartMonth === '06' ? 'selected' : ''}>Juni</option>
                  <option value="07" ${rangeStartMonth === '07' ? 'selected' : ''}>Juli</option>
                  <option value="08" ${rangeStartMonth === '08' ? 'selected' : ''}>Agustus</option>
                  <option value="09" ${rangeStartMonth === '09' ? 'selected' : ''}>September</option>
                  <option value="10" ${rangeStartMonth === '10' ? 'selected' : ''}>Oktober</option>
                  <option value="11" ${rangeStartMonth === '11' ? 'selected' : ''}>November</option>
                  <option value="12" ${rangeStartMonth === '12' ? 'selected' : ''}>Desember</option>
                </select>
                <select class="form-control" style="width: auto; padding: 0.3rem 0.6rem; font-size: 0.8125rem;" onchange="publicLaporanModule.changeRangeStartYear(this.value)">
                  <option value="2025" ${rangeStartYear === '2025' ? 'selected' : ''}>2025</option>
                  <option value="2026" ${rangeStartYear === '2026' ? 'selected' : ''}>2026</option>
                  <option value="2027" ${rangeStartYear === '2027' ? 'selected' : ''}>2027</option>
                  <option value="2028" ${rangeStartYear === '2028' ? 'selected' : ''}>2028</option>
                </select>
              </div>

              <span style="color: var(--text-muted); font-weight: bold;">s/d</span>

              <!-- SAMPAI BULAN/TAHUN -->
              <div style="display: inline-flex; align-items: center; gap: 0.25rem;">
                <small style="font-weight: 600;">Sampai:</small>
                <select class="form-control" style="width: auto; padding: 0.3rem 0.6rem; font-size: 0.8125rem;" onchange="publicLaporanModule.changeRangeEndMonth(this.value)">
                  <option value="01" ${rangeEndMonth === '01' ? 'selected' : ''}>Januari</option>
                  <option value="02" ${rangeEndMonth === '02' ? 'selected' : ''}>Februari</option>
                  <option value="03" ${rangeEndMonth === '03' ? 'selected' : ''}>Maret</option>
                  <option value="04" ${rangeEndMonth === '04' ? 'selected' : ''}>April</option>
                  <option value="05" ${rangeEndMonth === '05' ? 'selected' : ''}>Mei</option>
                  <option value="06" ${rangeEndMonth === '06' ? 'selected' : ''}>Juni</option>
                  <option value="07" ${rangeEndMonth === '07' ? 'selected' : ''}>Juli</option>
                  <option value="08" ${rangeEndMonth === '08' ? 'selected' : ''}>Agustus</option>
                  <option value="09" ${rangeEndMonth === '09' ? 'selected' : ''}>September</option>
                  <option value="10" ${rangeEndMonth === '10' ? 'selected' : ''}>Oktober</option>
                  <option value="11" ${rangeEndMonth === '11' ? 'selected' : ''}>November</option>
                  <option value="12" ${rangeEndMonth === '12' ? 'selected' : ''}>Desember</option>
                </select>
                <select class="form-control" style="width: auto; padding: 0.3rem 0.6rem; font-size: 0.8125rem;" onchange="publicLaporanModule.changeRangeEndYear(this.value)">
                  <option value="2025" ${rangeEndYear === '2025' ? 'selected' : ''}>2025</option>
                  <option value="2026" ${rangeEndYear === '2026' ? 'selected' : ''}>2026</option>
                  <option value="2027" ${rangeEndYear === '2027' ? 'selected' : ''}>2027</option>
                  <option value="2028" ${rangeEndYear === '2028' ? 'selected' : ''}>2028</option>
                </select>
              </div>
            </div>

            <!-- PRESET QUICK BUTTONS -->
            <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
              <span style="font-size: 0.75rem; color: var(--text-muted);">Preset:</span>
              <button class="btn btn-outline-primary btn-sm" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;" onclick="publicLaporanModule.applyPresetRange('08', '2026', '05', '2027')">
                Ags 2026 – Mei 2027
              </button>
              <button class="btn btn-outline-secondary btn-sm" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;" onclick="publicLaporanModule.applyPresetRange('01', '2026', '12', '2026')">
                Tahun Penuh 2026
              </button>
            </div>
          </div>
        ` : ''}

        <!-- VIEW BODY CONTENT -->
        <div style="margin-top: 1.25rem;">
          ${publicLaporanModule.renderTabContent(pbk, wargaList)}
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

  // If start > end, swap
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
      monthName: monthNames[m],
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

  let totalJimpitan = 0;
  sList.forEach(p => {
    totalJimpitan += (parseFloat(p.total_jimpitan) || 0);
  });

  const totalMasukAll = masukPemuda + masukDusun + masukTabungan;
  const totalKeluarAll = keluarPemuda + keluarDusun + keluarTabungan;
  const totalSisaDanaAll = sisaPemuda + sisaDusun + sisaTabungan;

  return {
    masukPemuda, keluarPemuda, sisaPemuda,
    masukDusun, keluarDusun, sisaDusun,
    masukTabungan, keluarTabungan, sisaTabungan,
    totalJimpitan,
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

export const publicLaporanModule = {
  switchTab(tab) {
    publicFilterTab = tab;
    app.renderCurrentView();
  },

  changeBulan(val) {
    selectedBulan = val;
    app.renderCurrentView();
  },

  changeTahun(val) {
    selectedTahun = val;
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

  applyPresetRange(sM, sY, eM, eY) {
    rangeStartMonth = sM;
    rangeStartYear = sY;
    rangeEndMonth = eM;
    rangeEndYear = eY;
    app.renderCurrentView();
  },

  toggleDateSort() {
    sortOrderDate = sortOrderDate === 'DESC' ? 'ASC' : 'DESC';
    app.renderCurrentView();
  },

  renderTabContent(pbk, wargaList) {
    let allPengambilan = db.getPengambilanList().filter(p => p.status === 'POSTED');
    const allTrx = db.getAllTransaksi();
    const kasPemuda = db.getKasPemuda('semua');
    const kasDusun = db.getKasDusun('semua');

    // 1. LAPORAN MINGGUAN
    if (publicFilterTab === 'mingguan') {
      let filteredPengambilan = allPengambilan.filter(p => p.tanggal.startsWith(String(selectedTahun)));
      filteredPengambilan.sort((a, b) => {
        return sortOrderDate === 'ASC' 
          ? new Date(a.tanggal) - new Date(b.tanggal) 
          : new Date(b.tanggal) - new Date(a.tanggal);
      });

      let totalSemuaJimpitan = 0;
      let totalSemuaTabungan = 0;
      filteredPengambilan.forEach(p => {
        totalSemuaJimpitan += (p.total_jimpitan || 0);
        totalSemuaTabungan += (p.total_tabungan || 0);
      });

      const recap = getFinancialRecapData(pbk.id, selectedTahun);

      return `
        <div>
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
            <div>
              <h3 style="font-size: 1.125rem; font-weight: 800; color: var(--primary-800);">
                📅 Rekapitulasi Sesi Pengambilan Jimpitan Mingguan (Tahun ${selectedTahun})
              </h3>
              <p style="font-size: 0.8125rem; color: var(--text-secondary);">
                Setiap nominal jimpitan dibagi 50% Kas Pemuda & 50% Kas Dusun. Tabungan masuk saldo tabungan warga.
              </p>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <button class="btn btn-outline-secondary btn-sm" onclick="publicLaporanModule.toggleDateSort()" title="Klik untuk mengubah urutan tanggal">
                ${sortOrderDate === 'DESC' ? '⬇️ Tanggal Terbaru' : '⬆️ Tanggal Terlama'}
              </button>
              <span class="badge badge-success">Total ${filteredPengambilan.length} Sesi Terlaksana</span>
            </div>
          </div>

          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th style="width: 50px;">No</th>
                  <th style="cursor: pointer;" onclick="publicLaporanModule.toggleDateSort()" title="Klik untuk mengurutkan tanggal">
                    Tanggal & Hari ${sortOrderDate === 'DESC' ? '⬇️' : '⬆️'}
                  </th>
                  <th>Kelompok Bertugas</th>
                  <th style="text-align: center;">Partisipasi KK</th>
                  <th style="text-align: right;">Total Jimpitan</th>
                  <th style="text-align: right;">Kas Pemuda (50%)</th>
                  <th style="text-align: right;">Kas Dusun (50%)</th>
                  <th style="text-align: right;">Tabungan Warga</th>
                  <th style="text-align: right;">Total Uang Masuk</th>
                </tr>
              </thead>
              <tbody>
                ${filteredPengambilan.length === 0 ? `
                  <tr><td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-muted);">Belum ada sesi pengambilan yang disahkan pada tahun ${selectedTahun}.</td></tr>
                ` : filteredPengambilan.map((p, idx) => `
                  <tr>
                    <td style="color: var(--text-muted);">${idx + 1}</td>
                    <td>
                      <strong>${p.tanggal}</strong><br>
                      <small style="color: var(--text-muted);">${p.hari}</small>
                    </td>
                    <td>
                      <strong>${p.kelompok_nama}</strong><br>
                      <small style="color: var(--text-muted);">${p.petugas ? p.petugas.slice(0, 3).join(', ') + '...' : ''}</small>
                    </td>
                    <td style="text-align: center;">
                      <span class="badge badge-info">${p.warga_dicatat_count || 40} / ${p.total_warga_count || 40} KK</span>
                    </td>
                    <td style="text-align: right; font-family: monospace; font-weight: 700; color: var(--primary-700);">
                      Rp ${(p.total_jimpitan || 0).toLocaleString('id-ID')}
                    </td>
                    <td style="text-align: right; font-family: monospace; font-size: 0.8125rem;">
                      Rp ${((p.total_jimpitan || 0) * 0.5).toLocaleString('id-ID')}
                    </td>
                    <td style="text-align: right; font-family: monospace; font-size: 0.8125rem;">
                      Rp ${((p.total_jimpitan || 0) * 0.5).toLocaleString('id-ID')}
                    </td>
                    <td style="text-align: right; font-family: monospace; font-weight: 700; color: var(--accent-purple);">
                      Rp ${(p.total_tabungan || 0).toLocaleString('id-ID')}
                    </td>
                    <td style="text-align: right; font-family: monospace; font-weight: 800; color: var(--text-primary);">
                      Rp ${(p.total_sistem || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                `).join('')}
                <tr style="background: var(--bg-card-subtle); font-weight: 800; font-size: 0.9375rem;">
                  <td colspan="4" style="text-align: right;">TOTAL KESELURUHAN SESI:</td>
                  <td style="text-align: right; font-family: monospace; color: var(--primary-700);">
                    Rp ${totalSemuaJimpitan.toLocaleString('id-ID')}
                  </td>
                  <td style="text-align: right; font-family: monospace;">
                    Rp ${(totalSemuaJimpitan * 0.5).toLocaleString('id-ID')}
                  </td>
                  <td style="text-align: right; font-family: monospace;">
                    Rp ${(totalSemuaJimpitan * 0.5).toLocaleString('id-ID')}
                  </td>
                  <td style="text-align: right; font-family: monospace; color: var(--accent-purple);">
                    Rp ${totalSemuaTabungan.toLocaleString('id-ID')}
                  </td>
                  <td style="text-align: right; font-family: monospace; color: var(--primary-800); font-size: 1.05rem;">
                    Rp ${(totalSemuaJimpitan + totalSemuaTabungan).toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- RECAP BALANCE CARD -->
          ${renderRecapBalanceCardHtml(recap, `Tahun ${selectedTahun}`)}
        </div>
      `;
    }

    // 2. LAPORAN BULANAN
    if (publicFilterTab === 'bulanan') {
      const monthNames = { '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April', '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus', '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember' };
      const periodKey = `${selectedTahun}-${selectedBulan}`;
      
      let filteredPengambilan = allPengambilan.filter(p => p.tanggal.startsWith(periodKey));
      let totalJimp = 0;
      let totalTab = 0;
      filteredPengambilan.forEach(p => {
        totalJimp += (p.total_jimpitan || 0);
        totalTab += (p.total_tabungan || 0);
      });

      let pengeluaranPemuda = kasPemuda.filter(k => k.jenis === 'keluar' && k.tanggal.startsWith(periodKey));
      const totalPengPemuda = pengeluaranPemuda.reduce((a, b) => a + (b.nominal || 0), 0);

      let pengeluaranDusun = kasDusun.filter(k => k.jenis === 'keluar' && k.tanggal.startsWith(periodKey));
      const totalPengDusun = pengeluaranDusun.reduce((a, b) => a + (b.nominal || 0), 0);

      // Sort expenses by date
      let allPengeluaran = [...pengeluaranPemuda.map(k => ({...k, sumberKas: 'Kas Pemuda'})), ...pengeluaranDusun.map(k => ({...k, sumberKas: 'Kas Dusun'}))];
      allPengeluaran.sort((a, b) => {
        return sortOrderDate === 'ASC' 
          ? new Date(a.tanggal) - new Date(b.tanggal) 
          : new Date(b.tanggal) - new Date(a.tanggal);
      });

      const monthlyRecap = getFinancialRecapData(pbk.id, selectedTahun, selectedBulan);

      return `
        <div>
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
              <div>
                <h3 style="font-size: 1.35rem; font-weight: 800; text-transform: uppercase; color: var(--primary-900); margin: 0;">
                  LAPORAN KEUANGAN BULAN ${monthNames[selectedBulan].toUpperCase()} ${selectedTahun}
                </h3>
                <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 2px 0 0 0;">Dusun Kiyudan, Desa Majaksingi • Basis Transparansi ${wargaList.length} KK</p>
              </div>
              <button class="btn btn-outline-secondary btn-sm" onclick="publicLaporanModule.toggleDateSort()" title="Klik untuk mengubah urutan tanggal">
                ${sortOrderDate === 'DESC' ? '⬇️ Tanggal Terbaru' : '⬆️ Tanggal Terlama'}
              </button>
            </div>

            <!-- 4 SUMMARY CARDS -->
            <div class="stats-grid" style="margin-bottom: 1.5rem;">
              <div class="stat-card">
                <div class="stat-content">
                  <h3>Total Jimpitan Masuk</h3>
                  <div class="stat-value" style="color: var(--primary-700);">Rp ${totalJimp.toLocaleString('id-ID')}</div>
                  <div class="stat-meta">50% Pemuda: Rp ${(totalJimp * 0.5).toLocaleString('id-ID')} • 50% Dusun: Rp ${(totalJimp * 0.5).toLocaleString('id-ID')}</div>
                </div>
              </div>

              <div class="stat-card purple">
                <div class="stat-content">
                  <h3>Tabungan Warga Masuk</h3>
                  <div class="stat-value">Rp ${totalTab.toLocaleString('id-ID')}</div>
                  <div class="stat-meta">Tersimpan dari ${wargaList.length} KK bulan ini</div>
                </div>
              </div>

              <div class="stat-card gold">
                <div class="stat-content">
                  <h3>Pengeluaran Kas Pemuda</h3>
                  <div class="stat-value" style="color: #dc2626;">Rp ${totalPengPemuda.toLocaleString('id-ID')}</div>
                  <div class="stat-meta">Kegiatan & operasional pemuda</div>
                </div>
              </div>

              <div class="stat-card blue">
                <div class="stat-content">
                  <h3>Pengeluaran Kas Dusun</h3>
                  <div class="stat-value" style="color: #dc2626;">Rp ${totalPengDusun.toLocaleString('id-ID')}</div>
                  <div class="stat-meta">Pembangunan & sosial warga</div>
                </div>
              </div>
            </div>

            <!-- DETAIL PENERIMAAN JIMPITAN MINGGUAN -->
            <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem;">1. Rincian Penerimaan Sesi Jimpitan Mingguan:</h4>
            <div class="table-responsive" style="margin-bottom: 1.5rem;">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th style="cursor: pointer;" onclick="publicLaporanModule.toggleDateSort()" title="Klik untuk mengurutkan tanggal">
                      Tanggal ${sortOrderDate === 'DESC' ? '⬇️' : '⬆️'}
                    </th>
                    <th>Kelompok</th>
                    <th>Partisipasi</th>
                    <th style="text-align: right;">Jimpitan</th>
                    <th style="text-align: right;">Kas Pemuda (50%)</th>
                    <th style="text-align: right;">Kas Dusun (50%)</th>
                    <th style="text-align: right;">Tabungan</th>
                    <th style="text-align: right;">Total Setor</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredPengambilan.length === 0 ? `
                    <tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">Tidak ada transaksi pengambilan pada bulan ${monthNames[selectedBulan]} ${selectedTahun}.</td></tr>
                  ` : filteredPengambilan.map(p => `
                    <tr>
                      <td><strong>${p.tanggal}</strong> (${p.hari})</td>
                      <td>${p.kelompok_nama}</td>
                      <td><span class="badge badge-neutral">${p.warga_dicatat_count || 40} / ${p.total_warga_count || 40} KK</span></td>
                      <td style="text-align: right; font-family: monospace; font-weight: 600;">Rp ${(p.total_jimpitan || 0).toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace;">Rp ${((p.total_jimpitan || 0) * 0.5).toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace;">Rp ${((p.total_jimpitan || 0) * 0.5).toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; color: var(--primary-700); font-weight: 700;">Rp ${(p.total_tabungan || 0).toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; font-weight: 800;">Rp ${(p.total_sistem || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- DETAIL PENGELUARAN BULAN INI -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h4 style="font-size: 1rem; font-weight: 700; margin: 0;">2. Rincian Pengeluaran Kas Pemuda & Kas Dusun:</h4>
              <small style="color: var(--text-muted);">Urutan: ${sortOrderDate === 'DESC' ? 'Terbaru' : 'Terlama'}</small>
            </div>
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th style="cursor: pointer;" onclick="publicLaporanModule.toggleDateSort()" title="Klik untuk mengurutkan tanggal">
                      Tanggal ${sortOrderDate === 'DESC' ? '⬇️' : '⬆️'}
                    </th>
                    <th>Sumber Kas</th>
                    <th>Kategori</th>
                    <th>Uraian Pengeluaran</th>
                    <th>Penanggung Jawab</th>
                    <th style="text-align: right;">Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  ${allPengeluaran.length === 0 ? `
                    <tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">Tidak ada pengeluaran pada bulan ini.</td></tr>
                  ` : allPengeluaran.map(k => `
                    <tr>
                      <td>${k.tanggal}</td>
                      <td><span class="badge ${k.sumberKas === 'Kas Pemuda' ? 'badge-warning' : 'badge-info'}">${k.sumberKas}</span></td>
                      <td><strong>${k.kategori}</strong></td>
                      <td>${k.keterangan}</td>
                      <td><small>${k.petugas || '-'}</small></td>
                      <td style="text-align: right; font-family: monospace; font-weight: 700; color: #dc2626;">
                        - Rp ${Number(k.nominal).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- RECAP BALANCE CARD BULANAN -->
            ${renderRecapBalanceCardHtml(monthlyRecap, `Bulan ${monthNames[selectedBulan]} ${selectedTahun}`)}
          </div>
        </div>
      `;
    }

    // 3. LAPORAN TAHUNAN
    if (publicFilterTab === 'tahunan') {
      const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

      let grandJimpitan = 0;
      let grandTabungan = 0;
      let grandPengeluaranPemuda = 0;
      let grandPengeluaranDusun = 0;

      const monthlyRows = months.map((m, idx) => {
        const pKey = `${selectedTahun}-${m}`;
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

      const yearlyRecap = getFinancialRecapData(pbk.id, selectedTahun);

      return `
        <div>
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
              <h3 style="font-size: 1.35rem; font-weight: 800; text-transform: uppercase; color: var(--primary-900);">
                LAPORAN KEUANGAN TAHUNAN ${selectedTahun}
              </h3>
              <p style="font-size: 0.875rem; color: var(--text-secondary);">Transparansi Akumulasi 12 Bulan Jimpitan & Kas Dusun Kiyudan (${wargaList.length} KK)</p>
            </div>

            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Bulan</th>
                    <th style="text-align: right;">Total Jimpitan</th>
                    <th style="text-align: right;">Kas Pemuda (50%)</th>
                    <th style="text-align: right;">Kas Dusun (50%)</th>
                    <th style="text-align: right;">Tabungan Warga</th>
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
                      <td style="text-align: right; font-family: monospace; color: var(--primary-700); font-weight: 700;">Rp ${row.tabungan.toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; color: #dc2626;">Rp ${row.pengeluaranPemuda.toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; color: #dc2626;">Rp ${row.pengeluaranDusun.toLocaleString('id-ID')}</td>
                    </tr>
                  `).join('')}
                  <tr style="background: var(--bg-card-subtle); font-weight: 800; font-size: 1rem;">
                    <td>TOTAL KESELURUHAN ${selectedTahun}</td>
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
            ${renderRecapBalanceCardHtml(yearlyRecap, `Akumulasi 12 Bulan Tahun ${selectedTahun}`)}
          </div>
        </div>
      `;
    }

    // 4. LAPORAN RENTANG PERIODE KUSTOM (CUSTOM RANGE)
    if (publicFilterTab === 'rentang') {
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
          key: item.key,
          jimpitan: jimp,
          tabungan: tab,
          pengeluaranPemuda: pengPem,
          pengeluaranDusun: pengDus
        };
      });

      return `
        <div>
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem;">
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
              <div>
                <h3 style="font-size: 1.35rem; font-weight: 800; text-transform: uppercase; color: var(--primary-900); margin: 0;">
                  LAPORAN KEUANGAN RENTANG PERIODE KUSTOM
                </h3>
                <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 2px 0 0 0;">
                  Periode: <strong>${monthList[0].label}</strong> s/d <strong>${monthList[monthList.length - 1].label}</strong> (${monthList.length} Bulan) • Dusun Kiyudan (${wargaList.length} KK)
                </p>
              </div>
              <span class="badge badge-primary" style="font-size: 0.875rem;">Total ${monthList.length} Bulan Terpilih</span>
            </div>

            <!-- TABLE MONTH-BY-MONTH IN RANGE -->
            <div class="table-responsive" style="margin-bottom: 1.5rem;">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Bulan / Periode</th>
                    <th style="text-align: right;">Total Jimpitan</th>
                    <th style="text-align: right;">Kas Pemuda (50%)</th>
                    <th style="text-align: right;">Kas Dusun (50%)</th>
                    <th style="text-align: right;">Tabungan Warga</th>
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
                      <td style="text-align: right; font-family: monospace; color: var(--primary-700); font-weight: 700;">Rp ${row.tabungan.toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; color: #dc2626;">Rp ${row.pengeluaranPemuda.toLocaleString('id-ID')}</td>
                      <td style="text-align: right; font-family: monospace; color: #dc2626;">Rp ${row.pengeluaranDusun.toLocaleString('id-ID')}</td>
                    </tr>
                  `).join('')}
                  <tr style="background: var(--bg-card-subtle); font-weight: 800; font-size: 1rem;">
                    <td>TOTAL RENTANG (${monthList.length} BULAN)</td>
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

    // 5. REKAPITULASI 40 KK TERDAFTAR
    if (publicFilterTab === 'rekap_kk') {
      const recap = getFinancialRecapData(pbk.id, selectedTahun);

      return `
        <div>
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
              <h3 style="font-size: 1.35rem; font-weight: 800; text-transform: uppercase; color: var(--primary-900);">
                REKAPITULASI PARTISIPASI SELURUH ${wargaList.length} KK WARGA
              </h3>
              <p style="font-size: 0.875rem; color: var(--text-secondary);">Daftar Seluruh KK Terdaftar dalam Sistem Pembukuan ${selectedTahun}</p>
            </div>

            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th style="width: 50px;">No</th>
                    <th>Kode Warga</th>
                    <th>Nama Kepala Keluarga (KK)</th>
                    <th>Status Keaktifan</th>
                    <th style="text-align: center;">Frekuensi Setor</th>
                    <th style="text-align: right;">Total Saldo Tabungan</th>
                  </tr>
                </thead>
                <tbody>
                  ${wargaList.map((w, idx) => {
                    const saldo = db.getSaldoTabunganWarga(w.id, pbk.id);
                    const countSetor = allTrx.filter(t => t.warga_id === w.id && t.status === 'Sudah Setor').length;
                    return `
                      <tr>
                        <td style="color: var(--text-muted);">${idx + 1}</td>
                        <td><span class="badge badge-neutral" style="font-family: monospace;">${w.kode_warga}</span></td>
                        <td><strong>${w.nama}</strong></td>
                        <td><span class="badge badge-success">${w.status}</span></td>
                        <td style="text-align: center;">
                          <span class="badge badge-info">${countSetor}x Setor</span>
                        </td>
                        <td style="text-align: right; font-family: monospace; font-weight: 800; font-size: 1rem; color: var(--primary-700);">
                          Rp ${saldo.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                  <tr style="background: var(--bg-card-subtle); font-weight: 800; font-size: 1rem;">
                    <td colspan="5" style="text-align: right;">TOTAL TABUNGAN SELURUH ${wargaList.length} KK:</td>
                    <td style="text-align: right; font-family: monospace; font-size: 1.15rem; color: var(--primary-700);">
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
  // BUILD PRINT & DOWNLOAD HTML TEMPLATE
  // -------------------------------------------------------------
  preparePrintHTML() {
    const pbk = db.getActivePembukuan();
    const wargaList = db.getWarga().filter(w => w.status === 'Aktif');
    const allPengambilan = db.getPengambilanList().filter(p => p.status === 'POSTED');
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
    if (publicFilterTab === 'rentang') {
      const sPeriod = `${rangeStartYear}-${rangeStartMonth}`;
      const ePeriod = `${rangeEndYear}-${rangeEndMonth}`;
      recap = getFinancialRecapByRange(sPeriod, ePeriod);
    } else if (publicFilterTab === 'bulanan') {
      recap = getFinancialRecapData(pbk.id, selectedTahun, selectedBulan);
    } else {
      recap = getFinancialRecapData(pbk.id, selectedTahun);
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

    if (publicFilterTab === 'rentang') {
      const monthList = getMonthsInRange(rangeStartYear, rangeStartMonth, rangeEndYear, rangeEndMonth);
      reportTitle = 'LAPORAN KEUANGAN REKAPITULASI RENTANG PERIODE KUSTOM';
      reportSubtitle = `Periode: ${monthList[0].label} s/d ${monthList[monthList.length - 1].label} (${monthList.length} Bulan) • Dusun Kiyudan (${wargaList.length} KK)`;
      filename = `Laporan_Jimpitan_Rentang_${rangeStartYear}-${rangeStartMonth}_sd_${rangeEndYear}-${rangeEndMonth}.pdf`;

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
    } else if (publicFilterTab === 'mingguan') {
      reportTitle = 'LAPORAN REKAPITULASI PENGAMBILAN JIMPITAN MINGGUAN';
      reportSubtitle = `Periode Pembukuan: ${selectedTahun} • Basis Data: ${wargaList.length} KK Terdaftar`;
      filename = `Laporan_Jimpitan_Mingguan_Kiyudan_${selectedTahun}.pdf`;

      const filteredPengambilan = allPengambilan.filter(p => p.tanggal.startsWith(String(selectedTahun)));
      let totalJimpitan = 0;
      let totalTabungan = 0;
      filteredPengambilan.forEach(p => {
        totalJimpitan += (p.total_jimpitan || 0);
        totalTabungan += (p.total_tabungan || 0);
      });

      reportTableHtml = `
        <table class="print-meta-table">
          <tr>
            <td style="width: 25%;"><strong>Tahun Pembukuan</strong></td>
            <td style="width: 25%;">: ${selectedTahun}</td>
            <td style="width: 25%;"><strong>Total KK Terdaftar</strong></td>
            <td style="width: 25%;">: ${wargaList.length} KK Warga</td>
          </tr>
          <tr>
            <td><strong>Alokasi Jimpitan</strong></td>
            <td>: 50% Kas Pemuda & 50% Kas Dusun</td>
            <td><strong>Ketentuan Nominal</strong></td>
            <td>: Jimpitan Min. Rp3.000, Tabungan Bebas</td>
          </tr>
        </table>

        <table class="print-table">
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th style="width: 90px;">Tanggal</th>
              <th style="width: 60px;">Hari</th>
              <th>Kelompok Bertugas</th>
              <th style="width: 80px;">Partisipasi</th>
              <th class="text-right">Total Jimpitan</th>
              <th class="text-right">Kas Pemuda (50%)</th>
              <th class="text-right">Kas Dusun (50%)</th>
              <th class="text-right">Tabungan Warga</th>
              <th class="text-right">Total Setor</th>
            </tr>
          </thead>
          <tbody>
            ${filteredPengambilan.length === 0 ? `
              <tr><td colspan="10" class="text-center" style="padding: 15px;">Belum ada sesi pengambilan jimpitan yang disahkan.</td></tr>
            ` : filteredPengambilan.map((p, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td class="text-center">${p.tanggal}</td>
                <td class="text-center">${p.hari}</td>
                <td>${p.kelompok_nama}</td>
                <td class="text-center">${p.warga_dicatat_count || 40}/${p.total_warga_count || 40} KK</td>
                <td class="text-right">Rp ${(p.total_jimpitan || 0).toLocaleString('id-ID')}</td>
                <td class="text-right">Rp ${((p.total_jimpitan || 0) * 0.5).toLocaleString('id-ID')}</td>
                <td class="text-right">Rp ${((p.total_jimpitan || 0) * 0.5).toLocaleString('id-ID')}</td>
                <td class="text-right">Rp ${(p.total_tabungan || 0).toLocaleString('id-ID')}</td>
                <td class="text-right"><strong>Rp ${(p.total_sistem || 0).toLocaleString('id-ID')}</strong></td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="5" class="text-right">TOTAL KESELURUHAN SESI:</td>
              <td class="text-right">Rp ${totalJimpitan.toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${(totalJimpitan * 0.5).toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${(totalJimpitan * 0.5).toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${totalTabungan.toLocaleString('id-ID')}</td>
              <td class="text-right">Rp ${(totalJimpitan + totalTabungan).toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        ${recapTableHtml}
      `;
    } else if (publicFilterTab === 'bulanan') {
      const monthNames = { '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April', '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus', '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember' };
      const periodKey = `${selectedTahun}-${selectedBulan}`;
      reportTitle = `LAPORAN KEUANGAN JIMPITAN & KAS — BULAN ${monthNames[selectedBulan].toUpperCase()} ${selectedTahun}`;
      reportSubtitle = `Dusun Kiyudan, Desa Majaksingi — Basis Data: ${wargaList.length} KK Terdaftar`;
      filename = `Laporan_Jimpitan_Bulanan_Kiyudan_${selectedBulan}_${selectedTahun}.pdf`;

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
            <td style="width: 25%;">: ${monthNames[selectedBulan]} ${selectedTahun}</td>
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

        <div class="print-section-title" style="margin-top: 1rem;">2. Tabel Pengeluaran Kas Pemuda & Kas Dusun</div>
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
    } else if (publicFilterTab === 'tahunan') {
      reportTitle = `LAPORAN KEUANGAN TAHUNAN — TAHUN ${selectedTahun}`;
      reportSubtitle = `Akumulasi 12 Bulan Transparansi Jimpitan & Kas Dusun Kiyudan (${wargaList.length} KK)`;
      filename = `Laporan_Jimpitan_Tahunan_Kiyudan_${selectedTahun}.pdf`;

      const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

      let grandJimpitan = 0;
      let grandTabungan = 0;
      let grandPengeluaranPemuda = 0;
      let grandPengeluaranDusun = 0;

      const monthlyRows = months.map((m, idx) => {
        const pKey = `${selectedTahun}-${m}`;
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
            <td style="width: 25%;">: ${selectedTahun}</td>
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
              <td colspan="2" class="text-right">TOTAL KESELURUHAN ${selectedTahun}:</td>
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
    } else if (publicFilterTab === 'rekap_kk') {
      reportTitle = `REKAPITULASI TABUNGAN & PARTISIPASI SELURUH KK WARGA`;
      reportSubtitle = `Tahun Pembukuan: ${selectedTahun} • Basis Data: ${wargaList.length} KK Dusun Kiyudan`;
      filename = `Rekapitulasi_Tabungan_40KK_Kiyudan_${selectedTahun}.pdf`;

      reportTableHtml = `
        <table class="print-meta-table">
          <tr>
            <td style="width: 25%;"><strong>Tahun Pembukuan</strong></td>
            <td style="width: 25%;">: ${selectedTahun}</td>
            <td style="width: 25%;"><strong>Total KK Terdaftar</strong></td>
            <td style="width: 25%;">: ${wargaList.length} KK Warga</td>
          </tr>
          <tr>
            <td><strong>Total Saldo Terkumpul</strong></td>
            <td>: Rp ${db.getTotalSeluruhTabungan(pbk.id).toLocaleString('id-ID')}</td>
            <td><strong>Status Data</strong></td>
            <td>: Transparansi Akuntabel Dusun Kiyudan</td>
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

  printPublicReport() {
    const { filename } = this.preparePrintHTML();
    document.title = filename.replace('.pdf', '');
    window.print();
  },

  downloadPDF() {
    const { filename } = this.preparePrintHTML();
    app.downloadPDFFromContainer(filename);
  }
};
