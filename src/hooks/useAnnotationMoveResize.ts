/**
 * Pure functions for computing annotation move and resize updates.
 */

import { resizeFromHandle } from '@/hooks/useResizeHandle';

import {
  hasBoundingBox,
  isLineAnnotation,
  isShapeAnnotation,
  isTextAnnotation,
} from '@/types/annotation';

import type { Handle } from '@/lib/annotationHelpers';
import type { Annotation } from '@/types/annotation';

/** Compute move delta updates for an annotation. */
export function computeMoveUpdate(
  orig: Annotation,
  dx: number,
  dy: number,
): Partial<Annotation> {
  if (isLineAnnotation(orig)) {
    return {
      x: orig.x + dx, y: orig.y + dy,
      endX: orig.endX + dx, endY: orig.endY + dy,
    } as Partial<Annotation>;
  }
  return { x: orig.x + dx, y: orig.y + dy } as Partial<Annotation>;
}

/** Compute resize updates for an annotation given a handle drag position. */
export function computeResizeUpdate(
  orig: Annotation,
  handle: Handle,
  coords: { x: number; y: number },
): Partial<Annotation> | null {
  if (isLineAnnotation(orig)) {
    if (handle.type === 'start') {
      return { x: coords.x, y: coords.y } as Partial<Annotation>;
    }
    return { endX: coords.x, endY: coords.y } as Partial<Annotation>;
  }

  if (hasBoundingBox(orig) || isShapeAnnotation(orig) || isTextAnnotation(orig)) {
    return resizeFromHandle(
      orig as { x: number; y: number; width: number; height: number },
      handle.type,
      coords,
    ) as Partial<Annotation>;
  }

  return null;
}
