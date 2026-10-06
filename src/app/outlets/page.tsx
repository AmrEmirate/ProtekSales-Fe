"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp, Outlet } from "@/context/AppContext";

export default function OutletsListPage() {
  const { outlets, toggleOutletLicense } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  // QRIS Payment Modal State
  const [activeModalOutlet, setActiveModalOutlet] = useState<Outlet | null>(null);

  // Kill Switch Confirmation Modal
  const [killSwitchTarget, setKillSwitchTarget] = useState<Outlet | null>(null);

  const lunasCount = outlets.filter((o) => o.status === "LUNAS").length;
  const h3Count = outlets.filter((o) => o.status === "H-3").length;
  const suspendedCount = outlets.filter((o) => o.status === "SUSPENDED").length;
  const totalMrr = outlets.reduce((sum, o) => sum + o.mrr, 0);

  const filteredOutlets = outlets.filter((out) => {
    const matchesFilter =
      activeFilter === "ALL" ||
      (activeFilter === "LUNAS" && out.status === "LUNAS") ||
      (activeFilter === "H-3" && out.status === "H-3") ||
      (activeFilter === "SUSPENDED" && out.status === "SUSPENDED");

    const matchesSearch =
      out.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      out.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      out.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      out.posSerial.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const confirmToggleKillSwitch = () => {
    if (killSwitchTarget) {
      toggleOutletLicense(killSwitchTarget.id);
      setKillSwitchTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Snapshot Banner Matching Original UI */}
      <div className="w-full rounded-2xl bg-gradient-to-br from-[#102A43] to-[#0B1D3A] text-white p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10 mb-4">
          <div>
            <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-wider font-display">
              Pendapatan Berulang (MRR)
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl font-bold font-display text-white tabular-nums tracking-tight">
                Rp {totalMrr.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-slate-300 font-medium">/bulan</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Komisi berjalan dari {outlets.length} gerai aktif di bawah naungan Anda
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/outlets/onboarding"
              className="px-4 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Aktivasi Lisensi Baru</span>
            </Link>
          </div>
        </div>

        {/* Health Breakdown Mini-Grid */}
        <div className="grid grid-cols-4 gap-2 pt-2 bg-[#1E3E62]/40 p-2.5 rounded-xl backdrop-blur-sm border border-[#1E3E62]/60">
          <div className="flex flex-col items-center text-center">
            <span className="text-[11px] text-slate-300">Total Outlet</span>
            <span className="text-base sm:text-lg font-bold font-display text-white mt-0.5">{outlets.length}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-[11px] text-emerald-400 font-semibold">Lunas</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-base sm:text-lg font-bold font-display text-white">{lunasCount}</span>
            </div>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-[11px] text-amber-400 font-semibold">H-3 Tempo</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-base sm:text-lg font-bold font-display text-white">{h3Count}</span>
            </div>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-[11px] text-red-400 font-semibold">Suspend</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-base sm:text-lg font-bold font-display text-white">{suspendedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
        {/* Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama toko atau outlet..."
            className="w-full h-11 pl-10 pr-4 bg-white rounded-xl text-[#102A43] text-xs font-semibold shadow-sm outline-none border border-slate-200 placeholder:text-slate-400 focus:border-[#F97316] transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
            search
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeFilter === "ALL"
                ? "bg-[#102A43] text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm"
            }`}
          >
            Semua (28)
          </button>
          <button
            onClick={() => setActiveFilter("LUNAS")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeFilter === "LUNAS"
                ? "bg-[#102A43] text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm"
            }`}
          >
            Lunas ({lunasCount})
          </button>
          <button
            onClick={() => setActiveFilter("H-3")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeFilter === "H-3"
                ? "bg-[#102A43] text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm"
            }`}
          >
            H-3 Jatuh Tempo ({h3Count})
          </button>
          <button
            onClick={() => setActiveFilter("SUSPENDED")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeFilter === "SUSPENDED"
                ? "bg-[#102A43] text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm"
            }`}
          >
            Menunggak ({suspendedCount})
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-sm self-end md:self-auto">
          <button
            onClick={() => setViewMode("GRID")}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "GRID" ? "bg-[#102A43] text-white" : "text-slate-500 hover:text-slate-900"
            }`}
            title="Tampilan Kartu Dossier"
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
          </button>
          <button
            onClick={() => setViewMode("TABLE")}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "TABLE" ? "bg-[#102A43] text-white" : "text-slate-500 hover:text-slate-900"
            }`}
            title="Tampilan Tabel"
          >
            <span className="material-symbols-outlined text-[18px]">table_rows</span>
          </button>
        </div>
      </div>

      {/* 3. Client Dossier Cards Stream (Adapted into responsive 2 or 3-column grid for Desktop/Tablet) */}
      {viewMode === "GRID" ? (
        filteredOutlets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#F97316] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">storefront</span>
            </div>
            <h3 className="text-base font-bold font-display text-[#102A43]">Belum Ada Outlet Terdaftar</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Belum ada data outlet aktif dalam database produksi. Daftarkan outlet baru atau lakukan onboarding lisensi POS.
            </p>
            <div className="pt-2">
              <Link
                href="/outlets/onboarding"
                className="px-4 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md transition-all inline-block"
              >
                Aktivasi Lisensi Baru
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOutlets.map((outlet) => {
              const isSuspended = outlet.status === "SUSPENDED";
              const isH3 = outlet.status === "H-3";
              const isLunas = outlet.status === "LUNAS";

              return (
                <div
                  key={outlet.id}
                  className="w-full bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E2E8F0] flex flex-col justify-between gap-3 hover:shadow-md transition-all relative overflow-hidden"
                >
                  {/* Suspended Red Top Accent Line */}
                {isSuspended && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
                )}

                <div className="space-y-3">
                  {/* Top Zone with Authentic Storefront Photo */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#e3efff] border border-slate-200">
                        {outlet.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={outlet.imageUrl}
                            alt={outlet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[#102A43]">
                            POS
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-[#102A43] font-display truncate">
                          {outlet.name}
                        </h3>
                        <span className="text-[11px] text-slate-500 truncate">
                          {outlet.packageType} • {outlet.code}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill Badge with 6px dot */}
                    {isLunas && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                        LUNAS
                      </span>
                    )}
                    {isH3 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-[11px] font-bold shrink-0 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
                        H-3 TEMPO
                      </span>
                    )}
                    {isSuspended && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#B91C1C] text-[11px] font-bold shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
                        SUSPENDED
                      </span>
                    )}
                  </div>

                  {/* Financial Metrics Pill Group */}
                  <div
                    className={`grid grid-cols-2 gap-2 p-2.5 rounded-xl ${
                      isSuspended ? "bg-red-50/60" : "bg-[#edf4ff]"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">
                        {isSuspended ? "Tunggakan (Lewat)" : isH3 ? "Tagihan Jatuh Tempo" : "Tagihan Bulanan"}
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-bold font-display tabular-nums ${
                          isSuspended ? "text-red-700" : "text-[#102A43]"
                        }`}
                      >
                        Rp {outlet.mrr.toLocaleString("id-ID")}
                        <span className="text-[10px] font-normal text-slate-500">/bln</span>
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span
                        className={`text-[10px] font-semibold uppercase ${
                          isSuspended ? "text-slate-500" : isH3 ? "text-amber-700" : "text-emerald-700"
                        }`}
                      >
                        {isSuspended ? "Hak Komisi" : isH3 ? "Batas Bayar" : "Komisi Anda (25%)"}
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-bold font-display tabular-nums ${
                          isSuspended
                            ? "text-slate-400"
                            : isH3
                            ? "text-amber-800"
                            : "text-emerald-700"
                        }`}
                      >
                        {isSuspended
                          ? "Ditahan (Pending)"
                          : isH3
                          ? outlet.dueDate
                          : `Rp ${Math.round(outlet.mrr * 0.25).toLocaleString("id-ID")}`}
                      </span>
                    </div>
                  </div>

                  {/* Warning / License Status Callout */}
                  {isLunas && (
                    <div className="flex items-center justify-between text-xs py-0.5">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Lisensi POS Berjalan Normal</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{outlet.dueDate}</span>
                    </div>
                  )}

                  {isH3 && (
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#FFF7ED] text-[#9d4300] text-xs">
                      <span className="material-symbols-outlined text-[16px] text-[#F97316] shrink-0">
                        info
                      </span>
                      <span className="text-[11px] leading-tight">
                        Lisensi otomatis terkunci jika lewat masa toleransi 3 hari.
                      </span>
                    </div>
                  )}

                  {isSuspended && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 text-red-700 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">lock</span>
                        <span className="text-[11px] font-bold">Remote Kill-Switch Aktif</span>
                      </div>
                      <span className="material-symbols-outlined text-[16px]">gpp_bad</span>
                    </div>
                  )}

                  {/* Kill Switch Toggle Control */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">Saklar Remote POS:</span>
                    <button
                      type="button"
                      onClick={() => setKillSwitchTarget(outlet)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                        outlet.licenseActive ? "bg-emerald-600" : "bg-red-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          outlet.licenseActive ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Actions Matching Original Prototype */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {isSuspended ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveModalOutlet(outlet)}
                        className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                        <span>Buka Kunci (Kirim QRIS)</span>
                      </button>
                      <a
                        href={`https://wa.me/${outlet.phone.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(
                          outlet.owner
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-red-700 flex items-center justify-center transition-colors"
                        title="Telepon / WhatsApp"
                      >
                        <span className="material-symbols-outlined text-[18px]">call</span>
                      </a>
                    </>
                  ) : isH3 ? (
                    <>
                      <a
                        href={`https://wa.me/${outlet.phone.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(
                          outlet.owner
                        )},%20kami%20dari%20PT%20Pro%20Teknologi%20mengingatkan%20tagihan%20lisensi%20POS%20jatuh%20tempo%20pada%20${encodeURIComponent(
                          outlet.dueDate
                        )}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 h-10 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                        <span>Kirim Pengingat WA</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setActiveModalOutlet(outlet)}
                        className="w-10 h-10 rounded-xl bg-[#e3efff] hover:bg-[#d8eaff] text-[#102A43] flex items-center justify-center transition-colors"
                        title="Kirim Tagihan & QRIS"
                      >
                        <span className="material-symbols-outlined text-[18px]">share</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/outlets/detail"
                        className="flex-1 h-10 rounded-xl bg-[#e3efff] hover:bg-[#d8eaff] text-[#102A43] font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                        <span>Bukti Bayar</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setActiveModalOutlet(outlet)}
                        className="flex-1 h-10 rounded-xl bg-[#00152a] hover:bg-[#102A43] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                        <span>Kirim QRIS</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )
    ) : (
        /* Table View */
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Toko / Outlet</th>
                  <th className="py-3.5 px-4">Serial Hardware POS</th>
                  <th className="py-3.5 px-4">Tagihan & Komisi</th>
                  <th className="py-3.5 px-4">Jatuh Tempo</th>
                  <th className="py-3.5 px-4">Status Lisensi</th>
                  <th className="py-3.5 px-4 text-center">Remote Kill-Switch</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOutlets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center mx-auto mb-2">
                        <span className="material-symbols-outlined text-[24px]">storefront</span>
                      </div>
                      <p className="font-bold text-slate-700 text-xs">Belum ada outlet aktif di database</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Mulai dengan menambahkan prospek baru</p>
                    </td>
                  </tr>
                ) : (
                  filteredOutlets.map((outlet) => (
                    <tr key={outlet.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                          {outlet.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={outlet.imageUrl}
                              alt={outlet.name}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{outlet.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {outlet.owner} • {outlet.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {outlet.posSerial}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      <div className="font-bold text-slate-900">
                        Rp {outlet.mrr.toLocaleString("id-ID")}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        Komisi: Rp {Math.round(outlet.mrr * 0.25).toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {outlet.dueDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          outlet.status === "LUNAS"
                            ? "bg-[#DCFCE7] text-[#15803D]"
                            : outlet.status === "H-3"
                            ? "bg-[#FEF3C7] text-[#B45309]"
                            : "bg-[#FEE2E2] text-[#B91C1C]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            outlet.status === "LUNAS"
                              ? "bg-[#15803D]"
                              : outlet.status === "H-3"
                              ? "bg-[#B45309]"
                              : "bg-[#B91C1C]"
                          }`}
                        />
                        {outlet.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setKillSwitchTarget(outlet)}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                          outlet.licenseActive ? "bg-emerald-600" : "bg-red-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            outlet.licenseActive ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveModalOutlet(outlet)}
                        className="px-2.5 py-1 rounded-lg bg-[#e3efff] text-[#102A43] hover:bg-[#d8eaff] font-bold text-xs"
                      >
                        QRIS
                      </button>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QRIS Modal Popover Matching Blueprint */}
      {activeModalOutlet && (
        <div className="fixed inset-0 z-50 bg-[#0B1D3A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                </div>
                <h3 className="text-base font-bold text-[#102A43] font-display">
                  Tagihan & QRIS Kilat
                </h3>
              </div>
              <button
                onClick={() => setActiveModalOutlet(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#edf4ff] border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 block">Klien Binaan</span>
                <span className="font-bold text-sm text-[#102A43]">{activeModalOutlet.name}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Total Tagihan</span>
                <span className="font-bold text-sm text-[#F97316] tabular-nums">
                  Rp {activeModalOutlet.mrr.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* QR Pattern Display */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-inner flex flex-col items-center justify-center space-y-2.5 text-center">
              <div className="w-44 h-44 bg-[#0B1D3A] rounded-xl p-3 flex items-center justify-center text-white">
                <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="10" y="10" width="25" height="25" fill="white" />
                  <rect x="15" y="15" width="15" height="15" fill="#0B1D3A" />
                  <rect x="65" y="10" width="25" height="25" fill="white" />
                  <rect x="70" y="15" width="15" height="15" fill="#0B1D3A" />
                  <rect x="10" y="65" width="25" height="25" fill="white" />
                  <rect x="15" y="70" width="15" height="15" fill="#0B1D3A" />
                  <rect x="42" y="42" width="16" height="16" fill="#F97316" />
                  <rect x="45" y="10" width="10" height="20" fill="white" />
                  <rect x="65" y="45" width="25" height="10" fill="white" />
                  <rect x="10" y="45" width="20" height="10" fill="white" />
                  <rect x="45" y="70" width="20" height="15" fill="white" />
                  <rect x="70" y="70" width="15" height="15" fill="white" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                QRIS Dinamis • PT Pro Teknologi
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/${activeModalOutlet.phone.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(
                  activeModalOutlet.owner
                )},%20berikut%20tagihan%20lisensi%20POS%20ProTek%20sebesar%20Rp%20${activeModalOutlet.mrr.toLocaleString(
                  "id-ID"
                )}.%20Silakan%20scan%20QRIS.`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Kirim Link Tagihan ke WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Kill Switch Warning Modal */}
      {killSwitchTarget && (
        <div className="fixed inset-0 z-50 bg-[#0B1D3A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">power_settings_new</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Konfirmasi Saklar Lisensi POS
                </h3>
                <p className="text-xs text-slate-500">Perubahan status remote heartbeat</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anda akan {killSwitchTarget.licenseActive ? "menonaktifkan (SUSPEND)" : "mengaktifkan kembali"}{" "}
              lisensi POS untuk outlet <strong>{killSwitchTarget.name}</strong>.
              {killSwitchTarget.licenseActive
                ? " Mesin kasir klien akan terkunci seketika dan tidak dapat memproses transaksi baru."
                : " Mesin kasir akan langsung aktif kembali begitu menerima sinyal heartbeat online."}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setKillSwitchTarget(null)}
                className="flex-1 h-11 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmToggleKillSwitch}
                className={`flex-1 h-11 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
                  killSwitchTarget.licenseActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                Ya, Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
