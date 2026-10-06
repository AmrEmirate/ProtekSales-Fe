"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function WithdrawPage() {
  const router = useRouter();
  const { availableBalance, salesProfile, requestWithdrawal } = useApp();

  const [amount, setAmount] = useState<number>(0);
  const [selectedBank, setSelectedBank] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState(salesProfile.bankAccount || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const taxAmount = Math.round(amount * 0.05); // 5% PPh 21
  const netAmount = amount - taxAmount;

  const quickPills = [
    { label: "Rp 250rb", value: 250000 },
    { label: "Rp 500rb", value: 500000 },
    { label: "Rp 1.000.000", value: 1000000 },
    { label: "Tarik Semua", value: availableBalance },
  ];

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);

    if (amount < 100000) {
      setErrorNotice("Minimum penarikan saldo adalah Rp 100.000");
      return;
    }

    if (amount > availableBalance) {
      setErrorNotice("Saldo siap tarik Anda tidak mencukupi");
      return;
    }

    setIsProcessing(true);
    setTimeout(async () => {
      const ok = await requestWithdrawal(amount, selectedBank, accountNumber);
      setIsProcessing(false);
      if (ok) {
        setSuccessNotice("Permohonan penarikan dana berhasil diajukan. Dana akan diproses H+1 hari kerja.");
        setTimeout(() => {
          router.push("/commission/history");
        }, 1500);
      } else {
        setErrorNotice("Gagal memproses penarikan.");
      }
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <Link href="/commission/wallet" className="hover:text-[#F97316]">Dompet</Link>
            <span>/</span>
            <span className="text-[#102A43]">Tarik Saldo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Formulir Penarikan Saldo Komisi
          </h1>
          <p className="text-xs text-slate-500">
            Pencairan dana langsung ke rekening bank mitra sales PT Pro Teknologi
          </p>
        </div>

        <Link
          href="/commission/wallet"
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
        >
          Lihat Dompet &rarr;
        </Link>
      </div>

      <form onSubmit={handleWithdraw} className="space-y-6">
        {/* Available Balance Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0B1D3A] to-[#102A43] text-white flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-orange-400 font-bold uppercase tracking-wider block font-display">
              Saldo Siap Tarik Saat Ini
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-white mt-1 tabular-nums">
              Rp {availableBalance.toLocaleString("id-ID")}
            </div>
          </div>
          <span className="material-symbols-outlined text-[36px] text-emerald-400 opacity-80">
            account_balance_wallet
          </span>
        </div>

        {/* Withdrawal Amount Input & Quick Chips */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#102A43]">
              Nominal Penarikan Dana (Rupiah)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-base font-bold text-slate-400">Rp</span>
              <input
                type="number"
                min={100000}
                max={availableBalance}
                step={50000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 border border-[#CBD5E1] text-lg font-bold font-display text-[#102A43] focus:bg-white focus:border-[#F97316] outline-none tabular-nums"
              />
            </div>
            <span className="text-[11px] text-slate-400">
              Minimum penarikan: Rp 100.000 • Maksimum: Rp {availableBalance.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Quick Amount Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {quickPills.map((pill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAmount(pill.value)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  amount === pill.value
                    ? "bg-[#102A43] text-white border-[#102A43] shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bank Account Destination */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-[#0284C7] text-[20px]">account_balance</span>
            <h2 className="text-sm font-bold text-[#102A43] font-display">
              Rekening Bank Tujuan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">Nama Bank</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] outline-none"
              >
                <option value="BCA">BCA (Bank Central Asia)</option>
                <option value="MANDIRI">Bank Mandiri</option>
                <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                <option value="BNI">BNI (Bank Negara Indonesia)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">Nomor Rekening</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-mono font-bold text-[#102A43] outline-none"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Nama Pemilik Rekening:</span>
            <span className="font-bold text-slate-900">{salesProfile.name} (Tervalidasi)</span>
          </div>
        </div>

        {/* Calculation & Tax PPh 21 Breakdown */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-3">
          <h3 className="text-sm font-bold text-[#102A43] font-display">
            Rincian Penerimaan Dana & Potongan Pajak
          </h3>

          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex justify-between py-1.5 text-slate-600">
              <span>Nominal Penarikan Kotor:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                Rp {amount.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex justify-between py-1.5 text-slate-600">
              <span className="flex items-center gap-1">
                <span>Pajak PPh 21 Resmi (5%):</span>
                <span className="material-symbols-outlined text-[14px] text-slate-400">info</span>
              </span>
              <span className="font-bold text-red-600 tabular-nums">
                - Rp {taxAmount.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex justify-between py-1.5 text-slate-600">
              <span>Biaya Transfer Antar Bank:</span>
              <span className="font-bold text-emerald-600 uppercase">Gratis (Rp 0)</span>
            </div>

            <div className="flex justify-between pt-3 text-sm">
              <span className="font-bold text-[#102A43]">Jumlah Bersih Masuk Rekening:</span>
              <span className="font-bold font-display text-base text-emerald-700 tabular-nums">
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

        {/* Submit */}
        <button
          type="submit"
          disabled={isProcessing || amount <= 0 || amount > availableBalance}
          className="w-full h-12 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(249,115,22,0.35)] active:scale-98 transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isProcessing ? "hourglass_top" : "check_circle"}
          </span>
          <span>
            {isProcessing ? "Memproses Penarikan..." : "Konfirmasi & Ajukan Penarikan"}
          </span>
        </button>
      </form>
    </div>
  );
}
