import type { SetState } from '@/hooks/state/types';
import type { Annotation } from '@/types/annotation';
import type { AppState, UndoEntry } from '@/types/app';

export function createAnnotationSelection(
  state: AppState,
  setState: SetState,
  pushUndo: (entry: UndoEntry) => void,
) {
  const selectAnnotation = (id: string | null) => {
    setState((prev) => ({
      ...prev, selectedAnnotationId: id,
      selectedAnnotationIds: id ? [id] : [],
    }));
  };

  const selectAllAnnotations = () => {
    setState((prev) => {
      const pageId = prev.pages[prev.currentPageIndex]?.id;
      if (!pageId) return prev;
      const pageAnnotations = prev.annotations[pageId] ?? [];
      if (pageAnnotations.length === 0) return prev;
      const ids = pageAnnotations.map((a) => a.id);
      return { ...prev, selectedAnnotationIds: ids, selectedAnnotationId: ids[0] };
    });
  };

  const deleteSelectedAnnotations = () => {
    const idsToDelete = new Set(
      state.selectedAnnotationIds.length > 0
        ? state.selectedAnnotationIds
        : state.selectedAnnotationId ? [state.selectedAnnotationId] : []
    );
    if (idsToDelete.size === 0) return;

    const capturedAnnotations: Annotation[] = [];
    for (const list of Object.values(state.annotations)) {
      for (const ann of list) {
        if (idsToDelete.has(ann.id)) capturedAnnotations.push({ ...ann } as Annotation);
      }
    }

    setState((prev) => {
      const newAnnotations = { ...prev.annotations };
      for (const [pageId, list] of Object.entries(newAnnotations)) {
        const filtered = list.filter((a) => !idsToDelete.has(a.id));
        if (filtered.length !== list.length) newAnnotations[pageId] = filtered;
      }
      return { ...prev, annotations: newAnnotations, selectedAnnotationId: null, selectedAnnotationIds: [] };
    });

    pushUndo({
      description: 'Delete annotations',
      undo: () => {
        setState((prev) => {
          const newAnnotations = { ...prev.annotations };
          for (const ann of capturedAnnotations) {
            const existing = newAnnotations[ann.pageId] ?? [];
            newAnnotations[ann.pageId] = [...existing, ann];
          }
          return { ...prev, annotations: newAnnotations };
        });
      },
      redo: () => {
        setState((prev) => {
          const newAnnotations = { ...prev.annotations };
          for (const [pageId, list] of Object.entries(newAnnotations)) {
            newAnnotations[pageId] = list.filter((a) => !idsToDelete.has(a.id));
          }
          return { ...prev, annotations: newAnnotations, selectedAnnotationId: null, selectedAnnotationIds: [] };
        });
      },
    });
  };

  const bringToFront = (id: string) => {
    setState((prev) => {
      const newAnnotations = { ...prev.annotations };
      for (const [pageId, list] of Object.entries(newAnnotations)) {
        const index = list.findIndex((a) => a.id === id);
        if (index !== -1) {
          const maxZ = Math.max(...list.map((a) => a.zIndex));
          const updated = [...list];
          updated[index] = { ...updated[index], zIndex: maxZ + 1 };
          newAnnotations[pageId] = updated;
          break;
        }
      }
      return { ...prev, annotations: newAnnotations };
    });
  };

  const sendToBack = (id: string) => {
    setState((prev) => {
      const newAnnotations = { ...prev.annotations };
      for (const [pageId, list] of Object.entries(newAnnotations)) {
        const index = list.findIndex((a) => a.id === id);
        if (index !== -1) {
          const minZ = Math.min(...list.map((a) => a.zIndex));
          const updated = [...list];
          updated[index] = { ...updated[index], zIndex: minZ - 1 };
          newAnnotations[pageId] = updated;
          break;
        }
      }
      return { ...prev, annotations: newAnnotations };
    });
  };

  const getSelectedAnnotation = (): Annotation | null => {
    if (!state.selectedAnnotationId) return null;
    for (const list of Object.values(state.annotations)) {
      const found = list.find((a) => a.id === state.selectedAnnotationId);
      if (found) return found;
    }
    return null;
  };

  return {
    selectAnnotation, selectAllAnnotations, deleteSelectedAnnotations,
    bringToFront, sendToBack, getSelectedAnnotation,
  };
}
