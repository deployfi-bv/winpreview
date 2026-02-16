import { useCallback } from 'react';
import { toast } from 'sonner';

import { MAX_UNDO } from '@/hooks/state/types';

import type { SetState } from '@/hooks/state/types';
import type { Annotation } from '@/types/annotation';
import type { AppState, UndoEntry } from '@/types/app';

export function useUndoRedo(setState: SetState) {
  const pushUndo = useCallback((entry: UndoEntry) => {
    setState((prev) => ({
      ...prev,
      undoStack: [...prev.undoStack.slice(-MAX_UNDO + 1), entry],
      redoStack: [],
    }));
  }, [setState]);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.undoStack.length === 0) return prev;
      const entry = prev.undoStack[prev.undoStack.length - 1];
      entry.undo();
      return {
        ...prev,
        undoStack: prev.undoStack.slice(0, -1),
        redoStack: [...prev.redoStack, entry],
      };
    });
  }, [setState]);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.redoStack.length === 0) return prev;
      const entry = prev.redoStack[prev.redoStack.length - 1];
      entry.redo();
      return {
        ...prev,
        redoStack: prev.redoStack.slice(0, -1),
        undoStack: [...prev.undoStack, entry],
      };
    });
  }, [setState]);

  return { pushUndo, undo, redo };
}

export function createClipboardActions(
  state: AppState,
  setState: SetState,
  getSelectedAnnotation: () => Annotation | null,
) {
  const copyAnnotation = () => {
    if (!state.selectedAnnotationId) return;
    const ann = getSelectedAnnotation();
    if (ann) {
      setState((prev) => ({ ...prev, clipboard: [ann] }));
      toast('Copied annotation');
    }
  };

  const cutAnnotation = () => {
    if (!state.selectedAnnotationId) return;
    const ann = getSelectedAnnotation();
    if (ann) {
      setState((prev) => {
        const newAnnotations = { ...prev.annotations };
        for (const [pageId, list] of Object.entries(newAnnotations)) {
          const filtered = list.filter((a) => a.id !== ann.id);
          if (filtered.length !== list.length) {
            newAnnotations[pageId] = filtered;
            break;
          }
        }
        return { ...prev, annotations: newAnnotations, clipboard: [ann], selectedAnnotationId: null };
      });
      toast('Cut annotation');
    }
  };

  const pasteAnnotation = () => {
    setState((prev) => {
      if (!prev.clipboard || prev.clipboard.length === 0) return prev;
      const currentPg = prev.pages[prev.currentPageIndex];
      if (!currentPg) return prev;
      const pageId = currentPg.id;
      const existing = prev.annotations[pageId] ?? [];
      const maxZ = existing.length > 0 ? Math.max(...existing.map((a) => a.zIndex)) : 0;
      const pasted = prev.clipboard.map((a, i) => ({
        ...a,
        id: `paste-${Date.now()}-${i}`,
        pageId, x: a.x + 20, y: a.y + 20,
        zIndex: maxZ + 1 + i,
      } as Annotation));
      return {
        ...prev,
        annotations: { ...prev.annotations, [pageId]: [...existing, ...pasted] },
        selectedAnnotationId: pasted[0]?.id ?? null,
      };
    });
  };

  return { copyAnnotation, cutAnnotation, pasteAnnotation };
}
