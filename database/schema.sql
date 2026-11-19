-- ==============================================================================
-- SKEMA BASIS DATA POSTGRESQL (PostgreSQL 16+)
-- APLIKASI MANAJEMEN INVENTARIS DAN SIRKULASI PEMINJAMAN BARANG BERBASIS WEB
-- PADA SMPN 2 KATAPANG
-- Mahasiswa: Ari Ardiansyah (NIM: 23110137)
-- ==============================================================================

-- 1. Inisialisasi Tipe Data ENUM
CREATE TYPE role_pengguna AS ENUM ('admin', 'guru', 'kepsek');
CREATE TYPE kondisi_barang AS ENUM ('Baik', 'Rusak Ringan', 'Rusak Berat');
CREATE TYPE status_ketersediaan_barang AS ENUM ('Tersedia', 'Dipinjam', 'Dalam Perbaikan', 'Dihapuskan');
CREATE TYPE status_transaksi_peminjaman AS ENUM (
    'Menunggu Persetujuan', 
    'Disetujui', 
    'Dipinjam', 
    'Mendekati Deadline', 
    'Terlambat', 
    'Dikembalikan', 
    'Ditolak'
);
CREATE TYPE tingkat_kerusakan_aset AS ENUM ('Ringan', 'Berat');
CREATE TYPE status_penanganan_kerusakan AS ENUM ('Verifikasi', 'Vendor', 'Selesai');

-- ==============================================================================
-- 2. Tabel: users (Manajemen Akun Multi-Peran)
-- ==============================================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    nip VARCHAR(30) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role role_pengguna NOT NULL DEFAULT 'guru',
    jabatan VARCHAR(100) NOT NULL,
    no_telp VARCHAR(20),
    remember_token VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 3. Tabel: kategori_barang (Klasifikasi Sarana Prasarana)
