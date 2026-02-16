import { useCallback, useEffect, useState } from 'react';

import { useAppState } from '@/hooks/useAppState';

import type { OcrPageResult } from '@/types/ocr';
import type { PageData } from '@/types/page';

import { recognizePage } from '@/services/ocrPipeline';
import { pageHasNativeText } from '@/services/pdfTextService';

/**
 * Count how many pages in a document need OCR.
 * A page needs OCR if it doesn't have a completed OCR result and no native text.
 */
async function countPagesNeedingOcr(
  pages: PageData[],
  ocrResults: Record<string, OcrPageResult>,
): Promise<number> {
  let count = 0;
  for (const page of pages) {
    if (ocrResults[page.id]?.status === 'completed') continue;
    if (page.sourceFormat === 'pdf') {
      const hasText = await pageHasNativeText(page.originalIndex + 1, page.sourceId);
      if (hasText) continue;
    }
    count++;
  }
  return count;
}

export function useOcrSearch() {
  const {
    pages,
    ocrResults,
    ocrLanguage,
    isSearchBarVisible,
    setOcrResult,
    setOcrProgress,
    setOcrProcessing,
  } = useAppState();

  const [pagesNeedingOcr, setPagesNeedingOcr] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  // When search bar opens, count pages needing OCR
  /* eslint-disable react-hooks/set-state-in-effect -- reset + async count on open/close */
  useEffect(() => {
    if (!isSearchBarVisible || pages.length === 0) {
      setPagesNeedingOcr(0);
      return;
    }
    countPagesNeedingOcr(pages, ocrResults).then(setPagesNeedingOcr);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isSearchBarVisible, pages, ocrResults]);

  // Scan all pages that need OCR
  const scanPages = useCallback(async () => {
    setIsScanning(true);
    setOcrProcessing(true);

    const pagesToScan = [];
    for (const page of pages) {
      const hasResult = ocrResults[page.id]?.status === 'completed';
      if (hasResult) continue;
      if (page.sourceFormat === 'pdf') {
        const hasText = await pageHasNativeText(page.originalIndex + 1, page.sourceId);
        if (hasText) continue;
      }
      pagesToScan.push(page);
    }

    setOcrProgress({ current: 0, total: pagesToScan.length });

    for (let i = 0; i < pagesToScan.length; i++) {
      const page = pagesToScan[i];
      const result = await recognizePage(page, ocrLanguage);
      setOcrResult(page.id, result);
      setOcrProgress({ current: i + 1, total: pagesToScan.length });
    }

    setOcrProgress(null);
    setOcrProcessing(false);
    setIsScanning(false);
    setPagesNeedingOcr(0);
  }, [pages, ocrResults, ocrLanguage, setOcrResult, setOcrProgress, setOcrProcessing]);

  return { pagesNeedingOcr, isScanning, scanPages };
}
