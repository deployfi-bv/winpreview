// Serializable checkpoint for IndexedDB persistence

import type { Annotation } from '@/types/annotation';
import type { ColorAdjustment, FormField } from '@/types/app';
import type { OcrLanguage, OcrPageResult } from '@/types/ocr';
import type { PageData } from '@/types/page';

/** Version tag for schema migrations */
export const CHECKPOINT_VERSION = 2;

/** Serializable subset of AppState — user-meaningful edits only */
export interface DocumentCheckpoint {
  id: string;
  version: number;
  timestamp: number;

  // Document identity
  documentSessionId: string;
  filename: string;
  format: string;

  // Pages (order, rotation, flip, dimensions)
  pages: PageData[];
  currentPageIndex: number;

  // Annotations keyed by page ID
  annotations: Record<string, Annotation[]>;

  // Color adjustments
  colorAdjustment: ColorAdjustment;

  // Form state
  formFields: FormField[];
  isFormMode: boolean;

  // View state worth preserving
  zoom: number;

  // OCR results (preserved to avoid re-recognition)
  ocrResults?: Record<string, OcrPageResult>;
  ocrLanguage?: OcrLanguage;
}
