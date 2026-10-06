"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";

export default function BastPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Setup canvas size and DPI scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = "#102A43";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#F97316]">Dashboard</Link>
            <span>/</span>
            <Link href="/outlets" className="hover:text-[#F97316]">Outlets</Link>
            <span>/</span>
            <span className="text-[#102A43]">BAST Hardware</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#102A43]">
            Berita Acara Serah Terima (BAST) Hardware POS
          </h1>
          <p className="text-xs text-slate-500">
            Dokumen legal penyerahan unit kasir resmi PT Pro Teknologi dengan tanda tangan digital biometrik
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            No. Dokumen: BAST-2026-10-8821
          </span>
        </div>
      </div>

      {/* Main Grid: 12 Columns for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 Cols): Client Data & Hardware Checklist */}
        <div className="lg:col-span-6 space-y-6">
          {/* Client Info */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-[#F97316] text-[20px]">storefront</span>
              <h2 className="text-sm font-bold text-[#102A43] font-display">
                Data Identitas Merchant Penerima
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Nama Toko</span>
                <span className="font-bold text-slate-900 text-sm">Kafe Kopi Dua Jiwa</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Pemilik / PIC</span>
                <span className="font-bold text-slate-900 text-sm">Ibu Diana Lestari</span>
              </div>

              <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Alamat Pemasangan</span>
                <span className="font-medium text-slate-700">Jl. Senopati No. 41, Kebayoran Baru, Jakarta Selatan</span>
              </div>
            </div>
          </div>

          {/* Hardware Checklist */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0284C7] text-[20px]">devices</span>
                <h2 className="text-sm font-bold text-[#102A43] font-display">
                  Kelengkapan Perangkat Keras POS
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                5/5 Terpasang Lengkap
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 accent-[#F97316] w-4 h-4 rounded" />
                <div>
                  <div className="font-bold text-slate-900">Terminal POS All-in-One Sunmi T2 Octa</div>
                  <div className="text-[11px] text-slate-500 font-mono">S/N: T2-JKT-882190 • Segel Resmi Utuh</div>
                </div>
              </label>

              <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 accent-[#F97316] w-4 h-4 rounded" />
                <div>
                  <div className="font-bold text-slate-900">Thermal Printer 58mm Bluetooth & USB</div>
                  <div className="text-[11px] text-slate-500 font-mono">S/N: PRN-58-77123 • Adaptor & Kabel Power AC</div>
                </div>
              </label>

              <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 accent-[#F97316] w-4 h-4 rounded" />
                <div>
                  <div className="font-bold text-slate-900">Cash Drawer Otomatis RJ11 (4 Kertas / 4 Koin)</div>
                  <div className="text-[11px] text-slate-500">Termasuk 2 Kunci Pengaman Fisik</div>
                </div>
              </label>

              <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 accent-[#F97316] w-4 h-4 rounded" />
                <div>
                  <div className="font-bold text-slate-900">5 Roll Kertas Struk Thermal 58x40mm Premium</div>
                  <div className="text-[11px] text-slate-500">BPA Free & Cetak Kontras Tinggi</div>
                </div>
              </label>

              <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 accent-[#F97316] w-4 h-4 rounded" />
                <div>
                  <div className="font-bold text-slate-900">Acrylic QRIS Standee Meja Kasir ProTek</div>
                  <div className="text-[11px] text-slate-500">Stiker QRIS Dinamis Terintegrasi</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (6 Cols): Legal Clause & Interactive HTML5 Signature Pad */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F97316] text-[20px]">draw</span>
                <h2 className="text-sm font-bold text-[#102A43] font-display">
                  Tanda Tangan Digital Penerima (PIC)
                </h2>
              </div>
              <button
                type="button"
                onClick={clearSignature}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>Ulangi</span>
              </button>
            </div>

            {/* Signature Canvas */}
            <div className="relative rounded-2xl bg-slate-50 border-2 border-dashed border-[#CBD5E1] p-2 flex flex-col justify-center min-h-[160px]">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-36 rounded-xl cursor-crosshair touch-none bg-white shadow-inner"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-1.5">
                <span>Goreskan tanda tangan dengan jari atau stylus</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>Tervalidasi Digital</span>
                </span>
              </div>
            </div>

            {/* Legal Statement */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <strong>Klausul Hukum & Garansi Resmi:</strong> Penerima menyatakan unit dalam kondisi 100% baru & normal, telah menerima pengenalan operasional, dan garansi resmi hardware berlaku selama 12 bulan kalender dari PT Pro Teknologi.
            </div>

            {/* Security Token Hash */}
            <div className="p-3 rounded-xl bg-[#0B1D3A] text-white flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified_user</span>
                <span className="text-slate-300 text-[11px]">SHA256: 4b92-e81a-20261005-882190</span>
              </div>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                SSL VALID
              </span>
            </div>

            {submitted && (
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-400 text-xs font-bold animate-in fade-in flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-700">verified</span>
                <span>BAST Hardware berhasil ditandatangani dan disimpan ke server. Sertifikat lisensi POS telah diterbitkan.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full h-12 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(249,115,22,0.35)] active:scale-98 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">task_alt</span>
                <span>Kirim BAST & Terbitkan Lisensi POS</span>
              </button>

              <a
                href="https://wa.me/6281766554433?text=Halo%20Ibu%20Diana,%20berikut%20salinan%20dokumen%20BAST%20resmi%20perangkat%20POS%20PT%20Pro%20Teknologi."
                target="_blank"
                rel="noreferrer"
                className="w-full h-11 rounded-xl bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#102A43] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-emerald-600">chat</span>
                <span>Kirim Salinan PDF via WhatsApp Klien</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
