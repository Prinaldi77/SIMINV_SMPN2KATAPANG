"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getAuthToken, getAuthUser } from "@/lib/api";

export default function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [layoutRole, setLayoutRole] = useState<"admin" | "guru">("guru");

  useEffect(() => {
    const token = getAuthToken();
    const user = getAuthUser();

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    const isSharedSurat = pathname.startsWith("/guru/surat-bukti");
    if (user.role !== "guru" && !isSharedSurat) {
      router.replace("/admin/dashboard");
      return;
    }

    setLayoutRole(user.role === "guru" ? "guru" : "admin");
    setAuthorized(true);
  }, [pathname, router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
        Memeriksa sesi...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={layoutRole} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          role={layoutRole}
          breadcrumbs={["SIMINV", layoutRole === "admin" ? "Surat Bukti" : "Portal Guru"]}
        />
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
