# SIMINV — Sistem Manajemen Inventaris & Sirkulasi Peminjaman Barang

Aplikasi web manajemen inventaris sarana prasarana dan sirkulasi peminjaman barang pada **SMP Negeri 2 Katapang**.

## Teknologi yang Digunakan
- **Frontend:** Next.js 15 (React 19, TypeScript, Tailwind CSS, Lucide Icons)
- **Backend:** Laravel 12 (REST API + Laravel Sanctum)
- **Database:** PostgreSQL 16+

## Fitur Utama
- **Autentikasi & Multi-Role:** `admin` (Staff Sarpras), `guru`, dan `kepsek`.
- **Master Data Inventaris:** Manajemen kategori, ruangan, dan data barang beserta upload foto.
- **Kartu Inventaris Ruangan (KIR):** Daftar aset per ruangan siap cetak (A4).
- **Sirkulasi Peminjaman:** Pengajuan pinjam oleh guru, persetujuan/penolakan oleh admin, pengembalian barang, dan pembaruan stok otomatis.
- **Surat Bukti Peminjaman:** Dokumen resmi dengan token verifikasi QR.
- **Laporan Kerusakan:** Pencatatan kerusakan barang, tindak lanjut vendor, dan pemulihan status aset.
- **Manajemen Pengguna:** Pengelolaan akun guru, petugas, dan kepala sekolah.

## Panduan Instalasi (Dari Awal)
Untuk panduan lengkap instalasi di laptop baru (daftar aplikasi yang harus di-download, konfigurasi PHP & PostgreSQL, hingga cara menjalankan aplikasi), silakan baca:
👉 **[PANDUAN-INSTALASI.md](./PANDUAN-INSTALASI.md)**
