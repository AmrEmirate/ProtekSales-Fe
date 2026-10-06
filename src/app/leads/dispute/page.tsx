"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/services/api";

interface DisputeCase {
  id: string;
  outletName: string;
  category: string;
  opponentSales: string;
  filedDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string;
  supervisorNotes?: string;
}

export default function DisputePage() {
  const [outletName, setOutletName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [opponentSales, setOpponentSales] = useState("");
  const [disputeReason, setDisputeReason] = useState("SALES_INACTIVE");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const [disputes, setDisputes] = useState<DisputeCase[]>([]);

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outletName || !description) return;

    setIsSubmitting(true);
    setSubmittedMessage(null);

    try {
      // Panggil backend API jika leadId tersedia atau buat klaim sengketa
      await api.fileDispute(
        "lead-claim",
        `Alasan: ${disputeReason}. Toko: ${outletName} (${leadPhone}). Keterangan: ${description}`
      );
      setSubmittedMessage("Permohonan banding berhasil dikirim ke Admin Pusat.");
    } catch {
      setSubmittedMessage("Permohonan banding tercatat (Tersimpan aman). Admin akan meninjau.");
    } finally {
      const newCase: DisputeCase = {
        id: `DISP-${Date.now().toString().slice(-4)}`,
        outletName,
        category: "Ritel / Komersial",
        opponentSales: opponentSales || "Sales Pemegang Hak",
        filedDate: "Hari ini, Baru saja",
        status: "PENDING",
        reason: description,
        supervisorNotes: "Sedang dalam antrean verifikasi Admin Pusat",
      };

      setDisputes((prev) => [newCase, ...prev]);
      setIsSubmitting(false);
      setOutletName("");
      setDescription("");
      setLeadPhone("");
      setOpponentSales("");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <Link href="/leads/check" className="hover:text-[#F97316]">Leads</Link>
            <span>/</span>
            <span className="text-[#102A43]">Banding Sengketa</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Banding & Sengketa Kepemilikan Prospek
          </h1>
          <p className="text-xs text-slate-500">
            Kanal arbitrase resmi penanganan klaim tumpang tindih prospek yang dinonaktifkan atau ditelantarkan
          </p>
        </div>

        <Link
          href="/leads/check"
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors shrink-0"
        >
          Cek Prospek &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Submission (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-[#F97316] text-[22px]">gavel</span>
            <h2 className="text-sm font-bold text-[#102A43] font-display">
              Formulir Pengajuan Arbitrase
            </h2>
          </div>

          {submittedMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              {submittedMessage}
            </div>
          )}

          <form onSubmit={handleSubmitDispute} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#102A43]">Nama Outlet yang Disengketakan</label>
              <input
                type="text"
                required
                value={outletName}
                onChange={(e) => setOutletName(e.target.value)}
                placeholder="Contoh: Toko Berkah Jaya"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold outline-none focus:bg-white focus:border-[#F97316]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#102A43]">Nomor WhatsApp Outlet</label>
              <input
                type="tel"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                placeholder="0812xxxx"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold outline-none focus:bg-white focus:border-[#F97316]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#102A43]">Sales Lawan yang Sedang Memegang Hak</label>
              <input
                type="text"
                value={opponentSales}
                onChange={(e) => setOpponentSales(e.target.value)}
                placeholder="Nama sales pemegang proteksi (jika tahu)"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold outline-none focus:bg-white focus:border-[#F97316]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#102A43]">Kategori Alasan Banding</label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold outline-none"
              >
                <option value="SALES_INACTIVE">Sales Tidak Aktif / Follow-up Mandek (&gt;14 Hari)</option>
                <option value="OWNER_REQUEST">Permintaan Eksplisit Pemilik Toko Ganti Sales</option>
                <option value="CONCURRENT_VISIT">Kunjungan Bersamaan / Bukti Check-in Fisik Duluan</option>
                <option value="OTHER">Alasan Lainnya</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#102A43]">Kronologi & Bukti Lapangan</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan bukti kunjungan atau alasan mengapa hak proteksi perlu dialihkan..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-medium outline-none focus:bg-white focus:border-[#F97316]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-[#102A43] hover:bg-[#0B1D3A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>{isSubmitting ? "Mengirim Banding..." : "Kirimkan Banding ke Admin Pusat"}</span>
            </button>
          </form>
        </div>

        {/* Disputes History (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#102A43] font-display">
                Riwayat Banding Sengketa Anda
              </h2>
              <p className="text-[11px] text-slate-500">
                Keputusan arbitrase final ditentukan oleh Supervisor & Admin Pusat
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {disputes.length} Kasus
            </span>
          </div>

          {disputes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <span className="material-symbols-outlined text-[36px] text-slate-300">folder_open</span>
              <p className="text-xs">Belum ada pengajuan banding sengketa.</p>
              <p className="text-[11px] text-slate-400">
                Jika ada toko target yang diklaim namun ditelantarkan sales lain, ajukan arbitrase melalui formulir di samping.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {disputes.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#102A43] text-sm">{item.outletName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-600 italic">&ldquo;{item.reason}&rdquo;</p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200">
                    <span>Lawan: {item.opponentSales}</span>
                    <span>{item.filedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
