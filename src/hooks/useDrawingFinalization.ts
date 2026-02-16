/**
 * Drawing finalization: path simplification, negative-dimension normalization,
 * and size validation for completed annotations.
 */

import { simplifyPath } from '@/lib/pathSimplify';

import {
  isFreehandAnnotation,
  isLineAnnotation,
  isSignatureAnnotation,
  isStickyNoteAnnotation,
} from '@/types/annotation';

import type { Annotation } from '@/types/annotation';

/** Simplify freehand/signature point paths. */
function simplifyPoints(ann: Annotation): Annotation {
  if (isFreehandAnnotation(ann) || isSignatureAnnotation(ann)) {
    return { ...ann, points: simplifyPath(ann.points) } as Annotation;
  }
  return ann;
}

/** Normalize negative width/height for box-based annotations. */
function normalizeNegativeDimensions(ann: Annotation): Annotation {
  if (!('width' in ann && 'height' in ann)) return ann;
  if (isLineAnnotation(ann as Annotation)) return ann;
  if (isFreehandAnnotation(ann as Annotation)) return ann;
  if (isSignatureAnnotation(ann as Annotation)) return ann;
  if (isStickyNoteAnnotation(ann as Annotation)) return ann;

  const f = ann as unknown as { x: number; y: number; width: number; height: number };
  if (f.width < 0 || f.height < 0) {
    const nx = f.width < 0 ? f.x + f.width : f.x;
    const ny = f.height < 0 ? f.y + f.height : f.y;
    return { ...ann, x: nx, y: ny, width: Math.abs(f.width), height: Math.abs(f.height) } as Annotation;
  }
  return ann;
}

/** Check if annotation has sufficient size to commit. */
function hasMinimumSize(ann: Annotation): boolean {
  if ('width' in ann && 'height' in ann &&
      !isFreehandAnnotation(ann as Annotation) && !isSignatureAnnotation(ann as Annotation)) {
    const f = ann as unknown as { width: number; height: number };
    return Math.abs(f.width) > 2 || Math.abs(f.height) > 2;
  }
  if (isLineAnnotation(ann)) {
    return Math.hypot(ann.endX - ann.x, ann.endY - ann.y) > 2;
  }
  if (isFreehandAnnotation(ann) || isSignatureAnnotation(ann)) {
    return ann.points.length > 1;
  }
  return true;
}

/**
 * Finalize a drawing annotation: simplify paths, normalize dimensions, validate size.
 * Returns the finalized annotation, or null if it's too small to commit.
 */
export function finalizeDrawing(raw: Annotation): Annotation | null {
  let ann = simplifyPoints(raw);
  ann = normalizeNegativeDimensions(ann);
  return hasMinimumSize(ann) ? ann : null;
}
