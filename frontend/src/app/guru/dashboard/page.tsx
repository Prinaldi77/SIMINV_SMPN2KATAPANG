"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ClipboardList,
  Laptop,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Phone,
  DoorOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  Volume2,
  Microscope,
  Radio,
} from "lucide-react";
import { apiFetch, AuthUser, getAuthUser } from "@/lib/api";

interface GuruStats {
  total_barang_tersedia: number;
  menunggu_persetujuan: number;
  sedang_dipinjam: number;
  riwayat_selesai: number;
}

export default function GuruDashboardPage() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<GuruStats | null>(null);
  const [myLoans, setMyLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getAuthUser());
    apiFetch<{ stats: GuruStats; peminjaman_terbaru: any[] }>("/dashboard")
      .then((res) => {
        setStats(res.stats);
        setMyLoans(res.peminjaman_terbaru || []);
      })
      .catch((err) => console.error("Gagal memuat dashboard guru:", err))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-[#1A3673] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Selamat Datang, {user?.name || "Guru"}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-100 text-blue-800">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              NIP. {user?.nip || "-"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Kelola peminjaman barang sekolah Anda dengan mudah dan pantau batas pengembalian inventaris untuk kelancaran kegiatan belajar mengajar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/barang"
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Lihat Barang Tersedia</span>
          </Link>

          <Link
            href="/guru/ajukan"
            className="flex items-center gap-2 px-4 py-2 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-blue-200" />
            <span>+ Ajukan Peminjaman</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Peminjaman Saya
            </span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {loading ? "..." : (stats?.menunggu_persetujuan ?? 0)}
            </span>
            <span className="text-xs text-slate-500">Menunggu Persetujuan</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> {stats?.sedang_dipinjam ?? 0} Aktif
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {stats?.menunggu_persetujuan ?? 0} Menunggu Review
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Sedang Dipinjam
            </span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {loading ? "..." : (stats?.sedang_dipinjam ?? 0)}
            </span>
            <span className="text-xs text-blue-700 font-bold">Transaksi Aktif</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[11px]">
            <span className="text-slate-500 truncate">Laptop ThinkPad & Proyektor</span>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
              Lab & TU
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
              Mendekati Deadline
            </span>
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-600">1</span>
            <span className="text-xs text-rose-800 font-bold">Transaksi</span>
            <span className="text-[10px] font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded ml-auto">
              Penting
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-rose-100 flex justify-between text-[11px] text-rose-700 font-semibold">
            <span>Batas kembali: Besok!</span>
            <span>15:00 WIB</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Riwayat Selesai
            </span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {loading ? "..." : (stats?.riwayat_selesai ?? 0)}
            </span>
            <span className="text-xs text-slate-500">Transaksi</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-600 font-semibold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Tepat Waktu
            </span>
            <span className="text-[10px] text-slate-400 font-normal">T.A. 26/27</span>
          </div>
        </div>
      </div>

      {/* Urgent Warning Alert Strip */}
      <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-100 text-rose-700 rounded-full shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-rose-950">Perhatian Pengembalian Aset</h4>
              <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                Sisa 24 Jam
              </span>
            </div>
            <p className="text-xs text-rose-800 mt-0.5">
              Unit <strong>Proyektor Epson EB-X500 (SN-EPS-58291)</strong> harus dikembalikan dalam 1 hari (Besok, 24 Sep 2026, pukul 15:00 WIB) ke Petugas Inventaris Ruang Guru.
            </p>
          </div>
        </div>
        <Link
          href="/guru/peminjaman"
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1.5 shadow-sm"
        >
          <span>Lihat Detail & Konfirmasi</span>
        </Link>
      </div>

      {/* Main Grid: Left Column & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Barang yang Sedang Saya Pinjam & Aktivitas */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section: Barang yang Sedang Saya Pinjam */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">Barang yang Sedang Saya Pinjam</h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  2 Aktif
                </span>
              </div>
              <Link
                href="/guru/peminjaman"
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>Kelola Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Lenovo ThinkPad */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-slate-400 font-bold">INV-2026-001</span>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      • Aman — 4 Hari Lagi
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate">Laptop Lenovo ThinkPad...</h4>

                  {/* Photo container */}
                  <div className="relative h-36 w-full rounded-lg overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80"
                      alt="ThinkPad"
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-mono">
                      SN : SN-LNV-29381
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <p className="text-[10px] text-slate-400">Tgl Pinjam</p>
                      <p className="font-bold text-slate-800">20 Sep 2026</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Batas Kembali</p>
                      <p className="font-bold text-slate-800">27 Sep 2026</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                      Asal: Lab Komputer 1
                    </span>
                    <span className="text-emerald-600 font-semibold">Kondisi: Sangat Baik</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-500">No. Reg: PMJ-2026-085</span>
                  <Link
                    href="/guru/peminjaman"
                    className="text-blue-700 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Detail Peminjaman</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 2: Proyektor Epson */}
              <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-slate-400 font-bold">INV-2026-002</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                      • Segera — 1 Hari Lagi
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate">Proyektor Epson EB-X500...</h4>

                  {/* Photo container */}
                  <div className="relative h-36 w-full rounded-lg overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80"
                      alt="Proyektor Epson"
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-mono">
                      SN : SN-EPS-58291
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <p className="text-[10px] text-slate-400">Tgl Pinjam</p>
                      <p className="font-bold text-slate-800">21 Sep 2026</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Batas Kembali</p>
                      <p className="font-bold text-rose-600">24 Sep 2026 (15:00)</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                      Asal: Ruang Guru Lantai 2
                    </span>
                    <span className="text-rose-600 font-bold">Segera Kembalikan</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/50 border-t border-amber-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-500">No. Reg: PMJ-2026-088</span>
                  <Link
                    href="/guru/peminjaman"
                    className="text-amber-900 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Detail Peminjaman</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Aktivitas Pengajuan & Peminjaman Terbaru */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-blue-700" />
                  Aktivitas Pengajuan & Peminjaman Terbaru
                </h3>
                <p className="text-[11px] text-slate-400">
                  Daftar transaksi inventaris pribadi guru pada semester berjalan
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select className="p-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 bg-slate-50 font-medium">
                  <option>Semua Status</option>
                  <option>Dipinjam</option>
                  <option>Selesai</option>
                </select>
                <Link
                  href="/guru/peminjaman"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Lihat Semua
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">KODE TRANSAKSI</th>
                    <th className="px-5 py-3">BARANG & DETAIL</th>
                    <th className="px-5 py-3">TGL PINJAM / PENGAJUAN</th>
                    <th className="px-5 py-3">BATAS PENGEMBALIAN</th>
                    <th className="px-5 py-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {/* Row 1 */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-bold text-blue-700">PMJ-2026-088</td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">Proyektor Epson EB-X500</p>
                      <p className="text-[11px] text-slate-500">Jumlah: 1 Unit • Kelas 9-B (Presentasi IPA)</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <p>20 Sep 2026</p>
                      <p className="text-[10px] text-slate-400">08:30 WIB</p>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-amber-700">
                      <p>24 Sep 2026</p>
                      <p className="text-[10px] font-mono">15:00 WIB</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                        Mendekati Deadline
                      </span>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-bold text-blue-700">PMJ-2026-092</td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">Kamera DSLR Canon EOS 3000D</p>
                      <p className="text-[11px] text-slate-500">Jumlah: 1 Unit • Dokumentasi Ekstrakurikuler</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <p>23 Sep 2026</p>
                      <p className="text-[10px] text-slate-400">10:15 WIB</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <p>28 Sep 2026</p>
                      <p className="text-[10px] font-mono">14:00 WIB</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          Menunggu Persetujuan
                        </span>
                        <button
                          onClick={() => showToast("Melihat rincian pengajuan PMJ-2026-092...")}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                        >
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-bold text-slate-600">PMJ-2026-085</td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">Set Speaker Portable + 2 Wireless Mic</p>
                      <p className="text-[11px] text-slate-500">Jumlah: 1 Set • Upacara Bendera Hari Senin</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <p>15 Sep 2026</p>
                      <p className="text-[10px] text-slate-400">06:45 WIB</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <p>18 Sep 2026</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">Dikembalikan 17 Sep</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        Dikembalikan
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan 3 aktivitas terbaru dari 15 riwayat peminjaman</span>
              <Link
                href="/guru/peminjaman"
                className="text-blue-700 font-bold hover:underline flex items-center gap-1"
              >
                <span>Buka Lembar Riwayat Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Sidebar (4 cols): Barang Siap Dipinjam & Alur Peminjaman */}
        <div className="lg:col-span-4 space-y-6">
          {/* Widget: Barang Siap Dipinjam */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Barang Siap Dipinjam</h3>
                <p className="text-[11px] text-slate-400">Peralatan sering digunakan guru pengajar</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
            </div>

            <div className="space-y-3">
              {/* Item 1 */}
              <div className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors space-y-2">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=200&auto=format&fit=crop&q=80"
                      alt="Speaker"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        Speaker Portabel Baretone 15&quot;
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Tersedia
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Kategori: Audio / Lapangan</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-slate-500">Lokasi: Gudang Utama (Rak B)</span>
                  <Link
                    href="/guru/ajukan?item=INV-2026-005"
                    className="px-2.5 py-1 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded text-xs font-semibold"
                  >
                    Ajukan Pinjam
                  </Link>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors space-y-2">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=200&auto=format&fit=crop&q=80"
                      alt="Mikroskop"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        Mikroskop Binokuler Olympus CX23
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Tersedia
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Kategori: Laboratorium IPA</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-slate-500">Lokasi: Lab Biologi Lt. 2</span>
                  <Link
                    href="/guru/ajukan?item=INV-2026-004"
                    className="px-2.5 py-1 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded text-xs font-semibold"
                  >
                    Ajukan Pinjam
                  </Link>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors space-y-2">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-500">
                    <Radio className="w-6 h-6 text-blue-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        Wireless Presenter Logitech R400
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Tersedia
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Kategori: Aksesori Komputer</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-slate-500">Lokasi: Lab Komputer 1</span>
                  <Link
                    href="/guru/ajukan?item=INV-2026-008"
                    className="px-2.5 py-1 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded text-xs font-semibold"
                  >
                    Ajukan Pinjam
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/admin/barang"
              className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Lihat Semua {stats?.total_barang_tersedia ?? 0} Unit Tersedia</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Widget: Alur Peminjaman Guru */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-700" />
              <div>
                <h3 className="text-xs font-bold text-slate-900">Alur Peminjaman Guru</h3>
                <p className="text-[10px] text-slate-400">Prosedur resmi inventaris sekolah</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1A3673] font-black flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-slate-800">Ajukan Form Online</h4>
                  <p className="text-[11px] text-slate-500">Pilih barang dan cantumkan peruntukan kelas/kegiatan belajar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1A3673] font-black flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-slate-800">Persetujuan Petugas TU</h4>
                  <p className="text-[11px] text-slate-500">Menunggu verifikasi ketersediaan jadwal barang oleh operator SIMINV.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1A3673] font-black flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-slate-800">Ambil & Cek Fisik Barang</h4>
                  <p className="text-[11px] text-slate-500">Tanda tangani Berita Acara Penyerahan di ruang inventaris terkait.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1A3673] font-black flex items-center justify-center shrink-0 text-xs">
                  4
                </span>
                <div>
                  <h4 className="font-bold text-slate-800">Kembalikan Tepat Waktu</h4>
                  <p className="text-[11px] text-slate-500">Pastikan barang dalam kondisi utuh sebelum batas deadline berakhir.</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-700" />
                <span className="font-semibold text-slate-700">Butuh bantuan inventaris?</span>
              </div>
              <span className="font-mono font-bold text-blue-800">Ext: 104 (TU)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Design Preview Button */}
    </div>
  );
}

