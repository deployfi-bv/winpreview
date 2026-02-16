import { useCallback, useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useAppState } from '@/hooks/useAppState';

import { ThumbnailItem } from './ThumbnailItem';

export function ThumbnailPanel() {
  const {
    isDocumentOpen, pages, currentPageIndex, selectedPageIndices,
    handlePageClick, reorderPages, insertPagesFromFile, openDocument,
    setCurrentPageIndex,
  } = useAppState();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isFileDrag, setIsFileDrag] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: pages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140,
    overscan: 5,
  });

  // Scroll to active page when it changes
  useEffect(() => {
    if (isDocumentOpen && pages.length > 0) {
      virtualizer.scrollToIndex(currentPageIndex, { align: 'auto' });
    }
  }, [currentPageIndex, isDocumentOpen, pages.length, virtualizer]);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    const hasFiles = e.dataTransfer.types.includes('Files');
    setIsFileDrag(hasFiles);
    e.dataTransfer.dropEffect = hasFiles ? 'copy' : 'move';
    setDragOverIndex(index);
  }, []);
  const handleDragLeave = useCallback(() => { setDragOverIndex(null); setIsFileDrag(false); }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    setIsFileDrag(false);

    // File drop from OS
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) {
        insertPagesFromFile(toIndex, file);
      }
      return;
    }

    // Internal reorder
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(fromIndex) && fromIndex !== toIndex) {
      reorderPages(fromIndex, toIndex);
    }
  }, [reorderPages, insertPagesFromFile]);

  const handleEmptyDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const buffer = await file.arrayBuffer();
    await openDocument(file.name, ext === 'pdf' ? 'pdf' : 'image', new Uint8Array(buffer));
  }, [openDocument]);
  const handleEmptyDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCurrentPageIndex(Math.min(currentPageIndex + 1, pages.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCurrentPageIndex(Math.max(currentPageIndex - 1, 0)); }
  }, [currentPageIndex, pages.length, setCurrentPageIndex]);

  const selectedSet = new Set(selectedPageIndices);

  if (!isDocumentOpen) {
    return (
      <div
        className="flex h-full items-center justify-center bg-background px-4"
        onDrop={handleEmptyDrop}
        onDragOver={handleEmptyDragOver}
      >
        <p className="text-center text-sm text-muted-foreground">No pages</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      role="listbox"
      aria-multiselectable="true"
      aria-label="Document pages"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="h-full overflow-y-auto bg-background focus-visible:outline-none"
    >
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
        <div className="absolute left-0 top-0 w-full p-2">
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const page = pages[virtualItem.index];
            const i = virtualItem.index;
            return (
              <div key={page.id} data-index={i} ref={virtualizer.measureElement}
                className="absolute left-0 top-0 w-full pb-1.5"
                style={{ transform: `translateY(${virtualItem.start}px)` }}>
                <ThumbnailItem
                  page={page}
                  pageIndex={i}
                  pageCount={pages.length}
                  isActive={currentPageIndex === i}
                  isSelected={selectedSet.has(i)}
                  isDragOver={dragOverIndex === i}
                  isFileDropIndicator={isFileDrag}
                  onSelect={(e) => handlePageClick(i, e.ctrlKey || e.metaKey, e.shiftKey)}
                  onDragStart={(e) => handleDragStart(e, i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, i)}
                  selectedCount={selectedPageIndices.length}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
