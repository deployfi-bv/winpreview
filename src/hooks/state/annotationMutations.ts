import type { SetState } from '@/hooks/state/types';
import type { Annotation } from '@/types/annotation';
import type { AppState, UndoEntry } from '@/types/app';

export function createAnnotationMutations(
  state: AppState,
  setState: SetState,
  pushUndo: (entry: UndoEntry) => void,
) {
  const addAnnotation = (annotation: Annotation) => {
    setState((prev) => {
      const pageId = annotation.pageId;
      const existing = prev.annotations[pageId] ?? [];
      return {
        ...prev,
        annotations: { ...prev.annotations, [pageId]: [...existing, annotation] },
        selectedAnnotationId: annotation.id,
      };
    });
    pushUndo({
      description: 'Add annotation',
      undo: () => {
        setState((prev) => {
          const newAnnotations = { ...prev.annotations };
          for (const [pageId, list] of Object.entries(newAnnotations)) {
            const filtered = list.filter((a) => a.id !== annotation.id);
            if (filtered.length !== list.length) {
              newAnnotations[pageId] = filtered;
              break;
            }
          }
          return { ...prev, annotations: newAnnotations, selectedAnnotationId: null };
        });
      },
      redo: () => {
        setState((prev) => {
          const pageId = annotation.pageId;
          const existing = prev.annotations[pageId] ?? [];
          return {
            ...prev,
            annotations: { ...prev.annotations, [pageId]: [...existing, annotation] },
            selectedAnnotationId: annotation.id,
          };
        });
      },
    });
  };

  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    setState((prev) => {
      const newAnnotations = { ...prev.annotations };
      for (const [pageId, list] of Object.entries(newAnnotations)) {
        const index = list.findIndex((a) => a.id === id);
        if (index !== -1) {
          const updated = [...list];
          updated[index] = { ...updated[index], ...updates } as Annotation;
          newAnnotations[pageId] = updated;
          break;
        }
      }
      return { ...prev, annotations: newAnnotations };
    });
  };

  const deleteAnnotation = (id: string) => {
    let captured: Annotation | null = null;
    for (const list of Object.values(state.annotations)) {
      const found = list.find((a) => a.id === id);
      if (found) { captured = { ...found } as Annotation; break; }
    }

    setState((prev) => {
      const newAnnotations = { ...prev.annotations };
      for (const [pageId, list] of Object.entries(newAnnotations)) {
        const filtered = list.filter((a) => a.id !== id);
        if (filtered.length !== list.length) {
          newAnnotations[pageId] = filtered;
          break;
        }
      }
      return {
        ...prev, annotations: newAnnotations,
        selectedAnnotationId: prev.selectedAnnotationId === id ? null : prev.selectedAnnotationId,
      };
    });

    if (captured) {
      const ann = captured;
      pushUndo({
        description: 'Delete annotation',
        undo: () => {
          setState((prev) => {
            const existing = prev.annotations[ann.pageId] ?? [];
            return {
              ...prev,
              annotations: { ...prev.annotations, [ann.pageId]: [...existing, ann] },
              selectedAnnotationId: ann.id,
            };
          });
        },
        redo: () => {
          setState((prev) => {
            const newAnnotations = { ...prev.annotations };
            for (const [pageId, list] of Object.entries(newAnnotations)) {
              newAnnotations[pageId] = list.filter((a) => a.id !== ann.id);
            }
            return { ...prev, annotations: newAnnotations, selectedAnnotationId: null };
          });
        },
      });
    }
  };

  return { addAnnotation, updateAnnotation, deleteAnnotation };
}
