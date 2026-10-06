"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const pathname = usePathname();
  const { salesProfile, notifications, isOffline, offlineQueueCount, outlets } = useApp();

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navSections: NavSection[] = [
    {
      title: "UTAMA",
      items: [
        { href: "/", label: "Ringkasan Command", icon: "dashboard" },
        { href: "/admin", label: "Pusat Kontrol Admin", icon: "admin_panel_settings", badge: "Server" },
      ],
    },
    {
      title: "LEAD & PROSPEK",
      items: [
        { href: "/leads/check", label: "Cek & Kunci Prospek", icon: "radar", badge: "30 Hari" },
        { href: "/leads/pipeline", label: "Pipeline & Kunjungan", icon: "route" },
        { href: "/leads/check-in", label: "Form Check-in Baru", icon: "add_location_alt" },
        { href: "/leads/map", label: "Peta Rute Wilayah", icon: "map" },
        { href: "/leads/dispute", label: "Banding Sengketa", icon: "gavel" },
      ],
    },
    {
      title: "OUTLET & POS LISENSI",
      items: [
        { href: "/outlets", label: "Daftar Klien Aktif", icon: "storefront", badge: outlets.length > 0 ? `${outlets.length}` : undefined },
        { href: "/outlets/detail", label: "Detail & Kill-Switch", icon: "toggle_on" },
        { href: "/outlets/onboarding", label: "Aktivasi & Onboarding", icon: "qr_code_scanner" },
        { href: "/outlets/bast", label: "BAST Hardware Digital", icon: "draw" },
        { href: "/outlets/support", label: "Suplai & Kendala POS", icon: "receipt_long" },
      ],
    },
    {
      title: "FINANSIAL & KOMISI",
      items: [
        { href: "/commission/wallet", label: "Dompet Komisi", icon: "account_balance_wallet" },
        { href: "/commission/withdraw", label: "Tarik Saldo", icon: "payments" },
        { href: "/commission/history", label: "Riwayat & PPh 21", icon: "receipt" },
        { href: "/commission/leaderboard", label: "Papan Peringkat", icon: "leaderboard" },
      ],
    },
    {
      title: "SALES TOOLKIT",
      items: [
        { href: "/toolkit/roi", label: "Kalkulator ROI POS", icon: "calculate" },
        { href: "/toolkit/brochures", label: "Brosur Digital POS", icon: "menu_book" },
        { href: "/toolkit/education", label: "Script & Edukasi", icon: "school" },
      ],
    },
    {
      title: "SISTEM",
      items: [
        { href: "/profile", label: "Profil Sales & KPI", icon: "badge" },
        {
          href: "/offline-sync",
          label: "Antrean Sinkronisasi",
          icon: isOffline ? "cloud_off" : "cloud_sync",
          badge: offlineQueueCount > 0 ? `${offlineQueueCount}` : undefined,
          badgeColor: "bg-orange-500",
        },
        {
          href: "/notifications",
          label: "Pusat Notifikasi",
          icon: "notifications",
          badge: unreadNotifs > 0 ? `${unreadNotifs}` : undefined,
          badgeColor: "bg-red-500",
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0B1D3A]/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#102A43] text-white transition-all duration-300 ease-in-out border-r border-[#1E3E62] shadow-2xl lg:shadow-none ${
          isCollapsed ? "w-20" : "w-64"
        } ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#1E3E62]/80 bg-[#0B1D3A]">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-[#1E3E62] p-1 flex items-center justify-center shrink-0 border border-[#49607c]/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="ProTek Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-wider text-[#F97316] uppercase leading-none font-display">
                  PT PRO TEKNOLOGI
                </span>
                <span className="text-base font-bold text-white tracking-tight leading-tight font-display">
                  ProTek Pulse
                </span>
              </div>
            )}
          </Link>

          {/* Toggle Collapse Button on Desktop/Tablet */}
          <button
            onClick={onToggleCollapse}
            aria-label="Toggle Sidebar"
            className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center text-slate-300 hover:text-white hover:bg-[#1E3E62] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isCollapsed ? "chevron_right" : "chevron_left"}
            </span>
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            aria-label="Tutup Menu"
            className="flex lg:hidden w-8 h-8 rounded-lg items-center justify-center text-slate-300 hover:text-white hover:bg-[#1E3E62]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 border-b border-[#1E3E62]/60 bg-[#0B1D3A]/40">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#1E3E62]/50 border border-[#1E3E62]">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#F97316] to-[#FF8A00] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
              BS
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">
                    {salesProfile.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {salesProfile.tier.split(" ")[0]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-300">
                  <span className="text-[#F97316] font-semibold">
                    Target: {salesProfile.targetPercent}%
                  </span>
                  <span>•</span>
                  <span className="truncate text-slate-400">{salesProfile.id}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#F97316] text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)]"
                        : "text-slate-300 hover:text-white hover:bg-[#1E3E62]/60"
                    } ${isCollapsed ? "justify-center px-0 py-2.5" : ""}`}
                  >
                    <span className="material-symbols-outlined text-[20px] shrink-0">
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.badgeColor
                            ? `${item.badgeColor} text-white`
                            : isActive
                            ? "bg-white/20 text-white"
                            : "bg-[#1E3E62] text-orange-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#1E3E62] bg-[#0B1D3A]/60 flex items-center justify-between text-xs text-slate-400">
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOffline ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                  }`}
                />
                <span className="text-[11px] font-medium text-slate-300">
                  {isOffline ? "Mode Offline" : "Terkoneksi POS Hub"}
                </span>
              </div>
              <Link
                href="/login"
                className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold"
              >
                Ganti Akun
              </Link>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOffline ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                }`}
                title={isOffline ? "Mode Offline" : "Online"}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
