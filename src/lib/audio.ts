// Web Audio API synthesized restaurant order alert chime
// Zero external network dependencies, works in all modern browsers

class OrderAudioAlert {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const storedMute = localStorage.getItem("pj_admin_sound_muted");
      this.isMuted = storedMute === "true";
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  // Plays a rich, pleasant 3-tone chime (F#5 -> A#5 -> C#6) mimicking a restaurant kitchen bell
  public playOrderChime() {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [
        { freq: 740, time: 0, duration: 0.25 },     // F#5
        { freq: 932.33, time: 0.15, duration: 0.3 }, // A#5
        { freq: 1108.73, time: 0.32, duration: 0.6 } // C#6
      ];

      notes.forEach(({ freq, time, duration }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + time);

        // Exponential decay for clean metallic chime acoustic
        gain.gain.setValueAtTime(0.001, now + time);
        gain.gain.exponentialRampToValueAtTime(0.35, now + time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + time);
        osc.stop(now + time + duration + 0.05);
      });

      // Repeat second chime pulse after 0.75s for clear kitchen attention
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const now2 = this.ctx.currentTime;
        notes.forEach(({ freq, time, duration }) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq * 1.05, now2 + time);

          gain.gain.setValueAtTime(0.001, now2 + time);
          gain.gain.exponentialRampToValueAtTime(0.4, now2 + time + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now2 + time + duration);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(now2 + time);
          osc.stop(now2 + time + duration + 0.05);
        });
      }, 700);

      // Mobile device vibration if supported
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([200, 100, 300]);
      }
    } catch (e) {
      console.warn("Audio chime autoplay blocked or not supported:", e);
    }
  }
}

export const orderAlert = new OrderAudioAlert();
