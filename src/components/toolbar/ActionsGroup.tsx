import { Crop,RotateCcw, RotateCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useAppState } from '@/hooks/useAppState';

export function ActionsGroup() {
  const { isDocumentOpen, currentPageIndex, rotatePage, setCropMode } = useAppState();

  return (
    <>
      <Button variant="ghost" size="icon-sm" onClick={() => rotatePage(currentPageIndex, 'left')} title="Rotate Left" disabled={!isDocumentOpen}>
        <RotateCcw />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={() => rotatePage(currentPageIndex, 'right')} title="Rotate Right" disabled={!isDocumentOpen}>
        <RotateCw />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={() => setCropMode(true)} title="Crop" disabled={!isDocumentOpen}>
        <Crop />
      </Button>
    </>
  );
}
