<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Daftar akun pengguna untuk manajemen admin.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->orderBy('name');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    /**
     * Tambah akun guru, admin, atau kepsek baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:150'],
            'username' => ['required', 'string', 'max:50', 'unique:users,username'],
            'nip'      => ['nullable', 'string', 'max:30', 'unique:users,nip'],
            'email'    => ['required', 'email', 'max:100', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role'     => ['required', 'in:admin,guru,kepsek'],
            'jabatan'  => ['required', 'string', 'max:100'],
            'no_telp'  => ['nullable', 'string', 'max:20'],
        ]);

        $user = User::create($validated);

        return response()->json([
            'message' => 'Pengguna berhasil ditambahkan.',
            'data'    => $user,
        ], 201);
    }
}
