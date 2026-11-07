"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

export default function OrganizationDashboardPage() {
  const { salesProfile, outlets, availableBalance, escrowBalance, rawWithdrawals, refreshData } = useApp();
  const [salesTeam, setSalesTeam] = useState<any[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);

  useEffect(() => {
    refreshData();
    // Load affiliated sales team
    api.getMyLeads("all").catch(() => {});
    setIsLoadingTeam(false);
  }, [refreshData]);

  // Outlets acquired by sales of this organization
  const totalOutlets = outlets.length;
  const paidOutlets = outlets.filter((o) => o.status === "LUNAS").length;
  const pendingOutlets = outlets.filter((o) => o.status !== "LUNAS").length;

  const totalWithdrawn = rawWithdrawals
    .filter((w) => w.status === "COMPLETED" || w.status === "APPROVED")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Banner matching Stitch Emerald Ledger */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#004532] via-[#065F46] to-[#0F172A] p-6 sm:p-8 text-white shadow-xl border border-emerald-900">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
              <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
              <span>Portal Mitra Organisasi • Hak 10% Royalti Net</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
              {salesProfile.organizationName || salesProfile.name}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              Hak bagi hasil bersih 10% dari seluruh tagihan outlet yang diakuisisi oleh mitra sales binaan Anda. Seluruh pembayaran UMKM masuk ke rekening perusahaan terlebih dahulu sebelum didistribusikan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/commission/withdraw"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-[#004532] hover:bg-emerald-50 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span>Tarik Hak 10% (Rp {availableBalance.toLocaleString("id-ID")})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Financial Metrics Array: 4 Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Siap Tarik */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-emerald-200 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Saldo Siap Tarik (10%)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-display text-[#004532] tabular-nums">
              Rp {availableBalance.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>{paidOutlets} Outlet Lunas &amp; Disetujui Admin</span>
            </p>
          </div>
        </div>

        {/* Card 2: Menunggu Pembayaran & Approval Admin */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-amber-200 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Menunggu Approval Admin
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-display text-amber-600 tabular-nums">
              Rp {escrowBalance.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              <span>{pendingOutlets} Outlet Belum Lunas / Belum Approve</span>
            </p>
          </div>
        </div>

        {/* Card 3: Total Outlet Sales Binaan */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Outlet Sales Binaan
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-display text-[#102A43] tabular-nums">
              {totalOutlets} <span className="text-sm font-normal text-slate-500">Toko</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Semua UMKM yang didaftarkan sales terafiliasi
            </p>
          </div>
        </div>

        {/* Card 4: Total Telah Dicairkan */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Telah Dicairkan
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-display text-slate-800 tabular-nums">
              Rp {totalWithdrawn.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {rawWithdrawals.filter((w) => w.status === "COMPLETED").length} Kali Penarikan Sukses
            </p>
          </div>
        </div>
      </div>

      {/* Notice Edukasi Alur Pembayaran Langganan */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-[#004532] flex items-start gap-3 shadow-xs">
        <span className="material-symbols-outlined text-emerald-700 text-[22px] shrink-0 mt-0.5">verified_user</span>
        <div className="space-y-1">
          <div className="font-bold text-sm text-[#004532]">
            Transparansi Alur Keuangan &amp; Bagi Hasil 10% Organisasi
          </div>
          <p className="text-slate-700 leading-relaxed">
            1. Tagihan langganan bulanan dibayar oleh UMKM langsung ke rekening perusahaan PT Pro Teknologi.<br />
            2. Admin HQ memeriksa dan meng-<strong>approve pembayaran</strong> tersebut.<br />
            3. Begitu pembayaran disetujui, dana komisi otomatis didistribusikan: <strong>20% Net ke Sales</strong> yang mendaftarkan dan <strong>10% Net ke Organisasi</strong> ini.<br />
            4. Saldo yang berstatus belum bayar tidak dapat ditarik demi integritas pembukuan kas riil.
          </p>
        </div>
      </div>

      {/* 2-Columns: Daftar Outlet & Tim Sales Binaan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Daftar Outlet Hasil Sales Binaan */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#102A43] font-display">
                  Daftar Outlet Hasil Akuisisi Sales Binaan
                </h3>
                <p className="text-xs text-slate-500">
                  Pantau status pelunasan merchant dan hak komisi 10% organisasi
                </p>
              </div>
              <Link
                href="/organization/outlets"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                <span>Lihat Semua Outlet</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {outlets.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 space-y-2">
                <span className="material-symbols-outlined text-slate-400 text-[32px]">storefront</span>
                <p className="text-xs font-bold text-slate-700">Belum ada outlet terdaftar di bawah organisasi Anda</p>
                <p className="text-[11px] text-slate-400">
                  Outlet yang didaftarkan oleh sales binaan Anda akan otomatis muncul di sini.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {outlets.map((outlet) => {
                  const orgShare = Math.round(outlet.mrr * 0.1);
                  const isPaid = outlet.status === "LUNAS";
                  return (
                    <div key={outlet.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{outlet.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Pemilik: {outlet.owner} • Sales: <strong className="text-slate-700">{outlet.salesName}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs font-bold text-[#004532] tabular-nums">
                            Hak 10%: Rp {orgShare.toLocaleString("id-ID")}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Tagihan: Rp {outlet.mrr.toLocaleString("id-ID")}
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPaid ? "bg-emerald-600" : "bg-amber-600 animate-pulse"
                            }`}
                          />
                          {isPaid ? "LUNAS (CAIR)" : "MENUNGGU APPROVAL"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 Cols): Ringkasan Rekening & Penarikan */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-emerald-700 text-[20px]">account_balance</span>
              <h3 className="text-sm font-bold text-[#102A43] font-display">
                Rekening Pencairan Organisasi
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block font-sans">
                  Bank Tujuan
                </span>
                <span className="text-sm font-bold text-slate-800 font-sans">
                  {salesProfile.bankName}
                </span>
              </div>
              <div className="pt-1 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block font-sans">
                  Nomor Rekening
                </span>
                <span className="text-sm font-bold text-[#004532]">
                  {salesProfile.bankAccount}
                </span>
              </div>
            </div>

            <Link
              href="/commission/withdraw"
              className="w-full h-11 rounded-xl bg-[#004532] hover:bg-[#065F46] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span>Ajukan Penarikan Hak 10%</span>
            </Link>

            <Link
              href="/commission/history"
              className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">receipt</span>
              <span>Riwayat Pencairan</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
