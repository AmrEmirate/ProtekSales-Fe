"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import { useApp } from "@/context/AppContext";

export interface BusinessTenant {
  id: string;
  name: string;
  slug: string;
  customDomain?: string | null;
  posUrl: string;
  logoUrl?: string | null;
  plan: "ENTERPRISE" | "GROWTH" | "STARTER";
  status: "ACTIVE" | "SUSPENDED" | "REVIEW";
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  maxOutlets: number;
  usedOutlets: number;
  pricePerOutlet: number;
  activePosCount: number;
  monthlyGmv: number;
  lastHeartbeat: string;
  createdAt: string;
  cluster: string;
}

export default function BusinessCommandCenterPage() {
  const { currentUserRole, switchRole } = useApp();

  // State
  const [tenants, setTenants] = useState<BusinessTenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
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
  const [formPlan, setFormPlan] = useState<"ENTERPRISE" | "GROWTH" | "STARTER">("GROWTH");
  const [formMaxOutlets, setFormMaxOutlets] = useState("5");
  const [formPricePerOutlet, setFormPricePerOutlet] = useState("350000");
  const [formCustomDomain, setFormCustomDomain] = useState("");

  // Edit Form State
  const [editMaxOutlets, setEditMaxOutlets] = useState("5");
  const [editPricePerOutlet, setEditPricePerOutlet] = useState("350000");
  const [editPlan, setEditPlan] = useState<"ENTERPRISE" | "GROWTH" | "STARTER">("GROWTH");

  // Telemetry Metrics
  const [telemetry, setTelemetry] = useState({
    status: "HEALTHY",
    uptimeSeconds: 98420,
    dbLatencyMs: 24,
    cluster: "AP-Southeast (Singapore/Jakarta Edge)",
    memoryRssMb: 142,
    onlinePosCount: 6,
  });

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Real businesses baseline (Hanya bisnis riil aktif, saat ini Dimsum Intan)
  const defaultBusinesses: BusinessTenant[] = useMemo(() => [
    {
      id: "tnt-dimsum-intan",
      name: "Dimsum Intan Resto & Food Truck",
      slug: "dimsumintan",
      customDomain: "dimsumintan.vimtk.cloud",
      posUrl: "https://dimsumintan.vimtk.cloud",
      logoUrl: "/qris.jpeg",
      plan: "GROWTH",
      status: "ACTIVE",
      ownerName: "Intan Permatasari",
      ownerEmail: "owner@dimsumintan.com",
      ownerPhone: "+62 812-4455-8899",
      maxOutlets: 5,
      usedOutlets: 3,
      pricePerOutlet: 350000,
      activePosCount: 6,
      monthlyGmv: 42800000,
      lastHeartbeat: "3 detik lalu",
      createdAt: "2026-10-15",
      cluster: "Bandung & Jabodetabek",
    },
  ], []);

  // Fetch / Sync real tenants from Cloud POS BE and persistent storage
  const fetchTenants = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Ambil telemetry live dari endpoint Cloud POS jika tersedia
      try {
        const [health, analytics] = await Promise.all([
          api.getCloudPosHealth().catch(() => null),
          api.getCloudPosAnalytics().catch(() => null),
        ]);
        if (health) {
          setTelemetry((prev) => ({
            ...prev,
            status: health.online ? "HEALTHY" : "DEGRADED",
            dbLatencyMs: health.latencyMs || prev.dbLatencyMs,
          }));
        }
        if (analytics) {
          setTelemetry((prev) => ({
            ...prev,
            onlinePosCount: analytics.totalUsers || analytics.totalOutlets || prev.onlinePosCount,
          }));
        }
      } catch {
        // Fallback live telemetry
      }

      // 2. Ambil data tenant tersimpan di localStorage atau API
      let loadedList = [...defaultBusinesses];
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("protek_business_tenants");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Hapus data dummy lama dan duplikat tidak valid dari cache browser
              const filtered = parsed.filter(
                (t: any) =>
                  !["barakahfood", "proship", "otgbracket", "tauheednews", "warungbeku", "demo", "dimsum-intan"].includes(t.slug)
              );
              if (filtered.length > 0) {
                loadedList = filtered;
                localStorage.setItem("protek_business_tenants", JSON.stringify(filtered));
              } else {
                localStorage.setItem("protek_business_tenants", JSON.stringify(defaultBusinesses));
              }
            }
          } catch {}
        }
      }

      // 3. Gabungkan dengan data sinkronisasi backend Cloud POS
      try {
        const cloudData = await api.getCloudPosTenants();
        if (cloudData?.tenants && Array.isArray(cloudData.tenants)) {
          // Sinkronisasi data real-time tenant dari Cloud POS
          cloudData.tenants.forEach((ct: any) => {
            // Abaikan demo atau data tiruan
            if (ct.slug === "demo" || ct.id === "tenant-demo-protek") return;

            const isDimsum =
              ct.slug === "dimsumintan" ||
              ct.slug === "dimsum-intan" ||
              ct.name?.toLowerCase().includes("dimsum intan");
            const targetSlug = isDimsum ? "dimsumintan" : ct.slug;

            const existingIdx = loadedList.findIndex(
              (t) => t.slug === targetSlug || t.id === ct.id
            );

            if (existingIdx >= 0) {
              loadedList[existingIdx] = {
                ...loadedList[existingIdx],
                name: isDimsum ? "Dimsum Intan Resto & Food Truck" : ct.name || loadedList[existingIdx].name,
                slug: "dimsumintan",
                customDomain: "dimsumintan.vimtk.cloud",
                posUrl: "https://dimsumintan.vimtk.cloud",
                usedOutlets: ct.outletsCount || loadedList[existingIdx].usedOutlets,
                pricePerOutlet: ct.pricePerOutlet || loadedList[existingIdx].pricePerOutlet,
                status: ct.status === "ACTIVE" ? "ACTIVE" : "SUSPENDED",
                activePosCount: ct.usersCount ? Math.max(ct.usersCount, 6) : loadedList[existingIdx].activePosCount,
                monthlyGmv: ct.totalGmv && ct.totalGmv > 0 ? ct.totalGmv : loadedList[existingIdx].monthlyGmv,
                lastHeartbeat: "Live Cloud POS",
              };
            } else if (ct.name && !isDimsum) {
              loadedList.push({
                id: ct.id || `tnt-${ct.slug}`,
                name: ct.name,
                slug: ct.slug || ct.name.toLowerCase().replace(/\s+/g, ""),
                customDomain: ct.customDomain || `${ct.slug}.vimtk.cloud`,
                posUrl: ct.customDomain ? `https://${ct.customDomain}` : `https://${ct.slug}.vimtk.cloud`,
                plan: (ct.plan as any) || "GROWTH",
                status: (ct.status as any) || "ACTIVE",
                ownerName: ct.ownerName || "Merchant Owner",
                ownerEmail: ct.ownerEmail || `${ct.slug}@merchant.id`,
                ownerPhone: ct.ownerPhone || "+62 812-0000-0000",
                maxOutlets: ct.maxOutlets || 5,
                usedOutlets: ct.outletsCount || 1,
                pricePerOutlet: ct.pricePerOutlet || 350000,
                activePosCount: ct.usersCount || ct.posCount || 2,
                monthlyGmv: ct.totalGmv || 0,
                lastHeartbeat: "Live Cloud POS",
                createdAt: ct.createdAt || new Date().toISOString().split("T")[0],
                cluster: "Nasional",
              });
            }
          });
        }
      } catch {}

      // Pastikan hasil akhir disanitasi: buang demo & dimsum-intan
      const sanitized = loadedList.filter(
        (t) =>
          !["barakahfood", "proship", "otgbracket", "tauheednews", "warungbeku", "demo", "dimsum-intan"].includes(t.slug)
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("protek_business_tenants", JSON.stringify(sanitized));
      }

      setTenants(sanitized);
    } catch {
      setTenants(defaultBusinesses);
    } finally {
      setIsLoading(false);
    }
  }, [defaultBusinesses]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const saveTenants = (updatedList: BusinessTenant[]) => {
    setTenants(updatedList);
    if (typeof window !== "undefined") {
      localStorage.setItem("protek_business_tenants", JSON.stringify(updatedList));
    }
  };

  // Sync Cloud POS action
  const handleSyncCloudPos = async () => {
    setIsSyncing(true);
    try {
      await api.syncCloudPosTenants();
      showToast("Sinkronisasi Cloud POS Mesh selesai. Data tenant diperbarui!", "success");
      await fetchTenants();
    } catch (err: any) {
      showToast(err.message || "Gagal menghubungi Cloud POS Hub. Menggunakan data tersimpan.", "info");
    } finally {
      setIsSyncing(false);
    }
  };

  // Create new tenant
  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) {
      showToast("Nama bisnis dan slug wajib diisi!", "error");
      return;
    }

    const cleanSlug = formSlug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    const maxO = parseInt(formMaxOutlets, 10) || 5;
    const priceO = parseInt(formPricePerOutlet, 10) || 350000;

    const newTenant: BusinessTenant = {
      id: `tnt-${cleanSlug}-${Date.now().toString().slice(-4)}`,
      name: formName.trim(),
      slug: cleanSlug,
      customDomain: formCustomDomain.trim() || `${cleanSlug}.vimtk.cloud`,
      posUrl: `https://${formCustomDomain.trim() || `${cleanSlug}.vimtk.cloud`}`,
      plan: formPlan,
      status: "ACTIVE",
      ownerName: formEmail.split("@")[0] || "Pemilik Bisnis",
      ownerEmail: formEmail.trim() || `${cleanSlug}@owner.com`,
      ownerPhone: formPhone.trim() || "+62 812-xxxx-xxxx",
      maxOutlets: maxO,
      usedOutlets: 1,
      pricePerOutlet: priceO,
      activePosCount: 1,
      monthlyGmv: 0,
      lastHeartbeat: "Baru dibuat",
      createdAt: new Date().toISOString().split("T")[0],
      cluster: "DKI Jakarta & Sekitarnya",
    };

    const updated = [newTenant, ...tenants];
    saveTenants(updated);
    setIsAddModalOpen(false);
    showToast(`Bisnis "${newTenant.name}" berhasil didaftarkan dan diaktifkan!`, "success");

    // Reset Form
    setFormName("");
    setFormSlug("");
    setFormEmail("");
    setFormPhone("");
    setFormCustomDomain("");
  };

  // Toggle Status (Suspend / Activate)
  const handleToggleStatus = (tenant: BusinessTenant) => {
    const nextStatus: "ACTIVE" | "SUSPENDED" = tenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const updated = tenants.map((t) => (t.id === tenant.id ? { ...t, status: nextStatus } : t));
    saveTenants(updated);
    if (selectedTenant && selectedTenant.id === tenant.id) {
      setSelectedTenant({ ...selectedTenant, status: nextStatus });
    }
    showToast(
      nextStatus === "ACTIVE"
        ? `Bisnis ${tenant.name} berhasil diaktifkan kembali!`
        : `Bisnis ${tenant.name} berhasil ditangguhkan (Killswitch aktif).`,
      nextStatus === "ACTIVE" ? "success" : "info"
    );
  };

  // Save Edit Quota
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    const maxO = parseInt(editMaxOutlets, 10) || selectedTenant.maxOutlets;
    const priceO = parseInt(editPricePerOutlet, 10) || selectedTenant.pricePerOutlet;

    const updated = tenants.map((t) =>
      t.id === selectedTenant.id
        ? {
            ...t,
            maxOutlets: maxO,
            pricePerOutlet: priceO,
            plan: editPlan,
          }
        : t
    );

    saveTenants(updated);
    setIsEditModalOpen(false);
    setSelectedTenant((prev) => (prev ? { ...prev, maxOutlets: maxO, pricePerOutlet: priceO, plan: editPlan } : null));
    showToast(`Paket & Kuota untuk ${selectedTenant.name} berhasil diperbarui!`, "success");
  };

  // Delete Tenant
  const handleDeleteTenant = (tenantId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus bisnis ini secara permanen dari Command Center?")) return;
    const updated = tenants.filter((t) => t.id !== tenantId);
    saveTenants(updated);
    setIsDetailModalOpen(false);
    setSelectedTenant(null);
    showToast("Bisnis berhasil dihapus dari direktori multi-tenant.", "info");
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
              Rp {(totalMonthlyGmv / 1000000).toFixed(1)} Jt
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
              <option value="ENTERPRISE">Enterprise</option>
              <option value="GROWTH">Growth</option>
              <option value="STARTER">Starter</option>
            </select>
          </div>
        </div>

        {/* Directory High-Density Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#1E3E62]/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0C2036] border-b border-[#1E3E62] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Bisnis / Merchant</th>
                <th className="py-3 px-3">Paket Tier</th>
                <th className="py-3 px-3">Kuota Cabang</th>
                <th className="py-3 px-3">POS Aktif</th>
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
                              <span className="text-[#38BDF8]">{tenant.slug}.vimtk.cloud</span>
                              {tenant.customDomain && tenant.customDomain !== `${tenant.slug}.vimtk.cloud` && (
                                <span className="text-slate-500">• {tenant.customDomain}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Plan Tier */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            tenant.plan === "ENTERPRISE"
                              ? "bg-purple-900/40 text-purple-300 border-purple-500/40"
                              : tenant.plan === "GROWTH"
                              ? "bg-blue-900/40 text-blue-300 border-blue-500/40"
                              : "bg-teal-900/40 text-teal-300 border-teal-500/40"
                          }`}
                        >
                          {tenant.plan}
                        </span>
                      </td>

                      {/* Quota Progress */}
                      <td className="py-3 px-3">
                        <div className="space-y-1 w-28">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-mono text-white font-bold">{tenant.usedOutlets} / {tenant.maxOutlets}</span>
                            <span className={`text-[10px] font-bold ${isNearQuota ? "text-amber-400" : "text-slate-400"}`}>
                              {quotaPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-[#0B1D3A] h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                quotaPercentage >= 100
                                  ? "bg-red-400"
                                  : isNearQuota
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                              }`}
                              style={{ width: `${Math.min(100, quotaPercentage)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Active POS Terminals */}
                      <td className="py-3 px-3 font-mono text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>{tenant.activePosCount} POS</span>
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
                    onChange={(e) => setFormPlan(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-white focus:outline-none focus:border-[#38BDF8]"
                  >
                    <option value="STARTER">Starter (Maks 2 Cabang)</option>
                    <option value="GROWTH">Growth (Maks 10 Cabang)</option>
                    <option value="ENTERPRISE">Enterprise (Multi-Cabang)</option>
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
                  onChange={(e) => setEditPlan(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-white focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="STARTER">Starter</option>
                  <option value="GROWTH">Growth</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Batas Maksimal Kuota Cabang
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editMaxOutlets}
                  onChange={(e) => setEditMaxOutlets(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] text-white font-mono focus:outline-none focus:border-[#38BDF8]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Saat ini telah menggunakan {selectedTenant.usedOutlets} cabang.
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
                  {selectedTenant.usedOutlets} / {selectedTenant.maxOutlets}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1D3A] border border-[#1E3E62]">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">POS Terhubung</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  {selectedTenant.activePosCount} Device
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1D3A] border border-[#1E3E62] col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Biaya / Cabang</span>
                <span className="text-base font-black font-mono text-white">
                  Rp {(selectedTenant.pricePerOutlet / 1000).toLocaleString("id-ID")}k
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
