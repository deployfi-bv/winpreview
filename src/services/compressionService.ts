/**
 * PDF page compression service for export optimization.
 * Downscales and JPEG-compresses pages to target file sizes.
 */

import type { PageData } from '@/types/page';

export type CompressionPresetName = 'email' | 'compact' | 'light';

export interface CompressionPreset {
  name: CompressionPresetName;
  targetKbPerPage: number;
  maxDimension: number;
  qualityRange: [number, number];
}

export const PRESETS: Record<CompressionPresetName, CompressionPreset> = {
  email: { name: 'email', targetKbPerPage: 200, maxDimension: 1600, qualityRange: [0.55, 0.85] },
  compact: { name: 'compact', targetKbPerPage: 100, maxDimension: 1200, qualityRange: [0.4, 0.75] },
  light: { name: 'light', targetKbPerPage: 150, maxDimension: 1800, qualityRange: [0.5, 0.8] },
};

export interface CompressedPageResult {
  binary: Uint8Array;
  fileSizeKb: number;
  objectUrl: string;
}

export async function compressPage(
  page: PageData,
  preset: CompressionPreset,
  signal?: AbortSignal,
): Promise<CompressedPageResult> {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context');

  // Render page to canvas
  if (page.sourceFormat === 'pdf') {
    const { renderPage } = await import('@/services/pdfService');
    await renderPage(page.originalIndex + 1, canvas, 1.0, `compress-${page.id}`, page.sourceId);
  } else if (page.sourceFormat === 'image') {
    const { getImageUrl } = await import('@/services/imageService');
    const url = getImageUrl(page.sourceId);
    if (!url) throw new Error(`No image URL for sourceId ${page.sourceId}`);
    await loadImageToCanvas(url, canvas, page.width, page.height);
  } else {
    throw new Error(`Unsupported source format: ${page.sourceFormat}`);
  }

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  // Downscale if needed
  const scale = calculateDownscale(canvas.width, canvas.height, preset.maxDimension);
  let targetCanvas = canvas;
  if (scale < 1) {
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = Math.round(canvas.width * scale);
    scaledCanvas.height = Math.round(canvas.height * scale);
    const scaledCtx = scaledCanvas.getContext('2d');
    if (!scaledCtx) throw new Error('Failed to create scaled canvas context');
    scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
    targetCanvas = scaledCanvas;
  }

  // Binary search on JPEG quality to hit target size
  const [minQuality, maxQuality] = preset.qualityRange;
  let quality = (minQuality + maxQuality) / 2;
  let bestBlob: Blob | null = null;
  let bestDelta = Infinity;

  for (let i = 0; i < 8; i++) {
    const blob = await canvasToBlob(targetCanvas, 'image/jpeg', quality);
    const sizeKb = blob.size / 1024;
    const delta = Math.abs(sizeKb - preset.targetKbPerPage);

    if (delta < bestDelta) {
      bestBlob = blob;
      bestDelta = delta;
    }

    // Within ±15% of target
    if (sizeKb >= preset.targetKbPerPage * 0.85 && sizeKb <= preset.targetKbPerPage * 1.15) {
      break;
    }

    // Adjust quality for next iteration
    if (sizeKb > preset.targetKbPerPage) {
      const remaining = quality - minQuality;
      quality = Math.max(minQuality, quality - remaining / 2);
    } else {
      const remaining = maxQuality - quality;
      quality = Math.min(maxQuality, quality + remaining / 2);
    }
  }

  if (!bestBlob) {
    throw new Error('Failed to compress page: no valid blob produced');
  }

  const binary = new Uint8Array(await bestBlob.arrayBuffer());
  const objectUrl = URL.createObjectURL(bestBlob);

  return {
    binary,
    fileSizeKb: bestBlob.size / 1024,
    objectUrl,
  };
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      type,
      quality,
    );
  });
}

export function calculateDownscale(width: number, height: number, maxDimension: number): number {
  return Math.min(1, maxDimension / Math.max(width, height));
}

function loadImageToCanvas(url: string, canvas: HTMLCanvasElement, width: number, height: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve();
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}
