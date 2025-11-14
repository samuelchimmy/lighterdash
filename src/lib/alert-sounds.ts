// Alert sound management with Web Audio API
class AlertSoundManager {
  private audioContext: AudioContext | null = null;
  private soundEnabled = true;
  private volume = 0.5;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadSettings();
    }
  }

  private loadSettings() {
    const settings = localStorage.getItem('lighter-alert-sound-settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        this.soundEnabled = parsed.enabled ?? true;
        this.volume = parsed.volume ?? 0.5;
      } catch (error) {
        console.error('Failed to parse sound settings:', error);
      }
    }
  }

  private saveSettings() {
    localStorage.setItem(
      'lighter-alert-sound-settings',
      JSON.stringify({
        enabled: this.soundEnabled,
        volume: this.volume,
      })
    );
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    this.saveSettings();
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  getSettings() {
    return {
      enabled: this.soundEnabled,
      volume: this.volume,
    };
  }

  private getContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  // Generate different tones for different alert types
  private async playTone(frequency: number, duration: number, pattern: 'single' | 'double' | 'triple') {
    if (!this.soundEnabled) return;

    const context = this.getContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, context.currentTime);
    
    const beeps = pattern === 'single' ? 1 : pattern === 'double' ? 2 : 3;
    const beepDuration = duration / beeps;
    const gapDuration = beepDuration * 0.3;

    for (let i = 0; i < beeps; i++) {
      const startTime = context.currentTime + i * beepDuration;
      gainNode.gain.linearRampToValueAtTime(this.volume, startTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, startTime + beepDuration - gapDuration);
    }

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
  }

  // Dramatic, attention-grabbing alert for price changes
  async playPriceAlert() {
    if (!this.soundEnabled) return;

    const context = this.getContext();
    const now = context.currentTime;
    
    // Create a dramatic rising sweep with multiple layers
    const duration = 1.2;
    
    // Layer 1: Rising frequency sweep (siren-like)
    const sweep = context.createOscillator();
    const sweepGain = context.createGain();
    sweep.connect(sweepGain);
    sweepGain.connect(context.destination);
    
    sweep.type = 'sine';
    sweep.frequency.setValueAtTime(400, now);
    sweep.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
    sweep.frequency.exponentialRampToValueAtTime(800, now + 0.8);
    sweep.frequency.exponentialRampToValueAtTime(1400, now + duration);
    
    sweepGain.gain.setValueAtTime(0, now);
    sweepGain.gain.linearRampToValueAtTime(this.volume * 0.8, now + 0.05);
    sweepGain.gain.setValueAtTime(this.volume * 0.8, now + duration - 0.2);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    sweep.start(now);
    sweep.stop(now + duration);

    // Layer 2: Pulsing bass tone for power
    const bass = context.createOscillator();
    const bassGain = context.createGain();
    const bassTremolo = context.createGain();
    const tremoloOsc = context.createOscillator();
    
    bass.connect(bassGain);
    bassGain.connect(bassTremolo);
    bassTremolo.connect(context.destination);
    
    // Tremolo effect (pulsing)
    tremoloOsc.connect(bassTremolo.gain);
    tremoloOsc.frequency.value = 8; // 8Hz pulse
    tremoloOsc.start(now);
    tremoloOsc.stop(now + duration);
    
    bass.type = 'triangle';
    bass.frequency.value = 200;
    
    bassGain.gain.setValueAtTime(0, now);
    bassGain.gain.linearRampToValueAtTime(this.volume * 0.6, now + 0.1);
    bassGain.gain.setValueAtTime(this.volume * 0.6, now + duration - 0.2);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    bassTremolo.gain.setValueAtTime(0.5, now);
    
    bass.start(now);
    bass.stop(now + duration);

    // Layer 3: High-pitched accent notes for sparkle
    const accents = [
      { time: 0.3, freq: 1568, duration: 0.15 },
      { time: 0.5, freq: 1760, duration: 0.15 },
      { time: 0.7, freq: 1976, duration: 0.2 },
    ];

    accents.forEach(accent => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      osc.connect(gain);
      gain.connect(context.destination);
      
      osc.type = 'square';
      osc.frequency.value = accent.freq;
      
      gain.gain.setValueAtTime(0, now + accent.time);
      gain.gain.linearRampToValueAtTime(this.volume * 0.5, now + accent.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + accent.time + accent.duration);
      
      osc.start(now + accent.time);
      osc.stop(now + accent.time + accent.duration);
    });

    // Layer 4: White noise burst for impact at the start
    const noiseBuffer = context.createBuffer(1, context.sampleRate * 0.1, context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    
    const noise = context.createBufferSource();
    const noiseGain = context.createGain();
    const noiseFilter = context.createBiquadFilter();
    
    noise.buffer = noiseBuffer;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(context.destination);
    
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    
    noiseGain.gain.setValueAtTime(this.volume * 0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    noise.start(now);
    noise.stop(now + 0.1);
  }

  async playMarginAlert() {
    if (!this.soundEnabled) return;

    const context = this.getContext();
    const now = context.currentTime;
    const duration = 0.8;

    // Rising urgent tone
    const osc = context.createOscillator();
    const gain = context.createGain();
    
    osc.connect(gain);
    gain.connect(context.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + duration);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.7, now + 0.05);
    gain.gain.setValueAtTime(this.volume * 0.7, now + duration - 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
  }

  async playLiquidationAlert() {
    if (!this.soundEnabled) return;

    const context = this.getContext();
    const now = context.currentTime;
    const duration = 1.5;

    // Dramatic alarm with multiple layers
    // Layer 1: Siren-like sweep
    const siren = context.createOscillator();
    const sirenGain = context.createGain();
    
    siren.connect(sirenGain);
    sirenGain.connect(context.destination);
    
    siren.type = 'sine';
    siren.frequency.setValueAtTime(600, now);
    siren.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
    siren.frequency.exponentialRampToValueAtTime(600, now + 0.6);
    siren.frequency.exponentialRampToValueAtTime(1200, now + 0.9);
    siren.frequency.exponentialRampToValueAtTime(800, now + duration);
    
    sirenGain.gain.setValueAtTime(0, now);
    sirenGain.gain.linearRampToValueAtTime(this.volume * 0.8, now + 0.05);
    sirenGain.gain.setValueAtTime(this.volume * 0.8, now + duration - 0.2);
    sirenGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    siren.start(now);
    siren.stop(now + duration);

    // Layer 2: Urgent pulsing bass
    const bass = context.createOscillator();
    const bassGain = context.createGain();
    const pulse = context.createOscillator();
    
    bass.connect(bassGain);
    bassGain.connect(context.destination);
    pulse.connect(bassGain.gain);
    
    bass.type = 'triangle';
    bass.frequency.value = 200;
    pulse.type = 'square';
    pulse.frequency.value = 6; // 6 Hz pulse
    
    bassGain.gain.setValueAtTime(this.volume * 0.3, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    bass.start(now);
    bass.stop(now + duration);
    pulse.start(now);
    pulse.stop(now + duration);
  }

  async playVolumeAlert() {
    // Medium-pitched double beep
    await this.playTone(600, 0.5, 'double');
  }

  async playFundingAlert() {
    // Low-pitched triple beep
    await this.playTone(400, 0.7, 'triple');
  }
}

export const alertSoundManager = new AlertSoundManager();
