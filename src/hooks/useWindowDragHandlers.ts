// Window-level pointer event handlers for dragging annotations over foreignObject content

import { computeMoveUpdate, computeResizeUpdate } from '@/hooks/useAnnotationMoveResize';

import { screenToPage } from '@/lib/coordinates';

import type { Handle } from '@/lib/annotationHelpers';
import type { Annotation } from '@/types/annotation';
import type React from 'react';

interface WindowDragHandlersOptions {
  svgRef: React.RefObject<SVGSVGElement | null>;
  modeRef: React.RefObject<'idle' | 'drawing' | 'moving' | 'resizing'>;
  startRef: React.RefObject<{ x: number; y: number }>;
  annotationStartRef: React.RefObject<Annotation | null>;
  activeHandleRef?: React.RefObject<Handle | null>;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
}

export function attachMoveHandlers(opts: WindowDragHandlersOptions): void {
  const { svgRef, modeRef, startRef, annotationStartRef, updateAnnotation } = opts;

  const onPointerMove = (ev: PointerEvent) => {
    if (modeRef.current !== 'moving' || !annotationStartRef.current || !svgRef.current) return;
    const pageCoords = screenToPage(ev.clientX, ev.clientY, svgRef.current);
    const dx = pageCoords.x - startRef.current.x;
    const dy = pageCoords.y - startRef.current.y;
    updateAnnotation(annotationStartRef.current.id, computeMoveUpdate(annotationStartRef.current, dx, dy));
  };

  const onPointerUp = () => {
    modeRef.current = 'idle';
    annotationStartRef.current = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}

export function attachResizeHandlers(opts: WindowDragHandlersOptions): void {
  const { svgRef, modeRef, annotationStartRef, activeHandleRef, updateAnnotation } = opts;
  if (!activeHandleRef) return;

  const onPointerMove = (ev: PointerEvent) => {
    if (modeRef.current !== 'resizing' || !annotationStartRef.current || !activeHandleRef.current || !svgRef.current) return;
    const pageCoords = screenToPage(ev.clientX, ev.clientY, svgRef.current);
    const updates = computeResizeUpdate(annotationStartRef.current, activeHandleRef.current, pageCoords);
    if (updates) updateAnnotation(annotationStartRef.current.id, updates);
  };

  const onPointerUp = () => {
    modeRef.current = 'idle';
    annotationStartRef.current = null;
    if (activeHandleRef.current) activeHandleRef.current = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}
