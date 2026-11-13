// Offline Check-In Queue Manager
// Stores check-ins performed without network and auto-syncs when reconnected.

export interface QueuedCheckIn {
  id: string; // unique queue item id
  eventId: string;
  attendeeId: string;
  attendeeName?: string;
  timestamp: number;
  staffEmail?: string;
}

const STORAGE_KEY = 'badge_scanner_offline_queue_v2';

type Listener = (queue: QueuedCheckIn[], isOnline: boolean, isSyncing: boolean) => void;

class OfflineQueueManager {
  private queue: QueuedCheckIn[] = [];
  private listeners: Set<Listener> = new Set();
  private isOnline: boolean = true;
  private isSyncing: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.loadQueue();

      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notify();
        this.syncQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notify();
      });
    }
  }

  private loadQueue(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.queue = raw ? JSON.parse(raw) : [];
    } catch {
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.warn('[OfflineQueue] Failed to save queue to localStorage:', e);
    }
  }

  public getQueue(): QueuedCheckIn[] {
    return [...this.queue];
  }

  public getStatus(): { isOnline: boolean; isSyncing: boolean; queueLength: number } {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      queueLength: this.queue.length,
    };
  }

  public enqueue(item: Omit<QueuedCheckIn, 'id' | 'timestamp'>): QueuedCheckIn {
    const queued: QueuedCheckIn = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    // Avoid duplicate queueing of the same attendee in the same event
    const exists = this.queue.some(
      (q) => q.eventId === item.eventId && q.attendeeId === item.attendeeId
    );

    if (!exists) {
      this.queue.push(queued);
      this.saveQueue();
      this.notify();
    }

    // If online, attempt to sync immediately
    if (this.isOnline) {
      this.syncQueue();
    }

    return queued;
  }

  public async syncQueue(syncFn?: (item: QueuedCheckIn) => Promise<void>): Promise<number> {
    if (this.isSyncing || this.queue.length === 0) return 0;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return 0;

    this.isSyncing = true;
    this.notify();

    let syncedCount = 0;
    const remaining: QueuedCheckIn[] = [];

    // Import checkInAttendee dynamically if syncFn not provided
    let defaultSync = syncFn;
    if (!defaultSync) {
      try {
        const { checkInAttendee } = await import('@/lib/attendees');
        defaultSync = async (item: QueuedCheckIn) => {
          await checkInAttendee(item.eventId, item.attendeeId);
        };
      } catch (err) {
        console.warn('[OfflineQueue] Could not load sync handler:', err);
      }
    }

    for (const item of this.queue) {
      try {
        if (defaultSync) {
          await defaultSync(item);
          syncedCount++;
        } else {
          remaining.push(item);
        }
      } catch (err) {
        console.warn('[OfflineQueue] Error syncing queued check-in for:', item.attendeeId, err);
        remaining.push(item);
      }
    }

    this.queue = remaining;
    this.saveQueue();
    this.isSyncing = false;
    this.notify();

    return syncedCount;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener([...this.queue], this.isOnline, this.isSyncing);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l([...this.queue], this.isOnline, this.isSyncing));
  }
}

export const offlineQueue = new OfflineQueueManager();
