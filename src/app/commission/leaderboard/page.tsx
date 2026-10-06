"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

interface LeaderboardEntry {
  rank: number;
  name: string;
  region: string;
  salesId: string;
  outletsCount: number;
  revenue: number;
  mrrFormatted: string;
  tier: string;
  bonus: number;
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

export default function LeaderboardPage() {
  const { salesProfile } = useApp();
  const [filterMode, setFilterMode] = useState<"CLOSING" | "MRR" | "GPS">("CLOSING");
  const [salesList, setSalesList] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data = await api.getLeaderboard();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: LeaderboardEntry[] = data.map((item: any, idx: number) => ({
            rank: idx + 1,
            name: item.name || item.salesName,
            region: item.region || "DKI Jakarta",
            salesId: item.id || `SLS-00${idx + 1}`,
            outletsCount: item.outletsCount || item.dealCount || 0,
            revenue: item.totalCommission || item.revenue || 0,
            mrrFormatted: `Rp ${(item.totalCommission || 0).toLocaleString("id-ID")}`,
            tier: item.tier || "Mitra Sales",
            bonus: item.bonus || 0,
            isCurrentUser: item.email === "sales@protek.id",
          }));
          setSalesList(mapped);
          return;
        }
      } catch {}

      // Fallback data profil pengguna aktif jika server offline
      setSalesList([
        {
          rank: 1,
          name: salesProfile.name,
          region: "DKI Jakarta",
          salesId: salesProfile.id,
          outletsCount: 0,
          revenue: 0,
          mrrFormatted: "Rp 0",
          tier: salesProfile.tier,
          bonus: 0,
          isCurrentUser: true,
        },
      ]);
    }
    loadLeaderboard();
  }, [salesProfile]);

  const topSales = salesList;

  const rank1 = topSales[0] || null;
  const rank2 = topSales[1] || null;
  const rank3 = topSales[2] || null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <Link href="/commission/wallet" className="hover:text-[#F97316]">Komisi</Link>
            <span>/</span>
            <span className="text-[#102A43]">Papan Peringkat</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#F97316] block mt-1">
            PERFORMA TIM LAPANGAN
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#0B1D3A]">
            Papan Peringkat & Insentif
          </h1>
        </div>

        {/* Region & Scope Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#102A43] text-white text-xs font-semibold shadow-sm">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span>Se-Jabodetabek</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#d8eaff] text-[#001d32] text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            <span>Oktober 2026</span>
          </div>
        </div>
      </div>

      {/* 2. Booster Sprint Q4 Banner (Restored from Blueprint) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#102A43] via-[#0B1D3A] to-[#00152a] p-5 sm:p-6 text-white shadow-md">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#F97316]/10 blur-xl pointer-events-none" />

        <div className="flex items-start justify-between gap-2 relative z-10 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F97316] text-white text-[10px] uppercase font-bold tracking-wide">
              Booster Sprint Q4
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#ffdbca] font-medium">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              Sisa 6 Hari
            </span>
          </div>
          <span className="material-symbols-outlined text-[#FF8A00] text-[24px]">rocket_launch</span>
        </div>

        <p className="text-base sm:text-lg font-bold font-display text-white leading-snug relative z-10 max-w-2xl">
          Closing <span className="text-[#F97316]">8 Outlet Tambahan</span>, Dapatkan Bonus{" "}
          <span className="text-[#FF8A00]">Rp 2.500.000</span> Tunai!
        </p>

        {/* Progress Bar Container */}
        <div className="mt-4 bg-[#1E3E62]/80 rounded-xl p-3.5 relative z-10 max-w-2xl">
          <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
            <span className="text-[#d8eaff]">Progres {salesProfile.name} (Anda)</span>
            <span className="font-bold text-[#F97316]">
              {Math.min(8, topSales.find((s) => s.isCurrentUser)?.outletsCount || 0)} / 8 Outlet (
              {Math.min(100, Math.round(((topSales.find((s) => s.isCurrentUser)?.outletsCount || 0) / 8) * 100))}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#0B1D3A] rounded-full overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-[#FF8A00] to-[#F97316] h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round(((topSales.find((s) => s.isCurrentUser)?.outletsCount || 0) / 8) * 100))}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-300">
            <span>
              Tersisa {Math.max(0, 8 - (topSales.find((s) => s.isCurrentUser)?.outletsCount || 0))} outlet menuju target
            </span>
            <span className="text-emerald-300 font-bold">Reward Unlock: Rp 2,5 Jt</span>
          </div>
        </div>
      </div>

      {/* 3. Podium Juara Utama (Tactile Stepped Podium with Real Photos) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0B1D3A] font-display flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#F97316] text-[20px]">
              workspace_premium
            </span>
            Podium Juara Utama
          </h2>
          <span className="text-xs text-slate-500">Update Realtime Sistem</span>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E2E8F0] pt-8">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-3xl mx-auto">
            {/* Rank 2 (Left - Silver) */}
            <div className="flex flex-col items-center text-center order-1">
              {rank2 ? (
                <>
                  <div className="relative mb-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-sm bg-slate-100 ring-4 ring-slate-200">
                      {rank2.avatarUrl ? (
                        <img src={rank2.avatarUrl} alt={rank2.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-700 bg-slate-200 text-xs sm:text-sm">
                          {rank2.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#CBD5E1] text-[#0B1D3A] flex items-center justify-center font-bold text-xs shadow-md">
                      2
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#0B1D3A] truncate w-full font-display">
                    {rank2.name}
                  </span>
                  <span className="text-[11px] text-slate-500 mb-3">{rank2.region}</span>

                  <div className="w-full bg-[#e3efff] rounded-t-2xl pt-4 pb-3 px-2 flex flex-col items-center h-32 sm:h-36 justify-between border-t-2 border-slate-300">
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-slate-500 text-[20px]">emoji_events</span>
                      <span className="text-base sm:text-lg font-bold font-display text-[#0B1D3A] mt-0.5">
                        {rank2.outletsCount}
                      </span>
                      <span className="text-[10px] text-slate-600 uppercase font-semibold">Outlet</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#102A43] font-display">
                      {rank2.mrrFormatted}
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full flex flex-col items-center opacity-40">
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs mb-3">
                    -
                  </div>
                  <span className="text-xs text-slate-400 mb-3">Slot Tersedia</span>
                  <div className="w-full bg-slate-100 rounded-t-2xl h-28 border-t border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                    Peringkat 2
                  </div>
                </div>
              )}
            </div>

            {/* Rank 1 (Center - Gold Champion) */}
            <div className="flex flex-col items-center text-center order-2">
              {rank1 ? (
                <>
                  <div className="relative mb-3">
                    <span className="material-symbols-outlined text-[#FF8A00] text-[24px] mb-0.5 animate-bounce">
                      workspace_premium
                    </span>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-lg bg-orange-100 p-1 ring-4 ring-[#F97316]">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        {rank1.avatarUrl ? (
                          <img src={rank1.avatarUrl} alt={rank1.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-orange-800 bg-orange-200 text-sm sm:text-base">
                            {rank1.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center font-bold text-xs shadow-md">
                      1
                    </div>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#0B1D3A] truncate w-full font-display">
                    {rank1.name}
                  </span>
                  <span className="text-[11px] font-bold text-[#F97316] mb-3">{rank1.region}</span>

                  <div className="w-full bg-gradient-to-t from-[#FFF7ED] to-[#d8eaff] rounded-t-2xl pt-5 pb-3 px-2 flex flex-col items-center h-44 sm:h-48 justify-between shadow-sm border-t-4 border-[#F97316]">
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-[#F97316] text-[24px]">military_tech</span>
                      <span className="text-lg sm:text-2xl font-bold font-display text-[#0B1D3A] mt-0.5">
                        {rank1.outletsCount}
                      </span>
                      <span className="text-[10px] font-bold text-[#F97316] uppercase tracking-wide">
                        Outlet Juara
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#0B1D3A] font-display bg-white px-3 py-1 rounded-full shadow-sm">
                      {rank1.mrrFormatted}
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full flex flex-col items-center opacity-40">
                  <div className="w-20 h-20 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm mb-3">
                    -
                  </div>
                  <span className="text-xs text-slate-400 mb-3">Slot Tersedia</span>
                  <div className="w-full bg-slate-100 rounded-t-2xl h-36 border-t-2 border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                    Peringkat 1
                  </div>
                </div>
              )}
            </div>

            {/* Rank 3 (Right - Bronze) */}
            <div className="flex flex-col items-center text-center order-3">
              {rank3 ? (
                <>
                  <div className="relative mb-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-sm bg-orange-50 ring-4 ring-amber-300">
                      {rank3.avatarUrl ? (
                        <img src={rank3.avatarUrl} alt={rank3.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-amber-900 bg-amber-200 text-xs sm:text-sm">
                          {rank3.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#9d4300] text-white flex items-center justify-center font-bold text-xs shadow-md">
                      3
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#0B1D3A] truncate w-full font-display">
                    {rank3.name}
                  </span>
                  <span className="text-[11px] font-bold text-[#9d4300] mb-3">{rank3.region}</span>

                  <div className="w-full bg-[#edf4ff] rounded-t-2xl pt-4 pb-3 px-2 flex flex-col items-center h-28 sm:h-32 justify-between border-t-2 border-amber-300">
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-[#9d4300] text-[20px]">military_tech</span>
                      <span className="text-base sm:text-lg font-bold font-display text-[#0B1D3A] mt-0.5">
                        {rank3.outletsCount}
                      </span>
                      <span className="text-[10px] text-slate-600 uppercase font-semibold">Outlet</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#102A43] font-display">
                      {rank3.mrrFormatted}
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full flex flex-col items-center opacity-40">
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs mb-3">
                    -
                  </div>
                  <span className="text-xs text-slate-400 mb-3">Slot Tersedia</span>
                  <div className="w-full bg-slate-100 rounded-t-2xl h-24 border-t border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                    Peringkat 3
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filter Tabs Matrix */}
      <div className="flex items-center p-1 rounded-xl bg-[#e3efff] gap-1">
        <button
          type="button"
          onClick={() => setFilterMode("CLOSING")}
          className={`flex-1 py-2 px-2 text-center rounded-lg text-xs font-bold transition-all ${
            filterMode === "CLOSING"
              ? "bg-white text-[#0B1D3A] shadow-sm"
              : "text-slate-600 hover:text-[#0B1D3A]"
          }`}
        >
          Paling Banyak Closing
        </button>
        <button
          type="button"
          onClick={() => setFilterMode("MRR")}
          className={`flex-1 py-2 px-2 text-center rounded-lg text-xs font-bold transition-all ${
            filterMode === "MRR"
              ? "bg-white text-[#0B1D3A] shadow-sm"
              : "text-slate-600 hover:text-[#0B1D3A]"
          }`}
        >
          Tertinggi MRR
        </button>
        <button
          type="button"
          onClick={() => setFilterMode("GPS")}
          className={`flex-1 py-2 px-2 text-center rounded-lg text-xs font-bold transition-all ${
            filterMode === "GPS"
              ? "bg-white text-[#0B1D3A] shadow-sm"
              : "text-slate-600 hover:text-[#0B1D3A]"
          }`}
        >
          GPS 100% Akurat
        </button>
      </div>

      {/* 5. Klasemen Lengkap 4 - 10 (Restored Authentic List) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-bold text-[#0B1D3A] font-display">
            Peringkat 4 - 10 Klasemen
          </span>
          <span className="text-xs text-slate-500">{topSales.length} Agen Terdaftar</span>
        </div>

        <div className="space-y-2.5">
          {topSales.slice(3).length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Belum ada peringkat lanjutan (kurang dari 4 agen terdaftar)
            </div>
          ) : (
            topSales.slice(3).map((agent) => (
              <div
                key={agent.rank}
                className="flex items-center justify-between p-3.5 bg-[#f7f9ff] hover:bg-[#edf4ff] rounded-xl transition-colors border border-slate-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base font-bold font-display text-slate-500 w-6 text-center shrink-0">
                    {agent.rank}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#d8eaff] flex items-center justify-center shrink-0 text-[#102A43] font-bold text-xs">
                    {agent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-[#0B1D3A] truncate font-display">
                      {agent.name}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{agent.region}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="font-bold text-emerald-700">{agent.outletsCount} Closing</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-[#0B1D3A] font-display block">
                    {agent.mrrFormatted}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">Est. MRR</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
