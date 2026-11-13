'use client';

import { useState, useEffect } from 'react';
import { getEvents } from '@/lib/attendees';
import { Event } from '@/types/attendee';
import { useAuth } from '@/lib/auth-context';
import {
  QrCode,
  Calendar,
  MapPin,
  ChevronRight,
  LogOut,
  Sparkles,
  Ticket,
} from 'lucide-react';

interface EventSelectorProps {
  onSelect: (event: Event) => void;
}

export default function EventSelector({ onSelect }: EventSelectorProps) {
  const { user, signOut, isDemoMode } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => setError('Failed to load events. Check your network connection.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-[100dvh] bg-gray-950 flex flex-col">
      {/* Top App Bar */}
      <header className="border-b border-white/10 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Badge Scanner</h1>
            <p className="text-[11px] text-slate-400">Staff Portal</p>
          </div>
        </div>

        <button
          onClick={signOut}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-xs text-slate-300 hover:text-white transition min-h-[36px]"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">{user?.email?.split('@')[0]}</span>
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 w-full max-w-lg mx-auto">
        <div className="w-full">
          <div className="mb-6 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
              <h2 className="text-white text-xl sm:text-2xl font-bold tracking-tight">
                Select Active Event
              </h2>
              {isDemoMode && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  <Sparkles className="w-3 h-3" />
                  Demo
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              Choose the event you are validating attendee badges for today.
            </p>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="h-8 w-8 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-slate-500 text-xs">Loading available events…</p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/25 px-4 py-3 text-rose-300 text-xs sm:text-sm mb-4">
              {error}
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center text-slate-400 text-xs sm:text-sm">
              <Ticket className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
              <p>No events found in records.</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => onSelect(event)}
                type="button"
                className="w-full text-left rounded-2xl bg-gray-900 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 active:scale-[0.99] p-4 sm:p-5 transition-all group shadow-lg flex items-center justify-between gap-3 min-h-[72px]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold text-base group-hover:text-indigo-300 transition-colors truncate">
                      {event.name}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-slate-400 text-xs">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {event.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{event.venue}</span>
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-slate-500 text-xs mt-1.5 line-clamp-1">
                      {event.description}
                    </p>
                  )}
                </div>

                <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors flex-shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
