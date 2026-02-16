export interface AudioManager {
  playMove(): void;
  playRotate(): void;
  playDrop(): void;
  playLineClear(): void;
  playGameOver(): void;
  dispose(): void;
}

export function createAudioManager(): AudioManager {
  let ctx: AudioContext | null = null;

  function getContext(): AudioContext {
    if (!ctx) ctx = new AudioContext();
    return ctx;
  }

  function playTone(freq: number, duration: number, volume: number): void {
    try {
      const ac = getContext();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.frequency.value = freq;
      gain.gain.value = volume;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration / 1000);
      osc.stop(ac.currentTime + duration / 1000);
    } catch {
      // Audio not available — game continues silently
    }
  }

  function playSweep(startFreq: number, endFreq: number, duration: number, volume: number): void {
    try {
      const ac = getContext();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.frequency.value = startFreq;
      osc.frequency.linearRampToValueAtTime(endFreq, ac.currentTime + duration / 1000);
      gain.gain.value = volume;
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration / 1000);
      osc.start();
      osc.stop(ac.currentTime + duration / 1000);
    } catch {
      // Audio not available
    }
  }

  return {
    playMove: () => playTone(200, 50, 0.15),
    playRotate: () => playTone(300, 60, 0.15),
    playDrop: () => playTone(150, 80, 0.2),
    playLineClear: () => playSweep(400, 600, 200, 0.25),
    playGameOver: () => playSweep(300, 100, 500, 0.3),
    dispose() {
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
      }
    },
  };
}
