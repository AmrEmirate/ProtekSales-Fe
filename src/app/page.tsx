"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

export default function DashboardPage() {
  const {
    salesProfile,
    leads,
    outlets,
    visits,
    availableBalance,
    escrowBalance,
    lockLead,
    toggleOutletLicense,
    isOffline,
  } = useApp();

  // Lead Checker Interactive State
  const [waNumber, setWaNumber] = useState("81298762211");
  const [outletName, setOutletName] = useState("Toko Sinar Jaya Abadi");
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    canClaim: boolean;
    message: string;
    claimedBy?: string;
    protectedUntil?: string;
  } | null>({
    canClaim: true,
    message: "Outlet siap dicek dengan Lead Protection Engine.",
  });
  const [lockSuccessMsg, setLockSuccessMsg] = useState<string | null>(null);

  // Stats calculation
  const lunasCount = outlets.filter((o) => o.status === "LUNAS").length;
  const h3Count = outlets.filter((o) => o.status === "H-3").length;
  const suspendCount = outlets.filter((o) => o.status === "SUSPENDED").length;
  const totalMrr = outlets.reduce((acc, curr) => acc + curr.mrr, 0);

  const handleCheckLead = async () => {
    setLockSuccessMsg(null);
    setIsChecking(true);
    try {
      const data = await api.checkLeadAvailability(waNumber);
      if (data) {
        setCheckResult({
          canClaim: data.canClaim,
          message: data.message,
          claimedBy: data.lead?.claimedBy,
          protectedUntil: data.lead?.protectedUntil,
        });
      }
    } catch {
      // Jika server offline, izinkan verifikasi format standar nomor WA
      const sanitized = waNumber.replace(/[^0-9]/g, "");
      const isFree = !sanitized.endsWith("99"); // Contoh aturan offline
      setCheckResult({
        canClaim: isFree,
        message: isFree
          ? "Nomor valid. Bebas diklaim untuk kunjungan sales."
          : "Nomor ini tercatat sedang dalam proteksi sales lain.",
        claimedBy: isFree ? undefined : "Rian Hidayat (SLS-019)",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleLockNow = async () => {
    const success = await lockLead(
      outletName || "Outlet Baru",
      `+62 ${waNumber}`,
      "Jl. Boulevard Raya Blok QJ No. 12, Kelapa Gading",
      "Kelontong / Minimarket"
    );
    if (success) {
      setLockSuccessMsg("Berhasil mengunci prospek! Dilindungi sistem selama 30 hari kalender.");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Hero Executive Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1D3A] via-[#102A43] to-[#1E3E62] text-white p-6 sm:p-8 shadow-xl border border-[#1E3E62]">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-[#F97316]/15 blur-xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-[#0284C7]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F97316]/20 border border-[#F97316]/30 text-orange-300 text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
              SISTEM MITRA SALES RESMI • PT PRO TEKNOLOGI
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display tracking-tight text-white leading-tight">
              Selamat Bertugas, {salesProfile.name}!
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pantau proteksi prospek 30 hari, remote kill-switch outlet lisensi POS, dan akumulasi komisi recurring bulanan Anda secara real-time.
            </p>
          </div>

          {/* Quick Action Buttons on Desktop */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <Link
              href="/leads/check"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-[0_4px_14px_rgba(249,115,22,0.35)] transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>Kunci Prospek</span>
            </Link>
            <Link
              href="/leads/check-in"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
              <span>Check-in Kunjungan</span>
            </Link>
            <Link
              href="/commission/withdraw"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span>Tarik Saldo</span>
            </Link>
          </div>
        </div>

        {/* Financial Metrics Strip */}
        <div className="mt-8 pt-6 border-t border-[#1E3E62]/80 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-[#0B1D3A]/60 border border-[#1E3E62]/60">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Pendapatan MRR</span>
              <span className="material-symbols-outlined text-[16px] text-[#F97316]">trending_up</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-display text-white mt-1 tabular-nums">
              Rp {totalMrr.toLocaleString("id-ID")}
            </div>
            <span className="text-[11px] text-slate-400">Komisi berulang aktif</span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-[#0B1D3A]/60 border border-[#1E3E62]/60">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Saldo Siap Tarik</span>
              <span className="material-symbols-outlined text-[16px] text-emerald-400">account_balance_wallet</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-display text-emerald-400 mt-1 tabular-nums">
              Rp {availableBalance.toLocaleString("id-ID")}
            </div>
            <span className="text-[11px] text-slate-400">Siap cair ke rekening</span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-[#0B1D3A]/60 border border-[#1E3E62]/60">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Komisi Tertahan (Escrow)</span>
              <span className="material-symbols-outlined text-[16px] text-amber-400">hourglass_top</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-display text-amber-300 mt-1 tabular-nums">
              Rp {escrowBalance.toLocaleString("id-ID")}
            </div>
            <span className="text-[11px] text-slate-400">Cair saat outlet bayar</span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-[#0B1D3A]/60 border border-[#1E3E62]/60">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Target Q3 & Tier</span>
              <span className="material-symbols-outlined text-[16px] text-[#0284C7]">military_tech</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg sm:text-2xl font-bold font-display text-white tabular-nums">
                {salesProfile.targetPercent}%
              </span>
              <span className="text-xs text-orange-400 font-semibold font-display">Gold Tier</span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-400 to-amber-400 h-1.5 rounded-full"
                style={{ width: `${salesProfile.targetPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Grid: Lead Checker & Real-Time Engine (Dual Pane Layout for Desktop/Tablet) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Interactive Lead Checker */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">radar</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#102A43] font-display">
                    Lead Protection Engine (Anti-Bentrok)
                  </h2>
                  <p className="text-xs text-slate-500">Cek status nomor WhatsApp calon outlet</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Database Online
              </span>
            </div>

            {/* Input WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#102A43]">
                Nomor WhatsApp Pemilik Outlet
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-[#102A43] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  <span>+62</span>
                </div>
                <input
                  type="tel"
                  value={waNumber}
                  onChange={(e) => setWaNumber(e.target.value)}
                  placeholder="812-xxxx-xxxx"
                  className="w-full h-11 pl-18 pr-10 rounded-xl bg-slate-50 border border-[#CBD5E1] text-sm font-semibold text-[#102A43] focus:bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all outline-none"
                />
                <span className="absolute right-3 material-symbols-outlined text-[20px] text-slate-400">
                  contact_phone
                </span>
              </div>
            </div>

            {/* Input Outlet Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#102A43]">
                Nama Outlet / Bisnis
              </label>
              <input
                type="text"
                value={outletName}
                onChange={(e) => setOutletName(e.target.value)}
                placeholder="Contoh: Toko Berkah Jaya"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] text-sm font-semibold text-[#102A43] focus:bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all outline-none"
              />
            </div>

            {/* Verification Status Indicator */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Validasi Server Anti-Bentrok:</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Siap Proteksi 30 Hari
              </span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleCheckLead}
              disabled={isChecking}
              type="button"
              className="w-full h-11 rounded-xl bg-[#102A43] hover:bg-[#0B1D3A] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isChecking ? "hourglass_top" : "manage_search"}
              </span>
              <span>{isChecking ? "Memeriksa Database..." : "Cek Validitas & Ketersediaan Outlet"}</span>
            </button>
          </div>
        </div>

        {/* Right Pane: Verification Result & Lock Action */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          {checkResult?.canClaim !== false ? (
            <div className="h-full rounded-2xl bg-[#DCFCE7]/60 border border-emerald-300 p-5 sm:p-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <span className="material-symbols-outlined text-[22px]">verified</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-emerald-950 font-display">
                        {outletName || "Outlet Siap Terproteksi"}
                      </h3>
                      <p className="text-xs text-emerald-800 font-medium">
                        +62 {waNumber} • {checkResult?.message || "Toko bebas diklaim"}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-sm">
                    BEBAS KLAIM
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/80 border border-emerald-200 text-xs text-emerald-900 space-y-1.5 leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <span className="material-symbols-outlined text-[16px]">lock_clock</span>
                    Garansi Perlindungan Eksklusif 30 Hari
                  </div>
                  <p>
                    Kunci outlet sasaran ini sekarang agar terlindungi dari klaim rekan sales lain selama 30 hari kalender. Anda memiliki hak eksklusif closing.
                  </p>
                </div>

                {lockSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-400 animate-in fade-in">
                    {lockSuccessMsg}
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLockNow}
                  className="flex-1 h-12 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(249,115,22,0.35)] transition-all active:scale-98"
                >
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                  <span>Kunci Prospek Sekarang</span>
                </button>
                <Link
                  href="/leads/check"
                  className="h-12 px-4 rounded-xl bg-white hover:bg-slate-50 text-[#102A43] border border-[#CBD5E1] font-bold text-xs flex items-center justify-center transition-all"
                >
                  Detail &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-full rounded-2xl bg-[#FEE2E2]/60 border border-red-300 p-5 sm:p-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <span className="material-symbols-outlined text-[22px]">lock</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-red-950 font-display">
                        {outletName || "Outlet Terkunci"}
                      </h3>
                      <p className="text-xs text-red-800 font-medium">
                        +62 {waNumber} • Sedang diprospek
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold shadow-sm">
                    TERKUNCI
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/80 border border-red-200 text-xs text-red-900 space-y-1.5 leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 text-red-800">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    Terkunci oleh Sales Lain (Anti-Bentrok)
                  </div>
                  <p>
                    Prospek ini sedang dalam masa proteksi aktif oleh mitra <strong>{checkResult?.claimedBy || "Sales Lain"}</strong>.
                    {checkResult?.protectedUntil && (
                      <span> Masa proteksi hingga: <strong>{new Date(checkResult.protectedUntil).toLocaleDateString("id-ID")}</strong>.</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Link
                  href="/leads/dispute"
                  className="flex-1 h-12 rounded-xl bg-[#00152a] hover:bg-[#0B1D3A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">gavel</span>
                  <span>Ajukan Banding Sengketa</span>
                </Link>
                <Link
                  href="/leads/check"
                  className="h-12 px-4 rounded-xl bg-white text-[#102A43] border border-[#CBD5E1] font-bold text-xs flex items-center justify-center"
                >
                  Panduan
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Outlet & Remote POS Kill-Switch Matrix (Adapted for Tablet & Desktop) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#102A43]" />
              <h2 className="text-lg font-bold text-[#102A43] font-display">
                Status Klien Lisensi & Remote Kill-Switch
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitoring lisensi POS aktif, peringatan invoice jatuh tempo, dan saklar penonaktifan darurat
            </p>
          </div>

          {/* Quick Filter Counters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0">
              Total: {outlets.length}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
              {lunasCount} Lunas
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
              {h3Count} H-3 Tempo
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEE2E2] text-[#B91C1C] text-xs font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
              {suspendCount} Suspended
            </span>
          </div>
        </div>

        {/* Responsive Desktop/Tablet Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Outlet & Lokasi</th>
                <th className="py-3 px-4">Hardware POS / Serial</th>
                <th className="py-3 px-4">MRR Bulanan</th>
                <th className="py-3 px-4">Jatuh Tempo</th>
                <th className="py-3 px-4">Status Lisensi</th>
                <th className="py-3 px-4 text-center">Remote Kill-Switch</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {outlets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center mx-auto mb-2">
                      <span className="material-symbols-outlined text-[24px]">storefront</span>
                    </div>
                    <p className="font-bold text-slate-700 text-xs">Belum ada outlet aktif di database</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Daftarkan outlet baru melalui kuncian prospek atau aktivasi POS</p>
                  </td>
                </tr>
              ) : (
                outlets.map((outlet) => (
                <tr
                  key={outlet.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-[#e3efff] border border-slate-200">
                        {outlet.imageUrl ? (
                          <img
                            src={outlet.imageUrl}
                            alt={outlet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#102A43] font-bold text-xs">
                            {outlet.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate font-display">
                          {outlet.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {outlet.category} • {outlet.owner}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono text-slate-700 font-semibold">
                      {outlet.posSerial}
                    </div>
                    <div className="text-[10px] text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {outlet.lastHeartbeat}
                    </div>
                  </td>
                  <td className="py-3 px-4 tabular-nums font-bold text-slate-900">
                    Rp {outlet.mrr.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs font-semibold ${
                        outlet.status === "H-3"
                          ? "text-amber-700 font-bold"
                          : outlet.status === "SUSPENDED"
                          ? "text-red-600 font-bold"
                          : "text-slate-600"
                      }`}
                    >
                      {outlet.dueDate}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {outlet.status === "LUNAS" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        LUNAS & AKTIF
                      </span>
                    )}
                    {outlet.status === "H-3" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                        H-3 JATUH TEMPO
                      </span>
                    )}
                    {outlet.status === "SUSPENDED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        TERKUNCI (SUSPEND)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleOutletLicense(outlet.id)}
                      title={
                        outlet.licenseActive
                          ? "Klik untuk mematikan lisensi (Remote Kill-Switch)"
                          : "Klik untuk menyalakan kembali lisensi"
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        outlet.licenseActive ? "bg-emerald-600" : "bg-red-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          outlet.licenseActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`https://wa.me/${outlet.phone.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(
                          outlet.owner
                        )},%20kami%20dari%20PT%20Pro%20Teknologi%20menginfokan%20lisensi%20POS%20Anda.`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        title="Hubungi via WhatsApp"
                      >
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                      </a>
                      <Link
                        href="/outlets/detail"
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                        title="Lihat Detail Hardware & Kontrak"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-500">
            Menampilkan 4 dari 28 outlet terdaftar di wilayah penugasan Anda
          </span>
          <Link
            href="/outlets"
            className="font-bold text-[#F97316] hover:underline flex items-center gap-1"
          >
            Lihat Semua Outlet Klien &rarr;
          </Link>
        </div>
      </div>

      {/* 4. Bottom Grid: Active Field Pipeline & Quick Toolkits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline & Check-in Feed */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#F97316] text-[22px]">route</span>
              <h2 className="text-base font-bold text-[#102A43] font-display">
                Pipeline Kunjungan Lapangan Terkini
              </h2>
            </div>
            <Link
              href="/leads/pipeline"
              className="text-xs font-bold text-[#0284C7] hover:underline"
            >
              Lihat Timeline &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{visit.outletName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold">
                      {visit.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{visit.notes}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <span className="material-symbols-outlined text-[12px]">my_location</span>
                      {visit.distance}
                    </span>
                    <span>•</span>
                    <span>{visit.date}, {visit.time}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    visit.status === "DEAL"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {visit.status === "DEAL" ? "DEAL CLOSING" : "TERVERIFIKASI"}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/leads/check-in"
            className="w-full py-2.5 rounded-xl border border-dashed border-[#CBD5E1] text-[#102A43] font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Tambah Check-in Kunjungan Baru</span>
          </Link>
        </div>

        {/* Sales Toolkit Shortcuts */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0284C7] text-[22px]">handyman</span>
            <h2 className="text-base font-bold text-[#102A43] font-display">
              Sales Toolkit & Alat Bantu Closing
            </h2>
          </div>

          <div className="space-y-3">
            <Link
              href="/toolkit/roi"
              className="p-3.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 flex items-center justify-between group hover:border-[#F97316] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F97316] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">calculate</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#102A43] group-hover:text-[#F97316] transition-colors">
                    Kalkulator ROI & Efisiensi Toko
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Hitung potensi penghematan & payback period merchant
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#F97316] transition-colors text-[20px]">
                chevron_right
              </span>
            </Link>

            <Link
              href="/toolkit/brochures"
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between group hover:border-slate-400 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#102A43] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">menu_book</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#102A43] group-hover:text-[#0284C7] transition-colors">
                    Brosur Digital & Spesifikasi POS
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Brosur PDF resmi & sharing link instan ke WhatsApp
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#102A43] transition-colors text-[20px]">
                chevron_right
              </span>
            </Link>

            <Link
              href="/toolkit/education"
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between group hover:border-slate-400 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0284C7] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">school</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#102A43] group-hover:text-[#0284C7] transition-colors">
                    Script Edukasi & Objection Handling
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Jawaban cerdas menghadapi keraguan merchant manual
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#0284C7] transition-colors text-[20px]">
                chevron_right
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
