"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [filterType, setFilterType] = useState<string>("ALL");

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === "ALL") return true;
    return n.type === filterType;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#102A43]">Pusat Notifikasi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Pusat Notifikasi & Peringatan Lapangan
          </h1>
          <p className="text-xs text-slate-500">
            Peringatan otomatis tagihan H-3 tempo, batas masa kadaluwarsa lead, dan konfirmasi transfer komisi
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors shrink-0"
        >
          Tandai Semua Dibaca
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterType("ALL")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            filterType === "ALL" ? "bg-[#102A43] text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Semua ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType("BILLING")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            filterType === "BILLING" ? "bg-amber-600 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Tagihan & Jatuh Tempo
        </button>
        <button
          onClick={() => setFilterType("LEAD")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            filterType === "LEAD" ? "bg-[#F97316] text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Proteksi Prospek
        </button>
        <button
          onClick={() => setFilterType("COMMISSION")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            filterType === "COMMISSION" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Komisi & Transfer
        </button>
      </div>

      {/* Notification Stream */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">
              notifications_off
            </span>
            <p className="text-sm font-bold text-slate-700">Tidak ada notifikasi saat ini</p>
            <p className="text-xs text-slate-400 mt-1">
              Semua peringatan sistem dan aktivitas lapangan akan muncul di sini secara realtime.
            </p>
          </div>
        ) : (
          filteredNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationRead(item.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                item.read
                  ? "bg-white border-slate-200 opacity-80"
                  : "bg-orange-50/50 border-orange-200 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === "BILLING"
                      ? "bg-amber-100 text-amber-800"
                      : item.type === "LEAD"
                      ? "bg-orange-100 text-[#F97316]"
                      : item.type === "COMMISSION"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {item.type === "BILLING"
                      ? "warning"
                      : item.type === "LEAD"
                      ? "lock"
                      : item.type === "COMMISSION"
                      ? "payments"
                      : "notifications"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#102A43]">{item.title}</h3>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">{item.time}</span>
                </div>
              </div>

              {item.actionUrl && (
                <Link
                  href={item.actionUrl}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shrink-0 transition-colors hidden sm:block"
                >
                  Lihat Detail &rarr;
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
