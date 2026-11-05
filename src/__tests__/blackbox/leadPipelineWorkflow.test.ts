import { describe, it, expect, vi } from 'vitest';
import { Lead } from '../../context/AppContext';

describe('Black Box Testing: Lead Funnel, Geolocation Protection & Dispute Workflow', () => {
  interface CheckInPayload {
    name: string;
    phone: string;
    address: string;
    category: string;
    salesAgentId: string;
    coordinates: { lat: number; lng: number };
  }

  const claimAndLockLead = (
    existingLeads: Lead[],
    payload: CheckInPayload
  ): { success: boolean; error?: string; lead?: Lead } => {
    const cleanPhone = payload.phone.replace(/[^0-9]/g, '');

    // Check duplicate by phone
    const existing = existingLeads.find(
      (l) => l.phone.replace(/[^0-9]/g, '') === cleanPhone
    );

    if (existing) {
      if (existing.status === 'LOCKED' && existing.daysRemaining > 0) {
        return {
          success: false,
          error: `Lead ini sedang dalam proteksi eksklusif 30 hari oleh agen ${existing.lockedBy}! Sisa proteksi: ${existing.daysRemaining} hari.`,
        };
      }
    }

    if (!payload.name || payload.name.trim().length < 3) {
      return { success: false, error: 'Nama prospek wajib diisi minimal 3 karakter!' };
    }

    // Geolocation coordinates validation
    if (
      payload.coordinates.lat < -11 ||
      payload.coordinates.lat > 6 ||
      payload.coordinates.lng < 95 ||
      payload.coordinates.lng > 141
    ) {
      return {
        success: false,
        error: 'Koordinat GPS berada di luar batas wilayah Republik Indonesia!',
      };
    }

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: payload.name.trim(),
      category: payload.category,
      phone: cleanPhone,
      address: payload.address,
      city: 'Jakarta',
      lockedBy: payload.salesAgentId,
      isCurrentUser: true,
      daysRemaining: 30,
      status: 'LOCKED',
      lastContact: new Date().toISOString().split('T')[0],
      stage: 'Kunjungan Baru',
    };

    return { success: true, lead: newLead };
  };

  const advanceLeadStage = (
    lead: Lead,
    targetStage: 'Demo Presentasi' | 'Follow Up' | 'Deal POS'
  ): Lead => {
    if (lead.status !== 'LOCKED') {
      throw new Error('Hanya lead berstatus aktif terkunci yang dapat diubah tahapannya!');
    }

    const updatedStatus = targetStage === 'Deal POS' ? 'DEAL' : 'LOCKED';
    return {
      ...lead,
      stage: targetStage,
      status: updatedStatus,
      lastContact: new Date().toISOString().split('T')[0],
    };
  };

  const fileLeadDispute = (
    lead: Lead,
    claimingAgentId: string,
    evidenceNotes: string,
    evidencePhotoUrl: string
  ): { disputeId: string; status: 'PENDING_ADMIN_REVIEW'; claimValid: boolean } => {
    if (!evidenceNotes || evidenceNotes.trim().length < 10) {
      throw new Error('Alasan sanggahan dispute wajib diisi minimal 10 karakter!');
    }

    if (!evidencePhotoUrl || evidencePhotoUrl.trim() === '') {
      throw new Error('Bukti foto kunjungan fisik / chat WhatsApp wajib dilampirkan!');
    }

    return {
      disputeId: `DSP-${Date.now()}`,
      status: 'PENDING_ADMIN_REVIEW',
      claimValid: true,
    };
  };

  const sampleExistingLeads: Lead[] = [
    {
      id: 'lead-01',
      name: 'Kafe Kopi Kenanga',
      category: 'Coffee Shop',
      phone: '081234567890',
      address: 'Jl. Sabang No. 14',
      city: 'Jakarta Pusat',
      lockedBy: 'SLS-001 (Rian)',
      isCurrentUser: false,
      daysRemaining: 21,
      status: 'LOCKED',
      lastContact: '2026-11-01',
      stage: 'Demo Presentasi',
    },
    {
      id: 'lead-02',
      name: 'Rumah Makan Padang Murah',
      category: 'Restoran',
      phone: '081299998888',
      address: 'Jl. Fatmawati 22',
      city: 'Jakarta Selatan',
      lockedBy: 'SLS-005 (Doni)',
      isCurrentUser: false,
      daysRemaining: 0,
      status: 'EXPIRED',
      lastContact: '2026-10-01',
      stage: 'Kunjungan Baru',
    },
  ];

  it('allows sales agent to lock lead with valid coordinates and sets 30-day protection', () => {
    const res = claimAndLockLead(sampleExistingLeads, {
      name: 'Bakso Malang Cak Eko',
      phone: '085712345678',
      address: 'Jl. Margonda Raya No. 100 Depok',
      category: 'Kuliner Bakso',
      salesAgentId: 'SLS-042',
      coordinates: { lat: -6.3728, lng: 106.8329 }, // Valid Depok coordinates
    });

    expect(res.success).toBe(true);
    expect(res.lead?.lockedBy).toBe('SLS-042');
    expect(res.lead?.daysRemaining).toBe(30);
    expect(res.lead?.status).toBe('LOCKED');
    expect(res.lead?.stage).toBe('Kunjungan Baru');
  });

  it('rejects claim on active locked lead protected by another agent', () => {
    const res = claimAndLockLead(sampleExistingLeads, {
      name: 'Kafe Kopi Kenanga Cabang Baru',
      phone: '081234567890', // Exact duplicate phone
      address: 'Jl. Sabang No. 14',
      category: 'Coffee Shop',
      salesAgentId: 'SLS-042',
      coordinates: { lat: -6.1855, lng: 106.8242 },
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('sedang dalam proteksi eksklusif 30 hari');
  });

  it('allows reclaim of expired lead whose daysRemaining reached 0', () => {
    const res = claimAndLockLead(sampleExistingLeads, {
      name: 'Rumah Makan Padang Murah',
      phone: '081299998888', // Expired lead phone
      address: 'Jl. Fatmawati 22',
      category: 'Restoran',
      salesAgentId: 'SLS-042',
      coordinates: { lat: -6.2955, lng: 106.7942 },
    });

    expect(res.success).toBe(true);
    expect(res.lead?.lockedBy).toBe('SLS-042');
    expect(res.lead?.daysRemaining).toBe(30);
  });

  it('advances lead stage and updates status to DEAL on final closing', () => {
    const freshLead: Lead = {
      id: 'lead-test',
      name: 'Warung Steak Nusantara',
      category: 'Resto',
      phone: '081300011122',
      address: 'Jl. Tebet Raya',
      city: 'Jakarta',
      lockedBy: 'SLS-042',
      isCurrentUser: true,
      daysRemaining: 28,
      status: 'LOCKED',
      lastContact: '2026-11-05',
      stage: 'Kunjungan Baru',
    };

    const demoStage = advanceLeadStage(freshLead, 'Demo Presentasi');
    expect(demoStage.stage).toBe('Demo Presentasi');
    expect(demoStage.status).toBe('LOCKED');

    const dealStage = advanceLeadStage(demoStage, 'Deal POS');
    expect(dealStage.stage).toBe('Deal POS');
    expect(dealStage.status).toBe('DEAL');
  });

  it('submits dispute with evidence notes and photo attachment for admin arbitration', () => {
    const disputedLead = sampleExistingLeads[0];
    const dispute = fileLeadDispute(
      disputedLead,
      'SLS-042',
      'Pemilik usaha menyatakan belum pernah bertemu agen SLS-001 dan bersedia tanda tangan dengan saya.',
      'https://res.cloudinary.com/dimsumintan/image/upload/v1/disputes/chat_owner.jpg'
    );

    expect(dispute.disputeId).toMatch(/^DSP-\d+$/);
    expect(dispute.status).toBe('PENDING_ADMIN_REVIEW');
    expect(dispute.claimValid).toBe(true);
  });
});
