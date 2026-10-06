"use client";

import React from "react";
import { AppProvider } from "@/context/AppContext";
import { AppShell } from "./AppShell";
import { usePathname } from "next/navigation";

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
