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

  async playPriceAlert() {
    // High-pitched single beep
    await this.playTone(800, 0.3, 'single');
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
