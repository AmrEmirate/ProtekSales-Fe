import { describe, it, expect, beforeEach, vi } from 'vitest';

// Polyfill window & localStorage untuk lingkungan pengujian Node
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

describe('White Box Testing: api.ts (REST API Client)', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    api.logout();
    vi.restoreAllMocks();
  });

  describe('Token & Sesi Lifecycle', () => {
    it('should initially return null when no token is in storage', () => {
      expect(api.getToken()).toBeNull();
    });

    it('should properly store token in localStorage when setToken is called', () => {
      const sampleToken = 'jwt-token-sample-12345';
      api.setToken(sampleToken);

      expect(api.getToken()).toBe(sampleToken);
      expect(globalThis.localStorage.getItem('protek_auth_token')).toBe(sampleToken);
    });

    it('should clear token from localStorage on logout()', () => {
      api.setToken('sample-token');
      api.logout();

      expect(api.getToken()).toBeNull();
      expect(globalThis.localStorage.getItem('protek_auth_token')).toBeNull();
    });
  });

  describe('Phone Sanitization in checkLeadAvailability()', () => {
    it('should strip non-numeric characters before passing to endpoint', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Toko bebas',
          data: { canClaim: true },
        }),
      });
      globalThis.fetch = mockFetch;

      const rawPhone = '+62 812-3456-7890';
      await api.checkLeadAvailability(rawPhone);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('phone=6281234567890');
      expect(calledUrl).not.toContain('+');
      expect(calledUrl).not.toContain('-');
      expect(calledUrl).not.toContain(' ');
    });
  });

  describe('Authorization Headers & Error Handlers', () => {
    it('should attach Bearer token in request headers when user is authenticated', async () => {
      const token = 'active-jwt-token-987';
      api.setToken(token);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      globalThis.fetch = mockFetch;

      await api.getMyLeads();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const options = mockFetch.mock.calls[0][1];
      expect(options.headers['Authorization']).toBe(`Bearer ${token}`);
    });

    it('should throw an error with server message when HTTP response is not ok', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: 'Nomor telepon/WhatsApp tidak valid.',
        }),
      });
      globalThis.fetch = mockFetch;

      await expect(api.checkInLead({
        storeName: 'Test',
        ownerName: 'Owner',
        phone: 'invalid',
        address: 'Alamat',
      })).rejects.toThrow('Nomor telepon/WhatsApp tidak valid.');
    });
  });

  describe('UI Design & Sales Approval Endpoint Binding', () => {
    it('should POST correctly formatted payload to /ui-design/request', async () => {
      api.setToken('auth-token-xyz');
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: 'ok', data: { id: 'req-1' } }),
      });
      globalThis.fetch = mockFetch;

      await api.requestUiDesign({
        leadId: 'lead-123',
        storeName: 'Boba Tea',
        category: 'FNB_BEVERAGE',
        primaryColor: '#00BFFF',
        styleNotes: 'Bright blue beverage theme',
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/ui-design/request');
      expect(options.method).toBe('POST');
      const body = JSON.parse(options.body);
      expect(body.storeName).toBe('Boba Tea');
      expect(body.category).toBe('FNB_BEVERAGE');
      expect(body.primaryColor).toBe('#00BFFF');
    });

    it('should POST revision prompt to /ui-design/:id/revise', async () => {
      api.setToken('auth-token-xyz');
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: 'ok', data: { id: 'req-1', status: 'MOCKUP_READY' } }),
      });
      globalThis.fetch = mockFetch;

      await api.reviseUiDesign('req-1', 'Make buttons larger');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/ui-design/req-1/revise');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body).revisionNotes).toBe('Make buttons larger');
    });

    it('should POST approval to /ui-design/:id/approve', async () => {
      api.setToken('auth-token-xyz');
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'ok',
          data: {
            uiRequest: { id: 'req-1', status: 'APPROVED' },
            outlet: { id: 'outlet-1' },
            tenantSlug: 'boba-tea',
            posUrl: 'https://pos-boba-tea.vimtk.cloud',
            licenseKey: 'LIC-1',
          },
        }),
      });
      globalThis.fetch = mockFetch;

      const res = await api.approveUiDesign('req-1');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/ui-design/req-1/approve');
      expect(options.method).toBe('POST');
      expect(res.data.tenantSlug).toBe('boba-tea');
    });
  });

  describe('Admin Sales Management (createSalesAccount & deleteSalesAccount)', () => {
    it('should POST /admin/sales with correct payload when creating sales partner', async () => {
      api.setToken('admin-token-123');
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Akun sales berhasil dibuat',
          data: { id: 'sales-new-1', name: 'Sales Baru' },
        }),
      });
      globalThis.fetch = mockFetch;

      const payload = {
        name: 'Budi Sales',
        email: 'budi@vimtk.cloud',
        password: 'securePassword123!',
        phone: '628123456789',
        tier: 'GOLD',
        commissionRate: 30,
        bankName: 'BCA',
        bankAccountNumber: '9876543210',
        bankAccountHolder: 'Budi Sales',
      };

      const res = await api.createSalesAccount(payload);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/admin/sales');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body).name).toBe('Budi Sales');
      expect(JSON.parse(options.body).commissionRate).toBe(30);
      expect(res.data.id).toBe('sales-new-1');
    });

    it('should DELETE /admin/sales/:id when deleting sales partner', async () => {
      api.setToken('admin-token-123');
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Akun sales berhasil dihapus',
        }),
      });
      globalThis.fetch = mockFetch;

      const res = await api.deleteSalesAccount('sales-123');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/admin/sales/sales-123');
      expect(options.method).toBe('DELETE');
      expect(res.success).toBe(true);
    });
  });
});
