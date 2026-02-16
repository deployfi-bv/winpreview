// OCR text cleanup heuristics: fix common OCR errors and low-confidence detection

import type { OcrPageResult, OcrTextBox } from '@/types/ocr';

/** Fix common OCR character substitution errors. */
export function fixCommonSubstitutions(text: string): string {
  let result = text;

  // Fix 0 → O when surrounded by letters (word context)
  result = result.replace(/([a-zA-Z])0([a-zA-Z])/g, '$1O$2');

  // Fix lowercase l → 1 when surrounded by digits
  result = result.replace(/(\d)l(\d)/g, '$11$2');

  // Fix | (pipe) → l when in word context
  result = result.replace(/([a-zA-Z])\|([a-zA-Z])/g, '$1l$2');

  // Fix rn → m in common word patterns
  result = result.replace(/\brn\b/g, 'm'); // standalone "rn" → "m"
  result = result.replace(/([a-zA-Z])rn([a-zA-Z])/g, (match, before, after) => {
    // Only apply if it creates a plausible pattern
    const testWord = before + 'm' + after;
    // Common patterns where rn → m makes sense
    if (/^[a-z]m[aeiour]/.test(testWord)) return before + 'm' + after;
    return match;
  });

  return result;
}

/** Fix broken URL patterns from OCR. */
export function fixUrlPatterns(text: string): string {
  let result = text;

  // Fix protocol errors
  result = result.replace(/\bhtp:\/\//gi, 'http://');
  result = result.replace(/\bhtps:\/\//gi, 'https://');
  result = result.replace(/\bnttps:\/\//gi, 'https://');

  // Fix www prefix
  result = result.replace(/\bww\./gi, 'www.');

  // Fix spaces within URLs (between protocol and domain)
  result = result.replace(/(https?:\/\/)\s+/gi, '$1');
  result = result.replace(/(https?:\/\/[^\s]+)\s+\./g, '$1.');
  result = result.replace(/\.\s+([a-z]{2,})\b/gi, '.$1');

  // Fix common domain TLD OCR errors
  result = result.replace(/\.corn\b/gi, '.com');
  result = result.replace(/\.coni\b/gi, '.com');
  result = result.replace(/\.orq\b/gi, '.org');
  result = result.replace(/\.nef\b/gi, '.net');

  return result;
}

/** Flag low-confidence text boxes for review. */
export function flagLowConfidence(textBoxes: OcrTextBox[], threshold = 0.7): OcrTextBox[] {
  return textBoxes.filter((box) => box.confidence < threshold);
}

/** Apply all cleanup heuristics to an OCR result. */
export function cleanupOcrResult(result: OcrPageResult): OcrPageResult {
  // Apply cleanup to each text box (immutable)
  const cleanedBoxes: OcrTextBox[] = result.textBoxes.map((box) => {
    let cleanedText = box.text;
    cleanedText = fixCommonSubstitutions(cleanedText);
    cleanedText = fixUrlPatterns(cleanedText);

    return {
      ...box,
      text: cleanedText,
    };
  });

  // Rebuild plainText from cleaned boxes
  const plainText = cleanedBoxes.map((box) => box.text).join(' ');

  // Recalculate word count
  const wordCount = plainText
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return {
    ...result,
    textBoxes: cleanedBoxes,
    plainText,
    wordCount,
  };
}
