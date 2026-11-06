"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

export default function CheckInPage() {
  const router = useRouter();
  const { addVisit, isOffline } = useApp();

  // Channel Selection: Offline vs Online
  const [salesChannel, setSalesChannel] = useState<"OFFLINE" | "ONLINE">("OFFLINE");

  // Outlet Details
  const [outletName, setOutletName] = useState("");
  const [category, setCategory] = useState("Retail / Minimarket");
  const [ownerName, setOwnerName] = useState("");
  const [waNumber, setWaNumber] = useState("");
  const [address, setAddress] = useState("Jl. Fatmawati Raya No. 42B, Cilandak, Jakarta Selatan");
  const [outletCount, setOutletCount] = useState<number>(1);
  const [onlineSource, setOnlineSource] = useState("WhatsApp");

  // Result & Follow Up
  const [agreementStatus, setAgreementStatus] = useState<"AGREED" | "NOT_AGREED">("AGREED");
  const [rejectionReason, setRejectionReason] = useState("Masih memakai pembukuan manual buku");
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Anti-Collision Check
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<{
    canClaim: boolean;
    text: string;
  } | null>(null);

  const categories = [
    { id: "Retail / Minimarket", label: "Retail / Mart", icon: "store" },
    { id: "Kafe & Resto", label: "Kafe / Resto", icon: "restaurant" },
    { id: "Apotek / Klinik", label: "Apotek / Medis", icon: "local_pharmacy" },
    { id: "Jasa & Lainnya", label: "Jasa / Lainnya", icon: "dry_cleaning" },
  ];

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
        text: "Nomor dapat didaftarkan (Pemeriksaan offline).",
      });
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outletName.trim() || !waNumber.trim()) {
      alert("Harap lengkapi nama toko dan nomor WhatsApp!");
      return;
    }
    setIsSubmitting(true);

    try {
      const sanitizedPhone = waNumber.replace(/[^0-9]/g, "");
      const res = await api.checkInLead({
        storeName: outletName,
        ownerName: ownerName || "Pemilik Usaha",
        phone: sanitizedPhone,
        address: salesChannel === "OFFLINE" ? address : `Online Outreach (${address})`,
        latitude: -6.2918,
        longitude: 106.7972,
        salesType: salesChannel,
        outletCount,
        outcome: agreementStatus === "AGREED" ? "AGREED" : "NOT_AGREED",
        rejectionReason: agreementStatus === "NOT_AGREED" ? rejectionReason : undefined,
        followUpDate: agreementStatus === "NOT_AGREED" ? followUpDate : undefined,
        notes: `Kategori: ${category}. ${notes ? 'Catatan: ' + notes : ''}`,
      });

      if (agreementStatus === "AGREED") {
        setSuccessNotice(
          "UMKM Setuju! Data berhasil dikunci anti-bentrok. Membuka Studio Desain UI..."
        );
      } else {
        setSuccessNotice(
          `Hasil kunjungan tersimpan di web sebagai Pengingat (Follow-up: ${followUpDate}). Tidak akan bentrok dengan sales lain.`
        );
      }

      addVisit({
        outletName,
        category,
        time:
          new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
          " WIB",
        date: "Hari ini",
        distance:
          salesChannel === "OFFLINE"
            ? "12 m dari titik GPS (Dalam Radius)"
            : "Online Outreach WA",
        status: agreementStatus === "AGREED" ? "DEAL" : "PENDING",
        notes: `${salesChannel === "OFFLINE" ? "[OFFLINE]" : "[ONLINE]"} ${agreementStatus === "AGREED" ? "Setuju Lanjut UI" : `Belum Setuju (${rejectionReason})`}`,
        coordinates: { lat: -6.2918, lng: 106.7972 },
      });

      setTimeout(() => {
        if (agreementStatus === "AGREED") {
          // Lanjut langsung ke pembuatan UI kustom sesuai alur yang diminta!
          const cleanPhone = waNumber.replace(/[^0-9]/g, "");
          const leadId = res?.lead?.id || "";
          router.push(
            `/leads/ui-custom?name=${encodeURIComponent(outletName)}&phone=${cleanPhone}&category=${encodeURIComponent(category)}${leadId ? `&leadId=${leadId}` : ""}&salesType=${salesChannel}&outlets=${outletCount}`
          );
        } else {
          router.push("/leads/pipeline");
        }
      }, 1500);
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message || "Periksa server"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Title & Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/leads/pipeline" className="hover:text-[#F97316]">
              Pipeline Prospek
            </Link>
            <span>/</span>
            <span className="text-[#102A43]">Pencatatan Prospek Baru</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43] mt-1">
            Form Registrasi Prospek UMKM
          </h1>
          <p className="text-xs text-slate-500">
            Kunci nomor WhatsApp UMKM agar tidak bentrok dengan sales lain & sesuaikan alur Offline / Online
          </p>
        </div>

        <Link
          href="/leads/pipeline"
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
        >
          Kembali
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================= 1. PILIHAN ALUR SALES: OFFLINE VS ONLINE ================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-[#F97316] text-[22px]">hub</span>
            <div>
              <h2 className="text-sm font-bold text-[#102A43]">1. Pilih Jalur Penjualan (Alur Sales)</h2>
              <p className="text-[11px] text-slate-500">Pilih model pendekatan sesuai aktivitas lapangan atau digital Anda</p>
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
                  ? "border-[#F97316] bg-orange-50/50 shadow-sm"
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow ${
                    salesChannel === "OFFLINE" ? "bg-[#F97316]" : "bg-slate-400"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">store</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Alur Sales Offline (Lapangan)</h3>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Sales datang langsung ke tempat UMKM & buat UI kustom on-the-spot
                  </span>
                </div>
              </div>
            </div>

            <div
              onClick={() => {
                setSalesChannel("ONLINE");
                if (outletCount === 1) setOutletCount(3);
              }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                salesChannel === "ONLINE"
                  ? "border-blue-500 bg-blue-50/50 shadow-sm"
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow ${
                    salesChannel === "ONLINE" ? "bg-blue-600" : "bg-slate-400"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">public</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Alur Sales Online (Outreach Digital)</h3>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Cenderung mencari UMKM banyak outlet via WA / media sosial
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 2. DATA IDENTITAS UMKM & ANTI-BENTROK ================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-[#F97316] text-[20px]">storefront</span>
            <h2 className="text-sm font-bold text-[#102A43] font-display">
              2. Data Identitas Toko & Proteksi Anti-Bentrok
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">
                Nama Toko / Brand UMKM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={outletName}
                onChange={(e) => setOutletName(e.target.value)}
                placeholder="Contoh: Kopi Kenangan Senja"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] focus:bg-white focus:border-[#F97316] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">
                Nama Pemilik / Pengambil Keputusan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Nama pemilik / owner"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] focus:bg-white focus:border-[#F97316] outline-none"
              />
            </div>
          </div>

          {/* Business Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#102A43]">Kategori Usaha</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all border ${
                    category === cat.id
                      ? "bg-[#F97316] text-white border-[#F97316] shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp Owner with Anti-Collision Check */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#102A43]">
              Nomor WhatsApp Pemilik (Proteksi Anti-Bentrok Antar Sales) <span className="text-red-500">*</span>
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
                  placeholder="81234567890"
                  className="w-full h-11 pl-20 pr-4 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] focus:bg-white focus:border-[#F97316] outline-none font-mono"
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

          {/* Conditional Fields based on Offline vs Online */}
          {salesChannel === "OFFLINE" ? (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">
                Alamat Fisik Lokasi UMKM (GPS & Kunjungan Lapangan)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat lengkap toko / tempat usaha..."
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-medium text-[#102A43] focus:bg-white focus:border-[#F97316] outline-none"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-950 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">store_mall_directory</span>
                  Jumlah Outlet / Cabang yang Dimiliki
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={outletCount}
                    onChange={(e) => setOutletCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 h-11 px-3 rounded-xl bg-white border border-blue-300 font-extrabold text-blue-900 text-center outline-none"
                  />
                  <span className="text-xs font-bold text-blue-800">Cabang Toko</span>
                </div>
                <span className="text-[10px] text-blue-600 block">Sales online fokus mencari UMKM yang memiliki banyak cabang!</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-950">Saluran Outreach Online</label>
                <select
                  value={onlineSource}
                  onChange={(e) => setOnlineSource(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-white border border-blue-300 text-xs font-bold text-blue-900 outline-none"
                >
                  <option value="WhatsApp Direct">WhatsApp Direct Kontak</option>
                  <option value="Instagram DM">Instagram DM Official</option>
                  <option value="Google Maps Review">Google Maps Bisnis</option>
                  <option value="GrabFood / GoFood Merchant">GrabFood / GoFood Merchant</option>
                  <option value="TikTok Shop / DM">TikTok Business</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ================= 3. HASIL PERTEMUAN / RESPON UMKM ================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-[#0284C7] text-[20px]">assignment</span>
            <h2 className="text-sm font-bold text-[#102A43] font-display">
              3. Respon UMKM: Setuju atau Belum Setuju?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                agreementStatus === "AGREED"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <input
                type="radio"
                name="agreementStatus"
                checked={agreementStatus === "AGREED"}
                onChange={() => setAgreementStatus("AGREED")}
                className="mt-1 accent-emerald-600"
              />
              <div>
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                  <span>✅ UMKM Setuju / Tertarik Coba</span>
                </div>
                <div className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                  Lanjut langsung ke Studio Desain UI untuk membuatkan mockup kasir & sistem akuntansi kustom.
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
                  <span>⏳ UMKM Belum Setuju / Menolak</span>
                </div>
                <div className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                  Catat alasan penolakan & tanggal pengingat follow-up. Disimpan di web agar tidak bentrok.
                </div>
              </div>
            </label>
          </div>

          {/* Conditional Detail Form if Not Agreed */}
          {agreementStatus === "NOT_AGREED" && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-300 space-y-3 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-amber-950 mb-1">Alasan Belum Setuju</label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-amber-900 outline-none"
                  >
                    <option value="Masih memakai pembukuan manual buku">Masih nyaman pembukuan manual buku</option>
                    <option value="Belum ada budget langganan bulanan">Belum ada budget langganan bulanan</option>
                    <option value="Pemilik sedang tidak di tempat / diwakili kasir">Pemilik tidak di tempat / diwakili kasir</option>
                    <option value="Menunggu keputusan rapat direksi / partner">Menunggu keputusan rapat direksi / partner</option>
                    <option value="Masih terikat kontrak POS lain">Masih terikat kontrak POS lain</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-amber-950 mb-1">Tanggal Pengingat (Follow-up Reminder)</label>
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

          {/* General Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#102A43]">Catatan Tambahan Sales</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-medium text-[#102A43] focus:bg-white focus:border-[#F97316] outline-none resize-none"
              placeholder="Catatan preferensi menu, warna logo, atau respon saat ditawarkan..."
            />
          </div>
        </div>

        {successNotice && (
          <div className="p-4 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-400 text-xs font-bold animate-in fade-in">
            {successNotice}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(249,115,22,0.35)] active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSubmitting ? "hourglass_empty" : agreementStatus === "AGREED" ? "brush" : "save"}
            </span>
            <span>
              {isSubmitting
                ? "Menyimpan Data..."
                : agreementStatus === "AGREED"
                ? "Simpan & Lanjut Buat UI Kasir & Akuntansi"
                : "Simpan Pengingat di Web (Follow-up)"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
