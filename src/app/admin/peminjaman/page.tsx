"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  Hourglass,
  AlertCircle,
  CheckCircle2,
  Search,
  RotateCcw,
  Plus,
  FileSpreadsheet,
  FileText,
  Calendar,
  User,
  Eye,
  Send,
  Printer,
  ChevronRight,
  ExternalLink,
  Laptop,
  Check,
  X,
  FileCheck,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import DesignPreviewModal from "@/components/DesignPreviewModal";

interface ApiPeminjaman {
  id: number;
  kode_transaksi: string;
  tanggal_pinjam: string;
  tenggat_kembali: string;
  tanggal_kembali_aktual: string | null;
  tujuan_keperluan: string;
  ruangan_tujuan: string;
  deskripsi_kegiatan: string;
  status: string;
  catatan_petugas: string | null;
  token_verifikasi: string;
  peminjam?: { id: number; name: string; nip: string | null; jabatan: string };
  petugas?: { id: number; name: string } | null;
  details: {
    id: number;
    jumlah_pinjam: number;
    barang?: { id: number; kode_barang: string; nama_barang: string; satuan: string };
  }[];
}

export default function PeminjamanSirkulasiPage() {
  const [loans, setLoans] = useState<ApiPeminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("Semua");
  const [search, setSearch] = useState("");
  const [selectedLoans, setSelectedLoans] = useState<number[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data: ApiPeminjaman[] }>("/peminjaman");
      setLoans(res.data || []);
    } catch (err: any) {
      showToast(err.message || "Gagal memuat data peminjaman.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleApprove = async (loan: ApiPeminjaman) => {
    try {
      await apiFetch(`/peminjaman/${loan.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ catatan_petugas: "Disetujui oleh Admin Sarpras" }),
      });
      showToast(`Peminjaman ${loan.kode_transaksi} disetujui!`);
      await loadLoans();
    } catch (err: any) {
      showToast(err.message || "Gagal menyetujui peminjaman.");
    }
  };

  const handleReject = async (loan: ApiPeminjaman) => {
    const alasan = prompt(`Alasan penolakan untuk ${loan.kode_transaksi}:`, "Barang sedang digunakan");
    if (!alasan) return;
    try {
      await apiFetch(`/peminjaman/${loan.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ catatan_petugas: alasan }),
      });
      showToast(`Peminjaman ${loan.kode_transaksi} ditolak.`);
      await loadLoans();
    } catch (err: any) {
      showToast(err.message || "Gagal menolak peminjaman.");
    }
  };

  const handleReturn = async (loan: ApiPeminjaman) => {
    if (!confirm(`Proses pengembalian barang untuk ${loan.kode_transaksi}?`)) return;
    try {
      await apiFetch(`/peminjaman/${loan.id}/return`, {
        method: "POST",
        body: JSON.stringify({ catatan_petugas: "Dikembalikan lengkap" }),
      });
      showToast(`Pengembalian ${loan.kode_transaksi} berhasil diproses!`);
      await loadLoans();
    } catch (err: any) {
      showToast(err.message || "Gagal memproses pengembalian.");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLoans(filteredLoans.map((l) => l.id));
    } else {
      setSelectedLoans([]);
    }
  };

  const handleToggleSelect = (id: number) => {
    if (selectedLoans.includes(id)) {
      setSelectedLoans(selectedLoans.filter((item) => item !== id));
    } else {
      setSelectedLoans([...selectedLoans, id]);
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const q = search.toLowerCase();
    const matchSearch =
      loan.kode_transaksi.toLowerCase().includes(q) ||
      (loan.peminjam?.name || "").toLowerCase().includes(q) ||
      (loan.details || []).some((d) => (d.barang?.nama_barang || "").toLowerCase().includes(q));

    if (filterStatus === "Semua") return matchSearch;
    if (filterStatus === "Selesai") return matchSearch && loan.status === "Dikembalikan";
    return matchSearch && loan.status === filterStatus;
  });

  const formatDate = (val?: string) =>
    val ? new Date(val).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "GR";

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-[#1A3673] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Warning Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-950">Perhatian Sirkulasi Harian</h4>
            <p className="text-xs text-blue-800">
              Terdapat <strong>5 transaksi lewat jatuh tempo</strong> dan 7 peminjaman guru harus dikembalikan sebelum pukul 15.00 WIB hari ini.
            </p>
          </div>
        </div>
        <button
          onClick={() => setFilterStatus("Terlambat")}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1.5 shadow-sm"
        >
          <span>! Tinjau Keterlambatan</span>
        </button>
      </div>

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded tracking-wide">
              MODUL SIRKULASI
            </span>
            <span className="text-[11px] text-slate-500 font-medium">• T.A. 2026/2027 Ganjil</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Peminjaman Barang</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola transaksi permohonan, peminjaman aktif, dan sirkulasi barang inventaris oleh dewan guru.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast("Rekap Sirkulasi bulanan berhasil diekspor!")}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Rekap Sirkulasi</span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-blue-200" />
            <span>+ Buat Peminjaman Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Peminjaman Aktif
            </span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">42</span>
            <span className="text-xs text-slate-500">Transaksi</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[11px]">
            <span className="text-slate-500">38 Guru & Staf Aktif</span>
            <span className="font-bold text-blue-700">89 unit aset</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Jatuh Tempo Hari Ini
            </span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-600">7</span>
            <span className="text-xs text-slate-500">Transaksi</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[11px]">
            <span className="text-amber-800 font-medium">Batas jam 15:00 WIB</span>
            <span className="font-bold text-slate-700">12 unit aset</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terlambat</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-600">5</span>
            <span className="text-xs text-slate-500">Transaksi</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[11px]">
            <span className="text-rose-600 font-semibold">Perlu surat penagihan</span>
            <span className="font-bold text-rose-700">8 unit tertahan</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Dikembalikan Bulan Ini
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">138</span>
            <span className="text-xs text-emerald-600 font-bold">Selesai</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[11px]">
            <span className="text-slate-500">Tingkat tepat waktu: 96%</span>
            <span className="font-bold text-slate-800">244 unit</span>
          </div>
        </div>
      </div>

      {/* Filter Bar with Dropdowns and Fast Filter Chips */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nomor transaksi (PMJ-...) atau nama guru..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Semua">Semua Status Peminjaman</option>
              <option value="Dipinjam">Dipinjam</option>
              <option value="Mendekati Deadline">Mendekati Deadline</option>
              <option value="Terlambat">Terlambat</option>
              <option value="Selesai">Dikembalikan (Selesai)</option>
            </select>
          </div>

          <div className="md:col-span-2 relative">
            <input
              type="date"
              defaultValue="2026-09-20"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700"
            />
          </div>

          <div className="md:col-span-2">
            <select className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs">
              <option>Semua Dewan Guru</option>
              <option>Budi Santoso, M.Pd.</option>
              <option>Siti Aminah, S.Pd.</option>
              <option>Drs. Andi Setiawan</option>
              <option>Rina Nurhayati, S.Si.</option>
            </select>
          </div>

          <div className="md:col-span-1 flex justify-end">
            <button
              onClick={() => {
                setSearch("");
                setFilterStatus("Semua");
              }}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600"
              title="Reset Filter"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Fast Filter Pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Penyaringan Cepat:
          </span>
          {[
            { id: "Semua", label: `Semua (${loans.length})` },
            { id: "Menunggu Persetujuan", label: `Menunggu (${loans.filter((l) => l.status === "Menunggu Persetujuan").length})` },
            { id: "Dipinjam", label: `Dipinjam (${loans.filter((l) => l.status === "Dipinjam").length})` },
            { id: "Terlambat", label: `Terlambat (${loans.filter((l) => l.status === "Terlambat").length})` },
            { id: "Selesai", label: `Selesai (${loans.filter((l) => l.status === "Dikembalikan").length})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterStatus(pill.id)}
              className={`px-3 py-1 rounded-full font-semibold transition-all shrink-0 ${
                filterStatus === pill.id
                  ? "bg-[#1A3673] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table: Daftar Transaksi Peminjaman */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Daftar Transaksi Peminjaman</h3>
            <p className="text-[11px] text-slate-400">Menampilkan 5 dari 42 data</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast("Exporting data ke Excel...")}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => showToast("Exporting data ke PDF...")}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3 w-8 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedLoans.length === filteredLoans.length && filteredLoans.length > 0}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3">KODE TRANSAKSI</th>
                <th className="px-4 py-3">PEMINJAM (GURU & NIP)</th>
                <th className="px-4 py-3">DAFTAR BARANG & JUMLAH</th>
                <th className="px-4 py-3">TGL PINJAM</th>
                <th className="px-4 py-3">BATAS KEMBALI</th>
                <th className="px-4 py-3">STATUS</th>
                <th className="px-4 py-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    {loading ? "Memuat data peminjaman..." : "Tidak ada transaksi peminjaman."}
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const totalUnits = (loan.details || []).reduce((s, d) => s + d.jumlah_pinjam, 0);
                  const borrowerName = loan.peminjam?.name || "Guru";
                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedLoans.includes(loan.id)}
                          onChange={() => handleToggleSelect(loan.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-blue-700">{loan.kode_transaksi}</p>
                        <p className="text-[10px] text-slate-400">{loan.tujuan_keperluan}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1A3673] text-white flex items-center justify-center text-[10px] font-bold">
                            {getInitials(borrowerName)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{borrowerName}</p>
                            <p className="text-[10px] font-mono text-slate-400">
                              NIP. {loan.peminjam?.nip || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-1.5">
                          <Laptop className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800">
                              {totalUnits} Unit ({loan.details?.[0]?.barang?.nama_barang || "Barang"})
                            </p>
                            <p className="text-[10px] text-slate-500 max-w-xs">{loan.ruangan_tujuan}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{formatDate(loan.tanggal_pinjam)}</td>
                      <td className="px-4 py-3.5">
                        <p
                          className={`font-bold ${
                            loan.status === "Terlambat"
                              ? "text-rose-600"
                              : loan.status === "Mendekati Deadline"
                              ? "text-amber-700"
                              : "text-slate-800"
                          }`}
                        >
                          {formatDate(loan.tenggat_kembali)}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
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
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/guru/surat-bukti?token=${loan.token_verifikasi}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            title="Detail Surat Bukti"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="sr-only">Detail</span>
                          </Link>
                          {loan.status === "Menunggu Persetujuan" ? (
                            <>
                              <button
                                onClick={() => handleApprove(loan)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => handleReject(loan)}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
                              >
                                Tolak
                              </button>
                            </>
                          ) : ["Dipinjam", "Mendekati Deadline", "Terlambat"].includes(loan.status) ? (
                            <button
                              onClick={() => handleReturn(loan)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                            >
                              Kembali
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-semibold">Selesai</span>
                          )}
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
          <div className="flex items-center gap-2">
            <span>Menampilkan</span>
            <select className="p-1 border border-slate-300 rounded bg-white text-xs font-semibold">
              <option>5</option>
              <option>10</option>
              <option>25</option>
            </select>
            <span>dari 42 catatan transaksi</span>
          </div>

          <div className="flex items-center gap-1 font-semibold">
            <button className="px-2.5 py-1 rounded text-slate-400 hover:text-slate-700 cursor-not-allowed">
              &larr; Sebelumnya
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
              Selanjutnya &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Bottom 3 Analytics & SOP Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Kepatuhan Waktu Pengembalian */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">Kepatuhan Waktu Pengembalian</h4>
              <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                96.4% Baik
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Rata-rata durasi peminjaman inventaris sekolah adalah <strong>2.8 hari</strong> per dewan guru.
            </p>
          </div>

          {/* Donut Simulation */}
          <div className="my-4 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-8 border-blue-600 border-t-rose-500 flex flex-col items-center justify-center shadow-inner">
              <span className="text-2xl font-black text-slate-900">138</span>
              <span className="text-[10px] text-slate-500 font-semibold">Tepat Waktu</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 bg-blue-50/50 rounded-lg">
              <p className="text-[10px] text-slate-500">Tepat Waktu</p>
              <p className="text-base font-black text-blue-700">138</p>
            </div>
            <div className="p-2 bg-rose-50/50 rounded-lg">
              <p className="text-[10px] text-slate-500">Terlambat</p>
              <p className="text-base font-black text-rose-600">5</p>
            </div>
          </div>
        </div>

        {/* Card 2: Kategori Paling Sering Dipinjam */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">Kategori Paling Sering Dipinjam</h4>
              <RotateCcw className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Berdasarkan volume peminjaman semester ini</p>
          </div>

          <div className="my-4 space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Proyektor & Layar Portabel</span>
                <span className="font-bold text-slate-900">48% (42 Transaksi)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: "48%" }} className="h-full bg-[#1A3673]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Laptop & Unit PC Jinjing</span>
                <span className="font-bold text-slate-900">29% (25 Transaksi)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: "29%" }} className="h-full bg-blue-600" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Sound System & Audio Mic</span>
                <span className="font-bold text-slate-900">14% (12 Transaksi)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: "14%" }} className="h-full bg-cyan-600" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Kamera Dokumentasi & Tripod</span>
                <span className="font-bold text-slate-900">9% (8 Transaksi)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: "9%" }} className="h-full bg-slate-400" />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Diperbarui secara otomatis dari log transaksi
          </div>
        </div>

        {/* Card 3: SOP Peminjaman Inventaris */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-600" />
              SOP Peminjaman Inventaris
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">Ketentuan baku sirkulasi aset SMAN 70:</p>
          </div>

          <div className="my-4 space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                1
              </span>
              <p className="text-slate-700">
                Maksimal peminjaman barang elektronik pembelajaran adalah <strong>3 hari kerja</strong>.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                2
              </span>
              <p className="text-slate-700">
                Wajib melakukan pemeriksaan fisik bersama petugas sebelum barang dibawa keluar ruang inventaris.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                3
              </span>
              <p className="text-slate-700">
                Keterlambatan tanpa konfirmasi lebih dari 2 hari otomatis menerbitkan Berita Acara Teguran resmi.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-400">Revisi SOP: Juli 2026</span>
            <button
              onClick={() => showToast("Pedoman SK SOP Inventaris SMAN 70 diunduh.")}
              className="text-blue-700 font-semibold hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Unduh SK SOP Lengkap</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Design Preview Button */}
      <DesignPreviewModal currentDesignName="admin-peminjaman" />
    </div>
  );
}

