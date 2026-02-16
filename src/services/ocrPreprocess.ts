/**
 * OCR preprocessing service.
 * Converts page canvas to ONNX-compatible tensor input for detection and recognition.
 */

import type { PageData } from '@/types/page';

import { getImageUrl } from '@/services/imageService';
import { renderPage } from '@/services/pdfService';

/** Render a page to ImageData for OCR processing. */
export async function renderPageToImageData(page: PageData): Promise<ImageData> {
  const canvas = document.createElement('canvas');
  canvas.width = page.width;
  canvas.height = page.height;

  if (page.sourceFormat === 'pdf') {
    await renderPage(page.originalIndex + 1, canvas, 1, `ocr-${page.id}`, page.sourceId);
  } else {
    const url = getImageUrl(page.sourceId);
    if (!url) throw new Error('Image source not loaded');
    const img = new Image();
    img.src = url;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, page.width, page.height);
  }

  const ctx = canvas.getContext('2d')!;
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/** Convert ImageData to Float32Array in NCHW format for ONNX detection model. */
export function preprocessForDetection(imageData: ImageData): {
  data: Float32Array;
  dims: [number, number, number, number]; // [1, 3, H, W]
  scaleX: number; // for converting back to original coords
  scaleY: number;
} {
  // Resize to nearest multiple of 32 (required by PaddleOCR det)
  const targetH = Math.ceil(imageData.height / 32) * 32;
  const targetW = Math.ceil(imageData.width / 32) * 32;

  // Limit max size to prevent OOM (max 960 in longest side)
  const maxSize = 960;
  let h = targetH;
  let w = targetW;
  if (Math.max(h, w) > maxSize) {
    const ratio = maxSize / Math.max(h, w);
    h = Math.ceil((h * ratio) / 32) * 32;
    w = Math.ceil((w * ratio) / 32) * 32;
  }

  // Resize using offscreen canvas
  const resized = resizeImageData(imageData, w, h);

  // Convert to NCHW Float32 [1, 3, H, W], normalized [0, 1]
  const float32 = new Float32Array(3 * h * w);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      float32[0 * h * w + y * w + x] = resized[idx] / 255; // R
      float32[1 * h * w + y * w + x] = resized[idx + 1] / 255; // G
      float32[2 * h * w + y * w + x] = resized[idx + 2] / 255; // B
    }
  }

  return {
    data: float32,
    dims: [1, 3, h, w],
    scaleX: imageData.width / w,
    scaleY: imageData.height / h,
  };
}

/** Preprocess a cropped text region for recognition model. */
export function preprocessForRecognition(imageData: ImageData): {
  data: Float32Array;
  dims: [number, number, number, number];
} {
  const targetH = 48;
  const ratio = targetH / imageData.height;
  const targetW = Math.max(1, Math.round(imageData.width * ratio));
  // PaddleOCR rec expects width padded to at least 320
  const paddedW = Math.max(320, targetW);

  const resized = resizeImageData(imageData, paddedW, targetH);

  const float32 = new Float32Array(3 * targetH * paddedW);
  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < paddedW; x++) {
      const idx = (y * paddedW + x) * 4;
      // Normalize to [-1, 1] (PaddleOCR rec normalization)
      float32[0 * targetH * paddedW + y * paddedW + x] = (resized[idx] / 255) * 2 - 1;
      float32[1 * targetH * paddedW + y * paddedW + x] = (resized[idx + 1] / 255) * 2 - 1;
      float32[2 * targetH * paddedW + y * paddedW + x] = (resized[idx + 2] / 255) * 2 - 1;
    }
  }

  return { data: float32, dims: [1, 3, targetH, paddedW] };
}

/** Crop a rectangular region from ImageData. */
export function cropImageData(
  source: ImageData,
  box: { x: number; y: number; width: number; height: number },
): ImageData {
  const sx = Math.max(0, Math.floor(box.x));
  const sy = Math.max(0, Math.floor(box.y));
  const sw = Math.min(Math.ceil(box.width), source.width - sx);
  const sh = Math.min(Math.ceil(box.height), source.height - sy);

  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  canvas.getContext('2d')!.putImageData(source, 0, 0);

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = sw;
  cropCanvas.height = sh;
  cropCanvas.getContext('2d')!.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  return cropCanvas.getContext('2d')!.getImageData(0, 0, sw, sh);
}

/** Helper: resize ImageData using an offscreen canvas */
function resizeImageData(source: ImageData, targetW: number, targetH: number): Uint8ClampedArray {
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = source.width;
  srcCanvas.height = source.height;
  srcCanvas.getContext('2d')!.putImageData(source, 0, 0);

  const dstCanvas = document.createElement('canvas');
  dstCanvas.width = targetW;
  dstCanvas.height = targetH;
  const dstCtx = dstCanvas.getContext('2d')!;
  dstCtx.drawImage(srcCanvas, 0, 0, targetW, targetH);
  return dstCtx.getImageData(0, 0, targetW, targetH).data;
}
