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

  // Eye-catching rising chime for price alerts
  async playPriceAlert() {
    if (!this.soundEnabled) return;

    const context = this.getContext();
    const now = context.currentTime;
    
    // Create three notes rising in pitch (like a notification chime)
    const notes = [
      { freq: 523.25, start: 0, duration: 0.15 },      // C5
      { freq: 659.25, start: 0.12, duration: 0.15 },   // E5
      { freq: 783.99, start: 0.24, duration: 0.25 },   // G5
    ];

    notes.forEach(note => {
      // Primary oscillator
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      osc.connect(gain);
      gain.connect(context.destination);
      
      osc.frequency.value = note.freq;
      osc.type = 'sine';
      
      // Envelope
      gain.gain.setValueAtTime(0, now + note.start);
      gain.gain.linearRampToValueAtTime(this.volume * 0.7, now + note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.duration);
      
      osc.start(now + note.start);
      osc.stop(now + note.start + note.duration);

      // Add harmonic for richness
      const harmonic = context.createOscillator();
      const harmonicGain = context.createGain();
      
      harmonic.connect(harmonicGain);
      harmonicGain.connect(context.destination);
      
      harmonic.frequency.value = note.freq * 2; // One octave higher
      harmonic.type = 'sine';
      
      harmonicGain.gain.setValueAtTime(0, now + note.start);
      harmonicGain.gain.linearRampToValueAtTime(this.volume * 0.3, now + note.start + 0.02);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.duration);
      
      harmonic.start(now + note.start);
      harmonic.stop(now + note.start + note.duration);
    });
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
