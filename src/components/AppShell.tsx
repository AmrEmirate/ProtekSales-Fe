"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
