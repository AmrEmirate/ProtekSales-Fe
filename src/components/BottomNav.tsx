"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { currentUserRole } = useApp();

  let navItems: {
    href: string;
    label: string;
    icon: string;
    isActive: boolean;
    highlight?: boolean;
  }[] = [];

  if (currentUserRole === "ADMIN") {
    navItems = [
      {
        href: "/admin",
        label: "Admin HQ",
        icon: "admin_panel_settings",
        isActive: pathname === "/admin",
        highlight: true,
      },
      {
        href: "/admin/command-center",
        label: "Command",
        icon: "hub",
        isActive: pathname.startsWith("/admin/command-center"),
      },
      {
        href: "/leads/check",
        label: "Prospek",
        icon: "radar",
        isActive: pathname.startsWith("/leads/check"),
      },
      {
        href: "/outlets",
        label: "Outlet Klien",
        icon: "storefront",
        isActive: pathname.startsWith("/outlets"),
      },
      {
        href: "/profile",
        label: "Profil",
        icon: "badge",
        isActive: pathname.startsWith("/profile"),
      },
    ];
  } else if (currentUserRole === "ORGANISASI") {
    navItems = [
      {
        href: "/organization",
        label: "Ringkasan",
        icon: "corporate_fare",
        isActive: pathname === "/organization",
      },
      {
        href: "/organization/sales",
        label: "Tim Sales",
        icon: "group",
        isActive: pathname.startsWith("/organization/sales"),
      },
      {
        href: "/commission/wallet",
        label: "Hak 10%",
        icon: "account_balance_wallet",
        isActive: pathname.startsWith("/commission"),
        highlight: true,
      },
      {
        href: "/organization/outlets",
        label: "Outlet",
        icon: "storefront",
        isActive: pathname.startsWith("/organization/outlets"),
      },
      {
        href: "/profile",
        label: "Profil",
        icon: "badge",
        isActive: pathname.startsWith("/profile"),
      },
    ];
  } else {
    // SALES ROLE
    navItems = [
      {
        href: "/",
        label: "Beranda",
        icon: "dashboard",
        isActive: pathname === "/",
      },
      {
        href: "/leads/check",
        label: "Info Outlet",
        icon: "radar",
        isActive: pathname.startsWith("/leads/check"),
      },
      {
        href: "/leads/check-in",
        label: "Check-In POS",
        icon: "add_location_alt",
        isActive: pathname.startsWith("/leads/check-in"),
        highlight: true,
      },
      {
        href: "/outlets",
        label: "Outlet Saya",
        icon: "storefront",
        isActive: pathname.startsWith("/outlets"),
      },
      {
        href: "/commission/wallet",
        label: "Komisi",
        icon: "account_balance_wallet",
        isActive: pathname.startsWith("/commission"),
      },
    ];
  }

  const highlightBg =
    currentUserRole === "ORGANISASI"
      ? "bg-emerald-700 shadow-[0_4px_14px_rgba(5,150,105,0.4)]"
      : currentUserRole === "ADMIN"
      ? "bg-[#2563EB] shadow-[0_4px_14px_rgba(37,99,235,0.4)]"
      : "bg-[#F97316] shadow-[0_4px_14px_rgba(249,115,22,0.4)]";

  const highlightTextColor =
    currentUserRole === "ORGANISASI"
      ? "text-emerald-700"
      : currentUserRole === "ADMIN"
      ? "text-[#2563EB]"
      : "text-[#F97316]";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] lg:hidden">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5 group"
              >
                <div
                  className={`w-12 h-12 rounded-full text-white flex items-center justify-center group-active:scale-95 transition-transform ${highlightBg}`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {item.icon}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 ${highlightTextColor}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 py-1 transition-colors ${
                item.isActive
                  ? `${highlightTextColor} font-bold`
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {item.icon}
              </span>
              <span className="text-[10px] mt-0.5 leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
