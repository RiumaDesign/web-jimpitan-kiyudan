// View: Dashboard Admin Panel
import { db } from '../db.js';

export function renderAdminDash() {
  const pbk = db.getActivePembukuan();
  const wargaList = db.getWarga();
  const wargaAktifCount = wargaList.filter(w => w.status === 'Aktif').length;
  const saldoPemuda = db.getSaldoKasPemuda(pbk.id);
  const saldoDusun = db.getSaldoKasDusun(pbk.id);
  const totalTabungan = db.getTotalSeluruhTabungan(pbk.id);
  const pengambilanList = db.getPengambilanList();
  const lastPengambilan = pengambilanList[0];
  const auditLogs = db.getAuditLogs().slice(0, 5);

  return `
    <div class="admin-dashboard-container">
      <!-- HEADER BANNER -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 1.25rem 1.5rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 700; color: var(--primary-700);">
            <span>🛡️ PANEL ADMINISTRASI JIMPITAN</span>
            <span>•</span>
            <span class="badge badge-success">Pembukuan Aktif: ${pbk.nama}</span>
          </div>
          <h1 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-top: 0.25rem;">
            Dashboard Pengelolaan Kas & Jimpitan
          </h1>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-primary" onclick="window.location.hash = '#/pengambilan'">
            ⚡ Mode Pengambilan Jimpitan
          </button>
          <button class="btn btn-secondary" onclick="window.location.hash = '#/keuangan'">
            💰 Buku Kas & Pengeluaran
          </button>
        </div>
      </div>

      <!-- KPI METRICS -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-content">
            <h3>👥 Total Warga Terdaftar</h3>
            <div class="stat-value">${wargaAktifCount} KK</div>
            <div class="stat-meta">${wargaList.length} Total KK (${wargaList.length - wargaAktifCount} non-aktif)</div>
          </div>
          <div class="stat-icon-wrap"><span>👨‍👩‍👧‍👦</span></div>
        </div>

        <div class="stat-card gold">
          <div class="stat-content">
            <h3>💰 Saldo Kas Pemuda</h3>
            <div class="stat-value">Rp ${saldoPemuda.toLocaleString('id-ID')}</div>
            <div class="stat-meta">50% bagian jimpitan & kegiatan</div>
          </div>
          <div class="stat-icon-wrap"><span>⚡</span></div>
        </div>

        <div class="stat-card blue">
          <div class="stat-content">
            <h3>🏘️ Saldo Kas Dusun</h3>
            <div class="stat-value">Rp ${saldoDusun.toLocaleString('id-ID')}</div>
            <div class="stat-meta">50% bagian jimpitan & sosial</div>
          </div>
          <div class="stat-icon-wrap"><span>🏛️</span></div>
        </div>

        <div class="stat-card purple">
          <div class="stat-content">
            <h3>💳 Total Tabungan Warga</h3>
            <div class="stat-value">Rp ${totalTabungan.toLocaleString('id-ID')}</div>
            <div class="stat-meta">Saldo murni tabungan seluruh warga</div>
          </div>
          <div class="stat-icon-wrap"><span>👛</span></div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
        <!-- PENGAMBILAN TERAKHIR / STATUS -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📅 Sesi Pengambilan Terakhir</h3>
            <button class="btn btn-sm btn-outline-primary" onclick="window.location.hash = '#/pengambilan'">
              Buka Pengambilan
            </button>
          </div>

          ${lastPengambilan ? `
            <div style="background: var(--bg-card-subtle); border-radius: var(--radius-md); padding: 1.25rem; border: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                <div>
                  <span class="badge ${lastPengambilan.status === 'POSTED' ? 'badge-success' : 'badge-warning'}">
                    ${lastPengambilan.status === 'POSTED' ? '✓ Telah Disahkan' : 'Draft / Berlangsung'}
                  </span>
                  <h4 style="font-size: 1.125rem; font-weight: 800; margin-top: 0.35rem;">
                    ${lastPengambilan.kelompok_nama}
                  </h4>
                  <div style="font-size: 0.8125rem; color: var(--text-secondary);">
                    Tanggal: ${lastPengambilan.tanggal} (${lastPengambilan.hari}) • Kode: ${lastPengambilan.kode_pengambilan}
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 0.75rem; color: var(--text-muted);">Total Uang Masuk</div>
                  <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary-600); font-family: monospace;">
                    Rp ${(lastPengambilan.total_sistem || 0).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; font-size: 0.8125rem;">
                <div>
                  <span style="color: var(--text-muted);">Jimpitan:</span><br>
                  <strong>Rp ${(lastPengambilan.total_jimpitan || 0).toLocaleString('id-ID')}</strong>
                </div>
                <div>
                  <span style="color: var(--text-muted);">Tabungan:</span><br>
                  <strong>Rp ${(lastPengambilan.total_tabungan || 0).toLocaleString('id-ID')}</strong>
                </div>
                <div>
                  <span style="color: var(--text-muted);">Dicatat:</span><br>
                  <strong>${lastPengambilan.warga_dicatat_count || 0} / ${lastPengambilan.total_warga_count || 40} KK</strong>
                </div>
              </div>
            </div>
          ` : `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
              Belum ada sesi pengambilan tersimpan.
            </div>
          `}
        </div>

        <!-- QUICK SHORTCUTS -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">⚡ Akses Cepat Menu Admin</h3>
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
            <button class="btn btn-secondary" style="justify-content: flex-start; padding: 1rem;" onclick="window.location.hash = '#/master-warga'">
              <span style="font-size: 1.25rem;">👥</span>
              <div style="text-align: left;">
                <div style="font-weight: 700;">Master Warga</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Kelola 40+ KK & Status</div>
              </div>
            </button>

            <button class="btn btn-secondary" style="justify-content: flex-start; padding: 1rem;" onclick="window.location.hash = '#/master-kelompok'">
              <span style="font-size: 1.25rem;">🔄</span>
              <div style="text-align: left;">
                <div style="font-weight: 700;">4 Kelompok</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Anggota & Penasehat</div>
              </div>
            </button>

            <button class="btn btn-secondary" style="justify-content: flex-start; padding: 1rem;" onclick="window.location.hash = '#/laporan'">
              <span style="font-size: 1.25rem;">📊</span>
              <div style="text-align: left;">
                <div style="font-weight: 700;">Laporan & PDF</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Bulan & Tahun</div>
              </div>
            </button>

            <button class="btn btn-secondary" style="justify-content: flex-start; padding: 1rem;" onclick="window.location.hash = '#/pembukuan'">
              <span style="font-size: 1.25rem;">📚</span>
              <div style="text-align: left;">
                <div style="font-weight: 700;">Pembukuan</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Multi-Tahun & Arsip</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- RECENT AUDIT LOGS -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">🛡️ Catatan Audit Aktivitas Terkini</h3>
            <p class="card-subtitle">Riwayat perubahan penting dan pengesahan data keuangan</p>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="window.location.hash = '#/settings'">
            Lihat Semua Audit
          </button>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Admin</th>
                <th>Aktivitas</th>
                <th>Rincian Detail</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${auditLogs.map(log => `
                <tr>
                  <td style="white-space: nowrap; font-size: 0.8125rem; color: var(--text-secondary);">
                    ${new Date(log.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td><strong>${log.admin}</strong></td>
                  <td><strong>${log.aktivitas}</strong></td>
                  <td style="font-size: 0.8125rem;">${log.detail}</td>
                  <td>
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
