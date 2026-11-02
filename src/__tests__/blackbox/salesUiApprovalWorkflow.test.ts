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

describe('Black Box Testing: Sales UI Approval Workflow & Hak Otorisasi Sales', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    api.logout();
    vi.restoreAllMocks();
  });

  describe('Alur End-to-End: Request Desain -> Revisi -> Hak Approval Sales -> Subdomain', () => {
    it('Skenario 1: Sales Agent memasukkan permintaan desain Stitch untuk UMKM', async () => {
      api.setToken('sales-jwt-token-123');

      const mockResponse = {
        success: true,
        message: 'Mockup UI berhasil dibuat via Stitch MCP',
        data: {
          id: 'design-req-001',
          leadId: 'lead-coffee-01',
          status: 'MOCKUP_READY',
          themeConfig: {
            primaryColor: '#8B4513',
            category: 'FNB_CAFE',
            storeName: 'Kopi Kenangan Senja',
          },
          screens: [
            { screenName: 'Cashier POS Screen', imageUrl: 'https://stitch.googleapis.com/screen1.png' },
            { screenName: 'Menu Grid Screen', imageUrl: 'https://stitch.googleapis.com/screen2.png' },
          ],
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      globalThis.fetch = mockFetch;

      const result = await api.requestUiDesign({
        leadId: 'lead-coffee-01',
        storeName: 'Kopi Kenangan Senja',
        category: 'FNB_CAFE',
        primaryColor: '#8B4513',
        styleNotes: 'Modern minimalist warm cafe ambience with quick cashier buttons',
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('MOCKUP_READY');
      expect(result.data.screens.length).toBe(2);
    });

    it('Skenario 2: UMKM meminta revisi tata letak tombol kasir ke Sales', async () => {
      api.setToken('sales-jwt-token-123');

      const mockReviseResponse = {
        success: true,
        message: 'Revisi desain berhasil diperbarui oleh Stitch MCP',
        data: {
          id: 'design-req-001',
          status: 'MOCKUP_READY',
          version: 2,
          revisionNotes: 'Ganti warna header menjadi coklat gelap dan perbesar tombol QRIS',
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockReviseResponse,
      });
      globalThis.fetch = mockFetch;

      const result = await api.reviseUiDesign(
        'design-req-001',
        'Ganti warna header menjadi coklat gelap dan perbesar tombol QRIS'
      );

      expect(result.success).toBe(true);
      expect(result.data.version).toBe(2);
      expect(result.data.status).toBe('MOCKUP_READY');
    });

    it('Skenario 3: Penegakan Hak Approval strictly milik Sales (Hak Sales)', async () => {
      // Kasus A: User tanpa token / otorisasi dilarang approve
      api.logout();

      const mockUnauthorizedFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          message: 'Hanya Sales berwenang yang dapat menyetujui desain dan memicu pembuatan aplikasi.',
        }),
      });
      globalThis.fetch = mockUnauthorizedFetch;

      await expect(api.approveUiDesign('design-req-001')).rejects.toThrow('Hanya Sales berwenang');
    });

    it('Skenario 4: Setelah Sales Approve, FE terhubung ke BE dan Subdomain Cloudflare aktif', async () => {
      api.setToken('sales-jwt-valid-token');

      const mockApprovalSuccess = {
        success: true,
        message: 'Desain berhasil disetujui oleh Sales. Frontend & Subdomain aktif.',
        data: {
          uiRequest: {
            id: 'design-req-001',
            status: 'APPROVED',
          },
          outlet: {
            id: 'outlet-kopi-01',
            name: 'Kopi Kenangan Senja',
          },
          tenantSlug: 'kopi-senja',
          posUrl: 'https://pos-kopi-senja.vimtk.cloud',
          licenseKey: 'LIC-KOPI-SENJA-2026',
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApprovalSuccess,
      });
      globalThis.fetch = mockFetch;

      const approvalResult = await api.approveUiDesign('design-req-001');

      expect(approvalResult.success).toBe(true);
      expect(approvalResult.data.uiRequest.status).toBe('APPROVED');
      expect(approvalResult.data.posUrl).toBe('https://pos-kopi-senja.vimtk.cloud');
      expect(approvalResult.data.tenantSlug).toBe('kopi-senja');
      expect(approvalResult.data.licenseKey).toBe('LIC-KOPI-SENJA-2026');
    });
  });
});
