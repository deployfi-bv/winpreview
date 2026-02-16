/**
 * Restore app state from an IndexedDB checkpoint.
 * Handles PDF and image binary reloading, page migration, and fallback logic.
 */

import { toast } from 'sonner';

import type { AppState } from '@/types/app';
import type { OcrLanguage, OcrPageResult } from '@/types/ocr';
import type { PageData, SourceFormat } from '@/types/page';

import { getMimeType, loadImage, setImageUrl } from '@/services/imageService';
import { clearAllPdfBinaries, loadPdfBinary } from '@/services/pdfBinaryStore';
import { loadPdf } from '@/services/pdfService';
import {
  clearAllCheckpoints,
  isValidCheckpoint,
  loadLatestCheckpoint,
  loadPreviousCheckpoint,
} from '@/services/persistence';

/** Backfill sourceId/sourceFormat for pages from older checkpoints. */
function migratePages(pages: PageData[], sessionId: string, format: string): PageData[] {
  const sf: SourceFormat = format === 'pdf' ? 'pdf' : 'image';
  return pages.map((p) => ({
    ...p,
    sourceId: p.sourceId ?? sessionId,
    sourceFormat: p.sourceFormat ?? sf,
  }));
}

interface CheckpointData {
  documentSessionId: string;
  filename: string;
  format: string;
  pages: PageData[];
  currentPageIndex: number;
  annotations: AppState['annotations'];
  colorAdjustment: AppState['colorAdjustment'];
  formFields: AppState['formFields'];
  isFormMode: boolean;
  zoom: number;
  ocrResults?: Record<string, OcrPageResult>;
  ocrLanguage?: OcrLanguage;
}

/** Reload document binary (PDF or image) for a checkpoint. Returns true on success. */
async function reloadBinary(checkpoint: CheckpointData): Promise<boolean> {
  const { documentSessionId: sessionId, format, filename } = checkpoint;
  if (!sessionId) return false;

  const binary = await loadPdfBinary(sessionId);
  if (!binary) return false;

  try {
    if (format === 'pdf') {
      await loadPdf(binary, sessionId);
    } else {
      const ext = filename.split('.').pop()?.toLowerCase() ?? 'png';
      const imgInfo = await loadImage(binary, getMimeType(ext));
      setImageUrl(sessionId, imgInfo.objectUrl);
    }
    return true;
  } catch {
    return false;
  }
}

/** Build the partial AppState from a valid checkpoint. */
function buildRestoredState(checkpoint: CheckpointData): Partial<AppState> {
  return {
    isDocumentOpen: true,
    documentSessionId: checkpoint.documentSessionId,
    filename: checkpoint.filename,
    format: checkpoint.format,
    pages: migratePages(checkpoint.pages, checkpoint.documentSessionId, checkpoint.format),
    currentPageIndex: checkpoint.currentPageIndex,
    annotations: checkpoint.annotations,
    colorAdjustment: checkpoint.colorAdjustment,
    formFields: checkpoint.formFields,
    isFormMode: checkpoint.isFormMode,
    zoom: checkpoint.zoom,
    ocrResults: checkpoint.ocrResults ?? {},
    ocrLanguage: checkpoint.ocrLanguage ?? 'latin',
  };
}

/**
 * Attempt to restore app state from IndexedDB checkpoints.
 * Tries latest first, falls back to previous if corrupted.
 */
export async function restoreFromCheckpoint(
  onRestore: (restored: Partial<AppState>) => void,
): Promise<void> {
  const latest = await loadLatestCheckpoint();

  if (latest && isValidCheckpoint(latest)) {
    const restored = await reloadBinary(latest);
    if (restored) {
      onRestore(buildRestoredState(latest));
      toast.success('Session restored from last checkpoint');
    } else {
      await clearAllCheckpoints();
      await clearAllPdfBinaries();
    }
    return;
  }

  // Latest invalid — try fallback
  if (latest && !isValidCheckpoint(latest)) {
    const previous = await loadPreviousCheckpoint();
    if (previous && isValidCheckpoint(previous)) {
      const restored = await reloadBinary(previous);
      if (restored) {
        onRestore(buildRestoredState(previous));
        toast.warning('Latest checkpoint was corrupted. Restored from previous checkpoint.');
        return;
      }
    }
    // Both corrupted — clear and start fresh
    toast.error('All checkpoints corrupted. Starting fresh.');
    await clearAllCheckpoints();
    await clearAllPdfBinaries();
  }
}
