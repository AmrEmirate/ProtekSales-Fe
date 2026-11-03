import { describe, it, expect, beforeEach, vi } from 'vitest';

// Polyfill window & localStorage
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
  length: 0,
  key: () => null,
};

globalThis.localStorage = mockLocalStorage;
(globalThis as any).window = globalThis;
(globalThis as any).window.localStorage = mockLocalStorage;

import { api } from '../../services/api';

describe('Black Box Testing: Manual Transfer Withdrawal & Policy Enforcement', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    api.logout();
    vi.restoreAllMocks();
  });

  describe('Aturan 1: 1 Kali Penarikan WAJIB Menghabiskan SEMUA Saldo (All-or-Nothing)', () => {
    it('Skenario 1.A: Menolak penarikan parsial jika nominal tidak sama dengan seluruh saldo', async () => {
      api.setToken('sales1-valid-jwt');

      const readyBalance = 500000; // Rp 500.000 saldo tersedia
      const partialAmount = 250000; // Coba tarik Rp 250.000 (parsial)

      const mockErrorResponse = {
        success: false,
        message: 'Penarikan komisi wajib mencairkan seluruh saldo yang tersedia (Rp 500.000). Penarikan sebagian tidak diperkenankan sesuai kebijakan kemitraan PT Pro Teknologi.',
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      });
      globalThis.fetch = mockFetch;

      await expect(
        api.requestWithdrawal({
          amount: partialAmount,
          bankName: 'BCA',
          accountNumber: '883-091-2811',
          accountHolder: 'Budi Santoso',
        })
      ).rejects.toThrow(/wajib mencairkan seluruh saldo/i);
    });

    it('Skenario 1.B: Berhasil mencairkan jika nominal sama dengan 100% saldo siap tarik', async () => {
      api.setToken('sales1-valid-jwt');

      const fullAmount = 500000; // Rp 500.000 (100% saldo)

      const mockSuccessResponse = {
        success: true,
        message: 'Pengajuan penarikan dana berhasil dikirim, menunggu persetujuan admin.',
        data: {
          id: 'wd-nov-001',
          salesId: 'sales1-id',
          amount: fullAmount,
          taxAmount: 12500, // 2.5% PPh 21
          netAmount: 487500,
          bankName: 'BCA',
          accountNumber: '883-091-2811',
          accountHolder: 'Budi Santoso',
          status: 'PENDING',
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse,
      });
      globalThis.fetch = mockFetch;

      const res = await api.requestWithdrawal({
        amount: fullAmount,
        bankName: 'BCA',
        accountNumber: '883-091-2811',
        accountHolder: 'Budi Santoso',
      });

      expect(res.amount).toBe(500000);
      expect(res.netAmount).toBe(487500);
      expect(res.status).toBe('PENDING');
    });
  });

  describe('Aturan 2: Pembatasan Frekuensi 1 Bulan Sekali', () => {
    it('Skenario 2.A: Menolak pengajuan kedua dalam bulan kalender yang sama', async () => {
      api.setToken('sales1-valid-jwt');

      const mockFrequencyError = {
        success: false,
        message: 'Penarikan komisi hanya dapat dilakukan 1 kali per bulan. Anda sudah memiliki transaksi penarikan pada periode bulan ini.',
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockFrequencyError,
      });
      globalThis.fetch = mockFetch;

      await expect(
        api.requestWithdrawal({
          amount: 500000,
          bankName: 'BCA',
          accountNumber: '883-091-2811',
          accountHolder: 'Budi Santoso',
        })
      ).rejects.toThrow(/hanya dapat dilakukan 1 kali per bulan/i);
    });
  });

  describe('Aturan 3: Sistem Pembayaran Manual Transfer Admin HQ (Bukti Transfer & Approve)', () => {
    it('Skenario 3.A: Admin HQ memproses transfer manual dan mengunggah bukti transfer resmi m-Banking', async () => {
      api.setToken('admin-valid-jwt');

      const withdrawalId = 'wd-nov-001';
      const proofUrl = 'https://storage.vimtk.cloud/proofs/mbca-ref-8829104.jpg';
      const adminNotes = 'Transfer manual m-BCA Ref: 8829104 a/n PT Pro Teknologi ke rekening Budi Santoso';

      const mockProcessResponse = {
        success: true,
        message: 'Pengajuan penarikan dana berhasil diperbarui menjadi COMPLETED.',
        data: {
          id: withdrawalId,
          status: 'COMPLETED',
          proofUrl,
          adminNotes,
          processedAt: new Date().toISOString(),
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockProcessResponse,
      });
      globalThis.fetch = mockFetch;

      const result = await api.processWithdrawal(withdrawalId, 'COMPLETED', adminNotes, proofUrl);

      expect(result.status).toBe('COMPLETED');
      expect(result.proofUrl).toBe(proofUrl);
      expect(result.adminNotes).toContain('Ref: 8829104');

      // Verifikasi payload yang dikirim ke REST endpoint
      const lastCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(lastCall[1].body);
      expect(requestBody.status).toBe('COMPLETED');
      expect(requestBody.adminNotes).toBe(adminNotes);
      expect(requestBody.proofUrl).toBe(proofUrl);
    });

    it('Skenario 3.B: Sales mitra dapat melihat bukti transfer yang diunggah Admin', async () => {
      api.setToken('sales1-valid-jwt');

      const mockHistoryResponse = {
        success: true,
        data: [
          {
            id: 'wd-nov-001',
            amount: 500000,
            netAmount: 487500,
            status: 'COMPLETED',
            proofUrl: 'https://storage.vimtk.cloud/proofs/mbca-ref-8829104.jpg',
            adminNotes: 'Transfer manual m-BCA Ref: 8829104',
            createdAt: '2026-11-03T02:00:00Z',
          },
        ],
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockHistoryResponse,
      });
      globalThis.fetch = mockFetch;

      const history = await api.getWithdrawalHistory();
      expect(history.length).toBe(1);
      expect(history[0].status).toBe('COMPLETED');
      expect(history[0].proofUrl).toBe('https://storage.vimtk.cloud/proofs/mbca-ref-8829104.jpg');
    });
  });
});
