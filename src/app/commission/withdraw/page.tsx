"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function WithdrawPage() {
  const router = useRouter();
  const {
    availableBalance,
    salesProfile,
    requestWithdrawal,
    hasWithdrawnThisMonth,
    hasPendingWithdrawal,
  } = useApp();

  // Aturan Mutlak PT Pro Teknologi: 1 kali penarikan WAJIB menghabiskan SEMUA saldo yang ada
  const amount = availableBalance;
  const [selectedBank, setSelectedBank] = useState(salesProfile.bankName || "BCA");
  const [accountNumber, setAccountNumber] = useState(salesProfile.bankAccount || "883-091-2811");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Pajak PPh 21 resmi: 2.5% jika NPWP aktif, 3.0% normal
  const taxAmount = Math.round(amount * 0.025);
  const netAmount = Math.max(0, amount - taxAmount);

  // Evaluasi kelayakan penarikan
  const isBelowMinimum = availableBalance < 100000;
  const canWithdraw = !hasWithdrawnThisMonth && !hasPendingWithdrawal && !isBelowMinimum && availableBalance > 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);

    if (hasWithdrawnThisMonth) {
      setErrorNotice("Penarikan komisi hanya dapat dilakukan 1 kali per bulan. Anda sudah memiliki penarikan pada periode bulan ini.");
      return;
    }

    if (hasPendingWithdrawal) {
      setErrorNotice("Anda masih memiliki permohonan penarikan yang berstatus PENDING. Harap menunggu admin menyelesaikan transfer manual.");
      return;
    }

    if (isBelowMinimum) {
      setErrorNotice("Batas minimum pencairan saldo adalah Rp 100.000.");
      return;
    }

    setIsProcessing(true);
    try {
      await requestWithdrawal(amount, selectedBank, accountNumber);
      setSuccessNotice("Permohonan penarikan saldo 100% berhasil diajukan! Notifikasi telah dikirim ke Admin HQ untuk proses transfer manual.");
      setTimeout(() => {
        router.push("/commission/history");
      }, 1500);
    } catch (err: any) {
      setErrorNotice(err.message || "Gagal memproses permohonan penarikan saldo.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Title & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <Link href="/commission/wallet" className="hover:text-[#F97316]">Dompet</Link>
            <span>/</span>
            <span className="text-[#102A43]">Pencairan Saldo Manual Transfer</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Formulir Pencairan Saldo Komisi
          </h1>
          <p className="text-xs text-slate-500">
            Sistem pembayaran transfer manual oleh Admin HQ PT Pro Teknologi langsung ke rekening mitra
          </p>
        </div>

        <Link
          href="/commission/history"
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
        >
          Riwayat Transfer &rarr;
        </Link>
      </div>

      {/* Kebijakan Kemitraan Callout Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <span className="material-symbols-outlined text-amber-600 text-[22px] shrink-0 mt-0.5">
          verified_user
        </span>
        <div className="space-y-1 text-xs text-amber-900">
          <div className="font-bold">Ketentuan Resmi Pencairan Saldo Komisi:</div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
            <li><strong>Frekuensi Penarikan:</strong> Hanya diperbolehkan <strong>1 kali dalam 1 bulan</strong> kalender.</li>
            <li><strong>Nominal All-or-Nothing:</strong> 1 kali penarikan <strong>wajib menghabiskan 100% seluruh saldo siap tarik</strong> yang ada (tidak diperkenankan penarikan sebagian).</li>
            <li><strong>Metode Transfer Manual:</strong> Admin HQ melakukan transfer manual via m-Banking, melampirkan bukti transfer resmi, dan mengonfirmasi penyetujuan.</li>
          </ul>
        </div>
      </div>

      {/* Status Warning Cards if blocked */}
      {hasWithdrawnThisMonth && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-900 text-xs font-semibold">
          <span className="material-symbols-outlined text-red-600 text-[24px]">block</span>
          <div>
            <div className="font-bold">Batas Frekuensi Tercapai (1 Bulan Sekali)</div>
            <p className="text-[11px] text-red-700 mt-0.5">
              Anda sudah melakukan pengajuan atau penarikan saldo pada bulan ini. Penarikan berikutnya baru dapat diajukan pada awal bulan depan.
            </p>
          </div>
        </div>
      )}

      {hasPendingWithdrawal && !hasWithdrawnThisMonth && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-blue-900 text-xs font-semibold">
          <span className="material-symbols-outlined text-blue-600 text-[24px]">schedule</span>
          <div>
            <div className="font-bold">Pengajuan Sedang Diproses Admin HQ</div>
            <p className="text-[11px] text-blue-700 mt-0.5">
              Admin sedang melakukan verifikasi dan proses transfer manual m-Banking ke rekening Anda. Harap menunggu hingga bukti transfer diunggah.
            </p>
          </div>
        </div>
      )}

      {isBelowMinimum && !hasWithdrawnThisMonth && !hasPendingWithdrawal && (
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 flex items-center gap-3 text-slate-800 text-xs font-semibold">
          <span className="material-symbols-outlined text-slate-500 text-[24px]">savings</span>
          <div>
            <div className="font-bold">Saldo Belum Mencapai Batas Minimum</div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Batas minimum pencairan saldo adalah Rp 100.000. Saldo siap tarik Anda saat ini adalah Rp {availableBalance.toLocaleString("id-ID")}.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleWithdraw} className="space-y-6">
        {/* Available Balance Box (Full Payout Display) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0B1D3A] via-[#102A43] to-[#1E3E62] text-white flex items-center justify-between shadow-md border border-[#1E3E62]">
          <div>
            <span className="text-xs text-orange-400 font-bold uppercase tracking-wider block font-display">
              Total Saldo Komisi Siap Tarik (100% Dicairkan)
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-white mt-1 tabular-nums">
              Rp {availableBalance.toLocaleString("id-ID")}
            </div>
            <span className="text-[11px] text-slate-300 mt-1 block">
              Sesuai aturan, seluruh saldo ini akan dicairkan sekaligus tanpa sisa.
            </span>
          </div>
          <span className="material-symbols-outlined text-[42px] text-emerald-400 opacity-90">
            payments
          </span>
        </div>

        {/* Locked Amount Field */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#102A43]">
              Nominal Pencairan Saldo (Terkunci Otomatis 100%)
            </label>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              WAJIB HABIS SEMUA SALDO
            </span>
          </div>

          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-base font-bold text-slate-500">Rp</span>
            <input
              type="text"
              readOnly
              disabled
              value={amount.toLocaleString("id-ID")}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-100 border border-[#CBD5E1] text-lg font-bold font-display text-slate-800 outline-none tabular-nums cursor-not-allowed select-none"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Nominal terkunci otomatis ke seluruh saldo komisi yang tersedia. Pengajuan sebagian tidak diizinkan.
          </p>
        </div>

        {/* Bank Account Destination */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-[#0284C7] text-[20px]">account_balance</span>
            <h2 className="text-sm font-bold text-[#102A43] font-display">
              Rekening Bank Tujuan Transfer Manual
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">Nama Bank Tujuan</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                disabled={!canWithdraw}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] outline-none disabled:opacity-60"
              >
                <option value="BCA">BCA (Bank Central Asia)</option>
                <option value="MANDIRI">Bank Mandiri</option>
                <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                <option value="BNI">BNI (Bank Negara Indonesia)</option>
                <option value="CIMB">CIMB Niaga</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">Nomor Rekening Bank</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                disabled={!canWithdraw}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-mono font-bold text-[#102A43] outline-none disabled:opacity-60"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Nama Pemilik Rekening (Sesuai KTP):</span>
            <span className="font-bold text-slate-900">{salesProfile.name}</span>
          </div>
        </div>

        {/* Rincian Potongan Pajak & Nominal Bersih Transfer */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-3">
          <h3 className="text-sm font-bold text-[#102A43] font-display">
            Rincian Dana Bersih yang Akan Ditransfer Admin HQ
          </h3>

          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex justify-between py-1.5 text-slate-600">
              <span>Total Saldo Dicairkan (Bruto):</span>
              <span className="font-bold text-slate-900 tabular-nums">
                Rp {amount.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex justify-between py-1.5 text-slate-600">
              <span className="flex items-center gap-1">
                <span>Potongan Pajak PPh 21 (2.5%):</span>
                <span className="text-[10px] text-slate-400 font-mono">Resmi DJP</span>
              </span>
              <span className="font-bold text-red-600 tabular-nums">
                - Rp {taxAmount.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex justify-between py-1.5 text-slate-600">
              <span>Biaya Transfer Admin Bank:</span>
              <span className="font-bold text-emerald-600 uppercase">Gratis (Ditanggung HQ)</span>
            </div>

            <div className="flex justify-between pt-3 text-sm">
              <div>
                <span className="font-bold text-[#102A43] block">Nominal Bersih yang Ditransfer:</span>
                <span className="text-[11px] text-slate-400">Ditransfer via m-Banking oleh Admin HQ</span>
              </div>
              <span className="font-bold font-display text-lg text-emerald-700 tabular-nums">
                Rp {netAmount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {errorNotice && (
          <div className="p-3.5 rounded-xl bg-red-100 text-red-800 border border-red-300 text-xs font-bold animate-in fade-in">
            {errorNotice}
          </div>
        )}

        {successNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-400 text-xs font-bold animate-in fade-in">
            {successNotice}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || !canWithdraw}
          className="w-full h-12 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(249,115,22,0.35)] active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isProcessing ? "hourglass_top" : "send_to_mobile"}
          </span>
          <span>
            {isProcessing
              ? "Mengirimkan Permohonan ke Admin..."
              : canWithdraw
              ? `Ajukan Pencairan Saldo 100% (Rp ${netAmount.toLocaleString("id-ID")})`
              : "Pencairan Saldo Tidak Tersedia"}
          </span>
        </button>
      </form>
    </div>
  );
}