import type { SetState } from '@/hooks/state/types';
import type { AppState, SearchMatch } from '@/types/app';

export function createSearchActions(setState: SetState) {
  const toggleSearchBar = () => {
    setState((prev) => ({ ...prev, isSearchBarVisible: !prev.isSearchBarVisible }));
  };

  const closeSearchBar = () => {
    setState((prev) => ({
      ...prev,
      isSearchBarVisible: false,
      searchQuery: '',
      searchMatchIndex: 0,
      searchMatchTotal: 0,
      searchMatches: [],
    }));
  };

  const toggleCaseSensitive = () => {
    setState((prev) => {
      const newCaseSensitive = !prev.isCaseSensitive;
      // Re-run search with new case sensitivity
      const matches = performSearch(prev.searchQuery, prev.pages, prev.ocrResults, prev.nativeText, newCaseSensitive);
      return {
        ...prev,
        isCaseSensitive: newCaseSensitive,
        searchMatches: matches,
        searchMatchTotal: matches.length,
        searchMatchIndex: matches.length > 0 ? 0 : 0,
      };
    });
  };

  const setSearchQuery = (query: string) => {
    setState((prev) => {
      const matches = performSearch(query, prev.pages, prev.ocrResults, prev.nativeText, prev.isCaseSensitive);
      return {
        ...prev,
        searchQuery: query,
        searchMatches: matches,
        searchMatchTotal: matches.length,
        searchMatchIndex: matches.length > 0 ? 0 : 0,
      };
    });
  };

  return {
    toggleSearchBar,
    closeSearchBar,
    setSearchQuery,
    toggleCaseSensitive,
  };
}

/**
 * Perform text search across all pages using OCR results and native PDF text.
 * Returns array of match locations.
 */
function performSearch(
  query: string,
  pages: AppState['pages'],
  ocrResults: AppState['ocrResults'],
  nativeText: Record<string, string>,
  isCaseSensitive: boolean,
): SearchMatch[] {
  if (!query.trim()) return [];

  const needle = isCaseSensitive ? query : query.toLowerCase();
  const matches: SearchMatch[] = [];

  for (const page of pages) {
    const ocrResult = ocrResults[page.id];
    let haystack: string | null = null;

    if (ocrResult?.status === 'completed') {
      haystack = ocrResult.plainText;
    } else if (nativeText[page.id]) {
      haystack = nativeText[page.id];
    }

    if (!haystack) continue;

    const searchIn = isCaseSensitive ? haystack : haystack.toLowerCase();
    let pos = 0;
    while (true) {
      pos = searchIn.indexOf(needle, pos);
      if (pos === -1) break;
      matches.push({
        pageId: page.id,
        boxIndex: 0,
        charOffset: pos,
        length: needle.length,
      });
      pos += needle.length;
    }
  }

  return matches;
}
