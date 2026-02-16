// Renders star, polygon, and speech balloon annotations

import { polygonPath, speechBalloonPath, starPath } from '@/lib/shapeGeometry';

import { isPolygonAnnotation, isSpeechBalloonAnnotation, isStarAnnotation } from '@/types/annotation';

import { getStrokeDashArray } from './renderHelpers';

import type { AnnotationMouseHandler } from './renderHelpers';
import type { Annotation } from '@/types/annotation';

export function tryRenderStar(
  annotation: Annotation,
  handleMouseDown: AnnotationMouseHandler,
  cursor?: string,
): React.ReactElement | null {
  if (!isStarAnnotation(annotation)) return null;

  const { x, y, width, height, points, borderColor, fillColor, borderWidth, borderStyle } = annotation;
  const absW = Math.abs(width);
  const absH = Math.abs(height);
  const cx = Math.min(x, x + width) + absW / 2;
  const cy = Math.min(y, y + height) + absH / 2;
  const outerR = Math.min(absW, absH) / 2;
  const innerR = outerR * 0.4;
  const d = starPath(cx, cy, outerR, innerR, points);
  const dash = getStrokeDashArray(borderStyle, borderWidth);
  const fill = fillColor === 'none' ? 'transparent' : fillColor;

  return (
    <path d={d} stroke={borderColor} strokeWidth={borderWidth} strokeDasharray={dash}
      fill={fill} cursor={cursor} onMouseDown={handleMouseDown} />
  );
}

export function tryRenderPolygon(
  annotation: Annotation,
  handleMouseDown: AnnotationMouseHandler,
  cursor?: string,
): React.ReactElement | null {
  if (!isPolygonAnnotation(annotation)) return null;

  const { x, y, width, height, sides, borderColor, fillColor, borderWidth, borderStyle } = annotation;
  const absW = Math.abs(width);
  const absH = Math.abs(height);
  const cx = Math.min(x, x + width) + absW / 2;
  const cy = Math.min(y, y + height) + absH / 2;
  const radius = Math.min(absW, absH) / 2;
  const d = polygonPath(cx, cy, radius, sides);
  const dash = getStrokeDashArray(borderStyle, borderWidth);
  const fill = fillColor === 'none' ? 'transparent' : fillColor;

  return (
    <path d={d} stroke={borderColor} strokeWidth={borderWidth} strokeDasharray={dash}
      fill={fill} cursor={cursor} onMouseDown={handleMouseDown} />
  );
}

export function tryRenderSpeechBalloon(
  annotation: Annotation,
  handleMouseDown: AnnotationMouseHandler,
  cursor?: string,
): React.ReactElement | null {
  if (!isSpeechBalloonAnnotation(annotation)) return null;

  const { x, y, width, height, content, tailDirection, borderColor, fillColor, borderWidth, fontSize } = annotation;
  const absW = Math.abs(width);
  const absH = Math.abs(height);
  const minX = Math.min(x, x + width);
  const minY = Math.min(y, y + height);
  const d = speechBalloonPath(minX, minY, absW, absH, tailDirection);
  const fill = fillColor === 'none' ? 'transparent' : fillColor;

  return (
    <g cursor={cursor} onMouseDown={handleMouseDown}>
      <path d={d} stroke={borderColor} strokeWidth={borderWidth} fill={fill} />
      <foreignObject x={minX + 4} y={minY + 4} width={absW - 8} height={absH * 0.75}>
        <div style={{
          fontSize: `${fontSize}px`, color: borderColor, overflow: 'hidden',
          wordWrap: 'break-word', lineHeight: 1.3, pointerEvents: 'none',
        }}>
          {content}
        </div>
      </foreignObject>
    </g>
  );
}
