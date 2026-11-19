# Panduan Instalasi & Penggunaan SIMINV (Laptop Baru / Windows)

Panduan ini disusun dari nol untuk laptop Windows yang belum terpasang software pengembangan apa pun. Ikuti langkah-langkah di bawah secara berurutan.

---

## 1. Software yang Harus Di-download & Di-install

Download dan install aplikasi berikut:

1. **Git** (untuk mengunduh kode dari GitHub)
   - Download: https://git-scm.com/downloads/win
   - Install dengan pilihan default (*Next* terus sampai selesai).

2. **Node.js (Versi LTS / v20 atau v22)** (untuk menjalankan Frontend Next.js)
   - Download: https://nodejs.org/ (pilih yang bertanda **LTS**)
   - Install dengan pilihan default.

3. **PHP (Versi 8.2 / 8.3 / 8.4 / 8.5)** (untuk menjalankan Backend Laravel 12)
   - Download dari https://windows.php.net/download/ (pilih versi **VS17 x64 Non Thread Safe / Zip**).
   - Ekstrak folder PHP ke `C:\php` (atau `C:\Program Files\php-...`).
   - Tambahkan path folder PHP tersebut ke **Environment Variables → Path** Windows agar perintah `php` bisa dijalankan di terminal.

4. **Composer** (package manager untuk Laravel)
   - Download: https://getcomposer.org/download/ (`Composer-Setup.exe`)
   - Jalankan installer dan arahkan ke file `php.exe` yang sudah diekstrak tadi.

5. **PostgreSQL 16+ (termasuk pgAdmin 4)** (untuk Database)
   - Download: https://www.postgresql.org/download/windows/
   - Saat instalasi, buat dan **catat password** untuk user `postgres` (biarkan port default `5432`).
   - Pastikan **pgAdmin 4** ikut tercentang saat instalasi.

6. **Visual Studio Code** (Opsional, untuk mengedit kode/file `.env`)
   - Download: https://code.visualstudio.com/

---

## 2. Pengaturan Wajib Setelah Install

### A. Aktifkan Ekstensi PHP (`zip`, `pdo_pgsql`, `pgsql`, `fileinfo`)
Jika tidak diaktifkan, `composer install` dan koneksi PostgreSQL akan error.
1. Buka folder instalasi PHP kamu (misal `C:\php`), salin `php.ini-development` lalu ubah namanya menjadi `php.ini` (jika belum ada `php.ini`).
2. Buka `php.ini` dengan Notepad/VS Code (jika di `C:\Program Files`, buka editor sebagai **Administrator**).
3. Cari baris berikut dan **hapus tanda titik koma (`;`)** di depannya:
   ```ini
   extension=curl
   extension=fileinfo
   extension=mbstring
   extension=openssl
   extension=pdo_pgsql
   extension=pgsql
   extension=zip
   ```
4. Simpan `php.ini`, lalu buka PowerShell baru dan cek:
   ```powershell
   php -m | Select-String -Pattern "zip|pgsql|fileinfo"
   ```
   Pastikan `fileinfo`, `pdo_pgsql`, `pgsql`, dan `zip` muncul.

### B. Buat Database di PostgreSQL (via pgAdmin 4)
1. Buka aplikasi **pgAdmin 4**, masukkan password master yang dibuat saat install.
2. Klik **Servers → PostgreSQL → Databases** (klik kanan) → **Create → Database...**
3. Isi nama database persis:
   ```
   db_inventaris_smpn2
   ```
4. Klik **Save**.

---

## 3. Download Project dari GitHub

Buka PowerShell / Terminal di folder tempat kamu ingin menyimpan project (misal `D:\Projects`), lalu jalankan:

```powershell
git clone https://github.com/Prinaldi77/SIMINV_SMPN2KATAPANG.git
cd SIMINV_SMPN2KATAPANG
```
*(Sesuaikan nama folder hasil clone jika berbeda.)*

---

## 4. Setup Backend (Laravel 12)

Masuk ke folder `backend` dan jalankan perintah berikut satu per satu:

```powershell
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Setelah itu, buka file `backend/.env` dan ubah bagian database menjadi seperti ini (ganti `password_postgres_kamu` sesuai password PostgreSQL saat install):

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=db_inventaris_smpn2
DB_USERNAME=postgres
DB_PASSWORD=password_postgres_kamu
```
*(Catatan: jika password mengandung karakter spesial atau spasi, apit dengan tanda kutip, misal `DB_PASSWORD="pass#123"`.)*

Simpan `backend/.env`, lalu jalankan migrasi database, seeder data awal, dan link storage gambar:

```powershell
php artisan storage:link
php artisan migrate --seed
```

---

## 5. Setup Frontend (Next.js 15)

Kembali ke folder utama project (keluar dari `backend`):

```powershell
cd ..
npm install
```

Buat file baru bernama `.env.local` di folder utama project (sejajar dengan `package.json`), lalu isi dengan:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

---

## 6. Cara Menjalankan Aplikasi

Setiap kali ingin menggunakan aplikasi, buka **2 terminal**:

- **Terminal 1 (Backend Laravel):**
  ```powershell
  cd backend
  php artisan serve
  ```
  Server backend akan berjalan di `http://127.0.0.1:8000`.

- **Terminal 2 (Frontend Next.js):**
  ```powershell
  npm run dev
  ```
  Aplikasi web akan berjalan di `http://localhost:3000`.

Buka browser dan akses **`http://localhost:3000`**.

---

## 7. Akun Login Awal (Default)

Setelah menjalankan `php artisan migrate --seed`, tersedia 3 akun uji coba dengan password yang sama: **`password123`**

| Role | Username | Email |
|---|---|---|
| **Admin (Sarpras)** | `admin` | `admin@smpn2katapang.sch.id` |
| **Guru** | `guru1` | `budi@smpn2katapang.sch.id` |
| **Kepala Sekolah** | `kepsek` | `kepsek@smpn2katapang.sch.id` |

*(Disarankan untuk segera mengganti password dan menambah data guru/barang asli melalui menu **Data Guru & Pengguna** dan **Data Barang** setelah login sebagai Admin.)*

---

## 8. Mengatasi Masalah Umum (Troubleshooting)

- **Error `could not find driver` saat `migrate`:** Ekstensi `pdo_pgsql` dan `pgsql` di `php.ini` belum aktif (ulangi Bagian 2A, lalu buka terminal baru).
- **Error `The zip extension and unzip/7z commands are both missing`:** Ekstensi `zip` di `php.ini` belum aktif (ulangi Bagian 2A).
- **Error `password authentication failed for user "postgres"`:** Password di `backend/.env` tidak cocok dengan password PostgreSQL. Perbaiki `DB_PASSWORD` lalu jalankan `php artisan config:clear`.
- **Gambar barang yang di-upload tidak tampil:** Pastikan sudah menjalankan `php artisan storage:link` di dalam folder `backend`.
