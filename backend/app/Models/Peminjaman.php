<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Peminjaman extends Model
{
    protected $table = 'peminjaman';

    protected $fillable = [
        'kode_transaksi',
        'user_id',
        'petugas_id',
        'tanggal_pengajuan',
        'tanggal_pinjam',
        'tenggat_kembali',
        'tanggal_kembali_aktual',
        'tujuan_keperluan',
        'ruangan_tujuan',
        'deskripsi_kegiatan',
        'status',
        'pakta_integritas',
        'catatan_petugas',
        'token_verifikasi',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_pengajuan'      => 'datetime',
            'tanggal_pinjam'         => 'datetime',
            'tenggat_kembali'        => 'datetime',
            'tanggal_kembali_aktual' => 'datetime',
            'pakta_integritas'       => 'boolean',
        ];
    }

    public function peminjam(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function petugas(): BelongsTo
    {
        return $this->belongsTo(User::class, 'petugas_id');
    }

    public function details(): HasMany
    {
        return $this->hasMany(DetailPeminjaman::class, 'peminjaman_id');
    }
}