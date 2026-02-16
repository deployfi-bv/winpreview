// Simplified annotation renderer for thumbnails — avoids foreignObject issues at extreme scale

import { polygonPath, speechBalloonPath, starPath } from '@/lib/shapeGeometry';

import {
  isFreehandAnnotation,
  isLineAnnotation,
  isPolygonAnnotation,
  isRedactionAnnotation,
  isShapeAnnotation,
  isSignatureAnnotation,
  isSpeechBalloonAnnotation,
  isStarAnnotation,
  isStickyNoteAnnotation,
  isTextAnnotation,
  isTextMarkupAnnotation,
} from '@/types/annotation';

import type { Annotation } from '@/types/annotation';

// Helper: build SVG path from points
function buildPath(points: Array<{ x: number; y: number }>): string {
  return points.reduce<string>((acc, pt, i) => (
    i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`
  ), '');
}

/**
 * Renders a single annotation as pure SVG for thumbnails.
 * Does NOT use foreignObject (which breaks at extreme scale reductions).
 */
export function renderThumbnailAnnotation(annotation: Annotation): React.ReactElement | null {
  const key = annotation.id;

  if (isTextAnnotation(annotation)) {
    return (
      <text
        key={key}
        x={annotation.x}
        y={annotation.y + annotation.fontSize}
        fontSize={annotation.fontSize}
        fontFamily={annotation.fontFamily}
        fill={annotation.color}
        fontWeight={annotation.bold ? 'bold' : 'normal'}
        fontStyle={annotation.italic ? 'italic' : 'normal'}
        textAnchor="start"
      >
        {annotation.content}
      </text>
    );
  }

  if (isShapeAnnotation(annotation)) {
    const { x, y, width, height, borderColor, fillColor, borderWidth, type } = annotation;
    const fill = fillColor === 'none' ? 'transparent' : fillColor;
    const common = { stroke: borderColor, strokeWidth: borderWidth, fill };

    return type === 'oval' ? (
      <ellipse
        key={key}
        {...common}
        cx={x + width / 2}
        cy={y + height / 2}
        rx={Math.abs(width) / 2}
        ry={Math.abs(height) / 2}
      />
    ) : (
      <rect
        key={key}
        {...common}
        x={Math.min(x, x + width)}
        y={Math.min(y, y + height)}
        width={Math.abs(width)}
        height={Math.abs(height)}
      />
    );
  }

  if (isLineAnnotation(annotation)) {
    const { x, y, endX, endY, color, width } = annotation;
    return <line key={key} x1={x} y1={y} x2={endX} y2={endY} stroke={color} strokeWidth={width} strokeLinecap="round" />;
  }

  if (isFreehandAnnotation(annotation) || isSignatureAnnotation(annotation)) {
    const { points, color, width } = annotation;
    if (points.length < 2) return null;
    const d = buildPath(points);
    return <path key={key} d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  }

  if (isTextMarkupAnnotation(annotation)) {
    const { x, y, width, height, color, opacity, type } = annotation;
    const absW = Math.abs(width);
    const absH = Math.abs(height);
    const minX = Math.min(x, x + width);
    const minY = Math.min(y, y + height);

    if (type === 'highlight') {
      return <rect key={key} x={minX} y={minY} width={absW} height={absH} fill={color} opacity={opacity} />;
    }
    const y1 = type === 'underline' ? minY + absH : minY + absH / 2;
    return <line key={key} x1={minX} y1={y1} x2={minX + absW} y2={y1} stroke={color} strokeWidth={2} />;
  }

  if (isStickyNoteAnnotation(annotation)) {
    return <rect key={key} x={annotation.x} y={annotation.y} width={24} height={24} rx={3} fill={annotation.color} />;
  }

  if (isStarAnnotation(annotation)) {
    const { x, y, width, height, points, borderColor, fillColor, borderWidth } = annotation;
    const absW = Math.abs(width);
    const absH = Math.abs(height);
    const cx = Math.min(x, x + width) + absW / 2;
    const cy = Math.min(y, y + height) + absH / 2;
    const outerR = Math.min(absW, absH) / 2;
    const innerR = outerR * 0.4;
    const d = starPath(cx, cy, outerR, innerR, points);
    const fill = fillColor === 'none' ? 'transparent' : fillColor;
    return <path key={key} d={d} stroke={borderColor} strokeWidth={borderWidth} fill={fill} />;
  }

  if (isPolygonAnnotation(annotation)) {
    const { x, y, width, height, sides, borderColor, fillColor, borderWidth } = annotation;
    const absW = Math.abs(width);
    const absH = Math.abs(height);
    const cx = Math.min(x, x + width) + absW / 2;
    const cy = Math.min(y, y + height) + absH / 2;
    const radius = Math.min(absW, absH) / 2;
    const d = polygonPath(cx, cy, radius, sides);
    const fill = fillColor === 'none' ? 'transparent' : fillColor;
    return <path key={key} d={d} stroke={borderColor} strokeWidth={borderWidth} fill={fill} />;
  }

  if (isSpeechBalloonAnnotation(annotation)) {
    const { x, y, width, height, tailDirection, borderColor, fillColor, borderWidth } = annotation;
    const absW = Math.abs(width);
    const absH = Math.abs(height);
    const minX = Math.min(x, x + width);
    const minY = Math.min(y, y + height);
    const d = speechBalloonPath(minX, minY, absW, absH, tailDirection);
    const fill = fillColor === 'none' ? 'transparent' : fillColor;
    return <path key={key} d={d} stroke={borderColor} strokeWidth={borderWidth} fill={fill} />;
  }

  if (isRedactionAnnotation(annotation)) {
    const { x, y, width, height } = annotation;
    const absW = Math.abs(width);
    const absH = Math.abs(height);
    const minX = Math.min(x, x + width);
    const minY = Math.min(y, y + height);
    return <rect key={key} x={minX} y={minY} width={absW} height={absH} fill="#000000" />;
  }

  return null;
}
