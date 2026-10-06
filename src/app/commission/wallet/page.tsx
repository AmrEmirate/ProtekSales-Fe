"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function CommissionWalletPage() {
  const { availableBalance, escrowBalance, mutations, salesProfile, outlets } = useApp();
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "WITHDRAW">("ALL");

  const totalMrr = outlets.reduce((acc, curr) => acc + curr.mrr, 0);
  const projectedMonthly = Math.round(totalMrr * 0.25);

  const filteredMutations = mutations.filter((m) => {
    if (filterType === "INCOME") return m.type === "RECURRING" || m.type === "ESCROW_RELEASE";
    if (filterType === "WITHDRAW") return m.type === "WITHDRAWAL";
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#102A43]">Finansial</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Dompet Komisi Sales & Recurring Revenue
          </h1>
          <p className="text-xs text-slate-500">
            Saldo komisi berulang dari {outlets.length} outlet binaan yang siap dicairkan ke rekening bank Anda
          </p>
        </div>

        <Link
          href="/commission/withdraw"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-[0_4px_14px_rgba(249,115,22,0.35)] transition-all active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">payments</span>
          <span>Tarik Saldo Sekarang</span>
        </Link>
      </div>

      {/* Main Grid: 12 Columns for Desktop & Tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Hero Wallet Card & Bank Account */}
        <div className="lg:col-span-5 space-y-5">
          {/* Hero Navy Wallet Card */}
          <div className="rounded-3xl bg-gradient-to-br from-[#0B1D3A] via-[#102A43] to-[#1E3E62] text-white p-6 shadow-xl border border-[#1E3E62] relative overflow-hidden space-y-6">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-[#F97316]/20 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider font-display">
                SALDO SIAP DITARIK
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                ● Real-time
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-bold font-display text-white tabular-nums tracking-tight">
                Rp {availableBalance.toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Tersedia untuk ditransfer ke rekening bank terdaftar Anda
              </p>
            </div>

            <Link
              href="/commission/withdraw"
              className="w-full py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span>Ajukan Penarikan Dana</span>
            </Link>

            {/* Split Mini Metric Panel */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1E3E62]">
              <div className="p-3 rounded-xl bg-[#0B1D3A]/60 border border-[#1E3E62]/80">
                <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[15px]">hourglass_top</span>
                  <span>Tertahan (Escrow)</span>
                </div>
                <div className="text-base font-bold font-display text-white mt-1 tabular-nums">
                  Rp {escrowBalance.toLocaleString("id-ID")}
                </div>
                <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                  Cair saat outlet bayar
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1D3A]/60 border border-[#1E3E62]/80">
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[15px]">trending_up</span>
                  <span>Proyeksi Bulanan</span>
                </div>
                <div className="text-base font-bold font-display text-white mt-1 tabular-nums">
                  Rp {projectedMonthly.toLocaleString("id-ID")}
                </div>
                <span className="text-[10px] text-emerald-300 leading-tight block mt-0.5">
                  +18% dari bulan lalu
                </span>
              </div>
            </div>
          </div>

          {/* Registered Bank Account */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E2E8F0] space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Rekening Pencairan Terdaftar
            </span>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#102A43] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  BCA
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{salesProfile.bankName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Utama
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {salesProfile.bankAccount} ({salesProfile.name})
                  </div>
                </div>
              </div>

              <Link
                href="/profile"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                title="Ganti Rekening di Profil"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </Link>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Pencairan diproses otomatis oleh tim finance H+1 hari kerja. Bebas biaya transfer antar bank BCA.
            </p>
          </div>

          {/* Tax PPh 21 Info Note */}
          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 text-xs text-slate-700 flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] text-[#F97316] shrink-0 mt-0.5">
              receipt_long
            </span>
            <div className="space-y-1">
              <div className="font-bold text-[#102A43]">Potongan PPh 21 Otomatis 5%</div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Sebagai mitra resmi PT Pro Teknologi ber-NPWP valid, setiap penarikan dipotong pajak PPh 21 resmi 5%. Bukti potong dapat diunduh di menu Riwayat.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Mutation Ledger Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#102A43] font-display">
                  Mutasi Komisi & Penarikan
                </h2>
                <p className="text-xs text-slate-500">Transparansi penghasilan per transaksi outlet</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setFilterType("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterType === "ALL" ? "bg-white text-[#102A43] shadow-sm" : "text-slate-600"
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterType("INCOME")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterType === "INCOME" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"
                  }`}
                >
                  Komisi Masuk
                </button>
                <button
                  onClick={() => setFilterType("WITHDRAW")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterType === "WITHDRAW" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                  }`}
                >
                  Penarikan
                </button>
              </div>
            </div>

            {/* Mutations List */}
            <div className="space-y-3">
              {filteredMutations.map((mut) => (
                <div
                  key={mut.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        mut.amount > 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {mut.amount > 0 ? "arrow_downward" : "arrow_upward"}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-slate-900">{mut.outletName}</div>
                      <div className="text-[11px] text-slate-400">
                        {mut.invoiceNo} • {mut.date}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-bold font-display text-sm tabular-nums ${
                        mut.amount > 0 ? "text-emerald-600" : "text-slate-900"
                      }`}
                    >
                      {mut.amount > 0 ? "+" : ""} Rp {Math.abs(mut.amount).toLocaleString("id-ID")}
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Potongan PPh 21: Rp {mut.taxAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Menampilkan 4 mutasi terkini</span>
            <Link
              href="/commission/history"
              className="font-bold text-[#F97316] hover:underline"
            >
              Lihat Riwayat & Download Bukti Potong Pajak &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
