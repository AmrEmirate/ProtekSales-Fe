"use client";

import React, { useState } from "react";
import Link from "next/link";

interface ObjectionItem {
  id: string;
  title: string;
  category: string;
  customerDoubt: string;
  salesResponse: string;
  keyPoints: string[];
}

export default function SalesEducationPage() {
  const [activeTab, setActiveTab] = useState<string>("OBJECTIONS");

  const objections: ObjectionItem[] = [
    {
      id: "OBJ-01",
      title: "Keraguan Biaya Langganan Bulanan (Subscription vs Beli Putus)",
      category: "Harga & Finansial",
      customerDoubt: "Ngapain bayar langganan bulanan, bikin boros. Mending beli mesin kasir cash register putus sekali beres.",
      salesResponse: "Pak/Bu, mesin kasir jadul sekali beli tidak bisa mendeteksi kebocoran nota dan tidak tahu menu mana yang paling laris. Dengan ProTek POS seharga 8 ribu rupiah per hari (kurang dari segelas kopi), sistem kami menyelamatkan kebocoran rata-rata 4 juta rupiah per bulan. Uang yang diselamatkan jauh melampaui biaya sistem.",
      keyPoints: [
        "Pakai Kalkulator ROI untuk simulasi angka riil di depan owner",
        "Komparasikan biaya 8 ribu/hari vs risiko kehilangan stok puluhan juta",
        "Garansi update fitur & cloud backup tanpa biaya tambahan",
      ],
    },
    {
      id: "OBJ-02",
      title: "Karyawan Gaptek / Takut Sulit Dioperasikan",
      category: "Teknis & Kemudahan",
      customerDoubt: "Kasir saya ibu-ibu dan anak baru sering ganti-ganti, takut mereka pusing pakainya.",
      salesResponse: "Justru ProTek dirancang seperti aplikasi smartphone biasa yang ada gambar menunya, Pak/Bu. Tekan gambar kopi, langsung keluar nominal dan cetak struk otomatis. Rata-rata kasir baru cukup ditraining 15 menit sudah langsung mahir. Ditambah lagi, tim support kami siap dipanggil jika ada kendala.",
      keyPoints: [
        "Buka demo aplikasi di tablet, minta owner langsung mencoba tekan 1 pesanan",
        "Jelaskan ada training gratis sampai kasir benar-benar lancar",
        "Hak akses kasir dibatasi PIN sehingga kasir tidak bisa manipulasi laporan",
      ],
    },
    {
      id: "OBJ-03",
      title: "Kekhawatiran Internet Putus / Mati Lampu",
      category: "Konektivitas & Keandalan",
      customerDoubt: "Kalau internet Indihome lemot atau mati lampu, kasir mati dong? Bisnis saya berhenti?",
      salesResponse: "Tidak sama sekali, Bu. ProTek POS memiliki arsitektur Hybrid Offline. Jika internet putus, kasir tetap bisa cetak struk, simpan data di memori mesin, dan buka laci kasir seperti biasa. Begitu internet nyala lagi, data otomatis tersinkronisasi ke cloud tanpa ada yang hilang.",
      keyPoints: [
        "Tekankan fitur 'Mode Offline Otomatis' yang tidak dimiliki kasir berbasis browser",
        "Terminal Sunmi dilengkapi baterai cadangan yang tahan hingga beberapa jam pemakaian",
      ],
    },
    {
      id: "OBJ-04",
      title: "Bandingkan Dengan Aplikasi Kasir Gratisan di Play Store",
      category: "Kompetitor",
      customerDoubt: "Di Play Store kan banyak aplikasi kasir yang gratis, kenapa harus bayar ProTek?",
      salesResponse: "Aplikasi gratisan biasanya menyimpan data di server publik yang rawan hilang, penuh iklan yang mengganggu saat kasir sibuk, dan yang terpenting: tidak ada teknisi yang datang kalau mesin ngadat. Bersama PT Pro Teknologi, bapak/ibu didampingi teknisi resmi di kota ini dan garansi hardware 12 bulan penuh.",
      keyPoints: [
        "Tekankan kehadiran fisik sales & service center resmi PT Pro Teknologi",
        "Keamanan data transaksi merchant terenkripsi standar perbankan",
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#102A43]">Sales Toolkit</span>
            <span>/</span>
            <span className="text-[#102A43]">Pusat Edukasi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Pusat Edukasi & Script Penjualan POS
          </h1>
          <p className="text-xs text-slate-500">
            Panduan objection handling, psikologi negosiasi merchant, dan teknik closing tercepat di lapangan
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <button
            onClick={() => setActiveTab("OBJECTIONS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "OBJECTIONS" ? "bg-[#102A43] text-white" : "text-slate-600"
            }`}
          >
            Objection Handling
          </button>
          <button
            onClick={() => setActiveTab("STEPS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "STEPS" ? "bg-[#102A43] text-white" : "text-slate-600"
            }`}
          >
            5 Langkah Closing
          </button>
        </div>
      </div>

      {activeTab === "OBJECTIONS" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {objections.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                    {item.category}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{item.id}</span>
                </div>

                <h3 className="text-base font-bold text-[#102A43] font-display">
                  {item.title}
                </h3>

                {/* Customer Quote */}
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 italic">
                  <strong>Keraguan Klien:</strong> &ldquo;{item.customerDoubt}&rdquo;
                </div>

                {/* Sales Script */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                  <strong className="text-emerald-800 block mb-1">
                    Jawaban Script Sales yang Terbukti Closing:
                  </strong>
                  &ldquo;{item.salesResponse}&rdquo;
                </div>
              </div>

              {/* Key Battle Points */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Kunci Keberhasilan:
                </span>
                <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                  {item.keyPoints.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 5 Steps to Field Closing */
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E2E8F0] space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold text-[#102A43] font-display">
              5 Langkah Closing Kilat di Tempat Usaha Merchant
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Metodologi penjualan resmi yang diajarkan pada program training mitra sales PT Pro Teknologi
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#102A43] text-white flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">Ice Breaking & Validasi Jam Sibuk</h4>
                <p className="text-slate-600 leading-relaxed">
                  Datang di luar jam ramai (pukul 10:00 - 11:30 atau 14:00 - 16:00). Beli salah satu produk merchant sebagai tanda apresiasi awal sebelum membuka percakapan bisnis.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#102A43] text-white flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">Identifikasi Titik Kebocoran Finansial</h4>
                <p className="text-slate-600 leading-relaxed">
                  Tanyakan secara santai: &ldquo;Pak/Bu, biasanya kalau lagi tutup toko malam hari, berapa lama waktu yang dibutuhkan buat ngitung uang dan cocokin sama nota manual? Pernah selisih?&rdquo;
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">Buka Simulasi Kalkulator ROI di Depan Owner</h4>
                <p className="text-slate-600 leading-relaxed">
                  Gunakan menu <Link href="/toolkit/roi" className="text-[#F97316] font-bold underline">Kalkulator ROI</Link> di tablet Anda. Masukkan transaksi harian mereka dan tunjukkan angka potensi penghematan jutaan rupiah per bulan.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#102A43] text-white flex items-center justify-center font-bold text-sm shrink-0">
                4
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">Demo Touchscreen & QRIS Kilat 4 Detik</h4>
                <p className="text-slate-600 leading-relaxed">
                  Tunjukkan betapa mudahnya scan QRIS otomatis dan struk tercetak seketika tanpa perlu kalkulator manual.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                5
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-emerald-950 text-sm">Closing Langsung & Tanda Tangan BAST</h4>
                <p className="text-emerald-900 leading-relaxed">
                  Buka dokumen <Link href="/outlets/bast" className="text-emerald-800 font-bold underline">BAST Digital</Link>, serahkan perangkat kasir ke meja, dan minta tanda tangan digital di layar untuk mengaktifkan garansi resmi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
