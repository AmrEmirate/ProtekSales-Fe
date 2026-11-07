"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { api } from "@/services/api";

export interface BusinessTenant {
  id: string;
  name: string;
  slug: string;
  customDomain?: string | null;
  posUrl: string;
  logoUrl?: string | null;
  plan: string;
  planName?: string;
  planDescription?: string;
  status: "ACTIVE" | "SUSPENDED" | "REVIEW";
  ownerName: string;
  ownerEmail?: string;
  ownerPhone: string;
  maxOutlets: number;
  usedOutlets: number;
  pricePerOutlet: number;
  monthlyBill: number;
  activePosCount: number;
  monthlyGmv: number;
  lastHeartbeat: string;
  createdAt: string;
  cluster: string;
  licenseId?: string;
  outlets?: any[];
  bank?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  } | null;
}

export const OFFICIAL_POS_PACKAGES = [
  {
    code: "PAKET_50K",
    name: "Paket 1: 50K (100 Tx/hr)",
    fullLabel: "Paket 1: 50K — Rp 50.000/Cabang (100 Tx/Hari - 3.000 Tx/Bln)",
    price: 50000,
    dailyTxLimit: 100,
    monthlyTxLimit: 3000,
    badgeClass: "bg-emerald-900/40 text-emerald-300 border-emerald-500/40",
  },
  {
    code: "PAKET_100K",
    name: "Paket 2: 100K (200 Tx/hr)",
    fullLabel: "Paket 2: 100K — Rp 100.000/Cabang (200 Tx/Hari - 6.000 Tx/Bln)",
    price: 100000,
    dailyTxLimit: 200,
    monthlyTxLimit: 6000,
    badgeClass: "bg-teal-900/40 text-teal-300 border-teal-500/40",
  },
  {
    code: "PAKET_150K",
    name: "Paket 3: 150K (300 Tx/hr)",
    fullLabel: "Paket 3: 150K — Rp 150.000/Cabang (300 Tx/Hari - 9.000 Tx/Bln)",
    price: 150000,
    dailyTxLimit: 300,
    monthlyTxLimit: 9000,
    badgeClass: "bg-blue-900/40 text-blue-300 border-blue-500/40",
  },
  {
    code: "PAKET_200K",
    name: "Paket 4: 200K (500 Tx/hr)",
    fullLabel: "Paket 4: 200K — Rp 200.000/Cabang (500 Tx/Hari - 15.000 Tx/Bln)",
    price: 200000,
    dailyTxLimit: 500,
    monthlyTxLimit: 15000,
    badgeClass: "bg-amber-900/40 text-amber-300 border-amber-500/40",
  },
  {
    code: "PAKET_CUSTOM",
    name: "Paket 5: Custom",
    fullLabel: "Paket 5: Custom — Hubungi Kami (Skala Besar / Kuota Khusus)",
    price: 0,
    dailyTxLimit: 0,
    monthlyTxLimit: 0,
    badgeClass: "bg-purple-900/40 text-purple-300 border-purple-500/40",
  },
];

export function resolveOfficialPlan(planOrPrice?: string | number) {
  const upper = String(planOrPrice || "").toUpperCase();
  const byCode = OFFICIAL_POS_PACKAGES.find((p) => p.code === upper);
  if (byCode) return byCode;
  if (upper.includes("250") || upper.includes("UNLIMITED") || upper.includes("ENTERPRISE")) return OFFICIAL_POS_PACKAGES[4];
  const num = Number(planOrPrice);
  if (!isNaN(num) && num > 0) {
    if (num <= 50000) return OFFICIAL_POS_PACKAGES[0];
    if (num <= 100000) return OFFICIAL_POS_PACKAGES[1];
    if (num <= 150000) return OFFICIAL_POS_PACKAGES[2];
    if (num <= 200000) return OFFICIAL_POS_PACKAGES[3];
    return OFFICIAL_POS_PACKAGES[4];
  }
  return OFFICIAL_POS_PACKAGES[0];
}

