/**
 * Store/load Tetris high score in IndexedDB.
 * Single record with id=1.
 */

import { getDB } from '@/services/db';

const STORE_NAME = 'tetris-high-scores';

interface TetrisHighScore {
  id: number;
  score: number;
  timestamp: number;
}

export async function getHighScore(): Promise<number> {
  try {
    const db = await getDB();
    const record = await db.get(STORE_NAME, 1) as TetrisHighScore | undefined;
    return record?.score ?? 0;
  } catch {
    return 0;
  }
}

export async function saveHighScore(score: number): Promise<void> {
  try {
    const db = await getDB();
    const record: TetrisHighScore = { id: 1, score, timestamp: Date.now() };
    await db.put(STORE_NAME, record);
  } catch {
    // Best-effort persistence
  }
}
