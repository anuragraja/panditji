// High-impact Web Audio API synthesized restaurant kitchen alarm bell
// Strong piercing chime & deep haptic vibration for immediate admin attention

class OrderAudioAlert {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isAlarmPlaying: boolean = false;
  private repeatTimer: NodeJS.Timeout | null = null;
  private burstTimers: NodeJS.Timeout[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      const storedMute = localStorage.getItem("pj_admin_sound_muted");
      this.isMuted = storedMute === "true";

      // Unlock AudioContext on first user interaction if suspended
      const unlockAudio = () => {
        if (this.ctx && this.ctx.state === "suspended") {
          this.ctx.resume().catch(() => {});
        }
      };
      window.addEventListener("click", unlockAudio, { passive: true });
      window.addEventListener("touchstart", unlockAudio, { passive: true });
      window.addEventListener("keydown", unlockAudio, { passive: true });
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("pj_admin_sound_muted", String(muted));
    }
    if (muted) {
      this.stopAlarm();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    if (!this.isMuted) {
      this.playOrderChime();
    }
    return this.isMuted;
  }

  public isAlarmRunning(): boolean {
    return this.isAlarmPlaying;
  }

  // Starts recurring kitchen alarm bell chime every 4 seconds until stopAlarm() is called
  public startAlarm() {
    if (this.isMuted) return;

    this.stopAlarm(); // clear any previous interval and bursts
    this.isAlarmPlaying = true;

    // Play first burst immediately
    this.playOrderChime();

    // Repeat alarm every 4 seconds until confirmed / stopped
    this.repeatTimer = setInterval(() => {
      if (!this.isAlarmPlaying || this.isMuted) {
        this.stopAlarm();
        return;
      }
      this.playOrderChime();
    }, 4200);
  }

  // Stops the alarm immediately and cancels scheduled burst timers and vibration
  public stopAlarm() {
    if (this.repeatTimer) {
      clearInterval(this.repeatTimer);
      this.repeatTimer = null;
    }

    // Cancel all scheduled burst timeouts in the current sequence
    this.burstTimers.forEach((timer) => clearTimeout(timer));
    this.burstTimers = [];

    this.isAlarmPlaying = false;

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(0); // stop vibration immediately
      } catch {
        // ignore
      }
    }
  }

  // Strong, loud 3-burst restaurant kitchen alarm bell
  public playOrderChime() {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      // Haptic Vibration Sequence (Deep pulses on Android/mobile)
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate([600, 250, 600, 250, 1000, 300, 1200]);
        } catch {
          // ignore if denied by browser
        }
      }

      const bursts = [0, 0.85, 1.7]; // 3 successive loud rings
      const notes = [
        { freq: 880, time: 0, duration: 0.3 },     // A5
        { freq: 1108.73, time: 0.15, duration: 0.35 }, // C#6
        { freq: 1318.51, time: 0.32, duration: 0.65 }, // E6 (High harmonic)
      ];

      bursts.forEach((burstOffset) => {
        const timerId = setTimeout(() => {
          if (!this.ctx || this.isMuted) return;
          const now = this.ctx.currentTime;

          notes.forEach(({ freq, time, duration }) => {
            // Oscillator 1: Fundamental Sine Wave
            const osc1 = this.ctx!.createOscillator();
            const gain1 = this.ctx!.createGain();

            osc1.type = "sine";
            osc1.frequency.setValueAtTime(freq, now + time);

            // High volume gain (0.85) with bright attack and lingering decay
            gain1.gain.setValueAtTime(0.001, now + time);
            gain1.gain.exponentialRampToValueAtTime(0.85, now + time + 0.02);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

            osc1.connect(gain1);
            gain1.connect(this.ctx!.destination);

            osc1.start(now + time);
            osc1.stop(now + time + duration + 0.05);

            // Oscillator 2: Overtone harmonic for strong penetration
            const osc2 = this.ctx!.createOscillator();
            const gain2 = this.ctx!.createGain();

            osc2.type = "triangle";
            osc2.frequency.setValueAtTime(freq * 1.5, now + time);

            gain2.gain.setValueAtTime(0.001, now + time);
            gain2.gain.exponentialRampToValueAtTime(0.45, now + time + 0.02);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + time + duration * 0.7);

            osc2.connect(gain2);
            gain2.connect(this.ctx!.destination);

            osc2.start(now + time);
            osc2.stop(now + time + duration + 0.05);
          });
        }, burstOffset * 1000);

        this.burstTimers.push(timerId);
      });
    } catch (e) {
      console.warn("Kitchen chime playback error:", e);
    }
  }
}

export const orderAlert = new OrderAudioAlert();
