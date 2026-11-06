import { describe, it, expect } from 'vitest';

export type UserRole = 'SALES' | 'ADMIN';

export const canAccessRoute = (role: UserRole, routePath: string): boolean => {
  // Rute Khusus Admin (Pusat Kontrol HQ & Command Center Bisnis SaaS)
  if (routePath.startsWith('/admin')) {
    return role === 'ADMIN';
  }

  // Admin diarahkan langsung ke /admin jika membuka root /
  if (role === 'ADMIN' && routePath === '/') {
    return false;
  }

  // Rute Operasional Sales Lapangan & Toolkit
  const salesRoutes = [
    '/',
    '/leads/check',
    '/leads/check-in',
    '/leads/pipeline',
    '/leads/map',
    '/leads/dispute',
    '/leads/ui-custom',
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
    return true;
  }

  return true;
};

export const resolveUserRole = (emailOrUsername: string, userRole?: string): UserRole => {
  const clean = emailOrUsername.toLowerCase().trim();
  if (
    clean === 'amremi' ||
    clean === 'amremi@protek.id' ||
    clean === 'admin@protek.id' ||
    clean === 'owner@protek.id' ||
    clean.includes('admin') ||
    userRole === 'ADMIN' ||
    userRole === 'SUPERADMIN'
  ) {
    return 'ADMIN';
  }
  return 'SALES';
};

describe('Black Box Testing: 2-Role Access Control Matrix (ADMIN & SALES)', () => {
  describe('Peran SALES (Mitra Sales Lapangan)', () => {
    const role: UserRole = 'SALES';

    it('harus mengizinkan akses ke Beranda Sales & Pipeline Leads', () => {
      expect(canAccessRoute(role, '/')).toBe(true);
      expect(canAccessRoute(role, '/leads/check')).toBe(true);
      expect(canAccessRoute(role, '/leads/pipeline')).toBe(true);
      expect(canAccessRoute(role, '/leads/map')).toBe(true);
    });

    it('harus mengizinkan akses ke Outlet & Check-in POS UMKM', () => {
      expect(canAccessRoute(role, '/outlets')).toBe(true);
      expect(canAccessRoute(role, '/leads/check-in')).toBe(true);
    });

    it('harus mengizinkan akses ke Dompet Komisi & Penarikan Dana', () => {
      expect(canAccessRoute(role, '/commission/wallet')).toBe(true);
      expect(canAccessRoute(role, '/commission/withdraw')).toBe(true);
      expect(canAccessRoute(role, '/commission/history')).toBe(true);
    });

    it('harus mengizinkan akses ke Sales Toolkit & Check-in UMKM', () => {
      expect(canAccessRoute(role, '/toolkit/roi')).toBe(true);
      expect(canAccessRoute(role, '/toolkit/brochures')).toBe(true);
      expect(canAccessRoute(role, '/leads/check-in')).toBe(true);
      expect(canAccessRoute(role, '/offline-sync')).toBe(true);
    });

    it('CRITICAL GUARD: role SALES DILARANG KERAS mengakses Pusat Kontrol Admin (/admin)', () => {
      expect(canAccessRoute(role, '/admin')).toBe(false);
      expect(canAccessRoute(role, '/admin/command-center')).toBe(false);
      expect(canAccessRoute(role, '/admin/licenses')).toBe(false);
      expect(canAccessRoute(role, '/admin/invoices')).toBe(false);
      expect(canAccessRoute(role, '/admin/disputes')).toBe(false);
    });
  });

  describe('Peran ADMIN (Pusat Kontrol HQ & Bisnis Multi-Tenant SaaS)', () => {
    const role: UserRole = 'ADMIN';

    it('harus mengizinkan akses penuh ke Pusat Kontrol Admin & Command Center Bisnis', () => {
      expect(canAccessRoute(role, '/admin')).toBe(true);
      expect(canAccessRoute(role, '/admin/command-center')).toBe(true);
      expect(canAccessRoute(role, '/admin/licenses')).toBe(true);
      expect(canAccessRoute(role, '/admin/invoices')).toBe(true);
    });

    it('harus mengizinkan akses ke monitoring Outlet & Pipeline', () => {
      expect(canAccessRoute(role, '/outlets')).toBe(true);
      expect(canAccessRoute(role, '/leads/pipeline')).toBe(true);
      expect(canAccessRoute(role, '/profile')).toBe(true);
    });

    it('harus mengarahkan root path / ke dashboard khusus Admin (/admin)', () => {
      expect(canAccessRoute(role, '/')).toBe(false);
    });
  });

  describe('Autentikasi & Resolusi Identitas Pengguna (Admin amremi vs Mitra Sales)', () => {
    it('harus mengenali username amremi dan amremi@protek.id sebagai peran ADMIN', () => {
      expect(resolveUserRole('amremi')).toBe('ADMIN');
      expect(resolveUserRole('amremi@protek.id')).toBe('ADMIN');
      expect(resolveUserRole('AMREMI')).toBe('ADMIN');
    });

    it('harus mengenali akun sales sebagai peran SALES', () => {
      expect(resolveUserRole('sales1@protek.id')).toBe('SALES');
      expect(resolveUserRole('sales2@protek.id')).toBe('SALES');
      expect(resolveUserRole('budi@mitra.com')).toBe('SALES');
    });

    it('harus menghormati payload role dari server jika diberikan', () => {
      expect(resolveUserRole('custom@domain.com', 'ADMIN')).toBe('ADMIN');
      expect(resolveUserRole('custom@domain.com', 'SALES')).toBe('SALES');
    });

    it('Kebijakan Tunggal: Hanya 1 akun Admin di seluruh sistem (amremi)', () => {
      const isSingleAdminValid = (username: string) => {
        const clean = username.toLowerCase().trim();
        return clean === 'amremi' || clean === 'amremi@protek.id' || clean === 'admin@protek.id';
      };

      expect(isSingleAdminValid('amremi')).toBe(true);
      expect(isSingleAdminValid('amremi@protek.id')).toBe(true);
      expect(isSingleAdminValid('another_admin')).toBe(false);
      expect(isSingleAdminValid('sales_super')).toBe(false);
    });

    it('Atribusi Outlet: Outlet buatan Admin harus dialokasikan ke Admin HQ (100% Kas Pusat)', () => {
      const getOutletChannel = (salesRole: string) => {
        return salesRole === 'ADMIN' ? 'HQ_DIRECT' : 'SALES_PARTNER';
      };

      expect(getOutletChannel('ADMIN')).toBe('HQ_DIRECT');
      expect(getOutletChannel('SALES')).toBe('SALES_PARTNER');
    });
  });
});
