import type { SetState } from '@/hooks/state/types';
import type { CompressionPresetName } from '@/services/compressionService';
import type { AppState, UndoEntry } from '@/types/app';

import { compressPage, PRESETS } from '@/services/compressionService';
import { setImageUrl } from '@/services/imageService';
import { storePdfBinary } from '@/services/pdfBinaryStore';

export function createCompressionActions(setState: SetState, pushUndo: (entry: UndoEntry) => void) {
  const compressPages = async (
    preset: CompressionPresetName,
    runOcr: boolean,
    onProgress: (current: number, total: number, phase: string) => void,
    signal: AbortSignal,
  ): Promise<void> => {
    // Read current state
    let currentState: AppState;
    setState((s) => {
      currentState = s;
      return s;
    });

    // Get pages to compress (all pages)
    const pagesToCompress = currentState!.pages;
    const total = pagesToCompress.length;

    // Validate
    if (total === 0) return;

    // Get preset config
    const presetConfig = PRESETS[preset];

    // Compression results
    const compressionResults: Array<{
      pageIndex: number;
      newSourceId: string;
      fileSizeKb: number;
    }> = [];

    // Compression loop
    for (let i = 0; i < pagesToCompress.length; i++) {
      // Check abort
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const page = pagesToCompress[i];
      onProgress(i + 1, total, 'Compressing');

      // Compress page
      const result = await compressPage(page, presetConfig, signal);

      // Generate new source ID
      const newSourceId = `compressed-${page.id}-${Date.now()}`;

      // Store in IndexedDB
      await storePdfBinary(newSourceId, result.binary, 'compressed.jpg');

      // Register with image service
      setImageUrl(newSourceId, result.objectUrl);

      // Store result
      compressionResults.push({
        pageIndex: i,
        newSourceId,
        fileSizeKb: result.fileSizeKb,
      });
    }

    // Check abort after loop
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    // Apply state change with undo
    setState((prev) => {
      const oldPages = prev.pages;
      const newPages = prev.pages.map((p, i) => {
        const result = compressionResults.find((r) => r.pageIndex === i);
        if (!result) return p;
        return {
          ...p,
          sourceId: result.newSourceId,
          sourceFormat: 'image' as const,
          originalIndex: 0,
        };
      });

      pushUndo({
        description: 'Compress PDF',
        undo: () => setState((s) => ({ ...s, pages: oldPages })),
        redo: () => setState((s) => ({ ...s, pages: newPages })),
      });

      return { ...prev, pages: newPages };
    });

    // OCR phase (if runOcr)
    if (runOcr) {
      const { recognizePage } = await import('@/services/ocrPipeline');

      // Refresh state
      setState((s) => {
        currentState = s;
        return s;
      });

      for (let i = 0; i < currentState!.pages.length; i++) {
        if (signal.aborted) break;

        const pageId = currentState!.pages[i].id;

        // Skip already-recognized pages
        if (currentState!.ocrResults[pageId]?.status === 'completed') continue;

        onProgress(i + 1, total, 'Recognizing');

        try {
          const ocrResult = await recognizePage(currentState!.pages[i], currentState!.ocrLanguage);
          setState((s) => ({
            ...s,
            ocrResults: { ...s.ocrResults, [pageId]: ocrResult },
          }));
        } catch {
          // OCR failure for one page shouldn't abort the whole operation
        }
      }
    }
  };

  return { compressPages };
}
