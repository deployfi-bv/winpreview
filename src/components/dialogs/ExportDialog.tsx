import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useAppState } from '@/hooks/useAppState';
import { useDocumentOps } from '@/hooks/useDocumentOps';

import { JpegOptions, PngOptions } from './ImageExportOptions';
import { PdfOptions } from './PdfOptions';

import type { AnnotationMode, ExportFormat } from '@/types/dialogs';

export function ExportDialog() {
  const { isExportDialogOpen, closeExportDialog, pages } = useAppState();
  const { doExport, exportState } = useDocumentOps();

  // Default to PNG if all pages are from image sources, otherwise PDF
  const [activeTab, setActiveTab] = useState<ExportFormat>('pdf');
  const [annotationMode, setAnnotationMode] = useState<AnnotationMode>('editable');

  // Reset default tab when dialog opens based on current document type
  useEffect(() => {
    if (isExportDialogOpen) {
      const imageOnly = pages.length > 0 && pages.every(p => p.sourceFormat === 'image');
      // Use queueMicrotask to defer setState and avoid synchronous update in effect
      queueMicrotask(() => {
        setActiveTab(imageOnly ? 'png' : 'pdf');
      });
    }
  }, [isExportDialogOpen, pages]);

  // Detect multi-source
  const sourceIds = new Set(pages.map((p) => p.sourceId));
  const isMultiSource = sourceIds.size > 1;

  const handleExport = async () => {
    const result = await doExport(activeTab, annotationMode);
    if (result?.success) {
      closeExportDialog();
    }
  };

  const handleCancel = () => {
    if (exportState.isRunning) {
      exportState.cancel();
    } else {
      closeExportDialog();
    }
  };

  const handleRetry = () => {
    exportState.clearError();
    handleExport();
  };

  return (
    <Dialog open={isExportDialogOpen} onOpenChange={(open) => { if (!open && !exportState.isRunning) closeExportDialog(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export</DialogTitle>
          <DialogDescription>Choose format and export options.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ExportFormat)}>
          <TabsList className="w-full">
            <TabsTrigger value="pdf" className="flex-1" disabled={exportState.isRunning}>PDF</TabsTrigger>
            <TabsTrigger value="jpeg" className="flex-1" disabled={exportState.isRunning}>JPEG</TabsTrigger>
            <TabsTrigger value="png" className="flex-1" disabled={exportState.isRunning}>PNG</TabsTrigger>
          </TabsList>

          <TabsContent value="pdf">
            <PdfOptions
              annotationMode={annotationMode}
              onAnnotationModeChange={setAnnotationMode}
              isMultiSource={isMultiSource}
            />
          </TabsContent>
          <TabsContent value="jpeg">
            <JpegOptions />
          </TabsContent>
          <TabsContent value="png">
            <PngOptions />
          </TabsContent>
        </Tabs>

        {/* Progress bar during export */}
        {exportState.isRunning && (
          <div className="space-y-2">
            <Progress value={exportState.progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              Exporting… {exportState.progress}%
            </p>
          </div>
        )}

        {/* Error state */}
        {exportState.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            Export failed: {exportState.error}
          </div>
        )}

        <DialogFooter>
          {exportState.error ? (
            <>
              <Button variant="outline" onClick={closeExportDialog}>Close</Button>
              <Button onClick={handleRetry}>Retry</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={exportState.isRunning}>
                {exportState.isRunning ? 'Exporting…' : 'Export'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
