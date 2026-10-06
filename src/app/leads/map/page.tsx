"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/services/api";

export default function MapRoutePage() {
  const [activeTerritory, setActiveTerritory] = useState("Jaksel");
  const [selectedPin, setSelectedPin] = useState<number>(5);

  useEffect(() => {
    async function loadRoutes() {
      try {
        await api.getSalesRoutesMap();
      } catch {}
    }
    loadRoutes();
  }, []);

  const stops = [
    {
      id: 1,
      name: "Toko Sukses Makmur",
      category: "Kelontong",
      address: "Jl. Panglima Polim No. 12",
      status: "COMPLETED",
      time: "09:30 WIB",
      distance: "0 km",
    },
    {
      id: 2,
      name: "Kopi Sudirman 88",
      category: "Kafe",
      address: "Jl. Gandaria I No. 4",
      status: "COMPLETED",
      time: "10:45 WIB",
      distance: "+ 1.4 km",
    },
    {
      id: 3,
      name: "RM Padang Minang",
      category: "Kuliner",
      address: "Jl. Radio Dalam No. 19",
      status: "COMPLETED",
      time: "11:50 WIB",
      distance: "+ 850 m",
    },
    {
      id: 4,
      name: "Toko Barokah Herbal",
      category: "Kesehatan",
      address: "Jl. Fatmawati No. 8",
      status: "COMPLETED",
      time: "13:15 WIB",
      distance: "+ 1.1 km",
    },
    {
      id: 5,
      name: "Warung Kopi Nusantara",
      category: "Kafe & Roti",
      address: "Jl. Fatmawati Raya No. 42B",
      status: "ACTIVE",
      time: "Target 14:30 WIB (Sekarang)",
      distance: "+ 1.2 km (8 menit)",
      notes: "Demo POS kasir dual-screen & simulasi kalkulator ROI.",
    },
    {
      id: 6,
      name: "Apotek Sehat Prima",
      category: "Farmasi",
      address: "Jl. TB Simatupang No. 71",
      status: "PENDING_H3",
      time: "Target 15:45 WIB",
      distance: "+ 2.3 km (15 menit)",
      notes: "Penagihan invoice H-3 jatuh tempo & cek printer thermal.",
    },
    {
      id: 7,
      name: "Bake & Cake Cilandak",
      category: "Bakery",
      address: "Jl. Cilandak KKO No. 10",
      status: "FREE",
      time: "Target 16:40 WIB",
      distance: "+ 1.8 km (12 menit)",
      notes: "Prospek baru belum terkunci. Siap diklaim.",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <Link href="/leads/pipeline" className="hover:text-[#F97316]">Leads</Link>
            <span>/</span>
            <span className="text-[#102A43]">Optimasi Peta Rute</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Peta Rute & Optimasi Kunjungan Wilayah
          </h1>
          <p className="text-xs text-slate-500">
            Perencanaan rute jalan terpendek berbasis algoritma klastering GPS untuk meminimalkan waktu tempuh
          </p>
        </div>

        {/* Territory Selector */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <button
            onClick={() => setActiveTerritory("Jaksel")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTerritory === "Jaksel"
                ? "bg-[#102A43] text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Jakarta Selatan
          </button>
          <button
            onClick={() => setActiveTerritory("Jakbar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTerritory === "Jakbar"
                ? "bg-[#102A43] text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Jakarta Barat
          </button>
          <button
            onClick={() => setActiveTerritory("Jakut")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTerritory === "Jakut"
                ? "bg-[#102A43] text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Jakarta Utara
          </button>
        </div>
      </div>

      {/* Main Responsive Grid: 12 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols on Desktop): Interactive Map Canvas */}
        <div className="lg:col-span-7 bg-[#0B1D3A] rounded-2xl p-4 sm:p-6 text-white border border-[#1E3E62] shadow-xl flex flex-col justify-between relative overflow-hidden min-h-[460px]">
          {/* Map Top Bar */}
          <div className="flex items-center justify-between z-20 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] animate-ping" />
              <span className="text-xs font-bold font-display uppercase tracking-wider text-orange-300">
                Live GPS Routing Corridor
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#102A43] border border-[#1E3E62] text-[10px] text-slate-300 font-mono">
                Total Hari Ini: 7 Outlet (8.6 km)
              </span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full h-[360px] sm:h-[400px] rounded-xl overflow-hidden bg-[#071326] border border-[#1E3E62]/70 flex items-center justify-center">
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 400 360"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <linearGradient id="routeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#16A34A" />
                  <stop offset="55%" stopColor="#F97316" />
                  <stop offset="85%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#64748B" />
                </linearGradient>
              </defs>

              {/* City Grid Roads */}
              <rect width="400" height="360" fill="#071326" />
              <path d="M-20,40 Q80,70 140,20 T320,80 L350,-10 L-20,-10 Z" fill="#102A43" opacity="0.4" />
              <path d="M80,380 C120,290 220,330 320,270 L420,320 L420,380 Z" fill="#102A43" opacity="0.4" />

              {/* Road Lines */}
              <path d="M-10,130 L410,160 M240,-10 L210,370 M60,40 L380,310 M330,30 L70,350" opacity="0.5" stroke="#1E3E62" strokeDasharray="2 2" strokeWidth="2" />
              <path d="M40,320 Q90,210 180,185 T340,90" fill="none" stroke="#1E3E62" strokeLinecap="round" strokeWidth="10" />
              <path d="M40,320 Q90,210 180,185 T340,90" fill="none" stroke="#0B1D3A" strokeLinecap="round" strokeWidth="6" />

              {/* Completed Route Trail (Green) */}
              <path d="M60,60 L110,110 L150,85 L140,160" fill="none" opacity="0.95" stroke="#16A34A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />

              {/* Next Segment: Glowing Orange to Stop 5 */}
              <path d="M140,160 Q160,175 195,190" fill="none" stroke="#F97316" strokeDasharray="6 6" strokeLinecap="round" strokeWidth="4.5" />

              {/* Remaining Segment (Amber & Gray) */}
              <path d="M195,190 Q240,220 280,245 L335,285" fill="none" opacity="0.8" stroke="#64748B" strokeDasharray="4 4" strokeLinecap="round" strokeWidth="3" />

              {/* User Position */}
              <circle cx="160" cy="172" fill="#F97316" opacity="0.25" r="14" />
              <circle cx="160" cy="172" fill="#F97316" r="6" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            {/* Pins positioned absolutely over SVG */}
            {/* Pin 1 Selesai */}
            <div
              onClick={() => setSelectedPin(1)}
              className="absolute top-[50px] left-[55px] cursor-pointer -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shadow-md">
                <span className="material-symbols-outlined text-[14px]">check</span>
              </div>
              <span className="text-[9px] font-bold text-white bg-slate-900/80 px-1 py-0.5 rounded mt-0.5">
                #1 Selesai
              </span>
            </div>

            {/* Pin 2 Selesai */}
            <div
              onClick={() => setSelectedPin(2)}
              className="absolute top-[105px] left-[105px] cursor-pointer -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shadow-md">
                <span className="material-symbols-outlined text-[14px]">check</span>
              </div>
              <span className="text-[9px] font-bold text-white bg-slate-900/80 px-1 py-0.5 rounded mt-0.5">
                #2 Selesai
              </span>
            </div>

            {/* Pin 3 Selesai */}
            <div
              onClick={() => setSelectedPin(3)}
              className="absolute top-[80px] left-[145px] cursor-pointer -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shadow-md">
                <span className="material-symbols-outlined text-[14px]">check</span>
              </div>
              <span className="text-[9px] font-bold text-white bg-slate-900/80 px-1 py-0.5 rounded mt-0.5">
                #3 Selesai
              </span>
            </div>

            {/* Pin 4 Selesai */}
            <div
              onClick={() => setSelectedPin(4)}
              className="absolute top-[155px] left-[135px] cursor-pointer -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shadow-md">
                <span className="material-symbols-outlined text-[14px]">check</span>
              </div>
              <span className="text-[9px] font-bold text-white bg-slate-900/80 px-1 py-0.5 rounded mt-0.5">
                #4 Selesai
              </span>
            </div>

            {/* Pin 5: Target Aktif (Hero Pulse) */}
            <div
              onClick={() => setSelectedPin(5)}
              className="absolute top-[185px] left-[190px] cursor-pointer -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-30"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-9 h-9 rounded-full bg-orange-500 opacity-60 animate-ping" />
                <div className="relative w-8 h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-xl">
                  5
                </div>
              </div>
              <div className="mt-1 px-2 py-0.5 rounded bg-white text-[#102A43] text-[10px] font-bold shadow-lg flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
                <span>Warkop Nusantara (8 mnt)</span>
              </div>
            </div>

            {/* Pin 6: Pending H-3 */}
            <div
              onClick={() => setSelectedPin(6)}
              className="absolute top-[245px] left-[270px] cursor-pointer -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs border border-white shadow">
                6
              </div>
              <span className="text-[9px] font-bold text-white bg-slate-900/80 px-1 py-0.5 rounded mt-0.5">
                Tagihan H-3
              </span>
            </div>

            {/* Pin 7: Free Lead */}
            <div
              onClick={() => setSelectedPin(7)}
              className="absolute top-[285px] left-[325px] cursor-pointer -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20"
            >
              <div className="w-7 h-7 rounded-full bg-slate-500 text-white flex items-center justify-center font-bold text-xs border border-white shadow">
                7
              </div>
              <span className="text-[9px] font-bold text-white bg-slate-900/80 px-1 py-0.5 rounded mt-0.5">
                Bebas Klaim
              </span>
            </div>
          </div>

          {/* Map Footer Bar */}
          <div className="flex items-center justify-between pt-3 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Selesai (4)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F97316]" /> Target Aktif (1)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> H-3 Tempo (1)
              </span>
            </div>

            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-orange-400 hover:text-orange-300 font-bold"
            >
              <span className="material-symbols-outlined text-[16px]">navigation</span>
              <span>Buka Google Maps</span>
            </a>
          </div>
        </div>

        {/* Right Column (5 Cols on Desktop): Sequence Itinerary List */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#102A43] font-display">
                  Urutan Rute Teroptimasi
                </h2>
                <p className="text-xs text-slate-500">Hemat ~42 menit perjalanan harian</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#F97316] text-xs font-bold border border-orange-200">
                Stop 5 dari 7
              </span>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1">
              {stops.map((stop) => {
                const isSelected = selectedPin === stop.id;
                const isCurrent = stop.status === "ACTIVE";
                const isCompleted = stop.status === "COMPLETED";

                return (
                  <div
                    key={stop.id}
                    onClick={() => setSelectedPin(stop.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-orange-50/80 border-[#F97316] shadow-sm ring-1 ring-[#F97316]"
                        : isSelected
                        ? "bg-slate-100 border-slate-400"
                        : isCompleted
                        ? "bg-slate-50 border-slate-200 opacity-70"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCompleted
                              ? "bg-emerald-600 text-white"
                              : isCurrent
                              ? "bg-[#F97316] text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {isCompleted ? (
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          ) : (
                            stop.id
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#102A43]">{stop.name}</h4>
                          <p className="text-[11px] text-slate-500">{stop.address}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-[#F97316] block">
                          {stop.distance}
                        </span>
                        <span className="text-[10px] text-slate-400">{stop.time}</span>
                      </div>
                    </div>

                    {stop.notes && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 italic">
                        {stop.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/leads/check-in"
              className="flex-1 h-11 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
              <span>Check-in di Outlet #5</span>
            </Link>
            <a
              href="https://wa.me/6281298762211"
              target="_blank"
              rel="noreferrer"
              className="h-11 px-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
