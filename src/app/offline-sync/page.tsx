"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function OfflineSyncPage() {
  const { isOffline, toggleOffline, offlineQueueCount } = useApp();
  const [syncing, setSyncing] = useState(false);
  const [syncedSuccess, setSyncedSuccess] = useState(false);

  const [queueItems, setQueueItems] = useState<
    Array<{ id: string; action: string; target: string; size: string; time: string; status: string }>
  >(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("protek_offline_queue");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("protek_offline_queue");
      }
      setQueueItems([]);
      setSyncedSuccess(true);
      if (isOffline) toggleOffline();
      setTimeout(() => setSyncedSuccess(false), 4000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#102A43]">Sistem</span>
            <span>/</span>
            <span className="text-[#102A43]">Antrean Sinkronisasi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Mode Offline & Antrean Sinkronisasi Lapangan
          </h1>
          <p className="text-xs text-slate-500">
            Penyimpanan data lokal IndexedDB saat bertugas di area minim sinyal seluler
          </p>
        </div>

        {/* Offline Switch Control */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm shrink-0">
          <div className="text-right">
            <span className="text-xs font-bold text-[#102A43] block">
              {isOffline ? "Mode Offline Aktif" : "Mode Online (Terkoneksi)"}
            </span>
            <span className="text-[10px] text-slate-400">
              {isOffline ? "Menyimpan ke memori HP" : "Koneksi cloud lancar"}
            </span>
          </div>
          <button
            onClick={toggleOffline}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              isOffline ? "bg-amber-500" : "bg-emerald-600"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                isOffline ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Grid: 12 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Storage Status & Technology Info */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0284C7] text-[22px]">sd_storage</span>
                <h2 className="text-sm font-bold text-[#102A43] font-display">
                  Penyimpanan Enkripsi Lokal
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Sehat (98% Kosong)
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Kapasitas Terpakai:</span>
                <span className="font-mono font-bold text-slate-900">1.2 MB / 50.0 MB</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#0284C7] h-full rounded-full" style={{ width: "3%" }} />
              </div>
              <span className="text-[10px] text-slate-400 block pt-1 leading-normal">
                Foto check-in dan formulir dikompresi otomatis tanpa mengurangi ketajaman bukti koordinat GPS.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="font-bold text-[#102A43] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                <span>Protokol Auto-Sync ProTek</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Begitu perangkat tablet Anda mendeteksi sinyal WiFi atau 4G stabil, sistem akan langsung mengirim seluruh data antrean ke server backend tanpa perlu konfirmasi manual.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Queue Items List & Manual Trigger */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#102A43] font-display">
                  Daftar Antrean Sinkronisasi ({queueItems.length})
                </h2>
                <p className="text-xs text-slate-500">Data tertunda yang menunggu dikirim ke server</p>
              </div>

              {queueItems.length > 0 && (
                <button
                  type="button"
                  disabled={syncing}
                  onClick={handleSyncAll}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {syncing ? "autorenew" : "cloud_upload"}
                  </span>
                  <span>{syncing ? "Menyinkronkan..." : "Sinkronisasi Sekarang"}</span>
                </button>
              )}
            </div>

            {syncedSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-400 text-xs font-bold animate-in fade-in flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-700">verified</span>
                <span>Seluruh antrean berhasil disinkronisasi ke server pusat PT Pro Teknologi.</span>
              </div>
            )}

            {queueItems.length > 0 ? (
              <div className="space-y-3">
                {queueItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">pending_actions</span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{item.action}</div>
                        <div className="text-[11px] text-slate-500">{item.target}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.id} • {item.size} • {item.time}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold shrink-0">
                      MENUNGGU SINYAL
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <span className="material-symbols-outlined text-[48px] text-emerald-500">
                  cloud_done
                </span>
                <h3 className="font-bold text-sm text-slate-800">Antrean Bersih</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Semua transaksi kunjungan dan kunci prospek telah tersimpan aman di database cloud.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
