"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function ProfilePage() {
  const { salesProfile, outlets } = useApp();
  const [phone, setPhone] = useState(salesProfile.phone);
  const [bankAccount, setBankAccount] = useState(salesProfile.bankAccount);
  const [savedNotice, setSavedNotice] = useState(false);

  const activeOutlets = outlets.length;
  const toPlatinum = 31 - activeOutlets;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#102A43]">Pengaturan</span>
            <span>/</span>
            <span className="text-[#102A43]">Profil & KPI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Profil Mitra Sales, KPI & Tiering Komisi
          </h1>
          <p className="text-xs text-slate-500">
            Identitas keanggotaan resmi PT Pro Teknologi, jenjang komisi recurring, dan device binding hardware
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            Device Terikat: {salesProfile.deviceModel}
          </span>
        </div>
      </div>

      {/* Hero Profile Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B1D3A] via-[#102A43] to-[#1E3E62] text-white p-6 sm:p-8 shadow-xl border border-[#1E3E62] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#F97316] to-[#FF8A00] text-white flex items-center justify-center font-bold text-2xl font-display shadow-2xl shrink-0">
            BS
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                {salesProfile.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-xs font-bold">
                {salesProfile.tier}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              ID Mitra: <strong>{salesProfile.id}</strong> • Area Operasional: DKI Jakarta & Tangerang
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-300">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                98.8% Kepatuhan GPS
              </span>
              <span>•</span>
              <span>Bergabung sejak Maret 2024</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end justify-center shrink-0 p-4 rounded-2xl bg-[#0B1D3A]/60 border border-[#1E3E62]">
          <span className="text-xs text-slate-400 font-semibold uppercase">Peringkat Nasional</span>
          <div className="text-2xl font-bold font-display text-orange-400 mt-0.5">
            #4 dari 120+ Sales
          </div>
          <Link
            href="/commission/leaderboard"
            className="text-[11px] text-white underline hover:text-orange-300 mt-1 font-semibold"
          >
            Lihat Papan Peringkat &rarr;
          </Link>
        </div>
      </div>

      {/* Main Grid: 12 Columns for Desktop & Tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 Cols): Tier Progression & KPI Performance */}
        <div className="lg:col-span-6 space-y-6">
          {/* Tier Progression */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#102A43] font-display">
                  Jenjang Karir & Komisi Berulang
                </h3>
                <p className="text-xs text-slate-500">Skema persentase bagi hasil lisensi bulanan</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#F97316] text-xs font-bold border border-orange-200">
                {activeOutlets} Outlet Aktif
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-gradient-to-r from-orange-400 via-orange-500 to-[#F97316] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, Math.round((activeOutlets / 31) * 100)))}%` }}
                />
              </div>

              <div className="grid grid-cols-3 text-xs pt-1">
                <div className="text-left">
                  <div className="font-bold text-slate-600">Silver (20%)</div>
                  <div className="text-[10px] text-slate-400">0 - 15 Outlet</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-[#F97316]">
                    {activeOutlets >= 31 ? "PLATINUM (30%)" : activeOutlets >= 16 ? "GOLD (25%)" : "SILVER (20%)"}
                  </div>
                  <div className="text-[10px] text-orange-600 font-bold">
                    Posisi Anda ({activeOutlets} Outlet)
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-600">Platinum (30%)</div>
                  <div className="text-[10px] text-slate-400">31+ Outlet</div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-orange-50/80 border border-orange-200 text-xs text-slate-700 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#F97316] text-[20px] shrink-0 mt-0.5">
                rocket_launch
              </span>
              <div>
                <div className="font-bold text-[#102A43]">
                  Tinggal {toPlatinum > 0 ? toPlatinum : 1} outlet lagi menuju Platinum Leader!
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Dapatkan kenaikan bagi hasil menjadi 30% komisi berulang (recurring) untuk seluruh outlet binaan Anda mulai bulan depan.
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
              <span className="material-symbols-outlined text-[#F97316] text-[20px]">phonelink_lock</span>
              <h3 className="text-base font-bold text-[#102A43] font-display">
                Device Binding & Keamanan Akun
              </h3>
            </div>

            {/* Hardware Binding State */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#102A43]">Fingerprint Perangkat Android Terdaftar</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  TERIKAT
                </span>
              </div>
              <div className="font-mono text-slate-600 text-[11px]">
                Model: <strong>{salesProfile.deviceModel}</strong>
              </div>
              <div className="font-mono text-slate-500 text-[10px]">
                Hardware ID: {salesProfile.deviceId}
              </div>
              <p className="text-[11px] text-slate-400 pt-1 leading-normal">
                Akun sales Anda hanya dapat melakukan check-in GPS pada tablet yang telah diverifikasi ini untuk mencegah pemalsuan lokasi.
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
        </div>
      </div>
    </div>
  );
}
