"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  Download,
  Laptop,
  Building,
  User,
  Phone,
  ArrowRight,
  X,
  FileText,
  Lock,
  Calendar,
  AlertCircle,
  Send,
  Save,
  Info,
  Check,
  ShieldCheck,
} from "lucide-react";
import { apiFetch, AuthUser, getAuthUser } from "@/lib/api";

interface ApiBarang {
  id: number;
  kode_barang: string;
  nama_barang: string;
  nomor_seri: string | null;
  jumlah: number;
  satuan: string;
  kondisi: string;
  status_ketersediaan: string;
  kategori?: { nama_kategori: string };
  ruangan?: { nama_ruangan: string };
}

export default function AjukanPeminjamanPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [availableItems, setAvailableItems] = useState<ApiBarang[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ item: ApiBarang; quantity: number }[]>([]);

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("2026-11-20T08:00");
  const [endDate, setEndDate] = useState("2026-11-20T15:00");
  const [purposeType, setPurposeType] = useState("Kegiatan Belajar Mengajar (KBM Reguler / Praktikum)");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Lab Komputer");
  const [agreePact, setAgreePact] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  useEffect(() => {
    setUser(getAuthUser());
    apiFetch<{ data: ApiBarang[] }>("/barang?status_ketersediaan=Tersedia")
      .then((res) => {
        const list = (res.data || []).filter((b) => b.jumlah > 0);
        setAvailableItems(list);
        if (list.length > 0) {
          setSelectedItems([{ item: list[0], quantity: 1 }]);
        }
      })
      .catch((err) => showToast(err.message || "Gagal memuat daftar barang tersedia."));
  }, []);

  const totalUnits = selectedItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, idx) => idx !== index));
    showToast("Barang dihapus dari daftar pengajuan.");
  };

  const handleAddItemToForm = (item: ApiBarang) => {
    if (selectedItems.some((s) => s.item.id === item.id)) {
      showToast("Barang ini sudah ada di dalam daftar!");
      return;
    }
    setSelectedItems([...selectedItems, { item, quantity: 1 }]);
    setIsAddItemModalOpen(false);
    showToast(`${item.nama_barang} berhasil ditambahkan!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreePact) {
      showToast("Harap setujui pakta integritas terlebih dahulu!");
      return;
    }
    if (selectedItems.length === 0) {
      showToast("Pilih minimal 1 barang untuk dipinjam!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch<{ data: { kode_transaksi: string } }>("/peminjaman", {
        method: "POST",
        body: JSON.stringify({
          tanggal_pinjam: startDate.replace("T", " ") + ":00",
          tenggat_kembali: endDate.replace("T", " ") + ":00",
          tujuan_keperluan: purposeType,
          ruangan_tujuan: location,
          deskripsi_kegiatan: description || purposeType,
          pakta_integritas: agreePact,
          items: selectedItems.map((s) => ({
            barang_id: s.item.id,
            jumlah: s.quantity,
          })),
        }),
      });
      setSubmittedCode(res.data?.kode_transaksi || null);
      setIsSubmittedSuccess(true);
    } catch (err: any) {
      showToast(err.message || "Gagal mengirim pengajuan peminjaman.");
    } finally {
      setSubmitting(false);
    }
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
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Ajukan Peminjaman Barang
            </h1>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded tracking-wide">
              Formulir Resmi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Isi formulir peminjaman sarana dan prasarana sekolah untuk keperluan kegiatan belajar mengajar atau acara kedinasan sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
          <Calendar className="w-4 h-4 text-blue-700" />
          <span>Tahun Ajaran 2026/2027 (Ganjil)</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Step 1 to 5 */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Data Peminjam Terverifikasi */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-[#1A3673] text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Data Peminjam Terverifikasi</h3>
                  <p className="text-[11px] text-slate-500">
                    Sinkronisasi langsung dengan Master Dapodik & SIASN Kepegawaian
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Pegawai Aktif
              </span>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Identitas peminjam diambil otomatis dari data kepegawaian aktif Anda. Apabila ada ketidaksesuaian status jabatan atau NIP, silakan hubungi Tata Usaha Sekolah.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Nama Lengkap & Gelar</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={user?.name || ""}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold pr-8 cursor-not-allowed"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">NIP / NUPTK</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={user?.nip || "-"}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono font-bold pr-8 cursor-not-allowed"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Jabatan / Penugasan</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value="Guru TIK & Ka. Lab"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold pr-8 cursor-not-allowed"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Pilih Peralatan / Aset Sekolah */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-[#1A3673] text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pilih Peralatan / Aset Sekolah</h3>
                  <p className="text-[11px] text-slate-500">
                    Catatan: Hanya aset berstatus <span className="font-bold text-emerald-700">Tersedia</span> yang dapat diajukan peminjaman.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-lg text-xs font-semibold shadow-sm shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Barang Lain</span>
              </button>
            </div>

            {/* Selected items table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">IDENTITAS & NAMA BARANG</th>
                    <th className="px-4 py-3">LOKASI ASAL</th>
                    <th className="px-4 py-3">KONDISI FISIK</th>
                    <th className="px-4 py-3 text-center">JUMLAH</th>
                    <th className="px-4 py-3 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {selectedItems.map((entry, idx) => (
                    <tr key={entry.item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg shrink-0">
                            <Laptop className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{entry.item.nama_barang}</p>
                            <p className="text-[10px] font-mono text-slate-400">
                              {entry.item.kode_barang} • {entry.item.nomor_seri || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {entry.item.ruangan?.nama_ruangan || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          {entry.item.kondisi}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-900">
                        <input
                          type="number"
                          min={1}
                          max={entry.item.jumlah}
                          value={entry.quantity}
                          onChange={(e) => {
                            const val = Math.max(1, Math.min(entry.item.jumlah, Number(e.target.value) || 1));
                            setSelectedItems(
                              selectedItems.map((s, i) => (i === idx ? { ...s, quantity: val } : s))
                            );
                          }}
                          className="w-16 p-1 text-center bg-blue-50 text-blue-900 rounded font-bold border border-blue-200"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {selectedItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                        Belum ada peralatan yang dipilih. Klik tombol &ldquo;Tambah Barang Lain&rdquo;.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Actions Bar Under Table */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                ✕ Batal
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast("Pengajuan berhasil disimpan sebagai Draf.")}
                  className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                  <span>Simpan sebagai Draf</span>
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <span>Kirim Pengajuan Peminjaman</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* STEP 3: Waktu & Durasi Peminjaman */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-[#1A3673] text-white flex items-center justify-center font-bold text-xs">
                3
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Waktu & Durasi Peminjaman</h3>
                <p className="text-[11px] text-slate-500">
                  Tentukan rentang tanggal serah terima dan kepulangan barang
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Tanggal & Waktu Pengambilan *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold"
                />
                <p className="text-[11px] text-slate-500">Jumat, 25 Sep 2026 — Pukul 08:00 WIB</p>
              </div>

              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/20 space-y-1.5">
                <label className="font-bold text-rose-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-600" />
                  Rencana Batas Pengembalian *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 bg-white border border-rose-300 rounded-lg font-mono text-xs font-bold text-rose-700"
                />
                <p className="text-[11px] text-rose-600 font-semibold">
                  Senin, 28 Sep 2026 — Maksimal Pukul 15:00 WIB
                </p>
              </div>
            </div>

            {/* Policy notice */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
              <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px]">
                <span className="font-bold text-slate-800">Kebijakan Batas Waktu Inventaris Sekolah: </span>
                Maksimal durasi peminjaman reguler adalah <strong>3 hari kerja sekolah</strong>. Untuk keperluan praktikum jangka panjang (&gt; 3 hari) wajib melampirkan formulir disposisi persetujuan dari Wakasek Sarana & Prasarana.
              </div>
            </div>
          </div>

          {/* STEP 4: Tujuan & Keperluan Peminjaman */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-[#1A3673] text-white flex items-center justify-center font-bold text-xs">
                4
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tujuan & Keperluan Peminjaman</h3>
                <p className="text-[11px] text-slate-500">
                  Keterangan resmi untuk arsip audit dan pelaporan sarpras
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Jenis Keperluan Peminjaman <span className="text-rose-600">*</span>
                </label>
                <select
                  value={purposeType}
                  onChange={(e) => setPurposeType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-600"
                >
                  <option>Kegiatan Belajar Mengajar (KBM Reguler / Praktikum)</option>
                  <option>Simulasi & Gladi Ujian Asesmen Nasional (ANBK)</option>
                  <option>Rapat Dewan Guru & Kedinasan Sekolah</option>
                  <option>Kegiatan Ekstrakurikuler & OSIS</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">
                    Deskripsi Kegiatan Secara Detail <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Maks. 300 karakter</span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={300}
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Tuliskan nama kegiatan, kelas/rombongan belajar yang terlibat, dan materi pokok.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 5: Lokasi Penggunaan & Pakta Integritas */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-[#1A3673] text-white flex items-center justify-center font-bold text-xs">
                5
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lokasi Penggunaan & Pakta Integritas</h3>
                <p className="text-[11px] text-slate-500">
                  Penetapan area penggunaan barang di lingkungan institusi
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ruangan / Lokasi Penggunaan Barang <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Barang sekolah tidak diizinkan dibawa keluar lingkungan kampus sekolah tanpa surat jalan resmi.
                </p>
              </div>

              {/* Integrity Pact Checkbox */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreePact}
                    onChange={(e) => setAgreePact(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#1A3673] focus:ring-blue-600 w-4 h-4"
                  />
                  <span className="text-[11px] text-slate-700 leading-relaxed select-none">
                    Saya bertanggung jawab penuh atas keutuhan dan keselamatan fisik barang selama masa peminjaman dan bersedia mematuhi <strong>Standar Operasional Prosedur (SOP) Inventaris SMAN 70</strong> serta menanggung perbaikan apabila terjadi kerusakan akibat kelalaian operasional.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Column (4 cols): Ringkasan & Petugas */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          {/* Card: Ringkasan Pengajuan */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold text-slate-900">Ringkasan Pengajuan</h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                REQ-DRAFT
              </span>
            </div>

            {/* Status Alur Dokumen */}
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-900 uppercase">Status Alur Dokumen</span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              </div>
              <h4 className="font-bold text-blue-950">Menunggu Persetujuan Petugas TU</h4>
              <p className="text-[11px] text-blue-800">
                Setelah dikirim, permohonan akan diverifikasi staf Sarpras.
              </p>
            </div>

            {/* Metadata Rows */}
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Peminjam</span>
                <span className="font-bold text-slate-900">{user?.name || "Guru"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Total Barang Dipinjam</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {totalUnits} Unit
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Estimasi Durasi</span>
                <span className="font-bold text-slate-800">3 Hari Kerja</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Tanggal Pinjam</span>
                <span className="font-semibold text-slate-700">25 Sep 2026, 08:00</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Jatuh Tempo Kembali</span>
                <span className="font-bold text-rose-600">28 Sep 2026, 15:00</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Kategori Keperluan</span>
                <span className="font-semibold text-slate-800">KBM & Simulasi</span>
              </div>
            </div>

            {/* Tahapan Persetujuan Progress */}
            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Tahapan Persetujuan:
              </p>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span className="text-blue-700 font-bold">1. Pengajuan</span>
                <span>2. Cek Fisik TU</span>
                <span>3. Serah Terima</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden flex">
                <div className="w-1/3 bg-[#1A3673] h-full" />
              </div>
            </div>
          </div>

          {/* Card: Petugas Sarpras Terjadwal */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Petugas Sarpras Terjadwal</span>
                <p className="font-bold text-slate-900">Admin Sarpras</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Pesawat Kantor: Ext 104 (Gedung Sarpras)
              </p>
              <p className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Jam Operasional: 07:00 – 15:30 WIB
              </p>
            </div>
          </div>

          {/* Card: Pedoman SOP Sarpras */}
          <div
            onClick={() => showToast("Buku pedoman SOP Sarpras SMPN 2 Katapang siap dibaca.")}
            className="p-3.5 rounded-xl bg-[#1A3673] text-white flex items-center justify-between cursor-pointer hover:bg-[#152C5E] transition-all shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg group-hover:scale-105 transition-transform">
                <Download className="w-4 h-4 text-blue-200" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Pedoman SOP Sarpras</h4>
                <p className="text-[10px] text-blue-200">Unduh berkas PDF aturan pinjam</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </form>

      {/* Modal: Tambah Barang Lain ke Form */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Pilih Aset Tersedia untuk Dipinjam</h3>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-2 max-h-96 overflow-y-auto">
              {availableItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 truncate">{item.nama_barang}</p>
                    <p className="text-[10px] font-mono text-slate-500">
                      {item.kode_barang} • {item.ruangan?.nama_ruangan || "-"}
                    </p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                      Tersedia ({item.jumlah} {item.satuan})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddItemToForm(item)}
                    className="px-3 py-1.5 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-lg text-xs font-semibold shrink-0"
                  >
                    + Pilih
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSubmittedSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in zoom-in-95">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Pengajuan Berhasil Dikirim! {submittedCode ? `(${submittedCode})` : ""}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kode permohonan: <strong className="font-mono text-blue-900">PMJ-2026-093</strong>
              </p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Staf Sarpras akan memverifikasi permohonan Anda. Anda dapat memantau status secara langsung di halaman &ldquo;Peminjaman Saya&rdquo;.
              </p>
            </div>
            <div className="pt-2 flex gap-2">
              <Link
                href="/guru/peminjaman"
                className="flex-1 py-2.5 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Lihat Peminjaman Saya
              </Link>
              <Link
                href={`/guru/surat-bukti?id=PMJ-2026-093`}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Lihat Bukti Pengajuan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Floating Design Preview Button */}
    </div>
  );
}

