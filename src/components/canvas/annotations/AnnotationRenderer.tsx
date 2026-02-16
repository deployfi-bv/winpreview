// Renders a single annotation by dispatching to type-specific sub-renderers

import { useAppState } from '@/hooks/useAppState';

import { tryRenderPolygon, tryRenderSpeechBalloon,tryRenderStar } from './GeometricAnnotations';
import { tryRenderLine } from './LineAnnotation';
import { tryRenderRedaction,tryRenderStickyNote, tryRenderTextMarkup } from './MarkupAnnotations';
import { tryRenderFreehand, tryRenderSignature } from './PathAnnotations';
import { tryRenderShape } from './ShapeAnnotation';
import { tryRenderText } from './TextAnnotation';

import type { AnnotationRendererProps } from './renderHelpers';

export type { AnnotationRendererProps };

export function AnnotationRenderer({ annotation, isSelected, onMouseDown, onUpdateAnnotation }: AnnotationRendererProps) {
  const { activeTool } = useAppState();
  const annotationCursor = activeTool === 'selection' ? 'move' : undefined;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown(e, annotation.id);
  };

  return (
    tryRenderShape(annotation, isSelected, handleMouseDown, annotationCursor)
    ?? tryRenderLine(annotation, handleMouseDown, annotationCursor)
    ?? tryRenderText(annotation, isSelected, handleMouseDown, onUpdateAnnotation, annotationCursor)
    ?? tryRenderFreehand(annotation, handleMouseDown, annotationCursor)
    ?? tryRenderSignature(annotation, handleMouseDown, annotationCursor)
    ?? tryRenderTextMarkup(annotation, handleMouseDown, annotationCursor)
    ?? tryRenderStickyNote(annotation, isSelected, handleMouseDown, annotationCursor)
    ?? tryRenderStar(annotation, handleMouseDown, annotationCursor)
    ?? tryRenderPolygon(annotation, handleMouseDown, annotationCursor)
    ?? tryRenderSpeechBalloon(annotation, handleMouseDown, annotationCursor)
    ?? tryRenderRedaction(annotation, handleMouseDown, annotationCursor)
    ?? null
  );
}
