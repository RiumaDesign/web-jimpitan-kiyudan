# Rencana Implementasi Final: Sistem Digital Jimpitan Pemuda Dusun Kiyudan

Aplikasi web terpadu untuk pengelolaan **Jimpitan, Tabungan Warga, Kas Pemuda, Kas Dusun, Pengambilan Mingguan, Pembukuan Multi-Tahun, Histori Transaksi, dan Transparansi Keuangan** Dusun Kiyudan, Desa Majaksingi, Kecamatan Borobudur.

---

## 1. Arsitektur & Teknologi

- **Frontend & UI**: HTML5 Semantik, Vanilla CSS Modern (Design system: *Plus Jakarta Sans*, Glassmorphism, tailored CSS variables, dark/light theme toggle, mobile-friendly touch targets).
- **Arsitektur Aplikasi**: Single Page Application (SPA) modular berbasis Vanilla JavaScript (ES6+), tanpa dependensi eksternal berat yang memperlambat sistem.
- **Visualisasi Data**: Chart.js / Dynamic SVG Charts interaktif untuk grafik kas, tren jimpitan bulanan, dan pengeluaran.
- **Database & Storage**: IndexedDB + LocalStorage Wrapper dengan Seeder Otomatis (Data Awal 40 Warga dengan format kode `KDY-001` s/d `KDY-040`, 4 Kelompok Petugas, 4 Penasehat, Multi-periode Pembukuan, data riwayat realistis).
- **Fitur Backup & Restore**: Ekspor dan Impor seluruh database dalam format JSON.
- **Engine Cetak PDF**: Generator PDF & Print Template Resmi (Kop Dusun Kiyudan, rincian per warga/bulanan/tahunan, dan tanda tangan).

---

## 2. Struktur Data & Database Schema

### A. `warga` (Master Data Warga)
```json
{
  "id": "warga-001",
  "kode_warga": "KDY-001",
  "nama": "Anwari",
  "status": "Aktif", // "Aktif" | "Tidak Aktif"
  "keterangan": "",
  "created_at": "2026-08-01T00:00:00Z",
  "updated_at": "2026-08-01T00:00:00Z"
}
```
*(Catatan: Tanpa alamat dan tanpa nomor rumah sesuai spesifikasi).*

### B. `kelompok` & `penasehat`
- **Kelompok 1**: Armi, Apep, Fadel, Khabib, Uzik, Ihsan
- **Kelompok 2**: Iwan, Humam, Kusnadi, Feri, Pi'i, Harno
- **Kelompok 3**: Zazed, Alfin, Udin, Syahrul, Syarif
- **Kelompok 4**: Dwik, Khoir, Doko, Riski, Rudi, Andri
- **Penasehat**: P. Joko, P. Jono, P. Pawit, P. Muhsin

### C. `pembukuan`
```json
{
  "id": "PBK-2026",
  "nama": "Pembukuan 2026",
  "tahun": 2026,
  "tanggal_mulai": "2026-01-01",
  "tanggal_selesai": "2026-12-31",
  "status": "aktif", // "aktif" | "arsip"
  "saldo_awal_pemuda": 0,
  "saldo_awal_dusun": 0
}
```

### D. `pengambilan_jimpitan` (Sesi Mingguan)
```json
{
  "id": "JMP-2026-008",
  "pembukuan_id": "PBK-2026",
  "tanggal": "2026-08-23",
  "hari": "Malam Minggu", // atau "Malam Senin (Ditunda Hujan)"
  "kelompok_id": "kelompok-4",
  "petugas": ["Dwik", "Khoir", "Doko", "Riski", "Rudi", "Andri"],
  "status": "DRAFT", // "DRAFT" | "POSTED"
  "total_jimpitan": 96000,
  "total_tabungan": 375000,
  "total_sistem": 471000,
  "uang_fisik": 471000,
  "selisih": 0,
  "catatan_audit": "",
  "warga_dicatat_count": 32,
  "total_warga_count": 40
}
```

### E. `transaksi_warga`
```json
{
  "id": "TRX-20260823-KDY001",
  "pengambilan_id": "JMP-2026-008",
  "pembukuan_id": "PBK-2026",
  "warga_id": "warga-001",
  "kode_warga": "KDY-001",
  "nama_warga": "Anwari",
  "tanggal": "2026-08-23",
  "jimpitan": 3000,
  "tabungan": 20000,
  "total": 23000,
  "status": "Sudah Setor", // "Sudah Setor" | "Tidak Ada" | "Ditunda" | "Belum Didatangi"
  "catatan": "",
  "koreksi_histori": []
}
```

### F. `kas_pemuda` & `kas_dusun`
- `id`, `pembukuan_id`, `tanggal`, `jenis` ("masuk" | "keluar"), `sumber` ("Jimpitan 50%" | "Pemasukan Lain" | "Pengeluaran Kegiatan"), `kategori`, `nominal`, `keterangan`, `petugas`

