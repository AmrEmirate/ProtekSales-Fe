"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

export default function OrganizationSalesPage() {
  const { salesProfile, outlets, refreshData } = useApp();
  const [salesList, setSalesList] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Aggregate sales reps from outlets
  const salesMap: Record<string, { name: string; outletsCount: number; totalMrr: number; activeCount: number }> = {};
  outlets.forEach((o) => {
    const sName = o.salesName || "Mitra Sales";
    if (!salesMap[sName]) {
      salesMap[sName] = { name: sName, outletsCount: 0, totalMrr: 0, activeCount: 0 };
    }
    salesMap[sName].outletsCount += 1;
    salesMap[sName].totalMrr += o.mrr;
    if (o.status === "LUNAS") salesMap[sName].activeCount += 1;
  });

  const salesArray = Object.values(salesMap).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/organization" className="hover:text-emerald-700">Organisasi</Link>
            <span>/</span>
            <span className="text-[#102A43]">Tim Sales</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Daftar Sales Terafiliasi
          </h1>
          <p className="text-xs text-slate-500">
            Mitra sales lapangan yang bernaung di bawah {salesProfile.organizationName || "Organisasi Anda"}
          </p>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama sales..."
            className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-xs text-[#102A43] outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700">Total: {salesArray.length} Mitra Sales Terdaftar</span>
          <span className="text-emerald-700 font-semibold">Skema: 20% Net Sales • 10% Net Organisasi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Nama Mitra Sales</th>
                <th className="py-3.5 px-4">Total Outlet Diakuisisi</th>
                <th className="py-3.5 px-4">Outlet Lunas (Aktif)</th>
                <th className="py-3.5 px-4">Omset Bulanan Merchant</th>
                <th className="py-3.5 px-4 text-right">Hak Organisasi (10%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {salesArray.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Tidak ditemukan data sales binaan
                  </td>
                </tr>
              ) : (
                salesArray.map((sales, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                          {sales.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{sales.name}</div>
                          <div className="text-[10px] text-slate-400">Komisi Sales: 20% Net</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {sales.outletsCount} Outlet
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        {sales.activeCount} Lunas
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                      Rp {sales.totalMrr.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700 tabular-nums">
                      Rp {Math.round(sales.totalMrr * 0.1).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
