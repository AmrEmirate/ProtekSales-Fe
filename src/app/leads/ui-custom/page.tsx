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
  const [primaryColor, setPrimaryColor] = useState("#ea580c");
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  const [styleNotes, setStyleNotes] = useState("");

  // AI & Workflow State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [designData, setDesignData] = useState<any>(null);
  const [revisionInput, setRevisionInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [approvalResult, setApprovalResult] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const leadIdParam = params.get("leadId");
      const nameParam = params.get("name");
      const phoneParam = params.get("phone");
      const catParam = params.get("category");

      if (leadIdParam) setLeadId(leadIdParam);
      if (nameParam) setStoreName(nameParam);
      if (phoneParam) setPhone(phoneParam);
      if (catParam) setCategory(catParam);

      // Jika ada leadId, cek apakah sudah pernah request desain sebelumnya
      if (leadIdParam) {
        api.getUiDesignsByLead(leadIdParam).then((res) => {
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
              });
            }
          }
        }).catch(() => {});
      }
    }
  }, []);

  const handleGenerateMockup = async () => {
    if (!storeName.trim()) {
      alert("Harap masukkan nama toko UMKM terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    setStatusMessage("Menghubungkan ke Google Stitch MCP & men-generate mockup visual...");

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
        setStatusMessage("Mockup UI berhasil dibuat oleh Google Stitch AI!");
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
    setStatusMessage("Mengirim permintaan revisi ke Google Stitch AI...");

    try {
      const res = await api.reviseUiDesign(activeRequestId, revisionInput.trim());
      if (res && res.data) {
        setDesignData(res.data);
        setRevisionInput("");
        setStatusMessage("Revisi berhasil diterapkan oleh Google Stitch AI!");
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Gagal revisi: ${err.message || "Periksa server"}`);
    } finally {
      setIsRevising(false);
    }
  };

  const handleApproveDesign = async () => {
    if (!activeRequestId) return;
    if (!confirm(`Konfirmasi Hak Otorisasi Sales:\n\nApakah klien UMKM "${storeName}" telah menyetujui desain ini dan sepakat berlangganan?\n\nSebagai Mitra Sales, tindakan APPROVE ini akan langsung:\n1. Membuat bundle Frontend kustom UMKM\n2. Menyambungkannya ke API Backend Cloud POS\n3. Menerbitkan kunci lisensi resmi\n4. Mencatat komisi penjualan ke dompet akun Sales Anda.`)) {
      return;
    }

    setIsApproving(true);
    setStatusMessage("Antigravity Pipeline sedang bekerja: Men-generate Frontend kustom -> Injeksi Tema Stitch -> Menyambungkan ke Backend Cloud POS API...");

    try {
      const res = await api.approveUiDesign(activeRequestId);
      if (res && res.data) {
        setApprovalResult(res.data);
        setStatusMessage("Frontend kasir berhasil dibuat dan tersambung penuh ke Cloud POS Backend!");
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Gagal aktivasi: ${err.message || "Periksa server Cloud POS"}`);
    } finally {
      setIsApproving(false);
    }
  };

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
            <span className="material-symbols-outlined text-[#F97316] text-[28px]">
              palette
            </span>
            Studio Desain UI UMKM
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-[#F97316] font-bold">
              Google Stitch MCP
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Hasilkan prototipe UI kasir sesuai branding tenant, lakukan revisi on-the-spot, dan approve otomatis ke Cloud POS.
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

      {/* Success Modal / Banner on Approval */}
      {approvalResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[28px]">verified</span>
              </div>
              <div>
                <h3 className="text-lg font-black tracking-wide font-display">
                  DESAIN DISETUJUI & POS AKTIF!
                </h3>
                <p className="text-xs text-emerald-100">
                  Antigravity telah menyambungkan UI Stitch ke Backend Cloud POS Engine.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-400/30 text-emerald-100 text-xs font-bold border border-emerald-300/30">
              STATUS: DEPLOYED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-black/20 border border-white/10">
              <span className="text-emerald-200 block text-[10px] uppercase font-bold">Subdomain Kasir Live Online</span>
              <a
                href={approvalResult.posUrl || `https://pos-${approvalResult.tenantSlug}.vimtk.cloud`}
                target="_blank"
                rel="noreferrer"
                className="text-white font-bold underline flex items-center gap-1 mt-0.5"
              >
                <span>{approvalResult.subdomain || `pos-${approvalResult.tenantSlug}.vimtk.cloud`}</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>

            <div className="p-3 rounded-xl bg-black/20 border border-white/10">
              <span className="text-emerald-200 block text-[10px] uppercase font-bold">Status FE & Koneksi BE</span>
              <span className="text-white font-medium block mt-0.5 text-[11px]">
                Bundle FE Generated &bull; Terkoneksi ke Cloud POS API
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/20 border border-white/10">
              <span className="text-emerald-200 block text-[10px] uppercase font-bold">Kunci Lisensi & Komisi</span>
              <span className="text-white font-mono font-bold block mt-0.5">
                {approvalResult.licenseKey || "PROPOS-ACTIVE"} &bull; Ditautkan ke Akun Sales
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
              <span>Buka POS Kasir UMKM Online</span>
            </a>

            {phone && (
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=Selamat!%20Aplikasi%20POS%20Kasir%20untuk%20${encodeURIComponent(
                  storeName
                )}%20sudah%20aktif%20secara%20online%20dengan%20desain%20kustom:%20${encodeURIComponent(
                  approvalResult.posUrl || `https://pos-${approvalResult.tenantSlug}.vimtk.cloud`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Kirim Link ke WhatsApp Pemilik</span>
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
              <h2 className="text-sm font-bold text-[#102A43]">1. Identitas & Request UI UMKM</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Toko / Usaha UMKM *</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
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
                  {/* Quick Color Presets */}
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
                  URL Foto Referensi / Suasana Toko (Opsional)
                </label>
                <input
                  type="url"
                  value={referenceImageUrl}
                  onChange={(e) => setReferenceImageUrl(e.target.value)}
                  placeholder="https://example.com/foto-toko.jpg"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Catatan Kustomisasi Khusus Klien
                </label>
                <textarea
                  rows={3}
                  value={styleNotes}
                  onChange={(e) => setStyleNotes(e.target.value)}
                  placeholder="Contoh: 'Mau tombol bayar besar warna hijau, tata letak menu 3 kolom kartu, ada tombol quick-pay QRIS'."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#F97316] text-xs resize-none"
                />
              </div>

              <button
                type="button"
                disabled={isGenerating || !storeName.trim()}
                onClick={handleGenerateMockup}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#F97316] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    <span>Men-generate Desain di Google Stitch...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>Generate Mockup via Google Stitch AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Revision Card */}
          {designData && !approvalResult && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">edit_note</span>
                <h3 className="text-sm font-bold text-[#102A43]">2. Feedback & Revisi Desain UMKM</h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Jika UMKM ingin merubah warna, ukuran tombol, atau tata letak, masukkan feedback di bawah:
              </p>
              <textarea
                rows={2}
                value={revisionInput}
                onChange={(e) => setRevisionInput(e.target.value)}
                placeholder="Contoh: 'Tolong tombol bayar QRIS diperbesar dan ganti background menjadi lebih terang'..."
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
                    <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                    <span>Menerapkan Revisi ke Stitch AI...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">sync</span>
                    <span>Kirim Revisi ke Stitch AI</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Live Mockup Preview Studio (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                  devices
                </span>
                <h2 className="text-sm font-bold text-[#102A43]">
                  Pratinjau Layar POS Kasir (Stitch Preview)
                </h2>
              </div>
              {designData && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                  Status: {designData.status || "READY_REVIEW"}
                </span>
              )}
            </div>

            {/* Display Mockup Preview */}
            {designData?.previewUrl ? (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-lg bg-slate-900 group">
                  {/* Tablet Frame Header */}
                  <div className="h-6 bg-slate-800 flex items-center justify-between px-3 text-[10px] text-slate-400">
                    <span>Kasir POS Tablet - {storeName}</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                      Online
                    </span>
                  </div>
                  {/* Render Screenshot */}
                  <img
                    src={designData.previewUrl}
                    alt={`Mockup POS ${storeName}`}
                    className="w-full h-auto object-cover max-h-[480px] transition-transform duration-200 group-hover:scale-[1.01]"
                  />
                  <a
                    href={designData.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-3 right-3 h-8 px-3 rounded-lg bg-black/70 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 backdrop-blur-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">open_in_full</span>
                    <span>Perbesar</span>
                  </a>
                </div>

                {/* Extracted Design Tokens */}
                {designData.themeConfig && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Token Desain yang Diekstrak Stitch MCP
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Warna Utama:</span>
                        <span className="font-bold font-mono" style={{ color: designData.themeConfig.customColor || primaryColor }}>
                          {designData.themeConfig.customColor || primaryColor}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Font Judul:</span>
                        <span className="font-bold">{designData.themeConfig.headlineFont || "Manrope"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Font Isi:</span>
                        <span className="font-bold">{designData.themeConfig.bodyFont || "Inter"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Bentuk Sudut:</span>
                        <span className="font-bold">{designData.themeConfig.roundness || "ROUND_EIGHT"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Final Action Button: APPROVE & DEPLOY (HAK SALES) */}
                {!approvalResult && (
                  <div className="pt-2 space-y-2">
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-amber-600">verified_user</span>
                      <span>
                        <strong>Hak Approval Khusus Mitra Sales:</strong> Setelah UMKM menyetujui mockup ini, klik tombol di bawah untuk membuat frontend dan menghubungkannya ke backend kasir.
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isApproving}
                      onClick={handleApproveDesign}
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm flex flex-col items-center justify-center gap-0.5 shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {isApproving ? (
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                          <span>Membuat Frontend & Menyambungkan ke Backend API...</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                            <span>SEPAKATI DEAL & APPROVE DESAIN (HAK SALES)</span>
                          </div>
                          <span className="text-[10px] text-emerald-200 font-normal">
                            Otomatis buat Frontend, sambungkan ke API Cloud POS & catat komisi sales
                          </span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-center text-slate-400">
                      Sistem Antigravity akan langsung menyusun file bundle FE, mengikat API menu, order, dan pembayaran kasir secara otomatis.
                    </p>
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
                  Isi data nama usaha dan preferensi warna di panel sebelah kiri, lalu klik &quot;Generate Mockup via Google Stitch AI&quot;.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
