// Main Application Router & State Controller
import { db } from './db.js';
import { auth } from './auth.js';
import { renderPublicHome, initPublicHomeCharts } from './views/publicHome.js';
import { renderPublicCek, publicCekModule } from './views/publicCek.js';
import { renderPublicLaporan, publicLaporanModule } from './views/publicLaporan.js';
import { renderAdminDash } from './views/adminDash.js';
import { renderPengambilan, pengambilanModule } from './views/pengambilan.js';
import { renderMasterWarga, masterWargaModule } from './views/masterWarga.js';
import { renderMasterKelompok, masterKelompokModule } from './views/masterKelompok.js';
import { renderKeuangan, keuanganModule } from './views/keuangan.js';
import { renderLaporan, laporanModule } from './views/laporan.js';
import { renderPembukuan, pembukuanModule } from './views/pembukuan.js';
import { renderSettings, settingsModule } from './views/settings.js';

// Expose modules to global window for inline onclick handlers
window.publicCekModule = publicCekModule;
window.publicLaporanModule = publicLaporanModule;
window.pengambilanModule = pengambilanModule;
window.masterWargaModule = masterWargaModule;
window.masterKelompokModule = masterKelompokModule;
window.keuanganModule = keuanganModule;
window.laporanModule = laporanModule;
window.pembukuanModule = pembukuanModule;
window.settingsModule = settingsModule;

