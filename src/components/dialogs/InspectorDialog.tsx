import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent,   DialogDescription, DialogFooter,
DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { DialogClose } from '@/components/ui/dialog';

import { useAppState } from '@/hooks/useAppState';

interface MetadataRow {
  label: string;
  value: string;
}

function MetadataGrid({ rows }: { rows: MetadataRow[] }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <span className="text-muted-foreground">{row.label}</span>
          <span className="text-foreground">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export function InspectorDialog() {
  const {
    isInspectorDialogOpen, closeInspectorDialog,
    filename, format, pageCount,
  } = useAppState();

  const rows: MetadataRow[] = [
    { label: 'Filename', value: filename ?? 'Unknown' },
    { label: 'Format', value: format?.toUpperCase() ?? 'Unknown' },
    { label: 'Pages', value: String(pageCount) },
    { label: 'Dimensions', value: '1920 × 1080 px' },
    { label: 'Color Space', value: 'RGB' },
    { label: 'File Size', value: '2.4 MB' },
    { label: 'Created', value: '2024-01-15 10:30' },
    { label: 'Modified', value: '2024-01-15 14:22' },
  ];

  return (
    <Dialog open={isInspectorDialogOpen} onOpenChange={(open) => { if (!open) closeInspectorDialog(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Inspector</DialogTitle>
          <DialogDescription>Document metadata and properties.</DialogDescription>
        </DialogHeader>

        <MetadataGrid rows={rows} />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
