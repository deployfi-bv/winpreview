/**
 * Per-type annotation drawing helpers for PDF export.
 */

import { LineCapStyle, rgb } from 'pdf-lib';

import { pdfColor } from '@/lib/pdfColorUtils';

import type {
  FreehandAnnotation,
  LineAnnotation,
  PolygonAnnotation,
  RedactionAnnotation,
  ShapeAnnotation,
  SignatureAnnotation,
  SpeechBalloonAnnotation,
  StarAnnotation,
  TextAnnotation,
  TextMarkupAnnotation,
} from '@/types/annotation';
import type { PDFFont, PDFPage } from 'pdf-lib';

export function drawShape(page: PDFPage, ann: ShapeAnnotation, flipY: (y: number) => number): void {
  const { x, y, width, height, borderColor, fillColor, borderWidth } = ann;
  if (ann.type === 'oval') {
    page.drawEllipse({
      x: x + width / 2, y: flipY(y + height / 2),
      xScale: width / 2, yScale: height / 2,
      borderWidth, borderColor: pdfColor(borderColor),
      color: fillColor !== 'none' ? pdfColor(fillColor) : undefined,
    });
  } else {
    page.drawRectangle({
      x, y: flipY(y + height), width, height,
      borderWidth, borderColor: pdfColor(borderColor),
      ...(fillColor !== 'none' ? { color: pdfColor(fillColor) } : {}),
    });
  }
}

export function drawLine(page: PDFPage, ann: LineAnnotation, flipY: (y: number) => number): void {
  page.drawLine({
    start: { x: ann.x, y: flipY(ann.y) },
    end: { x: ann.endX, y: flipY(ann.endY) },
    thickness: ann.width,
    color: pdfColor(ann.color),
  });
}

export function drawText(page: PDFPage, ann: TextAnnotation, flipY: (y: number) => number, monospaceFont?: PDFFont): void {
  const isMonospace = ann.alignment === 'monospace';
  const lines = ann.content.split('\n');
  const lineHeight = ann.fontSize * 1.2;

  lines.forEach((line, idx) => {
    if (line.length === 0) return; // Skip empty lines

    const baseY = ann.y + ann.fontSize + (idx * lineHeight);

    if (isMonospace && monospaceFont) {
      // For monospace: calculate character spacing to distribute across width
      const charWidth = monospaceFont.widthOfTextAtSize(line, ann.fontSize) / line.length;
      const totalCharsWidth = charWidth * line.length;
      const usableWidth = ann.width - 4; // Account for padding
      const extraSpace = usableWidth - totalCharsWidth;
      const characterSpacing = line.length > 1 ? extraSpace / (line.length - 1) : 0;

      page.drawText(line, {
        x: ann.x + 2,
        y: flipY(baseY),
        size: ann.fontSize,
        color: pdfColor(ann.color),
        font: monospaceFont,
        ...(characterSpacing > 0 ? { characterSpacing } : {}),
      });
    } else {
      page.drawText(line, {
        x: ann.x + 2,
        y: flipY(baseY),
        size: ann.fontSize,
        color: pdfColor(ann.color),
      });
    }
  });
}

export function drawFreehand(page: PDFPage, ann: FreehandAnnotation | SignatureAnnotation, flipY: (y: number) => number): void {
  if (ann.points.length < 2) return;
  for (let i = 0; i < ann.points.length - 1; i++) {
    page.drawLine({
      start: { x: ann.points[i].x, y: flipY(ann.points[i].y) },
      end: { x: ann.points[i + 1].x, y: flipY(ann.points[i + 1].y) },
      thickness: ann.width, color: pdfColor(ann.color),
      lineCap: LineCapStyle.Round,
    });
  }
}

export function drawTextMarkup(page: PDFPage, ann: TextMarkupAnnotation, flipY: (y: number) => number): void {
  const { x, y, width, height, color, opacity, type } = ann;
  if (type === 'highlight') {
    page.drawRectangle({ x, y: flipY(y + height), width, height, color: pdfColor(color), opacity });
  } else if (type === 'underline') {
    page.drawLine({ start: { x, y: flipY(y + height) }, end: { x: x + width, y: flipY(y + height) }, thickness: 1.5, color: pdfColor(color) });
  } else if (type === 'strikethrough') {
    const midY = y + height / 2;
    page.drawLine({ start: { x, y: flipY(midY) }, end: { x: x + width, y: flipY(midY) }, thickness: 1.5, color: pdfColor(color) });
  }
}

export function drawRedaction(page: PDFPage, ann: RedactionAnnotation, flipY: (y: number) => number): void {
  page.drawRectangle({ x: ann.x, y: flipY(ann.y + ann.height), width: ann.width, height: ann.height, color: rgb(0, 0, 0) });
}

export function drawPolygonLike(page: PDFPage, ann: StarAnnotation | PolygonAnnotation, flipY: (y: number) => number): void {
  page.drawRectangle({
    x: ann.x, y: flipY(ann.y + ann.height), width: ann.width, height: ann.height,
    borderWidth: ann.borderWidth, borderColor: pdfColor(ann.borderColor),
    ...(ann.fillColor !== 'none' ? { color: pdfColor(ann.fillColor) } : {}),
  });
}

export function drawSpeechBalloon(page: PDFPage, ann: SpeechBalloonAnnotation, flipY: (y: number) => number): void {
  page.drawRectangle({
    x: ann.x, y: flipY(ann.y + ann.height), width: ann.width, height: ann.height,
    borderWidth: ann.borderWidth, borderColor: pdfColor(ann.borderColor),
    ...(ann.fillColor !== 'none' ? { color: pdfColor(ann.fillColor) } : {}),
  });
  page.drawText(ann.content, {
    x: ann.x + 4, y: flipY(ann.y + ann.fontSize + 4),
    size: ann.fontSize, color: pdfColor(ann.borderColor),
  });
}
