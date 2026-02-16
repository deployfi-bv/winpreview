/**
 * Store/load/clear raw PDF binary data in IndexedDB.
 * Keyed by sessionId so each document session has one binary.
 */

import { getDB } from '@/services/db';

const STORE_NAME = 'pdf-binaries';

interface PdfBinaryRecord {
  sessionId: string;
  data: Uint8Array;
  filename: string;
  timestamp: number;
}

export async function storePdfBinary(
  sessionId: string,
  data: Uint8Array,
  filename: string,
): Promise<void> {
  const db = await getDB();
  const record: PdfBinaryRecord = {
    sessionId,
    data,
    filename,
    timestamp: Date.now(),
  };
  await db.put(STORE_NAME, record);
}

export async function loadPdfBinary(sessionId: string): Promise<Uint8Array | null> {
  try {
    const db = await getDB();
    const record = await db.get(STORE_NAME, sessionId) as PdfBinaryRecord | undefined;
    return record?.data ?? null;
  } catch {
    return null;
  }
}

export async function clearPdfBinary(sessionId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, sessionId);
  } catch {
    // Best effort
  }
}

export async function clearAllPdfBinaries(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
  } catch {
    // Best effort
  }
}
