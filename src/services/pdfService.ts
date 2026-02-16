/**
 * PDF rendering service using pdf.js v5.
 * Multi-source: maintains a cache of loaded PDFDocumentProxy keyed by sourceId.
 */

import { getDocument } from 'pdfjs-dist';

import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';

import '@/lib/pdfWorker';

/** Cache of loaded PDF documents keyed by sourceId */
const docCache = new Map<string, PDFDocumentProxy>();

/** Load a PDF from binary data into the cache. Returns page count. */
export async function loadPdf(data: Uint8Array, sourceId: string, password?: string): Promise<number> {
  // If already cached with this sourceId, destroy old first
  const existing = docCache.get(sourceId);
  if (existing) {
    await existing.destroy();
    docCache.delete(sourceId);
  }
  const doc = await getDocument({
    data: data.slice(),
    password: password || undefined,
  }).promise;
  docCache.set(sourceId, doc);
  return doc.numPages;
}

/** Get a cached document by sourceId. */
export function getDoc(sourceId: string): PDFDocumentProxy | null {
  return docCache.get(sourceId) ?? null;
}

/** Get the first cached document (backward compat). */
export function getCurrentDoc(): PDFDocumentProxy | null {
  if (docCache.size === 0) return null;
  return docCache.values().next().value ?? null;
}

/** Get page dimensions (width, height) for a 1-indexed page number. */
export async function getPageDimensions(
  pageNumber: number,
  sourceId?: string,
): Promise<{ width: number; height: number }> {
  const doc = sourceId ? getDoc(sourceId) : getCurrentDoc();
  if (!doc) throw new Error('No PDF loaded');
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  return { width: viewport.width, height: viewport.height };
}

/** Get all page dimensions at once. */
export async function getAllPageDimensions(sourceId?: string): Promise<Array<{ width: number; height: number }>> {
  const doc = sourceId ? getDoc(sourceId) : getCurrentDoc();
  if (!doc) throw new Error('No PDF loaded');
  const results: Array<{ width: number; height: number }> = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    results.push({ width: viewport.width, height: viewport.height });
  }
  return results;
}

// Track active render tasks for cancellation
const activeRenders = new Map<string, RenderTask>();

/**
 * Render a PDF page to a canvas element.
 * @param pageNumber 1-indexed page number
 * @param canvas target canvas element
 * @param scale zoom factor (1.0 = 72 DPI)
 * @param renderKey unique key for this render (for cancellation)
 * @param sourceId which PDF source to render from
 */
export async function renderPage(
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number,
  renderKey: string,
  sourceId?: string,
): Promise<void> {
  const doc = sourceId ? getDoc(sourceId) : getCurrentDoc();
  if (!doc) return;

  // Cancel previous render for this key
  const prev = activeRenders.get(renderKey);
  if (prev) {
    prev.cancel();
    activeRenders.delete(renderKey);
  }

  let page: PDFPageProxy;
  try {
    page = await doc.getPage(pageNumber);
  } catch {
    return; // Document may have been closed
  }

  const viewport = page.getViewport({ scale });
  // Set canvas dimensions to match viewport
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderTask = page.render({ canvas, viewport });
  activeRenders.set(renderKey, renderTask);

  try {
    await renderTask.promise;
  } catch (err) {
    // RenderingCancelledException is expected on cancel
    if (err instanceof Error && err.message?.includes('Rendering cancelled')) {
      return;
    }
    // Swallow other errors (doc closed during render, etc.)
  } finally {
    activeRenders.delete(renderKey);
  }
}

/**
 * Render a PDF page thumbnail to a canvas element.
 * Uses a fixed max width for consistent sidebar thumbnails.
 */
export async function renderThumbnail(
  pageNumber: number,
  canvas: HTMLCanvasElement,
  maxWidth: number,
  renderKey: string,
  sourceId?: string,
): Promise<void> {
  const doc = sourceId ? getDoc(sourceId) : getCurrentDoc();
  if (!doc) return;

  let page: PDFPageProxy;
  try {
    page = await doc.getPage(pageNumber);
  } catch {
    return;
  }

  const baseViewport = page.getViewport({ scale: 1 });
  const scale = maxWidth / baseViewport.width;
  await renderPage(pageNumber, canvas, scale, renderKey, sourceId);
}

/** Close a specific PDF source, or all if no sourceId given. */
export async function closePdf(sourceId?: string): Promise<void> {
  // Cancel all active renders
  for (const [key, task] of activeRenders) {
    task.cancel();
    activeRenders.delete(key);
  }

  if (sourceId) {
    const doc = docCache.get(sourceId);
    if (doc) {
      await doc.destroy();
      docCache.delete(sourceId);
    }
  } else {
    // Close all
    for (const [id, doc] of docCache) {
      await doc.destroy();
      docCache.delete(id);
    }
  }
}
