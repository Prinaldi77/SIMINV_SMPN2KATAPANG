<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ruangan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RuanganController extends Controller
{
    public function index(): JsonResponse
    {
        $data = Ruangan::with('penanggungJawab:id,name,nip,jabatan')
            ->withCount('barang')
            ->orderBy('nama_ruangan')
            ->get();

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode_ruangan'        => ['required', 'string', 'max:20', 'unique:ruangan,kode_ruangan'],
            'nama_ruangan'        => ['required', 'string', 'max:100'],
            'gedung'              => ['required', 'string', 'max:50'],
            'lantai'              => ['required', 'string', 'max:20'],
            'penanggung_jawab_id' => ['nullable', 'exists:users,id'],
        ]);

        $ruangan = Ruangan::create($validated);

        return response()->json([
            'message' => 'Ruangan berhasil ditambahkan.',
            'data'    => $ruangan->load('penanggungJawab:id,name,nip,jabatan'),
        ], 201);
    }

    public function show(Ruangan $ruangan): JsonResponse
    {
        return response()->json([
            'data' => $ruangan->load('penanggungJawab:id,name,nip,jabatan'),
        ]);
    }

    // Endpoint khusus KIR (Kartu Inventaris Ruangan)
    public function kir(Ruangan $ruangan): JsonResponse
    {
        $ruangan->load([
            'penanggungJawab:id,name,nip,jabatan',
            'barang.kategori:id,kode_kategori,nama_kategori',
        ]);

        return response()->json(['data' => $ruangan]);
    }

    public function update(Request $request, Ruangan $ruangan): JsonResponse
    {
        $validated = $request->validate([
            'kode_ruangan'        => ['required', 'string', 'max:20', 'unique:ruangan,kode_ruangan,' . $ruangan->id],
            'nama_ruangan'        => ['required', 'string', 'max:100'],
            'gedung'              => ['required', 'string', 'max:50'],
            'lantai'              => ['required', 'string', 'max:20'],
            'penanggung_jawab_id' => ['nullable', 'exists:users,id'],
        ]);

        $ruangan->update($validated);

        return response()->json([
            'message' => 'Ruangan berhasil diperbarui.',
            'data'    => $ruangan->load('penanggungJawab:id,name,nip,jabatan'),
        ]);
    }

    public function destroy(Ruangan $ruangan): JsonResponse
    {
        if ($ruangan->barang()->exists()) {
            return response()->json(['message' => 'Ruangan tidak dapat dihapus karena masih memiliki barang.'], 422);
        }

        $ruangan->delete();

        return response()->json(['message' => 'Ruangan berhasil dihapus.']);
    }
}