import { useEffect, useState } from 'react';

import { useAppState } from '@/hooks/useAppState';

import type { PageData } from '@/types/page';

import { getPageTextContent } from '@/services/pdfTextService';

interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextLayerProps {
  page: PageData;
  zoom: number;
  pageWidth: number;
  pageHeight: number;
}

export function TextLayer({ page, zoom, pageWidth, pageHeight }: TextLayerProps) {
  const { ocrResults, searchQuery, searchMatches, searchMatchIndex, isCaseSensitive } = useAppState();
  const result = ocrResults[page.id];
  const [nativeText, setNativeText] = useState<TextItem[] | null>(null);

  // Determine if this page contains the current match
  const currentMatch = searchMatches[searchMatchIndex];
  const isCurrentMatchPage = currentMatch?.pageId === page.id;

  // Load native PDF text content when no OCR result
  /* eslint-disable react-hooks/set-state-in-effect -- async text fetch on mount */
  useEffect(() => {
    if (result?.status === 'completed') {
      setNativeText(null);
      return;
    }
    if (page.sourceFormat !== 'pdf') {
      setNativeText(null);
      return;
    }
    let cancelled = false;
    getPageTextContent(page.originalIndex + 1, page.sourceId).then((items) => {
      if (!cancelled && items.length > 0) setNativeText(items);
    });
    return () => { cancelled = true; };
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [page.id, page.sourceFormat, page.sourceId, page.originalIndex, result?.status]);

  // Render OCR text boxes if available
  if (result?.status === 'completed' && result.textBoxes.length > 0) {
    return (
      <div
        className="absolute inset-0 select-text"
        style={{ width: pageWidth * zoom, height: pageHeight * zoom, pointerEvents: 'none' }}
      >
        {result.textBoxes.map((box, i) => {
          const isHighlighted = searchQuery && searchQuery.length > 0 &&
            (isCaseSensitive
              ? box.text.includes(searchQuery)
              : box.text.toLowerCase().includes(searchQuery.toLowerCase()));
          const isCurrentMatchHighlight = isHighlighted && isCurrentMatchPage && i === 0;

          return (
            <span
              key={i}
              className="absolute whitespace-pre"
              style={{
                left: box.bbox.x * zoom,
                top: box.bbox.y * zoom,
                width: box.bbox.width * zoom,
                height: box.bbox.height * zoom,
                fontSize: box.bbox.height * zoom * 0.75,
                lineHeight: 1,
                color: 'transparent',
                backgroundColor: isCurrentMatchHighlight
                  ? 'rgba(255, 165, 0, 0.4)'
                  : isHighlighted
                  ? 'rgba(255, 255, 0, 0.35)'
                  : undefined,
                pointerEvents: 'auto',
                userSelect: 'text',
                WebkitUserSelect: 'text',
              }}
            >
              {box.text}
            </span>
          );
        })}
      </div>
    );
  }

  // Render native PDF text if available
  if (nativeText && nativeText.length > 0) {
    return (
      <div
        className="absolute inset-0 select-text"
        style={{ width: pageWidth * zoom, height: pageHeight * zoom, pointerEvents: 'none' }}
      >
        {nativeText.map((item, i) => {
          const isHighlighted = searchQuery && searchQuery.length > 0 &&
            (isCaseSensitive
              ? item.str.includes(searchQuery)
              : item.str.toLowerCase().includes(searchQuery.toLowerCase()));
          const isCurrentMatchHighlight = isHighlighted && isCurrentMatchPage && i === 0;

          return (
            <span
              key={i}
              className="absolute whitespace-pre"
              style={{
                left: item.x * zoom,
                top: item.y * zoom,
                width: item.width * zoom,
                height: item.height * zoom,
                fontSize: item.height * zoom * 0.75,
                lineHeight: 1,
                color: 'transparent',
                backgroundColor: isCurrentMatchHighlight
                  ? 'rgba(255, 165, 0, 0.4)'
                  : isHighlighted
                  ? 'rgba(255, 255, 0, 0.35)'
                  : undefined,
                pointerEvents: 'auto',
                userSelect: 'text',
                WebkitUserSelect: 'text',
              }}
            >
              {item.str}
            </span>
          );
        })}
      </div>
    );
  }

  return null;
}
