// Web Audio API & Haptic feedback utilities for badge scanning

class FeedbackManager {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('badge_scanner_sound_enabled');
      this.soundEnabled = stored !== null ? stored === 'true' : true;
    }
  }

  public isMuted(): boolean {
    return !this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('badge_scanner_sound_enabled', String(enabled));
    }
    if (enabled) {
      this.initAudio();
    }
  }

  public toggleSound(): boolean {
    const next = !this.soundEnabled;
    this.setSoundEnabled(next);
    if (next) {
      // Play a quick test pip when unmuting
      this.playSuccessBeep();
    }
    return next;
  }

  public initAudio(): void {
    if (typeof window === 'undefined') return;

    try {
      if (!this.audioCtx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      this.initialized = true;
    } catch (err) {
      console.warn('[Feedback] AudioContext init error:', err);
    }
  }

  private triggerVibrate(pattern: number | number[]): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fallback on restricted environments
      }
    }
  }

  private playToneSequence(tones: Array<{ freq: number; duration: number; type?: OscillatorType; delay?: number }>): void {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    let accumulatedTime = ctx.currentTime;

    tones.forEach(({ freq, duration, type = 'sine', delay = 0 }) => {
      accumulatedTime += delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, accumulatedTime);

      gain.gain.setValueAtTime(0.001, accumulatedTime);
      gain.gain.exponentialRampToValueAtTime(0.2, accumulatedTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, accumulatedTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(accumulatedTime);
      osc.stop(accumulatedTime + duration);

      accumulatedTime += duration;
    });
  }

  /**
   * Successful barcode decode / valid badge found.
   * Pleasant ascending two-tone chime + light double-tap vibration.
   */
  public playScanSuccess(): void {
    this.triggerVibrate([60, 40, 60]);
    this.playToneSequence([
      { freq: 587.33, duration: 0.08, type: 'sine' }, // D5
      { freq: 880, duration: 0.12, type: 'sine', delay: 0.02 }, // A5
    ]);
  }

  /**
   * Successful check-in transaction completed.
   * Ascending 3-chord major chime + solid vibration.
   */
  public playCheckInSuccess(): void {
    this.triggerVibrate([80, 40, 80]);
    this.playToneSequence([
      { freq: 523.25, duration: 0.07, type: 'sine' }, // C5
      { freq: 659.25, duration: 0.07, type: 'sine' }, // E5
      { freq: 783.99, duration: 0.16, type: 'sine' }, // G5
    ]);
  }

  /**
   * Warning: Badge has already checked in.
   * Low double-buzz + longer warning vibration.
   */
  public playDuplicateWarning(): void {
    this.triggerVibrate([140, 70, 140]);
    this.playToneSequence([
      { freq: 240, duration: 0.1, type: 'triangle' },
      { freq: 200, duration: 0.14, type: 'triangle', delay: 0.04 },
    ]);
  }

  /**
   * Error: Badge not found or invalid format.
   * Distinct low buzz alert + alert vibration.
   */
  public playErrorAlert(): void {
    this.triggerVibrate([200, 80, 200]);
    this.playToneSequence([
      { freq: 180, duration: 0.12, type: 'sawtooth' },
      { freq: 130, duration: 0.2, type: 'sawtooth', delay: 0.02 },
    ]);
  }

  /**
   * Quick pleasant feedback pip when toggling sound ON.
   */
  public playSuccessBeep(): void {
    this.playToneSequence([{ freq: 700, duration: 0.08, type: 'sine' }]);
  }
}

export const feedback = new FeedbackManager();
