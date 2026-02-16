// Renders freehand and signature path-based annotations

import { isFreehandAnnotation, isSignatureAnnotation } from '@/types/annotation';

import type { AnnotationMouseHandler } from './renderHelpers';
import type { Annotation, FreehandAnnotation, SignatureAnnotation } from '@/types/annotation';

function buildPathD(points: Array<{ x: number; y: number }>): string {
  return points.reduce<string>((acc, pt, i) => (
    i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`
  ), '');
}

interface PathAnnotationProps {
  annotation: FreehandAnnotation | SignatureAnnotation;
  onMouseDown: AnnotationMouseHandler;
  cursor?: string;
}

function PathAnnotationView({ annotation, onMouseDown, cursor }: PathAnnotationProps) {
  const { points, color, width } = annotation;
  if (points.length < 2) return null;
  const d = buildPathD(points);

  return (
    <path
      d={d}
      stroke={color}
      strokeWidth={width}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      cursor={cursor}
      onMouseDown={onMouseDown}
    />
  );
}

export function tryRenderFreehand(
  annotation: Annotation,
  handleMouseDown: AnnotationMouseHandler,
  cursor?: string,
): React.ReactElement | null {
  if (!isFreehandAnnotation(annotation)) return null;
  return <PathAnnotationView annotation={annotation} onMouseDown={handleMouseDown} cursor={cursor} />;
}

export function tryRenderSignature(
  annotation: Annotation,
  handleMouseDown: AnnotationMouseHandler,
  cursor?: string,
): React.ReactElement | null {
  if (!isSignatureAnnotation(annotation)) return null;
  return <PathAnnotationView annotation={annotation} onMouseDown={handleMouseDown} cursor={cursor} />;
}
