"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  DoorOpen,
  Boxes,
  ArrowLeftRight,
  ClipboardList,
  RotateCcw,
  Clock,
  History,
  FileSpreadsheet,
  FileText,
  FileCheck2,
  Users,
  UserCog,
  Wrench,
  ShieldCheck,
  User,
  PlusCircle,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import { logoutUser } from "@/lib/api";

interface SidebarProps {
  role?: "admin" | "guru";
}

export default function Sidebar({ role = "admin" }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === "admin";

  const adminMenu = [
    {
      group: "UTAMA",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      group: "MANAJEMEN ASET",
      items: [
        { label: "Data Barang", href: "/admin/barang", icon: Package },
        { label: "Barang Masuk", href: "/admin/barang?tab=masuk", icon: PackagePlus },
        { label: "Ruangan", href: "/admin/kir", icon: DoorOpen },
        { label: "Kategori Barang", href: "/admin/barang?tab=kategori", icon: Boxes },
        { label: "Penempatan Barang", href: "/admin/kir", icon: ArrowLeftRight },
      ],
    },
    {
      group: "PEMINJAMAN & SIRKULASI",
      items: [
        { label: "Peminjaman", href: "/admin/peminjaman", icon: ClipboardList },
        { label: "Pengembalian", href: "/admin/peminjaman?status=Dikembalikan", icon: RotateCcw },
        { label: "Jatuh Tempo", href: "/admin/peminjaman?status=Deadline", icon: Clock, badge: "3", badgeColor: "bg-red-500 text-white" },
        { label: "Riwayat Peminjaman", href: "/admin/peminjaman?status=Semua", icon: History },
      ],
    },
    {
      group: "LAPORAN",
      items: [
        { label: "Laporan Inventaris", href: "/admin/barang?export=true", icon: FileSpreadsheet },
        { label: "Kartu Inventaris Ruangan", href: "/admin/kir", icon: FileCheck2 },
        { label: "Laporan Peminjaman", href: "/admin/peminjaman?tab=laporan", icon: FileText },
      ],
    },
    {
      group: "SISTEM",
      items: [
        { label: "Data Guru & Pengguna", href: "/admin/users", icon: Users },
        { label: "Laporan Kerusakan", href: "/admin/kerusakan", icon: Wrench },
      ],
    },
  ];

  const guruMenu = [
    {
      group: "MENU GURU",
      items: [
        { label: "Dashboard", href: "/guru/dashboard", icon: LayoutDashboard },
        { label: "Barang Tersedia", href: "/admin/barang", icon: ShoppingBag },
        { label: "Ajukan Pinjam", href: "/guru/ajukan", icon: PlusCircle, badge: "Baru", badgeColor: "bg-blue-600 text-white" },
        { label: "Peminjaman Saya", href: "/guru/peminjaman", icon: ClipboardList },
        { label: "Jatuh Tempo", href: "/guru/peminjaman?filter=deadline", icon: Clock, badge: "1", badgeColor: "bg-rose-500 text-white" },
        { label: "Riwayat Transaksi", href: "/guru/surat-bukti", icon: History },
      ],
    },
    {
      group: "AKUN & AKSES",
      items: [
        { label: "Profil Guru", href: "#", icon: User },
      ],
    },
  ];

  const menuGroups = isAdmin ? adminMenu : guruMenu;

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <Link href={isAdmin ? "/admin/dashboard" : "/guru/dashboard"} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1A3673] to-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-900/10 group-hover:scale-105 transition-transform">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-[#1A3673]">SIMINV</span>
              {!isAdmin && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 tracking-wide">
                  GURU
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Sistem Inventaris Sekolah</p>
          </div>
        </Link>
      </div>

      {/* Role Indicator Banner */}
      <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isAdmin ? "bg-emerald-500" : "bg-blue-600"} animate-pulse`} />
          {isAdmin ? "Mode Petugas (Admin)" : "Portal Guru & Tendik"}
        </span>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {group.group}
            </h3>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "#" && pathname.startsWith(item.href) && item.href !== "/admin" && item.href !== "/guru");
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#1A3673] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || "bg-slate-200 text-slate-700"}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 bg-white space-y-2">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-slate-50 border border-slate-100 text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="truncate">
            <p className="text-[11px] font-semibold text-slate-800 truncate">SIMINV v2.4 Terverifikasi</p>
            <p className="text-[10px] text-slate-500 truncate">SMPN 2 Katapang</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logoutUser}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200/70 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}

