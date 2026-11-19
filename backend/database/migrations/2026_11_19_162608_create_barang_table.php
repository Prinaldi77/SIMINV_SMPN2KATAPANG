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
       Schema::create('barang', function (Blueprint $table) {
    $table->id();
    $table->string('kode_barang', 50)->unique();
    $table->string('nama_barang', 150);
    $table->text('spesifikasi');
    $table->string('nomor_seri', 100)->nullable();
    $table->foreignId('kategori_id')
        ->constrained('kategori_barang')
        ->cascadeOnUpdate()
        ->restrictOnDelete();
    $table->foreignId('ruangan_id')
        ->constrained('ruangan')
        ->cascadeOnUpdate()
        ->restrictOnDelete();
    $table->enum('kondisi', ['Baik', 'Rusak Ringan', 'Rusak Berat'])->default('Baik');
    $table->enum('status_ketersediaan', ['Tersedia', 'Dipinjam', 'Dalam Perbaikan', 'Dihapuskan'])->default('Tersedia');
    $table->integer('tahun_pengadaan');
    $table->integer('jumlah')->default(1);
    $table->string('satuan', 20)->default('Unit');
    $table->string('gambar_path', 255)->nullable();
    $table->timestamps();

    $table->index('kategori_id');
    $table->index('ruangan_id');
    $table->index('status_ketersediaan');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barang');
    }
};
