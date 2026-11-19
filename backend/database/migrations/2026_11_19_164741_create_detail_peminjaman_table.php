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
       Schema::create('detail_peminjaman', function (Blueprint $table) {
    $table->id();
    $table->foreignId('peminjaman_id')
        ->constrained('peminjaman')
        ->cascadeOnUpdate()
        ->cascadeOnDelete();
    $table->foreignId('barang_id')
        ->constrained('barang')
        ->cascadeOnUpdate()
        ->restrictOnDelete();
    $table->integer('jumlah_pinjam')->default(1);
    $table->string('kondisi_awal', 50)->default('Baik (Siap Pakai)');
    $table->string('kondisi_kembali', 50)->nullable();
    $table->text('catatan')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_peminjaman');
    }
};
