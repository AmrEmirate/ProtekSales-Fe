<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Antigravity Agent Guidelines & Workflow Rules

Instruksi dan aturan kerja otomatis untuk AI Agent dalam pengembangan **ProtekSales Frontend**:

---

## 1. Aturan Wajib Pasca-Pengerjaan Frontend (Post-Task Validation)
Setiap kali selesai mengerjakan atau memodifikasi kode di Frontend (`FE`), Agent **WAJIB** menjalankan langkah validasi berikut:

### A. Validasi TypeScript (`tsc --noEmit`)
```bash
npx tsc --noEmit
# Atau via Docker runner jika node lokal tidak tersedia:
docker run --rm -v "$(pwd)":/app -w /app node:22-alpine npx tsc --noEmit
```
* **Syarat Lolos**: 0 error kompilasi (Exit code `0`). Tidak boleh ada broken types atau props mismatch.

### B. Pengujian Black-Box & White-Box Testing (Mandatory)
Setelah lolos `tsc`, Agent **WAJIB** menjalankan pengujian unit dan fungsional:
```bash
npm test
# Atau via Docker runner:
docker run --rm -v "$(pwd)":/app -w /app node:22-alpine npm test
```
* **White-Box Testing** (`src/__tests__/whitebox/`):
  - Pengujian logika internal REST API client (`apiClient.test.ts`), antrean sinkronisasi offline (`offlineQueue.test.ts`), dan kalkulator ROI (`roiCalculator.test.ts`).
* **Black-Box Testing** (`src/__tests__/blackbox/`):
  - Pengujian end-to-end fungsional: aturan proteksi klaim lead 14 hari (`leadProtectionRules.test.ts`), validasi heartbeat lisensi POS (`posLicenseHeartbeatFlow.test.ts`), matriks izin peran Admin & Sales (`roleAccessMatrix.test.ts`), serta alur request desain Stitch hingga hak eksklusif Sales Approval (`salesUiApprovalWorkflow.test.ts`).
* **Syarat Lolos**: 100% test lulus tanpa kegagalan (0 failures).

---

## 2. Siklus Perbaikan Otomatis (Auto-Fix & Re-Check Loop)
* Jika hasil pengecekan `tsc` maupun test suite menghasilkan error atau kegagalan:
  1. **Dilarang menyerahkan kode error atau melapor selesai sebelum tuntas.**
  2. Analisis pesan error dan log test failure secara seksama (file, baris, dan akar penyebab).
  3. Lakukan perbaikan langsung (*auto-fix*) pada file yang bersangkutan.
  4. Jalankan ulang `npx tsc --noEmit` dan ulangi eksekusi test suite hingga **0 error dan 100% test lulus**.
  5. Laporkan ke user ringkasan perbaikan yang telah dilakukan.

