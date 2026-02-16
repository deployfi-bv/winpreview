import { ZOOM_DEFAULT, zoomIn, zoomOut } from '@/constants/zoom';

import type { ShortcutContext } from './types';

export function handleViewNavigationAction(action: string, ctx: ShortcutContext): boolean {
  switch (action) {
    // Zoom
    case 'zoom-in':
      ctx.setZoom(zoomIn(ctx.zoom));
      return true;
    case 'zoom-out':
      ctx.setZoom(zoomOut(ctx.zoom));
      return true;
    case 'zoom-reset':
      ctx.setZoom(ZOOM_DEFAULT);
      return true;
    case 'fit-width':
      ctx.fitWidth();
      return true;
    case 'fit-page':
      ctx.fitPage();
      return true;

    // Page navigation
    case 'page-prev':
      if (ctx.currentPageIndex > 0) ctx.setCurrentPageIndex(ctx.currentPageIndex - 1);
      return true;
    case 'page-next':
      if (ctx.currentPageIndex < ctx.pageCount - 1) ctx.setCurrentPageIndex(ctx.currentPageIndex + 1);
      return true;
    case 'page-first':
      ctx.setCurrentPageIndex(0);
      return true;
    case 'page-last':
      ctx.setCurrentPageIndex(ctx.pageCount - 1);
      return true;

    // Page operations
    case 'rotate-left':
      ctx.rotatePage(ctx.currentPageIndex, 'left');
      return true;
    case 'rotate-right':
      ctx.rotatePage(ctx.currentPageIndex, 'right');
      return true;
    case 'go-to-page':
      ctx.openGoToPageDialog();
      return true;

    // Search
    case 'find':
      ctx.toggleSearchBar();
      return true;
    case 'find-next':
      ctx.searchNext();
      return true;
    case 'find-previous':
      ctx.searchPrevious();
      return true;

    // Window / UI
    case 'minimize':
      window.blur();
      return true;
    case 'fullscreen':
      ctx.toggleFullscreen();
      return true;
    case 'contact-sheet':
      ctx.toggleViewMode();
      return true;

    // Escape — multi-level dismiss
    case 'escape':
      if (ctx.isFullscreen) {
        ctx.toggleFullscreen();
      } else if (ctx.isCropMode) {
        ctx.setCropMode(false);
      } else if (ctx.isSearchBarVisible) {
        ctx.closeSearchBar();
      } else if (ctx.selectedAnnotationId) {
        ctx.selectAnnotation(null);
      } else {
        ctx.setActiveTool('selection');
      }
      return true;

    default:
      return false;
  }
}
