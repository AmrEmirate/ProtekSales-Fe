"use client";

import React from "react";
import Link from "next/link";

export default function ToolkitHubPage() {
  const tools = [
    {
      title: "Kalkulator ROI POS",
      desc: "Simulasikan efisiensi waktu, pencegahan selisih kas, dan keuntungan adopsi sistem kasir untuk pemilik toko secara interaktif.",
      href: "/toolkit/roi",
      icon: "calculate",
      color: "from-blue-600 to-indigo-700",
      badge: "Sales Pitch Interaktif",
    },
    {
      title: "Brosur Digital POS",
      desc: "Katalog spesifikasi fitur hardware dan software cloud POS siap unduh atau kirim langsung via WhatsApp ke calon klien.",
      href: "/toolkit/brochures",
      icon: "menu_book",
      color: "from-orange-500 to-amber-600",
      badge: "Materi Presentasi",
    },
    {
      title: "Pusat Edukasi & Script Closing",
      desc: "Panduan cara menghadapi penolakan (objection handling), tips komunikasi dengan pemilik toko, dan teknik closing 1-visit.",
      href: "/toolkit/education",
      icon: "school",
      color: "from-emerald-600 to-teal-700",
      badge: "Knowledge Base Lapangan",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
          <span>/</span>
          <span className="text-[#102A43]">Sales Toolkit</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
          Sales Toolkit & Amunisi Lapangan
        </h1>
        <p className="text-xs text-slate-500">
          Peralatan digital untuk membantu meyakinkan prospek dan mempercepat kesepakatan berlangganan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group block p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all hover:border-[#F97316]/50 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center shadow-md`}>
                <span className="material-symbols-outlined text-[26px]">{tool.icon}</span>
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {tool.badge}
              </span>
              <h2 className="text-lg font-bold font-display text-[#102A43] group-hover:text-[#F97316] transition-colors">
                {tool.title}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {tool.desc}
              </p>
            </div>
            <div className="pt-6 flex items-center gap-1.5 text-xs font-bold text-[#F97316]">
              <span>Buka Alat</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
