/**
 * OCR text layer embedding for PDF export.
 * Renders invisible searchable text at OCR bounding box coordinates.
 */

import { rgb, StandardFonts } from 'pdf-lib';

import type { OcrPageResult } from '@/types/ocr';
import type { PDFDocument, PDFFont, PDFPage } from 'pdf-lib';

/** Embed OCR text as invisible text layer on a PDF page. */
export function embedOcrTextLayer(
  pdfPage: PDFPage,
  ocrResult: OcrPageResult,
  font: PDFFont,
  pageHeight: number,
): void {
  for (const box of ocrResult.textBoxes) {
    const trimmed = box.text.trim();
    if (!trimmed) continue;

    // PDF coordinate system: origin is bottom-left
    // OCR bbox: origin is top-left
    // Convert Y: pdfY = pageHeight - (bbox.y + bbox.height)
    const pdfX = box.bbox.x;
    const pdfY = pageHeight - (box.bbox.y + box.bbox.height);

    // Estimate font size from bbox height (roughly 70-80% of box height)
    const fontSize = Math.max(4, box.bbox.height * 0.75);

    pdfPage.drawText(trimmed, {
      x: pdfX,
      y: pdfY,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
      opacity: 0, // Invisible — only for text search/selection
    });
  }
}

/** Pre-embed Helvetica font for OCR text layers. */
export async function embedOcrFont(doc: PDFDocument): Promise<PDFFont> {
  return doc.embedFont(StandardFonts.Helvetica);
}