### G. `audit_log`
- `id`, `timestamp`, `admin`, `aktivitas`, `detail`, `tipe` ("info" | "warning" | "danger")

---

## 3. Detail Modul & Fitur

### A. Portal Publik (Tanpa Login)
1. **Beranda & Jadwal Mingguan**:
   - Menampilkan status rotasi kelompok minggu ini (Kelompok 1 $\rightarrow$ Kelompok 2 $\rightarrow$ Kelompok 3 $\rightarrow$ Kelompok 4 $\rightarrow$ Kelompok 1).
   - Opsi status: *Malam Minggu* / *Malam Senin (Ditunda Hujan/Halangan - Tetap kelompok yang sama)*.
   - Daftar anggota kelompok bertugas & penasehat dusun.
2. **Widget Transparansi Keuangan Realtime**:
   - Saldo Kas Pemuda, Saldo Kas Dusun, Total Tabungan Warga, Total Pemasukan & Pengeluaran.
   - Grafik interaktif pemasukan jimpitan bulanan & komposisi kas.
3. **Cek Saldo & Histori Tabungan Warga**:
   - Input pencarian berdasarkan nama warga.
   - Konfirmasi pemilihan data: *"Ditemukan: [Nama Warga] (KDY-xxx). Apakah ini data Anda?"*
   - Menampilkan Kode Warga, Nama, Total Saldo Tabungan, dan Daftar Riwayat Setoran/Penarikan.
   - **Cetak PDF Tabungan Mandiri**: Filter periode (Bulan Ini / Tahun Ini / Semua Periode) $\rightarrow$ Export PDF resmi.

### B. Portal Admin (`gemukireng` / `kiyudan123`)
1. **Dashboard Admin**:
   - Ringkasan 4 Card KPI (Warga Aktif, Kas Pemuda, Kas Dusun, Total Tabungan).
   - Sesi Pengambilan Terakhir & Shortcut cepat.
2. **Mode Pengambilan Jimpitan (Alur Inti)**:
   - **Tabel Input Setoran 40 KK**: Tampilan tabel interaktif dengan baris yang dapat diklik atau tombol Ubah/Edit.
   - 4 Status Kunjungan: 🟢 *Sudah Setor*, 🟡 *Tidak Ada* (Rp0, tercatat hadir tanpa setoran), 🟠 *Ditunda*, ⚪ *Belum Didatangi*.
   - **Modal Pop-Up Input Setoran Cepat**:
     - Tombol Cepat: [⚡ Rp13.000 (3K+10K)], [🔗 Rp3.000 (Jimpitan saja)], [🟡 Tidak Ada / Ditunda].
     - Chip Jimpitan: [3rb] [5rb] [10rb] [Custom] *(Validasi ketat: Minimal Rp3.000 jika setor)*.
     - Chip Tabungan: [0] [5rb] [10rb] [20rb] [50rb] [Custom].
     - Kalkulasi otomatis `Total Setor = Jimpitan + Tabungan`.
   - **Ringkasan Sistem & Rekonsiliasi**:
     - SUM nominal jimpitan aktual (bukan 32 × 3.000) + SUM nominal tabungan.
     - Input Uang Fisik yang diterima Bendahara.
     - Kalkulasi Selisih: `Uang Fisik - Total Sistem`.
     - *Jika Selisih != 0*: Wajib isi Catatan Audit/Alasan. Tombol Sahkan & Posting **dikunci** sampai alasan diisi.
   - **Pop-Up Konfirmasi Pengesahan**:
     - Menampilkan rincian: Total Jimpitan, Tabungan, Total Setor, Alokasi Kas Pemuda (+50%), Alokasi Kas Dusun (+50%), Selisih.
   - **Posting ke Kas**:
     - Data resmi masuk ke Buku Kas Pemuda, Kas Dusun, dan Saldo Tabungan masing-masing warga.
3. **Master Data Warga**:
   - Master 40 Warga (`KDY-001` s/d `KDY-040`).
   - Tambah Warga Baru (`KDY-041`, dst.), Edit Nama/Keterangan, Nonaktifkan Warga (Histori transaksi warga tetap aman).
   - Modal konfirmasi di setiap perubahan data.
4. **Master Kelompok & Penasehat**:
   - Edit susunan 4 Kelompok dan 4 Penasehat.
5. **Keuangan & Buku Kas**:
   - Buku Kas Pemuda (Pemasukan, Pengeluaran, Saldo berjalan).
   - Buku Kas Dusun (Pemasukan, Pengeluaran, Saldo berjalan).
   - Tambah Pengeluaran (Kas Pemuda/Dusun, Tanggal, Kategori, Nominal, Keterangan) dengan konfirmasi.
   - Manajemen Tabungan Warga (Setoran Manual / Penarikan Tabungan dengan bukti & konfirmasi).
   - Koreksi Transaksi Posted: Edit transaksi lama dengan input alasan wajib & tercatat di audit log.
