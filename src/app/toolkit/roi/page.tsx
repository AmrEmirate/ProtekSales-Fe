"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function RoiCalculatorPage() {
  const [category, setCategory] = useState<"fnb" | "retail" | "service">("fnb");
  const [dailyTx, setDailyTx] = useState<number>(120);
  const [ticketSize, setTicketSize] = useState<number>(45000);

  // Math equations matching blueprint
  const leakRate = category === "fnb" ? 0.025 : category === "retail" ? 0.02 : 0.015;
  const monthlyGross = dailyTx * ticketSize * 30;
  const savedLeakage = Math.round(monthlyGross * leakRate);
  const extraSpeedRevenue = Math.round(dailyTx * 0.05 * ticketSize * 30);
  const totalBenefit = savedLeakage + extraSpeedRevenue;
  const monthlyCost = 250000;
  const multiplier = Math.round(totalBenefit / monthlyCost);
  const salesCommission = Math.round(monthlyCost * 0.25);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#102A43]">Sales Toolkit</span>
            <span>/</span>
            <span className="text-[#102A43]">Kalkulator ROI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Kalkulator ROI & Efisiensi Finansial Toko
          </h1>
          <p className="text-xs text-slate-500">
            Simulasi riil penghematan biaya kebocoran dan kenaikan omset merchant saat beralih ke ProTek POS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-orange-50 text-[#F97316] text-xs font-bold border border-orange-200">
            Sales Closing Tool
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md">
        <button
          onClick={() => setCategory("fnb")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            category === "fnb" ? "bg-[#F97316] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Kafe & Resto
        </button>
        <button
          onClick={() => setCategory("retail")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            category === "retail" ? "bg-[#F97316] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Ritel / Minimarket
        </button>
        <button
          onClick={() => setCategory("service")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            category === "service" ? "bg-[#F97316] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Jasa & Salon
        </button>
      </div>

      {/* Main Grid: 12 Columns for Desktop & Tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 Cols): Input Sliders */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-[#102A43] font-display">
              Parameter Kondisi Lapangan
            </h2>
            <span className="text-[11px] font-bold text-[#F97316]">Geser Nilai Realistis</span>
          </div>

          {/* Slider 1: Daily Transactions */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-bold text-[#102A43]">
                Rata-rata Transaksi Struk Harian
              </label>
              <span className="text-sm font-bold font-display text-[#F97316] tabular-nums">
                {dailyTx} Struk / hari
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={400}
              step={5}
              value={dailyTx}
              onChange={(e) => setDailyTx(Number(e.target.value))}
              className="w-full accent-[#F97316] h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>20 Struk (Toko Pemula)</span>
              <span>400+ Struk (Ramai / Mall)</span>
            </div>
          </div>

          {/* Slider 2: Ticket Size */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-bold text-[#102A43]">
                Rata-rata Belanja per Nota (Ticket Size)
              </label>
              <span className="text-sm font-bold font-display text-[#102A43] tabular-nums">
                Rp {ticketSize.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {[25000, 45000, 75000, 150000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTicketSize(val)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    ticketSize === val
                      ? "bg-[#102A43] text-white border-[#102A43] shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Rp {(val / 1000).toFixed(0)}rb
                </button>
              ))}
            </div>
          </div>

          {/* Leakage & Speed Comparison Indicator */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span>Estimasi Kebocoran Kertas & Human Error</span>
              </div>
              <span className="font-bold text-red-600">{(leakRate * 100).toFixed(1)}% Omset</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Akibat: Kertas sobek hilang, salah input harga menu, selisih kembalian, dan manipulasi nota kasir konvensional tanpa sistem cloud.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200">
                <span className="text-[10px] font-bold text-red-700 block uppercase">Kasir Manual</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">90 Detik / Struk</span>
                <span className="text-[10px] text-slate-400">Antrean menumpuk</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">ProTek POS</span>
                <span className="text-sm font-bold text-emerald-800 mt-0.5 block">4 Detik / Struk</span>
                <span className="text-[10px] text-emerald-600">QRIS kilat & KDS kitchen</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (6 Cols): ROI Projection Result Box */}
        <div className="lg:col-span-6 space-y-5">
          <div className="rounded-3xl bg-[#0B1D3A] text-white p-6 shadow-xl border border-[#1E3E62] space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#F97316]/15 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F97316] text-[22px]">trending_up</span>
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-orange-400">
                  Hasil Proyeksi Nilai Tambah
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold">
                Perhitungan 30 Hari
              </span>
            </div>

            {/* Split Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#102A43] border border-[#1E3E62]">
                <span className="text-[11px] text-slate-400 block font-semibold">Omset Kotor Merchant</span>
                <div className="text-lg font-bold font-display text-white mt-1 tabular-nums">
                  Rp {monthlyGross.toLocaleString("id-ID")}
                </div>
                <span className="text-[10px] text-slate-400">30 hari kalender</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#102A43] border border-[#1E3E62]">
                <span className="text-[11px] text-slate-400 block font-semibold">Uang Selamat (Anti-Bocor)</span>
                <div className="text-lg font-bold font-display text-[#F97316] mt-1 tabular-nums">
                  + Rp {savedLeakage.toLocaleString("id-ID")}
                </div>
                <span className="text-[10px] text-orange-300">Tercatat 100% cloud</span>
              </div>
            </div>

            {/* Speed capacity bonus */}
            <div className="p-3.5 rounded-xl bg-[#102A43] border border-[#1E3E62] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Tambahan Omset Meja Cepat</span>
                <span className="text-[11px] text-slate-400">Perputaran antrean kasir 10x lebih efisien</span>
              </div>
              <span className="text-sm font-bold font-display text-emerald-400 tabular-nums">
                + Rp {extraSpeedRevenue.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Total Benefit Glowing Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#9d4300] to-[#F97316] text-white shadow-lg space-y-1">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider opacity-90">
                <span>Total Keuntungan Bersih Toko</span>
                <span className="material-symbols-outlined text-[20px]">stars</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-bold font-display tracking-tight tabular-nums">
                  + Rp {totalBenefit.toLocaleString("id-ID")}
                </span>
                <span className="text-xs opacity-90">/ bulan</span>
              </div>
            </div>

            {/* Multiplier */}
            <div className="p-3.5 rounded-xl bg-[#1E3E62]/70 border border-[#1E3E62] flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-300 block">Biaya Investasi Lisensi ProTek:</span>
                <span className="font-bold text-white text-sm">Rp {monthlyCost.toLocaleString("id-ID")} / bulan</span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-display text-orange-400 block">{multiplier}x Lipat ROI</span>
                <span className="text-[10px] text-emerald-300 font-bold">Investasi Balik Modal Hari ke-2!</span>
              </div>
            </div>

            {/* Sales Rep Commission Attribution */}
            <div className="pt-2 border-t border-[#1E3E62] flex items-center justify-between text-xs">
              <span className="text-slate-300">Potensi Komisi Recurring Anda:</span>
              <span className="font-bold text-orange-400 font-display text-sm">
                Rp {salesCommission.toLocaleString("id-ID")} / bln / gerai
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
