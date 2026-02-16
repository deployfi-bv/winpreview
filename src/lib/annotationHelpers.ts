// Annotation geometry helpers: hit-testing, handles, clamping

import { PAGE_HEIGHT, PAGE_WIDTH } from '@/lib/zoom';

import {
  hasBoundingBox,
  isFreehandAnnotation,
  isLineAnnotation, isSignatureAnnotation, isStickyNoteAnnotation,
} from '@/types/annotation';

import type { Annotation } from '@/types/annotation';

export interface Handle {
  x: number;
  y: number;
  cursor: string;
  type: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'start' | 'end';
}

function boxHandles(x: number, y: number, width: number, height: number): Handle[] {
  return [
    { x, y, cursor: 'nwse-resize', type: 'nw' },
    { x: x + width / 2, y, cursor: 'ns-resize', type: 'n' },
    { x: x + width, y, cursor: 'nesw-resize', type: 'ne' },
    { x: x + width, y: y + height / 2, cursor: 'ew-resize', type: 'e' },
    { x: x + width, y: y + height, cursor: 'nwse-resize', type: 'se' },
    { x: x + width / 2, y: y + height, cursor: 'ns-resize', type: 's' },
    { x, y: y + height, cursor: 'nesw-resize', type: 'sw' },
    { x, y: y + height / 2, cursor: 'ew-resize', type: 'w' },
  ];
}

export function getHandles(annotation: Annotation): Handle[] {
  if (isLineAnnotation(annotation)) {
    return [
      { x: annotation.x, y: annotation.y, cursor: 'move', type: 'start' },
      { x: annotation.endX, y: annotation.endY, cursor: 'move', type: 'end' },
    ];
  }

  if (hasBoundingBox(annotation)) {
    const { x, y, width, height } = annotation;
    return boxHandles(x, y, width, height);
  }

  return [];
}

export function isPointInAnnotation(px: number, py: number, annotation: Annotation, tolerance = 5): boolean {
  if (hasBoundingBox(annotation)) {
    const { x, y, width, height } = annotation;
    return px >= x - tolerance && px <= x + width + tolerance
      && py >= y - tolerance && py <= y + height + tolerance;
  }

  if (isLineAnnotation(annotation)) {
    const { x, y, endX, endY } = annotation;
    const dx = endX - x;
    const dy = endY - y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x, py - y) <= tolerance;
    const t = Math.max(0, Math.min(1, ((px - x) * dx + (py - y) * dy) / lenSq));
    const projX = x + t * dx;
    const projY = y + t * dy;
    return Math.hypot(px - projX, py - projY) <= tolerance + annotation.width;
  }

  if (isFreehandAnnotation(annotation) || isSignatureAnnotation(annotation)) {
    return annotation.points.some((pt) => Math.hypot(px - pt.x, py - pt.y) <= tolerance + annotation.width);
  }

  if (isStickyNoteAnnotation(annotation)) {
    return px >= annotation.x - tolerance && px <= annotation.x + 24 + tolerance
      && py >= annotation.y - tolerance && py <= annotation.y + 24 + tolerance;
  }

  return false;
}

export function clampToPage(
  annotation: Annotation,
  pageWidth = PAGE_WIDTH,
  pageHeight = PAGE_HEIGHT,
): Annotation {
  if (hasBoundingBox(annotation)) {
    const a = annotation as { x: number; y: number; width: number; height: number };
    return {
      ...annotation,
      x: Math.max(0, Math.min(a.x, pageWidth - a.width)),
      y: Math.max(0, Math.min(a.y, pageHeight - a.height)),
    } as Annotation;
  }
  if (isLineAnnotation(annotation)) {
    return {
      ...annotation,
      x: Math.max(0, Math.min(annotation.x, pageWidth)),
      y: Math.max(0, Math.min(annotation.y, pageHeight)),
      endX: Math.max(0, Math.min(annotation.endX, pageWidth)),
      endY: Math.max(0, Math.min(annotation.endY, pageHeight)),
    };
  }
  return annotation;
}
