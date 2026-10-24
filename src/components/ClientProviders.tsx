"use client";

import React, { useState, useEffect } from "react";
import { AppProvider } from "@/context/AppContext";
import { AppShell } from "./AppShell";

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoginPage, setIsLoginPage] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoginPage(window.location.pathname === "/login");
    }
  }, []);

  return (
    <AppProvider>
      {isLoginPage ? children : <AppShell>{children}</AppShell>}
    </AppProvider>
  );
};