-- ==============================================================================
CREATE TABLE kategori_barang (
    id SERIAL PRIMARY KEY,
    kode_kategori VARCHAR(20) UNIQUE NOT NULL,
    nama_kategori VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. Tabel: ruangan (Penempatan Barang & Kartu Inventaris Ruangan / KIR)
-- ==============================================================================
CREATE TABLE ruangan (
    id SERIAL PRIMARY KEY,
    kode_ruangan VARCHAR(20) UNIQUE NOT NULL,
    nama_ruangan VARCHAR(100) NOT NULL,
    gedung VARCHAR(50) NOT NULL,
    lantai VARCHAR(20) NOT NULL,
    penanggung_jawab_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 5. Tabel: barang (Master Inventaris Sarana Multimedia & IT)
-- ==============================================================================
CREATE TABLE barang (
    id BIGSERIAL PRIMARY KEY,
    kode_barang VARCHAR(50) UNIQUE NOT NULL,
    nama_barang VARCHAR(150) NOT NULL,
    spesifikasi TEXT NOT NULL,
    nomor_seri VARCHAR(100),
    kategori_id INT NOT NULL REFERENCES kategori_barang(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    ruangan_id INT NOT NULL REFERENCES ruangan(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    kondisi kondisi_barang NOT NULL DEFAULT 'Baik',
    status_ketersediaan status_ketersediaan_barang NOT NULL DEFAULT 'Tersedia',
    tahun_pengadaan INT NOT NULL,
    jumlah INT NOT NULL DEFAULT 1 CHECK (jumlah >= 0),
    satuan VARCHAR(20) NOT NULL DEFAULT 'Unit',
    gambar_path VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 6. Tabel: peminjaman (Header Sirkulasi Peminjaman)
-- ==============================================================================
CREATE TABLE peminjaman (
    id BIGSERIAL PRIMARY KEY,
    kode_transaksi VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    petugas_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    tanggal_pengajuan TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tanggal_pinjam TIMESTAMP WITH TIME ZONE NOT NULL,
    tenggat_kembali TIMESTAMP WITH TIME ZONE NOT NULL,
    tanggal_kembali_aktual TIMESTAMP WITH TIME ZONE,
    tujuan_keperluan VARCHAR(100) NOT NULL,
    ruangan_tujuan VARCHAR(100) NOT NULL,
    deskripsi_kegiatan TEXT NOT NULL,
    status status_transaksi_peminjaman NOT NULL DEFAULT 'Menunggu Persetujuan',
    pakta_integritas BOOLEAN NOT NULL DEFAULT TRUE,
    catatan_petugas TEXT,
    token_verifikasi VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 7. Tabel: detail_peminjaman (Rincian Item yang Dipinjam)
-- ==============================================================================
CREATE TABLE detail_peminjaman (
    id BIGSERIAL PRIMARY KEY,
    peminjaman_id BIGINT NOT NULL REFERENCES peminjaman(id) ON UPDATE CASCADE ON DELETE CASCADE,
    barang_id BIGINT NOT NULL REFERENCES barang(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    jumlah_pinjam INT NOT NULL DEFAULT 1 CHECK (jumlah_pinjam > 0),
    kondisi_awal VARCHAR(50) NOT NULL DEFAULT 'Baik (Siap Pakai)',
    kondisi_kembali VARCHAR(50),
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 8. Tabel: riwayat_kerusakan (Laporan Insiden & BAP Servis)
-- ==============================================================================
CREATE TABLE riwayat_kerusakan (
    id BIGSERIAL PRIMARY KEY,
    barang_id BIGINT NOT NULL REFERENCES barang(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    peminjaman_id BIGINT REFERENCES peminjaman(id) ON UPDATE CASCADE ON DELETE SET NULL,
    pelapor_id BIGINT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    deskripsi_kerusakan TEXT NOT NULL,
    tingkat_kerusakan tingkat_kerusakan_aset NOT NULL DEFAULT 'Ringan',
    status_tindakan status_penanganan_kerusakan NOT NULL DEFAULT 'Verifikasi',
    biaya_perbaikan NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 9. Indeks untuk Optimasi Performa Pencarian & Relasi
-- ==============================================================================
CREATE INDEX idx_barang_kategori ON barang(kategori_id);
CREATE INDEX idx_barang_ruangan ON barang(ruangan_id);
CREATE INDEX idx_barang_status ON barang(status_ketersediaan);
CREATE INDEX idx_peminjaman_user ON peminjaman(user_id);
CREATE INDEX idx_peminjaman_status ON peminjaman(status);
CREATE INDEX idx_peminjaman_tenggat ON peminjaman(tenggat_kembali);
CREATE INDEX idx_detail_peminjaman_fk ON detail_peminjaman(peminjaman_id, barang_id);

-- ==============================================================================
-- 10. Data Awal Seeder (SMPN 2 Katapang)
-- ==============================================================================

-- Akun Pengguna (Password default: bcrypt('password123'))
INSERT INTO users (name, username, nip, email, password, role, jabatan, no_telp) VALUES
('Ahmad Fauzi, S.E.', 'admin_sarpras', '197508202005011008', 'sarpras@smpn2katapang.sch.id', '$2y$12$eA8i4uYp1tM.Ea5Lkmv68OSlqG0rS7eP1Y6X0s4rD1bQ3cE.d7s8G', 'admin', 'Staf Urusan Sarpras / TU', '081223344556'),
('Budi Santoso, M.Pd.', 'budi_guru', '197804122005011004', 'budi@smpn2katapang.sch.id', '$2y$12$eA8i4uYp1tM.Ea5Lkmv68OSlqG0rS7eP1Y6X0s4rD1bQ3cE.d7s8G', 'guru', 'Guru Pengajar TIK & Ka. Lab', '081289234410'),
('Siti Aminah, S.Pd.', 'siti_guru', '198503122010012021', 'siti@smpn2katapang.sch.id', '$2y$12$eA8i4uYp1tM.Ea5Lkmv68OSlqG0rS7eP1Y6X0s4rD1bQ3cE.d7s8G', 'guru', 'Guru Bahasa Indonesia', '081399887766'),
('Drs. H. Mulyana, M.M.Pd.', 'kepsek', '196803151993031004', 'kepsek@smpn2katapang.sch.id', '$2y$12$eA8i4uYp1tM.Ea5Lkmv68OSlqG0rS7eP1Y6X0s4rD1bQ3cE.d7s8G', 'kepsek', 'Kepala SMPN 2 Katapang', '081122334455');

-- Kategori Barang
INSERT INTO kategori_barang (kode_kategori, nama_kategori, deskripsi) VALUES
('KAT-ELEK', 'Elektronik & IT Pembelajaran', 'Perangkat komputer, laptop, proyektor, monitor, dan printer'),
('KAT-AUDIO', 'Sound System & Audio Multimedia', 'Pengeras suara portable, mikrofon nirkabel, amplifier, dan mixer'),
('KAT-KABEL', 'Aksesori Jaringan & Kabel Konverter', 'Kabel HDMI, kabel VGA, adapter USB Type-C, roll kabel listrik'),
('KAT-LAB', 'Peralatan Praktikum Lab IPA', 'Mikroskop binokuler, alat peraga sains, dan kit eksperimen');

-- Ruangan
INSERT INTO ruangan (kode_ruangan, nama_ruangan, gedung, lantai, penanggung_jawab_id) VALUES
('R-TU-01', 'Ruang Tata Usaha (TU)', 'Gedung A', 'Lantai 1', 1),
('LAB-KOM-1', 'Laboratorium Komputer 1', 'Gedung B', 'Lantai 2', 2),
('LAB-KOM-2', 'Laboratorium Komputer 2', 'Gedung B', 'Lantai 2', 2),
('LAB-IPA', 'Laboratorium IPA', 'Gedung C', 'Lantai 1', 3),
('R-GURU', 'Ruang Dewan Guru', 'Gedung A', 'Lantai 2', 2),
('GUDANG-SAR', 'Gudang Utama Sarpras', 'Gedung A', 'Lantai 1 (Sayap Timur)', 1);

-- Data Master Barang Multimedia
INSERT INTO barang (kode_barang, nama_barang, spesifikasi, nomor_seri, kategori_id, ruangan_id, kondisi, status_ketersediaan, tahun_pengadaan, jumlah, satuan) VALUES
('INV-2026-001', 'Laptop Lenovo ThinkPad L14 Gen 3', 'Intel Core i5-1235U, RAM 16GB, SSD 512GB NVMe, 14 inch FHD, Charger & Tas Asli', 'SN-LNV-29381', 1, 2, 'Baik', 'Tersedia', 2023, 1, 'Unit'),
('INV-2026-002', 'Proyektor Epson EB-X500 (3.600 ANSI)', 'XGA Resolution, 3LCD, HDMI/VGA Port, Remote & Kabel Power 1.8m, Tas Resmi', 'SN-EPS-58291', 1, 1, 'Baik', 'Tersedia', 2023, 1, 'Unit'),
('INV-2026-003', 'Speaker Aktif Portable Baretone 15 Inch', 'MAX15NB 600W, 2 Mic Wireless UHF, Bluetooth, Baterai Aki Kering Built-in', 'SN-BRT-11923', 2, 6, 'Baik', 'Tersedia', 2022, 1, 'Unit'),
('INV-2026-004', 'Wireless Presenter Logitech R400', 'Laser Pointer Merah, USB Dongle 2.4GHz, Jangkauan 15 Meter', 'SN-LOG-1192', 1, 2, 'Baik', 'Tersedia', 2023, 2, 'Unit'),
('INV-2026-005', 'Kabel HDMI Gold-Plated Rol 20 Meter', 'Baseus High Speed 4K 60Hz dengan Penggulung & Pouch Pelindung', 'SN-HDMI-9021', 3, 2, 'Baik', 'Tersedia', 2024, 2, 'Roll'),
('INV-2026-006', 'Kamera Digital Canon EOS 3000D', 'Kit Lensa 18-55mm, Baterai, Charger, Memory Card 32GB, Tas Kamera', 'SN-CAN-82731', 1, 2, 'Baik', 'Tersedia', 2022, 1, 'Unit');

