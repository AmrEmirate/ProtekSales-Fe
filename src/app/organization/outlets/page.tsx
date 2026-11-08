"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function OrganizationOutletsPage() {
  const { salesProfile, outlets, refreshData } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const filteredOutlets = outlets.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.owner.toLowerCase().includes(search.toLowerCase()) ||
      (o.salesName || "").toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === "PAID") return o.status === "LUNAS";
    if (filter === "PENDING") return o.status !== "LUNAS";
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/organization" className="hover:text-emerald-700">Organisasi</Link>
            <span>/</span>
            <span className="text-[#102A43]">Outlet Hasil Sales</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Daftar Outlet Hasil Sales Binaan
          </h1>
          <p className="text-xs text-slate-500">
            Seluruh merchant yang berhasil diakuisisi oleh mitra sales di bawah {salesProfile.organizationName || "organisasi Anda"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari toko / sales..."
              className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-xs text-[#102A43] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            filter === "ALL" ? "bg-[#004532] text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Semua Outlet ({outlets.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("PAID")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            filter === "PAID" ? "bg-emerald-700 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Lunas / Royalti Cair ({outlets.filter((o) => o.status === "LUNAS").length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("PENDING")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            filter === "PENDING" ? "bg-amber-600 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Menunggu Pembayaran &amp; Approval ({outlets.filter((o) => o.status !== "LUNAS").length})
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        {/* Mobile View: Clean Dense Dossier Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredOutlets.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              Tidak ditemukan data outlet
            </div>
          ) : (
            filteredOutlets.map((outlet) => {
              const isPaid = outlet.status === "LUNAS";
              const orgShare = Math.round(outlet.mrr * 0.1);
              return (
                <div key={outlet.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">{outlet.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {outlet.owner} • {outlet.phone}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Sales: <span className="font-semibold text-slate-700">{outlet.salesName}</span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
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
                      {isPaid ? "LUNAS" : "PENDING"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Tagihan Toko</span>
                      <div className="font-bold text-slate-800 font-mono mt-0.5">
                        Rp {outlet.mrr.toLocaleString("id-ID")}/bln
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-700 uppercase font-bold">Hak Organisasi (10%)</span>
                      <div className="font-bold text-[#004532] tabular-nums font-mono text-sm mt-0.5">
                        Rp {orgShare.toLocaleString("id-ID")}
                      </div>
                      <div className="text-[10px] font-semibold mt-0.5">
                        {isPaid ? (
                          <span className="text-emerald-700">Masuk Saldo</span>
                        ) : (
                          <span className="text-amber-700">Tunggu Bayar</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Nama Toko &amp; Pemilik</th>
                <th className="py-3.5 px-4">Sales Pengakuisisi</th>
                <th className="py-3.5 px-4">Biaya Langganan</th>
                <th className="py-3.5 px-4">Hak Organisasi (10%)</th>
                <th className="py-3.5 px-4">Status Tagihan</th>
                <th className="py-3.5 px-4 text-right">Alur Royalti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOutlets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Tidak ditemukan data outlet
                  </td>
                </tr>
              ) : (
                filteredOutlets.map((outlet) => {
                  const isPaid = outlet.status === "LUNAS";
                  const orgShare = Math.round(outlet.mrr * 0.1);
                  return (
                    <tr key={outlet.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{outlet.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {outlet.owner} • {outlet.phone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {outlet.salesName}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                        Rp {outlet.mrr.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#004532] tabular-nums">
                        Rp {orgShare.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                          {isPaid ? "LUNAS" : "MENUNGGU APPROVAL"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-[11px]">
                        {isPaid ? (
                          <span className="text-emerald-700 font-bold">Dana Masuk Saldo</span>
                        ) : (
                          <span className="text-amber-700 font-medium">Tertahan (Tunggu TF UMKM)</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
