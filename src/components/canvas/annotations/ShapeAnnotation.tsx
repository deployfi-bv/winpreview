// Renders rectangle and oval shape annotations

import { isShapeAnnotation } from '@/types/annotation';

import { getStrokeDashArray } from './renderHelpers';

import type { AnnotationMouseHandler } from './renderHelpers';
import type { Annotation, ShapeAnnotation as ShapeAnnotationType } from '@/types/annotation';

interface ShapeAnnotationProps {
  annotation: ShapeAnnotationType;
  isSelected: boolean;
  onMouseDown: AnnotationMouseHandler;
  cursor?: string;
}

export function tryRenderShape(
  annotation: Annotation,
  isSelected: boolean,
  handleMouseDown: AnnotationMouseHandler,
  cursor?: string,
): React.ReactElement | null {
  if (!isShapeAnnotation(annotation)) return null;
  return <ShapeAnnotationView annotation={annotation} isSelected={isSelected} onMouseDown={handleMouseDown} cursor={cursor} />;
}

function ShapeAnnotationView({ annotation, isSelected, onMouseDown, cursor }: ShapeAnnotationProps) {
  const { x, y, width, height, borderColor, fillColor, borderWidth, borderStyle, type } = annotation;
  const dash = getStrokeDashArray(borderStyle, borderWidth);
  const fill = fillColor === 'none' ? 'transparent' : fillColor;
  const common = {
    stroke: borderColor,
    strokeWidth: borderWidth,
    strokeDasharray: dash,
    fill,
    cursor: cursor as React.CSSProperties['cursor'] ?? undefined,
    onMouseDown,
    className: isSelected ? 'annotation-selected' : undefined,
  };

  if (type === 'oval') {
    return (
      <ellipse
        cx={x + width / 2}
        cy={y + height / 2}
        rx={Math.abs(width) / 2}
        ry={Math.abs(height) / 2}
        {...common}
      />
    );
  }

  return (
    <rect
      x={Math.min(x, x + width)}
      y={Math.min(y, y + height)}
      width={Math.abs(width)}
      height={Math.abs(height)}
      {...common}
    />
  );
}
