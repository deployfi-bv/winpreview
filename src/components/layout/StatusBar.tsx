import { Progress } from '@/components/ui/progress';

import { useAppState } from '@/hooks/useAppState';

export function StatusBar() {
  const { isDocumentOpen, filename, currentPageIndex, pageCount, zoom, undoStack, batchProgress } = useAppState();

  if (!isDocumentOpen) {
    return (
      <div className="flex h-8 items-center border-t px-3 text-xs text-muted-foreground">
        <span>No document open</span>
      </div>
    );
  }

  const displayPage = currentPageIndex + 1;

  return (
    <div className="flex h-8 items-center justify-between border-t px-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <span>{filename}</span>
        <span>·</span>
        <span>Page {displayPage} of {pageCount}</span>
        {undoStack.length > 0 && (
          <>
            <span>·</span>
            <span>{undoStack.length} undo</span>
          </>
        )}
        {batchProgress !== null && (
          <>
            <span>·</span>
            <div className="flex items-center gap-2">
              <Progress value={batchProgress} className="h-1.5 w-20" />
              <span>{batchProgress}%</span>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span>{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
