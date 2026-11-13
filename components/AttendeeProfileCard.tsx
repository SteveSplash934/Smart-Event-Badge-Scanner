import { Attendee } from '@/types/attendee';
import TicketTypeBadge from './TicketTypeBadge';
import {
  CheckCircle2,
  AlertCircle,
  Check,
  RefreshCw,
  Clock,
  Building,
  Mail,
  Layers,
} from 'lucide-react';

interface Props {
  attendee: Attendee;
  alreadyCheckedIn: boolean;
  onCheckIn: () => void;
  onScanAgain: () => void;
  isCheckingIn: boolean;
}

// Safely formats any timestamp: Firestore Timestamp, plain { seconds }, ISO string, Date, or number
function formatTimestamp(ts: unknown): string {
  if (!ts) return 'Just now';

  try {
    let date: Date | null = null;

    if (typeof (ts as { toDate?: () => Date })?.toDate === 'function') {
      date = (ts as { toDate: () => Date }).toDate();
    } else if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
      date = new Date((ts as { seconds: number }).seconds * 1000);
    } else if (ts instanceof Date) {
      date = ts;
    } else if (typeof ts === 'string' || typeof ts === 'number') {
      date = new Date(ts);
    }

    if (!date || isNaN(date.getTime())) {
      return 'Just now';
    }

    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Just now';
  }
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg flex-shrink-0 border border-white/20">
      {initials || 'A'}
    </div>
  );
}

export default function AttendeeProfileCard({
  attendee,
  alreadyCheckedIn,
  onCheckIn,
  onScanAgain,
  isCheckingIn,
}: Props) {
  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto rounded-3xl bg-gray-900 border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Status header banner */}
      <div
        className={`px-4 sm:px-5 py-3 flex items-center gap-2 text-xs sm:text-sm font-semibold border-b ${
          alreadyCheckedIn
            ? 'bg-amber-500/15 text-amber-300 border-amber-500/20'
            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
        }`}
      >
        {alreadyCheckedIn ? (
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
        ) : (
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
        )}
        <span>
          {alreadyCheckedIn ? 'Already Checked In' : 'Valid Badge — Ready to Check In'}
        </span>
      </div>

      {/* Profile details */}
      <div className="p-4 sm:p-5 flex gap-3.5 sm:gap-4 items-start">
        {attendee.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={attendee.photoURL}
            alt={attendee.fullName}
            className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover shadow-lg flex-shrink-0 border border-white/15"
          />
        ) : (
          <InitialsAvatar name={attendee.fullName} />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-white text-base sm:text-lg font-bold leading-tight truncate">
              {attendee.fullName}
            </h2>
            <TicketTypeBadge type={attendee.ticketType} />
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-xs truncate">
            <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
            <span className="truncate">{attendee.email}</span>
          </div>

          {attendee.company && (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1 truncate">
              <Building className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
              <span className="truncate">{attendee.company}</span>
            </div>
          )}

          <div className="mt-2 font-mono text-[11px] text-slate-500">
            ID: <span className="text-slate-300 font-semibold">{attendee.id}</span>
          </div>
        </div>
      </div>

      {/* Sessions list */}
      {attendee.sessions && attendee.sessions.length > 0 && (
        <div className="px-4 sm:px-5 pb-3 pt-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase tracking-wider font-semibold mb-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Registered Sessions</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {attendee.sessions.map((session) => (
              <span
                key={session}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10"
              >
                {session}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Check-in timestamp (if already in) */}
      {alreadyCheckedIn && attendee.checkedInAt && (
        <div className="px-4 sm:px-5 pb-3">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
            <Clock className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>
              Checked in at:{' '}
              <strong className="font-semibold text-white">
                {formatTimestamp(attendee.checkedInAt)}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="p-4 sm:p-5 pt-2 flex flex-col sm:flex-row gap-2.5">
        {!alreadyCheckedIn && (
          <button
            onClick={onCheckIn}
            disabled={isCheckingIn}
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition text-sm shadow-lg shadow-emerald-950/50 min-h-[44px]"
          >
            {isCheckingIn ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{isCheckingIn ? 'Checking in…' : 'Confirm Check In'}</span>
          </button>
        )}

        <button
          onClick={onScanAgain}
          type="button"
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/15 text-slate-200 font-semibold transition text-sm min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <span>Scan Again</span>
        </button>
      </div>
    </div>
  );
}
