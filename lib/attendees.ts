import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  serverTimestamp,
  orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from './firebase/client';
import { Attendee, Event, AttendanceStats, TicketType, TierStats } from '@/types/attendee';
import { DEMO_EVENTS, DEMO_ATTENDEES } from './demo-data';

export function isFirebaseConfigured(): boolean {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return Boolean(apiKey && !apiKey.startsWith('AIzaSyFakeKey') && db && auth);
}

const LOCAL_STORAGE_KEY = 'badge_scanner_attendees_v1';

function getLocalAttendees(eventId: string): Attendee[] {
  if (typeof window === 'undefined') {
    return DEMO_ATTENDEES[eventId] || [];
  }
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${eventId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading demo attendees from localStorage:', e);
  }
  const defaults = DEMO_ATTENDEES[eventId] || [];
  setLocalAttendees(eventId, defaults);
  return defaults;
}

function setLocalAttendees(eventId: string, attendees: Attendee[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${eventId}`, JSON.stringify(attendees));
    window.dispatchEvent(new CustomEvent('badge_scanner_local_update', { detail: { eventId } }));
  } catch (e) {
    console.warn('Error saving demo attendees to localStorage:', e);
  }
}

const ALL_TIERS: TicketType[] = ['VIP', 'Speaker', 'Staff', 'General'];

export function computeAttendanceStats(attendees: Attendee[]): AttendanceStats {
  const total = attendees.length;
  const checkedIn = attendees.filter((a) => a.checkedIn).length;
  const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  const byTier: Record<TicketType, TierStats> = {
    VIP: { tier: 'VIP', total: 0, checkedIn: 0, percentage: 0 },
    Speaker: { tier: 'Speaker', total: 0, checkedIn: 0, percentage: 0 },
    Staff: { tier: 'Staff', total: 0, checkedIn: 0, percentage: 0 },
    General: { tier: 'General', total: 0, checkedIn: 0, percentage: 0 },
  };

  attendees.forEach((a) => {
    const tier = (a.ticketType in byTier ? a.ticketType : 'General') as TicketType;
    byTier[tier].total += 1;
    if (a.checkedIn) {
      byTier[tier].checkedIn += 1;
    }
  });

  ALL_TIERS.forEach((tier) => {
    const item = byTier[tier];
    item.percentage = item.total > 0 ? Math.round((item.checkedIn / item.total) * 100) : 0;
  });

  return { total, checkedIn, percentage, byTier };
}

export function subscribeToEventStats(
  eventId: string,
  callback: (stats: AttendanceStats) => void
): () => void {
  if (isFirebaseConfigured() && db) {
    try {
      const attendeesCol = collection(db, 'events', eventId, 'attendees');
      const unsubscribe = onSnapshot(
        attendeesCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const attendees = snapshot.docs.map(
              (d) => ({ id: d.id, ...d.data() }) as Attendee
            );
            callback(computeAttendanceStats(attendees));
          } else {
            const locals = getLocalAttendees(eventId);
            callback(computeAttendanceStats(locals));
          }
        },
        (error) => {
          console.warn('[subscribeToEventStats] Firestore snapshot error, using local fallback:', error);
          const locals = getLocalAttendees(eventId);
          callback(computeAttendanceStats(locals));
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('[subscribeToEventStats] Failed to attach Firestore listener:', err);
    }
  }

  // Local / Demo Mode fallback
  const emitLocal = () => {
    const attendees = getLocalAttendees(eventId);
    callback(computeAttendanceStats(attendees));
  };

  emitLocal();

  if (typeof window !== 'undefined') {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === `${LOCAL_STORAGE_KEY}_${eventId}`) {
        emitLocal();
      }
    };

    const handleCustom = (e: unknown) => {
      const custom = e as CustomEvent<{ eventId: string }>;
      if (!custom.detail || custom.detail.eventId === eventId) {
        emitLocal();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('badge_scanner_local_update', handleCustom as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('badge_scanner_local_update', handleCustom as EventListener);
    };
  }

  return () => {};
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function getEvents(): Promise<Event[]> {
  if (!isFirebaseConfigured() || !db) {
    return DEMO_EVENTS;
  }
  try {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      return DEMO_EVENTS;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Event);
  } catch (err) {
    console.warn('[getEvents] Falling back to demo events:', err);
    return DEMO_EVENTS;
  }
}

// ─── Attendees ────────────────────────────────────────────────────────────────

export async function getAttendee(
  eventId: string,
  badgeId: string
): Promise<Attendee | null> {
  const cleanId = badgeId.trim();

  if (!isFirebaseConfigured() || !db) {
    const attendees = getLocalAttendees(eventId);
    const found = attendees.find(
      (a) => a.id.toLowerCase() === cleanId.toLowerCase()
    );
    return found ? { ...found } : null;
  }

  try {
    const ref = doc(db, 'events', eventId, 'attendees', cleanId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const attendees = getLocalAttendees(eventId);
      const found = attendees.find(
        (a) => a.id.toLowerCase() === cleanId.toLowerCase()
      );
      return found ? { ...found } : null;
    }
    return { id: snap.id, ...snap.data() } as Attendee;
  } catch (err) {
    console.warn('[getAttendee] Firestore error, trying local demo data:', err);
    const attendees = getLocalAttendees(eventId);
    const found = attendees.find(
      (a) => a.id.toLowerCase() === cleanId.toLowerCase()
    );
    return found ? { ...found } : null;
  }
}

export async function checkInAttendee(
  eventId: string,
  attendeeId: string
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    const attendees = getLocalAttendees(eventId);
    const index = attendees.findIndex((a) => a.id === attendeeId);
    if (index !== -1) {
      attendees[index] = {
        ...attendees[index],
        checkedIn: true,
        checkedInAt: Timestamp.now(),
        checkedInBy: auth?.currentUser?.email || 'staff@event.com',
      };
      setLocalAttendees(eventId, attendees);
    }
    return;
  }

  try {
    const ref = doc(db, 'events', eventId, 'attendees', attendeeId);
    await updateDoc(ref, {
      checkedIn: true,
      checkedInAt: serverTimestamp(),
      checkedInBy: auth?.currentUser?.uid ?? 'unknown',
    });
  } catch (err) {
    console.warn('[checkInAttendee] Firestore update failed, falling back to local state:', err);
    const attendees = getLocalAttendees(eventId);
    const index = attendees.findIndex((a) => a.id === attendeeId);
    if (index !== -1) {
      attendees[index] = {
        ...attendees[index],
        checkedIn: true,
        checkedInAt: Timestamp.now(),
        checkedInBy: 'staff',
      };
      setLocalAttendees(eventId, attendees);
    }
  }
}
