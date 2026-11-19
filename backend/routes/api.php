<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BarangController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\KategoriBarangController;
use App\Http\Controllers\Api\PeminjamanController;
use App\Http\Controllers\Api\RiwayatKerusakanController;
use App\Http\Controllers\Api\RuanganController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

// Publik: verifikasi QR / token surat bukti peminjaman
Route::get('/verifikasi-surat/{token}', [PeminjamanController::class, 'verifyToken']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Read-only untuk semua role (admin, guru, kepsek)
    Route::get('/kategori', [KategoriBarangController::class, 'index']);
    Route::get('/kategori/{kategori}', [KategoriBarangController::class, 'show']);

    Route::get('/ruangan', [RuanganController::class, 'index']);
    Route::get('/ruangan/{ruangan}', [RuanganController::class, 'show']);
    Route::get('/ruangan/{ruangan}/kir', [RuanganController::class, 'kir']);

    Route::get('/barang', [BarangController::class, 'index']);
    Route::get('/barang/{barang}', [BarangController::class, 'show']);

    // Peminjaman (semua role login bisa lihat & ajukan)
    Route::get('/peminjaman', [PeminjamanController::class, 'index']);
    Route::post('/peminjaman', [PeminjamanController::class, 'store']);
    Route::get('/peminjaman/{peminjaman}', [PeminjamanController::class, 'show']);

    // Kerusakan (admin & guru bisa lihat & lapor)
    Route::get('/kerusakan', [RiwayatKerusakanController::class, 'index']);
    Route::post('/kerusakan', [RiwayatKerusakanController::class, 'store']);

    // Khusus admin
    Route::middleware('role:admin')->group(function () {
        Route::post('/kategori', [KategoriBarangController::class, 'store']);
        Route::put('/kategori/{kategori}', [KategoriBarangController::class, 'update']);
        Route::delete('/kategori/{kategori}', [KategoriBarangController::class, 'destroy']);

        Route::post('/ruangan', [RuanganController::class, 'store']);
        Route::put('/ruangan/{ruangan}', [RuanganController::class, 'update']);
        Route::delete('/ruangan/{ruangan}', [RuanganController::class, 'destroy']);

        Route::post('/barang', [BarangController::class, 'store']);
        Route::put('/barang/{barang}', [BarangController::class, 'update']);
        Route::delete('/barang/{barang}', [BarangController::class, 'destroy']);

        Route::post('/peminjaman/{peminjaman}/approve', [PeminjamanController::class, 'approve']);
        Route::post('/peminjaman/{peminjaman}/reject', [PeminjamanController::class, 'reject']);
        Route::post('/peminjaman/{peminjaman}/return', [PeminjamanController::class, 'returnItems']);

        Route::put('/kerusakan/{kerusakan}', [RiwayatKerusakanController::class, 'update']);

        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
    });
});