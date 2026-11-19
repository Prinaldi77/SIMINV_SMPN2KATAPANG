<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BarangController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Barang::with([
            'kategori:id,kode_kategori,nama_kategori',
            'ruangan:id,kode_ruangan,nama_ruangan,gedung,lantai',
        ]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'ilike', "%{$search}%")
                  ->orWhere('kode_barang', 'ilike', "%{$search}%")
                  ->orWhere('nomor_seri', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->kategori_id);
        }

        if ($request->filled('ruangan_id')) {
            $query->where('ruangan_id', $request->ruangan_id);
        }

        if ($request->filled('kondisi')) {
            $query->where('kondisi', $request->kondisi);
        }

        if ($request->filled('status_ketersediaan')) {
            $query->where('status_ketersediaan', $request->status_ketersediaan);
        }

        $data = $query->latest()->get();

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode_barang'         => ['required', 'string', 'max:50', 'unique:barang,kode_barang'],
            'nama_barang'         => ['required', 'string', 'max:150'],
            'spesifikasi'         => ['required', 'string'],
            'nomor_seri'          => ['nullable', 'string', 'max:100'],
            'kategori_id'         => ['required', 'exists:kategori_barang,id'],
            'ruangan_id'          => ['required', 'exists:ruangan,id'],
            'kondisi'             => ['sometimes', 'in:Baik,Rusak Ringan,Rusak Berat'],
            'status_ketersediaan' => ['sometimes', 'in:Tersedia,Dipinjam,Dalam Perbaikan,Dihapuskan'],
            'tahun_pengadaan'     => ['required', 'integer', 'min:1990', 'max:' . (date('Y') + 1)],
            'jumlah'              => ['required', 'integer', 'min:0'],
            'satuan'              => ['sometimes', 'string', 'max:20'],
            'gambar'              => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($request->hasFile('gambar')) {
            $validated['gambar_path'] = $request->file('gambar')->store('barang', 'public');
        }
        unset($validated['gambar']);

        $barang = Barang::create($validated);

        return response()->json([
            'message' => 'Barang berhasil ditambahkan.',
            'data'    => $barang->load(['kategori', 'ruangan']),
        ], 201);
    }

    public function show(Barang $barang): JsonResponse
    {
        return response()->json([
            'data' => $barang->load(['kategori', 'ruangan']),
        ]);
    }

    public function update(Request $request, Barang $barang): JsonResponse
    {
        $validated = $request->validate([
            'kode_barang'         => ['required', 'string', 'max:50', 'unique:barang,kode_barang,' . $barang->id],
            'nama_barang'         => ['required', 'string', 'max:150'],
            'spesifikasi'         => ['required', 'string'],
            'nomor_seri'          => ['nullable', 'string', 'max:100'],
            'kategori_id'         => ['required', 'exists:kategori_barang,id'],
            'ruangan_id'          => ['required', 'exists:ruangan,id'],
            'kondisi'             => ['sometimes', 'in:Baik,Rusak Ringan,Rusak Berat'],
            'status_ketersediaan' => ['sometimes', 'in:Tersedia,Dipinjam,Dalam Perbaikan,Dihapuskan'],
            'tahun_pengadaan'     => ['required', 'integer', 'min:1990', 'max:' . (date('Y') + 1)],
            'jumlah'              => ['required', 'integer', 'min:0'],
            'satuan'              => ['sometimes', 'string', 'max:20'],
            'gambar'              => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($request->hasFile('gambar')) {
            if ($barang->gambar_path) {
                Storage::disk('public')->delete($barang->gambar_path);
            }
            $validated['gambar_path'] = $request->file('gambar')->store('barang', 'public');
        }
        unset($validated['gambar']);

        $barang->update($validated);

        return response()->json([
            'message' => 'Barang berhasil diperbarui.',
            'data'    => $barang->load(['kategori', 'ruangan']),
        ]);
    }

    public function destroy(Barang $barang): JsonResponse
    {
        if ($barang->gambar_path) {
            Storage::disk('public')->delete($barang->gambar_path);
        }

        $barang->delete();

        return response()->json(['message' => 'Barang berhasil dihapus.']);
    }
}