export default function BusinessCommandCenterPage() {
  // State
  const [tenants, setTenants] = useState<BusinessTenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"ALL" | "ACTIVE" | "REVIEW" | "SUSPENDED">("ALL");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<BusinessTenant | null>(null);

  // Add Form State
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPlan, setFormPlan] = useState<string>("PAKET_100K");
  const [formMaxOutlets, setFormMaxOutlets] = useState("4");
  const [formPricePerOutlet, setFormPricePerOutlet] = useState("100000");
  const [formCustomDomain, setFormCustomDomain] = useState("");
  const [formCity, setFormCity] = useState("Bandung");
  const [formAddress, setFormAddress] = useState("Jakarta 124");

  // Edit Form State
  const [editMaxOutlets, setEditMaxOutlets] = useState("4");
  const [editPricePerOutlet, setEditPricePerOutlet] = useState("100000");
  const [editPlan, setEditPlan] = useState<string>("PAKET_100K");
  const [editCustomDomain, setEditCustomDomain] = useState("");

  // Telemetry Metrics
  const [telemetry, setTelemetry] = useState({
    status: "HEALTHY",
    uptimeSeconds: 98420,
    dbLatencyMs: 1,
    cluster: "Server VPS Vimtk • Production Node",
    memoryRssMb: 142,
    onlinePosCount: 3,
  });

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch / Sync real tenants from Cloud POS Database directly
  const fetchTenants = useCallback(async () => {
    setIsLoading(true);
    try {
      const [health, analytics, cloudData] = await Promise.all([
        api.getCloudPosHealth().catch(() => null),
        api.getCloudPosAnalytics().catch(() => null),
        api.getCloudPosTenants().catch(() => null),
      ]);

      if (health) {
        setTelemetry((prev) => ({
          ...prev,
          status: health.online ? "HEALTHY" : "DEGRADED",
          dbLatencyMs: health.latencyMs || 1,
        }));
      }

      if (analytics) {
        setTelemetry((prev) => ({
          ...prev,
          onlinePosCount: analytics.totalUsers || analytics.totalOutlets || prev.onlinePosCount,
        }));
      }

      if (cloudData?.tenants && Array.isArray(cloudData.tenants)) {
        const mappedList: BusinessTenant[] = cloudData.tenants
          .filter((ct: any) => ct.slug !== "demo" && ct.id !== "tenant-demo-protek")
          .map((ct: any) => {
            const mainOutlet = ct.mainOutlet || (Array.isArray(ct.outlets) ? ct.outlets[0] : null);
            const domainUrl = ct.customDomain
              ? `https://${ct.customDomain}`
              : `https://${ct.slug}.vimtk.cloud`;

            const locCluster = ct.cluster || (mainOutlet ? `${mainOutlet.city || ''} (${mainOutlet.address || ''})` : 'Pusat');

            const resolvedPkg = resolveOfficialPlan(ct.plan || ct.pricePerOutlet);
            const usedCount = Number(ct.usedOutlets || ct.outletsCount) || 4;
            const maxCount = Number(ct.maxOutlets) || usedCount || 4;
            const unitPrice = Number(ct.pricePerOutlet) || resolvedPkg.price || 100000;
            const billableCount = Math.max(1, usedCount || maxCount);

            return {
              id: ct.id || `tnt-${ct.slug}`,
              name: ct.name,
              slug: ct.slug,
              customDomain: ct.customDomain || null,
              posUrl: domainUrl,
              logoUrl: ct.logoUrl || null,
              plan: resolvedPkg.code,
              planName: ct.planName || resolvedPkg.name,
              planDescription: ct.planDescription,
              status: ct.status === "ACTIVE" ? "ACTIVE" : "SUSPENDED",
              ownerName: ct.ownerName || "Owner Toko",
              ownerEmail: ct.ownerEmail || `${ct.slug}@vimtk.cloud`,
              ownerPhone: ct.ownerPhone || mainOutlet?.phone || "-",
              maxOutlets: maxCount,
              usedOutlets: usedCount,
              pricePerOutlet: unitPrice,
              monthlyBill: Number(ct.monthlyBill) || unitPrice * billableCount,
              activePosCount: Number(ct.activePosCount || ct.usersCount) || 1,
              monthlyGmv: Number(ct.totalGmv) || 0,
              lastHeartbeat: ct.lastOrderAt ? "Ada Transaksi" : "Live Cloud POS",
              createdAt: ct.createdAt ? String(ct.createdAt).split("T")[0] : new Date().toISOString().split("T")[0],
              cluster: locCluster,
              licenseId: ct.licenseId || ct.protekOutlet?.licenseId || ct.licenseKey,
              outlets: ct.outlets || [],
              bank: ct.bank || null,
            };
          });

        setTenants(mappedList);
      } else {
        setTenants([]);
      }
    } catch (err: any) {
      console.error("[Fetch Tenants Error]", err);
      showToast("Gagal mengambil data tenant dari database.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  // Sync Cloud POS action
  const handleSyncCloudPos = async () => {
    setIsSyncing(true);
    try {
      const res = await api.syncCloudPosTenants();
      showToast(res.message || "Sinkronisasi Cloud POS selesai. Data database diperbarui!", "success");
      await fetchTenants();
    } catch (err: any) {
      showToast(err.message || "Gagal menghubungi Cloud POS Hub.", "info");
    } finally {
      setIsSyncing(false);
    }
  };

  // Create new tenant directly in DB
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) {
      showToast("Nama bisnis dan slug wajib diisi!", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.createCloudPosTenant({
        name: formName.trim(),
        slug: formSlug.trim(),
        customDomain: formCustomDomain.trim() || undefined,
        plan: formPlan,
        maxOutlets: parseInt(formMaxOutlets, 10) || 5,
        pricePerOutlet: parseInt(formPricePerOutlet, 10) || 100000,
        ownerEmail: formEmail.trim(),
        ownerPhone: formPhone.trim(),
        ownerName: formName.trim() + " Owner",
        city: formCity.trim(),
        address: formAddress.trim(),
      });

      showToast(res.message || `Bisnis "${formName}" berhasil dibuat di database!`, "success");
      setIsAddModalOpen(false);
      setFormName("");
      setFormSlug("");
      setFormEmail("");
      setFormPhone("");
      setFormCustomDomain("");
      await fetchTenants();
    } catch (err: any) {
      showToast(err.message || "Gagal membuat tenant di database.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Status (Suspend / Activate) dengan Sinkronisasi Database
  const handleToggleStatus = async (tenant: BusinessTenant) => {
    const nextStatus: "ACTIVE" | "SUSPENDED" = tenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await api.updateCloudPosTenant(tenant.id, {
        status: nextStatus,
      });
      showToast(
        nextStatus === "ACTIVE"
          ? `Bisnis ${tenant.name} berhasil diaktifkan kembali di database!`
          : `Bisnis ${tenant.name} berhasil disuspend (Killswitch aktif di database).`,
        nextStatus === "ACTIVE" ? "success" : "info"
      );
      if (selectedTenant && selectedTenant.id === tenant.id) {
        setSelectedTenant({ ...selectedTenant, status: nextStatus });
      }
      await fetchTenants();
    } catch (err: any) {
      showToast(err.message || "Gagal memperbarui status tenant di database.", "error");
    }
  };

  // Save Edit Quota & Plan in DB
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    setIsSubmitting(true);
    try {
      const maxO = parseInt(editMaxOutlets, 10) || selectedTenant.maxOutlets;
      const priceO = parseInt(editPricePerOutlet, 10) || selectedTenant.pricePerOutlet;

      const res = await api.updateCloudPosTenant(selectedTenant.id, {
        plan: editPlan,
        maxOutlets: maxO,
        pricePerOutlet: priceO,
        customDomain: editCustomDomain.trim() || undefined,
      });

      showToast(res.message || `Paket & Kuota ${selectedTenant.name} berhasil diperbarui di database!`, "success");
      setIsEditModalOpen(false);
      await fetchTenants();
    } catch (err: any) {
      showToast(err.message || "Gagal memperbarui kuota tenant di database.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete / Suspend Tenant
  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm("Apakah Anda yakin ingin menonaktifkan bisnis ini dari Command Center?")) return;
    try {
      const res = await api.deleteCloudPosTenant(tenantId);
      showToast(res.message || "Bisnis berhasil dinonaktifkan di database.", "info");
      setIsDetailModalOpen(false);
      setSelectedTenant(null);
      await fetchTenants();
    } catch (err: any) {
      showToast(err.message || "Gagal menonaktifkan tenant di database.", "error");
    }
  };

  // Filtered List
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      // Tab filter
      if (selectedTab === "ACTIVE" && t.status !== "ACTIVE") return false;
      if (selectedTab === "SUSPENDED" && t.status !== "SUSPENDED") return false;
      if (selectedTab === "REVIEW" && t.status !== "REVIEW" && t.usedOutlets < t.maxOutlets) return false;

      // Plan filter
      if (selectedPlanFilter !== "ALL" && t.plan !== selectedPlanFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchSlug = t.slug.toLowerCase().includes(q);
        const matchDomain = (t.customDomain || "").toLowerCase().includes(q);
        const matchOwner = t.ownerName.toLowerCase().includes(q);
        if (!matchName && !matchSlug && !matchDomain && !matchOwner) return false;
      }

      return true;
    });
  }, [tenants, selectedTab, selectedPlanFilter, searchQuery]);

  // Aggregate Platform KPIs
  const totalBusinesses = tenants.length;
  const activeBusinesses = tenants.filter((t) => t.status === "ACTIVE").length;
  const suspendedBusinesses = tenants.filter((t) => t.status === "SUSPENDED").length;
  const reviewBusinesses = tenants.filter((t) => t.status === "REVIEW" || t.usedOutlets >= t.maxOutlets).length;
  const totalOutlets = tenants.reduce((acc, t) => acc + t.usedOutlets, 0);
  const totalMaxOutlets = tenants.reduce((acc, t) => acc + t.maxOutlets, 0);
  const totalActivePos = tenants.reduce((acc, t) => acc + t.activePosCount, 0);
  const totalMonthlyGmv = tenants.reduce((acc, t) => acc + t.monthlyGmv, 0);

  return (
    <div className="min-h-screen bg-[#0B1D3A] text-white p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 ${
            toastMessage.type === "success"
              ? "bg-[#102A43] border-emerald-500 text-emerald-300"
              : toastMessage.type === "error"
              ? "bg-[#102A43] border-red-500 text-red-300"
              : "bg-[#102A43] border-[#38BDF8] text-[#38BDF8]"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toastMessage.type === "success" ? "check_circle" : "info"}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header Banner & Role Pill */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1E3E62]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#2563EB]/20 border border-[#38BDF8]/40 text-[#38BDF8] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
              <span>Executive Command Center</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1E3E62] text-slate-300">
              Role: Admin Bisnis (Superadmin)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800">
              Cluster {telemetry.cluster} • {telemetry.dbLatencyMs}ms
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Pusat Kontrol Bisnis & Multi-Tenant SaaS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Kelola seluruh merchant, alokasi kuota cabang, lisensi terminal POS, dan pemantauan GMV terpadu dari ProtekSales CRM.
          </p>
        </div>

        {/* Action Buttons Top Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleSyncCloudPos}
            disabled={isSyncing}
            className="px-3.5 py-2.5 rounded-xl bg-[#102A43] hover:bg-[#143455] border border-[#1E3E62] text-xs font-bold text-slate-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Sinkronkan data tenant dari Cloud POS API"
          >
            <span className={`material-symbols-outlined text-[16px] ${isSyncing ? "animate-spin" : ""}`}>
              sync
            </span>
            <span>{isSyncing ? "Menyinkronkan..." : "Sync POS Mesh"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold border border-[#38BDF8]/40 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_business</span>
            <span>Tambah Bisnis Baru</span>
          </button>
        </div>
      </div>

      {/* 5 Executive Top KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Total Tenants */}
        <div className="p-4 rounded-2xl bg-[#102A43] border border-[#1E3E62] flex flex-col justify-between space-y-2 hover:border-[#38BDF8]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Bisnis / Tenant
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#2563EB]/20 text-[#38BDF8] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">domain</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black font-mono tracking-tight text-white">
              {totalBusinesses}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">{activeBusinesses} Aktif</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{reviewBusinesses} Review</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Outlets */}
        <div className="p-4 rounded-2xl bg-[#102A43] border border-[#1E3E62] flex flex-col justify-between space-y-2 hover:border-[#38BDF8]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Cabang / Outlets
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">storefront</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black font-mono tracking-tight text-white">
              {totalOutlets} <span className="text-xs font-normal text-slate-400">/ {totalMaxOutlets} Kuota</span>
            </div>
            <div className="w-full bg-[#1E3E62] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalOutlets / (totalMaxOutlets || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Cloud POS Terminals */}
        <div className="p-4 rounded-2xl bg-[#102A43] border border-[#1E3E62] flex flex-col justify-between space-y-2 hover:border-[#38BDF8]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Terminal POS Kasir
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black font-mono tracking-tight text-white">
              {totalActivePos} POS
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Realtime Mesh Terhubung</span>
            </div>
          </div>
        </div>

        {/* Card 4: Platform GMV */}
        <div className="p-4 rounded-2xl bg-[#102A43] border border-[#1E3E62] flex flex-col justify-between space-y-2 hover:border-[#38BDF8]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              GMV Penjualan POS
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white truncate">
              {totalMonthlyGmv === 0
                ? "Rp 0"
                : totalMonthlyGmv >= 1000000
                ? `Rp ${(totalMonthlyGmv / 1000000).toFixed(1)} Jt`
                : `Rp ${totalMonthlyGmv.toLocaleString("id-ID")}`}
            </div>
            <div className="text-[10px] text-slate-400">
              Total omzet lintas tenant
            </div>
          </div>
        </div>

        {/* Card 5: Server Latency */}
        <div className="p-4 rounded-2xl bg-[#102A43] border border-[#1E3E62] flex flex-col justify-between space-y-2 hover:border-[#38BDF8]/40 transition-colors col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Server & Latency
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">dns</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black font-mono tracking-tight text-emerald-400">
              {telemetry.dbLatencyMs}ms
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              SLA 99.99% • RAM {telemetry.memoryRssMb}MB
            </div>
          </div>
        </div>
      </div>

      {/* Business Tenant Directory Section */}
      <div className="bg-[#102A43] rounded-3xl border border-[#1E3E62] overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6">
        {/* Controls Bar: Search, Tabs & Tier Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#0B1D3A] p-1 rounded-xl border border-[#1E3E62] overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedTab === "ALL"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua Bisnis ({totalBusinesses})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("ACTIVE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedTab === "ACTIVE"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Aktif ({activeBusinesses})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("REVIEW")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedTab === "REVIEW"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Review / Kuota ({reviewBusinesses})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("SUSPENDED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedTab === "SUSPENDED"
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Ditangguhkan ({suspendedBusinesses})
            </button>
          </div>

          {/* Search & Tier Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari bisnis, domain, slug..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <select
              value={selectedPlanFilter}
              onChange={(e) => setSelectedPlanFilter(e.target.value)}
              className="py-2 px-3 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-xs font-bold text-slate-300 focus:outline-none focus:border-[#38BDF8] cursor-pointer"
            >
              <option value="ALL">Semua Paket</option>
              {OFFICIAL_POS_PACKAGES.map((pkg) => (
                <option key={pkg.code} value={pkg.code}>
                  {pkg.name} (Rp {(pkg.price / 1000).toLocaleString("id-ID")}rb)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Directory High-Density Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#1E3E62]/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0C2036] border-b border-[#1E3E62] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Bisnis / Merchant</th>
                <th className="py-3 px-3">Paket Langganan</th>
                <th className="py-3 px-3">Kuota Cabang</th>
                <th className="py-3 px-3">Tagihan Bulanan</th>
                <th className="py-3 px-3">GMV Bulanan</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3E62]/50 font-medium">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[32px] block mb-2 opacity-50">
                      folder_off
                    </span>
                    Tidak ada tenant bisnis yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const quotaPercentage = Math.round((tenant.usedOutlets / (tenant.maxOutlets || 1)) * 100);
                  const isNearQuota = quotaPercentage >= 80;
                  const pkgInfo = resolveOfficialPlan(tenant.plan || tenant.pricePerOutlet);
                  const totalMonthlyBill = tenant.pricePerOutlet * Math.max(1, tenant.usedOutlets || tenant.maxOutlets);

                  return (
                    <tr
                      key={tenant.id}
                      className="hover:bg-[#143455]/70 transition-colors group"
                    >
                      {/* Business & Domain */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] flex items-center justify-center font-bold text-sm text-[#38BDF8] shrink-0">
                            {tenant.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white text-xs truncate max-w-[180px] sm:max-w-[240px]">
                              {tenant.name}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                              <span className="text-[#38BDF8]">{tenant.customDomain || `${tenant.slug}.vimtk.cloud`}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Plan Tier */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border w-fit ${pkgInfo.badgeClass}`}
                          >
                            {tenant.planName || pkgInfo.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Rp {tenant.pricePerOutlet.toLocaleString("id-ID")} / cabang
                          </span>
                        </div>
                      </td>

                      {/* Quota Progress */}
                      <td className="py-3 px-3">
                        <div className="space-y-1 w-36">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-mono text-white font-bold">
                              {tenant.usedOutlets} / {tenant.maxOutlets} Cabang
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400">
                              +1 Semua
                            </span>
                          </div>
                          <div className="w-full bg-[#0B1D3A] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-400"
                              style={{ width: `${Math.min(100, quotaPercentage)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {tenant.usedOutlets} cabang + 1 pantau semua
                          </span>
                        </div>
                      </td>

                      {/* Monthly Bill (Tagihan Bulanan) */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-emerald-400 text-xs">
                          Rp {totalMonthlyBill.toLocaleString("id-ID")} / bln
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {tenant.usedOutlets} cabang × Rp {(tenant.pricePerOutlet / 1000).toLocaleString("id-ID")}rb
                        </div>
                      </td>

                      {/* Monthly GMV */}
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        Rp {tenant.monthlyGmv.toLocaleString("id-ID")}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 w-fit ${
                            tenant.status === "ACTIVE"
                              ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                              : tenant.status === "REVIEW"
                              ? "bg-amber-950/60 text-amber-300 border-amber-500/30"
                              : "bg-red-950/60 text-red-300 border-red-500/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              tenant.status === "ACTIVE"
                                ? "bg-emerald-400"
                                : tenant.status === "REVIEW"
                                ? "bg-amber-400"
                                : "bg-red-400"
                            }`}
                          />
                          <span>{tenant.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Detail Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#0B1D3A] hover:bg-[#1E3E62] text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Detail & Inspektur Bisnis"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>

                          {/* Edit Quota Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setEditMaxOutlets(String(tenant.maxOutlets));
                              setEditPricePerOutlet(String(tenant.pricePerOutlet));
                              setEditPlan(tenant.plan);
                              setEditCustomDomain(tenant.customDomain || "");
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#0B1D3A] hover:bg-[#1E3E62] text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Ubah Kuota & Paket"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>

                          {/* Direct Link to Tenant POS */}
                          <a
                            href={tenant.posUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#2563EB]/20 hover:bg-[#2563EB]/40 text-[#38BDF8] transition-colors cursor-pointer"
                            title="Buka Aplikasi POS Merchant"
                          >
                            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          </a>

                          {/* Killswitch Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(tenant)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              tenant.status === "ACTIVE"
                                ? "bg-red-950/40 text-red-400 hover:bg-red-900/60"
                                : "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60"
                            }`}
                            title={tenant.status === "ACTIVE" ? "Suspend Bisnis (Killswitch)" : "Aktifkan Bisnis"}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {tenant.status === "ACTIVE" ? "power_settings_new" : "check"}
                            </span>
                          </button>
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

      {/* Modal: Tambah Bisnis Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateTenant}
            className="w-full max-w-lg bg-[#102A43] border border-[#1E3E62] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1E3E62]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#38BDF8] text-[22px]">add_business</span>
                <h3 className="font-bold text-base text-white font-display">
                  Pendaftaran Tenant Bisnis Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#0B1D3A] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Nama Bisnis / Brand *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!formSlug) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""));
                    }
                  }}
                  placeholder="Contoh: Kopi Kenangan Nusantara"
                  className="w-full p-2.5 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-white focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Slug Subdomain *
                  </label>
                  <div className="flex items-center rounded-xl bg-[#0B1D3A] border border-[#1E3E62] px-2.5">
                    <input
                      type="text"
                      required
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="kopikenangan"
                      className="w-full py-2 bg-transparent text-white focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">.vimtk.cloud</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Paket Langganan *
                  </label>
                  <select
                    value={formPlan}
                    onChange={(e) => {
                      const code = e.target.value;
                      setFormPlan(code);
                      const pkg = resolveOfficialPlan(code);
                      setFormPricePerOutlet(String(pkg.price));
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-white focus:outline-none focus:border-[#38BDF8]"
                  >
                    {OFFICIAL_POS_PACKAGES.map((pkg) => (
                      <option key={pkg.code} value={pkg.code}>
                        {pkg.fullLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Email Owner / Penanggung Jawab *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="owner@bisnis.com"
                    className="w-full p-2.5 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    WhatsApp Kontak Owner *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+62 812-xxxx-xxxx"
                    className="w-full p-2.5 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Maksimal Kuota Cabang *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formMaxOutlets}
                    onChange={(e) => setFormMaxOutlets(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-white font-mono focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Harga Langganan per Cabang (Rp) *
                  </label>
                  <input
                    type="number"
                    min="100000"
                    step="25000"
                    required
                    value={formPricePerOutlet}
                    onChange={(e) => setFormPricePerOutlet(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-white font-mono focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Custom Domain Pribadi (Opsional)
                </label>
                <input
                  type="text"
                  value={formCustomDomain}
                  onChange={(e) => setFormCustomDomain(e.target.value)}
                  placeholder="Contoh: pos.kopikenangan.co.id"
                  className="w-full p-2.5 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-white focus:outline-none focus:border-[#38BDF8]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1E3E62]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0B1D3A] text-slate-300 hover:text-white border border-[#1E3E62] text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Simpan & Aktifkan Bisnis
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Edit Paket & Kuota */}
      {isEditModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-md bg-[#102A43] border border-[#1E3E62] rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1E3E62]">
              <div>
                <h3 className="font-bold text-base text-white font-display">
                  Edit Kuota: {selectedTenant.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  ID: {selectedTenant.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#0B1D3A] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Paket Subscription
                </label>
                <select
                  value={editPlan}
                  onChange={(e) => {
                    const code = e.target.value;
                    setEditPlan(code);
                    const pkg = resolveOfficialPlan(code);
                    setEditPricePerOutlet(String(pkg.price));
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-white focus:outline-none focus:border-[#38BDF8]"
                >
                  {OFFICIAL_POS_PACKAGES.map((pkg) => (
                    <option key={pkg.code} value={pkg.code}>
                      {pkg.fullLabel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Batas Maksimal Kuota Cabang Operasional
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editMaxOutlets}
                  onChange={(e) => setEditMaxOutlets(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-white font-mono focus:outline-none focus:border-[#38BDF8]"
                />
                <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">
                  Saat ini telah menggunakan {selectedTenant.usedOutlets} cabang operasional (+ 1 akses khusus untuk melihat semua kondisi cabang).
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Harga Langganan per Cabang (Rp)
                </label>
                <input
                  type="number"
                  min="100000"
                  step="25000"
                  required
                  value={editPricePerOutlet}
                  onChange={(e) => setEditPricePerOutlet(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-white font-mono focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              {/* Ringkasan Tagihan Bulanan Otomatis */}
              <div className="p-3 rounded-xl bg-[#0B1D3A] border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Tagihan Bulanan ({parseInt(editMaxOutlets, 10) || selectedTenant.usedOutlets || 4} Cabang)
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    {parseInt(editMaxOutlets, 10) || selectedTenant.usedOutlets || 4} Cabang × Rp {(parseInt(editPricePerOutlet, 10) || 100000).toLocaleString("id-ID")} (+1 Semua Cabang Gratis)
                  </span>
                </div>
                <span className="text-sm font-black font-mono text-emerald-400">
                  Rp {((parseInt(editMaxOutlets, 10) || selectedTenant.usedOutlets || 4) * (parseInt(editPricePerOutlet, 10) || 100000)).toLocaleString("id-ID")} / bln
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Custom Domain Pribadi
                </label>
                <input
                  type="text"
                  value={editCustomDomain}
                  onChange={(e) => setEditCustomDomain(e.target.value)}
                  placeholder="Contoh: pos.dimsumintan.com"
                  className="w-full p-2.5 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-white focus:outline-none focus:border-[#38BDF8]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1E3E62]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0B1D3A] text-slate-300 hover:text-white border border-[#1E3E62] text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal / Drawer: Detail Bisnis (Deep-Dive Inspector) */}
      {isDetailModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-[#102A43] border border-[#1E3E62] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[#1E3E62]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0B1D3A] border border-[#38BDF8]/40 flex items-center justify-center text-lg font-black text-[#38BDF8]">
                  {selectedTenant.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white font-display">
                    {selectedTenant.name}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="font-mono text-[#38BDF8]">{selectedTenant.slug}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{selectedTenant.status}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#0B1D3A] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#0B1D3A] border border-[#1E3E62]">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Kuota Cabang</span>
                <span className="text-base font-black font-mono text-white">
                  {selectedTenant.usedOutlets} / {selectedTenant.maxOutlets} Cabang
                </span>
                <span className="text-[10px] text-emerald-400 block">+1 Akses Semua Cabang</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1D3A] border border-[#1E3E62]">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Biaya / Cabang</span>
                <span className="text-base font-black font-mono text-white">
                  Rp {selectedTenant.pricePerOutlet.toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-slate-400 block">{selectedTenant.planName || selectedTenant.plan}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tagihan Bulanan</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  Rp {(selectedTenant.pricePerOutlet * Math.max(1, selectedTenant.usedOutlets || selectedTenant.maxOutlets)).toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {selectedTenant.usedOutlets} Cabang × Rp {(selectedTenant.pricePerOutlet / 1000).toLocaleString("id-ID")}rb
                </span>
              </div>
            </div>

            {/* Metadata Detail */}
            <div className="p-3.5 rounded-2xl bg-[#0B1D3A] border border-[#1E3E62] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Pemilik Bisnis (PIC):</span>
                <span className="font-bold text-white">{selectedTenant.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email & WhatsApp:</span>
                <span className="font-mono text-slate-300">{selectedTenant.ownerEmail} • {selectedTenant.ownerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Paket Langganan:</span>
                <span className="font-bold text-emerald-400">{selectedTenant.planName || selectedTenant.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Wilayah / Cluster:</span>
                <span className="font-medium text-slate-300">{selectedTenant.cluster}</span>
              </div>
              {selectedTenant.bank?.bankName && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Rekening Bank:</span>
                  <span className="font-mono text-slate-300">
                    {selectedTenant.bank.bankName} - {selectedTenant.bank.accountNumber} ({selectedTenant.bank.accountName})
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Subdomain Sistem:</span>
                <a
                  href={selectedTenant.posUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[#38BDF8] hover:underline flex items-center gap-1"
                >
                  <span>{selectedTenant.slug}.vimtk.cloud</span>
                  <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                </a>
              </div>
              {selectedTenant.customDomain && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Custom Domain Pribadi:</span>
                  <span className="font-mono text-emerald-300 font-bold">{selectedTenant.customDomain}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Heartbeat Terakhir:</span>
                <span className="text-emerald-400 font-bold">{selectedTenant.lastHeartbeat}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1E3E62] gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleDeleteTenant(selectedTenant.id)}
                className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 text-xs font-bold cursor-pointer transition-colors"
              >
                Hapus Bisnis
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedTenant)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedTenant.status === "ACTIVE"
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {selectedTenant.status === "ACTIVE" ? "Suspend Bisnis" : "Aktifkan Bisnis"}
                </button>

                <a
                  href={selectedTenant.posUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1 shadow-md"
                >
                  <span>Buka POS Kasir</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
