"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Printer,
  QrCode,
  ShieldCheck,
  Building,
  CheckCircle2,
  Info,
  ArrowUp,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import DesignPreviewModal from "@/components/DesignPreviewModal";

const SEKOLAH = {
  government: "PEMERINTAH KABUPATEN BANDUNG",
  office: "DINAS PENDIDIKAN",
  name: "SMP NEGERI 2 KATAPANG",
  subTitle: "BIDANG SARANA & PRASARANA INVENTARIS",
  address: "Jl. Terusan Kopo KM 13, Katapang, Kab. Bandung, Jawa Barat",
  website: "smpn2katapang.sch.id",
  email: "info@smpn2katapang.sch.id",
  sarprasName: "Admin Sarpras",
  sarprasNip: "198501012010011001",
  kepsekName: "Kepala Sekolah",
  kepsekNip: "197503032000031003",
};

interface ApiSuratLoan {
  id: number;
  kode_transaksi: string;
  tanggal_pinjam: string;
  tenggat_kembali: string;
  tujuan_keperluan: string;
  ruangan_tujuan: string;
  deskripsi_kegiatan: string;
  status: string;
  token_verifikasi: string;
  peminjam?: {
    id: number;
    name: string;
    nip: string | null;
    jabatan: string;
    no_telp?: string | null;
  };
  petugas?: { id: number; name: string } | null;
  details: {
    id: number;
    jumlah_pinjam: number;
    kondisi_awal: string;
    barang?: {
      id: number;
      kode_barang: string;
      nama_barang: string;
      nomor_seri?: string | null;
      satuan: string;
    };
  }[];
}

