/**
 * OCR text assembly with spatial analysis.
 * Converts text boxes into readable text with proper spacing and line breaks.
 */

import type { OcrTextBox } from '@/types/ocr';

/**
 * Assemble OCR text boxes into readable text with proper spacing.
 * Sorts boxes spatially (top-to-bottom, left-to-right),
 * groups into lines, and inserts spaces/newlines based on position.
 */
export function assembleText(boxes: OcrTextBox[]): string {
  if (boxes.length === 0) return '';

  // Sort by Y (top-to-bottom), then X (left-to-right)
  const sorted = [...boxes].sort((a, b) => {
    const dy = a.bbox.y - b.bbox.y;
    // Same line if Y difference < half the average height
    const avgH = (a.bbox.height + b.bbox.height) / 2;
    if (Math.abs(dy) < avgH * 0.5) {
      return a.bbox.x - b.bbox.x;
    }
    return dy;
  });

  // Group into lines (boxes with similar Y)
  const lines: OcrTextBox[][] = [];
  let currentLine: OcrTextBox[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = currentLine[0];
    const curr = sorted[i];
    const avgH = (prev.bbox.height + curr.bbox.height) / 2;

    if (Math.abs(curr.bbox.y - prev.bbox.y) < avgH * 0.5) {
      // Same line
      currentLine.push(curr);
    } else {
      // New line
      lines.push(currentLine);
      currentLine = [curr];
    }
  }
  lines.push(currentLine);

  // Build text: join boxes within a line with spaces, lines with newlines
  return lines
    .map((line) => {
      // Sort line boxes by X
      line.sort((a, b) => a.bbox.x - b.bbox.x);
      return line.map((box) => box.text).join(' ');
    })
    .join('\n');
}
