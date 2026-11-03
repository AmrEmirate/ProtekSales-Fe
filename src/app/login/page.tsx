"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();

  const [loginRole, setLoginRole] = useState<"SALES" | "ADMIN">("ADMIN");
  const [email, setEmail] = useState("owner@protek.id");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fillQuickAccount = (role: "SALES" | "ADMIN", accEmail: string, accPass: string) => {
    setLoginRole(role);
    setEmail(accEmail);
    setPassword(accPass);
    setErrorMsg(null);
  };

  const handleRoleSwitch = (role: "SALES" | "ADMIN") => {
    setLoginRole(role);
    setErrorMsg(null);
    if (role === "SALES") {
      setEmail("sales1@protek.id");
      setPassword("sales123");
    } else {
      setEmail("owner@protek.id");
      setPassword("admin123");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await api.login(email, password);
      setIsLoading(false);

      const targetUrl =
        data?.user?.role === "ADMIN" || loginRole === "ADMIN" ? "/admin" : "/";
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
        // Izinkan masuk mode offline/standalone sesuai permintaan user
        if (loginRole === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
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
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => fillQuickAccount("ADMIN", "owner@protek.id", "admin123")}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  email === "owner@protek.id"
                    ? "bg-[#102A43] text-white border-[#102A43] shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>👑 Owner / Admin</span>
                </div>
                <div className="text-[10px] opacity-80 truncate">Atur Komisi % & UI</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickAccount("ADMIN", "admin@protek.id", "admin123")}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  email === "admin@protek.id"
                    ? "bg-[#102A43] text-white border-[#102A43] shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>🛡️ Admin Operasional</span>
                </div>
                <div className="text-[10px] opacity-80 truncate">Pusat Server & Tagihan</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickAccount("SALES", "sales1@protek.id", "sales123")}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  email === "sales1@protek.id"
                    ? "bg-[#F97316] text-white border-[#F97316] shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>💼 Sales 1 (Budi)</span>
                </div>
                <div className="text-[10px] opacity-80 truncate">Saldo Rp 500rb + Outlet</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickAccount("SALES", "sales2@protek.id", "sales123")}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  email === "sales2@protek.id"
                    ? "bg-[#F97316] text-white border-[#F97316] shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>💼 Sales 2 (Dedi)</span>
                </div>
                <div className="text-[10px] opacity-80 truncate">Uji Anti-Tabrakan</div>
              </button>
            </div>
          </div>

          {/* Role Tab Switcher */}
          <div className="p-1 rounded-xl bg-slate-100 flex items-center text-xs font-bold">
            <button
              type="button"
              onClick={() => handleRoleSwitch("SALES")}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginRole === "SALES"
                  ? "bg-white text-[#102A43] shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">badge</span>
              <span>Mitra Sales Lapangan</span>
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
              <span>Pusat Kontrol Admin</span>
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
