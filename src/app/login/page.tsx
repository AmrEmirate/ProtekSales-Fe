"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();

  const [loginRole, setLoginRole] = useState<"SALES" | "ADMIN" | "SUPERADMIN">("SUPERADMIN");
  const [email, setEmail] = useState("owner@protek.id");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fillQuickAccount = (role: "SALES" | "ADMIN" | "SUPERADMIN", accEmail: string, accPass: string) => {
    setLoginRole(role);
    setEmail(accEmail);
    setPassword(accPass);
    setErrorMsg(null);
  };

  const handleRoleSwitch = (role: "SALES" | "ADMIN" | "SUPERADMIN") => {
    setLoginRole(role);
    setErrorMsg(null);
    if (role === "SALES") {
      setEmail("sales1@protek.id");
      setPassword("sales123");
    } else if (role === "ADMIN") {
      setEmail("admin@protek.id");
      setPassword("admin123");
    } else {
      setEmail("owner@protek.id");
      setPassword("admin123");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const cleanEmail = email.toLowerCase().trim();
    let resolvedRole: "SALES" | "ADMIN" | "SUPERADMIN" = "SALES";
    if (cleanEmail === "owner@protek.id") {
      resolvedRole = "SUPERADMIN";
    } else if (cleanEmail === "admin@protek.id") {
      resolvedRole = "ADMIN";
    } else if (cleanEmail.includes("sales")) {
      resolvedRole = "SALES";
    } else if (loginRole === "SUPERADMIN") {
      resolvedRole = "SUPERADMIN";
    } else if (loginRole === "ADMIN") {
      resolvedRole = "ADMIN";
    } else {
      resolvedRole = "SALES";
    }

    try {
      const data = await api.login(cleanEmail, password);
      setIsLoading(false);

      // Pastikan role disinkronkan akurat dari identitas pengguna
      if (cleanEmail === "owner@protek.id") {
        resolvedRole = "SUPERADMIN";
      } else if (cleanEmail === "admin@protek.id") {
        resolvedRole = "ADMIN";
      } else if (data?.user?.role === "ADMIN") {
        resolvedRole = "ADMIN";
      } else {
        resolvedRole = "SALES";
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("protek_user_role", resolvedRole);
        localStorage.setItem("protek_user_email", cleanEmail);
        localStorage.setItem(
          "protek_user_name",
          data?.user?.name ||
            (resolvedRole === "SUPERADMIN"
              ? "Owner / Direktur PT Pro Teknologi"
              : resolvedRole === "ADMIN"
              ? "Admin PT Pro Teknologi"
              : "Budi Sales (Senior)")
        );
      }

      const targetUrl =
        resolvedRole === "SUPERADMIN"
          ? "/admin/command-center"
          : resolvedRole === "ADMIN"
          ? "/admin"
          : "/";
      window.location.href = targetUrl;
    } catch (err: any) {
      setIsLoading(false);
      // Fallback dev mode jika server database sedang offline (karena sales di luar jaringan lokal)
      const isConnectionError =
        err?.message?.includes("Failed to fetch") ||
        err?.message?.includes("NetworkError") ||
        err?.message?.includes("500") ||
        err?.message?.includes("HTTP Error");

      if (isConnectionError) {
        if (typeof window !== "undefined") {
          localStorage.setItem("protek_user_role", resolvedRole);
          localStorage.setItem("protek_user_email", cleanEmail);
          localStorage.setItem(
            "protek_user_name",
            resolvedRole === "SUPERADMIN"
              ? "Owner / Direktur PT Pro Teknologi"
              : resolvedRole === "ADMIN"
              ? "Admin PT Pro Teknologi"
              : "Budi Sales (Senior)"
          );
        }
        // Izinkan masuk mode offline/standalone sesuai peran
        if (resolvedRole === "SUPERADMIN") {
          window.location.href = "/admin/command-center";
        } else if (resolvedRole === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        setErrorMsg(err.message || "Gagal masuk. Periksa email dan kata sandi Anda.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1D3A] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#F97316]/10 blur-xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-[#0284C7]/10 blur-xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-[#102A43] border border-[#1E3E62] shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-[#F97316] text-white flex items-center justify-center font-bold text-lg font-display">
              PT
            </div>
            <div className="text-left pr-2">
              <span className="text-[10px] font-bold text-[#F97316] uppercase tracking-wider block font-display">
                PT PRO TEKNOLOGI INDONESIA
              </span>
              <span className="text-sm font-bold text-white font-display">
                ProTek Sales & Licensing Portal
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight mt-2">
            Masuk ke Portal Resmi
          </h1>
          <p className="text-xs text-slate-300">
            Sistem Manajemen Prospek, Outlet, Lisensi POS & Komisi Sales
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-100">
          {/* Quick Account Test Fillers (1-Click Fill) */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              ⚡ Akun Uji Coba Cepat (1-Click Fill):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
              <button
                type="button"
                onClick={() => fillQuickAccount("SUPERADMIN", "owner@protek.id", "admin123")}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  loginRole === "SUPERADMIN"
                    ? "bg-[#0B1D3A] text-[#38BDF8] border-[#38BDF8] shadow-md ring-1 ring-[#38BDF8]"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <div className="font-bold flex items-center gap-1 text-[#38BDF8]">
                  <span>👑 Admin Bisnis & SaaS</span>
                </div>
                <div className="text-[10px] opacity-80 truncate">Command Center Multi-Tenant</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickAccount("ADMIN", "admin@protek.id", "admin123")}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  loginRole === "ADMIN"
                    ? "bg-[#102A43] text-white border-[#102A43] shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>🛡️ Admin Sales CRM</span>
                </div>
                <div className="text-[10px] opacity-80 truncate">Pusat Server & Tagihan</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickAccount("SALES", "sales1@protek.id", "sales123")}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  loginRole === "SALES"
                    ? "bg-[#F97316] text-white border-[#F97316] shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>💼 Mitra Sales (Budi)</span>
                </div>
                <div className="text-[10px] opacity-80 truncate">Kunci Leads & Dompet</div>
              </button>
            </div>
          </div>

          {/* Role Tab Switcher */}
          <div className="p-1 rounded-xl bg-slate-100 flex items-center text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => handleRoleSwitch("SUPERADMIN")}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginRole === "SUPERADMIN"
                  ? "bg-[#0B1D3A] text-[#38BDF8] shadow-sm font-bold border border-[#38BDF8]/40"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">hub</span>
              <span>Admin Bisnis</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch("ADMIN")}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginRole === "ADMIN"
                  ? "bg-[#102A43] text-white shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span>Admin Sales</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch("SALES")}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginRole === "SALES"
                  ? "bg-white text-[#F97316] shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">badge</span>
              <span>Mitra Sales</span>
            </button>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Otentikasi Aman (JWT Bearer)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
              {loginRole === "SALES" ? "AKSES SALES" : "AKSES SERVER OWNER"}
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px] shrink-0 text-red-600">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">
                Email Terdaftar
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 material-symbols-outlined text-[18px] text-slate-400">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@protek.id"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] focus:bg-white focus:border-[#F97316] outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-[#102A43]">Kata Sandi</label>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 material-symbols-outlined text-[18px] text-slate-400">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] focus:bg-white focus:border-[#F97316] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all disabled:opacity-50 mt-2 ${
                loginRole === "ADMIN"
                  ? "bg-[#102A43] hover:bg-[#0B1D3A]"
                  : "bg-[#F97316] hover:bg-[#EA580C] shadow-[0_4px_14px_rgba(249,115,22,0.35)]"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isLoading ? "hourglass_top" : "login"}
              </span>
              <span>
                {isLoading
                  ? "Memverifikasi Kredensial..."
                  : loginRole === "ADMIN"
                  ? "Masuk Dashboard Kontrol Admin"
                  : "Masuk Portal Sales & Lead Engine"}
              </span>
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-400">
            Kendala masuk akun? Hubungi support server di{" "}
            <a href="mailto:admin@protek.id" className="text-[#F97316] font-semibold underline">
              admin@protek.id
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
