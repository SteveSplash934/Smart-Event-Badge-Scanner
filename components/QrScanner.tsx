'use client';

import { useEffect, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { Camera } from 'lucide-react';

interface QrScannerProps {
  onScan: (text: string) => void;
  active?: boolean;
}

export default function QrScanner({ onScan, active = true }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const handleScan = useCallback(onScan, [onScan]);

  useEffect(() => {
    if (!active || !videoRef.current) return;

    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromVideoDevice(
        undefined, // defaults to environment/rear camera on mobile
        videoRef.current,
        (result, error) => {
          if (result) {
            handleScan(result.getText());
          }
          if (error && error.name !== 'NotFoundException') {
            console.warn('[QrScanner] decode error:', error);
          }
        }
      )
      .then((controls) => {
        controlsRef.current = controls;
      })
      .catch((err) => {
        console.error('[QrScanner] Failed to start camera:', err);
      });

    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [active, handleScan]);

  return (
    <div className="relative w-full max-w-[320px] sm:max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black aspect-square">
      {/* Camera feed */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        playsInline
      />

      {/* Viewfinder frame overlay */}
      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="w-7 h-7 border-t-3 border-l-3 border-indigo-400 rounded-tl-xl" />
          <span className="w-7 h-7 border-t-3 border-r-3 border-indigo-400 rounded-tr-xl" />
        </div>

        {/* Center glowing scan line */}
        <div className="w-full animate-scan-line">
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_2px_rgba(129,140,248,0.8)]" />
        </div>

        <div className="flex justify-between items-end">
          <span className="w-7 h-7 border-b-3 border-l-3 border-indigo-400 rounded-bl-xl" />
          <span className="w-7 h-7 border-b-3 border-r-3 border-indigo-400 rounded-br-xl" />
        </div>
      </div>

      {/* Camera live badge indicator */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-slate-300">
        <Camera className="w-3 h-3 text-emerald-400" />
        <span>Camera Active</span>
      </div>
    </div>
  );
}
