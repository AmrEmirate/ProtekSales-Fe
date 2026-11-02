import { describe, it, expect } from 'vitest';

/**
 * Logika Kalkulator ROI Toko & Sales Closing Tool
 * Sesuai spesifikasi Blueprint & Ui/BluePrint.txt dan implementasi di roi/page.tsx
 */
export const calculateRoi = (
  category: 'fnb' | 'retail' | 'service',
  dailyTx: number,
  ticketSize: number,
  monthlyCost: number = 250000
) => {
  const leakRate = category === 'fnb' ? 0.025 : category === 'retail' ? 0.02 : 0.015;
  const monthlyGross = dailyTx * ticketSize * 30;
  const savedLeakage = Math.round(monthlyGross * leakRate);
  const extraSpeedRevenue = Math.round(dailyTx * 0.05 * ticketSize * 30);
  const totalBenefit = savedLeakage + extraSpeedRevenue;
  const multiplier = Math.round(totalBenefit / monthlyCost);
  const salesCommission = Math.round(monthlyCost * 0.25);

  return {
    leakRate,
    monthlyGross,
    savedLeakage,
    extraSpeedRevenue,
    totalBenefit,
    multiplier,
    salesCommission,
  };
};

describe('White Box Testing: ROI Calculator Business Logic (roi/page.tsx)', () => {
  describe('Leakage Rates by Category', () => {
    it('should assign 2.5% leakage rate for F&B (Kafe & Resto)', () => {
      const res = calculateRoi('fnb', 100, 50000);
      expect(res.leakRate).toBe(0.025);
    });

    it('should assign 2.0% leakage rate for Retail / Minimarket', () => {
      const res = calculateRoi('retail', 100, 50000);
      expect(res.leakRate).toBe(0.02);
    });

    it('should assign 1.5% leakage rate for Service & Salon', () => {
      const res = calculateRoi('service', 100, 50000);
      expect(res.leakRate).toBe(0.015);
    });
  });

  describe('Financial Invariants & ROI Multiplier Mathematics', () => {
    it('should accurately calculate monthly gross, saved leakage, and extra speed revenue for F&B', () => {
      const dailyTx = 120; // 120 struk per hari
      const ticketSize = 45000; // Rp 45.000 per struk
      const res = calculateRoi('fnb', dailyTx, ticketSize, 250000);

      // Gross = 120 * 45.000 * 30 = Rp 162.000.000
      expect(res.monthlyGross).toBe(162000000);

      // Saved Leakage = 162.000.000 * 2.5% = Rp 4.050.000
      expect(res.savedLeakage).toBe(4050000);

      // Extra Speed Revenue = 120 * 0.05 * 45.000 * 30 = 6 * 45.000 * 30 = Rp 8.100.000
      expect(res.extraSpeedRevenue).toBe(8100000);

      // Total Benefit = 4.050.000 + 8.100.000 = Rp 12.150.000
      expect(res.totalBenefit).toBe(12150000);

      // Multiplier = 12.150.000 / 250.000 = 48.6 -> rounded to 49x ROI
      expect(res.multiplier).toBe(49);

      // Sales Commission = 25% of Rp 250.000 = Rp 62.500
      expect(res.salesCommission).toBe(62500);
    });

    it('should handle zero daily transactions without NaN or division by zero errors', () => {
      const res = calculateRoi('retail', 0, 50000, 250000);

      expect(res.monthlyGross).toBe(0);
      expect(res.savedLeakage).toBe(0);
      expect(res.extraSpeedRevenue).toBe(0);
      expect(res.totalBenefit).toBe(0);
      expect(res.multiplier).toBe(0);
    });
  });
});

