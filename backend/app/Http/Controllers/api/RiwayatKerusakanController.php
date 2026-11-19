<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\RiwayatKerusakan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RiwayatKerusakanController extends Controller
{
    public function index(): JsonResponse
    {
        $data = RiwayatKerusakan::with([
            'barang:id,kode_barang,nama_barang,kondisi,status_ketersediaan',
            'pelapor:id,name,role,jabatan',
            'peminjaman:id,kode_transaksi',
        ])->latest()->get();

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'barang_id'           => ['required', 'exists:barang,id'],
            'peminjaman_id'       => ['nullable', 'exists:peminjaman,id'],
            'deskripsi_kerusakan' => ['required', 'string'],
            'tingkat_kerusakan'   => ['required', 'in:Ringan,Berat'],
        ]);

        $laporan = DB::transaction(function () use ($validated, $request) {
            $laporan = RiwayatKerusakan::create([
                'barang_id'           => $validated['barang_id'],
                'peminjaman_id'       => $validated['peminjaman_id'] ?? null,
                'pelapor_id'          => $request->user()->id,
                'deskripsi_kerusakan' => $validated['deskripsi_kerusakan'],
                'tingkat_kerusakan'   => $validated['tingkat_kerusakan'],
                'status_tindakan'     => 'Verifikasi',
            ]);

            $barang = Barang::findOrFail($validated['barang_id']);
            $barang->update([
                'kondisi'             => $validated['tingkat_kerusakan'] === 'Berat' ? 'Rusak Berat' : 'Rusak Ringan',
                'status_ketersediaan' => 'Dalam Perbaikan',
            ]);

            return $laporan;
        });

        return response()->json([
            'message' => 'Laporan kerusakan berhasil dikirim.',
            'data'    => $laporan->load(['barang', 'pelapor:id,name,role']),
        ], 201);
    }

    public function update(Request $request, RiwayatKerusakan $kerusakan): JsonResponse
    {
        $validated = $request->validate([
            'status_tindakan' => ['required', 'in:Verifikasi,Vendor,Selesai'],
            'biaya_perbaikan' => ['nullable', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($kerusakan, $validated) {
            $kerusakan->update($validated);

            if ($validated['status_tindakan'] === 'Selesai') {
                $barang = Barang::findOrFail($kerusakan->barang_id);
                $barang->update([
                    'kondisi'             => 'Baik',
                    'status_ketersediaan' => $barang->jumlah > 0 ? 'Tersedia' : 'Dipinjam',
                ]);
            }
        });

        return response()->json([
            'message' => 'Status penanganan kerusakan diperbarui.',
            'data'    => $kerusakan->fresh(['barang', 'pelapor:id,name,role']),
        ]);
    }
}