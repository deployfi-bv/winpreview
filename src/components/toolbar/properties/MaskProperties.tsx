import { Scan } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useAppState } from '@/hooks/useAppState';

export function MaskProperties() {
  const { maskRect, clearMask } = useAppState();

  return (
    <>
      <Scan className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">
        {maskRect ? 'Mask active — drag to adjust' : 'Drag on canvas to create mask'}
      </span>
      {maskRect && (
        <Button variant="outline" size="sm" onClick={clearMask}>
          Clear Mask
        </Button>
      )}
    </>
  );
}
