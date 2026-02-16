// Shared utilities and types for annotation rendering

import type { Annotation } from '@/types/annotation';

export interface AnnotationRendererProps {
  annotation: Annotation;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onUpdateAnnotation?: (id: string, updates: Partial<Annotation>) => void;
}

export type AnnotationMouseHandler = (e: React.MouseEvent) => void;

export function getStrokeDashArray(style: string, width: number): string | undefined {
  if (style === 'dashed') return `${width * 4} ${width * 2}`;
  if (style === 'dotted') return `${width} ${width}`;
  return undefined;
}

export function arrowheadPoints(
  tipX: number, tipY: number, fromX: number, fromY: number, size: number
): string {
  const angle = Math.atan2(tipY - fromY, tipX - fromX);
  const spread = Math.PI / 6;
  const x1 = tipX - size * Math.cos(angle - spread);
  const y1 = tipY - size * Math.sin(angle - spread);
  const x2 = tipX - size * Math.cos(angle + spread);
  const y2 = tipY - size * Math.sin(angle + spread);
  return `${tipX},${tipY} ${x1},${y1} ${x2},${y2}`;
}
