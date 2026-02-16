import { toast } from 'sonner';

import type { SetState } from '@/hooks/state/types';
import type { PageData } from '@/types/page';

export function createPageSelection(setState: SetState) {
  const setSelectedPageIndices = (indices: number[]) => {
    setState((prev) => {
      const valid = indices.filter((i) => i >= 0 && i < prev.pages.length);
      if (valid.length === 0) return prev;
      return { ...prev, selectedPageIndices: valid, currentPageIndex: valid[0] };
    });
  };

  const selectAllPages = () => {
    setState((prev) => ({
      ...prev, selectedPageIndices: prev.pages.map((_, i) => i),
    }));
  };

  const clearPageSelection = () => {
    setState((prev) => ({
      ...prev, selectedPageIndices: [prev.currentPageIndex],
    }));
  };

  const handlePageClick = (index: number, ctrlKey: boolean, shiftKey: boolean) => {
    setState((prev) => {
      if (shiftKey) {
        const anchor = prev.selectedPageIndices[0] ?? prev.currentPageIndex;
        const start = Math.min(anchor, index);
        const end = Math.max(anchor, index);
        const range: number[] = [];
        for (let i = start; i <= end; i++) range.push(i);
        return { ...prev, selectedPageIndices: range, currentPageIndex: index };
      }
      if (ctrlKey) {
        const set = new Set(prev.selectedPageIndices);
        if (set.has(index)) {
          set.delete(index);
          if (set.size === 0) set.add(index);
        } else {
          set.add(index);
        }
        const sorted = [...set].sort((a, b) => a - b);
        return { ...prev, selectedPageIndices: sorted, currentPageIndex: index };
      }
      return { ...prev, selectedPageIndices: [index], currentPageIndex: index };
    });
  };

  const deleteSelectedPages = () => {
    setState((prev) => {
      const toDelete = new Set(prev.selectedPageIndices);
      if (toDelete.size >= prev.pages.length) {
        toast.error('Cannot delete all pages');
        return prev;
      }
      const pages = prev.pages.filter((_, i) => !toDelete.has(i));
      const newIndex = Math.min(prev.currentPageIndex, pages.length - 1);
      return {
        ...prev, pages,
        currentPageIndex: Math.max(0, newIndex),
        selectedPageIndices: [Math.max(0, newIndex)],
      };
    });
  };

  const rotateSelectedPages = (direction: 'left' | 'right') => {
    setState((prev) => {
      const pages = [...prev.pages];
      const delta = direction === 'right' ? 90 : -90;
      for (const idx of prev.selectedPageIndices) {
        const page = pages[idx];
        if (!page) continue;
        const newRotation = ((page.rotation + delta + 360) % 360) as PageData['rotation'];
        pages[idx] = { ...page, rotation: newRotation };
      }
      return { ...prev, pages };
    });
  };

  return {
    setSelectedPageIndices, selectAllPages, clearPageSelection,
    handlePageClick, deleteSelectedPages, rotateSelectedPages,
  };
}
