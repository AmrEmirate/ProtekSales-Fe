"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function OutletDetailPage() {
  const { outlets, toggleOutletLicense } = useApp();
  const [selectedOutletId, setSelectedOutletId] = useState(outlets[0]?.id || "");

  const outlet = outlets.find((o) => o.id === selectedOutletId) || outlets[0];

  if (!outlet || outlets.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
          <span>/</span>
          <Link href="/outlets" className="hover:text-[#F97316]">Outlets</Link>
          <span>/</span>
          <span className="text-[#102A43]">Detail Klien</span>
        </div>
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#F97316] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">storefront</span>
          </div>
          <h2 className="text-xl font-bold font-display text-[#102A43]">Belum Ada Klien Outlet Aktif</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Daftarkan outlet baru setelah deal prospek atau lakukan onboarding aktivasi lisensi POS perdana.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/outlets/onboarding"
              className="px-4 py-2.5 rounded-xl bg-[#F97316] text-white font-bold text-xs shadow-md hover:bg-[#EA580C] transition-all"
            >
              Aktivasi Lisensi Outlet Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <Link href="/outlets" className="hover:text-[#F97316]">Outlets</Link>
            <span>/</span>
            <span className="text-[#102A43]">Detail Klien & Remote Saklar</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Detail Klien & Status Lisensi POS
          </h1>
          <p className="text-xs text-slate-500">
            Audit hardware, integrasi heartbeat ping, tagihan bulanan & kontrol saklar darurat
          </p>
        </div>

        {/* Outlet Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500">Pilih Outlet:</label>
          <select
            value={selectedOutletId}
            onChange={(e) => setSelectedOutletId(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#102A43] outline-none shadow-sm"
          >
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#102A43] text-white flex items-center justify-center font-bold text-lg shrink-0">
              {outlet.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F97316] uppercase tracking-wider">
                  {outlet.category}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-xs font-bold text-slate-500">{outlet.code}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
                {outlet.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Owner: <strong>{outlet.owner}</strong> • {outlet.phone}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{outlet.address}</p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <a
              href={`https://wa.me/${outlet.phone.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(
                outlet.owner
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>Hubungi WhatsApp</span>
            </a>
            <Link
              href="/outlets/bast"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#102A43] hover:bg-[#0B1D3A] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">draw</span>
              <span>BAST Hardware</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Remote Kill Switch & Hardware Info (12 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 Cols): Hardware POS & Heartbeat */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-[#0284C7] text-[22px]">devices</span>
            <h3 className="text-base font-bold text-[#102A43] font-display">
              Spesifikasi Hardware & Lisensi Mesin Kasir
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Model Perangkat POS</span>
              <span className="font-bold text-slate-900">{outlet.packageType}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Nomor Seri (Hardware SN)</span>
              <span className="font-mono font-bold text-slate-800">{outlet.posSerial}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Status Ping Heartbeat</span>
              <span className="flex items-center gap-1 font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {outlet.lastHeartbeat}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Jatuh Tempo Pembayaran</span>
              <span className="font-bold text-slate-900">{outlet.dueDate}</span>
            </div>
          </div>
        </div>

        {/* Right Column (6 Cols): Remote Kill-Switch Action Panel */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-[22px]">power_settings_new</span>
                <h3 className="text-base font-bold text-[#102A43] font-display">
                  Remote Kill-Switch Lisensi
                </h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  outlet.licenseActive
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {outlet.licenseActive ? "ONLINE & AKTIF" : "KASIR TERKUNCI (SUSPEND)"}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {outlet.licenseActive
                ? "Lisensi software POS berjalan normal di outlet. Jika terdapat kendala penunggakan melewati grace period atau sengketa, Anda dapat memutus lisensi secara remote."
                : "Aplikasi POS di outlet saat ini dinonaktifkan secara remote. Merchant tidak dapat menginput penjualan sebelum tagihan diselesaikan atau saklar diaktifkan kembali."}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="text-xs">
                <div className="font-bold text-slate-900">Saklar Penonaktifan Cepat</div>
                <div className="text-[11px] text-slate-500">Klik untuk beralih mode aktif / suspend</div>
              </div>

              <button
                onClick={() => toggleOutletLicense(outlet.id)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  outlet.licenseActive ? "bg-emerald-600" : "bg-red-600"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    outlet.licenseActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/outlets/support"
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span>Buat Tiket Kendala Hardware & Suplai Kasir</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Financial Split: Client Bill vs Sales Rep 25% Commission */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
        <h3 className="text-base font-bold text-[#102A43] font-display">
          Alokasi Finansial & Komisi Recurring
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Tagihan Bulanan Merchant</span>
            <div className="text-lg font-bold font-display text-slate-900 mt-1 tabular-nums">
              Rp {outlet.mrr.toLocaleString("id-ID")}
            </div>
            <span className="text-[10px] text-slate-400">Paket Software + Cloud POS</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-800 font-medium">Komisi Sales Anda (25%)</span>
            <div className="text-lg font-bold font-display text-emerald-700 mt-1 tabular-nums">
              Rp {Math.round(outlet.mrr * 0.25).toLocaleString("id-ID")}
            </div>
            <span className="text-[10px] text-emerald-600">Berulang setiap bulan selama aktif</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-blue-800 font-medium">Total Akumulasi Komisi Diterima</span>
            <div className="text-lg font-bold font-display text-blue-700 mt-1 tabular-nums">
              Rp {(Math.round(outlet.mrr * 0.25) * 8).toLocaleString("id-ID")}
            </div>
            <span className="text-[10px] text-blue-600">Terhitung 8 bulan berjalan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
