/**
 * Hook providing async document operations (save, export, print)
 * with progress toasts, cancellation, and error handling.
 */

import { useCallback } from 'react';
import { toast } from 'sonner';

import { useAppState } from '@/hooks/useAppState';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

import type { AnnotationMode } from '@/types/dialogs';

import { isAbortError } from '@/services/asyncOperation';
import { exportDocument,saveDocument } from '@/services/documentService';

export function useDocumentOps() {
  const {
    filename, pages, annotations, documentSessionId, format, formFields, ocrResults,
    setPrintMode,
  } = useAppState();
  const saveOp = useAsyncOperation();
  const exportOp = useAsyncOperation();

  const save = useCallback(async () => {
    const result = await saveOp.run(async () => {
      return saveDocument();
    });
    if (result?.success) {
      toast.success('Document saved');
    } else if (saveOp.error) {
      toast.error(`Save failed: ${saveOp.error}`);
    }
    return result;
  }, [saveOp]);

  const doExport = useCallback(async (exportFormat: string, annotationMode?: AnnotationMode) => {
    if (!documentSessionId) {
      toast.error('No document session to export');
      return null;
    }

    // Determine if multi-source
    const sourceIds = new Set(pages.map((p) => p.sourceId));
    const isMultiSource = sourceIds.size > 1;
    const flatten = annotationMode === 'flattened' || isMultiSource;

    const result = await exportOp.run(async () => {
      return exportDocument({
        pages,
        annotations,
        documentSessionId,
        filename: filename ?? 'Untitled.pdf',
        format: exportFormat ?? format ?? 'pdf',
        flatten,
        formFields,
        ocrResults,
      });
    });
    if (result?.success) {
      toast.success(`Exported as ${result.filename}`);
    }
    return result;
  }, [filename, pages, annotations, documentSessionId, format, formFields, ocrResults, exportOp]);

  const print = useCallback(async () => {
    try {
      setPrintMode(true);
      // Allow React to render PrintView before calling window.print
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.print();
    } catch (err) {
      if (!isAbortError(err)) {
        toast.error('Print failed');
      }
    } finally {
      setPrintMode(false);
    }
  }, [setPrintMode]);

  return {
    save,
    doExport,
    print,
    saveState: { isRunning: saveOp.isRunning, progress: saveOp.progress, error: saveOp.error },
    exportState: {
      isRunning: exportOp.isRunning,
      progress: exportOp.progress,
      error: exportOp.error,
      cancel: exportOp.cancel,
      clearError: exportOp.clearError,
    },
  };
}
