<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name'     => 'Admin Sarpras',
                'username' => 'admin',
                'nip'      => '198501012010011001',
                'email'    => 'admin@smpn2katapang.sch.id',
                'password' => 'password123',
                'role'     => 'admin',
                'jabatan'  => 'Staff Sarana Prasarana',
                'no_telp'  => '081234567890',
            ],
            [
                'name'     => 'Budi Santoso, S.Pd',
                'username' => 'guru1',
                'nip'      => '199002022015021002',
                'email'    => 'budi@smpn2katapang.sch.id',
                'password' => 'password123',
                'role'     => 'guru',
                'jabatan'  => 'Guru Informatika',
                'no_telp'  => '081234567891',
            ],
            [
                'name'     => 'Kepala Sekolah',
                'username' => 'kepsek',
                'nip'      => '197503032000031003',
                'email'    => 'kepsek@smpn2katapang.sch.id',
                'password' => 'password123',
                'role'     => 'kepsek',
                'jabatan'  => 'Kepala Sekolah',
                'no_telp'  => '081234567892',
            ],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(['username' => $data['username']], $data);
        }
    }
}