6. **Laporan & PDF Admin**:
   - Filter Bulanan & Tahunan.
   - Laporan Kas Pemuda, Kas Dusun, Jimpitan Mingguan, Tabungan, Pengeluaran.
   - Cetak PDF Keseluruhan dan Cetak PDF Per Warga (40 KK).
7. **Multi-Pembukuan & Arsip**:
   - Tombol `+ Pembukuan Baru` (misal Pembukuan 2027) dengan konfirmasi pengarsipan 2026.
   - Lihat arsip pembukuan lama (2025, 2026, dst.) secara lengkap kapan saja.
8. **Pengaturan & Audit Log**:
   - Ganti Password Admin, Audit Log realtime, Backup DB JSON, Restore DB JSON.

---

## 4. Struktur File Proyek

```
d:/web jimpitan terbaru/
├── index.html              # Shell HTML utama (SPA)
├── manifest.json           # Dukungan PWA & Mobile
├── css/
│   ├── main.css            # Variabel warna, reset, typography, grid, layout
│   ├── components.css      # Card, modal dialog, button presets, status badges, forms
│   ├── pengambilan.css     # UI khusus mobile & desktop mode pengambilan jimpitan 40 KK
│   └── print.css           # Format cetak resmi kop surat Dusun Kiyudan
├── js/
│   ├── data/
│   │   ├── initialWarga.js # Master data awal 40 warga (KDY-001 s/d KDY-040)
│   │   └── initialGroups.js# 4 Kelompok (23 pemuda) & 4 Penasehat
│   ├── db.js               # Database Engine (IndexedDB/LocalStorage, Multi-Pembukuan, Backup/Restore)
│   ├── auth.js             # Autentikasi Admin gemukireng / kiyudan123
│   ├── audit.js            # Engine pencatatan audit log
│   ├── views/
│   │   ├── publicHome.js   # Beranda publik, jadwal, transparansi, grafik
│   │   ├── publicCek.js    # Cek tabungan mandiri warga & cetak PDF individu
│   │   ├── adminDash.js    # Dashboard admin ringkasan KPI & quick actions
│   │   ├── pengambilan.js  # Alur pengambilan jimpitan, tabel 40 KK, rekonsiliasi & posting
│   │   ├── masterWarga.js  # Master data 40 warga (CRUD & nonaktifkan)
│   │   ├── masterKelompok.js# Manajemen 4 kelompok & penasehat
│   │   ├── keuangan.js     # Buku Kas Pemuda, Kas Dusun, Pengeluaran & Tabungan
│   │   ├── laporan.js      # Filter & generator PDF bulanan/tahunan
│   │   ├── pembukuan.js    # Multi-periode & arsip pembukuan
│   │   └── settings.js     # Pengaturan password & backup database
│   └── app.js              # Router, state controller, modal konfirmasi global
└── assets/                 # Icons & assets visual
```

---

## 5. Rencana Verifikasi

1. **Uji Pengambilan Jimpitan & Rekonsiliasi**:
   - Buka sesi pengambilan Kelompok 4 untuk tanggal 23 Agustus 2026.
   - Setor beberapa warga (Jimpitan Rp3.000, Rp5.000, Tabungan Rp10.000, Rp20.000).
   - Set beberapa warga menjadi status "Tidak Ada" dan "Ditunda".
   - Coba input Jimpitan Rp2.000 $\rightarrow$ pastikan muncul warning "Minimal Rp3.000" dan tombol simpan terkunci.
   - Masukkan Uang Fisik dengan selisih $\rightarrow$ pastikan tombol "Sahkan & Posting" terkunci sampai alasan selisih diisi.
   - Sahkan pengambilan $\rightarrow$ cek alokasi 50% ke Kas Pemuda, 50% ke Kas Dusun, dan 100% tabungan ke saldo warga.
2. **Uji Transparansi Publik & Cek Tabungan**:
   - Buka portal publik tanpa login.
   - Cari nama warga (contoh: "Anwari" / "KDY-001").
   - Cek rincian saldo dan cetak PDF laporan tabungan warga.
3. **Uji Master Data & Audit Log**:
   - Tambah warga KDY-041, ubah status warga ke "Tidak Aktif".
   - Verifikasi bahwa setiap perubahan memunculkan pop-up konfirmasi dan tercatat di Audit Log.
4. **Uji Multi-Pembukuan**:
   - Buat Pembukuan 2027 $\rightarrow$ pastikan Pembukuan 2026 masuk arsip dan riwayat 2026 tetap bisa diakses.
5. **Uji Backup & Restore**:
   - Ekspor file JSON cadangan dan coba impor kembali.
