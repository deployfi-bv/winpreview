import { useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { CanvasContextMenu } from '@/components/menus/CanvasContextMenu';
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';

import { useAppState } from '@/hooks/useAppState';

import { ContactSheetView } from './ContactSheetView';
import { DocumentView } from './DocumentView';
import { SearchBar } from './SearchBar';
import { ZeroState } from './ZeroState';

const SUPPORTED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp'];

export function CanvasArea() {
  const {
    isDocumentOpen, isDocumentLoading, isSearchBarVisible,
    pages, currentPageIndex, zoom, viewMode, openDocument,
  } = useAppState();

  const currentPage = pages[currentPageIndex];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      toast.error(`Unsupported format: .${ext}`);
      return;
    }

    try {
      const format = ext === 'pdf' ? 'pdf' : 'image';
      const buffer = await file.arrayBuffer();
      await openDocument(file.name, format, new Uint8Array(buffer));
      toast(`Opened: ${file.name}`);
    } catch (err) {
      toast.error(`Failed to open: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [openDocument]);

  // Loading state overlay
  if (isDocumentLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Opening document…</p>
        </div>
      </div>
    );
  }

  if (!isDocumentOpen) {
    return <ZeroState />;
  }

  return (
    <div
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isSearchBarVisible && <SearchBar />}
      <ContextMenu>
        <ContextMenuTrigger className="flex h-full w-full">
          {viewMode === 'contact-sheet' ? (
            <ContactSheetView />
          ) : currentPage ? (
            <DocumentView page={currentPage} zoom={zoom} />
          ) : null}
        </ContextMenuTrigger>
        <CanvasContextMenu />
      </ContextMenu>
    </div>
  );
}
