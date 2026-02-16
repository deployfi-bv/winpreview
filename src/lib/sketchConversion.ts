// Convert a recognized shape from freehand drawing to a proper annotation

import { generateId } from '@/lib/annotationFactory';
import { recognizeShape } from '@/lib/sketchRecognition';

import type { Annotation, FreehandAnnotation, LineAnnotation,ShapeAnnotation } from '@/types/annotation';

export interface ConversionResult {
  converted: Annotation;
  shapeName: string;
}

export function tryConvertFreehand(freehand: FreehandAnnotation): ConversionResult | null {
  const recognized = recognizeShape(freehand.points);
  if (!recognized) return null;

  const { type, bounds } = recognized;
  const base = {
    id: generateId(),
    pageId: freehand.pageId,
    zIndex: freehand.zIndex,
  };

  switch (type) {
    case 'circle':
      return {
        shapeName: 'Circle',
        converted: {
          ...base,
          type: 'oval',
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          borderColor: freehand.color,
          fillColor: 'none',
          borderWidth: freehand.width,
          borderStyle: 'solid',
        } as ShapeAnnotation,
      };
    case 'rectangle':
      return {
        shapeName: 'Rectangle',
        converted: {
          ...base,
          type: 'rectangle',
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          borderColor: freehand.color,
          fillColor: 'none',
          borderWidth: freehand.width,
          borderStyle: 'solid',
        } as ShapeAnnotation,
      };
    case 'line':
      return {
        shapeName: 'Line',
        converted: {
          ...base,
          type: 'line',
          x: freehand.points[0].x,
          y: freehand.points[0].y,
          endX: freehand.points[freehand.points.length - 1].x,
          endY: freehand.points[freehand.points.length - 1].y,
          color: freehand.color,
          width: freehand.width,
          style: 'solid',
          arrowhead: 'none',
        } as LineAnnotation,
      };
    case 'triangle':
      return {
        shapeName: 'Triangle',
        converted: {
          ...base,
          type: 'polygon',
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          sides: 3,
          borderColor: freehand.color,
          fillColor: 'none',
          borderWidth: freehand.width,
          borderStyle: 'solid',
        } as Annotation,
      };
    default:
      return null;
  }
}
