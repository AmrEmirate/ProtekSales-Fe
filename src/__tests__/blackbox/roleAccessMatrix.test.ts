import { describe, it, expect } from 'vitest';

export type UserRole = 'SALES' | 'ADMIN' | 'SUPERADMIN';

export const canAccessRoute = (role: UserRole, routePath: string): boolean => {
  // Rute Khusus Admin & Superadmin (Pusat Kontrol Bisnis SaaS & Admin ProTek)
  if (routePath.startsWith('/admin')) {
    return role === 'ADMIN' || role === 'SUPERADMIN';
  }

  // Rute Operasional Sales Lapangan & Toolkit
  const salesRoutes = [
    '/',
    '/leads/check',
    '/leads/check-in',
    '/leads/pipeline',
    '/leads/map',
    '/leads/dispute',
    '/outlets',
    '/outlets/detail',
    '/outlets/onboarding',
    '/outlets/bast',
    '/commission/wallet',
    '/commission/history',
    '/commission/withdraw',
    '/commission/leaderboard',
    '/toolkit/roi',
    '/toolkit/brochures',
    '/toolkit/education',
    '/offline-sync',
    '/profile',
  ];

  if (salesRoutes.some((r) => routePath === r || routePath.startsWith(r + '/'))) {
    // Baik SALES maupun ADMIN dapat melihat rute sales
    return true;
  }

  return true;
};

describe('Black Box Testing: Role-Based Access Control (RBAC) Navigation Matrix', () => {
  describe('Sales Partner (Mitra Sales Lapangan) Permissions', () => {
    const role: UserRole = 'SALES';

    it('should grant access to Dashboard & Leads pipeline', () => {
      expect(canAccessRoute(role, '/')).toBe(true);
      expect(canAccessRoute(role, '/leads/check')).toBe(true);
      expect(canAccessRoute(role, '/leads/pipeline')).toBe(true);
      expect(canAccessRoute(role, '/leads/map')).toBe(true);
    });

    it('should grant access to Outlets & POS Onboarding', () => {
      expect(canAccessRoute(role, '/outlets')).toBe(true);
      expect(canAccessRoute(role, '/outlets/onboarding')).toBe(true);
      expect(canAccessRoute(role, '/outlets/bast')).toBe(true);
    });

    it('should grant access to Commission Wallet & Withdrawal', () => {
      expect(canAccessRoute(role, '/commission/wallet')).toBe(true);
      expect(canAccessRoute(role, '/commission/withdraw')).toBe(true);
      expect(canAccessRoute(role, '/commission/history')).toBe(true);
    });

    it('should grant access to Sales Toolkit & ROI Calculator', () => {
      expect(canAccessRoute(role, '/toolkit/roi')).toBe(true);
      expect(canAccessRoute(role, '/toolkit/brochures')).toBe(true);
      expect(canAccessRoute(role, '/offline-sync')).toBe(true);
    });

    it('CRITICAL GUARD: should strictly deny SALES partner from accessing Super Admin Center (/admin)', () => {
      expect(canAccessRoute(role, '/admin')).toBe(false);
      expect(canAccessRoute(role, '/admin/licenses')).toBe(false);
      expect(canAccessRoute(role, '/admin/invoices')).toBe(false);
      expect(canAccessRoute(role, '/admin/disputes')).toBe(false);
    });
  });

  describe('Super Admin (Pemilik Server / Server Owner) Permissions', () => {
    const role: UserRole = 'ADMIN';

    it('should grant access to Super Admin Command Center (/admin)', () => {
      expect(canAccessRoute(role, '/admin')).toBe(true);
    });

    it('should grant access to all sales views for monitoring & mentoring', () => {
      expect(canAccessRoute(role, '/leads/pipeline')).toBe(true);
      expect(canAccessRoute(role, '/outlets')).toBe(true);
      expect(canAccessRoute(role, '/commission/wallet')).toBe(true);
    });
  });

  describe('Business Super Admin (Admin Bisnis & Multi-Tenant SaaS) Permissions', () => {
    const role: UserRole = 'SUPERADMIN';

    it('should grant access to Business Command Center (/admin/command-center)', () => {
      expect(canAccessRoute(role, '/admin/command-center')).toBe(true);
      expect(canAccessRoute(role, '/admin')).toBe(true);
      expect(canAccessRoute(role, '/admin/licenses')).toBe(true);
    });

    it('should grant access to oversee merchant outlets & pipeline', () => {
      expect(canAccessRoute(role, '/')).toBe(true);
      expect(canAccessRoute(role, '/outlets')).toBe(true);
      expect(canAccessRoute(role, '/leads/pipeline')).toBe(true);
      expect(canAccessRoute(role, '/commission/wallet')).toBe(true);
    });
  });
});

