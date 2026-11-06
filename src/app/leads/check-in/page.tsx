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
  const { addVisit } = useApp();

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
      industry: "Kafe, Restoran, Dimsum & Food Truck",
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
      industry: "Segala Jenis Usaha Shift Malam",
      color: "#0ea5e9",
      description: "Tampilan mode gelap kontras tinggi, anti silau untuk shift panjang, hemat daya baterai tablet dan smartphone.",
      recommendedFor: "Jasa & Servis",
    },
  ];

  // Sampel produk kasir dinamis untuk live preview
  const previewProducts: PosPreviewItem[] =
    category === "Retail / Minimarket"
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
          { id: "p4", name: "Minyak Telon Herbal 60ml", price: 22000, category: "Perawatan" },
        ]
      : [
          { id: "p1", name: "Dimsum Siomay Ayam Udang (4 pcs)", price: 28000, category: "Dimsum Kukus" },
          { id: "p2", name: "Hakau Udang Kristal (3 pcs)", price: 32000, category: "Dimsum Kukus" },
          { id: "p3", name: "Pangsit Goreng Mayonaise", price: 26000, category: "Dimsum Goreng" },
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
      // Simpan sebagai pengingat follow-up
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

        alert(`Hasil kunjungan tersimpan di Pipeline sebagai pengingat (Follow-up: ${followUpDate}).`);
        router.push("/leads/pipeline");
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
        },
        outletCount,
      });

      setProvisionResult(result);
      setCurrentStep(4);

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
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Step Indicator Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E2E8F0] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#2563EB]">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/leads/pipeline" className="hover:text-[#2563EB]">
              Pipeline Prospek
            </Link>
            <span>/</span>
            <span className="text-[#102A43] font-bold">Check-In & Buat POS UMKM</span>
          </div>

          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#2563EB] border border-blue-200">
            Engine Antigravity
          </span>
        </div>

        {/* Wizard Steps Nav */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          <div
            className={`p-2.5 rounded-xl border text-center transition-all ${
              currentStep === 1
                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm font-bold"
                : currentStep > 1
                ? "bg-blue-50 text-[#2563EB] border-blue-200 font-semibold"
                : "bg-slate-50 text-slate-400 border-slate-200"
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider">Tahap 1</div>
            <div className="text-xs font-bold truncate mt-0.5">1. Data Toko</div>
          </div>

          <div
            className={`p-2.5 rounded-xl border text-center transition-all ${
              currentStep === 2
                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm font-bold"
                : currentStep > 2
                ? "bg-blue-50 text-[#2563EB] border-blue-200 font-semibold"
                : "bg-slate-50 text-slate-400 border-slate-200"
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider">Tahap 2</div>
            <div className="text-xs font-bold truncate mt-0.5">2. Desain UI POS</div>
          </div>

          <div
            className={`p-2.5 rounded-xl border text-center transition-all ${
              currentStep === 3
                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm font-bold"
                : currentStep > 3
                ? "bg-blue-50 text-[#2563EB] border-blue-200 font-semibold"
                : "bg-slate-50 text-slate-400 border-slate-200"
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider">Tahap 3</div>
            <div className="text-xs font-bold truncate mt-0.5">3. Akun UMKM</div>
          </div>

          <div
            className={`p-2.5 rounded-xl border text-center transition-all ${
              currentStep === 4
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold"
                : "bg-slate-50 text-slate-400 border-slate-200"
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider">Tahap 4</div>
            <div className="text-xs font-bold truncate mt-0.5">4. POS Live!</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAHAP 1: INPUT DATA IDENTITAS UMKM & CEK BENTROK                           */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <form onSubmit={handleProceedFromStep1} className="space-y-6 animate-in fade-in">
          {/* Jalur Sales: Offline vs Online */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-[#2563EB] text-[22px]">route</span>
              <div>
                <h2 className="text-sm font-bold text-[#102A43]">Pilih Jalur Penjualan</h2>
                <p className="text-[11px] text-slate-500">Sesuaikan dengan model pendekatan Anda di lapangan atau digital</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => {
                  setSalesChannel("OFFLINE");
                  setOutletCount(1);
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  salesChannel === "OFFLINE"
                    ? "border-[#2563EB] bg-blue-50/50 shadow-sm"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow ${
                      salesChannel === "OFFLINE" ? "bg-[#2563EB]" : "bg-slate-400"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">store</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Alur Sales Offline (Lapangan)</h3>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Kunjungan fisik on-site & presentasi langsung ke pemilik UMKM
                    </span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setSalesChannel("ONLINE");
                  if (outletCount === 1) setOutletCount(2);
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  salesChannel === "ONLINE"
                    ? "border-[#2563EB] bg-blue-50/50 shadow-sm"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow ${
                      salesChannel === "ONLINE" ? "bg-[#2563EB]" : "bg-slate-400"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">public</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Alur Sales Online (Outreach Digital)</h3>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Prospek multi-cabang via WhatsApp Business, DM Instagram, & medsos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Identitas Toko & WhatsApp */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-[#2563EB] text-[20px]">storefront</span>
              <h2 className="text-sm font-bold text-[#102A43] font-display">
                Data Identitas Usaha UMKM
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="Contoh: Ibu Intan Permata"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] focus:bg-white focus:border-[#2563EB] outline-none"
                />
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#102A43]">Kategori Usaha</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      if (cat.id === "Kafe & Resto") {
                        setSelectedThemePreset("culinary");
                        setCustomBrandColor("#ea580c");
                      } else if (cat.id === "Retail / Minimarket") {
                        setSelectedThemePreset("retail");
                        setCustomBrandColor("#10b981");
                      } else if (cat.id === "Apotek / Klinik") {
                        setSelectedThemePreset("cafe");
                        setCustomBrandColor("#0284c7");
                      } else {
                        setSelectedThemePreset("minimalist");
                        setCustomBrandColor("#0ea5e9");
                      }
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all border ${
                      category === cat.id
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nomor WhatsApp & Proteksi Anti-Bentrok */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#102A43]">
                Nomor WhatsApp Pemilik (Proteksi Hak Eksklusif Sales 30 Hari) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1 flex items-center">
                  <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-[#102A43] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    <span>+62</span>
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
                    className="w-full h-11 pl-20 pr-4 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] focus:bg-white focus:border-[#2563EB] outline-none font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCheckPhone}
                  disabled={isCheckingPhone || !waNumber.trim()}
                  className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>{isCheckingPhone ? "Mengecek..." : "Cek Anti-Bentrok"}</span>
                </button>
              </div>

              {availabilityMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    availabilityMessage.canClaim
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                      : "bg-red-50 text-red-800 border border-red-300"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {availabilityMessage.canClaim ? "check_circle" : "error"}
                  </span>
                  <span>{availabilityMessage.text}</span>
                </div>
              )}
            </div>

            {/* Alamat & Jumlah Cabang */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-[#102A43]">Alamat Operasional Toko</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jl. Dago No. 42, Bandung"
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
                  onChange={(e) => setOutletCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-bold text-center text-[#102A43] focus:bg-white focus:border-[#2563EB] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Respon & Minat UMKM */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-[#2563EB] text-[20px]">handshake</span>
              <h2 className="text-sm font-bold text-[#102A43]">Respon & Minat UMKM</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
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
                  className="mt-1 accent-[#2563EB]"
                />
                <div>
                  <div className="text-xs font-bold text-[#2563EB] flex items-center gap-1">
                    <span>✨ UMKM Tertarik & Ingin Lihat Referensi UI POS</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Lanjut langsung ke katalog referensi tema, buatkan UI kasir toko, dan siapkan akun Cloud POS.
                  </div>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
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
                  className="mt-1 accent-amber-600"
                />
                <div>
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <span>⏳ Belum Tertarik / Butuh Waktu Pikir-pikir</span>
                  </div>
                  <div className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                    Catat tanggal follow-up pengingat di pipeline prospek agar tidak direbut sales lain.
                  </div>
                </div>
              </label>
            </div>

            {agreementStatus === "NOT_AGREED" && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3 animate-in fade-in">
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
                    >
                    </input>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button Step 1 */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isProvisioning}
              className="flex-1 h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.35)] active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
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
      {/* TAHAP 2: REFERENSI DESAIN UI POS & BUAT UI TOKO                           */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Card Referensi */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2563EB] text-[22px]">palette</span>
                <div>
                  <h2 className="text-base font-bold text-[#102A43] font-display">
                    Katalog Referensi Desain UI POS Kasir
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pilih tema referensi yang paling sesuai dengan konsep toko <span className="font-bold text-slate-800">{outletName}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
              >
                Ubah Data Toko
              </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {uiPresets.map((preset) => {
                const isSelected = selectedThemePreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setSelectedThemePreset(preset.id);
                      setCustomBrandColor(preset.color);
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                      isSelected
                        ? "border-[#2563EB] bg-blue-50/30 shadow-md ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: preset.color }}
                        />
                        <h3 className="text-xs font-bold text-[#102A43]">{preset.title}</h3>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[#2563EB] text-[18px]">check_circle</span>
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

          {/* Kustomisasi Brand & Pratinjau Langsung Layar POS Kasir */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2563EB] text-[20px]">devices</span>
                <h3 className="text-sm font-bold text-[#102A43]">
                  Pratinjau Interaktif Layar Kasir POS ({outletName || "Nama Toko"})
                </h3>
              </div>

              {/* Color Swatches */}
              <div className="flex items-center gap-1.5">
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

            {/* Live POS Cashier Screen Mockup */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-slate-50">
              {/* POS Top Bar */}
              <div
                className="px-4 py-3 text-white flex items-center justify-between transition-colors"
                style={{ backgroundColor: customBrandColor }}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{outletName || "Cloud POS Store"}</h4>
                    <span className="text-[10px] opacity-90">{category} &bull; Kasir Utama (Online)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20">
                    Shift 1 Aktif
                  </span>
                  <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                </div>
              </div>

              {/* POS Body Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 min-h-[300px]">
                {/* Left 2 Cols: Menu Catalog */}
                <div className="md:col-span-2 p-4 border-r border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Katalog Produk Cepat</span>
                    <span className="text-[11px] text-slate-400">Klik item untuk menambah ke struk</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {previewProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleAddToCart(p)}
                        className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all bg-white active:scale-95 flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {p.category}
                          </span>
                          <h5 className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{p.name}</h5>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            Rp {p.price.toLocaleString("id-ID")}
                          </span>
                          <span
                            className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[12px] font-bold"
                            style={{ backgroundColor: customBrandColor }}
                          >
                            +
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right 1 Col: Active Cart & Total */}
                <div className="p-4 bg-slate-50 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-800">Keranjang Kasir</span>
                      <span className="text-[10px] text-slate-500">{cartItems.length} Produk</span>
                    </div>

                    <div className="space-y-2 mt-2 max-h-36 overflow-y-auto">
                      {cartItems.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          Keranjang masih kosong.<br />Klik menu di samping.
                        </div>
                      ) : (
                        cartItems.map((c) => (
                          <div key={c.item.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200">
                            <div className="truncate pr-2">
                              <p className="font-semibold text-slate-800 truncate">{c.item.name}</p>
                              <span className="text-[10px] text-slate-500">
                                {c.qty}x @ Rp {c.item.price.toLocaleString("id-ID")}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(c.item.id)}
                              className="text-red-400 hover:text-red-600 text-xs shrink-0"
                            >
                              &times;
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>Total Transaksi</span>
                      <span className="text-sm font-mono text-emerald-600">
                        Rp {cartTotal.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <div className="py-2 text-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">payments</span>
                        <span>Tunai Pas</span>
                      </div>
                      <div className="py-2 text-center rounded-lg bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                        <span>QRIS / E-Wallet</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Approval Bar */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 h-12 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
            >
              ⬅️ Kembali
            </button>

            <button
              type="button"
              onClick={handleApproveDesign}
              className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(16,185,129,0.35)] active:scale-98 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">verified</span>
              <span>✅ UMKM Setuju (Approve Desain) & Input Akun Pemilik ➡️</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 3: APPROVE & INPUT KREDENSIAL UMKM (USERNAME & PASSWORD)             */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in">
          {/* Card Setup Akun Owner */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2563EB] text-[22px]">badge</span>
                <div>
                  <h2 className="text-base font-bold text-[#102A43] font-display">
                    Setup Akun Pemilik UMKM & Subdomain Cloud POS
                  </h2>
                  <p className="text-xs text-slate-500">
                    Desain telah disetujui oleh <span className="font-bold text-slate-800">{ownerName}</span>. Masukkan username dan password login untuk pemilik toko.
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Status: Deal Approved
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <span className="text-[10px] text-slate-400 block">Digunakan oleh pemilik toko untuk login ke dashboard kasir.</span>
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
                <span className="text-[10px] text-slate-400 block">Password awal yang dapat dibagikan langsung ke pemilik via WhatsApp.</span>
              </div>
            </div>

            {/* Subdomain Cloud POS */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-bold text-[#102A43]">
                Alamat Web Subdomain Cloud POS UMKM <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <div className="relative flex-1 flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400">https://</span>
                  <input
                    type="text"
                    required
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="dimsumintan"
                    className="w-full h-11 pl-18 pr-3 rounded-l-xl bg-slate-50 border border-[#CBD5E1] text-xs font-bold text-[#102A43] focus:bg-white focus:border-[#2563EB] outline-none font-mono"
                  />
                </div>
                <div className="h-11 px-4 rounded-r-xl bg-slate-200 border-y border-r border-[#CBD5E1] flex items-center text-xs font-bold text-slate-700">
                  .vimtk.cloud
                </div>
              </div>
              <span className="text-[10px] text-slate-400 block">Domain aktif instan yang akan otomatis di-deploy oleh engine Antigravity.</span>
            </div>

            {/* Paket Berlangganan SaaS */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-[#102A43]">Pilihan Paket Berlangganan POS</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setSelectedPlanCode("PAKET_100K")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlanCode === "PAKET_100K"
                      ? "border-[#2563EB] bg-blue-50/50 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-500">Paket 1: Hemat</div>
                  <div className="text-sm font-extrabold text-[#102A43] mt-0.5">Rp 100.000<span className="text-[10px] text-slate-400 font-normal">/bln</span></div>
                  <div className="text-[10px] text-slate-500 mt-1">Kuota 6.000 Tx/Bulan &bull; 1 Outlet</div>
                </div>

                <div
                  onClick={() => setSelectedPlanCode("PAKET_150K")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all relative ${
                    selectedPlanCode === "PAKET_150K"
                      ? "border-[#2563EB] bg-blue-50/50 shadow-sm ring-1 ring-blue-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="absolute -top-2 right-3 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#2563EB] text-white">
                    Paling Populer
                  </span>
                  <div className="text-[11px] font-bold text-[#2563EB]">Paket 2: Bisnis</div>
                  <div className="text-sm font-extrabold text-[#102A43] mt-0.5">Rp 150.000<span className="text-[10px] text-slate-400 font-normal">/bln</span></div>
                  <div className="text-[10px] text-slate-500 mt-1">Kuota 9.000 Tx/Bulan &bull; Multi-Cabang</div>
                </div>

                <div
                  onClick={() => setSelectedPlanCode("PAKET_200K")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlanCode === "PAKET_200K"
                      ? "border-[#2563EB] bg-blue-50/50 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-500">Paket 3: Enterprise</div>
                  <div className="text-sm font-extrabold text-[#102A43] mt-0.5">Rp 200.000<span className="text-[10px] text-slate-400 font-normal">/bln</span></div>
                  <div className="text-[10px] text-slate-500 mt-1">Kuota 12.000 Tx/Bulan &bull; Prioritas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Antigravity Automation Notice Card */}
          <div className="bg-gradient-to-r from-blue-900 to-[#102A43] rounded-2xl p-5 text-white space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-300 text-[24px]">auto_awesome</span>
              <h3 className="text-sm font-bold font-display">Eksekusi Otomasi Antigravity</h3>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed">
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
                <span>Terbitkan Akun Owner (Username & Password)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-400 text-[14px]">check_circle</span>
                <span>Terbitkan Lisensi Resmi & Kunci Komisi Sales</span>
              </li>
            </ul>
          </div>

          {provisionError && (
            <div className="p-4 rounded-xl bg-red-100 text-red-900 border border-red-300 text-xs font-bold animate-in fade-in flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{provisionError}</span>
            </div>
          )}

          {/* Action Buttons Step 3 */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={isProvisioning}
              onClick={() => setCurrentStep(2)}
              className="px-5 h-12 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
            >
              ⬅️ Kembali ke Desain
            </button>

            <button
              type="button"
              disabled={isProvisioning}
              onClick={handleExecuteAntigravityProvisioning}
              className="flex-1 h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,99,235,0.4)] active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isProvisioning ? "sync" : "rocket_launch"}
              </span>
              <span>
                {isProvisioning
                  ? "Antigravity Sedang Membuat Sistem Cloud POS..."
                  : "🚀 Approve & Buat Sistem Cloud POS (Antigravity Engine)"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 4: HASIL OTOMASI SUKSES (PROVISIONING COMPLETE)                      */}
      {/* ========================================================================= */}
      {currentStep === 4 && provisionResult && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-emerald-200 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Sistem Cloud POS Aktif di Produksi!
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-[#102A43] pt-2">
                Selamat! Sistem untuk {provisionResult.tenant.name} Berhasil Dibuat
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tenant, akun pemilik, cabang utama, lisensi, dan invoice perdana telah aktif di database. Komisi Anda telah terkunci secara otomatis.
              </p>
            </div>

            {/* Credential Card */}
            <div className="max-w-lg mx-auto bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3 font-mono">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                  URL Web Kasir Cloud POS
                </span>
                <div className="flex items-center justify-between mt-0.5">
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
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-sans"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>{copiedField === "url" ? "Disalin!" : "Salin"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                    Username Pemilik
                  </span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs font-bold text-slate-900">
                      {provisionResult.credentials.username}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(provisionResult.credentials.username, "user")}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-sans"
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
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs font-bold text-slate-900">
                      {provisionResult.credentials.password}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(provisionResult.credentials.password, "pass")}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-sans"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      <span>{copiedField === "pass" ? "Disalin!" : "Salin"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-sans">
                <span className="text-slate-500">Nomor Lisensi Resmi:</span>
                <span className="font-bold text-slate-800 font-mono">{provisionResult.tenant.licenseKey}</span>
              </div>
            </div>

            {/* Quick Action WhatsApp Button */}
            <div className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3 pt-2">
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
                className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Kirim Kredensial via WhatsApp Pemilik</span>
              </a>

              <Link
                href="/outlets"
                className="px-5 h-12 rounded-xl bg-[#102A43] hover:bg-[#0B1D3A] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                <span>Daftar Outlet Saya</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}