import { describe, it, expect, vi } from 'vitest';

export interface HardwareChecklist {
  posTabletInstalled: boolean;
  thermalPrinterPaired: boolean;
  cashDrawerTested: boolean;
  qrisStandeePlaced: boolean;
}

export interface OnboardingFormInput {
  merchantName: string;
  ownerName: string;
  phone: string;
  address: string;
  packageType: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  hardwareChecklist: HardwareChecklist;
  customerSignature: string; // Base64 signature
  salesAgentId: string;
}

export interface BastDocument {
  bastNumber: string;
  outletId: string;
  merchantName: string;
  ownerName: string;
  packageType: string;
  licenseKey: string;
  hardwareChecklist: HardwareChecklist;
  customerSignature: string;
  signedAt: string;
  salesAgentId: string;
  commissionEarned: number;
}

describe('Black Box Testing: Outlet Onboarding & Digital BAST Generation Flow', () => {
  const processOnboardingAndBast = (
    input: OnboardingFormInput
  ): { success: boolean; error?: string; bast?: BastDocument } => {
    if (!input.merchantName || input.merchantName.trim().length < 3) {
      return { success: false, error: 'Nama outlet / usaha wajib diisi minimal 3 karakter!' };
    }

    if (!input.ownerName || input.ownerName.trim().length < 3) {
      return { success: false, error: 'Nama pemilik (PIC) wajib diisi!' };
    }

    const cleanPhone = input.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return { success: false, error: 'Nomor WhatsApp pemilik tidak valid (minimal 10 digit)!' };
    }

    // Hardware verification checklist guard: All items must be checked before physical handover
    const { posTabletInstalled, thermalPrinterPaired, cashDrawerTested, qrisStandeePlaced } =
      input.hardwareChecklist;
    if (!posTabletInstalled || !thermalPrinterPaired || !cashDrawerTested || !qrisStandeePlaced) {
      return {
        success: false,
        error: 'SOP Handover BAST: Seluruh perangkat keras (Tablet, Printer, Laci Kasir, Standee QRIS) wajib telah terpasang dan lolos uji fungsi!',
      };
    }

    if (!input.customerSignature || input.customerSignature.trim() === '') {
      return {
        success: false,
        error: 'Tanda tangan digital pemilik outlet (PIC) wajib dibubuhkan pada dokumen BAST!',
      };
    }

    // Generate unique license key
    const prefix = input.merchantName.slice(0, 3).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const licenseKey = `POS-${prefix}-${rand}-2026`;

    // Commission rules: Starter: 250k, Growth: 500k, Enterprise: 1.000k
    const commissionEarned =
      input.packageType === 'ENTERPRISE' ? 1000000 : input.packageType === 'GROWTH' ? 500000 : 250000;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const bastNumber = `BAST/PRO/${dateStr}/${Math.floor(1000 + Math.random() * 9000)}`;

    const bast: BastDocument = {
      bastNumber,
      outletId: `ot-${Date.now()}`,
      merchantName: input.merchantName.trim(),
      ownerName: input.ownerName.trim(),
      packageType: input.packageType,
      licenseKey,
      hardwareChecklist: input.hardwareChecklist,
      customerSignature: input.customerSignature,
      signedAt: new Date().toISOString(),
      salesAgentId: input.salesAgentId,
      commissionEarned,
    };

    return { success: true, bast };
  };

  const validHardware: HardwareChecklist = {
    posTabletInstalled: true,
    thermalPrinterPaired: true,
    cashDrawerTested: true,
    qrisStandeePlaced: true,
  };

  it('completes full onboarding and generates valid BAST with license key and commission', () => {
    const res = processOnboardingAndBast({
      merchantName: 'Bakmi Mewah Gading Serpong',
      ownerName: 'Kevin Wijaya',
      phone: '081298765432',
      address: 'Ruko Gading Serpong Blok A No. 12',
      packageType: 'GROWTH',
      hardwareChecklist: validHardware,
      customerSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      salesAgentId: 'SLS-042',
    });

    expect(res.success).toBe(true);
    expect(res.bast).toBeDefined();
    expect(res.bast?.bastNumber).toMatch(/^BAST\/PRO\/\d{8}\/\d{4}$/);
    expect(res.bast?.licenseKey).toContain('POS-BAK-');
    expect(res.bast?.commissionEarned).toBe(500000);
    expect(res.bast?.hardwareChecklist.posTabletInstalled).toBe(true);
  });

  it('rejects BAST signing if any hardware checklist item is not verified', () => {
    const incompleteHardware: HardwareChecklist = {
      posTabletInstalled: true,
      thermalPrinterPaired: false, // Printer not paired!
      cashDrawerTested: true,
      qrisStandeePlaced: true,
    };

    const res = processOnboardingAndBast({
      merchantName: 'Kedai Kopi Bahagia',
      ownerName: 'Rudi',
      phone: '081233445566',
      address: 'Jl. Riau No. 10',
      packageType: 'STARTER',
      hardwareChecklist: incompleteHardware,
      customerSignature: 'data:image/png;base64,sig123...',
      salesAgentId: 'SLS-042',
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Seluruh perangkat keras');
    expect(res.bast).toBeUndefined();
  });

  it('rejects BAST signing without customer digital signature', () => {
    const res = processOnboardingAndBast({
      merchantName: 'Resto Padang Sejati',
      ownerName: 'Sutan Malano',
      phone: '081399887766',
      address: 'Jl. Sudirman 88',
      packageType: 'ENTERPRISE',
      hardwareChecklist: validHardware,
      customerSignature: '', // Missing signature
      salesAgentId: 'SLS-042',
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Tanda tangan digital pemilik outlet');
  });

  it('assigns 1.000.000 IDR commission for ENTERPRISE package onboarding', () => {
    const res = processOnboardingAndBast({
      merchantName: 'Franchise Ayam Crispy Nasional',
      ownerName: 'Bambang Soetrisno',
      phone: '081122334455',
      address: 'Jl. Ahmad Yani No. 15',
      packageType: 'ENTERPRISE',
      hardwareChecklist: validHardware,
      customerSignature: 'data:image/png;base64,sigValid...',
      salesAgentId: 'SLS-042',
    });

    expect(res.success).toBe(true);
    expect(res.bast?.commissionEarned).toBe(1000000);
  });
});
