/**
 * Single-source PDF export with form field preservation.
 */

import { PDFDocument } from 'pdf-lib';

import type { Annotation } from '@/types/annotation';
import type { FormField } from '@/types/app';
import type { PageData } from '@/types/page';

import { loadPdfBinary } from '@/services/pdfBinaryStore';
import { drawPageAnnotations, embedExportFonts } from '@/services/pdfExportHelpers';

/** Export single-source PDF preserving form fields. */
export async function exportWithFormFields(
  pages: PageData[],
  annotations: Record<string, Annotation[]>,
  formFields: FormField[],
  fallbackSessionId: string,
): Promise<Uint8Array> {
  const sourceId = pages[0].sourceId;
  const binary = await loadPdfBinary(sourceId) ?? await loadPdfBinary(fallbackSessionId);
  if (!binary) throw new Error('PDF binary not found');

  const pdfDoc = await PDFDocument.load(binary);

  try {
    const form = pdfDoc.getForm();

    // Set field values from state
    for (const field of formFields) {
      if (!field.fieldName) continue;
      try {
        if (field.type === 'text' || field.type === 'dropdown') {
          const pdfField = form.getTextField(field.fieldName);
          pdfField.setText(field.value);
        } else if (field.type === 'checkbox') {
          const pdfField = form.getCheckBox(field.fieldName);
          if (field.value === 'true') {
            pdfField.check();
          } else {
            pdfField.uncheck();
          }
        }
      } catch {
        // Field not found or type mismatch — skip
      }
    }
  } catch {
    // No form in document — proceed without
  }

  // Pre-embed monospace font if any text annotation uses it
  const fonts = await embedExportFonts(pdfDoc, annotations);

  // Draw annotations on pages
  for (const pageData of pages) {
    if (pageData.originalIndex >= pdfDoc.getPageCount()) continue;
    const page = pdfDoc.getPage(pageData.originalIndex);
    drawPageAnnotations(page, pageData, annotations, fonts);
  }

  return pdfDoc.save();
}
