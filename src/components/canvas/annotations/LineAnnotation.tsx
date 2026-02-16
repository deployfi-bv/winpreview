// Renders line and arrow annotations

import { isLineAnnotation } from '@/types/annotation';

import { arrowheadPoints, getStrokeDashArray } from './renderHelpers';

import type { AnnotationMouseHandler } from './renderHelpers';
import type { Annotation, LineAnnotation as LineAnnotationType } from '@/types/annotation';

interface LineAnnotationProps {
  annotation: LineAnnotationType;
  onMouseDown: AnnotationMouseHandler;
  cursor?: string;
}

export function tryRenderLine(
  annotation: Annotation,
  handleMouseDown: AnnotationMouseHandler,
  cursor?: string,
): React.ReactElement | null {
  if (!isLineAnnotation(annotation)) return null;
  return <LineAnnotationView annotation={annotation} onMouseDown={handleMouseDown} cursor={cursor} />;
}

function LineAnnotationView({ annotation, onMouseDown, cursor }: LineAnnotationProps) {
  const { x, y, endX, endY, color, width, style, arrowhead } = annotation;
  const dash = getStrokeDashArray(style, width);
  const arrowSize = Math.max(10, width * 4);
  const showEnd = arrowhead === 'end' || arrowhead === 'both';
  const showStart = arrowhead === 'start' || arrowhead === 'both';

  return (
    <g cursor={cursor} onMouseDown={onMouseDown}>
      <line
        x1={x} y1={y} x2={endX} y2={endY}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap="round"
      />
      {showEnd && (
        <polygon points={arrowheadPoints(endX, endY, x, y, arrowSize)} fill={color} />
      )}
      {showStart && (
        <polygon points={arrowheadPoints(x, y, endX, endY, arrowSize)} fill={color} />
      )}
    </g>
  );
}
