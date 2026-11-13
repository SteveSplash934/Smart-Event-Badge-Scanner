import { XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface StatusBannerProps {
  type: 'not_found' | 'error';
  message?: string;
  badgeId?: string;
  onScanAgain: () => void;
}

export default function StatusBanner({
  type,
  message,
  badgeId,
  onScanAgain,
}: StatusBannerProps) {
  const isNotFound = type === 'not_found';

  return (
    <div
      className={`w-full max-w-sm mx-auto rounded-2xl border p-6 text-center flex flex-col items-center gap-4 shadow-xl ${
        isNotFound
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
      }`}
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center ${
          isNotFound ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
        }`}
      >
        {isNotFound ? (
          <XCircle className="w-8 h-8" />
        ) : (
          <AlertTriangle className="w-8 h-8" />
        )}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-white">
          {isNotFound ? 'Invalid Badge' : 'Scan Error'}
        </h3>
        {isNotFound && badgeId && (
          <p className="text-xs sm:text-sm text-slate-300">
            Badge ID{' '}
            <span className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded text-white font-medium">
              {badgeId}
            </span>{' '}
            was not found in attendee records.
          </p>
        )}
        {message && <p className="text-xs sm:text-sm text-slate-300">{message}</p>}
      </div>

      <button
        onClick={onScanAgain}
        type="button"
        className="mt-2 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/20 font-semibold transition text-sm text-white min-h-[44px]"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Scan Next Badge</span>
      </button>
    </div>
  );
}
