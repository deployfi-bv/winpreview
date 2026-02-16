import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getHighScore, saveHighScore } from './tetrisHighScoreStore';

// Mock the db module
vi.mock('@/services/db', () => ({
  getDB: vi.fn(),
}));

import { getDB } from '@/services/db';

const mockGet = vi.fn();
const mockPut = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (getDB as ReturnType<typeof vi.fn>).mockResolvedValue({
    get: mockGet,
    put: mockPut,
  });
});

describe('getHighScore', () => {
  it('returns 0 when no record exists', async () => {
    mockGet.mockResolvedValue(undefined);
    const score = await getHighScore();
    expect(score).toBe(0);
    expect(mockGet).toHaveBeenCalledWith('tetris-high-scores', 1);
  });

  it('returns stored score when record exists', async () => {
    mockGet.mockResolvedValue({ id: 1, score: 500, timestamp: 1234567890 });
    const score = await getHighScore();
    expect(score).toBe(500);
    expect(mockGet).toHaveBeenCalledWith('tetris-high-scores', 1);
  });

  it('returns 0 on DB error', async () => {
    (getDB as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'));
    const score = await getHighScore();
    expect(score).toBe(0);
  });
});

describe('saveHighScore', () => {
  it('calls db.put with correct store name and record shape', async () => {
    const mockNow = 1234567890;
    vi.spyOn(Date, 'now').mockReturnValue(mockNow);

    await saveHighScore(500);

    expect(mockPut).toHaveBeenCalledWith('tetris-high-scores', {
      id: 1,
      score: 500,
      timestamp: mockNow,
    });

    vi.restoreAllMocks();
  });

  it('does not throw on DB error', async () => {
    (getDB as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'));
    await expect(saveHighScore(500)).resolves.toBeUndefined();
  });

  it('stores correct timestamp', async () => {
    const mockNow = 9876543210;
    vi.spyOn(Date, 'now').mockReturnValue(mockNow);

    await saveHighScore(300);

    expect(mockPut).toHaveBeenCalledWith('tetris-high-scores', {
      id: 1,
      score: 300,
      timestamp: mockNow,
    });

    vi.restoreAllMocks();
  });
});
