"use client";

import React, { useState } from "react";
import { QrCode, X, Camera, CheckCircle2, Search } from "lucide-react";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanned?: (code: string) => void;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScanned,
}: BarcodeScannerModalProps) {
  const [manualCode, setManualCode] = useState("");
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateScan = (code: string) => {
    setScannedResult(code);
    setTimeout(() => {
      if (onScanned) onScanned(code);
      onClose();
      setScannedResult(null);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-[#1A3673] rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pindai Barcode / QR Aset</h3>
              <p className="text-xs text-slate-500">Scan label aset atau nomor registrasi peminjaman</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Scanner Viewfinder Simulation */}
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-blue-500/10 pointer-events-none" />
            
            {/* Viewfinder brackets */}
            <div className="w-48 h-32 border-2 border-dashed border-blue-400 rounded-lg relative flex items-center justify-center">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400" />
              
              {/* Animated scan line */}
              <div className="w-full h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse" />
            </div>

            <div className="absolute bottom-3 text-center">
              <span className="text-[11px] text-slate-300 font-mono bg-black/50 px-2 py-0.5 rounded">
                Arahkan kamera ke QR / Barcode
              </span>
            </div>

            {scannedResult && (
              <div className="absolute inset-0 bg-emerald-900/90 flex flex-col items-center justify-center text-white animate-in zoom-in-95 duration-150">
                <CheckCircle2 className="w-12 h-12 text-emerald-300 mb-2" />
                <p className="text-sm font-bold">Terpindai Sukses!</p>
                <p className="text-xs font-mono text-emerald-200 mt-1">{scannedResult}</p>
              </div>
            )}
          </div>

          {/* Manual Input */}
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              placeholder="Atau ketik kode manual..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
            />
            <button
              onClick={() => manualCode && handleSimulateScan(manualCode)}
              className="px-3 py-2 bg-[#1A3673] text-white text-xs font-semibold rounded-lg hover:bg-[#152C5E]"
            >
              Cari
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

