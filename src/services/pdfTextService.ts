/**
 * PDF text content extraction service.
 * Extracts native text from PDF pages using pdf.js text content API.
 */

import { getCurrentDoc,getDoc } from '@/services/pdfService';

export interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Merge adjacent native text items into words/phrases based on spatial proximity.
 * Groups items into lines by Y position, then merges horizontally-adjacent items.
 */
function mergeNativeTextItems(items: PdfTextItem[]): PdfTextItem[] {
  if (items.length === 0) return [];
  if (items.length === 1) return items;

  // Calculate average font size for gap thresholds
  const avgFontSize = items.reduce((sum, item) => sum + item.height, 0) / items.length;

  // Sort by Y (top-to-bottom), then X (left-to-right)
  const sorted = [...items].sort((a, b) => {
    const dy = a.y - b.y;
    // Same line if Y difference < half the average height
    if (Math.abs(dy) < avgFontSize * 0.5) {
      return a.x - b.x;
    }
    return dy;
  });

  // Group into lines (items with similar Y)
  const lines: PdfTextItem[][] = [];
  let currentLine: PdfTextItem[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = currentLine[0];
    const curr = sorted[i];

    if (Math.abs(curr.y - prev.y) < avgFontSize * 0.5) {
      // Same line
      currentLine.push(curr);
    } else {
      // New line
      lines.push(currentLine);
      currentLine = [curr];
    }
  }
  lines.push(currentLine);

  // Merge items within each line based on horizontal proximity
  const merged: PdfTextItem[] = [];

  for (const line of lines) {
    if (line.length === 0) continue;

    // Sort line items by X
    line.sort((a, b) => a.x - b.x);

    let current = { ...line[0] };

    for (let i = 1; i < line.length; i++) {
      const next = line[i];
      const gap = next.x - (current.x + current.width);

      // Merge if gap is small (same word or space between words)
      if (gap < avgFontSize * 0.3) {
        // Same word: concatenate without space
        current.str += next.str;
        current.width = next.x + next.width - current.x;
      } else if (gap < avgFontSize * 1.5) {
        // Space between words: insert space
        current.str += ' ' + next.str;
        current.width = next.x + next.width - current.x;
      } else {
        // Large gap: separate item (different column/section)
        merged.push(current);
        current = { ...next };
      }
    }

    merged.push(current);
  }

  return merged;
}

/** Extract text content items with positions from a PDF page. */
export async function getPageTextContent(
  pageNumber: number,
  sourceId?: string,
): Promise<PdfTextItem[]> {
  const doc = sourceId ? getDoc(sourceId) : getCurrentDoc();
  if (!doc) return [];
  try {
    const page = await doc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();
    const items: PdfTextItem[] = [];
    for (const item of textContent.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const tx = item.transform;
      // transform: [scaleX, skewX, skewY, scaleY, translateX, translateY]
      const fontSize = Math.abs(tx[3]) || Math.abs(tx[0]) || 12;
      const x = tx[4];
      const y = viewport.height - tx[5] - fontSize; // PDF coords are bottom-up
      items.push({
        str: item.str,
        x,
        y,
        width: item.width ?? (item.str.length * fontSize * 0.5),
        height: fontSize,
      });
    }
    // Merge adjacent items into words/phrases
    return mergeNativeTextItems(items);
  } catch {
    return [];
  }
}

/** Check if a PDF page has native text content. */
export async function pageHasNativeText(
  pageNumber: number,
  sourceId?: string,
): Promise<boolean> {
  const items = await getPageTextContent(pageNumber, sourceId);
  const totalText = items.map(i => i.str).join('').trim();
  return totalText.length > 10;
}
