import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { useAppState } from '@/hooks/useAppState';

import type { CompressionPresetName } from '@/services/compressionService';

export function CompressPdfDialog() {
  const {
    isCompressPdfDialogOpen,
    closeCompressPdfDialog,
    pages,
    compressPages,
  } = useAppState();

  const [preset, setPreset] = useState<CompressionPresetName>('email');
  const [runOcr, setRunOcr] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; phase: string } | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const handleCompress = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;

    setIsProcessing(true);
    setProgress(null);

    try {
      await compressPages(preset, runOcr, (current, total, phase) => {
        setProgress({ current, total, phase });
      }, controller.signal);

      toast.success(`Compressed ${pages.length} pages`);
      closeCompressPdfDialog();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        toast('Compression cancelled');
      } else {
        toast.error(`Compression failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } finally {
      setIsProcessing(false);
      setProgress(null);
      abortRef.current = null;
    }
  }, [preset, runOcr, compressPages, pages.length, closeCompressPdfDialog]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return (
    <Dialog open={isCompressPdfDialogOpen} onOpenChange={(open) => !open && closeCompressPdfDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compress PDF</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {/* Preset selector */}
          <div className="flex flex-col gap-2">
            <Label>Size Preset</Label>
            <RadioGroup value={preset} onValueChange={(v) => setPreset(v as CompressionPresetName)}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="email" id="preset-email" />
                <Label htmlFor="preset-email" className="text-sm font-normal">
                  Email — ~200 KB/page — for email attachments
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="compact" id="preset-compact" />
                <Label htmlFor="preset-compact" className="text-sm font-normal">
                  Compact — ~100 KB/page — for cloud storage
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="light" id="preset-light" />
                <Label htmlFor="preset-light" className="text-sm font-normal">
                  Light — ~150 KB/page — light compression
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* OCR checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="compress-ocr"
              checked={runOcr}
              onCheckedChange={(checked) => setRunOcr(checked === true)}
            />
            <Label htmlFor="compress-ocr" className="text-sm font-normal">
              Also run OCR on unrecognized pages
            </Label>
          </div>

          {/* Progress */}
          {isProcessing && progress && (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                {progress.phase} page {progress.current} of {progress.total}...
              </p>
              <Progress value={(progress.current / progress.total) * 100} />
            </div>
          )}
        </div>
        <DialogFooter>
          {isProcessing ? (
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={closeCompressPdfDialog}>
                Close
              </Button>
              <Button onClick={handleCompress} disabled={pages.length === 0}>
                Compress
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
