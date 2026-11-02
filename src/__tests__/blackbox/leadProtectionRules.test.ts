import { describe, it, expect } from 'vitest';

export interface LeadAvailabilityResponse {
  canClaim: boolean;
  message: string;
  lead?: {
    id: string;
    storeName: string;
    ownerName: string;
    protectedUntil: string;
    sales: {
      id: string;
      name: string;
      phone: string;
    };
  };
}

export const determineLeadAction = (
  availability: LeadAvailabilityResponse,
  currentSalesId: string
): {
  uiStatus: 'FREE' | 'LOCKED_BY_OTHER' | 'OWNED_BY_ME';
  canProceedToCheckin: boolean;
  canFileDispute: boolean;
  actionMessage: string;
} => {
  if (!availability.lead) {
    return {
      uiStatus: 'FREE',
      canProceedToCheckin: true,
      canFileDispute: false,
      actionMessage: 'Toko bebas. Anda dapat langsung melakukan check-in dan mengklaim proteksi 30 hari.',
    };
  }

  const isMyLead = availability.lead.sales.id === currentSalesId;

  if (isMyLead) {
    return {
      uiStatus: 'OWNED_BY_ME',
      canProceedToCheckin: true,
      canFileDispute: false,
      actionMessage: 'Outlet ini milik Anda. Melakukan check-in baru akan memperpanjang proteksi 30 hari.',
    };
  }

  return {
    uiStatus: 'LOCKED_BY_OTHER',
    canProceedToCheckin: false,
    canFileDispute: true,
    actionMessage: `Toko sedang diproteksi oleh rekan sales: ${availability.lead.sales.name}. Jika Anda memiliki bukti fisik kunjungan baru, ajukan sengketa (Dispute).`,
  };
};

describe('Black Box Testing: 30-Day Lead Protection Anti-Bentrok Engine', () => {
  const currentSalesId = 'sales-user-001';

  it('Case 1: Free Store (Toko Bebas) allows immediate check-in and claim', () => {
    const freeResponse: LeadAvailabilityResponse = {
      canClaim: true,
      message: 'Toko bebas. Outlet dapat didaftarkan dan diprospek.',
    };

    const action = determineLeadAction(freeResponse, currentSalesId);

    expect(action.uiStatus).toBe('FREE');
    expect(action.canProceedToCheckin).toBe(true);
    expect(action.canFileDispute).toBe(false);
    expect(action.actionMessage).toContain('Toko bebas');
  });

  it('Case 2: Store locked by another sales prevents check-in and offers Dispute resolution', () => {
    const lockedResponse: LeadAvailabilityResponse = {
      canClaim: false,
      message: 'Outlet sedang diprospek oleh Rian Pratama.',
      lead: {
        id: 'lead-99',
        storeName: 'Kafe Kopi Kenangan',
        ownerName: 'Kenangan Abadi',
        protectedUntil: '2026-11-20T00:00:00Z',
        sales: {
          id: 'sales-user-999', // Rekan sales lain
          name: 'Rian Pratama',
          phone: '6281299999999',
        },
      },
    };

    const action = determineLeadAction(lockedResponse, currentSalesId);

    expect(action.uiStatus).toBe('LOCKED_BY_OTHER');
    expect(action.canProceedToCheckin).toBe(false); // Check-in diblokir
    expect(action.canFileDispute).toBe(true); // Opsi sengketa dibuka
    expect(action.actionMessage).toContain('Rian Pratama');
  });

  it('Case 3: Store already owned by current sales allows re-visit and 30-day extension', () => {
    const ownResponse: LeadAvailabilityResponse = {
      canClaim: true,
      message: 'Outlet ini sudah Anda klaim sebelumnya.',
      lead: {
        id: 'lead-01',
        storeName: 'Restoran Dimsum Intan',
        ownerName: 'Intan',
        protectedUntil: '2026-11-10T00:00:00Z',
        sales: {
          id: currentSalesId, // Id yang sama
          name: 'Dimas Sales',
          phone: '6281211111111',
        },
      },
    };

    const action = determineLeadAction(ownResponse, currentSalesId);

    expect(action.uiStatus).toBe('OWNED_BY_ME');
    expect(action.canProceedToCheckin).toBe(true);
    expect(action.canFileDispute).toBe(false);
    expect(action.actionMessage).toContain('milik Anda');
  });
});

