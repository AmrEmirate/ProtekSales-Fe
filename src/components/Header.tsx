"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const pathname = usePathname();
  const {
    salesProfile,
    notifications,
    isOffline,
    toggleOffline,
    markNotificationRead,
    markAllNotificationsRead,
    availableBalance,
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const unreadNotifs = notifications.filter((n) => !n.read);

  const getPageTitle = () => {
    if (pathname === "/") return "Ringkasan Command Center";
    if (pathname.startsWith("/leads/check")) return "Cek & Kunci Prospek";
    if (pathname.startsWith("/leads/pipeline")) return "Pipeline & Kunjungan";
    if (pathname.startsWith("/leads/check-in")) return "Form Check-in Kunjungan";
    if (pathname.startsWith("/leads/map")) return "Peta Rute Wilayah";
    if (pathname.startsWith("/leads/dispute")) return "Banding Sengketa Prospek";
    if (pathname === "/outlets") return "Daftar Klien Aktif Lisensi";
    if (pathname.startsWith("/outlets/detail")) return "Detail Klien & Remote Kill-Switch";
    if (pathname.startsWith("/outlets/onboarding")) return "Aktivasi & Onboarding POS";
    if (pathname.startsWith("/outlets/bast")) return "BAST Hardware Digital";
    if (pathname.startsWith("/outlets/support")) return "Suplai & Tiket Kendala";
    if (pathname.startsWith("/commission/wallet")) return "Dompet Komisi Sales";
    if (pathname.startsWith("/commission/withdraw")) return "Tarik Saldo Komisi";
    if (pathname.startsWith("/commission/history")) return "Riwayat & Bukti Potong Pajak";
    if (pathname.startsWith("/commission/leaderboard")) return "Papan Peringkat Insentif";
    if (pathname.startsWith("/toolkit/roi")) return "Kalkulator ROI POS";
    if (pathname.startsWith("/toolkit/brochures")) return "Brosur Digital POS";
    if (pathname.startsWith("/toolkit/education")) return "Pusat Edukasi & Script Closing";
    if (pathname.startsWith("/profile")) return "Profil Sales & KPI";
    if (pathname.startsWith("/offline-sync")) return "Antrean Sinkronisasi Lapangan";
    if (pathname.startsWith("/notifications")) return "Pusat Notifikasi";
    return "ProTek Pulse";
  };

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm transition-all duration-300 ${
        isSidebarCollapsed ? "lg:pl-24" : "lg:pl-68"
      }`}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Menu"
          className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 text-[#102A43] flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#F97316] tracking-wider uppercase">
              PORTAL SALES
            </span>
            <span className="hidden sm:inline-block text-slate-300">•</span>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-500">
              PT Pro Teknologi
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-[#102A43] font-display leading-tight truncate max-w-[200px] sm:max-w-md">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline Mode Simulator Toggle */}
        <button
          onClick={toggleOffline}
          title={isOffline ? "Klik untuk online kembali" : "Klik untuk simulasi offline"}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isOffline
              ? "bg-amber-50 text-amber-800 border-amber-300 animate-pulse"
              : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOffline ? "bg-amber-500" : "bg-emerald-500"
            }`}
          />
          <span className="hidden md:inline">
            {isOffline ? "Mode Offline Aktif" : "Online Hub"}
          </span>
        </button>

        {/* Quick Balance Chip for Desktop/Tablet */}
        <Link
          href="/commission/wallet"
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#e3efff] border border-[#d8eaff] text-[#102A43] hover:bg-[#cee5ff] transition-all"
        >
          <span className="material-symbols-outlined text-[18px] text-[#0284C7]">
            account_balance_wallet
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase font-bold text-slate-500 leading-none">
              Saldo Siap Tarik
            </span>
            <span className="text-xs font-bold font-display text-[#102A43] leading-tight tabular-nums">
              Rp {availableBalance.toLocaleString("id-ID")}
            </span>
          </div>
        </Link>

        {/* Action Button: Quick Lock Lead */}
        <Link
          href="/leads/check"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C] shadow-[0_2px_10px_rgba(249,115,22,0.3)] transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">lock</span>
          <span>Kunci Prospek</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            aria-label="Notifikasi"
            className="relative w-10 h-10 rounded-xl bg-slate-100 text-[#102A43] flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#102A43]">Notifikasi Lapangan</span>
                  {unreadNotifs.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                      {unreadNotifs.length} Baru
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] text-[#F97316] hover:underline font-semibold"
                >
                  Tandai Semua Dibaca
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      notif.read
                        ? "bg-slate-50 border-slate-100 text-slate-600"
                        : "bg-orange-50/50 border-orange-200 text-slate-900 font-medium"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-bold leading-snug">{notif.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 mt-2 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs text-[#102A43] font-bold hover:text-[#F97316]"
                >
                  Buka Pusat Notifikasi Lengkap &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar / Trigger */}
        <Link
          href="/profile"
          className="flex items-center gap-2 pl-1 group"
          title="Lihat Profil Sales"
        >
          <div className="w-9 h-9 rounded-xl bg-[#102A43] text-white flex items-center justify-center font-bold text-xs group-hover:ring-2 group-hover:ring-[#F97316] transition-all">
            BS
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-[#102A43] leading-none">
              {salesProfile.name}
            </span>
            <span className="text-[10px] text-[#F97316] font-semibold">
              {salesProfile.tier}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
