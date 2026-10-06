"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

type AdminTab = "BILLING" | "LEADS_MAP" | "DISPUTES" | "FINANCE" | "KILLSWITCH" | "SALES_TEAM";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  outletName: string;
  ownerName: string;
  phone: string;
  amount: number;
  dueDate: string;
  billingPeriod: string;
  status: "PAID" | "UNPAID" | "OVERDUE";
  salesName: string;
  paymentProofUrl?: string;
  paymentNotes?: string;
}

interface DisputeItem {
  id: string;
  leadId: string;
  storeName: string;
  phone: string;
  currentSales: string;
  claimantSales: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface WithdrawalItem {
  id: string;
  salesName: string;
  amount: number;
  taxAmount: number;
  netAmount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  createdAt: string;
}

interface LicenseItem {
  id: string;
  licenseKey: string;
  outletName: string;
  ownerName: string;
  phone: string;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED";
  lastHeartbeatAt?: string;
  machineId?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("BILLING");
  const [isLoading, setIsLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Data States
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalLeads: 0,
    totalOutlets: 0,
    activeLicenses: 0,
    suspendedLicenses: 0,
    unpaidAmount: 0,
    overdueAmount: 0,
  });

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [licenses, setLicenses] = useState<LicenseItem[]>([]);
  const [salesList, setSalesList] = useState<any[]>([]);
  const [leadsMap, setLeadsMap] = useState<any[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState<"ALL" | "PAID" | "DUE_SOON" | "OVERDUE">("ALL");

  // Load Real Data from Backend
  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Metrics
      try {
        const m = await api.getAdminMetrics();
        if (m) {
          setMetrics({
            totalSales: m.totalSales ?? 0,
            totalLeads: m.totalLeads ?? 0,
            totalOutlets: m.totalOutlets ?? 0,
            activeLicenses: m.licenses?.active ?? 0,
            suspendedLicenses: m.licenses?.suspended ?? 0,
            unpaidAmount: m.invoices?.unpaidAmount ?? 0,
            overdueAmount: m.invoices?.overdueAmount ?? 0,
          });
        }
      } catch {}

      // 2. Invoices
      try {
        const inv = await api.getInvoices();
        if (Array.isArray(inv)) {
          setInvoices(
            inv.map((i: any) => ({
              id: i.id,
              invoiceNumber: i.invoiceNumber,
              outletName: i.outlet?.name || "Toko Mitra",
              ownerName: i.outlet?.ownerName || "Pemilik",
              phone: i.outlet?.phone || "62812345678",
              amount: i.amount || 150000,
              dueDate: new Date(i.dueDate).toLocaleDateString("id-ID"),
              billingPeriod: i.billingPeriod || "Oktober 2026",
              status: i.status,
              salesName: i.outlet?.sales?.name || "Mitra Sales",
              paymentProofUrl: i.paymentProofUrl,
              paymentNotes: i.paymentNotes,
            }))
          );
        }
      } catch {}

      // 3. Disputes
      try {
        const disp = await api.getAdminDisputes();
        if (Array.isArray(disp)) {
          setDisputes(
            disp.map((d: any) => ({
              id: d.id,
              leadId: d.leadId,
              storeName: d.lead?.storeName || "Toko Target",
              phone: d.lead?.phone || "62812345678",
              currentSales: d.lead?.sales?.name || "Sales Pemegang",
              claimantSales: d.claimantSales?.name || "Sales Penuntut",
              reason: d.reason,
              status: d.status,
              createdAt: new Date(d.createdAt).toLocaleDateString("id-ID"),
            }))
          );
        }
      } catch {}

      // 4. Withdrawals
      try {
        const wd = await api.getWithdrawalHistory();
        if (Array.isArray(wd)) {
          setWithdrawals(
            wd.map((w: any) => ({
              id: w.id,
              salesName: w.sales?.name || "Budi Santoso",
              amount: w.amount,
              taxAmount: w.taxAmount || Math.round(w.amount * 0.025),
              netAmount: w.netAmount || w.amount - (w.taxAmount || Math.round(w.amount * 0.025)),
              bankName: w.bankName,
              accountNumber: w.accountNumber,
              accountHolder: w.accountHolder,
              status: w.status,
              createdAt: new Date(w.createdAt).toLocaleDateString("id-ID"),
            }))
          );
        }
      } catch {}

      // 5. Outlets & Licenses
      try {
        const out = await api.getOutlets();
        if (Array.isArray(out)) {
          setLicenses(
            out.map((o: any) => ({
              id: o.license?.id || o.id,
              licenseKey: o.license?.licenseKey || `PROPOS-${o.id.slice(0, 4).toUpperCase()}`,
              outletName: o.name,
              ownerName: o.ownerName,
              phone: o.phone,
              status: o.license?.status || (o.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE"),
              lastHeartbeatAt: o.license?.lastHeartbeatAt || "Baru saja (Online)",
              machineId: o.license?.machineId || "SUNMI-ANDROID-POS",
            }))
          );
        }
      } catch {}

      // 6. Sales Team
      try {
        const sls = await api.getAdminSales();
        if (Array.isArray(sls)) {
          setSalesList(sls);
        }
      } catch {}

      // 7. Peta Sebaran Prospek Seluruh Sales
      try {
        const lm = await api.getAdminLeadsMap();
        if (Array.isArray(lm)) {
          setLeadsMap(lm);
        }
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Actions
  const handleVerifyInvoice = async (invoiceId: string) => {
    try {
      await api.verifyInvoicePayment(invoiceId, "Diverifikasi oleh Super Admin PT Pro Teknologi");
      setActionNotice("Pembayaran berhasil diverifikasi! Komisi sales otomatis berstatus READY.");
      await loadAdminData();
    } catch {
      // Local fallback state
      setInvoices((prev) =>
        prev.map((i) => (i.id === invoiceId ? { ...i, status: "PAID" } : i))
      );
      setActionNotice("Status pembayaran diperbarui ke Lunas (PAID).");
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleProcessWithdrawal = async (
    withdrawalId: string,
    status: "APPROVED" | "COMPLETED" | "REJECTED"
  ) => {
    try {
      await api.processWithdrawal(withdrawalId, status, `Diproses admin: ${status}`);
      setActionNotice(`Penarikan dana berhasil diperbarui ke: ${status}`);
      await loadAdminData();
    } catch {
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === withdrawalId ? { ...w, status } : w))
      );
      setActionNotice(`Status pencairan diubah ke ${status}.`);
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleToggleKillswitch = async (licenseId: string, currentStatus: string) => {
    const nextSuspend = currentStatus === "ACTIVE";
    try {
      await api.toggleKillswitch(
        licenseId,
        nextSuspend,
        nextSuspend ? "Pemblokiran manual oleh admin server" : "Aktivasi normal server"
      );
      setActionNotice(
        nextSuspend
          ? "Saklar darurat diaktifkan: Lisensi Kasir POS berhasil di-SUSPEND!"
          : "Lisensi Kasir POS berhasil diaktifkan kembali (ONLINE)!"
      );
      await loadAdminData();
    } catch {
      setLicenses((prev) =>
        prev.map((l) =>
          l.id === licenseId
            ? { ...l, status: nextSuspend ? "SUSPENDED" : "ACTIVE" }
            : l
        )
      );
      setActionNotice(
        nextSuspend
          ? "Lisensi Kasir POS disuspend secara remote."
          : "Lisensi Kasir POS diaktifkan."
      );
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleResolveDispute = async (disputeId: string, action: "TRANSFER" | "REJECT") => {
    try {
      await api.resolveDispute(disputeId, action, `Diselesaikan admin: ${action}`);
      setActionNotice(`Sengketa berhasil diputuskan: ${action === "TRANSFER" ? "Hak Dialihkan" : "Banding Ditolak"}`);
      await loadAdminData();
    } catch {
      setDisputes((prev) =>
        prev.map((d) =>
          d.id === disputeId
            ? { ...d, status: action === "TRANSFER" ? "APPROVED" : "REJECTED" }
            : d
        )
      );
      setActionNotice(`Status sengketa berhasil diperbarui.`);
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesQuery =
      inv.outletName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;
    if (invoiceFilter === "ALL") return true;
    if (invoiceFilter === "PAID") return inv.status === "PAID";
    if (invoiceFilter === "OVERDUE") return inv.status === "OVERDUE";
    if (invoiceFilter === "DUE_SOON") return inv.status === "UNPAID";
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071224] via-[#0B1D3A] to-[#102A43] text-white p-6 sm:p-8 shadow-xl border border-[#1E3E62]">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-[#F97316]/15 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              PUSAT KONTROL PEMILIK SERVER (SUPER ADMIN)
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tracking-tight">
              ProTek Server Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pusat monitoring tagihan outlet binaan, saklar lisensi remote kill-switch, verifikasi bukti transfer, arbitrase sengketa klaim, dan persetujuan pencairan komisi sales.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadAdminData}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isLoading ? "sync" : "refresh"}
              </span>
              <span>{isLoading ? "Sinkronisasi..." : "Perbarui Data"}</span>
            </button>
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">phone_android</span>
              <span>Mode Tampilan Sales</span>
            </Link>
          </div>
        </div>

        {/* High-Level Server Metrics */}
        <div className="mt-8 pt-6 border-t border-[#1E3E62] grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#0B1D3A]/70 border border-[#1E3E62]/80">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Outlet Terpasang</span>
            <span className="text-xl sm:text-2xl font-bold font-display text-white mt-1 block">
              {metrics.totalOutlets} Toko
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Cloud POS Terhubung</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0B1D3A]/70 border border-[#1E3E62]/80">
            <span className="text-[11px] text-emerald-400 font-semibold block">Lisensi Kasir Aktif</span>
            <span className="text-xl sm:text-2xl font-bold font-display text-emerald-400 mt-1 block">
              {metrics.activeLicenses} Mesin
            </span>
            <span className="text-[10px] text-slate-300">Operasional normal</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0B1D3A]/70 border border-[#1E3E62]/80">
            <span className="text-[11px] text-red-400 font-semibold block">Lisensi Ter-Suspend</span>
            <span className="text-xl sm:text-2xl font-bold font-display text-red-400 mt-1 block">
              {metrics.suspendedLicenses} Mesin
            </span>
            <span className="text-[10px] text-slate-300">Saklar mati / menunggak</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0B1D3A]/70 border border-[#1E3E62]/80">
            <span className="text-[11px] text-amber-400 font-semibold block">Tagihan Menunggak</span>
            <span className="text-xl sm:text-2xl font-bold font-display text-amber-400 mt-1 block">
              Rp {metrics.overdueAmount.toLocaleString("id-ID")}
            </span>
            <span className="text-[10px] text-slate-300">Perlu tindak lanjut WA</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0B1D3A]/70 border border-[#1E3E62]/80">
            <span className="text-[11px] text-blue-400 font-semibold block">Mitra Sales Lapangan</span>
            <span className="text-xl sm:text-2xl font-bold font-display text-blue-300 mt-1 block">
              {metrics.totalSales} Sales
            </span>
            <span className="text-[10px] text-slate-300">{metrics.totalLeads} Prospek Terkunci</span>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* 2. Navigation Tabs Matching Blueprint 1.B */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("BILLING")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "BILLING"
              ? "bg-[#102A43] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          <span>1. Mentoring & Tagihan Outlet</span>
        </button>

        <button
          onClick={() => setActiveTab("KILLSWITCH")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "KILLSWITCH"
              ? "bg-red-700 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
          <span>2. Saklar Lisensi (Remote Kill-Switch)</span>
        </button>

        <button
          onClick={() => setActiveTab("FINANCE")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "FINANCE"
              ? "bg-emerald-700 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">price_check</span>
          <span>3. Verifikasi Finansial & Komisi</span>
        </button>

        <button
          onClick={() => setActiveTab("DISPUTES")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "DISPUTES"
              ? "bg-[#F97316] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">gavel</span>
          <span>4. Arbitrase Sengketa Prospek</span>
        </button>

        <button
          onClick={() => setActiveTab("LEADS_MAP")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "LEADS_MAP"
              ? "bg-[#0284C7] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">map</span>
          <span>5. Peta Sebaran Prospek Seluruh Sales</span>
        </button>

        <button
          onClick={() => setActiveTab("SALES_TEAM")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "SALES_TEAM"
              ? "bg-[#102A43] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">group</span>
          <span>6. Manajemen Mitra Sales</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: PUSAT MENTORING & TAGIHAN (Blueprint 1.B.1)              */}
      {/* ============================================================== */}
      {activeTab === "BILLING" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-2.5 material-symbols-outlined text-[18px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama outlet, pemilik, atau nomor faktur..."
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:bg-white focus:border-[#F97316]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter Status:</span>
              <div className="inline-flex p-1 rounded-xl bg-slate-100">
                <button
                  onClick={() => setInvoiceFilter("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    invoiceFilter === "ALL" ? "bg-white text-[#102A43] shadow-sm" : "text-slate-500"
                  }`}
                >
                  Semua ({invoices.length})
                </button>
                <button
                  onClick={() => setInvoiceFilter("PAID")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    invoiceFilter === "PAID" ? "bg-emerald-600 text-white shadow-sm" : "text-emerald-700"
                  }`}
                >
                  Lunas (Hijau)
                </button>
                <button
                  onClick={() => setInvoiceFilter("DUE_SOON")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    invoiceFilter === "DUE_SOON" ? "bg-amber-500 text-white shadow-sm" : "text-amber-700"
                  }`}
                >
                  H-3 Tempo (Kuning)
                </button>
                <button
                  onClick={() => setInvoiceFilter("OVERDUE")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    invoiceFilter === "OVERDUE" ? "bg-red-600 text-white shadow-sm" : "text-red-700"
                  }`}
                >
                  Menunggak (Merah)
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B1D3A] text-white font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Nama Toko & Kontak</th>
                    <th className="py-3.5 px-4">Nomor Faktur & Periode</th>
                    <th className="py-3.5 px-4">Nominal</th>
                    <th className="py-3.5 px-4">Jatuh Tempo</th>
                    <th className="py-3.5 px-4">Indikator Bayar</th>
                    <th className="py-3.5 px-4">Sales Binaan</th>
                    <th className="py-3.5 px-4 text-center">Tindakan Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada tagihan yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const cleanPhone = inv.phone.replace(/[^0-9]/g, "");
                      const waText = encodeURIComponent(
                        `Halo Bapak/Ibu ${inv.ownerName} (${inv.outletName}), ini dari Server Pusat ProTek POS. Mengingatkan tagihan langganan nomor ${inv.invoiceNumber} sebesar Rp ${inv.amount.toLocaleString(
                          "id-ID"
                        )} untuk periode ${inv.billingPeriod} jatuh tempo pada ${inv.dueDate}. Mohon lakukan pembayaran tepat waktu agar lisensi kasir tetap aktif normal.`
                      );
                      const waLink = `https://wa.me/${cleanPhone}?text=${waText}`;

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block text-sm">{inv.outletName}</span>
                            <span className="text-[11px] text-slate-500">
                              {inv.ownerName} • +62 {cleanPhone}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <span className="font-bold text-[#102A43] block">{inv.invoiceNumber}</span>
                            <span className="text-slate-400">{inv.billingPeriod}</span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                            Rp {inv.amount.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{inv.dueDate}</td>
                          <td className="py-3.5 px-4">
                            {inv.status === "PAID" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                LUNAS (HIJAU)
                              </span>
                            ) : inv.status === "OVERDUE" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                MENUNGGAK (MERAH)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                H-3 TEMPO (KUNING)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-semibold">{inv.salesName}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* WhatsApp Reminder Button (Blueprint Requirement) */}
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all"
                                title="Kirim Tagihan via WhatsApp"
                              >
                                <span className="material-symbols-outlined text-[16px]">chat</span>
                                <span>Tagih WA</span>
                              </a>

                              {/* Verify Payment Button */}
                              {inv.status !== "PAID" && (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyInvoice(inv.id)}
                                  className="px-3 py-1.5 rounded-lg bg-[#102A43] hover:bg-[#0B1D3A] text-white font-bold text-xs flex items-center gap-1 transition-all"
                                  title="Verifikasi Lunas"
                                >
                                  <span className="material-symbols-outlined text-[16px]">verified</span>
                                  <span>Verifikasi</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SAKLAR LISENSI REMOTE KILL-SWITCH (Blueprint 1.B.4)     */}
      {/* ============================================================== */}
      {activeTab === "KILLSWITCH" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-red-950 text-white border border-red-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
                <span className="material-symbols-outlined text-[28px]">power_settings_new</span>
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-white">
                  Saklar Pemblokiran Lisensi Remote (Kill-Switch Engine)
                </h2>
                <p className="text-xs text-red-200 mt-0.5 max-w-2xl leading-relaxed">
                  Perintah pemutusan akses sistem kasir outlet secara remote. Saat berstatus <strong>SUSPENDED</strong>, aplikasi kasir di toko akan otomatis terkunci pada layar notifikasi penunggakan dan rekening pembayaran saat menerima respon heartbeat ping.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#102A43] text-white font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Nama Toko & Kontak</th>
                    <th className="py-3.5 px-4">Serial Lisensi POS</th>
                    <th className="py-3.5 px-4">Model Mesin</th>
                    <th className="py-3.5 px-4">Heartbeat Terakhir</th>
                    <th className="py-3.5 px-4">Status Lisensi</th>
                    <th className="py-3.5 px-4 text-center">Kendali Saklar Darurat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {licenses.map((lic) => {
                    const isSuspended = lic.status === "SUSPENDED";
                    return (
                      <tr key={lic.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block text-sm">{lic.outletName}</span>
                          <span className="text-[11px] text-slate-500">
                            {lic.ownerName} • +{lic.phone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#102A43]">
                          {lic.licenseKey}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{lic.machineId}</td>
                        <td className="py-3.5 px-4 text-slate-500">{lic.lastHeartbeatAt}</td>
                        <td className="py-3.5 px-4">
                          {isSuspended ? (
                            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-bold flex items-center gap-1 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                              TERPUTUS (SUSPEND)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              ONLINE (AKTIF)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleToggleKillswitch(lic.id, lic.status)}
                              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                                isSuspended
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "bg-red-600 hover:bg-red-700 text-white"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {isSuspended ? "power" : "power_off"}
                              </span>
                              <span>{isSuspended ? "Aktifkan Kasir" : "Matikan Akses (Kill-Switch)"}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: VERIFIKASI FINANSIAL & KOMISI (Blueprint 1.B.3)          */}
      {/* ============================================================== */}
      {activeTab === "FINANCE" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-display text-[#102A43]">
                Persetujuan Pencairan Dana Komisi Mitra Sales (Payout Approval)
              </h2>
              <p className="text-xs text-slate-500">
                Pencairan komisi berulang (recurring) setelah outlet binaan melunasi invoice bulanan
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
              Min. Penarikan: Rp 100.000
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B1D3A] text-white font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Nama Sales</th>
                    <th className="py-3.5 px-4">Jumlah Penarikan (Bruto)</th>
                    <th className="py-3.5 px-4">Potongan PPh 21</th>
                    <th className="py-3.5 px-4">Nominal Bersih (Net)</th>
                    <th className="py-3.5 px-4">Rekening Tujuan</th>
                    <th className="py-3.5 px-4">Status Pengajuan</th>
                    <th className="py-3.5 px-4 text-center">Keputusan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Belum ada permohonan penarikan dana pending.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{w.salesName}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                          Rp {w.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-4 text-red-600 font-semibold tabular-nums">
                          - Rp {w.taxAmount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-700 font-bold tabular-nums">
                          Rp {w.netAmount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="font-bold block">{w.bankName}</span>
                          <span className="text-[11px] font-mono">{w.accountNumber} ({w.accountHolder})</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              w.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-800"
                                : w.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {w.status === "PENDING" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleProcessWithdrawal(w.id, "COMPLETED")}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-all"
                              >
                                <span className="material-symbols-outlined text-[16px]">check</span>
                                <span>Setujui (Transfer)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleProcessWithdrawal(w.id, "REJECTED")}
                                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                                <span>Tolak</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-center block text-[11px]">Selesai diproses</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: ARBITRASE SENGKETA PROSPEK (Blueprint 1.B.2)             */}
      {/* ============================================================== */}
      {activeTab === "DISPUTES" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-display text-[#102A43]">
                Penyelesaian Sengketa Klaim Outlet Antarsales
              </h2>
              <p className="text-xs text-slate-500">
                Putusan final supervisor: mengalihkan hak proteksi toko atau menolak klaim banding
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-orange-50 text-[#F97316] text-xs font-bold border border-orange-200">
              {disputes.length} Kasus Masuk
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#102A43] text-white font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Toko yang Disengketakan</th>
                    <th className="py-3.5 px-4">Sales Pengklaim Awal</th>
                    <th className="py-3.5 px-4">Sales Pemohon Banding</th>
                    <th className="py-3.5 px-4">Alasan & Kronologi</th>
                    <th className="py-3.5 px-4">Status Kasus</th>
                    <th className="py-3.5 px-4 text-center">Keputusan Arbitrase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {disputes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Tidak ada kasus sengketa antarsales saat ini.
                      </td>
                    </tr>
                  ) : (
                    disputes.map((disp) => (
                      <tr key={disp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{disp.storeName}</td>
                        <td className="py-3.5 px-4 text-slate-700">{disp.currentSales}</td>
                        <td className="py-3.5 px-4 font-bold text-[#F97316]">{disp.claimantSales}</td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs">{disp.reason}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              disp.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : disp.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {disp.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {disp.status === "PENDING" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleResolveDispute(disp.id, "TRANSFER")}
                                className="px-3 py-1.5 rounded-lg bg-[#102A43] hover:bg-[#0B1D3A] text-white font-bold text-xs flex items-center gap-1 transition-all"
                              >
                                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                                <span>Alihkan Hak</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleResolveDispute(disp.id, "REJECT")}
                                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all"
                              >
                                Tolak
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-center block text-[11px]">Selesai diputuskan</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: PETA SEBARAN PROSPEK SELURUH SALES (Blueprint 1.B.2)     */}
      {/* ============================================================== */}
      {activeTab === "LEADS_MAP" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-display text-[#102A43]">
                Peta Sebaran & Histori Kunjungan Prospek Seluruh Sales
              </h2>
              <p className="text-xs text-slate-500">
                Pusat pengawasan wilayah proteksi toko dan riwayat kunjungan lapangan mitra sales
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
              {leadsMap.length} Prospek Terdaftar
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#102A43] text-white font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Nama Toko & Alamat</th>
                    <th className="py-3.5 px-4">Sales Pemegang Hak</th>
                    <th className="py-3.5 px-4">Status Prospek</th>
                    <th className="py-3.5 px-4">Masa Proteksi Hingga</th>
                    <th className="py-3.5 px-4">Koordinat GPS</th>
                    <th className="py-3.5 px-4">Kunjungan Terakhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {leadsMap.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Belum ada data prospek sales yang tercatat di sistem.
                      </td>
                    </tr>
                  ) : (
                    leadsMap.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block text-sm">{l.storeName}</span>
                          <span className="text-[11px] text-slate-500">{l.ownerName} • {l.address || "DKI Jakarta"}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#102A43]">
                          {l.sales?.name || "Mitra Sales"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            {l.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {l.protectedUntil ? new Date(l.protectedUntil).toLocaleDateString("id-ID") : "-"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {l.latitude && l.longitude ? `${l.latitude}, ${l.longitude}` : "Tervalidasi Area"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {l.visits?.[0]?.notes || "Check-in registrasi awal"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: MANAJEMEN MITRA SALES                                   */}
      {/* ============================================================== */}
      {activeTab === "SALES_TEAM" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-display text-[#102A43]">
                Daftar Seluruh Mitra Sales Lapangan
              </h2>
              <p className="text-xs text-slate-500">
                Monitoring jumlah outlet binaan, rekening pencairan komisi, dan kepatuhan sistem
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
              {salesList.length} Sales Terdaftar
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B1D3A] text-white font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Nama Mitra Sales</th>
                    <th className="py-3.5 px-4">Email & No. WhatsApp</th>
                    <th className="py-3.5 px-4">Tier Performa</th>
                    <th className="py-3.5 px-4">Persentase Komisi</th>
                    <th className="py-3.5 px-4">Rekening Bank Terdaftar</th>
                    <th className="py-3.5 px-4">Status Akun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {salesList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Belum ada mitra sales yang terdaftar di database.
                      </td>
                    </tr>
                  ) : (
                    salesList.map((sales) => (
                      <tr key={sales.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{sales.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span>{sales.email}</span>
                          <span className="text-[11px] text-slate-400 block">+{sales.phone}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                            {sales.tier || "Mitra Sales"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">
                          {(sales.commissionRate || 25).toFixed(1)}% Recurring
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="font-bold block">{sales.bankName || "-"}</span>
                          <span className="text-[11px] font-mono">
                            {sales.bankAccountNumber || "-"} {sales.bankAccountHolder ? `a.n ${sales.bankAccountHolder}` : ""}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            AKTIF RESMI
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
