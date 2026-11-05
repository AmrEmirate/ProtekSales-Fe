import { describe, it, expect } from 'vitest';
import { BastDocument, HardwareChecklist } from '../blackbox/outletOnboardingBastFlow.test';

export const generateBastSerialNumber = (date: Date, seq: number): string => {
  const yyyy = date.getFullYear().toString();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const paddedSeq = seq.toString().padStart(4, '0');
  return `BAST/PRO/${yyyy}${mm}${dd}/${paddedSeq}`;
};

export const formatBastPrintableText = (doc: BastDocument): string => {
  const hardwareLines = [
    `[${doc.hardwareChecklist.posTabletInstalled ? 'V' : 'X'}] Tablet Android POS Kasir (Terkonfigurasi)`,
    `[${doc.hardwareChecklist.thermalPrinterPaired ? 'V' : 'X'}] Mini Thermal Bluetooth Printer 58mm/80mm`,
    `[${doc.hardwareChecklist.cashDrawerTested ? 'V' : 'X'}] Electronic RJ11 Auto Cash Drawer`,
    `[${doc.hardwareChecklist.qrisStandeePlaced ? 'V' : 'X'}] Akrilik Standee QRIS Dinamis & BYOK`,
  ].join('\n');

  return (
    `BERITA ACARA SERAH TERIMA (BAST)\n` +
    `PT PRO TEKNOLOGI INTERNASIONAL\n` +
    `Nomor: ${doc.bastNumber}\n` +
    `--------------------------------------------------\n` +
    `Merchant  : ${doc.merchantName}\n` +
    `Owner PIC : ${doc.ownerName}\n` +
    `Paket     : ${doc.packageType}\n` +
    `Lisensi   : ${doc.licenseKey}\n` +
    `Agen SLS  : ${doc.salesAgentId}\n` +
    `--------------------------------------------------\n` +
    `PERANGKAT KERAS YANG DISERAHKAN:\n` +
    `${hardwareLines}\n` +
    `--------------------------------------------------\n` +
    `Status Dokumen: DITANDATANGANI SECARA ELEKTRONIK\n` +
    `Tanggal TTD   : ${new Date(doc.signedAt).toLocaleString('id-ID')}\n`
  );
};

describe('White Box Testing: BAST Serial Generation & Physical Verification Formatter', () => {
  it('generates compliant BAST serial number with date stamp and zero-padded sequence', () => {
    const fixedDate = new Date(2026, 10, 5); // 5 November 2026
    const serial1 = generateBastSerialNumber(fixedDate, 42);
    expect(serial1).toBe('BAST/PRO/20261105/0042');

    const serial2 = generateBastSerialNumber(fixedDate, 1089);
    expect(serial2).toBe('BAST/PRO/20261105/1089');
  });

  it('formats complete printable BAST text containing all hardware status indicators', () => {
    const mockChecklist: HardwareChecklist = {
      posTabletInstalled: true,
      thermalPrinterPaired: true,
      cashDrawerTested: true,
      qrisStandeePlaced: true,
    };

    const mockBast: BastDocument = {
      bastNumber: 'BAST/PRO/20261105/0123',
      outletId: 'ot-88',
      merchantName: 'Kopi Kenangan Dago',
      ownerName: 'Kevin Wijaya',
      packageType: 'GROWTH',
      licenseKey: 'POS-KOP-8821-2026',
      hardwareChecklist: mockChecklist,
      customerSignature: 'data:image/png;base64,signature...',
      signedAt: '2026-11-05T09:30:00Z',
      salesAgentId: 'SLS-042',
      commissionEarned: 500000,
    };

    const text = formatBastPrintableText(mockBast);
    expect(text).toContain('BERITA ACARA SERAH TERIMA (BAST)');
    expect(text).toContain('Nomor: BAST/PRO/20261105/0123');
    expect(text).toContain('Merchant  : Kopi Kenangan Dago');
    expect(text).toContain('Lisensi   : POS-KOP-8821-2026');
    expect(text).toContain('[V] Tablet Android POS Kasir (Terkonfigurasi)');
    expect(text).toContain('[V] Mini Thermal Bluetooth Printer 58mm/80mm');
    expect(text).toContain('[V] Electronic RJ11 Auto Cash Drawer');
    expect(text).toContain('[V] Akrilik Standee QRIS Dinamis & BYOK');
    expect(text).toContain('Status Dokumen: DITANDATANGANI SECARA ELEKTRONIK');
  });
});
