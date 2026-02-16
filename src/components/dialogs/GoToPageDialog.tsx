import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent,   DialogDescription, DialogFooter,
DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useAppState } from '@/hooks/useAppState';

export function GoToPageDialog() {
  const {
    isGoToPageDialogOpen, closeGoToPageDialog,
    pageCount, setCurrentPageIndex,
  } = useAppState();
  const [value, setValue] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on open
    if (isGoToPageDialogOpen) setValue('');
  }, [isGoToPageDialogOpen]);

  const pageNumber = parseInt(value, 10);
  const isValid = !isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= pageCount;

  const handleSubmit = () => {
    if (isValid) {
      setCurrentPageIndex(pageNumber - 1);
      closeGoToPageDialog();
    }
  };

  return (
    <Dialog open={isGoToPageDialogOpen} onOpenChange={(open) => { if (!open) closeGoToPageDialog(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Go to Page</DialogTitle>
          <DialogDescription>
            Enter a page number between 1 and {pageCount}.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          className="flex items-center gap-3"
        >
          <Label htmlFor="page-number" className="shrink-0">Page</Label>
          <Input
            id="page-number"
            type="number"
            min={1}
            max={pageCount}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`1–${pageCount}`}
            autoFocus
          />
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={closeGoToPageDialog}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid}>Go</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
