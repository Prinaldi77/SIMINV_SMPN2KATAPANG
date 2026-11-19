"use client";

import React, { useEffect, useState } from "react";
import {
  Printer,
  Download,
  UserCheck,
  Building,
  QrCode,
  Info,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import DesignPreviewModal from "@/components/DesignPreviewModal";

interface RuanganSummary {
  id: number;
  kode_ruangan: string;
  nama_ruangan: string;
  gedung: string;
  lantai: string;
  barang_count?: number;
  penanggung_jawab?: {
    id: number;
    name: string;
    nip: string | null;
    jabatan: string;
  } | null;
}

interface KirBarang {
  id: number;
  kode_barang: string;
  nama_barang: string;
  spesifikasi: string;
  nomor_seri: string | null;
  tahun_pengadaan: number;
  jumlah: number;
  satuan: string;
  kondisi: "Baik" | "Rusak Ringan" | "Rusak Berat";
  status_ketersediaan: string;
  kategori?: {
    id: number;
    kode_kategori: string;
    nama_kategori: string;
  };
}

interface KirDetail extends RuanganSummary {
  barang: KirBarang[];
}

const SEKOLAH = {
  ministry: "PEMERINTAH KABUPATEN BANDUNG",
  office: "DINAS PENDIDIKAN",
  name: "SMP NEGERI 2 KATAPANG",
  address: "Jl. Terusan Kopo KM 13, Katapang, Kab. Bandung, Jawa Barat",
  website: "smpn2katapang.sch.id",
  email: "info@smpn2katapang.sch.id",
  sarprasName: "Admin Sarpras",
  sarprasNip: "198501012010011001",
  kepsekName: "Kepala Sekolah",
  kepsekNip: "197503032000031003",
};

export default function KartuInventarisRuanganPage() {
  const [rooms, setRooms] = useState<RuanganSummary[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [kirData, setKirData] = useState<KirDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: RuanganSummary[] }>("/ruangan")
      .then((res) => {
        const list = res.data || [];
        setRooms(list);
        if (list.length > 0) {
          setSelectedRoomId(list[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        showToast(err.message || "Gagal memuat daftar ruangan.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedRoomId) return;
    setLoading(true);
    apiFetch<{ data: KirDetail }>(`/ruangan/${selectedRoomId}/kir`)
      .then((res) => setKirData(res.data))
      .catch((err) => showToast(err.message || "Gagal memuat data KIR."))
      .finally(() => setLoading(false));
  }, [selectedRoomId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePrintKIR = () => {
    window.print();
  };

  const items = kirData?.barang || [];
  const totalUnits = items.reduce((sum, i) => sum + i.jumlah, 0);
  const goodCount = items.filter((i) => i.kondisi === "Baik").reduce((s, i) => s + i.jumlah, 0);
  const lightCount = items.filter((i) => i.kondisi === "Rusak Ringan").reduce((s, i) => s + i.jumlah, 0);
  const heavyCount = items.filter((i) => i.kondisi === "Rusak Berat").reduce((s, i) => s + i.jumlah, 0);
  const pct = (val: number) => (totalUnits > 0 ? Math.round((val / totalUnits) * 100) : 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="no-print fixed top-20 right-6 z-50 bg-[#1A3673] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Screen Header (Hidden on print) */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded tracking-wide">
              MODUL RESMI
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              • Formulir Standar Permendikbudristek No. 48
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Kartu Inventaris Ruangan (KIR)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar inventaris sarana dan prasarana per ruangan sesuai standar administrasi sekolah resmi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast("Modal ganti penanggung jawab ruangan dibuka.")}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Ubah Penanggung Jawab</span>
          </button>

          <button
            onClick={() => showToast("Format Excel KIR siap diunduh.")}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handlePrintKIR}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-blue-200" />
            <span>Cetak KIR Resmi (A4)</span>
          </button>
        </div>
      </div>

      {/* Room Selector Tabs (Hidden on print) */}
      <div className="no-print space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>PILIH UNIT KERJA / RUANGAN</span>
          <span className="text-[11px] text-slate-400">Total Terdaftar: {rooms.length} Ruangan Aktif</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {rooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-[#1A3673] text-white border-[#1A3673] shadow-md"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-white/10 text-white" : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {room.nama_ruangan}
                    </p>
                    <p className={`text-[11px] ${isSelected ? "text-blue-200" : "text-slate-400"}`}>
                      {room.barang_count ?? 0} Jenis Aset
                    </p>
                  </div>
                </div>
                {isSelected && <span className="w-2 h-2 rounded-full bg-blue-300" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Room Detail Metric Cards (Hidden on print) */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Room Info */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              {kirData?.kode_ruangan || "-"}
            </span>
            <Building className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-black text-slate-900">{kirData?.nama_ruangan || "Memuat..."}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {kirData ? `${kirData.gedung} • ${kirData.lantai}` : "-"}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
            <span>Total Unit Fisik</span>
            <span className="font-bold text-slate-800">{totalUnits} Unit</span>
          </div>
        </div>

        {/* Responsible Person */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Penanggung Jawab Ruangan
            </span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
              PJ
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {kirData?.penanggung_jawab?.name || "Belum Ditentukan"}
              </h3>
              <p className="text-[10px] font-mono text-slate-500">
                NIP : {kirData?.penanggung_jawab?.nip || "-"}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-blue-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            {kirData?.penanggung_jawab?.jabatan || "Penanggung Jawab Ruang"}
          </div>
        </div>

        {/* Physical Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Status Fisik Aset
            </span>
            <FileCheck2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" /> Baik (B)
              </span>
              <span className="font-bold text-slate-800">
                {goodCount} Unit ({pct(goodCount)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Rusak Ringan (RR)
              </span>
              <span className="font-bold text-slate-800">
                {lightCount} Unit ({pct(lightCount)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Rusak Berat (RB)
              </span>
              <span className="font-bold text-slate-800">
                {heavyCount} Unit ({pct(heavyCount)}%)
              </span>
            </div>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
            <div style={{ width: `${pct(goodCount)}%` }} className="bg-blue-600" />
            <div style={{ width: `${pct(lightCount)}%` }} className="bg-amber-500" />
            <div style={{ width: `${pct(heavyCount)}%` }} className="bg-red-500" />
          </div>
        </div>
      </div>

      {/* Official KIR Sheet Paper (A4 Printable Document) */}
      <div className="print-full bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden p-8 md:p-12 max-w-5xl mx-auto space-y-6">
        {/* Verification Strip */}
        <div className="no-print flex items-center justify-between pb-4 border-b border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">
              Lembar Formulir Inventaris Sah - Format F-KIR/SMPN2KTP
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Dicetak pada: {new Date().toLocaleDateString("id-ID")}</span>
            <span className="px-2.5 py-0.5 rounded bg-[#1A3673] text-white font-bold text-[10px] tracking-wider uppercase">
              Dokumen Asli
            </span>
          </div>
        </div>

        {/* Kop Surat Resmi */}
        <div className="flex items-center justify-between gap-6 pb-4 border-b-2 border-slate-800">
          {/* Logo Sekolah */}
          <div className="w-20 h-20 shrink-0 flex items-center justify-center rounded-xl bg-blue-50 border border-blue-200 shadow-sm p-2">
            <div className="text-center">
              <Building className="w-8 h-8 text-[#1A3673] mx-auto" />
              <span className="text-[9px] font-black text-blue-900 tracking-tighter block mt-0.5">SMPN 2</span>
            </div>
          </div>

          {/* Heading Teks Kop */}
          <div className="text-center flex-1">
            <h3 className="text-xs md:text-sm font-bold tracking-wide uppercase text-slate-800">
              {SEKOLAH.ministry}
            </h3>
            <h4 className="text-xs font-semibold tracking-wide uppercase text-slate-700">
              {SEKOLAH.office}
            </h4>
            <h2 className="text-xl md:text-2xl font-black text-[#1A3673] tracking-tight uppercase mt-0.5">
              {SEKOLAH.name}
            </h2>
            <p className="text-[11px] text-slate-600 mt-1">{SEKOLAH.address}</p>
            <p className="text-[10px] text-slate-500 font-mono">
              Laman: {SEKOLAH.website} • Pos-el: {SEKOLAH.email}
            </p>
          </div>

          {/* QR Verification Seal */}
          <div className="w-20 h-20 shrink-0 border border-slate-300 rounded-xl p-1.5 flex flex-col items-center justify-center text-center bg-slate-50">
            <QrCode className="w-9 h-9 text-[#1A3673]" />
            <span className="text-[8px] font-mono font-bold text-slate-600 mt-1 leading-none">
              VALID-KIR-2026
            </span>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center space-y-1">
          <h2 className="text-base md:text-lg font-black tracking-tight text-slate-900 underline uppercase">
            KARTU INVENTARIS RUANGAN (KIR)
          </h2>
          <p className="text-xs font-bold text-slate-600">TAHUN AJARAN 2026 / 2027</p>
        </div>

        {/* Room Information Grid */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
          <div className="flex">
            <span className="w-32 font-bold text-slate-600 uppercase">RUANGAN</span>
            <span className="font-black text-[#1A3673] uppercase">: {kirData?.nama_ruangan || "-"}</span>
          </div>
          <div className="flex">
            <span className="w-36 font-bold text-slate-600 uppercase">PENANGGUNG JAWAB</span>
            <span className="font-bold text-slate-900">: {kirData?.penanggung_jawab?.name || "-"}</span>
          </div>
          <div className="flex">
            <span className="w-32 font-bold text-slate-600 uppercase">KODE RUANG</span>
            <span className="font-mono font-bold text-slate-800">: {kirData?.kode_ruangan || "-"}</span>
          </div>
          <div className="flex">
            <span className="w-36 font-bold text-slate-600 uppercase">NIP / IDENTITAS</span>
            <span className="font-mono text-slate-700">: {kirData?.penanggung_jawab?.nip || "-"}</span>
          </div>
          <div className="flex">
            <span className="w-32 font-bold text-slate-600 uppercase">LOKASI / GEDUNG</span>
            <span className="text-slate-800">
              : {kirData ? `${kirData.gedung} (${kirData.lantai})` : "-"}
            </span>
          </div>
          <div className="flex">
            <span className="w-36 font-bold text-slate-600 uppercase">TOTAL ASET FISIK</span>
            <span className="font-bold text-blue-700">
              : {totalUnits} Unit ({items.length} Jenis Barang)
            </span>
          </div>
        </div>

        {/* Official Table */}
        <div className="overflow-x-auto border border-slate-300 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-300">
              <tr>
                <th className="p-2.5 border-r border-slate-300 text-center w-8">NO</th>
                <th className="p-2.5 border-r border-slate-300">KODE BARANG</th>
                <th className="p-2.5 border-r border-slate-300">NAMA BARANG</th>
                <th className="p-2.5 border-r border-slate-300">SPESIFIKASI / KATEGORI</th>
                <th className="p-2.5 border-r border-slate-300">NOMOR SERI</th>
                <th className="p-2.5 border-r border-slate-300 text-center">TAHUN</th>
                <th className="p-2.5 border-r border-slate-300 text-center">JUMLAH</th>
                <th className="p-2.5 border-r border-slate-300 text-center">KONDISI</th>
                <th className="p-2.5 border-r border-slate-300">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-400">
                    {loading ? "Memuat data KIR ruangan..." : "Belum ada barang tercatat di ruangan ini."}
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => (
                  <tr key={it.id} className="hover:bg-slate-50">
                    <td className="p-2.5 border-r border-slate-300 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 border-r border-slate-300 font-mono font-bold text-blue-700">
                      {it.kode_barang}
                    </td>
                    <td className="p-2.5 border-r border-slate-300 font-bold text-slate-900">{it.nama_barang}</td>
                    <td className="p-2.5 border-r border-slate-300 text-slate-700">
                      {it.kategori?.nama_kategori || "-"} — {it.spesifikasi}
                    </td>
                    <td className="p-2.5 border-r border-slate-300 font-mono text-slate-600">
                      {it.nomor_seri || "-"}
                    </td>
                    <td className="p-2.5 border-r border-slate-300 text-center font-mono">{it.tahun_pengadaan}</td>
                    <td className="p-2.5 border-r border-slate-300 text-center font-bold text-slate-800">
                      {it.jumlah} {it.satuan}
                    </td>
                    <td className="p-2.5 border-r border-slate-300 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          it.kondisi === "Baik"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            it.kondisi === "Baik" ? "bg-blue-600" : "bg-amber-600"
                          }`}
                        />
                        {it.kondisi}
                      </span>
                    </td>
                    <td className="p-2.5 border-r border-slate-300 text-slate-600 text-[11px]">
                      {it.status_ketersediaan}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footnote Notice */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Catatan: Setiap mutasi, pemindahan keluar ruangan, atau kerusakan barang wajib dilaporkan dalam waktu 1x24 jam kepada Pengurus Barang.
            </span>
          </div>
          <span className="font-mono text-slate-400 whitespace-nowrap pl-4">Halaman 1 dari 1</span>
        </div>

        {/* 3 Official Signatures */}
        <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs">
          {/* Signer 1: Pengurus Barang */}
          <div className="space-y-16">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-bold text-slate-800">Pengurus / Pengelola Barang</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 underline">{SEKOLAH.sarprasName}</p>
              <p className="text-[11px] text-slate-500 font-mono">NIP. {SEKOLAH.sarprasNip}</p>
            </div>
          </div>

          {/* Signer 2: Penanggung Jawab Ruangan */}
          <div className="space-y-16">
            <div>
              <p className="text-slate-500">Dibuat di Katapang, {new Date().toLocaleDateString("id-ID")}</p>
              <p className="font-bold text-slate-800">Penanggung Jawab Ruangan</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 underline">{kirData?.penanggung_jawab?.name || "-"}</p>
              <p className="text-[11px] text-slate-500 font-mono">NIP. {kirData?.penanggung_jawab?.nip || "-"}</p>
            </div>
          </div>

          {/* Signer 3: Kepala Sekolah */}
          <div className="space-y-16">
            <div>
              <p className="text-slate-500">Mengesahkan,</p>
              <p className="font-bold text-slate-800">Kepala Sekolah SMPN 2 Katapang</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 underline">{SEKOLAH.kepsekName}</p>
              <p className="text-[11px] text-slate-500 font-mono">NIP. {SEKOLAH.kepsekNip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Design Preview Button */}
      <DesignPreviewModal currentDesignName="admin-kir" />
    </div>
  );
}

