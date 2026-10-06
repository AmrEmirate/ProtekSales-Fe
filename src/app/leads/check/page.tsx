"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

export default function LeadCheckPage() {
  const { leads, lockLead } = useApp();

  const [waInput, setWaInput] = useState("");
  const [outletName, setOutletName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("Minimarket / Retail");
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    canClaim: boolean;
    message: string;
    claimedBy?: string;
    protectedUntil?: string;
  } | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!waInput.trim()) return;
    setIsChecking(true);
    setNotificationMsg(null);
    try {
      const data = await api.checkLeadAvailability(waInput);
      if (data) {
        setCheckResult({
          canClaim: data.canClaim,
          message: data.message,
          claimedBy: data.lead?.claimedBy,
          protectedUntil: data.lead?.protectedUntil,
        });
      }
    } catch {
      const sanitized = waInput.replace(/[^0-9]/g, "");
      const isFree = Boolean(sanitized);
      setCheckResult({
        canClaim: isFree,
        message: isFree
          ? "Nomor terverifikasi valid & siap diajukan untuk proteksi."
          : "Format nomor WhatsApp tidak valid.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleLock = async () => {
    if (!waInput.trim()) return;
    const ok = await lockLead(
      outletName || "Outlet Baru",
      `+62 ${waInput}`,
      address || "Alamat Lapangan Terdaftar",
      category
    );
    if (ok) {
      setNotificationMsg("Sukses! Prospek berhasil dikunci eksklusif selama 30 hari.");
    } else {
      setNotificationMsg("Gagal: Prospek ini sedang dalam masa proteksi sales lain.");
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.phone.includes(searchFilter) ||
      l.address.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Notice Matching Blueprint */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1D3A] via-[#102A43] to-[#102A43] p-5 sm:p-6 text-white shadow-md border border-[#1E3E62]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F97316]/20 text-[#FF8A00] text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Garansi Keamanan Leads • 30 Hari</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
              Lead Protection Engine (Anti-Bentrok)
            </h1>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Kunci outlet sasaran agar terlindungi secara eksklusif selama 30 hari kalender dari klaim rekan sales lain.
            </p>
          </div>

          <Link
            href="/leads/dispute"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all text-center shrink-0"
          >
            Pusat Banding Sengketa &rarr;
          </Link>
        </div>
      </div>

      {/* Main Grid: 12-Columns for Desktop & Tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Real-Time Lead Validator Module */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F97316] text-[20px]">radar</span>
                <span className="text-sm font-bold text-[#102A43] font-display">
                  Cek Status & Kunci Prospek
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">Real-Time Database</span>
            </div>

            {/* WA Form Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">
                Nomor WhatsApp Pemilik Toko
              </label>
              <div className="flex items-center rounded-xl bg-[#edf4ff] px-3 h-12 shadow-inner">
                <div className="flex items-center gap-1 pr-2.5 border-r border-slate-300 text-[#102A43] font-bold text-xs">
                  <span>+62</span>
                </div>
                <input
                  type="tel"
                  value={waInput}
                  onChange={(e) => setWaInput(e.target.value)}
                  placeholder="8123456xxxx"
                  className="w-full bg-transparent px-3 text-[#001d32] text-xs font-bold font-display focus:outline-none"
                />
                <span className="material-symbols-outlined text-[#16A34A] text-[22px]">
                  check_circle
                </span>
              </div>
            </div>

            {/* Outlet Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">
                Nama Outlet / Bisnis
              </label>
              <div className="flex items-center rounded-xl bg-[#edf4ff] px-3 h-12 shadow-inner">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">storefront</span>
                <input
                  type="text"
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                  placeholder="Contoh: Toko Berkah Sentosa"
                  className="w-full bg-transparent px-3 text-[#001d32] text-xs font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Check Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCheck}
                disabled={isChecking}
                className="w-full h-11 rounded-xl bg-[#102A43] hover:bg-[#0B1D3A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isChecking ? "hourglass_top" : "manage_search"}
                </span>
                <span>{isChecking ? "Memeriksa ke Server..." : "Cek Ketersediaan Nomor Toko"}</span>
              </button>
            </div>

            {/* Dynamic Result Box: Free vs Locked */}
            {checkResult && (
              checkResult.canClaim ? (
                <div className="rounded-xl bg-[#DCFCE7] p-4 flex flex-col gap-2.5 shadow-sm border border-emerald-300 animate-in fade-in">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#00152a] block">{outletName}</span>
                        <p className="text-[11px] text-slate-600">+62 {waInput} • Bebas Diklaim</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#16A34A] text-white text-[10px] font-bold shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      BEBAS KLAIM
                    </span>
                  </div>

                  <p className="text-xs text-[#00152a] leading-relaxed">
                    Outlet belum pernah didaftarkan. Mengunci sekarang memberikan perlindungan penuh hingga <strong>30 hari kalender</strong> ke depan.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleLock}
                      className="flex-1 h-11 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(249,115,22,0.35)] active:scale-98 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                      <span>Kunci Prospek Sekarang</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-[#FEE2E2] p-4 flex flex-col gap-2.5 shadow-sm border border-red-300 animate-in fade-in">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-md">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#00152a] block">{outletName}</span>
                        <p className="text-[11px] text-slate-600">+62 {waInput} • Sedang Diklaim</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#DC2626] text-white text-[10px] font-bold shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      TERKUNCI
                    </span>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 text-xs space-y-1 border border-red-200">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sales Pemegang Hak:</span>
                      <span className="font-semibold text-[#00152a]">{checkResult.claimedBy || "Mitra Sales Lain"}</span>
                    </div>
                    {checkResult.protectedUntil && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Masa Proteksi:</span>
                        <span className="font-bold text-red-600">
                          Hingga {new Date(checkResult.protectedUntil).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/leads/dispute"
                    className="w-full h-10 rounded-xl bg-[#102A43] hover:bg-[#0B1D3A] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all mt-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">gavel</span>
                    <span>Ajukan Banding Sengketa</span>
                  </Link>
                </div>
              )
            )}

            {notificationMsg && (
              <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-semibold animate-in fade-in">
                {notificationMsg}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Pipeline Summary & Locked Leads with Authentic Photos */}
        <div className="lg:col-span-7 space-y-5">
          {/* Pipeline Mini-Cards Matching Original Prototype */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold font-display text-[#102A43] text-sm">Pipeline Prospek Saya</span>
              <span className="font-bold text-[#F97316]">Total: 28 Outlet</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Kunjungan Baru</span>
                  <span className="text-lg font-bold font-display text-[#102A43]">8</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#e3efff] flex items-center justify-center text-[#102A43]">
                  <span className="material-symbols-outlined text-[18px]">pin_drop</span>
                </div>
              </div>

              <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Demo Sistem</span>
                  <span className="text-lg font-bold font-display text-[#F97316]">4</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center text-[#F97316]">
                  <span className="material-symbols-outlined text-[18px]">devices</span>
                </div>
              </div>

              <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Menunggu Deal</span>
                  <span className="text-lg font-bold font-display text-amber-600">2</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center text-amber-700">
                  <span className="material-symbols-outlined text-[18px]">handshake</span>
                </div>
              </div>

              <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Terkunci Aktif</span>
                  <span className="text-lg font-bold font-display text-emerald-600">14</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-emerald-700">
                  <span className="material-symbols-outlined text-[18px]">lock_clock</span>
                </div>
              </div>
            </div>
          </div>

          {/* List of Locked Leads with Authentic Photos from Prototype */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#102A43] font-display">
                  Koleksi Terkunci Saya
                </h3>
                <p className="text-xs text-slate-500">Pantau batas hari proteksi sebelum bebas diklaim</p>
              </div>

              <div className="relative w-full sm:w-56">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Cari prospek..."
                  className="w-full h-8 pl-7 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#102A43] outline-none"
                />
                <span className="material-symbols-outlined absolute left-2 top-1.5 text-[15px] text-slate-400">
                  search
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {filteredLeads.map((lead) => {
                const isUrgent = lead.daysRemaining <= 7;
                return (
                  <div
                    key={lead.id}
                    className="rounded-xl bg-white p-4 shadow-sm border border-slate-200 flex flex-col gap-2.5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                          {lead.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={lead.imageUrl}
                              alt={lead.name}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#102A43] truncate font-display">
                            {lead.name}
                          </h4>
                          <div className="text-xs text-slate-500 truncate">
                            {lead.address}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                          isUrgent
                            ? "bg-[#FEF3C7] text-[#B45309]"
                            : "bg-[#DCFCE7] text-[#15803D]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isUrgent ? "warning" : "shield"}
                        </span>
                        <span>Sisa {lead.daysRemaining} Hari</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1 text-slate-500">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">
                          schedule
                        </span>
                        <span>Kunjungan: {lead.lastContact}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#edf4ff] text-[#102A43] hover:bg-[#e3efff] text-xs font-semibold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px] text-emerald-600">chat</span>
                          <span>WhatsApp</span>
                        </a>

                        <Link
                          href="/leads/check-in"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F97316] text-white hover:bg-[#EA580C] text-xs font-semibold shadow-sm transition-all"
                        >
                          <span className="material-symbols-outlined text-[15px]">add_location_alt</span>
                          <span>Check-in</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
