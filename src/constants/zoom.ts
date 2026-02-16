export const ZOOM_MIN = 0.1;
export const ZOOM_MAX = 5.0;
export const ZOOM_STEP = 0.25;
export const ZOOM_DEFAULT = 1.0;

export function zoomIn(current: number): number {
  return Math.min(ZOOM_MAX, current + ZOOM_STEP);
}

export function zoomOut(current: number): number {
  return Math.max(ZOOM_MIN, current - ZOOM_STEP);
}

export function formatZoom(zoom: number): string {
  return `${Math.round(zoom * 100)}%`;
}
