// Per-page data for document page operations

export type SourceFormat = 'pdf' | 'image';

export interface PageData {
  id: string;
  originalIndex: number;
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
  width: number;
  height: number;
  /** Which binary source this page comes from (key into IndexedDB / service caches) */
  sourceId: string;
  /** Format of the source binary */
  sourceFormat: SourceFormat;
}

/** Default PDF page size: US Letter at 72 DPI */
export const DEFAULT_PAGE_WIDTH = 612;
export const DEFAULT_PAGE_HEIGHT = 792;

export interface CreatePageOptions {
  originalIndex: number;
  width?: number;
  height?: number;
  sourceId: string;
  sourceFormat: SourceFormat;
}

export function createPage(opts: CreatePageOptions): PageData {
  const { originalIndex, width = DEFAULT_PAGE_WIDTH, height = DEFAULT_PAGE_HEIGHT, sourceId, sourceFormat } = opts;
  return {
    id: `page-${originalIndex}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    originalIndex,
    rotation: 0,
    flipH: false,
    flipV: false,
    width,
    height,
    sourceId,
    sourceFormat,
  };
}
