// OCR type definitions

/** OCR language model identifier */
export type OcrLanguage = 'latin' | 'eslav';

/** Bounding box for a recognized text region (in page coordinates) */
export interface OcrTextBox {
  text: string;
  confidence: number; // 0.0–1.0
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/** Processing status of OCR for a single page */
export type OcrStatus = 'pending' | 'processing' | 'completed' | 'error';

/** OCR result for a single page */
export interface OcrPageResult {
  pageId: string;
  language: OcrLanguage;
  textBoxes: OcrTextBox[];
  plainText: string; // concatenated text for search
  wordCount: number;
  timestamp: number;
  status: OcrStatus;
  error?: string;
}
