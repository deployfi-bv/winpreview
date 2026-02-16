/**
 * Convert vector annotations to pdf-lib drawing commands.
 * Key transform: SVG Y grows downward, PDF Y grows upward.
 *   pdfY = pageHeight - svgY
 */

import {
  isFreehandAnnotation,
  isLineAnnotation,
  isPolygonAnnotation,
  isRedactionAnnotation,
  isShapeAnnotation,
  isSignatureAnnotation,
  isSpeechBalloonAnnotation,
  isStarAnnotation,
  isTextAnnotation,
  isTextMarkupAnnotation,
} from '@/types/annotation';

import {
  drawFreehand,
  drawLine,
  drawPolygonLike,
  drawRedaction,
  drawShape,
  drawSpeechBalloon,
  drawText,
  drawTextMarkup,
} from './annotationExportHelpers';

import type { Annotation } from '@/types/annotation';
import type { PDFFont, PDFPage } from 'pdf-lib';

export interface ExportFonts {
  monospace?: PDFFont;
}

/** Draw a single annotation onto a pdf-lib PDFPage. */
export function drawAnnotation(page: PDFPage, annotation: Annotation, pageHeight: number, fonts?: ExportFonts): void {
  const flipY = (y: number) => pageHeight - y;

  if (isShapeAnnotation(annotation)) { drawShape(page, annotation, flipY); return; }
  if (isLineAnnotation(annotation)) { drawLine(page, annotation, flipY); return; }
  if (isTextAnnotation(annotation)) { drawText(page, annotation, flipY, fonts?.monospace); return; }
  if (isFreehandAnnotation(annotation) || isSignatureAnnotation(annotation)) { drawFreehand(page, annotation, flipY); return; }
  if (isTextMarkupAnnotation(annotation)) { drawTextMarkup(page, annotation, flipY); return; }
  if (isRedactionAnnotation(annotation)) { drawRedaction(page, annotation, flipY); return; }
  if (isStarAnnotation(annotation) || isPolygonAnnotation(annotation)) { drawPolygonLike(page, annotation, flipY); return; }
  if (isSpeechBalloonAnnotation(annotation)) { drawSpeechBalloon(page, annotation, flipY); return; }
}
