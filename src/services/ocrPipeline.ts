/**
 * OCR pipeline service.
 * High-level coordination of detection → recognition for a page.
 */

import { cleanupOcrResult } from '@/lib/ocrCleanup';
import { assembleText } from '@/lib/ocrTextAssembly';

import type { OcrLanguage, OcrPageResult } from '@/types/ocr';
import type { PageData } from '@/types/page';

import { runDetection } from '@/services/ocrDetectionPipeline';
import { ensureModelsLoaded } from '@/services/ocrModelLoader';
import { renderPageToImageData } from '@/services/ocrPreprocess';
import { detectLanguage, runRecognition } from '@/services/ocrRecognitionPipeline';

/**
 * Run the full OCR pipeline on a single page.
 */
export async function recognizePage(page: PageData, language: OcrLanguage): Promise<OcrPageResult> {
  try {
    // 1. Ensure models loaded
    await ensureModelsLoaded(language);

    // 2. Render page to ImageData
    const imageData = await renderPageToImageData(page);

    // 3. Run detection
    const boxes = await runDetection(imageData);

    // 4. Run recognition on each box
    const textBoxes = await runRecognition(imageData, boxes, language);

    // 5. Build result
    const plainText = assembleText(textBoxes);

    // 5a. Auto-detect language — if result looks wrong, retry with detected language
    if (plainText.length > 5) {
      const detectedLang = detectLanguage(plainText);
      if (detectedLang !== language) {
        // Re-run recognition with detected language
        await ensureModelsLoaded(detectedLang);
        const retryBoxes = await runRecognition(imageData, boxes, detectedLang);
        const retryText = assembleText(retryBoxes);
        const retryResult: OcrPageResult = {
          pageId: page.id,
          language: detectedLang,
          textBoxes: retryBoxes,
          plainText: retryText,
          wordCount: retryText.split(/\s+/).filter((w) => w.length > 0).length,
          timestamp: Date.now(),
          status: 'completed',
        };
        return cleanupOcrResult(retryResult);
      }
    }

    const result: OcrPageResult = {
      pageId: page.id,
      language,
      textBoxes,
      plainText,
      wordCount: plainText.split(/\s+/).filter((w) => w.length > 0).length,
      timestamp: Date.now(),
      status: 'completed',
    };

    // 6. Apply cleanup heuristics
    return cleanupOcrResult(result);
  } catch (err) {
    // Return error result
    return {
      pageId: page.id,
      language,
      textBoxes: [],
      plainText: '',
      wordCount: 0,
      timestamp: Date.now(),
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
