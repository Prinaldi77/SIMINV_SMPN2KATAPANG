<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Peminjaman;
use App\Models\RiwayatKerusakan;
use App\Models\Ruangan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Ringkasan statistik dan aktivitas terbaru sesuai role pengguna.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'guru') {
            return response()->json([
                'role'  => 'guru',
                'stats' => [
                    'total_barang_tersedia' => (int) Barang::where('status_ketersediaan', 'Tersedia')->sum('jumlah'),
                    'menunggu_persetujuan'  => Peminjaman::where('user_id', $user->id)->where('status', 'Menunggu Persetujuan')->count(),
                    'sedang_dipinjam'       => Peminjaman::where('user_id', $user->id)->whereIn('status', ['Dipinjam', 'Mendekati Deadline', 'Terlambat'])->count(),
                    'riwayat_selesai'       => Peminjaman::where('user_id', $user->id)->where('status', 'Dikembalikan')->count(),
                ],
                'peminjaman_terbaru' => Peminjaman::with('details.barang:id,kode_barang,nama_barang,satuan')
                    ->where('user_id', $user->id)
                    ->latest('tanggal_pengajuan')
                    ->limit(5)
                    ->get(),
            ]);
        }

        return response()->json([
            'role'  => $user->role,
            'stats' => [
                'total_jenis_barang'   => Barang::count(),
                'total_unit_barang'    => (int) Barang::sum('jumlah'),
                'barang_tersedia'      => Barang::where('status_ketersediaan', 'Tersedia')->count(),
                'barang_dipinjam'      => Barang::where('status_ketersediaan', 'Dipinjam')->count(),
                'barang_perbaikan'     => Barang::where('status_ketersediaan', 'Dalam Perbaikan')->count(),
                'total_ruangan'        => Ruangan::count(),
                'menunggu_persetujuan' => Peminjaman::where('status', 'Menunggu Persetujuan')->count(),
                'peminjaman_aktif'     => Peminjaman::whereIn('status', ['Dipinjam', 'Mendekati Deadline', 'Terlambat'])->count(),
                'peminjaman_terlambat' => Peminjaman::where('status', 'Terlambat')->count(),
                'kerusakan_aktif'      => RiwayatKerusakan::whereIn('status_tindakan', ['Verifikasi', 'Vendor'])->count(),
            ],
            'peminjaman_terbaru' => Peminjaman::with([
                'peminjam:id,name,jabatan',
                'details.barang:id,kode_barang,nama_barang,satuan',
            ])
                ->latest('tanggal_pengajuan')
                ->limit(5)
                ->get(),
            'kerusakan_terbaru' => RiwayatKerusakan::with([
                'barang:id,kode_barang,nama_barang',
                'pelapor:id,name',
            ])
                ->latest()
                ->limit(5)
                ->get(),
        ]);
    }
}
