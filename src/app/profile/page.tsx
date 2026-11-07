"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

export default function ProfilePage() {
  const router = useRouter();
  const { salesProfile, outlets, availableBalance, hasWithdrawnThisMonth, hasPendingWithdrawal, currentUserRole } = useApp();
  const [phone, setPhone] = useState(salesProfile.phone);
  const [bankAccount, setBankAccount] = useState(salesProfile.bankAccount);
  const [savedNotice, setSavedNotice] = useState(false);

  const activeOutlets = outlets.length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleLogout = () => {
    api.logout();
    router.push("/login");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href={currentUserRole === "ADMIN" ? "/admin" : "/"} className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#102A43]">Pengaturan</span>
            <span>/</span>
            <span className="text-[#102A43]">Profil & KPI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            {currentUserRole === "ADMIN" ? "Profil Administrator HQ ProTek" : currentUserRole === "ORGANISASI" ? "Profil Mitra Organisasi" : "Profil Mitra Sales & Skema Komisi Net"}
          </h1>
          <p className="text-xs text-slate-500">
            {currentUserRole === "ADMIN"
              ? "Identitas resmi Administrator PT Pro Teknologi dan akses pusat kendali sistem"
              : currentUserRole === "ORGANISASI"
              ? "Identitas kemitraan organisasi dan pemantauan hak bagi hasil 10%"
              : "Identitas keanggotaan resmi PT Pro Teknologi dengan komisi net 20% tanpa sistem peringkat"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            Akses Multi-Perangkat (HP &amp; Web Browser)
          </span>
        </div>
      </div>

      {/* Hero Profile Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B1D3A] via-[#102A43] to-[#1E3E62] text-white p-6 sm:p-8 shadow-xl border border-[#1E3E62] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#F97316] to-[#FF8A00] text-white flex items-center justify-center font-bold text-2xl font-display shadow-2xl shrink-0">
            {salesProfile.name
              ? salesProfile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "SL"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                {salesProfile.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-xs font-bold shadow-sm">
                {currentUserRole === "ADMIN" ? "ADMINISTRATOR HQ" : currentUserRole === "ORGANISASI" ? "MITRA ORGANISASI (10%)" : "MITRA SALES (20% NET)"}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              ID Akun: <strong>{salesProfile.id}</strong> {salesProfile.organizationName ? `• Organisasi: ${salesProfile.organizationName}` : ""}
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-300">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Terdaftar Resmi
              </span>
              <span>•</span>
              <span>Komisi Net Tanpa Peringkat</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end justify-center shrink-0 p-4 rounded-2xl bg-[#0B1D3A]/60 border border-[#1E3E62]">
          <span className="text-xs text-slate-400 font-semibold uppercase">Skema Bagi Hasil</span>
          <div className="text-2xl font-bold font-display text-orange-400 mt-0.5">
            {currentUserRole === "ORGANISASI" ? "10% Net" : currentUserRole === "ADMIN" ? "100% Kas Pusat" : "20% Net"}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 font-semibold">
            {currentUserRole === "ORGANISASI" ? "Hak Bagi Hasil Organisasi" : currentUserRole === "ADMIN" ? "Penerimaan Tagihan Pusat" : "Pasti • Tanpa Sistem Peringkat"}
          </div>
        </div>
      </div>

      {/* Main Grid: 12 Columns for Desktop & Tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 Cols): Skema Komisi & KPI Performance */}
        <div className="lg:col-span-6 space-y-6">
          {/* Skema Komisi Net */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#102A43] font-display">
                  Skema Bagi Hasil Resmi (Net)
                </h3>
                <p className="text-xs text-slate-500">Ketentuan hak komisi tanpa sistem peringkat</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                Net &amp; Transparan
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#102A43]">Komisi Sales Lapangan:</span>
                  <span className="font-bold text-orange-600 text-sm">20% Net</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Setiap sales menerima komisi flat 20% dari nilai invoice tagihan bulanan UMKM yang didaftarkannya. Tidak ada peringkat, tidak bisa diturunkan.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#102A43]">Hak Organisasi:</span>
                  <span className="font-bold text-blue-600 text-sm">10% Net</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Organisasi menerima bagi hasil 10% dari tagihan outlet yang didaftarkan oleh mitra sales binaannya.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#102A43]">Alur Pembayaran Langganan:</span>
                  <span className="font-bold text-emerald-700 text-xs">Perusahaan &rarr; Sales</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  UMKM melakukan pembayaran ke rekening perusahaan PT Pro Teknologi. Setelah Admin memverifikasi dan meng-approve pembayaran, komisi otomatis masuk ke saldo siap tarik sales dan organisasi.
                </p>
              </div>
            </div>
          </div>

          {/* 4 KPI Grid Cards */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 font-semibold">Closing Outlet Baru</span>
              <div className="text-xl font-bold font-display text-[#102A43]">
                6 <span className="text-xs text-slate-400 font-normal">/ 8 Target</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold block">75% Target Tercapai</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 font-semibold">Total Kunjungan GPS</span>
              <div className="text-xl font-bold font-display text-[#102A43]">
                42 <span className="text-xs text-slate-400 font-normal">Kunjungan</span>
              </div>
              <span className="text-[10px] text-[#0284C7] font-bold block">100% Validasi Geofence</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 font-semibold">Tingkat Retensi Lisensi</span>
              <div className="text-xl font-bold font-display text-emerald-600">
                96.4%
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block">Sangat Rendah Churn</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 font-semibold">Rata-rata Waktu Closing</span>
              <div className="text-xl font-bold font-display text-[#102A43]">
                4.2 <span className="text-xs text-slate-400 font-normal">Hari</span>
              </div>
              <span className="text-[10px] text-orange-500 font-bold block">Dari Pertama Dikunci</span>
            </div>
          </div>
        </div>

        {/* Right Column (6 Cols): Device Binding & Account Config Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-[#F97316] text-[20px]">verified_user</span>
              <h3 className="text-base font-bold text-[#102A43] font-display">
                Status Akun &amp; Pengaturan Kontak
              </h3>
            </div>

            {/* Cloud Account Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#102A43]">Akses Portal Cloud ProtekSales</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  AKTIF RESMI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 leading-normal">
                Akun Anda dapat diakses langsung melalui browser HP maupun laptop tanpa perlu perangkat khusus.
              </p>
            </div>

            {/* Edit Info Form */}
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#102A43]">Nomor WhatsApp Terverifikasi</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] font-semibold text-[#102A43] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#102A43]">Nomor Rekening Bank BCA</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] font-mono font-semibold text-[#102A43] outline-none"
                />
              </div>

              {savedNotice && (
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold animate-in fade-in flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-700">verified</span>
                  <span>Pengaturan profil & rekening berhasil disimpan.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#102A43] hover:bg-[#0B1D3A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Simpan Perubahan</span>
              </button>
            </form>
          </div>

          {/* Kebijakan Rekening & Penarikan Saldo Komisi (Manual Transfer HQ) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F97316] text-[20px]">payments</span>
                <h3 className="text-base font-bold text-[#102A43] font-display">
                  Sistem Pencairan Saldo (Transfer Manual HQ)
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                hasWithdrawnThisMonth
                  ? "bg-red-100 text-red-800"
                  : hasPendingWithdrawal
                  ? "bg-blue-100 text-blue-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}>
                {hasWithdrawnThisMonth
                  ? "Sudah Tarik Bulan Ini"
                  : hasPendingWithdrawal
                  ? "Menunggu Transfer"
                  : "Siap Dicairkan"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-600">
                <span>Saldo Siap Tarik Saat Ini:</span>
                <span className="font-bold text-[#102A43] text-sm tabular-nums">
                  Rp {availableBalance.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Rekening Bank Mitra:</span>
                <span className="font-mono font-bold text-slate-900">{salesProfile.bankName} - {bankAccount}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Atas Nama Rekening:</span>
                <span className="font-bold text-slate-900">{salesProfile.name}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200 text-xs text-orange-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-orange-900">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Aturan Pencairan PT Pro Teknologi:
              </div>
              <ul className="list-disc list-inside text-[11px] text-orange-800 space-y-0.5">
                <li>Penarikan dana dibatasi <strong>1 kali dalam sebulan</strong>.</li>
                <li>1 kali penarikan <strong>wajib menghabiskan seluruh saldo</strong> yang tersedia (100%).</li>
                <li>Admin HQ mentransfer manual via m-Banking dan melampirkan bukti transfer resmi.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Link
                href="/commission/withdraw"
                className="flex-1 h-11 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                <span>Buka Formulir Pencairan 100% Saldo</span>
              </Link>
              <Link
                href="/commission/history"
                className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                <span>Riwayat Transfer</span>
              </Link>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">Keluar dari Portal Sales</div>
              <p className="text-[11px] text-slate-500">Hapus sesi kredensial login aktif di browser ini</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
