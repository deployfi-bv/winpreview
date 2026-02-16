import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useAppState } from '@/hooks/useAppState';

import type { PageData } from '@/types/page';

import { getImageUrl, renderImageToCanvas } from '@/services/imageService';
import { getDoc,renderThumbnail } from '@/services/pdfService';

const THUMB_MAX_W = 122;
const COLUMNS = 4;
const GAP = 16;
const BUTTON_PADDING = 16;
const ITEMS_PER_PAGE = 24;

interface ContactThumbProps {
  page: PageData;
  globalIndex: number;
  onClick: () => void;
}

function ContactThumb({ page, globalIndex, onClick }: ContactThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayNumber = globalIndex + 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (page.sourceFormat === 'pdf' && getDoc(page.sourceId)) {
      renderThumbnail(page.originalIndex + 1, canvas, THUMB_MAX_W, `contact-${page.id}`, page.sourceId);
    } else if (page.sourceFormat === 'image') {
      const imageUrl = getImageUrl(page.sourceId);
      if (imageUrl) {
        const scale = THUMB_MAX_W / page.width;
        renderImageToCanvas(imageUrl, canvas, page.width, page.height, scale);
      }
    }
  }, [page.id, page.originalIndex, page.sourceId, page.sourceFormat, page.width, page.height]);

  const ratio = page.height / page.width;
  const thumbW = THUMB_MAX_W;
  const thumbH = THUMB_MAX_W * ratio;

  // Build transforms
  const transforms: string[] = [];
  if (page.rotation !== 0) transforms.push(`rotate(${page.rotation}deg)`);
  if (page.flipH) transforms.push('scaleX(-1)');
  if (page.flipV) transforms.push('scaleY(-1)');

  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-1 rounded p-2 hover:bg-accent"
    >
      <div className="relative rounded-sm bg-white shadow" style={{ width: thumbW, height: thumbH }}>
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={transforms.length > 0 ? { transform: transforms.join(' ') } : undefined}
        />
        {/* Page number badge */}
        <span className="absolute left-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[10px] leading-none text-white">
          {displayNumber}
        </span>
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-foreground">
        {displayNumber}
      </span>
    </button>
  );
}

export function ContactSheetView() {
  const { pages, setCurrentPageIndex, setViewMode } = useAppState();
  const [rawSheetPage, setCurrentSheetPage] = useState(0);

  const totalSheetPages = Math.max(1, Math.ceil(pages.length / ITEMS_PER_PAGE));
  // Clamp to valid range without an effect (derived state)
  const currentSheetPage = Math.min(rawSheetPage, totalSheetPages - 1);
  const startIdx = currentSheetPage * ITEMS_PER_PAGE;
  const visiblePages = pages.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handlePageClick = (globalIndex: number) => {
    setCurrentPageIndex(globalIndex);
    setViewMode('single');
  };

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-6">
        <h3 className="mb-4 text-center text-sm font-medium text-muted-foreground">
          Contact Sheet — {pages.length} pages
        </h3>
        <div
          className="mx-auto flex flex-wrap justify-center"
          style={{ gap: `${GAP}px`, maxWidth: (THUMB_MAX_W + BUTTON_PADDING + GAP) * COLUMNS }}
        >
          {visiblePages.map((page, i) => (
            <ContactThumb
              key={page.id}
              page={page}
              globalIndex={startIdx + i}
              onClick={() => handlePageClick(startIdx + i)}
            />
          ))}
        </div>

        {/* Pagination controls */}
        {totalSheetPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={currentSheetPage === 0}
              onClick={() => setCurrentSheetPage((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentSheetPage + 1} of {totalSheetPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentSheetPage >= totalSheetPages - 1}
              onClick={() => setCurrentSheetPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
