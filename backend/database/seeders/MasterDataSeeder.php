<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\KategoriBarang;
use App\Models\Ruangan;
use App\Models\User;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $katProyektor = KategoriBarang::updateOrCreate(
            ['kode_kategori' => 'KAT-PRJ'],
            ['nama_kategori' => 'Proyektor & Display', 'deskripsi' => 'LCD Proyektor dan layar presentasi']
        );

        $katAudio = KategoriBarang::updateOrCreate(
            ['kode_kategori' => 'KAT-AUD'],
            ['nama_kategori' => 'Audio & Sound System', 'deskripsi' => 'Speaker portable, mic wireless, dan mixer']
        );

        $rSarpras = Ruangan::updateOrCreate(
            ['kode_ruangan' => 'R-SARPRAS'],
            [
                'nama_ruangan'        => 'Ruang Sarpras',
                'gedung'              => 'Gedung Utama',
                'lantai'              => 'Lantai 1',
                'penanggung_jawab_id' => $admin?->id,
            ]
        );

        $rLab = Ruangan::updateOrCreate(
            ['kode_ruangan' => 'R-LAB-IT'],
            [
                'nama_ruangan'        => 'Lab Komputer',
                'gedung'              => 'Gedung B',
                'lantai'              => 'Lantai 2',
                'penanggung_jawab_id' => $admin?->id,
            ]
        );

        Barang::updateOrCreate(
            ['kode_barang' => 'BRG-001'],
            [
                'nama_barang'         => 'Proyektor Epson EB-X500',
                'spesifikasi'         => '3600 Lumens, XGA, HDMI/VGA',
                'nomor_seri'          => 'EPS-2024-001',
                'kategori_id'         => $katProyektor->id,
                'ruangan_id'          => $rSarpras->id,
                'kondisi'             => 'Baik',
                'status_ketersediaan' => 'Tersedia',
                'tahun_pengadaan'     => 2024,
                'jumlah'              => 3,
                'satuan'              => 'Unit',
            ]
        );

        Barang::updateOrCreate(
            ['kode_barang' => 'BRG-002'],
            [
                'nama_barang'         => 'Speaker Portable Wireless',
                'spesifikasi'         => '12 Inch + 2 Mic Wireless UHF',
                'nomor_seri'          => 'SPK-2024-012',
                'kategori_id'         => $katAudio->id,
                'ruangan_id'          => $rLab->id,
                'kondisi'             => 'Baik',
                'status_ketersediaan' => 'Tersedia',
                'tahun_pengadaan'     => 2024,
                'jumlah'              => 2,
                'satuan'              => 'Unit',
            ]
        );
    }
}