// Database Engine & LocalStorage Manager untuk Sistem Jimpitan Kiyudan
import { initialWarga } from './data/initialWarga.js';
import { initialGroups, initialPenasehat } from './data/initialGroups.js';

const STORAGE_KEYS = {
  WARGA: 'kiyudan_warga',
  GROUPS: 'kiyudan_groups',
  PENASEHAT: 'kiyudan_penasehat',
  PEMBUKUAN: 'kiyudan_pembukuan',
  ACTIVE_PEMBUKUAN_ID: 'kiyudan_active_pembukuan_id',
  PENGAMBILAN: 'kiyudan_pengambilan',
  TRANSAKSI: 'kiyudan_transaksi',
  KAS_PEMUDA: 'kiyudan_kas_pemuda',
  KAS_DUSUN: 'kiyudan_kas_dusun',
  PENGELUARAN: 'kiyudan_pengeluaran',
  AUDIT_LOG: 'kiyudan_audit_log',
  ADMIN_AUTH: 'kiyudan_admin_auth',
  APP_CONFIG: 'kiyudan_app_config'
};

export class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.WARGA)) {
      this.seedInitialData();
    }
  }

  // --- SEEDER ---
  seedInitialData() {
    // 1. Warga
    localStorage.setItem(STORAGE_KEYS.WARGA, JSON.stringify(initialWarga));

    // 2. Kelompok & Penasehat
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(initialGroups));
    localStorage.setItem(STORAGE_KEYS.PENASEHAT, JSON.stringify(initialPenasehat));

    // 3. Pembukuan
    const initialPembukuan = [
      {
        id: 'PBK-2026',
        nama: 'Pembukuan 2026',
        tahun: 2026,
        tanggal_mulai: '2026-01-01',
        tanggal_selesai: '2026-12-31',
        status: 'aktif',
        saldo_awal_pemuda: 1500000,
        saldo_awal_dusun: 3000000,
        created_at: '2026-01-01T00:00:00Z'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PEMBUKUAN, JSON.stringify(initialPembukuan));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PEMBUKUAN_ID, 'PBK-2026');

    // 4. Sample Past Pengambilan (16 Agustus 2026 - Kelompok 3)
    const samplePengambilan = [
      {
        id: 'JMP-2026-001',
        pembukuan_id: 'PBK-2026',
        kode_pengambilan: 'JMP-2026-001',
        tanggal: '2026-08-02',
        hari: 'Malam Minggu',
        kelompok_id: 'kelompok-1',
        kelompok_nama: 'Kelompok Satu',
        petugas: ['Armi', 'Apep', 'Fadel', 'Khabib', 'Uzik', 'Ihsan'],
        status: 'POSTED',
        total_jimpitan: 135000,
        total_tabungan: 450000,
        total_sistem: 585000,
        uang_fisik: 585000,
        selisih: 0,
        catatan_audit: '',
        warga_dicatat_count: 40,
        total_warga_count: 40,
        created_at: '2026-08-02T22:30:00Z'
      },
      {
        id: 'JMP-2026-002',
        pembukuan_id: 'PBK-2026',
        kode_pengambilan: 'JMP-2026-002',
        tanggal: '2026-08-09',
        hari: 'Malam Minggu',
        kelompok_id: 'kelompok-2',
        kelompok_nama: 'Kelompok Dua',
        petugas: ['Iwan', 'Humam', 'Kusnadi', 'Feri', "Pi'i", 'Harno'],
        status: 'POSTED',
        total_jimpitan: 140000,
        total_tabungan: 520000,
        total_sistem: 660000,
        uang_fisik: 660000,
        selisih: 0,
        catatan_audit: '',
        warga_dicatat_count: 40,
        total_warga_count: 40,
        created_at: '2026-08-09T22:30:00Z'
      },
      {
        id: 'JMP-2026-003',
        pembukuan_id: 'PBK-2026',
        kode_pengambilan: 'JMP-2026-003',
        tanggal: '2026-08-16',
        hari: 'Malam Minggu',
        kelompok_id: 'kelompok-3',
        kelompok_nama: 'Kelompok Tiga',
        petugas: ['Zazed', 'Alfin', 'Udin', 'Syahrul', 'Syarif'],
        status: 'POSTED',
        total_jimpitan: 138000,
        total_tabungan: 490000,
        total_sistem: 628000,
        uang_fisik: 628000,
        selisih: 0,
        catatan_audit: '',
        warga_dicatat_count: 40,
        total_warga_count: 40,
        created_at: '2026-08-16T22:30:00Z'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PENGAMBILAN, JSON.stringify(samplePengambilan));

    // 5. Sample Transaksi Warga
    const sampleTransaksi = [];
    initialWarga.forEach((w, idx) => {
      // Minggu 1 (02 Ags)
      sampleTransaksi.push({
        id: `TRX-20260802-${w.kode_warga}`,
        pengambilan_id: 'JMP-2026-001',
        pembukuan_id: 'PBK-2026',
        warga_id: w.id,
        kode_warga: w.kode_warga,
        nama_warga: w.nama,
        tanggal: '2026-08-02',
        jimpitan: 3000 + (idx % 3 === 0 ? 2000 : 0),
        tabungan: (idx % 2 === 0 ? 10000 : (idx % 3 === 0 ? 20000 : 5000)),
        total: (3000 + (idx % 3 === 0 ? 2000 : 0)) + (idx % 2 === 0 ? 10000 : (idx % 3 === 0 ? 20000 : 5000)),
        status: 'Sudah Setor',
        catatan: '',
        koreksi_histori: []
      });
      // Minggu 2 (09 Ags)
      sampleTransaksi.push({
        id: `TRX-20260809-${w.kode_warga}`,
        pengambilan_id: 'JMP-2026-002',
        pembukuan_id: 'PBK-2026',
        warga_id: w.id,
        kode_warga: w.kode_warga,
        nama_warga: w.nama,
        tanggal: '2026-08-09',
        jimpitan: 3000 + (idx % 4 === 0 ? 2000 : 0),
        tabungan: (idx % 2 === 0 ? 15000 : 10000),
        total: (3000 + (idx % 4 === 0 ? 2000 : 0)) + (idx % 2 === 0 ? 15000 : 10000),
        status: 'Sudah Setor',
        catatan: '',
        koreksi_histori: []
      });
      // Minggu 3 (16 Ags)
      sampleTransaksi.push({
        id: `TRX-20260816-${w.kode_warga}`,
        pengambilan_id: 'JMP-2026-003',
        pembukuan_id: 'PBK-2026',
        warga_id: w.id,
        kode_warga: w.kode_warga,
        nama_warga: w.nama,
        tanggal: '2026-08-16',
        jimpitan: 3000,
        tabungan: (idx % 5 === 0 ? 50000 : (idx % 2 === 0 ? 20000 : 10000)),
        total: 3000 + (idx % 5 === 0 ? 50000 : (idx % 2 === 0 ? 20000 : 10000)),
        status: 'Sudah Setor',
        catatan: '',
        koreksi_histori: []
      });
    });
    localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify(sampleTransaksi));

    // 6. Kas Pemuda
    const sampleKasPemuda = [
      {
        id: 'KP-001',
        pembukuan_id: 'PBK-2026',
        tanggal: '2026-01-01',
        jenis: 'masuk',
        sumber: 'Saldo Awal',
        kategori: 'Saldo Awal',
        nominal: 1500000,
        keterangan: 'Saldo awal pembukuan tahun 2026',
        petugas: 'Admin'
      },
      {
        id: 'KP-002',
        pembukuan_id: 'PBK-2026',
        tanggal: '2026-08-02',
        jenis: 'masuk',
        sumber: 'Jimpitan 50%',
        kategori: 'Jimpitan Mingguan',
        nominal: 67500,
        keterangan: 'Bagian 50% Jimpitan 02 Ags 2026 (Kelompok 1)',
        petugas: 'Kelompok Satu'
      },
      {
        id: 'KP-003',
        pembukuan_id: 'PBK-2026',
        tanggal: '2026-08-09',
        jenis: 'masuk',
        sumber: 'Jimpitan 50%',
        kategori: 'Jimpitan Mingguan',
        nominal: 70000,
        keterangan: 'Bagian 50% Jimpitan 09 Ags 2026 (Kelompok 2)',
        petugas: 'Kelompok Dua'
      },
      {
        id: 'KP-004',
        pembukuan_id: 'PBK-2026',
        tanggal: '2026-08-16',
        jenis: 'masuk',
        sumber: 'Jimpitan 50%',
        kategori: 'Jimpitan Mingguan',
        nominal: 69000,
        keterangan: 'Bagian 50% Jimpitan 16 Ags 2026 (Kelompok 3)',
        petugas: 'Kelompok Tiga'
      },
      {
        id: 'KP-005',
        pembukuan_id: 'PBK-2026',
        tanggal: '2026-08-15',
        jenis: 'keluar',
        sumber: 'Pengeluaran',
        kategori: 'Kegiatan HUT RI',
        nominal: 350000,
        keterangan: 'Pembelian perlengkapan & hadiah lomba 17 Agustus',
        petugas: 'Panitia 17-an'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.KAS_PEMUDA, JSON.stringify(sampleKasPemuda));

    // 7. Kas Dusun
    const sampleKasDusun = [
      {
        id: 'KD-001',
        pembukuan_id: 'PBK-2026',
        tanggal: '2026-01-01',
        jenis: 'masuk',
        sumber: 'Saldo Awal',
        kategori: 'Saldo Awal',
        nominal: 3000000,
        keterangan: 'Saldo awal kas dusun 2026',
        petugas: 'Admin'
      },
      {
        id: 'KD-002',
        pembukuan_id: 'PBK-2026',
        tanggal: '2026-08-02',
        jenis: 'masuk',
        sumber: 'Jimpitan 50%',
        kategori: 'Jimpitan Mingguan',
        nominal: 67500,
        keterangan: 'Bagian 50% Jimpitan 02 Ags 2026 (Kelompok 1)',
        petugas: 'Kelompok Satu'
      },
      {
        id: 'KD-003',
        pembukuan_id: 'PBK-2026',
        tanggal: '2026-08-09',
        jenis: 'masuk',
        sumber: 'Jimpitan 50%',
        kategori: 'Jimpitan Mingguan',
        nominal: 70000,
        keterangan: 'Bagian 50% Jimpitan 09 Ags 2026 (Kelompok 2)',
        petugas: 'Kelompok Dua'
      },
      {
        id: 'KD-004',
        pembukuan_id: 'PBK-2026',
        tanggal: '2026-08-16',
        jenis: 'masuk',
        sumber: 'Jimpitan 50%',
        kategori: 'Jimpitan Mingguan',
        nominal: 69000,
        keterangan: 'Bagian 50% Jimpitan 16 Ags 2026 (Kelompok 3)',
        petugas: 'Kelompok Tiga'
      },
      {
        id: 'KD-005',
        pembukuan_id: 'PBK-2026',
        tanggal: '2026-08-10',
        jenis: 'keluar',
        sumber: 'Pengeluaran',
        kategori: 'Penerangan Jalan',
        nominal: 200000,
        keterangan: 'Perbaikan lampu jalan pos ronda & gang RT',
        petugas: 'Sie Pembangunan'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.KAS_DUSUN, JSON.stringify(sampleKasDusun));

    // 8. Audit Log
    const sampleAudit = [
      {
        id: 'AUD-001',
        timestamp: '2026-08-16T22:35:00Z',
        admin: 'gemukireng',
        aktivitas: 'Posting Pengambilan Jimpitan',
        detail: 'Mengesahkan pengambilan JMP-2026-003 Kelompok Tiga total Rp628.000',
        tipe: 'info'
      },
      {
        id: 'AUD-002',
        timestamp: '2026-08-15T14:20:00Z',
        admin: 'gemukireng',
        aktivitas: 'Tambah Pengeluaran Kas Pemuda',
        detail: 'Pengeluaran Rp350.000 kategori Kegiatan HUT RI',
        tipe: 'warning'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(sampleAudit));

    // 9. Admin Default Auth
    const defaultAuth = {
      username: 'gemukireng',
      password: 'kiyudan123'
    };
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(defaultAuth));

    // 10. Config
    const config = {
      nama_dusun: 'Dusun Kiyudan',
      desa: 'Desa Majaksingi',
      kecamatan: 'Kecamatan Borobudur',
      slogan: 'Guyub Rukun Maju Bersama',
      minimal_jimpitan: 3000,
      persen_pemuda: 50,
      persen_dusun: 50
    };
    localStorage.setItem(STORAGE_KEYS.APP_CONFIG, JSON.stringify(config));
  }

  // --- WARGA CRUD ---
  getWarga() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WARGA) || '[]');
  }

  saveWargaList(list) {
    localStorage.setItem(STORAGE_KEYS.WARGA, JSON.stringify(list));
  }

  addWarga(wargaData) {
    const list = this.getWarga();
    const nextNum = list.length + 1;
    const kode = wargaData.kode_warga || `KDY-${String(nextNum).padStart(3, '0')}`;
    const newW = {
      id: `warga-${Date.now()}`,
      kode_warga: kode,
      nama: wargaData.nama.trim(),
      status: wargaData.status || 'Aktif',
      keterangan: wargaData.keterangan || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    list.push(newW);
    this.saveWargaList(list);
    return newW;
  }

  updateWarga(id, updatedFields) {
    const list = this.getWarga();
    const idx = list.findIndex(w => w.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      ...updatedFields,
      updated_at: new Date().toISOString()
    };
    this.saveWargaList(list);
    return list[idx];
  }

  toggleStatusWarga(id) {
    const list = this.getWarga();
    const idx = list.findIndex(w => w.id === id);
    if (idx === -1) return null;
    list[idx].status = list[idx].status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
    list[idx].updated_at = new Date().toISOString();
    this.saveWargaList(list);
    return list[idx];
  }

  // --- KELOMPOK & PENASEHAT ---
  getGroups() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GROUPS) || '[]');
  }

  saveGroups(groups) {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  }

  getPenasehat() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PENASEHAT) || '[]');
  }

  savePenasehat(penasehat) {
    localStorage.setItem(STORAGE_KEYS.PENASEHAT, JSON.stringify(penasehat));
  }

  // --- PEMBUKUAN ---
  getPembukuanList() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PEMBUKUAN) || '[]');
  }

  savePembukuanList(list) {
    localStorage.setItem(STORAGE_KEYS.PEMBUKUAN, JSON.stringify(list));
  }

  getActivePembukuanId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PEMBUKUAN_ID) || 'PBK-2026';
  }

  setActivePembukuanId(id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PEMBUKUAN_ID, id);
  }

  getActivePembukuan() {
    const list = this.getPembukuanList();
    const activeId = this.getActivePembukuanId();
    return list.find(p => p.id === activeId) || list[0];
  }

  createPembukuan(data) {
    const list = this.getPembukuanList();
    // archive previous active ones
    list.forEach(p => {
      if (p.status === 'aktif') p.status = 'arsip';
    });

    const newPbk = {
      id: `PBK-${data.tahun || Date.now()}`,
      nama: data.nama || `Pembukuan ${data.tahun}`,
      tahun: parseInt(data.tahun),
      tanggal_mulai: data.tanggal_mulai,
      tanggal_selesai: data.tanggal_selesai,
      status: 'aktif',
      saldo_awal_pemuda: parseFloat(data.saldo_awal_pemuda) || 0,
      saldo_awal_dusun: parseFloat(data.saldo_awal_dusun) || 0,
      created_at: new Date().toISOString()
    };
    list.unshift(newPbk);
    this.savePembukuanList(list);
    this.setActivePembukuanId(newPbk.id);
    return newPbk;
  }

  // --- PENGAMBILAN JIMPITAN ---
  getPengambilanList() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PENGAMBILAN) || '[]');
  }

  savePengambilanList(list) {
    localStorage.setItem(STORAGE_KEYS.PENGAMBILAN, JSON.stringify(list));
  }

  getPengambilanById(id) {
    const list = this.getPengambilanList();
    return list.find(p => p.id === id);
  }

  checkTanggalPengambilanExists(pembukuanId, tanggal, excludeId = null) {
    const list = this.getPengambilanList();
    return list.find(p => {
      if (p.pembukuan_id !== pembukuanId) return false;
      if (excludeId && p.id === excludeId) return false;
      return p.tanggal === tanggal;
    });
  }

  saveOrUpdatePengambilan(pengambilanObj) {
    const list = this.getPengambilanList();
    const idx = list.findIndex(p => p.id === pengambilanObj.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...pengambilanObj, updated_at: new Date().toISOString() };
    } else {
      list.unshift(pengambilanObj);
    }
    this.savePengambilanList(list);
    return pengambilanObj;
  }

  // --- TRANSAKSI WARGA ---
  getAllTransaksi() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSAKSI) || '[]');
  }

  saveAllTransaksi(list) {
    localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify(list));
  }

  getTransaksiByPengambilan(pengambilanId) {
    const all = this.getAllTransaksi();
    return all.filter(t => t.pengambilan_id === pengambilanId);
  }

  getTransaksiByWarga(wargaId, pembukuanId = null) {
    const all = this.getAllTransaksi();
    return all.filter(t => {
      const matchWarga = t.warga_id === wargaId || t.kode_warga === wargaId;
      if (!matchWarga) return false;
      if (pembukuanId && pembukuanId !== 'semua') {
        return t.pembukuan_id === pembukuanId;
      }
      return true;
    });
  }

  getSaldoTabunganWarga(wargaId, pembukuanId = null) {
    const trxList = this.getTransaksiByWarga(wargaId, pembukuanId);
    let total = 0;
    trxList.forEach(t => {
      if (t.status === 'Sudah Setor' && t.tabungan) {
        total += parseFloat(t.tabungan);
      }
      if (t.jenis === 'penarikan_tabungan') {
        total -= parseFloat(t.nominal || 0);
      }
      if (t.jenis === 'setoran_manual') {
        total += parseFloat(t.nominal || 0);
      }
    });
    return Math.max(0, total);
  }

  saveTransaksiBatch(trxArray) {
    const all = this.getAllTransaksi();
    trxArray.forEach(newTrx => {
      const idx = all.findIndex(t => t.id === newTrx.id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...newTrx };
      } else {
        all.push(newTrx);
      }
    });
    this.saveAllTransaksi(all);
  }

  updateTransaksi(id, updatedFields, reason = '', admin = 'gemukireng') {
    const all = this.getAllTransaksi();
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) return null;

    const oldTrx = { ...all[idx] };
    const historyEntry = {
      timestamp: new Date().toISOString(),
      admin,
      alasan: reason,
      sebelum: {
        jimpitan: oldTrx.jimpitan,
        tabungan: oldTrx.tabungan,
        total: oldTrx.total,
        status: oldTrx.status
      },
      sesudah: {
        jimpitan: updatedFields.jimpitan !== undefined ? updatedFields.jimpitan : oldTrx.jimpitan,
        tabungan: updatedFields.tabungan !== undefined ? updatedFields.tabungan : oldTrx.tabungan,
        total: updatedFields.total !== undefined ? updatedFields.total : oldTrx.total,
        status: updatedFields.status !== undefined ? updatedFields.status : oldTrx.status
      }
    };

    const koreksiHistori = oldTrx.koreksi_histori || [];
    koreksiHistori.push(historyEntry);

    all[idx] = {
      ...all[idx],
      ...updatedFields,
      koreksi_histori: koreksiHistori,
      updated_at: new Date().toISOString()
    };

    this.saveAllTransaksi(all);
    return all[idx];
  }

  // --- KOREKSI DATA POSTED DENGAN DAMPAK OTOMATIS KE KAS & AUDIT ---
  executeKoreksiTransaksi({ pengambilanId, trxId, updatedFields, reason, admin = 'gemukireng' }) {
    const allTrx = this.getAllTransaksi();
    const tIdx = allTrx.findIndex(t => t.id === trxId);
    if (tIdx === -1) throw new Error('Transaksi tidak ditemukan.');

    const oldTrx = { ...allTrx[tIdx] };
    const pSession = this.getPengambilanById(pengambilanId) || {};

    const oldJimp = oldTrx.status === 'Sudah Setor' ? (parseFloat(oldTrx.jimpitan) || 0) : 0;
    const oldTab = oldTrx.status === 'Sudah Setor' ? (parseFloat(oldTrx.tabungan) || 0) : 0;
    const oldTotal = oldTrx.status === 'Sudah Setor' ? (parseFloat(oldTrx.total) || 0) : 0;

    const newStatus = updatedFields.status !== undefined ? updatedFields.status : oldTrx.status;
    const newJimp = newStatus === 'Sudah Setor' ? (parseFloat(updatedFields.jimpitan !== undefined ? updatedFields.jimpitan : oldTrx.jimpitan) || 0) : 0;
    const newTab = newStatus === 'Sudah Setor' ? (parseFloat(updatedFields.tabungan !== undefined ? updatedFields.tabungan : oldTrx.tabungan) || 0) : 0;
    const newTotal = newStatus === 'Sudah Setor' ? (newJimp + newTab) : 0;

    const deltaJimp = newJimp - oldJimp;
    const deltaTab = newTab - oldTab;
    const deltaTotal = newTotal - oldTotal;

    const historyEntry = {
      timestamp: new Date().toISOString(),
      admin,
      alasan: reason,
      sebelum: {
        status: oldTrx.status,
        jimpitan: oldJimp,
        tabungan: oldTab,
        total: oldTotal
      },
      sesudah: {
        status: newStatus,
        jimpitan: newJimp,
        tabungan: newTab,
        total: newTotal
      },
      selisih: {
        jimpitan: deltaJimp,
        tabungan: deltaTab,
        total: deltaTotal
      }
    };

    const koreksiHistori = oldTrx.koreksi_histori || [];
    koreksiHistori.push(historyEntry);

    // Update Transaction
    allTrx[tIdx] = {
      ...allTrx[tIdx],
      ...updatedFields,
      status: newStatus,
      jimpitan: newJimp,
      tabungan: newTab,
      total: newTotal,
      koreksi_histori: koreksiHistori,
      updated_at: new Date().toISOString()
    };
    this.saveAllTransaksi(allTrx);

    // If Jimpitan changed on POSTED session: adjust Kas Pemuda (50%) & Kas Dusun (50%)
    if (pSession.status === 'POSTED' && deltaJimp !== 0) {
      const bagianKoreksi = Math.abs(deltaJimp * 0.5);
      const jenisKoreksi = deltaJimp > 0 ? 'masuk' : 'keluar';

      // 1. Kas Pemuda adjustment
      this.addKasPemudaEntry({
        pembukuan_id: pSession.pembukuan_id,
        tanggal: new Date().toISOString().split('T')[0],
        jenis: jenisKoreksi,
        sumber: 'Koreksi Jimpitan (50%)',
        kategori: 'Koreksi Transaksi',
        nominal: bagianKoreksi,
        keterangan: `Koreksi Jimpitan 50% ${oldTrx.nama_warga} (Pengambilan ${pSession.tanggal || ''}): ${deltaJimp > 0 ? '+' : '-'}${bagianKoreksi.toLocaleString('id-ID')}. Alasan: "${reason}"`,
        petugas: admin
      });

      // 2. Kas Dusun adjustment
      this.addKasDusunEntry({
        pembukuan_id: pSession.pembukuan_id,
        tanggal: new Date().toISOString().split('T')[0],
        jenis: jenisKoreksi,
        sumber: 'Koreksi Jimpitan (50%)',
        kategori: 'Koreksi Transaksi',
        nominal: bagianKoreksi,
        keterangan: `Koreksi Jimpitan 50% ${oldTrx.nama_warga} (Pengambilan ${pSession.tanggal || ''}): ${deltaJimp > 0 ? '+' : '-'}${bagianKoreksi.toLocaleString('id-ID')}. Alasan: "${reason}"`,
        petugas: admin
      });
    }

    // Re-aggregate Pengambilan Session Totals
    const sessionTrx = allTrx.filter(t => t.pengambilan_id === pengambilanId);
    let sJimp = 0;
    let sTab = 0;
    let sSetorCount = 0;
    sessionTrx.forEach(t => {
      if (t.status === 'Sudah Setor') {
        sJimp += (parseFloat(t.jimpitan) || 0);
        sTab += (parseFloat(t.tabungan) || 0);
        sSetorCount++;
      }
    });

    const updatedSession = {
      ...pSession,
      total_jimpitan: sJimp,
      total_tabungan: sTab,
      total_sistem: sJimp + sTab,
      warga_dicatat_count: sSetorCount,
      koreksi_count: (pSession.koreksi_count || 0) + 1,
      last_koreksi_at: new Date().toISOString(),
      last_koreksi_reason: reason,
      updated_at: new Date().toISOString()
    };
    this.saveOrUpdatePengambilan(updatedSession);

    // Record in Audit Log
    this.addAuditLog(
      'Koreksi Transaksi Jimpitan',
      `Koreksi data warga ${oldTrx.nama_warga} (${oldTrx.kode_warga}) pada pengambilan ${pSession.tanggal || ''}. Alasan: "${reason}". Selisih Jimpitan: ${deltaJimp >= 0 ? '+' : ''}${deltaJimp.toLocaleString('id-ID')}, Tabungan: ${deltaTab >= 0 ? '+' : ''}${deltaTab.toLocaleString('id-ID')}`,
      'warning',
      admin
    );

    return {
      transaction: allTrx[tIdx],
      session: updatedSession,
      diff: { deltaJimp, deltaTab, deltaTotal }
    };
  }

  // --- KAS PEMUDA & KAS DUSUN ---
  getKasPemuda(pembukuanId = null) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.KAS_PEMUDA) || '[]');
    if (pembukuanId && pembukuanId !== 'semua') {
      return list.filter(k => k.pembukuan_id === pembukuanId);
    }
    return list;
  }

  addKasPemudaEntry(entry) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.KAS_PEMUDA) || '[]');
    const newEntry = {
      id: `KP-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...entry
    };
    list.push(newEntry);
    localStorage.setItem(STORAGE_KEYS.KAS_PEMUDA, JSON.stringify(list));
    return newEntry;
  }

  getKasDusun(pembukuanId = null) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.KAS_DUSUN) || '[]');
    if (pembukuanId && pembukuanId !== 'semua') {
      return list.filter(k => k.pembukuan_id === pembukuanId);
    }
    return list;
  }

  addKasDusunEntry(entry) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.KAS_DUSUN) || '[]');
    const newEntry = {
      id: `KD-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...entry
    };
    list.push(newEntry);
    localStorage.setItem(STORAGE_KEYS.KAS_DUSUN, JSON.stringify(list));
    return newEntry;
  }

  getSaldoKasPemuda(pembukuanId = null) {
    const list = this.getKasPemuda(pembukuanId);
    let masuk = 0;
    let keluar = 0;
    list.forEach(k => {
      if (k.jenis === 'masuk') masuk += parseFloat(k.nominal || 0);
      if (k.jenis === 'keluar') keluar += parseFloat(k.nominal || 0);
    });
    return masuk - keluar;
  }

  getSaldoKasDusun(pembukuanId = null) {
    const list = this.getKasDusun(pembukuanId);
    let masuk = 0;
    let keluar = 0;
    list.forEach(k => {
      if (k.jenis === 'masuk') masuk += parseFloat(k.nominal || 0);
      if (k.jenis === 'keluar') keluar += parseFloat(k.nominal || 0);
    });
    return masuk - keluar;
  }

  getTotalSeluruhTabungan(pembukuanId = null) {
    const wargaList = this.getWarga();
    let total = 0;
    wargaList.forEach(w => {
      total += this.getSaldoTabunganWarga(w.id, pembukuanId);
    });
    return total;
  }

  // --- AUDIT LOG ---
  getAuditLogs() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOG) || '[]');
  }

  addAuditLog(action, detail, type = 'info', admin = 'gemukireng') {
    const list = this.getAuditLogs();
    const newLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      admin,
      aktivitas: action,
      detail,
      tipe: type
    };
    list.unshift(newLog);
    // keep maximum 500 records
    if (list.length > 500) list.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(list));
    return newLog;
  }

  // --- AUTH & CONFIG ---
  getAdminAuth() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) || '{"username":"gemukireng","password":"kiyudan123"}');
  }

  updateAdminPassword(newPassword) {
    const auth = this.getAdminAuth();
    auth.password = newPassword;
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(auth));
  }

  getConfig() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.APP_CONFIG) || '{}');
  }

  updateConfig(newConfig) {
    localStorage.setItem(STORAGE_KEYS.APP_CONFIG, JSON.stringify(newConfig));
  }

  // --- BACKUP & RESTORE ---
  exportBackupJSON() {
    const backupData = {};
    Object.keys(STORAGE_KEYS).forEach(k => {
      const storageKey = STORAGE_KEYS[k];
      backupData[storageKey] = localStorage.getItem(storageKey);
    });
    return JSON.stringify(backupData, null, 2);
  }

  importRestoreJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      Object.keys(parsed).forEach(key => {
        if (parsed[key] !== null && parsed[key] !== undefined) {
          localStorage.setItem(key, typeof parsed[key] === 'string' ? parsed[key] : JSON.stringify(parsed[key]));
        }
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  resetToDefault() {
    localStorage.clear();
    this.seedInitialData();
  }
}

export const db = new Database();
