"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { api } from "@/services/api";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.replace("/login");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0B1D3A] flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold text-slate-300">Memverifikasi sesi login resmi...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)}
        isSidebarCollapsed={isCollapsed}
      />

      {/* Main Content Area: Responsive padding based on sidebar collapse & bottom nav */}
      <main
        className={`flex-1 transition-all duration-300 pb-24 lg:pb-8 ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar */}
      <BottomNav />
    </div>
  );
};
