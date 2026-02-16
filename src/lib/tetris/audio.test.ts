import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAudioManager } from './audio';

beforeEach(() => {
  vi.stubGlobal(
    'AudioContext',
    vi.fn(() => ({
      createOscillator: vi.fn(() => ({
        connect: vi.fn(),
        frequency: { value: 0, linearRampToValueAtTime: vi.fn() },
        start: vi.fn(),
        stop: vi.fn(),
      })),
      createGain: vi.fn(() => ({
        connect: vi.fn(),
        gain: { value: 0, exponentialRampToValueAtTime: vi.fn() },
      })),
      destination: {},
      currentTime: 0,
      close: vi.fn(() => Promise.resolve()),
    }))
  );
});

describe('createAudioManager', () => {
  it('returns object with all required methods', () => {
    const manager = createAudioManager();
    expect(manager).toHaveProperty('playMove');
    expect(manager).toHaveProperty('playRotate');
    expect(manager).toHaveProperty('playDrop');
    expect(manager).toHaveProperty('playLineClear');
    expect(manager).toHaveProperty('playGameOver');
    expect(manager).toHaveProperty('dispose');
  });

  it('handles missing AudioContext gracefully', () => {
    vi.stubGlobal('AudioContext', undefined);
    const manager = createAudioManager();
    expect(() => manager.playMove()).not.toThrow();
    expect(() => manager.playRotate()).not.toThrow();
    expect(() => manager.playDrop()).not.toThrow();
    expect(() => manager.playLineClear()).not.toThrow();
    expect(() => manager.playGameOver()).not.toThrow();
  });

  it('dispose closes context and prevents further errors', () => {
    const manager = createAudioManager();
    manager.dispose();
    expect(() => manager.playMove()).not.toThrow();
  });

  it('handles rapid repeated calls without crashing', () => {
    const manager = createAudioManager();
    expect(() => {
      for (let i = 0; i < 50; i++) {
        manager.playMove();
      }
    }).not.toThrow();
  });
});
