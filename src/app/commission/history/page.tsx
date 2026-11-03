"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function CommissionHistoryPage() {
  const { rawWithdrawals, salesProfile } = useApp();
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedProof, setSelectedProof] = useState<any | null>(null);

  const totalWithdrawn = rawWithdrawals
    .filter((w) => w.status === "COMPLETED")
    .reduce((sum, w) => sum + (w.amount || 0), 0);

  const totalTaxPaid = rawWithdrawals
    .filter((w) => w.status === "COMPLETED")
    .reduce((sum, w) => sum + (w.taxAmount || Math.round((w.amount || 0) * 0.025)), 0);

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
            <span className="text-[#102A43]">Riwayat Transfer & Bukti Pajak</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Riwayat Pencairan Komisi & Bukti Transfer Admin
          </h1>
          <p className="text-xs text-slate-500">
            Arsip resmi mutasi transfer manual oleh Admin HQ dan bukti potong pajak PPh 21 untuk SPT tahunan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/commission/withdraw"
            className="px-3.5 py-1.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors shadow-sm"
          >
            + Formulir Pencairan 100%
          </Link>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-9 px-3 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#102A43] outline-none shadow-sm"
          >
            <option value="2026">Tahun 2026</option>
            <option value="2025">Tahun 2025</option>
          </select>
        </div>
      </div>

      {/* Annual Tax & Payout Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0B1D3A] text-white border border-[#1E3E62] shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-semibold">Total Komisi Bruto Ditransfer ({selectedYear})</span>
          <div className="text-2xl font-bold font-display text-white tabular-nums">
            Rp {totalWithdrawn.toLocaleString("id-ID")}
          </div>
          <span className="text-[11px] text-slate-400">Akumulasi pencairan 100% saldo</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-semibold">Total PPh 21 Disetor Resmi</span>
          <div className="text-2xl font-bold font-display text-emerald-700 tabular-nums">
            Rp {totalTaxPaid.toLocaleString("id-ID")}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            Tarif 2.5% NPWP Tervalidasi DJP
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-semibold">Rekening Penerima Terdaftar</span>
          <div className="text-sm font-mono font-bold text-slate-900 mt-1">
            {salesProfile.bankName} - {salesProfile.bankAccount}
          </div>
          <span className="text-[11px] text-slate-500">
            Atas Nama: <strong>{salesProfile.name}</strong>
          </span>
        </div>
      </div>

      {/* Withdrawal Logs Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-[#102A43] font-display">
              Daftar Permohonan & Bukti Transfer Manual Admin
            </h2>
            <p className="text-xs text-slate-500">
              Setiap pencairan ditransfer manual oleh Admin HQ dan dilengkapi bukti transfer bank
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {rawWithdrawals.length} Transaksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Transaksi & Tanggal</th>
                <th className="py-3 px-4">Rekening Tujuan</th>
                <th className="py-3 px-4">Nominal Bruto (100%)</th>
                <th className="py-3 px-4">PPh 21 (2.5%)</th>
                <th className="py-3 px-4">Dana Bersih (Net)</th>
                <th className="py-3 px-4">Status Transfer</th>
                <th className="py-3 px-4 text-right">Bukti Transfer & Pajak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rawWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">
                      receipt_long
                    </span>
                    Belum ada riwayat permohonan penarikan dana tercatat
                  </td>
                </tr>
              ) : (
                rawWithdrawals.map((w: any) => {
                  const gross = w.amount || 0;
                  const tax = w.taxAmount || Math.round(gross * 0.025);
                  const net = w.netAmount || gross - tax;
                  const dateStr = new Date(w.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">#WD-{w.id.slice(0, 8).toUpperCase()}</div>
                        <div className="text-[11px] text-slate-400">{dateStr}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{w.bankName || "BCA"}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {w.accountNumber || salesProfile.bankAccount} ({w.accountHolder || salesProfile.name})
                        </div>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums font-bold text-slate-900">
                        Rp {gross.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-red-600 font-semibold">
                        - Rp {tax.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums font-bold text-emerald-700">
                        Rp {net.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4">
                        {w.status === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            TRANSFER BERHASIL
                          </span>
                        ) : w.status === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            DITOLAK ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            MENUNGGU TRANSFER MANUAL
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {w.proofUrl ? (
                            <button
                              type="button"
                              onClick={() => setSelectedProof(w)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs inline-flex items-center gap-1 border border-emerald-200 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">image</span>
                              <span>Bukti Transfer</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              {w.status === "PENDING" ? "Menunggu Admin..." : "-"}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => alert(`Mengunduh Bukti Potong Pajak PPh 21 (${w.id.slice(0, 8).toUpperCase()}.pdf)...`)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#102A43] font-bold text-xs inline-flex items-center gap-1 transition-colors"
                            title="Unduh Formulir 1721-VII"
                          >
                            <span className="material-symbols-outlined text-[16px]">description</span>
                            <span>PPh 21</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Bukti Transfer Admin HQ */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-[#0B1D3A]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">verified</span>
                <h3 className="text-base font-bold text-[#102A43] font-display">
                  Bukti Transfer Resmi Admin HQ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProof(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Transaksi:</span>
                <span className="font-mono font-bold text-slate-900">#WD-{selectedProof.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nominal Bersih Diterima:</span>
                <span className="font-bold text-emerald-700 font-display">
                  Rp {(selectedProof.netAmount || selectedProof.amount).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rekening Tujuan:</span>
                <span className="font-bold text-slate-900">
                  {selectedProof.bankName} - {selectedProof.accountNumber}
                </span>
              </div>
              {selectedProof.adminNotes && (
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-slate-500 block">Catatan Admin HQ:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedProof.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Proof Image / Document Container */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center p-2 min-h-[160px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProof.proofUrl}
                alt="Bukti Transfer Bank"
                className="max-h-72 w-auto object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.parentElement?.querySelector(".fallback-note");
                  if (fallback) fallback.classList.remove("hidden");
                }}
              />
              <div className="fallback-note hidden text-center p-4 text-xs text-slate-500">
                <span className="material-symbols-outlined text-3xl text-emerald-600 block mb-1">
                  receipt_long
                </span>
                <span className="font-bold text-slate-800 block">Bukti Transfer Digital</span>
                <span className="font-mono text-[11px] text-slate-500 break-all">{selectedProof.proofUrl}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedProof(null)}
              className="w-full h-11 rounded-xl bg-[#102A43] hover:bg-[#0B1D3A] text-white font-bold text-xs shadow-sm transition-all"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}