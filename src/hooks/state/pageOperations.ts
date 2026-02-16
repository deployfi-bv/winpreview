import { createPage } from '@/types/page';

import type { SetState } from '@/hooks/state/types';
import type { AppState } from '@/types/app';
import type { PageData } from '@/types/page';

export function createPageOperations(state: AppState, setState: SetState) {
  const rotatePage = (pageIndex: number, direction: 'left' | 'right') => {
    setState((prev) => {
      const pages = [...prev.pages];
      const page = pages[pageIndex];
      if (!page) return prev;
      const delta = direction === 'right' ? 90 : -90;
      const newRotation = ((page.rotation + delta + 360) % 360) as PageData['rotation'];
      pages[pageIndex] = { ...page, rotation: newRotation };
      return { ...prev, pages };
    });
  };

  const flipPage = (pageIndex: number, axis: 'horizontal' | 'vertical') => {
    setState((prev) => {
      const pages = [...prev.pages];
      const page = pages[pageIndex];
      if (!page) return prev;
      if (axis === 'horizontal') {
        pages[pageIndex] = { ...page, flipH: !page.flipH };
      } else {
        pages[pageIndex] = { ...page, flipV: !page.flipV };
      }
      return { ...prev, pages };
    });
  };

  const deletePage = (pageIndex: number) => {
    setState((prev) => {
      if (prev.pages.length <= 1) return prev;
      const pages = prev.pages.filter((_, i) => i !== pageIndex);
      const newIndex = Math.min(prev.currentPageIndex, pages.length - 1);
      return { ...prev, pages, currentPageIndex: newIndex, isDeletePageDialogOpen: false };
    });
  };

  const deleteCurrentPage = () => { deletePage(state.currentPageIndex); };

  const insertPageAfter = (pageIndex: number) => {
    setState((prev) => {
      const refPage = prev.pages[pageIndex];
      const newPage = createPage({
        originalIndex: prev.pages.length,
        sourceId: refPage?.sourceId ?? prev.documentSessionId ?? 'blank',
        sourceFormat: refPage?.sourceFormat ?? 'pdf',
      });
      const pages = [...prev.pages];
      pages.splice(pageIndex + 1, 0, newPage);
      return { ...prev, pages, currentPageIndex: pageIndex + 1 };
    });
  };

  const reorderPages = (fromIndex: number, toIndex: number) => {
    setState((prev) => {
      if (fromIndex === toIndex) return prev;
      const pages = [...prev.pages];
      const [moved] = pages.splice(fromIndex, 1);
      pages.splice(toIndex, 0, moved);
      let newCurrentIndex = prev.currentPageIndex;
      if (prev.currentPageIndex === fromIndex) {
        newCurrentIndex = toIndex;
      } else if (fromIndex < prev.currentPageIndex && toIndex >= prev.currentPageIndex) {
        newCurrentIndex--;
      } else if (fromIndex > prev.currentPageIndex && toIndex <= prev.currentPageIndex) {
        newCurrentIndex++;
      }
      return { ...prev, pages, currentPageIndex: newCurrentIndex };
    });
  };

  return { rotatePage, flipPage, deletePage, deleteCurrentPage, insertPageAfter, reorderPages };
}
