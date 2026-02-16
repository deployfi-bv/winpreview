import { useEffect, useRef } from 'react';
import { CaseSensitive, ChevronDown, ChevronUp, ScanBarcode, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';

import { useAppState } from '@/hooks/useAppState';
import { useOcrSearch } from '@/hooks/useOcrSearch';

export function SearchBar() {
  const {
    searchQuery,
    searchMatchIndex,
    searchMatchTotal,
    isCaseSensitive,
    ocrProgress,
    closeSearchBar,
    setSearchQuery,
    toggleCaseSensitive,
    searchNext,
    searchPrevious,
  } = useAppState();

  const { pagesNeedingOcr, isScanning, scanPages } = useOcrSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeSearchBar();
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      searchPrevious();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      searchNext();
    }
  }

  const resultText = searchMatchTotal > 0
    ? `${searchMatchIndex + 1} of ${searchMatchTotal}`
    : searchQuery.length > 0 ? '0 results' : '';

  return (
    <div className="absolute top-3 right-3 z-10 flex items-center gap-0.5 rounded-lg border bg-card p-1 shadow-md">
      <Search className="ml-1.5 size-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Find..."
        className="h-7 w-48 border-none bg-transparent text-sm shadow-none focus-visible:ring-0 focus-visible:border-b focus-visible:border-ring"
      />
      {pagesNeedingOcr > 0 && !isScanning && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-amber-400">
            {pagesNeedingOcr} page{pagesNeedingOcr > 1 ? 's' : ''} need scanning
          </span>
          <Button variant="outline" size="sm" className="h-5 text-xs px-1.5 gap-1" onClick={scanPages}>
            <ScanBarcode className="size-3" />
            Scan
          </Button>
        </div>
      )}
      {isScanning && (
        <span className="text-xs text-muted-foreground">
          Scanning{ocrProgress ? ` ${ocrProgress.current}/${ocrProgress.total}` : '...'}
        </span>
      )}
      {!isScanning && !pagesNeedingOcr && resultText && (
        <span className="whitespace-nowrap rounded px-1.5 py-0.5 text-xs text-muted-foreground bg-muted">
          {resultText}
        </span>
      )}
      <div className="mx-0.5 h-5 w-px bg-muted-foreground/20" />
      <Button
        variant="ghost"
        size="icon-sm"
        title="Previous match (Shift+Enter)"
        onClick={searchPrevious}
        disabled={searchMatchTotal === 0}
      >
        <ChevronUp />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        title="Next match (Enter)"
        onClick={searchNext}
        disabled={searchMatchTotal === 0}
      >
        <ChevronDown />
      </Button>
      <div className="mx-0.5 h-5 w-px bg-muted-foreground/20" />
      <Toggle
        size="sm"
        pressed={isCaseSensitive}
        onPressedChange={toggleCaseSensitive}
        title="Match case"
        aria-label="Match case"
        className={isCaseSensitive ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground ring-1 ring-ring' : 'text-muted-foreground'}
      >
        <CaseSensitive className="size-4" />
      </Toggle>
      <Button
        variant="ghost"
        size="icon-sm"
        title="Close (Esc)"
        onClick={closeSearchBar}
      >
        <X />
      </Button>
    </div>
  );
}
