// View: Beranda Publik (Tanpa Login)
import { db } from '../db.js';

export function renderPublicHome() {
  const pbk = db.getActivePembukuan();
  const saldoPemuda = db.getSaldoKasPemuda(pbk.id);
  const saldoDusun = db.getSaldoKasDusun(pbk.id);
  const totalTabungan = db.getTotalSeluruhTabungan(pbk.id);
  const groups = db.getGroups();
  const penasehat = db.getPenasehat();
  const pengambilanList = db.getPengambilanList();

  // Hitung jadwal kelompok berikutnya berdasarkan rotasi 1 -> 2 -> 3 -> 4 -> 1
  const lastPengambilan = pengambilanList[0];
  let nextGroupIndex = 3; // Default Kelompok 4 untuk 23 Agustus 2026
  if (lastPengambilan) {
    const lastNomor = groups.findIndex(g => g.id === lastPengambilan.kelompok_id);
    if (lastNomor !== -1) {
      nextGroupIndex = (lastNomor + 1) % groups.length;
    }
  }
  const activeGroup = groups[nextGroupIndex] || groups[3];

  return `
    <div class="public-home-container">
      <!-- HERO & BRANDING -->
      <div class="card hero-card" style="background: linear-gradient(135deg, rgba(6,78,59,0.95), rgba(4,120,87,0.9)), url('assets/img/logo_kiyudan.jpg'); background-size: cover; background-position: center; color: #ffffff; margin-bottom: 2rem; border: none; box-shadow: var(--shadow-xl);">
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.5rem; position: relative; z-index: 1;">
          <div style="flex: 1; min-width: 280px;">
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.2); padding: 0.35rem 0.85rem; border-radius: var(--radius-full); font-size: 0.8125rem; font-weight: 700; margin-bottom: 1rem; backdrop-filter: blur(4px);">
              <span>🏛️ Sistem Digital Dusun Kiyudan</span>
              <span style="opacity: 0.7;">•</span>
              <span>Desa Majaksingi, Borobudur</span>
            </div>
            <h1 style="font-size: 2.15rem; font-weight: 800; line-height: 1.2; margin-bottom: 0.75rem; letter-spacing: -0.02em;">
              Transparansi Jimpitan & Kas Dusun Kiyudan
            </h1>
            <p style="font-size: 1rem; opacity: 0.95; max-width: 620px; line-height: 1.6; margin-bottom: 1.5rem;">
              Sistem resmi pengelolaan jimpitan mingguan, tabungan warga, kas pemuda, dan kas dusun. Terbuka, transparan, dan terpercaya. Guyub Rukun Maju Bersama!
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
              <button class="btn btn-warning btn-lg" onclick="window.location.hash = '#/laporan-publik'">
                📊 Lihat Laporan Keuangan
              </button>
              <button class="btn btn-secondary btn-lg" onclick="window.location.hash = '#/cek-tabungan'">
                🔎 Cek Tabungan Warga
              </button>
              <button class="btn btn-outline-primary btn-lg" style="background: rgba(255,255,255,0.15); color: #fff; border-color: rgba(255,255,255,0.4);" onclick="document.getElementById('jadwal-section').scrollIntoView({behavior: 'smooth'})">
                📅 Jadwal Minggu Ini
              </button>
            </div>
          </div>
          <div style="text-align: center;">
            <img src="assets/img/logo_kiyudan.jpg" alt="Logo Dusun Kiyudan" style="width: 145px; height: 145px; border-radius: var(--radius-xl); border: 4px solid rgba(255,255,255,0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.35); background: #fff;">
          </div>
        </div>
      </div>

      <!-- EVENT BANNER 23 AGUSTUS 2026 -->
      <div class="event-banner-card">
        <div class="event-banner-info">
          <span class="event-tag">🎉 Agenda Dusun Terdekat</span>
          <h2 class="event-title">Jalan Santai Warga Dusun Kiyudan — HUT RI ke-81</h2>
          <div class="event-details">
            <div><strong>📅 Hari / Tanggal:</strong> Minggu, 23 Agustus 2026</div>
            <div><strong>⏰ Waktu:</strong> 07.00 WIB s/d Selesai</div>
            <div><strong>📍 Titik Kumpul:</strong> Belakang Masjid Dusun Kiyudan</div>
          </div>
          <p style="font-size: 0.875rem; opacity: 0.95; margin-bottom: 1rem;">
            Mari ikuti dan meriahkan Jalan Santai Warga Dusun Kiyudan dalam rangka memperingati HUT Kemerdekaan RI ke-81! Bertabur puluhan hadiah doorprize menarik serta hiburan kebersamaan seluruh warga.
          </p>
          <div class="event-actions">
            <button class="btn btn-warning btn-sm" onclick="app.showEventModal('poster')">
              🖼️ Lihat Poster Acara
            </button>
            <button class="btn btn-secondary btn-sm" onclick="app.showEventModal('rundown')">
              📋 Lihat Rundown Acara
            </button>
          </div>
        </div>
        <div class="event-thumb-wrapper" onclick="app.showEventModal('poster')" title="Klik untuk memperbesar poster">
          <img src="assets/img/banner_event_23agus.jpg" alt="Poster Jalan Santai" class="event-thumb-img">
        </div>
      </div>

      <!-- TRANSPARANSI KAS WIDGETS -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-content">
            <h3>💰 Kas Pemuda</h3>
            <div class="stat-value">Rp ${saldoPemuda.toLocaleString('id-ID')}</div>
            <div class="stat-meta">50% bagian jimpitan & kegiatan</div>
          </div>
          <div class="stat-icon-wrap"><span>⚡</span></div>
        </div>

        <div class="stat-card blue">
          <div class="stat-content">
            <h3>🏘️ Kas Dusun</h3>
            <div class="stat-value">Rp ${saldoDusun.toLocaleString('id-ID')}</div>
            <div class="stat-meta">50% bagian jimpitan & sosial</div>
          </div>
          <div class="stat-icon-wrap"><span>🏛️</span></div>
        </div>

        <div class="stat-card purple">
          <div class="stat-content">
            <h3>💳 Total Tabungan Warga</h3>
            <div class="stat-value">Rp ${totalTabungan.toLocaleString('id-ID')}</div>
            <div class="stat-meta">Saldo aman milik 40+ KK warga</div>
          </div>
          <div class="stat-icon-wrap"><span>👛</span></div>
        </div>

        <div class="stat-card gold">
          <div class="stat-content">
            <h3>👥 Total Warga</h3>
            <div class="stat-value">${db.getWarga().filter(w => w.status === 'Aktif').length} KK</div>
            <div class="stat-meta">Warga aktif pembukuan ${pbk.tahun}</div>
          </div>
          <div class="stat-icon-wrap"><span>👨‍👩‍👧‍👦</span></div>
        </div>
      </div>

      <!-- SECTION JADWAL KELOMPOK JIMPITAN (ENHANCED & BEAUTIFIED) -->
      <div class="card" id="jadwal-section" style="margin-bottom: 2rem;">
        <div class="card-header" style="flex-wrap: wrap;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span class="badge badge-success">🗓️ SISTEM ROTASI MINGGUAN</span>
              <span style="font-size: 0.8125rem; color: var(--text-muted);">Pembukuan Tahun ${pbk.tahun}</span>
            </div>
            <h2 class="card-title" style="font-size: 1.4rem;">Jadwal Kelompok & Petugas Jimpitan</h2>
            <p class="card-subtitle">Pengambilan rutin mingguan ke 40 KK warga Dusun Kiyudan</p>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button class="btn btn-outline-primary btn-sm" onclick="window.location.hash = '#/cek-tabungan'">
              🔎 Cek Tabungan Saya
            </button>
          </div>
        </div>

        <!-- ROTATION FLOW TIMELINE -->
        <div style="margin-bottom: 1.5rem;">
          <div style="font-size: 0.8125rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
            🔄 Alur Rotasi 4 Kelompok (Bergantian Setiap Pekan):
          </div>
          <div class="rotation-timeline">
            ${groups.map((g, idx) => {
              const isCurrent = g.id === activeGroup.id;
              return `
                <div class="rotation-step ${isCurrent ? 'active' : ''}">
                  <div class="step-num">${idx + 1}</div>
                  <div class="step-name">${g.nama}</div>
                  <div class="step-meta">${g.anggota.length} Petugas</div>
                  ${isCurrent ? '<div style="margin-top: 4px;"><span class="badge badge-success" style="font-size: 0.7rem;">Giliran Ini</span></div>' : ''}
                </div>
                ${idx < groups.length - 1 ? '<div class="rotation-arrow">➔</div>' : '<div class="rotation-arrow" style="font-size: 1rem;" title="Kembali ke Kelompok 1">🔁</div>'}
              `;
            }).join('')}
          </div>
        </div>

        <!-- FEATURED ACTIVE DUTY CARD -->
        <div class="duty-hero-card">
          <div style="display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem;">
            <div>
              <div class="duty-live-badge">
                <span class="pulse-dot"></span>
                <span>PETUGAS PENANGGUNG JAWAB MINGGU INI</span>
              </div>
              <h3 style="font-size: 1.75rem; font-weight: 800; color: var(--primary-800); margin: 0.25rem 0; letter-spacing: -0.01em;">
                ${activeGroup.nama.toUpperCase()}
              </h3>
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; font-size: 0.9375rem; color: var(--text-secondary); margin-top: 0.35rem;">
                <span>📅 <strong>Minggu, 23 Agustus 2026</strong></span>
                <span>•</span>
                <span>🌙 <strong>Malam Minggu</strong></span>
                <span>•</span>
                <span>🏘️ <strong>40 KK Warga</strong></span>
              </div>
            </div>

            <div style="background: var(--bg-card); border: 2px solid var(--primary-500); padding: 0.875rem 1.25rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); text-align: right;">
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
                Pedoman Nominal
              </div>
              <div style="font-size: 1.125rem; font-weight: 800; color: var(--primary-700); margin-top: 2px;">
                Jimpitan ≥ Rp 3.000
              </div>
              <div style="font-size: 0.75rem; color: var(--accent-purple); font-weight: 700;">
                Tabungan: Bebas (Rp 0, 5k, 10k, dst)
              </div>
            </div>
          </div>

          <!-- WEATHER FALLBACK NOTE -->
          <div style="background: rgba(59, 130, 246, 0.08); border-left: 4px solid #3b82f6; padding: 0.75rem 1rem; border-radius: 0 var(--radius-md) var(--radius-md) 0; margin-bottom: 1.25rem; font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5;">
            🌧️ <strong>Ketentuan Cuaca / Halangan:</strong> Jika terjadi hujan lebat atau halangan pada Malam Minggu, pengambilan jimpitan dialihkan ke <strong>Malam Senin</strong> dengan penanggung jawab tetap <strong>${activeGroup.nama}</strong> (tidak berganti kelompok).
          </div>

          <!-- MEMBER AVATAR CHIPS -->
          <div>
            <div style="font-size: 0.8125rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">
              👥 Daftar Anggota Petugas yang Bertugas (${activeGroup.anggota.length} Pemuda):
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.625rem;">
              ${activeGroup.anggota.map((nama, idx) => `
                <div class="member-chip-modern">
                  <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--primary-600); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800;">
                    ${nama.charAt(0).toUpperCase()}
                  </div>
                  <span>${nama}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 4 GROUPS GRID DETAILS -->
        <div style="margin-top: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.125rem; font-weight: 800; color: var(--text-primary);">
              👥 Rincian Seluruh 4 Kelompok Petugas Dusun Kiyudan
            </h3>
            <span style="font-size: 0.8125rem; color: var(--text-muted);">Total 23 Pemuda</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem;">
            ${groups.map(g => {
              const isCurrent = g.id === activeGroup.id;
              return `
                <div style="background: var(--bg-card); border: 2px solid ${isCurrent ? 'var(--primary-500)' : 'var(--border-color)'}; border-radius: var(--radius-lg); padding: 1.25rem; box-shadow: ${isCurrent ? 'var(--shadow-md)' : 'var(--shadow-sm)'}; position: relative; transition: all var(--transition-normal);">
                  ${isCurrent ? '<span class="badge badge-success" style="position: absolute; top: 1rem; right: 1rem;">Giliran Aktif</span>' : ''}
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                    <div style="width: 32px; height: 32px; border-radius: var(--radius-sm); background: ${isCurrent ? 'var(--primary-600)' : 'var(--bg-card-subtle)'}; color: ${isCurrent ? '#fff' : 'var(--primary-800)'}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.875rem;">
                      ${g.nomor}
                    </div>
                    <div>
                      <h4 style="font-size: 1rem; font-weight: 800; color: var(--primary-800);">${g.nama}</h4>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${g.anggota.length} Anggota Pemuda</div>
                    </div>
                  </div>

                  <div style="display: flex; flex-direction: column; gap: 0.35rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
                    ${g.anggota.map((nama, i) => `
                      <div style="font-size: 0.8125rem; display: flex; justify-content: space-between; align-items: center; padding: 0.2rem 0;">
                        <span style="color: var(--text-secondary);"><strong>${i + 1}.</strong> ${nama}</span>
                        ${isCurrent ? '<span style="color: var(--primary-600); font-size: 0.75rem;">●</span>' : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- PENASEHAT DUSUN STRIP -->
        <div style="margin-top: 1.75rem; background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.04)); border: 1px solid #fde68a; padding: 1rem 1.5rem; border-radius: var(--radius-lg); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.5rem;">⭐</span>
            <div>
              <div style="font-size: 0.75rem; font-weight: 800; color: var(--accent-amber); text-transform: uppercase;">
                Pembina & Penasehat Jimpitan Dusun:
              </div>
              <div style="font-size: 0.9375rem; font-weight: 700; color: var(--text-primary); margin-top: 2px;">
                ${penasehat.map(p => `<span>${p}</span>`).join(' • ')}
              </div>
            </div>
          </div>
          <span class="badge badge-warning" style="font-size: 0.75rem;">Dusun Kiyudan</span>
        </div>
      </div>

      <!-- GRAFIK PEMASUKAN JIMPITAN -->
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">📊 Tren Transparansi Jimpitan Bulanan</h2>
            <p class="card-subtitle">Rekapitulasi pemasukan jimpitan yang dibagi 50% Kas Pemuda & 50% Kas Dusun</p>
          </div>
        </div>
        <div style="height: 280px; position: relative; width: 100%;">
          <canvas id="publicChartCanvas"></canvas>
        </div>
      </div>
    </div>
  `;
}

export function initPublicHomeCharts() {
  const ctx = document.getElementById('publicChartCanvas');
  if (!ctx) return;

  if (window.publicChartInstance) {
    window.publicChartInstance.destroy();
  }

  // Data bulan Januari - Agustus 2026
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt'];
  const dataJimpitan = [520000, 540000, 510000, 560000, 530000, 580000, 550000, 595000];
  const dataTabungan = [1800000, 1950000, 1750000, 2100000, 1900000, 2200000, 2050000, 2300000];

  window.publicChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Total Jimpitan (Rp)',
          data: dataJimpitan,
          backgroundColor: '#059669',
          borderRadius: 6
        },
        {
          label: 'Total Tabungan Warga (Rp)',
          data: dataTabungan,
          backgroundColor: '#8b5cf6',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: Rp ${context.raw.toLocaleString('id-ID')}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(val) {
              return 'Rp ' + (val / 1000) + 'k';
            }
          }
        }
      }
    }
  });
}
