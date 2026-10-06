"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Brochure {
  id: string;
  title: string;
  category: string;
  size: string;
  downloads: number;
  description: string;
  badge: string;
}

export default function BrochuresPage() {
  const [filterCat, setFilterCat] = useState("ALL");

  const brochures: Brochure[] = [
    {
      id: "BRO-FNB-01",
      title: "Brosur Pro Enterprise F&B Dual-Screen",
      category: "FNB",
      size: "2.4 MB (PDF)",
      downloads: 412,
      description: "Katalog hardware Sunmi T2, integrasi KDS dapur, split bill, dan sistem meja kafe resto.",
      badge: "Terpopuler",
    },
    {
      id: "BRO-RET-02",
      title: "Brosur Retail & Minimarket Grosir",
      category: "RETAIL",
      size: "1.8 MB (PDF)",
      downloads: 289,
      description: "Dukungan scan barcode multi-item, stok otomatis, kartu member, dan struk belanja cepat.",
      badge: "Grosir Favorit",
    },
    {
      id: "BRO-MED-03",
      title: "Brosur Apotek & Fasilitas Medis",
      category: "MEDIS",
      size: "2.1 MB (PDF)",
      downloads: 145,
      description: "Modul nomor batch obat, tanggal kedaluwarsa, racikan resep, dan faktur PBF resmi.",
      badge: "Resmi KFA",
    },
    {
      id: "BRO-SRV-04",
      title: "Brosur Solusi Laundry & Barbershop",
      category: "SERVICE",
      size: "1.5 MB (PDF)",
      downloads: 98,
      description: "Notifikasi WA status cucian selesai, komisi capster barber, dan multi-cabang terpusat.",
      badge: "Serbaguna",
    },
  ];

  const filtered = filterCat === "ALL" ? brochures : brochures.filter((b) => b.category === filterCat);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#102A43]">Sales Toolkit</span>
            <span>/</span>
            <span className="text-[#102A43]">Brosur Digital</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Toolkit Brosur Digital & Spesifikasi POS
          </h1>
          <p className="text-xs text-slate-500">
            Bahan presentasi resmi beresolusi tinggi yang siap dibagikan via WhatsApp kepada calon merchant
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
          <button
            onClick={() => setFilterCat("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCat === "ALL" ? "bg-[#102A43] text-white" : "text-slate-600"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterCat("FNB")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCat === "FNB" ? "bg-[#102A43] text-white" : "text-slate-600"
            }`}
          >
            F&B
          </button>
          <button
            onClick={() => setFilterCat("RETAIL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCat === "RETAIL" ? "bg-[#102A43] text-white" : "text-slate-600"
            }`}
          >
            Ritel
          </button>
          <button
            onClick={() => setFilterCat("MEDIS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCat === "MEDIS" ? "bg-[#102A43] text-white" : "text-slate-600"
            }`}
          >
            Medis
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns on Desktop & Tablet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-[#E2E8F0] flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-[28px]">picture_as_pdf</span>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#102A43] font-display">
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.id} • {item.size}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold shrink-0">
                  {item.badge}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                {item.downloads}x dibagikan
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Membuka pratinjau PDF: ${item.title}`)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
                >
                  Lihat PDF
                </button>

                <a
                  href={`https://wa.me/?text=Halo,%20berikut%20kami%20lampirkan%20${encodeURIComponent(
                    item.title
                  )}%20resmi%20dari%20PT%20Pro%20Teknologi.`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">share</span>
                  <span>Share WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
