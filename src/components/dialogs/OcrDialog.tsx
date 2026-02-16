import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { useAppState } from '@/hooks/useAppState';

import type { OcrLanguage } from '@/types/ocr';

export function OcrDialog() {
  const {
    isOcrDialogOpen, closeOcrDialog,
    pages, currentPageIndex, ocrResults, ocrLanguage,
    setOcrLanguage, setOcrResult, setOcrProcessing,
  } = useAppState();

  const currentPage = pages[currentPageIndex];
  const currentPageId = currentPage?.id;
  const currentResult = currentPageId ? ocrResults[currentPageId] : undefined;

  const [localProcessing, setLocalProcessing] = useState(false);
  const [hasNativeText, setHasNativeText] = useState(false);

  useEffect(() => {
    if (!isOcrDialogOpen || !currentPage) {
      setHasNativeText(false);
      return;
    }
    if (currentPage.sourceFormat !== 'pdf') {
      setHasNativeText(false);
      return;
    }
    let cancelled = false;
    import('@/services/pdfTextService').then(({ pageHasNativeText }) =>
      pageHasNativeText(currentPage.originalIndex + 1, currentPage.sourceId).then((has) => {
        if (!cancelled) setHasNativeText(has);
      })
    );
    return () => { cancelled = true; };
  }, [isOcrDialogOpen, currentPage]);

  const handleForceOcr = useCallback(async () => {
    if (!currentPage) return;
    setLocalProcessing(true);
    setOcrProcessing(true);
    try {
      const { recognizePage } = await import('@/services/ocrPipeline');
      const result = await recognizePage(currentPage, ocrLanguage);
      setOcrResult(currentPage.id, result);
      toast.success(`Recognized ${result.wordCount} words`);
    } catch (err) {
      toast.error(`OCR failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLocalProcessing(false);
      setOcrProcessing(false);
    }
  }, [currentPage, ocrLanguage, setOcrResult, setOcrProcessing]);

  const handleCopy = useCallback(() => {
    if (!currentResult?.plainText) return;
    navigator.clipboard.writeText(currentResult.plainText).then(
      () => toast.success('Text copied to clipboard'),
      () => toast.error('Failed to copy text'),
    );
  }, [currentResult]);

  const handleLanguageChange = useCallback((value: string) => {
    setOcrLanguage(value as OcrLanguage);
  }, [setOcrLanguage]);

  return (
    <Dialog open={isOcrDialogOpen} onOpenChange={(open) => !open && closeOcrDialog()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>OCR / Text Recognition</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {/* Language selector */}
          <div className="flex flex-col gap-2">
            <Label>Language</Label>
            <RadioGroup value={ocrLanguage} onValueChange={handleLanguageChange} className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="latin" id="lang-latin" />
                <Label htmlFor="lang-latin" className="text-sm font-normal">Latin (en, fr, es, de, nl)</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="eslav" id="lang-eslav" />
                <Label htmlFor="lang-eslav" className="text-sm font-normal">Cyrillic (ru)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Status + Force OCR */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {currentResult?.status === 'completed'
                ? `${currentResult.wordCount} words recognized`
                : currentResult?.status === 'error'
                  ? `Error: ${currentResult.error}`
                  : hasNativeText
                    ? 'This page already has selectable text'
                    : 'No text recognized yet'}
            </span>
            <Button
              size="sm"
              onClick={handleForceOcr}
              disabled={localProcessing || !currentPage}
            >
              {localProcessing ? 'Recognizing...' : hasNativeText ? 'Force OCR' : 'Recognize Page'}
            </Button>
          </div>

          {/* Progress */}
          {localProcessing && <Progress className="w-full" />}

          {/* Text preview */}
          {currentResult?.status === 'completed' && currentResult.plainText && (
            <div className="max-h-64 overflow-auto rounded border bg-muted/50 p-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed select-text">
                {currentResult.plainText}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeOcrDialog}>Close</Button>
          {currentResult?.plainText && (
            <Button onClick={handleCopy}>Copy Text</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
