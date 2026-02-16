// Zoom calculation utilities for document view

import { ZOOM_MAX,ZOOM_MIN } from '@/constants/zoom';

import { DEFAULT_PAGE_HEIGHT,DEFAULT_PAGE_WIDTH } from '@/types/page';

/** @deprecated Use page.width/height directly. Kept for backward compat. */
export const PAGE_WIDTH = DEFAULT_PAGE_WIDTH;
/** @deprecated Use page.width/height directly. Kept for backward compat. */
export const PAGE_HEIGHT = DEFAULT_PAGE_HEIGHT;

const CANVAS_PADDING = 48; // px padding on each side

export function clampZoom(zoom: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(zoom * 100) / 100));
}

export function calculateFitWidth(viewportWidth: number, pageWidth = DEFAULT_PAGE_WIDTH): number {
  const available = viewportWidth - CANVAS_PADDING * 2;
  return clampZoom(available / pageWidth);
}

export function calculateFitPage(
  viewportWidth: number,
  viewportHeight: number,
  pageWidth = DEFAULT_PAGE_WIDTH,
  pageHeight = DEFAULT_PAGE_HEIGHT,
): number {
  const availableW = viewportWidth - CANVAS_PADDING * 2;
  const availableH = viewportHeight - CANVAS_PADDING * 2;
  const zoomW = availableW / pageWidth;
  const zoomH = availableH / pageHeight;
  return clampZoom(Math.min(zoomW, zoomH));
}
