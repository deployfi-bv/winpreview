import type { SetState } from '@/hooks/state/types';
import type { OcrLanguage, OcrPageResult } from '@/types/ocr';

export function createOcrActions(setState: SetState) {
  const setOcrLanguage = (language: OcrLanguage) => {
    setState((prev) => ({ ...prev, ocrLanguage: language }));
  };

  const setOcrResult = (pageId: string, result: OcrPageResult) => {
    setState((prev) => ({
      ...prev,
      ocrResults: { ...prev.ocrResults, [pageId]: result },
    }));
  };

  const clearOcrResult = (pageId: string) => {
    setState((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [pageId]: _, ...rest } = prev.ocrResults;
      return { ...prev, ocrResults: rest };
    });
  };

  const clearAllOcrResults = () => {
    setState((prev) => ({ ...prev, ocrResults: {} }));
  };

  const setOcrProcessing = (isProcessing: boolean) => {
    setState((prev) => ({ ...prev, isOcrProcessing: isProcessing }));
  };

  const setOcrProgress = (progress: { current: number; total: number } | null) => {
    setState((prev) => ({ ...prev, ocrProgress: progress }));
  };

  return {
    setOcrLanguage,
    setOcrResult,
    clearOcrResult,
    clearAllOcrResults,
    setOcrProcessing,
    setOcrProgress,
  };
}
