// Core application types

import type { PdfLink } from '@/services/pdfFormService';
import type { Annotation } from '@/types/annotation';
import type { OcrLanguage, OcrPageResult } from '@/types/ocr';
import type { PageData } from '@/types/page';

export type Tool =
  | 'selection'
  | 'rectangle'
  | 'oval'
  | 'line'
  | 'arrow'
  | 'text'
  | 'freehand'
  | 'signature'
  | 'highlight'
  | 'underline'
  | 'strikethrough'
  | 'sticky-note'
  | 'star'
  | 'polygon'
  | 'speech-balloon'
  | 'redaction'
  | 'mask'
  | 'loupe';

export type ZoomLevel = number; // 0.1 to 5.0

export interface SearchMatch {
  pageId: string;
  /** Index into the page's text boxes or native text items */
  boxIndex: number;
  /** Character offset within the text source */
  charOffset: number;
  /** Length of the match */
  length: number;
}

export interface UndoEntry {
  description: string;
  undo: () => void;
  redo: () => void;
}

export interface AppState {
  // Document state
  isDocumentOpen: boolean;
  isDocumentLoading: boolean;
  documentSessionId: string | null;
  filename: string | null;
  format: string | null;
  pages: PageData[];
  currentPageIndex: number;
  selectedPageIndices: number[];

  // Print state
  isPrintMode: boolean;

  // View state
  zoom: ZoomLevel;
  activeTool: Tool;

  // UI state
  isSidebarVisible: boolean;
  isFullscreen: boolean;

  // Search state
  isSearchBarVisible: boolean;
  searchQuery: string;
  isCaseSensitive: boolean;
  searchMatchIndex: number;
  searchMatchTotal: number;
  searchMatches: SearchMatch[];

  // Dialog state
  isGoToPageDialogOpen: boolean;
  isExportDialogOpen: boolean;
  isResizeDialogOpen: boolean;
  isInspectorDialogOpen: boolean;
  isSignaturePadOpen: boolean;
  isPasswordDialogOpen: boolean;
  isOcrDialogOpen: boolean;
  isDeletePageDialogOpen: boolean;
  isAboutDialogOpen: boolean;
  isTetrisDialogOpen: boolean;
  isPagePickerDialogOpen: boolean;
  isCropMode: boolean;

  // Annotation state — keyed by page ID (string)
  annotations: Record<string, Annotation[]>;
  selectedAnnotationId: string | null;
  selectedAnnotationIds: string[];

  // Undo/Redo
  undoStack: UndoEntry[];
  redoStack: UndoEntry[];

  // Clipboard
  clipboard: Annotation[] | null;

  // View state (Tier 2)
  viewMode: 'single' | 'contact-sheet';
  isSketchRecognitionEnabled: boolean;

  // Mask / Loupe state
  maskRect: { x: number; y: number; width: number; height: number } | null;
  loupePosition: { x: number; y: number } | null;
  loupeMagnification: number;

  // Color adjustment state
  colorAdjustment: ColorAdjustment;
  isColorAdjustmentPanelOpen: boolean;

  // Crop overlay state
  cropRect: { x: number; y: number; width: number; height: number } | null;

  // Form state
  formFields: FormField[];
  isFormMode: boolean;

  // PDF links
  pdfLinks: PdfLink[];

  // Batch operation progress (0-100 or null when not running)
  batchProgress: number | null;

  // OCR state
  ocrResults: Record<string, OcrPageResult>; // keyed by pageId
  ocrLanguage: OcrLanguage;
  isOcrProcessing: boolean;
  ocrProgress: { current: number; total: number } | null;

  /** Cached native PDF text content keyed by pageId */
  nativeText: Record<string, string>;
}

export interface FormField {
  id: string;
  pageId: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown';
  label: string;
  fieldName?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  options?: string[];
  group?: string;
}

export interface ColorAdjustment {
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  saturation: number;
  temperature: number;
  tint: number;
  sharpness: number;
  sepia: number;
}

