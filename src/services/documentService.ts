/**
 * Document service — async operations for save, export, and print.
 */

import type { ExportOptions } from '@/services/pdfExportService';

import { exportAsImage } from '@/services/imageExportService';
import { downloadBlob,exportFlattenedPdf } from '@/services/pdfExportService';

export interface SaveResult {
  success: boolean;
  timestamp: number;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  format: string;
  sizeBytes: number;
}

/** Save document (checkpoint is handled by persistence hook). */
export async function saveDocument(): Promise<SaveResult> {
  // Save is handled by the persistence hook; this just confirms success
  return { success: true, timestamp: Date.now() };
}

/** Export document to PDF or image format. */
export async function exportDocument(
  options: ExportOptions,
): Promise<ExportResult> {
  const { format, filename, pages, annotations } = options;

  // Handle image export (JPEG/PNG)
  if (format === 'jpeg' || format === 'png') {
    const blob = await exportAsImage(pages, annotations, format);
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const outputFilename = filename.replace(/\.[^.]+$/, `_exported.${ext}`);
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

    // Convert blob to Uint8Array for downloadBlob
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    downloadBlob(uint8Array, outputFilename, mimeType);

    return {
      success: true,
      filename: outputFilename,
      format,
      sizeBytes: uint8Array.length,
    };
  }

  // Handle PDF export
  const pdfBytes = await exportFlattenedPdf(options);
  const outputFilename = filename.replace(/\.[^.]+$/, '_exported.pdf');
  downloadBlob(pdfBytes, outputFilename, 'application/pdf');

  return {
    success: true,
    filename: outputFilename,
    format: 'pdf',
    sizeBytes: pdfBytes.length,
  };
}
