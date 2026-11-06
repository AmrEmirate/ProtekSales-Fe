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

describe('Black Box Testing: Sales Channel Workflow (Offline & Online Multi-Outlet)', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    api.logout();
    vi.restoreAllMocks();
  });

  describe('Alur Sales Offline: Kunjungan Lapangan & Pencatatan Anti-Bentrok', () => {
    it('Skenario 1: Sales mendaftarkan kunjungan offline, jika tidak setuju tersimpan sebagai pengingat', async () => {
      api.setToken('sales-jwt-token-offline');

      const mockCheckInResponse = {
        success: true,
        message: 'Check-in kunjungan dan proteksi prospek berhasil dicatat.',
        data: {
          lead: {
            id: 'lead-offline-01',
            storeName: 'Bakso Mas Kumis',
            ownerName: 'Pak Joko',
            phone: '6281234567890',
            address: 'Jl. Surya Kencana No. 12, Bogor',
            status: 'NEW',
            notes: '[Channel: OFFLINE] [Hasil: NOT_AGREED] [Alasan: Masih nyaman manual buku] [Pengingat: 2026-11-20]',
          },
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCheckInResponse,
      });
      globalThis.fetch = mockFetch;

      const result = await api.checkInLead({
        storeName: 'Bakso Mas Kumis',
        ownerName: 'Pak Joko',
        phone: '081234567890',
        address: 'Jl. Surya Kencana No. 12, Bogor',
        salesType: 'OFFLINE',
        outcome: 'NOT_AGREED',
        rejectionReason: 'Masih nyaman manual buku',
        followUpDate: '2026-11-20',
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.lead.notes).toContain('[Channel: OFFLINE]');
      expect(result.lead.notes).toContain('[Pengingat: 2026-11-20]');
    });

    it('Skenario 2: Jika UMKM setuju, sales menekan Lanjutkan untuk aktivasi subdomain & kredensial login', async () => {
      api.setToken('sales-jwt-token-offline');

      const mockApproveResponse = {
        success: true,
        message: 'Selamat! Desain UI Bakso Mas Kumis telah disetujui (APPROVED). Subdomain aktif.',
        data: {
          uiRequest: { id: 'req-001', status: 'DEPLOYED' },
          outlet: { id: 'outlet-001', name: 'Bakso Mas Kumis' },
          tenantSlug: 'bakso-kumis',
          subdomain: 'pos-bakso-kumis.vimtk.cloud',
          posUrl: 'https://pos-bakso-kumis.vimtk.cloud',
          licenseKey: 'PROPOS-BKSO-9921',
          credentials: {
            username: 'owner_bakso_kumis',
            password: 'BaksoPassword123!',
            pin: '1234',
          },
          billing: {
            planCode: 'PAKET_150K',
            monthlyFee: 150000,
            outletCount: 1,
            subscriptionStatus: 'UNPAID',
            invoiceNumber: 'INV-MONTH1-BKSO',
          },
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApproveResponse,
      });
      globalThis.fetch = mockFetch;

      const result = await api.approveUiDesign('req-001', {
        subdomain: 'bakso-kumis',
        domainType: 'SUBDOMAIN',
        ownerUsername: 'owner_bakso_kumis',
        ownerPassword: 'BaksoPassword123!',
        ownerPin: '1234',
        planCode: 'PAKET_150K',
        outletCount: 1,
        salesType: 'OFFLINE',
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.data.credentials?.username).toBe('owner_bakso_kumis');
      expect(result.data.billing?.subscriptionStatus).toBe('UNPAID');
    });
  });

  describe('Alur Sales Online: Multi-Outlet Outreach Digital & Hostinger Custom Domain', () => {
    it('Skenario 3: Sales Online mendata UMKM multi-outlet (5 cabang) agar tidak tabrakan dengan sales lain', async () => {
      api.setToken('sales-jwt-token-online');

      const mockCheckInResponse = {
        success: true,
        message: 'Check-in kunjungan dan proteksi prospek berhasil dicatat.',
        data: {
          lead: {
            id: 'lead-online-franchise-01',
            storeName: 'Kopi Sejiwa Nusantara',
            ownerName: 'Ibu Ratna',
            phone: '6281198765432',
            address: 'Online Outreach (Jakarta & Bandung)',
            status: 'DEMO',
            notes: '[Channel: ONLINE] [Outlets: 5] [Hasil: AGREED]',
          },
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCheckInResponse,
      });
      globalThis.fetch = mockFetch;

      const result = await api.checkInLead({
        storeName: 'Kopi Sejiwa Nusantara',
        ownerName: 'Ibu Ratna',
        phone: '081198765432',
        address: 'Jakarta & Bandung',
        salesType: 'ONLINE',
        outletCount: 5,
        outcome: 'AGREED',
      });

      expect(result.lead.notes).toContain('[Channel: ONLINE]');
      expect(result.lead.notes).toContain('[Outlets: 5]');
    });

    it('Skenario 4: UMKM Multi-Outlet request Custom Domain Hostinger dan generate FE responsive', async () => {
      api.setToken('sales-jwt-token-online');

      const mockHostingerApprove = {
        success: true,
        message: 'Domain Hostinger kasir.sejiwa.com berhasil didaftarkan.',
        data: {
          uiRequest: { id: 'req-multi-01', status: 'DEPLOYED' },
          outlet: { id: 'outlet-multi-01', name: 'Kopi Sejiwa Nusantara' },
          tenantSlug: 'sejiwa-kopi',
          customDomain: 'kasir.sejiwa.com',
          posUrl: 'https://kasir.sejiwa.com',
          licenseKey: 'PROPOS-SEJIWA-2026',
          credentials: {
            username: 'owner_sejiwa',
            password: 'SejiwaPassword2026!',
            pin: '1234',
          },
          billing: {
            planCode: 'PAKET_200K',
            monthlyFee: 1000000, // 5 outlet x 200rb
            outletCount: 5,
            subscriptionStatus: 'UNPAID',
            invoiceNumber: 'INV-SEJIWA-MONTH1',
          },
          hostinger: {
            success: true,
            domain: 'kasir.sejiwa.com',
            status: 'DNS_CONFIGURED',
          },
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockHostingerApprove,
      });
      globalThis.fetch = mockFetch;

      const result = await api.approveUiDesign('req-multi-01', {
        subdomain: 'sejiwa-kopi',
        domainType: 'HOSTINGER_CUSTOM',
        customDomain: 'kasir.sejiwa.com',
        ownerUsername: 'owner_sejiwa',
        ownerPassword: 'SejiwaPassword2026!',
        ownerPin: '1234',
        planCode: 'PAKET_200K',
        outletCount: 5,
        salesType: 'ONLINE',
      });

      expect(result.success).toBe(true);
      expect(result.data.customDomain).toBe('kasir.sejiwa.com');
      expect(result.data.billing?.monthlyFee).toBe(1000000);
      expect(result.data.hostinger?.status).toBe('DNS_CONFIGURED');
    });
  });
});
