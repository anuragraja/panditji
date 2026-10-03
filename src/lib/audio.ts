// High-impact Web Audio API synthesized restaurant kitchen alarm bell
// Strong piercing chime & deep haptic vibration for immediate admin attention

class OrderAudioAlert {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isAlarmPlaying: boolean = false;
  private repeatTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const storedMute = localStorage.getItem("pj_admin_sound_muted");
      this.isMuted = storedMute === "true";
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
      this.ctx.resume();
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
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    if (!this.isMuted) {
      this.playOrderChime();
    }
    return this.isMuted;
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
        setTimeout(() => {
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
      });
    } catch (e) {
      console.warn("Kitchen chime playback error:", e);
    }
  }

  public stopAlarm() {
    if (this.repeatTimer) {
      clearInterval(this.repeatTimer);
      this.repeatTimer = null;
    }
    this.isAlarmPlaying = false;
  }
}

export const orderAlert = new OrderAudioAlert();
