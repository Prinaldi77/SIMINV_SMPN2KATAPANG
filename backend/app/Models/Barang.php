<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Barang extends Model
{
    protected $table = 'barang';

    protected $fillable = [
        'kode_barang',
        'nama_barang',
        'spesifikasi',
        'nomor_seri',
        'kategori_id',
        'ruangan_id',
        'kondisi',
        'status_ketersediaan',
        'tahun_pengadaan',
        'jumlah',
        'satuan',
        'gambar_path',
    ];

    protected $appends = ['gambar_url'];

    public function getGambarUrlAttribute(): ?string
    {
        return $this->gambar_path ? asset('storage/' . $this->gambar_path) : null;
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriBarang::class, 'kategori_id');
    }

    public function ruangan(): BelongsTo
    {
        return $this->belongsTo(Ruangan::class, 'ruangan_id');
    }
}