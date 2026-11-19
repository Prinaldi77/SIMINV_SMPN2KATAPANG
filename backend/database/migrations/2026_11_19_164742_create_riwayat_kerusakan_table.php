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
        Schema::create('riwayat_kerusakan', function (Blueprint $table) {
    $table->id();
    $table->foreignId('barang_id')
        ->constrained('barang')
        ->cascadeOnUpdate()
        ->restrictOnDelete();
    $table->foreignId('peminjaman_id')
        ->nullable()
        ->constrained('peminjaman')
        ->cascadeOnUpdate()
        ->nullOnDelete();
    $table->foreignId('pelapor_id')
        ->constrained('users')
        ->cascadeOnUpdate()
        ->restrictOnDelete();
    $table->text('deskripsi_kerusakan');
    $table->enum('tingkat_kerusakan', ['Ringan', 'Berat'])->default('Ringan');
    $table->enum('status_tindakan', ['Verifikasi', 'Vendor', 'Selesai'])->default('Verifikasi');
    $table->decimal('biaya_perbaikan', 12, 2)->default(0);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_kerusakan');
    }
};
