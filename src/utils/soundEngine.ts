import { DockSettings, DockTheme, SoundPackType } from '../types/dock';

export type SoundEvent = 'expand' | 'collapse' | 'hover' | 'launch' | 'click' | 'update';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5; // 0.0 to 1.0
  private soundPack: SoundPackType = 'theme';
  private lastHoverTime: number = 0;
  private hoverThrottleMs: number = 65; // Prevent machine-gun hover audio

  constructor() {
    // AudioContext will be lazily initialized on first user gesture
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public initSound(settings?: Partial<DockSettings>): void {
    if (!settings) return;
    if (settings.soundEnabled !== undefined) {
      this.enabled = settings.soundEnabled;
    }
    if (settings.soundVolume !== undefined) {
      this.volume = Math.max(0, Math.min(100, settings.soundVolume)) / 100;
    }
    if (settings.soundPack !== undefined) {
      this.soundPack = settings.soundPack;
    }
  }

  public setSoundEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.enabled;
  }

  public setSoundVolume(volumePercent: number): void {
    this.volume = Math.max(0, Math.min(100, volumePercent)) / 100;
  }

  public getSoundVolume(): number {
    return Math.round(this.volume * 100);
  }

  public setSoundPack(pack: SoundPackType): void {
    this.soundPack = pack;
  }

  public getSoundPack(): SoundPackType {
    return this.soundPack;
  }

  private resolvePack(theme?: DockTheme): Exclude<SoundPackType, 'theme'> {
    if (this.soundPack !== 'theme') {
      return this.soundPack as Exclude<SoundPackType, 'theme'>;
    }
    switch (theme) {
      case 'eldenring':
        return 'eldenring';
      case 'deathnote':
        return 'deathnote';
      case 'kawaii':
      case 'candy':
        return 'kawaii';
      case 'aether':
        return 'aether';
      case 'onepiece':
        return 'mechanical';
      case 'dark':
      case 'light':
      case 'glassy':
      case 'translucent':
      case 'custom':
      default:
        return 'clean';
    }
  }


  public previewPackSample(pack: SoundPackType, currentTheme?: DockTheme): void {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const targetPack = pack === 'theme' ? this.resolvePack(currentTheme) : pack;
    try {
      switch (targetPack) {
        case 'eldenring':
          this.playEldenRing(ctx, masterGain, 'launch');
          break;
        case 'deathnote':
          this.playDeathNote(ctx, masterGain, 'launch');
          break;
        case 'kawaii':
          this.playKawaii(ctx, masterGain, 'launch');
          break;
        case 'aether':
          this.playAether(ctx, masterGain, 'launch');
          break;
        case 'mechanical':
          this.playMechanical(ctx, masterGain, 'launch');
          break;
        case 'clean':
        default:
          this.playClean(ctx, masterGain, 'launch');
          break;
      }
    } catch {}
  }

  public play(event: SoundEvent, currentTheme?: DockTheme): void {
    if (!this.enabled || this.volume <= 0) return;

    // Hover throttle to avoid rapid stutter
    if (event === 'hover') {
      const now = Date.now();
      if (now - this.lastHoverTime < this.hoverThrottleMs) {
        return;
      }
      this.lastHoverTime = now;
    }

    const ctx = this.getContext();
    if (!ctx) return;

    const pack = this.resolvePack(currentTheme);
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
    masterGain.connect(ctx.destination);

    try {
      switch (pack) {
        case 'eldenring':
          this.playEldenRing(ctx, masterGain, event);
          break;
        case 'deathnote':
          this.playDeathNote(ctx, masterGain, event);
          break;
        case 'kawaii':
          this.playKawaii(ctx, masterGain, event);
          break;
        case 'aether':
          this.playAether(ctx, masterGain, event);
          break;
        case 'mechanical':
          this.playMechanical(ctx, masterGain, event);
          break;
        case 'clean':
        default:
          this.playClean(ctx, masterGain, event);
          break;
      }
    } catch {
      // Audio synthesis safety catch - fail silently without throwing in UI
    }
  }

  // --- Clean Sound Pack (Modern, Subtle, Soft) ---
  private playClean(ctx: AudioContext, out: GainNode, event: SoundEvent) {
    const t = ctx.currentTime;
    if (event === 'expand') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.07);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.08);
    } else if (event === 'collapse') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.06);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.06);
    } else if (event === 'hover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.015);
    } else if (event === 'launch' || event === 'click' || event === 'update') {
      // Crisp click with low body
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.09);
    }
  }

  // --- Mechanical Switch Sound Pack ---
  private playMechanical(ctx: AudioContext, out: GainNode, event: SoundEvent) {
    const t = ctx.currentTime;
    if (event === 'hover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1600, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.012);
    } else {
      // Tactile dual-tone mechanical click (switch stem + leaf)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'square';

      const baseFreq = event === 'expand' ? 950 : event === 'collapse' ? 450 : 800;
      osc1.frequency.setValueAtTime(baseFreq, t);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, t + 0.035);

      osc2.frequency.setValueAtTime(baseFreq * 1.8, t);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, t + 0.02);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(out);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.045);
      osc2.stop(t + 0.045);
    }
  }

  // --- Elden Ring Fantasy Sound Pack (Golden Grace & Runes) ---
  private playEldenRing(ctx: AudioContext, out: GainNode, event: SoundEvent) {
    const t = ctx.currentTime;
    if (event === 'hover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.025);
    } else if (event === 'expand' || event === 'launch' || event === 'update') {
      // Grace chime chord (D major triad harmony: D4, F#4, A4)
      const freqs = event === 'launch' ? [293.66, 369.99, 440.0, 587.33] : [220.0, 330.0, 440.0];
      const duration = event === 'launch' ? 0.45 : 0.35;

      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);

        const initialVol = 0.16 / (idx + 1);
        gain.gain.setValueAtTime(initialVol, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

        osc.connect(gain);
        gain.connect(out);
        osc.start(t);
        osc.stop(t + duration);
      });
    } else {
      // Stone slide / collapse (resonant low hush)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.15);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.16);
    }
  }

  // --- Death Note Gothic Sound Pack (Dark Chimes & Ink) ---
  private playDeathNote(ctx: AudioContext, out: GainNode, event: SoundEvent) {
    const t = ctx.currentTime;
    if (event === 'hover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.02);
    } else if (event === 'expand' || event === 'launch' || event === 'update') {
      // Dark gothic bell with slightly detuned harmonics
      const freqs = [110, 220, 330, 440];
      const dur = event === 'launch' ? 0.5 : 0.35;
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f * (1 + (idx * 0.01)), t); // Slight gothic bell dissonance

        gain.gain.setValueAtTime(0.18 / (idx + 1), t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(gain);
        gain.connect(out);
        osc.start(t);
        osc.stop(t + dur);
      });
    } else {
      // Low ink stroke
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.08);
    }
  }

  // --- Kawaii / Candy Sound Pack (Sparkle Bubbles & Pops) ---
  private playKawaii(ctx: AudioContext, out: GainNode, event: SoundEvent) {
    const t = ctx.currentTime;
    if (event === 'hover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1100, t + 0.02);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.02);
    } else if (event === 'expand' || event === 'launch' || event === 'update') {
      // Cute upward arpeggio bubble pop (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const step = 0.045;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * step);

        gain.gain.setValueAtTime(0, t);
        gain.gain.setValueAtTime(0.18, t + idx * step);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * step + 0.1);

        osc.connect(gain);
        gain.connect(out);
        osc.start(t + idx * step);
        osc.stop(t + idx * step + 0.1);
      });
    } else {
      // Gentle downward bubble pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.07);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.07);
    }
  }

  // --- Aether Celestial Sound Pack (Crystal Chimes & Resonant Ping) ---
  private playAether(ctx: AudioContext, out: GainNode, event: SoundEvent) {
    const t = ctx.currentTime;
    if (event === 'hover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1760, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.02);
    } else if (event === 'expand' || event === 'launch' || event === 'update') {
      // Celestial crystal chime (high shimmering harmonics)
      const freqs = [880, 1320, 1760, 2640];
      const dur = event === 'launch' ? 0.38 : 0.28;
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0.14 / (idx + 1), t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(gain);
        gain.connect(out);
        osc.start(t);
        osc.stop(t + dur);
      });
    } else {
      // Soft crystal descent
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(990, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.08);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.08);
    }
  }
}

export const soundEngine = new SoundEngine();
export const playSound = (event: SoundEvent, currentTheme?: DockTheme) => soundEngine.play(event, currentTheme);
export const previewPackSample = (pack: SoundPackType, currentTheme?: DockTheme) => soundEngine.previewPackSample(pack, currentTheme);
