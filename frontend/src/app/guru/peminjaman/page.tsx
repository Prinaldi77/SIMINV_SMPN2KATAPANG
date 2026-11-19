"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  AlertTriangle,
  FileText,
  Phone,
  Search,
  Printer,
  ChevronRight,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  Laptop,
  Tv,
  Camera,
  Radio,
  Volume2,
  Calendar,
  X,
  Info,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface ApiPeminjaman {
  id: number;
  kode_transaksi: string;
  tanggal_pinjam: string;
  tenggat_kembali: string;
  tujuan_keperluan: string;
  ruangan_tujuan: string;
  status: string;
  token_verifikasi: string;
  details: {
    id: number;
    jumlah_pinjam: number;
    barang?: { id: number; kode_barang: string; nama_barang: string; satuan: string };
  }[];
}

export default function PeminjamanSayaPage() {
  const [myLoans, setMyLoans] = useState<ApiPeminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<ApiPeminjaman | null>(null);
  const [isPerpanjanganModalOpen, setIsPerpanjanganModalOpen] = useState(false);
  const [perpanjanganDays, setPerpanjanganDays] = useState("2");
  const [perpanjanganReason, setPerpanjanganReason] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: ApiPeminjaman[] }>("/peminjaman")
      .then((res) => {
        const list = res.data || [];
        setMyLoans(list);
        if (list.length > 0) setSelectedLoan(list[0]);
      })
      .catch((err) => showToast(err.message || "Gagal memuat data peminjaman."))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filtered = myLoans.filter((loan) => {
    const q = search.toLowerCase();
    const matchSearch =
      loan.kode_transaksi.toLowerCase().includes(q) ||
      (loan.details || []).some((d) => (d.barang?.nama_barang || "").toLowerCase().includes(q));

    if (activeFilter === "Semua") return matchSearch;
    if (activeFilter === "Menunggu") return matchSearch && loan.status === "Menunggu Persetujuan";
    if (activeFilter === "Disetujui" || activeFilter === "Dipinjam")
      return matchSearch && loan.status === "Dipinjam";
    if (activeFilter === "Deadline") return matchSearch && loan.status === "Mendekati Deadline";
    return matchSearch;
  });

  const formatDate = (val?: string) =>
    val ? new Date(val).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  const handleRequestPerpanjangan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPerpanjanganModalOpen(false);
    showToast(
      `Pengajuan perpanjangan waktu untuk ${selectedLoan?.kode_transaksi || "-"} berhasil dikirim ke Petugas TU.`
    );
    setPerpanjanganReason("");
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-[#1A3673] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Peminjaman Saya</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar seluruh transaksi peminjaman aset dan sarana prasarana sekolah yang diajukan oleh Anda.
          </p>
        </div>

        <Link
          href="/guru/ajukan"
          className="flex items-center gap-2 px-4 py-2 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-blue-200" />
          <span>+ Ajukan Peminjaman Baru</span>
        </Link>
      </div>

      {/* Urgent Warning Banner */}
      <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-full shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-rose-950">1 Transaksi Jatuh Tempo Besok</h4>
              <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                Penting
              </span>
            </div>
            <p className="text-xs text-rose-800 mt-0.5 max-w-3xl leading-relaxed">
              <strong>Proyektor Epson EB-X500</strong> wajib dikembalikan ke ruang inventaris sebelum{" "}
              <strong>24 September 2026 pukul 15:00 WIB</strong> untuk menghindari keterlambatan administrasi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/guru/surat-bukti?id=PMJ-2026-088"
            className="px-3 py-1.5 bg-white border border-rose-300 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lihat Bukti Pinjam</span>
          </Link>
          <button
            onClick={() => showToast("Menghubungi nomor WhatsApp Petugas TU (Ext 104)...")}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Hubungi Petugas TU</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        {[
          { id: "Semua", label: "Semua", count: 5 },
          { id: "Menunggu", label: "Menunggu Persetujuan", count: 1 },
          { id: "Disetujui", label: "Disetujui", count: 0 },
          { id: "Dipinjam", label: "Sedang Dipinjam", count: 2 },
          { id: "Deadline", label: "Mendekati Deadline", count: 1 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeFilter === tab.id
                ? "bg-[#1A3673] text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeFilter === tab.id
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Month Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kode peminjaman atau nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 p-1.5 px-3 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Bulan Ini (September 2026)</span>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            title="Cetak Halaman"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Split Grid: Left Transactions List (8 cols) & Right Detail Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Transaction Items List */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">KODE TRANSAKSI</th>
                  <th className="px-5 py-3">DAFTAR BARANG PINJAM</th>
                  <th className="px-5 py-3">TGL PINJAM</th>
                  <th className="px-5 py-3">BATAS KEMBALI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                      {loading ? "Memuat riwayat peminjaman..." : "Belum ada transaksi peminjaman."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((loan) => {
                    const isSelected = selectedLoan?.id === loan.id;
                    const firstName = loan.details?.[0]?.barang?.nama_barang || "Barang";
                    const totalUnits = (loan.details || []).reduce((s, d) => s + d.jumlah_pinjam, 0);
                    return (
                      <tr
                        key={loan.id}
                        onClick={() => setSelectedLoan(loan)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50/70 border-l-4 border-[#1A3673]"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-[#1A3673]">{loan.kode_transaksi}</p>
                          <p className="text-[10px] text-slate-400">{loan.ruangan_tujuan}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2.5">
                            <div className="p-2 bg-slate-100 rounded-lg shrink-0 mt-0.5 text-slate-700">
                              <Laptop className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{firstName}</p>
                              <p className="text-[10px] font-mono text-slate-400">
                                {loan.details?.[0]?.barang?.kode_barang || "-"}
                              </p>
                              {loan.details.length > 1 && (
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  • {loan.details[1]?.barang?.nama_barang}
                                </p>
                              )}
                              <p className="text-[10px] font-bold text-blue-700 mt-1">
                                Total: {totalUnits} Unit Aset
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <p>{formatDate(loan.tanggal_pinjam)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p
                            className={`font-bold ${
                              loan.status === "Mendekati Deadline" || loan.status === "Terlambat"
                                ? "text-rose-600"
                                : "text-slate-800"
                            }`}
                          >
                            {formatDate(loan.tenggat_kembali)}
                          </p>
                          <span className="text-[10px] text-slate-500">{loan.status}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan <span className="font-bold text-slate-800">5</span> dari{" "}
              <span className="font-bold text-slate-800">5</span> transaksi peminjaman aktif & riwayat Anda
            </span>
            <div className="flex items-center gap-1 font-semibold">
              <button className="px-2.5 py-1 rounded text-slate-400 cursor-not-allowed">
                Sebelumnya
              </button>
              <button className="w-6 h-6 rounded bg-[#1A3673] text-white flex items-center justify-center font-bold">
                1
              </button>
              <button className="px-2.5 py-1 rounded text-slate-700 hover:bg-slate-100">
                Selanjutnya
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Detailed Selected Loan Card */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Detail Transaksi</h3>
                <p className="text-[10px] font-mono font-bold text-blue-700">
                  {selectedLoan?.kode_transaksi || "-"}
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                selectedLoan?.status === "Mendekati Deadline"
                  ? "bg-rose-100 text-rose-800"
                  : selectedLoan?.status === "Dipinjam"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {selectedLoan?.status || "-"}
            </span>
          </div>

          {/* Sub-box: Aset Dipinjam */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ASET DIPINJAM
            </span>
            <h4 className="text-sm font-black text-slate-900">
              {selectedLoan?.details?.[0]?.barang?.nama_barang || "Pilih transaksi di sebelah kiri"}
            </h4>
            {selectedLoan?.details?.[1] && (
              <p className="text-[11px] text-slate-600">
                Tambahan: {selectedLoan.details[1].barang?.nama_barang}
              </p>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
              <span>Ruang Tujuan:</span>
              <span className="font-bold text-slate-800">{selectedLoan?.ruangan_tujuan || "-"}</span>
            </div>
          </div>

          {/* Timeline Tracking */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              RIWAYAT PELACAKAN
            </span>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-slate-800">Pengajuan Dibuat</span>
                  <span className="text-[10px] text-slate-400 font-mono">20 Sep 08:00</span>
                </div>
                <p className="text-[11px] text-slate-500">Diajukan oleh Budi Santoso, M.Pd.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-slate-800">Disetujui Petugas</span>
                  <span className="text-[10px] text-slate-400 font-mono">20 Sep 08:10</span>
                </div>
                <p className="text-[11px] text-slate-500">Disetujui oleh Ahmad Fauzi (Sarpras)</p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-slate-800">Barang Fisik Diserahkan</span>
                  <span className="text-[10px] text-slate-400 font-mono">20 Sep 08:15</span>
                </div>
                <p className="text-[11px] text-slate-500">Penyerahan fisik di Ruang TU Sarpras</p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-rose-600 ring-4 ring-white animate-pulse" />
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-rose-700">Batas Pengembalian</span>
                  <span className="text-[10px] text-rose-600 font-mono font-bold">24 Sep 15:00</span>
                </div>
                <p className="text-[11px] text-rose-600 font-semibold">Jatuh tempo besok sebelum 15:00 WIB</p>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Kembalikan perangkat dalam tas pelindung resmi beserta seluruh kabel aksesoris terkait.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Link
              href={`/guru/surat-bukti?token=${selectedLoan?.token_verifikasi || ""}`}
              className="w-full py-2.5 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-blue-200" />
              <span>Unduh Surat Bukti Pinjam (PDF)</span>
            </Link>

            <button
              onClick={() => setIsPerpanjanganModalOpen(true)}
              className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Ajukan Perpanjangan Waktu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Ajukan Perpanjangan Waktu */}
      {isPerpanjanganModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                Ajukan Perpanjangan Waktu Pinjam
              </h3>
              <button
                onClick={() => setIsPerpanjanganModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestPerpanjangan} className="py-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Nomor Registrasi</label>
                <input
                  type="text"
                  disabled
                  value={selectedLoan?.kode_transaksi || ""}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Tambah Durasi Waktu</label>
                <select
                  value={perpanjanganDays}
                  onChange={(e) => setPerpanjanganDays(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="1">1 Hari Tambahan</option>
                  <option value="2">2 Hari Tambahan</option>
                  <option value="3">3 Hari Tambahan</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Alasan Perpanjangan *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Praktikum siswa kelas 9A memerlukan sesi tambahan..."
                  value={perpanjanganReason}
                  onChange={(e) => setPerpanjanganReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPerpanjanganModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-lg font-bold"
                >
                  Kirim Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Design Preview Button */}
    </div>
  );
}

