<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('peminjaman', function (Blueprint $table) {
    $table->id();
    $table->string('kode_transaksi', 50)->unique();
    $table->foreignId('user_id')
        ->constrained('users')
        ->cascadeOnUpdate()
        ->restrictOnDelete();
    $table->foreignId('petugas_id')
        ->nullable()
        ->constrained('users')
        ->cascadeOnUpdate()
        ->nullOnDelete();
    $table->timestamp('tanggal_pengajuan')->useCurrent();
    $table->timestamp('tanggal_pinjam');
    $table->timestamp('tenggat_kembali');
    $table->timestamp('tanggal_kembali_aktual')->nullable();
    $table->string('tujuan_keperluan', 100);
    $table->string('ruangan_tujuan', 100);
    $table->text('deskripsi_kegiatan');
    $table->enum('status', [
        'Menunggu Persetujuan',
        'Disetujui',
        'Dipinjam',
        'Mendekati Deadline',
        'Terlambat',
        'Dikembalikan',
        'Ditolak',
    ])->default('Menunggu Persetujuan');
    $table->boolean('pakta_integritas')->default(true);
    $table->text('catatan_petugas')->nullable();
    $table->string('token_verifikasi', 64)->unique();
    $table->timestamps();

    $table->index('user_id');
    $table->index('status');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peminjaman');
    }
};
