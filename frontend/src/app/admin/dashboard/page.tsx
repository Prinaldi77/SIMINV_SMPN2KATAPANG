"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Download,
  Package,
  CheckCircle2,
  Share2,
  AlertTriangle,
  RotateCcw,
  Clock,
  History,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Send,
  Printer,
  Eye,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  Radio,
  FileSpreadsheet,
} from "lucide-react";
import { apiFetch, getAuthUser } from "@/lib/api";
import BarcodeScannerModal from "@/components/BarcodeScannerModal";

interface DashboardStats {
  total_jenis_barang: number;
  total_unit_barang: number;
  barang_tersedia: number;
  barang_dipinjam: number;
  barang_perbaikan: number;
  total_ruangan: number;
  menunggu_persetujuan: number;
  peminjaman_aktif: number;
  peminjaman_terlambat: number;
  kerusakan_aktif: number;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"Semua" | "Dipinjam" | "Menunggu" | "Terlambat">("Semua");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [selectedLoanDetail, setSelectedLoanDetail] = useState<any | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    const user = getAuthUser();
    if (user?.name) setUserName(user.name);

    apiFetch<{ stats: DashboardStats; peminjaman_terbaru: any[] }>("/dashboard")
      .then((res) => {
        setStats(res.stats);
        setRecentLoans(res.peminjaman_terbaru || []);
      })
      .catch((err) => console.error("Gagal memuat dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  const filterLoans = recentLoans.filter((loan) => {
    if (activeTab === "Semua") return true;
    if (activeTab === "Dipinjam") return loan.status === "Dipinjam";
    if (activeTab === "Menunggu") return loan.status === "Menunggu Persetujuan";
    if (activeTab === "Terlambat") return loan.status === "Terlambat";
    return true;
  });

