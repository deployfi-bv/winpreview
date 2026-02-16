import { useEffect, useRef } from 'react';

import { useAppState } from '@/hooks/useAppState';
import { useDocumentOps } from '@/hooks/useDocumentOps';

import { SHORTCUTS } from '@/constants/shortcuts';

import {
  handleEditAction,
  handleFileAction,
  handleViewNavigationAction,
} from './shortcutHandlers';

import type { ShortcutContext } from './shortcutHandlers';
import type { ShortcutDefinition } from '@/constants/shortcuts';
import type { Tool } from '@/types/app';

const TOOL_ACTION_MAP: Record<string, Tool> = {
  'tool-selection': 'selection',
  'tool-rectangle': 'rectangle',
  'tool-oval': 'oval',
  'tool-line': 'line',
  'tool-arrow': 'arrow',
  'tool-text': 'text',
  'tool-freehand': 'freehand',
  'tool-signature': 'signature',
  'tool-highlight': 'highlight',
  'tool-underline': 'underline',
  'tool-strikethrough': 'strikethrough',
  'tool-sticky-note': 'sticky-note',
  'tool-mask': 'mask',
};

function isTextInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
}

function matchesShortcut(e: KeyboardEvent, shortcut: ShortcutDefinition): boolean {
  const ctrlRequired = shortcut.ctrl ?? false;
  const shiftRequired = shortcut.shift ?? false;
  const ctrlPressed = e.ctrlKey || e.metaKey;

  if (ctrlPressed !== ctrlRequired) return false;
  if (e.shiftKey !== shiftRequired) return false;

  if (!ctrlRequired && e.altKey) return false;

  return e.key.toLowerCase() === shortcut.key.toLowerCase()
    || e.key === shortcut.key;
}

function executeAction(action: string, ctx: ShortcutContext): void {
  const tool = TOOL_ACTION_MAP[action];
  if (tool) {
    ctx.setActiveTool(tool);
    return;
  }

  if (handleFileAction(action, ctx)) return;
  if (handleEditAction(action, ctx)) return;
  handleViewNavigationAction(action, ctx);
}

export function useKeyboardShortcuts() {
  const {
    isDocumentOpen,
    zoom,
    currentPageIndex,
    pageCount,
    pages,
    isSearchBarVisible,
    selectedAnnotationId,
    isCropMode,
    isFullscreen,
    clipboard,
    setActiveTool,
    setZoom,
    toggleSidebar,
    setCurrentPageIndex,
    openDocument,
    closeDocument,
    newDocument,
    toggleSearchBar,
    closeSearchBar,
    openGoToPageDialog,
    openExportDialog,
    fitWidth,
    fitPage,
    deleteSelectedAnnotations,
    deleteCurrentPage,
    selectAnnotation,
    selectAllAnnotations,
    toggleViewMode,
    rotatePage,
    setCropMode,
    applyCrop,
    undo,
    redo,
    copyAnnotation,
    cutAnnotation,
    pasteAnnotation,
    toggleFullscreen,
    searchNext,
    searchPrevious,
  } = useAppState();
  const { save, print } = useDocumentOps();
  const saveRef = useRef(save);
  const printRef = useRef(print);
  useEffect(() => { saveRef.current = save; }, [save]);
  useEffect(() => { printRef.current = print; }, [print]);

  useEffect(() => {
    const ctx: ShortcutContext = {
      isDocumentOpen, zoom, currentPageIndex, pageCount, pages,
      isSearchBarVisible, selectedAnnotationId, isCropMode, isFullscreen, clipboard,
      setActiveTool, setZoom, fitWidth, fitPage, toggleFullscreen, toggleViewMode,
      setCurrentPageIndex, openDocument, closeDocument, newDocument,
      openGoToPageDialog, openExportDialog,
      toggleSearchBar, closeSearchBar, searchNext, searchPrevious,
      selectAnnotation, selectAllAnnotations, deleteSelectedAnnotations,
      copyAnnotation, cutAnnotation, pasteAnnotation,
      deleteCurrentPage, rotatePage, setCropMode, applyCrop,
      undo, redo, saveRef, printRef,
    };

    function handleKeyDown(e: KeyboardEvent) {
      const inTextInput = isTextInput(e.target);
      if (inTextInput) {
        const isCtrlF = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f';
        if (!isCtrlF) return;
      }

      // Allow native copy/cut when browser text is selected (e.g., from text layer)
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'x')) {
        const selectedText = window.getSelection()?.toString();
        if (selectedText && selectedText.length > 0) return; // Let browser handle natively
      }

      for (const shortcut of SHORTCUTS) {
        if (!matchesShortcut(e, shortcut)) continue;
        if (shortcut.requiresDocument && !isDocumentOpen) continue;

        e.preventDefault();
        executeAction(shortcut.action, ctx);
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    isDocumentOpen, zoom, currentPageIndex, pageCount, pages, isSearchBarVisible, selectedAnnotationId,
    isCropMode, isFullscreen, clipboard,
    setActiveTool, setZoom, toggleSidebar, setCurrentPageIndex, openDocument, closeDocument, newDocument,
    toggleSearchBar, closeSearchBar, openGoToPageDialog, openExportDialog, fitWidth, fitPage,
    deleteSelectedAnnotations, deleteCurrentPage, selectAnnotation, selectAllAnnotations,
    toggleViewMode, rotatePage, setCropMode, applyCrop,
    undo, redo, copyAnnotation, cutAnnotation, pasteAnnotation, toggleFullscreen,
    searchNext, searchPrevious,
  ]);
}
