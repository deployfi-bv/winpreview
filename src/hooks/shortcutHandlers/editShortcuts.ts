import type { ShortcutContext } from './types';

export function handleEditAction(action: string, ctx: ShortcutContext): boolean {
  switch (action) {
    case 'undo':
      ctx.undo();
      return true;
    case 'redo':
      ctx.redo();
      return true;
    case 'cut':
      ctx.cutAnnotation();
      return true;
    case 'copy':
      ctx.copyAnnotation();
      return true;
    case 'paste':
      ctx.pasteAnnotation();
      return true;
    case 'select-all':
      ctx.selectAllAnnotations();
      return true;
    case 'delete':
      if (ctx.selectedAnnotationId) {
        ctx.deleteSelectedAnnotations();
      } else if (ctx.isDocumentOpen && ctx.pages.length > 1) {
        ctx.deleteCurrentPage();
      }
      return true;
    case 'crop':
      if (ctx.isCropMode) {
        ctx.applyCrop();
      } else {
        ctx.setCropMode(true);
      }
      return true;
    default:
      return false;
  }
}
