import { describe, it, expect } from 'vitest';

export interface HeartbeatPayload {
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  canOperate: boolean;
  message: string;
  licenseKey: string;
  invoiceStatus?: 'OVERDUE' | 'UNPAID' | 'PAID';
  overdueInvoice?: {
    invoiceNumber: string;
    amount: number;
    billingPeriod: string;
    dueDate: string;
  };
  paymentInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export const evaluatePosOperationState = (heartbeat: HeartbeatPayload) => {
  if (heartbeat.status === 'ACTIVE' && heartbeat.canOperate) {
    return {
      posLocked: false,
      badgeColor: 'emerald',
      displayTitle: 'Operasional Normal',
      displayNotice: heartbeat.message,
      requiresPaymentModal: false,
    };
  }

  if (heartbeat.status === 'SUSPENDED') {
    const isOverdue = heartbeat.invoiceStatus === 'OVERDUE';
    return {
      posLocked: true,
      badgeColor: 'red',
      displayTitle: isOverdue ? 'Akses POS Terkunci (Tagihan Overdue)' : 'Lisensi Dinonaktifkan Admin',
      displayNotice: heartbeat.message,
      requiresPaymentModal: true,
      paymentInstructions: heartbeat.paymentInfo
        ? `Silakan transfer ke ${heartbeat.paymentInfo.bankName} ${heartbeat.paymentInfo.accountNumber} a/n ${heartbeat.paymentInfo.accountHolder}`
        : 'Hubungi administrator untuk aktivasi.',
    };
  }

  return {
    posLocked: true,
    badgeColor: 'gray',
    displayTitle: 'Lisensi Tidak Valid / Kedaluwarsa',
    displayNotice: heartbeat.message,
    requiresPaymentModal: false,
  };
};

describe('Black Box Testing: Remote Kill-Switch & POS Heartbeat Cashier State Flow', () => {
  it('Scenario 1: Active Outlet POS operates smoothly without any locks', () => {
    const payload: HeartbeatPayload = {
      status: 'ACTIVE',
      canOperate: true,
      message: 'Aplikasi operasional normal.',
      licenseKey: 'PROPOS-ACTIVE-01',
    };

    const state = evaluatePosOperationState(payload);

    expect(state.posLocked).toBe(false);
    expect(state.badgeColor).toBe('emerald');
    expect(state.requiresPaymentModal).toBe(false);
    expect(state.displayTitle).toBe('Operasional Normal');
  });

  it('Scenario 2: Overdue Outlet POS is immediately locked and presents official BCA account', () => {
    const payload: HeartbeatPayload = {
      status: 'SUSPENDED',
      canOperate: false,
      message: 'Akses transaksi dikunci. Tagihan periode Oktober 2026 belum lunas.',
      licenseKey: 'PROPOS-OVERDUE-01',
      invoiceStatus: 'OVERDUE',
      overdueInvoice: {
        invoiceNumber: 'INV-2026-10-001',
        amount: 200000,
        billingPeriod: 'Oktober 2026',
        dueDate: '2026-10-20',
      },
      paymentInfo: {
        bankName: 'BCA',
        accountNumber: '8830192831',
        accountHolder: 'PT PRO TEKNOLOGI INDONESIA',
      },
    };

    const state = evaluatePosOperationState(payload);

    expect(state.posLocked).toBe(true);
    expect(state.badgeColor).toBe('red');
    expect(state.requiresPaymentModal).toBe(true);
    expect(state.displayTitle).toContain('Tagihan Overdue');
    expect(state.paymentInstructions).toContain('8830192831');
    expect(state.paymentInstructions).toContain('PT PRO TEKNOLOGI INDONESIA');
  });

  it('Scenario 3: Admin Remote Kill-Switch locks the cashier with custom reason', () => {
    const payload: HeartbeatPayload = {
      status: 'SUSPENDED',
      canOperate: false,
      message: 'Akses dinonaktifkan sementara untuk audit toko.',
      licenseKey: 'PROPOS-MANUAL-LOCK',
    };

    const state = evaluatePosOperationState(payload);

    expect(state.posLocked).toBe(true);
    expect(state.badgeColor).toBe('red');
    expect(state.displayTitle).toBe('Lisensi Dinonaktifkan Admin');
    expect(state.displayNotice).toBe('Akses dinonaktifkan sementara untuk audit toko.');
  });

  it('Scenario 4: Expired or unrecognized license key prompts for re-registration', () => {
    const payload: HeartbeatPayload = {
      status: 'EXPIRED',
      canOperate: false,
      message: 'Kunci lisensi tidak valid atau tidak terdaftar di sistem.',
      licenseKey: 'INVALID-KEY',
    };

    const state = evaluatePosOperationState(payload);

    expect(state.posLocked).toBe(true);
    expect(state.badgeColor).toBe('gray');
    expect(state.displayTitle).toContain('Kedaluwarsa');
  });
});
