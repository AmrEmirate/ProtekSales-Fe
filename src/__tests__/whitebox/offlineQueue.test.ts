import { describe, it, expect, beforeEach } from 'vitest';

// Polyfill localStorage
const storage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => {
    storage[key] = value;
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
  clear: () => {
    Object.keys(storage).forEach((k) => delete storage[k]);
  },
  length: 0,
  key: () => null,
};

interface OfflineQueueItem {
  id: string;
  action: string;
  target: string;
  payload: Record<string, any>;
  timestamp: string;
  status: 'QUEUED' | 'SYNCED' | 'FAILED';
}

class OfflineQueueManager {
  private key = 'protek_offline_queue';

  getItems(): OfflineQueueItem[] {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  enqueue(action: string, target: string, payload: Record<string, any>): OfflineQueueItem {
    const items = this.getItems();
    const newItem: OfflineQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      target,
      payload,
      timestamp: new Date().toISOString(),
      status: 'QUEUED',
    };
    items.push(newItem);
    localStorage.setItem(this.key, JSON.stringify(items));
    return newItem;
  }

  clearQueue(): void {
    localStorage.removeItem(this.key);
  }

  getPendingCount(): number {
    return this.getItems().filter((i) => i.status === 'QUEUED').length;
  }
}

describe('White Box Testing: Offline Queue & Resilience Engine', () => {
  let manager: OfflineQueueManager;

  beforeEach(() => {
    globalThis.localStorage.clear();
    manager = new OfflineQueueManager();
  });

  it('should initially have 0 pending items in the offline queue', () => {
    expect(manager.getItems()).toEqual([]);
    expect(manager.getPendingCount()).toBe(0);
  });

  it('should properly enqueue offline visit / check-in actions', () => {
    const payload = {
      storeName: 'Toko Sembako Berkah',
      ownerName: 'Pak Haji',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 12',
    };

    const item = manager.enqueue('CHECKIN_LEAD', 'Toko Sembako Berkah', payload);

    expect(item.id).toBeDefined();
    expect(item.action).toBe('CHECKIN_LEAD');
    expect(item.target).toBe('Toko Sembako Berkah');
    expect(item.status).toBe('QUEUED');
    expect(manager.getPendingCount()).toBe(1);

    const items = manager.getItems();
    expect(items.length).toBe(1);
    expect(items[0].payload.phone).toBe('081234567890');
  });

  it('should support multiple enqueued items and calculate pending count', () => {
    manager.enqueue('CHECKIN_LEAD', 'Outlet 1', { phone: '0811' });
    manager.enqueue('UPDATE_STATUS', 'Outlet 1', { status: 'DEAL' });
    manager.enqueue('CHECKIN_LEAD', 'Outlet 2', { phone: '0822' });

    expect(manager.getPendingCount()).toBe(3);
  });

  it('should clear all items when sync succeeds', () => {
    manager.enqueue('CHECKIN_LEAD', 'Outlet 1', {});
    manager.enqueue('CHECKIN_LEAD', 'Outlet 2', {});
    expect(manager.getPendingCount()).toBe(2);

    manager.clearQueue();
    expect(manager.getPendingCount()).toBe(0);
    expect(manager.getItems()).toEqual([]);
  });
});
