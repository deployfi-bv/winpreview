import { useCallback } from 'react';
import {
  ClipboardPaste, Copy, Crop, FlipHorizontal2, FlipVertical2,
  Maximize, MousePointer, Redo2,
  RotateCcw, RotateCw, Undo2, ZoomIn, ZoomOut,
} from 'lucide-react';

import {
  ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut,
} from '@/components/ui/context-menu';

import { useAppState } from '@/hooks/useAppState';

import { ZOOM_DEFAULT, zoomIn, zoomOut } from '@/constants/zoom';

export function CanvasContextMenu() {
  const {
    zoom, setZoom, pasteAnnotation, currentPageIndex,
    rotatePage, flipPage, setCropMode, undo, redo, undoStack, redoStack,
    selectAllAnnotations,
  } = useAppState();

  const handleCopyText = useCallback(() => {
    const selectedText = window.getSelection()?.toString();
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
    }
  }, []);

  return (
    <ContextMenuContent>
      <ContextMenuItem onClick={undo} disabled={undoStack.length === 0}>
        <Undo2 />Undo<ContextMenuShortcut>Ctrl+Z</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={redo} disabled={redoStack.length === 0}>
        <Redo2 />Redo<ContextMenuShortcut>Ctrl+Y</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={pasteAnnotation}>
        <ClipboardPaste />Paste<ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem
        onClick={handleCopyText}
        disabled={!window.getSelection()?.toString()}
      >
        <Copy />Copy Text
      </ContextMenuItem>
      <ContextMenuItem onClick={selectAllAnnotations}>
        <MousePointer />Select All<ContextMenuShortcut>Ctrl+A</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => setZoom(zoomIn(zoom))}>
        <ZoomIn />Zoom In<ContextMenuShortcut>Ctrl+=</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => setZoom(zoomOut(zoom))}>
        <ZoomOut />Zoom Out<ContextMenuShortcut>Ctrl+-</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => setZoom(ZOOM_DEFAULT)}>
        <Maximize />Actual Size<ContextMenuShortcut>Ctrl+0</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => rotatePage(currentPageIndex, 'left')}>
        <RotateCcw />Rotate Left<ContextMenuShortcut>Ctrl+L</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => rotatePage(currentPageIndex, 'right')}>
        <RotateCw />Rotate Right<ContextMenuShortcut>Ctrl+R</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => flipPage(currentPageIndex, 'horizontal')}>
        <FlipHorizontal2 />Flip Horizontal
      </ContextMenuItem>
      <ContextMenuItem onClick={() => flipPage(currentPageIndex, 'vertical')}>
        <FlipVertical2 />Flip Vertical
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => setCropMode(true)}>
        <Crop />Crop<ContextMenuShortcut>Ctrl+K</ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
