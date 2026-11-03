"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppProvider } from "@/context/AppContext";
import { AppShell } from "./AppShell";

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <AppProvider>
      {isLoginPage ? children : <AppShell>{children}</AppShell>}
    </AppProvider>
  );
};
