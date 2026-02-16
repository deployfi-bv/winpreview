import {
  Dialog, DialogContent, DialogDescription,
DialogHeader, DialogTitle, } from '@/components/ui/dialog';

import { useAppState } from '@/hooks/useAppState';

export function AboutDialog() {
  const { isAboutDialogOpen, closeAboutDialog } = useAppState();

  return (
    <Dialog open={isAboutDialogOpen} onOpenChange={(open) => { if (!open) closeAboutDialog(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>About WinPreview</DialogTitle>
          <DialogDescription>
            Document and image viewer for Windows
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-medium">WinPreview v2.0</p>
            <p className="text-muted-foreground">
              A macOS Preview-inspired document viewer, annotation tool, and image editor
              built for Windows 11.
            </p>
          </div>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <p>Supports: PDF, JPEG, PNG, GIF, BMP, TIFF, WebP</p>
            <p>Built with React, TypeScript, Tailwind CSS, and shadcn/ui</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
