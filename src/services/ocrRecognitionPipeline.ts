/**
 * OCR text recognition pipeline.
 * Runs PaddleOCR recognition model on detected text boxes.
 */

import type { DetectionBox } from '@/services/ocrDetectionPipeline';
import type { OcrLanguage, OcrTextBox } from '@/types/ocr';

import { getDictionary, getRecognitionSession } from '@/services/ocrModelLoader';
import { cropImageData, preprocessForRecognition } from '@/services/ocrPreprocess';

/**
 * Run recognition on detected text boxes.
 */
export async function runRecognition(
  imageData: ImageData,
  boxes: DetectionBox[],
  language: OcrLanguage,
): Promise<OcrTextBox[]> {
  if (boxes.length === 0) return [];

  const session = getRecognitionSession(language);
  const dictionary = getDictionary(language);
  const ort = await import('onnxruntime-web');
  const results: OcrTextBox[] = [];

  for (const box of boxes) {
    // Crop region from image
    const cropped = cropImageData(imageData, box);
    const { data, dims } = preprocessForRecognition(cropped);

    const inputTensor = new ort.Tensor('float32', data, dims);
    const feeds = { x: inputTensor };
    const output = await session.run(feeds);

    // Decode CTC output
    const outputTensor = output[Object.keys(output)[0]];
    const tensorData = {
      data: outputTensor.data as Float32Array,
      dims: outputTensor.dims as number[],
    };
    const { text, confidence } = decodeCTC(tensorData, dictionary);

    if (text.trim()) {
      results.push({
        text,
        confidence,
        bbox: { x: box.x, y: box.y, width: box.width, height: box.height },
      });
    }
  }

  return results;
}

/**
 * CTC greedy decoding.
 */
function decodeCTC(
  tensor: { data: Float32Array | Int32Array; dims: readonly number[] },
  dictionary: string[],
): { text: string; confidence: number } {
  const data = tensor.data as Float32Array;
  const [, seqLen, numClasses] = tensor.dims;

  let text = '';
  let totalConf = 0;
  let numChars = 0;
  let lastIdx = -1;

  for (let t = 0; t < seqLen; t++) {
    // Find argmax
    let maxVal = -Infinity;
    let maxIdx = 0;
    for (let c = 0; c < numClasses; c++) {
      const val = data[t * numClasses + c];
      if (val > maxVal) {
        maxVal = val;
        maxIdx = c;
      }
    }

    // Skip blank (index 0) and repeated characters
    if (maxIdx !== 0 && maxIdx !== lastIdx) {
      const charIdx = maxIdx - 1; // dict is 0-indexed, model uses 1-indexed (0=blank)
      if (charIdx >= 0 && charIdx < dictionary.length) {
        text += dictionary[charIdx];
        totalConf += Math.exp(maxVal); // softmax approximation
        numChars++;
      }
    }
    lastIdx = maxIdx;
  }

  return {
    text,
    confidence: numChars > 0 ? totalConf / numChars : 0,
  };
}

/**
 * Detect language by checking for Cyrillic characters.
 */
export function detectLanguage(text: string): OcrLanguage {
  const cyrillicCount = (text.match(/[\u0400-\u04FF]/g) ?? []).length;
  const latinCount = (text.match(/[a-zA-Z]/g) ?? []).length;
  return cyrillicCount > latinCount * 0.3 ? 'eslav' : 'latin';
}
