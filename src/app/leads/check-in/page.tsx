"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

interface PosPreviewItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export default function CheckInPage() {
  const router = useRouter();
  const { addVisit, refreshData } = useApp();

  // Wizard Steps: 1 = Data UMKM, 2 = Referensi & Buat UI, 3 = Approve & Input Akun, 4 = Sukses
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Channel & UMKM Details
  const [salesChannel, setSalesChannel] = useState<"OFFLINE" | "ONLINE">("OFFLINE");
  const [outletName, setOutletName] = useState("");
  const [category, setCategory] = useState("Kafe & Resto");
  const [ownerName, setOwnerName] = useState("");
  const [waNumber, setWaNumber] = useState("");
  const [address, setAddress] = useState("Jl. Merdeka No. 12, Bandung");
  const [outletCount, setOutletCount] = useState<number>(1);
  const [onlineSource, setOnlineSource] = useState("WhatsApp");
  const [agreementStatus, setAgreementStatus] = useState<"AGREED" | "NOT_AGREED">("AGREED");
  const [rejectionReason, setRejectionReason] = useState("Masih memakai pembukuan manual buku");
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");

  // Anti-Collision Check
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<{
    canClaim: boolean;
    text: string;
  } | null>(null);

  // Step 2: UI Reference & Customization
  const [selectedThemePreset, setSelectedThemePreset] = useState<string>("culinary");
  const [customBrandColor, setCustomBrandColor] = useState<string>("#ea580c");
  const [posLayoutMode, setPosLayoutMode] = useState<"grid" | "list">("grid");
  const [cartItems, setCartItems] = useState<{ item: PosPreviewItem; qty: number }[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Modul & Fitur Cloud POS yang diaktifkan (Centangan Fitur Tenant)
  const [enabledModules, setEnabledModules] = useState<{
    posCashier: boolean;
    cashReconciliation: boolean;
    menuHpp: boolean;
    pettyCash: boolean;
    factoryBills: boolean;
    fixedExpenses: boolean;
    profitLoss: boolean;
    walletPayout: boolean;
    paymentGateway: boolean;
    multiBranches: boolean;
  }>({
    posCashier: true,
    cashReconciliation: true,
    menuHpp: true,
    pettyCash: true,
    factoryBills: true,
    fixedExpenses: true,
    profitLoss: true,
    walletPayout: true,
    paymentGateway: true,
    multiBranches: true,
  });

  // Step 3: Owner Credentials & Cloud POS Provisioning Setup
  const [ownerUsername, setOwnerUsername] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("PAKET_150K");

  // Step 4: Loading & Provisioned Result
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [provisionResult, setProvisionResult] = useState<{
    tenant: {
      id: string;
      name: string;
      slug: string;
      domain?: string;
      webUrl: string;
      licenseKey: string;
      plan: string;
      monthlyFee: number;
    };
    credentials: {
      username: string;
      password: string;
      loginUrl: string;
    };
    protekOutletId?: string;
  } | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // URL Params auto-fill (misal dari Cek & Kunci atau Pipeline)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const nameParam = params.get("name");
      const phoneParam = params.get("phone");
      const catParam = params.get("category");
      const channelParam = params.get("salesType");
      const countParam = params.get("outlets");

      if (nameParam) setOutletName(nameParam);
      if (phoneParam) setWaNumber(phoneParam);
      if (catParam) setCategory(catParam);
      if (channelParam === "ONLINE" || channelParam === "OFFLINE") setSalesChannel(channelParam);
      if (countParam) setOutletCount(parseInt(countParam, 10) || 1);
    }
  }, []);

  // Sinkronisasi otomatis saran subdomain dan username saat nama toko diubah
  useEffect(() => {
    if (outletName.trim()) {
      const cleanSlug = outletName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 16);
      if (!subdomain || subdomain.startsWith("toko") || subdomain === "") {
        setSubdomain(cleanSlug || "tokoumkm");
      }
      if (!ownerUsername || ownerUsername.startsWith("owner_") || ownerUsername === "") {
        setOwnerUsername(`owner_${cleanSlug || "pos"}`);
      }
    }
  }, [outletName, subdomain, ownerUsername]);

  // Set default password aman bila kosong
  useEffect(() => {
    if (!ownerPassword) {
      setOwnerPassword("KasirPro2026!");
    }
  }, [ownerPassword]);

  const categories = [
    { id: "Kafe & Resto", label: "Kafe & Resto (F&B)", icon: "restaurant", color: "#ea580c" },
    { id: "Retail / Minimarket", label: "Retail & Minimarket", icon: "store", color: "#10b981" },
    { id: "Apotek / Klinik", label: "Apotek & Klinik", icon: "local_pharmacy", color: "#0284c7" },
    { id: "Jasa & Servis", label: "Jasa & Servis", icon: "dry_cleaning", color: "#8b5cf6" },
  ];

  const uiPresets = [
    {
      id: "culinary",
      title: "Artisanal Culinary & F&B Luxe",
      industry: "Kafe, Resto & Food Truck",
      color: "#ea580c",
      description: "Grid visual menu sentuh besar, varian rasa & tingkat kepedasan, cetak struk dapur (KDS), split bill cepat.",
      recommendedFor: "Kafe & Resto",
    },
    {
      id: "retail",
      title: "Modern Barcode Mart & Fast Cashier",
      industry: "Minimarket, Sembako & Toko Grosir",
      color: "#10b981",
      description: "Input barcode scanner ultra-cepat, pencarian nama SKU instan, multi-satuan (pcs/dus), dan kasir cepat.",
      recommendedFor: "Retail / Minimarket",
    },
    {
      id: "cafe",
      title: "Executive Cafe & Dining Lounge",
      industry: "Coffee Shop, Bakery & Bistro",
      color: "#2563eb",
      description: "Desain estetik royal navy, tata kelola nomor meja makan, pesanan takeaway, QRIS dinamis di layar kasir.",
      recommendedFor: "Kafe & Resto",
    },
    {
      id: "minimalist",
      title: "Dark Minimalist Pro Terminal",
      industry: "Shift Malam & Segala Usaha",
      color: "#0ea5e9",
      description: "Mode gelap kontras tinggi, anti silau untuk shift panjang, hemat daya baterai tablet dan smartphone.",
      recommendedFor: "Jasa & Servis",
    },
  ];

  // Sampel produk kasir dinamis untuk live preview
  const isBakso = outletName.toLowerCase().includes("bakso");
  const previewProducts: PosPreviewItem[] = isBakso
    ? [
        { id: "b1", name: "Bakso Urat Jumbo", price: 25000, category: "Bakso Kuah" },
        { id: "b2", name: "Bakso Halus Spesial", price: 20000, category: "Bakso Kuah" },
        { id: "b3", name: "Bakso Telur Gurih", price: 22000, category: "Bakso Kuah" },
        { id: "b4", name: "Mie Ayam Komplit", price: 22000, category: "Mie Ayam" },
        { id: "b5", name: "Es Teh Melati", price: 5000, category: "Minuman" },
        { id: "b6", name: "Kerupuk Putih", price: 2000, category: "Ekstra" },
      ]
    : category === "Retail / Minimarket"
      ? [
          { id: "p1", name: "Minyak Goreng 2L Pouch", price: 34000, category: "Sembako" },
          { id: "p2", name: "Beras Premium 5kg", price: 72000, category: "Sembako" },
          { id: "p3", name: "Gula Pasir Kristal 1kg", price: 17500, category: "Bahan Pokok" },
          { id: "p4", name: "Kopi Instan 10 Sachet", price: 15000, category: "Minuman" },
        ]
      : category === "Apotek / Klinik"
      ? [
          { id: "p1", name: "Paracetamol 500mg Strip", price: 12000, category: "Obat Bebas" },
          { id: "p2", name: "Vitamin C 1000mg Tab", price: 45000, category: "Suplemen" },
          { id: "p3", name: "Masker Medis 3-Ply Box", price: 25000, category: "Alkes" },
          { id: "p4", name: "Minyak Telon 60ml", price: 22000, category: "Perawatan" },
        ]
      : [
          { id: "p1", name: "Dimsum Siomay Ayam (4 pcs)", price: 28000, category: "Dimsum Kukus" },
          { id: "p2", name: "Hakau Udang Kristal (3 pcs)", price: 32000, category: "Dimsum Kukus" },
          { id: "p3", name: "Pangsit Goreng Mayo", price: 26000, category: "Dimsum Goreng" },
          { id: "p4", name: "Es Teh Manis Jasmine", price: 8000, category: "Minuman" },
        ];

  const handleAddToCart = (product: PosPreviewItem) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.item.id === product.id);
      if (existing) {
        return prev.map((p) => (p.item.id === product.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { item: product, qty: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((p) => p.item.id !== productId));
  };

  const cartTotal = cartItems.reduce((acc, curr) => acc + curr.item.price * curr.qty, 0);

  const handleCheckPhone = async () => {
    if (!waNumber.trim()) return;
    setIsCheckingPhone(true);
    try {
      const data = await api.checkLeadAvailability(waNumber);
      if (data) {
        setAvailabilityMessage({
          canClaim: data.canClaim,
          text: data.message,
        });
      }
    } catch {
      setAvailabilityMessage({
        canClaim: true,
        text: "Nomor dapat didaftarkan (Pemeriksaan offline berhasil).",
      });
    } finally {
      setIsCheckingPhone(false);
    }
  };

  // Step 1: Lanjut ke Referensi Desain UI (jika UMKM Tertarik) atau Simpan Pengingat
  const handleProceedFromStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outletName.trim() || !waNumber.trim()) {
      alert("Harap lengkapi nama toko dan nomor WhatsApp!");
      return;
    }

    if (agreementStatus === "NOT_AGREED") {
      try {
        setIsProvisioning(true);
        const sanitizedPhone = waNumber.replace(/[^0-9]/g, "");
        await api.checkInLead({
          storeName: outletName,
          ownerName: ownerName || "Pemilik Usaha",
          phone: sanitizedPhone,
          address: salesChannel === "OFFLINE" ? address : `Online Outreach (${address})`,
          latitude: -6.2918,
          longitude: 106.7972,
          salesType: salesChannel,
          outletCount,
          outcome: "NOT_AGREED",
          rejectionReason,
          followUpDate,
          notes: `Kategori: ${category}. ${notes ? "Catatan: " + notes : ""}`,
        });

        addVisit({
          outletName,
          category,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          date: "Hari ini",
          distance: salesChannel === "OFFLINE" ? "12 m dari titik GPS" : "Online Outreach WA",
          status: "PENDING",
          notes: `Belum Setuju (${rejectionReason}) - Follow up ${followUpDate}`,
          coordinates: { lat: -6.2918, lng: 106.7972 },
        });

        alert(`Hasil kunjungan tersimpan di daftar prospek sebagai pengingat (Follow-up: ${followUpDate}).`);
        router.push("/leads/check");
      } catch (err: any) {
        alert(`Gagal menyimpan pengingat: ${err.message || "Periksa server"}`);
      } finally {
        setIsProvisioning(false);
      }
      return;
    }

    // Jika UMKM Tertarik (AGREED), buka Step 2: Referensi Desain UI
    setCurrentStep(2);
  };

  // Step 2 -> Step 3: Approve Desain UI & Masuk Form Kredensial
  const handleApproveDesign = () => {
    setCurrentStep(3);
  };

  // Step 3 -> Step 4: Antigravity Automated Provisioning
  const handleExecuteAntigravityProvisioning = async () => {
    if (!ownerUsername.trim()) {
      alert("Harap masukkan username untuk akun pemilik UMKM!");
      return;
    }
    if (!ownerPassword || ownerPassword.length < 6) {
      alert("Password akun minimal 6 karakter!");
      return;
    }
    if (!subdomain.trim()) {
      alert("Harap tentukan subdomain Cloud POS!");
      return;
    }

    setIsProvisioning(true);
    setProvisionError(null);

    try {
      const sanitizedPhone = waNumber.replace(/[^0-9]/g, "");
      const cleanSubdomain = subdomain
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .trim();

      // 1. Simpan check-in lead terlebih dahulu untuk mengunci proteksi prospek
      let leadIdParam: string | undefined = undefined;
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        leadIdParam = params.get("leadId") || undefined;
      }

      if (!leadIdParam) {
        try {
          const leadRes = await api.checkInLead({
            storeName: outletName,
            ownerName: ownerName || "Pemilik Usaha",
            phone: sanitizedPhone,
            address: salesChannel === "OFFLINE" ? address : `Online Outreach (${address})`,
            latitude: -6.2918,
            longitude: 106.7972,
            salesType: salesChannel,
            outletCount,
            outcome: "AGREED",
            notes: `Kategori: ${category}. Desain disetujui: ${selectedThemePreset}`,
          });
          leadIdParam = leadRes?.lead?.id;
        } catch (e) {
          // ignore duplicate lead checkin error
        }
      }

      // 2. Eksekusi Antigravity 1-Click Automated Provisioning
      const result = await api.provisionTenantFromLead({
        leadId: leadIdParam,
        storeName: outletName.trim(),
        ownerName: (ownerName || "Pemilik Usaha").trim(),
        phone: sanitizedPhone,
        address: address ? address.trim() : "Alamat Operasional",
        category,
        subdomain: cleanSubdomain,
        customDomain: `${cleanSubdomain}.vimtk.cloud`,
        planCode: selectedPlanCode,
        username: ownerUsername.trim(),
        password: ownerPassword,
        themeColor: customBrandColor,
        themeConfig: {
          storeName: outletName.trim(),
          category,
          primaryColor: customBrandColor,
          themePreset: selectedThemePreset,
          layoutMode: posLayoutMode,
          enabledModules,
        },
        outletCount,
      });

      setProvisionResult(result);
      setCurrentStep(4);
      await refreshData().catch(() => {});

      addVisit({
        outletName,
        category,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        date: "Hari ini",
        distance: salesChannel === "OFFLINE" ? "12 m (Closing Deal)" : "Online Outreach WA (Closing)",
        status: "DEAL",
        notes: `Cloud POS Berhasil Dibuat: https://${cleanSubdomain}.vimtk.cloud - Username: ${ownerUsername}`,
        coordinates: { lat: -6.2918, lng: 106.7972 },
      });
    } catch (err: any) {
      setProvisionError(err.message || "Gagal membuat sistem Cloud POS. Silakan periksa koneksi.");
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleCopyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-20 sm:pb-16 overflow-x-hidden">
      {/* ========================================================================= */}
      {/* STEP INDICATOR HEADER (Touch-Friendly Horizontal Stepper Pills)           */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-sm border border-[#E2E8F0] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-500 truncate mr-2">
            <Link href="/" className="hover:text-[#2563EB] truncate">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/leads/check" className="hover:text-[#2563EB] truncate">
              Prospek
            </Link>
            <span>/</span>
            <span className="text-[#102A43] font-bold truncate">Check-In POS</span>
          </div>

          <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-blue-50 text-[#2563EB] border border-blue-200 shrink-0">
            Engine Antigravity
          </span>
        </div>

        {/* Wizard Steps Nav (Scrollable Pills with Clear Active Indicators) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Step 1 */}
          <div
            onClick={() => currentStep > 1 && setCurrentStep(1)}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              currentStep === 1
                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm font-bold ring-2 ring-blue-500/20"
                : currentStep > 1
                ? "bg-blue-50 text-[#2563EB] border-blue-200 font-semibold"
                : "bg-slate-50 text-slate-400 border-slate-200"
            }`}
          >
            {currentStep > 1 ? (
              <span className="material-symbols-outlined text-[16px] text-[#2563EB]">check_circle</span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
            <span className="text-xs">1. Data Toko</span>
          </div>

          <span className="material-symbols-outlined text-slate-300 text-[16px] shrink-0">chevron_right</span>

          {/* Step 2 */}
          <div
            onClick={() => currentStep > 2 && setCurrentStep(2)}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shrink-0 transition-all ${
              currentStep === 2
                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm font-bold ring-2 ring-blue-500/20"
                : currentStep > 2
                ? "bg-blue-50 text-[#2563EB] border-blue-200 font-semibold cursor-pointer"
                : "bg-slate-50 text-slate-400 border-slate-200"
            }`}
          >
            {currentStep > 2 ? (
              <span className="material-symbols-outlined text-[16px] text-[#2563EB]">check_circle</span>
            ) : currentStep === 2 ? (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-300" />
            )}
            <span className="text-xs">2. Desain UI POS</span>
          </div>

          <span className="material-symbols-outlined text-slate-300 text-[16px] shrink-0">chevron_right</span>

          {/* Step 3 */}
          <div
            onClick={() => currentStep > 3 && setCurrentStep(3)}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shrink-0 transition-all ${
              currentStep === 3
                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm font-bold ring-2 ring-blue-500/20"
                : currentStep > 3
                ? "bg-blue-50 text-[#2563EB] border-blue-200 font-semibold cursor-pointer"
                : "bg-slate-50 text-slate-400 border-slate-200"
            }`}
          >
            {currentStep > 3 ? (
              <span className="material-symbols-outlined text-[16px] text-[#2563EB]">check_circle</span>
            ) : currentStep === 3 ? (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-300" />
            )}
            <span className="text-xs">3. Akun UMKM</span>
          </div>

          <span className="material-symbols-outlined text-slate-300 text-[16px] shrink-0">chevron_right</span>

          {/* Step 4 */}
          <div
            className={`min-h-[40px] px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shrink-0 transition-all ${
              currentStep === 4
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold ring-2 ring-emerald-500/20"
                : "bg-slate-50 text-slate-400 border-slate-200"
            }`}
          >
            {currentStep === 4 ? (
              <span className="material-symbols-outlined text-[16px] text-white">verified</span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-300" />
            )}
            <span className="text-xs">4. POS Live!</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAHAP 1: INPUT DATA IDENTITAS UMKM & CEK BENTROK                           */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <form onSubmit={handleProceedFromStep1} className="space-y-4 sm:space-y-6 animate-in fade-in">
          {/* Jalur Sales: Offline vs Online */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-[#2563EB] text-[22px]">route</span>
              <div>
                <h2 className="text-sm font-bold text-[#102A43]">Pilih Jalur Penjualan</h2>
                <p className="text-[11px] text-slate-500">Sesuaikan dengan model pendekatan lapangan atau digital</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => {
                  setSalesChannel("OFFLINE");
                  setOutletCount(1);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all min-h-[56px] ${
                  salesChannel === "OFFLINE"
                    ? "border-[#2563EB] bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow shrink-0 ${
                      salesChannel === "OFFLINE" ? "bg-[#2563EB]" : "bg-slate-400"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">store</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">Alur Sales Offline (Lapangan)</h3>
                    <span className="text-[11px] text-slate-500 block mt-0.5 line-clamp-1">
                      Kunjungan fisik on-site & presentasi langsung
                    </span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setSalesChannel("ONLINE");
                  if (outletCount === 1) setOutletCount(2);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all min-h-[56px] ${
                  salesChannel === "ONLINE"
                    ? "border-[#2563EB] bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow shrink-0 ${
                      salesChannel === "ONLINE" ? "bg-[#2563EB]" : "bg-slate-400"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">public</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">Alur Sales Online (Digital)</h3>
                    <span className="text-[11px] text-slate-500 block mt-0.5 line-clamp-1">
                      Prospek multi-cabang via WhatsApp & medsos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Identitas Toko & WhatsApp */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-[#2563EB] text-[20px]">storefront</span>
              <h2 className="text-sm font-bold text-[#102A43] font-display">
                Data Identitas Usaha UMKM
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#102A43]">
                  Nama Toko / Usaha UMKM <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                  placeholder="Contoh: Dimsum Intan Resto & Food Truck"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] focus:bg-white focus:border-[#2563EB] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#102A43]">
                  Nama Pemilik (Owner) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Contoh: Ibu Hj. Nurlela"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] focus:bg-white focus:border-[#2563EB] outline-none"
                />
              </div>
            </div>

            {/* Kategori Usaha */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">
                Kategori Usaha UMKM <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`min-h-[44px] p-2 sm:p-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                      category === cat.id
                        ? "bg-blue-50 border-[#2563EB] text-[#2563EB] font-bold shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                    <span className="text-xs truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp + Anti-Bentrok Check */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-[#102A43]">
                Nomor WhatsApp Pemilik (Proteksi Hak Eksklusif Sales 30 Hari) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1 flex items-center min-w-0">
                  <div className="absolute left-2.5 sm:left-3 flex items-center text-xs font-bold text-[#102A43] bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 select-none">
                    +62
                  </div>
                  <input
                    type="tel"
                    required
                    value={waNumber}
                    onChange={(e) => {
                      setWaNumber(e.target.value);
                      setAvailabilityMessage(null);
                    }}
                    placeholder="81284525304"
                    className="w-full h-11 pl-16 sm:pl-20 pr-3 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] focus:bg-white focus:border-[#2563EB] outline-none font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCheckPhone}
                  disabled={isCheckingPhone || !waNumber.trim()}
                  className="h-11 px-3 sm:px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span className="hidden sm:inline">{isCheckingPhone ? "Mengecek..." : "Cek Anti-Bentrok"}</span>
                  <span className="inline sm:hidden">{isCheckingPhone ? "..." : "Cek"}</span>
                </button>
              </div>

              {availabilityMessage && (
                <div
                  className={`p-2.5 sm:p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    availabilityMessage.canClaim
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                      : "bg-red-50 text-red-800 border border-red-300"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] shrink-0">
                    {availabilityMessage.canClaim ? "check_circle" : "error"}
                  </span>
                  <span className="leading-tight">{availabilityMessage.text}</span>
                </div>
              )}
            </div>

            {/* Alamat & Jumlah Cabang */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-[#102A43]">Alamat Operasional Toko</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jl. Merdeka No. 12, Bandung"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-medium text-[#102A43] focus:bg-white focus:border-[#2563EB] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#102A43]">Jumlah Cabang / Gerai</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={outletCount}
                  onChange={(e) => setOutletCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-bold text-center text-[#102A43] focus:bg-white focus:border-[#2563EB] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Respon & Minat UMKM */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-[#2563EB] text-[20px]">handshake</span>
              <h2 className="text-sm font-bold text-[#102A43]">Respon & Minat UMKM</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 sm:p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all min-h-[56px] ${
                  agreementStatus === "AGREED"
                    ? "bg-blue-50/70 border-[#2563EB] text-blue-950 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="agreementStatus"
                  checked={agreementStatus === "AGREED"}
                  onChange={() => setAgreementStatus("AGREED")}
                  className="mt-1 accent-[#2563EB] shrink-0"
                />
                <div>
                  <div className="text-xs font-bold text-[#2563EB] flex items-center gap-1">
                    <span>✨ UMKM Tertarik (Lihat Desain POS)</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Lanjut langsung ke katalog referensi tema, buatkan UI kasir toko, dan siapkan akun Cloud POS.
                  </div>
                </div>
              </label>

              <label
                className={`p-3.5 sm:p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all min-h-[56px] ${
                  agreementStatus === "NOT_AGREED"
                    ? "bg-amber-50 border-amber-500 text-amber-950 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="agreementStatus"
                  checked={agreementStatus === "NOT_AGREED"}
                  onChange={() => setAgreementStatus("NOT_AGREED")}
                  className="mt-1 accent-amber-600 shrink-0"
                />
                <div>
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <span>⏳ Belum Tertarik (Butuh Pikir-pikir)</span>
                  </div>
                  <div className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                    Catat tanggal follow-up pengingat di pipeline prospek agar tidak direbut sales lain.
                  </div>
                </div>
              </label>
            </div>

            {agreementStatus === "NOT_AGREED" && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-amber-950 mb-1">Alasan Belum Tertarik</label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-amber-900 outline-none"
                    >
                      <option value="Masih memakai pembukuan manual buku">Masih nyaman pembukuan manual buku</option>
                      <option value="Belum ada budget langganan bulanan">Belum ada budget langganan bulanan</option>
                      <option value="Pemilik sedang tidak di tempat / diwakili kasir">Pemilik tidak di tempat / diwakili kasir</option>
                      <option value="Menunggu keputusan rapat direksi / partner">Menunggu keputusan partner bisnis</option>
                      <option value="Masih terikat kontrak POS lain">Masih terikat kontrak POS lain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-amber-950 mb-1">Tanggal Pengingat (Follow-up)</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button Step 1 */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isProvisioning}
              className="w-full min-h-[48px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.35)] active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">
                {agreementStatus === "AGREED" ? "arrow_forward" : "save"}
              </span>
              <span>
                {agreementStatus === "AGREED"
                  ? "UMKM Tertarik: Lanjut ke Referensi Desain UI POS ➡️"
                  : "Simpan Pengingat Kunjungan (Follow-Up)"}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 2: REFERENSI DESAIN UI POS & PRATINJAU INTERAKTIF                   */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in">
          {/* Header Card Referensi */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-start sm:items-center gap-2">
                <span className="material-symbols-outlined text-[#2563EB] text-[22px] shrink-0 mt-0.5 sm:mt-0">palette</span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#102A43] font-display">
                    Katalog Referensi Desain UI POS Kasir
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Pilih konsep tema untuk <span className="font-bold text-slate-800">{outletName}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
              >
                Ubah Data Toko
              </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {uiPresets.map((preset) => {
                const isSelected = selectedThemePreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setSelectedThemePreset(preset.id);
                      setCustomBrandColor(preset.color);
                    }}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all relative min-h-[52px] ${
                      isSelected
                        ? "border-[#2563EB] bg-blue-50/30 shadow-md ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-white shadow-sm shrink-0"
                          style={{ backgroundColor: preset.color }}
                        />
                        <h3 className="text-xs font-bold text-[#102A43]">{preset.title}</h3>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[#2563EB] text-[18px] shrink-0">check_circle</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{preset.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {preset.industry}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kustomisasi Brand & Pratinjau Interaktif Layar POS Kasir (Stitch-Style Tablet Device Frame) */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2563EB] text-[20px] shrink-0">devices</span>
                <h3 className="text-xs sm:text-sm font-bold text-[#102A43]">
                  Pratinjau POS Tablet Mitra ({outletName || "Nama Toko"})
                </h3>
              </div>

              {/* Color Swatches */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500 mr-1 font-semibold">Warna Brand:</span>
                {["#ea580c", "#10b981", "#2563eb", "#e11d48", "#7c3aed", "#0f172a"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCustomBrandColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      customBrandColor === c ? "border-[#102A43] scale-110 shadow" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Live POS Device Frame (Matching Stitch Mobile/Tablet Screen Specs) */}
            <div className="rounded-2xl bg-slate-900 border-4 border-slate-800 p-2.5 sm:p-3 shadow-inner text-white transition-all overflow-hidden">
              {/* Device Status Bar */}
              <div className="flex justify-between items-center px-1 pb-2 border-b border-slate-700/60 text-[10px] text-slate-400 font-mono">
                <span className="truncate max-w-[140px] font-bold text-slate-300">
                  POS-{outletName ? outletName.slice(0, 10).toUpperCase().replace(/[^A-Z0-9]/g, "") : "DEMO"}-01
                </span>
                <span className="flex items-center gap-1 text-emerald-400 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online • QRIS Siap
                </span>
                <span className="shrink-0 hidden xs:inline">14:32 WIB</span>
              </div>

              {/* POS Brand Header */}
              <div
                className="px-3 py-2 rounded-lg mt-2 flex items-center justify-between text-white transition-colors"
                style={{ backgroundColor: customBrandColor }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[18px] shrink-0">point_of_sale</span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold leading-tight truncate">{outletName || "Cloud POS Store"}</h4>
                    <span className="text-[10px] opacity-90 truncate block">{category} &bull; Kasir Utama</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 shrink-0">
                  Shift 1 Aktif
                </span>
              </div>

              {/* Quick Menu Catalog Grid */}
              <div className="pt-3 pb-2 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
                  <span className="font-bold">Katalog Produk Menu</span>
                  <span className="text-[10px] text-slate-400">Klik item untuk tambah struk</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {previewProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleAddToCart(p)}
                      className="bg-slate-800/90 border border-slate-700 p-2.5 rounded-xl flex flex-col justify-between min-h-[76px] cursor-pointer active:scale-95 transition-transform hover:border-slate-500"
                    >
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 inline-block truncate max-w-full">
                          {p.category}
                        </span>
                        <h5 className="text-xs font-bold text-slate-100 mt-1 line-clamp-1">{p.name}</h5>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[11px] font-bold font-mono text-emerald-400">
                          Rp {p.price.toLocaleString("id-ID")}
                        </span>
                        <span
                          className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[12px] font-bold shadow-xs shrink-0"
                          style={{ backgroundColor: customBrandColor }}
                        >
                          +
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Embedded Mini Cart Sheet Preview (Never breaks mobile layout) */}
              <div className="mt-2 bg-slate-800 rounded-xl p-2.5 border border-slate-700/80 space-y-2">
                <div
                  onClick={() => cartItems.length > 0 && setIsCartDrawerOpen(!isCartDrawerOpen)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-400">shopping_bag</span>
                    <div className="leading-tight">
                      <div className="text-[11px] font-bold text-white flex items-center gap-1">
                        <span>{cartItems.reduce((acc, c) => acc + c.qty, 0)} Pesanan Terpilih</span>
                        {cartItems.length > 0 && (
                          <span className="text-[10px] text-slate-400">
                            ({isCartDrawerOpen ? "Tutup rincian ▲" : "Lihat rincian ▼"})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Total: <span className="text-emerald-400 font-bold">Rp {cartTotal.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono bg-slate-700 px-1.5 py-1 rounded text-slate-200">
                      QRIS STAND
                    </span>
                    <span
                      className="px-2 py-1 rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: customBrandColor }}
                    >
                      Bayar
                    </span>
                  </div>
                </div>

                {/* Collapsible Cart Items Drawer */}
                {isCartDrawerOpen && cartItems.length > 0 && (
                  <div className="pt-2 border-t border-slate-700 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {cartItems.map((c) => (
                      <div
                        key={c.item.id}
                        className="flex items-center justify-between text-xs bg-slate-900/80 p-2 rounded-lg border border-slate-700"
                      >
                        <div className="truncate pr-2">
                          <p className="font-semibold text-slate-100 truncate text-[11px]">{c.item.name}</p>
                          <span className="text-[10px] font-mono text-slate-400">
                            {c.qty}x @ Rp {c.item.price.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromCart(c.item.id);
                          }}
                          className="text-red-400 hover:text-red-300 text-sm px-1 shrink-0"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Checklist Fitur & Modul Cloud POS (10 Modul Standar Tenant) */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2563EB] text-[22px] shrink-0">checklist</span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#102A43]">
                    Checklist Fitur Cloud POS (10 Modul)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pilih modul untuk <span className="font-bold text-slate-800">{outletName || "toko ini"}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEnabledModules({
                    posCashier: true,
                    cashReconciliation: true,
                    menuHpp: true,
                    pettyCash: true,
                    factoryBills: true,
                    fixedExpenses: true,
                    profitLoss: true,
                    walletPayout: true,
                    paymentGateway: true,
                    multiBranches: true,
                  })
                }
                className="self-start sm:self-auto px-2.5 py-1 text-[11px] font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                Centang Semua
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {/* 1. POS Kasir */}
              <label
                className={`p-2.5 sm:p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all min-h-[48px] ${
                  enabledModules.posCashier ? "bg-blue-50/50 border-[#2563EB]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={enabledModules.posCashier}
                  onChange={(e) => setEnabledModules((prev) => ({ ...prev, posCashier: e.target.checked }))}
                  className="mt-0.5 accent-[#2563EB] w-4 h-4 rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span className="truncate">1. Kasir POS &amp; Struk</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 shrink-0 ml-1">Wajib</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                    Katalog menu, keranjang, kitchen notes &amp; cetak struk termal.
                  </div>
                </div>
              </label>

              {/* 2. Sesi Shift */}
              <label
                className={`p-2.5 sm:p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all min-h-[48px] ${
                  enabledModules.cashReconciliation ? "bg-blue-50/50 border-[#2563EB]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={enabledModules.cashReconciliation}
                  onChange={(e) => setEnabledModules((prev) => ({ ...prev, cashReconciliation: e.target.checked }))}
                  className="mt-0.5 accent-[#2563EB] w-4 h-4 rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">2. Buka/Tutup Shift Kasir</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                    Hitung fisik laci kasir &amp; rekonsiliasi selisih kas.
                  </div>
                </div>
              </label>

              {/* 3. Menu & HPP */}
              <label
                className={`p-2.5 sm:p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all min-h-[48px] ${
                  enabledModules.menuHpp ? "bg-blue-50/50 border-[#2563EB]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={enabledModules.menuHpp}
                  onChange={(e) => setEnabledModules((prev) => ({ ...prev, menuHpp: e.target.checked }))}
                  className="mt-0.5 accent-[#2563EB] w-4 h-4 rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">3. Master Menu &amp; HPP</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                    Harga modal bahan per porsi &amp; margin laba kotor %.
                  </div>
                </div>
              </label>

              {/* 4. Kas Kecil */}
              <label
                className={`p-2.5 sm:p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all min-h-[48px] ${
                  enabledModules.pettyCash ? "bg-blue-50/50 border-[#2563EB]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={enabledModules.pettyCash}
                  onChange={(e) => setEnabledModules((prev) => ({ ...prev, pettyCash: e.target.checked }))}
                  className="mt-0.5 accent-[#2563EB] w-4 h-4 rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">4. Buku Kas Kecil (Petty Cash)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                    Pengeluaran harian cabang (es batu, gas) &amp; foto nota.
                  </div>
                </div>
              </label>

              {/* 5. Tagihan Supplier */}
              <label
                className={`p-2.5 sm:p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all min-h-[48px] ${
                  enabledModules.factoryBills ? "bg-blue-50/50 border-[#2563EB]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={enabledModules.factoryBills}
                  onChange={(e) => setEnabledModules((prev) => ({ ...prev, factoryBills: e.target.checked }))}
                  className="mt-0.5 accent-[#2563EB] w-4 h-4 rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">5. Tagihan Supplier (Pabrik)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                    Faktur pasokan bahan, jatuh tempo &amp; hutang vendor.
                  </div>
                </div>
              </label>

              {/* 6. Beban Tetap */}
              <label
                className={`p-2.5 sm:p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all min-h-[48px] ${
                  enabledModules.fixedExpenses ? "bg-blue-50/50 border-[#2563EB]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={enabledModules.fixedExpenses}
                  onChange={(e) => setEnabledModules((prev) => ({ ...prev, fixedExpenses: e.target.checked }))}
                  className="mt-0.5 accent-[#2563EB] w-4 h-4 rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">6. Beban Operasional Tetap</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                    Sewa ruko, gaji karyawan, listrik PLN &amp; WiFi.
                  </div>
                </div>
              </label>

              {/* 7. Laba Rugi */}
              <label
                className={`p-2.5 sm:p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all min-h-[48px] ${
                  enabledModules.profitLoss ? "bg-blue-50/50 border-[#2563EB]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={enabledModules.profitLoss}
                  onChange={(e) => setEnabledModules((prev) => ({ ...prev, profitLoss: e.target.checked }))}
                  className="mt-0.5 accent-[#2563EB] w-4 h-4 rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">7. Laporan Laba Rugi (P&amp;L)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                    Net Revenue, HPP, Gross/Net Profit &amp; ekspor CSV/PDF.
                  </div>
                </div>
              </label>

              {/* 8. Dompet & Payout */}
              <label
                className={`p-2.5 sm:p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all min-h-[48px] ${
                  enabledModules.walletPayout ? "bg-blue-50/50 border-[#2563EB]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={enabledModules.walletPayout}
                  onChange={(e) => setEnabledModules((prev) => ({ ...prev, walletPayout: e.target.checked }))}
                  className="mt-0.5 accent-[#2563EB] w-4 h-4 rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">8. Dompet &amp; Tarik Saldo</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                    Penarikan uang QRIS langsung ke rekening bank pemilik.
                  </div>
                </div>
              </label>

              {/* 9. Payment Gateway */}
              <label
                className={`p-2.5 sm:p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all min-h-[48px] ${
                  enabledModules.paymentGateway ? "bg-blue-50/50 border-[#2563EB]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={enabledModules.paymentGateway}
                  onChange={(e) => setEnabledModules((prev) => ({ ...prev, paymentGateway: e.target.checked }))}
                  className="mt-0.5 accent-[#2563EB] w-4 h-4 rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">9. Payment Gateway (BYOK)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                    Integrasi kunci API merchant (Duitku / Midtrans) mandiri.
                  </div>
                </div>
              </label>

              {/* 10. Multi Cabang */}
              <label
                className={`p-2.5 sm:p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all min-h-[48px] ${
                  enabledModules.multiBranches ? "bg-blue-50/50 border-[#2563EB]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={enabledModules.multiBranches}
                  onChange={(e) => setEnabledModules((prev) => ({ ...prev, multiBranches: e.target.checked }))}
                  className="mt-0.5 accent-[#2563EB] w-4 h-4 rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">10. Manajemen Multi-Cabang</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                    Kontrol kuota cabang sesuai lisensi paket langganan.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Approval Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="min-h-[48px] px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition shrink-0"
            >
              ⬅️ Kembali
            </button>

            <button
              type="button"
              onClick={handleApproveDesign}
              className="flex-1 min-h-[48px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(16,185,129,0.35)] active:scale-98 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span className="truncate">✅ UMKM Setuju (Approve) & Input Akun ➡️</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 3: APPROVE & INPUT KREDENSIAL UMKM (USERNAME & PASSWORD)             */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in">
          {/* Card Setup Akun Owner */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2563EB] text-[22px] shrink-0">badge</span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#102A43] font-display">
                    Setup Akun Pemilik & Subdomain POS
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Desain disetujui oleh <span className="font-bold text-slate-800">{ownerName || "Pemilik"}</span>
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-auto px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Status: Deal Approved
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {/* Username UMKM */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#102A43]">
                  Username Akun Pemilik UMKM <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 material-symbols-outlined text-slate-400 text-[18px]">
                    account_circle
                  </span>
                  <input
                    type="text"
                    required
                    value={ownerUsername}
                    onChange={(e) => setOwnerUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="Contoh: owner_dimsumintan"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-bold text-[#102A43] focus:bg-white focus:border-[#2563EB] outline-none font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">Digunakan pemilik untuk login ke kasir.</span>
              </div>

              {/* Password UMKM */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#102A43]">
                  Password Akun Pemilik UMKM <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 material-symbols-outlined text-slate-400 text-[18px]">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-bold text-[#102A43] focus:bg-white focus:border-[#2563EB] outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 block">Password dapat dibagikan langsung via WhatsApp.</span>
              </div>
            </div>

            {/* Subdomain Cloud POS (Fixed padding and overflow) */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-bold text-[#102A43]">
                Alamat Web Subdomain Cloud POS UMKM <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center max-w-full">
                <div className="relative flex-1 flex items-center min-w-0">
                  <span className="absolute left-3 text-xs font-bold text-slate-400 select-none pointer-events-none">
                    https://
                  </span>
                  <input
                    type="text"
                    required
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="dimsumintan"
                    className="w-full h-11 pl-[66px] pr-2 rounded-l-xl bg-slate-50 border border-[#CBD5E1] text-xs font-bold text-[#102A43] focus:bg-white focus:border-[#2563EB] outline-none font-mono truncate"
                  />
                </div>
                <div className="h-11 px-3 sm:px-4 rounded-r-xl bg-slate-200 border-y border-r border-[#CBD5E1] flex items-center text-xs font-bold text-slate-700 shrink-0 select-none">
                  .vimtk.cloud
                </div>
              </div>
              <span className="text-[10px] text-slate-400 block">Domain aktif instan yang otomatis di-deploy server.</span>
            </div>

            {/* Paket Berlangganan SaaS & Hak Royalti Sales 20% Berulang */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-bold text-[#102A43]">Pilihan Paket Berlangganan POS</label>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">event_repeat</span>
                  Akumulasi Kuota Bulanan (Fleksibel)
                </span>
              </div>

              {/* Banner Penjelasan Kuota Bulanan */}
              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#2563EB] text-[18px] shrink-0 mt-0.5">info</span>
                <div className="leading-relaxed text-[11px]">
                  <strong>Akumulatif Bulanan Fleksibel:</strong> Jika hari tertentu outlet ramai dan melayani lebih dari rata-rata harian, transaksi <strong>tetap normal</strong> karena dihitung dari total jatah kuota bulanan.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Paket 50K */}
                <div
                  onClick={() => setSelectedPlanCode("PAKET_50K")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                    selectedPlanCode === "PAKET_50K"
                      ? "border-[#2563EB] bg-blue-50/50 shadow-sm ring-1 ring-blue-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-bold text-slate-500">1. Paket 50K (100 Tx/hr)</div>
                    <div className="text-base font-extrabold text-[#102A43] mt-0.5 font-mono">
                      Rp 50.000<span className="text-[10px] text-slate-400 font-normal">/bln</span>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1 leading-tight">
                      100 Tx/hari &bull; <strong>3.000 Tx/Bulan</strong>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Royalti Sales (20%):</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      +Rp 10.000/bln
                    </span>
                  </div>
                </div>

                {/* 2. Paket 100K */}
                <div
                  onClick={() => setSelectedPlanCode("PAKET_100K")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                    selectedPlanCode === "PAKET_100K"
                      ? "border-[#2563EB] bg-blue-50/50 shadow-sm ring-1 ring-blue-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-bold text-slate-500">2. Paket 100K (200 Tx/hr)</div>
                    <div className="text-base font-extrabold text-[#102A43] mt-0.5 font-mono">
                      Rp 100.000<span className="text-[10px] text-slate-400 font-normal">/bln</span>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1 leading-tight">
                      200 Tx/hari &bull; <strong>6.000 Tx/Bulan</strong>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Royalti Sales (20%):</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      +Rp 20.000/bln
                    </span>
                  </div>
                </div>

                {/* 3. Paket 150K */}
                <div
                  onClick={() => setSelectedPlanCode("PAKET_150K")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all relative flex flex-col justify-between min-h-[110px] ${
                    selectedPlanCode === "PAKET_150K"
                      ? "border-[#2563EB] bg-blue-50/50 shadow-sm ring-1 ring-blue-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#2563EB] text-white shadow-xs">
                    Paling Populer
                  </span>
                  <div>
                    <div className="text-[11px] font-bold text-[#2563EB]">3. Paket 150K (300 Tx/hr)</div>
                    <div className="text-base font-extrabold text-[#102A43] mt-0.5 font-mono">
                      Rp 150.000<span className="text-[10px] text-slate-400 font-normal">/bln</span>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1 leading-tight">
                      300 Tx/hari &bull; <strong>9.000 Tx/Bulan</strong>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-[#2563EB] font-semibold">Royalti Sales (20%):</span>
                    <span className="font-mono font-bold text-[#2563EB] bg-blue-100/60 px-1.5 py-0.5 rounded">
                      +Rp 30.000/bln
                    </span>
                  </div>
                </div>

                {/* 4. Paket 200K */}
                <div
                  onClick={() => setSelectedPlanCode("PAKET_200K")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                    selectedPlanCode === "PAKET_200K"
                      ? "border-[#2563EB] bg-blue-50/50 shadow-sm ring-1 ring-blue-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-bold text-slate-500">4. Paket 200K (500 Tx/hr)</div>
                    <div className="text-base font-extrabold text-[#102A43] mt-0.5 font-mono">
                      Rp 200.000<span className="text-[10px] text-slate-400 font-normal">/bln</span>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1 leading-tight">
                      500 Tx/hari &bull; <strong>15.000 Tx/Bulan</strong>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Royalti Sales (20%):</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      +Rp 40.000/bln
                    </span>
                  </div>
                </div>

                {/* 5. Paket Custom */}
                <div
                  onClick={() => setSelectedPlanCode("PAKET_CUSTOM")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                    selectedPlanCode === "PAKET_CUSTOM"
                      ? "border-[#2563EB] bg-blue-50/50 shadow-sm ring-1 ring-blue-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-bold text-purple-600">5. Custom Prioritas</div>
                    <div className="text-base font-extrabold text-purple-900 mt-0.5 font-mono">Hubungi Kami</div>
                    <div className="text-[10px] text-slate-600 mt-1 leading-tight">
                      Bebas Kuota &bull; <strong>Dedicated Support</strong>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-purple-700 font-semibold">Royalti Sales:</span>
                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                      20% Negosiasi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Antigravity Automation Notice Card */}
          <div className="bg-gradient-to-r from-blue-950 to-[#102A43] rounded-2xl p-4 sm:p-5 text-white space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-300 text-[22px]">auto_awesome</span>
              <h3 className="text-xs sm:text-sm font-bold font-display">Eksekusi Otomasi Antigravity</h3>
            </div>
            <p className="text-[11px] sm:text-xs text-blue-100 leading-relaxed">
              Begitu Anda menekan tombol di bawah, Antigravity akan otomatis mengeksekusi:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-blue-200">
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-400 text-[14px]">check_circle</span>
                <span>Buat Tenant Database Terisolasi</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-400 text-[14px]">check_circle</span>
                <span>Pasang Desain UI Kasir Pilihan Toko</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-400 text-[14px]">check_circle</span>
                <span>Terbitkan Akun Owner (User &amp; Pass)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-400 text-[14px]">check_circle</span>
                <span>Terbitkan Lisensi Resmi &amp; Kunci Komisi</span>
              </li>
            </ul>
          </div>

          {provisionError && (
            <div className="p-3.5 rounded-xl bg-red-100 text-red-900 border border-red-300 text-xs font-bold animate-in fade-in flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span className="leading-tight">{provisionError}</span>
            </div>
          )}

          {/* Action Buttons Step 3 */}
          <div className="flex items-center gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              disabled={isProvisioning}
              onClick={() => setCurrentStep(2)}
              className="min-h-[48px] px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition shrink-0"
            >
              ⬅️ Desain
            </button>

            <button
              type="button"
              disabled={isProvisioning}
              onClick={handleExecuteAntigravityProvisioning}
              className="flex-1 min-h-[48px] px-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(37,99,235,0.4)] active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isProvisioning ? "sync" : "rocket_launch"}
              </span>
              <span className="truncate">
                {isProvisioning
                  ? "Antigravity Sedang Membuat Cloud POS..."
                  : "🚀 Approve & Buat Sistem Cloud POS"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 4: HASIL OTOMASI SUKSES (PROVISIONING COMPLETE)                      */}
      {/* ========================================================================= */}
      {currentStep === 4 && provisionResult && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-md border border-emerald-200 space-y-5 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-[32px] sm:text-[36px]">verified</span>
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-100 text-emerald-800">
                Sistem Cloud POS Aktif di Produksi!
              </span>
              <h2 className="text-lg sm:text-2xl font-bold font-display text-[#102A43] pt-2">
                Selamat! Sistem untuk {provisionResult.tenant.name} Berhasil Dibuat
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Tenant, akun pemilik, cabang utama, dan lisensi telah aktif di database. Hak komisi royalti 20% Anda telah terkunci secara otomatis.
              </p>
            </div>

            {/* Credential Card */}
            <div className="max-w-lg mx-auto bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-left space-y-3 font-mono">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                  URL Web Kasir Cloud POS
                </span>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <a
                    href={provisionResult.credentials.loginUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#2563EB] hover:underline truncate"
                  >
                    {provisionResult.credentials.loginUrl}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyText(provisionResult.credentials.loginUrl, "url")}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-sans shrink-0 px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>{copiedField === "url" ? "Disalin!" : "Salin"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                    Username Pemilik
                  </span>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {provisionResult.credentials.username}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(provisionResult.credentials.username, "user")}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-sans shrink-0 px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      <span>{copiedField === "user" ? "Disalin!" : "Salin"}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                    Password Pemilik
                  </span>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {provisionResult.credentials.password}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(provisionResult.credentials.password, "pass")}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-sans shrink-0 px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      <span>{copiedField === "pass" ? "Disalin!" : "Salin"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-sans">
                <span className="text-slate-500">Nomor Lisensi Resmi:</span>
                <span className="font-bold text-slate-800 font-mono truncate ml-2">
                  {provisionResult.tenant.licenseKey}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons (Stacked on Mobile with full touch targets >= 44px) */}
            <div className="max-w-lg mx-auto flex flex-col gap-2.5 pt-2">
              <a
                href={`https://wa.me/${waNumber.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(
                  ownerName || "Bapak/Ibu"
                )},%20selamat!%20Sistem%20Cloud%20POS%20untuk%20${encodeURIComponent(
                  outletName
                )}%20telah%20selesai%20kami%20siapkan.%0A%0A🌐%20URL%20Aplikasi:%20${encodeURIComponent(
                  provisionResult.credentials.loginUrl
                )}%0A👤%20Username:%20${encodeURIComponent(
                  provisionResult.credentials.username
                )}%0A🔑%20Password:%20${encodeURIComponent(
                  provisionResult.credentials.password
                )}%0A%0ASilakan%20login%20untuk%20mulai%20menggunakan%20kasir.%20Terima%20kasih.`}
                target="_blank"
                rel="noreferrer"
                className="w-full min-h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Kirim Kredensial via WhatsApp Pemilik</span>
              </a>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Link
                  href="/leads/check"
                  className="w-full min-h-[44px] rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>Lihat Status Terverifikasi</span>
                </Link>

                <Link
                  href="/outlets"
                  className="w-full min-h-[44px] rounded-xl bg-[#102A43] hover:bg-[#0B1D3A] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                  <span>Daftar Outlet Saya</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
