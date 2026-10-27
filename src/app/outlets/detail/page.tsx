"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

export default function OutletDetailPage() {
  const { outlets, toggleOutletLicense } = useApp();
  const [selectedOutletId, setSelectedOutletId] = useState(outlets[0]?.id || "");
  const [cloudPosData, setCloudPosData] = useState<any>(null);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  const outlet = outlets.find((o) => o.id === selectedOutletId) || outlets[0];

  const loadCloudPosData = useCallback(async (outletId: string) => {
    if (!outletId) return;
    setIsLoadingCloud(true);
    try {
      const res = await api.getOutletCloudPosLive(outletId);
      if (res?.connected && res.data) {
        setCloudPosData(res.data);
        setIsCloudConnected(true);
      } else {
        setCloudPosData(null);
        setIsCloudConnected(false);
      }
    } catch {
      setCloudPosData(null);
      setIsCloudConnected(false);
    } finally {
      setIsLoadingCloud(false);
    }
  }, []);

  useEffect(() => {
    if (outlet?.id) {
      loadCloudPosData(outlet.id);
    }
  }, [outlet?.id, loadCloudPosData]);

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

      {/* 4. Live Data Telemetri & Transaksi Real-time dari Cloud POS Engine */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                isCloudConnected
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isCloudConnected ? "cloud_sync" : "cloud_off"}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#102A43] font-display">
                  Telemetri Operasional Cloud POS
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isCloudConnected
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {isCloudConnected ? "TERHUBUNG REAL-TIME" : "STANDBY / OFFLINE"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mengambil data transaksi kasir, omset harian, dan kuota langsung dari Cloud POS Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadCloudPosData(outlet.id)}
              disabled={isLoadingCloud}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <span className={`material-symbols-outlined text-[16px] ${isLoadingCloud ? "animate-spin" : ""}`}>
                refresh
              </span>
              <span>{isLoadingCloud ? "Menghubungkan..." : "Refresh Data POS"}</span>
            </button>

            {cloudPosData?.tenant?.webPosUrl && (
              <a
                href={cloudPosData.tenant.webPosUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Buka Web POS</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            )}
          </div>
        </div>

        {isCloudConnected && cloudPosData ? (
          <div className="space-y-5">
            {/* 4 Cards Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Omset Hari Ini</span>
                <div className="text-lg font-bold font-display text-emerald-700 mt-1 tabular-nums">
                  Rp {(cloudPosData.stats?.todayGmv || 0).toLocaleString("id-ID")}
                </div>
                <span className="text-[10px] text-emerald-600">
                  Total Akumulasi: Rp {(cloudPosData.stats?.totalGmv || 0).toLocaleString("id-ID")}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">Transaksi Hari Ini</span>
                <div className="text-lg font-bold font-display text-blue-700 mt-1 tabular-nums">
                  {cloudPosData.stats?.todayOrders || 0} Order
                </div>
                <span className="text-[10px] text-blue-600">
                  Total Order: {cloudPosData.stats?.totalOrders || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Kuota Transaksi Cabang</span>
                <div className="text-lg font-bold font-display text-amber-800 mt-1 tabular-nums">
                  {cloudPosData.stats?.isUnlimited
                    ? "Unlimited"
                    : `${cloudPosData.stats?.todayOrders || 0} / ${cloudPosData.stats?.dailyLimit} tx`}
                </div>
                <span className="text-[10px] text-amber-600">
                  {cloudPosData.stats?.isUnlimited
                    ? "Tanpa Batas Kuota"
                    : `Sisa Kuota Hari Ini: ${cloudPosData.stats?.todayRemaining} tx`}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200">
                <span className="text-[10px] font-bold text-indigo-800 uppercase block">Shift Kasir Aktif</span>
                <div className="text-sm font-bold font-display text-indigo-900 mt-1 truncate">
                  {cloudPosData.activeShift?.cashierName || "Belum Ada Shift"}
                </div>
                <span className="text-[10px] text-indigo-600">
                  {cloudPosData.activeShift ? "Sedang bertugas di kasir" : "Kasir belum login"}
                </span>
              </div>
            </div>

            {/* Recent Orders from POS */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
                5 Transaksi Penjualan Terakhir di Kasir POS Klien
              </h4>
              {cloudPosData.recentOrders?.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">No. Invoice</th>
                        <th className="py-2.5 px-3">Waktu Transaksi</th>
                        <th className="py-2.5 px-3">Metode Bayar</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Total Transaksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cloudPosData.recentOrders.map((ord: any) => (
                        <tr key={ord.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{ord.invoiceNumber}</td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {new Date(ord.createdAt).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 text-[10px]">
                              {ord.paymentMethod}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            Rp {(ord.totalAmount || 0).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
                  Belum ada riwayat transaksi penjualan di kasir POS outlet ini.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-[20px]">info</span>
              <span>
                Menghubungkan ke Cloud POS Backend Engine menggunakan License Key{" "}
                <strong className="font-mono text-slate-800">{outlet.posSerial}</strong>...
              </span>
            </div>
            <button
              onClick={() => loadCloudPosData(outlet.id)}
              className="px-3 py-1.5 rounded-lg bg-[#102A43] text-white font-bold text-[11px]"
            >
              Cek Ulang Koneksi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
