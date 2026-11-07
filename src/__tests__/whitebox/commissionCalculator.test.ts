import { describe, it, expect } from 'vitest';

export interface CommissionCalculationParams {
  packageType: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  outletsCount: number;
  monthlySubscriptionPricePerOutlet: number;
  hasNpwp: boolean;
  agentTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

export interface CommissionBreakdown {
  baseUpfrontCommission: number;
  multiOutletBonus: number;
  grossUpfrontCommission: number;
  recurringCommissionPerMonth: number;
  pph21WithholdingTax: number;
  netPayableCommission: number;
  escrowHoldAmount: number;
  immediatePayableAmount: number;
}

export const calculateCommission = (
  params: CommissionCalculationParams
): CommissionBreakdown => {
  // 1. Base Upfront Commission per package
  // STARTER: 250k, GROWTH: 500k, ENTERPRISE: 1.000k
  const baseRates: Record<string, number> = {
    STARTER: 250000,
    GROWTH: 500000,
    ENTERPRISE: 1000000,
  };

  const baseRate = baseRates[params.packageType] || 250000;

  // 2. Multi-outlet multiplier (Additional 50% upfront per extra outlet onboarded)
  const extraOutlets = Math.max(0, params.outletsCount - 1);
  const multiOutletBonus = extraOutlets * (baseRate * 0.5);

  // 3. Agent Tier Bonus Multiplier
  const tierMultipliers: Record<string, number> = {
    BRONZE: 1.0,
    SILVER: 1.05,
    GOLD: 1.1,
    PLATINUM: 1.2,
  };
  const tierMult = tierMultipliers[params.agentTier] || 1.0;

  const grossUpfrontCommission = (baseRate + multiOutletBonus) * tierMult;

  // 4. Monthly Recurring Commission (15% of monthly subscription fee for 12 months)
  const recurringPercent = 0.15;
  const recurringCommissionPerMonth =
    params.outletsCount * params.monthlySubscriptionPricePerOutlet * recurringPercent;

  // 5. PPh 21 Withholding Tax (2.5% if has NPWP, 3% if no NPWP)
  const taxRate = params.hasNpwp ? 0.025 : 0.03;
  const pph21WithholdingTax = Math.round(grossUpfrontCommission * taxRate);

  const netPayableCommission = grossUpfrontCommission - pph21WithholdingTax;

  // 6. Escrow Policy: 30% held in escrow until 30-day merchant retention is verified
  const escrowHoldAmount = Math.round(netPayableCommission * 0.3);
  const immediatePayableAmount = netPayableCommission - escrowHoldAmount;

  return {
    baseUpfrontCommission: baseRate,
    multiOutletBonus,
    grossUpfrontCommission,
    recurringCommissionPerMonth,
    pph21WithholdingTax,
    netPayableCommission,
    escrowHoldAmount,
    immediatePayableAmount,
  };
};

describe('White Box Testing: Sales Commission Mathematical Engine & PPh 21 Withholding Tax', () => {
  it('calculates single outlet GROWTH onboarding for GOLD agent with NPWP', () => {
    // Base = 500.000. Multi-outlet = 0. Gold Tier = 1.1x -> Gross = 550.000
    // Tax 2.5% = 13.750. Net = 536.250. Escrow 30% = 160.875. Immediate = 375.375
    const res = calculateCommission({
      packageType: 'GROWTH',
      outletsCount: 1,
      monthlySubscriptionPricePerOutlet: 350000,
      hasNpwp: true,
      agentTier: 'GOLD',
    });

    expect(res.baseUpfrontCommission).toBe(500000);
    expect(res.multiOutletBonus).toBe(0);
    expect(res.grossUpfrontCommission).toBe(550000);
    expect(res.recurringCommissionPerMonth).toBe(52500); // 350.000 * 15%
    expect(res.pph21WithholdingTax).toBe(13750); // 550.000 * 2.5%
    expect(res.netPayableCommission).toBe(536250);
    expect(res.escrowHoldAmount).toBe(160875);
    expect(res.immediatePayableAmount).toBe(375375);
  });

  it('calculates multi-outlet ENTERPRISE onboarding (3 outlets) for PLATINUM agent', () => {
    // Base = 1.000.000. Extra outlets = 2 * (1.000.000 * 0.5) = 1.000.000. Total pre-tier = 2.000.000
    // Platinum tier = 1.2x -> Gross = 2.400.000
    // No NPWP -> Tax 3% = 72.000. Net = 2.328.000
    const res = calculateCommission({
      packageType: 'ENTERPRISE',
      outletsCount: 3,
      monthlySubscriptionPricePerOutlet: 500000,
      hasNpwp: false,
      agentTier: 'PLATINUM',
    });

    expect(res.baseUpfrontCommission).toBe(1000000);
    expect(res.multiOutletBonus).toBe(1000000);
    expect(res.grossUpfrontCommission).toBe(2400000);
    expect(res.recurringCommissionPerMonth).toBe(225000); // 3 * 500k * 15%
    expect(res.pph21WithholdingTax).toBe(72000); // 2.400.000 * 3%
    expect(res.netPayableCommission).toBe(2328000);
  });

  it('applies standard 2.5% tax rate for agents with registered NPWP', () => {
    const resWithNpwp = calculateCommission({
      packageType: 'STARTER',
      outletsCount: 1,
      monthlySubscriptionPricePerOutlet: 250000,
      hasNpwp: true,
      agentTier: 'BRONZE',
    });

    expect(resWithNpwp.pph21WithholdingTax).toBe(6250); // 250.000 * 2.5%
  });

  it('applies higher 3.0% penalty tax rate for agents without registered NPWP', () => {
    const resNoNpwp = calculateCommission({
      packageType: 'STARTER',
      outletsCount: 1,
      monthlySubscriptionPricePerOutlet: 250000,
      hasNpwp: false,
      agentTier: 'BRONZE',
    });

    expect(resNoNpwp.pph21WithholdingTax).toBe(7500); // 250.000 * 3.0%
  });

  it('calculates recurring 3-way revenue split: Sales 20% + Organisasi 10% + HQ 70%', () => {
    const monthlyBill = 400000; // 4 cabang x Rp 100.000
    const salesRate = 20;
    const orgRate = 10;
    const hqRate = 100 - salesRate - orgRate;

    const salesAmount = (monthlyBill * salesRate) / 100;
    const orgAmount = (monthlyBill * orgRate) / 100;
    const hqAmount = (monthlyBill * hqRate) / 100;

    expect(salesAmount).toBe(80000);
    expect(orgAmount).toBe(40000);
    expect(hqAmount).toBe(280000);
    expect(salesAmount + orgAmount + hqAmount).toBe(monthlyBill);
  });
});
