import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { createAnnotationMutations } from '@/hooks/state/annotationMutations';
import { createAnnotationSelection } from '@/hooks/state/annotationSelection';
import { createCompressionActions } from '@/hooks/state/compressionActions';
import { createDialogActions } from '@/hooks/state/dialogActions';
import { createDocumentActions } from '@/hooks/state/documentActions';
import { createOcrActions } from '@/hooks/state/ocrActions';
import { createPageOperations } from '@/hooks/state/pageOperations';
import { createPageSelection } from '@/hooks/state/pageSelection';
import { createPageSourceActions } from '@/hooks/state/pageSourceActions';
import { createSearchActions } from '@/hooks/state/searchActions';
import { createClipboardActions, useUndoRedo } from '@/hooks/state/undoClipboard';
import { createViewActions } from '@/hooks/state/viewActions';
import { usePersistence } from '@/hooks/usePersistence';

import { INITIAL_APP_STATE } from '@/types/appDefaults';

import type { AppContextValue, PagePickerState } from '@/hooks/state/types';
import type { AppState } from '@/types/app';
import type { ReactNode } from 'react';

export type { PagePickerState } from '@/hooks/state/types';

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_APP_STATE);
  const handleRestore = useCallback((restored: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...restored }));
  }, []);
  usePersistence({ state, onRestore: handleRestore });

  const pageCount = state.pages.length;
  const currentPage = state.currentPageIndex + 1;
  const currentPageId = state.pages[state.currentPageIndex]?.id ?? null;

  const [pagePickerState, setPagePickerState] = useState<PagePickerState | null>(null);
  const openPagePickerDialog = (ps: PagePickerState) => {
    setPagePickerState(ps);
    setState((prev) => ({ ...prev, isPagePickerDialogOpen: true }));
  };
  const closePagePickerDialog = () => {
    setPagePickerState(null);
    setState((prev) => ({ ...prev, isPagePickerDialogOpen: false }));
  };

  const { pushUndo, undo, redo } = useUndoRedo(setState);
  const dialogs = createDialogActions(setState);
  const doc = createDocumentActions(setState);
  const annMut = createAnnotationMutations(state, setState, pushUndo);
  const annSel = createAnnotationSelection(state, setState, pushUndo);
  const pageOps = createPageOperations(state, setState);
  const pageSel = createPageSelection(setState);
  const pageSrc = createPageSourceActions(setState, openPagePickerDialog);
  const clipboard = createClipboardActions(state, setState, annSel.getSelectedAnnotation);
  const view = createViewActions(state, setState);
  const ocr = createOcrActions(setState);
  const search = createSearchActions(setState);
  const compression = createCompressionActions(setState, pushUndo);

  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__openDocument = doc.openDocument;
      (window as unknown as Record<string, unknown>).__closeDocument = doc.closeDocument;
      (window as unknown as Record<string, unknown>).__setCurrentPageIndex = view.setCurrentPageIndex;
    }
  });

  return (
    <AppContext.Provider
      value={{
        ...state, pageCount, currentPage, currentPageId,
        ...dialogs, ...doc, ...annMut, ...annSel,
        ...pageOps, ...pageSel, ...pageSrc, ...clipboard, ...view, ...ocr, ...search,
        ...compression,
        pagePickerState, openPagePickerDialog, closePagePickerDialog,
        undo, redo, pushUndo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
}
