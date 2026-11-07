/**
 * ProTek Sales REST API Client
 * Terhubung langsung ke Backend Express & PostgreSQL
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-pos.vimtk.cloud/api";

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("protek_auth_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("protek_auth_token", token);
      } else {
        localStorage.removeItem("protek_auth_token");
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("protek_auth_token");
    }
    return this.token;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.message || `HTTP Error ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  }

  // ==========================================
  // 1. AUTHENTICATION
  // ==========================================
  async login(email: string, password: string) {
    const res = await this.request<{
      success: boolean;
      message: string;
      data: { user: any; token: string };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  }

  async getProfile() {
    const res = await this.request<{ success: boolean; data: any }>("/auth/profile");
    return res.data;
  }

  logout() {
    this.setToken(null);
  }

  // ==========================================
  // 2. LEADS (LEAD PROTECTION & PIPELINE)
  // ==========================================
  async checkLeadAvailability(phone: string) {
    const sanitized = phone.replace(/[^0-9]/g, "");
    const res = await this.request<{
      success: boolean;
      message: string;
      data: {
        canClaim: boolean;
        message: string;
        lead?: {
          id: string;
          storeName: string;
          ownerName: string;
          protectedUntil: string;
          status: string;
          claimedBy: string;
        };
      };
    }>(`/leads/check?phone=${encodeURIComponent(sanitized)}`);
    return res.data;
  }

  async checkInLead(payload: {
    storeName: string;
    ownerName: string;
    phone: string;
    address: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    photoUrl?: string;
    salesType?: "OFFLINE" | "ONLINE";
    outletCount?: number;
    outcome?: "AGREED" | "NOT_AGREED" | "PENDING" | "FOLLOW_UP";
    rejectionReason?: string;
    followUpDate?: string;
  }) {
    const res = await this.request<{ success: boolean; message: string; data: any }>("/leads/check-in", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  }

  async provisionTenantFromLead(payload: {
    leadId?: string;
    storeName: string;
    ownerName: string;
    phone: string;
    address?: string;
    category?: string;
    subdomain?: string;
    customDomain?: string;
    planCode?: string;
    username: string;
    password: string;
    themeColor?: string;
    themeConfig?: any;
    outletCount?: number;
  }) {
    const res = await this.request<{ success: boolean; message: string; data: any }>("/leads/provision-tenant", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  }

  async getMyLeads() {
    const res = await this.request<{ success: boolean; data: any[] }>("/leads");
    return res.data;
  }

  async getLeadDetail(id: string) {
    const res = await this.request<{ success: boolean; data: any }>(`/leads/${id}`);
    return res.data;
  }

  async updateLeadStatus(id: string, status: "NEW" | "DEMO" | "DEAL" | "LOST") {
    const res = await this.request<{ success: boolean; data: any }>(`/leads/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return res.data;
  }

  async addVisitLog(leadId: string, notes: string, photoUrl?: string) {
    const res = await this.request<{ success: boolean; data: any }>(`/leads/${leadId}/visits`, {
      method: "POST",
      body: JSON.stringify({ notes, photoUrl }),
    });
    return res.data;
  }

  async fileDispute(leadId: string, reason: string, proofUrl?: string) {
    const res = await this.request<{ success: boolean; message: string; data: any }>(
      `/leads/${leadId}/dispute`,
      {
        method: "POST",
        body: JSON.stringify({ reason, proofUrl }),
      }
    );
    return res.data;
  }

  // ==========================================
  // 3. OUTLETS & LICENSES
  // ==========================================
  async getOutlets() {
    const res = await this.request<{ success: boolean; data: any[] }>("/outlets");
    return res.data;
  }

  async getOutletDetail(id: string) {
    const res = await this.request<{ success: boolean; data: any }>(`/outlets/${id}`);
    return res.data;
  }

  async onboardingPos(payload: {
    leadId?: string;
    name: string;
    ownerName: string;
    phone: string;
    address: string;
    monthlyFee?: number;
    planCode?: string;
  }) {
    const res = await this.request<{ success: boolean; message: string; data: any }>("/outlets", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  }

  async toggleKillswitch(licenseId: string, suspend: boolean, reason?: string) {
    const status = suspend ? "SUSPENDED" : "ACTIVE";
    const res = await this.request<{ success: boolean; message: string; data: any }>(
      `/admin/licenses/${licenseId}/toggle`,
      {
        method: "POST",
        body: JSON.stringify({ status, reason }),
      }
    );
    return res.data;
  }

  // ==========================================
  // 4. COMMISSIONS & WITHDRAWALS
  // ==========================================
  async getCommissionWallet() {
    const res = await this.request<{
      success: boolean;
      data: {
        readyBalance: number;
        pendingBalance: number;
        withdrawnBalance: number;
        breakdown: any[];
      };
    }>("/commissions/wallet");
    return res.data;
  }

  async getWithdrawalHistory() {
    const res = await this.request<{ success: boolean; data: any[] }>("/commissions/withdrawals");
    return res.data;
  }

  async requestWithdrawal(payload: {
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }) {
    const res = await this.request<{ success: boolean; message: string; data: any }>(
      "/commissions/withdraw",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  }

  // ==========================================
  // 5. INVOICES
  // ==========================================
  async getInvoices() {
    const res = await this.request<{ success: boolean; data: any[] }>("/invoices");
    return res.data;
  }

  async uploadPaymentProof(invoiceId: string, paymentProofUrl: string, paymentNotes?: string) {
    const res = await this.request<{ success: boolean; data: any }>(`/invoices/${invoiceId}/payment-proof`, {
      method: "POST",
      body: JSON.stringify({ paymentProofUrl, paymentNotes }),
    });
    return res.data;
  }

  async getWhatsappReminderUrl(invoiceId: string) {
    const res = await this.request<{
      success: boolean;
      data: {
        invoiceNumber: string;
        outletName: string;
        ownerPhone: string;
        amount: number;
        dueDate: string;
        message: string;
        whatsappUrl: string;
      };
    }>(`/invoices/${invoiceId}/reminder-link`);
    return res.data;
  }

  // ==========================================
  // 6. SALES TOOLS & PERFORMANCE
  // ==========================================
  async getLeaderboard() {
    const res = await this.request<{ success: boolean; data: any[] }>("/sales/leaderboard");
    return res.data;
  }

  async getSalesKPI() {
    const res = await this.request<{ success: boolean; data: any }>("/sales/kpi");
    return res.data;
  }

  async getSalesRoutesMap() {
    const res = await this.request<{ success: boolean; data: any[] }>("/sales/routes-map");
    return res.data;
  }

  async calculateRoi(payload: {
    monthlyGrossSales: number;
    cashLossEstimatePercent: number;
    inventoryErrorPercent: number;
    staffCount: number;
  }) {
    const res = await this.request<{ success: boolean; data: any }>("/sales/roi-calculator", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  }

  // ==========================================
  // 7. ADMIN CONTROL CENTER (ROLE: ADMIN)
  // ==========================================
  async getAdminMetrics() {
    const res = await this.request<{
      success: boolean;
      data: {
        totalSales: number;
        totalLeads: number;
        totalOutlets: number;
        licenses: { active: number; suspended: number };
        withdrawals: { pendingCount: number; pendingAmount: number };
        invoices: {
          unpaidCount: number;
          unpaidAmount: number;
          overdueCount: number;
          overdueAmount: number;
        };
      };
    }>("/admin/metrics");
    return res.data;
  }

  async getAdminLeadsMap() {
    const res = await this.request<{ success: boolean; data: any[] }>("/admin/leads/map");
    return res.data;
  }

  async verifyInvoicePayment(invoiceId: string, notes?: string) {
    const res = await this.request<{ success: boolean; message: string; data: any }>(
      `/admin/invoices/${invoiceId}/verify`,
      {
        method: "POST",
        body: JSON.stringify({ notes }),
      }
    );
    return res.data;
  }

  async processWithdrawal(
    withdrawalId: string,
    status: "APPROVED" | "REJECTED" | "COMPLETED",
    adminNotes?: string,
    proofUrl?: string
  ) {
    const res = await this.request<{ success: boolean; message: string; data: any }>(
      `/admin/withdrawals/${withdrawalId}/process`,
      {
        method: "POST",
        body: JSON.stringify({ status, adminNotes, proofUrl }),
      }
    );
    return res.data;
  }

  async getAdminDisputes() {
    const res = await this.request<{ success: boolean; data: any[] }>("/admin/disputes");
    return res.data;
  }

  async resolveDispute(
    disputeId: string,
    action: "TRANSFER" | "REJECT",
    resolutionNotes?: string
  ) {
    const res = await this.request<{ success: boolean; message: string; data: any }>(
      `/admin/disputes/${disputeId}/resolve`,
      {
        method: "POST",
        body: JSON.stringify({ action, resolutionNotes }),
      }
    );
    return res.data;
  }

  async getAdminSales() {
    const res = await this.request<{ success: boolean; data: any[] }>("/admin/sales");
    return res.data;
  }

  async createSalesAccount(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    commissionRate?: number;
    orgCommissionRate?: number;
    organizationName?: string;
    tier?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountHolder?: string;
    npwp?: string;
  }) {
    const res = await this.request<{ success: boolean; message: string; data: any }>("/admin/sales", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res;
  }

  async deleteSalesAccount(salesId: string) {
    const res = await this.request<{ success: boolean; message: string }>(`/admin/sales/${salesId}`, {
      method: "DELETE",
    });
    return res;
  }

  async updateSalesCommissionRate(
    salesId: string,
    commissionRate: number,
    orgCommissionRate?: number,
    organizationName?: string
  ) {
    const res = await this.request<{ success: boolean; message: string; data: any }>(
      `/admin/sales/${salesId}/commission-rate`,
      {
        method: "PATCH",
        body: JSON.stringify({ commissionRate, orgCommissionRate, organizationName }),
      }
    );
    return res;
  }

  async updateBulkCommissionRate(commissionRate: number, orgCommissionRate?: number) {
    const res = await this.request<{ success: boolean; message: string; data: any }>(
      "/admin/sales/commission-rate/bulk",
      {
        method: "PATCH",
        body: JSON.stringify({ commissionRate, orgCommissionRate }),
      }
    );
    return res;
  }

  async getAdminUiDesigns() {
    const res = await this.request<{ success: boolean; data: any[] }>("/admin/ui-designs");
    return res.data;
  }

  // ==========================================
  // 8. CLOUD POS BACKEND INTEGRATION & TELEMETRY
  // ==========================================
  async getOutletCloudPosLive(outletId: string) {
    const res = await this.request<{
      success: boolean;
      data: {
        connected: boolean;
        licenseKey: string | null;
        data: any;
      };
    }>(`/outlets/${outletId}/cloudpos-live`);
    return res.data;
  }

  async getCloudPosHealth() {
    const res = await this.request<{
      success: boolean;
      data: {
        online: boolean;
        url: string;
        latencyMs?: number;
        message?: string;
      };
    }>("/admin/cloudpos/health");
    return res.data;
  }

  async getCloudPosTenants() {
    const res = await this.request<{
      success: boolean;
      data: {
        total: number;
        linkedCount: number;
        unlinkedCount: number;
        tenants: any[];
      };
    }>("/admin/cloudpos/tenants");
    return res.data;
  }

  async createCloudPosTenant(data: {
    name: string;
    slug?: string;
    customDomain?: string;
    plan?: string;
    maxOutlets?: number;
    pricePerOutlet?: number;
    ownerName?: string;
    ownerPhone?: string;
    ownerEmail?: string;
    ownerUsername?: string;
    ownerPassword?: string;
    city?: string;
    address?: string;
  }) {
    const res = await this.request<{
      success: boolean;
      message: string;
      data: any;
    }>("/admin/cloudpos/tenants", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res;
  }

  async updateCloudPosTenant(
    id: string,
    data: {
      name?: string;
      customDomain?: string;
      plan?: string;
      maxOutlets?: number;
      pricePerOutlet?: number;
      status?: "ACTIVE" | "SUSPENDED";
      ownerName?: string;
      phone?: string;
    }
  ) {
    const res = await this.request<{
      success: boolean;
      message: string;
      data: any;
    }>(`/admin/cloudpos/tenants/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res;
  }

  async deleteCloudPosTenant(id: string) {
    const res = await this.request<{
      success: boolean;
      message: string;
    }>(`/admin/cloudpos/tenants/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res;
  }

  async syncCloudPosTenants() {
    const res = await this.request<{
      success: boolean;
      message: string;
      data: {
        totalCloudTenants: number;
        createdCount: number;
        alreadyLinkedCount: number;
      };
    }>("/admin/cloudpos/sync-tenants", {
      method: "POST",
    });
    return res;
  }

  async getCloudPosAnalytics() {
    const res = await this.request<{
      success: boolean;
      data: any;
    }>("/admin/cloudpos/analytics");
    return res.data;
  }

  // ==========================================
  // GOOGLE STITCH MCP & AUTONOMOUS UI PIPELINE
  // ==========================================
  async requestUiDesign(data: {
    leadId?: string;
    storeName: string;
    category?: string;
    primaryColor?: string;
    styleNotes?: string;
    referenceImageUrl?: string;
  }) {
    const res = await this.request<{
      success: boolean;
      message: string;
      data: any;
    }>("/ui-design/request", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res;
  }

  async getUiDesignsByLead(leadId: string) {
    const res = await this.request<{
      success: boolean;
      data: any[];
    }>(`/ui-design/lead/${leadId}`);
    return res.data;
  }

  async getUiDesignDetail(id: string) {
    const res = await this.request<{
      success: boolean;
      data: any;
    }>(`/ui-design/${id}`);
    return res.data;
  }

  async reviseUiDesign(id: string, revisionNotes: string) {
    const res = await this.request<{
      success: boolean;
      message: string;
      data: any;
    }>(`/ui-design/${id}/revise`, {
      method: "POST",
      body: JSON.stringify({ revisionNotes }),
    });
    return res;
  }

  async approveUiDesign(
    id: string,
    payload?: {
      subdomain?: string;
      domainType?: "SUBDOMAIN" | "HOSTINGER_CUSTOM";
      customDomain?: string;
      ownerUsername?: string;
      ownerPassword?: string;
      ownerPin?: string;
      planCode?: string;
      outletCount?: number;
      salesType?: "OFFLINE" | "ONLINE";
    }
  ) {
    const res = await this.request<{
      success: boolean;
      message: string;
      data: {
        uiRequest: any;
        outlet: any;
        tenantSlug: string;
        posUrl: string;
        licenseKey: string;
        customDomain?: string;
        credentials?: {
          username: string;
          password?: string;
          pin?: string;
        };
        billing?: {
          planCode: string;
          monthlyFee: number;
          outletCount: number;
          subscriptionStatus: string;
          invoiceNumber: string;
        };
        hostinger?: any;
        feBundle?: any;
      };
    }>(`/ui-design/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    return res;
  }
}

export const api = new ApiService();

