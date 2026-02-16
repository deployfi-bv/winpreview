import type { Annotation } from '@/types/annotation';
import type { Tool, ZoomLevel } from '@/types/app';
import type { PageData } from '@/types/page';
import type { RefObject } from 'react';

/**
 * Subset of AppContextValue + refs needed by shortcut action handlers.
 * Avoids coupling handler modules to the full AppContext shape.
 */
export interface ShortcutContext {
  // State
  isDocumentOpen: boolean;
  zoom: ZoomLevel;
  currentPageIndex: number;
  pageCount: number;
  pages: PageData[];
  isSearchBarVisible: boolean;
  selectedAnnotationId: string | null;
  isCropMode: boolean;
  isFullscreen: boolean;
  clipboard: Annotation[] | null;

  // Tool
  setActiveTool: (tool: Tool) => void;

  // View / Zoom
  setZoom: (zoom: ZoomLevel) => void;
  fitWidth: () => void;
  fitPage: () => void;
  toggleFullscreen: () => void;
  toggleViewMode: () => void;

  // Navigation
  setCurrentPageIndex: (index: number) => void;

  // Document
  openDocument: (filename: string, format: string, data: Uint8Array) => Promise<void>;
  closeDocument: () => void;
  newDocument: () => void;

  // Dialogs
  openGoToPageDialog: () => void;
  openExportDialog: () => void;

  // Search
  toggleSearchBar: () => void;
  closeSearchBar: () => void;
  searchNext: () => void;
  searchPrevious: () => void;

  // Annotations
  selectAnnotation: (id: string | null) => void;
  selectAllAnnotations: () => void;
  deleteSelectedAnnotations: () => void;
  copyAnnotation: () => void;
  cutAnnotation: () => void;
  pasteAnnotation: () => void;

  // Page ops
  deleteCurrentPage: () => void;
  rotatePage: (pageIndex: number, direction: 'left' | 'right') => void;
  setCropMode: (active: boolean) => void;
  applyCrop: () => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;

  // Refs (for stable references to save/print)
  saveRef: RefObject<() => void>;
  printRef: RefObject<() => void>;
}

/** A function that handles a shortcut action and returns true if handled. */
export type ActionHandler = (action: string, ctx: ShortcutContext) => boolean;
