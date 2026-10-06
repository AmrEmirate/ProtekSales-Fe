"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Beranda",
      icon: "dashboard",
      isActive: pathname === "/",
    },
    {
      href: "/leads/check",
      label: "Kunci Lead",
      icon: "radar",
      isActive: pathname.startsWith("/leads/check"),
    },
    {
      href: "/leads/check-in",
      label: "Check-in",
      icon: "add_location_alt",
      isActive: pathname === "/leads/check-in" || pathname === "/leads/pipeline",
      highlight: true,
    },
    {
      href: "/outlets",
      label: "Klien POS",
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
                <div className="w-12 h-12 rounded-full bg-[#F97316] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(249,115,22,0.4)] group-active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">
                    {item.icon}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#F97316] mt-1">
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
                  ? "text-[#F97316] font-bold"
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
