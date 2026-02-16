// Drawing mode handlers for annotations

import {
  hasBoundingBox,
  isFreehandAnnotation,
  isLineAnnotation,
  isShapeAnnotation,
  isSignatureAnnotation,
  isTextMarkupAnnotation,
} from '@/types/annotation';

import type { Annotation } from '@/types/annotation';

export function updateDrawingAnnotation(
  drawingAnnotation: Annotation,
  coords: { x: number; y: number },
  startCoords: { x: number; y: number }
): Annotation {
  const dx = coords.x - startCoords.x;
  const dy = coords.y - startCoords.y;

  // Shape-like annotations with width/height
  if (isShapeAnnotation(drawingAnnotation) || isTextMarkupAnnotation(drawingAnnotation) ||
      hasBoundingBox(drawingAnnotation)) {
    if ('width' in drawingAnnotation && 'height' in drawingAnnotation) {
      return { ...drawingAnnotation, width: dx, height: dy } as Annotation;
    }
  } else if (isLineAnnotation(drawingAnnotation)) {
    return { ...drawingAnnotation, endX: coords.x, endY: coords.y };
  } else if (isFreehandAnnotation(drawingAnnotation) || isSignatureAnnotation(drawingAnnotation)) {
    return {
      ...drawingAnnotation,
      points: [...drawingAnnotation.points, { x: coords.x, y: coords.y }],
    } as Annotation;
  }

  return drawingAnnotation;
}
