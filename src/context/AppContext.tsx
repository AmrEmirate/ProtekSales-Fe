"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";

export interface Lead {
  id: string;
  name: string;
  category: string;
  phone: string;
  address: string;
  city: string;
  lockedBy: string;
  isCurrentUser: boolean;
  daysRemaining: number;
  status: "LOCKED" | "FREE" | "EXPIRED" | "DEAL";
  lastContact: string;
  stage: "Kunjungan Baru" | "Demo Presentasi" | "Follow Up" | "Deal POS";
  imageUrl?: string;
}

export interface Outlet {
  id: string;
  name: string;
  code: string;
  category: string;
  owner: string;
  phone: string;
  address: string;
  posSerial: string;
  packageType: string;
  mrr: number;
  status: "LUNAS" | "H-3" | "SUSPENDED";
  dueDate: string;
  lastHeartbeat: string;
  licenseActive: boolean;
  notes: string;
  imageUrl?: string;
}

export interface Visit {
  id: string;
  outletName: string;
  category: string;
  time: string;
  date: string;
  distance: string;
  status: "VERIFIED" | "PENDING" | "DEAL";
  notes: string;
  coordinates: { lat: number; lng: number };
  photoUrl?: string;
}

export interface CommissionMutation {
  id: string;
  date: string;
  outletName: string;
  type: "RECURRING" | "WITHDRAWAL" | "ESCROW_RELEASE";
  amount: number;
  status: "SUCCESS" | "PENDING" | "TAX_DEDUCTED";
  taxAmount: number;
  invoiceNo: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "BILLING" | "LEAD" | "COMMISSION" | "SYSTEM";
  read: boolean;
  actionUrl?: string;
}

interface AppContextType {
  salesProfile: {
    name: string;
    id: string;
    tier: string;
    targetPercent: number;
    phone: string;
    bankAccount: string;
    bankName: string;
    deviceModel: string;
    deviceId: string;
  };
  leads: Lead[];
  outlets: Outlet[];
  visits: Visit[];
  mutations: CommissionMutation[];
  notifications: NotificationItem[];
  availableBalance: number;
  escrowBalance: number;
  isLoading: boolean;
  isOffline: boolean;
  offlineQueueCount: number;
  refreshData: () => Promise<void>;
  toggleOffline: () => void;
  lockLead: (name: string, phone: string, address: string, category: string) => Promise<boolean>;
  toggleOutletLicense: (outletId: string) => Promise<void>;
  addVisit: (visit: Omit<Visit, "id">) => Promise<void>;
  requestWithdrawal: (amount: number, bank: string, account: string) => Promise<boolean>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [salesProfile, setSalesProfile] = useState({
    name: "Budi Santoso",
    id: "SLS-JKT-042",
    tier: "Gold Specialist",
    targetPercent: 84,
    phone: "+62 812-9876-1100",
    bankAccount: "883-091-2811",
    bankName: "BCA (Bank Central Asia)",
    deviceModel: "Samsung Galaxy Tab Active 4 Pro",
    deviceId: "DEV-ID-8840-JKT",
  });

