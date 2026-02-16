/**
 * Real PDF export using pdf-lib.
 * Multi-source: groups pages by sourceId, loads each binary once.
 * Handles both PDF and image sources.
 * Supports form field preservation (single-source only) or flattening.
 */

import type { Annotation } from '@/types/annotation';
import type { FormField } from '@/types/app';
import type { OcrPageResult } from '@/types/ocr';
import type { PageData } from '@/types/page';

import { loadPdfBinary } from '@/services/pdfBinaryStore';
import { exportWithFormFields } from '@/services/pdfExportFormFields';
import { exportMultiSourcePdf } from '@/services/pdfExportMultiSource';

export interface ExportOptions {
  pages: PageData[];
  annotations: Record<string, Annotation[]>;
  documentSessionId: string;
  filename: string;
  format: string;
  flatten?: boolean;
  formFields?: FormField[];
  ocrResults?: Record<string, OcrPageResult>;
}

/** Export a PDF with annotations and form field handling. */
export async function exportFlattenedPdf(options: ExportOptions): Promise<Uint8Array> {
  const { pages, annotations, documentSessionId, format, flatten = true, formFields = [], ocrResults } = options;

  // For single-source image documents (no multi-source pages), return raw binary
  if (format !== 'pdf' && pages.length === 1 && pages[0].sourceFormat === 'image') {
    const binary = await loadPdfBinary(pages[0].sourceId);
    if (binary) return binary;
    // Fallback to session id
    const fallback = await loadPdfBinary(documentSessionId);
    if (fallback) return fallback;
    throw new Error('Image binary not found in storage');
  }

  // Check if single-source PDF with form fields and preserve requested
  const sourceIds = new Set(pages.map((p) => p.sourceId));
  const isSingleSource = sourceIds.size === 1;
  const hasFormFields = formFields.length > 0;

  if (isSingleSource && hasFormFields && !flatten && format === 'pdf') {
    return exportWithFormFields(pages, annotations, formFields, documentSessionId);
  }

  return exportMultiSourcePdf(pages, annotations, documentSessionId, ocrResults);
}

/** Trigger a browser download of binary data. */
export function downloadBlob(data: Uint8Array, filename: string, mimeType: string): void {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
