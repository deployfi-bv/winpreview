/**
 * Image export service — exports pages as JPEG/PNG.
 * Strategy: create a temporary PDF with annotations flattened, render to canvas, export as image.
 * For multi-page documents, exports only the first page (images can't have multiple pages).
 */

import { PDFDocument } from 'pdf-lib';

import type { Annotation } from '@/types/annotation';
import type { PageData } from '@/types/page';

import { loadPdfBinary } from '@/services/pdfBinaryStore';
import { drawPageAnnotations, embedExportFonts, embedImageAsPage } from '@/services/pdfExportHelpers';

/**
 * Export a page as JPEG or PNG image.
 * For multi-page documents, exports only the first page.
 */
export async function exportAsImage(
  pages: PageData[],
  annotations: Record<string, Annotation[]>,
  format: 'jpeg' | 'png',
  quality: number = 0.92,
): Promise<Blob> {
  if (pages.length === 0) {
    throw new Error('No pages to export');
  }

  // Export only the first page
  const page = pages[0];
  const pageAnnotations = { [page.id]: annotations[page.id] ?? [] };

  // Create a temporary PDF with the page and flattened annotations
  const pdfBytes = await createFlattenedPdfPage(page, pageAnnotations);

  // Render PDF page to canvas at high resolution
  const canvas = await renderPdfToCanvas(pdfBytes, 2.0);

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob'));
        }
      },
      mimeType,
      quality,
    );
  });
}

/** Create a single-page PDF with annotations flattened. */
async function createFlattenedPdfPage(
  page: PageData,
  annotations: Record<string, Annotation[]>,
): Promise<Uint8Array> {
  const outDoc = await PDFDocument.create();

  // Embed fonts if needed
  const fonts = await embedExportFonts(outDoc, annotations);

  // Load source binary
  const binary = await loadPdfBinary(page.sourceId);
  if (!binary) {
    throw new Error(`Source binary not found for sourceId: ${page.sourceId}`);
  }

  let pdfPage;
  if (page.sourceFormat === 'image') {
    // Embed image as PDF page
    pdfPage = await embedImageAsPage(outDoc, binary, page);
  } else {
    // Copy PDF page
    const srcDoc = await PDFDocument.load(binary);
    if (page.originalIndex >= srcDoc.getPageCount()) {
      throw new Error(`Page index ${page.originalIndex} out of range`);
    }
    const [copiedPage] = await outDoc.copyPages(srcDoc, [page.originalIndex]);
    outDoc.addPage(copiedPage);
    pdfPage = copiedPage;
  }

  // Draw annotations
  drawPageAnnotations(pdfPage, page, annotations, fonts);

  return outDoc.save();
}

/** Render a PDF to canvas using pdf.js. */
async function renderPdfToCanvas(
  pdfBytes: Uint8Array,
  scale: number,
): Promise<HTMLCanvasElement> {
  await import('@/lib/pdfWorker');
  const { getDocument } = await import('pdfjs-dist');
  const doc = await getDocument({ data: pdfBytes }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  await doc.destroy();

  return canvas;
}
