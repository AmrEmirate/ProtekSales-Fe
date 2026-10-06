"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function CommissionHistoryPage() {
  const { mutations, salesProfile } = useApp();
  const [selectedYear, setSelectedYear] = useState("2026");

  const withdrawals = mutations.filter((m) => m.type === "WITHDRAWAL");

  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const totalTaxPaid = withdrawals.reduce(
    (sum, w) => sum + (w.taxAmount || Math.round(w.amount * 0.025)),
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <Link href="/commission/wallet" className="hover:text-[#F97316]">Dompet</Link>
            <span>/</span>
            <span className="text-[#102A43]">Riwayat & Pajak PPh 21</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Riwayat Pencairan & Bukti Potong Pajak (PPh 21)
          </h1>
          <p className="text-xs text-slate-500">
            Arsip resmi mutasi transfer komisi dan dokumen faktur pajak untuk pelaporan SPT tahunan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-10 px-3.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#102A43] outline-none shadow-sm"
          >
            <option value="2026">Tahun Pajak 2026</option>
            <option value="2025">Tahun Pajak 2025</option>
          </select>
        </div>
      </div>

      {/* Annual Tax Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0B1D3A] text-white border border-[#1E3E62] shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-semibold">Total Komisi Bruto {selectedYear}</span>
          <div className="text-2xl font-bold font-display text-white tabular-nums">
            Rp {totalWithdrawn.toLocaleString("id-ID")}
          </div>
          <span className="text-[11px] text-slate-400">Total akumulasi pencairan</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-semibold">Total PPh 21 Disetor ke Kas Negara</span>
          <div className="text-2xl font-bold font-display text-emerald-700 tabular-nums">
            Rp {totalTaxPaid.toLocaleString("id-ID")}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            NTPN Tervalidasi DJP
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-semibold">Status NPWP Sales</span>
          <div className="text-sm font-mono font-bold text-slate-900 mt-1">
            09.821.442.8-014.000
          </div>
          <span className="text-[11px] text-slate-500">
            Atas Nama: <strong>{salesProfile.name}</strong> (Tarif Normal 5%)
          </span>
        </div>
      </div>

      {/* Withdrawal Logs Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-[#102A43] font-display">
              Daftar Penarikan Dana & Bukti Potong Pajak
            </h2>
            <p className="text-xs text-slate-500">
              Unduh bukti potong formulir 1721-VII untuk lampiran SPT tahunan
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {withdrawals.length} Transaksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Transaksi & Tanggal</th>
                <th className="py-3 px-4">Rekening Tujuan</th>
                <th className="py-3 px-4">Nominal Bruto</th>
                <th className="py-3 px-4">PPh 21 (5%)</th>
                <th className="py-3 px-4">Nominal Bersih</th>
                <th className="py-3 px-4">Status Transfer</th>
                <th className="py-3 px-4 text-right">Bukti Potong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {withdrawals.map((item) => {
                const gross = Math.abs(item.amount);
                const tax = item.taxAmount;
                const net = gross - tax;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{item.invoiceNo}</div>
                      <div className="text-[11px] text-slate-400">{item.date}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{item.outletName}</div>
                      <div className="text-[10px] text-slate-400">BCA - Bebas Biaya</div>
                    </td>
                    <td className="py-3 px-4 tabular-nums font-bold text-slate-900">
                      Rp {gross.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 tabular-nums text-red-600 font-semibold">
                      - Rp {tax.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 tabular-nums font-bold text-emerald-700">
                      Rp {net.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        TRANSFER BERHASIL
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Mengunduh Bukti Potong Pajak PPh 21 (${item.invoiceNo}.pdf)...`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#102A43] font-bold text-xs inline-flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        <span>PDF PPh 21</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