class App {
  constructor() {
    this.currentRoute = '#/';
    this.modalCallback = null;
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRouting());
    window.addEventListener('DOMContentLoaded', () => {
      this.initTheme();
      this.handleRouting();
    });
  }

  initTheme() {
    const savedTheme = localStorage.getItem('kiyudan_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeButton(savedTheme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('kiyudan_theme', next);
    this.updateThemeButton(next);
  }

  updateThemeButton(theme) {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      btn.title = theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap';
    }
  }

  handleRouting() {
    let hash = window.location.hash || '#/';
    this.currentRoute = hash;

    // Check Admin Protected Routes
    const adminRoutes = ['#/admin', '#/pengambilan', '#/master-warga', '#/master-kelompok', '#/keuangan', '#/laporan', '#/pembukuan', '#/settings'];
    if (adminRoutes.includes(hash) && !auth.isLoggedIn()) {
      window.location.hash = '#/login';
      return;
    }

    this.updateNavbar();
    this.renderCurrentView();
  }

  updateNavbar() {
    const navMenu = document.getElementById('navMenu');
    const authActions = document.getElementById('authHeaderActions');
    const isLoggedIn = auth.isLoggedIn();

    if (!navMenu || !authActions) return;

    if (isLoggedIn) {
      navMenu.innerHTML = `
        <li><a class="nav-link ${this.currentRoute === '#/admin' ? 'active' : ''}" href="#/admin">📊 Dashboard</a></li>
        <li><a class="nav-link ${this.currentRoute === '#/pengambilan' ? 'active' : ''}" href="#/pengambilan">⚡ Pengambilan</a></li>
        <li><a class="nav-link ${this.currentRoute === '#/master-warga' ? 'active' : ''}" href="#/master-warga">👥 Warga</a></li>
        <li><a class="nav-link ${this.currentRoute === '#/master-kelompok' ? 'active' : ''}" href="#/master-kelompok">🔄 Kelompok</a></li>
        <li><a class="nav-link ${this.currentRoute === '#/keuangan' ? 'active' : ''}" href="#/keuangan">💰 Keuangan</a></li>
        <li><a class="nav-link ${this.currentRoute === '#/laporan' ? 'active' : ''}" href="#/laporan">📊 Laporan</a></li>
        <li><a class="nav-link ${this.currentRoute === '#/pembukuan' ? 'active' : ''}" href="#/pembukuan">📚 Pembukuan</a></li>
      `;

      authActions.innerHTML = `
        <button class="btn btn-sm btn-secondary" onclick="window.location.hash = '#/'" title="Buka Portal Publik">
          🌐 Publik
        </button>
        <button class="btn btn-sm btn-secondary" onclick="window.location.hash = '#/settings'" title="Pengaturan & Audit">
          ⚙️
        </button>
        <button class="btn btn-sm btn-danger" onclick="app.handleLogout()">
          🚪 Keluar
        </button>
      `;
    } else {
      navMenu.innerHTML = `
        <li><a class="nav-link ${this.currentRoute === '#/' ? 'active' : ''}" href="#/">🏠 Beranda</a></li>
        <li><a class="nav-link ${this.currentRoute === '#/laporan-publik' ? 'active' : ''}" href="#/laporan-publik">📊 Transparansi & Laporan</a></li>
        <li><a class="nav-link ${this.currentRoute === '#/cek-tabungan' ? 'active' : ''}" href="#/cek-tabungan">🔎 Cek Tabungan Warga</a></li>
      `;

      authActions.innerHTML = `
        <button class="btn btn-sm btn-primary" onclick="window.location.hash = '#/login'">
          🔐 Login Admin
        </button>
      `;
    }
  }

  renderCurrentView() {
    const main = document.getElementById('mainContent');
    if (!main) return;

    window.scrollTo(0, 0);

    switch (this.currentRoute) {
      case '#/':
        main.innerHTML = renderPublicHome();
        setTimeout(() => initPublicHomeCharts(), 50);
        break;
      case '#/laporan-publik':
        main.innerHTML = renderPublicLaporan();
        break;
      case '#/cek-tabungan':
        main.innerHTML = renderPublicCek();
        break;
      case '#/login':
        main.innerHTML = this.renderLoginView();
        break;
      case '#/admin':
        main.innerHTML = renderAdminDash();
        break;
      case '#/pengambilan':
        main.innerHTML = renderPengambilan();
        break;
      case '#/master-warga':
        main.innerHTML = renderMasterWarga();
        break;
      case '#/master-kelompok':
        main.innerHTML = renderMasterKelompok();
        break;
      case '#/keuangan':
        main.innerHTML = renderKeuangan();
        break;
      case '#/laporan':
        main.innerHTML = renderLaporan();
        break;
      case '#/pembukuan':
        main.innerHTML = renderPembukuan();
        break;
      case '#/settings':
        main.innerHTML = renderSettings();
        break;
      default:
        main.innerHTML = renderPublicHome();
        setTimeout(() => initPublicHomeCharts(), 50);
    }
  }

  renderLoginView() {
    return `
      <div style="max-width: 420px; margin: 2rem auto;">
        <div class="card" style="padding: 2rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-xl);">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <img src="assets/img/logo_kiyudan.jpg" alt="Logo" style="width: 75px; height: 75px; border-radius: var(--radius-lg); border: 2px solid var(--primary-500); margin-bottom: 0.75rem;">
            <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--primary-800);">LOGIN ADMIN PANEL</h2>
            <p style="font-size: 0.8125rem; color: var(--text-secondary);">Sistem Digital Jimpitan Dusun Kiyudan</p>
          </div>

          <div id="loginErrorMsg" style="display: none; background: #fee2e2; border: 1px solid #fecaca; color: #991b1b; padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.8125rem; margin-bottom: 1rem;"></div>

          <form onsubmit="event.preventDefault(); app.handleLogin();">
            <div class="form-group">
              <label class="form-label">Username:</label>
              <input type="text" id="loginUsername" class="form-control" placeholder="gemukireng" value="gemukireng" required autocomplete="username">
            </div>

            <div class="form-group">
              <label class="form-label">Password:</label>
              <input type="password" id="loginPassword" class="form-control" placeholder="••••••••" value="kiyudan123" required autocomplete="current-password">
              <p class="input-help">Akun bawaan: <code>gemukireng</code> / <code>kiyudan123</code></p>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 0.75rem;">
              🚀 Masuk ke Sistem
            </button>
          </form>

          <div style="text-align: center; margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <button class="btn btn-secondary btn-sm" onclick="window.location.hash = '#/'">
              ← Kembali ke Halaman Publik
            </button>
          </div>
        </div>
      </div>
    `;
  }

  handleLogin() {
    const user = document.getElementById('loginUsername')?.value;
    const pass = document.getElementById('loginPassword')?.value;
    const errBox = document.getElementById('loginErrorMsg');

    const res = auth.login(user, pass);
    if (res.success) {
      this.showToast('Selamat datang, Admin!');
      window.location.hash = '#/admin';
    } else {
      if (errBox) {
        errBox.innerText = res.message;
        errBox.style.display = 'block';
      }
    }
  }

  handleLogout() {
    this.showConfirmModal({
      title: 'Konfirmasi Keluar',
      message: 'Apakah Anda yakin ingin keluar dari Admin Panel?',
      confirmText: 'Ya, Keluar',
      onConfirm: () => {
        auth.logout();
        this.showToast('Anda telah keluar dari sistem.');
        window.location.hash = '#/';
      }
    });
  }

  // --- MODAL DIALOG ENGINE ---
  showConfirmModal({ title, message, confirmText = 'Ya, Lanjutkan', cancelText = 'Batal', onConfirm, onCancel }) {
    const backdrop = document.getElementById('globalModalBackdrop');
    const header = document.getElementById('globalModalTitle');
    const body = document.getElementById('globalModalBody');
    const footer = document.getElementById('globalModalFooter');

    if (!backdrop || !header || !body || !footer) return;

    header.innerText = title;
    body.innerHTML = `<div style="font-size: 0.9375rem; line-height: 1.5;">${message}</div>`;

    footer.innerHTML = `
      <button class="btn btn-secondary" id="modalCancelBtn">${cancelText}</button>
      <button class="btn btn-primary" id="modalConfirmBtn">${confirmText}</button>
    `;

    backdrop.classList.add('open');

    document.getElementById('modalCancelBtn').onclick = () => {
      backdrop.classList.remove('open');
      if (onCancel) onCancel();
    };

    document.getElementById('modalConfirmBtn').onclick = () => {
      backdrop.classList.remove('open');
      if (onConfirm) onConfirm();
    };
  }

  showAlertModal({ title, message, type = 'info', onClose }) {
    const backdrop = document.getElementById('globalModalBackdrop');
    const header = document.getElementById('globalModalTitle');
    const body = document.getElementById('globalModalBody');
    const footer = document.getElementById('globalModalFooter');

    if (!backdrop || !header || !body || !footer) return;

    header.innerText = title;
    body.innerHTML = `
      <div style="display: flex; gap: 1rem; align-items: flex-start;">
        <span style="font-size: 2rem;">${type === 'danger' ? '❌' : (type === 'warning' ? '⚠️' : 'ℹ️')}</span>
        <div style="font-size: 0.9375rem; line-height: 1.5;">${message}</div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-primary" id="modalAlertCloseBtn">Mengerti</button>
    `;

    backdrop.classList.add('open');

    document.getElementById('modalAlertCloseBtn').onclick = () => {
      backdrop.classList.remove('open');
      if (onClose) onClose();
    };
  }

  showCustomModal({ title, bodyHtml, confirmText = 'Simpan', cancelText = 'Batal', onConfirm, onCancel, modalClass = '' }) {
    const backdrop = document.getElementById('globalModalBackdrop');
    const box = document.getElementById('globalModalBox');
    const header = document.getElementById('globalModalTitle');
    const body = document.getElementById('globalModalBody');
    const footer = document.getElementById('globalModalFooter');

    if (!backdrop || !header || !body || !footer) return;

    if (modalClass) box.className = `modal-box ${modalClass}`;
    else box.className = 'modal-box';

    header.innerText = title;
    body.innerHTML = bodyHtml;

    footer.innerHTML = `
      <button class="btn btn-secondary" id="modalCustomCancel">${cancelText}</button>
      <button class="btn btn-primary" id="modalCustomConfirm">${confirmText}</button>
    `;

    backdrop.classList.add('open');

    document.getElementById('modalCustomCancel').onclick = () => {
      backdrop.classList.remove('open');
      if (onCancel) onCancel();
    };

    document.getElementById('modalCustomConfirm').onclick = () => {
      let shouldClose = true;
      if (onConfirm) {
        const result = onConfirm();
        if (result === false) shouldClose = false;
      }
      if (shouldClose) backdrop.classList.remove('open');
    };
  }

  closeGlobalModal() {
    const backdrop = document.getElementById('globalModalBackdrop');
    if (backdrop) backdrop.classList.remove('open');
  }

  // --- EVENT MODALS (23 AGUSTUS 2026) ---
  showEventModal(type) {
    const isPoster = type === 'poster';
    const title = isPoster 
      ? 'Poster Acara: Jalan Santai HUT RI ke-81 (23 Agustus 2026)' 
      : 'Rundown Lengkap Acara Jalan Santai (23 Agustus 2026)';
    const imgSrc = isPoster 
      ? 'assets/img/banner_event_23agus.jpg' 
      : 'assets/img/rundown_event_23agus.jpg';

    const html = `
      <div style="text-align: center;">
        <img src="${imgSrc}" alt="${title}" style="max-width: 100%; height: auto; max-height: 75vh; border-radius: var(--radius-md); box-shadow: var(--shadow-md);">
        <div style="margin-top: 1rem; display: flex; justify-content: center; gap: 0.5rem;">
          <a href="${imgSrc}" download="${type}_event_23agus.jpg" class="btn btn-secondary btn-sm">
            💾 Unduh Gambar
          </a>
        </div>
      </div>
    `;

    this.showCustomModal({
      title,
      bodyHtml: html,
      confirmText: 'Tutup',
      cancelText: '',
      modalClass: 'modal-lg',
      onConfirm: () => true
    });
  }

  // --- UNIVERSAL PDF DOWNLOAD & PRINT HELPER ---
  downloadPDFFromContainer(filename = 'Laporan_Jimpitan_Kiyudan.pdf') {
    const srcElement = document.getElementById('print-container');
    if (!srcElement) return;

    // Set document title so browser "Save as PDF" automatically uses this filename
    const cleanTitle = filename.replace(/\.pdf$/i, '');
    document.title = cleanTitle;

    this.showToast('💡 Pada menu cetak, pilih "Simpan sebagai PDF" (Save as PDF) untuk mengunduh.');

    setTimeout(() => {
      window.print();
    }, 200);
  }

  // --- TOAST NOTIFICATIONS ---
  showToast(message) {
    const toast = document.getElementById('appToast');
    if (!toast) return;
    toast.innerText = message;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.style.display = 'none', 300);
    }, 3000);
  }
}

export const app = new App();
window.app = app;
