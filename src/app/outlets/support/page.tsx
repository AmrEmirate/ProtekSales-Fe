"use client";

import React, { useState } from "react";
import Link from "next/link";

interface SupportTicket {
  id: string;
  outletName: string;
  issue: string;
  category: "ACCOUNT_ACCESS" | "BRANCH_QUOTA" | "PAYMENT_GATEWAY";
  priority: "NORMAL" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  date: string;
  courierNotes?: string;
}

export default function SupportTicketsPage() {
  const [outletName, setOutletName] = useState("");
  const [category, setCategory] = useState<"ACCOUNT_ACCESS" | "BRANCH_QUOTA" | "PAYMENT_GATEWAY">("ACCOUNT_ACCESS");
  const [priority, setPriority] = useState<"NORMAL" | "URGENT">("NORMAL");
  const [issueDesc, setIssueDesc] = useState("");
  const [createdNotice, setCreatedNotice] = useState(false);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: SupportTicket = {
      id: `TCK-${Math.floor(8800 + Math.random() * 1000)}`,
      outletName,
      issue: issueDesc,
      category,
      priority,
      status: "OPEN",
      date: "Baru saja",
      courierNotes: "Tiket telah diteruskan ke tim teknis Cloud POS HQ.",
    };

    setTickets([newTicket, ...tickets]);
    setCreatedNotice(true);
    setTimeout(() => setCreatedNotice(false), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <Link href="/outlets" className="hover:text-[#F97316]">Outlets</Link>
            <span>/</span>
            <span className="text-[#102A43]">Bantuan Teknis Cloud POS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Tiket Bantuan Teknis Sistem &amp; Akun Cloud POS
          </h1>
          <p className="text-xs text-slate-500">
            Bantuan kendala akun login kasir, penyesuaian kuota cabang, dan integrasi QRIS / Payment Gateway
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-blue-50 text-[#0284C7] text-xs font-bold border border-blue-200">
            SLA Respon Teknis: Maks. 2 Jam Kerja
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Form Request */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-[#102A43] font-display">
              Buat Tiket Bantuan Teknis
            </h2>
            <p className="text-xs text-slate-500">Kirim langsung ke tim support teknis pusat</p>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">Outlet / Toko Sasaran</label>
              <input
                type="text"
                required
                placeholder="Nama toko / cabang..."
                value={outletName}
                onChange={(e) => setOutletName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">Kategori Bantuan</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] outline-none"
              >
                <option value="ACCOUNT_ACCESS">Kendala Login / Akun Kasir &amp; Reset Password</option>
                <option value="BRANCH_QUOTA">Penambahan Kuota Cabang / Upgrade Paket</option>
                <option value="PAYMENT_GATEWAY">Integrasi QRIS / Payment Gateway &amp; Printer Bluetooth HP</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">Tingkat Prioritas</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority("NORMAL")}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    priority === "NORMAL"
                      ? "bg-[#102A43] text-white border-[#102A43]"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  Reguler (1-2 Hari)
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("URGENT")}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    priority === "URGENT"
                      ? "bg-red-600 text-white border-red-600 animate-pulse"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  Mendesak / Darurat
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">Keterangan Tambahan</label>
              <textarea
                rows={3}
                required
                value={issueDesc}
                onChange={(e) => setIssueDesc(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-medium text-[#102A43] outline-none"
              />
            </div>

            {createdNotice && (
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-400 text-xs font-bold animate-in fade-in flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-700">verified</span>
                <span>Tiket bantuan berhasil diajukan. Driver armada logistik telah dialokasikan.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Kirim Tiket Suplai & Dukungan</span>
            </button>
          </form>
        </div>

        {/* Right Column (7 Cols): Active Tickets Tracking */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#102A43] font-display">
                Status Tiket Dukungan & Logistik
              </h2>
              <p className="text-xs text-slate-500">Pantau proses pengiriman & teknisi</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {tickets.length} Tiket
            </span>
          </div>

          <div className="space-y-3.5">
            {tickets.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="material-symbols-outlined text-slate-400 text-[32px]">
                  support_agent
                </span>
                <p className="text-xs font-bold text-slate-700">Belum ada tiket kendala teknis sistem</p>
                <p className="text-[11px] text-slate-400">
                  Gunakan formulir di samping untuk mengajukan bantuan teknis akun kasir, kuota cabang, atau koneksi printer Bluetooth HP.
                </p>
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-3"
                >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">{t.id}</span>
                      <span className="text-slate-300">•</span>
                      <h3 className="text-sm font-bold text-[#102A43]">{t.outletName}</h3>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{t.issue}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === "RESOLVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : t.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800 animate-pulse"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {t.status === "RESOLVED"
                        ? "SELESAI"
                        : t.status === "IN_PROGRESS"
                        ? "DALAM PERJALANAN"
                        : "MENUNGGU PROSES"}
                    </span>
                    {t.priority === "URGENT" && (
                      <span className="text-[10px] font-bold text-red-600 inline-flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">bolt</span>
                        <span>Prioritas Tinggi</span>
                      </span>
                    )}
                  </div>
                </div>

                {t.courierNotes && (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#0284C7]">local_shipping</span>
                    <span>{t.courierNotes}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Waktu: {t.date}</span>
                  <a
                    href="https://wa.me/6281298762211"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-[#0284C7] hover:underline"
                  >
                    Hubungi Teknisi &rarr;
                  </a>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
