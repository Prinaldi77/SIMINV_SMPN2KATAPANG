<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Peminjaman;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PeminjamanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Peminjaman::with([
            'peminjam:id,name,nip,jabatan',
            'petugas:id,name',
            'details.barang:id,kode_barang,nama_barang,satuan',
        ]);

        // Guru hanya melihat peminjamannya sendiri
        if ($request->user()->role === 'guru') {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'data' => $query->latest('tanggal_pengajuan')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tanggal_pinjam'     => ['required', 'date'],
            'tenggat_kembali'    => ['required', 'date', 'after:tanggal_pinjam'],
            'tujuan_keperluan'   => ['required', 'string', 'max:100'],
            'ruangan_tujuan'     => ['required', 'string', 'max:100'],
            'deskripsi_kegiatan' => ['required', 'string'],
            'pakta_integritas'   => ['required', 'accepted'],
            'items'              => ['required', 'array', 'min:1'],
            'items.*.barang_id'  => ['required', 'exists:barang,id'],
            'items.*.jumlah'     => ['required', 'integer', 'min:1'],
            'items.*.catatan'    => ['nullable', 'string'],
        ]);

        $peminjaman = DB::transaction(function () use ($validated, $request) {
            // Cek stok awal tiap barang
            foreach ($validated['items'] as $item) {
                $barang = Barang::findOrFail($item['barang_id']);
                if ($barang->jumlah < $item['jumlah']) {
                    abort(422, "Stok {$barang->nama_barang} tidak mencukupi (tersedia: {$barang->jumlah}).");
                }
            }

            $kode = 'PJM-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));

            $peminjaman = Peminjaman::create([
                'kode_transaksi'     => $kode,
                'user_id'            => $request->user()->id,
                'tanggal_pengajuan'  => now(),
                'tanggal_pinjam'     => $validated['tanggal_pinjam'],
                'tenggat_kembali'    => $validated['tenggat_kembali'],
                'tujuan_keperluan'   => $validated['tujuan_keperluan'],
                'ruangan_tujuan'     => $validated['ruangan_tujuan'],
                'deskripsi_kegiatan' => $validated['deskripsi_kegiatan'],
                'status'             => 'Menunggu Persetujuan',
                'pakta_integritas'   => true,
                'token_verifikasi'   => Str::random(48),
            ]);

            foreach ($validated['items'] as $item) {
                $barang = Barang::findOrFail($item['barang_id']);
                $peminjaman->details()->create([
                    'barang_id'     => $barang->id,
                    'jumlah_pinjam' => $item['jumlah'],
                    'kondisi_awal'  => $barang->kondisi,
                    'catatan'       => $item['catatan'] ?? null,
                ]);
            }

            return $peminjaman;
        });

        return response()->json([
            'message' => 'Pengajuan peminjaman berhasil dikirim.',
            'data'    => $peminjaman->load(['peminjam:id,name,jabatan', 'details.barang']),
        ], 201);
    }

    public function show(Request $request, Peminjaman $peminjaman): JsonResponse
    {
        if ($request->user()->role === 'guru' && $peminjaman->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        return response()->json([
            'data' => $peminjaman->load(['peminjam', 'petugas:id,name', 'details.barang']),
        ]);
    }

    public function approve(Request $request, Peminjaman $peminjaman): JsonResponse
    {
        if ($peminjaman->status !== 'Menunggu Persetujuan') {
            return response()->json(['message' => 'Hanya pengajuan berstatus Menunggu Persetujuan yang bisa disetujui.'], 422);
        }

        $validated = $request->validate([
            'catatan_petugas' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($peminjaman, $validated, $request) {
            foreach ($peminjaman->details as $detail) {
                $barang = Barang::lockForUpdate()->findOrFail($detail->barang_id);

                if ($barang->jumlah < $detail->jumlah_pinjam) {
                    abort(422, "Stok {$barang->nama_barang} tidak mencukupi (tersedia: {$barang->jumlah}).");
                }

                $barang->jumlah -= $detail->jumlah_pinjam;
                if ($barang->jumlah === 0) {
                    $barang->status_ketersediaan = 'Dipinjam';
                }
                $barang->save();
            }

            $peminjaman->update([
                'status'          => 'Dipinjam',
                'petugas_id'      => $request->user()->id,
                'catatan_petugas' => $validated['catatan_petugas'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Peminjaman disetujui dan stok barang telah diperbarui.',
            'data'    => $peminjaman->fresh(['peminjam', 'petugas:id,name', 'details.barang']),
        ]);
    }

    public function reject(Request $request, Peminjaman $peminjaman): JsonResponse
    {
        if ($peminjaman->status !== 'Menunggu Persetujuan') {
            return response()->json(['message' => 'Pengajuan sudah diproses sebelumnya.'], 422);
        }

        $validated = $request->validate([
            'catatan_petugas' => ['required', 'string'],
        ]);

        $peminjaman->update([
            'status'          => 'Ditolak',
            'petugas_id'      => $request->user()->id,
            'catatan_petugas' => $validated['catatan_petugas'],
        ]);

        return response()->json([
            'message' => 'Pengajuan peminjaman ditolak.',
            'data'    => $peminjaman->fresh(['peminjam', 'petugas:id,name', 'details.barang']),
        ]);
    }

    public function returnItems(Request $request, Peminjaman $peminjaman): JsonResponse
    {
        if (! in_array($peminjaman->status, ['Dipinjam', 'Mendekati Deadline', 'Terlambat'], true)) {
            return response()->json(['message' => 'Transaksi ini tidak dalam status dipinjam.'], 422);
        }

        $validated = $request->validate([
            'catatan_petugas'            => ['nullable', 'string'],
            'items'                      => ['nullable', 'array'],
            'items.*.detail_id'          => ['required_with:items', 'exists:detail_peminjaman,id'],
            'items.*.kondisi_kembali'    => ['required_with:items', 'string', 'max:50'],
        ]);

        DB::transaction(function () use ($peminjaman, $validated) {
            $kondisiMap = collect($validated['items'] ?? [])
                ->keyBy('detail_id');

            foreach ($peminjaman->details as $detail) {
                $barang = Barang::lockForUpdate()->findOrFail($detail->barang_id);
                $barang->jumlah += $detail->jumlah_pinjam;

                if ($barang->status_ketersediaan === 'Dipinjam' && $barang->jumlah > 0) {
                    $barang->status_ketersediaan = 'Tersedia';
                }
                $barang->save();

                $detail->update([
                    'kondisi_kembali' => $kondisiMap[$detail->id]['kondisi_kembali'] ?? 'Baik',
                ]);
            }

            $peminjaman->update([
                'status'                 => 'Dikembalikan',
                'tanggal_kembali_aktual' => now(),
                'catatan_petugas'        => $validated['catatan_petugas'] ?? $peminjaman->catatan_petugas,
            ]);
        });

        return response()->json([
            'message' => 'Pengembalian barang berhasil diproses.',
            'data'    => $peminjaman->fresh(['peminjam', 'petugas:id,name', 'details.barang']),
        ]);
    }

    // Endpoint publik untuk verifikasi QR/token pada Surat Bukti Peminjaman
    public function verifyToken(string $token): JsonResponse
    {
        $peminjaman = Peminjaman::with([
            'peminjam:id,name,nip,jabatan',
            'petugas:id,name',
            'details.barang:id,kode_barang,nama_barang,satuan',
        ])->where('token_verifikasi', $token)->first();

        if (! $peminjaman) {
            return response()->json(['valid' => false, 'message' => 'Token surat bukti tidak ditemukan.'], 404);
        }

        return response()->json([
            'valid' => true,
            'data'  => $peminjaman,
        ]);
    }
}