  const formatDate = (val?: string) => {
    if (!val) return "-";
    return new Date(val).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "GR";

  const handleActionToast = (msg: string) => {
    setAlertSuccess(msg);
    setTimeout(() => setAlertSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {alertSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{alertSuccess}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-bold text-blue-800 tracking-wider uppercase">
              Pusat Kendali Inventaris
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Selamat Datang, {userName}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau kondisi inventaris dan aktivitas peminjaman barang sekolah secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <QrCode className="w-4 h-4 text-slate-600" />
            <span>Pindai Barcode Cepat</span>
          </button>

          <button
            onClick={() => handleActionToast("Laporan harian berhasil diekspor ke Excel!")}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-blue-200" />
            <span>Ekspor Laporan Harian</span>
          </button>
        </div>
      </div>

      {/* Section 1: STATUS FISIK ASET & UNIT INVENTARIS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Status Fisik Aset & Unit Inventaris
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Sinkronisasi: 2 menit lalu</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Barang */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                {stats?.total_jenis_barang ?? 0} Jenis
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-medium">Total Barang Terdaftar</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-slate-900">
                  {loading ? "..." : (stats?.total_unit_barang ?? 0)}
                </span>
                <span className="text-xs text-slate-500 font-semibold">Unit</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Total Ruangan (KIR)</span>
              <span className="font-bold text-slate-700">{stats?.total_ruangan ?? 0} Ruang</span>
            </div>
          </div>

          {/* Tersedia di Ruang */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Siap Pakai
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-medium">Barang Tersedia di Ruang</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-slate-900">
                  {loading ? "..." : (stats?.barang_tersedia ?? 0)}
                </span>
                <span className="text-xs text-emerald-600 font-semibold">Jenis Tersedia</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Total Jenis Aset</span>
              <span className="font-bold text-emerald-700">{stats?.total_jenis_barang ?? 0} Item</span>
            </div>
          </div>

          {/* Sedang Dipinjam */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                Aktif Digunakan
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-medium">Sedang Dipinjam</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-slate-900">
                  {loading ? "..." : (stats?.barang_dipinjam ?? 0)}
                </span>
                <span className="text-xs text-blue-600 font-semibold">Jenis Habis Dipinjam</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Transaksi Aktif</span>
              <span className="font-bold text-slate-700">{stats?.peminjaman_aktif ?? 0} Transaksi</span>
            </div>
          </div>

          {/* Rusak / Servis */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                Perlu Tindakan
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-medium">Rusak / Perlu Servis</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-rose-600">
                  {loading ? "..." : (stats?.barang_perbaikan ?? 0)}
                </span>
                <span className="text-xs text-slate-500 font-semibold">Dalam Perbaikan</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Laporan Kerusakan Aktif</span>
              <span className="font-bold text-rose-600">{stats?.kerusakan_aktif ?? 0} Laporan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: SIRKULASI & ARUS PEMINJAMAN */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Sirkulasi & Arus Peminjaman
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Bulan Berjalan: September 2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Peminjaman Berlangsung */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">Peminjaman Berlangsung</p>
              <RotateCcw className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">
                {loading ? "..." : (stats?.peminjaman_aktif ?? 0)}
              </span>
              <span className="text-xs text-slate-500">Transaksi</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 truncate">Status Dipinjam & Terlambat</p>
          </div>

          {/* Menunggu Persetujuan */}
          <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-amber-900">Menunggu Persetujuan</p>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-600">
                {loading ? "..." : (stats?.menunggu_persetujuan ?? 0)}
              </span>
              <span className="text-xs text-amber-800 font-medium">Pengajuan</span>
            </div>
            <p className="text-[11px] text-amber-700 font-semibold mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              Perlu verifikasi petugas
            </p>
          </div>

          {/* Terlambat Pengembalian */}
          <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-rose-900">Terlambat Pengembalian</p>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-rose-600">
                {loading ? "..." : (stats?.peminjaman_terlambat ?? 0)}
              </span>
              <span className="text-xs text-rose-800 font-medium">Transaksi Menunggak</span>
            </div>
            <p className="text-[11px] text-rose-600 font-semibold mt-2">Perlu tindakan follow-up segera</p>
          </div>

          {/* Kerusakan Aktif */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">Laporan Kerusakan Aktif</p>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">
                {loading ? "..." : (stats?.kerusakan_aktif ?? 0)}
              </span>
              <span className="text-xs text-slate-500">Laporan</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-2">Dalam verifikasi / vendor</p>
          </div>
        </div>
      </div>

      {/* Section 3: Middle Grid (Distribusi & Tren vs Perlu Perhatian Segera) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Distribusi Kategori & Tren Sirkulasi */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Card: Distribusi Kategori Barang */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Distribusi Kategori Barang</h3>
                <p className="text-[11px] text-slate-500">Komposisi 842 total unit aset sarana & prasarana sekolah</p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                4 Kategori Utama
              </span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="mt-4">
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100">
                <div style={{ width: "40.4%" }} className="bg-[#1A3673]" title="Elektronik & IT (40.4%)" />
                <div style={{ width: "25.5%" }} className="bg-[#2563EB]" title="Laboratorium IPA (25.5%)" />
                <div style={{ width: "19.6%" }} className="bg-[#93C5FD]" title="Alat Musik & Olahraga (19.6%)" />
                <div style={{ width: "14.5%" }} className="bg-[#CBD5E1]" title="Meubelair & Sarana (14.5%)" />
              </div>

              {/* Progress Labels */}
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#1A3673]" />
                    <span className="text-xs font-bold text-slate-800">Elektronik & IT</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">340 Unit</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                  <span>Laptop, Proyektor, Audio</span>
                  <span className="font-bold text-slate-700">40.4%</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#2563EB]" />
                    <span className="text-xs font-bold text-slate-800">Laboratorium IPA</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">215 Unit</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                  <span>Mikroskop, Model Anatomi</span>
                  <span className="font-bold text-slate-700">25.5%</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#93C5FD]" />
                    <span className="text-xs font-bold text-slate-800">Alat Musik & Olahraga</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">165 Unit</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                  <span>Gamelan, Matras, Bola</span>
                  <span className="font-bold text-slate-700">19.6%</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#CBD5E1]" />
                    <span className="text-xs font-bold text-slate-800">Meubelair & Sarana</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">122 Unit</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                  <span>Podium, Meja Rapat, Rak</span>
                  <span className="font-bold text-slate-700">14.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Tren Sirkulasi Peminjaman */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tren Sirkulasi Peminjaman</h3>
                <p className="text-[11px] text-slate-500">Perbandingan barang dipinjam vs tepat waktu kembali (6 Bulan)</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#1A3673]" />
                  Dipinjam
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#059669]" />
                  Tepat Waktu
                </span>
              </div>
            </div>

            {/* Bar Chart Representation */}
            <div className="h-44 pt-4 flex items-end justify-between gap-2 border-b border-slate-200 px-4">
              {[
                { month: "April", borrowed: 98, returned: 82, h1: "60%", h2: "50%" },
                { month: "Mei", borrowed: 118, returned: 104, h1: "72%", h2: "64%" },
                { month: "Juni", borrowed: 145, returned: 132, h1: "88%", h2: "80%" },
                { month: "Juli", borrowed: 52, returned: 48, h1: "32%", h2: "29%" },
                { month: "Agustus", borrowed: 124, returned: 115, h1: "76%", h2: "70%" },
                { month: "September", borrowed: 154, returned: 138, h1: "95%", h2: "85%", active: true },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full flex justify-center items-end gap-1.5 h-36">
                    <div
                      style={{ height: bar.h1 }}
                      className={`w-4 sm:w-6 rounded-t transition-all ${
                        bar.active ? "bg-[#1A3673] shadow-md shadow-blue-900/20" : "bg-slate-700/80 group-hover:bg-[#1A3673]"
                      }`}
                      title={`Dipinjam: ${bar.borrowed}`}
                    />
                    <div
                      style={{ height: bar.h2 }}
                      className={`w-4 sm:w-6 rounded-t transition-all ${
                        bar.active ? "bg-emerald-600 shadow-md shadow-emerald-900/20" : "bg-emerald-500/70 group-hover:bg-emerald-600"
                      }`}
                      title={`Tepat Waktu: ${bar.returned}`}
                    />
                  </div>
                  <div className="text-center mt-2">
                    <p className={`text-[11px] font-bold ${bar.active ? "text-[#1A3673]" : "text-slate-600"}`}>
                      {bar.month}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      ({bar.borrowed}/{bar.returned})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Perlu Perhatian Segera */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">Perlu Perhatian Segera</h3>
              </div>
              <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                3 Kasus Prioritas
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Tindakan mendesak diperlukan atas status peminjaman terlambat atau barang bermasalah.
            </p>

            <div className="space-y-3.5">
              {/* Urgent Case 1 */}
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                    Terlambat 3 Hari
                  </span>
                  <span className="text-rose-500 p-1 bg-rose-100 rounded">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Proyektor Epson EB-X500</h4>
                  <p className="text-[10px] font-mono text-slate-500">SN-EPS-58291 • Unit #04</p>
                  <p className="text-[11px] text-slate-700 mt-1">
                    👤 <span className="font-medium">Drs. Andi Setiawan</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Ruang Guru SMP • Deadline: 19 Sep 2026</p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleActionToast("Membuka detail peminjaman PMJ-2026-031...")}
                    className="flex-1 py-1.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => handleActionToast("Surat teguran & notifikasi pengingat berhasil dikirim!")}
                    className="flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Kirim Pengingat
                  </button>
                </div>
              </div>

              {/* Urgent Case 2 */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    Jatuh Tempo Hari Ini (15:00 WIB)
                  </span>
                  <span className="text-amber-600 p-1 bg-amber-100 rounded">
                    <Clock className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Laptop Lenovo ThinkPad L14</h4>
                  <p className="text-[10px] font-mono text-slate-500">SN-LNV-29381 • Unit Lab #12</p>
                  <p className="text-[11px] text-slate-700 mt-1">
                    👤 <span className="font-medium">Budi Santoso, M.Pd.</span>
                  </p>
                  <p className="text-[10px] text-amber-700 font-medium">Batas: Lab #12 (3 Jam tersisa)</p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleActionToast("Membuka rincian laptop PMJ-2026-039...")}
                    className="flex-1 py-1.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => handleActionToast("Pesan WhatsApp pengingat terkirim ke 0812-8923-4410")}
                    className="flex-1 py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Radio className="w-3 h-3" />
                    Notifikasi WA
                  </button>
                </div>
              </div>

              {/* Urgent Case 3 */}
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    Inspeksi Kerusakan Fisik
                  </span>
                  <span className="text-blue-600 p-1 bg-blue-100 rounded">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Kamera Digital Sony Alpha</h4>
                  <p className="text-[10px] font-mono text-slate-500">SN-SNY-10923 • Kit Lensa 16-50mm</p>
                  <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-800 font-medium mt-1.5">
                    ⚠️ Dilaporkan Rusak Ringan (Lensa Buram / Gores)
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Saat pengembalian di Lab Multimedia • Butuh BAP Servis
                  </p>
                </div>
                <button
                  onClick={() => handleActionToast("Formulir Berita Acara Kerusakan dibuka...")}
                  className="w-full py-2 px-3 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-200" />
                  Buat Berita Acara Kerusakan
                </button>
              </div>
            </div>
          </div>

          {/* Quick Info Card: Ruang Multimedia */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Ruang Multimedia & Studio</h4>
                <p className="text-[11px] text-emerald-600 font-semibold">Tersedia untuk Sesi Siang (13:00 - 16:30)</p>
              </div>
            </div>
            <Link
              href="/admin/kir"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Jadwal
            </Link>
          </div>
        </div>
      </div>

      {/* Section 4: Aktivitas Peminjaman Terbaru (Bottom Table) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header & Filter Tabs */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Aktivitas Peminjaman Terbaru</h3>
            <p className="text-[11px] text-slate-500">Daftar sirkulasi barang masuk & keluar dengan rincian tenggat waktu</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            {(
              [
                { id: "Semua", label: `Semua (${recentLoans.length})` },
                { id: "Dipinjam", label: "Dipinjam" },
                { id: "Menunggu", label: "Menunggu" },
                { id: "Terlambat", label: "Terlambat" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-blue-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">KODE TRANSAKSI</th>
                <th className="px-5 py-3">NAMA PEMINJAM & NIP</th>
                <th className="px-5 py-3">BARANG DIPINJAM</th>
                <th className="px-5 py-3">TGL PINJAM</th>
                <th className="px-5 py-3">DEADLINE</th>
                <th className="px-5 py-3">STATUS</th>
                <th className="px-5 py-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filterLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    {loading ? "Memuat data peminjaman..." : "Belum ada transaksi peminjaman."}
                  </td>
                </tr>
              ) : (
                filterLoans.slice(0, 5).map((loan) => {
                  const totalUnits = (loan.details || []).reduce(
                    (sum: number, d: any) => sum + (d.jumlah_pinjam || 0),
                    0
                  );
                  const borrowerName = loan.peminjam?.name || "Guru";
                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-blue-700">{loan.kode_transaksi}</p>
                        <p className="text-[10px] text-slate-400">{loan.tujuan_keperluan}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#1A3673] text-white flex items-center justify-center text-[10px] font-bold">
                            {getInitials(borrowerName)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{borrowerName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {loan.peminjam?.jabatan || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-800">{totalUnits} Unit Barang</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">
                          {(loan.details || [])
                            .map((d: any) => d.barang?.nama_barang)
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{formatDate(loan.tanggal_pinjam)}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`font-bold ${
                            loan.status === "Terlambat"
                              ? "text-rose-600"
                              : loan.status === "Mendekati Deadline"
                              ? "text-amber-700"
                              : "text-slate-800"
                          }`}
                        >
                          {formatDate(loan.tenggat_kembali)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            loan.status === "Dipinjam"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : loan.status === "Menunggu Persetujuan" || loan.status === "Mendekati Deadline"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : loan.status === "Terlambat" || loan.status === "Ditolak"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              loan.status === "Dipinjam"
                                ? "bg-blue-600"
                                : loan.status === "Menunggu Persetujuan" || loan.status === "Mendekati Deadline"
                                ? "bg-amber-600"
                                : loan.status === "Terlambat" || loan.status === "Ditolak"
                                ? "bg-rose-600"
                                : "bg-emerald-600"
                            }`}
                          />
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedLoanDetail(loan)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title="Lihat Detail Transaksi"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <Link
                            href="/admin/peminjaman"
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                          >
                            Kelola
                          </Link>
                          <Link
                            href={`/guru/surat-bukti?token=${loan.token_verifikasi}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#1A3673] hover:bg-blue-50"
                            title="Cetak Surat Bukti"
                          >
                            <Printer className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            Menampilkan <span className="font-bold text-slate-800">5</span> dari{" "}
            <span className="font-bold text-slate-800">42</span> total transaksi aktif
          </p>
          <div className="flex items-center gap-1 font-semibold">
            <button className="px-2.5 py-1 rounded text-slate-400 hover:text-slate-700 cursor-not-allowed">
              Sebelumnya
            </button>
            <button className="w-7 h-7 rounded bg-[#1A3673] text-white flex items-center justify-center font-bold">
              1
            </button>
            <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-700 flex items-center justify-center">
              2
            </button>
            <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-700 flex items-center justify-center">
              3
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-700 flex items-center justify-center">
              9
            </button>
            <button className="px-2.5 py-1 rounded text-slate-700 hover:bg-slate-100">
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLoanDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedLoanDetail.kode_transaksi}</h3>
                <p className="text-xs text-slate-500">Peminjam: {selectedLoanDetail.peminjam?.name || "-"}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                {selectedLoanDetail.status}
              </span>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Tujuan & Lokasi</p>
                <p className="text-slate-800 font-medium">{selectedLoanDetail.tujuan_keperluan}</p>
                <p className="text-slate-500">{selectedLoanDetail.ruangan_tujuan}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Daftar Barang</p>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-700">
                  {(selectedLoanDetail.details || []).map((d: any, idx: number) => (
                    <li key={idx}>
                      <span className="font-bold">{d.barang?.nama_barang || "Barang"}</span> ({d.jumlah_pinjam}{" "}
                      {d.barang?.satuan || "Unit"})
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-slate-400 text-[10px]">Tanggal Pinjam</p>
                  <p className="font-bold text-slate-800">{formatDate(selectedLoanDetail.tanggal_pinjam)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Batas Pengembalian</p>
                  <p className="font-bold text-slate-800">{formatDate(selectedLoanDetail.tenggat_kembali)}</p>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLoanDetail(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
              >
                Tutup
              </button>
              <Link
                href={`/guru/surat-bukti?token=${selectedLoanDetail.token_verifikasi}`}
                className="px-4 py-2 rounded-lg bg-[#1A3673] text-white font-semibold text-xs hover:bg-[#152C5E] flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Surat Bukti
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Floating Design Preview Button */}
      <BarcodeScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
}

