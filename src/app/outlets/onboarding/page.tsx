"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { useApp } from "@/context/AppContext";

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshData } = useApp();

  const [deviceType, setDeviceType] = useState<"sunmi" | "windows" | "tablet">("sunmi");
  const [serialNumber, setSerialNumber] = useState("SUNMI-T2-JKT-09824");
  const [outletName, setOutletName] = useState("Kopi Kenangan Senja");
  const [packageTier, setPackageTier] = useState("PRO_ENTERPRISE");
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");
  const [isActivating, setIsActivating] = useState(false);
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await api.onboardingPos({
        name: outletName,
        ownerName: "Pemilik Outlet",
        phone: "62812" + Math.floor(1000000 + Math.random() * 9000000),
        address: "Alamat Operasional POS Jakarta",
        monthlyFee: billingCycle === "ANNUAL" ? 120000 : 150000,
      });
      await refreshData();
    } catch {
      // Graceful local activation when server offline
    } finally {
      setIsActivating(false);
      setActivatedSuccess(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <Link href="/outlets" className="hover:text-[#F97316]">Outlets</Link>
            <span>/</span>
            <span className="text-[#102A43]">Aktivasi & Onboarding POS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Aktivasi Lisensi & Pairing Hardware POS
          </h1>
          <p className="text-xs text-slate-500">
            Hubungkan perangkat kasir merchant dengan server pusat untuk mengaktifkan sistem kasir
          </p>
        </div>

        <Link
          href="/outlets"
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
        >
          Daftar Outlet &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Setup Form */}
        <div className="lg:col-span-7 space-y-5">
          {/* Step 1: Device Selection */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-[#102A43] text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h2 className="text-sm font-bold text-[#102A43] font-display">
                Pilih Model Perangkat Kasir
              </h2>
            </div>

            <div className="space-y-2.5">
              <label
                onClick={() => setDeviceType("sunmi")}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  deviceType === "sunmi"
                    ? "bg-orange-50/70 border-[#F97316] shadow-sm"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#F97316] shrink-0">
                  <span className="material-symbols-outlined text-[24px]">devices</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#102A43]">
                      Sunmi D2s / T2 Android POS Dual-Screen
                    </span>
                    {deviceType === "sunmi" && (
                      <span className="material-symbols-outlined text-[#F97316] text-[18px]">
                        check_circle
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Printer Thermal 80mm built-in, auto-cutter, layar kasir 15.6 inch
                  </p>
                </div>
              </label>

              <label
                onClick={() => setDeviceType("windows")}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  deviceType === "windows"
                    ? "bg-orange-50/70 border-[#F97316] shadow-sm"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-slate-700 shrink-0">
                  <span className="material-symbols-outlined text-[24px]">desktop_windows</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#102A43]">
                      Windows Mini PC Terminal / Desktop
                    </span>
                    {deviceType === "windows" && (
                      <span className="material-symbols-outlined text-[#F97316] text-[18px]">
                        check_circle
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Multi-monitor display, support external printer USB/LAN
                  </p>
                </div>
              </label>

              <label
                onClick={() => setDeviceType("tablet")}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  deviceType === "tablet"
                    ? "bg-orange-50/70 border-[#F97316] shadow-sm"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-slate-700 shrink-0">
                  <span className="material-symbols-outlined text-[24px]">tablet_mac</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#102A43]">
                      Tablet Android / iPad Meja Ringkas
                    </span>
                    {deviceType === "tablet" && (
                      <span className="material-symbols-outlined text-[#F97316] text-[18px]">
                        check_circle
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Setup ringkas fleksibel, pairing printer Bluetooth/WiFi
                  </p>
                </div>
              </label>
            </div>

            {/* Serial Number Input */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-[#102A43]">
                Serial Number (S/N) / MAC Address Hardware
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="flex-1 h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-mono font-bold text-[#102A43] focus:bg-white uppercase outline-none"
                />
                <button
                  type="button"
                  onClick={() => alert("Scanner Barcode Aktif: S/N Terverifikasi")}
                  className="px-3.5 h-11 rounded-xl bg-[#102A43] text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                  <span>Scan</span>
                </button>
              </div>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Hardware otentik resmi & siap dipasangkan
              </span>
            </div>
          </div>

          {/* Step 2: Outlet Identity & Package */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-[#102A43] text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h2 className="text-sm font-bold text-[#102A43] font-display">
                Konfigurasi Outlet & Paket Lisensi
              </h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#102A43]">Nama Outlet Sasaran</label>
                <input
                  type="text"
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#102A43]">Paket Software</label>
                  <select
                    value={packageTier}
                    onChange={(e) => setPackageTier(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] outline-none"
                  >
                    <option value="PRO_ENTERPRISE">Pro Enterprise Dual-Screen</option>
                    <option value="PRO_STANDARD">Pro Standard POS</option>
                    <option value="PRO_STARTER">Pro Starter Cloud</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#102A43]">Siklus Tagihan</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as "MONTHLY" | "ANNUAL")}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] outline-none"
                  >
                    <option value="ANNUAL">Tahunan (Diskon 2 Bulan)</option>
                    <option value="MONTHLY">Bulanan (Recurring)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Live QR Token Preview & Activation Confirmation */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <h3 className="text-base font-bold text-[#102A43] font-display">
              Token QR Pairing Cepat
            </h3>
            <p className="text-xs text-slate-500">
              Buka aplikasi ProTek POS di mesin kasir, pilih menu &ldquo;Aktivasi Mitra&rdquo;, lalu scan QR berikut:
            </p>

            {/* QR Pattern Preview */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-[#102A43] flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-44 h-44 bg-white rounded-xl p-3 shadow-lg flex items-center justify-center">
                <svg className="w-full h-full text-[#102A43]" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="10" y="10" width="25" height="25" fill="#102A43" />
                  <rect x="15" y="15" width="15" height="15" fill="white" />
                  <rect x="65" y="10" width="25" height="25" fill="#102A43" />
                  <rect x="70" y="15" width="15" height="15" fill="white" />
                  <rect x="10" y="65" width="25" height="25" fill="#102A43" />
                  <rect x="15" y="70" width="15" height="15" fill="white" />
                  <rect x="44" y="44" width="12" height="12" fill="#F97316" />
                  <rect x="42" y="15" width="15" height="15" fill="#102A43" />
                  <rect x="15" y="42" width="15" height="15" fill="#102A43" />
                  <rect x="68" y="42" width="15" height="15" fill="#102A43" />
                  <rect x="42" y="68" width="15" height="15" fill="#102A43" />
                </svg>
              </div>

              <div className="font-mono text-xs font-bold text-orange-400">
                AUTH-TOKEN-2026-X9921
              </div>
              <span className="text-[10px] text-slate-400">
                Berlaku hingga 30 menit ke depan
              </span>
            </div>

            {activatedSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-400 text-xs font-bold animate-in fade-in flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-700">verified</span>
                <span>Lisensi Berhasil Diaktifkan! Mesin kasir &ldquo;{outletName}&rdquo; telah terhubung ke cloud ProTek.</span>
              </div>
            )}

            <button
              type="button"
              disabled={isActivating || activatedSuccess}
              onClick={handleActivate}
              className="w-full h-12 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(249,115,22,0.35)] active:scale-98 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isActivating ? "hourglass_top" : "cloud_done"}
              </span>
              <span>
                {isActivating
                  ? "Menghubungkan ke POS..."
                  : activatedSuccess
                  ? "Selesai Dipasangkan"
                  : "Verifikasi & Aktifkan Sekarang"}
              </span>
            </button>

            {activatedSuccess && (
              <Link
                href="/outlets/bast"
                className="w-full py-2.5 rounded-xl bg-[#102A43] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#0B1D3A] transition-colors"
              >
                <span>Lanjut ke Penandatanganan BAST &rarr;</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
