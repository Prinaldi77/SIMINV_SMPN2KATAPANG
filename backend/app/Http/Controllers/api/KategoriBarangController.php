<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KategoriBarang;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KategoriBarangController extends Controller
{
    public function index(): JsonResponse
    {
        $data = KategoriBarang::withCount('barang')->orderBy('nama_kategori')->get();

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode_kategori' => ['required', 'string', 'max:20', 'unique:kategori_barang,kode_kategori'],
            'nama_kategori' => ['required', 'string', 'max:100'],
            'deskripsi'     => ['nullable', 'string'],
        ]);

        $kategori = KategoriBarang::create($validated);

        return response()->json(['message' => 'Kategori berhasil ditambahkan.', 'data' => $kategori], 201);
    }

    public function show(KategoriBarang $kategori): JsonResponse
    {
        return response()->json(['data' => $kategori->loadCount('barang')]);
    }

    public function update(Request $request, KategoriBarang $kategori): JsonResponse
    {
        $validated = $request->validate([
            'kode_kategori' => ['required', 'string', 'max:20', 'unique:kategori_barang,kode_kategori,' . $kategori->id],
            'nama_kategori' => ['required', 'string', 'max:100'],
            'deskripsi'     => ['nullable', 'string'],
        ]);

        $kategori->update($validated);

        return response()->json(['message' => 'Kategori berhasil diperbarui.', 'data' => $kategori]);
    }

    public function destroy(KategoriBarang $kategori): JsonResponse
    {
        if ($kategori->barang()->exists()) {
            return response()->json(['message' => 'Kategori tidak dapat dihapus karena masih digunakan oleh barang.'], 422);
        }

        $kategori->delete();

        return response()->json(['message' => 'Kategori berhasil dihapus.']);
    }
}