"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

export default function CheckInPage() {
  const router = useRouter();
  const { addVisit, isOffline } = useApp();

  const [outletName, setOutletName] = useState("Toko Rezeki Abadi");
  const [category, setCategory] = useState("Retail / Minimarket");
  const [ownerName, setOwnerName] = useState("H. Syamsul Arifin");
  const [waNumber, setWaNumber] = useState("81288921045");
  const [notes, setNotes] = useState("Pemilik tertarik paket dual-screen untuk kasir utama dan display pelanggan.");
  const [outcome, setOutcome] = useState<"VERIFIED" | "DEAL">("VERIFIED");
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const categories = [
    { id: "Retail / Minimarket", label: "Retail / Mart", icon: "store" },
    { id: "Kafe & Resto", label: "Kafe / Resto", icon: "restaurant" },
    { id: "Apotek / Klinik", label: "Apotek / Medis", icon: "local_pharmacy" },
    { id: "Jasa & Lainnya", label: "Jasa / Lainnya", icon: "dry_cleaning" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const sanitizedPhone = waNumber.replace(/[^0-9]/g, "");
      await api.checkInLead({
        storeName: outletName,
        ownerName: ownerName,
        phone: sanitizedPhone,
        address: "Alamat Terverifikasi GPS Cilandak",
        latitude: -6.2918,
        longitude: 106.7972,
        notes: `Kategori: ${category}. Catatan: ${notes}`,
      });
      setSuccessNotice("Check-in & proteksi 30 hari berhasil dicatat di server!");
    } catch {
      setSuccessNotice(
        isOffline
          ? "Check-in tersimpan di antrean offline. Akan disinkronisasi saat online."
          : "Check-in tercatat lokal (Menunggu koneksi server). Tersimpan aman."
      );
    } finally {
      addVisit({
        outletName,
        category,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        date: "Hari ini",
        distance: "12 m dari titik GPS (Dalam Radius)",
        status: outcome,
        notes,
        coordinates: { lat: -6.2918, lng: 106.7972 },
      });

      setIsSubmitting(false);
      setTimeout(() => {
        router.push("/leads/pipeline");
      }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Title & Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <Link href="/leads/pipeline" className="hover:text-[#F97316]">Pipeline</Link>
            <span>/</span>
            <span className="text-[#102A43]">Check-in Kunjungan Baru</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Form Check-in Lapangan
          </h1>
          <p className="text-xs text-slate-500">
            Bukti verifikasi kunjungan sales dengan validasi GPS & foto tempat usaha
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
        {/* GPS Geofence Box */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0B1D3A] to-[#1E3E62] text-white p-5 sm:p-6 shadow-sm border border-[#1E3E62] space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">pin_drop</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                  Geolokasi Terverifikasi
                </span>
                <h3 className="text-base font-bold font-display text-white">
                  Cilandak, Jakarta Selatan
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert("GPS Dikalibrasi Ulang: Akurasi ± 6 meter")}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>Kalibrasi GPS</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Jl. Fatmawati Raya No. 42B, RT 04 / RW 02, Gandaria Selatan, Cilandak, DKI Jakarta 12420
          </p>

          <div className="p-2.5 rounded-xl bg-[#0B1D3A]/80 border border-[#1E3E62] flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Lat: -6.2918 | Long: 106.7972 (Akurasi Tinggi)</span>
            </div>
            <span className="text-emerald-400 font-bold text-[11px]">Radius Valid</span>
          </div>
        </div>

        {/* Outlet Identity Details */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-[#F97316] text-[20px]">storefront</span>
            <h2 className="text-sm font-bold text-[#102A43] font-display">
              Data Identitas Outlet / Mitra
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A43]">
                Nama Toko / Outlet <span className="text-red-500">*</span>
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
                Nama Pemilik / PIC <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Nama pengambil keputusan"
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

          {/* WhatsApp Owner */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#102A43]">
              Nomor WhatsApp Pemilik (Untuk Kunci Prospek)
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-[#102A43] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                <span>+62</span>
              </div>
              <input
                type="tel"
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                className="w-full h-11 pl-22 pr-10 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-semibold text-[#102A43] focus:bg-white focus:border-[#F97316] outline-none"
              />
              <span className="absolute right-3 material-symbols-outlined text-[18px] text-emerald-600">
                verified
              </span>
            </div>
          </div>
        </div>

        {/* Meeting Notes, Photo Proof & Outcome */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-[#0284C7] text-[20px]">assignment</span>
            <h2 className="text-sm font-bold text-[#102A43] font-display">
              Catatan Kunjungan & Hasil Pertemuan
            </h2>
          </div>

          {/* Outcome Radio */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#102A43]">Hasil Pertemuan</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  outcome === "VERIFIED"
                    ? "bg-blue-50 border-blue-400 text-blue-950 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  checked={outcome === "VERIFIED"}
                  onChange={() => setOutcome("VERIFIED")}
                  className="accent-[#0284C7]"
                />
                <div>
                  <div className="text-xs font-bold">Kunjungan / Demo Lanjutan</div>
                  <div className="text-[11px] text-slate-500">Merchant tertarik, menjadwalkan demo sistem</div>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  outcome === "DEAL"
                    ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  checked={outcome === "DEAL"}
                  onChange={() => setOutcome("DEAL")}
                  className="accent-emerald-600"
                />
                <div>
                  <div className="text-xs font-bold text-emerald-900">Closing Deal POS!</div>
                  <div className="text-[11px] text-emerald-700">Setuju berlangganan & siap BAST hardware</div>
                </div>
              </label>
            </div>
          </div>

          {/* Meeting Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#102A43]">
              Catatan Hasil Pembahasan di Lapangan
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-[#CBD5E1] text-xs font-medium text-[#102A43] focus:bg-white focus:border-[#F97316] outline-none"
              placeholder="Tuliskan kebutuhan khusus merchant, kendala yang dihadapi, atau komitmen tindak lanjut..."
            />
          </div>

          {/* Photo Proof Upload Simulation */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#102A43]">
              Bukti Foto Toko / Pertemuan (GPS Timestamped)
            </label>
            <div
              onClick={() => setPhotoUploaded(true)}
              className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                photoUploaded
                  ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                  : "bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-500"
              }`}
            >
              <span className="material-symbols-outlined text-[32px] text-[#F97316]">
                {photoUploaded ? "check_circle" : "add_a_photo"}
              </span>
              <div className="text-xs font-bold text-[#102A43] mt-2">
                {photoUploaded
                  ? "Foto Toko Berhasil Terlampir (Watermark GPS Aktif)"
                  : "Ambil Foto Toko dari Kamera / Unggah Bukti"}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Foto akan disematkan koordinat lokasi untuk audit komisi otomatis
              </p>
            </div>
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
            className="flex-1 h-12 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(249,115,22,0.35)] active:scale-98 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSubmitting ? "hourglass_empty" : "send"}
            </span>
            <span>
              {isSubmitting
                ? "Menyimpan Data..."
                : isOffline
                ? "Simpan ke Antrean Offline"
                : "Kirim Verifikasi Check-in Kunjungan"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
