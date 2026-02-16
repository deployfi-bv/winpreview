// Renders all annotations for the current page + in-progress drawing

import { useAppState } from '@/hooks/useAppState';

import { AnnotationRenderer } from './AnnotationRenderer';
import { SelectionHandles } from './SelectionHandles';

import type { Handle } from '@/lib/annotationHelpers';
import type { Annotation } from '@/types/annotation';

interface AnnotationLayerProps {
  pageId: string;
  drawingAnnotation: Annotation | null;
  onAnnotationMouseDown: (e: React.MouseEvent, id: string) => void;
  onHandleMouseDown: (e: React.MouseEvent, handle: Handle) => void;
}

export function AnnotationLayer({
  pageId, drawingAnnotation, onAnnotationMouseDown, onHandleMouseDown,
}: AnnotationLayerProps) {
  const { annotations, selectedAnnotationId, updateAnnotation } = useAppState();
  const pageAnnotations = annotations[pageId] ?? [];
  const sorted = [...pageAnnotations].sort((a, b) => a.zIndex - b.zIndex);

  const selectedAnnotation = sorted.find((a) => a.id === selectedAnnotationId) ?? null;

  return (
    <g className="annotation-layer">
      {sorted.map((a) => (
        <AnnotationRenderer
          key={a.id}
          annotation={a}
          isSelected={a.id === selectedAnnotationId}
          onMouseDown={onAnnotationMouseDown}
          onUpdateAnnotation={updateAnnotation}
        />
      ))}
      {drawingAnnotation && (
        <AnnotationRenderer
          annotation={drawingAnnotation}
          isSelected={false}
          onMouseDown={() => {}}
        />
      )}
      {selectedAnnotation && (
        <SelectionHandles
          annotation={selectedAnnotation}
          onHandleMouseDown={onHandleMouseDown}
        />
      )}
    </g>
  );
}
