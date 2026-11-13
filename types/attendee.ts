import { Timestamp } from 'firebase/firestore';

export type TicketType = 'General' | 'VIP' | 'Speaker' | 'Staff';

export interface Attendee {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  ticketType: TicketType;
  photoURL?: string;
  checkedIn: boolean;
  checkedInAt?: Timestamp | null;
  checkedInBy?: string | null;
  sessions?: string[];
  company?: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;         // ISO date string e.g. "2026-11-15"
  venue: string;
  description?: string;
}

export interface TierStats {
  tier: TicketType;
  total: number;
  checkedIn: number;
  percentage: number;
}

export interface AttendanceStats {
  total: number;
  checkedIn: number;
  percentage: number;
  byTier: Record<TicketType, TierStats>;
}

export type ScanState =
  | { status: 'idle' }
  | { status: 'scanning' }
  | { status: 'loading'; badgeId: string }
  | { status: 'found'; attendee: Attendee }
  | { status: 'already_checked_in'; attendee: Attendee }
  | { status: 'checked_in'; attendee: Attendee }
  | { status: 'not_found'; badgeId: string }
  | { status: 'error'; message: string };