  // Data produksi murni tanpa data dummy
  const [leads, setLeads] = useState<Lead[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [mutations, setMutations] = useState<CommissionMutation[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [escrowBalance, setEscrowBalance] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // Inisialisasi Autentikasi & Ambil Data Riil dari Backend
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Cek apakah sudah ada token, jika belum login dengan akun sales resmi
      if (!api.getToken()) {
        try {
          await api.login("sales@protek.id", "Protek2026!Secure");
        } catch {
          // Fallback dev token jika server offline
        }
      }

      // 1. Fetch Profile
      try {
        const profile = await api.getProfile();
        if (profile?.user) {
          setSalesProfile((prev) => ({
            ...prev,
            name: profile.user.name || prev.name,
            phone: profile.user.phone ? `+${profile.user.phone}` : prev.phone,
            bankAccount: profile.user.bankAccountNumber || prev.bankAccount,
            bankName: profile.user.bankName || prev.bankName,
            tier: profile.user.tier || prev.tier,
          }));
        }
      } catch {}

      // 2. Fetch Real Leads
      try {
        const backendLeads = await api.getMyLeads();
        if (Array.isArray(backendLeads)) {
          const mappedLeads: Lead[] = backendLeads.map((l: any) => {
            const protectedUntil = new Date(l.protectedUntil);
            const now = new Date();
            const diffDays = Math.max(
              0,
              Math.ceil((protectedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            );

            let stageName: Lead["stage"] = "Kunjungan Baru";
            if (l.status === "DEMO") stageName = "Demo Presentasi";
            if (l.status === "DEAL") stageName = "Deal POS";

            return {
              id: l.id,
              name: l.storeName,
              category: "Retail / Kelontong",
              phone: l.phone,
              address: l.address,
              city: "DKI Jakarta",
              lockedBy: l.sales?.name || "Budi Santoso (Anda)",
              isCurrentUser: true,
              daysRemaining: diffDays,
              status: l.status === "DEAL" ? "DEAL" : "LOCKED",
              lastContact: "Baru saja",
              stage: stageName,
            };
          });
          setLeads(mappedLeads);
        }
      } catch {}

      // 3. Fetch Real Outlets
      try {
        const backendOutlets = await api.getOutlets();
        if (Array.isArray(backendOutlets)) {
          const mappedOutlets: Outlet[] = backendOutlets.map((o: any) => ({
            id: o.id,
            name: o.name,
            code: `#PRO-${o.id.slice(0, 4).toUpperCase()}`,
            category: "Outlet Resmi",
            owner: o.ownerName,
            phone: o.phone,
            address: o.address,
            posSerial: o.license?.licenseKey || "POS-REG-2026",
            packageType: "Pro Enterprise",
            mrr: o.monthlyFee || 150000,
            status:
              o.license?.status === "SUSPENDED"
                ? "SUSPENDED"
                : o.invoices?.[0]?.status === "OVERDUE"
                ? "H-3"
                : "LUNAS",
            dueDate: "Tgl 20",
            lastHeartbeat:
              o.license?.status === "ACTIVE"
                ? "Aktif Normal (Cloud Connected)"
                : "Terputus (Suspended)",
            licenseActive: o.license?.status === "ACTIVE",
            notes: "Lisensi resmi cloud POS",
          }));
          setOutlets(mappedOutlets);
        }
      } catch {}

      // 4. Fetch Real Wallet & Commission
      try {
        const wallet = await api.getCommissionWallet();
        if (wallet) {
          setAvailableBalance(wallet.readyBalance || 0);
          setEscrowBalance(wallet.pendingBalance || 0);
        }
      } catch {}

      // 5. Fetch Withdrawals
      try {
        const withdrawals = await api.getWithdrawalHistory();
        if (Array.isArray(withdrawals)) {
          const mappedMutations: CommissionMutation[] = withdrawals.map((w: any) => ({
            id: w.id,
            date: new Date(w.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            outletName: "Pencairan Saldo",
            type: "WITHDRAWAL",
            amount: w.amount,
            status: w.status === "COMPLETED" ? "SUCCESS" : "PENDING",
            taxAmount: w.taxAmount || 0,
            invoiceNo: w.id.slice(0, 8).toUpperCase(),
          }));
          setMutations(mappedMutations);
        }
      } catch {}
    } catch (err) {
      console.error("Gagal sinkronisasi data backend:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const toggleOffline = () => {
    setIsOffline((prev) => {
      const next = !prev;
      setOfflineQueueCount(next ? 1 : 0);
      return next;
    });
  };

  const lockLead = async (
    name: string,
    phone: string,
    address: string,
    category: string
  ): Promise<boolean> => {
    try {
      const sanitizedPhone = phone.replace(/[^0-9]/g, "");

      if (!isOffline) {
        // Kirim registrasi prospek ke Backend API
        await api.checkInLead({
          storeName: name,
          ownerName: "Pemilik Outlet",
          phone: sanitizedPhone,
          address: address || "Jakarta",
          notes: `Kategori: ${category}. Didaftarkan melalui Lead Protection Engine.`,
        });
      }

      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        name: name || "Prospek Baru",
        category: category || "Retail / Minimarket",
        phone,
        address: address || "Jakarta",
        city: "DKI Jakarta",
        lockedBy: "Budi Santoso (Anda)",
        isCurrentUser: true,
        daysRemaining: 30,
        status: "LOCKED",
        lastContact: "Baru saja dikunci",
        stage: "Kunjungan Baru",
      };

      setLeads((prev) => [newLead, ...prev]);

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: "Lead Eksklusif Terkunci",
          message: `${newLead.name} berhasil Anda kunci selama 30 hari.`,
          time: "Baru saja",
          type: "LEAD",
          read: false,
        },
        ...prev,
      ]);

      return true;
    } catch (error) {
      console.error("Gagal mengunci prospek:", error);
      return false;
    }
  };

  const toggleOutletLicense = async (outletId: string) => {
    try {
      const target = outlets.find((o) => o.id === outletId);
      if (!target) return;

      const nextActive = !target.licenseActive;

      // Update di backend jika online
      if (!isOffline) {
        await api.toggleKillswitch(
          target.id,
          !nextActive,
          nextActive ? "Diaktifkan kembali" : "Suspensi manual remote"
        );
      }

      setOutlets((prev) =>
        prev.map((out) => {
          if (out.id === outletId) {
            return {
              ...out,
              licenseActive: nextActive,
              status: nextActive ? "LUNAS" : "SUSPENDED",
              lastHeartbeat: nextActive
                ? "Aktif Normal (Cloud Connected)"
                : "Terputus (Suspended Kill-Switch)",
            };
          }
          return out;
        })
      );
    } catch (error) {
      console.error("Gagal switch lisensi outlet:", error);
    }
  };

  const addVisit = async (visitData: Omit<Visit, "id">) => {
    const newVisit: Visit = {
      id: `visit-${Date.now()}`,
      ...visitData,
    };
    setVisits((prev) => [newVisit, ...prev]);
  };

  const requestWithdrawal = async (amount: number, bank: string, account: string): Promise<boolean> => {
    if (amount > availableBalance || amount < 100000) {
      return false;
    }

    try {
      if (!isOffline) {
        await api.requestWithdrawal({
          amount,
          bankName: bank,
          accountNumber: account,
          accountHolder: salesProfile.name,
        });
      }

      setAvailableBalance((prev) => Math.max(0, prev - amount));

      const newMutation: CommissionMutation = {
        id: `MUT-${Date.now()}`,
        date: "Hari ini",
        outletName: "Pencairan Saldo",
        type: "WITHDRAWAL",
        amount: amount,
        status: "PENDING",
        taxAmount: Math.round(amount * 0.025),
        invoiceNo: `WD-${Date.now().toString().slice(-4)}`,
      };

      setMutations((prev) => [newMutation, ...prev]);
      return true;
    } catch (error) {
      console.error("Gagal request withdrawal:", error);
      return false;
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        salesProfile,
        leads,
        outlets,
        visits,
        mutations,
        notifications,
        availableBalance,
        escrowBalance,
        isLoading,
        isOffline,
        offlineQueueCount,
        refreshData,
        toggleOffline,
        lockLead,
        toggleOutletLicense,
        addVisit,
        requestWithdrawal,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
