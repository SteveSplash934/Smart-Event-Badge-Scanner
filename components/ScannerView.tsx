'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useRef, useEffect } from 'react';
import { getAttendee, checkInAttendee } from '@/lib/attendees';
import { ScanState, Event } from '@/types/attendee';
import { feedback } from '@/lib/feedback';
import AttendeeProfileCard from '@/components/AttendeeProfileCard';
import StatusBanner from '@/components/StatusBanner';
import { useAuth } from '@/lib/auth-context';
import {
  QrCode,
  Calendar,
  MapPin,
  ArrowLeft,
  LogOut,
  Search,
  ScanLine,
  Sparkles,
  HelpCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';

const QrScanner = dynamic(() => import('@/components/QrScanner'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-[320px] sm:max-w-sm mx-auto aspect-square rounded-3xl bg-gray-900 border border-white/10 flex flex-col items-center justify-center gap-3 shadow-2xl">
      <div className="h-8 w-8 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin" />
      <p className="text-slate-400 text-xs">Accessing camera device…</p>
    </div>
  ),
});

interface ScannerViewProps {
  event: Event;
  onChangeEvent: () => void;
}

export default function ScannerView({ event, onChangeEvent }: ScannerViewProps) {
  const { user, signOut, isDemoMode } = useAuth();
  const [scanState, setScanState] = useState<ScanState>({ status: 'scanning' });
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [soundMuted, setSoundMuted] = useState<boolean>(() => feedback.isMuted());
  const lastScannedRef = useRef<string | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Warm up audio context on first user interaction anywhere (required by iOS Safari)
    const unlock = () => {
      feedback.initAudio();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const handleToggleSound = () => {
    const isNowMuted = !soundMuted;
    feedback.setSoundEnabled(!isNowMuted);
    setSoundMuted(isNowMuted);
    if (!isNowMuted) {
      feedback.playSuccessBeep();
    }
  };

  const handleScan = useCallback(
    async (rawBadgeId: string) => {
      const badgeId = rawBadgeId.trim();
      if (!badgeId) return;

      // Debounce: ignore repeated scans within 2s cooldown
      if (lastScannedRef.current === badgeId) return;
      lastScannedRef.current = badgeId;
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      cooldownRef.current = setTimeout(() => {
        lastScannedRef.current = null;
      }, 2000);

      setScanState({ status: 'loading', badgeId });

      try {
        const attendee = await getAttendee(event.id, badgeId);

        if (!attendee) {
          feedback.playErrorAlert();
          setScanState({ status: 'not_found', badgeId });
          return;
        }

        if (attendee.checkedIn) {
          feedback.playDuplicateWarning();
          setScanState({ status: 'already_checked_in', attendee });
        } else {
          feedback.playScanSuccess();
          setScanState({ status: 'found', attendee });
        }
      } catch (err) {
        console.error('[ScannerView] Lookup error:', err);
        feedback.playErrorAlert();
        setScanState({
          status: 'error',
          message: 'Unable to query attendee records. Please check connection.',
        });
      }
    },
    [event.id]
  );

  const handleCheckIn = async () => {
    if (scanState.status !== 'found') return;
    setIsCheckingIn(true);
    try {
      await checkInAttendee(event.id, scanState.attendee.id);
      feedback.playCheckInSuccess();
      setScanState({
        status: 'checked_in',
        attendee: {
          ...scanState.attendee,
          checkedIn: true,
          checkedInAt: new Date() as unknown as null,
        },
      });
    } catch (err) {
      console.error('[ScannerView] Check-in error:', err);
      feedback.playErrorAlert();
      setScanState({
        status: 'error',
        message: 'Check-in transaction could not be completed.',
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleScanAgain = () => {
    lastScannedRef.current = null;
    setManualCode('');
    setScanState({ status: 'scanning' });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
    }
  };

  const isScanning =
    scanState.status === 'scanning' || scanState.status === 'loading';

  const sampleBadges =
    event.id === 'tech-summit-2026'
      ? ['TECH-VIP-01', 'TECH-SPK-02', 'TECH-GEN-03', 'TECH-STF-07']
      : ['UX-VIP-11', 'UX-SPK-12', 'UX-GEN-13', 'UX-STF-17'];

  return (
    <div className="min-h-[100dvh] bg-gray-950 flex flex-col">
      {/* Top App Bar */}
      <header className="border-b border-white/10 bg-gray-900/80 backdrop-blur-md sticky top-0 z-20 px-3.5 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onChangeEvent}
            type="button"
            title="Change Event"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white transition flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-white font-bold text-xs sm:text-sm leading-tight truncate">
                {event.name}
              </p>
              {isDemoMode && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 flex-shrink-0">
                  <Sparkles className="w-2.5 h-2.5" />
                  Demo
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px] truncate">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {event.date}
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1 truncate hidden sm:inline-flex">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span className="truncate">{event.venue}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleToggleSound}
            type="button"
            title={soundMuted ? 'Unmute Audio & Haptic Feedback' : 'Mute Audio & Haptic Feedback'}
            aria-label={soundMuted ? 'Unmute audio and haptic feedback' : 'Mute audio and haptic feedback'}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition ${
              soundMuted
                ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20 active:bg-rose-500/30'
                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 active:bg-emerald-500/30'
            }`}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={signOut}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-xs text-slate-300 hover:text-white transition min-h-[36px]"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Scanner Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8 w-full max-w-lg mx-auto">
        {/* Scanner Viewfinder */}
        <div className={isScanning ? 'block w-full' : 'hidden'}>
          <QrScanner onScan={handleScan} active={isScanning} />

          <p className="text-center text-slate-400 text-xs mt-4 flex items-center justify-center gap-1.5">
            <ScanLine className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>
              {scanState.status === 'loading'
                ? 'Retrieving attendee profile…'
                : 'Point camera at attendee QR code or enter ID below'}
            </span>
          </p>

          {/* Manual Entry Form */}
          <form onSubmit={handleManualSubmit} className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Badge ID (e.g. TECH-VIP-01)"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs transition flex-shrink-0 min-h-[44px]"
            >
              Lookup
            </button>
          </form>

          {/* Quick-Test Badge Pills */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] mb-2.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Tap sample badge ID to simulate scan:</span>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {sampleBadges.map((id) => (
                <button
                  key={id}
                  onClick={() => handleScan(id)}
                  type="button"
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition active:scale-95"
                >
                  {id}
                </button>
              ))}
              <button
                onClick={() => handleScan('INVALID-999')}
                type="button"
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/25 border border-rose-500/20 text-xs font-mono text-rose-300 transition active:scale-95"
              >
                INVALID-999
              </button>
            </div>
          </div>
        </div>

        {/* Scan Result Cards */}
        {(scanState.status === 'found' ||
          scanState.status === 'already_checked_in' ||
          scanState.status === 'checked_in') && (
          <AttendeeProfileCard
            attendee={scanState.attendee}
            alreadyCheckedIn={
              scanState.status === 'already_checked_in' ||
              scanState.status === 'checked_in'
            }
            onCheckIn={handleCheckIn}
            onScanAgain={handleScanAgain}
            isCheckingIn={isCheckingIn}
          />
        )}

        {scanState.status === 'not_found' && (
          <StatusBanner
            type="not_found"
            badgeId={scanState.badgeId}
            onScanAgain={handleScanAgain}
          />
        )}

        {scanState.status === 'error' && (
          <StatusBanner
            type="error"
            message={scanState.message}
            onScanAgain={handleScanAgain}
          />
        )}
      </main>
    </div>
  );
}
