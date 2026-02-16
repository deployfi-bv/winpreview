import { Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useAppState } from '@/hooks/useAppState';

export function CropToolbar() {
  const { cropRect, applyCrop, setCropMode } = useAppState();
  const hasCrop = cropRect && cropRect.width > 2 && cropRect.height > 2;

  return (
    <div className="flex h-9 items-center justify-center gap-2 border-b bg-background px-3">
      <span className="text-xs text-muted-foreground">
        {hasCrop ? 'Drag to adjust crop area' : 'Draw a crop area on the page'}
      </span>
      <Button size="sm" variant="ghost" onClick={() => setCropMode(false)} title="Cancel Crop">
        <X className="mr-1 size-3.5" /> Cancel
      </Button>
      <Button size="sm" onClick={applyCrop} disabled={!hasCrop} title="Apply Crop">
        <Check className="mr-1 size-3.5" /> Apply
      </Button>
    </div>
  );
}
