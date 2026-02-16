/**
 * Image loading service for JPG/PNG/etc. documents.
 * Multi-source: maintains a cache of object URLs keyed by sourceId.
 */

/** Cache of image object URLs keyed by sourceId */
const imageCache = new Map<string, string>();

/** Load an image from binary data and return dimensions + object URL. */
export async function loadImage(
  data: Uint8Array,
  mimeType: string,
): Promise<{ width: number; height: number; objectUrl: string }> {
  if (!data || data.byteLength === 0) {
    throw new Error('Image data is empty');
  }

  // Copy into a fresh ArrayBuffer to satisfy TS 5.9 strict BlobPart typing
  const copy = new Uint8Array(data);
  const blob = new Blob([copy as unknown as BlobPart], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight, objectUrl });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to decode image (${mimeType}, ${data.byteLength} bytes)`));
    };
    img.src = objectUrl;
  });
}

/** Render an image from object URL to a canvas at a given scale. */
export function renderImageToCanvas(
  objectUrl: string,
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  scale: number,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = width * scale;
  canvas.height = height * scale;

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.src = objectUrl;
}

/** Store an image URL in the multi-source cache. */
export function setImageUrl(sourceId: string, url: string): void {
  const existing = imageCache.get(sourceId);
  if (existing) {
    URL.revokeObjectURL(existing);
  }
  imageCache.set(sourceId, url);
}

/** Get an image URL from cache by sourceId. */
export function getImageUrl(sourceId: string): string | null {
  return imageCache.get(sourceId) ?? null;
}

/** Clear a specific image source, or all if no sourceId given. */
export function clearImage(sourceId?: string): void {
  if (sourceId) {
    const url = imageCache.get(sourceId);
    if (url) {
      URL.revokeObjectURL(url);
      imageCache.delete(sourceId);
    }
  } else {
    for (const [, url] of imageCache) {
      URL.revokeObjectURL(url);
    }
    imageCache.clear();
  }
}

// Legacy compat aliases
export function setCurrentImageUrl(url: string | null): void {
  if (url === null) {
    clearImage();
  }
  // For legacy single-source usage, callers should use setImageUrl(sourceId, url) instead
}

export function getCurrentImageUrl(): string | null {
  if (imageCache.size === 0) return null;
  return imageCache.values().next().value ?? null;
}

/** Get MIME type from file extension. */
export function getMimeType(ext: string): string {
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    webp: 'image/webp',
  };
  return mimeMap[ext.toLowerCase()] ?? 'image/png';
}
