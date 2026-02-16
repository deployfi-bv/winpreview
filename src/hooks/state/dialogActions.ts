import type { SetState } from '@/hooks/state/types';

export function createDialogActions(setState: SetState) {
  return {
    openGoToPageDialog: () => setState((p) => ({ ...p, isGoToPageDialogOpen: true })),
    closeGoToPageDialog: () => setState((p) => ({ ...p, isGoToPageDialogOpen: false })),
    openExportDialog: () => setState((p) => ({ ...p, isExportDialogOpen: true })),
    closeExportDialog: () => setState((p) => ({ ...p, isExportDialogOpen: false })),
    openResizeDialog: () => setState((p) => ({ ...p, isResizeDialogOpen: true })),
    closeResizeDialog: () => setState((p) => ({ ...p, isResizeDialogOpen: false })),
    openInspectorDialog: () => setState((p) => ({ ...p, isInspectorDialogOpen: true })),
    closeInspectorDialog: () => setState((p) => ({ ...p, isInspectorDialogOpen: false })),
    openSignaturePadDialog: () => setState((p) => ({ ...p, isSignaturePadOpen: true })),
    closeSignaturePadDialog: () => setState((p) => ({ ...p, isSignaturePadOpen: false })),
    openPasswordDialog: () => setState((p) => ({ ...p, isPasswordDialogOpen: true })),
    closePasswordDialog: () => setState((p) => ({ ...p, isPasswordDialogOpen: false })),
    openOcrDialog: () => setState((p) => ({ ...p, isOcrDialogOpen: true })),
    closeOcrDialog: () => setState((p) => ({ ...p, isOcrDialogOpen: false })),
    openDeletePageDialog: () => setState((p) => ({ ...p, isDeletePageDialogOpen: true })),
    closeDeletePageDialog: () => setState((p) => ({ ...p, isDeletePageDialogOpen: false })),
    openAboutDialog: () => setState((p) => ({ ...p, isAboutDialogOpen: true })),
    closeAboutDialog: () => setState((p) => ({ ...p, isAboutDialogOpen: false })),
  };
}
