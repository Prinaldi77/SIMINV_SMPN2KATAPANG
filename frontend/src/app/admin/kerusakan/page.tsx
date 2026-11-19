"use client";

import React, { useEffect, useState } from "react";
import { Wrench, Plus, X, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface KerusakanRow {
  id: number;
  deskripsi_kerusakan: string;
  tingkat_kerusakan: "Ringan" | "Berat";
  status_tindakan: "Verifikasi" | "Vendor" | "Selesai";
  biaya_perbaikan: string | number;
  created_at: string;
  barang?: { id: number; kode_barang: string; nama_barang: string; status_ketersediaan: string };
  pelapor?: { id: number; name: string; role: string; jabatan: string };
}

interface BarangOption {
  id: number;
  kode_barang: string;
  nama_barang: string;
}

export default function AdminKerusakanPage() {
  const [rows, setRows] = useState<KerusakanRow[]>([]);
  const [barangs, setBarangs] = useState<BarangOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    barang_id: "",
    deskripsi_kerusakan: "",
    tingkat_kerusakan: "Ringan" as "Ringan" | "Berat",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [kerRes, brgRes] = await Promise.all([
        apiFetch<{ data: KerusakanRow[] }>("/kerusakan"),
        apiFetch<{ data: BarangOption[] }>("/barang"),
      ]);
      setRows(kerRes.data || []);
      setBarangs(brgRes.data || []);
      if (brgRes.data?.length && !form.barang_id) {
        setForm((prev) => ({ ...prev, barang_id: String(brgRes.data[0].id) }));
      }
    } catch (err: any) {
      showToast(err.message || "Gagal memuat data kerusakan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch("/kerusakan", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setIsAddOpen(false);
      setForm((prev) => ({ ...prev, deskripsi_kerusakan: "" }));
      showToast("Laporan kerusakan berhasil dicatat!");
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan laporan kerusakan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (row: KerusakanRow, status_tindakan: "Vendor" | "Selesai") => {
    let biaya = Number(row.biaya_perbaikan || 0);
    if (status_tindakan === "Selesai") {
      const input = prompt("Masukkan biaya perbaikan (Rp):", String(biaya));
      if (input === null) return;
      biaya = Number(input) || 0;
    }

    try {
      await apiFetch(`/kerusakan/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({ status_tindakan, biaya_perbaikan: biaya }),
      });
      showToast(`Status kerusakan diperbarui ke "${status_tindakan}".`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal memperbarui status.");
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#1A3673] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Riwayat & Laporan Kerusakan</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau laporan insiden kerusakan barang, penanganan vendor, dan pemulihan aset.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-lg text-xs font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Lapor Kerusakan</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">BARANG</th>
                <th className="px-5 py-3">PELAPOR</th>
                <th className="px-5 py-3">DESKRIPSI KERUSAKAN</th>
                <th className="px-5 py-3">TINGKAT</th>
                <th className="px-5 py-3">TINDAKAN</th>
                <th className="px-5 py-3">BIAYA</th>
                <th className="px-5 py-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    {loading ? "Memuat data kerusakan..." : "Belum ada laporan kerusakan."}
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{r.barang?.nama_barang || "-"}</p>
                      <p className="text-[10px] font-mono text-blue-700">{r.barang?.kode_barang || "-"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{r.pelapor?.name || "-"}</p>
                      <p className="text-[10px] text-slate-400">{r.pelapor?.jabatan || "-"}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs">{r.deskripsi_kerusakan}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          r.tingkat_kerusakan === "Berat"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {r.tingkat_kerusakan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          r.status_tindakan === "Selesai"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : r.status_tindakan === "Vendor"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {r.status_tindakan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      Rp {Number(r.biaya_perbaikan || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status_tindakan === "Verifikasi" && (
                          <button
                            onClick={() => handleUpdateStatus(r, "Vendor")}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                          >
                            Kirim Vendor
                          </button>
                        )}
                        {r.status_tindakan !== "Selesai" && (
                          <button
                            onClick={() => handleUpdateStatus(r, "Selesai")}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                          >
                            Selesai
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-rose-600" />
                Lapor Kerusakan Barang
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pilih Barang</label>
                <select
                  value={form.barang_id}
                  onChange={(e) => setForm({ ...form, barang_id: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {barangs.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.kode_barang} - {b.nama_barang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tingkat Kerusakan</label>
                <select
                  value={form.tingkat_kerusakan}
                  onChange={(e) => setForm({ ...form, tingkat_kerusakan: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="Ringan">Ringan</option>
                  <option value="Berat">Berat</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Deskripsi Kerusakan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan kondisi kerusakan barang..."
                  value={form.deskripsi_kerusakan}
                  onChange={(e) => setForm({ ...form, deskripsi_kerusakan: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#1A3673] hover:bg-[#152C5E] disabled:opacity-60 text-white rounded-lg font-semibold"
                >
                  {submitting ? "Mengirim..." : "Kirim Laporan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
