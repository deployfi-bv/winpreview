/**
 * Shared helpers for PDF export: image embedding, font embedding, annotation drawing.
 */

import { degrees,StandardFonts } from 'pdf-lib';

import { drawAnnotation } from '@/lib/annotationExport';

import type { ExportFonts } from '@/lib/annotationExport';
import type { Annotation } from '@/types/annotation';
import type { PageData } from '@/types/page';
import type { PDFDocument} from 'pdf-lib';

/** Convert non-PNG/JPG image bytes (e.g. WebP, GIF, BMP) to PNG via canvas. */
async function convertToPng(imageBytes: Uint8Array): Promise<Uint8Array> {
  const blob = new Blob([imageBytes as BlobPart]);
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to decode image for PDF embedding'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const pngBlob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas toBlob failed')), 'image/png'),
    );
    return new Uint8Array(await pngBlob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Embed an image (PNG, JPG, or any browser-supported format) as a full-bleed PDF page. */
export async function embedImageAsPage(
  outDoc: PDFDocument,
  imageBytes: Uint8Array,
  pageData: PageData,
) {
  const isPng = imageBytes[0] === 0x89 && imageBytes[1] === 0x50;
  const isJpg = imageBytes[0] === 0xFF && imageBytes[1] === 0xD8;

  let image;
  if (isPng) {
    image = await outDoc.embedPng(imageBytes);
  } else if (isJpg) {
    image = await outDoc.embedJpg(imageBytes);
  } else {
    // WebP, GIF, BMP, TIFF etc. — convert to PNG via canvas
    const pngBytes = await convertToPng(imageBytes);
    image = await outDoc.embedPng(pngBytes);
  }

  const page = outDoc.addPage([pageData.width, pageData.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: pageData.width,
    height: pageData.height,
  });

  return page;
}

/** Pre-embed fonts needed for annotation export. */
export async function embedExportFonts(
  doc: PDFDocument,
  annotations: Record<string, Annotation[]>,
): Promise<ExportFonts> {
  const allAnns = Object.values(annotations).flat();
  const needsMonospace = allAnns.some(
    (a) => a.type === 'text' && 'alignment' in a && (a as { alignment: string }).alignment === 'monospace',
  );
  if (!needsMonospace) return {};
  return { monospace: await doc.embedFont(StandardFonts.Courier) };
}

/** Draw all annotations for a single page, respecting z-order and rotation. */
export function drawPageAnnotations(
  page: ReturnType<PDFDocument['addPage']>,
  pageData: PageData,
  annotations: Record<string, Annotation[]>,
  fonts?: ExportFonts,
): void {
  const { height } = page.getSize();
  const pageAnnotations = annotations[pageData.id] ?? [];
  const sorted = [...pageAnnotations].sort((a, b) => a.zIndex - b.zIndex);
  for (const ann of sorted) {
    drawAnnotation(page, ann, height, fonts);
  }

  // Handle rotation
  if (pageData.rotation !== 0) {
    page.setRotation(degrees(pageData.rotation));
  }
}
