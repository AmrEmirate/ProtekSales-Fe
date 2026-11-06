"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

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
  const { salesProfile, notifications, isOffline, offlineQueueCount, outlets, currentUserRole } = useApp();

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const isSuperAdminOrAdmin = currentUserRole === "ADMIN";

  let navSections: NavSection[] = [];

  if (currentUserRole === "ADMIN") {
    navSections = [
      {
        title: "PUSAT KONTROL ADMIN & HQ",
        items: [
          {
            href: "/admin",
            label: "Pusat Kontrol Admin",
            icon: "admin_panel_settings",
            badge: "HQ",
          },
          {
            href: "/admin/command-center",
            label: "Command Center Bisnis",
            icon: "hub",
            badge: "Live",
            badgeColor: "bg-[#2563EB]",
          },
        ],
      },
      {
        title: "OUTLET & MONITORING",
        items: [
          { href: "/outlets", label: "Daftar Outlet Klien", icon: "storefront" },
          { href: "/leads/pipeline", label: "Monitoring Prospek", icon: "radar" },
          { href: "/leads/ui-custom", label: "Studio Desain UI UMKM", icon: "palette", badge: "Studio UI" },
        ],
      },
      {
        title: "AKUN",
        items: [
          { href: "/profile", label: "Profil Admin HQ", icon: "badge" },
        ],
      },
    ];
  } else {
    // SALES ROLE (Akses operasional mitra sales lapangan)
    navSections = [
      {
        title: "UTAMA",
        items: [
          { href: "/", label: "Ringkasan Sales", icon: "dashboard" },
        ],
      },
      {
        title: "ANTI-TABRAKAN OUTLET",
        items: [
          { href: "/leads/check", label: "Cek & Kunci Outlet", icon: "radar", badge: "30 Hari" },
          { href: "/leads/pipeline", label: "Daftar Outlet Ditawarkan", icon: "storefront" },
          { href: "/leads/map", label: "Peta Rute Prospek", icon: "map" },
        ],
      },
      {
        title: "PENDAFTARAN UMKM & UI",
        items: [
          { href: "/leads/ui-custom", label: "Daftar UMKM & Request UI", icon: "palette", badge: "Studio UI" },
        ],
      },
      {
        title: "OUTLET & AKTIVASI",
        items: [
          { href: "/outlets", label: "Daftar Outlet Saya", icon: "storefront" },
          { href: "/outlets/onboarding", label: "Aktivasi & Onboarding POS", icon: "point_of_sale" },
          { href: "/outlets/bast", label: "BAST Digital Hardware", icon: "assignment_turned_in" },
        ],
      },
      {
        title: "KOMISI & PENCAIRAN",
        items: [
          { href: "/commission/wallet", label: "Dompet Komisi", icon: "account_balance_wallet" },
          { href: "/commission/withdraw", label: "Tarik Saldo Komisi", icon: "payments" },
          { href: "/commission/history", label: "Riwayat Penarikan", icon: "receipt" },
        ],
      },
      {
        title: "SALES TOOLKIT",
        items: [
          { href: "/toolkit/roi", label: "Kalkulator ROI POS", icon: "calculate" },
          { href: "/toolkit/brochures", label: "Brosur Digital", icon: "menu_book" },
          { href: "/offline-sync", label: "Sinkronisasi Offline", icon: "sync" },
        ],
      },
      {
        title: "AKUN",
        items: [
          { href: "/profile", label: "Profil & Rekening Bank", icon: "badge" },
        ],
      },
    ];
  }

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
          <Link
            href={currentUserRole === "ADMIN" ? "/admin" : "/"}
            className="flex items-center gap-3 overflow-hidden"
          >
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

        {/* User Role Card */}
        <div className="p-3 border-b border-[#1E3E62]/60 bg-[#0B1D3A]/40">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#1E3E62]/50 border border-[#1E3E62]">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md ${
              currentUserRole === "ADMIN"
                ? "bg-gradient-to-tr from-[#0F766E] to-[#10B981]"
                : "bg-gradient-to-tr from-[#F97316] to-[#FF8A00]"
            }`}>
              {currentUserRole === "ADMIN" ? "AD" : "BS"}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">
                    {currentUserRole === "ADMIN"
                      ? "Admin ProTek"
                      : salesProfile.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold border ${
                    currentUserRole === "ADMIN"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                  }`}>
                    {currentUserRole === "ADMIN"
                      ? "ADMIN"
                      : salesProfile.tier.split(" ")[0]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-300">
                  <span className={`${currentUserRole === "ADMIN" ? "text-emerald-400" : "text-[#F97316]"} font-semibold truncate`}>
                    {currentUserRole === "ADMIN"
                      ? "Pusat Server & HQ"
                      : `Target: ${salesProfile.targetPercent}%`}
                  </span>
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
              <button
                type="button"
                onClick={() => {
                  api.logout();
                  window.location.href = "/login";
                }}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                title="Keluar dari akun"
              >
                <span className="material-symbols-outlined text-[14px]">logout</span>
                <span>Keluar</span>
              </button>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <button
                type="button"
                onClick={() => {
                  api.logout();
                  window.location.href = "/login";
                }}
                title="Keluar dari akun"
                className="w-7 h-7 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