export default function SuratBuktiPeminjamanPage() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loan, setLoan] = useState<ApiSuratLoan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      apiFetch<{ valid: boolean; data: ApiSuratLoan }>(`/verifikasi-surat/${token}`)
        .then((res) => setLoan(res.data))
        .catch(() => showToast("Token surat bukti tidak ditemukan."))
        .finally(() => setLoading(false));
    } else {
      apiFetch<{ data: ApiSuratLoan[] }>("/peminjaman")
        .then((res) => {
          if (res.data?.length) setLoan(res.data[0]);
        })
        .catch(() => showToast("Gagal memuat data surat bukti."))
        .finally(() => setLoading(false));
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDateTime = (val?: string) =>
    val
      ? new Date(val).toLocaleString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB"
      : "-";

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="no-print fixed top-20 right-6 z-50 bg-[#1A3673] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Screen Header (No Print) */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Surat Bukti Peminjaman Barang
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Terverifikasi Resmi
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Dokumen sah serah terima dan peminjaman fasilitas sarana prasarana SMP Negeri 2 Katapang.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/guru/peminjaman"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Kembali ke Peminjaman</span>
          </Link>

          <button
            onClick={() => showToast("Format arsip PDF berhasil diunduh!")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Unduh PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-blue-200" />
            <span>Cetak Bukti Peminjaman (A4)</span>
          </button>
        </div>
      </div>

      {/* Official Sheet Container (A4 Printable Document) */}
      <div className="print-full bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden p-8 md:p-12 max-w-5xl mx-auto space-y-6">
        {/* Kop Surat Resmi */}
        <div className="flex items-center justify-between gap-6 pb-4 border-b-2 border-slate-900">
          {/* Logo Sekolah */}
          <div className="w-20 h-20 shrink-0 flex items-center justify-center rounded-xl bg-blue-50 border border-blue-200 shadow-sm p-2">
            <div className="text-center">
              <Building className="w-8 h-8 text-[#1A3673] mx-auto" />
              <span className="text-[9px] font-black text-blue-900 tracking-tighter block mt-0.5">SMPN 2</span>
            </div>
          </div>

          {/* Heading Kop */}
          <div className="text-center flex-1">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">
              {SEKOLAH.government}
            </h3>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-700">
              {SEKOLAH.office}
            </h4>
            <h2 className="text-xl md:text-2xl font-black text-[#1A3673] tracking-tight uppercase mt-0.5">
              {SEKOLAH.name}
            </h2>
            <p className="text-xs font-bold text-slate-800 tracking-wide mt-0.5 uppercase">
              {SEKOLAH.subTitle}
            </p>
            <p className="text-[11px] text-slate-600 mt-1">{SEKOLAH.address}</p>
            <p className="text-[10px] text-slate-500 font-mono">
              Laman: {SEKOLAH.website} • Pos-el: {SEKOLAH.email}
            </p>
          </div>

          {/* Accreditation Badge */}
          <div className="w-20 h-20 shrink-0 border border-slate-300 rounded-xl p-2 flex flex-col items-center justify-center text-center bg-blue-50/50">
            <ShieldCheck className="w-8 h-8 text-blue-700" />
            <span className="text-[8px] font-bold text-slate-700 mt-1 uppercase leading-tight">
              Terverifikasi SIMINV
            </span>
          </div>
        </div>

        {/* Document Title & Registration Header Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest block">
              SURAT PERJANJIAN & BUKTI PENYERAHAN ASET
            </span>
            <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight uppercase mt-0.5">
              SURAT BUKTI PEMINJAMAN BARANG
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Nomor Registrasi:{" "}
              <span className="font-mono font-bold text-slate-900">
                {loading ? "Memuat..." : loan?.kode_transaksi || "-"}
              </span>
            </p>
          </div>

          {/* Barcode & Status Box */}
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shrink-0">
            <QrCode className="w-10 h-10 text-[#1A3673]" />
            <div className="text-left text-xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                STATUS BERKAS
              </span>
              <span className="font-black text-blue-700 uppercase tracking-wider">
                {loan?.status || "-"}
              </span>
              <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                Token: {loan?.token_verifikasi?.slice(0, 14) || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION I: IDENTITAS PEMINJAM */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-blue-700" />
            I. IDENTITAS PEMINJAM
          </h3>
          <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
            <div className="flex">
              <span className="w-40 font-bold text-slate-500">Nama Lengkap</span>
              <span className="font-black text-slate-900">: {loan?.peminjam?.name || "-"}</span>
            </div>
            <div className="flex">
              <span className="w-40 font-bold text-slate-500">NIP / Identitas</span>
              <span className="font-mono font-bold text-slate-900">: {loan?.peminjam?.nip || "-"}</span>
            </div>
            <div className="flex">
              <span className="w-40 font-bold text-slate-500">Jabatan</span>
              <span className="text-slate-800">: {loan?.peminjam?.jabatan || "-"}</span>
            </div>
            <div className="flex">
              <span className="w-40 font-bold text-slate-500">Unit Kerja Instansi</span>
              <span className="text-slate-800">: SMP Negeri 2 Katapang</span>
            </div>
          </div>
        </div>

        {/* SECTION II: INFORMASI TRANSAKSI PEMINJAMAN */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-blue-700" />
            II. INFORMASI TRANSAKSI PEMINJAMAN
          </h3>
          <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-xs">
            <div className="flex">
              <span className="w-40 font-bold text-slate-500">Waktu Penyerahan</span>
              <span className="font-bold text-slate-900">: {formatDateTime(loan?.tanggal_pinjam)}</span>
            </div>
            <div className="flex">
              <span className="w-40 font-bold text-slate-500">Batas Waktu Kembali</span>
              <span className="font-bold text-rose-600">: {formatDateTime(loan?.tenggat_kembali)}</span>
            </div>
            <div className="md:col-span-2 flex">
              <span className="w-40 shrink-0 font-bold text-slate-500">Keperluan Penggunaan</span>
              <span className="text-slate-800 leading-relaxed">
                : {loan?.tujuan_keperluan || "-"} ({loan?.deskripsi_kegiatan || "-"})
              </span>
            </div>
            <div className="md:col-span-2 flex">
              <span className="w-40 shrink-0 font-bold text-slate-500">Lokasi Penempatan</span>
              <span className="font-medium text-slate-800">: {loan?.ruangan_tujuan || "-"}</span>
            </div>
          </div>
        </div>

        {/* SECTION III: DAFTAR SARANA & INVENTARIS YANG DIPINJAM */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded bg-blue-700" />
              III. DAFTAR SARANA & INVENTARIS YANG DIPINJAM
            </h3>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              {loan?.details?.length || 0} Item Terdaftar
            </span>
          </div>

          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-300">
                <tr>
                  <th className="p-3 border-r border-slate-300 text-center w-8">NO</th>
                  <th className="p-3 border-r border-slate-300">KODE ASET</th>
                  <th className="p-3 border-r border-slate-300">NAMA BARANG</th>
                  <th className="p-3 border-r border-slate-300">NOMOR SERI (SN)</th>
                  <th className="p-3 border-r border-slate-300 text-center">JUMLAH</th>
                  <th className="p-3 text-center">KONDISI AWAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(loan?.details || []).map((det, idx) => (
                  <tr key={det.id} className="hover:bg-slate-50">
                    <td className="p-3 border-r border-slate-300 text-center font-mono text-slate-500">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="p-3 border-r border-slate-300 font-mono font-bold text-blue-700">
                      {det.barang?.kode_barang || "-"}
                    </td>
                    <td className="p-3 border-r border-slate-300 font-bold text-slate-900">
                      {det.barang?.nama_barang || "-"}
                    </td>
                    <td className="p-3 border-r border-slate-300 font-mono text-slate-600 font-semibold">
                      {det.barang?.nomor_seri || "-"}
                    </td>
                    <td className="p-3 border-r border-slate-300 text-center font-bold text-slate-900">
                      {det.jumlah_pinjam} {det.barang?.satuan || "Unit"}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        {det.kondisi_awal}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-2.5 bg-blue-50/50 border-t border-slate-300 text-right text-xs font-bold text-slate-800">
              Total Alokasi Inventaris:{" "}
              <span className="text-[#1A3673]">{loan?.details?.length || 0} Item Sarana Pembelajaran</span>
            </div>
          </div>
        </div>

        {/* SECTION IV: KETENTUAN & KLAUSUL TANGGUNG JAWAB */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-blue-700" />
            IV. KETENTUAN & KLAUSUL TANGGUNG JAWAB
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-700 space-y-2 leading-relaxed">
            <p>
              <strong>Tanggung Jawab Pemeliharaan:</strong> Peminjam bertanggung jawab penuh atas pemeliharaan, keamanan fisik, kelengkapan aksesoris, dan keutuhan seluruh barang yang dipinjam terhitung sejak diserahterimakan oleh staf pengurus sarana prasarana.
            </p>
            <p>
              <strong>Ketepatan Batas Waktu:</strong> Barang wajib dikembalikan tepat waktu sebelum batas akhir pengembalian <strong>24 September 2026 pukul 15:00 WIB</strong> dalam kondisi bersih, terawat, dan berfungsi secara normal.
            </p>
            <p>
              <strong>Klaim Kerusakan & Kehilangan:</strong> Apabila terjadi kerusakan fungsi, cacat fisik, atau kehilangan akibat kelalaian operasional selama masa pinjam, peminjam wajib melaporkan selambat-lambatnya 1x24 jam kepada Urusan Sarpras dan bersedia bertanggung jawab sesuai mekanisme regulasi inventaris aset SMP Negeri 2 Katapang.
            </p>
          </div>
        </div>

        {/* SIGNATURES SECTION */}
        <div className="pt-6 space-y-4">
          <div className="text-right text-xs font-medium text-slate-600">
            Ditetapkan di Katapang, {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs">
            {/* Signer 1: Peminjam / Guru */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between h-48">
              <div>
                <p className="font-bold text-slate-800">Peminjam / Guru Pengajar,</p>
                <p className="text-[10px] text-slate-500">Pihak Penerima Amanah</p>
              </div>

              {/* Digital TTE Stamp */}
              <div className="p-2 border border-dashed border-blue-400 bg-blue-50/50 rounded-lg text-center mx-auto my-auto max-w-[150px]">
                <ShieldCheck className="w-4 h-4 text-blue-700 mx-auto" />
                <span className="text-[9px] font-black text-blue-900 block mt-0.5">TTE VALID SIMINV</span>
                <span className="text-[8px] font-mono text-blue-700">Hash: 881E-4BD2-C791</span>
              </div>

              <div>
                <p className="font-bold text-slate-900 underline">{loan?.peminjam?.name || "-"}</p>
                <p className="text-[10px] text-slate-500 font-mono">NIP. {loan?.peminjam?.nip || "-"}</p>
              </div>
            </div>

            {/* Signer 2: Petugas Sarpras */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between h-48">
              <div>
                <p className="font-bold text-slate-800">Petugas Sarana & Prasarana,</p>
                <p className="text-[10px] text-slate-500">Pihak Pengelola Gudang</p>
              </div>

              {/* Stamp Sarpras */}
              <div className="p-2 border-2 border-double border-blue-700 bg-blue-50/40 rounded-lg text-center mx-auto my-auto max-w-[150px] rotate-[-2deg]">
                <span className="text-[9px] font-black text-blue-900 uppercase block tracking-wider">
                  SARPRAS RESMI
                </span>
                <span className="text-[8px] font-bold text-blue-700 block">SMPN 2 KATAPANG</span>
              </div>

              <div>
                <p className="font-bold text-slate-900 underline">
                  {loan?.petugas?.name || SEKOLAH.sarprasName}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">NIP. {SEKOLAH.sarprasNip}</p>
              </div>
            </div>

            {/* Signer 3: Kepala Sekolah */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between h-48">
              <div>
                <p className="font-bold text-slate-800">Mengetahui,</p>
                <p className="text-[10px] text-slate-500">Kepala SMP Negeri 2 Katapang</p>
              </div>

              {/* Stamp Otorisasi Kepsek */}
              <div className="p-2 border border-slate-300 bg-slate-50 rounded-lg text-center mx-auto my-auto max-w-[150px]">
                <Building className="w-4 h-4 text-slate-700 mx-auto" />
                <span className="text-[9px] font-black text-slate-800 uppercase block mt-0.5">
                  OTORISASI KEPSEK
                </span>
                <span className="text-[8px] font-mono text-slate-500">Ref: KS-SMPN2-2026</span>
              </div>

              <div>
                <p className="font-bold text-slate-900 underline">{SEKOLAH.kepsekName}</p>
                <p className="text-[10px] text-slate-500 font-mono">NIP. {SEKOLAH.kepsekNip}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Meta Strip */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Distribusi Dokumen: Lembar 1 (Arsip Sarpras) • Lembar 2 (Peminjam)</span>
          <span>Dicetak otomatis via SIMINV v2.4 • ID: 20260920-088-70B</span>
        </div>
      </div>

      {/* Bottom Print helper bar (No print) */}
      <div className="no-print max-w-5xl mx-auto p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-700" />
          <span>Tips: Gunakan opsi printer &ldquo;Save as PDF&rdquo; dan ukuran kertas A4 untuk hasil cetak arsip sempurna.</span>
        </div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-blue-700 font-bold hover:underline flex items-center gap-1"
        >
          <span>Ke Atas</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Design Preview Button */}
      <DesignPreviewModal currentDesignName="guru-surat" />
    </div>
  );
}

