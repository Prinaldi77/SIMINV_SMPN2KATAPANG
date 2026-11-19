"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, getAuthUser } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    const user = getAuthUser();
    if (token && user) {
      router.replace(user.role === "guru" ? "/guru/dashboard" : "/admin/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
      Mengalihkan...
    </div>
  );
}
