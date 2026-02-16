import { FileDown } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useAppState } from '@/hooks/useAppState';

export function ExportGroup() {
  const { isDocumentOpen, openExportDialog } = useAppState();

  return (
    <Button variant="ghost" size="sm" onClick={openExportDialog} disabled={!isDocumentOpen}>
      <FileDown />
      <span>Export</span>
    </Button>
  );
}
