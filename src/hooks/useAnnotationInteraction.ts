// Mouse event handling hook for annotation drawing, selection, move, and resize

import { useCallback, useEffect, useRef, useState } from 'react';

import { updateDrawingAnnotation } from '@/hooks/useAnnotationDrawing';
import { computeMoveUpdate, computeResizeUpdate } from '@/hooks/useAnnotationMoveResize';
import { useAppState } from '@/hooks/useAppState';
import { finalizeDrawing } from '@/hooks/useDrawingFinalization';
import { attachMoveHandlers, attachResizeHandlers } from '@/hooks/useWindowDragHandlers';

import { createAnnotation } from '@/lib/annotationFactory';
import { isPointInAnnotation } from '@/lib/annotationHelpers';
import { screenToPage } from '@/lib/coordinates';

import type { Handle } from '@/lib/annotationHelpers';
import type { Annotation, AnnotationType } from '@/types/annotation';
import type { Tool } from '@/types/app';

type InteractionMode = 'idle' | 'drawing' | 'moving' | 'resizing';

/** Tools that don't produce annotations via drag */
const NON_DRAWING_TOOLS: Tool[] = ['selection', 'mask', 'loupe'];

function toolToAnnotationType(tool: Tool): AnnotationType | null {
  if (NON_DRAWING_TOOLS.includes(tool)) return null;
  return tool as AnnotationType;
}

export function useAnnotationInteraction(svgRef: React.RefObject<SVGSVGElement | null>, pageId: string) {
  const {
    activeTool, annotations, selectedAnnotationId,
    addAnnotation, updateAnnotation, selectAnnotation,
  } = useAppState();

  const [drawingAnnotation, setDrawingAnnotation] = useState<Annotation | null>(null);
  const modeRef = useRef<InteractionMode>('idle');
  const startRef = useRef({ x: 0, y: 0 });
  const annotationStartRef = useRef<Annotation | null>(null);
  const activeHandleRef = useRef<Handle | null>(null);

  const getPageCoords = useCallback((e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    return screenToPage(e.clientX, e.clientY, svgRef.current);
  }, [svgRef]);

  const getNextZIndex = useCallback(() => {
    const pageAnns = annotations[pageId] ?? [];
    return pageAnns.length === 0 ? 1 : Math.max(...pageAnns.map((a) => a.zIndex)) + 1;
  }, [annotations, pageId]);

  const handleAnnotationMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    if (activeTool !== 'selection') return;
    e.preventDefault();
    selectAnnotation(id);
    const coords = getPageCoords(e);
    startRef.current = coords;
    const pageAnns = annotations[pageId] ?? [];
    annotationStartRef.current = pageAnns.find((a) => a.id === id) ?? null;
    modeRef.current = 'moving';

    // Attach window-level listeners for drag to work over foreignObject content
    attachMoveHandlers({ svgRef, modeRef, startRef, annotationStartRef, updateAnnotation });
  }, [activeTool, annotations, pageId, selectAnnotation, getPageCoords, updateAnnotation, svgRef]);

  const handleHandleMouseDown = useCallback((e: React.MouseEvent, handle: Handle) => {
    e.preventDefault();
    const coords = getPageCoords(e);
    startRef.current = coords;
    activeHandleRef.current = handle;
    const pageAnns = annotations[pageId] ?? [];
    annotationStartRef.current = pageAnns.find((a) => a.id === selectedAnnotationId) ?? null;
    modeRef.current = 'resizing';

    // Attach window-level listeners for resize to work anywhere
    attachResizeHandlers({ svgRef, modeRef, startRef, annotationStartRef, activeHandleRef, updateAnnotation });
  }, [annotations, pageId, selectedAnnotationId, getPageCoords, updateAnnotation, svgRef]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const coords = getPageCoords(e);

    if (activeTool === 'selection') {
      const pageAnns = annotations[pageId] ?? [];
      const sorted = [...pageAnns].sort((a, b) => b.zIndex - a.zIndex);
      const hit = sorted.find((a) => isPointInAnnotation(coords.x, coords.y, a));
      if (hit) {
        selectAnnotation(hit.id);
        startRef.current = coords;
        annotationStartRef.current = hit;
        modeRef.current = 'moving';

        // Attach window-level listeners for drag to work over foreignObject content
        attachMoveHandlers({ svgRef, modeRef, startRef, annotationStartRef, updateAnnotation });
      } else {
        selectAnnotation(null);
      }
      return;
    }

    // Drawing mode
    const type = toolToAnnotationType(activeTool);
    if (!type) return;
    e.preventDefault();

    // Click-to-place tools (no drag)
    if (type === 'text' || type === 'sticky-note') {
      const ann = createAnnotation(type, coords.x, coords.y, pageId, getNextZIndex());
      addAnnotation(ann);
      return;
    }

    const ann = createAnnotation(type, coords.x, coords.y, pageId, getNextZIndex());
    startRef.current = coords;
    setDrawingAnnotation(ann);
    modeRef.current = 'drawing';
  }, [activeTool, annotations, pageId, selectAnnotation, getPageCoords, getNextZIndex, addAnnotation, updateAnnotation, svgRef]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (modeRef.current === 'idle') return;
    const coords = getPageCoords(e);

    if (modeRef.current === 'drawing' && drawingAnnotation) {
      setDrawingAnnotation(updateDrawingAnnotation(drawingAnnotation, coords, startRef.current));
      return;
    }

    if (modeRef.current === 'moving' && annotationStartRef.current) {
      const dx = coords.x - startRef.current.x;
      const dy = coords.y - startRef.current.y;
      updateAnnotation(annotationStartRef.current.id, computeMoveUpdate(annotationStartRef.current, dx, dy));
      return;
    }

    if (modeRef.current === 'resizing' && annotationStartRef.current && activeHandleRef.current) {
      const updates = computeResizeUpdate(annotationStartRef.current, activeHandleRef.current, coords);
      if (updates) updateAnnotation(annotationStartRef.current.id, updates);
    }
  }, [drawingAnnotation, getPageCoords, updateAnnotation]);

  const handleMouseUp = useCallback(() => {
    if (modeRef.current === 'drawing' && drawingAnnotation) {
      const finalized = finalizeDrawing(drawingAnnotation);
      if (finalized) {
        addAnnotation(finalized);
      }
      setDrawingAnnotation(null);
    }
    modeRef.current = 'idle';
    annotationStartRef.current = null;
    activeHandleRef.current = null;
  }, [drawingAnnotation, addAnnotation]);

  // Cleanup window listeners on unmount
  useEffect(() => {
    return () => {
      // Remove any lingering window listeners
      modeRef.current = 'idle';
      annotationStartRef.current = null;
      activeHandleRef.current = null;
    };
  }, []);

  const cursor = activeTool === 'selection' ? 'default' : 'crosshair';

  return {
    drawingAnnotation,
    cursor,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleAnnotationMouseDown,
    handleHandleMouseDown,
  };
}
