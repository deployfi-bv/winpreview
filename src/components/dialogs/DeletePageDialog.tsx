import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent,   DialogDescription, DialogFooter,
DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import { useAppState } from '@/hooks/useAppState';

export function DeletePageDialog() {
  const {
    isDeletePageDialogOpen, closeDeletePageDialog,
    deleteCurrentPage, pageCount, currentPageIndex,
  } = useAppState();

  return (
    <Dialog open={isDeletePageDialogOpen} onOpenChange={(open) => { if (!open) closeDeletePageDialog(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Page</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete page {currentPageIndex + 1}?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={closeDeletePageDialog}>Cancel</Button>
          <Button variant="destructive" onClick={deleteCurrentPage} disabled={pageCount <= 1}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
