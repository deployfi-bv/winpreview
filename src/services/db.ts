/**
 * Shared IndexedDB connection for all stores.
 * v2 adds 'pdf-binaries' store alongside existing 'checkpoints'.
 */

import { openDB } from 'idb';

import type { IDBPDatabase } from 'idb';

const DB_NAME = 'winpreview';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // v1: checkpoints store
        if (oldVersion < 1) {
          const store = db.createObjectStore('checkpoints', { keyPath: 'id' });
          store.createIndex('by-timestamp', 'timestamp');
        }
        // v2: pdf-binaries store
        if (oldVersion < 2) {
          db.createObjectStore('pdf-binaries', { keyPath: 'sessionId' });
        }
        // v3: tetris-high-scores store
        if (oldVersion < 3) {
          db.createObjectStore('tetris-high-scores', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}
