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

export interface BusinessTenant {
  id: string;
  name: string;
  slug: string;
  customDomain?: string;
  posUrl: string;
  logoUrl?: string | null;
  plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  status: 'ACTIVE' | 'REVIEW' | 'SUSPENDED';
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  maxOutlets: number;
  usedOutlets: number;
  pricePerOutlet: number;
  activePosCount: number;
  monthlyGmv: number;
  lastHeartbeat: string;
  createdAt: string;
  cluster: string;
}

describe('Black Box Testing: Superadmin Business Command Center Multi-Tenant Workflow', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    vi.restoreAllMocks();
  });

  const sampleTenants: BusinessTenant[] = [
    {
      id: 'tnt-dimsum-intan',
      name: 'Dimsum Intan Resto & Food Truck',
      slug: 'dimsumintan',
      customDomain: 'dimsumintan.vimtk.cloud',
      posUrl: 'https://dimsumintan.vimtk.cloud',
      plan: 'GROWTH',
      status: 'ACTIVE',
      ownerName: 'Ibu Intan Permata',
      ownerEmail: 'owner@dimsumintan.vimtk.cloud',
      ownerPhone: '081284525304',
      maxOutlets: 5,
      usedOutlets: 4,
      pricePerOutlet: 350000,
      activePosCount: 3,
      monthlyGmv: 0,
      lastHeartbeat: 'Live Cloud POS',
      createdAt: '2026-10-25',
      cluster: 'DKI Jakarta & Sekitarnya',
    },
    {
      id: 'tnt-barakah-food',
      name: 'Barakah Food Industry',
      slug: 'barakahfood',
      customDomain: 'barakahfood.vimtk.cloud',
      posUrl: 'https://barakahfood.vimtk.cloud',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      ownerName: 'Haji Ahmad Barakah',
      ownerEmail: 'ceo@barakahfood.id',
      ownerPhone: '+62 811-987-6543',
      maxOutlets: 20,
      usedOutlets: 12,
      pricePerOutlet: 500000,
      activePosCount: 24,
      monthlyGmv: 184500000,
      lastHeartbeat: '1 detik lalu',
      createdAt: '2026-09-01',
      cluster: 'Surabaya & Jawa Timur',
    },
    {
      id: 'tnt-otgbracket',
      name: 'OtgBracket Hardware Store',
      slug: 'otgbracket',
      customDomain: 'otgbracket.vimtk.cloud',
      posUrl: 'https://otgbracket.vimtk.cloud',
      plan: 'STARTER',
      status: 'REVIEW',
      ownerName: 'Bambang Otg',
      ownerEmail: 'owner@otgbracket.com',
      ownerPhone: '+62 856-7890-1234',
      maxOutlets: 2,
      usedOutlets: 2,
      pricePerOutlet: 250000,
      activePosCount: 2,
      monthlyGmv: 18400000,
      lastHeartbeat: '12 detik lalu',
      createdAt: '2026-10-20',
      cluster: 'Semarang',
    },
    {
      id: 'tnt-suspended-store',
      name: 'Warung Beku Nonaktif',
      slug: 'warungbeku',
      posUrl: 'https://warungbeku.vimtk.cloud',
      plan: 'STARTER',
      status: 'SUSPENDED',
      ownerName: 'Slamet',
      ownerEmail: 'slamet@warungbeku.id',
      ownerPhone: '+62 813-0000-1111',
      maxOutlets: 1,
      usedOutlets: 1,
      pricePerOutlet: 250000,
      activePosCount: 0,
      monthlyGmv: 0,
      lastHeartbeat: '30 hari lalu',
      createdAt: '2026-08-01',
      cluster: 'Solo',
    },
  ];

  const filterTenants = (
    tenants: BusinessTenant[],
    query: string,
    statusFilter: string,
    planFilter: string
  ): BusinessTenant[] => {
    return tenants.filter((t) => {
      const matchQuery =
        !query ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.slug.toLowerCase().includes(query.toLowerCase()) ||
        (t.customDomain && t.customDomain.toLowerCase().includes(query.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchPlan = planFilter === 'ALL' || t.plan === planFilter;

      return matchQuery && matchStatus && matchPlan;
    });
  };

  const registerNewTenant = (
    tenants: BusinessTenant[],
    input: {
      name: string;
      slug: string;
      customDomain?: string;
      ownerName: string;
      ownerEmail: string;
      ownerPhone: string;
      plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
      maxOutlets: number;
      pricePerOutlet: number;
    }
  ): { success: boolean; error?: string; updatedList?: BusinessTenant[] } => {
    if (!input.name || input.name.trim().length < 3) {
      return { success: false, error: 'Nama bisnis wajib diisi minimal 3 karakter!' };
    }

    const cleanSlug = input.slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!cleanSlug) {
      return { success: false, error: 'Subdomain / slug tenant wajib diisi!' };
    }

    if (tenants.some((t) => t.slug === cleanSlug)) {
      return { success: false, error: `Subdomain slug "${cleanSlug}" sudah digunakan oleh bisnis lain!` };
    }

    if (input.maxOutlets < 1) {
      return { success: false, error: 'Kuota cabang minimal 1 outlet!' };
    }

    const newTenant: BusinessTenant = {
      id: `tnt-${cleanSlug}`,
      name: input.name.trim(),
      slug: cleanSlug,
      customDomain: input.customDomain?.trim() || `${cleanSlug}.vimtk.cloud`,
      posUrl: `https://${cleanSlug}.vimtk.cloud`,
      plan: input.plan,
      status: 'ACTIVE',
      ownerName: input.ownerName.trim(),
      ownerEmail: input.ownerEmail.trim(),
      ownerPhone: input.ownerPhone.trim(),
      maxOutlets: input.maxOutlets,
      usedOutlets: 1,
      pricePerOutlet: input.pricePerOutlet,
      activePosCount: 1,
      monthlyGmv: 0,
      lastHeartbeat: 'Baru saja',
      createdAt: new Date().toISOString().split('T')[0],
      cluster: 'Edge AP-Southeast',
    };

    const updated = [newTenant, ...tenants];
    globalThis.localStorage.setItem('protek_business_tenants', JSON.stringify(updated));
    return { success: true, updatedList: updated };
  };

  const updateQuotaAndPlan = (
    tenants: BusinessTenant[],
    tenantId: string,
    newQuota: number,
    newPricePerOutlet: number,
    newPlan: 'STARTER' | 'GROWTH' | 'ENTERPRISE'
  ): BusinessTenant[] => {
    return tenants.map((t) => {
      if (t.id === tenantId) {
        return {
          ...t,
          maxOutlets: newQuota,
          pricePerOutlet: newPricePerOutlet,
          plan: newPlan,
          status: t.usedOutlets > newQuota ? 'REVIEW' : 'ACTIVE',
        };
      }
      return t;
    });
  };

  const toggleTenantStatus = (
    tenants: BusinessTenant[],
    tenantId: string
  ): BusinessTenant[] => {
    return tenants.map((t) => {
      if (t.id === tenantId) {
        return {
          ...t,
          status: t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
        };
      }
      return t;
    });
  };

  describe('1. Tenant Directory Searching and Filtering', () => {
    it('filters tenants by status tabs (ACTIVE, REVIEW, SUSPENDED)', () => {
      const active = filterTenants(sampleTenants, '', 'ACTIVE', 'ALL');
      expect(active).toHaveLength(2);
      expect(active.map((t) => t.slug)).toEqual(['dimsumintan', 'barakahfood']);

      const review = filterTenants(sampleTenants, '', 'REVIEW', 'ALL');
      expect(review).toHaveLength(1);
      expect(review[0].slug).toBe('otgbracket');

      const suspended = filterTenants(sampleTenants, '', 'SUSPENDED', 'ALL');
      expect(suspended).toHaveLength(1);
      expect(suspended[0].slug).toBe('warungbeku');
    });

    it('filters tenants by subscription plan (ENTERPRISE, GROWTH, STARTER)', () => {
      const enterprise = filterTenants(sampleTenants, '', 'ALL', 'ENTERPRISE');
      expect(enterprise).toHaveLength(1);
      expect(enterprise[0].name).toBe('Barakah Food Industry');

      const starter = filterTenants(sampleTenants, '', 'ALL', 'STARTER');
      expect(starter).toHaveLength(2);
    });

    it('searches tenants by domain or name query', () => {
      const searchResult = filterTenants(sampleTenants, 'dimsum', 'ALL', 'ALL');
      expect(searchResult).toHaveLength(1);
      expect(searchResult[0].slug).toBe('dimsumintan');

      const domainSearch = filterTenants(sampleTenants, 'barakahfood.vimtk.cloud', 'ALL', 'ALL');
      expect(domainSearch).toHaveLength(1);
      expect(domainSearch[0].slug).toBe('barakahfood');
    });
  });

  describe('2. Business Registration & Subdomain Validation', () => {
    it('successfully registers new tenant and persists to localStorage', () => {
      const res = registerNewTenant(sampleTenants, {
        name: 'Kopi Kenangan Senopati',
        slug: 'kopikenangan',
        customDomain: 'pos.kopikenangan.id',
        ownerName: 'Edward Tirtanata',
        ownerEmail: 'edward@kopikenangan.id',
        ownerPhone: '+62 811-2233-4455',
        plan: 'ENTERPRISE',
        maxOutlets: 50,
        pricePerOutlet: 500000,
      });

      expect(res.success).toBe(true);
      expect(res.updatedList).toHaveLength(5);
      expect(res.updatedList?.[0].slug).toBe('kopikenangan');
      expect(res.updatedList?.[0].status).toBe('ACTIVE');
      expect(globalThis.localStorage.getItem('protek_business_tenants')).toContain('kopikenangan');
    });

    it('rejects registration with duplicate slug', () => {
      const res = registerNewTenant(sampleTenants, {
        name: 'Dimsum Intan Cabang 2',
        slug: 'dimsumintan', // duplicate slug
        ownerName: 'Intan Permatasari',
        ownerEmail: 'owner@dimsumintan.com',
        ownerPhone: '+62 812-4455-8899',
        plan: 'GROWTH',
        maxOutlets: 5,
        pricePerOutlet: 350000,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('sudah digunakan');
    });

    it('rejects invalid empty name or zero maxOutlets', () => {
      const res = registerNewTenant(sampleTenants, {
        name: '',
        slug: 'valid-slug',
        ownerName: 'Owner',
        ownerEmail: 'owner@test.id',
        ownerPhone: '+62 812-0000-0000',
        plan: 'STARTER',
        maxOutlets: 0,
        pricePerOutlet: 250000,
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe('Nama bisnis wajib diisi minimal 3 karakter!');
    });
  });

  describe('3. Quota Modification and Tenant Suspension Lifecycle', () => {
    it('updates branch quota and recalculates status', () => {
      // Dimsum Intan has 3 usedOutlets. Upgrading quota from 5 to 10
      const updated = updateQuotaAndPlan(sampleTenants, 'tnt-dimsum-intan', 10, 350000, 'GROWTH');
      const dimsum = updated.find((t) => t.id === 'tnt-dimsum-intan');
      expect(dimsum?.maxOutlets).toBe(10);
      expect(dimsum?.status).toBe('ACTIVE');
    });

    it('flags tenant with REVIEW if quota is reduced below current used outlets', () => {
      // Dimsum Intan has 3 usedOutlets. Reducing quota to 2
      const updated = updateQuotaAndPlan(sampleTenants, 'tnt-dimsum-intan', 2, 350000, 'STARTER');
      const dimsum = updated.find((t) => t.id === 'tnt-dimsum-intan');
      expect(dimsum?.maxOutlets).toBe(2);
      expect(dimsum?.status).toBe('REVIEW');
    });

    it('toggles tenant status between ACTIVE and SUSPENDED', () => {
      // Suspend Dimsum Intan
      const suspended = toggleTenantStatus(sampleTenants, 'tnt-dimsum-intan');
      expect(suspended.find((t) => t.id === 'tnt-dimsum-intan')?.status).toBe('SUSPENDED');

      // Reactivate Dimsum Intan
      const reactivated = toggleTenantStatus(suspended, 'tnt-dimsum-intan');
      expect(reactivated.find((t) => t.id === 'tnt-dimsum-intan')?.status).toBe('ACTIVE');
    });
  });
});
