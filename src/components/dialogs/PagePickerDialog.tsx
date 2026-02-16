import { useCallback,useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent,   DialogDescription, DialogFooter,
DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useAppState } from '@/hooks/useAppState';

import { cn } from '@/lib/utils';

import { getAllPageDimensions,renderThumbnail } from '@/services/pdfService';

const THUMB_SIZE = 100;

export function PagePickerDialog() {
  const {
    isPagePickerDialogOpen, pagePickerState, closePagePickerDialog,
    insertPagesFromSource, replacePageFromSource,
  } = useAppState();

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [pageDims, setPageDims] = useState<Array<{ width: number; height: number }>>([]);

  const isReplace = pagePickerState?.mode === 'replace';
  const pageCount = pagePickerState?.pageCount ?? 0;

  // Load page dimensions on open
  useEffect(() => {
    if (!pagePickerState || !isPagePickerDialogOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on open
    setSelectedIndices([]);
    if (pagePickerState.sourceFormat === 'pdf') {
      getAllPageDimensions(pagePickerState.sourceId).then(setPageDims).catch(() => setPageDims([]));
    }
  }, [pagePickerState, isPagePickerDialogOpen]);

  const handlePageClick = useCallback((index: number, ctrlKey: boolean, shiftKey: boolean) => {
    if (isReplace) {
      // Single select only
      setSelectedIndices([index]);
      return;
    }
    // Multi-select for insert
    setSelectedIndices((prev) => {
      if (shiftKey && prev.length > 0) {
        const anchor = prev[0];
        const start = Math.min(anchor, index);
        const end = Math.max(anchor, index);
        const range: number[] = [];
        for (let i = start; i <= end; i++) range.push(i);
        return range;
      }
      if (ctrlKey) {
        const set = new Set(prev);
        if (set.has(index)) {
          set.delete(index);
        } else {
          set.add(index);
        }
        return [...set].sort((a, b) => a - b);
      }
      return [index];
    });
  }, [isReplace]);

  const handleConfirm = () => {
    if (!pagePickerState || selectedIndices.length === 0) return;

    if (isReplace) {
      replacePageFromSource(
        pagePickerState.targetIndex,
        pagePickerState.sourceId,
        selectedIndices[0],
        pagePickerState.sourceFormat,
      );
    } else {
      insertPagesFromSource(
        pagePickerState.targetIndex,
        pagePickerState.sourceId,
        selectedIndices,
        pagePickerState.sourceFormat,
      );
    }
    closePagePickerDialog();
  };

  const buttonLabel = isReplace
    ? `Replace with Page ${selectedIndices.length > 0 ? selectedIndices[0] + 1 : '...'}`
    : `Insert ${selectedIndices.length} Page${selectedIndices.length !== 1 ? 's' : ''}`;

  return (
    <Dialog open={isPagePickerDialogOpen} onOpenChange={(open) => { if (!open) closePagePickerDialog(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isReplace ? 'Select Replacement Page' : 'Select Pages to Insert'}</DialogTitle>
          <DialogDescription>
            {isReplace ? 'Click a page to use as replacement.' : 'Click to select pages. Ctrl+click or Shift+click for multiple.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          <div className="grid grid-cols-4 gap-2 p-2">
            {Array.from({ length: pageCount }, (_, i) => (
              <PickerThumb
                key={i}
                pageIndex={i}
                sourceId={pagePickerState?.sourceId ?? ''}
                isSelected={selectedIndices.includes(i)}
                dims={pageDims[i]}
                onClick={(e) => handlePageClick(i, e.ctrlKey || e.metaKey, e.shiftKey)}
              />
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={closePagePickerDialog}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={selectedIndices.length === 0}>
            {buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PickerThumbProps {
  pageIndex: number;
  sourceId: string;
  isSelected: boolean;
  dims?: { width: number; height: number };
  onClick: (e: React.MouseEvent) => void;
}

function PickerThumb({ pageIndex, sourceId, isSelected, dims, onClick }: PickerThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceId) return;
    renderThumbnail(pageIndex + 1, canvas, THUMB_SIZE, `picker-${sourceId}-${pageIndex}`, sourceId);
  }, [pageIndex, sourceId]);

  const ratio = dims ? dims.height / dims.width : 1.414;
  const h = THUMB_SIZE * ratio;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 rounded-md border p-1 transition-colors hover:border-ring',
        isSelected && 'border-blue-500 ring-2 ring-blue-500/50 bg-blue-500/10',
      )}
    >
      <div className="shrink-0 overflow-hidden rounded-sm bg-white shadow-sm" style={{ width: THUMB_SIZE, height: h }}>
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
      <span className="text-xs text-muted-foreground">{pageIndex + 1}</span>
    </button>
  );
}
