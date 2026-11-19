"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  QrCode,
  Plus,
  Bell,
  ChevronDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  LogOut,
} from "lucide-react";
import { AuthUser, getAuthUser, logoutUser } from "@/lib/api";
import BarcodeScannerModal from "./BarcodeScannerModal";

interface TopbarProps {
  breadcrumbs?: string[];
  role?: "admin" | "guru";
  onSearch?: (query: string) => void;
}

export default function Topbar({
  breadcrumbs = ["SIMINV", "Inventaris Sekolah"],
  role = "admin",
  onSearch,
}: TopbarProps) {
  const router = useRouter();
  const isAdmin = role === "admin";
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setCurrentUser(getAuthUser());
  }, []);

  const displayName = currentUser?.name || (isAdmin ? "Admin Sarpras" : "Guru");
  const displayRole = currentUser?.jabatan || (isAdmin ? "Staff Sarana Prasarana" : "Guru Pengajar");
  const displayNip = currentUser?.nip || "-";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const [searchQuery, setSearchQuery] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications: { id: number; type: string; title: string; desc: string; time: string }[] = [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      if (isAdmin) {
        router.push(`/admin/barang?q=${encodeURIComponent(searchQuery)}`);
      } else {
        router.push(`/guru/dashboard?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const handleBarcodeScanned = (code: string) => {
    setSearchQuery(code);
    if (code.startsWith("PMJ")) {
      if (isAdmin) router.push(`/admin/peminjaman?q=${code}`);
      else router.push(`/guru/peminjaman?q=${code}`);
    } else {
      router.push(`/admin/barang?q=${code}`);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-400 font-bold">&gt;</span>}
              <span className={idx === breadcrumbs.length - 1 ? "text-slate-900 font-bold" : "hover:text-slate-700 cursor-pointer"}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-xl mx-8">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder={isAdmin ? "Cari kode inventaris, barang, atau guru..." : "Cari barang tersedia, kode pinjam, nomor aset..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="absolute right-2 p-1 text-slate-400 hover:text-blue-700 rounded hover:bg-slate-200/80 transition-colors"
              title="Pindai Barcode / QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Primary Action Button */}
          {isAdmin ? (
            <Link
              href="/admin/peminjaman?action=new"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-lg text-xs font-semibold shadow-sm transition-all hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Peminjaman</span>
            </Link>
          ) : (
            <Link
              href="/guru/ajukan"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1A3673] hover:bg-[#152C5E] text-white rounded-lg text-xs font-semibold shadow-sm transition-all hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Peminjaman</span>
            </Link>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">Notifikasi & Peringatan</h4>
                  <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">
                    {notifications.length} Baru
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors text-xs">
                      <div className="flex items-start gap-2">
                        {n.type === "danger" && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                        {n.type === "warning" && <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                        {n.type === "info" && <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                        <div>
                          <p className="font-semibold text-slate-800">{n.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">{n.desc}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-center">
                  <Link
                    href={isAdmin ? "/admin/peminjaman" : "/guru/peminjaman"}
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    Lihat Semua Aktivitas
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200" />

          {/* User Profile with Portal Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#1A3673] text-white text-xs font-bold flex items-center justify-center ring-2 ring-slate-200">
                {initials}
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">{displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                  {displayRole}
                </span>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{displayName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{displayRole}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">NIP: {displayNip}</p>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      logoutUser();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanned={handleBarcodeScanned}
      />
    </>
  );
}

