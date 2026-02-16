// Renders text markup (highlight/underline/strikethrough), sticky notes, and redaction annotations

import { isRedactionAnnotation, isStickyNoteAnnotation, isTextMarkupAnnotation } from '@/types/annotation';

import type { AnnotationMouseHandler } from './renderHelpers';
import type { Annotation } from '@/types/annotation';

export function tryRenderTextMarkup(
  annotation: Annotation,
  handleMouseDown: AnnotationMouseHandler,
  cursor?: string,
): React.ReactElement | null {
  if (!isTextMarkupAnnotation(annotation)) return null;

  const { x, y, width, height, color, opacity, type } = annotation;
  const absW = Math.abs(width);
  const absH = Math.abs(height);
  const minX = Math.min(x, x + width);
  const minY = Math.min(y, y + height);

  if (type === 'highlight') {
    return (
      <rect x={minX} y={minY} width={absW} height={absH}
        fill={color} opacity={opacity} cursor={cursor} onMouseDown={handleMouseDown} />
    );
  }
  if (type === 'underline') {
    return (
      <line x1={minX} y1={minY + absH} x2={minX + absW} y2={minY + absH}
        stroke={color} strokeWidth={2} cursor={cursor} onMouseDown={handleMouseDown} />
    );
  }
  return (
    <line x1={minX} y1={minY + absH / 2} x2={minX + absW} y2={minY + absH / 2}
      stroke={color} strokeWidth={2} cursor={cursor} onMouseDown={handleMouseDown} />
  );
}

export function tryRenderStickyNote(
  annotation: Annotation,
  isSelected: boolean,
  handleMouseDown: AnnotationMouseHandler,
  cursor?: string,
): React.ReactElement | null {
  if (!isStickyNoteAnnotation(annotation)) return null;

  const { x, y, color } = annotation;
  return (
    <g cursor={cursor || 'pointer'} onMouseDown={handleMouseDown}>
      <rect x={x} y={y} width={24} height={24} rx={3} fill={color} stroke="#00000033" strokeWidth={1} />
      <text x={x + 12} y={y + 17} textAnchor="middle" fontSize={14} fill="#000000" style={{ pointerEvents: 'none' }}>
        &#x270E;
      </text>
      {isSelected && (
        <rect x={x - 1} y={y - 1} width={26} height={26} rx={4} fill="none"
          stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="3 2" />
      )}
    </g>
  );
}

export function tryRenderRedaction(
  annotation: Annotation,
  handleMouseDown: AnnotationMouseHandler,
  cursor?: string,
): React.ReactElement | null {
  if (!isRedactionAnnotation(annotation)) return null;

  const { x, y, width, height } = annotation;
  const absW = Math.abs(width);
  const absH = Math.abs(height);
  const minX = Math.min(x, x + width);
  const minY = Math.min(y, y + height);

  return (
    <rect x={minX} y={minY} width={absW} height={absH}
      fill="#000000" cursor={cursor} onMouseDown={handleMouseDown} />
  );
}
