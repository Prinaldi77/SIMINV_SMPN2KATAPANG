import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIMINV - Sistem Inventaris Sekolah | SMPN 2 Katapang",
  description: "Aplikasi Manajemen Inventaris dan Sirkulasi Sarana Prasarana Sekolah SMPN 2 Katapang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

