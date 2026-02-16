import type { FormField } from '@/types/app';
import type { PageData } from '@/types/page';
import type { PDFPageProxy } from 'pdfjs-dist';

import { getDoc } from '@/services/pdfService';

export interface PdfLink {
  id: string;
  pageId: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Extract form fields from a PDF document using pdfjs-dist annotations API.
 * Maps Widget annotations (form fields) to the app's FormField interface.
 */
export async function extractFormFields(
  sourceId: string,
  pages: PageData[],
): Promise<FormField[]> {
  const doc = getDoc(sourceId);
  if (!doc) return [];

  const fields: FormField[] = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (page.sourceFormat !== 'pdf' || page.sourceId !== sourceId) continue;

    let pdfPage: PDFPageProxy;
    try {
      pdfPage = await doc.getPage(page.originalIndex + 1);
    } catch {
      continue;
    }

    const annots = await pdfPage.getAnnotations({ intent: 'display' });
    const viewport = pdfPage.getViewport({ scale: 1 });

    for (const annot of annots) {
      if (annot.subtype !== 'Widget') continue;

      const rect = annot.rect as [number, number, number, number];
      const x = rect[0];
      const y = viewport.height - rect[3];
      const width = rect[2] - rect[0];
      const height = rect[3] - rect[1];

      let type: FormField['type'] = 'text';
      if (annot.fieldType === 'Btn') {
        type = annot.checkBox ? 'checkbox' : annot.radioButton ? 'radio' : 'checkbox';
      } else if (annot.fieldType === 'Ch') {
        type = 'dropdown';
      }

      const fieldValue = annot.fieldValue != null ? String(annot.fieldValue) : '';

      fields.push({
        id: `form-${sourceId}-${i}-${annot.id ?? fields.length}`,
        pageId: page.id,
        type,
        label: annot.alternativeText || annot.fieldName || '',
        fieldName: annot.fieldName || undefined,
        x,
        y,
        width: Math.max(width, 20),
        height: Math.max(height, 14),
        value: fieldValue,
        options: annot.options?.map((o: { displayValue: string }) => o.displayValue) ?? undefined,
      });
    }
  }

  return fields;
}

/**
 * Extract clickable links from a PDF document using pdfjs-dist annotations API.
 * Maps Link annotations to the app's PdfLink interface.
 */
export async function extractPdfLinks(
  sourceId: string,
  pages: PageData[],
): Promise<PdfLink[]> {
  const doc = getDoc(sourceId);
  if (!doc) return [];

  const links: PdfLink[] = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (page.sourceFormat !== 'pdf' || page.sourceId !== sourceId) continue;

    let pdfPage: PDFPageProxy;
    try {
      pdfPage = await doc.getPage(page.originalIndex + 1);
    } catch {
      continue;
    }

    const annots = await pdfPage.getAnnotations({ intent: 'display' });
    const viewport = pdfPage.getViewport({ scale: 1 });

    for (const annot of annots) {
      if (annot.subtype !== 'Link') continue;
      // Only handle external URLs (skip internal destinations)
      const url = annot.url;
      if (!url || typeof url !== 'string') continue;

      const rect = annot.rect as [number, number, number, number];
      const x = rect[0];
      const y = viewport.height - rect[3];
      const width = rect[2] - rect[0];
      const height = rect[3] - rect[1];

      links.push({
        id: `link-${sourceId}-${i}-${links.length}`,
        pageId: page.id,
        url,
        x,
        y,
        width: Math.max(width, 5),
        height: Math.max(height, 5),
      });
    }
  }

  return links;
}
