<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatKerusakan extends Model
{
    protected $table = 'riwayat_kerusakan';

    protected $fillable = [
        'barang_id',
        'peminjaman_id',
        'pelapor_id',
        'deskripsi_kerusakan',
        'tingkat_kerusakan',
        'status_tindakan',
        'biaya_perbaikan',
    ];

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }

    public function peminjaman(): BelongsTo
    {
        return $this->belongsTo(Peminjaman::class, 'peminjaman_id');
    }

    public function pelapor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pelapor_id');
    }
}