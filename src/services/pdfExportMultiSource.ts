/**
 * Multi-source PDF assembly: groups pages by sourceId, loads each binary once.
 * Handles both PDF and image sources.
 */

import { PDFDocument } from 'pdf-lib';

import type { Annotation } from '@/types/annotation';
import type { OcrPageResult } from '@/types/ocr';
import type { PageData } from '@/types/page';

import { embedOcrFont, embedOcrTextLayer } from '@/services/ocrExport';
import { loadPdfBinary } from '@/services/pdfBinaryStore';
import { drawPageAnnotations, embedExportFonts, embedImageAsPage } from '@/services/pdfExportHelpers';

/** Build the output PDF from multiple sources (PDF + image pages). */
export async function exportMultiSourcePdf(
  pages: PageData[],
  annotations: Record<string, Annotation[]>,
  fallbackSessionId: string,
  ocrResults?: Record<string, OcrPageResult>,
): Promise<Uint8Array> {
  const outDoc = await PDFDocument.create();

  // Collect unique sourceIds
  const sourceIds = new Set(pages.map((p) => p.sourceId));

  // Load all source PDFs into a cache
  const pdfSources = new Map<string, PDFDocument>();
  const imageSources = new Map<string, Uint8Array>();

  for (const sourceId of sourceIds) {
    const binary = await loadPdfBinary(sourceId);
    if (!binary) {
      // Try fallback for old single-source documents
      if (sourceId === fallbackSessionId) continue;
      const fallback = await loadPdfBinary(fallbackSessionId);
      if (fallback) {
        // Determine if this is PDF or image based on the pages that reference it
        const refPage = pages.find((p) => p.sourceId === sourceId);
        if (refPage?.sourceFormat === 'image') {
          imageSources.set(sourceId, fallback);
        } else {
          const doc = await PDFDocument.load(fallback);
          pdfSources.set(sourceId, doc);
        }
      }
      continue;
    }

    // Determine format from pages referencing this source
    const refPage = pages.find((p) => p.sourceId === sourceId);
    if (refPage?.sourceFormat === 'image') {
      imageSources.set(sourceId, binary);
    } else {
      try {
        const doc = await PDFDocument.load(binary);
        pdfSources.set(sourceId, doc);
      } catch {
        // If it fails to load as PDF, treat as image
        imageSources.set(sourceId, binary);
      }
    }
  }

  // Also load fallback session if any page references it and it's not loaded yet
  if (!pdfSources.has(fallbackSessionId) && !imageSources.has(fallbackSessionId)) {
    const binary = await loadPdfBinary(fallbackSessionId);
    if (binary) {
      try {
        const doc = await PDFDocument.load(binary);
        pdfSources.set(fallbackSessionId, doc);
      } catch {
        // Ignore
      }
    }
  }

  // Pre-embed monospace font if any text annotation uses it
  const fonts = await embedExportFonts(outDoc, annotations);

  // Pre-embed OCR font if OCR results exist
  const ocrFont = ocrResults && Object.keys(ocrResults).length > 0
    ? await embedOcrFont(outDoc)
    : null;

  // Process each page in order
  for (const pageData of pages) {
    const srcPdf = pdfSources.get(pageData.sourceId) ?? pdfSources.get(fallbackSessionId);
    const imgBinary = imageSources.get(pageData.sourceId);

    if (pageData.sourceFormat === 'image' && imgBinary) {
      // Embed image as a PDF page
      const embeddedPage = await embedImageAsPage(outDoc, imgBinary, pageData);
      drawPageAnnotations(embeddedPage, pageData, annotations, fonts);

      // Embed OCR text layer if available
      if (ocrFont && ocrResults?.[pageData.id]?.status === 'completed') {
        embedOcrTextLayer(embeddedPage, ocrResults[pageData.id], ocrFont, pageData.height);
      }
    } else if (srcPdf) {
      if (pageData.originalIndex >= srcPdf.getPageCount()) continue;

      const [copiedPage] = await outDoc.copyPages(srcPdf, [pageData.originalIndex]);
      outDoc.addPage(copiedPage);
      drawPageAnnotations(copiedPage, pageData, annotations, fonts);

      // Embed OCR text layer if available
      if (ocrFont && ocrResults?.[pageData.id]?.status === 'completed') {
        embedOcrTextLayer(copiedPage, ocrResults[pageData.id], ocrFont, pageData.height);
      }
    }
    // else: skip pages with no source (blank pages etc.)
  }

  return outDoc.save();
}
