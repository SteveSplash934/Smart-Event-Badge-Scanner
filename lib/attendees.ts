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
} from 'firebase/firestore';
import { db, auth } from './firebase/client';
import { Attendee, Event } from '@/types/attendee';
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
  } catch (e) {
    console.warn('Error saving demo attendees to localStorage:', e);
  }
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
