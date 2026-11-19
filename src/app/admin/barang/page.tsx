"use client";

import React, { useEffect, useState } from "react";
import {
  Package,
  CheckCircle2,
  Share2,
  Wrench,
  Search,
  QrCode,
  RotateCcw,
  Upload,
  Download,
  Plus,
  DoorOpen,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { apiFetch, getAuthUser } from "@/lib/api";
import DesignPreviewModal from "@/components/DesignPreviewModal";
import BarcodeScannerModal from "@/components/BarcodeScannerModal";

interface KategoriOption {
  id: number;
  kode_kategori: string;
  nama_kategori: string;
}

interface RuanganOption {
  id: number;
  kode_ruangan: string;
  nama_ruangan: string;
}

interface BarangItem {
  id: number;
  kode_barang: string;
  nama_barang: string;
  spesifikasi: string;
  nomor_seri: string | null;
  kategori_id: number;
  ruangan_id: number;
  kondisi: "Baik" | "Rusak Ringan" | "Rusak Berat";
  status_ketersediaan: "Tersedia" | "Dipinjam" | "Dalam Perbaikan" | "Dihapuskan";
  tahun_pengadaan: number;
  jumlah: number;
  satuan: string;
  gambar_url: string | null;
  kategori?: KategoriOption;
  ruangan?: RuanganOption;
}

export default function DataBarangPage() {
  const [items, setItems] = useState<BarangItem[]>([]);
  const [categories, setCategories] = useState<KategoriOption[]>([]);
  const [rooms, setRooms] = useState<RuanganOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [roomFilter, setRoomFilter] = useState("Semua");
  const [conditionFilter, setConditionFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [gambarFile, setGambarFile] = useState<File | null>(null);

  const [newItem, setNewItem] = useState({
    kode_barang: "",
    nama_barang: "",
    spesifikasi: "",
    nomor_seri: "",
    kategori_id: "",
    ruangan_id: "",
    kondisi: "Baik",
    status_ketersediaan: "Tersedia",
    jumlah: 1,
    satuan: "Unit",
    tahun_pengadaan: new Date().getFullYear(),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [brgRes, katRes, rngRes] = await Promise.all([
        apiFetch<{ data: BarangItem[] }>("/barang"),
        apiFetch<{ data: KategoriOption[] }>("/kategori"),
        apiFetch<{ data: RuanganOption[] }>("/ruangan"),
      ]);
      setItems(brgRes.data || []);
      setCategories(katRes.data || []);
      setRooms(rngRes.data || []);

      if (katRes.data?.length && !newItem.kategori_id) {
        setNewItem((prev) => ({
          ...prev,
          kategori_id: String(katRes.data[0].id),
          ruangan_id: rngRes.data?.[0] ? String(rngRes.data[0].id) : "",
        }));
      }
    } catch (err: any) {
      showToast(err.message || "Gagal memuat data barang.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsAdmin(getAuthUser()?.role === "admin");
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetFilter = () => {
    setSearch("");
    setCategoryFilter("Semua");
    setRoomFilter("Semua");
    setConditionFilter("Semua");
    setStatusFilter("Semua");
  };

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      item.nama_barang.toLowerCase().includes(q) ||
      item.kode_barang.toLowerCase().includes(q) ||
      (item.nomor_seri || "").toLowerCase().includes(q);
    const matchCat = categoryFilter === "Semua" || String(item.kategori_id) === categoryFilter;
    const matchRoom = roomFilter === "Semua" || String(item.ruangan_id) === roomFilter;
    const matchCond = conditionFilter === "Semua" || item.kondisi === conditionFilter;
    const matchStatus = statusFilter === "Semua" || item.status_ketersediaan === statusFilter;
    return matchSearch && matchCat && matchRoom && matchCond && matchStatus;
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.nama_barang || !newItem.kode_barang) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("kode_barang", newItem.kode_barang);
      formData.append("nama_barang", newItem.nama_barang);
      formData.append("spesifikasi", newItem.spesifikasi || "-");
      if (newItem.nomor_seri) formData.append("nomor_seri", newItem.nomor_seri);
      formData.append("kategori_id", newItem.kategori_id);
      formData.append("ruangan_id", newItem.ruangan_id);
      formData.append("kondisi", newItem.kondisi);
      formData.append("status_ketersediaan", newItem.status_ketersediaan);
      formData.append("tahun_pengadaan", String(newItem.tahun_pengadaan));
      formData.append("jumlah", String(newItem.jumlah));
      formData.append("satuan", newItem.satuan);
      if (gambarFile) formData.append("gambar", gambarFile);

      await apiFetch("/barang", { method: "POST", body: formData });
      setIsAddModalOpen(false);
      setGambarFile(null);
      setNewItem((prev) => ({
        ...prev,
        kode_barang: "",
        nama_barang: "",
        spesifikasi: "",
        nomor_seri: "",
        jumlah: 1,
      }));
      showToast(`Barang "${newItem.nama_barang}" berhasil ditambahkan ke PostgreSQL!`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal menambah barang.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (item: BarangItem) => {
    if (!confirm(`Hapus barang "${item.nama_barang}" (${item.kode_barang})?`)) return;
    try {
      await apiFetch(`/barang/${item.id}`, { method: "DELETE" });
      showToast(`Barang "${item.nama_barang}" berhasil dihapus.`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus barang.");
    }
  };

  const totalUnits = items.reduce((s, i) => s + i.jumlah, 0);
  const countTersedia = items.filter((i) => i.status_ketersediaan === "Tersedia").length;
  const countDipinjam = items.filter((i) => i.status_ketersediaan === "Dipinjam").length;
  const countPerbaikan = items.filter((i) => i.status_ketersediaan === "Dalam Perbaikan").length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1A3673] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded tracking-wide">
              MODUL ASET
            </span>
            <span className="text-[11px] text-slate-400 font-mono">v2.4.0</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data Barang</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola seluruh aset, peralatan belajar, dan inventaris yang dimiliki sekolah secara terpadu.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast("Fitur Import Excel siap menerima format .xlsx/.csv")}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Excel</span>
          </button>
          <button
            onClick={() => showToast("Laporan aset berhasil diunduh!")}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Laporan</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Barang Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Inventaris</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{loading ? "..." : totalUnits}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{items.length} Jenis Barang</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Barang Tersedia</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{loading ? "..." : countTersedia}</p>
            <p className="text-[11px] font-semibold text-blue-600 mt-0.5">Siap Dipinjam</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sedang Dipinjam</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{loading ? "..." : countDipinjam}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Stok Habis Dipinjam</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Share2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Perlu Perbaikan</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{loading ? "..." : countPerbaikan}</p>
            <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Dalam Perbaikan</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kode barang, nama barang, atau nomor seri..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
            <button
              onClick={() => setIsScannerOpen(true)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-blue-700"
              title="Pindai QR"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleResetFilter}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>

        {/* 4 Select Dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Kategori</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.nama_kategori}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Penempatan Ruangan</label>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Semua">Semua Ruangan</option>
              {rooms.map((rm) => (
                <option key={rm.id} value={String(rm.id)}>
                  {rm.nama_ruangan}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Kondisi Fisik</label>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Semua">Semua Kondisi</option>
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Status Ketersediaan</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Semua">Semua Status</option>
              <option value="Tersedia">Tersedia</option>
              <option value="Dipinjam">Dipinjam</option>
              <option value="Dalam Perbaikan">Dalam Perbaikan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table: Daftar Aset Terdaftar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Daftar Aset Terdaftar</h3>
            <span className="text-xs text-slate-400 font-mono">Halaman 1 / 85</span>
          </div>
          <span className="text-[11px] text-blue-700 flex items-center gap-1 font-medium">
            <Check className="w-3.5 h-3.5 text-blue-600" />
            Terakhir sinkronisasi: Hari ini, 09:41 WIB
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 w-12">NO</th>
                <th className="px-5 py-3">KODE BARANG</th>
                <th className="px-5 py-3">NAMA BARANG & SPESIFIKASI</th>
                <th className="px-5 py-3">KATEGORI</th>
                <th className="px-5 py-3">RUANGAN</th>
                <th className="px-5 py-3">STOK</th>
                <th className="px-5 py-3">STATUS</th>
                {isAdmin && <th className="px-5 py-3 text-right">AKSI</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="px-5 py-8 text-center text-slate-400">
                    {loading ? "Memuat data barang..." : "Tidak ada barang yang sesuai filter."}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 text-slate-400 font-mono">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="px-5 py-3.5 font-mono">
                      <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                        <QrCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.kode_barang}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {item.gambar_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.gambar_url}
                            alt={item.nama_barang}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{item.nama_barang}</p>
                          <p className="text-[11px] text-slate-500 max-w-md truncate">{item.spesifikasi}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {item.kategori?.nama_kategori || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.ruangan?.nama_ruangan || "-"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">
                      {item.jumlah} {item.satuan}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status_ketersediaan === "Tersedia"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status_ketersediaan === "Dipinjam"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {item.status_ketersediaan}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Barang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <p>
              Menampilkan <span className="font-bold text-slate-800">1–{filteredItems.length}</span> dari{" "}
              <span className="font-bold text-slate-800">842</span> data barang
            </p>
            <div className="flex items-center gap-1.5">
              <span>Baris per halaman:</span>
              <select className="p-1 border border-slate-300 rounded bg-white text-xs font-semibold">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
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
              85
            </button>
            <button className="px-2.5 py-1 rounded text-slate-700 hover:bg-slate-100">
              Selanjutnya &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Tambah Barang Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Tambah Barang Baru ke Inventaris
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kode Barang</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: BRG-003"
                    value={newItem.kode_barang}
                    onChange={(e) => setNewItem({ ...newItem, kode_barang: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Seri (SN)</label>
                  <input
                    type="text"
                    placeholder="Contoh: SN-EPS-12345"
                    value={newItem.nomor_seri}
                    onChange={(e) => setNewItem({ ...newItem, nomor_seri: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Barang</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Proyektor InFocus IN112AA"
                  value={newItem.nama_barang}
                  onChange={(e) => setNewItem({ ...newItem, nama_barang: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Spesifikasi Singkat</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Resolusi, kapasitas, daya, atau kelengkapan..."
                  value={newItem.spesifikasi}
                  onChange={(e) => setNewItem({ ...newItem, spesifikasi: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={newItem.kategori_id}
                    onChange={(e) => setNewItem({ ...newItem, kategori_id: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        {cat.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Penempatan Ruangan</label>
                  <select
                    value={newItem.ruangan_id}
                    onChange={(e) => setNewItem({ ...newItem, ruangan_id: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    {rooms.map((rm) => (
                      <option key={rm.id} value={String(rm.id)}>
                        {rm.nama_ruangan}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jumlah</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newItem.jumlah}
                    onChange={(e) => setNewItem({ ...newItem, jumlah: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Satuan</label>
                  <input
                    type="text"
                    required
                    value={newItem.satuan}
                    onChange={(e) => setNewItem({ ...newItem, satuan: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tahun</label>
                  <input
                    type="number"
                    required
                    value={newItem.tahun_pengadaan}
                    onChange={(e) => setNewItem({ ...newItem, tahun_pengadaan: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Foto Barang (Opsional)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setGambarFile(e.target.files?.[0] || null)}
                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#1A3673] hover:bg-[#152C5E] disabled:opacity-60 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {submitting ? "Menyimpan..." : "Simpan Barang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Design Preview Button */}
      <DesignPreviewModal currentDesignName="admin-barang" />
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanned={(code) => setSearch(code)}
      />
    </div>
  );
}

