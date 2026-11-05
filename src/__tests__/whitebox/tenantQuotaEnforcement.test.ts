import { describe, it, expect } from 'vitest';
import { BusinessTenant } from '../blackbox/businessCommandCenter.test';

export interface QuotaAnalysis {
  usagePercent: number;
  remainingHeadroom: number;
  isAtCapacity: boolean;
  isOverCapacity: boolean;
  statusRecommendation: 'ACTIVE' | 'REVIEW' | 'SUSPENDED';
  mrr: number;
}

export const analyzeTenantQuota = (tenant: BusinessTenant): QuotaAnalysis => {
  const usagePercent =
    tenant.maxOutlets > 0
      ? Math.round((tenant.usedOutlets / tenant.maxOutlets) * 100)
      : 100;

  const remainingHeadroom = Math.max(0, tenant.maxOutlets - tenant.usedOutlets);
  const isAtCapacity = tenant.usedOutlets === tenant.maxOutlets;
  const isOverCapacity = tenant.usedOutlets > tenant.maxOutlets;

  let statusRecommendation: 'ACTIVE' | 'REVIEW' | 'SUSPENDED' = 'ACTIVE';
  if (tenant.status === 'SUSPENDED') {
    statusRecommendation = 'SUSPENDED';
  } else if (isOverCapacity || isAtCapacity) {
    statusRecommendation = 'REVIEW';
  }

  const mrr = tenant.usedOutlets * tenant.pricePerOutlet;

  return {
    usagePercent,
    remainingHeadroom,
    isAtCapacity,
    isOverCapacity,
    statusRecommendation,
    mrr,
  };
};

export const aggregateClusterMetrics = (
  tenants: BusinessTenant[]
): {
  totalTenants: number;
  activeTenants: number;
  totalOutletsRegistered: number;
  totalOutletsAllowed: number;
  platformCapacityPct: number;
  totalActivePos: number;
  totalMonthlyGmv: number;
  totalPlatformMrr: number;
} => {
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === 'ACTIVE').length;

  const totalOutletsRegistered = tenants.reduce((sum, t) => sum + t.usedOutlets, 0);
  const totalOutletsAllowed = tenants.reduce((sum, t) => sum + t.maxOutlets, 0);

  const platformCapacityPct =
    totalOutletsAllowed > 0
      ? Math.round((totalOutletsRegistered / totalOutletsAllowed) * 100)
      : 0;

  const totalActivePos = tenants.reduce((sum, t) => sum + t.activePosCount, 0);
  const totalMonthlyGmv = tenants.reduce((sum, t) => sum + t.monthlyGmv, 0);
  const totalPlatformMrr = tenants.reduce(
    (sum, t) => sum + t.usedOutlets * t.pricePerOutlet,
    0
  );

  return {
    totalTenants,
    activeTenants,
    totalOutletsRegistered,
    totalOutletsAllowed,
    platformCapacityPct,
    totalActivePos,
    totalMonthlyGmv,
    totalPlatformMrr,
  };
};

describe('White Box Testing: Tenant Quota Enforcement & Cluster Telemetry Engine', () => {
  const tenantNormal: BusinessTenant = {
    id: 'tnt-1',
    name: 'Dimsum Intan',
    slug: 'dimsumintan',
    posUrl: 'https://dimsumintan.vimtk.cloud',
    plan: 'GROWTH',
    status: 'ACTIVE',
    ownerName: 'Intan',
    ownerEmail: 'owner@dimsumintan.com',
    ownerPhone: '0812345678',
    maxOutlets: 5,
    usedOutlets: 3,
    pricePerOutlet: 350000,
    activePosCount: 6,
    monthlyGmv: 42000000,
    lastHeartbeat: '1 detik',
    createdAt: '2026-10-15',
    cluster: 'Edge AP-Southeast',
  };

  const tenantAtCapacity: BusinessTenant = {
    id: 'tnt-2',
    name: 'OtgBracket',
    slug: 'otgbracket',
    posUrl: 'https://otgbracket.vimtk.cloud',
    plan: 'STARTER',
    status: 'REVIEW',
    ownerName: 'Bambang',
    ownerEmail: 'bambang@otgbracket.com',
    ownerPhone: '0857123456',
    maxOutlets: 2,
    usedOutlets: 2,
    pricePerOutlet: 250000,
    activePosCount: 2,
    monthlyGmv: 18400000,
    lastHeartbeat: '5 detik',
    createdAt: '2026-10-20',
    cluster: 'Edge AP-Southeast',
  };

  const tenantOverCapacity: BusinessTenant = {
    id: 'tnt-3',
    name: 'Over Budget Mart',
    slug: 'overmart',
    posUrl: 'https://overmart.vimtk.cloud',
    plan: 'STARTER',
    status: 'REVIEW',
    ownerName: 'Anton',
    ownerEmail: 'anton@overmart.id',
    ownerPhone: '0813998877',
    maxOutlets: 2,
    usedOutlets: 3, // 3 > 2!
    pricePerOutlet: 250000,
    activePosCount: 3,
    monthlyGmv: 25000000,
    lastHeartbeat: '10 detik',
    createdAt: '2026-10-25',
    cluster: 'Edge AP-Southeast',
  };

  describe('1. Individual Tenant Quota Calculations', () => {
    it('calculates normal usage with available headroom and active status', () => {
      const q = analyzeTenantQuota(tenantNormal);
      expect(q.usagePercent).toBe(60); // 3 / 5 = 60%
      expect(q.remainingHeadroom).toBe(2);
      expect(q.isAtCapacity).toBe(false);
      expect(q.isOverCapacity).toBe(false);
      expect(q.statusRecommendation).toBe('ACTIVE');
      expect(q.mrr).toBe(1050000); // 3 * 350.000
    });

    it('flags tenant at 100% capacity with 0 headroom for quota review', () => {
      const q = analyzeTenantQuota(tenantAtCapacity);
      expect(q.usagePercent).toBe(100);
      expect(q.remainingHeadroom).toBe(0);
      expect(q.isAtCapacity).toBe(true);
      expect(q.statusRecommendation).toBe('REVIEW');
      expect(q.mrr).toBe(500000); // 2 * 250.000
    });

    it('detects over-capacity violations where used outlets exceed maximum quota', () => {
      const q = analyzeTenantQuota(tenantOverCapacity);
      expect(q.usagePercent).toBe(150); // 3 / 2 = 150%
      expect(q.remainingHeadroom).toBe(0);
      expect(q.isOverCapacity).toBe(true);
      expect(q.statusRecommendation).toBe('REVIEW');
    });
  });

  describe('2. Cluster-wide Multi-Tenant Aggregation', () => {
    it('accurately aggregates cluster GMV, MRR, POS terminals, and capacity percentage', () => {
      const metrics = aggregateClusterMetrics([
        tenantNormal,
        tenantAtCapacity,
        tenantOverCapacity,
      ]);

      expect(metrics.totalTenants).toBe(3);
      expect(metrics.activeTenants).toBe(1); // Only tenantNormal has status 'ACTIVE'
      expect(metrics.totalOutletsRegistered).toBe(8); // 3 + 2 + 3
      expect(metrics.totalOutletsAllowed).toBe(9); // 5 + 2 + 2
      expect(metrics.platformCapacityPct).toBe(89); // Math.round(8 / 9 * 100) = 89%
      expect(metrics.totalActivePos).toBe(11); // 6 + 2 + 3
      expect(metrics.totalMonthlyGmv).toBe(85400000); // 42jt + 18.4jt + 25jt
      expect(metrics.totalPlatformMrr).toBe(2300000); // 1.050k + 500k + 750k
    });
  });
});
