import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useAppState } from '@/hooks/useAppState';

export function NavigationGroup() {
  const { isDocumentOpen, currentPageIndex, pageCount, setCurrentPageIndex, openGoToPageDialog } = useAppState();

  const displayPage = currentPageIndex + 1;

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
        title="Previous Page"
        disabled={!isDocumentOpen || currentPageIndex === 0}
      >
        <ChevronLeft />
      </Button>

      <button
        className="min-w-[3rem] text-center text-sm text-muted-foreground hover:text-foreground transition-colors rounded px-1 py-0.5"
        onClick={openGoToPageDialog}
        disabled={!isDocumentOpen}
        title="Go to Page (Ctrl+G)"
      >
        {isDocumentOpen ? `${displayPage}/${pageCount}` : '—/—'}
      </button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setCurrentPageIndex(currentPageIndex + 1)}
        title="Next Page"
        disabled={!isDocumentOpen || currentPageIndex >= pageCount - 1}
      >
        <ChevronRight />
      </Button>
    </>
  );
}
