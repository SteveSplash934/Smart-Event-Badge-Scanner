'use client';

import { useState, useMemo } from 'react';
import { Attendee, TicketType } from '@/types/attendee';
import TicketTypeBadge from '@/components/TicketTypeBadge';
import { feedback } from '@/lib/feedback';
import {
  Search,
  X,
  Users,
  CheckCircle2,
  Clock,
  Filter,
  UserCheck,
  Building2,
  Mail,
  CalendarCheck,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface AttendeeDirectoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  attendees: Attendee[];
  onCheckIn: (attendeeId: string) => Promise<void>;
  onSelectAttendee: (attendee: Attendee) => void;
  eventName: string;
}

type StatusFilter = 'all' | 'pending' | 'checked_in';

export default function AttendeeDirectoryDrawer({
  isOpen,
  onClose,
  attendees,
  onCheckIn,
  onSelectAttendee,
  eventName,
}: AttendeeDirectoryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedTier, setSelectedTier] = useState<TicketType | 'all'>('all');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  // Extract distinct sessions across all attendees in this event
  const availableSessions = useMemo(() => {
    const set = new Set<string>();
    attendees.forEach((a) => {
      a.sessions?.forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, [attendees]);

  // Filtered attendees
  const filteredAttendees = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return attendees.filter((a) => {
      // Search match: name, email, badge ID, company
      const matchesSearch =
        !q ||
        a.fullName.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.company && a.company.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Status match
      if (statusFilter === 'pending' && a.checkedIn) return false;
      if (statusFilter === 'checked_in' && !a.checkedIn) return false;

      // Tier match
      if (selectedTier !== 'all' && a.ticketType !== selectedTier) return false;

      // Session match
      if (selectedSession !== 'all' && (!a.sessions || !a.sessions.includes(selectedSession))) {
        return false;
      }

      return true;
    });
  }, [attendees, searchQuery, statusFilter, selectedTier, selectedSession]);

  const handleQuickCheckIn = async (attendee: Attendee, e: React.MouseEvent) => {
    e.stopPropagation();
    if (attendee.checkedIn || checkingInId) return;

    setCheckingInId(attendee.id);
    try {
      await onCheckIn(attendee.id);
      feedback.playCheckInSuccess();
    } catch (err) {
      console.error('Directory check-in failed:', err);
      feedback.playErrorAlert();
    } finally {
      setCheckingInId(null);
    }
  };

  const handleRowClick = (attendee: Attendee) => {
    onSelectAttendee(attendee);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-gray-900 border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gray-900/95 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-bold text-base sm:text-lg leading-tight truncate">
                Attendee Directory
              </h2>
              <p className="text-slate-400 text-xs truncate">
                {eventName} • {attendees.length} guests registered
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            title="Close directory"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filters Bar */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 bg-gray-950/40 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, badge ID or company…"
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-gray-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              All ({attendees.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                statusFilter === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Clock className="w-3 h-3" />
              Pending ({attendees.filter((a) => !a.checkedIn).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('checked_in')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                statusFilter === 'checked_in'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Checked In ({attendees.filter((a) => a.checkedIn).length})
            </button>
          </div>

          {/* Dropdown Filters (Tier + Session) */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Filter className="w-3 h-3 text-indigo-400" />
                Ticket Tier
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as TicketType | 'all')}
                className="w-full py-1.5 px-2 rounded-lg bg-gray-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Tiers</option>
                <option value="VIP">VIP</option>
                <option value="Speaker">Speaker</option>
                <option value="Staff">Staff</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                Session
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full py-1.5 px-2 rounded-lg bg-gray-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Sessions</option>
                {availableSessions.map((session) => (
                  <option key={session} value={session}>
                    {session}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Attendee Results List */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>
              Showing {filteredAttendees.length} of {attendees.length} guests
            </span>
            {(searchQuery || statusFilter !== 'all' || selectedTier !== 'all' || selectedSession !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setSelectedTier('all');
                  setSelectedSession('all');
                }}
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                Reset filters
              </button>
            )}
          </div>

          {filteredAttendees.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-gray-950/40 border border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 mx-auto mb-2">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-white font-medium text-sm">No matching attendees</p>
              <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                No guest matches your search query or filter criteria.
              </p>
            </div>
          ) : (
            filteredAttendees.map((attendee) => {
              const isCheckingIn = checkingInId === attendee.id;
              return (
                <div
                  key={attendee.id}
                  onClick={() => handleRowClick(attendee)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRowClick(attendee);
                  }}
                  className="w-full text-left bg-gray-950/60 hover:bg-gray-800/60 active:bg-gray-800 border border-white/10 rounded-2xl p-3 sm:p-3.5 transition flex flex-col gap-2.5 cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm group-hover:text-indigo-300 transition">
                          {attendee.fullName}
                        </span>
                        <TicketTypeBadge type={attendee.ticketType} />
                      </div>

                      <div className="flex items-center gap-3 text-slate-400 text-xs mt-1 flex-wrap">
                        {attendee.company && (
                          <span className="inline-flex items-center gap-1 truncate">
                            <Building2 className="w-3 h-3 text-slate-500" />
                            {attendee.company}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-400">
                          ID: {attendee.id}
                        </span>
                      </div>
                    </div>

                    {/* Action Button: Check In / Admitted Pill */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {attendee.checkedIn ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Admitted</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isCheckingIn}
                          onClick={(e) => handleQuickCheckIn(attendee, e)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-md shadow-indigo-950/40 transition disabled:opacity-50"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{isCheckingIn ? 'Checking in…' : 'Check In'}</span>
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition" />
                    </div>
                  </div>

                  {/* Sessions registered tags */}
                  {attendee.sessions && attendee.sessions.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
                      <CalendarCheck className="w-3 h-3 text-slate-500" />
                      {attendee.sessions.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-400 border border-white/5"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
