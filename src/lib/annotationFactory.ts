// Factory functions for creating annotation instances

import type {
  Annotation, AnnotationType, FreehandAnnotation, LineAnnotation,
  PolygonAnnotation, RedactionAnnotation,
  ShapeAnnotation, SignatureAnnotation, SpeechBalloonAnnotation,
  StarAnnotation, StickyNoteAnnotation, TextAnnotation, TextMarkupAnnotation,
} from '@/types/annotation';

export function generateId(): string {
  return crypto.randomUUID();
}

export interface AnnotationDefaults {
  borderColor?: string;
  fillColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  color?: string;
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  arrowhead?: 'none' | 'start' | 'end' | 'both';
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'monospace';
  points?: number;
  sides?: number;
  stickyColor?: string;
  highlightColor?: string;
}

export function createAnnotation(
  type: AnnotationType, x: number, y: number, pageId: string, zIndex: number, defaults?: AnnotationDefaults
): Annotation {
  const base = { id: generateId(), pageId, x, y, zIndex };

  switch (type) {
    case 'rectangle':
    case 'oval':
      return {
        ...base, type,
        width: 0, height: 0,
        borderColor: defaults?.borderColor ?? '#000000',
        fillColor: defaults?.fillColor ?? 'none',
        borderWidth: defaults?.borderWidth ?? 2,
        borderStyle: defaults?.borderStyle ?? 'solid',
      } as ShapeAnnotation;
    case 'line':
    case 'arrow':
      return {
        ...base, type,
        endX: x, endY: y,
        color: defaults?.color ?? '#000000',
        width: defaults?.width ?? 2,
        style: defaults?.style ?? 'solid',
        arrowhead: type === 'arrow' ? (defaults?.arrowhead ?? 'end') : 'none',
      } as LineAnnotation;
    case 'text':
      return {
        ...base, type,
        width: 150, height: 30,
        content: 'Text',
        fontFamily: defaults?.fontFamily ?? 'Arial',
        fontSize: defaults?.fontSize ?? 14,
        color: defaults?.color ?? '#000000',
        bold: defaults?.bold ?? false,
        italic: defaults?.italic ?? false,
        alignment: defaults?.alignment ?? 'left',
      } as TextAnnotation;
    case 'freehand':
      return {
        ...base, type,
        points: [{ x, y }],
        color: defaults?.color ?? '#FF3B30',
        width: defaults?.width ?? 3,
      } as FreehandAnnotation;
    case 'signature':
      return {
        ...base, type,
        points: [{ x, y }],
        color: defaults?.color ?? '#000000',
        width: defaults?.width ?? 2,
      } as SignatureAnnotation;
    case 'highlight':
    case 'underline':
    case 'strikethrough':
      return {
        ...base, type,
        width: 0, height: 0,
        color: defaults?.highlightColor ?? '#FFCC00',
        opacity: type === 'highlight' ? 0.3 : 1.0,
      } as TextMarkupAnnotation;
    case 'sticky-note':
      return {
        ...base, type,
        content: '',
        color: defaults?.stickyColor ?? '#FFCC00',
        isExpanded: false,
      } as StickyNoteAnnotation;
    case 'star':
      return {
        ...base, type,
        width: 0, height: 0,
        points: defaults?.points ?? 5,
        borderColor: defaults?.borderColor ?? '#000000',
        fillColor: defaults?.fillColor ?? '#FFCC00',
        borderWidth: defaults?.borderWidth ?? 2,
        borderStyle: defaults?.borderStyle ?? 'solid',
      } as StarAnnotation;
    case 'polygon':
      return {
        ...base, type,
        width: 0, height: 0,
        sides: defaults?.sides ?? 6,
        borderColor: defaults?.borderColor ?? '#000000',
        fillColor: defaults?.fillColor ?? 'none',
        borderWidth: defaults?.borderWidth ?? 2,
        borderStyle: defaults?.borderStyle ?? 'solid',
      } as PolygonAnnotation;
    case 'speech-balloon':
      return {
        ...base, type,
        width: 0, height: 0,
        content: 'Text',
        tailDirection: 'bottom-left',
        borderColor: defaults?.borderColor ?? '#000000',
        fillColor: defaults?.fillColor ?? '#FFFFFF',
        borderWidth: defaults?.borderWidth ?? 2,
        fontSize: defaults?.fontSize ?? 14,
      } as SpeechBalloonAnnotation;
    case 'redaction':
      return {
        ...base, type,
        width: 0, height: 0,
      } as RedactionAnnotation;
  }
}
