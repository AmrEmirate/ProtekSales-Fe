"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

export default function UiCustomStudioPage() {
  const router = useRouter();

  // URL Query Params
  const [leadId, setLeadId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("F&B (Kafe / Restoran)");
  const [salesType, setSalesType] = useState<"OFFLINE" | "ONLINE">("OFFLINE");
  const [outletCount, setOutletCount] = useState<number>(1);
  const [primaryColor, setPrimaryColor] = useState("#ea580c");
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  const [styleNotes, setStyleNotes] = useState("");

  // Preview Mode: Mobile vs Desktop
  const [previewDevice, setPreviewDevice] = useState<"MOBILE" | "DESKTOP">("DESKTOP");

  // AI & Workflow State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [designData, setDesignData] = useState<any>(null);
  const [revisionInput, setRevisionInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [approvalResult, setApprovalResult] = useState<any>(null);

  // Activation & Onboarding Modal (Alur Lanjutkan Deal)
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [subdomainInput, setSubdomainInput] = useState("");
  const [domainType, setDomainType] = useState<"SUBDOMAIN" | "HOSTINGER_CUSTOM">("SUBDOMAIN");
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [ownerUsername, setOwnerUsername] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("Protek2026!Pos");
  const [ownerPin, setOwnerPin] = useState("1234");
  const [selectedPlan, setSelectedPlan] = useState("PAKET_150K");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const leadIdParam = params.get("leadId");
      const nameParam = params.get("name");
      const phoneParam = params.get("phone");
      const catParam = params.get("category");
      const typeParam = params.get("salesType") as "OFFLINE" | "ONLINE";
      const outletsParam = params.get("outlets");

      if (leadIdParam) setLeadId(leadIdParam);
      if (nameParam) {
        setStoreName(nameParam);
        const autoSlug = nameParam
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        setSubdomainInput(autoSlug);
        setOwnerUsername(`owner_${autoSlug.replace(/-/g, "_")}`);
      }
      if (phoneParam) setPhone(phoneParam);
      if (catParam) setCategory(catParam);
      if (typeParam === "ONLINE" || typeParam === "OFFLINE") setSalesType(typeParam);
      if (outletsParam) setOutletCount(Math.max(1, parseInt(outletsParam, 10) || 1));

      // Jika ada leadId, periksa apakah sudah pernah request desain sebelumnya
      if (leadIdParam) {
        api
          .getUiDesignsByLead(leadIdParam)
          .then((res) => {
            if (res && res.length > 0) {
              const latest = res[0];
              setActiveRequestId(latest.id);
              setDesignData(latest);
              if (latest.primaryColor) setPrimaryColor(latest.primaryColor);
              if (latest.category) setCategory(latest.category);
              if (latest.styleNotes) setStyleNotes(latest.styleNotes);
              if (latest.status === "DEPLOYED") {
                setApprovalResult({
                  tenantSlug: latest.deployedTenantSlug,
                  posUrl: `https://${latest.deployedTenantSlug}.posmu.cloud`,
                  subdomain: `pos-${latest.deployedTenantSlug}.vimtk.cloud`,
                });
              }
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  const handleGenerateMockup = async () => {
    if (!storeName.trim()) {
      alert("Harap masukkan nama toko UMKM terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    setStatusMessage("Menghubungkan ke Studio Desain Visual POS & men-generate mockup visual...");

    try {
      const res = await api.requestUiDesign({
        leadId: leadId || undefined,
        storeName: storeName.trim(),
        category,
        primaryColor,
        styleNotes: styleNotes.trim() || undefined,
        referenceImageUrl: referenceImageUrl.trim() || undefined,
      });

      if (res && res.data) {
        setActiveRequestId(res.data.id);
        setDesignData(res.data);
        setStatusMessage("Mockup UI berhasil dibuat oleh Studio Desain Visual POS!");
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Gagal membuat mockup: ${err.message || "Periksa koneksi server"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReviseMockup = async () => {
    if (!activeRequestId || !revisionInput.trim()) {
      alert("Harap masukkan catatan revisi UMKM.");
      return;
    }

    setIsRevising(true);
    setStatusMessage("Mengirim permintaan revisi ke Studio Desain Visual POS...");

    try {
      const res = await api.reviseUiDesign(activeRequestId, revisionInput.trim());
      if (res && res.data) {
        setDesignData(res.data);
        setRevisionInput("");
        setStatusMessage("Revisi berhasil diterapkan oleh Studio Desain Visual POS!");
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Gagal revisi: ${err.message || "Periksa server"}`);
    } finally {
      setIsRevising(false);
    }
  };

  // Buka Modal Konfirmasi Aktivasi (Alur Lanjutkan Deal)
  const handleOpenActivationModal = () => {
    if (!activeRequestId) {
      alert("Harap generate mockup desain terlebih dahulu sebelum melanjutkan.");
      return;
    }
    setShowActivationModal(true);
  };

  // Eksekusi Approval Final & Provisioning ke Cloud POS
  const handleConfirmActivation = async () => {
    if (!subdomainInput.trim()) {
      alert("Harap isi subdomain yang diinginkan.");
      return;
    }
    if (!ownerUsername.trim() || !ownerPassword.trim()) {
      alert("Harap lengkapi username dan password login pemilik toko.");
      return;
    }

    setIsApproving(true);
    setStatusMessage(
      "Antigravity Pipeline sedang bekerja: Generate Frontend kustom (Mobile & Desktop) -> Setup Subdomain/Domain Hostinger -> Buat Akun Login & Tagihan Bulan Pertama..."
    );

    try {
      const res = await api.approveUiDesign(activeRequestId!, {
        subdomain: subdomainInput.trim(),
        domainType,
        customDomain: domainType === "HOSTINGER_CUSTOM" ? customDomainInput.trim() : undefined,
        ownerUsername: ownerUsername.trim(),
        ownerPassword: ownerPassword.trim(),
        ownerPin: ownerPin.trim() || "1234",
        planCode: selectedPlan,
        outletCount,
        salesType,
      });

      if (res && res.data) {
        setApprovalResult(res.data);
        setShowActivationModal(false);
        setStatusMessage(
          "Frontend kasir & sistem akuntansi berhasil dibuat tuntas dan tersambung penuh ke Cloud POS Backend!"
        );
      }
    } catch (err: any) {
      console.error(err);
      alert(`Gagal aktivasi: ${err.message || "Periksa server Cloud POS"}`);
    } finally {
      setIsApproving(false);
    }
  };

  const getMonthlyPrice = (code: string) => {
    switch (code) {
      case "PAKET_100K":
        return 100000;
      case "PAKET_200K":
        return 200000;
      case "PAKET_250K":
        return 250000;
      default:
        return 150000;
    }
  };

  const totalMonthlyBilling = getMonthlyPrice(selectedPlan) * outletCount;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/leads/pipeline" className="hover:text-[#F97316]">
              Pipeline Prospek
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-bold">Studio Kustomisasi UI</span>
          </div>
          <h1 className="text-2xl font-black text-[#102A43] font-display flex items-center gap-2 mt-1">
            <span className="material-symbols-outlined text-[#F97316] text-[28px]">palette</span>
            Studio Desain UI & Akuntansi UMKM
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                salesType === "ONLINE"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-orange-100 text-[#F97316]"
              }`}
            >
              {salesType === "ONLINE" ? `Online (${outletCount} Outlet)` : "Offline (Lapangan)"}
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Hasilkan UI kasir & akuntansi sesuai branding toko, input logo & referensi warna, lalu tekan Lanjutkan untuk aktivasi domain dan akun login.
          </p>
        </div>

        <Link
          href="/leads/pipeline"
          className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Kembali ke Pipeline</span>
        </Link>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-blue-600 animate-pulse">
              info
            </span>
            <span className="font-medium">{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-blue-500 hover:text-blue-800 text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Success Banner on Approval */}
      {approvalResult && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[28px]">verified</span>
              </div>
              <div>
                <h3 className="text-lg font-black tracking-wide font-display">
                  DESAIN DISETUJUI & SISTEM POS SIAP DIGUNAKAN!
                </h3>
                <p className="text-xs text-emerald-100">
                  Antigravity telah menyusun bundle Frontend mandiri tanpa bentrok mobile/desktop dan menyambungkannya ke Cloud POS & Akuntansi.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-400/30 text-emerald-100 text-xs font-bold border border-emerald-300/30">
              STATUS: DEPLOYED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-black/20 border border-white/10">
              <span className="text-emerald-200 block text-[10px] uppercase font-bold">
                Domain / Subdomain Online
              </span>
              <a
                href={approvalResult.posUrl || `https://pos-${approvalResult.tenantSlug}.vimtk.cloud`}
                target="_blank"
                rel="noreferrer"
                className="text-white font-bold underline flex items-center gap-1 mt-0.5 truncate"
              >
                <span>{approvalResult.posUrl || approvalResult.subdomain}</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>

            <div className="p-3 rounded-xl bg-black/20 border border-white/10">
              <span className="text-emerald-200 block text-[10px] uppercase font-bold">
                Kredensial Login Owner
              </span>
              <span className="text-white font-mono font-bold block mt-0.5">
                User: {approvalResult.credentials?.username || `owner_${approvalResult.tenantSlug}`}{" "}
                &bull; PIN: 1234
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/20 border border-white/10">
              <span className="text-emerald-200 block text-[10px] uppercase font-bold">
                Status Tagihan Bulan Pertama
              </span>
              <span className="text-amber-200 font-bold block mt-0.5">
                Wajib Bayar Langganan Bulanan (Pending Verifikasi QRIS)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <a
              href={approvalResult.posUrl || `https://pos-${approvalResult.tenantSlug}.vimtk.cloud`}
              target="_blank"
              rel="noreferrer"
              className="h-10 px-5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
              <span>Buka POS & Akuntansi UMKM</span>
            </a>

            {phone && (
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(
                  storeName
                )},%20Aplikasi%20POS%20Kasir%20dan%20Sistem%20Akuntansi%20Anda%20sudah%20aktif!%0A%0ALink:%20${encodeURIComponent(
                  approvalResult.posUrl || `https://pos-${approvalResult.tenantSlug}.vimtk.cloud`
                )}%0AUsername:%20${encodeURIComponent(
                  approvalResult.credentials?.username || `owner_${approvalResult.tenantSlug}`
                )}%0APassword:%20${encodeURIComponent(
                  approvalResult.credentials?.password || "Protek2026!Pos"
                )}%0A%0ASilakan%20login%20dan%20selesaikan%20pembayaran%20langganan%20bulan%20pertama%20untuk%20membuka%20akses%20operasional%20penuh.`}
                target="_blank"
                rel="noreferrer"
                className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Kirim Akun & Tagihan via WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Form Left, Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form & Brand Specs (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-[#F97316] text-[20px]">tune</span>
              <h2 className="text-sm font-bold text-[#102A43]">1. Identitas & Request Desain UMKM</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nama Toko / Usaha UMKM *
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => {
                    setStoreName(e.target.value);
                    const autoSlug = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "");
                    setSubdomainInput(autoSlug);
                    setOwnerUsername(`owner_${autoSlug.replace(/-/g, "_")}`);
                  }}
                  placeholder="Contoh: Kopi Tuku Riau / Dimsum Intan"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#F97316] font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Kategori Usaha</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#F97316] font-medium bg-white"
                >
                  <option value="F&B (Kafe / Coffee Shop)">F&B (Kafe / Coffee Shop)</option>
                  <option value="F&B (Restoran / Rumah Makan)">F&B (Restoran / Rumah Makan)</option>
                  <option value="F&B (Bakery & Pastry)">F&B (Bakery & Pastry)</option>
                  <option value="Retail & Toko Kelontong">Retail & Toko Kelontong</option>
                  <option value="Fashion & Butik">Fashion & Butik</option>
                  <option value="Jasa & Barbershop">Jasa & Barbershop</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Pilihan Warna Utama Brand</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl border border-slate-200 font-mono text-xs uppercase"
                  />
                  <div className="flex items-center gap-1">
                    {["#ea580c", "#0284c7", "#059669", "#7c3aed", "#1e293b"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setPrimaryColor(c)}
                        className="w-6 h-6 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Upload Logo Toko / Foto Plang UMKM
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setReferenceImageUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-[#F97316] hover:file:bg-orange-100 cursor-pointer"
                  />
                  {referenceImageUrl && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 mt-2">
                      <img
                        src={referenceImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setReferenceImageUrl("")}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Catatan Kustomisasi Khusus Klien
                </label>
                <textarea
                  rows={2}
                  value={styleNotes}
                  onChange={(e) => setStyleNotes(e.target.value)}
                  placeholder="Contoh: 'Tombol QRIS besar, modul akuntansi laba rugi otomatis, logo di pojok kiri atas'..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#F97316] text-xs resize-none"
                />
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={isGenerating || !storeName.trim()}
                  onClick={handleGenerateMockup}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[#F97316] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        refresh
                      </span>
                      <span>Men-generate Desain di Studio Visual...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                      <span>Generate Mockup via Studio Visual POS</span>
                    </>
                  )}
                </button>

                {/* Tombol Demo Online via WA (Khusus Sales Online / Remote) */}
                {phone && (
                  <a
                    href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(
                      storeName
                    )},%20berikut%20kami%20kirimkan%20link%20demo%20online%20Sistem%20Kasir%20POS%20%26%20Akuntansi%20yang%20sudah%20disesuaikan%20dengan%20nama%20toko%20Anda:%20https://pos-demo.vimtk.cloud%20(Bisa%20dicoba%20langsung%20di%20HP%20atau%20Laptop).`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">
                      share
                    </span>
                    <span>Kirim Demo Online via WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Revision Card */}
          {designData && !approvalResult && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">
                  edit_note
                </span>
                <h3 className="text-sm font-bold text-[#102A43]">2. Feedback & Revisi Desain UMKM</h3>
              </div>
              <textarea
                rows={2}
                value={revisionInput}
                onChange={(e) => setRevisionInput(e.target.value)}
                placeholder="Contoh: 'Tolong tombol bayar diperbesar dan ganti background menjadi lebih terang'..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-xs resize-none"
              />
              <button
                type="button"
                disabled={isRevising || !revisionInput.trim()}
                onClick={handleReviseMockup}
                className="w-full h-9 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isRevising ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      refresh
                    </span>
                    <span>Menerapkan Revisi ke Studio Visual...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">sync</span>
                    <span>Kirim Revisi ke Studio Visual</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Live Mockup Preview Studio (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                  devices
                </span>
                <h2 className="text-sm font-bold text-[#102A43]">
                  Pratinjau Layar POS & Akuntansi
                </h2>
              </div>

              {/* Responsive Device Preview Toggle (Mobile vs Desktop) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("MOBILE")}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1 transition ${
                    previewDevice === "MOBILE"
                      ? "bg-white shadow-sm text-slate-900"
                      : "hover:text-slate-900"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">smartphone</span>
                  <span>Mobile HP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("DESKTOP")}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1 transition ${
                    previewDevice === "DESKTOP"
                      ? "bg-white shadow-sm text-slate-900"
                      : "hover:text-slate-900"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">laptop_mac</span>
                  <span>Desktop / Tablet</span>
                </button>
              </div>
            </div>

            {/* Display Mockup Preview */}
            {designData?.previewUrl ? (
              <div className="space-y-4">
                <div
                  className={`mx-auto rounded-3xl overflow-hidden border border-slate-300 shadow-xl bg-slate-900 transition-all ${
                    previewDevice === "MOBILE" ? "max-w-[340px]" : "w-full"
                  }`}
                >
                  {/* Frame Header */}
                  <div className="h-7 bg-slate-800 flex items-center justify-between px-3 text-[10px] text-slate-400">
                    <span className="truncate">
                      {previewDevice === "MOBILE" ? "HP Kasir" : "Tablet / Desktop Kasir"} - {storeName}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                      Online
                    </span>
                  </div>
                  {/* Render Screenshot */}
                  <img
                    src={designData.previewUrl}
                    alt={`Mockup POS ${storeName}`}
                    className={`w-full object-cover transition-transform duration-200 ${
                      previewDevice === "MOBILE" ? "max-h-[500px]" : "max-h-[460px]"
                    }`}
                  />
                </div>

                {/* Extracted Design Tokens */}
                {designData.themeConfig && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Token Desain Visual UMKM
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Warna Brand:</span>
                        <span
                          className="font-bold font-mono"
                          style={{ color: designData.themeConfig.customColor || primaryColor }}
                        >
                          {designData.themeConfig.customColor || primaryColor}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Font Judul:</span>
                        <span className="font-bold">
                          {designData.themeConfig.headlineFont || "Manrope"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Font Body:</span>
                        <span className="font-bold">
                          {designData.themeConfig.bodyFont || "Plus Jakarta Sans"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Sudut Kartu:</span>
                        <span className="font-bold">Rounded-2xl</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Final Action Button: LANJUTKAN & AKTIVASI TOKO (HAK SALES) */}
                {!approvalResult && (
                  <div className="pt-2 space-y-2">
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[20px] text-amber-600 mt-0.5">
                        verified_user
                      </span>
                      <div className="leading-relaxed">
                        <strong>Lanjutan Deal UMKM:</strong> Jika pihak UMKM telah menyetujui mockup ini, klik tombol di bawah untuk memasukkan subdomain/domain Hostinger, username login pemilik toko, dan generate FE tuntas secara otomatis!
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isApproving}
                      onClick={handleOpenActivationModal}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm flex flex-col items-center justify-center gap-0.5 shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">
                          arrow_forward_ios
                        </span>
                        <span>LANJUTKAN & AKTIVASI TOKO UMKM</span>
                      </div>
                      <span className="text-[10px] text-emerald-200 font-normal">
                        Input Subdomain, Domain Hostinger, Buat Akun Login & Tagihan Bulan Pertama
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#F97316] flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[32px]">auto_fix_high</span>
                </div>
                <h3 className="text-sm font-bold text-slate-700">Belum Ada Mockup yang Dibuat</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Isi data nama usaha dan preferensi warna di panel sebelah kiri, lalu klik &quot;Generate Mockup via Studio Visual POS&quot;.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL AKTIVASI TOKO & AKUNTANSI ================= */}
      {showActivationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Lanjutkan Deal & Setup Sistem UMKM
                </h3>
                <p className="text-xs text-slate-500">
                  Konfigurasikan domain, akun login owner, dan paket langganan bulanan
                </p>
              </div>
              <button
                onClick={() => setShowActivationModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Domain Options */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-800">1. Pilihan Domain / Subdomain</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDomainType("SUBDOMAIN")}
                    className={`p-3 rounded-xl border text-left font-bold transition ${
                      domainType === "SUBDOMAIN"
                        ? "border-[#F97316] bg-orange-50/50 text-[#F97316]"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-xs">Subdomain Instan</span>
                    <span className="block text-[10px] text-slate-400 font-normal">
                      *.vimtk.cloud (Gratis & Langsung Online)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDomainType("HOSTINGER_CUSTOM")}
                    className={`p-3 rounded-xl border text-left font-bold transition ${
                      domainType === "HOSTINGER_CUSTOM"
                        ? "border-blue-500 bg-blue-50/50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-xs">Custom Hostinger</span>
                    <span className="block text-[10px] text-slate-400 font-normal">
                      Request Domain Sendiri (.com / .id)
                    </span>
                  </button>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Subdomain Unik</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={subdomainInput}
                      onChange={(e) => setSubdomainInput(e.target.value)}
                      placeholder="namatoko"
                      className="flex-1 h-10 px-3 rounded-l-xl border border-r-0 border-slate-200 font-mono text-xs font-bold outline-none focus:border-[#F97316]"
                    />
                    <span className="h-10 px-3 rounded-r-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center text-xs font-mono">
                      .vimtk.cloud
                    </span>
                  </div>
                </div>

                {domainType === "HOSTINGER_CUSTOM" && (
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">
                      Nama Custom Domain Hostinger UMKM
                    </label>
                    <input
                      type="text"
                      value={customDomainInput}
                      onChange={(e) => setCustomDomainInput(e.target.value)}
                      placeholder="Contoh: kasir.tokoanda.com atau tokoku.id"
                      className="w-full h-10 px-3 rounded-xl border border-blue-300 bg-blue-50/30 text-xs font-semibold outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Owner Login Credentials */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block font-bold text-slate-800">2. Akun Login Pemilik (Owner UMKM)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Username Login</span>
                    <input
                      type="text"
                      value={ownerUsername}
                      onChange={(e) => setOwnerUsername(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white font-mono text-xs font-bold outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Password Awal</span>
                    <input
                      type="text"
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white font-mono text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Package & Outlets */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-800">
                  3. Paket Langganan & Tagihan Bulan Pertama
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { code: "PAKET_100K", name: "Starter", price: "100rb" },
                    { code: "PAKET_150K", name: "Growth", price: "150rb" },
                    { code: "PAKET_200K", name: "Pro Multi", price: "200rb" },
                    { code: "PAKET_250K", name: "Unlimited", price: "250rb" },
                  ].map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setSelectedPlan(p.code)}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        selectedPlan === p.code
                          ? "border-[#F97316] bg-orange-50 font-bold text-[#F97316]"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      <span className="block text-xs">{p.name}</span>
                      <span className="block text-[10px] text-slate-400">Rp {p.price}/bln</span>
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-orange-950 block">
                      Total Biaya Langganan Bulan ke-1:
                    </span>
                    <span className="text-[11px] text-orange-700">
                      {outletCount} Outlet &bull; Komisi Sales: 25% (Rp{" "}
                      {((totalMonthlyBilling * 0.25)).toLocaleString("id-ID")})
                    </span>
                  </div>
                  <span className="text-base font-extrabold text-[#F97316]">
                    Rp {totalMonthlyBilling.toLocaleString("id-ID")}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  ℹ️ <strong>Alur Pembayaran:</strong> Setelah di-approve, sistem langsung men-generate bundle FE dan akun siap login. Pemilik UMKM harus menyelesaikan pembayaran bulan pertama untuk mengaktifkan modul kasir & akuntansi secara penuh.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowActivationModal(false)}
                  className="h-11 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isApproving}
                  onClick={handleConfirmActivation}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {isApproving ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        refresh
                      </span>
                      <span>Men-generate Frontend & Aktivasi...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">
                        task_alt
                      </span>
                      <span>Konfirmasi & Generate Frontend Tuntas</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
