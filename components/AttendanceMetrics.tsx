'use client';

import { useState } from 'react';
import { AttendanceStats, TicketType } from '@/types/attendee';
import TicketTypeBadge from '@/components/TicketTypeBadge';
import {
  Users,
  CheckCircle2,
  Clock,
  BarChart3,
  X,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface AttendanceMetricsProps {
  stats: AttendanceStats | null;
  eventName: string;
}

const ORDERED_TIERS: TicketType[] = ['VIP', 'Speaker', 'Staff', 'General'];

export default function AttendanceMetrics({ stats, eventName }: AttendanceMetricsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!stats) {
    return (
      <div className="w-full bg-gray-900/40 border-b border-white/5 px-4 py-2 flex items-center justify-between text-xs text-slate-500">
        <span className="animate-pulse">Loading attendance metrics…</span>
      </div>
    );
  }

  const { total, checkedIn, percentage, byTier } = stats;
  const pending = Math.max(0, total - checkedIn);

  return (
    <>
      {/* Top Banner Counter & Progress Bar */}
      <section
        aria-label="Attendance Live Metrics"
        className="w-full bg-gray-900/70 border-b border-white/10 backdrop-blur-md px-3.5 sm:px-6 py-2.5"
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Left: Summary Numbers */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Users className="w-3.5 h-3.5" />
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-white font-bold text-sm sm:text-base">
                  {checkedIn}
                </span>
                <span className="text-slate-400 text-xs">/ {total} Checked In</span>
              </div>
            </div>

            {/* Percentage Pill */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                percentage >= 80
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                  : percentage >= 50
                  ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/25'
              }`}
            >
              <TrendingUp className="w-2.5 h-2.5" />
              {percentage}%
            </span>

            {/* Breakdown Toggle Button (Mobile right aligned) */}
            <button
              onClick={() => setIsOpen(true)}
              type="button"
              className="sm:hidden ml-auto inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 active:text-indigo-200 font-medium py-1 px-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 transition"
            >
              <BarChart3 className="w-3 h-3" />
              <span>Tiers</span>
            </button>
          </div>

          {/* Right: Progress bar & Desktop Breakdown Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-48 bg-gray-800/80 rounded-full h-2.5 overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              />
            </div>

            <button
              onClick={() => setIsOpen(true)}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-medium py-1 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 transition"
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tier Breakdown</span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </div>
      </section>

      {/* Tier Breakdown Modal / Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-gray-900 border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm sm:text-base leading-tight">
                    Attendance Breakdown
                  </h3>
                  <p className="text-slate-400 text-xs truncate max-w-[220px] sm:max-w-xs">
                    {eventName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                type="button"
                title="Close modal"
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-gray-950/60 border border-white/5 rounded-2xl p-3 text-center">
                <div className="flex items-center justify-center text-slate-400 mb-1">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <p className="text-slate-400 text-[11px]">Total</p>
                <p className="text-white font-bold text-base mt-0.5">{total}</p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-center">
                <div className="flex items-center justify-center text-emerald-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <p className="text-emerald-300 text-[11px]">Admitted</p>
                <p className="text-emerald-300 font-bold text-base mt-0.5">{checkedIn}</p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-center">
                <div className="flex items-center justify-center text-amber-400 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <p className="text-amber-300 text-[11px]">Pending</p>
                <p className="text-amber-300 font-bold text-base mt-0.5">{pending}</p>
              </div>
            </div>

            {/* Breakdown by Tier */}
            <div className="space-y-3">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Status by Ticket Tier
              </p>

              <div className="space-y-2.5">
                {ORDERED_TIERS.map((tier) => {
                  const item = byTier[tier] || {
                    tier,
                    total: 0,
                    checkedIn: 0,
                    percentage: 0,
                  };
                  return (
                    <div
                      key={tier}
                      className="bg-gray-950/50 border border-white/5 rounded-2xl p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <TicketTypeBadge type={tier} />
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-semibold text-white">
                            {item.checkedIn}
                          </span>
                          <span className="text-slate-500">/</span>
                          <span className="text-slate-400">{item.total}</span>
                          <span className="text-slate-500 font-mono text-[11px] ml-1">
                            ({item.percentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Mini Tier Progress Bar */}
                      <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer close button */}
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-white font-medium text-xs sm:text-sm transition text-center min-h-[42px]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
