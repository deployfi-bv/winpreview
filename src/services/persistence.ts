/**
 * IndexedDB-backed checkpoint persistence service.
 *
 * Stores the last 2 checkpoints (current + previous fallback).
 * All operations are async via the `idb` library.
 */

import { CHECKPOINT_VERSION } from '@/types/checkpoint';

import type { DocumentCheckpoint } from '@/types/checkpoint';

import { getDB } from '@/services/db';

const STORE_NAME = 'checkpoints';
const MAX_CHECKPOINTS = 2;

/** Save a checkpoint. Keeps only the last MAX_CHECKPOINTS entries. */
export async function saveCheckpoint(data: Omit<DocumentCheckpoint, 'id' | 'version' | 'timestamp'>): Promise<void> {
  const db = await getDB();
  const checkpoint: DocumentCheckpoint = {
    ...data,
    id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    version: CHECKPOINT_VERSION,
    timestamp: Date.now(),
  };

  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(tx.objectStoreNames[0]);
  await store.put(checkpoint);

  // Prune old checkpoints: keep only the most recent MAX_CHECKPOINTS
  const index = store.index('by-timestamp');
  const allKeys = await index.getAllKeys();
  if (allKeys.length > MAX_CHECKPOINTS) {
    const toDelete = allKeys.slice(0, allKeys.length - MAX_CHECKPOINTS);
    for (const key of toDelete) {
      await store.delete(key);
    }
  }

  await tx.done;
}

/** Load the most recent checkpoint, or null if none exists. */
export async function loadLatestCheckpoint(): Promise<DocumentCheckpoint | null> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.store.index('by-timestamp');
    const cursor = await index.openCursor(null, 'prev');
    if (!cursor) return null;

    const checkpoint = cursor.value as DocumentCheckpoint;
    if (checkpoint.version !== CHECKPOINT_VERSION) {
      // Schema mismatch — treat as corruption
      return null;
    }
    return checkpoint;
  } catch {
    return null;
  }
}

/** Load the second-most-recent checkpoint (fallback on corruption). */
export async function loadPreviousCheckpoint(): Promise<DocumentCheckpoint | null> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.store.index('by-timestamp');
    const cursor = await index.openCursor(null, 'prev');
    if (!cursor) return null;

    // Advance past the latest
    const next = await cursor.continue();
    if (!next) return null;

    const checkpoint = next.value as DocumentCheckpoint;
    if (checkpoint.version !== CHECKPOINT_VERSION) return null;
    return checkpoint;
  } catch {
    return null;
  }
}

/** Clear all checkpoints (e.g. on document close). */
export async function clearAllCheckpoints(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
  } catch {
    // Swallow — best effort
  }
}

/** Validate that a checkpoint has required fields and reasonable shape. */
export function isValidCheckpoint(cp: unknown): cp is DocumentCheckpoint {
  if (!cp || typeof cp !== 'object') return false;
  const obj = cp as Record<string, unknown>;
  return (
    typeof obj.filename === 'string' &&
    typeof obj.format === 'string' &&
    Array.isArray(obj.pages) &&
    obj.pages.length > 0 &&
    typeof obj.currentPageIndex === 'number' &&
    typeof obj.annotations === 'object' &&
    obj.annotations !== null &&
    typeof obj.version === 'number'
  );
}
