// Annotation type definitions for canvas drawing

import type { ArrowheadOption, BorderStyle, TextAlignment } from '@/constants/annotations';

export interface BaseAnnotation {
  id: string;
  pageId: string;
  type: AnnotationType;
  x: number;
  y: number;
  zIndex: number;
}

export type AnnotationType =
  | 'rectangle' | 'oval' | 'line' | 'arrow' | 'text' | 'freehand'
  | 'signature' | 'highlight' | 'underline' | 'strikethrough'
  | 'sticky-note' | 'star' | 'polygon' | 'speech-balloon' | 'redaction';

export interface ShapeAnnotation extends BaseAnnotation {
  type: 'rectangle' | 'oval';
  width: number;
  height: number;
  borderColor: string;
  fillColor: string;
  borderWidth: number;
  borderStyle: BorderStyle;
}

export interface LineAnnotation extends BaseAnnotation {
  type: 'line' | 'arrow';
  endX: number;
  endY: number;
  color: string;
  width: number;
  style: BorderStyle;
  arrowhead: ArrowheadOption;
}

export interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  width: number;
  height: number;
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  alignment: TextAlignment;
}

export interface FreehandAnnotation extends BaseAnnotation {
  type: 'freehand';
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
}

export interface SignatureAnnotation extends BaseAnnotation {
  type: 'signature';
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
}

export interface TextMarkupAnnotation extends BaseAnnotation {
  type: 'highlight' | 'underline' | 'strikethrough';
  width: number;
  height: number;
  color: string;
  opacity: number;
}

export interface StickyNoteAnnotation extends BaseAnnotation {
  type: 'sticky-note';
  content: string;
  color: string;
  isExpanded: boolean;
}

export interface StarAnnotation extends BaseAnnotation {
  type: 'star';
  width: number;
  height: number;
  points: number;
  borderColor: string;
  fillColor: string;
  borderWidth: number;
  borderStyle: BorderStyle;
}

export interface PolygonAnnotation extends BaseAnnotation {
  type: 'polygon';
  width: number;
  height: number;
  sides: number;
  borderColor: string;
  fillColor: string;
  borderWidth: number;
  borderStyle: BorderStyle;
}

export interface SpeechBalloonAnnotation extends BaseAnnotation {
  type: 'speech-balloon';
  width: number;
  height: number;
  content: string;
  tailDirection: 'bottom-left' | 'bottom-right';
  borderColor: string;
  fillColor: string;
  borderWidth: number;
  fontSize: number;
}

export interface RedactionAnnotation extends BaseAnnotation {
  type: 'redaction';
  width: number;
  height: number;
}

export type Annotation =
  | ShapeAnnotation | LineAnnotation | TextAnnotation | FreehandAnnotation
  | SignatureAnnotation | TextMarkupAnnotation | StickyNoteAnnotation
  | StarAnnotation | PolygonAnnotation | SpeechBalloonAnnotation | RedactionAnnotation;

// Type guards
export function isShapeAnnotation(a: Annotation): a is ShapeAnnotation {
  return a.type === 'rectangle' || a.type === 'oval';
}

export function isLineAnnotation(a: Annotation): a is LineAnnotation {
  return a.type === 'line' || a.type === 'arrow';
}

export function isTextAnnotation(a: Annotation): a is TextAnnotation {
  return a.type === 'text';
}

export function isFreehandAnnotation(a: Annotation): a is FreehandAnnotation {
  return a.type === 'freehand';
}

export function isSignatureAnnotation(a: Annotation): a is SignatureAnnotation {
  return a.type === 'signature';
}

export function isTextMarkupAnnotation(a: Annotation): a is TextMarkupAnnotation {
  return a.type === 'highlight' || a.type === 'underline' || a.type === 'strikethrough';
}

export function isStickyNoteAnnotation(a: Annotation): a is StickyNoteAnnotation {
  return a.type === 'sticky-note';
}

export function isStarAnnotation(a: Annotation): a is StarAnnotation {
  return a.type === 'star';
}

export function isPolygonAnnotation(a: Annotation): a is PolygonAnnotation {
  return a.type === 'polygon';
}

export function isSpeechBalloonAnnotation(a: Annotation): a is SpeechBalloonAnnotation {
  return a.type === 'speech-balloon';
}

export function isRedactionAnnotation(a: Annotation): a is RedactionAnnotation {
  return a.type === 'redaction';
}

/** Annotations that have width/height bounding box (for selection handles) */
export function hasBoundingBox(a: Annotation): a is
  ShapeAnnotation | TextAnnotation | TextMarkupAnnotation |
  StarAnnotation | PolygonAnnotation | SpeechBalloonAnnotation | RedactionAnnotation {
  return 'width' in a && 'height' in a && !isLineAnnotation(a as Annotation);
}
