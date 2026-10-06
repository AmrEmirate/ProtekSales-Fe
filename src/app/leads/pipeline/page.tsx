"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

export default function PipelinePage() {
  const { leads, refreshData } = useApp();
  const [activeStage, setActiveStage] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const stages = [
    { id: "ALL", label: "Semua Prospek", count: leads.length },
    {
      id: "Kunjungan Baru",
      label: "Kunjungan Baru",
      count: leads.filter((l) => l.stage === "Kunjungan Baru").length,
    },
    {
      id: "Demo Presentasi",
      label: "Demo Sistem",
      count: leads.filter((l) => l.stage === "Demo Presentasi").length,
    },
    {
      id: "Deal POS",
      label: "Deal Closing",
      count: leads.filter((l) => l.stage === "Deal POS" || l.status === "DEAL").length,
    },
  ];

  const filteredLeads =
    activeStage === "ALL"
      ? leads
      : leads.filter((l) => {
          if (activeStage === "Deal POS") return l.stage === "Deal POS" || l.status === "DEAL";
          return l.stage === activeStage;
        });

  const handleUpdateStatus = async (
    leadId: string,
    newStatus: "NEW" | "DEMO" | "DEAL" | "LOST"
  ) => {
    setUpdatingId(leadId);
    try {
      await api.updateLeadStatus(leadId, newStatus);
      await refreshData();
    } catch (err) {
      console.error("Gagal update status prospek:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <Link href="/leads/check" className="hover:text-[#F97316]">Leads</Link>
            <span>/</span>
            <span className="text-[#102A43]">Pipeline Prospek</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Pipeline Prospek Sales & Kunjungan
          </h1>
          <p className="text-xs text-slate-500">
            Pelacak tahapan calon outlet: Kunjungan Baru ➔ Demo Sistem ➔ Deal Closing ➔ Onboarding POS
          </p>
        </div>

        <Link
          href="/leads/check-in"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md transition-all active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
          <span>Check-in Baru</span>
        </Link>
      </div>

      {/* Geofence & Radar Status Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#102A43] via-[#0B1D3A] to-[#00152a] text-white p-5 sm:p-6 shadow-sm border border-[#1E3E62] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#16A34A]/20 border border-[#16A34A]/40 text-emerald-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px] animate-pulse">radar</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-display">Geofence Lead Protection Engine</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#16A34A]/20 text-emerald-300 text-[10px] font-bold border border-[#16A34A]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Garansi 30 Hari Proteksi
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Setiap calon outlet yang Anda daftarkan terkunci atas nama Anda. Jika tidak deal dalam 30 hari, otomatis expired menjadi Toko Bebas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/leads/map"
            className="px-3 py-2 rounded-xl bg-[#1E3E62] hover:bg-[#2A527A] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">map</span>
            <span>Peta Prospek</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {stages.map((stg) => (
          <button
            key={stg.id}
            onClick={() => setActiveStage(stg.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeStage === stg.id
                ? "bg-[#102A43] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-[#E2E8F0]"
            }`}
          >
            {stg.label} ({stg.count})
          </button>
        ))}
      </div>

      {/* Pipeline Cards Grid */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#F97316] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[28px]">storefront</span>
          </div>
          <h3 className="text-base font-bold font-display text-[#102A43]">
            Belum Ada Prospek di Tahapan Ini
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Gunakan fitur Cek & Kunci Prospek atau Form Check-in Lapangan untuk memasukkan toko baru ke dalam pipeline Anda.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/leads/check"
              className="px-4 py-2.5 rounded-xl bg-[#102A43] text-white font-bold text-xs shadow-md transition-all inline-block"
            >
              Cek & Kunci Prospek
            </Link>
            <Link
              href="/leads/check-in"
              className="px-4 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md transition-all inline-block"
            >
              Check-in Kunjungan Baru
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLeads.map((lead) => {
            const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
            const isDeal = lead.status === "DEAL" || lead.stage === "Deal POS";

            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-[#E2E8F0] flex flex-col justify-between hover:shadow-md transition-all space-y-4"
              >
                <div className="space-y-3">
                  {/* Header Zone */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isDeal ? "bg-[#16A34A]" : "bg-[#0284C7]"
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isDeal ? "text-emerald-700" : "text-blue-700"
                          }`}
                        >
                          {lead.stage}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Tersisa {lead.daysRemaining} Hari
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#102A43] font-display truncate">
                        {lead.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate">{lead.category}</p>
                    </div>

                    <div className="shrink-0 w-11 h-11 rounded-xl bg-[#edf4ff] text-[#102A43] flex items-center justify-center font-bold text-xs border border-blue-100">
                      {lead.name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center gap-1 text-slate-600">
                      <span className="material-symbols-outlined text-[15px] text-[#F97316]">
                        location_on
                      </span>
                      <span className="truncate">{lead.address || "DKI Jakarta"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <span className="material-symbols-outlined text-[15px] text-emerald-600">
                        phone
                      </span>
                      <span>+62 {cleanPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${cleanPhone}?text=Halo%20${encodeURIComponent(
                        lead.name
                      )},%20kami%20dari%20tim%20PT%20Pro%20Teknologi%20(ProTek%20POS).`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center hover:bg-[#bbf7d0] transition-colors shrink-0"
                      title="Chat WhatsApp"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                    </a>

                    {/* Stage Transition Buttons */}
                    {lead.stage === "Kunjungan Baru" && (
                      <button
                        type="button"
                        disabled={updatingId === lead.id}
                        onClick={() => handleUpdateStatus(lead.id, "DEMO")}
                        className="flex-1 h-9 rounded-xl bg-[#FFF7ED] text-[#F97316] hover:bg-[#F97316] hover:text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>Mulai Demo</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    )}

                    {lead.stage === "Demo Presentasi" && (
                      <button
                        type="button"
                        disabled={updatingId === lead.id}
                        onClick={() => handleUpdateStatus(lead.id, "DEAL")}
                        className="flex-1 h-9 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        <span>Closing Deal</span>
                      </button>
                    )}

                    {isDeal && (
                      <Link
                        href={`/outlets/onboarding?leadId=${lead.id}&name=${encodeURIComponent(
                          lead.name
                        )}&phone=${cleanPhone}`}
                        className="flex-1 h-9 rounded-xl bg-[#102A43] hover:bg-[#0B1D3A] text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
                        <span>Aktivasi POS</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
