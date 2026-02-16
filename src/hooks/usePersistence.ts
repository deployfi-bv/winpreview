/**
 * Hook to persist app state to IndexedDB and restore on mount.
 *
 * - Debounced save (300ms) after every state change when document is open.
 * - Clears checkpoints on beforeunload (clean exit = fresh start next time).
 * - Restores latest checkpoint on mount; falls back to previous on corruption.
 * - On restore, reloads PDF binary from IndexedDB.
 */

import { useCallback, useEffect, useRef } from 'react';

import { restoreFromCheckpoint } from '@/hooks/restoreFromCheckpoint';

import type { AppState } from '@/types/app';

import { clearAllPdfBinaries } from '@/services/pdfBinaryStore';
import { clearAllCheckpoints, saveCheckpoint } from '@/services/persistence';

const DEBOUNCE_MS = 300;

/** Extract the serializable subset of AppState for checkpointing. */
function toCheckpointData(state: AppState) {
  return {
    documentSessionId: state.documentSessionId ?? '',
    filename: state.filename ?? '',
    format: state.format ?? '',
    pages: state.pages,
    currentPageIndex: state.currentPageIndex,
    annotations: state.annotations,
    colorAdjustment: state.colorAdjustment,
    formFields: state.formFields,
    isFormMode: state.isFormMode,
    zoom: state.zoom,
    ocrResults: state.ocrResults,
    ocrLanguage: state.ocrLanguage,
  };
}

interface UsePersistenceOptions {
  state: AppState;
  onRestore: (restored: Partial<AppState>) => void;
}

export function usePersistence({ state, onRestore }: UsePersistenceOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestStateRef = useRef(state);
  const isRestoringRef = useRef(false);
  const hasMountedRef = useRef(false);

  // Keep ref in sync
  latestStateRef.current = state;

  // Flush: save immediately (used by beforeunload and debounce)
  const flush = useCallback(async () => {
    const s = latestStateRef.current;
    if (!s.isDocumentOpen || s.pages.length === 0) return;
    try {
      await saveCheckpoint(toCheckpointData(s));
    } catch {
      // Best effort — don't block UI
    }
  }, []);

  // Schedule a debounced save
  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      flush();
    }, DEBOUNCE_MS);
  }, [flush]);

  // On mount: attempt to restore
  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    (async () => {
      isRestoringRef.current = true;
      try {
        await restoreFromCheckpoint(onRestore);
      } catch {
        // IndexedDB unavailable — continue without persistence
      } finally {
        isRestoringRef.current = false;
      }
    })();
  }, [onRestore]);

  // On state change: schedule debounced save (skip during restore)
  useEffect(() => {
    if (isRestoringRef.current) return;
    if (!state.isDocumentOpen) return;
    scheduleSave();
  }, [
    state.isDocumentOpen,
    state.pages,
    state.annotations,
    state.currentPageIndex,
    state.colorAdjustment,
    state.formFields,
    state.isFormMode,
    state.zoom,
    state.ocrResults,
    state.ocrLanguage,
    scheduleSave,
  ]);

  // On document close: clear checkpoints and binaries
  useEffect(() => {
    if (!state.isDocumentOpen && hasMountedRef.current && !isRestoringRef.current) {
      clearAllCheckpoints();
      clearAllPdfBinaries();
    }
  }, [state.isDocumentOpen]);

  // On beforeunload: clear checkpoints (clean exit = fresh start next time)
  useEffect(() => {
    const handleUnload = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const s = latestStateRef.current;
      if (s.isDocumentOpen && s.pages.length > 0) {
        clearAllCheckpoints();
        clearAllPdfBinaries();
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  return { flush, clearAllCheckpoints };
}
